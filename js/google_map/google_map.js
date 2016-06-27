/**
 * Created by yuhao on 27/6/16.
 */


function initMap() {
    
    // Create an array of styles.
    var styles = [

        {  featureType: "all",
            stylers: [
                { hue: "#00ffe6"},//
                { saturation: -100 }
            ]
        },

        {
            featureType: "administrative.country",
            elementType: "geometry.fill",
            stylers: [
                {color:"white"},
                { saturation: 10 },
                { visibility: "simplified" }
            ]
        },{
            featureType: "road",
            elementType: "geometry",
            stylers: [
                //{ lightness: 100 },
                { visibility: "simplified" }
            ]
        },{
            featureType: "road",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
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
        center: new google.maps.LatLng(1.352083,103.819836),//55.6468, 37.581
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };

    var g_map = document.getElementById('google_map');
    

    var map = new google.maps.Map(g_map,
        mapOptions);

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');

    // Define the LatLng coordinates for the polygon's path.
    var triangleCoords = [
        {lat: 25.774, lng: -80.190},
        {lat: 18.466, lng: -66.118},
        {lat: 32.321, lng: -64.757},
        {lat: 25.774, lng: -80.190}
    ];

    // Construct the polygon.
    var bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });
    bermudaTriangle.setMap(map);
}

function load_google_map() {
    var googlem_holder = d3.select("#map_container").append("div").attr("id","googlem_holder")
        .attr("class","project_layer");

    //min button
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = "close";
    closeBtn.style = "border:2px solid red;width:30px;height:30px;float:right";
    closeBtn.id = "closebtn_GM";

    document.getElementById("googlem_holder").appendChild(closeBtn);
    document.getElementById('closebtn_GM').addEventListener("click", close_GoogleMap);

    //max button
    var openBtn = document.createElement('div');
    openBtn.innerHTML = "max";
    openBtn.style = "border:2px solid red;width:30px;height:30px;float:right";
    openBtn.id = "openbtn_GM";

    document.getElementById("googlem_holder").appendChild(openBtn);
    document.getElementById('openbtn_GM').addEventListener("click", open_GoogleMap);
    //closeBtn.text("&times");

    googlem_holder.append("div") //<a href="javascript:void(0)" class="closebtn" onclick="closeNav()" style="border-bottom:0 solid red;">&times;</a>
        .attr("id","google_map");




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

    document.getElementById("googlem_holder").style.width = "1250px";
    document.getElementById("googlem_holder").style.height = "730px";

    document.getElementById("google_map").style.width = "1250px";
    document.getElementById("google_map").style.height = "700px";

}