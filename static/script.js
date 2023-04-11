// Initialize and add the map
  function initMap() {
    var markers =[];
    const dublin = {lat: 53.3498, lng: -6.2603};
    // The map, centered at Dublin
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: dublin,
      disableDefaultUI: true,
    });
    
    async function getStations() {
      const response = await fetch("http://127.0.0.1:5000/stations");
      data = await response.json()
      var station_data = await data;
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
    getStations();
    console.log(markers);
    var mc = new markerClusterer.MarkerClusterer({ map:map});
    console.log(mc);
    mc.markers = markers;
  }
var map = null;
window.initMap = initMap;

window.onload = function(){
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const search = document.getElementById('search');
  const menu_bar = document.getElementById('menu_bar');
  const journey_planner_menu = document.getElementById('journey_planner_menu');

  journey_planner_menu.style.opacity = 0


  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');

  });

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

