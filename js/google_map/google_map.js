/**
 * Created by yuhao on 27/6/16.
 */

var gmap;
function initMap() {
    
    // Create an array of styles.
    var styles = [

        {
            featureType: "water",
            elementType: "geometry",
            stylers: [
                { color: "#7d7d7d" },
                { saturation: -100 },
                { lightness: 61 }
            ]
        },
        {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [
                { "color": "#ffffff" },
                { "lightness": 12 }
            ]
        }
    ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(1.353083,103.819836),//55.6468, 37.581
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };

    var g_map = document.getElementById('google_map');
    

    gmap = new google.maps.Map(g_map,
        mapOptions);

    //Associate the styled map with the MapTypeId and set it to display.
    gmap.mapTypes.set('map_style', styledMap);
    gmap.setMapTypeId('map_style');

    // Define the LatLng coordinates for the polygon's path.
    var triangleCoords = [
        {lat: 1.352083, lng: 103.82}, //1.352083,103.819836
        {lat: 1.352083, lng: 103.81},
        {lat: 1.342083, lng: 103.79},
        {lat: 1.352083, lng: 103.819836}
    ];

    var markerPos = triangleCoords[0];
        draw_polygon(triangleCoords,markerPos);


    var triangleCoords2 = [
        {lat: 1.3534, lng: 103.90}, //1.352083,103.819836
        {lat: 1.353083, lng: 103.93},
        {lat: 1.339083, lng: 103.92},
        {lat: 1.3534, lng: 103.90}
    ];
    markerPos = triangleCoords2[0];
    draw_polygon(triangleCoords2,markerPos);

}

function draw_polygon(triangleCoords,markerPos){

    // Construct the polygon.
    var bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });

    bermudaTriangle.setMap(gmap);

    var project_img = new Image();
    project_img.src = "img/project_img/"+2+"_fcl_vis.jpg";

    var contentString = " <div><div class='pic_holder Centerer'><img class='tooltip_pic' src='"+project_img.src+"'></div>" +
        "<div class='tooltip_text'><b>" + "The Singapore Project" + "</b><br> Introduction to the extraodinary life of Singaporean People</div></div>";

    var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 300
    });

    var marker = new google.maps.Marker({
        position: markerPos,
        map: gmap,
        title: 'The Info Window'
    });

    marker.addListener('click', function() {
        infowindow.open(gmap, marker);
    });
}

function load_google_map() {
    var googlem_holder = d3.select("#map_container").append("div").attr("id","googlem_holder")
        .attr("class","project_layer")
        .style("width",map_width/2+'px')
        .style("height",map_height/2+'px')
        .style("position","absolute");

    //min button
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = "close";
    closeBtn.style = "width:40px;height:30px;float:left;background-color:grey;margin-left:10px;";
    closeBtn.id = "closebtn_GM";

    document.getElementById("googlem_holder").appendChild(closeBtn);
    document.getElementById('closebtn_GM').addEventListener("click", close_GoogleMap);

    //max button
    var openBtn = document.createElement('div');
    openBtn.innerHTML = "max";
    openBtn.style = "width:40px;height:30px;float:left;background-color:grey;";
    openBtn.id = "openbtn_GM";

    document.getElementById("googlem_holder").appendChild(openBtn);
    document.getElementById('openbtn_GM').addEventListener("click", open_GoogleMap);
    //closeBtn.text("&times");

    googlem_holder.append("div") //<a href="javascript:void(0)" class="closebtn" onclick="closeNav()" style="border-bottom:0 solid red;">&times;</a>
        .attr("id","google_map")
        .style("width",map_width/2-18+'px')
        .style("height",map_height-40+'px');




    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBU5cWlAqYt_SPwMSEi1NZjbjB2JDD1PIA&callback=initMap';   //adding  'callback=something' gets the maps module to load
    document.body.appendChild(script);
}

function close_GoogleMap() {

        document.getElementById("googlem_holder").style.width = "90px";
        document.getElementById("googlem_holder").style.height = "30px";
       // document.getElementById("google_map").style.width = "1250px";

        d3.select("#google_map").style("visibility","hidden");
}

function open_GoogleMap() {

    d3.select("#googlem_holder").remove();
    load_google_map();

    document.getElementById("googlem_holder").style.width = map_width+"px";
    document.getElementById("googlem_holder").style.height = map_height+"px";

    document.getElementById("google_map").style.width = map_width-18+"px";
    document.getElementById("google_map").style.height = map_height-40+"px";

}