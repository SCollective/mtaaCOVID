
var map = L.map('map', {
    zoom: 13,
    attributionControl: true,
    center: L.latLng([-1.289550, 36.835718]),
  }),
  osmLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  styledLayer = new L.TileLayer(
      'https://api.mapbox.com/styles/v1/simoa/ck9b75c7c0cnb1iqsw0lwm72c/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ltb2EiLCJhIjoiX216YUw5NCJ9.q3fbwUbgxeh55HSI2kvWbQ', {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);



//STYLE
//areas style
var style = {
    "color":"red",
    "weight": 0,
    "opacity": 1,
    "fillColor": "#4f4e4d",
    "fillOpacity": 0
};

//point style
function feelingColor(b) {
    return b == 'color0' ? '#d7191c' :
           b == 'color1' ? '#ed6e43' :
           b == 'color2' ? '#feba6f' :
           b == 'color3' ? '#ffe8a5' :
           b == 'color4' ? '#e6f5a8' :
           b == 'color5' ? '#b3df76' :
                      '#1a9641';
}

function ratingStyle(feature,map) {
    return { 
        opacity:1,
        radius: 8,
        weight:2,
        fillColor: feelingColor(feature.properties.Color),
        fillOpacity:1
    };
}

//MAP INTERACTIONS
function zoomToStory(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachStory(feature, layer) {
    layer.bindPopup(feature.properties.Descriptio);
    layer.on({
        click: zoomToStory   
    });
}

//polygon
function onEachZone(feature, layer) {
    map.fitBounds(layer.getBounds());
}


function iconByName(name) {
  return '<i class="icon icon-'+name+'"></i>';
}

function featureToMarker(feature, latlng) {

  return L.circleMarker(latlng, {
    opacity:0.5,
    radius: 5,
    weight:0.8,
    fillColor: feelingColor(feature.properties.Color),
    fillOpacity:1
    // icon: L.divIcon({
    //  className: 'marker-'+feature.properties.amenity,
    //  html: iconByName(feature.properties.amenity),
    //  iconUrl: '../images/markers/'+feature.properties.amenity+'.png',
    //  iconSize: [25, 41],
    //  iconAnchor: [12, 41],
    //  popupAnchor: [1, -34],
    //  shadowSize: [41, 41]
    // })
  });
}

//data
$.ajax({
        url : ' https://api.spatialcollective.com/api/coronaData',
        async: false,
        global: false,
        dataType: "json",
        crossDomain: true,
        data:'data',
        //jsonp:'format_options=callback:callback:processMarkers',
        success: function(data) {
          messages=data;
          console.log(messages.length); 
        }
    });
var markerGroup = L.featureGroup([]).addTo(map);
for (var i = messages.length - 1; i >= 0; i--) {
  var latlng = L.latLng([messages[i].latitude, messages[i].longitude]);
  L.circleMarker(latlng,{
    opacity:0,
    radius: 8,
    weight:0.9,
    fillColor: feelingColor(messages[i].color),
    fillOpacity:1
  }).bindPopup(messages[i].description).addTo(map);
}



//LEGENDS

//feel color legend
var legend_feeling = L.control({position: 'bottomleft'});

legend_feeling.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += "<h4>How do you feel? </h4>";
  div.innerHTML += '<i style="background: #d7191c"></i><span>Terrible</span><br>';
  div.innerHTML += '<i style="background: #ed6e43"></i><span>Very Bad</span><br>';
  div.innerHTML += '<i style="background: #feba6f"></i><span>Bad</span><br>';
  div.innerHTML += '<i style="background: #ffe8a5"></i><span>Okay</span><br>';
  div.innerHTML += '<i style="background: #e6f5a8"></i><span>Good</span><br>';
  div.innerHTML += '<i style="background: #b3df76"></i><span>Very Good</span><br>';
  div.innerHTML += '<i style="background: #1a9641"></i><span>Great</span><br>';
  return div;
};

map.addControl(legend_feeling);


// base layer switcher
var baseLayers = [
  {
    name: "Base Map",
    layer: styledLayer
  },
  {
    name: "OpenStreetMap",
    layer: osmLayer
  }
];



var base = L.control.panelLayers(baseLayers, null,  {
    position: 'topright',
    compact: true
}).addTo(map);


//legend select settlement
var legend = L.control({position: 'topright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += "<h4>Settlement </h4>";
    div.innerHTML += '<select class="target"><option selected="selected" disabled="disabled">Select a Settlement</option><option value="mathare">Mathare</option><option value="kibera">Kibera</option></select>';
    //div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
legend.addTo(map);

//legend table
var legend_table = L.control({position: 'bottomright'});
legend_table.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<div id="accordion"><h3>Click to view messages</h3><div><table id="example" class="display" width="100%"></table></div></div>';
    //div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
legend_table.addTo(map);


//select a Settlement
$( ".target" ).change(function() {
  var settlement = $( ".target option:selected" ).val();
  console.log(settlement);
  var areas = L.geoJson(zones,{style:style,
    filter: function settlementFilter(feature) {
                  if (feature.properties.name === settlement) return true
                  }
  });
  map.fitBounds(areas.getBounds());

});

//TABLES
$( function() {
  $( "#accordion" ).accordion({
    collapsible: true,
    active: false
  });
} );

$('#example').DataTable( {
    bFilter:false,
    ordering:false,
    scrollY: "300px",
    info:false,
    fixedColumns: true,
    data: messages,
    columns: [
        { data: "description", "width": "20px" }
    ],
    rowCallback: function( row, data, index ) {
          if ( data.color == "color0" )
          {
              $('td', row).css('background-color', '#d7191c');
          }
          else if ( data.color == "color1" )
          {
              $('td', row).css('background-color', '#ed6e43');
          }
          else if ( data.color == "color2" )
          {
              $('td', row).css('background-color', '#feba6f');
          }
          else if ( data.color == "color3" )
          {
              $('td', row).css('background-color', '#ffe8a5');
          }
          else if ( data.color == "color4" )
          {
              $('td', row).css('background-color', '#e6f5a8');
          }
          else if ( data.color == "color5")
          {
              $('td', row).css('background-color', '#b3df76');
          }
          else
          {
              $('td', row).css('background-color', '#1a9641');
          }
    }


} );

