# BusVerse route, booking and cancellation update

## Apply to your existing GitHub Pages site

1. Back up the repository first. Extract `BusVerse-updated.zip`.
2. Upload these files from the extracted `BusVerse` folder to the ROOT of `issrose/BUS_VERSE`, replacing matching files:
   - `index.html`
   - `app.js`
   - `app.css`
   - `booking-core.js`
   - `booking-store.js`
   - `catalog.json`
3. Commit the files. Keep the existing GitHub Pages branch/folder setting.
4. After Pages finishes deploying, hard-refresh the site (Ctrl+Shift+R).
5. Sign in with your existing demo account. Search a future journey date, book a seat, open My Bookings, cancel, then reload and verify the cancelled record remains.

The project is prepared for issrose/BUS_VERSE. Publishing source code does not automatically enable GitHub Pages. Enable Pages from the main branch and root folder in repository Settings → Pages.

## Changes

- 60 stops, 120 listed directional routes and 255 daily fictional demo services. Added Kollam, Pathanamthitta, Munnar, Thodupuzha, Malappuram, Manjeri, Tirur, Aluva, Angamaly and others. Every listed route has services; every stop has a connection. This does not imply a direct bus between every possible pair of stops.
- Search matches only the selected source and destination (full names, stop codes or IDs). No unrelated fallback buses. Same-stop journeys and past dates are rejected; departed services are hidden.
- Seat availability belongs to a bus AND journey date. A seat booked tomorrow remains available on a different date.
- Checkout calculates base fare plus 5% tax consistently. Explicit demo UPI/card payment with success and failure simulation. Failed payments do not issue tickets or occupy seats.
- Saved bookings use unique IDs and retry keys. Duplicate clicks and retries do not produce duplicate tickets. Browser writes use Web Locks to serialize same-origin tabs.
- Booking history retains cancelled tickets, cancellation timestamps and demo payment/refund state. Cancellation releases the seat for that journey date only.
- Cancellation is allowed at or before departure minus 90 minutes. It is blocked even one millisecond after the deadline. Dates and deadlines use IST, including midnight/year rollover.
- No fabricated confirmation after API errors. The server-backed flow remains server-backed if a request fails.
- Ticket/history values are escaped and ticket buttons do not embed passenger JSON in inline JavaScript.

## Hosting and persistence

GitHub Pages is a browser-only demo. Bookings persist in this browser's localStorage and are displayed under the signed-in email. Clearing browser data removes them. They do not sync across devices and are not a real bus operator reservation. Use HTTPS (GitHub Pages) or localhost in a current browser with Web Locks support.

The Node demo server supports shared JSON persistence:

```sh
npm start
```

Open http://localhost:5000. Node 20+ is recommended. The server uses the shared booking engine, serializes writes and saves through a temporary file and rename. It preserves existing booking history when loading the expanded catalogue. This single-process demo is not a production booking database.

The existing Java server remains a static/demo host. Its old booking endpoint returned unsaved, hardcoded tickets and also treated cancellation POSTs as new bookings. Those write stubs now return 501 instead of false success; the frontend on that host uses the corrected browser flow. The standalone Java Ticket model's cutoff is also updated to 90 minutes. A complete persistent Java booking backend is not included in this update.

## Payment and authentication limits

All services and payment/refund results are explicitly marked DEMO. No real money moves; do not enter payment credentials. A real payment implementation requires a backend, authenticated accounts, operator inventory, gateway credentials, server-side verification/webhooks and a refund policy. The existing login is a demo identity flow, not secure authentication. Email filtering is for demo history organization, not authorization.

Earlier GitHub Pages tickets were not saved by the old code and cannot be recovered by this update. Existing persisted server records are retained, but the new 90-minute policy is computed from the actual journey departure rather than the old arbitrary 24-hour deadline.

## Verification

Run `npm test` for catalogue coverage, exact route filtering, invalid dates, payment failure/retry, fare consistency, duplicate request handling, seat conflicts/date isolation, account history filtering, cancellation retention/release and precise IST cutoff tests. An HTTP test also exercises real Node endpoints and checks disk persistence.

Browser visual testing and Java compilation could not be completed in the build environment (browser download unavailable; JDK absent). Perform the five-minute browser check above before replacing the live site.
