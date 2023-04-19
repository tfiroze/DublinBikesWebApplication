var markers = [];
var map;
var mc;
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
//console.log(station_data)

function addMarkers(station_data,availabilityData){
  //console.log(availabilityData)
  for (const station of station_data) {
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
    markers.push(marker);
  }
}


async function getStations() {
    markers = [];
    const response = await fetch("http://127.0.0.1:5000/stations");
    data = await response.json()
    station_data = await data;
    const availabilityResponse = await fetch("http://127.0.0.1:5000/availability");
    availabilityData = await availabilityResponse.json();

    // Pass the availabilityData to the addMarkers function
    //addMarkers(station_data, availabilityData);
    setInterval(addMarkers(station_data, availabilityData), 300000);
    populateStationDropdowns(station_data); // Make sure to add this line
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
    
    //console.log(markers);
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
  //console.log(mc.markers.length);
}


function populateStationDropdowns(station_data) {
    const startDropdown = document.getElementById("search-station-start");
    const endDropdown = document.getElementById("search-station-end");
  
    for (const station of station_data) {
      const startOption = document.createElement("option");
      startOption.value = station.number;
      startOption.text = station.name;
      startDropdown.add(startOption);
  
      const endOption = document.createElement("option");
      endOption.value = station.number;
      endOption.text = station.name;
      endDropdown.add(endOption);
    }
  }
  async function handleJourneySubmit(event) {
    event.preventDefault();

    const startStation = document.getElementById("search-station-start").value;
    const endStation = document.getElementById("search-station-end").value;
    const dateTime = document.getElementById("datetime-input").value;

    console.log("Start Station:", startStation);
    console.log("End Station:", endStation);
    console.log("Date and Time:", dateTime);

    const dateObj = new Date(dateTime);
    const hour = dateObj.getHours();
    const day = dateObj.getDay();
    const minute = dateObj.getMinutes();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.toISOString().split("T")[0];

    const requestData = {
        hour,
        day,
        minute,
        month,
        date,
    };

    const startBikesResponse = await fetch(`http://127.0.0.1:5000/predict_available_bikes/${startStation}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });
    const startBikesData = await startBikesResponse.json();
    console.log("Start Station Available Bikes:", startBikesData);

    const endBikesResponse = await fetch(`http://127.0.0.1:5000/predict_available_bike_stands/${endStation}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });
    const endBikesData = await endBikesResponse.json();
    console.log("End Station Available Bike Stands:", endBikesData);

    const output = `
        <p>Start Station Available Bikes: ${startBikesData.prediction}</p>
        <p>End Station Available Bike Stands: ${endBikesData.prediction}</p>
        
    `;

    // Update the innerHTML of the journey_planner_info div
    const journeyPlannerInfo = document.querySelector("#journey_planner_info");
    journeyPlannerInfo.innerHTML = output;
}
var temp  
var weather_description
async function fetch_weather(){
  const res = await  fetch('http://127.0.0.1:5000/current_weather')
  data = await res.json()
  temp=data.temperature
  weather_description=data.weather_description
  
}
  
fetch_weather()

window.onload = function(){
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const search = document.getElementById('search');
  const menu_bar = document.getElementById('menu_bar');
  const journey_planner_menu = document.getElementById('journey_planner_menu');
  const search_station = document.getElementById('search-station');
  const submitButton = document.getElementById("submit_button");
  const journeyPlannerInfo = document.getElementById('journey_planner_info');

  
  
  search_station.addEventListener("input", searchStations);

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');
    menu_bar.classList.remove('close');
    journeyPlannerInfo.add('close');

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
  submitButton.addEventListener("click", () => 
  {
    journeyPlannerInfo.remove('close')
    handleJourneySubmit();
  });

  let time = document.getElementById("time");
  let date = document.getElementById('date');
  
  setInterval(()=> {
    let t = new Date();
    time.innerHTML = t.toLocaleTimeString();
    date.innerHTML = t.toLocaleDateString();
  }, 1000)
  fetch_weather()
  let tempe = document.getElementById("temp");
  let weather_desc = document.getElementById("weather_desc");
  tempe.innerHTML = temp + "&#176C";
  weather_desc.innerHTML = weather_description
}