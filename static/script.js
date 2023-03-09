function addMarkers(stations) {
  for (const station of stations) {
  console.log(station);
  var marker = new google.maps.Marker({
  position: {
  lat: station.position_lat,
  lng: station.position_lng,
  },
  map: map,
  title: station.name,
  station_number: station.number,
  });
  }
  }
  function getStations() {
  fetch("http://127.0.0.1:5000/stations")
  .then((response) => response.json())
  .then((data) => {
  console.log("fetch response", typeof data);
  addMarkers(data);
  });
  }
  // Initialize and add the map
  function initMap() {
  const dublin = {lat: 53.3498, lng: -6.2603};
  // The map, centered at Dublin
  map = new google.maps.Map(document.getElementById("map"), {
  zoom: 13,
  center: dublin,
  });
  // const marker = new google.maps.Marker({
  // position: dublin,
  // map: map,
  // });
  getStations();
  }
  var map = null;
  window.initMap = initMap;