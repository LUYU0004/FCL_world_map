/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

window.SC = {};
SC.projectNo =0;
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
        }
    );



    
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
    

    d3.csv("data/fitted/Projects.csv", function (err, projects) {

         var tier1 = generate_DistMatrix(projects);
        var tier_status = tier1[0];  //index 0-54 indicates 55 projects
        var clusterNumber = tier1[1];  //index zero with nothing
        var clusters = tier1[2];    //index zero shows the number of projects not belonging to any cluster
        var average_longtitude = [];  // index 1 to number of clusters
        var average_latitude  =[];
        var clusterIndex;

        //initialize the arrays
        for(var i=0;i< clusterNumber.length;i++){
            average_latitude.push(0);
            average_longtitude.push(0);
        }

        projects.forEach(function (i) {
            var title = "<b>"+i.FCL_Project+"  "+i.Case_study+"</b>";
            var text = "<br><p>"+i.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ i.Latitude+"° N, "+ i.Longitude+"°E <br>"
                        +i.Description+"</p>";
            clusterIndex = tier_status[i.No-1];

            average_longtitude[clusterIndex] = average_longtitude[clusterIndex] + Number(i.Longitude);
            average_latitude[clusterIndex] =average_latitude[clusterIndex] + Number(i.Latitude);

            addpoint((tier_status[i.No-1]-1),i.Longitude,i.Latitude,title, title+text);
        });

        //draw circles
        var title;
        var text;
        var number;
        for(i=1;i< clusterNumber.length;i++){
            number = clusterNumber[i];
            average_longtitude[i] = average_longtitude[i]/number;
            average_latitude[i] = average_latitude[i] / number;
            console.log("average_latitude["+i+"] = "+ average_latitude[i]+"   ,   ");
            title = "<b>Cluster "+i+"</b>";
            text = title +"" +
                "<br><br>Project Number:"+clusterNumber[i];
            addpoint(1,average_longtitude[i],average_latitude[i],title, text, number);
        }
    });
    //document.getElementById("categories").value = "Population Density";
    //newInput();
    d3.select("#pop_densityBtn").classed("selectedBtn",true);
    category = "Population Density";
    //setup_circles();
    newInput();
}


function move() {
    var t = d3.event.translate;
    var s = d3.event.scale;
    zscale = s;

    var h = map_height / 4;

    t[0] = Math.min(
        (map_width / map_height) * (s - 1),
        Math.max(map_width * (1 - s), t[0])
    );
    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(map_height * (1 - s) - h * s, t[1])
    );

    zoom.translate(t);
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");

    //adjust the country hover stroke map_width based on zoom level
    d3.selectAll(".country").style("stroke-map_width", 1.5 / s);
    d3.selectAll(".text").style("font-size", 20 / s);
    d3.selectAll(".point").attr("r", 4/ s);


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
    //console.log(latlon);
}

//function to add points and text to the map (used in plotting capitals)
function addpoint(color_status, lat, lon, title,text, radius) {

    if(radius == undefined) radius = 1;


    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
                        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    //console.log("x:"+x+"   y:"+y);
    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", function () {
            return color_scheme[color_status];
        })
        .attr("r", 4*radius)
        .on("mouseover", function () {return tooltip.attr("style","visibility: visible");})
        .on("mousemove", function() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
                return tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(title);


        }).on("mouseout", function () {
            return tooltip.attr("style","visibility: hidden");
        }).on("click",function () {

        tooltip.html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
            "='height: 100px;width: 80px;float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png' style='width: 80px;height: 100px;'></span>" +
            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;'>"+text+"</div></div>");

        d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

        //add in picture for the project
        var project_img = new Image();
        project_img.src = "img/project_img/"+No+"_fcl_vis.jpg";
        //console.log("project_img.src = "+project_img.src);
        d3.select("#tooltip_pic").attr("src",project_img.src);

        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        var left = mouse[0] + offsetL;
        var top = mouse[1] + offsetT;
        var window_margin = 16;
        var buffer = 5;
        var paddingH = 15;
        var paddingV = 10;

        var max_text_width= 250;

        var pic_height =d3.select("#tooltip_text").node().getBoundingClientRect().height;
        var pic_width =  pic_width = pic_height/1.25 ;


        var text_width= d3.select("#tooltip_text").node().getBoundingClientRect().width;

        if(text_width <max_text_width){
            text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
        }else{
            paddingH = 30;
            text_width= max_text_width;
        }

        var max_tooltipHolder_Width = pic_width+ text_width + paddingH;

        var tooltip_right = left+max_tooltipHolder_Width;

        var window_right = window.innerWidth - window_margin - buffer;

        if(tooltip_right > window_right){


            left = mouse[0]-max_tooltipHolder_Width-offsetL  ;
        }

        var tooltip_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;


            var tooltip_bottom = top+ tooltip_height + paddingV;

            if(tooltip_bottom> (window.innerHeight-window_margin)){

                top = mouse[1]-tooltip_height-offsetT-paddingV;
            }

        d3.select("#pic_holder").attr("style","width:"+pic_width+"px; height:"+pic_height+"px;float: left;vertical-align: middle;");
        d3.select("#tooltip_pic").attr("style","width:"+pic_width+"px; height:"+pic_height+"px");

        tooltip.attr("style","width:"+ max_tooltipHolder_Width
            +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");


        if(text_width != d3.select("#tooltip_text").node().getBoundingClientRect().width){
            paddingH = 25;
            left = mouse[0] + offsetL;
            top = mouse[1] + offsetT;

            if(text_width <max_text_width){
                text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
            }else{
                paddingH = 30;
                text_width= max_text_width;
            }


            d3.select("#tooltip_text").attr("style","width:"+text_width+"px;float:right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            tooltip_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            tooltip_bottom = top+ tooltip_height + paddingV;

            //restyle the pic to align it vertically with text portion
            pic_height =tooltip_height;
            pic_width = tooltip_height/1.25 ;

            d3.select("#pic_holder").attr("style","width:"+pic_width+"px; height:"+pic_height+"px;float: left;vertical-align: middle;");
            d3.select("#tooltip_pic").attr("style","width:"+pic_width+"px; height:"+pic_height+"px");


            max_tooltipHolder_Width = pic_width+ text_width + paddingH;
            left = mouse[0]-max_tooltipHolder_Width-offsetL  ;

            if(tooltip_bottom> (window.innerHeight-window_margin)) {
                top = mouse[1] - tooltip_height - offsetT-paddingV;
            }

            tooltip.attr("style","width:"+ max_tooltipHolder_Width
                +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");
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

    var tier1_range = 150;

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