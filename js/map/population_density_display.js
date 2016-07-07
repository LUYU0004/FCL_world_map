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



    /*modify colors of each countries based on population density*/
    var countries  = g.select("#pop_countries").selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;

        var country_properties = find_country_pop(name);
        var country_size = find_country_area(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size;

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

    var color_layer_count = 0;
    var undefined_count =0;
    var xy_pop_data;
    var xy_co2_data;
    var xy_gdp_data;

    countries
        .on("mouseover",function (d) {

            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;
            undefined_count =0;

            var format = d3.format(',.02f');

            //this layer is pop_layer
            var name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>"+name+"</b><br>";

            var pop_properties = find_country_pop(name);
            xy_pop_data = [];
            xy_pop_data = convertToxy(name,'pop_layer');

            var year_pop = pop_properties[0][cur_year];
            var  country_properties= find_country_area(name);
            var year_area = country_properties[0][cur_year];

            color_layer_count++;

            if (year_pop.length > 0 && year_area.length > 0) {

                var density = year_pop / year_area * popMultiplier;

                tooltip_content +="<br><div><b>" + "Population in Total: </b>"
                    + format(year_pop / 1000000) + " M people<br><b>Area: </b>" + year_area + " (sq.km)<br><b>Population Density: </b>"
                    + format(density)+" people per (sq.km)</div><br><hr>";


            }else{
                tooltip_content +="<br>Population Density:  undefined<br><hr>";
                undefined_count++;
            }

            //check whether the other two layers are selected
            if(co2_layer){
                color_layer_count++;

                var co2_properties = find_country_co2(name);
                xy_co2_data = convertToxy(name,'co2_layer');
                var year_co2 = co2_properties[0][cur_year];

                if (year_co2.length > 0 && year_pop.length > 0) {

                    density = year_co2 / year_pop * co2Multiplier;

                    tooltip_content +="<br><div><b>" + "CO2 Emission in Total: </b>"
                        + format(year_co2) + " K tons<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>CO2 Emission Density: </b>"
                        + format(density)+" tons per person</div><br><hr>";

                }else{
                    tooltip_content +="<br>CO2 Density:  undefined<br><hr>";
                    undefined_count++;
                }
            }

            if(gdp_layer){
                color_layer_count++;

                var gdp_properties = find_country_co2(name);

                xy_gdp_data = convertToxy(name,'gdp_layer');
                var year_gdp = gdp_properties[0][cur_year];

                if (year_gdp.length > 0 && year_pop.length > 0) {

                    density = year_gdp / year_pop * gdpMultiplier;

                    tooltip_content +="<br><div><b>" + "GDP in Total:</b>"
                        + format(year_gdp) + " US$<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>GDP per capita: </b>"
                        + format(density)+" US$ per person</div><br><hr>";

                }else{
                    undefined_count++;
                    tooltip_content +="<br>GDP:  undefined<br><hr>";
                }

            }




            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;

            country_info_tooltip
                .html(tooltip_content)
                .style("visibility","visible")
                .style("left", left + "px")
                .style("top", top + "px");

        })
        .on("mousemove", function (d,i) {
            
            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;


            var width = 338;
            var height = 44+(color_layer_count-undefined_count)*100+undefined_count*40;
            if(left+width>innerWidth){
                left = left-2*offsetL-width;
            }

            if(height+top > innerHeight){
                  top =  top-2* offsetT - height;
            }


            country_info_tooltip
            .style("left", left  + "px")
                .style("top", top + "px");

        })
        .on("mouseout", function (d, i) {
            //looptime = 0;
            return country_info_tooltip.attr("style", "visibility: hidden");})

        .on("click",function(d,i){
            draw_charts(xy_pop_data,xy_co2_data,xy_gdp_data);
            country_chart_tooltip.style("visibility","visible");;
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

    }).on("mousemove",null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;
    var color_layer_count = 0;
    var undefined_count =0;


    countries
        .on("mouseover",function (d) {

            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;
            undefined_count =0;


            var format = d3.format(',.02f');

            //this layer is pop_layer
            var name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>"+name+"</b><br>";

            var co2_properties = find_country_co2(name);
            var year_co2 = co2_properties[0][cur_year];
            var  pop_properties= find_country_pop(name);
            var year_pop = pop_properties[0][cur_year];

            color_layer_count++;

            if (year_pop.length > 0 && year_co2.length > 0) {

                var density = year_co2 / year_pop * co2Multiplier;

                tooltip_content +="<br><div><b>" + "CO2 Emission in Total: </b>"
                    + format(year_co2) + " K tons<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>CO2 Emission Density: </b>"
                    + format(density)+" tons per person</div><br><hr>";

            }else{
                tooltip_content +="<br>Population Density:  undefined<br><hr>"
                undefined_count++;
            }

            //check whether the other two layers are selected
            if(pop_layer){
                color_layer_count++;

                var  country_area= find_country_area(name);
                var year_area = country_area[0][cur_year];


                if (year_area.length > 0 && year_pop.length > 0) {

                    density = year_pop / year_area * popMultiplier;

                    tooltip_content +="<br><div><b>" + "Population in Total: </b>"
                        + format(year_pop / 1000000) + " M people<br><b>Area: </b>" + year_area + " (sq.km)<br><b>Population Density: </b>"
                        + format(density)+" people per (sq.km)</div><br><hr>";
                }else{
                    tooltip_content +="<br>CO2 Density:  undefined<br><hr>";
                    undefined_count++;
                }
            }

            if(gdp_layer){
                color_layer_count++;

                var gdp_properties = find_country_co2(name);
                var year_gdp = gdp_properties[0][cur_year];

                if (year_gdp.length > 0 && year_pop.length > 0) {

                    density = year_gdp / year_pop * gdpMultiplier;

                    tooltip_content +="<br><div><b>" + "GDP in Total:</b>"
                        + format(year_gdp) + " US$<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>GDP per capita: </b>"
                        + format(density)+" US$ per person</div><br><hr>";

                }else{
                    undefined_count++;
                    tooltip_content +="<br>GDP:  undefined<hr>";
                }

            }


            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;

            country_info_tooltip
                .html(tooltip_content)
                .style("visibility","visible")
                .style("left", left + "px")
                .style("top", top + "px");
        })
        .on("mousemove", function (d,i) {

            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;

            var width = 338;
            var height = 44+(color_layer_count-undefined_count)*100+undefined_count*40;
            if(left+width>innerWidth){
                left = left-2*offsetL-width;
            }

            if(height+top > innerHeight){
                top =  top-2* offsetT - height;
            }


            country_info_tooltip
                .style("left", left  + "px")
                .style("top", top + "px");


        }).on("mouseout", function (d, i) {
        looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    });


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

    }).on("mousemove",null);

    //modify tooltip to add in info about population and country size
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;

    var color_layer_count = 0;
    var undefined_count =0;


    countries
        .on("mouseover",function (d) {
            var popMultiplier = 1;
            var co2Multiplier = 1000;
            var gdpMultiplier = 1;

            color_layer_count = 0;
            undefined_count =0;


            var format = d3.format(',.02f');

            //this layer is pop_layer
            var name = d.properties.name;
            var tooltip_content = "<b style='font-size:20px'>"+name+"</b><br>";

            var gdp_properties = find_country_co2(name);
            var year_gdp = gdp_properties[0][cur_year];
            var  pop_properties= find_country_pop(name);
            var year_pop = pop_properties[0][cur_year];

            color_layer_count++;

            if (year_gdp.length > 0 && year_pop.length > 0) {

                density = year_gdp / year_pop * gdpMultiplier;

                tooltip_content +="<br><div><b>" + "GDP in Total:</b>"
                    + format(year_gdp) + " US$<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>GDP per capita: </b>"
                    + format(density)+" US$ per person</div><hr>";

            }else{
                tooltip_content +="<br>GDP:  undefined<hr>";
                undefined_count++;
            }

            //check whether the other two layers are selected
            if(pop_layer){
                color_layer_count++;

                var  country_area= find_country_area(name);
                var year_area = country_area[0][cur_year];


                if (year_area.length > 0 && year_pop.length > 0) {

                    density = year_pop / year_area * popMultiplier;

                    tooltip_content +="<br><div><b>" + "Population in Total: </b>"
                        + format(year_pop / 1000000) + " M people<br><b>Area: </b>" + year_area + " (sq.km)<br><b>Population Density: </b>"
                        + format(density)+" people per (sq.km)</div><hr>";
                }else{
                    tooltip_content +="<br>CO2 Density:  undefined<hr>";
                    undefined_count++;
                }
            }

            if(co2_layer){
                color_layer_count++;
                var co2_properties = find_country_co2(name);
                var year_co2 = co2_properties[0][cur_year];

                if (year_pop.length > 0 && year_co2.length > 0) {

                    var density = year_co2 / year_pop * co2Multiplier;

                    tooltip_content +="<br><div><b>" + "CO2 Emission in Total: </b>"
                        + format(year_co2) + " K tons<br><b>Population: </b>" + format(year_pop/1000000) + " M people<br><b>CO2 Emission Density: </b>"
                        + format(density)+" tons per person</div><hr>";

                }else{
                    tooltip_content +="<br>Population Density:  undefined<hr>";
                    undefined_count++;
                }

            }


            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;

            country_info_tooltip
                .html(tooltip_content)
                .style("visibility","visible")
                .style("left", left + "px")
                .style("top", top + "px");
        })
        .on("mousemove", function (d,i) {

            var left =d3.event.pageX+offsetL;
            var top = d3.event.pageY+offsetT;
            var width = 338;
            var height = 44+(color_layer_count-undefined_count)*77+undefined_count*40;
            if(left+width>innerWidth){
                left = left-2*offsetL-width;
            }

            if(height+top > innerHeight){
                top =  top-2* offsetT - height;
            }


            country_info_tooltip
                .style("left", left  + "px")
                .style("top", top + "px");



        }).on("mouseout", function (d, i) {
        looptime = 0;
        return country_info_tooltip.attr("style", "visibility: hidden");
    });



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

/*convert the csv objects into a plottable array,
year as x axis, property as y axis*/
function convertToxy(country_name,layer){

    var data;
    var factor = 1;
    switch(layer){
        case 'pop_layer': data = pop_density;
            factor=1;
            break;
        case 'co2_layer': data = co2_density;break;
        case 'gdp_layer': data = gdp_density;break;
        default:        data = pop_density; break;
    }



                var property =  data.filter(function (f) {
                    return f.Country_Name == country_name;
                });

                var start_year = 1960;
                var end_year = 2016;
                var xyObjArr = [];
                var Obj = {};

                if(property != undefined && property.length>0){
                    for(var i=start_year;i<=end_year;i++){
                        var value = property[0][i] ;
                        if(value!=undefined && value.length>0){
                            Obj["year"] = i;
                            Obj["value"] = Number(value)/factor;
                            xyObjArr.push(Obj);
                            Obj = {};
                        }
                    }
                }

                return xyObjArr;



}


/*draw the point charts for each country, onclick*/
function draw_charts(xy_pop_data, xy_co2_data, xy_gdp_data){

    console.log(xy_pop_data);
    console.log(xy_co2_data);
    console.log(xy_gdp_data);

    // Set the dimensions of the canvas / graph
    var margin = {top: 10, right: 10, bottom: 30, left: 40},
        width = 400 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var formatAxis = d3.format("  0");

    var xAxis = d3.svg.axis().scale(x)
        .tickFormat(formatAxis)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .tickFormat(formatAxis)
        .ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(v) { return x(v.year); })
        .y(function(v) { return y(v.value); });

    var total_width = width + margin.left + margin.right;
    var count = 0;
//////////////////////////needs for each chart

    if(pop_layer) {


        // Adds the svg canvas
        var svg = country_chart_tooltip
            .append("svg")
            .attr("class", "point-chart")
            .attr("width", total_width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + (margin.left+total_width*count) + "," + margin.top + ")");


        // Scale the range of the data
        var x_ext = d3.extent(xy_pop_data, function (v) {
            return v.year;
        });
        var min_y = d3.min(xy_pop_data, function (v) {
            return v.value;
        });
        var max_y = d3.max(xy_pop_data, function (v) {
            return v.value;
        });

        x.domain(x_ext);
        y.domain([min_y, max_y]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line-path")
            .attr("d", valueline(xy_pop_data));

        var mobileScreen = (window.innerWidth < 500);
        svg.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + 140 + "," + 0 + ")")
            .text("Million People" +
                " per sq.km");


        // Add the scatterplot
        svg.selectAll("dot")
            .data(xy_pop_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                var x_value = x(v.year);
                return x_value;
            })
            .attr("cy", function (v) {
                var y_ = y(v.value);
                return y_;
            });

        // Add the X Axis
        svg.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

        count++;
    }

   if(co2_layer){

        // Adds the svg canvas
        var svg2 = country_chart_tooltip
            .append("svg")
            .attr("class", "point-chart")
            .attr("width", total_width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


        // Scale the range of the data
        var x_ext2 = d3.extent(xy_co2_data, function (v) {
            return v.year;
        });
        var min_y2 = d3.min(xy_co2_data, function (v) {
            return v.value;
        });
        var max_y2 = d3.max(xy_co2_data, function (v) {
            return v.value;
        });

        x.domain(x_ext2);
        y.domain([min_y2, max_y2]);

        // Add the valueline path.
        svg2.append("path")
            .attr("class", "line-path")
            .attr("d", valueline(xy_co2_data));
        
        svg2.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg2.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + (125+margin.left) + "," + 0 + ")")
            .text("CO2 Emission tons per capita");


        // Add the scatterplot
        svg2.selectAll("dot")
            .data(xy_co2_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                return x(v.year);
            })
            .attr("cy", function (v) {
                return y(v.value);
            });

        // Add the X Axis
        svg2.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg2.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

    }

    if(gdp_layer){

        // Adds the svg canvas
        var svg3 = country_chart_tooltip
            .append("svg")
            .attr("class", "point-chart")
            .attr("width", total_width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


        // Scale the range of the data
        var x_ext3 = d3.extent(xy_gdp_data, function (v) {
            return v.year;
        });
        var min_y3 = d3.min(xy_gdp_data, function (v) {
            return v.value;
        });
        var max_y3 = d3.max(xy_gdp_data, function (v) {
            return v.value;
        });

        x.domain(x_ext3);
        y.domain([min_y3, max_y3]);

        // Add the valueline path.
        svg3.append("path")
            .attr("class", "line-path")
            .attr("d", valueline(xy_gdp_data));

        svg3.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + width + "," + (height - 10 ) + ")")
            .text("Year");

        svg3.append("g")
            .append("text")
            //.attr("class", "x title")
            .attr("text-anchor", "end")
            .style("font-size", (mobileScreen ? 8 : 12) + "px")
            .attr("transform", "translate(" + 85 + "," + 0 + ")")
            .text("USD per capita");


        // Add the scatterplot
        svg3.selectAll("dot")
            .data(xy_gdp_data)
            .enter().append("circle")
            .attr("class", "value-point")
            .attr("r", 3)
            .attr("cx", function (v) {
                return x(v.year);
            })
            .attr("cy", function (v) {
                return y(v.value);
            });

        // Add the X Axis
        svg3.append("g")
            .attr("class", "line-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg3.append("g")
            .attr("class", "line-axis")
            .call(yAxis);

    }

}


