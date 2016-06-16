/**
 * Created by yuhao on 27/5/16.
 */


/*calculate distance between any two project locations*/
function generate_DistMatrix(){
    SC.projectNo =0;

    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var projectObj = {};
        var lon_unit;
        var lat_unit;

        projects.forEach(function (pointA) {
            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.projectNo++;
            //No,FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
            projectObj["name"] = pointA.FCL_Project+" "+pointA.Case_study;
            lat_unit  = Number(pointA.Latitude) >=0 ? Math.abs(pointA.Latitude) +'°N':Math.abs(pointA.Latitude) +'°S';
            lon_unit = Number(pointA.Longitude) >=0 ? Math.abs(pointA.Longitude) +'°E':Math.abs(pointA.Longitude) +'°W';
            projectObj["text"] = pointA.Title+"<br>"+lat_unit+" , "+lon_unit+"    |    "+pointA.City+" , "+pointA.Country+"<br>"
                +pointA.Description+"<br>"+pointA.Image_Credit;
            projectObj["latitude"] = pointA.Latitude;
            projectObj["longitude"] = pointA.Longitude;
            projectObj["city"] = pointA.City;
            projectObj["country"] = pointA.Country;
            SC.projects.push(projectObj);
            projectObj = {};

            projects.forEach(function(pointB){
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);

                distance = d3.geo.distance(positionA, positionB)* distance_Multiplier;
                matrix[pointA.No-1].push(distance);
            })
        });

        find_last_tier(matrix,100,1); // draw tier1
        SC.matrix = matrix;
    });

    
}

var radius_unit = 4;
//function to add points and text to the map (used in plotting capitals)
function addpoint(color_status, lat, lon, title,text, radius, imgNo,scale) {


    if(radius == undefined) radius = 1;
    if(imgNo == undefined) imgNo = 0;
    if(color_status==undefined) color_status = 2;


    var gpoint = g.append("g").attr("class","projects extra_info");
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];
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
        .on("mouseover", function () {
            return tooltip.attr("style","visibility: visible");})
        .on("mousemove", function() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

            tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                    "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                    "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'><b>"
                    +title+"</b><br><br><p>"+text+"</div></div>");


            d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
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

            var x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var y = innerHeight/2 - projection([lon,lat])[1] *scale;
            move([x,y],scale);

    });
}


//function to add clusters of projects
function addcluster(color_status, lat, lon, title,text, radius,scale) {

    if(radius == undefined) radius = 2;
    if(color_status==undefined) color_status = 6;


    var gpoint = g.append("g").attr("class","projects extra_info");
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "cluster")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", radius_unit*radius)
        .on("mouseover", function () {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            return tooltip.attr("style", "visibility: visible;left:" + (mouse[0]- offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html("<div id='tooltip_holder' style='vertical-align: middle'>" +
                    "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;'><b>"
                    +title+"</b><br><br><p>"+text+"</div></div>");
            })
        .on("mouseout", function () {
        return tooltip.attr("style","visibility: hidden");
    })
        .on("click",function () {
            var x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var y = innerHeight/2 - projection([lon,lat])[1] *scale;
            move([x,y],scale);

        });


}

//function to add clusters of projects
function add_zoomable_cluster(color_status, lat, lon, title,text, radius,scale,clusterObj) {

    if(radius == undefined) radius = 2;
    if(color_status==undefined) color_status = 6;


    var gpoint = g.append("g").attr("class","projects extra_info");
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "cluster")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", radius_unit*radius)
        .on("mouseover", function () {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            tooltip.attr("style", "visibility: visible;left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html("<div id='tooltip_holder' style='vertical-align: middle'>" +
                    "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'><b>"
                    +title+"</b><br><br><p>"+text+"</div></div>");})
        .on("mouseout", function () {
        return tooltip.attr("style","visibility: hidden");
    })
        .on("click",function () {
            var x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var y = innerHeight/2 - projection([lon,lat])[1] *scale;
            move([x,y],scale);

            //d3.select(this).attr("style", "visibility: hidden");
            svg.selectAll(".zoomable").remove();
            draw_circles(clusterObj);

        });


}

/*find tiers accroding to given distance*/
// 55 projects, index 0-54
function find_tier(matrix, tier_range, scale){

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
    var cluster_aver_lat = [];
    var cluster_aver_lon = [];

    clusterNumber.push(0,0);
    cluster_aver_lat.push(0);
    cluster_aver_lon.push(0);

    for(index = 0;index<SC.projectNo;index++){
        if(check_status[index]==0){
            if(looptime>1) {
                clusterIndex++;
                clusterNumber.push(0);
                cluster_aver_lat.push(0);
                cluster_aver_lon.push(0);
            }
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
    var clusterObj = {};
    var clusterCollection = [];

    var projects = SC.projects;
    var project ;

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);

    }

    //sort projects in tier1_status according to cluster number, clusters[0] collects all projects with no cluster
    for(i=0;i< SC.projectNo;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual project numbers, from 1 to 55
        project = projects[i];
        cluster_aver_lat[index] += Number(project["latitude"]);
        cluster_aver_lon[index] += Number(project["longitude"]);
    }


    //add in cluster objects
    var projectNo ;
    var name;
    var text;
    var clusterSort = [];

    for(i=1;i<clusterNumber.length;i++){
        projectNo = clusterNumber[i];
        cluster_aver_lat[i] = cluster_aver_lat[i]/projectNo;
        cluster_aver_lon[i] = cluster_aver_lon[i]/projectNo;

        clusterSort.push([i,projectNo]);
    }
    clusterSort.sort(function(a, b) {return b[1]-a[1];});

    //draw clusters
    for(i=0; i< clusterSort.length;i++){
        clusterIndex = clusterSort[i][0];
        projectNo = clusterSort[i][1];
        name = "Cluster "+clusterIndex;
        text = "Project Number="+projectNo;
        addcluster(6,cluster_aver_lat[clusterIndex],cluster_aver_lon[clusterIndex],name,text,projectNo,scale);
    }
    
    //draw non-clustered projects
    var length = clusters[0].length;
    var projectIndex;
    for (i=0;i<length;i++){
        projectIndex = clusters[0][i]-1;
        project = projects[projectIndex];
        addpoint(2,project["latitude"],project["longitude"],project["name"],project["text"],1,projectIndex+1,scale);
    }

}


/*for the last tier, to create tree-structure zoomable circles for projects with same 
or very close coordinates*/
function find_last_tier(matrix, tier_range,scale){

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
    var cluster_aver_lat = [];
    var cluster_aver_lon = [];

    clusterNumber.push(0,0);
    cluster_aver_lat.push(0);
    cluster_aver_lon.push(0);

    for(index = 0;index<SC.projectNo;index++){
        if(check_status[index]==0){
            if(looptime>1) {
                clusterIndex++;
                clusterNumber.push(0);
                cluster_aver_lat.push(0);
                cluster_aver_lon.push(0);
            }
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

    var projects = SC.projects;
    var project ;

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);

    }

    //sort projects in tier1_status according to cluster number, clusters[0] collects all projects with no cluster
    for(i=0;i< SC.projectNo;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual project numbers, from 1 to 55
        project = projects[i];
        cluster_aver_lat[index] += Number(project["latitude"]);
        cluster_aver_lon[index] += Number(project["longitude"]);
    }


    //add in cluster objects
    var projectNo ;
    var name;
    var text;
    var clusterSort = [];
    var clusterObj = {};
    var projectObj = {};

    for(i=1;i<clusterNumber.length;i++){
        projectNo = clusterNumber[i];
        cluster_aver_lat[i] = cluster_aver_lat[i]/projectNo;
        cluster_aver_lon[i] = cluster_aver_lon[i]/projectNo;

        clusterSort.push([i,projectNo]);
    }
    clusterSort.sort(function(a, b) {return b[1]-a[1];});

    //draw clusters, clusterIndex start from 1
    var circle_diameter = 50;
    setup_circles(circle_diameter);

    for(i=0; i< clusterSort.length;i++){
        clusterIndex = clusterSort[i][0];
        projectNo = clusterSort[i][1];
        name = "Cluster "+clusterIndex;
        text ="Project Number="+projectNo;
        clusterObj["name"] = name;
        clusterObj["text"] = text;
        clusterObj["longitude"] = cluster_aver_lon[clusterIndex];
        clusterObj["latitude"] = cluster_aver_lat[clusterIndex];
        clusterObj["projectNo"] = projectNo;
        clusterObj["children"] = [];

        //add in children for each cluster object
        for(j=0;j<clusters[clusterIndex].length;j++){

            projectIndex = clusters[clusterIndex][j]-1;
            project = projects[projectIndex];
            projectObj["name"] = project["name"];
            projectObj["text"] = project["text"];
            projectObj["longitude"] = project["longitude"];
            projectObj["latitude"] = project["latitude"];
            projectObj["size"] = 1;
            clusterObj["children"].push(projectObj);
            projectObj ={};
        }

        add_zoomable_cluster(6,cluster_aver_lat[clusterIndex],cluster_aver_lon[clusterIndex],name,text,projectNo,scale,clusterObj);
        //draw_circles(clusterObj);
        clusterObj = {};
    }

    //draw non-clustered projects
    var length = clusters[0].length;
    var projectIndex;
    for (i=0;i<length;i++){
        projectIndex = clusters[0][i]-1;
        project = projects[projectIndex];
        addpoint(2,project["latitude"],project["longitude"],project["name"],project["text"],1,projectIndex+1,scale);
    }

}



var diameter;
var  node,circle,focus,view,text; //svg
var cg_g;

var cg ;

//to setup for draw_Circles at the first use
function setup_circles(){
    cg = svg.append("g")
        .classed("extra_info",true)
        .attr("id","zoomable_circles");
}

//implement each cluster drawing to zoomable circles
function draw_circles(root){

    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    diameter = root["projectNo"] * radius_unit*2;
    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter , diameter ])
        .value(function(d) { return d.size;});


    var root_x = projection([root["longitude"],root["latitude"]])[0];
    var root_y = projection([root["longitude"],root["latitude"]])[1];

    cg_g = cg.append("g")
        .attr("class","projects zoomable")
        .attr("transform", "translate(" + root_x + "," + root_y  + ")")  //2
        .attr("style", "border: 1px solid #d0d0d0;");

    focus = root;
    var nodes = pack.nodes(root);

    circle = cg_g.selectAll("circle")  //svg
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", function (d) {
            var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            return res;
        })
        .style("fill", function (d) {
            return d.children ? color(d.depth) : null;
        })
        .style("fill-opacity", 0.3)
        .on("mouseover", function (d) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            if(d.parent ==null){ //root
                tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html("<div id='tooltip_holder' style='vertical-align: middle'>" +
                        "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;'><b>"+d["name"]+"</b><br>"+d["text"]+"</div></div>");
            }else{
                tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                        "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                        "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'><b>"+d["name"]+"</b><br>"+d["text"]+"</div></div>");


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


            }

            //return tooltip.attr("style", "visibility: visible");
        })
        .on("mouseout", function (d, i) {
            return tooltip.attr("style", "visibility: hidden");
        })
        .on("click", function (d) {
            //var scaleTo = d["tierNo"]? d["tierNo"]: zoom.scale();

            if (focus !== d)
                zoom_Circles(this,d), d3.event.stopPropagation();
        });


    text = cg_g.selectAll("text")
        .data(nodes[0])
        .enter().append("text")
        .attr("class", "project_clustering_label")
        .style("fill-opacity", function (d) {
            return d.parent === root ? 0.8 : 0;
        })
        .style("display", function (d) {
            return d.parent === undefined ? "inline" : "none"; //root
        })
        .text(function (d) {
            return d.name;
        });

    cg_g
        .on("click", function () {
            zoom_Circles(root);
        });

    cg_g.selectAll(".node--root").on("click",function () {
       cg_g.remove();
    });
    node = cg_g.selectAll("circle ,text");//

    zoomTo([root.x, root.y, root.r * 2 ]);



    //d3.select(self.frameElement).style("height", diameter + "px");

}

function zoom_Circles(d) {

    focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 ]);
            return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
        return d.r * k;
    });
}
