const map = L.map("map").setView([53.7067, -1.9134], 12);

const baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const terrainLayer = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution:
      'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
  }
);

const cycleIcon = L.icon({
  iconUrl: "cycle.svg",
  iconSize: [30, 30],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

const marketIcon = L.icon({
  iconUrl: "bag.svg",
  iconSize: [40, 40],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

const marketLayer = L.layerGroup();
const cycleLayer = L.layerGroup();

fetch("markets.geojson")
  .then((response) => response.json())
  .then((data) => {
    data[0].features.forEach((feature) => {
      const marketsGeojsonFeature = {
        type: "Feature",
        properties: feature.properties,
        geometry: feature.geometry,
      };

      L.geoJSON(marketsGeojsonFeature, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: marketIcon });
        },
        onEachFeature: function (feature, layer) {
          const popupContent = `
                    <strong>${feature.properties.Market}</strong><br>
                    Type: ${feature.properties.Type}<br>
                    Goods: ${feature.properties.Goods}<br>
                    Address: ${feature.properties.Address1}, ${feature.properties.Address2}<br>
                    Postcode: ${feature.properties.Postcode}<br>
                    Open: ${feature.properties.Monday} (Mon), ${feature.properties.Tuesday} (Tue), 
                    ${feature.properties.Wednesday} (Wed), ${feature.properties.Thursday} (Thu), 
                    ${feature.properties.Friday} (Fri), ${feature.properties.Saturday} (Sat), 
                    ${feature.properties.Sunday} (Sun)<br>
                    Hours: ${feature.properties["Time open"]} - ${feature.properties["Time close"]}<br>
                    <a href="${feature.properties.Website}" target="_blank">Website</a><br>
                    Email: <a href="mailto:${feature.properties.Email}">${feature.properties.Email}</a><br>
                    Telephone: ${feature.properties.Telephone}
                    `;
          layer.bindPopup(popupContent);
        },
      }).addTo(marketLayer);
    });
  })
  .catch((error) => console.error("Error loading markets.geojson:", error));

fetch("cycleStorage.geojson")
  .then((response) => response.json())
  .then((data) => {
    data.features.forEach((feature) => {
      const cycleGeojsonFeature = {
        type: "Feature",
        properties: feature.properties,
        geometry: feature.geometry,
      };

      L.geoJSON(cycleGeojsonFeature, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: cycleIcon });
        },
        onEachFeature: function (feature, layer) {
          const location = feature.properties["Location "];
          const town = feature.properties.Town;
          const description = feature.properties["Description "];

          const cyclePopupContent = `
                    <strong>Cycle Storage</strong><br>
                    Location: ${location}<br>
                    Town: ${town}<br>
                    Description: ${description}<br>
                `;

          layer.bindPopup(cyclePopupContent);
        },
      }).addTo(cycleLayer);
    });
  })
  .catch((error) =>
    console.error("Error loading cycleStorage.geojson:", error)
  );

marketLayer.addTo(map);
cycleLayer.addTo(map);

document.getElementById("findLocation").addEventListener("click", function () {
  map.locate({ setView: true, maxZoom: 16 });
});

map.on("locationfound", function (e) {
  const radius = e.accuracy / 2;

  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are within " + radius + " meters from this point")
    .openPopup();

  L.circle(e.latlng, radius).addTo(map);
});

map.on("locationerror", function (e) {
  alert(e.message);
});

const baseMaps = {
  "Base Layer": baseLayer,
  "Terrain Layer": terrainLayer,
};

const overlayMaps = {
  Markets: marketLayer,
  Cycles: cycleLayer,
};

L.control.layers(baseMaps, overlayMaps, { position: "bottomleft" }).addTo(map);
