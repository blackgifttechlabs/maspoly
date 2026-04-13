import { googleMapsApiKey } from "./google-maps-config.js";

let mapsPromise = null;

export async function initAddressMap(container, addressField) {
  if (!container || !addressField || googleMapsApiKey.startsWith("YOUR_")) {
    return false;
  }

  await loadGoogleMaps();

  const campus = { lat: -17.3659, lng: 30.1941 };
  container.innerHTML = "";
  container.style.minHeight = "320px";

  const map = new google.maps.Map(container, {
    center: campus,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false
  });

  const marker = new google.maps.Marker({
    position: campus,
    map,
    draggable: true,
    title: "Delivery point"
  });

  const writeAddress = (position) => {
    const lat = position.lat().toFixed(6);
    const lng = position.lng().toFixed(6);
    addressField.value = `${addressField.value.split(" | ")[0] || "Selected delivery point"} | ${lat}, ${lng}`;
  };

  marker.addListener("dragend", () => writeAddress(marker.getPosition()));
  map.addListener("click", (event) => {
    marker.setPosition(event.latLng);
    writeAddress(event.latLng);
  });

  return true;
}

function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

