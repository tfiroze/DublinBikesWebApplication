// Initialize and add the map
function initMap() {
  // The location of Dublin
  const Dublin = { lat: 53.350140, lng: -6.266155 };
  // The map, centered at Uluru
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: Dublin,
    disableDefaultUI: true,
  });
  // The marker, positioned at Uluru
  const marker = new google.maps.Marker({
    position: Dublin,
    map: map,
  });
}

window.initMap = initMap;

window.onload = function(){
  const sidebar = document.getElementById("sidebar")
  const toggle = document.getElementById("toggle")

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });
}