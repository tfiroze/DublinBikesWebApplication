var markers =[];
var markerClusterer;
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
    markers.push(marker);
    markerClusterer.addMarkers(marker);
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
      disableDefaultUI: true,
    });
    // const marker = new google.maps.Marker({
    // position: dublin,
    // map: map,
    // });
    new markerClusterer.MarkerClusterer(map, [], {imagePath: 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js'});
    getStations();

    
  }
  var map = null;
  window.initMap = initMap;

window.onload = function(){
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const search = document.getElementById('search');
  const journey_icon = document.getElementById('journey_icon')

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    search.classList.remove("journey");
    help.classList.remove("journey");
  });

  journey_planner.addEventListener("click", () => {
    journey_planner 
    sidebar.classList.toggle("close");
    search.classList.toggle("journey");
    help.classList.toggle("journey");
    journey_icon.classList.toggle("journey")
  });


  help.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });

  search.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });

  let time = document.getElementById("time");
  let date = document.getElementById('date');
  setInterval(()=> {
    let t = new Date();
    time.innerHTML = t.toLocaleTimeString();
    date.innerHTML = t.toLocaleDateString();
  }, 1000)



}
