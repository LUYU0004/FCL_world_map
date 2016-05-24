/**
 * Created by yuhao on 18/5/16.
 */

var property, world_country_size,category,catNo;
var index = 1;
var count = 0;

//var color_split = [1000000000, 500000000, 200000000, 100000000, 50000000, 10000000, 5000000, 0];
var color_split;
var colors = ["#08306B", "#08519C", "#2171B5", "#4292C6", "#6BAED6", "#9ECAE1", "#C6DBEF", "#DEEBF7"];


/*load_countrySize_and_property */
function load_DData(_category){
    var max_property;
        
    category = _category;

    draw_time_slider();
    switch(category){
        case "Population Density":          color_split = [500, 400, 300, 200, 100, 50, 10, 0];
                                            catNo = 1;
                                            max_property=1000;
                                            draw_legend(max_property);
                                            d3.selectAll(".extra_info").attr("d.fixed",true);
                                            read_popData();
                                    break;
        case "CO2 Emission (tons per person)":
            color_split = [50, 20, 10, 5, 1, 0.1, 0];//1964-2011
            catNo = 2;
            max_property=100;
            draw_legend(max_property);
            read_co2Data();

                                 break;
        default: break;
    }



}


/*create or update population density on map*/
function display_Density(cur_year){

    var densityMultiplier = 1;

    switch(catNo){
        case 1: break;
        case 2: densityMultiplier = 1000;
        default: break;
    }

    /*modify colors of each countries based on population density*/
    var countries  = g.selectAll(".country");

    countries.attr("fill", function (d,i) {
        var name = d.properties.name;
        var country_properties = find_country_property(name);
        var country_size = find_country_size(name);

        if (country_properties.length > 0 && country_size.length > 0) {
            var year_property = country_properties[0][cur_year];
            var c_size = country_size[0][cur_year];
            var density = year_property / c_size*densityMultiplier;
            //console.log(cur_year+"  "+name+" "+density);

            for (var index = 0; index < color_split.length; index++) {
                if (density > color_split[index])
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


    //!!!!!!!!!!!!!!!!
    if(index ==1){
        property.forEach(function(d){
            count++;
            var it = find_Dif_countryName(country,d.Country_Name);
                console.log(count+"can not find: "+ it);
        });

        index++;
    }

    //add new event listeners
    country.on("mousemove", function (d, i) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        var name = d.properties.name;

        var country_properties = find_country_property(property, name);
        var year_property = country_properties[0][cur_year];
        var country_size = find_country_size(world_country_size, name);
        var cur_country_size = country_size[0][cur_year];

        tooltip.classed("hidden", false)
            .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
            .html(d.properties.name + " | "+ category+":" + formatNum(year_property)+"| Size:"+cur_country_size+"|Density:"+(year_property/cur_country_size));
    }).on("mouseout", function (d, i) {
        tooltip.classed("hidden", true);
    });


}


/*
 Add color legend to extra_layer
 */
function draw_legend(max_property) {
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

    var steps = color_split.length,
        hLegend = hBox - hBox / (hFactor * 1.8),
        hRect = hLegend / steps,
        offsetYFactor = hFactor / hRect;

    var legend = svg.append('g')    //add the legend to extra_info.svg.g
        .classed("extra_info",true)
        .attr('class', 'color_legend')
        .attr('width', wBox)
        .attr('height', hBox)
        .attr('transform', 'translate(0,' + offsetY + ')');
    
    var sg = legend.append('g')
        .attr('transform', tr);

    var partial_colors = colors.slice(0, color_split.length);
    sg.selectAll('rect').data(partial_colors ).enter().append('rect')
        .attr('y', function (d, i) {
            return i * hRect;
        }).attr('fill', function (d, i) {
        return colors[i];
    }).attr('width', wRect).attr('height', hRect);

    //var max_population = 1398790000;

    // Draw color scale labels.
    sg.selectAll('text').data(partial_colors).enter().append('text').text(function (d, i) {
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
        //var text = formatNum(max_population);
        return max_property;

    }).attr('x', wRect + offsetText).attr('y', offsetText * offsetYFactor * 2);

    sg.append('text').text(function () {
        //var text = formatNum(max_population);
        return category;

    }).attr('x', 0).attr('y', function(){
        return (color_split.length+1) * hRect;
    });
}

function draw_time_slider(){

    d3.select("#time_slider").remove();
    var body = d3.select("#content_holder");
    
    var time_slider = body.append("div")
        .classed("extra_info",true)
        .attr('id','time_slider')
        .attr("width","100%");
        //.attr("class","extra_info");

}

function find_country_property(country_name) {

    var m =  property.filter(function (f) {
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
    console.log("m"+m);
    return m;
}




function find_country_size(country_name){

    var m = world_country_size.filter(function (f){
        return f.Country_Name == country_name;
    });

    return m;
}

function read_popData(){
    d3.csv("data/fitted/country_size.csv", function (error, data) {
        switch(catNo){
            case 1: world_country_size = data;
                    read_population(catNo);
                    break;
            default: break;
        }

    });
}

function read_population(){
    d3.csv("data/fitted/population.csv", function (error, data) {
        var start_year, end_year;
        switch(catNo){
            case 1:     property =  data;
                        start_year = 1965;
                        end_year = 2014;
                        break;
            case 2:     world_country_size = data;
                        start_year = 1964;
                        end_year = 2011;
                        break;

            default:    alert("wrong category number:"+catNo);break;
        }

        //console.log("property"+property);
        display_Density(start_year);
        setup_slider(start_year, end_year);//1964-2014
        animate_time();

    });
}

function read_co2Data(){
    d3.csv("data/raw/CO2 emissions (kt)/en.atm.co2e.kt_Indicator_en_csv_v2(edited).csv", function (error, data) {
        property = data;
        read_population(catNo);
    });
}

function formatNum(num) {
    var format = d3.format(',.02f');

    return format(num / 1000000) + "M";
}