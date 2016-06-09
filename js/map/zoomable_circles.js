/**
 * Created by yuhao on 27/5/16.
 */

//var average_longtitude;  // index 1 to number of clusters
//var average_latitude;
function draw_points(){

    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];
    var projects = svg.append("g").attr("class","projects extra_info");
    var radius_unit = 4;

    //draw the custers
    d3.csv("data/complementary/project_Cluster_Info (1).csv", function (err, clusters) {

        if (err) console.log(err);
        else {
            clusters = clusters.slice(0,8);
            var coordinates=[];
            var project_clusters = projects.append("g").attr("class","project_clusters");

            project_clusters.selectAll("circle").data(clusters).enter()
                .append("circle")
                .attr("class","project_cluster")
                .attr("cx", function(d){
                    return projection([d.Longitude,d.Latitude])[0];
                }).attr("cy",function (d) {
                return projection([d.Longitude,d.Latitude])[1];
            }).style("fill", function () {
                return color_scheme[4];
            }).style("opacity",0.2)
                .attr("z-index",function(d){
                    return 0.8*d.ProjectNo +10;
                })
                .attr("r", function (d) {
                    var radius = Number(d.ProjectNo)*radius_unit;
                    if(radius >20) radius = 0.8*radius;
                    return radius;
                })
                .on("mouseover", function () {
                    var _t = d3.select(this);
                    _t.style("border-radius","5px")
                        .style("border","1px solid #FFFF00");
                    return tooltip.attr("style","visibility: visible");})
                .on("mousemove", function(d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                        .html("<div id='tooltip_holder' style='vertical-align: middle'>" +
                            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+d.Text+"</div></div>");

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

                }).on("mouseout", function () {
                    return tooltip.attr("style","visibility: hidden");
                }).on("click",function (d) {

                        var cur_lvl = zoom.scale();

                        var scale = 3;
                        var y_factor = 1.3;
                       if(d.Latitude<0) { y_factor = 1;}
                        var x_multiplier = (projection([d.Longitude, d.Latitude])[0]/innerWidth)*(-1.19*scale);
                        var y_multiplier = (projection([d.Longitude, d.Latitude])[1]/innerHeight)*(-y_factor*scale);

                        var pos =[(projection([d.Longitude, d.Latitude])[0]*x_multiplier),(projection([d.Longitude, d.Latitude])[1]*y_multiplier)];
                        move(pos , scale);
                        //var _t = d3.select(this);
                        //_t.style("visibility","hidden");
                        //this.attr("style","visibility:hidden");
                });

        }
    });

////to draw the projects dots
    d3.csv("data/fcl/1. Projects.csv", function (err, points) {

        if (err) console.log(err);
        else {
            points = points.slice(0,55);

            var project_points = projects.append("g").attr("class","project_points");

            project_points.selectAll("circle").data(points).enter()
                .append("circle")
                .attr("class","point")
                .attr("cx", function(d){
                    return projection([d.Longitude,d.Latitude])[0];
                }).attr("cy",function (d) {
                return projection([d.Longitude,d.Latitude])[1];
            }).style("fill", function () {
                return color_scheme[6];
            }).style("opacity",1)
                .attr("r", radius_unit*1)
                .on("mouseover", function () {return tooltip.attr("style","visibility: visible");})
                .on("mousemove", function(d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    var text = "<br><p>"+d.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ d.Latitude +"° N, "+ d.Longitude+"°E <br>"
                        +d.Description+"</p>";

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                        .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                            "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                            "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+text+"</div></div>");

                    tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

                }).on("mouseout", function () {
                return tooltip.attr("style","visibility: hidden");
            }).on("click",null);

        }
    });

    

}


/*calculate distance between any two project locations*/
function generate_DistMatrix(projects){
    SC.projectNo =0;

    var positionA = [];
    var positionB = [];
    var matrix = [];
    var distance;
    var distance_Multiplier = 1000; // km to m??

    projects.forEach(function (pointA) {
        positionA = [];
        positionA.push(pointA.Longitude, pointA.Latitude);
        matrix.push([]);
        SC.projectNo++;

        projects.forEach(function(pointB){
            positionB = [];
            positionB.push(pointB.Longitude, pointB.Latitude);

            distance = d3.geo.distance(positionA, positionB)* distance_Multiplier;
            matrix[pointA.No-1].push(distance);
        })
    });

    var tier1_range = 100;

    return find_tier1( matrix,tier1_range);

}


//function to add points and text to the map (used in plotting capitals)
function addpoint(color_status, lat, lon, title,text, radius, No) {

    var radius_unit = 4;
    if(radius == undefined) radius = 1;
    if(No == undefined) No = 0;


    var gpoint = g.append("g").attr("class","gpoint extra_info");
    var x = projection([lat, lon])[0];
    var y = projection([lat, lon])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    if(parseInt(lat) == 51) console.log("x ="+x);
    //console.log("x:"+x+"   y:"+y);
    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", radius_unit*radius)
        .attr("z-index",function () {
            var index =parseInt(radius*0.8 +10);// 20-(radius*0.8) +10;
            title = title +" z-index = " +index;
            return index;
        })
        .on("mouseover", function () {return tooltip.attr("style","visibility: visible");})
        .on("mousemove", function() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);
            });
            var half = (tooltip.node().getBoundingClientRect().right -mouse[0])/2;

            tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                    "='float: left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                    "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>"+text+"</div></div>");


            d3.select("#tooltip_text").attr("style","float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/"+No+"_fcl_vis.jpg";
            //console.log("project_img.src = "+project_img.src);
            d3.select("#tooltip_pic").attr("src",project_img.src);


            var left = tooltip.node().getBoundingClientRect().left;
            var top = tooltip.node().getBoundingClientRect().top;
            var tooltip_width = tooltip.node().getBoundingClientRect().width;

            var pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            var pic_width = pic_height/1.25;

            d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');

            tooltip.attr("style", "left:" + (mouse[0]- tooltip.node().getBoundingClientRect().width/2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

            var text_height = pic_height;
            var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
           // var text_area =  text_height* text_width;

            //console.log("-----------");
            //console.log("text_area = "+text_area);


           /* var right = tooltip.node().getBoundingClientRect().right;
            var bottom = tooltip.node().getBoundingClientRect().bottom;
            var window_margin = 9; //actually 8, but to detect close to edge change to 8
            //var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;

            var overflowR, overflowB;
            overflowR = right- (window.innerWidth -window_margin);
            overflowB = bottom -  (window.innerHeight - window_margin);
            var looptime = 0;
            var new_text_width = text_width;
            var new_text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;

            // console.log("text_width = "+text_width+"text_height="+new_text_height);
            //console.log(" overflowB = "+overflowB);
            //console.log("overflowR  = "+overflowR);

            /*if(new_text_width>325 &&(overflowB > 0 || overflowR>0)){
             d3.select("#tooltip_text").style("width",300+'px');
             text_width = 300;
             pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
             pic_width = pic_height/1.25;
             console.log("large width, set to 300");

             d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');
             }*/



        }).on("mouseout", function () {
        return tooltip.attr("style","visibility: hidden");
    })
        .on("click",function () {
        if(radius >1){
            var scale = 4;

            var x_multiplier = radius/3*0.1 +0.35;
            var y_multiplier = radius/3*0.1+0.3;
            if(radius ==23){
                x_multiplier  = 0.78;
                y_multiplier = 0.80;
            }else{
                if(radius ==2){
                    x_multiplier = 0.90;
                    y_multiplier = 0.7;
                }
            }
            var pos =[(x*x_multiplier)*(-1*scale),(y*y_multiplier)*(-1*scale)];

            move(pos,scale);

        }
    });


}

/*find tier1- distance <= 200;
 tier2- distance < */
// 55 projects, index 0-54
function find_tier1(matrix, tier_range){

    var tier_status=[];// 1 indicates the corresponding project is included in tier1 already
    var check_status = []; //1 indicates checked alr for neighbours
    var stack = [];
    var neighbours = [];
    var value;


    //to create a neighbour matrix holding neighbours to each project
    for(var index =0;index<SC.projectNo;index++){

        neighbours.push([]);
        for(var i=0; i<SC.projectNo;i++){
            value = matrix[index][i];
            if(value<=tier_range && index !=i){ //index != i  to avoid same project distance
                neighbours[index].push(i);
            }
        }
    }

    //to classify projects into cluster
    for (var j=0;j<SC.projectNo;j++){
        tier_status.push(0);
        check_status.push(0);

    }


    var first_ofstack;
    var stack_length = 0;
    var neighbour_length;
    var neighbour_No;
    var looptime = 0;
    var clusterIndex = 1;
    var clusterNumber = [];

    clusterNumber.push(0,0);
    for(index = 0;index<SC.projectNo;index++){
        if(check_status[index]==0){
            if(looptime>1) {clusterIndex++; clusterNumber.push(0);}
            looptime =0;
            stack.push(index);
            stack_length++;

            while(stack_length > 0){
                looptime++;
                first_ofstack = stack.shift();
                stack_length--;

                if(check_status[first_ofstack] ==0){
                    check_status[first_ofstack] = 1;
                    neighbour_length =neighbours[first_ofstack].length;

                    if( neighbour_length> 0){
                        if(tier_status[first_ofstack]==0) {
                            tier_status[first_ofstack] = clusterIndex;
                            clusterNumber[clusterIndex]++;
                        }

                        for(i=0;i<neighbour_length;i++){
                            neighbour_No = neighbours[first_ofstack][i];
                            stack.push(neighbour_No);
                            stack_length++;
                            if(tier_status[first_ofstack]==0) {
                                tier_status[neighbour_No] = clusterIndex;
                                clusterNumber[clusterIndex]++;}
                        }

                    }
                }

            }

        }

    }
    clusterNumber.pop();

    var clusters = [];

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);
    }

    //sort projects in tier1_status according to cluster number, clusters[0] collects all projects with no cluster
    for(i=0;i< SC.projectNo;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual project numbers, from 1 to 55
    }

    var output = [];
    output.push(tier_status, clusterNumber,clusters);

    return output;

}




var margin = 20,
    diameter = 100;
var  node,circle,focus,view,text; //svg
var cg_g;

function draw_circles(){

    /*d3.select( "#content_holder").append("span")//g.append("g")
        .attr("id","zoomable_circles")

        .append("svg")
        .attr("width", '100%')//diameter
        .attr("height", '100%');*/


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

    var root;
    d3.json("data/flare.json", function(error, data) {


        //var projection = projection(average_latitude[6],average_longtitude[6]);
        root = data[1];
        if (error) throw error;
        //draw_circles(root);
        cg_g = cg.append("g")
            .attr("class", "circle_holder")
           .attr("transform", "translate(" + 500 + "," +500+ ")")  //2
            .attr("style", "border: 1px solid #d0d0d0;");
        //+ diameter /2 + "," + diameter / 2 + ")");


        console.log("root = " + root);
        focus = root;
        var nodes = pack.nodes(root);
        //view;

        circle = cg_g.selectAll("circle")  //svg
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                return res;
            })
            //.attr("cx",)
            .style("fill", function (d) {
                return d.children ? color(d.depth) : null;
            })
            .style("fill-opacity", 0.5)
            .on("mouseover", function () {
                return tooltip.attr("style", "visibility: visible");
            })
            .on("mousemove", function (d, i) {
                var mouse = d3.mouse(svg.node()).map(function (d) {
                    return parseInt(d);
                });

                return tooltip.attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(d["text"]);


            }).on("mouseout", function (d, i) {
                return tooltip.attr("style", "visibility: hidden");
            }).on("click", function (d) {
                console.log("onclick!!   focus.x = " + focus.name + " d.x = " + d.name);
                if (focus !== d) zoom_Circles(d), d3.event.stopPropagation();
            });

        /*cg_g.selectAll(".node--root")
         .attr("cx",function (d) {
         console.log(projection([d.aver_latitude,d.aver_longitude]));
         return  projection([d.aver_latitude,d.aver_longitude])[0];
         }).attr("cy",function (d) {
         return projection([d.aver_latitude,d.aver_longitude])[1];
         });*/

        //var x_translate = cg_g.selectAll(".node--root")[0];//[0]["aver_latitude"];
        //cg_g.attr("transform", "translate(" + diameter + "," + diameter + ")")


            tooltip.html("<div id='tooltip_holder' style='vertical-align: middle'><span id='pic_holder' class='Centerer' style" +
                "='float:left;vertical-align: middle'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                "<div id='tooltip_text' style='float: right;padding-left: 10px;padding-top: 10px;padding-right:10px;vertical-align: middle;border: 1px solid #b4b4b4;'>" + "<br><p>" + d["title"] + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + d["latitude"] + "° N, " + d["longtitude"] + "°E <br>"
                + d["text"] + "</p>" + "</div></div>");


            d3.select("#tooltip_text").attr("style", "float: right;padding-left: 15px;padding-top: 10px;padding-right:10px;vertical-align: middle;");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/" + No + "_fcl_vis.jpg";
            //console.log("project_img.src = "+project_img.src);
            d3.select("#tooltip_pic").attr("src", project_img.src);

            var left = tooltip.node().getBoundingClientRect().left;
            var top = tooltip.node().getBoundingClientRect().top;
            var tooltip_width = tooltip.node().getBoundingClientRect().width;

            var pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
            var pic_width = pic_height / 1.25;

            d3.select("#tooltip_pic").style("width", pic_width + 'px').style("height", pic_height + 'px');

            tooltip.attr("style", "left:" + (mouse[0] - tooltip.node().getBoundingClientRect().width / 2) + "px;top:" + (mouse[1] + offsetT) + "px;visibility: visible;");

            var text_height = pic_height;
            var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
            var text_area = text_height * text_width;

            //console.log("-----------");
            //console.log("text_area = "+text_area);


            var right = tooltip.node().getBoundingClientRect().right;
            var bottom = tooltip.node().getBoundingClientRect().bottom;
            var window_margin = 9; //actually 8, but to detect close to edge change to 8
            //var text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;

            var overflowR, overflowB;
            overflowR = right - (window.innerWidth - window_margin);
            overflowB = bottom - (window.innerHeight - window_margin);
            var looptime = 0;
            var new_text_width = text_width;
            var new_text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;

            // console.log("text_width = "+text_width+"text_height="+new_text_height);
            //console.log(" overflowB = "+overflowB);
            //console.log("overflowR  = "+overflowR);

            /*if(new_text_width>325 &&(overflowB > 0 || overflowR>0)){
             d3.select("#tooltip_text").style("width",300+'px');
             text_width = 300;
             pic_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
             pic_width = pic_height/1.25;
             console.log("large width, set to 300");

             d3.select("#tooltip_pic").style("width",pic_width+'px').style("height",pic_height+'px');
             }*/

            while (overflowB > 0 ^ overflowR > 0) {

                //console.log("looptime: "+looptime);


                if (looptime > 0) {
                    pic_height = new_text_height;
                    pic_width = pic_height / 1.25;

                    d3.select("#tooltip_pic").style("width", pic_width + 'px').style("height", pic_height + 'px');
                }

                if (overflowR > 0) {

                    if (looptime == 0) {
                        left = left - (pic_width + text_width + 25);
                        //console.log("overflowR: change is  -( pic_width+text_width) = -"+(pic_width+text_width));
                    }
                    else {
                        left = left - overflowR;
                        //console.log("overflowR: chnge is -(new_text_width= "+new_text_width+" - text_width = "+text_width+")");
                    }
                    text_width = new_text_width;
                    text_height = new_text_height;
                    //console.log("computed - left = "+left);
                }
                if (overflowB > 0) {
                    if (looptime == 0) {
                        top = top - (pic_height + offsetT + 20);
                        left = (mouse[0] - tooltip.node().getBoundingClientRect().width / 2);
                        //console.log("overflowB: change is  - (pic_height + offsetT) = -" + (pic_height + offsetT));
                    }
                    else {
                        top = top - overflowB;
                        //console.log("overflowB: change is  -(new_text_height ="+new_text_height+"  -pic_height ="+pic_height+")");
                    }
                    //console.log("top= "+overflowB);
                }
                tooltip_width = text_width + pic_width + 25;
                tooltip.attr("style", "left:" + left + "px;top:" + top + "px;visibility: visible;width:" + tooltip_width + 'px');

                //console.log("computed_width = "+(text_width+pic_width+25)+"  read_width = "+tooltip.node().getBoundingClientRect().width);


                overflowR = tooltip.node().getBoundingClientRect().right - (window.innerWidth - window_margin);
                overflowB = tooltip.node().getBoundingClientRect().bottom - (window.innerHeight - window_margin);
                new_text_width = d3.select("#tooltip_text").node().getBoundingClientRect().width;
                new_text_height = d3.select("#tooltip_text").node().getBoundingClientRect().height;
                text_area = new_text_height * new_text_width;

                //console.log("new_text_area ="+ text_area+ "   text_height ="+new_text_height+"   text_width = "+new_text_width);
                looptime++;
                //console.log(looptime);
                //console.log("overflow!  overflowB = "+overflowB+"  overflowR = "+overflowR);
                //console.log("end_loop!!!!!!!!!!!!");

                if (looptime > 1) break;
            }
        });

        text = cg_g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "project_clustering_label")
            .style("fill-opacity", function (d) {
                return d.parent === root ? 0.8 : 0;
            })
            .style("display", function (d) {
                return d.parent === root ? "inline" : "none";
            })
            .text(function (d) {
                return d.name;
            });

        node = cg_g.selectAll("circle,text"); //svg


        //console.log("node_root = "+node_root);
        //d3.selectAll(".node--root")
        cg_g
            .on("click", function () {
                console.log("zoom root!");
                zoom_Circles(root);
            });

        //console.log("cg = "+cg);


        zoomTo([root.x, root.y, root.r * 2 + margin]);



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
        .style("fill-opacity", function() { return d.parent === focus ? 0.8 : 0; })
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

