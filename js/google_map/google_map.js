/**
 * Created by yuhao on 27/6/16.
 */

var gmap;
var googlem_holder;
var center;
function initMap() {
    load_google_map();
    //googlem_holder.style("visibility","hidden");

    // Create an array of styles.
    var styles = [

        {
            featureType: "water",
            elementType: "geometry",
            stylers: [
                { color: "#bcbcbc" },
                { lightness: 40 }
            ]
        },
        {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [
                { "color": "#ffffff" },
                { "lightness": 40}
            ]
        },
        {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [
                { "color": "#000000" },
                { "lightness": 40}
            ]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { lightness: 71 },
                { saturation: -100 },
                {color:"#B3B6B7"},
                { visibility: "off" }//"simplified"
            ]
        }
    ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    center = new google.maps.LatLng(1.353083,103.819836);

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
        zoom: 11,
        center: center,//55.6468, 37.581
       mapTypeControl:false
        /* mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }*/
    };

    var g_map = document.getElementById('google_map');
    

    gmap = new google.maps.Map(g_map, mapOptions);

    //Associate the styled map with the MapTypeId and set it to display.
    gmap.mapTypes.set('map_style', styledMap);
    gmap.setMapTypeId('map_style');
    gmap.setOptions({minZoom:11});

    // restrict the appropriate region for users
    var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(1.1059477218902916, 103.38930926660157),
        new google.maps.LatLng(1.600193102239492, 104.25036273339845)
    );

    var lastValidCenter = gmap.getCenter();

    google.maps.event.addListener(gmap, 'center_changed', function() {
        if (allowedBounds.contains(gmap.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = gmap.getCenter();

            return;
        }

        // not valid anymore => return to last valid position
        gmap.panTo(lastValidCenter);
    });

    /*var initialBounds;
    google.maps.event.addListener(gmap, 'bounds_changed', function() {
        try {
            if( initialBounds == null ) {
                initialBounds = gmap.getBounds();
                console.log("initial_Bounds = "+initialBounds);
            }
        } catch( err ) {
            alert( err );
        }
    });*/

    // Define the LatLng coordinates for the polygon's path.
    var triangleCoords = [
        {lat: 1.3534, lng: 103.90}, //1.352083,103.819836
        {lat: 1.353083, lng: 103.93},
        {lat: 1.339083, lng: 103.90},
        {lat: 1.3534, lng: 103.90}
       /*{lat: 1.352083, lng: 103.82}, //1.352083,103.819836
        {lat: 1.352083, lng: 103.81},
        {lat: 1.342083, lng: 103.79},
        {lat: 1.352083, lng: 103.819836}*/
    ];

    var markerPos = triangleCoords[0];
        draw_polygon(triangleCoords,markerPos,'#1E90FF');


    var triangleCoords2 = [
        {lat: 1.3534, lng: 103.90}, //1.352083,103.819836
        {lat: 1.353083, lng: 103.93},
        {lat: 1.339083, lng: 103.92},
        {lat: 1.3534, lng: 103.90}
    ];
    markerPos = triangleCoords2[0];
    draw_polygon(triangleCoords2,markerPos,'#FF0000');


    var triangleCoords3 = [
        {lat: 1.38434614, lng: 103.70413623}, //1.352083,103.819836
        {lat: 1.38812158, lng: 103.77383075},
        {lat: 1.33732419, lng: 103.73400531},
        {lat: 1.38434614, lng: 103.70413623}
    ];

    var markerPos3 = triangleCoords3[0];
    draw_polygon(triangleCoords3,markerPos3,'#1E90FF');


}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

function draw_polygon(triangleCoords,markerPos,fillcolor){

    // Construct the polygon.
    var bermudaTriangle = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: fillcolor,
        strokeOpacity: 0.35,
        strokeWeight: 2,
        fillColor: fillcolor,
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

    var defaultIcon = makeMarkerIcon('FFFF24');
    var highlightedIcon = makeMarkerIcon('E74C3C');

    var marker = new google.maps.Marker({
        position: markerPos,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        map: gmap,
        title: 'The Info Window'
    });

    marker.addListener('click', function() {
        infowindow.open(gmap, marker);
    });

    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
        bermudaTriangle.set("strokeColor",'red');
        bermudaTriangle.set("fillColor",'red');
    });


    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
        bermudaTriangle.set("strokeColor",fillcolor);
        bermudaTriangle.set("fillColor",fillcolor);
    });

    bermudaTriangle.addListener('click', function() {
        infowindow.open(gmap, marker);
    });

    bermudaTriangle.addListener('mouseover', function() {
        marker.setIcon(highlightedIcon);
        this.set("strokeColor",'red');
        this.set("fillColor",'red');
    });

    bermudaTriangle.addListener('mouseout', function() {
        marker.setIcon(defaultIcon);
        this.set("strokeColor",fillcolor);
        this.set("fillColor",fillcolor);
    });

    //bermudaTriangle.bindTo('strokeColor',marker,'strokeColor');
    //bermudaTriangle.setOptions({clickable:false});
}

function load_google_map() {
    //if(googlem_holder !=undefined)googlem_holder.remove();
    googlem_holder = d3.select("#content_holder").append("div").attr("id","googlem_holder")
        //.attr("class","project_layer")
        //.style("width",map_width/2+'px')
        //.style("height",map_height/2+'px')
        .style("position","absolute")
        .style("visibility","hidden");
    
    var toggle_switchHolder = document.createElement('div');
    //toggle_switchHolder.innerHTML = "Google Map";
    toggle_switchHolder.id = "toggle_GM";

    var text = document.createElement('div');
    text.className = 'text_box';
    text.innerHTML = 'SG Projects';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'switch-input';
    input.onchange = function() {handle_switch()};

    var toggle_slider= document.createElement('div');
    toggle_slider.className = 'toggle_slider round';
    

    var label =  document.createElement('label');
    label.className = 'toggle_switch';

    label.appendChild(input);
    label.appendChild(toggle_slider);
    toggle_switchHolder.appendChild(label);
    document.getElementById("googlem_holder").appendChild(text);
    document.getElementById("googlem_holder").appendChild(toggle_switchHolder);
    //end of toggle switch

    googlem_holder.append("div")//<a href="javascript:void(0)" class="closebtn" onclick="closeNav()" style="border-bottom:0 solid red;">&times;</a>
        .attr("id","google_map");
    
}

/*make google visible*/
function display_googleM(){
    googlem_holder.style("visibility","visible");
}

function display_NogoogleM() {
    googlem_holder.style("visibility","hidden");
}

function close_GoogleMap() {

        document.getElementById("googlem_holder").style.width = "190px";
        document.getElementById("googlem_holder").style.height = "40px";
       // document.getElementById("google_map").style.width = "1250px";

        d3.select("#google_map").style("visibility","hidden");
}

function open_GoogleMap() {

    //d3.select("#googlem_holder").remove();
    //load_google_map();

    d3.select("#google_map").style("visibility","visible");
    document.getElementById("googlem_holder").style.width = innerWidth+"px";
    document.getElementById("googlem_holder").style.height = innerHeight+"px";

    //document.getElementById("google_map").style.width = document.getElementById("googlem_holder").style.width*0.8+"px";
    //document.getElementById("google_map").style.height = document.getElementById("googlem_holder").style.height*0.9+"px";

    resize_GoogleMap();
    //google.maps.event.trigger(gmap, 'resize');
    //gmap.panTo(center);

}

function resize_GoogleMap() {

    //d3.select("#googlem_holder").remove();
    //load_google_map();

    d3.select("#google_map").style("visibility","visible");
    //document.getElementById("googlem_holder").style.width = innerWidth+"px";
    //document.getElementById("googlem_holder").style.height = innerHeight+"px";

    var holder_width = document.getElementById("googlem_holder").offsetWidth*0.98;
    var holder_height = document.getElementById("googlem_holder").offsetHeight*0.99-50;

    document.getElementById("google_map").style.width = holder_width+"px";
    document.getElementById("google_map").style.height = holder_height+"px";

    google.maps.event.trigger(gmap, 'resize');
    gmap.panTo(center);

}

function handle_switch(){
    var input = document.getElementsByClassName('switch-input');

        var res = input[0].checked;

    if(res){
        open_GoogleMap();
    }else{

        close_GoogleMap();
    }
}