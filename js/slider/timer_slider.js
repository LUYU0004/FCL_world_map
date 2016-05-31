/**
 * Created by Crazy Frog on 11/7/2015.
 */


var start_year, end_year, cur_year;
var handle, brush, x,slider;

function setup_slider(start_y, end_y){

    //console.log("setup_slider("+start_y+" , "+end_y+") ");

    start_year = start_y;
        end_year = end_y;

    cur_year = start_year;

    //d3.select("#time_slider").style("background-color", d3.hsl(214, .41, .78));



    var slider_margin = {top: 2, right: 10, bottom: 10, left: 10},
        slider_width = document.getElementById("map_container").offsetWidth *0.70 - slider_margin.right - slider_margin.left,
        slider_height =50;


    var year_range = d3.scale.linear().domain([start_year, end_year]);
    x = year_range
        .range([0, slider_width])
        .clamp(true);

    brush = d3.svg.brush()
        .x(x)
        //.extent([cur_year, cur_year])
        .extent([start_year, start_year])
        .on("brush", brushed);

    var svg = d3.select("#time_slider")
        .attr("z-index", 40)
        .append("svg")
        .attr("width", slider_width + slider_margin.left + slider_margin.right)
        .attr("height", slider_height  +slider_margin.top+slider_margin.bottom)
        .append("g");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+slider_margin.left+"," + slider_height / 2 + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks((end_year - start_year) / 2)
            .tickFormat(function(d) { return d; })
            .tickSize(0)
            .tickPadding(12))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", slider_height);

    handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate("+slider_margin.left+"," + slider_height / 2 + ")")
        .attr("r", 9);
    
}


function animate_time() {
    //console.log("animate_time()");

    slider
        .call(brush.event)
        .transition() // gratuitous intro!
        .duration(500* (end_year - start_year))
        .call(brush.extent([end_year, end_year]))
        //.call(brush.extent([end_year, end_year]))
        .call(brush.event);



}

function stop_animateTime(){
    brushed();
}

function update(value){
    cur_year = Math.round(value);
    //console.log("update- cur_year: "+ cur_year);
    display_Density(cur_year);
}

function brushed() {
    
    var value = brush.extent()[0];
        //console.log("brushed! value: "+value);

        if (d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            //console.log("d3.event.sourceEvent"+d3.event.sourceEvent+ ",  brush",value);
            brush.extent([value, value]);
        }else{
            if(status ==0){
                brush.extent([cur_year, cur_year]);
            }
        }

    handle.attr("cx", x(value));

    update(value);
}

