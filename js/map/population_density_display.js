/**
 * Created by yuhao on 18/5/16.
 */

var color_split1,color_split2,color_split3;
var colors1 = ["#0F1F8A","#19215C","#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF"];
var colors2 = ["#6B0707","#940707","#AE0B0B", "#D91313", "#FB3D3D", "#F95454", "#F37777", "#F4B5B5", "#F2D7D7"];
var colors3 = ["#2EB043","#69A155","#57ED00","#63F714", "#94FF63","#A8FF87", "#C4FFAB","#DAFAD9"];//["#69FF1C","#5DE117","#57ED00","#63F714", "#94FF63","#A8FF87", "#C4FFAB"];//A8FF87

var status =0; //play(1) or stop(0 ) for the time_slider
var range1 ;
var range2 ;
var range3;

/*load_countrySize_and_property */
function load_DData(_category){
    

    switch(_category){
        case "pop_layer":                   //if(SC.layer_count>0)adjust_opacity(_category);
                                            color_split1 = [1000, 500, 400, 300, 200, 100, 50, 10, 0];//max_property=1000;
                                            draw_pop_country();
                                           
                                            display_Density1(1964); //read_popData();
                                            draw_colorSlider_1('pop_layer');
                                            break;
        
        case "co2_layer":                       //if(SC.layer_count>0)adjust_opacity(_category);
                                                color_split2 =[100,50, 20, 10, 5, 1, 0.1, 0];//max_property=100;
                                                draw_co2_country();
                                                display_Density2(1964);//read_co2Data();
                                                draw_colorSlider_2('co2_layer');
                                                break;
        case "gdp_layer":          //if(SC.layer_count>0)adjust_opacity(_category);
                                color_split3 = [100000,75000,50000, 10000, 5000, 1000, 500, 0];
                                 draw_gdp_country();
                                display_Density3(1964);//read_co2Data();
                                draw_colorSlider_3('gdp_layer');
                                    break;

        case "project_layer":        //remove_layer();
                                    draw_project_legend('project_layer');
                                   generate_project_DistMatrix();
                                        break;

        case "network_layer":      draw_project_legend('network_layer');
                                    generate_network_DistMatrix();
                                    break;
        
        case "staff_layer":      draw_project_legend('staff_layer');
                                    generate_staff_DistMatrix();
                                    break;
        default: break;
    }

}

function adjust_opacity(_cat){
    switch(_cat){
        case 'pop_layer':
                        break;
        case 'co2_layer':break;
        case'gdp_layer':break;
        default: break;
    }
}


/*create or update population density on map*/
function display_Density1(cur_year){

    if(range1 ==undefined){
        range1 = [];
        range1[0] = 0;
        range1[1] = color_split1.length;
    }
    var ticks = color_split1;
    var min = range1[0];
    var max = range1[1];

    var densityMultiplier = 1;

    /*modify colors of each countries based on population density*/
    var countries  = g.select("#pop_countries").selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;

        var country_properties = find_country_pop(name);
        var country_size = find_country_area(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size*densityMultiplier;

            if(density>=color_split1[min] && density<color_split1[max]) {


                for (var index = 0; index < color_split1.length; index++) {
                    if (density >= color_split1[index]) {

                        return colors1[index];
                    }
                }

                return colors1[1];
            }else{
                return worldmap_background;
            }
        } else {
            return worldmap_background; //
        }

    }).on("mousemove",null);

    /*modify tooltip to add in info about population and country size*/
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;


    countries
        .on("mouseover",function (d) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });


            var name = d.properties.name;
            var country_properties = find_country_pop(name);
            var year_property = country_properties[0][cur_year];
            var country_size = find_country_area(name);
            var cur_country_size = country_size[0][cur_year];

            if (country_properties.length > 0 && country_size.length > 0) {

                var density = year_property / cur_country_size * densityMultiplier;
                var density_unit;

                cur_country_size = cur_country_size + ' (sq.km)';
                density_unit = ' people per (sq.km)';

                var format = d3.format(',.02f');

                country_info_tooltip
                    .html("<div>|<b>"+d.properties.name + "</b><br>|<b>" + "Population Density :</b>"
                        + format(year_property / 1000000) + "M people<br>|<b>Size:</b>" + cur_country_size + "<br>|<b>Density:</b>"
                        + density+density_unit+"</div>");

                var left_adjust = zoom.translate()[0];
                var top_adjust = zoom.translate()[1];
                var scale = zoom.scale();

                var left = mouse[0];//mouse[0]*scale + offsetL+left_adjust;
                var top = mouse[1];//*scale + offsetT+top_adjust;

                return country_info_tooltip.attr("style", "right:"+(innerWidth - left)+"px;bottom:"+(innerHeight - top)+"px;visibility: visible;");

            }else{
                return country_info_tooltip.attr("style", "right:" + (innerWidth-mouse[0] - offsetL) + "px;bottom:" + (innerHeight - mouse[1] - offsetT) + "px;visibility:visible")
                    .html(d.properties.name);
            }
        })
        .on("mousemove", function (d,i) {

            var left_adjust = zoom.translate()[0];
            var top_adjust = zoom.translate()[1];
            var scale = zoom.scale();
            
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

                var left = mouse[0]*scale + offsetL+left_adjust;
                var top = mouse[1]*scale + offsetT+top_adjust;
                var window_margin = 16;
                var buffer = 5;

                var tooltip_right = country_info_tooltip.node().getBoundingClientRect().width + left;
                var window_right = innerWidth - window_margin - buffer;

                if(tooltip_right > window_right){

                    var tooltip_Width = 275;

                    left = mouse[0]-tooltip_Width-offsetL  ;

                }

                var tooltip_height = country_info_tooltip.node().getBoundingClientRect().height;

                var tooltip_bottom = top+tooltip_height;

                if(tooltip_bottom> (window.innerHeight-window_margin)){
                    top = mouse[1]-tooltip_height-offsetT;
                }

                return country_info_tooltip.attr("style","left:"+ left+"px;top:"+top+"px;visibility: visible;");



    }).on("mouseout", function (d, i) {
        looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    });

}


/*draw co2 emission per capita on map*/
function display_Density2(cur_year){

    if(range2 ==undefined){
        range2 = [];
        range2[0] = 0;
        range2[1] = color_split2.length;
    }
    
    var min = range2[0];
    var max = range2[1];

    var densityMultiplier = 1000;

    /*modify colors of each countries based on co2 density*/
    var countries  = g.select("#co2_countries").selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;

        var country_properties = find_country_co2(name);
        var country_size = find_country_pop(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size*densityMultiplier;

            if(density>=color_split2[min] && density<color_split2[max]) {


                for (var index = 0; index < color_split2.length; index++) {
                    if (density >= color_split2[index]) {

                        return colors2[index];
                    }
                }

                return colors2[1];
            }else{
                return worldmap_background;
            }
        } else {
            return worldmap_background; //
        }

    });/*.on("mousemove",null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;


    countries
        .on("mouseover",function (d) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });


            var name = d.properties.name;
            var country_properties = find_country_co2(name);
            var year_property = country_properties[0][cur_year];
            var country_size = find_country_pop(name);
            var cur_country_size = country_size[0][cur_year];

            if (country_properties.length > 0 && country_size.length > 0) {

                var density = year_property / cur_country_size * densityMultiplier;
                var density_unit;

                cur_country_size = cur_country_size +' people';
                density_unit = ' tons per person';


                var format = d3.format(',.02f');

                country_info_tooltip
                    .html("<div>|<b>"+d.properties.name + "</b><br>|<b> CO2 Emission :</b>"
                        + format(year_property) + " K tons<br>|<b>Size:</b>" + cur_country_size + "<br>|<b>Density:</b>"
                        + density+density_unit+"</div>");

                var left_adjust = zoom.translate()[0];
                var top_adjust = zoom.translate()[1];
                var scale = zoom.scale();

                var left = mouse[0]*scale + offsetL+left_adjust;
                var top = mouse[1]*scale + offsetT+top_adjust;

                return country_info_tooltip.attr("style", "right:"+(innerWidth - left)+"px;bottom:"+(innerHeight - top)+"px;visibility: visible;");

            }else{
                return country_info_tooltip.attr("style", "right:" + (innerWidth-mouse[0] - offsetL) + "px;bottom:" + (innerHeight - mouse[1] - offsetT) + "px;visibility:visible")
                    .html(d.properties.name);
            }
        })
        .on("mousemove", function (d,i) {

            var left_adjust = zoom.translate()[0];
            var top_adjust = zoom.translate()[1];
            var scale = zoom.scale();

            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            var left = mouse[0]*scale + offsetL+left_adjust;
            var top = mouse[1]*scale + offsetT+top_adjust;
            var window_margin = 16;
            var buffer = 5;

            var tooltip_right = country_info_tooltip.node().getBoundingClientRect().width + left;
            var window_right = innerWidth - window_margin - buffer;

            if(tooltip_right > window_right){

                var tooltip_Width = 275;

                left = mouse[0]-tooltip_Width-offsetL  ;

            }

            var tooltip_height = country_info_tooltip.node().getBoundingClientRect().height;

            var tooltip_bottom = top+tooltip_height;

            if(tooltip_bottom> (window.innerHeight-window_margin)){
                top = mouse[1]-tooltip_height-offsetT;
            }

            return country_info_tooltip.attr("style","left:"+ left+"px;top:"+top+"px;visibility: visible;");



        }).on("mouseout", function (d, i) {
        looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    });
    */

}


/*draw co2 emission per capita on map*/
function display_Density3(cur_year){

    if(range3 ==undefined){
        range3 = [];
        range3[0] = 0;
        range3[1] = color_split3.length;
    }

    var min = range3[0];
    var max = range3[1];

    var densityMultiplier = 1;

    /*modify colors of each countries based on co2 density*/
    var countries  = g.select("#gdp_countries").selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;

        var country_properties = find_country_gdp(name);
        var country_size = find_country_pop(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size*densityMultiplier;

            if(density>=color_split3[min] && density<color_split3[max]) {


                for (var index = 0; index < color_split3.length; index++) {
                    if (density >= color_split3[index]) {

                        return colors3[index];
                    }
                }

                return colors3[1];
            }else{
                return worldmap_background;
            }
        } else {
            return worldmap_background; //
        }

    });
/*.on("mousemove",null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;


    countries
        .on("mouseover",function (d) {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });


            var name = d.properties.name;
            var country_properties = find_country_gdp(name);
            if(country_properties.length<=0) console.log(name);
            var year_property = country_properties[0][cur_year];
            var country_size = find_country_pop(name);
            var cur_country_size = country_size[0][cur_year];

            if (country_properties.length > 0 && country_size.length > 0) {

                var density = year_property / cur_country_size * densityMultiplier;
                var density_unit;

                cur_country_size = cur_country_size +' people';
                density_unit = ' US dollar per person';


                var format = d3.format(',.02f');

                country_info_tooltip
                    .html("<div>|<b>"+d.properties.name + "</b><br>|<b> GDP :</b>"
                        + format(year_property) + " US dollars<br>|<b>Size:</b>" + cur_country_size + " people<br>|<b>Density:</b>"
                        + density+density_unit+"</div>");

                var left_adjust = 0//zoom.translate()[0];
                var top_adjust = 0//zoom.translate()[1];
                var scale = zoom.scale();

                var left = mouse[0];//mouse[0]*scale + offsetL+left_adjust;
                var top = mouse[1]//*scale + offsetT+top_adjust;

                return country_info_tooltip.attr("style", "right:"+(innerWidth - left)+"px;bottom:"+(innerHeight - top)+"px;visibility: visible;");

            }else{
                return country_info_tooltip.attr("style", "right:" + (innerWidth-mouse[0] - offsetL) + "px;bottom:" + (innerHeight - mouse[1] - offsetT) + "px;visibility:visible")
                    .html(d.properties.name);
            }
        })
        .on("mousemove", function (d,i) {

            var left_adjust = zoom.translate()[0];
            var top_adjust = zoom.translate()[1];
            var scale = zoom.scale();

            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });

            var left = mouse[0]*scale + offsetL+left_adjust;
            var top = mouse[1]*scale + offsetT+top_adjust;
            var window_margin = 16;
            var buffer = 5;

            var tooltip_right = country_info_tooltip.node().getBoundingClientRect().width + left;
            var window_right = innerWidth - window_margin - buffer;

            if(tooltip_right > window_right){

                var tooltip_Width = 275;

                left = mouse[0]-tooltip_Width-offsetL  ;

            }

            var tooltip_height = country_info_tooltip.node().getBoundingClientRect().height;

            var tooltip_bottom = top+tooltip_height;

            if(tooltip_bottom> (window.innerHeight-window_margin)){
                top = mouse[1]-tooltip_height-offsetT;
            }

            return country_info_tooltip.attr("style","left:"+ left+"px;top:"+top+"px;visibility: visible;");



        }).on("mouseout", function (d, i) {
        looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    });

    */

}


function find_country_co2(country_name) {

    var m =  country_co2_emission.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_country_gdp(country_name) {

    var m =  country_gdp.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}


function find_country_pop(country_name) {

    if(country_pop==undefined)
        console.log(country_name);
    var m =  country_pop.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_country_area(country_name){

    var m = country_area.filter(function (f){
        return f.Country_Name == country_name;
    });

    return m;
}


function remove_layer(className){
    if(className ==undefined) className = ".extra_info";
    var extra_info= d3.selectAll(className);
    extra_info.remove();
}


/*
 function formatNum_pop(num) {
 var format = d3.format(',.02f');

 return format(num / 1000000) + ' M people';
 }

 function formatNum_co2(num) {
 var format = d3.format(',.02f');

 return format(num) + ' K tons';
 }

 Add color legend to extra_layer

function draw_legend(max_property,className) {

    var wBox = 190,
        hBox = 100;

    var steps = color_split1.length,
        hRect = 15,
        offsetY = 30;

    var wRect = wBox / steps,
        offsetText = wRect / 2;

    var body;
    var unit_text;

    switch(className){
        case 'pop_layer': body = d3.select("#pop_densityHolder").selectAll("li").append("div");
            unit_text = "People per sq.km";
            break;
        case 'co2_layer': body = d3.select("#co2_emissionHolder").selectAll("li").append("div");
            unit_text = "Tons per person";
            break;
        default: break;
    }

    var color_legend = body
        .attr("class","legend "+className);

    var svg = color_legend
        .attr("z-index", 40)
        .append("svg")
        .attr("width", wBox+20)
        .attr("height", hBox)
        .append("g");

    var legend = svg
        .append('g')  //svg.append('g')    //add the legend to extra_info.svg.g
        .attr('width', wBox)
        .attr('height', hBox);


    var sg = legend.append('g')
        .attr('transform', "translate(2,15)");

    var partial_colors = colors1.slice(0, color_split.length);

    sg.selectAll('rect').data(partial_colors ).enter().append('rect')
        .attr('x', function (d, i) {
            return i * wRect;
        })
        .attr('y', offsetY)
        .attr('fill', function (d, i) {
            return colors1[i];
        }).attr('width', wRect).attr('height', hRect);



    console.log(partial_colors);
    // Draw color scale labels.
    sg.selectAll('text').data(partial_colors).enter()
        .append('text')
        .text(function (d, i) {
            return color_split[i];
        }).attr('class', function (d, i) {
        return 'text-' + i;
    }).attr('x', function(d,i){
        return (i+1) * wRect;})
        .attr('y', offsetY+hRect+ offsetText);

    //Draw label for end of extent.
    sg.append('text').text(function () {
        //var text = formatNum(max_population);
        return max_property;

    }).attr('x', 0).attr('y', offsetY-3);

    sg.append('text').text(unit_text).attr('x', 2).attr('y', function(){
        return 0;
    });

}
*/
