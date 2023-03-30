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
        });
        const contentString = `
            <div>
                <h2>${station.name}</h2>
                <p><strong>Available Bikes:</strong> ${station.available_bikes}</p>
                <p><strong>Available Bike Stands:</strong> ${station.available_bike_stands}</p>
                <p><strong>Status:</strong> ${station.status}</p>
            </div>
        `;
        const infowindow = new google.maps.InfoWindow({
            content: contentString,
        });
        marker.addListener("click", () => {
            infowindow.open(map, marker);
        });
    }
}

  
  function getStations() {
    fetch("http://127.0.0.1:5000/stations")
      .then((response) => response.json())
      .then((data) => {
        console.log("fetch response", typeof data);
        addMarkers(data);
      });
  }
  
  // Initialize and add the map
  function initMap() {
    const dublin = { lat: 53.3498, lng: -6.2603 };
    // The map, centered at Dublin
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: dublin,
    });
  
    getStations();
  }
  
  let map = null;
  window.initMap = initMap;
  