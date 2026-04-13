// Replaced Google Maps address picker with Leaflet-based picker for testing.
// No API key required. Uses CDN assets injected dynamically if not already present.

let leafletReady = null;

export async function initAddressMap(container, addressField) {
  if (!container || !addressField) return false;

  await loadLeaflet();

  const campus = { lat: -17.3659, lng: 30.1941 };
  container.innerHTML = "";
  container.style.minHeight = "320px";

  const map = L.map(container).setView([campus.lat, campus.lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  const marker = L.marker([campus.lat, campus.lng], { draggable: true }).addTo(map);

  const writeAddress = (lat, lng) => {
    const latS = Number(lat).toFixed(6);
    const lngS = Number(lng).toFixed(6);
    addressField.value = `${addressField.value.split(" | ")[0] || "Selected delivery point"} | ${latS}, ${lngS}`;
  };

  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    writeAddress(pos.lat, pos.lng);
  });

  map.on("click", (e) => {
    marker.setLatLng(e.latlng);
    writeAddress(e.latlng.lat, e.latlng.lng);
  });

  return true;
}

function loadLeaflet() {
  if (leafletReady) return leafletReady;

  leafletReady = new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    // Inject Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(); else reject(new Error("Leaflet failed to load."));
    };
    script.onerror = () => reject(new Error("Leaflet failed to load."));
    document.head.appendChild(script);
  });

  return leafletReady;
}

