var markers = [];
var map;
var mc;

function addMarkers(station_data){
  for (const station of station_data) {
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
  }
}

async function getStations() {
  markers = [];
  const response = await fetch("http://127.0.0.1:5000/stations");
  data = await response.json()
  var station_data = await data;
  addMarkers(station_data);
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
    getStations()
    console.log(markers);
    mc = new markerClusterer.MarkerClusterer({ map:map});
    // console.log(mc);
    mc.markers = markers;
  }
window.initMap = initMap;

function searchStations() {
  mc.removeMarkers(markers);
  const searchText = this.value.toLowerCase();

  if (searchText == '') {
    getStations();
    mc.markers = markers;
    return;
  }
  var station_result = [];
  markers.forEach(marker => {
    const markerTitle = marker.getTitle().toLowerCase();
    if (markerTitle.includes(searchText)) {
      station_result.push(marker)
      marker.setMap(map);
    }
  });
  mc.markers = station_result;
  console.log(mc.markers.length);
}

window.onload = function(){
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const search = document.getElementById('search');
  const menu_bar = document.getElementById('menu_bar');
  const journey_planner_menu = document.getElementById('journey_planner_menu');
  const search_station = document.getElementById('search-station');
  const icon_result_start = document.getElementById('icon_result_start');
  const icon_result_end = document.getElementById('icon_result_end');
  const start_search = document.getElementById('search-station-start');
  const end_search = document.getElementById('search-station-end');
  const journey_planner_submit = document.getElementById('journey_planner_submit');


  search_station.addEventListener("input", searchStations);

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');
    menu_bar.classList.remove('close');

  });

  journey_planner_submit.addEventListener("click", () => {
    
  })

  journey_planner.addEventListener("click", () => 
    {
      if (sidebar.classList.contains('close'))
        {
          sidebar.classList.toggle("close");
        }
    else {
        menu_bar.classList.add('close');
        journey_planner_menu.classList.remove('close');
        $('#journey_planner_menu').animate({opacity:0},0);
        $('#journey_planner_menu').animate({opacity:1},500);
    }
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

