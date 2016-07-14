/*
 * Copyright (C) 2015 ETH Zurich
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Zeng Wei (zeng@arch.ethz.ch)
 */

window.SC = {};
SC.projectNo =0;
SC.networkNo = 0;
SC.staffNo = 0;

SC.projects = [];
SC.network = [];
SC.staff = [];

SC.project_matrix = [];
SC.network_matrix = [];
SC.staff_matrix = [];
SC.layer_count = 0;
SC.layer_stack = [0,0,0]; // index 0 for pop_layer, index 1 for co2, index 2 for GDP;
//// each contains the layer stack number from 1-3, 0 stands for non-exists

var worldmap_background = "#E2E3E8";


var world_topo;

var country_pop, country_area;
var country_co2_emission;
var country_gdp;
var pop_density,co2_density,gdp_density;


d3.json("data/topo/world-topo.json", function (error, world) {
    world_topo = topojson.feature(world, world.objects.countries).features;

    var welcome = d3.select("#welcome_mask")
        .style("opacity", 0.3);
    setTimeout(function(){ welcome.remove();}, 3200);


    read_popData();


});

function read_popData(){
    d3.csv("data/fitted/country_size.csv", function (error, country_size_data) {
        d3.csv("data/fitted/population.csv", function (error, pop_data) {
            d3.csv("data/fitted/population_density.csv", function (error, pop_density_data) {

                country_pop = pop_data;
                country_area = country_size_data;
                pop_density  = pop_density_data;
                console.log("progress: read_pop");
                read_gdpData();
            });
        });

    });
}

function read_gdpData(){
    d3.csv("data/fitted/GDP.csv", function (error, gdp_data) {
        d3.csv("data/fitted/GDP_per_capita.csv", function (error, gdp_density_data) {

            country_gdp = gdp_data;
            gdp_density = gdp_density_data;
            console.log("progress: read_gdp");
            read_co2Data();
        });
    });
}

function read_co2Data(){
    d3.csv("data/raw/CO2 emissions (kt)/en.atm.co2e.kt_Indicator_en_csv_v2(edited).csv", function (error, co2_data) {
        d3.csv("data/fitted/co2_per_capita.csv",function (error, co2_density_data) {
            country_co2_emission = co2_data;
            co2_density = co2_density_data;
            console.log("progress: read_co2");
            draw_worldmap();
            draw_pop_layer();
        });
    });
}


var offsetL=10,offsetT=10 ;

var projection, path, svg, g;
//var graticule;
var tooltip, one_tooltip, country_info_tooltip, fcl_tooltip,country_chart_tooltip;

var zoom;

var maxlat = 83;
var scaleExtent;
function setup() {

    offsetL = document.getElementById("map_container").offsetLeft + 10;
    offsetT = document.getElementById("map_container").offsetTop + 10;

    tooltip = d3.select("#map_container").append("div")//.attr("class", "tooltip")
        .attr("style","fill: none");

    

    fcl_tooltip = tooltip.append("div").attr("style","fill: none").attr("z-index",2);
    one_tooltip = tooltip.append("div").attr("class","tooltip").attr("style","visibility:hidden").attr("z-index",4);

    country_chart_tooltip = tooltip.append("div").attr("class","tooltip")
        .attr("id","chart_tooltip")
        .attr("style","visibility:hidden;display:inline;background-color:white")
        .attr("z-index",2)
        .on("mousedown",function(){
            country_chart_tooltip.style("visibility","visible");
            mydragg_L.startMoving("chart_tooltip","content_holder",event)
        }).on("mouseup",function(){
            country_chart_tooltip.style("visibility","visible");
            mydragg_L.stopMoving("content_holder");
        });

    country_chart_tooltip.append("span")
        .attr("class","close")
        .html("x")
        .on("click",function(){
            //close
            country_chart_tooltip.style("visibility","hidden");
        });

    country_info_tooltip = tooltip.append("div").attr("class","tooltip").attr("style","visibility:hidden").attr("z-index",4);

    //<span class="close" onclick="close_modal()">×</span>
    //graticule = d3.geo.graticule();
    
    projection = d3.geo.mercator()
        //.center()
        .rotate( [0,0] )
       //.center( [0, 42.313] )
        .scale(1)//map_width /2/Math.PI
        .translate([(map_width / 2), (map_height / 2)]);

    // set up the scale extent and initial scale for the projection
    var b = mercatorBounds(projection, maxlat),
        s = map_width/(b[1][0]-b[0][0]);

    scaleExtent = [s, 10*s];

    projection
        .scale(scaleExtent[0]);

    zoom= d3.behavior.zoom()
        .scaleExtent(scaleExtent)
        .scale(projection.scale())
        .translate([0,0])               // not linked directly to projection
        .on("zoom", move);
    /*= d3.behavior.zoom().scaleExtent([1, 4])
     .translate([0,0])
     .on("zoom",move);*/

    path = d3.geo.path().projection(projection);
    

    svg = d3.select("#map_container").append("svg")
        .attr("id","svg1")
        .attr("width",map_width )
        .attr("height",map_height)
        .call(zoom)
        .on("click", click)
        .append("g");

    g = svg.append("g").attr("id","country_holder");








}

// find the top left and bottom right of current projection
function mercatorBounds(projection, maxlat) {
    var yaw = projection.rotate()[0],
        xymax = projection([-yaw+180-1e-6,-maxlat]),
        xymin = projection([-yaw-180+1e-6, maxlat]);

    return [xymin,xymax];
}

function draw_worldmap() {

    removeAllChild();
    setup();

    //svg.append("path").datum(graticule).attr("class", "graticule").attr("d", path);

    /*svg.append("path").datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
        .attr("class", "equator")
        .attr("d", path);*/


    var tooltip_info = {};

    var country = g.selectAll(".country").data(this.world_topo);


    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        .attr("id", function (d, i) {
            return d.id;
        })
        .attr("title", function (d, i) {
            return d.properties.name;
        }).attr("fill", worldmap_background);

   /* g.selectAll(".country-label")
        .data(this.world_topo)
        .enter().append("text")
        .attr("class", "country-label")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.properties.name; });*/

    /*d3.select("#map_container").append("svg")
        .attr("id","svg2")
        .attr("width",map_width )
        .attr("height",map_height)
        .append("use")
        //.attr("transform","translate("+map_width+",0)skewY(180)")
        .attr("xlink:href","#svg1");

/*<svg width="100" height="100">
        <use transform="scale(0.1)" xlink:href="#SVG1"/>
        </svg>*/

    setup_slider(1964,2014);

    console.log("progress: draw_worldmap");
    
}

/* to draw the different layers of country shapes*/
function draw_pop_country() {
    
    var country = g.append("g").attr("id","pop_countries")
                    .attr("class","pop_layer").selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        /*.attr("id", function (d, i) {
            return d.id;
        })
        .attr("title", function (d, i) {
            return d.properties.name;
        })*/.attr("fill", worldmap_background)
        .style("opacity",function(){
            var res = 0.8-0.2*SC.layer_count;
            return res;
        });

}

function draw_co2_country() {

    var country = g.append("g").attr("id","co2_countries")
        .attr("class","co2_layer").selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        /*.attr("id", function (d, i) {
         return d.id;
         })
         .attr("title", function (d, i) {
         return d.properties.name;
         })*/.attr("fill", worldmap_background)
        .style("opacity",function(){
            var res = 0.8-0.2*SC.layer_count;
            return res;
        });

}

function draw_gdp_country() {

    var country = g.append("g").attr("id","gdp_countries")
        .attr("class","gdp_layer").selectAll(".country").data(this.world_topo);

    country.enter().insert("path").attr("class", "country")
        .attr("d", path)
        .attr("fill", worldmap_background)
        .style("opacity",function(){
            var res = 0.8-0.2*SC.layer_count;
            return res;
        });

}

/* to redraw world map upon close of all three color layer*/
function redraw_worldmap(){
    var country = g.selectAll(".country").data(this.world_topo);

    country.attr("fill",worldmap_background);

    country.on("mouseover", function(d){
        /*return country_info_tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            var scale = zoom.scale();
            var t =zoom.translate();

            var left = mouse[0]*scale + t[0]+offsetL;
            var top = mouse[1]*scale + t[1]+offsetT;


            return country_info_tooltip.attr("style", "left:" + left + "px;top:" + top + "px")
                .html(d.properties.name);
*/



        var left =d3.event.pageX+offsetL;
        var top = d3.event.pageY+offsetT;

        country_info_tooltip
            .style("visibility","visible")
            .style("left", (left ) + "px")
            .style("top", (top) + "px")
            .html(d.properties.name);

        }).on("mousemove",function(){


        var left =d3.event.pageX+offsetL;
        var top = d3.event.pageY+offsetT;

        country_info_tooltip
            .style("left", (left ) + "px")
            .style("top", (top) + "px");

    }).on("mouseout", function (d, i) {
        return country_info_tooltip.attr("style", "visibility: hidden");

    });
}

/*to use for initializing the population density display at the first open of the map */
function draw_pop_layer(){
    document.getElementById("pop_densityBtn").classList.toggle("selectedBtn");
    pop_layer = true;
    d3.select("#pop_densityHolder").selectAll("ul").style("height","93px");
    console.log("progress: draw_pop_layer!");
    SC.layer_count++;
    SC.layer_stack[0]=SC.layer_count;
    load_DData("pop_layer");

}


// track last translation and scale event we processed
var tlast = [0,0],
    slast = null;

//to handle transform of svg elements on zoom
function move(t,s) {
    if(t ==undefined || s== undefined){
        s = d3.event.scale ;
        t = d3.event.translate;
    }
    
    // if scaling changes, ignore translation (otherwise touch zooms are weird)
    if (s != slast) {
        projection.scale(s);
    } else {
        var dx = t[0]-tlast[0],
            dy = t[1]-tlast[1],
            yaw = projection.rotate()[0],
            tp = projection.translate();

        // use x translation to rotate based on current scale
        projection.rotate([yaw+360.*dx/map_width*scaleExtent[0]/s, 0, 0]);
        // use y translation to translate projection, clamped by min/max
        var b = mercatorBounds(projection, maxlat);
        if (b[0][1] + dy > 0) dy = -b[0][1];
        else if (b[1][1] + dy < map_height) dy = map_height-b[1][1];
        projection.translate([tp[0],tp[1]+dy]);
    }
    // save last values.  resetting zoom.translate() and scale() would
    // seem equivalent but doesn't seem to work reliably?
    slast = s;
    tlast = t;



svg.selectAll('path')       // re-project path data
    .attr('d', path);

    /* SET NEW ZOOM POINT */
    //svg.attr("transform", "translate(" + t + ")scale(" + s + ")");
    //zoom.translate(t);
    //zoom.scale(s);


    //redraw the points
    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale =3.5;
    var google_map_scale = 4;
    var tier_range = 100;
    var scale =2;


    if(s>=google_map_scale){

        if(project_layer){
            //callcount++;
            //console.log(callcount);
            //if(callcount==1)load_google_map();

        }
    }else if(s>= tier4_scale) {

        /*if(project_layer&&callcount>0){
            callcount=0;
            d3.select("#google_map").remove();
        }*/
        tier_range = 3;
        scale = tier4_scale;
        svg.selectAll(".items").remove();
        if(project_layer)find_last_tier(tier_range,scale,'project_layer');
        if(network_layer)find_last_tier(tier_range,scale,'network_layer');
        if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');
       
    }else if(s>=tier3_scale){
        
        tier_range=5;
        scale = tier3_scale;
        svg.selectAll(".items").remove();
        if(project_layer)find_last_tier(tier_range,scale,'project_layer');
        if(network_layer)find_last_tier(tier_range,scale,'network_layer');
        if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

    }else if(s>=tier2_scale){
        tier_range = 25;
        scale = tier2_scale;
        svg.selectAll(".items").remove();
        if(project_layer)find_last_tier(tier_range,scale,'project_layer');
        if(network_layer)find_last_tier(tier_range,scale,'network_layer');
        if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

    }else if(s>=tier1_scale){
        
        tier_range = 50 ;
        scale = tier1_scale;
        svg.selectAll(".items").remove();
        if(project_layer)find_last_tier(tier_range,scale,'project_layer');
        if(network_layer)find_last_tier(tier_range,scale,'network_layer');
        if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');

    }else{

        tier_range = 100 ;
        scale = 1;
        svg.selectAll(".items").remove();
        if(project_layer)find_last_tier(tier_range,scale,'project_layer');
        if(network_layer)find_last_tier(tier_range,scale,'network_layer');
        if(staff_layer)find_last_tier(tier_range,scale,'staff_layer');
    }
    
    
    /*var h = map_height / 4;

    t[0] = Math.min(
        (map_width / map_height) * (s - 1),
        Math.max(map_width * (1 - s), t[0])
    );
    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(map_height * (1 - s) - h * s, t[1])
    );*/


    fcl_tooltip_list =[];

    one_tooltip.attr("style","visibility: hidden");
    fcl_tooltip.selectAll(".tooltip").attr("style","visibility: hidden");






    d3.selectAll(".point")
        .style("stroke-width", 0.5/s+'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit*d["area"]/Math.PI)/s;
        });

    d3.selectAll(".cluster")
        .style("stroke-width", 0.5/s+'px')
        .attr("r", function (d) {
            return Math.sqrt(area_unit*d["area"]/Math.PI)/s;
        });


    //cg_g.remove();
    svg.selectAll(".zoomable").remove();



    //adjust the country hover stroke map_width based on zoom level
    d3.selectAll(".country").style("stroke-map_width", 1.5 / s);
    d3.selectAll(".text").style("font-size", 20 / s);
    //d3.selectAll(".equator").style("stroke-width", 1/s+'px');
    // d3.selectAll("graticule").style("stroke-width", 0.5/s+'px');



}


/*
var throttleTimer;

function throttle() {
    window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function () {
        draw_worldmap(this.world_topo);
    }, 200);
}*/



function click() {
    projection.invert(d3.mouse(this));
}




function removeAllChild(){

    d3.selectAll(".extra_info").remove();

    var map_container = document.getElementById("map_container");
    while (map_container.firstChild) {
        map_container .removeChild(map_container.firstChild);
    }
    
}
