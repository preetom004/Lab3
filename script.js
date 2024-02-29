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

    // Initialize OverlappingMarkerSpiderfier
    var oms = new OverlappingMarkerSpiderfier(map);

    // Define custom pop-up content function
    function onEachFeature(feature, layer) {
        var popupContent = "<p><strong>Issued Date:</strong> " + feature.properties.issueddate + "</p>" +
                           "<p><strong>Work Class Group:</strong> " + feature.properties.workclassgroup + "</p>" +
                           "<p><strong>Contractor Name:</strong> " + feature.properties.contractorname + "</p>" +
                           "<p><strong>Community Name:</strong> " + feature.properties.communityname + "</p>" +
                           "<p><strong>Original Address:</strong> " + feature.properties.originaladdress + "</p>";
        layer.bindPopup(popupContent);
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
                L.geoJSON(data, {
                    onEachFeature: onEachFeature // Call onEachFeature for each feature
                }).addTo(oms); // Add markers to OverlappingMarkerSpiderfier
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    // Add listener for marker clicks
    var popup = new L.Popup();
    oms.addListener('click', function(marker) {
        popup.setContent(marker.desc);
        popup.setLatLng(marker.getLatLng());
        map.openPopup(popup);
    });

    // Add listener for spiderfy event
    oms.addListener('spiderfy', function(markers) {
        map.closePopup();
    });
});
