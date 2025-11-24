import "./style.css";
import PocketBase from "pocketbase";

// URL base per ottenere il nome del luogo da latitudine e longitudine
let NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse?format=json";

// Funzione che restituisce il colore in base alla temperatura
function getColoreTemperatura(temp) {
  if (temp <= 0) return "#00f"; // blu per freddo
  if (temp <= 10) return "#0af"; // azzurro per mite
  if (temp <= 20) return "#fa0"; // arancione per caldo
  return "#f00"; // rosso per molto caldo
}

// Inizializza la mappa centrata su Londra
let map = L.map("map").setView([51.505, -0.09], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Inizializza PocketBase per il database locale
const pb = new PocketBase("http://127.0.0.1:8090");
// Array per salvare tutte le temperature dei marker
let temperatureSalvate = [];

// Funzione che aggiorna i contatori delle statistiche
function aggiornaStatistiche() {
  let tot = temperatureSalvate.length;
  if (tot === 0) {
    document.getElementById("marker-count").textContent = "Marker: 0";
    document.getElementById("temp-media").textContent = "Temperatura media: N/D";
    document.getElementById("temp-max").textContent = "Max: N/D";
    document.getElementById("temp-min").textContent = "Min: N/D";
    return;
  }
  // Calcolo media, max e min con un ciclo semplice
  let somma = 0;
  for (let i = 0; i < temperatureSalvate.length; i++) {
    somma = somma + temperatureSalvate[i];
  }
  let media = (somma / tot).toFixed(1);
  let max = temperatureSalvate[0];
  let min = temperatureSalvate[0];
  for (let i = 1; i < temperatureSalvate.length; i++) {
    if (temperatureSalvate[i] > max) max = temperatureSalvate[i];
    if (temperatureSalvate[i] < min) min = temperatureSalvate[i];
  }
  document.getElementById("marker-count").textContent = "Marker: " + tot;
  document.getElementById("temp-media").textContent = "Temperatura media: " + media;
  document.getElementById("temp-max").textContent = "Max: " + max.toFixed(1);
  document.getElementById("temp-min").textContent = "Min: " + min.toFixed(1);
}

// Funzione che carica i marker già salvati nel database e li mostra sulla mappa
async function caricaDati() {
  let risultato = await pb.collection("METEO").getList();
  let items = risultato.items;
  for (let item of items) {
    let lat = item.geopoint.lat;
    let lon = item.geopoint.lon;
    // Ottieni il nome del luogo tramite Nominatim
    let urlNome = `${NOMINATIM_BASE_URL}&lat=${lat}&lon=${lon}`;
    let res = await fetch(urlNome);
    let info = await res.json();
    let nomeLuogo = info.display_name || "Nome non trovato";
    // Ottieni la temperatura tramite Open-Meteo
    let urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current_weather=true`;
    let resMeteo = await fetch(urlMeteo);
    let datiMeteo = await resMeteo.json();
    let temperatura = datiMeteo.current_weather?.temperature ?? null;
    if (temperatura !== null) {
      temperatureSalvate.push(temperatura);
    }
    aggiornaStatistiche();
    // Disegna il cerchio sulla mappa
    L.circle([lat, lon], {
      color: "transparent",
      fillColor: getColoreTemperatura(temperatura),
      fillOpacity: 0.6,
      radius: 300,
    })
      .addTo(map)
      .bindPopup(
        "Lat: " + lat + "<br>Lon: " + lon + "<br>Luogo: " + nomeLuogo + "<br>Temperatura: " + temperatura + "°C"
      );
  }
}

// Quando clicchi sulla mappa aggiungi un nuovo marker e salva nel database
map.on("click", async function (e) {
  let lat = e.latlng.lat;
  let lon = e.latlng.lng;
  // Ottieni il nome del luogo tramite Nominatim
  let urlNome = NOMINATIM_BASE_URL + "&lat=" + lat + "&lon=" + lon;
  let res = await fetch(urlNome);
  let info = await res.json();
  // Prendi il nome della città o paese
  let nome = info.address && (info.address.city || info.address.town || info.address.village || info.address.hamlet || info.address.municipality || info.address.country) || "Nome non trovato";
  // Ottieni la temperatura tramite Open-Meteo
  let urlMeteo = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&hourly=temperature_2m&current_weather=true";
  let resMeteo = await fetch(urlMeteo);
  let datiMeteo = await resMeteo.json();
  let temperatura = datiMeteo.current_weather && datiMeteo.current_weather.temperature !== undefined ? datiMeteo.current_weather.temperature : null;
  if (temperatura !== null) {
    temperatureSalvate.push(temperatura);
    aggiornaStatistiche();
  }
  // Disegna il cerchio sulla mappa
  L.circle([lat, lon], {
    color: "transparent",
    fillColor: getColoreTemperatura(temperatura),
    fillOpacity: 0.6,
    radius: 1000,
  })
    .addTo(map)
    .bindPopup(
      "Lat: " + lat + "<br>Lon: " + lon + "<br>Luogo: " + nome + "<br>Temperatura: " + temperatura + "°C"
    )
    .openPopup();
  // Salva il nuovo marker nel database
  try {
    let record = await pb.collection("METEO").create({
      geopoint: { lat: lat, lon: lon },
      citta: nome
    });
    document.getElementById("save-status").textContent =
      "Salvato: " + record.citta + " (" + lat + ", " + lon + ")";
  } catch (error) {
    document.getElementById("save-status").textContent =
      "Errore nel salvataggio: " + error.message;
    console.error("Errore PocketBase:", error);
  }
});

// Carica i dati già presenti all'avvio
caricaDati();
