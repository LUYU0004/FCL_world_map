/**
 * Created by yuhao on 23/5/16.
 */


var country_co2_emission, world_country_size;

var index = 1;
var count = 0;

//var color_split = [1000000000, 500000000, 200000000, 100000000, 50000000, 10000000, 5000000, 0];
var color_split = [500, 400, 300, 200, 100, 50, 10, 0];
var colors = ["#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF", "#DEEBF7"];


/*load_countrySize_and_country_co2_emission */
function load_co2Data(_country_co2_emission, _world_country_size){

    country_co2_emission = _country_co2_emission;
    world_country_size = _world_country_size;

    draw_legend();
    //console.log("legend"+ d3.selectAll(".color_legend"));
    draw_time_slider();

    display_PopDensity(1964);
    setup_slider();
    animate_time();
}


/*create or update population density on map*/
function display_co2Density(cur_year){


    /*modify colors of each countries based on population density*/
    var countries  = g.selectAll(".country");

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;
        var country_properties = find_country_co2_emission(country_co2_emission, name);
        var country_size = find_country_size(world_country_size, name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_co2 = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            for (var index = 0; index < color_split.length; index++) {
                if (year_pop / c_size > color_split[index])
                    return colors[index];
            }
            return colors[1];
        } else {
            return colors[colors.length - 1];
        }
    })

    /*modify tooltip to add in info about population and country size*/
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;

    var country = d3.selectAll(".country");

    var tooltip = d3.select("#map_container").selectAll(".tooltip hidden");

    //clear the previous event listeners to avoid overflooding
    country.on("mousemove",null);
    country.on("mouseout",null);

    if(index ==1){
        country_co2_emission.forEach(function(d){
            count++;
            console.log(count+d.Country_Name);

            var it=find_Dif_countryName(country,d.Country_Name);
            if(it != null)

                console.log("!!!!!!!!!!!!can not find: "+ it);
        });

        index++;
    }

    //add new event listeners
    country.on("mousemove", function (d, i) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        var name = d.properties.name;

        var country_properties = find_country_co2_emission(country_co2_emission, name);
        var year_co2 = country_properties[0][cur_year];
        var country_size = find_country_size(world_country_size, name);
        var cur_country_size = country_size[0][cur_year];

        tooltip.classed("hidden", false)
            .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
            .html(d.properties.name + " | country_co2_emission:" + formatNum(year_pop)+"| Size:"+cur_country_size+"|Density:"+(year_pop/cur_country_size));
    }).on("mouseout", function (d, i) {
        tooltip.classed("hidden", true);
    });


}


/*
 Add color legend to extra_layer
 */
function draw_legend() {
    d3.selectAll(".color_legend").remove();
    //d3.selectAll("#color_legend").append("g").attr("class", "color_legend").html(legend);


    var wFactor = 10,
        hFactor = 2;

    var wBox = map_width / wFactor,
        hBox = map_height / hFactor;


    var wRect = wBox / (wFactor * 0.75),
        offsetText = wRect / 2,
        offsetY = map_height - hBox * 1.2,//0.9
        tr = 'translate(' + offsetText + ',' + offsetText * 3 + ')';

    var steps = colors.length,
        hLegend = hBox - hBox / (hFactor * 1.8),
        hRect = hLegend / steps,
        offsetYFactor = hFactor / hRect;

    var legend = g.append('g')    //add the legend to extra_info.svg.g
        .classed("extra_info",true)
        .attr('class', 'color_legend')
        .attr('width', wBox)
        .attr('height', hBox)
        .attr('transform', 'translate(0,' + offsetY + ')');

    var sg = legend.append('g')
        .attr('transform', tr);

    sg.selectAll('rect').data(colors).enter().append('rect')
        .attr('y', function (d, i) {
            return i * hRect;
        }).attr('fill', function (d, i) {
        return colors[i];
    }).attr('width', wRect).attr('height', hRect);



    var max_country_co2_emission = 1000;

    // Draw color scale labels.
    sg.selectAll('text').data(colors).enter().append('text').text(function (d, i) {
        // The last element in the colors list corresponds to the lower threshold.
        //var label = formatNum(color_split[i]);

        return color_split[i];
    }).attr('class', function (d, i) {
        return 'text-' + i;
    }).attr('x', wRect + offsetText)
        .attr('y', function (d, i) {
            return i * hRect+ (hRect + hRect * offsetYFactor);
        });

    //Draw label for end of extent.
    sg.append('text').text(function () {

        return max_country_co2_emission;

    }).attr('x', wRect + offsetText).attr('y', offsetText * offsetYFactor * 2);

    sg.append('text').text(function () {
        //var text = formatNum(max_country_co2_emission);
        return 'Country CO2 Emission Density';

    }).attr('x', 0).attr('y', function(){
        return (colors.length+1) * hRect;
    });
}

function draw_time_slider(){

    var body = d3.select("#content_holder");

    var time_slider = body.append("div")
        .classed("extra_info",true)
        .attr('id','time_slider')
        .attr("width","100%");
    //.attr("class","extra_info");

}

function find_country_co2_emission(country_co2_emission, country_name) {

    var m= country_co2_emission.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    return m;
}

function find_Dif_countryName(country,country_name) {

    var m= country.filter(function (f) {
        //return f.country == country_id;
        return f.Country_Name == country_name;
    });
    if(m==null) return m;
}




function find_country_size(country_size, country_name){
    var m = country_size.filter(function (f){
        return f.Country_Name == country_name;
    });

    return m;
}


function formatNum(num) {
    var format = d3.format(',.02f');

    return format(num / 1000000) + "M";
}