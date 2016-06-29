/**
 * Created by yuhao on 23/6/16.
 */

var color_handleL, color_handleR;
var color_brush,interval;
var selection_bar;
var color_x,color_y;

function draw_colorSlider(className){

    var ticks = color_split.length;
    interval = color_split[0]/ticks;

    var unit_height = 10;
    var data = [], obj = {};
    for(var i =ticks-1;i>=0; i--){
        obj["color"] = colors[i];
        obj["label"] = color_split[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }

    var margin = {top: 30, right: 10, bottom: 10, left: 10},
        width = 200 - margin.left - margin.right,
        height = 30;//200 - margin.top - margin.bottom;



    color_x = d3.scale.linear().range([0, width]);
    color_y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(color_x).orient("bottom")
        .ticks(ticks);
//.tickFormat(function(d) { return d.label; })
//.tickSize(15)
//.tickPadding(20);
    var yAxis = d3.svg.axis().scale(color_y).orient("left");


    color_brush = d3.svg.brush()
        .x(color_x)
        .on("brush", color_brushed);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x(d.label); })
        .y0(height)
        .y1(function(d) { return color_y(d.height); });

    var body;
    switch(className){
        case 'pop_layer': body = d3.select("#pop_densityHolder").selectAll("li").append("div")
                                    .attr("class","legend "+className);
            //unit_text = "People per sq.km";
            break;
        case 'co2_layer': body = d3.select("#co2_emissionHolder").selectAll("li").append("div")
                                 .attr("class","legend "+className);
            //unit_text = "Tons per person";
            break;
        default: break;
    }



    var svg = body.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    /*svg.append("defs")
     .append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", width)
     .attr("height", height);*/


    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    var last_index = color_split.length -1;
    color_x.domain([color_split[last_index],color_split[0]]);
    color_y.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad");


    var perc_interval = 100/ticks;

    data.forEach(function(d,i){
        grad.append("stop").attr("offset", i*perc_interval+"%").attr("stop-color", d.color);
        grad.append("stop").attr("offset", (i+1)*perc_interval+"%").attr("stop-color", d.color);
    });


    context.append("path")
        .datum(data)
        .style("fill", "url(#grad)")
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
        //.attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("fill","none")
        .call(xAxis);



    context.append("g")
        .attr("class", "x color_brush")
        .call(color_brush);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/


    selection_bar = context.append("rect")//.attr("class","color_brush")
        .style("height",height+'px')
        .style("fill","gold")
        .style("opacity",".125");
       // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
       // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("drag", drag_handler)
        .on("dragend",drag_end)
        .on("dragstart",drag_start);

    color_handleL = context.append("circle")
        //.attr("points","00,00 05,10 10,00")
        .attr("class", "L handle")
        .style("fill",'white')
        //.attr("transform", "translate("+4.5+"," +0 + ")")
        .attr("r", 9)
        .call(drag);

    color_handleR = context.append("circle")
        .attr("class", "R handle")
        .style("fill",'white')
        //.attr("transform", "translate("+4.5+"," +0 + ")")
        .attr("r", 9)
        .call(drag);


}



function color_brushed(ext) {

    if(ext == undefined){
        ext = color_brush.extent();
        ext[0] = Math.ceil(ext[0]/interval)*interval;
        ext[1] = Math.ceil(ext[1]/interval)*interval;
        console.log("interval - "+interval);
        console.log("color_brush"+ext);
    }

    var left = color_x(ext[0]);
    var right = color_x(ext[1]);
    console.log("left = "+left+" right = "+right);
    color_handleL.attr("cx",left );
    color_handleR.attr("cx",right) ;

    selection_bar.attr("x",Math.min(color_x(ext[0]),color_x(ext[1])))
        .style("width",(Math.abs(color_x(ext[1])-color_x(ext[0])))+'px');


}

function drag_handler(){

    var tmp = color_x.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp/ interval)*interval;
    console.log("x_value = "+x_value);


    if(x_value<=0)x_value = 0;
    if(x_value>color_split[0])x_value = color_split[0];

    var ext = color_brush.extent();
    if(d3.select(this).classed("L")){

        color_brush.extent([x_value,ext[1]]);
    }else if(d3.select(this).classed("R")){
        color_brush.extent([ext[0],x_value]);
    }else{
        alert("something wrong: "+ x_value);
    }
    console.log(ext[0]+" , "+ext[1]);
    color_brushed(ext);

}

function drag_start(){
    d3.select(this).style("border","1px solid yellow");
}

function drag_end(){
    d3.select(this).style("border","0px solid gold");
}

