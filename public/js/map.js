// Get map container
const mapDiv = document.getElementById("map");

// Access token
mapboxgl.accessToken = mapDiv.dataset.token;

// Debugging
console.log(mapDiv);
console.log(mapDiv.dataset);
console.log(mapDiv.dataset.coordinates);

// Get coordinates (declare only once)
const coordinates = JSON.parse(mapDiv.dataset.coordinates);

// Create map
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9
});

// Add marker
const marker = new mapboxgl.Marker({
    color:"red"
})
    .setLngLat(coordinates)
    .addTo(map);