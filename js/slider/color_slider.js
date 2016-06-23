/**
 * Created by yuhao on 23/6/16.
 */




function draw_color_slider(className) {

    var margin = {top: 430, right: 10, bottom: 100, left: 40},
        width = 200 - margin.left - margin.right,
        height = 50 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%b %Y").parse;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");


    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function (d) {
            return x(d.date);
        })
        .y0(height)
        .y1(function (d) {
            return y(d.price);
        });

    var svg = d3.selectAll(".color_slider")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brushed);

    d3.csv("data/complementary/sp500.csv", type, function (error, data) {
        x.domain(d3.extent(data.map(function (d) {
            return d.date;
        })));
        y.domain([0, d3.max(data.map(function (d) {
            return d.price;
        }))]);
        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        focus.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height + 7);
    });

    function brushed() {
        x.domain(brush.empty() ? x.domain() : brush.extent());
        focus.select(".area").attr("d", area);
        focus.select(".x.axis").call(xAxis);
    }

    function type(d) {
        d.date = parseDate(d.date);
        d.price = +d.price;
        return d;
    }

}


