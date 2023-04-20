var markers = [];
var map;
var mc;
var directionService;
var directionRenderer;
const dublin = {lat: 53.3498, lng: -6.2603};
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
  }

  // Initialize and add the map
  function initMap() {
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

  async function handleJourneySubmit(start, end) {

    const startStation = 114;
    const endStation = 91;
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

    // Update the innerHTML of the journey_planner_info div
    const startDestAvailability = document.querySelector("#start_dest_availability");
    const endDestAvailability = document.querySelector("#end_dest_availability");

    startDestAvailability.innerHTML = startBikesData.prediction;
    endDestAvailability.innerHTML = endBikesData.prediction;

    distance = await findDirection(start, end, true, 'BICYCLING')
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

async function nearestStation(place){
  var shortestDistance = Infinity;
  var shortestDistanceMarker;
  
  await Promise.all(markers.map(async marker => {
    var distance = google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(place.getPosition()), 
    new google.maps.LatLng(marker.getPosition()))
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

  if (mode == "BICYCLING"){
    directionRenderer.setOptions({
      polylineOptions: {
        strokeColor: "#0034FF",
        strokeOpacity: 1,
        strokeWeight: 4,
        strokeDasharray: '10 10',
      },
      preserveViewport: true,
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
      place_marker.setPosition(place.geometry.location);
      place_marker.setVisible(true);
      place_marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      resolve(place_marker);
    });
  });
}

window.onload = function(){
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
  const back_button = document.getElementById('back_button');
  const nearest_station= document.getElementById('nearest_station');

  const startDest = document.getElementById('search-station-start');
  const endDest = document.getElementById('search-station-end');

  
  
  search_station.addEventListener("click", async function() {
    nearest_station.classList.remove('close');
    back_button.classList.remove('close');
    journey_planner.classList.add('close');
    help_menu.classList.add('close');
    var place = await searchPlaces(search_station);

    nearest_station.addEventListener("click", async function() {
      var nearest_station_marker = await nearestStation(place);
      console.log(nearest_station_marker);
    });
  });

  const map_transition_duration = 1500;

  back_button.addEventListener("click", () => {
    search_station.value = '';
    nearest_station.classList.add('close');
    back_button.classList.add('close');
    journey_planner.classList.remove('close');
    help_menu.classList.remove('close');
    map.setZoom(13);
    map.panTo(dublin, map_transition_duration);
  });



  var start = false;
  var end = false;

  startDest.addEventListener("click", async function() {
    start = await searchPlaces(startDest);
  })

  endDest.addEventListener("click", async function() {
    end = await searchPlaces(endDest);
  })

  console.log(start, end);
  

  
  
  
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
  submitButton.addEventListener("click",async() => 
  {
    while (!start || !end) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
    }
    journeyPlannerInfo.classList.remove('close')
    console.log(start,end);
    handleJourneySubmit(start, end);
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

