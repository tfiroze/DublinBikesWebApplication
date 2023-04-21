var markers = [];
var map;
var mc;
var directionService;
var directionRenderer;
const dublin = {lat: 53.3498, lng: -6.2603};function addMarkerClickListener(marker, contentString, occupancy) {
  var infowindow = new google.maps.InfoWindow({
    content: contentString,
  });
  marker.addListener("mouseover", () => {
    infowindow.open(map, marker);
  });

  marker.addListener("mouseout", () => {
    infowindow.close();
  });
  
  marker.addListener("click", () => {
    drawChart(occupancy)
  });

}

function drawChart(occupancy) {
  console.log(occupancy)
  var occupancyTable = google.visualization.arrayToDataTable(occupancy);

  var options = {
    width: "100%",
    height: "100%",
    legend: { position: "top", maxLines: 3 },
    bar: { groupWidth: "75%" },
    isStacked: true,
    colors: ["#E81E25", "#21AEEB"],
  };

  var graphdiv = document.getElementById("OccGraph");
  var chart = new google.visualization.ColumnChart(graphdiv);
  chart.draw(occupancyTable, options);

  graphdiv.style.transform = "translateY(-100%)";
  window.addEventListener("resize", function () {
    chart.draw(occupancyTable, options);
  });

  // Add a close button for the graph
  var closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.zIndex = 100;
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "24px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", function () {
    graphdiv.style.transform = "translateY(0%)";
    closeButton.remove(); // Remove the close button when the graph is closed
  });

  graphdiv.appendChild(closeButton);
}

//console.log(station_data)


function addMarkers(station_data,availabilityData,history){
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
        url: "static/images/BlueMarker.png",
        scaledSize: new google.maps.Size(25, 40),
      },
    });

    var number = station.number;
    var stathist = history[number]; //get the array with just the station number

    var recent = null; //will hold most recent time
    var recentstat = null; //will hold dictionary containing most recent time
    if (stathist) {
      stathist.forEach(stat => { //short for station history don't @ me
      const time = stat.last_update; //using last_update becase it's easier to compare and its not like the data will be different without an update
      if (!recent || time > recent) {
        recent = time;
        recentstat = stat;
      }})
    }

    //create dictionary holding all updates within each hour
    //for each hour, go through and average the number of bikes and stands
    //return an array of arrays that's like [time, average bikes, average stands]
    //Make graph
    var hourstat= {}
    var occupancy=[["Time ","Available Bikes ", "Available Stands " ]]
    var date
    var hour
    //console.log(stathist)
    if (stathist) {

    for (c = 0; c < stathist.length; ++c) {
      date=new Date (stathist[c].time)
      hour=date.getHours()
      if (hour in hourstat){
        hourstat[hour].push(stathist[c])
      }
      else{
        hourstat[hour]=[stathist[c]]
      }
    }
  }
    var len = Object.keys(hourstat).length
    for(var key in hourstat){
      var avgbike=0
      var avgstand=0
      for (i = 0; i < hourstat[key].length; ++i){
        avgbike+=hourstat[key][i]["available_bikes"]
        avgstand+=hourstat[key][i]["available_bike_stands"]
      }

      avgbike/=hourstat[key].length
      avgbike=parseInt(avgbike)
      avgstand/=hourstat[key].length
      avgstand=parseInt(avgstand)
      var timestr
      if (key>12){
        key=key-12
        timestr=key.toString()+"pm"
      }
      else if (key==12){
        timestr="12pm"
      }
      else if (key==0){
        timestr="12am"
      }
      else{
        timestr=key.toString()+"am"
      }
      occupancy.push([timestr, avgbike, avgstand])
    }
    //console.log(occupancy)
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
      addMarkerClickListener(marker, contentString, occupancy);
    } else {
      console.warn(`No availability data found for station ${station.number}`);
    }
    
    markers.push(marker);
  }
}


async function getStations() {
    markers = [];
    const response = await fetch("http://34.242.180.5/stations");
    data = await response.json()
    station_data = await data;
    const availabilityResponse = await fetch("http://34.242.180.5/availability");
    availabilityData = await availabilityResponse.json();
    const history = await fetch("http://34.242.180.5/history");
    historydata = await history.json();
    console.log(station_data);
    // populateStationDropdowns(station_data);
    // Pass the availabilityData to the addMarkers function
    //addMarkers(station_data, availabilityData);
    addMarkers(station_data, availabilityData,historydata);
    document.getElementById("big-loader").style.display = "none";
  }

  // Initialize and add the map
  function initMap() {
    // The map, centered at Dublin
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 0,
      center: dublin,
      disableDefaultUI: true,
    });
    
    let zoom = 0;
    const maxZoom = 13.5;
    const zoomInterval = setInterval(() => {
      if (zoom < maxZoom) {
        zoom++;
        map.setZoom(zoom);
      } else {
        clearInterval(zoomInterval);
      }
    }, 20);
    
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

    const startStation = start[1][0].station_number;
    const endStation = end[1][0].station_number;
    const dateTime = document.getElementById("datetime-input").value;
    
    console.log("Start Station:", startStation);
    console.log("End Station:", endStation);
    console.log("Date and Time:", dateTime);

    const dateObj = new Date(dateTime);
    
    if (dateTime == "") {
      dateObj = new Date();
    } 


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

    const startBikesResponse = await fetch(`http://34.242.180.5/predict_available_bikes/${startStation}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });
    const startBikesData = await startBikesResponse.json();
    console.log("Start Station Available Bikes:", startBikesData);

    const endBikesResponse = await fetch(`http://34.242.180.5/predict_available_bike_stands/${endStation}`, {
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

    direction_result = await findDirection(start[1][0], end[1][0], true, 'BICYCLING');

    const bounds = new google.maps.LatLngBounds();

    bounds.extend(start[1][0].getPosition());
    bounds.extend(end[1][0].getPosition());
    bounds.extend(start[0].getPosition());
    bounds.extend(end[0].getPosition());

    const padding = 10;
    map.fitBounds(bounds, padding);

    const zoomOutLevel = 0.5;
    map.setZoom(map.getZoom() - zoomOutLevel);

    document.querySelector("#nearestStationInfo_SN_start").textContent = start[1][0].getTitle();
    document.querySelector("#time_taken_searchbar_start").textContent = Math.round(start[1][1]*100)/100 + "mins";
    document.querySelector("#distance_searchbar_start").textContent = Math.round(start[1][2]*100)/100 + "KMs";

    document.querySelector("#nearestStationInfo_SN_end").textContent = end[1][0].getTitle();
    document.querySelector("#time_taken_searchbar_end").textContent = Math.round(end[1][1]*100)/100 + "mins";
    document.querySelector("#distance_searchbar_end").textContent = Math.round(end[1][2]*100)/100 + "KMs";

    document.querySelector("#start_date").textContent = dateObj.getDate() + "-" + (dateObj.getMonth()+1) + "-" + dateObj.getFullYear();
    document.querySelector("#start_time").textContent = dateObj.getHours() + ":" + dateObj.getMinutes();
    var endDate = dateObj;
    endDate.setMinutes(dateObj.getMinutes() + direction_result[1] + (start[1][1]*100)/100 + (end[1][1]*100)/100);
    document.querySelector("#end_date").textContent = endDate.getDate() + "-" + (endDate.getMonth()+1) + "-" + endDate.getFullYear();
    document.querySelector("#end_time").textContent = endDate.getHours() + ":" + endDate.getMinutes();
}
var temp  
var weather_description
var code
var weathicon
async function fetch_weather(){
  const res = await  fetch('http://34.242.180.5/current_weather')
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
  var direction_result = await findDirection(place, shortestDistanceMarker, true);
  console.log(direction_result)
  return [shortestDistanceMarker, direction_result[0]/60, direction_result[1]/1000];
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
  var time_taken;
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
      time_taken = result.routes[0].legs[0].duration.value;
    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
  return [distance, time_taken];
}

function removeplaceMarkers(){
  initMap();
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
  const nearest_station_info = document.querySelector('.nearestStationInfo');
  const journey_planner_form = document.querySelector("#journey_planner-form");
  const back_button_info_window = document.querySelector("#back_button_info_window");
  const back_button_journey_planner = document.querySelector("#back_button_journey_planner");
  const date_time_input = document.querySelector("#datetime-input");

  const startDest = document.getElementById('search-station-start');
  const endDest = document.getElementById('search-station-end');



  
  
  search_station.addEventListener("click", async function() {
    nearest_station_info.classList.add('close');
    nearest_station.classList.remove('close');
    back_button.classList.remove('close');
    journey_planner.classList.add('close');
    help_menu.classList.add('close');
    var place = await searchPlaces(search_station);

    nearest_station.addEventListener("click", async function() {
      nearest_station.classList.add('close');
      var nearest_station_marker = await nearestStation(place);
      nearest_station_info.classList.remove('close');
      document.querySelector("#nearestStationInfo_SN").textContent = nearest_station_marker[0].getTitle();
      document.querySelector("#time_taken_searchbar").textContent = Math.round(nearest_station_marker[1]*100)/100 + "mins";
      document.querySelector("#distance_searchbar").textContent = Math.round(nearest_station_marker[2]*100)/100 + "KMs";
      placeMarkers.push(nearest_station_marker[0]);
    });
  });

  const map_transition_duration = 2000;

  back_button.addEventListener("click", () => {
    search_station.value = '';
    nearest_station.classList.add('close');
    back_button.classList.add('close');
    journey_planner.classList.remove('close');
    help_menu.classList.remove('close');
    nearest_station_info.classList.add('close');
    map.setZoom(13);
    map.panTo(dublin, map_transition_duration);
    if (directionRenderer) {
      directionRenderer.setMap(null);
      directionRenderer = null;
    }
  });



  var start = [];
  var end = [];

  startDest.addEventListener("click", async function() {
    if (directionRenderer) {
      directionRenderer.setMap(null);
      directionRenderer = null;
    }
    start.push(await searchPlaces(startDest));
    var nearest_station_marker = await nearestStation(start[0]);
    start.push(nearest_station_marker);
    findDirection(start[0], nearest_station_marker[0], true);
  })

  endDest.addEventListener("click", async function() {
    end.push(await searchPlaces(endDest));
    var nearest_station_marker = await nearestStation(end[0]);
    end.push(nearest_station_marker);
    findDirection(end[0], nearest_station_marker[0], true);
  })

  


  
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');
    menu_bar.classList.remove('close');
    journeyPlannerInfo.classList.add('close');
    search_station.value = '';
    nearest_station.classList.add('close');
    back_button.classList.add('close');
    help_menu.classList.remove('close');
    journey_planner.classList.remove('close');
    nearest_station_info.classList.add('close');
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
    journey_planner_form.classList.add('close');
    mc.markers = [];
    markers.forEach(marker => {
      marker.setMap(null);
    });
    handleJourneySubmit(start, end);
  });

  back_button_info_window.addEventListener("click", () => {
    journeyPlannerInfo.classList.add('close')
    journey_planner_form.classList.remove('close');
    startDest.value = '';
    endDest.value = '';
    date_time_input.value = '';
    initMap();
  })

  back_button_journey_planner.addEventListener("click", () => {
    menu_bar.classList.remove('close');
    journey_planner_menu.classList.add('close');
  });

  let time = document.getElementById("time");
  let date = document.getElementById('date');
  
  setInterval(()=> {
    let t = new Date();
    document.getElementById("left-loader").style.display = "none";
    time.innerHTML = t.toLocaleTimeString();
    date.innerHTML = t.toLocaleDateString();
  }, 1000)
  //fetch_weather()

}
