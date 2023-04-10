let allMarkers = [];

function addMarkerClickListener(marker, contentString) {
  var infowindow = new google.maps.InfoWindow({
    content: contentString,
  });

  
  marker.addListener("mouseover", () => {
    infowindow.open(map, marker);
  });

  marker.addListener("mouseout", () => {
    infowindow.close();
  });

}

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
      icon: {
        url: "../images/icons8-bike-parking-100.png",
        scaledSize: new google.maps.Size(35, 35),
      },
    });

    var contentString = `
      <div>
        <h3>${station.name}</h3>
        <p>Status: ${station.status}</p>
        <p>Available Bikes: ${station.available_bikes}</p>
        <p>Available Bike Stands: ${station.available_bike_stands}</p>
      </div>
    `;

    addMarkerClickListener(marker, contentString);
    allMarkers.push(marker);
  }
}



function searchStations() {
  const searchText = this.value.toLowerCase();

  allMarkers.forEach(marker => {
    const markerTitle = marker.getTitle().toLowerCase();

    if (markerTitle.includes(searchText)) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });
}

function getStations(callback) {
  fetch("http://127.0.0.1:5000/stations")
    .then((response) => response.json())
    .then((data) => {
      console.log("fetch response", typeof data);
      addMarkers(data);
      
      if (callback) {
        callback();
      }
    });
}

function initMap() {
  const dublin = { lat: 53.3498, lng: -6.2603 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: dublin,
  });

  getStations(() => {
    const searchInput = document.getElementById("search-station");
    searchInput.addEventListener("input", searchStations);
  });
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


