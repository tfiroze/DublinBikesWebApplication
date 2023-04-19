var markers = [];
var map;
var mc;
function addMarkerClickListener(marker, contentString, occupancy) {
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
  var occupancyTable = google.visualization.arrayToDataTable(occupancy);

  var options = {
    width: "100%",
    height: "100%",
    legend: { position: "top", maxLines: 3 },
    bar: { groupWidth: "75%" },
    isStacked: true,
    colors: ["#8A00C2", "#65FE08"],
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
        url: "../images/icons8-bike-parking-100.png",
        scaledSize: new google.maps.Size(35, 35),
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
      avgstand/=hourstat[key].length
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
      let atime = availability.time;

      // Create a new Date object from atime
      let dateObj = new Date(atime);

      // Increase the hours by one
      dateObj.setHours(dateObj.getHours() + 1);

      // Update the atime variable with the new time
      atime = dateObj.toUTCString();
      //atime.setHours(currentDate.getHours() + 1);
      var contentString = `
        <div>
          <h3>${station.name}</h3>
          <p>Status: ${availability.status}</p>
          <p>Available Bikes: ${availability.available_bikes}</p>
          <p>Available Bike Stands: ${availability.available_bike_stands}</p>
          <p>Last Update: ${atime}</p>
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
    const response = await fetch("http://127.0.0.1:5000/stations");
    data = await response.json()
    station_data = await data;
    const availabilityResponse = await fetch("http://127.0.0.1:5000/availability");
    availabilityData = await availabilityResponse.json();
    const history = await fetch("http://127.0.0.1:5000/history");
    historydata = await history.json();
    console.log(station_data);
    populateStationDropdowns(station_data);
    // Pass the availabilityData to the addMarkers function
    //addMarkers(station_data, availabilityData);
    addMarkers(station_data, availabilityData,historydata);
     // Make sure to add this line
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
    
    //getStations()
    
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
  console.log(station_data)
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

window.onload = async function(){
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("toggle");
  const journey_planner = document.getElementById("journey_planner");
  const help = document.getElementById('help');
  const search = document.getElementById('search');
  const menu_bar = document.getElementById('menu_bar');
  const journey_planner_menu = document.getElementById('journey_planner_menu');
  const search_station = document.getElementById('search-station');
  const submitButton = document.querySelector("input[type='submit']");
  getStations()
  
  
  search_station.addEventListener("input", searchStations);

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    journey_planner_menu.classList.add('close');
    menu_bar.classList.remove('close');

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
  submitButton.addEventListener("click", handleJourneySubmit);

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

