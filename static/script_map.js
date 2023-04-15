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
console.log(station_data)
function addMarkers(stations, availabilityData) {
  for (const station of stations) {
    //console.log(station);
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

    let availability;
    for (const a of availabilityData) {
      if (parseInt(a.number) === parseInt(station.number)) {
        availability = a;
        break;
      }
    }

    //console.log('Availability data:', availability); // Add this console log

    // Check if availability data exists for the station
    if (availability) {
      var contentString = `
        <div>
          <h3>${station.name}</h3>
          <p>Status: ${availability.status}</p>
          <p>Available Bikes: ${availability.available_bikes}</p>
          <p>Available Bike Stands: ${availability.available_bike_stands}</p>
          <p>Last Update: ${availability.time}</p>
        </div>
      `;
      addMarkerClickListener(marker, contentString);
    } else {
      console.warn(`No availability data found for station ${station.number}`);
    }
    allMarkers.push(marker);
  }
}

function getAvailability() {
  return fetch("http://127.0.0.1:5000/availability")
    .then((response) => response.json());
}

function getStations(callback) {
  fetch("http://127.0.0.1:5000/stations")
    .then((response) => response.json())
    .then((stationData) => {
      console.log("Station data: ", stationData); // Add this console log
      getAvailability().then((availabilityData) => {
        console.log("Availability data: ", availabilityData); // Add this console log
        addMarkers(stationData, availabilityData);

        if (callback) {
          callback();
        }
      });
    });
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
function populateDatalist(stations) {
  const datalist = document.getElementById("station-names");

  for (const station of stations) {
    const option = document.createElement("option");
    option.value = station.name;
    datalist.appendChild(option);
  }
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

window.onload = function () {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById("help");
  const search = document.getElementById("search");
  const journey_icon = document.getElementById("journey_icon");

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


