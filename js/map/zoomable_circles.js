/**
 * Created by yuhao on 27/5/16.
 */


var margin = 20,
    diameter = 500;
var  node,circle,focus,view,text; //svg
var cg_g;

function setup_circles(){

    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return d.size;});
/*
    svg = d3.select("body").append("svg")
        .attr("z-index",50)///////////////////
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
*/
    var cg = svg.append("g")
        .classed("extra_info",true)
        .attr("id","zoomable_circles");
    /*d3.select( "#content_holder").append("span")//g.append("g")
        .attr("id","zoomable_circles")

        .append("svg")
        .attr("width", '100%')//diameter
        .attr("height", '100%');*/

        cg_g = cg.append("g")
            .attr("class","circle_holder")
        .attr("transform", "translate(" + diameter  + "," + diameter + ")")  //2
            .attr("style","border: 1px solid #d0d0d0;");
            //+ diameter /2 + "," + diameter / 2 + ")");

    d3.json("data/flare.json", function(error, data) {


        var root = data[1];
        if (error) throw error;

        //console.log("root = "+root);
        focus = root;
        var nodes = pack.nodes(root);
            //view;

        circle = cg_g.selectAll("circle")  //svg
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", function(d) {
                var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                return res; })
            //.attr("cx",)
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) {
                console.log("onclick!!   focus.x = "+ focus.name +" d.x = "+d.name);
                if (focus !== d) zoom_Circles(d), d3.event.stopPropagation();
                                        });

        cg_g.selectAll(".node--root")
            .attr("cx",function (d) {
                console.log(projection([d.aver_latitude,d.aver_longitude]));
            return  projection([d.aver_latitude,d.aver_longitude])[0];
        }).attr("cy",function (d) {
            return projection([d.aver_latitude,d.aver_longitude])[1];
        });

       text = cg_g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "project_clustering_label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .text(function(d) { return d.name; });

        node = cg_g.selectAll("circle,text"); //svg



        //console.log("node_root = "+node_root);
         //d3.selectAll(".node--root")
        cg_g
        .on("click", function() {
                console.log("zoom root!");
                zoom_Circles(root); });

        //console.log("cg = "+cg);


        zoomTo([root.x, root.y, root.r * 2 + margin]);
        
    });

    d3.select(self.frameElement).style("height", diameter + "px");
    
}

function zoom_Circles(d) {

    //console.log("zoom_Circles("+d.name+")");
    //var focus0 = focus;
    focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom_Circles", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          // console.log("zoom_Circles():  view = "+view+"focus.x= "+ focus.x + "  focus.y = "+focus.y);
            //console.log("tween : d ->"+d);
            return function(t) {
                //console.log("t->"+t);
                zoomTo(i(t)); };
        });

   // var text_affected = transition.selectAll("text")
    transition.selectAll(".project_clustering_label")
        .filter(function(t) {//d
            return t.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function() { return d.parent === focus ? 1 : 0; })
        .each("start", function() { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function() { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
    console.log("zoomTo("+v+")");
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function(d) {
        //console.log("translate to "+(d.x - v[0]) * k + " , "+(d.y - v[1]) * k);
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });

    circle.attr("r", function(d) { return d.r * k; });

   var t =[-846,-276];
    var s = 2;
    move(t,s);
}
