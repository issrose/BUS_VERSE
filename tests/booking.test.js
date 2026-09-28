const {test} = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../booking-core');
const catalog = require('../catalog.json');
const data = () => ({...structuredClone(catalog), bookings: []});
const now = Date.parse('2026-10-01T00:00:00+05:30');
const request = (db, overrides={}) => ({busId: db.buses[0].id, seatId: db.buses[0].seats[0].id, journeyDate: '2026-10-02', ownerEmail: 'test@example.com', requestId: crypto.randomUUID(), passenger: {name: "O'Brien <test>", phone: '9876543210', email: 'test@example.com'}, paymentMethod: 'demo-upi', paymentOutcome: 'success', ...overrides});
test('every advertised route has buses and every stop is connected', () => {
 const db = data(); assert.equal(db.stops.length, 60);
 for (const r of db.routes) {
  const buses=Core.search(db,{source:r.source,destination:r.destination,date:'2026-10-02'},now);
  assert.ok(buses.length > 0, r.id); assert.equal(buses.length,r.buses);
  assert.ok(buses.every(b=>b.source===r.source && b.destination===r.destination));
 }
 for (const stop of db.stops) assert.ok(db.routes.some(r=>r.source===stop.name));
});
test('exact routes, codes, unsupported routes, same-stop and past departures', () => {
 const db=data();
 assert.deepEqual(Core.search(db,{source:'unknown',destination:'Kannur',date:'2026-10-02'},now),[]);
 assert.deepEqual(Core.search(db,{source:'Kann',destination:'Kannur',date:'2026-10-02'},now),[]);
 assert.deepEqual(Core.search(db,{source:'Kannur',destination:'Kannur',date:'2026-10-02'},now),[]);
 assert.deepEqual(Core.search(db,{source:'Chemperi',destination:'Kannur',date:'2026-09-30'},now),[]);
 assert.ok(Core.search(db,{source:' cmp ',destination:'CAN',date:'2026-10-02'},now).length);
});
test('failed payment has no booking or reserved seat; retry persists correct tax',()=>{
 const db=data(), req=request(db,{paymentOutcome:'failed'});
 assert.throws(()=>Core.create(db,req,now),/payment failed/); assert.equal(db.bookings.length,0);
 assert.equal(Core.seatsFor(db,req.busId,req.journeyDate).seats[0].status,'available');
 const b=Core.create(db,{...req,paymentOutcome:'success'},now);
 assert.equal(b.fare,b.baseFare+Math.round(b.baseFare*.05)); assert.equal(b.payment.amount,b.fare);
 assert.equal(b.payment.status,'demo-paid');
});
test('idempotency, same-date conflicts, separate dates and cancellation release',()=>{
 const db=data(),req=request(db), b=Core.create(db,req,now);
 assert.equal(Core.create(db,req,now).id,b.id); assert.equal(db.bookings.length,1);
 assert.throws(()=>Core.create(db,{...req,requestId:crypto.randomUUID()},now),/just been booked/);
 const next=Core.create(db,{...req,requestId:crypto.randomUUID(),journeyDate:'2026-10-03'},now);
 assert.equal(Core.seatsFor(db,req.busId,req.journeyDate).seats[0].status,'booked');
 Core.cancel(db,b.id,req.ownerEmail,now);
 assert.equal(Core.seatsFor(db,req.busId,req.journeyDate).seats[0].status,'available');
 assert.equal(Core.seatsFor(db,req.busId,next.journeyDate).seats[0].status,'booked');
 assert.equal(Core.bookingsFor(db,req.ownerEmail).find(x=>x.id===b.id).status,'cancelled');
 assert.equal(Core.cancel(db,b.id,req.ownerEmail,now).booking.payment.status,'demo-refunded');
});
test('90-minute IST boundary, departure, midnight and year rollover',()=>{
 for(const offset of [-1,0,1]){
  const db=data(), req=request(db),b=Core.create(db,req,now),cutoff=Core.deadline(b);
  assert.equal(Core.canCancel(b,cutoff+offset),offset<=0);
  if(offset<=0) assert.equal(Core.cancel(db,b.id,req.ownerEmail,cutoff+offset).booking.status,'cancelled');
  else assert.throws(()=>Core.cancel(db,b.id,req.ownerEmail,cutoff+offset),/1 hour 30/);
 }
 assert.equal(Core.departureAt('2027-01-01','12:00 AM'),Date.parse('2026-12-31T18:30:00Z'));
 assert.equal(Core.departureAt('2027-01-01','12:00 PM'),Date.parse('2027-01-01T06:30:00Z'));
 const db=data(), req=request(db); const dep=Core.departureAt(req.journeyDate,db.buses[0].departure);
 assert.throws(()=>Core.create(db,req,dep),/already departed/);
 assert.throws(()=>Core.departureAt('2026-02-30','10:00'),/valid journey date/);
 assert.throws(()=>Core.departureAt('2026-10-01','13:00 PM'),/Invalid departure/);
});
test('history ownership, invalid passenger and payment validation',()=>{
 const db=data(), req=request(db),b=Core.create(db,req,now);
 assert.deepEqual(Core.bookingsFor(db,'someone@example.com'),[]);
 assert.throws(()=>Core.cancel(db,b.id,'someone@example.com',now),/not found/);
 assert.throws(()=>Core.create(data(),{...req,passenger:{name:'a',phone:'12',email:'bad'}},now),/valid 10-digit/);
 assert.throws(()=>Core.create(data(),{...req,paymentMethod:'real-card'},now),/demo payment/);
});
