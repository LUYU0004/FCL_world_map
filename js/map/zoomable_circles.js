/**
 * Created by yuhao on 27/5/16.
 */

//var average_longtitude;  // index 1 to number of clusters
//var average_latitude;
function draw_points(){

    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];
    var projects = svg.append("g").attr("class","projects extra_info");
    var radius_unit = 4;

    //draw the custers
    d3.csv("data/complementary/project_Cluster_Info (1).csv", function (err, clusters) {

        if (err) console.log(err);
        else {
            clusters = clusters.slice(0,8);
            var coordinates=[];
            var project_clusters = projects.append("g").attr("class","project_clusters");

            project_clusters.selectAll("circle").data(clusters).enter()
                .append("circle")
                .attr("class","project_cluster")
                .attr("cx", function(d){
                    return projection([d.Longitude,d.Latitude])[0];
                }).attr("cy",function (d) {
                return projection([d.Longitude,d.Latitude])[1];
            }).style("fill", function () {
                return color_scheme[4];
            }).style("opacity",0.2)
                .attr("z-index",function(d){
                    return 0.8*d.ProjectNo +10;
                })
                .attr("r", function (d) {
                    var radius = Number(d.ProjectNo)*radius_unit;
                    if(radius >20) radius = 0.8*radius;
                    return radius;
                })
                .on("mouseover", function () {
                    var _t = d3.select(this);
                    _t.style("border-radius","5px")
                        .style("border","1px solid #FFFF00");
                    return tooltip.attr("style","visibility: visible");})
                .on("mousemove", function(d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                        .html("<div id='tooltip_holder' style='vertical-align: middle'>" +
                            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+d.Text+"</div></div>");

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

                }).on("mouseout", function () {
                    return tooltip.attr("style","visibility: hidden");
                }).on("click",function (d) {

                        var cur_lvl = zoom.scale();

                        var scale = 3;
                        var y_factor = 1.3;
                       if(d.Latitude<0) { y_factor = 1;}
                        var x_multiplier = (projection([d.Longitude, d.Latitude])[0]/innerWidth)*(-1.19*scale);
                        var y_multiplier = (projection([d.Longitude, d.Latitude])[1]/innerHeight)*(-y_factor*scale);

                        var pos =[(projection([d.Longitude, d.Latitude])[0]*x_multiplier),(projection([d.Longitude, d.Latitude])[1]*y_multiplier)];
                        move(pos , scale);
                        //var _t = d3.select(this);
                        //_t.style("visibility","hidden");
                        //this.attr("style","visibility:hidden");
                });

        }
    });

////to draw the projects dots
    d3.csv("data/fcl/1. Projects.csv", function (err, points) {

        if (err) console.log(err);
        else {
            points = points.slice(0,55);

            var project_points = projects.append("g").attr("class","project_points");

            project_points.selectAll("circle").data(points).enter()
                .append("circle")
                .attr("class","point")
                .attr("cx", function(d){
                    return projection([d.Longitude,d.Latitude])[0];
                }).attr("cy",function (d) {
                return projection([d.Longitude,d.Latitude])[1];
            }).style("fill", function () {
                return color_scheme[6];
            }).style("opacity",1)
                .attr("r", radius_unit*1)
                .on("mouseover", function () {return tooltip.attr("style","visibility: visible");})
                .on("mousemove", function(d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    var text = "<br><p>"+d.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ d.Latitude +"° N, "+ d.Longitude+"°E <br>"
                        +d.Description+"</p>";

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                        .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                            "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+text+"</div></div>");

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

                }).on("mouseout", function () {
                return tooltip.attr("style","visibility: hidden");
            }).on("click",null);

        }
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

    return matrix;

}


//function to add points and text to the map (used in plotting capitals)
function addpoint(color_status, lat, lon, title,text, radius, No) {

    var radius_unit = 4;
    if(radius == undefined) radius = 1;
    if(No == undefined) No = 0;
    if(color_status==undefined) color_status = 2;


    var gpoint = g.append("g").attr("class","gpoint extra_info");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];
    
    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", radius_unit*radius)
        .attr("z-index",function () {
            var index =parseInt(radius*0.8 +10);// 20-(radius*0.8) +10;
            title = title +" z-index = " +index;
            return index;
        })
        .on("mouseover", function () {
            console.log(this);
            return tooltip.attr("style","visibility: visible");})
        .on("mousemove", function() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

            tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                    "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                    "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+text+"</div></div>");


            d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/"+No+"_fcl_vis.jpg";
            //console.log("project_img.src = "+project_img.src);
            d3.select("#tooltip_pic").attr("src",project_img.src);


            var left = tooltip.node().getBoundingClientRect().left;
            var top = tooltip.node().getBoundingClientRect().top;
            var tooltip_width = tooltip.node().getBoundingClientRect().width;

            var pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            var pic_width = pic_height/1.25;

            d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');

            tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

            var text_height = pic_height;
            var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
           // var text_area =  text_height* text_width;

            //console.log("-----------");
            //console.log("text_area = "+text_area);


           /* var right = tooltip.node().getBoundingClientRect().right;
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



        }).on("mouseout", function () {
        return tooltip.attr("style","visibility: hidden");
    })
        .on("click",function () {
        if(radius >1){
            var scale = 4;

            var x_multiplier = radius/3*0.1 +0.35;
            var y_multiplier = radius/3*0.1+0.3;
            if(radius ==23){
                x_multiplier  = 0.78;
                y_multiplier = 0.80;
            }else{
                if(radius ==2){
                    x_multiplier = 0.90;
                    y_multiplier = 0.7;
                }
            }
            var pos =[(x*x_multiplier)*(-1*scale),(y*y_multiplier)*(-1*scale)];

            move(pos,scale);

        }
    });


}

/*find tier1- distance <= 200;
 tier2- distance < */
// 55 projects, index 0-54
function find_tier(matrix, tier_range){

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

function draw_tiers(){
    
    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {

        if(err)
            console.log(err);

        var dist_matrix = generate_DistMatrix(projects);
        var tier1_range = 100;
        //var tier2_range = 50;
        //var tier3_range = 10;  //this tier is for zoomable circles
        var tier1 = find_tier(dist_matrix, tier1_range); //output: tier_status, clusterNumber,clusters
        console.log(tier1);
        //var tier2 = find_tier(dist_matrix,tier2_range);
        //var tier3 = find_tier(dist_matrix, tier3_range);
        var tier_status = tier1[0];  //index 0-54 indicates 55 projects
        var clusterNumber = tier1[1];  //index zero with nothing
        var clusters = tier1[2];    //index zero shows the number of projects not belonging to any cluster
        var average_longitude = [0];  // index 1 to number of clusters
        var average_latitude  =[0];
        var clusterCount = clusterNumber.length-1;
        var clusterIndex;

        //initialize the arrays
        for(var i=0;i< clusterCount;i++){
            average_latitude.push(0);
            average_longitude.push(0);
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
            average_longitude[clusterIndex] = average_longitude[clusterIndex] + long;
            lat_list.push(lat);
            long_list.push(long);
            //addpoint((tier_status[project_index-1]-1),i.Longitude,i.Latitude,title, title+text,undefined,project_index);
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
                    //TierNo,Name,ClusterNo,ProjectNo,Longitude,Latitude,Projects_Included,Title,Text,CountriesIncluded
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

        SC.clustersCollection = {"name":"root",
                                "latitude": 0,
                                "longitude": 0,
                                    "children":[]};

        var size_unit  = 700;
        var tier1_cluster = {};  //root of each zoomable circle

        var tier2_cluster ={};
        
        var tier3_cluster = {};
        
        var project_object = {}; //real-project,
        //TierNo,ProjectIndex,FCL_Project,Case Study,Longitude,Latitude,Title,Text,Country,City

        d3.csv("data/complementary/project_Cluster_Info (1).csv", function (err, tier1s) {

            var index = 0;

            //add in the points not in any clusters, clusters[0]
            for (j = 0; j < clusters[0].length; j++) {
                index++;

                project_object["tierNo"] = 4;
                project_object["index"] = index;
                project_object["projectIndex"] = clusters[0][j]; // add in projects accordingly, 1-55
                project_object["size"] = size_unit;
                project_object["parentIndex"] =  null;

                var projectInfo = projects.filter(function (d) {
                    return Number(d.No) == Number(clusters[0][j]);
                });

                if (projectInfo.length > 0) {
                    //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                    project_object["fcl_project"] = projectInfo[0].FCL_Project;
                    project_object["case_study"] = projectInfo[0].Case_study;
                    project_object["latitude"] = projectInfo[0].Latitude;
                    project_object["longitude"] = projectInfo[0].Longitude;
                    project_object["name"] = "<b>"+projectInfo[0].FCL_Project+"<br>"+ projectInfo[0].Case_study+"</b>";
                    project_object["text"] = "<br><p>"+projectInfo[0].Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ projectInfo[0].Latitude +"° N, "+ projectInfo[0].Longitude+"°E <br>"
                        +projectInfo[0].City+" , "+projectInfo[0].Country+"<br>"+projectInfo[0].Description+"</p>";
                    project_object["country"] = projectInfo[0].Country;
                    project_object["city"] = projectInfo[0].City;

                }

                SC.clustersCollection["children"].push(project_object);
                projectInfo = [];
                project_object = {};
            }

            //add in projects in any clusters
            
            var tier1_cluster_length ;
            var tier1_children;
            var tier1_children_proNo;
            var tier1_children_name;

            tier1s.forEach(function (t1_cluster) {


                var t1_clusterNo = t1_cluster.ClusterNo;
                var t1_clusterName = t1_cluster.Name;
                var projectsIncluded;

                if(t1_clusterName == undefined)
                    return;

                tier1_cluster_length = country_tiers[t1_clusterNo-1]["country_no"];

                var tier1_index;
                var aver_lat_tier3 = [] ;
                var aver_long_tier3 =[];
                var key, y_coordinate, tier3_index;

                var tier2_name = Object.keys(country_tiers[t1_clusterNo - 1])[0];
                var tier2 = country_tiers[t1_clusterNo - 1][tier2_name];

                if(tier2["ProjectsIncluded"].length>1)
                    projectsIncluded = tier2["ProjectsIncluded"].split(" ");

                if (tier1_cluster_length==1) {  // if only 1 country included, add in tier2 cluster as children to root

                    var tier2_proNo= tier2 ["ProjectNumber"];
                    index++;
                    
                    tier2_cluster["tierNo"] = 2;
                    tier2_cluster["name"] = tier2_name;
                    tier2_cluster["index"] = index;
                    tier2_cluster["projectCount"] = tier2_proNo;
                    tier2_cluster["longitude"] = tier2 ["total_Long"] / tier2_proNo;
                    tier2_cluster["latitude"] = tier2 ["total_Lat"] / tier2_proNo;
                    tier2_cluster["projects_Included"] = projectsIncluded;
                    tier2_cluster["title"] = tier2_name;
                    tier2_cluster["text"] =  "<br>ProjectNo = " + tier2_proNo;
                    tier2_cluster["children"] = [];


                    //tier3 - those projects having the same coordinates, thus projected overlapped on map
                    var tier2_index = index;
                    var tier3_candidates = {};
                    var x_list = {};
                    var y_list = {};
                    var y_list_reverse = {};
                    var formed = [];

                    //prepare info needed for tier 3 clustering
                    for (j = 0; j < tier2_proNo; j++) {

                        var projectNumber = projectsIncluded[j];
                        formed[projectNumber] = false;

                        projectInfo = projects.filter(function (d) {
                            return Number(d.No) == Number(projectNumber);
                        });


                        if (projectInfo.length > 0) {
                            tier3_candidates[projectNumber] = {};
                            tier3_candidates[projectNumber]["projectInfo"] = projectInfo;

                            var long = parseInt(projectInfo[0].Longitude);
                            if (x_list[long] == undefined) {
                                x_list[long] = [];
                                x_list[long].push(projectNumber);
                            }
                            else {
                                x_list[long].push(projectNumber);
                            }
                            var lat = parseInt(projectInfo[0].Latitude);
                            y_list[projectNumber] = lat;
                        }
                        projectInfo = [];

                    }

                    for (i = 0; i < Object.keys(x_list).length; i++) {
                        key = Object.keys(x_list)[i];
                        if (x_list[key].length > 1) {

                            for (j = 0; j < x_list[key].length; j++) {
                                projectNumber = x_list[key][j];
                                y_coordinate = y_list[projectNumber];
                                if (y_list_reverse[y_coordinate] == undefined) {
                                    y_list_reverse[y_coordinate] = [];
                                    y_list_reverse[y_coordinate].push(projectNumber);
                                } else {
                                    y_list_reverse[y_coordinate].push(projectNumber);
                                }
                            }

                        }
                    }

                    //y_list_reverse stores projects with same coordinates

                    for (i = 0; i < Object.keys(y_list_reverse).length; i++) {

                        aver_lat_tier3.push(0);
                        aver_long_tier3.push(0);

                        var projectNo = y_list_reverse[Object.keys(y_list_reverse)[i]].length;
                        var projectsIn = y_list_reverse[Object.keys(y_list_reverse)[i]];
                        if (projectNo > 1) { // to form tier 3 clusters
                            index++;


                            tier3_cluster["index"] = index;
                            tier3_cluster["tierNo"] = 3;
                            tier3_cluster["children"] = [];
                            tier3_cluster["projects_Included"] = projectsIn;
                            tier3_cluster["title"] = "";

                            tier3_index = index;
                            //add projects to each tier3 cluster
                            for (j = 0; j < projectNo; j++) {
                                var projectIndex =projectsIn[j];
                                formed[projectIndex] = true;
                                index++;

                                var project = tier3_candidates[projectNumber]["projectInfo"][0];
                                project_object["projectIndex"] = project.No;
                                project_object["index"] = index;
                                project_object["tierNo"] = 4;
                                project_object["fcl_project"] = project.FCL_Project;
                                project_object["case_study"] = project.Case_study;
                                project_object["latitude"] = project.Latitude;
                                project_object["longitude"] = project.Longitude;
                                project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                    +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                project_object["country"] = project.Country;
                                project_object["city"] = project.City;
                                project_object["parentIndex"] = tier3_index;
                                project_object["size"] = size_unit;

                                aver_lat_tier3[i] += Number(project.Latitude);
                                aver_long_tier3[i] += Number(project.Longitude);
                                tier3_cluster["children"].push(project_object);
                                project_object = {};
                            }

                            tier3_cluster["longitude"] = aver_long_tier3[i] / projectNo;
                            tier3_cluster["latitude"] = aver_lat_tier3[i] / projectNo;

                            tier2_cluster["children"].push(tier3_cluster);
                            tier3_cluster = {};

                        }

                    }// end of tier 3 formation

                    //to build projects for other non-tier3 projects
                    for (j = 0; j < tier2_proNo; j++) {
                        projectIndex = projectsIncluded[j];
                        if (formed[projectIndex] == false) {
                            formed[projectIndex] = true;
                            index++;

                            project = tier3_candidates[projectIndex]["projectInfo"][0];
                            project_object["index"] = index;
                            project_object["tierNo"] = 4;
                            project_object["fcl_project"] = project.FCL_Project;
                            project_object["case_study"] = project.Case_study;
                            project_object["latitude"] = project.Latitude;
                            project_object["longitude"] = project.Longitude;
                            project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                            project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                            project_object["country"] = project.Country;
                            project_object["city"] = project.City;
                            project_object["parentIndex"] = tier2_index;
                            project_object["size"] = size_unit;

                            tier2_cluster["children"].push(project_object);
                            project_object = {};
                        }

                    }// end of forming non-tier3 projects
                    
                    SC.clustersCollection["children"].push(tier2_cluster);
                    tier2_cluster = {};

                }else {  // tier 1 more than 1 country

                    index++;
                    tier1_cluster["index"] = index;
                    tier1_cluster["tierNo"] = 1;
                    tier1_cluster["name"] = t1_clusterName;
                    //tier1_cluster["clusterNo"] = t1_cluster.ClusterNo;
                    tier1_cluster["projectCount"] = t1_cluster.ProjectNo;
                    tier1_cluster["longitude"] = t1_cluster.Longitude;
                    tier1_cluster["latitude"] = t1_cluster.Latitude;
                    tier1_cluster["projects_Included"] = t1_cluster.Projects_Included;
                    //tier1_cluster["title"] = t1_cluster.Title;
                    tier1_cluster["text"] = t1_cluster.Text;
                    tier1_cluster["children"] = [];
                    //tier2_proNo = tier2["ProjectNumber"];
                    tier1_index = index;

                    clusterIndex = 0;
                    while(clusterIndex < tier1_cluster_length){

                        tier1_children_name = Object.keys(country_tiers[t1_clusterNo - 1])[clusterIndex];
                        clusterIndex++;

                        tier1_children = country_tiers[t1_clusterNo - 1][tier1_children_name];

                        tier1_children_proNo = tier1_children["ProjectNumber"];

                        if(tier1_children_proNo>1){  //when a country only has at least two projects
                            projectsIncluded= tier1_children["ProjectsIncluded"].split(" ");
                            
                            index++;
                            tier2_cluster["index"] = index;
                            tier2_cluster["tierNo"] = 2;
                            tier2_cluster["name"] = tier1_children_name;
                            //tier2_cluster["clusterNo"] = clusterIndex;
                            tier2_cluster["projectCount"] = tier1_children_proNo;
                            tier2_cluster["longitude"] = tier1_children["total_Long"] / tier1_children_proNo;
                            tier2_cluster["latitude"] = tier1_children["total_Lat"] / tier1_children_proNo;
                            tier2_cluster["projects_Included"] = projectsIncluded;
                            tier2_cluster["text"] = "<br>ProjectNo = " + tier1_children_proNo;
                            tier2_cluster["children"] = [];
                            tier2_cluster["parentIndex"] = tier1_index;
                            tier2_index = index;


                            // add tier3 or concrete projects as children to tier2 clusters

                            //tier3 - those projects having the same coordinates, thus projected overlapped on map
                                
                                tier3_candidates = {};
                                x_list = {};
                                y_list = {};
                                y_list_reverse = {};
                                formed = [];

                                //prepare info needed for tier 3 clustering
                                for (j = 0; j < tier1_children_proNo; j++) {

                                    projectNumber = projectsIncluded[j];
                                    formed[projectNumber] = false;

                                    projectInfo = projects.filter(function (d) {
                                        return Number(d.No) == Number(projectNumber);
                                    });

                                    if (projectInfo.length > 0) {
                                        tier3_candidates[projectNumber] = {};
                                        tier3_candidates[projectNumber]["projectInfo"] = projectInfo[0];
                                        var long2 = parseInt(projectInfo[0].Longitude);
                                        if (x_list[long2] == undefined) {
                                            x_list[long2] = [];
                                            x_list[long2].push(projectNumber);
                                        }
                                        else {
                                            x_list[long2].push(projectNumber);
                                        }
                                        var lat2 = parseInt(projectInfo[0].Latitude);
                                        y_list[projectNumber] = lat2;
                                    }
                                    projectInfo = [];
                                }


                                for (i = 0; i < Object.keys(x_list).length; i++) {
                                    key = Object.keys(x_list)[i];
                                    if (x_list[key].length > 1) {

                                        for (j = 0; j < x_list[key].length; j++) {
                                            projectNumber = x_list[key][j];
                                            y_coordinate = y_list[projectNumber];
                                            if (y_list_reverse[y_coordinate] == undefined) {
                                                y_list_reverse[y_coordinate] = [];
                                                y_list_reverse[y_coordinate].push(projectNumber);
                                            } else {
                                                y_list_reverse[y_coordinate].push(projectNumber);
                                            }
                                        }

                                    }
                                }

                                //y_list_reverse stores projects with same coordinates
                                aver_lat_tier3 = [];
                                aver_long_tier3 = [];

                                for (i = 0; i < Object.keys(y_list_reverse).length; i++) {

                                    projectNo = y_list_reverse[Object.keys(y_list_reverse)[i]].length;
                                    aver_lat_tier3.push(0);
                                    aver_long_tier3.push(0);

                                    if (projectNo > 1) { // to form tier 3 clusters
                                        index++;


                                        tier3_cluster["index"] = index;
                                        tier3_cluster["tierNo"] = 3;
                                        tier3_cluster["children"] = [];
                                        tier3_cluster["projects_Included"] = y_list_reverse[Object.keys(y_list_reverse)[i]];
                                        tier3_cluster["title"] = "";

                                        tier3_index = index;
                                        //add projects to each tier3 cluster
                                        for (j = 0; j < projectNo; j++) {
                                            projectIndex = y_list_reverse[Object.keys(y_list_reverse)[i]][j];
                                            formed[projectIndex] = true;
                                            index++;

                                            project = tier3_candidates[projectIndex]["projectInfo"];
                                            project_object["index"] = index;
                                            project_object["projectIndex"]= project.No;
                                            project_object["tierNo"] = 4;
                                            project_object["fcl_project"] = project.FCL_Project;
                                            project_object["case_study"] = project.Case_study;
                                            project_object["latitude"] = project.Latitude;
                                            project_object["longitude"] = project.Longitude;
                                            project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                            project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                                +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                            project_object["country"] = project.Country;
                                            project_object["city"] = project.City;
                                            project_object["parentIndex"] = tier3_index;
                                            project_object["size"] = size_unit;

                                            aver_lat_tier3[i] += Number(project.Latitude);
                                            aver_long_tier3[i] += Number(project.Longitude);
                                            tier3_cluster["children"].push(project_object);
                                            project_object = {};
                                        }

                                        tier3_cluster["longitude"] = aver_long_tier3[i] / projectNo;
                                        tier3_cluster["latitude"] = aver_lat_tier3[i] / projectNo;

                                        tier2_cluster["children"].push(tier3_cluster);
                                        tier3_cluster = {};

                                    }

                                }// end of tier 3 formation


                                //to build projects for other non-tier3 projects
                                for (j = 0; j < tier1_children_proNo; j++) {
                                    projectIndex = projectsIncluded[j];
                                    if (formed[projectIndex] == false) {
                                        formed[projectIndex] = true;
                                        index++;

                                        project = tier3_candidates[projectIndex]["projectInfo"];
                                        project_object["projectIndex"] = project.No;
                                        project_object["index"] = index;
                                        project_object["tierNo"] = 4;
                                        project_object["fcl_project"] = project.FCL_Project;
                                        project_object["case_study"] = project.Case_study;
                                        project_object["latitude"] = project.Latitude;
                                        project_object["longitude"] = project.Longitude;
                                        project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                        project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                            +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                        project_object["country"] = project.Country;
                                        project_object["city"] = project.City;
                                        project_object["parentIndex"] = tier2_index;
                                        project_object["size"] = size_unit;

                                        tier2_cluster["children"].push(project_object);
                                        project_object = {};
                                    }

                                }// end of forming non-tier3 projects

                                //SC.clustersCollection.push(tier2_cluster);
                                //tier2_cluster = {};

                               // tier2_cluster["children"].push(project_object);
                                //project_object = {};
                            
                            

                            tier1_cluster["children"].push(tier2_cluster);
                            tier2_cluster = {};
                        } else {

                            projectsIncluded = tier1_children["ProjectsIncluded"];
                            project_object["tierNo"] = 4;
                            project_object["projectIndex"] = projectsIncluded; // add in ptojects accordingly, 1-55
                            project_object["size"] = size_unit;

                            projectInfo = projects.filter(function (d) {
                                return Number(d.No) == Number(projectsIncluded);
                            });

                            if (projectInfo.length > 0) {
                                //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                                project_object["fcl_project"] = projectInfo[0].FCL_Project;
                                project_object["case_study"] = projectInfo[0].Case_study;
                                project_object["longitude"] = projectInfo[0].Longitude;
                                project_object["latitude"] = projectInfo[0].Latitude;
                                project_object["name"] = "<b>"+projectInfo[0].FCL_Project+"<br>"+ projectInfo[0].Case_study+"</b>";
                                project_object["text"] = "<br><p>" + projectInfo[0].Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + projectInfo[0].Latitude + "° N, " + projectInfo[0].Longitude + "°E <br>"
                                    +projectInfo[0].City+" , "+projectInfo[0].Country+"<br>"+ projectInfo[0].Description + "</p>";
                                project_object["country"] = projectInfo[0].Country;
                                project_object["city"] = projectInfo[0].City;
                                project_object["index"] = index;
                                project_object["parentIndex"] = tier1_index;
                            }

                            tier1_cluster["children"].push(project_object);
                            project_object = {};
                        }
                    }
                    SC.clustersCollection["children"].push(tier1_cluster);
                    tier1_cluster = {};
                }
            });
            //console.log(SC.clustersCollection);
            draw_circles();
        });

// JSON.parse converts json_string to an object
        //var obj = JSON.parse(SC.clustersCollection);
// JSON.stringify converts the object to a string again


        //var data = "{name: 'Bob', occupation: 'Plumber'}";
        /* var url = 'data:text/json;charset=utf8,' + encodeURIComponent(obj);
         window.open(url, '_blank');
         window.focus();*/

        //add the external circles
       /* for(i=1;i< clusterCount+1;i++) {

            number = clusterNumber[i];
            average_longitude[i] = average_longitude[i] / number;
            average_latitude[i] = average_latitude[i] / number;
            title = "<b>Cluster " + i + "</b>";
            text = title + "<br><br>Radius = " + (5 * number) +
                "<br>Project Number:  " + clusterNumber[i];
            //addpoint(color, average_longitude[i], average_latitude[i], title, text, number);
        }*/
    });

}





var margin =20,
    diameter = 300;
var  node,circle,focus,view,text; //svg
var cg_g;

function draw_circles(){



    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return d.size;});


    var cg = svg.append("g")
        .classed("extra_info",true)
        .attr("id","zoomable_circles");


    //
    // d3.json("data/flare.json", function(error, data) {
    //var clusterCollection_length = 2;//SC.clustersCollection.length;
    //for(var i=0;i< clusterCollection_length; i++) {

        //var projection = projection(average_latitude[6],average_longtitude[6]);
        var root = SC.clustersCollection;





        //draw_circles(root);
        cg_g = cg.append("g")
            .attr("class", "circle_holder")
            //.attr("transform", "translate(" + 640 + "," + 512 + ")")  //2
            .attr("style", "border: 1px solid #d0d0d0;");
        //+ diameter /2 + "," + diameter / 2 + ")");


        console.log("root = " + root);
        focus = root;
        var nodes = pack.nodes(root);
        //view;

        circle = cg_g.selectAll("circle")  //svg
            .data(nodes)
            .enter()
            .append("svg:circle")
            .attr("class", function (d) {
                var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                return res;
            })
            //.attr("r",function(d){return d.r * diameter;})
            //.attr("transform", "translate(" + proj[0] + "," + proj[1] + ")")
            .attr("cx",function(d){
                    var lat = Number(d["latitude"]);
                    var lon = Number(d["longitude"]);


                var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var center_x =  dualScreenLeft+width/2;
                var center_y  = dualScreenTop+height/2;

                var proj = projection([lon,lat])?  projection([lon,lat]):[center_x,center_y];
             return proj[0]-dualScreenLeft;
             })
             .attr("cy",function(d){

                 var lat = d["latitude"];
                 var lon = d["longitude"];
                 var proj = projection([lon,lat]);
                 var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
                 return proj[1]-dualScreenTop;})
            .style("fill", function (d) {
                return d.children ? color(d.depth) : null;
            })
            .style("fill-opacity", 0.5)
            .on("mouseover", function (d) {
                var mouse = d3.mouse(svg.node()).map(function (d) {
                    return parseInt(d);
                });

                /*return tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                 .html(d["name"] + d["text"]);*/


                var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

                tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                        "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                        "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+d["name"]+d["text"]+"</div></div>");


                d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

                //add in picture for the project
                var project_img = new Image();
                project_img.src = "img/project_img/"+d["projectIndex"]+"_fcl_vis.jpg";
                //console.log("project_img.src = "+project_img.src);
                d3.select("#tooltip_pic").attr("src",project_img.src);


                var left = tooltip.node().getBoundingClientRect().left;
                var top = tooltip.node().getBoundingClientRect().top;
                var tooltip_width = tooltip.node().getBoundingClientRect().width;

                var pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
                var pic_width = pic_height/1.25;

                d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');
                d3.select("#pic_holder").style("width",pic_width+'px').style("height",pic_height+'px');
                tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");


                //return tooltip.attr("style", "visibility: visible");
            })
            /*.on("mousemove", function (d, i) {

                    })*/.on("mouseout", function (d, i) {
                return tooltip.attr("style", "visibility: hidden");
            })
            .on("click", function (d) {
                console.log("onclick!!   focus.x = " + focus.name + " d.x = " + d.name);
                //var scaleTo = d["tierNo"]? d["tierNo"]: zoom.scale();

                if (focus !== d)
                    zoom_Circles(this,d), d3.event.stopPropagation();
            });

    d3.selectAll(".node--root").attr("style", "visibility: hidden");

        /*text = cg_g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "project_clustering_label")
            .style("fill-opacity", function (d) {
                return d.parent === root ? 0.8 : 0;
            })
            .style("display", function (d) {
                return d.parent === root ? "inline" : "none";
            })
            .text(function (d) {
                return d.name;
            });*/

        cg_g
            .on("click", function () {
                zoom_Circles(root);
            });

        node = cg_g.selectAll("circle");//,text
            /*.attr("x",function(d){
                var lat = Number(d["latitude"]);
                var lon = Number(d["longitude"]);


                var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var center_x =  dualScreenLeft+width/2;
                var center_y  = dualScreenTop+height/2;

                var proj = projection([lon,lat])?  projection([lon,lat]):[center_x,center_y];
                return proj[0]-dualScreenLeft;
            })
            .attr("y",function(d){
                var lat = d["latitude"];
                var lon = d["longitude"];
                var proj = projection([lon,lat]);
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
                return proj[1]-dualScreenTop;});
*/

        //console.log("node_root = "+node_root);
        //d3.selectAll(".node--root")


        //console.log("cg = "+cg);


       zoomTo([root.x, root.y, root.r * 2 + margin]);



    d3.select(self.frameElement).style("height", diameter + "px");
    
}

function zoom_Circles(circle, d) {

    var proj = projection([d["longitude"],d["latitude"]]);
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
        'dblclick', // in DOMString typeArg,
        true,  // in boolean canBubbleArg,
        true,  // in boolean cancelableArg,
        window,// in views::AbstractView viewArg,
        120,   // in long detailArg,
        proj[0],     // in long screenXArg,
        proj[1],     // in long screenYArg,
        proj[0],     // in long clientXArg,
        proj[1],     // in long clientYArg,
        0,     // in boolean ctrlKeyArg,
        0,     // in boolean altKeyArg,
        0,     // in boolean shiftKeyArg,
        0,     // in boolean metaKeyArg,
        0,     // in unsigned short buttonArg,
        null   // in EventTarget relatedTargetArg
    );
    circle.dispatchEvent(evt);
    //console.log("zoom_Circles("+d.name+")");
    //var focus0 = focus;
    /*focus = d;
    var lon =Number(d["longitude"]);
    var lat = Number(d["latitude"]);
    var proj = projection([lon,lat] );

    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var center_x =  dualScreenLeft+width/2;
    var center_y  = dualScreenTop+height/2;

    console.log(d);
    console.log(proj);

    var t = [center_x - proj[0],center_y - proj[1]];
    console.log("difference to center = "+t);
    var s= zoom.scale();
    console.log("s="+s);
var center = zoom.center(width/2, height/2);


    t = [t[0] , t[1]];//1-s,(2*s-1)
    move(t,s);
    console.log(d.x+" , "+d.y+"  s="+s);
    /*var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom_Circles", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          // console.log("zoom_Circles():  view = "+view+"focus.x= "+ focus.x + "  focus.y = "+focus.y);
            //console.log("tween : d ->"+d);
            return function(t) {
                var s  = diameter / i(t)[2];
                var pos = i(t).slice(0,2);
                console.log("pos = "+pos);
                move(pos,s);
            }
                //console.log("t->"+t);
                //zoomTo(i(t)); };
        });

   // var text_affected = transition.selectAll("text")
    transition.selectAll(".project_clustering_label")
        .filter(function(t) {//d
            return t.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function() { return d.parent === focus ? 0.8 : 0; })
        .each("start", function() { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function() { if (d.parent !== focus) this.style.display = "none"; });*/
}

function zoomTo(v) {
   console.log("zoomTo("+v+")");
    var k = diameter / v[2];
    view = v;
  /* node.attr("transform", function(d) {
        //console.log("translate to "+(d.x - v[0]) * k + " , "+(d.y - v[1]) * k);
        var x = (d.x - v[0]) * k;
        var y = (d.y - v[1]) * k;
        return "translate(" + x+ "," + y + ")"; });
*/
    circle.attr("r", function(d) {
        var r = d.r * k;
        return r});

   //var t =[-v[0]*k,-v[1]*k];
   // var s = k;
    //move(t,s);
}

