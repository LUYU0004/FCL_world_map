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

var worldmap_background = "#E2E3E8";


var world_topo;


d3.json("data/topo/world-topo.json", function (error, world) {
    world_topo = topojson.feature(world, world.objects.countries).features;

    draw_worldmap();
    draw_pop_layer();
});


var offsetL,offsetT ;

//d3.select(window).on("resize", throttle);



var projection, path, svg, g, graticule;
var tooltip, one_tooltip, fcl_tooltip;

var zoom = d3.behavior.zoom().scaleExtent([1, 4])
            .on("zoom",move);


function setup() {

    offsetL = document.getElementById("map_container").offsetLeft + 10;
    offsetT = document.getElementById("map_container").offsetTop + 10;

    tooltip = d3.select("#map_container").append("div")//.attr("class", "tooltip")
        .attr("style","fill: none");

    

    fcl_tooltip = tooltip.append("div").attr("style","fill: none").attr("z-index",2);
    one_tooltip = tooltip.append("div").attr("class","tooltip").attr("style","visibility:hidden").attr("z-index",3);
    

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
        }).attr("fill", worldmap_background);



    
    country.on("mouseover", function(){ 
        return one_tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            
            return one_tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(d.properties.name);
            


    }).on("mouseout", function (d, i) {
        return one_tooltip.attr("style", "visibility: hidden");
    });

    setup_slider(1964,2014);
    
}

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
        .style("opacity",0.6);


    /*country.on("mouseover", function(){
        return one_tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            return one_tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html(d.properties.name);



        }).on("mouseout", function (d, i) {
        return one_tooltip.attr("style", "visibility: hidden");
    });*/


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
        .style("opacity",0.2);

}

function redraw_worldmap(){
    var country = g.selectAll(".country").data(this.world_topo);

    country.attr("fill",worldmap_background);

    country.on("mouseover", function(){
        return one_tooltip.attr("style","visibility: visible;borderColor: #F5F5DC");})
        .on("mousemove", function (d,i) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            return one_tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html(d.properties.name);



        }).on("mouseout", function (d, i) {
        return one_tooltip.attr("style", "visibility: hidden");
    });

}

function draw_pop_layer(){
    
    document.getElementById("pop_densityBtn").classList.toggle("selectedBtn");
    pop_layer = true;
    d3.select("#pop_densityHolder").selectAll("ul").style("height","93px");
    load_DData("pop_layer");
    
}


var callcount = 0;
function move(t,s) {
    if(t ==undefined || s== undefined){
        s = d3.event.scale ;
        t = d3.event.translate;

    }

    var tier1_scale = 2;
    var tier2_scale = 2.5;
    var tier3_scale = 3;
    var tier4_scale =3.5;
    var google_map_scale = 4;
    var tier_range = 100;
    var scale =2;


    if(s>=google_map_scale){

        if(project_layer){
            callcount++;
            console.log(callcount);
            if(callcount==1)load_google_map();

        }
    }else if(s>= tier4_scale) {

        if(project_layer&&callcount>0){
            callcount=0;
            d3.select("#google_map").remove();
        }
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
    
    
    var h = map_height / 4;

    t[0] = Math.min(
        (map_width / map_height) * (s - 1),
        Math.max(map_width * (1 - s), t[0])
    );
    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(map_height * (1 - s) - h * s, t[1])
    );

    /*//calculate the new position of one_tooltip
    var cur_trans = zoom.translate();
    var cur_sc = zoom.scale();
    var sc_ratio = s/cur_sc;
    var cur_right = one_tooltip.node().getBoundingClientRect().right;
    var cur_bottom = one_tooltip.node().getBoundingClientRect().bottom;
    var diffR = (innerWidth-cur_right-cur_trans[0])*(1-sc_ratio);
    var diffB = (innerWidth-cur_bottom-cur_trans[1])*(1-sc_ratio);


    var new_right = cur_right + diffR;
    var new_bottom = cur_bottom+diffB;
*/
    //one_tooltip.style("visibility","hidden");
   // console.log(fcl_tooltip);
    //fcl_tooltip.style("visibility","hidden");
    //fcl_tooltip.selectAll(".tooltip").style("visibility","hidden");
    //fcl_tooltip_list =[];
      //  .attr()


    one_tooltip.attr("style","visibility: hidden");
    fcl_tooltip.selectAll(".tooltip").attr("style","visibility: hidden");
    svg.attr("transform", "translate(" + t + ")scale(" + s + ")");

    /* SET NEW ZOOM POINT */
    zoom.translate(t);
    zoom.scale(s);

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
    d3.selectAll(".equator").style("stroke-width", 1/s+'px');
    d3.selectAll("graticule").style("stroke-width", 0.5/s+'px');

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
