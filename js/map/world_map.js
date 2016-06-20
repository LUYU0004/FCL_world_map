/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

window.SC = {};
SC.projectNo =0;
//SC.clustersCollection =[];
SC.projects = [];
SC.matrix = [];


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

var zoom = d3.behavior.zoom().scaleExtent([1, 8])
            .on("zoom",move);


function setup() {

    offsetL = document.getElementById("map_container").offsetLeft + 10;
    offsetT = document.getElementById("map_container").offsetTop + 10;

    tooltip = d3.select("#map_container").append("div").attr("class", "tooltip")
        .attr("style","visibility: hidden");//

    map_width = document.getElementById("map_container").offsetWidth;
    map_height = window.innerHeight;

    graticule = d3.geo.graticule();
    
    projection = d3.geo.mercator()
        .translate([(map_width / 2), (map_height / 2)])
        //.center()
        //.rotate( [71.057,0] )
        .center( [0, 42.313] )
        .scale(map_width /2/Math.PI);

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
        function (d) {
            if(d.id == 706)
                return "#000000";
            return "#DEEBF7";
        });



    
    country.on("mouseover", function(){ 
        return tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            
            return tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(d.properties.name);
            


    }).on("mouseout", function (d, i) {
        return tooltip.attr("style", "visibility: hidden");
    });





    d3.select("#pop_densityBtn").classed("selectedBtn",true);
    category = "Population Density";
    newInput();
    
    
}




function move(t,s) {
    if(t ==undefined || s== undefined){
        s = d3.event.scale ;
        t = d3.event.translate;

    }

    var tier1_scale = 2;
    var tier2_scale = 4;
    var tier3_scale = 6;
    var tier4_scale =7;
    var tier_range = 100;
    var scale =2;


    if(s>= tier4_scale) {
        
        tier_range = 3;
        scale = tier4_scale;
        svg.selectAll(".projects").remove();
        find_last_tier(SC.matrix,tier_range,scale);
       
    }else if(s>=tier3_scale){
        
        tier_range=5;
        scale = tier3_scale;
        svg.selectAll(".projects").remove();
        find_last_tier(SC.matrix,tier_range,scale);

    }else if(s>=tier2_scale){
        
        tier_range = 25 ;
        scale = tier2_scale;
        svg.selectAll(".projects").remove();
        find_last_tier(SC.matrix,tier_range,scale);

    }else if(s>=tier1_scale){
        
        tier_range = 50 ;
        scale = tier1_scale;
        svg.selectAll(".projects").remove();
        find_last_tier(SC.matrix,tier_range,scale);

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

    svg.attr("transform", "translate(" + t + ")scale(" + s + ")");
    
    
    /* SET NEW ZOOM POINT */
    zoom.translate(t);
    zoom.scale(s);

    d3.selectAll(".point").attr("r", function (d) {
       return Math.sqrt(area_unit*d["projectNo"]/(Math.PI*s));
    });

    d3.selectAll(".cluster").attr("r", function (d) {
        return Math.sqrt(area_unit*d["projectNo"]/(Math.PI*s));
    });
    
    //cg_g.remove();
    svg.selectAll(".zoomable").remove();

    

    //adjust the country hover stroke map_width based on zoom level
    d3.selectAll(".country").style("stroke-map_width", 1.5 / s);
    d3.selectAll(".text").style("font-size", 20 / s);

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
