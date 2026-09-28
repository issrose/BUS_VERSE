/* Shared demo booking rules for GitHub Pages and the Node server. */
(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.BookingCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const normalize = value => String(value || '').trim().toLowerCase();
  const clone = value => JSON.parse(JSON.stringify(value));
  const today = (now = Date.now()) => new Date(now + 330 * 60000).toISOString().slice(0, 10);
  function departureAt(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date)
      throw new Error('Choose a valid journey date.');
    const m = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(String(time).trim());
    if (!m) throw new Error('Invalid departure time.');
    let hour = Number(m[1]);
    if (Number(m[2]) > 59 || (m[3] ? hour < 1 || hour > 12 : hour > 23)) throw new Error('Invalid departure time.');
    if (m[3]) hour = hour % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0);
    return Date.parse(`${date}T${String(hour).padStart(2, '0')}:${m[2]}:00+05:30`);
  }
  const deadline = booking => departureAt(booking.journeyDate, booking.bus.departure) - 90 * 60000;
  const canCancel = (booking, now = Date.now()) => booking.status === 'confirmed' && now <= deadline(booking);
  function ownerOf(booking) { return normalize(booking.ownerEmail || booking.passenger?.email); }
  function bookingsFor(data, owner) {
    if (!normalize(owner)) return [];
    return data.bookings.filter(b => ownerOf(b) === normalize(owner)).map(b => ({...clone(b), cancellableUntil: new Date(deadline(b)).toISOString()}));
  }
  function seatsFor(data, busId, date) {
    const bus = data.buses.find(b => b.id === busId);
    if (!bus) throw new Error('Bus not found.');
    departureAt(date, bus.departure);
    const taken = new Set(data.bookings.filter(b => (b.busId || b.bus?.id) === busId && b.journeyDate === date && b.status === 'confirmed').map(b => b.seat.id));
    return {bus: clone(bus), seats: bus.seats.map(s => ({...s, status: taken.has(s.id) ? 'booked' : 'available'}))};
  }
  function search(data, query, now = Date.now()) {
    const resolve = value => {
      const q = normalize(value);
      const stop = data.stops.find(s => [s.name, s.id, s.code].some(v => normalize(v) === q));
      return normalize(stop ? stop.name : value);
    };
    const src = resolve(query.source), dest = resolve(query.destination);
    const date = query.date || today(now);
    departureAt(date, '00:00');
    if (src && src === dest) return [];
    return data.buses.filter(b => (!src || normalize(b.source) === src) && (!dest || normalize(b.destination) === dest)
      && departureAt(date, b.departure) > now
      && (!query.type || query.type === 'all' || (query.type === 'ac' ? b.isAc : !b.isAc))
      && (!query.maxFare || b.fare <= Number(query.maxFare)))
      .map(b => {
        const {seats, ...summary} = clone(b);
        return {...summary, availableSeats: seatsFor(data, b.id, date).seats.filter(s => s.status === 'available').length};
      }).sort((a, b) => departureAt(date, a.departure) - departureAt(date, b.departure));
  }
  function create(data, request, now = Date.now()) {
    const {busId, seatId, journeyDate, passenger, ownerEmail, requestId, paymentMethod, paymentOutcome} = request;
    if (!normalize(ownerEmail) || !requestId || requestId.length > 100) throw new Error('Sign in and restart checkout.');
    const previous = data.bookings.find(b => b.requestId === requestId && ownerOf(b) === normalize(ownerEmail));
    if (previous) {
      if (previous.busId !== busId || previous.seat.id !== seatId || previous.journeyDate !== journeyDate) throw new Error('Checkout request conflicts with an existing booking.');
      return clone(previous);
    }
    if (!passenger?.name?.trim() || !/^(?:91)?\d{10}$/.test(String(passenger.phone || '').replace(/\D/g, '')) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email || ''))
      throw new Error('Enter your name, a valid 10-digit mobile number and email.');
    const {bus, seats} = seatsFor(data, busId, journeyDate);
    if (departureAt(journeyDate, bus.departure) <= now) throw new Error('This bus has already departed.');
    const seat = seats.find(s => s.id === seatId);
    if (!seat) throw new Error('Seat not found.');
    if (seat.status !== 'available') throw new Error('This seat has just been booked. Please choose another seat.');
    if (!['demo-upi', 'demo-card'].includes(paymentMethod)) throw new Error('Choose a demo payment method.');
    if (paymentOutcome !== 'success') throw new Error('Demo payment failed. No ticket was issued and your seat remains available. Retry payment.');
    const id = 'booking_' + globalThis.crypto.randomUUID();
    const baseFare = Number(seat.fare), tax = Math.round(baseFare * 0.05);
    if (!Number.isFinite(baseFare) || baseFare < 0) throw new Error('Invalid fare.');
    delete bus.seats;
    const booking = {
      id, pnr: 'BV-' + id.slice(8).replaceAll('-', '').toUpperCase(), requestId,
      ownerEmail: normalize(ownerEmail), busId, bus, seat: {id: seat.id, seatNumber: seat.seatNumber, fare: baseFare},
      passenger: {name: passenger.name.trim(), phone: passenger.phone.trim(), email: passenger.email.trim()},
      journeyDate, baseFare, tax, fare: baseFare + tax, status: 'confirmed',
      payment: {method: paymentMethod, status: 'demo-paid', amount: baseFare + tax, reference: 'DEMO-' + id.slice(8)},
      createdAt: new Date(now).toISOString(),
      cancellableUntil: new Date(departureAt(journeyDate, bus.departure) - 90 * 60000).toISOString()
    };
    data.bookings.unshift(booking);
    return clone(booking);
  }
  function cancel(data, id, ownerEmail, now = Date.now()) {
    const booking = data.bookings.find(b => (b.id === id || b.pnr === id) && ownerOf(b) === normalize(ownerEmail));
    if (!booking || !normalize(ownerEmail)) throw new Error('Booking not found for this account.');
    if (booking.status === 'cancelled') return {message: 'Booking is already cancelled.', booking: clone(booking)};
    if (!canCancel(booking, now)) throw new Error('Cancellation closes 1 hour 30 minutes before departure.');
    booking.status = 'cancelled';
    booking.cancelledAt = new Date(now).toISOString();
    booking.cancellableUntil = new Date(deadline(booking)).toISOString();
    if (booking.payment?.status === 'demo-paid') {
      booking.payment.status = 'demo-refunded';
      booking.payment.refundAmount = booking.fare;
    }
    return {message: 'Ticket cancelled. Seat released. No real money was charged or refunded.', booking: clone(booking)};
  }
  return {today, departureAt, deadline, canCancel, bookingsFor, seatsFor, search, create, cancel};
});
