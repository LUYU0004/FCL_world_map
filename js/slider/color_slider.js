/**
 * Created by yuhao on 23/6/16.
 */

var color_handleL1, color_handleR1;
var color_brush1;
var selection_bar1;
var color_x1,color_y1;
var ticks1;
var label_color = "#cccccc";
function draw_colorSlider_1(className){

    ticks1 = color_split1.length-1;

    var unit_height = 10;
    var data = [], obj = {};

   /* //add in the zero th color
    obj["color"] = '#DEEBF7'; 
    obj["x"] = 0;
    obj["label"] = 0;
    obj["height"] = unit_height;
    data.push(obj);
    obj = {};
    */

    for(var i =ticks1;i>=0; i--){
        obj["color"] = colors1[i];
        obj["x"] = ticks1 -i;
        obj["label"] = color_split1[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }



    var margin = {top: 7, right: 10, bottom: 0, left: 10},
        width = 200 - margin.left - margin.right,
        height = 15;//200 - margin.top - margin.bottom;



    color_x1 = d3.scale.linear().range([0, width]);
    color_y1 = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(color_x1).orient("bottom")
        .ticks(ticks1);
//.tickFormat(function(d) { return d.label; })
//.tickSize(15)
//.tickPadding(20);
    var yAxis = d3.svg.axis().scale(color_y1).orient("left");


    color_brush1 = d3.svg.brush()
        .x(color_x1)
        .on("brush", color_brushed1);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x1(d.x); })
        .y0(height)
        .y1(function(d) { return color_y1(d.height); });

    var body = d3.select("#pop_densityHolder").selectAll("li").append("div")
                                    .attr("class","legend "+className);

    var text_height = 25;
    
    var svg = body.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+text_height);

    svg.append("g").append("text").text("sq.km").attr("fill",label_color).attr("y",13);


    /*svg.append("defs")
     .append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", width)
     .attr("height", height);*/


    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+text_height) + ")");


    color_x1.domain([0,ticks1]);
    color_y1.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad");


    var perc_interval = 100/ticks1;

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
        .call(color_brush1);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/

    var labels = body.append("svg")
        .attr("width",200)
        .attr("height",50)
        .append("g");

    labels.selectAll("text").data(data)
        .enter()
        .append("text")
        .text(function(d){
            return d.label;
        }).attr("fill",label_color)
        .attr("x",function(d){
            return color_x1(d.x)
        }).attr("y",height).attr("font-size","9px");

    selection_bar1 = context.append("rect")//.attr("class","color_brush")
        .style("height",height+'px')
        .style("fill","gold")
        .style("opacity",".125");
       // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
       // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("drag", drag_handler1);

    color_handleL1 = context.append("circle")
        //.attr("points","00,00 05,10 10,00")
        .attr("class", "L handle")
        .style("fill",label_color)
        //.attr("transform", "translate("+4.5+"," +0 + ")")
        .attr("r", 9)
        .call(drag);

    color_handleR1 = context.append("circle")
        .attr("class", "R handle")
        .style("fill",label_color)
        //.attr("cx",width)
        .attr("r", 9)
        .call(drag);

    color_brush1.extent([0,ticks1]);
    color_brushed1();


}



function color_brushed1(ext) {

    if(ext == undefined){
        ext = color_brush1.extent();
        ext[0] = Math.ceil(ext[0]);
        ext[1] = Math.ceil(ext[1]);
    }

    var L = Math.min(ext[0],ext[1]);
    var R = Math.max(ext[0],ext[1]);
    
    var left = color_x1(L);
    var right = color_x1(R);
    var width = right - left;

    color_handleL1.attr("cx",left );
    color_handleR1.attr("cx",right) ;

    selection_bar1.attr("x",left)
        .style("width",width+'px');

    range1 = [ticks1-L,ticks1-R];
    display_Density1(cur_year);
    
}

function drag_handler1(){

    var tmp = color_x1.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp);

    if(x_value<0)x_value = 0;
    if(x_value>ticks1)x_value = ticks1;

    var ext = color_brush1.extent();
    if(d3.select(this).classed("L")){
        color_brush1.extent([x_value,ext[1]]);
    }else if(d3.select(this).classed("R")){
        color_brush1.extent([ext[0],x_value]);
    }else{
        alert("something wrong: "+ x_value);
    }

    color_brushed1();
}


var color_handleL2, color_handleR2;
var color_brush2;
var selection_bar2;
var color_x2,color_y2;
var ticks2;

function draw_colorSlider_2(className){

    ticks2 = color_split2.length-1;

    var unit_height = 10;
    var data = [], obj = {};

    for(var i =ticks2;i>=0; i--){
        obj["color"] = colors2[i];
        obj["x"] = ticks2 -i;
        obj["label"] = color_split2[i];
        obj["height"] = unit_height;
        data.push(obj);
        obj = {};
    }



    var margin = {top: 7, right: 10, bottom: 0, left: 10}, //{top: 7, right: 10, bottom: 0, left: 10},
        width = 200 - margin.left - margin.right,
        height = 15;//200 - margin.top - margin.bottom;



    color_x2 = d3.scale.linear().range([0, width]);
    color_y2 = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(color_x2).orient("bottom")
        .ticks(ticks2);

    var yAxis = d3.svg.axis().scale(color_y2).orient("left");


    color_brush2 = d3.svg.brush()
        .x(color_x2)
        .on("brush", color_brushed2);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return color_x2(d.x); })
        .y0(height)
        .y1(function(d) { return color_y2(d.height); });

    var body = d3.select("#co2_emissionHolder").selectAll("li").append("div")
        .attr("class","legend "+className);

    var text_height = 25;

    var svg = body.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+text_height);

    svg.append("g").append("text").text("tons per person").attr("fill",label_color).attr("y",13);


    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+text_height) + ")");


    color_x2.domain([0,ticks2]);
    color_y2.domain([0,unit_height]);

    var grad = svg.append("defs")
        .append("linearGradient")
        .attr("id", "grad2");


    var perc_interval = 100/ticks2;

    data.forEach(function(d,i){
        grad.append("stop").attr("offset", i*perc_interval+"%").attr("stop-color", d.color);
        grad.append("stop").attr("offset", (i+1)*perc_interval+"%").attr("stop-color", d.color);
    });


    context.append("path")
        .datum(data)
        .style("fill", "url(#grad2)")
        .attr("class", "area")
        .attr("d", area);

    context.append("g")
    //.attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("fill","none")
        .call(xAxis);



    context.append("g")
        .attr("class", "x color_brush")
        .call(color_brush2);
    /*.selectAll("rect")
     .attr("y", -6)
     .attr("height", height + 7);*/


    var labels = body.append("svg")
        .attr("width",200)
        .attr("height",50)
        .append("g");

    labels.selectAll("text").data(data)
        .enter()
        .append("text")
        .text(function(d){
            return d.label;
        }).attr("fill",label_color)
        .attr("x",function(d){
            return color_x2(d.x)+4.5;
        }).attr("y",height).attr("font-size","9px");


    selection_bar2 = context.append("rect")//.attr("class","color_brush")
        .style("height",height+'px')
        .style("fill","gold")
        .style("opacity",".125");
    // .attr("transform", "translate("+0+"," +0 + ")");//t x="0" y="0" width="50" height="50" fill="green"

    context.append("g")
    // .attr("class", "y axis")
        .attr("fill","none")
        .call(yAxis);

    var drag = d3.behavior.drag()
        .on("drag", drag_handler2);

    color_handleL2= context.append("circle")
        .attr("class", "L handle")
        .style("fill",label_color)
        .attr("r", 9)
        .call(drag);

    color_handleR2 = context.append("circle")
        .attr("class", "R handle")
        .style("fill",label_color)
        //.attr("cx",width)
        .attr("r", 9)
        .call(drag);

    color_brush2.extent([0,ticks2]);
    color_brushed2();


}



function color_brushed2(ext) {

    if(ext == undefined){
        ext = color_brush2.extent();
        ext[0] = Math.ceil(ext[0]);
        ext[1] = Math.ceil(ext[1]);
    }

    var L = Math.min(ext[0],ext[1]);
    var R = Math.max(ext[0],ext[1]);

    var left = color_x2(L);
    var right = color_x2(R);
    var width = right - left;

    color_handleL2.attr("cx",left );
    color_handleR2.attr("cx",right) ;

    selection_bar2.attr("x",left)
        .style("width",width+'px');

    range2 = [ticks2-L,ticks2-R];
    display_Density2(cur_year);

}

function drag_handler2(){

    var tmp = color_x2.invert(d3.mouse(this)[0]);

    var x_value = Math.ceil(tmp);

    if(x_value<0)x_value = 0;
    if(x_value>ticks2)x_value = ticks2;

    var ext = color_brush2.extent();
    if(d3.select(this).classed("L")){
        color_brush2.extent([x_value,ext[1]]);
    }else if(d3.select(this).classed("R")){
        color_brush2.extent([ext[0],x_value]);
    }else{
        alert("something wrong: "+ x_value);
    }

    color_brushed2();
}


function drag_start(){
    d3.select(this).style("border","1px solid yellow");
}

function drag_end(){
    d3.select(this).style("border","0px solid gold");
}

