/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

window.SC = {};
SC.projectNo =0;
SC.clustersCollection =[];

var world_topo;


d3.json("data/topo/world-topo.json", function (error, world) {
    world_topo = topojson.feature(world, world.objects.countries).features;

    draw_worldmap(this.world_topo);
});


var offsetL,offsetT ;

d3.select(window).on("resize", throttle);

var map_width , map_height;

var projection, path, svg, g, graticule;
var tooltip;

var zoom = d3.behavior.zoom().scaleExtent([1, 100]).on("zoom", move);


function setup() {

    offsetL = document.getElementById("map_container").offsetLeft + 10;
    offsetT = document.getElementById("map_container").offsetTop + 10;

    tooltip = d3.select("#map_container").append("div").attr("class", "tooltip")
        .attr("style","visibility: hidden");//

   // tooltip_points = d3.select("#map_container").append("div").attr("class", "tooltip")
     //   .attr("style","visibility: hidden");//

    map_width = document.getElementById("map_container").offsetWidth;
    map_height = window.innerHeight;

    graticule = d3.geo.graticule();
    
    projection = d3.geo.mercator()
        .translate([(map_width / 2), (map_height / 2)])
        //.center()
        //.rotate( [71.057,0] )
        .center( [0, 42.313] )
        .scale(map_width /2/ Math.PI);

    path = d3.geo.path().projection(projection);
    

    svg = d3.select("#map_container").append("svg")
        .attr("width",map_width )
        .attr("height",map_height)
        .call(zoom)
        .on("click", click)
        .append("g");

    g = svg.append("g").attr("id","country_holder");
}

function draw_worldmap() {

    removeAllChild();
    setup();

    svg.append("path").datum(graticule).attr("class", "graticule").attr("d", path);

    svg.append("path").datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
        .attr("class", "equator")
        .attr("d", path);

    var country = g.selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        .attr("id", function (d, i) {
            return d.id;
        })
        .attr("title", function (d, i) {
            return d.properties.name;
        }).attr("fill",
        function () {
            return "#DEEBF7";
        });



    
    country.on("mouseover", function(){ return tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
           
            return tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(d.properties.name);
            


    }).on("mouseout", function (d, i) {
        return tooltip.attr("style", "visibility: hidden");
    });


    
    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {

         var tier1 = generate_DistMatrix(projects);
        var tier_status = tier1[0];  //index 0-54 indicates 55 projects
        var clusterNumber = tier1[1];  //index zero with nothing
        var clusters = tier1[2];    //index zero shows the number of projects not belonging to any cluster
        var average_longtitude = [0];  // index 1 to number of clusters
        var average_latitude  =[0];
        var clusterCount = clusterNumber.length-1;
        var clusterIndex;

        //initialize the arrays
        for(var i=0;i< clusterCount;i++){
            average_latitude.push(0);
            average_longtitude.push(0);
        }

        var lat, long;
        var project_index;// start from 1 to 55
        var project_countries = [''];// start from index 1 , indicates project 1

        var lat_list=[0];//start from index 1
        var long_list = [0];
        projects.forEach(function (i) {
            project_index = i.No;
            lat = Number(i.Latitude);
            long = Number(i.Longitude);
            var title = "<b>"+i.FCL_Project+"  "+i.Case_study+"</b>";
            var text = "<br><p>"+i.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ lat +"° N, "+ long+"°E <br>"
                        +i.Description+"</p>";
            clusterIndex = tier_status[project_index-1];
            average_latitude[clusterIndex] =average_latitude[clusterIndex] + lat;
            average_longtitude[clusterIndex] = average_longtitude[clusterIndex] + long;
            lat_list.push(lat);
            long_list.push(long);
            addpoint((tier_status[project_index-1]-1),i.Longitude,i.Latitude,title, title+text,undefined,project_index);
            project_countries.push('');
            project_countries[project_index] = i.Country;
        });



        //draw circles
        var title;
        var text;
        var number;
        var color=9;

        var clusterObj = {};
        var cluster_countries = [[]];// start from index 1
        var found ;
        var the_country;
        var cluster_length;
        var country_tiers = [];
        var countryObj = {};
        var country_index ;
        var country_no;

        //list the 2D arrays -- countries in each tier 1 cluster
        for(i=1; i< clusters.length;i++){
            cluster_countries.push([]);
            cluster_length = clusters[i].length;
            country_no =0;
            for(var j=0;j<cluster_length;j++){
                country_index = clusters[i][j];
                the_country = project_countries[country_index];

                //check if the country name exist alr in cluster_countries[i]
                found = cluster_countries[i].filter(function(d){
                    return d ==the_country;
                });

                if(found == undefined || found.length ==0) {
                    country_no++;
                    cluster_countries[i].push(the_country);
                    countryObj[the_country] = {};
                    countryObj[the_country]['Name'] = the_country;
                    countryObj[the_country]['ProjectsIncluded']=country_index;
                    countryObj[the_country]['ProjectNumber'] = 1;
                    countryObj[the_country]['total_Lat'] = lat_list[country_index];
                    countryObj[the_country]['total_Long'] = long_list[country_index];
                    //TierNo,Name,ClusterNo,ProjectNo,Longtitude,Latitude,Projects_Included,Title,Text,CountriesIncluded
                }
                else{
                    countryObj[the_country]['ProjectsIncluded']+=' '+country_index;
                    countryObj[the_country]['ProjectNumber']++;
                    countryObj[the_country]['total_Lat'] +=lat_list[country_index];
                    countryObj[the_country]['total_Long'] +=long_list[country_index];

                }

                found = undefined;
            }
            countryObj['country_no'] = country_no;
            country_tiers.push(countryObj);
            countryObj = {};
        }

        /*using (1) project_Cluster_info(1).csv ---providing tier1 clusters, can be deemed as continent lvl
                        ,organized tgr if distance less than tier1_range = 100
        *       (2) country_tiers array --providing country-lvl cluster
        * purpose: to generate a 3-tier classfication json file to store parent-children relationship for zoomable circles*/

         // to store the whole array, each object of it is a cluster {"name":"", "children":[]} or real project{"name":"", "size":1 }*/
      
      /* SC.clustersCollection = [];
        
        var tier1_cluster = {};  //root of each zoomable circle  
        //TierNo,Name,ClusterNo,ProjectCount,Longtitude,Latitude,Projects_Included,Title,Text,children --may tier2 or project

        var tier2_cluster ={};
        //TierNo,Name,ClusterNo,ProjectCount,Longtitude,Latitude,Projects_Included,Title,Text,children - with projects

        var project_object = {}; //real-project,
        //TierNo,ProjectIndex,FCL_Project,Case Study,Longtitude,Latitude,Title,Text,Country,City

        d3.csv("data/complementary/project_Cluster_Info (1).csv", function (err, tier1s) {

            //add in the points not in any clusters, clusters[0]
            for (j = 0; j < clusters[0].length; j++) {
                // TierNo,ProjectIndex,FCL_Project,Case Study,Longtitude,Latitude,Title,Text,Country,City
                project_object["tierNo"] = 3;
                project_object["project_Index"] = clusters[0][j]; // add in projects accordingly, 1-55
                project_object["size"] = 1;

                var projectInfo = projects.filter(function (d) {
                    return Number(d.No) == Number(clusters[0][j]);
                });

                if (projectInfo.length > 0) {
                    //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                    project_object["fcl_project"] = projectInfo[0].FCL_Project;
                    project_object["case_study"] = projectInfo[0].Case_study;
                    project_object["latitude"] = projectInfo[0].Latitude;
                    project_object["longtitude"] = projectInfo[0].Longitude;
                    project_object["name"] = projectInfo[0].Title;
                    project_object["text"] = projectInfo[0].Description;
                    project_object["country"] = projectInfo[0].Country;
                    project_object["city"] = projectInfo[0].City;

                }
                SC.clustersCollection.push(project_object);
                projectInfo = [];
                project_object = {};
            }




        //add in projects in any clusters
            var clusterIndex = clusterCount; //9
            var tier1_cluster_length ;
            var tier1_children;
            var tier1_children_proNo;
            var tier1_children_name;

            tier1s.forEach(function (t1_cluster) {


                var t1_clusterNo = t1_cluster.ClusterNo;
                var t1_clusterName = t1_cluster.Name;
                var projectsIncluded;

                if(t1_clusterName == undefined) return;

                tier1_cluster_length = country_tiers[t1_clusterNo-1]["country_no"];


                if (tier1_cluster_length==1) {  // if only 1 country included, add in tier2 cluster as children to root
                    clusterIndex++;

                    var tier2_name = Object.keys(country_tiers[t1_clusterNo - 1])[0]
                    var tier2  = country_tiers[t1_clusterNo - 1][tier2_name];
                    var tier2_proNo  =  tier2 ["ProjectNumber"];
                    projectsIncluded =  tier2 ["ProjectsIncluded"].split(" ");


                    tier2_cluster["tierNo"] = 2;
                    tier2_cluster["name"] = tier2_name;
                    tier2_cluster["clusterNo"] = clusterIndex;
                    tier2_cluster["projectCount"] = tier2_proNo ;
                    tier2_cluster["aver_longtitude"] =  tier2 ["total_Long"] / tier2_proNo ;
                    tier2_cluster["aver_latitude"] =  tier2 ["total_Lat"] / tier2_proNo ;
                    tier2_cluster["projects_Included"] = projectsIncluded;
                    tier2_cluster["title"] = tier2_name;
                    tier2_cluster["text"] = tier2_name + "<br>ProjectNo = " + tier2_proNo ;
                    tier2_cluster["children"] = [];

                    for (j = 0; j < tier2_proNo ; j++) {
                        // TierNo,ProjectIndex,FCL_Project,Case Study,Longtitude,Latitude,Title,Text,Country,City
                        project_object["tierNo"] = 3;
                        project_object["project_Index"] = projectsIncluded[j]; // add in ptojects accordingly, 1-55
                        project_object["size"] = 1;

                        projectInfo = projects.filter(function (d) {
                            return Number(d.No) == Number(projectsIncluded[j]);
                        });

                        if (projectInfo.length > 0) {
                            //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                            project_object["fcl_project"] = projectInfo[0].FCL_Project
                            project_object["case_study"] = projectInfo[0].Case_study;
                            project_object["latitude"] = projectInfo[0].Latitude;
                            project_object["longtitude"] = projectInfo[0].Longitude;
                            project_object["name"] = projectInfo[0].Title;
                            project_object["text"] = projectInfo[0].Description;
                            project_object["country"] = projectInfo[0].Country;
                            project_object["city"] = projectInfo[0].City;
                        }

                        tier2_cluster["children"].push(project_object);
                        project_object = {};
                    }
                    projectInfo = [];
                    SC.clustersCollection.push(tier2_cluster);
                    tier2_cluster = {};
                }else {


                    tier1_cluster["tierNo"] = 1;
                    tier1_cluster["name"] = t1_clusterName;
                    tier1_cluster["clusterNo"] = t1_cluster.ClusterNo;
                    tier1_cluster["projectCount"] = t1_cluster.ProjectNo;
                    tier1_cluster["aver_longitude"] = t1_cluster.Longtitude;
                    tier1_cluster["aver_latitude"] = t1_cluster.Latitude;
                    tier1_cluster["projects_Included"] = t1_cluster.Projects_Included;
                    tier1_cluster["title"] = t1_cluster.Title;
                    tier1_cluster["text"] = t1_cluster.Text;
                    tier1_cluster["children"] = [];


                    for (var i = 0; i < tier1_cluster_length; i++) {
                        clusterIndex++;

                        tier1_children_name = Object.keys(country_tiers[t1_clusterNo - 1])[i];
                        tier1_children = country_tiers[t1_clusterNo - 1][tier1_children_name];

                        tier1_children_proNo = tier1_children["ProjectNumber"];

                        if(tier1_children_proNo>1){
                             projectsIncluded= tier1_children["ProjectsIncluded"].split(" ");

                            tier2_cluster["tierNo"] = 2;
                            tier2_cluster["name"] = tier1_children_name;
                            tier2_cluster["clusterNo"] = clusterIndex;
                            tier2_cluster["projectCount"] = tier1_children_proNo;
                            tier2_cluster["aver_longtitude"] = tier1_children["total_Long"] / tier1_children_proNo;
                            tier2_cluster["aver_latitude"] = tier1_children["total_Lat"] / tier1_children_proNo;
                            tier2_cluster["projects_Included"] = projectsIncluded;
                            tier2_cluster["title"] = tier1_children_name;
                            tier2_cluster["text"] = tier1_children_name + "<br>ProjectNo = " + tier1_children_proNo;
                            tier2_cluster["children"] = [];

                            // add concrete projects as children to tier2 clusters
                            for (j = 0; j < tier1_children_proNo; j++) {
                                // TierNo,ProjectIndex,FCL_Project,Case Study,Longtitude,Latitude,Title,Text,Country,City
                                project_object["tierNo"] = 3;
                                project_object["project_Index"] = projectsIncluded[j]; // add in ptojects accordingly, 1-55
                                project_object["size"] = 1;

                                projectInfo = projects.filter(function (d) {
                                    return Number(d.No) == Number(projectsIncluded[j]);
                                });

                                if (projectInfo.length > 0) {
                                    //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                                    project_object["fcl_project"] = projectInfo[0].FCL_Project
                                    project_object["case_study"] = projectInfo[0].Case_study;
                                    project_object["latitude"] = projectInfo[0].Latitude;
                                    project_object["longtitude"] = projectInfo[0].Longitude;
                                    project_object["title"] = projectInfo[0].Title;
                                    project_object["text"] = projectInfo[0].Description;
                                    project_object["country"] = projectInfo[0].Country;
                                    project_object["city"] = projectInfo[0].City;
                                }

                                tier2_cluster["children"].push(project_object);
                                project_object = {};
                            }

                            tier1_cluster["children"].push(tier2_cluster);
                            tier2_cluster = {};
                        } else {

                            projectsIncluded = tier1_children["ProjectsIncluded"];
                            project_object["tierNo"] = 3;
                            project_object["project_Index"] = projectsIncluded; // add in ptojects accordingly, 1-55
                            project_object["size"] = 1;

                            projectInfo = projects.filter(function (d) {
                                return Number(d.No) == Number(projectsIncluded);
                            });

                            if (projectInfo.length > 0) {
                                //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                                project_object["fcl_project"] = projectInfo[0].FCL_Project;
                                project_object["case_study"] = projectInfo[0].Case_study;
                                project_object["longtitude"] = projectInfo[0].Latitude;
                                project_object["latitude"] = projectInfo[0].Longitude;
                                project_object["title"] = projectInfo[0].Title;
                                project_object["text"] = projectInfo[0].Description;
                                project_object["country"] = projectInfo[0].Country;
                                project_object["city"] = projectInfo[0].City;
                            }

                            tier1_cluster["children"].push(project_object);
                            project_object = {};
                        }
                    }
                    SC.clustersCollection.push(tier1_cluster);
                    tier1_cluster = {};
                }
            });
            console.log(JSON.stringify(SC.clustersCollection));
        });*/

// JSON.parse converts json_string to an object
        //var obj = JSON.parse(SC.clustersCollection);
// JSON.stringify converts the object to a string again


            //var data = "{name: 'Bob', occupation: 'Plumber'}";
       /* var url = 'data:text/json;charset=utf8,' + encodeURIComponent(obj);
        window.open(url, '_blank');
        window.focus();*/

        //add the external circles
        for(i=1;i< clusterCount+1;i++) {

            number = clusterNumber[i];
            average_longtitude[i] = average_longtitude[i] / number;
            average_latitude[i] = average_latitude[i] / number;
            title = "<b>Cluster " + i + "</b>";
            text = title + "<br><br>Radius = " + (5 * number) +
                "<br>Project Number:  " + clusterNumber[i];
            addpoint(color, average_longtitude[i], average_latitude[i], title, text, number);
        }
    });


    d3.select("#pop_densityBtn").classed("selectedBtn",true);
    category = "Population Density";
    setup_circles();
    newInput();
    
    
}




function move(t,s) {
    if(t ==undefined || s== undefined){
        var t = d3.event.translate;
        var s = d3.event.scale;
        //zscale = s;
    }

    var h = map_height / 4;

    t[0] = Math.min(
        (map_width / map_height) * (s - 1),
        Math.max(map_width * (1 - s), t[0])
    );
    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(map_height * (1 - s) - h * s, t[1])
    );
    //t[0] = 100; x-axis
   // t[1] =-1;  y-axis
    //console.log("t[0] = "+t[0]+"   t[1] = "+t[1]+"  s="+s);

    zoom.translate(t);
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");

    //adjust the country hover stroke map_width based on zoom level
    d3.selectAll(".country").style("stroke-map_width", 1.5 / s);
    d3.selectAll(".text").style("font-size", 20 / s);
    //d3.selectAll(".point").attr("r", 4/ s);


}

var throttleTimer;

function throttle() {
    window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function () {
        draw_worldmap(this.world_topo);
    }, 200);
}

function click() {
    projection.invert(d3.mouse(this));
}

//function to add points and text to the map (used in plotting capitals)
function addpoint(color_status, lat, lon, title,text, radius, No) {

    if(radius == undefined) radius = 1;
    if(No == undefined) No = 0;


    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
                        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    if(parseInt(lat) == 51) console.log("x ="+x);
    //console.log("x:"+x+"   y:"+y);
    gpoint.append("svg:circle")
        .attr("cx",function(){
            if(x==undefined) console.log("radius = "+radius+" No="+No); //radius+No
            return x;
        } )
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", 5*radius)
        .attr("z-index",function () {
            var index =parseInt(radius*0.8 +10);// 20-(radius*0.8) +10;
            title = title +" z-index = " +index;
             return index;
        })
        .on("mouseover", function () {return tooltip.attr("style","visibility: visible");})
        .on("mousemove", function() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;
                return tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(title);


        }).on("mouseout", function () {
            return tooltip.attr("style","visibility: hidden");
        }).on("click",function () {

        tooltip.html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
            "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+text+"</div></div>");

        d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

        //add in picture for the project
        var project_img = new Image();
        project_img.src = "img/project_img/"+No+"_fcl_vis.jpg";
        //console.log("project_img.src = "+project_img.src);
        d3.select("#tooltip_pic").attr("src",project_img.src);


        var mouse = d3.mouse(svg.node()).map(function (d) {

            return parseInt(d);
        });

        var left = tooltip.node().getBoundingClientRect().left;
        var top = tooltip.node().getBoundingClientRect().top;
        var tooltip_width = tooltip.node().getBoundingClientRect().width;

        var pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
        var pic_width = pic_height/1.25;

        d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');

        tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

        var text_height = pic_height;
        var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
        var text_area =  text_height* text_width;

        //console.log("-----------");
        //console.log("text_area = "+text_area);


        var right = tooltip.node().getBoundingClientRect().right;
        var bottom = tooltip.node().getBoundingClientRect().bottom;
        var window_margin = 9; //actually 8, but to detect close to edge change to 8
        //var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;

        var overflowR, overflowB;
        overflowR = right- (window.innerWidth -window_margin);
        overflowB = bottom -  (window.innerHeight - window_margin);
        var looptime = 0;
        var new_text_width = text_width;
        var new_text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;

       // console.log("text_width = "+text_width+"text_height="+new_text_height);
        //console.log(" overflowB = "+overflowB);
        //console.log("overflowR  = "+overflowR);

        /*if(new_text_width>325 &&(overflowB > 0 || overflowR>0)){
            d3.select("#tooltip_text").style("width",300+'px');
            text_width = 300;
            pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            pic_width = pic_height/1.25;
            console.log("large width, set to 300");

            d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');
        }*/

        while (overflowB > 0 ^ overflowR>0 ) {

            //console.log("looptime: "+looptime);


            if(looptime>0){
                pic_height = new_text_height;
                pic_width = pic_height/1.25;

                d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');
            }

            if (overflowR > 0) {

                if (looptime ==0){
                    left = left - (pic_width+ text_width+25);
                    //console.log("overflowR: change is  -( pic_width+text_width) = -"+(pic_width+text_width));
                }
                else{
                    left = left - overflowR;
                    //console.log("overflowR: chnge is -(new_text_width= "+new_text_width+" - text_width = "+text_width+")");
                }
                text_width = new_text_width;
                text_height = new_text_height;
                //console.log("computed - left = "+left);
            }
            if (overflowB > 0) {
                if (looptime == 0){
                    top = top - (pic_height + offsetT+20);
                    left = (mouse[0]- tooltip.node().getBoundingClientRect().width/2);
                //console.log("overflowB: change is  - (pic_height + offsetT) = -" + (pic_height + offsetT));
                }
                else{
                    top = top - overflowB;
                    //console.log("overflowB: change is  -(new_text_height ="+new_text_height+"  -pic_height ="+pic_height+")");
                }
                //console.log("top= "+overflowB);
            }
            tooltip_width = text_width+pic_width+25;
            tooltip.attr("style", "left:" +left + "px;top:" + top + "px;visibility: visible;width:" +tooltip_width+  'px');

            //console.log("computed_width = "+(text_width+pic_width+25)+"  read_width = "+tooltip.node().getBoundingClientRect().width);


            overflowR = tooltip.node().getBoundingClientRect().right- (window.innerWidth -window_margin);
            overflowB = tooltip.node().getBoundingClientRect().bottom -(window.innerHeight - window_margin);
            new_text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
            new_text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            text_area = new_text_height*new_text_width;

            //console.log("new_text_area ="+ text_area+ "   text_height ="+new_text_height+"   text_width = "+new_text_width);
            looptime++;
            //console.log(looptime);
            //console.log("overflow!  overflowB = "+overflowB+"  overflowR = "+overflowR);
            //console.log("end_loop!!!!!!!!!!!!");

            if(looptime>4) break;
        }

        //tooltip.attr("style", "left:" +left + "px;top:" + top + "px;visibility: visible;width:" +tooltip_width+  'px');

        /*if(text_width==325){
            left = left - (new_text_width-text_width);
            top = top - (new_text_height-text_height);
            tooltip.attr("style", "left:" +left + "px;top:" + top + "px;visibility: visible;");
        }*/

        /*
         tooltip.attr("style","width:"+ max_tooltipHolder_Width
         +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");
         }*/


        });
    
}


/*calculate distance between any two project locations*/
function generate_DistMatrix(projects){
    SC.projectNo =0;

    var positionA = [];
    var positionB = [];
    var matrix = [];
    var distance;
    var distance_Multiplier = 1000; // km to m??

    projects.forEach(function (pointA) {
        positionA = [];
        positionA.push(pointA.Longitude, pointA.Latitude);
        matrix.push([]);
        SC.projectNo++;

        projects.forEach(function(pointB){
            positionB = [];
            positionB.push(pointB.Longitude, pointB.Latitude);

            distance = d3.geo.distance(positionA, positionB)* distance_Multiplier;
            matrix[pointA.No-1].push(distance);
        })
    });

    var tier1_range = 100;

    return find_tier1( matrix,tier1_range);

}

/*find tier1- distance <= 200;
        tier2- distance < */
// 55 projects, index 0-54
function find_tier1(matrix, tier_range){

    var tier_status=[];// 1 indicates the corresponding project is included in tier1 already
    var check_status = []; //1 indicates checked alr for neighbours
    var stack = [];
    var neighbours = [];
    var value;


    //to create a neighbour matrix holding neighbours to each project
    for(var index =0;index<SC.projectNo;index++){

        neighbours.push([]);
        for(var i=0; i<SC.projectNo;i++){
            value = matrix[index][i];
            if(value<=tier_range && index !=i){ //index != i  to avoid same project distance
                neighbours[index].push(i);
            }
        }
    }

    //to classify projects into cluster
    for (var j=0;j<SC.projectNo;j++){
        tier_status.push(0);
        check_status.push(0);

    }


   var first_ofstack;
    var stack_length = 0;
    var neighbour_length;
    var neighbour_No;
    var looptime = 0;
    var clusterIndex = 1;
    var clusterNumber = [];

    clusterNumber.push(0,0);
    for(index = 0;index<SC.projectNo;index++){
        if(check_status[index]==0){
            if(looptime>1) {clusterIndex++; clusterNumber.push(0);}
            looptime =0;
            stack.push(index);
            stack_length++;

            while(stack_length > 0){
                looptime++;
                first_ofstack = stack.shift();
                stack_length--;

                if(check_status[first_ofstack] ==0){
                    check_status[first_ofstack] = 1;
                    neighbour_length =neighbours[first_ofstack].length;

                    if( neighbour_length> 0){
                        if(tier_status[first_ofstack]==0) {
                            tier_status[first_ofstack] = clusterIndex;
                            clusterNumber[clusterIndex]++;
                        }

                        for(i=0;i<neighbour_length;i++){
                         neighbour_No = neighbours[first_ofstack][i];
                         stack.push(neighbour_No);
                         stack_length++;
                            if(tier_status[first_ofstack]==0) {
                                tier_status[neighbour_No] = clusterIndex;
                                clusterNumber[clusterIndex]++;}
                         }

                    }
                }

            }

        }

    }
    clusterNumber.pop();

    var clusters = [];

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);
    }

    //sort projects in tier1_status according to cluster number, clusters[0] collects all projects with no cluster
    for(i=0;i< SC.projectNo;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual project numbers, from 1 to 55
    }

    var output = [];
    output.push(tier_status, clusterNumber,clusters);
    
    return output;

}

/*classify tier2 based on tier1 results */
function find_tier2(){
    
}

function draw_zoomable_circles(projects){
    var tier1_status = tier[0];
    var clusterNumber = tier[1]; //clusterNumber[0] stands for nothing

    console.log(clusters);

}

function formatNum(num) {
    var format = d3.format(',.02f');

    var label = format(num / 1000000) + "M";

    return label;
}

function removeAllChild(){

    d3.selectAll(".extra_info").remove();

    var map_container = document.getElementById("map_container");
    while (map_container.firstChild) {
        map_container .removeChild(map_container.firstChild);
    }
    
}
