/**
 * Created by yuhao on 27/5/16.
 */


/*calculate distance between any two project locations*/
function generate_project_DistMatrix(){
    SC.projectNo =0;

    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var projectObj = {};
        var lon_unit;
        var lat_unit;

        projects.forEach(function (pointA) {
            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.projectNo++;
            projectObj["name"] = pointA.Index+" "+pointA.Name;
            lat_unit  = Number(pointA.Latitude) >=0 ? Math.abs(pointA.Latitude) +'°N':Math.abs(pointA.Latitude) +'°S';
            lon_unit = Number(pointA.Longitude) >=0 ? Math.abs(pointA.Longitude) +'°E':Math.abs(pointA.Longitude) +'°W';
            projectObj["text"] = pointA.Title+"<br>"+lat_unit+" , "+lon_unit+"<br>"+pointA.City+" , "+pointA.Country+"<br>"
                +pointA.Description+"<br>"+pointA.Image_Credit;
            projectObj["latitude"] = pointA.Latitude;
            projectObj["longitude"] = pointA.Longitude;
            projectObj["city"] = pointA.City;
            projectObj["country"] = pointA.Country;
            SC.projects.push(projectObj);
            projectObj = {};

            projects.forEach(function(pointB){
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);
                
                distance = d3.geo.distance(positionA, positionB)* distance_Multiplier;
                matrix[pointA.No-1].push(distance);
            })
        });

        SC.project_matrix = matrix;
        find_last_tier(100,zoom.scale(),'project_layer'); // draw tier1



    });

    
}

/*calculate distance between any two project locations*/
function generate_network_DistMatrix(){
    SC.networkNo =0;

    d3.csv("data/fcl/2. Global Network.csv", function (err, items) {
        var positionA = [];
        var positionB = [];
        var matrix = [];
        var distance;
        var distance_Multiplier = 1000; // km to m??
        var Obj = {};
        var lon_unit;
        var lat_unit;

        items.forEach(function (pointA) {
            positionA = [];
            positionA.push(pointA.Longitude, pointA.Latitude);
            matrix.push([]);
            SC.networkNo++;
            Obj["name"] = pointA.Name;
            lat_unit  = Number(pointA.Latitude) >=0 ? Math.abs(pointA.Latitude) +'°N':Math.abs(pointA.Latitude) +'°S';
            lon_unit = Number(pointA.Longitude) >=0 ? Math.abs(pointA.Longitude) +'°E':Math.abs(pointA.Longitude) +'°W';
            Obj["text"] = pointA.Title+"<br>"+lat_unit+" , "+lon_unit+"<br>"+pointA.Country;
            Obj["latitude"] = pointA.Latitude;
            Obj["longitude"] = pointA.Longitude;
            Obj["country"] = pointA.Country;
            SC.network.push(Obj);
            Obj = {};

            items.forEach(function(pointB){
                positionB = [];
                positionB.push(pointB.Longitude, pointB.Latitude);

                distance = d3.geo.distance(positionA, positionB)* distance_Multiplier;
                matrix[pointA.No-1].push(distance);
            })
        });

        SC.network_matrix = matrix;
        find_last_tier(100,zoom.scale(),'network_layer'); // draw tier1

    });


}


var area_unit =200;
//function to add points and text to the map (used in plotting capitals)
function addpoint(color, lat, lon, title,text, area, imgNo,scale,className) {


    if(area == undefined) area = 1;
    if(imgNo == undefined) imgNo = 0;


    var gpoint = g.append("g").attr("class","items "+className);
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];
    
    gpoint.selectAll("circle")
        .data([{"area":area}])
        .enter()
        .append("svg:circle")
        .style("stroke","#000")
        .style("stroke-width", "0.5px")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "point")
        .style("fill", color//function () {return color_scheme[color_status];}
        ).style("opacity",0.7)
        .attr("r", function (d) {
            return Math.sqrt(d["area"]*area_unit/Math.PI)/scale;
        })
        .on("mouseover", function () {

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];
            var sc = zoom.scale();


            tooltip.attr("style", "right:" + (innerWidth-x*sc-left)+ "px;bottom:" +(innerHeight-y*sc-top)+ "px;visibility: visible")
                .classed("tooltip_short",true)
                .html("<div id='tooltip_holder' class='tooltip_short'><div id='tooltip_button'>button</div><div id='pic_holder' class='Centerer'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></div>" +
                    "<div id='tooltip_text'><b>" + title + "</b></div></div>");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
            //console.log("project_img.src = "+project_img.src);
            d3.select("#tooltip_pic").attr("src",project_img.src);

        })
       .on("mouseout", function () {
        return tooltip.selectAll(".tooltip_short").attr("style","visibility: hidden");
    })
        .on("click",function () {

            var shift_x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var shift_y = innerHeight/2 - projection([lon,lat])[1] *scale;
            var t = [shift_x,shift_y];
            move(t,scale);

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];

            tooltip.attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight - y*scale-top)+ "px;visibility: visible")
                .classed("tooltip_short",false)
                .html("<div id='tooltip_holder'><div id='pic_holder' class='Centerer'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></div>" +
                    "<div id='tooltip_text'><b>" + title + "</b><p>" + text + "</div></div>");

            //add in picture for the project
            var project_img = new Image();
            project_img.src = "img/project_img/"+imgNo+"_fcl_vis.jpg";
            //console.log("project_img.src = "+project_img.src);
            d3.select("#tooltip_pic").attr("src",project_img.src);

            var width =tooltip.node().getBoundingClientRect().width;
            var height =tooltip.select("#tooltip_text").node().getBoundingClientRect().height;
            var area = width *height;

            if(width>300){
                height = area/300;
                if(height>300){
                    tooltip.attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight-y*scale-top)+ "px;visibility: visible;width:300px;height:300px")
                }else{
                    tooltip.attr("style", "right:" + (innerWidth-x*scale-left)+ "px;bottom:" +(innerHeight-y*scale-top)+ "px;visibility: visible;width:300px");
                }
            }
    });

}


//function to add clusters of projects
function add_zoomable_cluster(color, lat, lon, title,text, area,scale,clusterObj,className) {

    if(area == undefined) area = 2;


    var gpoint = g.append("g").attr("class","items "+className);
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];


    gpoint.selectAll("circle")
        .data([clusterObj])
        .enter()
        .append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "cluster")
        .style("stroke","#000")
        .style("stroke-width", '0.5px')
        .style("fill", color//function () {return color_scheme[color_status];}
        ).style("opacity",0.4)
        .attr("r", function(d){
            return Math.sqrt(d["area"]*area_unit/Math.PI)/scale;
        })
        .on("mouseover", function () {

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];
            var sc = zoom.scale();


            tooltip.attr("style", "right:" + (innerWidth-x*sc-left)+ "px;bottom:" +(innerHeight-y*sc-top)+ "px;visibility: visible")
                .classed("tooltip_short",false)
                .html("<div id='tooltip_holder'>" +
                    "<div id='tooltip_text'>"+text+"</div></div>");})

        .on("mouseout", function () {
            return tooltip.selectAll(".tooltip_short").attr("style","visibility: hidden");
    })
        .on("click",function () {

            var shift_x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var shift_y = innerHeight/2 - projection([lon,lat])[1] *scale;
            move([shift_x,shift_y],scale);

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];
            var sc = zoom.scale();


            tooltip.attr("style", "right:" + (innerWidth-x*sc-left)+ "px;bottom:" +(innerHeight-y*sc-top)+ "px;visibility: visible");


            //this.attr("style", "visibility: hidden");
            draw_circles(clusterObj);

        });


}

/*for the last tier, to create tree-structure zoomable circles for projects with same 
or very close coordinates*/
function find_last_tier(tier_range,scale,className){
    
    var max_No;
    var items;
    var matrix;
    var color;
    switch(className){
        case 'project_layer':
                                matrix = SC.project_matrix;
                                max_No = SC.projectNo;
                                items = SC.projects;
                                color = 'yellow';
                            break;
        case 'network_layer':   matrix = SC.network_matrix;
                                max_No = SC.networkNo;
                                items = SC.network;
                                color = 'blue';
                            break;
        default: break;
    }

    var tier_status=[];// 1 indicates the corresponding project is included in tier1 already
    var check_status = []; //1 indicates checked alr for neighbours
    var stack = [];
    var neighbours = [];
    var value;


    //to create a neighbour matrix holding neighbours to each project
    for(var index =0;index<max_No;index++){

        neighbours.push([]);
        for(var i=0; i<max_No;i++){
            value = matrix[index][i];
            if(value<=tier_range && index !=i){ //index != i  to avoid same project distance
                neighbours[index].push(i);
            }
        }
    }

    //to classify projects into cluster
    for (var j=0;j<max_No;j++){
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
    var cluster_aver_lat = [];
    var cluster_aver_lon = [];

    clusterNumber.push(0,0);
    cluster_aver_lat.push(0);
    cluster_aver_lon.push(0);

    for(index = 0;index<max_No;index++){
        if(check_status[index]==0){
            if(looptime>1) {
                clusterIndex++;
                clusterNumber.push(0);
                cluster_aver_lat.push(0);
                cluster_aver_lon.push(0);
            }
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
    
    var item ;

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);

    }

    //sort items in tier1_status according to cluster number, clusters[0] collects all items with no cluster
    for(i=0;i< max_No;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual item numbers, from 1 to 55
        item = items[i];
        cluster_aver_lat[index] += Number(item["latitude"]);
        cluster_aver_lon[index] += Number(item["longitude"]);
    }


    //add in cluster objects
    var area ;
    var name;
    var text;
    var clusterSort = [];
    var clusterObj = {};
    var itemObj = {};

    for(i=1;i<clusterNumber.length;i++){
        area = clusterNumber[i];
        cluster_aver_lat[i] = cluster_aver_lat[i]/area;
        cluster_aver_lon[i] = cluster_aver_lon[i]/area;

        clusterSort.push([i,area]);
    }
    clusterSort.sort(function(a, b) {return b[1]-a[1];});

    //draw clusters, clusterIndex start from 1
    setup_circles(className);

    for(i=0; i< clusterSort.length;i++){
        clusterIndex = clusterSort[i][0];
        area = clusterSort[i][1];
        name = "Cluster "+clusterIndex;
        text ="Number : "+area;
        clusterObj["name"] = name;
        clusterObj["text"] = text;
        clusterObj["longitude"] = cluster_aver_lon[clusterIndex];
        clusterObj["latitude"] = cluster_aver_lat[clusterIndex];
        clusterObj["area"] = area;
        clusterObj["children"] = [];

        //add in children for each cluster object
        for(j=0;j<clusters[clusterIndex].length;j++){

            itemIndex = clusters[clusterIndex][j]-1;
            item = items[itemIndex];
            itemObj["name"] = item["name"];
            itemObj["itemIndex"] = itemIndex+1;
            itemObj["text"] = item["text"];
            itemObj["longitude"] = item["longitude"];
            itemObj["latitude"] = item["latitude"];
            itemObj["size"] = 1;
            clusterObj["children"].push(itemObj);
            itemObj ={};
        }

        add_zoomable_cluster(color,cluster_aver_lat[clusterIndex],cluster_aver_lon[clusterIndex],name,text,area,scale,clusterObj,className);
        //draw_circles(clusterObj);
        clusterObj = {};
    }

    //draw non-clustered items
    var length = clusters[0].length;
    var itemIndex;
    for (i=0;i<length;i++){
        itemIndex = clusters[0][i]-1;
        item = items[itemIndex];
        addpoint(color,item["latitude"],item["longitude"],item["name"],item["text"],1,itemIndex+1,scale,className);
    }

}



var diameter;
var  node,circle,focus,view,text; //svg
var cg_g;

var cg ;

//to setup for draw_Circles at the first use
function setup_circles(className){

    cg = svg.append("g")
        .attr("class",className);
}

//implement each cluster drawing to zoomable circles
function draw_circles(root){

    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    diameter = Math.sqrt(root["area"]*area_unit/(Math.PI))/zoom.scale() *2;
    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter , diameter ])
        .value(function(d) { return d.size;});


    var root_x = projection([root["longitude"],root["latitude"]])[0];
    var root_y = projection([root["longitude"],root["latitude"]])[1];

    cg_g = cg.append("g")
        .attr("class","items zoomable")
        .attr("transform", "translate(" + root_x + "," + root_y  + ")")  //2
        .attr("style", "border: 1px solid #d0d0d0;");

    focus = root;
    var nodes = pack.nodes(root);


    circle = cg_g.selectAll("circle")  //svg
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", function (d) {
            var res = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            return res;
        })
        .style("fill", function (d) {
            return d.children ? color(d.depth) : null;
        })
        .style("fill-opacity", 0.9)
        .on("mouseover", function (d) {

            var left = zoom.translate()[0];
            var top = zoom.translate()[1];
            var scale = zoom.scale();

            if(d.parent ==undefined){ //root
                /*tooltip.attr("style", "visibility:visible;right:" + (innerWidth-root_x*scale-left) + "px;bottom:" + (innerHeight-root_y*scale-top) + "px")
                    .html("<div id='tooltip_holder'>" +
                        "<div id='tooltip_text' class='tooltip_short'><b class='text_title'>"+d["name"]+"</b><p>"+d["text"]+"</p></div></div>");
               
               // tooltip.style("visibility","hidden");*/
                return null;
            }else {

                var k = diameter / (root.r * 2);
                var left_adjust = (d.x - root.x) * k*scale;
                var bottom_adjust = (d.y - root.y) * k*scale;

               tooltip.attr("style", "visibility:visible;right:" + (innerWidth - root_x * scale - left - left_adjust) + "px;bottom:" + (innerHeight - root_y * scale - top - bottom_adjust) + "px")
                   .classed("tooltip_short",true)
                   .html("<div id='tooltip_holder' ><span id='pic_holder' class='Centerer' ><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></span>" +
                        "<div id='tooltip_text'><b>" + d["name"] + "</b></div></div>");



                //add in picture for the project
                var item_img = new Image();
                item_img.src = "img/project_img/" + d["itemIndex"] + "_fcl_vis.jpg";

                d3.select("#tooltip_pic").attr("src", item_img.src);

                var width =tooltip.node().getBoundingClientRect().width;
                var height =tooltip.select("#tooltip_text").node().getBoundingClientRect().height;
                var area = width *height;

                if(width>300){
                    height = area/300;
                    if(height>300){
                        tooltip.attr("style", "right:" + (innerWidth-root_x*scale-left-left_adjust)+ "px;bottom:" +(innerHeight-root_y*scale-top-bottom_adjust)+ "px;visibility: visible;width:300px;height:300px")
                    }else{
                        tooltip.attr("style", "right:" + (innerWidth-root_x*scale-left-left_adjust)+ "px;bottom:" +(innerHeight-root_y*scale-top-bottom_adjust)+ "px;visibility: visible;width:300px");
                    }
                }
            }

        })
        .on("mouseout", function (d, i) {
            return tooltip.selectAll(".tooltip_short").attr("style", "visibility: hidden;opacity:0;transition: opacity 1s;");
        })
        .on("click", function (d) {

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];
            var sc = zoom.scale();


            if(d.parent == undefined){
                cg_g.remove();
            }else{
                var k = diameter / (root.r * 2);
                var left_adjust = (d.x - root.x)*k*sc;
                var bottom_adjust = (d.y-root.y)*k*sc;

                tooltip.attr("style", "right:" + (innerWidth-root_x*sc-left-left_adjust)+ "px;bottom:" +(innerHeight-root_y*sc-top-bottom_adjust)+ "px;visibility: visible")
                    .classed("tooltip_short",false)
                    .html("<div id='tooltip_holder' style='vertical-align: middle'><div id='pic_holder' class='Centerer'><img id='tooltip_pic' class='Centered' src='res/fcl_logo.png'></div>" +
                        "<div id='tooltip_text'><b>" + d["name"] + "</b><br><br><p>" + d["text"] + "</div></div>");

                //add in picture for the project
                var item_img = new Image();
                item_img.src = "img/project_img/"+d["itemIndex"]+"_fcl_vis.jpg";

                d3.select("#tooltip_pic").attr("src",item_img.src);

                var width =tooltip.node().getBoundingClientRect().width;
                var height =tooltip.select("#tooltip_text").node().getBoundingClientRect().height;
                var area = width *height;

                if(width>300){
                    height = area/300;
                    if(height>300){
                        tooltip.attr("style", "right:" + (innerWidth-root_x*sc-left-left_adjust)+ "px;bottom:" +(innerHeight-root_y*sc-top-bottom_adjust)+ "px;visibility: visible;width:300px;height:300px")
                    }else{
                        tooltip.attr("style", "right:" + (innerWidth-root_x*sc-left-left_adjust)+ "px;bottom:" +(innerHeight-root_y*sc-top-bottom_adjust)+ "px;visibility: visible;width:300px");
                    }
                }

            }

        });


    text = cg_g.selectAll("text")
        .data(nodes[0])
        .enter().append("text")
        .attr("class", "project_clustering_label")
        .style("fill-opacity", function (d) {
            return d.parent === root ? 0.8 : 0;
        })
        .style("display", function (d) {
            return d.parent === undefined ? "inline" : "none"; //root
        })
        .text(function (d) {
            return d.name;
        });

    cg_g
        .on("click", function () {
            zoom_Circles(root);
        });


    node = cg_g.selectAll("circle ,text");//

    zoomTo([root.x, root.y, root.r * 2 ]);



    //d3.select(self.frameElement).style("height", diameter + "px");

}

function zoom_Circles(d) {

    focus = d;
    console.log("zoom_circles() "+d);

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 ]);
            return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
        return d.r * k;
    });
}

function draw_project_legend(){

   // d3.selectAll(".legend").remove();

    var body = d3.select("#content_holder");

    var project_legend = body.append("div")
        .attr('class','legend project_layer');

    var wFactor = 10,
        hFactor = 2;


    var wBox = 1280/wFactor,//map_width / wFactor,
        hBox = 702/hFactor;//map_height / hFactor;

    var svg = project_legend
        .attr("z-index", 40)
        .append("svg")
        .attr("width", wBox)
        .attr("height", hBox)
        .append("g");

    var legend = svg
        .append('g')  
        .attr('width', wBox)
        .attr('height', hBox);
    
    var wRect = wBox / (wFactor * 0.75);
    var offsetText =  wRect / 2;
    var tr = 'translate(' + offsetText + ',' + offsetText * 3 + ')';
    var sg = legend.append('g')
        .attr('transform', tr);
    

    var area = [5,10,20];

    sg.selectAll('circle').data(area).enter().append('circle')
        .attr("class","project_legend")
        .attr('cx',wBox/2)//wBox/2)
        .style("stroke","#000")
        .style("stroke-width","0.5px")
        .attr('cy', function (d, i) {
            var y=hBox/6 *i+d;

            return y;
        }).attr('fill', 'yellow'//function (d, i) {return '#C0C0C0';}
    ).attr('r',function (d,i) {
        var s = zoom.scale();
        return Math.sqrt(d*area_unit/(Math.PI));
    }).attr("opacity",0.5);

    sg.selectAll('text').data(area).enter().append("text")
        .attr("dx",function(d){
            var x_adjust = d>=10? 7:4;
            return wBox/2-x_adjust;
        })
        .attr("dy", function(d,i){return (hBox/6 *i+d+4);})
        .text(function(d){return d});

    sg.append("text")
        .attr("dx",15)
        .attr("dy", function(d){return (hBox/6 *3+30);})
        .text("Number");
}
