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

    var cluster = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true, 
        spiderfyDistanceMultiplier: 2     
    });
    var oms = new OverlappingMarkerSpiderfier(map);

    // Handle search button click event
    document.getElementById('search-btn').addEventListener('click', function() {
        var selectedDates = document.getElementById('date-range-picker').value;
        // Perform search query using selectedDates
        // Plot search results on Leaflet map
        var apiUrl = "https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate>'" + selectedDates.split(" to ")[0] + "' AND issueddate<'" + selectedDates.split(" to ")[1] + "'";
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                cluster.clearLayers(); // Clear previous markers
                data.features.forEach(feature => {
                    var coordinates = feature.geometry.coordinates;
                    if (coordinates && coordinates.length === 2) { // Check if valid coordinates
                        var popupContent = "<p><strong>Issued Date:</strong> " + feature.properties.issueddate + "</p>" +
                                           "<p><strong>Work Class Group:</strong> " + feature.properties.workclassgroup + "</p>" +
                                           "<p><strong>Contractor Name:</strong> " + feature.properties.contractorname + "</p>" +
                                           "<p><strong>Community Name:</strong> " + feature.properties.communityname + "</p>" +
                                           "<p><strong>Original Address:</strong> " + feature.properties.originaladdress + "</p>";
                        var marker = L.marker([coordinates[1], coordinates[0]])
                                      .bindPopup(popupContent)
                                      .addTo(cluster);
                        oms.addMarker(marker);
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    cluster.addTo(map); 
});
