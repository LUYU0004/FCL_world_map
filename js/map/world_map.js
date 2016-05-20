/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */
d3.select(window).on("resize", throttle);

var map_width = document.getElementById("map_container").offsetWidth;
var map_height = window.innerHeight - 300;

var projection, path, svg, g;

var graticule = d3.geo.graticule();

var tooltip = d3.select("#map_container").append("div").attr("class", "tooltip hidden");

var zoom = d3.behavior.zoom().scaleExtent([1, 100]).on("zoom", move);

//var color_split = [1000000000, 500000000, 200000000, 100000000, 50000000, 10000000, 5000000, 0];
var color_split = [500, 400, 300, 200, 100, 50, 10, 0];
var colors = ["#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF", "#DEEBF7"];

//setup(map_width, map_height);

function setup(width, height) {

    projection = d3.geo.mercator()
        .translate([(width / 2), (height / 2)])
        //.center()
        //.rotate( [71.057,0] )
        .center( [0, 42.313] )
        .scale(width /2/ Math.PI);

    path = d3.geo.path().projection(projection);

    svg = d3.select("#map_container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("click", click)
        .append("g");

    g = svg.append("g");
}

function draw_worldmap(world_topo) {

    removeAllChild();
    setup(map_width, map_height);

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
            console.log("mouse "+mouse);
            return parseInt(d);
        });
        

        var name = d.properties.name;
        //var country_properties = find_country_population(population, name);
        //var year_pop = country_properties[0][cur_year];
        //var country_size = find_country_size(world_country_size, name);
        //var cur_country_size = country_size[0][cur_year];

        tooltip.classed("hidden", false)
            //.attr("style", "left:" + (mouse[0] +10)+ "px;top:" + (mouse[1]+10)  + "px")
            .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
            .html(d.properties.name); 
    }).on("mouseout", function (d, i) {
        tooltip.classed("hidden", true);

    });

    d3.csv("data/fitted/country-capitals.csv", function (err, capitals) {
        capitals.forEach(function (i) {
            addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName);
        });

    });

    //draw_legend();
}

function find_country_population(population, country_name) {
    var m = population.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });

    return m;
}

function find_country_size(country_size, country_name){
    var m = country_size.filter(function (f){
        return f.Country_Name == country_name;
    });

    return m;
}

/*
 Add color legend
 
function draw_legend() {
    d3.selectAll(".color_legend").remove();
    //d3.selectAll("#color_legend").append("g").attr("class", "color_legend").html(legend);

    var wBox = undefined,
        hBox = undefined;

    var wFactor = 10,
        hFactor = 2;

    wBox = map_width / wFactor;
    hBox = map_height / hFactor;

    var wRect = wBox / (wFactor * 0.75),
        hLegend = hBox - hBox / (hFactor * 1.8),
        offsetText = wRect / 2,
        offsetY = map_height - hBox * 0.9,
        tr = 'translate(' + offsetText + ',' + offsetText * 3 + ')';

    var steps = colors.length,
        hRect = hLegend / steps,
        offsetYFactor = hFactor / hRect;

    var legend = g.append('g').
        attr('class', 'color_legend').
        attr('width', wBox).attr('height', hBox)
        .attr('transform', 'translate(0,' + offsetY + ')');

    legend.append('rect').
        style('fill', '#ffffff')
        .attr('class', 'legend-bg')
        .attr('width', wBox).attr('height', hBox);

    // Draw a rectangle around the color scale to add a border.
    legend.append('rect').attr('class', 'legend-bar').attr('width', wRect).attr('height', hLegend).attr('transform', tr);

    var sg = legend.append('g').attr('transform', tr);

    sg.selectAll('rect').data(colors).enter().append('rect').attr('y', function (d, i) {
        return i * hRect;
    }).attr('fill', function (d, i) {
        return colors[i];
    }).attr('width', wRect).attr('height', hRect);

    //var max_population = 1398790000;

    var max_population = 1000;

    // Draw color scale labels.
    sg.selectAll('text').data(colors).enter().append('text').text(function (d, i) {
        // The last element in the colors list corresponds to the lower threshold.
        //var label = formatNum(color_split[i]);

        var label = color_split[i];
        return label;
    }).attr('class', function (d, i) {
        return 'text-' + i;
    }).attr('x', wRect + offsetText).attr('y', function (d, i) {
        return i * hRect + (hRect + hRect * offsetYFactor);
    });

    //Draw label for end of extent.
    sg.append('text').text(function () {
        //var text = formatNum(max_population);
        var text = max_population;
        return text;

    }).attr('x', wRect + offsetText).attr('y', offsetText * offsetYFactor * 2);
}

function redraw() {
    map_width = document.getElementById("map_container").offsetWidth;
    map_height = window.innerHeight - 300;

    d3.select("svg").remove();
    setup(map_width, map_height);

    draw(this.world_topo, this.population, this.country_size);
}*/

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

    draw_legend();
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

    var extra_info = document.getElementById("extra_info");
    while (extra_info.firstChild) {
        extra_info.removeChild(extra_info.firstChild);
    }

    var map_container = document.getElementById("map_container");
    while (map_container.firstChild) {
        map_container .removeChild(map_container .firstChild);
    }

}