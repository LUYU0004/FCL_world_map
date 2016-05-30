/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

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
        projects.forEach(function (i) {
            var title = "<b>"+i.FCL_Project+"  "+i.Case_study+"</b>";
            var text = "<br><p>"+i.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ i.Latitude+"° N, "+ i.Longitude+"°E <br>"
                        +i.Description+"</p>";
            addpoint(i.Longitude,i.Latitude,title, title+text,i.No);
        });
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
function addpoint(lat, lon, title,text, No) {
    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];

    //console.log("x:"+x+"   y:"+y);
    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", "red")
        .attr("r", 4)
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
            "<div id='tooltip_text' style='float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;'>"+text+"</div></div>");

        d3.select("#tooltip_text").attr("style","border:1px solid #010101;float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

        //add in picture for the project
        var project_img = new Image();
        project_img.src = "img/project_img/"+No+"_fcl_vis.jpg";
        console.log("project_img.src = "+project_img.src);
        d3.select("#tooltip_pic").attr("src",project_img.src);

        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        var left = mouse[0] + offsetL;
        var top = mouse[1] + offsetT;
        var window_margin = 16;
        var buffer = 5;
        var paddingH = 30;
        var paddingV = 10;

        var max_text_width= 400;

        var pic_width =d3.select("#pic_holder").node().getBoundingClientRect().width;
        var text_width= d3.select("#tooltip_text").node().getBoundingClientRect().width;

        if(text_width <=max_text_width){
            text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
        }else{
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

        tooltip.attr("style","width:"+ max_tooltipHolder_Width
            +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");

        console.log("text_width1="+ text_width);
        console.log(" top = "+d3.select("#tooltip_holder").node().getBoundingClientRect().top
            +" left = "+ d3.select("#tooltip_holder").node().getBoundingClientRect().left);

        if(text_width != d3.select("#tooltip_text").node().getBoundingClientRect().width){

            left = mouse[0] + offsetL;
            top = mouse[1] + offsetT;

            if(text_width <=max_text_width){
                text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
            }else{
                text_width= max_text_width;
            }

            max_tooltipHolder_Width = pic_width+ text_width + paddingH;
            left = mouse[0]-max_tooltipHolder_Width-offsetL  ;


            d3.select("#tooltip_text").attr("style","width:"+text_width+"px;float:right;border:1px solid #010101;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");


            tooltip_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            tooltip_bottom = top+ tooltip_height + paddingV;

            if(tooltip_bottom> (window.innerHeight-window_margin)) {
                top = mouse[1] - tooltip_height - offsetT-paddingV;
            }
            tooltip.attr("style","width:"+ max_tooltipHolder_Width
                +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");

            console.log("text_width2="+ text_width);
            console.log(" top = "+d3.select("#tooltip_holder").node().getBoundingClientRect().top
                +" left = "+ d3.select("#tooltip_holder").node().getBoundingClientRect().left);
        }

        });

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