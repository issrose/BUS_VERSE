# BusVerse — Bus reservation demo

Expanded route search, date-specific seat booking, demo payments, persistent booking history and cancellation until 90 minutes before departure.

**Start here: [UPDATE-NOTES.md](UPDATE-NOTES.md)** for GitHub Pages upload steps, changes, test instructions and deployment limitations.

- GitHub Pages: serve the root HTML/JS/CSS and `catalog.json`. Bookings are browser-local.
- Node: `npm start`, then open http://localhost:5000. Bookings are persisted in JSON on the server.
- Tests: `npm test` (Node 20+).
- Java legacy static host: `javac -d out src/com/busreservation/server/BusVerseServer.java`, then `java -cp out com.busreservation.server.BusVerseServer`. Uses browser-local booking; legacy write stubs are disabled.

60 stops · 120 directional routes · 255 fictional demo services.

No real payments or real operator reservations. This is an academic/demo project; see the update notes before deployment.
