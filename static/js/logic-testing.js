// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL
 d3.json(queryUrl, function(data) {
   // Once we get a response, send the data.features object to the createFeatures function
   console.log(data)
   createFeatures(data.features)
   });

 var earthquakes = new L.LayerGroup();
 var tectonicPlates = new L.LayerGroup();

 function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
    }
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

 function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
      });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Light Map": outdoors,
      "Dark Map": darkmap,
      "Satellite Map": satellite
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": tectonicPlates
    };
  
    // Create our map, giving it the outdoors and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 3,
      layers: [satellite, earthquakes]
    });
  
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);



    d3.json(queryUrl, function(earthquakeData) {
        // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
        function markerSize(magnitude) {
            if (magnitude !== 0) {
              return magnitude * 5;
            }
            return magnitude * 1;
        }

        // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
        function styleInfo(feature) {
            return {
              opacity: 1,
              fillOpacity: .7,
              fillColor: getColor(feature.properties.mag),
              color: "black",
              radius: markerSize(feature.properties.mag),
              stroke: true,
              weight: 0.5
            };
        }
        // Function to Determine Color of Marker Based on the Magnitude of the Earthquake

        function getColor(magnitude) {
            return  magnitude > 5 ? '#f06b6b' :
                    magnitude > 4 ? '#f0a76b' :
                    magnitude > 3 ? '#f3b94d' :
                    magnitude > 2 ? '#f3db4d' :
                    magnitude > 1 ? '#e0f34d' :
                              '#98ee00';
        }

    // Create tectonic plate layer
    d3.json(platesUrl, function(plates) {
        // sanity check data call
        console.log(plates)
        // Creating a geoJSON layer with the retrieved data
        L.geoJson(plates, {
        // Style each feature - lines only
        style: function(feature) {
        return {
            color: "#f2b84e",
            fillOpacity: 0
        }
        }
        // Add plate data to tectonicPlates LayerGroups 
        }).addTo(tectonicPlates);
    
      });

        // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
        L.geoJSON(earthquakeData, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },
            style: styleInfo,
            // Function to Run Once For Each feature in the features Array
            // Give Each feature a Popup Describing the Place & Time of the Earthquake
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<b>Location: </b>" + feature.properties.place + 
                "</p><hr><b><p>Magnitude: </b>" + feature.properties.mag + "</p>" + 
                "<hr><b><p>Date & Time: </b>" + new Date(feature.properties.time) 
                );
            }
        // Add earthquakeData to earthquakes LayerGroups 
        }).addTo(earthquakes);
    
    // Set earthquakes layer to always be on top of the tectonicplates layer
    myMap.on("overlayadd", function (event) {
      earthquakes.bringToFront();
    });

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            levels = [0, 1, 2, 3, 4, 5]
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    // Adding legend to the map
    legend.addTo(myMap);



});
}
