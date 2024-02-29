document.addEventListener("DOMContentLoaded", function() {
    // Initialize Leaflet map
    var map = L.map('map').setView([51.0447, -114.0719], 12); // Calgary coordinates

    // Add base map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize Flatpickr date range picker
    flatpickr("#date-range-picker", {
        mode: "range",
        dateFormat: "Y-m-d" // Set date format
    });    

    // Add Stamen Watercolor tile layer
    //var layer = new L.StamenTileLayer('watercolor');
    //map.addLayer(layer);

    var cluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true, 
        spiderfyDistanceMultiplier: 2     
    });
    var oms = new OverlappingMarkerSpiderfier(map);

    // Define custom pop-up content function
    function onEachFeature(feature, layer) {
        var popupContent = "<p><strong>Issued Date:</strong> " + feature.properties.issueddate + "</p>" +
                           "<p><strong>Work Class Group:</strong> " + feature.properties.workclassgroup + "</p>" +
                           "<p><strong>Contractor Name:</strong> " + feature.properties.contractorname + "</p>" +
                           "<p><strong>Community Name:</strong> " + feature.properties.communityname + "</p>" +
                           "<p><strong>Original Address:</strong> " + feature.properties.originaladdress + "</p>";
        
        latlong = feature.geometry.coordinates
        if(latlong[0] | latlong [1]){  //If latlong exists
            temp_marker = new L.marker([latlong[1], latlong[0]]).addTo(cluster);    
            oms.addMarker(temp_marker)
        }
        layer.bindPopup(popupContent);
        // oms.addMarker(new L.Marker(new L.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])))
    }

    // Handle search button click event
    document.getElementById('search-btn').addEventListener('click', function() {
        var selectedDates = document.getElementById('date-range-picker').value;
        // Perform search query using selectedDates
        // Plot search results on Leaflet map
        var apiUrl = "https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate>'" + selectedDates.split(" to ")[0] + "' AND issueddate<'" + selectedDates.split(" to ")[1] + "'";
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const geojsonData =  L.geoJSON(data, {
                    onEachFeature: onEachFeature // Call onEachFeature for each feature
                }); // Add markers to OverlappingMarkerSpiderfier
                for (var key in geojsonData._layers){
                    coord = geojsonData._layers[key]['feature']['geometry']['coordinates'];
        
                    for (let i = 0; i < coord.length; i++)  {
        
                        var latlong = coord[i] 
                        var popCont = geojsonData._layers[key]['_popup']['_content'];  
        
                        if(latlong[0] | latlong [1]){  //If latlong exists
                            temp_marker = L.marker([latlong[1], latlong[0]], {icon: red_icon}).bindPopup(popCont).addTo(cluster);    
                            oms.addMarker(temp_marker)
                        }
                    }        
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    cluster.addTo(map); 
    
        
        //Add Cluster Layer to Map so that user can interact with it
        

        //Add to layer control
        // control.addOverlay(cluster,"Building Permits");

});
