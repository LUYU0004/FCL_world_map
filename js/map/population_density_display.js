/**
 * Created by yuhao on 18/5/16. #E2E3E8
 */

var property, world_country_size,category,catNo;

var color_split;
var colors = ["#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF", "#DEEBF7"];

var status =0; //play(1) or stop(0 ) for the time_slider

//var content_svg = d3.select("#map_container").append("svg").append("g");
//content_svg.append("circle").attr("cx",500).attr("cy",500).attr("r",100).style("fill",red).style("z-index",'10');

/*load_countrySize_and_property */
function load_DData(_category){
    var max_property;


    category = _category;


    switch(category){
        case "Population Density":        
                                            color_split = [500, 400, 300, 200, 100, 50, 10, 0];
                                            max_property=1000;
                                            //draw_legend(max_property,"pop_layer");
                                            draw_colorSlider('pop_layer');
                                            read_popData("pop_layer");
                                            setup_slider(1964, 2014,"pop_layer");//1964-2014

                                            break;
        
        case "CO2 Emission":
                                                color_split = [50, 20, 10, 5, 1, 0.1, 0];//1964-2011
                                                max_property=100;
                                                draw_colorSlider('co2_layer');
                                                //draw_legend(max_property,"co2_layer");
                                                read_co2Data();
                                                setup_slider(1964, 2011,"co2_layer");
                                                break;

        case "FCL Projects":        //remove_layer();
                                    draw_project_legend('project_layer');
                                   generate_project_DistMatrix();
                                        break;

        case "Global Network":      draw_project_legend('network_layer');
                                    generate_network_DistMatrix();
                                    break;
        
        case "Academic Staff":      draw_project_legend('staff_layer');
                                    generate_staff_DistMatrix();
                                    break;
        default: break;
    }

}


/*create or update population density on map*/
function display_Density(cur_year){

    var densityMultiplier = 1;


    switch(category){
        case "CO2 Emission": densityMultiplier = 1000;
        default: break;
    }

    /*modify colors of each countries based on population density*/
    var countries  = g.selectAll(".country").data(this.world_topo);

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;

        var country_properties = find_country_property(name);
        var country_size = find_country_size(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size*densityMultiplier;

            for (var index = 0; index < color_split.length; index++) {
                if (density > color_split[index]){
                    
                    return colors[index];
                }
            }

            return colors[1];
        } else {
            return '#E2E3E8';
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
            var country_properties = find_country_property(name);
            var year_property = country_properties[0][cur_year];
            var country_size = find_country_size(name);
            var cur_country_size = country_size[0][cur_year];

            if (country_properties.length > 0 && country_size.length > 0) {

                var formatted_property = formatNum(year_property);
                var density = year_property / cur_country_size * densityMultiplier;
                var density_unit;

                switch(category){
                    case "Population Density": cur_country_size = cur_country_size + ' (sq.km)';
                        density_unit = ' people per (sq.km)';
                        break;
                    case "CO2 Emission": cur_country_size = cur_country_size +' people';
                        density_unit = ' tons per person';
                        break;
                    default: break;
                }

                one_tooltip
                    .html("<div>|<b>"+d.properties.name + "</b><br>|<b>" + category + ":</b>"
                        + formatNum(year_property) + "<br>|<b>Size:</b>" + cur_country_size + "<br>|<b>Density:</b>"
                        + density+density_unit+"</div>");

                var left_adjust = zoom.translate()[0];
                var top_adjust = zoom.translate()[1];
                var scale = zoom.scale();

                var left = mouse[0]*scale + offsetL+left_adjust;
                var top = mouse[1]*scale + offsetT+top_adjust;

                return one_tooltip.attr("style", "right:"+(innerWidth - left)+"px;bottom:"+(innerHeight - top)+"px;visibility: visible;");

            }else{
                return one_tooltip.attr("style", "right:" + (innerWidth-mouse[0] - offsetL) + "px;bottom:" + (innerHeight - mouse[1] - offsetT) + "px;visibility:visible")
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

                var tooltip_right = one_tooltip.node().getBoundingClientRect().width + left;
                var window_right = innerWidth - window_margin - buffer;

                if(tooltip_right > window_right){

                    var tooltip_Width = 275;

                    left = mouse[0]-tooltip_Width-offsetL  ;

                }

                var tooltip_height = one_tooltip.node().getBoundingClientRect().height;

                var tooltip_bottom = top+tooltip_height;

                if(tooltip_bottom> (window.innerHeight-window_margin)){
                    top = mouse[1]-tooltip_height-offsetT;
                }

                return one_tooltip.attr("style","left:"+ left+"px;top:"+top+"px;visibility: visible;");



    }).on("mouseout", function (d, i) {
        looptime = 0;
        return one_tooltip.attr("style", "visibility: hidden");
    });

}


/*
 Add color legend to extra_layer
 */
function draw_legend(max_property,className) {

    var wBox = 190,
        hBox = 100;

    var steps = color_split.length,
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

    var partial_colors = colors.slice(0, color_split.length);

    sg.selectAll('rect').data(partial_colors ).enter().append('rect')
        .attr('x', function (d, i) {
            return i * wRect;
        })
        .attr('y', offsetY)
        .attr('fill', function (d, i) {
        return colors[i];
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


function find_country_property(country_name) {
    
    var m =  property.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_country_size(country_name){

    var m = world_country_size.filter(function (f){
        return f.Country_Name == country_name;
    });

    return m;
}

function read_popData(className){
    d3.csv("data/fitted/country_size.csv", function (error, data) {
        switch(className){
            case 'pop_layer': world_country_size = data;

                    read_population('pop_layer');
                    break;
            default: break;
        }

    });
}

function read_population(className){
    d3.csv("data/fitted/population.csv", function (error, data) {
        var start_year=1964;
        switch(className){
            case 'pop_layer':     property =  data;
                            
                        break;
            case 'co2_layer':     world_country_size = data;
                
                        break;

            default:    alert("wrong category !");break;
        }

        display_Density(start_year);
        //setup_slider(start_year, end_year,className);//1964-2014
        //animate_time();

    });
}

function read_co2Data(){
    d3.csv("data/raw/CO2 emissions (kt)/en.atm.co2e.kt_Indicator_en_csv_v2(edited).csv", function (error, data) {
        property = data;
        read_population('co2_layer');
    });
}

function formatNum(num) {
    var format = d3.format(',.02f');
    var factor = 1;
    var unit = '';


    switch (category){
        case "Population Density":
                factor = 1000000;
                unit = ' M people';
                break;
        case "CO2 Emission": factor = 1;
                unit = ' K tons';
                break;
        default: break;
    }

    return format(num / factor) + unit;
}

function remove_layer(className){
    if(className ==undefined) className = ".extra_info";
    var extra_info= d3.selectAll(className);
    extra_info.remove();
}
