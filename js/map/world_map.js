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



d3.select(window).on("resize", throttle);

var map_width , map_height;

var projection, path, svg, g, graticule, tooltip;

var zoom = d3.behavior.zoom().scaleExtent([1, 100]).on("zoom", move);


function setup() {

    tooltip = d3.select("#map_container").append("div").attr("class", "tooltip hidden");
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

    g = svg.append("g");
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
        })
        .attr("fill",
        function (d, j) {
            return d.properties.color;
        }
    );

    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;

    
    country.on("mousemove", function (d, i) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            //console.log("mouse "+ d);
            return parseInt(d);
        });

        tooltip.classed("hidden", false)
            .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
            .html(d.properties.name);
        
        //console.log("name: "+ d.properties.name);
    }).on("mouseout", function (d, i) {
        tooltip.classed("hidden", true);
    });

    /*d3.csv("data/fitted/country-capitals.csv", function (err, capitals) {
        capitals.forEach(function (i) {
            console.log(i.CapitalName+"  long:"+i.CapitalLongitude+" lat: "+i.CapitalLatitude, );
            addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName);
        });

    });*/

    d3.csv("data/fitted/Projects.csv", function (err, projects) {
        projects.forEach(function (i) {
            addpoint(i.Longitude,i.Latitude,i.FCL_Project+i.Case_study);
        });
    });

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
    d3.selectAll(".point").attr("r", 3 / s);


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
function addpoint(lat, lon, text) {
    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];

    console.log("x:"+x+"   y:"+y);
    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", "red")
        .attr("r", 3);

    //conditional in case a point has no associated text
    if (text.length > 0) {
        gpoint.append("text")
            .attr("x", x + 1)
            .attr("y", y + 1)
            .attr("class", "text")
            .style("font-size", 20)
            .text(text);

    }
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