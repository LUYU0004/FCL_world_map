/**
 * Created by yuhao on 18/5/16.
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
        case "Population Density":          remove_layer();
                                            draw_time_slider();
                                            color_split = [500, 400, 300, 200, 100, 50, 10, 0];
                                            catNo = 1;
                                            max_property=1000;
                                            draw_legend(max_property);
                                            read_popData();
                                            break;
        
        case "CO2 Emission":        remove_layer();
                                    draw_time_slider();
                                    color_split = [50, 20, 10, 5, 1, 0.1, 0];//1964-2011
                                                catNo = 2;
                                                max_property=100;
                                                draw_legend(max_property);
                                                read_co2Data();
                                                break;

        case "FCL Projects":        remove_layer();
                                   draw_tiers();//draw_points(); //
                                    //draw_circles();
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
            return colors[colors.length - 1];
        }

    }).on("mousemove",null);

    /*modify tooltip to add in info about population and country size*/
    var offsetL = document.getElementById("map_container").offsetLeft + 20;
    var offsetT = document.getElementById("map_container").offsetTop + 10;

    //var countries = g.selectAll(".country");

    //country.on("mousemove",null);

    countries.on("mousemove", function (d,i) {

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
            switch(catNo){
                case 1: cur_country_size = cur_country_size + ' (sq.km)';
                    density_unit = ' people per (sq.km)';
                    break;
                case 2: cur_country_size = cur_country_size +' people';
                    density_unit = ' tons per person';
                    break;
                default: break;
            }

            tooltip
                .html("<div id='tooltip_country'>|<b>"+d.properties.name + "</b><br>|<b>" + category + ":</b>"
                    + formatNum(year_property) + "<br>|<b>Size:</b>" + cur_country_size + "<br>|<b>Density:</b>"
                    + density+density_unit+"</div>");

            if(d.id ==262)
                console.log("!!!!");

            var left = mouse[0] + offsetL;
             var top = mouse[1] + offsetT;
             var window_margin = 16;
             var buffer = 5;

             var tooltip_right = d3.select("#tooltip_country").node().getBoundingClientRect().width + left;//d3.select("#tooltip_country").node().getBoundingClientRect().right;
             var window_right = window.innerWidth - window_margin - buffer;

             if(tooltip_right > window_right){

                var tooltip_Width = 275;

                left = mouse[0]-tooltip_Width-offsetL  ;

             }

            var tooltip_height = d3.select("#tooltip_country").node().getBoundingClientRect().height;

                var tooltip_bottom = top+tooltip_height;//d3.select("#tooltip_country").node().getBoundingClientRect().bottom;

                 if(tooltip_bottom> (window.innerHeight-window_margin)){
                     //console.log("2  mouse[1]="+mouse[1]+"  tooltip_bottom="+tooltip_bottom);
                    top = mouse[1]-tooltip_height-offsetT;
                    //console.log("top="+top);
             }

             tooltip.attr("style","width:"+ tooltip_Width
             +"px; left:"+ left+"px;top:"+top+"px;visibility: visible;");

            //tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")

        }else{tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
            .html(d.properties.name);}
    });

}


/*
 Add color legend to extra_layer
 */
function draw_legend(max_property) {

    d3.selectAll("#color_legend").remove();

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

    var label_height = 15;

    var legend = svg.append('g')  //svg.append('g')    //add the legend to extra_info.svg.g
        .attr('class', "extra_info")
        .attr('id',"color_legend")
        .attr('width', wBox)
        .attr('height', hBox)
        .attr('transform', 'translate(0,' + offsetY + ')');

    //draw dot legend
    var dot_legend = legend.append('g')
        .attr('class','dot_legend');

    dot_legend.append('circle')
        .attr("cx", 5)
        .attr("cy", function () {
            return (color_split.length+3) * hRect;
        }).attr("class", "point")
        .style("fill", "red")
        .attr("r", 4);

    dot_legend.append('text').text("indicates FCL project locations.")
        .attr('x', 15).attr('y', function(){
        return (color_split.length+3) * hRect;
    });

    var sg = legend.append('g')
        .attr('transform', tr);

    var partial_colors = colors.slice(0, color_split.length);
    sg.selectAll('rect').data(partial_colors ).enter().append('rect')
        .attr('y', function (d, i) {
            return i * hRect+label_height;
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
            return i * hRect+ (hRect + hRect * offsetYFactor)+label_height;
        });

    //Draw label for end of extent.
    sg.append('text').text(function () {
        //var text = formatNum(max_population);
        return max_property;

    }).attr('x', wRect + offsetText).attr('y', offsetText * offsetYFactor * 2+label_height);

    sg.append('text').text(function () {
        //var text = formatNum(max_population);
        return category;

    }).attr('x', 2).attr('y', function(){
        return 0;//(color_split.length+1) * hRect;
    });

}

function draw_time_slider(){

    d3.select("#time_slider").remove();

    var body = d3.select("#content_holder");
    
    var time_slider = body.append("div")
        .classed("extra_info",true)
        .attr('id','time_slider');

    var playBtn_Image = new Image();
    playBtn_Image.src = "img/Play_button.png";
    var stopBtn_Image = new Image();
    stopBtn_Image.src = "img/stop_button.png";
    var replayBtn_Image = new Image();
    replayBtn_Image.src = 'img/replay_button.png';

    var replay = false;
    var play_stop_btn = body.append("a")
        .classed("extra_info",true)
        .attr("href","#");




    play_stop_btn.append("img")
        .attr("id", "play_stopBtn")
        .attr("src","img/Play_button.png")
        .attr("alt","click");


    play_stop_btn
        .on("mouseover", function () {
            d3.select("#play_stopBtn").style('borderColor','gold');
        }).on("mouseout",function () {
            d3.select("#play_stopBtn").style('borderColor', 'transparent');
        })
        .on('click',function(){

            if(status ==0){
                d3.select("#play_stopBtn").attr('src' ,stopBtn_Image.src);
                status = 1;
                animate_time();
            }else{
                d3.select("#play_stopBtn").attr('src' ,playBtn_Image.src);
                status = 0;
                stop_animateTime();
            }
    });
 
 var replay_btn = body.append("a")
 .classed("extra_info",true)
 .attr("href","#");

 replay_btn.append("img")
 .attr("id", "replay_Btn")
 .attr("src","img/replay_button.png")
 .attr("alt","click");

    replay_btn
        .on("mouseover", function () {
            d3.select("#replay_Btn").style('borderColor','gold');
        }).on("mouseout",function () {
        d3.select("#replay_Btn").style('borderColor', 'transparent');
    })
        .on('click',function(){
        console.log("replay!!!");
        cur_year = start_year;
        status =0;
        stop_animateTime();
        status = 1;
        d3.select("#play_stopBtn").attr("src",stopBtn_Image.src);
        animate_time();

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
                        start_year = 1964;
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
        //animate_time();

    });
}

function read_co2Data(){
    d3.csv("data/raw/CO2 emissions (kt)/en.atm.co2e.kt_Indicator_en_csv_v2(edited).csv", function (error, data) {
        property = data;
        read_population();
    });
}

function formatNum(num) {
    var format = d3.format(',.02f');
    var factor = 1;
    var unit = '';
    
    switch (catNo){
        case 1: factor = 1000000;
                unit = ' M people'
                break;
        case 2: factor = 1;
                unit = ' K tons'
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
