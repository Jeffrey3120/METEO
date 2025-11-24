### 📌 Analisi dei Requisiti – Progetto METEO

Questo documento descrive l’analisi dei requisiti del progetto METEO, un’applicazione web che consente di visualizzare, salvare e analizzare dati geografici e meteorologici tramite una mappa interattiva.
Il progetto utilizza Leaflet, PocketBase, Open-Meteo e Nominatim/OpenStreetMap.

### 🔗 Fonti e Servizi Utilizzati

Leaflet – Libreria per la mappa interattiva

PocketBase – Backend locale per salvataggio dati e API

Open-Meteo – Servizio open per dati meteorologici in tempo reale

Nominatim / OpenStreetMap – Reverse geocoding e informazioni sui luoghi

📍 Dati geografici © OpenStreetMap contributors


## Requisiti Funzionali

Il sistema deve permettere all’utente di interagire con una mappa, creare marker tramite click e ottenere informazioni sul luogo selezionato. Deve recuperare la temperatura in tempo reale, mostrare i dati su schermo e salvare ogni punto nel database. All’avvio, i marker precedenti vanno ricaricati e visualizzati con statistiche aggiornate.

## Requisiti Non Funzionali

L’applicazione deve essere semplice da usare, veloce nel rispondere e visivamente chiara. Le API devono essere gestite in modo efficiente e il codice mantenibile. Il sistema deve funzionare su browser moderni senza richiedere installazioni aggiuntive.

## Requisiti di Dominio

Il progetto opera nel contesto dei servizi geografici e meteorologici, quindi deve rispettare formati standard come latitudine/longitudine e gli obblighi di attribuzione di OpenStreetMap. Le API esterne impongono limiti specifici su formato e modalità di accesso ai dati meteo e di geocoding.

## Requisiti di Vincolo

Il progetto deve utilizzare obbligatoriamente tecnologie come Leaflet, PocketBase e servizi open-source. È richiesto l’uso di un server locale per la gestione dei dati e un’architettura semplice basata su client e API esterne. Le scelte tecnologiche ed economiche devono rimanere entro strumenti gratuiti e facilmente integrabili.