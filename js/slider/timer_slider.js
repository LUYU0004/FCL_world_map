/**
 * Created by Crazy Frog on 11/7/2015.
 */

var start_year = 1964,
    end_year = 2014;

var cur_year = start_year;

var slider_margin = {top: 20, right: 25, bottom: 20, left: 20},
    slider_width = document.getElementById("extra_info").offsetWidth - slider_margin.right - slider_margin.left;
    slider_height =100;

var year_range = d3.scale.linear().domain([start_year, end_year]);
var x = year_range
    .range([0, slider_width])
    .clamp(true);

var brush = d3.svg.brush()
    .x(x)
    .extent([start_year, start_year])
    .on("brush", brushed);

var svg = d3.selectAll(".time_slider")
    .attr("z-index", 20).
    append("svg")
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

var slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", slider_height);

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate("+slider_margin.left+"," + slider_height / 2 + ")")
    .attr("r", 9);

function animate_time() {

    slider
        .call(brush.event)
        .transition() // gratuitous intro!
        .duration(1000 * (end_year - start_year))
        .call(brush.extent([end_year, end_year]))
        .call(brush.event);
}


function update(value){
    cur_year = Math.round(value);
    d3.selectAll(".time_slider").style("background-color", d3.hsl(214, .41, .78));
    
    console.log("cur_year"+cur_year);
    update_curYear(cur_year);
    display_PopDensity();
}

function brushed() {
    var value = brush.extent()[0];

    if (d3.event.sourceEvent) { // not a programmatic event
        value = x.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
    }

    handle.attr("cx", x(value));

    update(value);
}