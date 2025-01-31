// Create the 'basemap' tile layer that will be the background of our map
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2 - Create the 'street' tile layer as a second background of the map
let streets = L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://stamen.com">Stamen Design</a>'
});

// Create the map object with center and zoom options
let map = L.map('map', {
  center: [37.7749, -122.4194],
  zoom: 5,
  layers: [basemap]
});

// Add both layers to the map
basemap.addTo(map);
streets.addTo(map);  

// Create earthquakeLayer to hold the earthquake data
let earthquakeLayer = L.layerGroup().addTo(map);

// Make a request that retrieves the earthquake geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  
  // This function returns the style data for each of the earthquakes we plot on
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 500 ? "#FF0000" :
           depth > 300 ? "#FF7F00" :
           depth > 100 ? "#FFFF00" :
           depth > 50 ? "#7FFF00" :
           "#00FF00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3><p>${feature.properties.place}</p>`);
    }
  }).addTo(earthquakeLayer);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Add details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depthIntervals = [-10, 10, 30, 50, 70, 90];
    const colors = ["#00FF00", "#7FFF00", "#FFFF00", "#FF7F00", "#FF0000"];

    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depthIntervals[i] + (depthIntervals[i + 1] ? '&ndash;' + depthIntervals[i + 1] + ' km' : '+ km') + '<br>';
    }

    return div;
  };

  // Finally, add the legend to the map
  legend.addTo(map);

  // OPTIONAL: Add tectonic plate data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data to tectonic_plates layer and add to the map
    L.geoJson(plate_data, {
      color: "#FF5733",
      weight: 2
    }).addTo(map);
  });

});