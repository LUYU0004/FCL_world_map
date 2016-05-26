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
            addpoint(i.Longitude,i.Latitude,title, title+text);
        });
    });
    //document.getElementById("categories").value = "Population Density";
    //newInput();
    d3.select("#pop_densityBtn").classed("selectedBtn",true);
    category = "Population Density";
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
function addpoint(lat, lon, title,text) {
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

        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        var left = mouse[0] + offsetL;
        var top = mouse[1] + offsetT;
        var window_margin = 16;
        var buffer = 5;

        var text_right = d3.select("#tooltip_text").node().getBoundingClientRect().right;
        var window_right = window.innerWidth - window_margin - buffer;

        if(text_right > window_right){
            console.log("text_right="+text_right+"  window_right = "+window_right);

            d3.select("#tooltip_text").attr("style","width:500px;float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            var max_tooltipHolder_Width = d3.select("#pic_holder").node().getBoundingClientRect().width+d3.select("#tooltip_text").node().getBoundingClientRect().width;

            left = mouse[0]-max_tooltipHolder_Width-offsetL  ;

        }

        var text_top = d3.select("#tooltip_text").node().getBoundingClientRect().top;
        console.log("text_top="+text_top+"  wind+margin="+(window_margin+buffer));
        var text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;

        if(text_top <(window_margin+buffer)){
            top = mouse[1]-text_height;

            console.log("1  mouse[1]="+mouse[1]+"  top="+top);
        }else{
            var text_bottom = d3.select("#tooltip_text").node().getBoundingClientRect().bottom;
            console.log("2  mouse[1]="+mouse[1]+"  text_bottom="+text_bottom);
            if(text_bottom> (window.innerHeight-window_margin)){
                top = mouse[1]-text_height-offsetT;
                console.log("top="+top);
            }
        }

        tooltip.attr("style","width:"+ max_tooltipHolder_Width
            +"px; left:"+ left+"px;top:"+top+"px;");

        /*console.log("mouse[1]  = "+mouse[1] );
        var box_left = d3.select("#tooltip_holder").node().getBoundingClientRect().left;
        var box_right  = d3.select("#tooltip_holder").node().getBoundingClientRect().right;

        var pic_left = d3.select("#pic_holder").node().getBoundingClientRect().left;

        var text_left = d3.select("#tooltip_text").node().getBoundingClientRect().left;

        var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
        console.log("window_bottom"+window.innerHeight+"box_top="+d3.select("#tooltip_holder").node().getBoundingClientRect().bottom+"  box_bottom = "+d3.select("#tooltip_holder").node().getBoundingClientRect().bottom);
        console.log("box_height ="+d3.select("#tooltip_holder").node().getBoundingClientRect().height);
        console.log("  text_height = "+d3.select("#tooltip_text").node().getBoundingClientRect().height);*/

        /*var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });
        var left = mouse[0]+offsetL;
        var top = mouse[1]+offsetT;
        //var offsetH = offsetL;


        if(mouse[0] > (window.innerWidth/2)){ // mouse is on the right half of the window
            var offsetH =  offsetL;
            var pic_holder_width = d3.select("#pic_holder").node().getBoundingClientRect().width +offsetH;

            offsetH = pic_holder_width+ d3.select("#tooltip_text").node().getBoundingClientRect().width ;
            left = mouse[0] -offsetH;

            //selection.node().getBoundingClientRect()
        };

        if(mouse[1]>(window.innerHeight/2)){
            var text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            console.log(d3.select("#tooltip_text").node().getBoundingClientRect().right+"  / offsetHeight = "+ text_height);

            var offsetV= text_height+ offsetT;
            console.log("mouse[1]="+mouse[1]+"  offsetV="+ offsetV+ "| offsetT="+offsetT+"  text_height="+text_height);
            top = mouse[1] - offsetV;
            console.log("top"+top);
        }

        tooltip.attr("style", "left:" +  left+ "px;top:"+top+"px;");
        console.log("right:"+d3.select("#tooltip_holder").style("right"));

        if(d3.select("#tooltip_text").node().getBoundingClientRect().right > (window.innerWidth-10) ){
            console.log("left="+(d3.select("#tooltip_text").node().getBoundingClientRect().right-500));
            tooltip.attr("style","left:"+(d3.select("#tooltip_text").node().getBoundingClientRect().right-500)+";right:10px;");
        }
        if(d3.select("#pic_holder").node().getBoundingClientRect().top <10){
            tooltip.attr("style","top:10px;");
        }*/

        });

    /*
    //conditional in case a point has no associated text
    if (text.length > 0) {
        gpoint.append("text")
            .attr("x", x + 1)
            .attr("y", y + 1)
            .attr("class", "text")
            .style("font-size", 10)
            .text(text);

    }*/
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