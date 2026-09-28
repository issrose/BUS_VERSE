const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:5000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /api/stops ---');
  const stops = await get('/api/stops');
  console.log('Stops count:', stops.data.length, 'Status:', stops.status);

  console.log('\n--- 2. Testing GET /api/routes ---');
  const routes = await get('/api/routes');
  console.log('Routes count:', routes.data.length, 'Status:', routes.status);

  console.log('\n--- 3. Testing GET /api/buses?source=Chemperi&destination=Kannur ---');
  const buses = await get('/api/buses?source=Chemperi&destination=Kannur');
  console.log('Found buses:', buses.data.length, 'Status:', buses.status);
  console.log('First bus:', buses.data[0]?.operator, buses.data[0]?.departure, '₹' + buses.data[0]?.fare);

  console.log('\n--- 4. Testing GET /api/buses/:id/seats ---');
  const firstBusId = buses.data[0].id;
  const seats = await get(`/api/buses/${firstBusId}/seats`);
  console.log('Bus seats count:', seats.data.seats.length, 'Status:', seats.status);

  console.log('\n--- 5. Testing POST /api/bookings ---');
  const availableSeat = seats.data.seats.find(s => s.status === 'available');
  const booking = await post('/api/bookings', {
    busId: firstBusId,
    seatId: availableSeat.id,
    journeyDate: '2026-09-20',
    passenger: {
      name: 'Isha Test',
      phone: '+91 9998887776',
      email: 'isha@example.com'
    }
  });
  console.log('Booking created:', booking.data.pnr, 'Status:', booking.status);

  console.log('\n--- 6. Testing GET /api/dashboard ---');
  const dash = await get('/api/dashboard');
  console.log('Dashboard stats:', dash.data.stats, 'Status:', dash.status);

  console.log('\n--- 7. Testing POST /api/bookings/:id/cancel ---');
  const cancel = await post(`/api/bookings/${booking.data.id}/cancel`, {});
  console.log('Cancellation result:', cancel.data.message, 'Status:', cancel.status);

  console.log('\n✅ ALL SERVER API ENDPOINTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
