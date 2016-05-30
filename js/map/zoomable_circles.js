/**
 * Created by yuhao on 27/5/16.
 */


var margin = 20,
    diameter = 500;
var  node,circle,focus,view; //svg
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
    var cg = d3.select("#content_holder").append("div")//g.append("g")
        .attr("id","zoomable_circles")
        .classed("extra_info",true)
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter);

        cg_g = cg.append("g")
            .attr("class","circle_holder")
        .attr("transform", "translate(" + diameter / 2  + "," + diameter / 2 + ")")
            .attr("style","border: 1px solid #d0d0d0;");
            //+ diameter /2 + "," + diameter / 2 + ")");

    
    d3.json("data/flare.json", function(error, root) {

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
                //console.log("d = "+d);
                //console.log("d.parent = "+d.parent);
                return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) {
                console.log("onclick!!   focus.x = "+ focus.name +" d.x = "+d.name);
                if (focus !== d) zoom_Circles(d), d3.event.stopPropagation();
                                        });

        var text = cg_g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .text(function(d) { return d.name; });

        node = cg_g.selectAll("circle,text"); //svg

        //d3.select("body")

        cg
        .style("background", color(-1))
            .on("click", function() {
                console.log("zoom root!")
                zoom_Circles(root); });


        zoomTo([root.x, root.y, root.r * 2 + margin]);
        
    });

    d3.select(self.frameElement).style("height", diameter + "px");
    
}

function zoom_Circles(d) {

    console.log("zoom_Circles("+d.name+")");
    //var focus0 = focus;
    focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom_Circles", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
           console.log("zoom_Circles():  view = "+view+"focus.x= "+ focus.x + "  focus.y = "+focus.y);
            //console.log("tween : d ->"+d);
            return function(t) {
                //console.log("t->"+t);
                zoomTo(i(t)); };
        });

    transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
    console.log("zoomTo("+v+")");
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function(d) {
        //console.log("translate to "+(d.x - v[0]) * k + " , "+(d.y - v[1]) * k);
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });

    circle.attr("r", function(d) { return d.r * k; });
}
