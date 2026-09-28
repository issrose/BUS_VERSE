const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { db } = require('./db');

const PORT = process.env.PORT || 5000;
const WEB_DIR = path.join(__dirname, 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  console.log(`[HTTP] ${method} ${pathname}`);

  try {
    // -------------------------------------------------------------
    // API ENDPOINTS
    // -------------------------------------------------------------

    if (method === 'GET' && pathname === '/api/capabilities') return sendJson(res, 200, {bookingVersion: 2, paymentMode: 'demo'});

    // GET /api/stops (Autocomplete and stop explorer)
    if (method === 'GET' && pathname === '/api/stops') {
      const q = query.q ? String(query.q).toLowerCase() : '';
      let stops = db.getStops();
      if (q) {
        stops = stops.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.landmark.toLowerCase().includes(q)
        );
      }
      return sendJson(res, 200, stops);
    }

    // GET /api/routes
    if (method === 'GET' && pathname === '/api/routes') {
      const routes = db.getRoutes();
      return sendJson(res, 200, routes);
    }

    // GET /api/buses (Search buses)
    if (method === 'GET' && pathname === '/api/buses') {
      const buses = db.searchBuses({
        source: query.source,
        destination: query.destination,
        date: query.date,
        type: query.type,
        maxFare: query.maxFare
      });
      return sendJson(res, 200, buses);
    }

    // GET /api/buses/:busId/seats
    const seatsMatch = pathname.match(/^\/api\/buses\/([^\/]+)\/seats$/);
    if (method === 'GET' && seatsMatch) {
      const busId = decodeURIComponent(seatsMatch[1]);
      const data = db.getBusSeats(busId, query.date);
      if (!data) {
        return sendJson(res, 404, { error: 'Bus not found' });
      }
      return sendJson(res, 200, data);
    }

    // POST /api/bookings (Create booking)
    if (method === 'POST' && pathname === '/api/bookings') {
      const body = await parseBody(req);
      try {
        const booking = db.createBooking(body);
        return sendJson(res, 201, booking);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // GET /api/bookings (List bookings)
    if (method === 'GET' && pathname === '/api/bookings') {
      const bookings = db.getBookings(query.ownerEmail);
      return sendJson(res, 200, bookings);
    }

    // POST /api/bookings/:id/cancel
    const cancelMatch = pathname.match(/^\/api\/bookings\/([^\/]+)\/cancel$/);
    if (method === 'POST' && cancelMatch) {
      const bookingId = decodeURIComponent(cancelMatch[1]);
      try {
        const body = await parseBody(req);
        const result = db.cancelBooking(bookingId, body.ownerEmail);
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 404, { error: err.message });
      }
    }

    // GET /api/bookings/:id (Single ticket)
    const bookingMatch = pathname.match(/^\/api\/bookings\/([^\/]+)$/);
    if (method === 'GET' && bookingMatch) {
      const bookingId = decodeURIComponent(bookingMatch[1]);
      const booking = db.getBooking(bookingId, query.ownerEmail);
      if (!booking) {
        return sendJson(res, 404, { error: 'Booking not found' });
      }
      return sendJson(res, 200, booking);
    }

    // GET /api/profile
    if (method === 'GET' && pathname === '/api/profile') {
      const profile = db.getProfile();
      return sendJson(res, 200, profile);
    }

    // PATCH /api/profile
    if (method === 'PATCH' && pathname === '/api/profile') {
      const body = await parseBody(req);
      const updated = db.updateProfile(body);
      return sendJson(res, 200, updated);
    }

    // GET /api/dashboard
    if (method === 'GET' && pathname === '/api/dashboard') {
      const dashboard = db.getDashboard();
      return sendJson(res, 200, dashboard);
    }

    // POST /api/auth/login
    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseBody(req);
      const email = body.email || '';
      const user = {
        name: email === 'admin@busverse.in' ? 'Fleet Operations Admin' : 'Isha Rose',
        email: email,
        phone: '+91 98471 23456',
        role: email === 'admin@busverse.in' ? 'Fleet Admin' : 'Passenger'
      };
      return sendJson(res, 200, { success: true, user });
    }

    // POST /api/auth/register
    if (method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseBody(req);
      const user = {
        name: body.name || 'New Passenger',
        email: body.email,
        phone: body.phone || '+91 98471 00000',
        role: 'Passenger'
      };
      return sendJson(res, 201, { success: true, user });
    }

    // -------------------------------------------------------------
    // STATIC FILE SERVING (Frontend SPA)
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/')) return sendJson(res, 404, {error: 'API endpoint not found'});
    let filePath = path.join(WEB_DIR, pathname === '/' ? 'index.html' : pathname);

    if (!filePath.startsWith(WEB_DIR + path.sep)) return sendJson(res, 403, {error: 'Forbidden'});

    // If requesting a file that doesn't exist, fallback to index.html for SPA client-side routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(WEB_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (error) {
    console.error(`[Server Error]`, error);
    sendJson(res, 500, { error: 'Internal Server Error', message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 BusVerse Server is running!`);
  console.log(`  🌐 Local: http://localhost:${PORT}`);
  console.log(`  🚍 Database: busverse_db.json (Active & Persistent)`);
  console.log(`====================================================`);
});
