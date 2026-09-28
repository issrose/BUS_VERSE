/* Explicit storage selection. An API error never becomes a successful local booking. */
const BookingStore = (() => {
  const KEY = 'busverse_bookings_v2';
  let catalog;
  let mode = 'browser';
  async function json(url, options) {
    const response = await fetch(url, options);
    let body;
    try { body = await response.json(); } catch { throw new Error('Booking service returned an invalid response. Please retry.'); }
    if (!response.ok) throw new Error(body.error || 'Booking service is unavailable. Please retry.');
    return body;
  }
  function read() {
    let bookings;
    try { bookings = JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { throw new Error('Saved bookings could not be read. Do not clear browser data; contact support.'); }
    if (!Array.isArray(bookings)) throw new Error('Saved bookings are invalid.');
    return {...catalog, bookings};
  }
  async function mutate(operation) {
    if (!navigator.locks) throw new Error('Use a current browser over HTTPS or localhost to safely save bookings.');
    return navigator.locks.request(KEY, () => {
      const data = read();
      const result = operation(data);
      try { localStorage.setItem(KEY, JSON.stringify(data.bookings)); }
      catch { throw new Error('Could not save your booking. Enable browser storage and retry. No ticket was issued.'); }
      return result;
    });
  }
  const owner = () => state.currentUser?.email || '';
  const post = body => ({method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  return {
    async init() {
      // The Java/static host intentionally uses browser storage. Only the corrected Node API advertises v2.
      if (!location.hostname.endsWith('github.io')) {
        try { const caps = await json('/api/capabilities'); if (caps.bookingVersion === 2) mode = 'server'; } catch {}
      }
      if (mode === 'server') {
        const [stops, routes] = await Promise.all([json('/api/stops'), json('/api/routes')]);
        catalog = {stops, routes};
      } else catalog = await json('catalog.json');
      return {...catalog, mode};
    },
    search: query => mode === 'server' ? json('/api/buses?' + new URLSearchParams(query)) : Promise.resolve(BookingCore.search(read(), query)),
    seats: (id, date) => mode === 'server' ? json(`/api/buses/${encodeURIComponent(id)}/seats?date=${encodeURIComponent(date)}`) : Promise.resolve(BookingCore.seatsFor(read(), id, date)),
    list: () => mode === 'server' ? json('/api/bookings?' + new URLSearchParams({ownerEmail: owner()})) : Promise.resolve(BookingCore.bookingsFor(read(), owner())),
    create: request => mode === 'server' ? json('/api/bookings', post({...request, ownerEmail: owner()})) : mutate(data => BookingCore.create(data, {...request, ownerEmail: owner()})),
    cancel: id => mode === 'server' ? json(`/api/bookings/${encodeURIComponent(id)}/cancel`, post({ownerEmail: owner()})) : mutate(data => BookingCore.cancel(data, id, owner()))
  };
})();
