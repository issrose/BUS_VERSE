const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const Core = require('../booking-core');
const catalog = require('../catalog.json');
const source=fs.readFileSync(path.join(__dirname,'../booking-store.js'),'utf8')+'\nglobalThis.store = BookingStore;';
function context(storage, fetcher){
 const ctx={BookingCore:Core,state:{currentUser:{email:'test@example.com'}},location:{hostname:fetcher?'localhost':'issrose.github.io'},URLSearchParams,
 localStorage:storage,navigator:{locks:{request:async(_,fn)=>fn()}},fetch:fetcher || (async()=>({ok:true,json:async()=>catalog}))};
 vm.createContext(ctx); vm.runInContext(source,ctx); return ctx.store;
}
const req=()=>({busId:catalog.buses[0].id,seatId:catalog.buses[0].seats[0].id,journeyDate:'2099-01-01',requestId:crypto.randomUUID(),passenger:{name:'Test',email:'test@example.com',phone:'9876543210'},paymentMethod:'demo-upi',paymentOutcome:'success'});
test('static browser store survives reload and cancelled history is retained',async()=>{
 const memory=new Map(), storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 const first=context(storage);await first.init(); const b=await first.create(req());
 const reload=context(storage);await reload.init();assert.equal((await reload.list())[0].id,b.id);
 await reload.cancel(b.id);assert.equal((await first.list())[0].status,'cancelled');
 assert.equal((await first.seats(b.busId,b.journeyDate)).seats[0].status,'available');
});
test('storage failures and API failures never return a fake confirmed ticket',async()=>{
 const broken=context({getItem:()=>null,setItem:()=>{throw new Error('quota')}});await broken.init();
 await assert.rejects(broken.create(req()),/Could not save/);
 const api=context({getItem:()=>null,setItem:()=>assert.fail('must not save locally')},async(url)=>({ok:!url.includes('/api/bookings'),json:async()=> url==='/api/capabilities'?{bookingVersion:2}:url==='/api/stops'?catalog.stops:url==='/api/routes'?catalog.routes:{error:'Seat conflict'}}));
 await api.init();await assert.rejects(api.create(req()),/Seat conflict/);
});
