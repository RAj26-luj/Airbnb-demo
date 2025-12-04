document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const token = mapDiv.dataset.token;
  const lat = parseFloat(mapDiv.dataset.lat) || 22.25;
  const lng = parseFloat(mapDiv.dataset.lng) || 84.90;

  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/standard",
    projection: "globe",
    zoom: 11,
    center: [lng, lat]
  });

  map.addControl(new mapboxgl.NavigationControl());
  map.scrollZoom.disable();

  map.on("style.load", () => {
    map.setFog({});
  });

  new mapboxgl.Marker({color: "red"})
    .setLngLat([lng, lat])
    .addTo(map);
});