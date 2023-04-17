let allMarkers = [];

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

function drawChart(occupancy){

  var occupancyTable = google.visualization.arrayToDataTable(occupancy);

  var options = {
    width: "100%",
    height: "100%",
    legend: { position: 'top', maxLines: 3 },
    bar: { groupWidth: '75%' },
    isStacked: true,
    colors: ['#8A00C2', '#65FE08']
  };
  
  var graphdiv = document.getElementById('OccGraph');
  var chart = new google.visualization.ColumnChart(graphdiv);
  chart.draw(occupancyTable, options);

  graphdiv.style.transform = "translateY(-100%)";
  window.addEventListener('resize', function() {
    chart.draw(occupancyTable, options);
  })

}



function addMarkers(stations, history) {
  for (const station of stations) {
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
   
    stathist.forEach(stat => { //short for station history don't @ me
    const time = stat.last_update; //using last_update becase it's easier to compare and its not like the data will be different without an update
    if (!recent || time > recent) {
      recent = time;
      recentstat = stat;
    }})

    var contentString = `
      <div>
        <h3>${station.name}</h3>
        <p>Status: ${recentstat.status}</p>
        <p>Available Bikes: ${recentstat.available_bikes}</p>
        <p>Available Bike Stands: ${recentstat.available_bike_stands}</p>
      </div>
    `;

    //create dictionary holding all updates within each hour
    //for each hour, go through and average the number of bikes and stands
    //return an array of arrays that's like [time, average bikes, average stands]
    //Make graph
    var hourstat= {}
    var occupancy=[["Time ","Available Bikes ", "Available Stands " ]]
    var date
    var hour
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

    addMarkerClickListener(marker, contentString, occupancy);
    allMarkers.push(marker);
  }
}

// ... rest of the code remains unchanged ...

// ... rest of the code remains unchanged ...

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

function getStations(callback){

  Promise.all([
    fetch('http://127.0.0.1:5000/stations').then(resp => resp.json()),
    fetch('http://127.0.0.1:5000/history').then(resp => resp.json()),
  ]).then(function(data) {
    addMarkers(data[0], data[1]);
  });
  

}

// function getStations(callback) {
//   requests = [fetch("http://127.0.0.1:5000/stations")]
//   Promise.all(requests)
//     .then((responses) => responses[0].json())
//     .then((data) => {

//       console.log("Station data..", data);
//       console.log('trigger', getHistory())
      
//       // addMarkers(data[0], test);
//       // if (callback) {
//       //   callback();
//       // }
//     });
    
// }


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

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });

  let time = document.getElementById("time");
  let date = document.getElementById("date");
  setInterval(() => {
    let t = new Date();
    time.innerHTML = t.toLocaleTimeString();
    date.innerHTML = t.toLocaleDateString();
  }, 1000);
};
