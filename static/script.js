var markers = [];
var map;
var mc;
var directionService;
var directionRenderer;
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
    document.getElementById("big-loader").style.display="none";

    // Pass the availabilityData to the addMarkers function
    //addMarkers(station_data, availabilityData);
    setInterval(addMarkers(station_data, availabilityData), 300000);
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
var code
var weathicon
async function fetch_weather(){
  const res = await  fetch('http://127.0.0.1:5000/current_weather')
  data = await res.json()
  temp=data.temperature
  weather_description=data.weather_description
  code=data.weather_code
  if (code>=1 && code<=3){
    weathicon="fa-solid fa-cloud"
  }
  else if (code>=12 && code<=23 || code>=51 && code<=67 || code>=80 && code<=82){
    weathicon="fa-solid fa-cloud-rain"
  }
  else if (code==0){
    weathicon="fa-regular fa-sun"
  }
  else if (code>=37 && code<=40){
    weathicon="fa-solid fa-wind"
  }
  else if (code>=4 && code<=11 || code>=45 && code<=48){
    weathicon="fa-solid fa-smog"
  }
  else if (code>=24 && code<=32 || code>=71 && code<=77 || code==85 || code==86){
    weathicon="fa-regular fa-snowflake"
  }
  else if (code>=33 && code<=36 || code>=95 && code<=99){
    weathicon="fa-solid fa-cloud-bolt"
  }
  else(
    weathicon="fa-solid fa-cloud-sun-rain"
  )
  let tempe = document.getElementById("temp");
  let weather_desc = document.getElementById("weather_desc");
  let weather_icon = document.getElementById("weather_icon");
  let dublin = document.getElementById("dublin-weather");
  
  document.getElementById("right-loader").style.display = "none";
  document.getElementById("weather-right").style.margin = "0px";

  tempe.innerHTML = temp + "&#176C";
  dublin.innerHTML = "Dublin";
  weather_desc.innerHTML = weather_description
  weather_icon.className = weathicon
  
}
  

async function nearestStation(place){
  var shortestDistance = Infinity;
  var shortestDistanceMarker;
  
  await Promise.all(markers.map(async marker => {
    let distance = await findDirection(place, marker, false);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      shortestDistanceMarker = marker;
    }
  }));
  findDirection(place, shortestDistanceMarker, true);
  return shortestDistanceMarker;
}

async function findDirection(start, end, display, mode="WALKING"){

  directionService = new google.maps.DirectionsService();
  directionRenderer = new google.maps.DirectionsRenderer({
    map:map,
    polylineOptions: {
      strokeColor: "#000000",
      strokeOpacity: 1,
      strokeWeight: 4,
      strokeDasharray: '10 10',
    },
  });

  if (mode == "DRIVING"){
    directionRenderer.setOptions({
      polylineOptions: {
        strokeColor: "#0034FF",
        strokeOpacity: 1,
        strokeWeight: 4,
        strokeDasharray: '10 10',
      },
    })
  }

  var distance;
  const request = {
    origin: start.getPosition(),
    destination: end.getPosition(),
    travelMode: 'WALKING'
  }
  await directionService.route(request, function (result, status) {
    if (status == "OK") {
      if(display)
      {
        directionRenderer.setDirections(result);
      }
      distance = result.routes[0].legs[0].distance.value;
    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
  return distance;
}

async function searchPlaces(field){
  return new Promise(async (resolve, reject) => {
    const autocomplete = new google.maps.places.Autocomplete(field);
    const place_marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, 0),
    });
    autocomplete.addListener("place_changed", async function () 
    {
      const place = autocomplete.getPlace();
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      place_marker.setPosition(place.geometry.location);
      place_marker.setVisible(true);
      place_marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      var near = await nearestStation(place_marker);
      resolve(near);
    });
  });
}

window.onload = function(){
  document.getElementById("big-loader").style.scale="5"
  document.getElementById("big-loader").style.transform="translateY(120%)"
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const help_menu = document.getElementById('help_menu');

  const search = document.getElementById('search');
  const menu_bar = document.getElementById('menu_bar');
  const journey_planner_menu = document.getElementById('journey_planner_menu');
  const search_station = document.getElementById('search-station');
  const submitButton = document.getElementById("submit_button");
  const journeyPlannerInfo = document.getElementById('journey_planner_info');
  
  
  
  
  
  search_station.addEventListener("click", async function() {
    journey_planner.classList.add('close');
    help_menu.classList.add('close');
    console.log(await searchPlaces(search_station));
  })
  

  
  
  
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');
    menu_bar.classList.remove('close');
    journeyPlannerInfo.classList.add('close');

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
    journeyPlannerInfo.classList.remove('close')
    handleJourneySubmit();
  });

  let time = document.getElementById("time");
  let date = document.getElementById("date");

  
  setInterval(()=> {
    let t = new Date();
    document.getElementById("left-loader").style.display = "none";
    time.innerHTML = t.toLocaleTimeString();
    date.innerHTML = t.toLocaleDateString();
  }, 1000)
  fetch_weather()

}
