const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.BUSVERSE_DB_FILE || path.join(__dirname, 'busverse_db.json');
const Core = require('./booking-core');
const catalog = require('./catalog.json');

// --- Pre-seeded 40 Bus Stops ---
const DEFAULT_STOPS = [
  { id: "chemperi", name: "Chemperi", code: "CMP", district: "Kannur", state: "Kerala", landmark: "Chemperi Main Bus Stand", isHub: false },
  { id: "kannur", name: "Kannur", code: "CAN", district: "Kannur", state: "Kerala", landmark: "Thavakkara Central Bus Terminal", isHub: true },
  { id: "taliparamba", name: "Taliparamba", code: "TPA", district: "Kannur", state: "Kerala", landmark: "Highway Junction & Private Stand", isHub: true },
  { id: "alakode", name: "Alakode", code: "ALK", district: "Kannur", state: "Kerala", landmark: "Alakode Central Junction", isHub: false },
  { id: "karuvanchal", name: "Karuvanchal", code: "KVC", district: "Kannur", state: "Kerala", landmark: "Hillway Market Stand", isHub: false },
  { id: "payyavoor", name: "Payyavoor", code: "PYV", district: "Kannur", state: "Kerala", landmark: "Town Bus Stand", isHub: false },
  { id: "sreekandapuram", name: "Sreekandapuram", code: "SKP", district: "Kannur", state: "Kerala", landmark: "Kavumpady Stand", isHub: false },
  { id: "payyanur", name: "Payyanur", code: "PAY", district: "Kannur", state: "Kerala", landmark: "Perumba Central Bus Terminal", isHub: true },
  { id: "thalassery", name: "Thalassery", code: "TLY", district: "Kannur", state: "Kerala", landmark: "New Bus Stand & TC Junction", isHub: true },
  { id: "mahe", name: "Mahe", code: "MAHE", district: "Puducherry", state: "Puducherry", landmark: "National Highway Stand", isHub: false },
  { id: "iritty", name: "Iritty", code: "IRT", district: "Kannur", state: "Kerala", landmark: "Bridge Junction Bus Terminal", isHub: true },
  { id: "mattannur", name: "Mattannur", code: "MTR", district: "Kannur", state: "Kerala", landmark: "Kannur Airport Road Terminal", isHub: false },
  { id: "koothuparamba", name: "Koothuparamba", code: "KPB", district: "Kannur", state: "Kerala", landmark: "KPB Municipal Bus Stand", isHub: false },
  { id: "peravoor", name: "Peravoor", code: "PRV", district: "Kannur", state: "Kerala", landmark: "Town Bus Stand", isHub: false },
  { id: "cherupuzha", name: "Cherupuzha", code: "CHP", district: "Kannur", state: "Kerala", landmark: "High Range Bus Stand", isHub: false },
  { id: "kozhikode", name: "Kozhikode", code: "CCJ", district: "Kozhikode", state: "Kerala", landmark: "Mofussil & KSRTC Terminal", isHub: true },
  { id: "vadakara", name: "Vadakara", code: "VDK", district: "Kozhikode", state: "Kerala", landmark: "New Bus Stand", isHub: false },
  { id: "koyilandy", name: "Koyilandy", code: "KYD", district: "Kozhikode", state: "Kerala", landmark: "NH Highway Stand", isHub: false },
  { id: "ramanattukara", name: "Ramanattukara", code: "RMT", district: "Kozhikode", state: "Kerala", landmark: "Bypass Junction", isHub: false },
  { id: "kalpetta", name: "Kalpetta", code: "KPT", district: "Wayanad", state: "Kerala", landmark: "Wayanad Main Bus Terminal", isHub: true },
  { id: "sulthan-bathery", name: "Sulthan Bathery", code: "SBY", district: "Wayanad", state: "Kerala", landmark: "Interstate KSRTC Depot", isHub: true },
  { id: "mananthavady", name: "Mananthavady", code: "MNY", district: "Wayanad", state: "Kerala", landmark: "Hill Depot Bus Stand", isHub: false },
  { id: "kasaragod", name: "Kasaragod", code: "KSG", district: "Kasaragod", state: "Kerala", landmark: "KSRTC Bus Depot & Municipal Stand", isHub: true },
  { id: "kanhangad", name: "Kanhangad", code: "KHD", district: "Kasaragod", state: "Kerala", landmark: "New Bus Stand & Kanhangad South", isHub: true },
  { id: "nileshwar", name: "Nileshwar", code: "NLW", district: "Kasaragod", state: "Kerala", landmark: "Market Bus Stand", isHub: false },
  { id: "thrissur", name: "Thrissur", code: "TCR", district: "Thrissur", state: "Kerala", landmark: "Sakthan Thampuran & KSRTC Central", isHub: true },
  { id: "ernakulam", name: "Ernakulam", code: "EKM", district: "Ernakulam", state: "Kerala", landmark: "Vyttila Mobility Hub & KSRTC Stand", isHub: true },
  { id: "palakkad", name: "Palakkad", code: "PGT", district: "Palakkad", state: "Kerala", landmark: "Stadium Bus Stand", isHub: true },
  { id: "alappuzha", name: "Alappuzha", code: "ALP", district: "Alappuzha", state: "Kerala", landmark: "KSRTC Boat Jetty Stand", isHub: false },
  { id: "kottayam", name: "Kottayam", code: "KTM", district: "Kottayam", state: "Kerala", landmark: "Central KSRTC Bus Stand", isHub: false },
  { id: "trivandrum", name: "Thiruvananthapuram", code: "TVM", district: "Thiruvananthapuram", state: "Kerala", landmark: "Thampanoor Central Bus Station", isHub: true },
  { id: "bangalore", name: "Bangalore", code: "BLR", district: "Bengaluru Urban", state: "Karnataka", landmark: "Majestic, Satellite, Madiwala & Silk Board", isHub: true },
  { id: "mysore", name: "Mysore", code: "MYS", district: "Mysore", state: "Karnataka", landmark: "Suburban KSRTC Bus Station", isHub: true },
  { id: "mangalore", name: "Mangalore", code: "MLR", district: "Dakshina Kannada", state: "Karnataka", landmark: "Bejai KSRTC & State Bank Terminal", isHub: true },
  { id: "udupi", name: "Udupi", code: "UDP", district: "Udupi", state: "Karnataka", landmark: "Service Bus Stand", isHub: false },
  { id: "madikeri", name: "Madikeri", code: "MDK", district: "Kodagu", state: "Karnataka", landmark: "Coorg Central Bus Stand", isHub: false },
  { id: "chennai", name: "Chennai", code: "MAA", district: "Chennai", state: "Tamil Nadu", landmark: "CMBT Koyambedu & Tambaram", isHub: true },
  { id: "coimbatore", name: "Coimbatore", code: "CJB", district: "Coimbatore", state: "Tamil Nadu", landmark: "Gandhipuram Central Bus Stand", isHub: true },
  { id: "goa", name: "Goa", code: "GOA", district: "North Goa", state: "Goa", landmark: "Panaji Kadamba Bus Terminal", isHub: true },
  { id: "madgaon", name: "Madgaon", code: "MAO", district: "South Goa", state: "Goa", landmark: "Margao Central Terminal", isHub: true }
];

// --- Pre-seeded Popular Routes ---
const DEFAULT_ROUTES = [
  { id: "chemperi-kannur", source: "Chemperi", destination: "Kannur", fareFrom: 50, buses: 25, accent: "lime", distanceKm: 48, duration: "1h 45m" },
  { id: "taliparamba-bangalore", source: "Taliparamba", destination: "Bangalore", fareFrom: 450, buses: 18, accent: "orange", distanceKm: 345, duration: "8h 30m" },
  { id: "chemperi-bangalore", source: "Chemperi", destination: "Bangalore", fareFrom: 520, buses: 10, accent: "blue", distanceKm: 360, duration: "9h 15m" },
  { id: "taliparamba-chennai", source: "Taliparamba", destination: "Chennai", fareFrom: 550, buses: 8, accent: "violet", distanceKm: 650, duration: "12h 30m" },
  { id: "kannur-mysore", source: "Kannur", destination: "Mysore", fareFrom: 380, buses: 12, accent: "cyan", distanceKm: 205, duration: "5h 45m" },
  { id: "thalassery-goa", source: "Thalassery", destination: "Goa", fareFrom: 580, buses: 8, accent: "rose", distanceKm: 430, duration: "10h 15m" },
  { id: "kannur-kozhikode", source: "Kannur", destination: "Kozhikode", fareFrom: 95, buses: 32, accent: "emerald", distanceKm: 90, duration: "2h 15m" },
  { id: "taliparamba-kannur", source: "Taliparamba", destination: "Kannur", fareFrom: 35, buses: 40, accent: "amber", distanceKm: 22, duration: "40m" },
  { id: "payyanur-mangalore", source: "Payyanur", destination: "Mangalore", fareFrom: 110, buses: 22, accent: "sky", distanceKm: 115, duration: "2h 30m" },
  { id: "kannur-ernakulam", source: "Kannur", destination: "Ernakulam", fareFrom: 320, buses: 20, accent: "indigo", distanceKm: 270, duration: "6h 45m" },
  { id: "kozhikode-bangalore", source: "Kozhikode", destination: "Bangalore", fareFrom: 480, buses: 26, accent: "purple", distanceKm: 350, duration: "8h 00m" },
  { id: "kannur-wayanad", source: "Kannur", destination: "Kalpetta", fareFrom: 160, buses: 14, accent: "teal", distanceKm: 115, duration: "3h 30m" },
  { id: "chemperi-taliparamba", source: "Chemperi", destination: "Taliparamba", fareFrom: 40, buses: 28, accent: "pink", distanceKm: 28, duration: "50m" },
  { id: "iritty-bangalore", source: "Iritty", destination: "Bangalore", fareFrom: 460, buses: 12, accent: "yellow", distanceKm: 290, duration: "7h 15m" },
  { id: "kasaragod-bangalore", source: "Kasaragod", destination: "Bangalore", fareFrom: 490, buses: 16, accent: "red", distanceKm: 375, duration: "9h 00m" }
];

// Helper to build 32-36 seat grid
function generateSeatsForBus(busId, fare, busType) {
  const isSleeper = /sleeper/i.test(busType);
  const totalSeats = isSleeper ? 30 : 36;
  const seats = [];
  const rows = totalSeats / 4;

  const bookedIndices = new Set();
  const numBooked = Math.floor(Math.random() * 8) + 4; // 4 to 12 booked seats
  while (bookedIndices.size < numBooked) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }

  for (let i = 0; i < totalSeats; i++) {
    const row = Math.floor(i / 4) + 1;
    const colLetters = ['A', 'B', 'C', 'D'];
    const col = i % 4;
    const seatNumber = `${row}${colLetters[col]}`;
    const isBooked = bookedIndices.has(i);

    seats.push({
      id: `${busId}-s${i + 1}`,
      busId: busId,
      seatNumber: seatNumber,
      row: row,
      col: col + 1,
      type: isSleeper ? "sleeper" : "seater",
      fare: fare + (col === 0 || col === 3 ? 20 : 0), // small window surcharge
      status: isBooked ? "booked" : "available"
    });
  }
  return seats;
}

// Generate rich, realistic fleet of 65+ buses
function generateInitialBuses() {
  const busTemplates = [
    // 1. CHEMPERI -> KANNUR (Local routes starting ₹50)
    { id: "bus-ck-01", busNumber: "KL-59-A-1001", operator: "KSRTC Ordinary", busType: "Non-AC Seater", isAc: false, source: "Chemperi", destination: "Kannur", departure: "06:00 AM", arrival: "07:30 AM", duration: "1h 30m", fare: 50, rating: 4.2, amenities: ["Emergency Exit", "Luggage Rack"], boardingPoints: ["Chemperi Stand", "Alakode"], droppingPoints: ["Kannur Railway Station", "Kannur New Bus Stand"] },
    { id: "bus-ck-02", busNumber: "KL-59-A-1002", operator: "Malabar Express", busType: "Express Seater", isAc: false, source: "Chemperi", destination: "Kannur", departure: "06:45 AM", arrival: "08:05 AM", duration: "1h 20m", fare: 65, rating: 4.4, amenities: ["Reading Light", "Music System"], boardingPoints: ["Chemperi Central", "Sreekandapuram"], droppingPoints: ["Kannur Thavakkara Stand"] },
    { id: "bus-ck-03", busNumber: "KL-59-A-1003", operator: "Greenline Shuttles", busType: "AC Seater", isAc: true, source: "Chemperi", destination: "Kannur", departure: "07:30 AM", arrival: "08:45 AM", duration: "1h 15m", fare: 100, rating: 4.6, amenities: ["Air Conditioning", "Charging Point", "WiFi"], boardingPoints: ["Chemperi Stand", "Payyavoor"], droppingPoints: ["Kannur City Center"] },
    { id: "bus-ck-04", busNumber: "KL-59-A-1004", operator: "KSRTC Fast Passenger", busType: "Fast Passenger", isAc: false, source: "Chemperi", destination: "Kannur", departure: "08:15 AM", arrival: "09:35 AM", duration: "1h 20m", fare: 65, rating: 4.1, amenities: ["Luggage Space"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Thavakkara"] },
    { id: "bus-ck-05", busNumber: "KL-59-A-1005", operator: "Hillway Deluxe", busType: "Deluxe Seater", isAc: false, source: "Chemperi", destination: "Kannur", departure: "09:00 AM", arrival: "10:20 AM", duration: "1h 20m", fare: 75, rating: 4.3, amenities: ["Cushioned Seats", "Water Bottle"], boardingPoints: ["Chemperi Central"], droppingPoints: ["Kannur HQ"] },
    { id: "bus-ck-06", busNumber: "KL-59-AC-01", operator: "Royal AC Lines", busType: "AC Sleeper", isAc: true, source: "Chemperi", destination: "Kannur", departure: "09:45 AM", arrival: "11:00 AM", duration: "1h 15m", fare: 120, rating: 4.7, amenities: ["AC", "Blanket", "Charging Port"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Railway Station"] },
    { id: "bus-ck-07", busNumber: "KL-59-A-1007", operator: "KSRTC Ordinary", busType: "Non-AC Seater", isAc: false, source: "Chemperi", destination: "Kannur", departure: "11:00 AM", arrival: "12:30 PM", duration: "1h 30m", fare: 50, rating: 4.0, amenities: ["Basic First Aid"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Old Stand"] },
    { id: "bus-ck-08", busNumber: "KL-59-A-1008", operator: "Highland Express", busType: "Express Seater", isAc: false, source: "Chemperi", destination: "Kannur", departure: "02:00 PM", arrival: "03:20 PM", duration: "1h 20m", fare: 65, rating: 4.3, amenities: ["Clean Interior"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Thavakkara"] },
    { id: "bus-ck-09", busNumber: "KL-59-A-1009", operator: "KSRTC Evening Super", busType: "Fast Passenger", isAc: false, source: "Chemperi", destination: "Kannur", departure: "05:15 PM", arrival: "06:40 PM", duration: "1h 25m", fare: 65, rating: 4.2, amenities: ["Speedy Service"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Stand"] },
    { id: "bus-ck-10", busNumber: "KL-59-AC-02", operator: "Greenline AC", busType: "AC Seater", isAc: true, source: "Chemperi", destination: "Kannur", departure: "07:00 PM", arrival: "08:15 PM", duration: "1h 15m", fare: 110, rating: 4.8, amenities: ["AC", "WiFi", "Charging Port"], boardingPoints: ["Chemperi Stand"], droppingPoints: ["Kannur Railway Station"] },

    // 2. TALIPARAMBA -> BANGALORE
    { id: "bus-tb-01", busNumber: "KA-01-AB-1234", operator: "KSRTC Airavat", busType: "Volvo Multi-Axle AC", isAc: true, source: "Taliparamba", destination: "Bangalore", departure: "08:30 PM", arrival: "06:00 AM", duration: "9h 30m", fare: 820, rating: 4.7, amenities: ["AC", "Blanket", "Water Bottle", "Charging Point", "Emergency GPS"], boardingPoints: ["Taliparamba Highway Stand", "Taliparamba Bypass"], droppingPoints: ["Satellite Bus Stand", "Majestic KBS", "Shanthinagar"] },
    { id: "bus-tb-02", busNumber: "KA-01-AB-5678", operator: "Orange Travels", busType: "AC Sleeper (2+1)", isAc: true, source: "Taliparamba", destination: "Bangalore", departure: "09:00 PM", arrival: "06:30 AM", duration: "9h 30m", fare: 950, rating: 4.8, amenities: ["AC Sleeper", "Pillow", "Charging USB", "Live Tracking"], boardingPoints: ["Taliparamba Bypass", "Payyanur"], droppingPoints: ["Electronic City", "Silk Board", "Madiwala", "Majestic"] },
    { id: "bus-tb-03", busNumber: "KA-01-AB-9012", operator: "Kallada G4", busType: "Bharat Benz AC Sleeper", isAc: true, source: "Taliparamba", destination: "Bangalore", departure: "09:30 PM", arrival: "07:00 AM", duration: "9h 30m", fare: 990, rating: 4.9, amenities: ["Individual Screen", "AC", "Snacks", "Charging"], boardingPoints: ["Taliparamba Private Stand"], droppingPoints: ["Madiwala", "BTM Layout", "Silk Board", "Majestic"] },
    { id: "bus-tb-04", busNumber: "KA-01-AB-2345", operator: "KSRTC SWIFT Super Fast", busType: "Non-AC Seater", isAc: false, source: "Taliparamba", destination: "Bangalore", departure: "08:00 PM", arrival: "05:45 AM", duration: "9h 45m", fare: 450, rating: 4.2, amenities: ["Comfortable Pushback", "Luggage Storage"], boardingPoints: ["Taliparamba Stand"], droppingPoints: ["Kengeri", "Satellite Bus Station"] },
    { id: "bus-tb-05", busNumber: "KA-01-AB-6789", operator: "Greenline Travels", busType: "AC Seater", isAc: true, source: "Taliparamba", destination: "Bangalore", departure: "10:00 PM", arrival: "07:15 AM", duration: "9h 15m", fare: 780, rating: 4.5, amenities: ["AC", "Charging", "Water Bottle"], boardingPoints: ["Taliparamba Highway"], droppingPoints: ["Silk Board", "Indiranagar", "Majestic"] },
    { id: "bus-tb-06", busNumber: "KA-01-AB-3456", operator: "SRS Travels", busType: "Non-AC Sleeper", isAc: false, source: "Taliparamba", destination: "Bangalore", departure: "09:15 PM", arrival: "06:45 AM", duration: "9h 30m", fare: 600, rating: 4.3, amenities: ["Clean Bedsheet", "Fan", "Reading Light"], boardingPoints: ["Taliparamba Bypass"], droppingPoints: ["Electronic City", "Madiwala"] },
    { id: "bus-tb-07", busNumber: "KA-01-AB-7891", operator: "Evacay Bus", busType: "Scania Multi-Axle AC Sleeper", isAc: true, source: "Taliparamba", destination: "Bangalore", departure: "10:30 PM", arrival: "07:30 AM", duration: "9h 00m", fare: 1100, rating: 4.9, amenities: ["Premium Blankets", "Bottle", "High-speed USB-C", "Emergency Kit"], boardingPoints: ["Taliparamba Highway Stand"], droppingPoints: ["Bellandur", "Marathahalli", "Majestic"] },

    // 3. CHEMPERI -> BANGALORE
    { id: "bus-cb-01", busNumber: "KL-59-CB-01", operator: "KSRTC SWIFT Deluxe", busType: "Deluxe Non-AC", isAc: false, source: "Chemperi", destination: "Bangalore", departure: "07:00 PM", arrival: "05:30 AM", duration: "10h 30m", fare: 520, rating: 4.3, amenities: ["Pushback Seats", "Night Lighting"], boardingPoints: ["Chemperi Stand", "Alakode"], droppingPoints: ["Mysore Suburban", "Satellite Bus Station", "Majestic"] },
    { id: "bus-cb-02", busNumber: "KL-59-CB-02", operator: "Orange Travels Premium", busType: "AC Sleeper (2+1)", isAc: true, source: "Chemperi", destination: "Bangalore", departure: "08:15 PM", arrival: "06:00 AM", duration: "9h 45m", fare: 920, rating: 4.8, amenities: ["AC", "Pillow", "WiFi", "Charging Port"], boardingPoints: ["Chemperi Stand", "Karuvanchal"], droppingPoints: ["Electronic City", "Silk Board", "Majestic"] },
    { id: "bus-cb-03", busNumber: "KL-59-CB-03", operator: "Kallada AC Lines", busType: "Volvo Multi-Axle AC", isAc: true, source: "Chemperi", destination: "Bangalore", departure: "08:45 PM", arrival: "06:30 AM", duration: "9h 45m", fare: 980, rating: 4.7, amenities: ["AC", "Water Bottle", "Emergency Assistance"], boardingPoints: ["Chemperi Bus Stand"], droppingPoints: ["Madiwala", "Majestic", "Hebbal"] },

    // 4. TALIPARAMBA -> CHENNAI
    { id: "bus-tc-01", busNumber: "KL-01-TC-01", operator: "KSRTC Super Deluxe", busType: "Deluxe Non-AC", isAc: false, source: "Taliparamba", destination: "Chennai", departure: "04:30 PM", arrival: "06:30 AM", duration: "14h 00m", fare: 550, rating: 4.2, amenities: ["Pushback Seats", "Luggage Booth"], boardingPoints: ["Taliparamba Stand"], droppingPoints: ["Salem", "Vellore", "Koyambedu CMBT"] },
    { id: "bus-tc-02", busNumber: "KL-01-TC-02", operator: "Kallada G4 AC Sleeper", busType: "AC Sleeper", isAc: true, source: "Taliparamba", destination: "Chennai", departure: "06:00 PM", arrival: "07:00 AM", duration: "13h 00m", fare: 1050, rating: 4.8, amenities: ["AC Sleeper", "Pillows", "Charging Points"], boardingPoints: ["Taliparamba Highway Stand"], droppingPoints: ["Tambaram", "Guindy", "Koyambedu CMBT"] },

    // 5. KANNUR -> MYSORE
    { id: "bus-km-01", busNumber: "KL-13-KM-01", operator: "KSRTC Fast Passenger", busType: "Fast Passenger", isAc: false, source: "Kannur", destination: "Mysore", departure: "06:30 AM", arrival: "12:00 PM", duration: "5h 30m", fare: 380, rating: 4.2, amenities: ["Scenic Ghat Route"], boardingPoints: ["Kannur Thavakkara", "Mattannur", "Iritty"], droppingPoints: ["Hunsur", "Mysore Suburban Stand"] },
    { id: "bus-km-02", busNumber: "KL-13-KM-02", operator: "KSRTC SWIFT AC", busType: "AC Seater", isAc: true, source: "Kannur", destination: "Mysore", departure: "01:30 PM", arrival: "06:45 PM", duration: "5h 15m", fare: 560, rating: 4.6, amenities: ["AC", "Charging", "Panoramic Windows"], boardingPoints: ["Kannur Central", "Mattannur Airport"], droppingPoints: ["Mysore KSRTC Terminal"] },

    // 6. THALASSERY -> GOA
    { id: "bus-tg-01", busNumber: "KL-01-TG-01", operator: "KSRTC Interstate Express", busType: "Express Non-AC", isAc: false, source: "Thalassery", destination: "Goa", departure: "07:00 PM", arrival: "06:00 AM", duration: "11h 00m", fare: 580, rating: 4.3, amenities: ["Direct Coastal Route"], boardingPoints: ["Thalassery New Stand", "Kannur", "Payyanur"], droppingPoints: ["Karwar", "Madgaon", "Panaji Kadamba"] },
    { id: "bus-tg-02", busNumber: "KL-01-TG-02", operator: "Orange Travels AC Sleeper", busType: "AC Sleeper", isAc: true, source: "Thalassery", destination: "Goa", departure: "08:30 PM", arrival: "06:45 AM", duration: "10h 15m", fare: 1120, rating: 4.8, amenities: ["AC Sleeper", "Water Bottle", "Blanket"], boardingPoints: ["Thalassery TC Stand", "Kannur Thavakkara"], droppingPoints: ["Madgaon Central", "Panaji Bus Stand"] },

    // 7. KANNUR -> KOZHIKODE
    { id: "bus-ckz-01", busNumber: "KL-13-KZ-01", operator: "KSRTC Super Fast", busType: "Fast Passenger", isAc: false, source: "Kannur", destination: "Kozhikode", departure: "07:00 AM", arrival: "09:15 AM", duration: "2h 15m", fare: 95, rating: 4.3, amenities: ["Frequent Service"], boardingPoints: ["Kannur Thavakkara", "Thalassery", "Vadakara"], droppingPoints: ["Koyilandy", "Kozhikode Mofussil Stand"] },
    { id: "bus-ckz-02", busNumber: "KL-13-KZ-02", operator: "KSRTC Minnal Lightning Express", busType: "Minnal Express", isAc: false, source: "Kannur", destination: "Kozhikode", departure: "10:15 AM", arrival: "12:00 PM", duration: "1h 45m", fare: 120, rating: 4.6, amenities: ["Non-stop Express"], boardingPoints: ["Kannur Central"], droppingPoints: ["Kozhikode KSRTC Stand"] },
    { id: "bus-ckz-03", busNumber: "KL-13-KZ-03", operator: "Greenline AC", busType: "AC Seater", isAc: true, source: "Kannur", destination: "Kozhikode", departure: "03:00 PM", arrival: "04:50 PM", duration: "1h 50m", fare: 180, rating: 4.7, amenities: ["AC", "Charging", "Comfort Seats"], boardingPoints: ["Kannur Central", "Thalassery"], droppingPoints: ["Kozhikode Mofussil Stand"] },

    // 8. TALIPARAMBA -> KANNUR
    { id: "bus-tk-01", busNumber: "KL-59-TK-01", operator: "KSRTC Local Shuttle", busType: "Ordinary Seater", isAc: false, source: "Taliparamba", destination: "Kannur", departure: "07:15 AM", arrival: "07:55 AM", duration: "40m", fare: 35, rating: 4.2, amenities: ["Every 15 mins"], boardingPoints: ["Taliparamba Highway Stand", "Dharmasala"], droppingPoints: ["Kannur Thavakkara New Bus Stand"] },
    { id: "bus-tk-02", busNumber: "KL-59-TK-02", operator: "Malabar Town Express", busType: "Limited Stop", isAc: false, source: "Taliparamba", destination: "Kannur", departure: "08:30 AM", arrival: "09:05 AM", duration: "35m", fare: 40, rating: 4.3, amenities: ["Limited Stops"], boardingPoints: ["Taliparamba Private Stand"], droppingPoints: ["Kannur Railway Station"] },

    // 9. PAYYANUR -> MANGALORE
    { id: "bus-pm-01", busNumber: "KL-14-PM-01", operator: "KSRTC Interstate Express", busType: "Express Seater", isAc: false, source: "Payyanur", destination: "Mangalore", departure: "06:30 AM", arrival: "09:00 AM", duration: "2h 30m", fare: 110, rating: 4.3, amenities: ["Coastal Route"], boardingPoints: ["Payyanur Perumba Stand", "Kanhangad", "Kasaragod"], droppingPoints: ["State Bank Mangalore", "Bejai KSRTC Terminal"] },
    { id: "bus-pm-02", busNumber: "KA-19-PM-02", operator: "Canara AC Royal", busType: "AC Seater", isAc: true, source: "Payyanur", destination: "Mangalore", departure: "09:15 AM", arrival: "11:30 AM", duration: "2h 15m", fare: 210, rating: 4.6, amenities: ["AC", "Pushback Seats"], boardingPoints: ["Payyanur", "Kasaragod"], droppingPoints: ["Bejai KSRTC Terminal", "Pumpwell"] },

    // 10. KANNUR -> ERNAKULAM (KOCHI)
    { id: "bus-ke-01", busNumber: "KL-13-KE-01", operator: "KSRTC Super Express", busType: "Express Seater", isAc: false, source: "Kannur", destination: "Ernakulam", departure: "09:00 PM", arrival: "04:30 AM", duration: "7h 30m", fare: 350, rating: 4.3, amenities: ["Night Super Fast"], boardingPoints: ["Kannur Central", "Thalassery", "Vadakara", "Kozhikode"], droppingPoints: ["Edapally Toll", "Palarivattom", "Vyttila Mobility Hub"] },
    { id: "bus-ke-02", busNumber: "KL-13-KE-02", operator: "KSRTC SWIFT Gajaraj AC", busType: "Multi-Axle AC Sleeper", isAc: true, source: "Kannur", destination: "Ernakulam", departure: "10:30 PM", arrival: "05:15 AM", duration: "6h 45m", fare: 720, rating: 4.8, amenities: ["AC Sleeper", "Mineral Water", "USB Charger"], boardingPoints: ["Kannur Thavakkara Stand"], droppingPoints: ["Vyttila Mobility Hub", "Ernakulam KSRTC Stand"] },

    // 11. KOZHIKODE -> BANGALORE
    { id: "bus-kb-01", busNumber: "KL-11-KB-01", operator: "KSRTC SWIFT AC Sleeper", busType: "AC Sleeper", isAc: true, source: "Kozhikode", destination: "Bangalore", departure: "09:30 PM", arrival: "05:45 AM", duration: "8h 15m", fare: 880, rating: 4.7, amenities: ["AC", "Blanket", "USB Charging"], boardingPoints: ["Kozhikode KSRTC Depot", "Ramanattukara"], droppingPoints: ["Silk Board", "Madiwala", "Majestic"] },
    { id: "bus-kb-02", busNumber: "KA-01-KB-02", operator: "Kallada G4 Premium", busType: "Bharat Benz AC Sleeper", isAc: true, source: "Kozhikode", destination: "Bangalore", departure: "10:15 PM", arrival: "06:15 AM", duration: "8h 00m", fare: 950, rating: 4.9, amenities: ["AC Sleeper", "Bottled Water", "Snack Pack"], boardingPoints: ["Kozhikode Mofussil Stand"], droppingPoints: ["Electronic City", "Silk Board", "Majestic"] },

    // 12. KANNUR -> WAYANAD (KALPETTA)
    { id: "bus-kw-01", busNumber: "KL-13-KW-01", operator: "KSRTC Ghat Express", busType: "Fast Passenger", isAc: false, source: "Kannur", destination: "Kalpetta", departure: "07:30 AM", arrival: "11:00 AM", duration: "3h 30m", fare: 160, rating: 4.4, amenities: ["Scenic Western Ghats Route"], boardingPoints: ["Kannur Thavakkara", "Mattannur", "Koothuparamba", "Mananthavady"], droppingPoints: ["Kalpetta Main Bus Stand"] },
    { id: "bus-kw-02", busNumber: "KL-13-KW-02", operator: "Wayanad Tours AC", busType: "AC Seater", isAc: true, source: "Kannur", destination: "Kalpetta", departure: "01:00 PM", arrival: "04:15 PM", duration: "3h 15m", fare: 280, rating: 4.7, amenities: ["AC", "Comfort Recliners"], boardingPoints: ["Kannur Central", "Mattannur Airport"], droppingPoints: ["Kalpetta Bus Station"] },

    // 13. CHEMPERI -> TALIPARAMBA
    { id: "bus-ct-01", busNumber: "KL-59-CT-01", operator: "Hillway Local", busType: "Ordinary Seater", isAc: false, source: "Chemperi", destination: "Taliparamba", departure: "07:00 AM", arrival: "07:50 AM", duration: "50m", fare: 40, rating: 4.2, amenities: ["Every 20 mins"], boardingPoints: ["Chemperi Stand", "Karuvanchal"], droppingPoints: ["Taliparamba Highway Stand"] },
    { id: "bus-ct-02", busNumber: "KL-59-CT-02", operator: "St. Marys Shuttle", busType: "Express Seater", isAc: false, source: "Chemperi", destination: "Taliparamba", departure: "08:15 AM", arrival: "09:00 AM", duration: "45m", fare: 45, rating: 4.3, amenities: ["Fast Link"], boardingPoints: ["Chemperi Central"], droppingPoints: ["Taliparamba Private Stand"] },

    // 14. IRITTY -> BANGALORE
    { id: "bus-ib-01", busNumber: "KL-58-IB-01", operator: "KSRTC SWIFT Super", busType: "Fast Passenger", isAc: false, source: "Iritty", destination: "Bangalore", departure: "08:30 PM", arrival: "04:30 AM", duration: "8h 00m", fare: 460, rating: 4.3, amenities: ["Direct Coorg Highway Route"], boardingPoints: ["Iritty Bus Terminal", "Mattannur"], droppingPoints: ["Satellite Bus Station", "Majestic"] },
    { id: "bus-ib-02", busNumber: "KA-01-IB-02", operator: "Greenline AC Sleeper", busType: "AC Sleeper", isAc: true, source: "Iritty", destination: "Bangalore", departure: "09:45 PM", arrival: "05:30 AM", duration: "7h 45m", fare: 890, rating: 4.8, amenities: ["AC Sleeper", "Water Bottle", "Charging USB"], boardingPoints: ["Iritty Bridge Stand"], droppingPoints: ["Madiwala", "Silk Board", "Majestic"] },

    // 15. KASARAGOD -> BANGALORE
    { id: "bus-ksb-01", busNumber: "KL-14-KB-01", operator: "KSRTC Rajahamsa", busType: "Deluxe Non-AC", isAc: false, source: "Kasaragod", destination: "Bangalore", departure: "08:00 PM", arrival: "05:30 AM", duration: "9h 30m", fare: 490, rating: 4.3, amenities: ["Pushback Seats"], boardingPoints: ["Kasaragod KSRTC Stand", "Kanhangad"], droppingPoints: ["Satellite Stand", "Majestic"] },
    { id: "bus-ksb-02", busNumber: "KA-01-KB-03", operator: "SRS Multi-Axle AC Sleeper", busType: "AC Sleeper", isAc: true, source: "Kasaragod", destination: "Bangalore", departure: "09:15 PM", arrival: "06:15 AM", duration: "9h 00m", fare: 950, rating: 4.7, amenities: ["AC", "Blanket", "Charging Port"], boardingPoints: ["Kasaragod Stand", "Nileshwar"], droppingPoints: ["Electronic City", "Silk Board", "Majestic"] }
  ];

  return busTemplates.map(b => {
    const seats = generateSeatsForBus(b.id, b.fare, b.busType);
    const availableSeats = seats.filter(s => s.status === "available").length;
    return {
      ...b,
      totalSeats: seats.length,
      availableSeats: availableSeats,
      seats: seats
    };
  });
}

// Initial Sample Bookings for realistic dashboard
function generateInitialBookings(buses) {
  const sampleBus = buses.find(b => b.id === "bus-ck-03") || buses[0];
  const seat = sampleBus.seats.find(s => s.status === "booked") || sampleBus.seats[2];
  return [
    {
      id: "booking_bv101",
      pnr: "BV-849201",
      busId: sampleBus.id,
      bus: {
        id: sampleBus.id,
        operator: sampleBus.operator,
        busNumber: sampleBus.busNumber,
        source: sampleBus.source,
        destination: sampleBus.destination,
        departure: sampleBus.departure,
        arrival: sampleBus.arrival,
        duration: sampleBus.duration,
        busType: sampleBus.busType
      },
      seat: {
        id: seat.id,
        seatNumber: seat.seatNumber,
        fare: seat.fare
      },
      passenger: {
        name: "Traveler",
        phone: "+91 98765 43210",
        email: "traveler@gmail.com"
      },
      journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      fare: seat.fare,
      status: "confirmed",
      cancellableUntil: new Date(Date.now() + 86400000 - 7200000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
}

// In-Memory Database state with file persistence
class BusVerseDatabase {
  constructor() {
    this.data = {
      stops: DEFAULT_STOPS,
      routes: DEFAULT_ROUTES,
      buses: [],
      bookings: [],
      profile: {}
    };
    this.init();
    // Preserve booking history, but replace fictional schedule data with the expanded catalogue.
    this.data.stops = catalog.stops;
    this.data.routes = catalog.routes;
    this.data.buses = catalog.buses;
    this.save();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.stops && parsed.stops.length >= DEFAULT_STOPS.length && parsed.buses && parsed.buses.length > 0) {
          this.data = parsed;
          console.log(`[DB] Loaded existing database from ${DB_FILE} with ${this.data.stops.length} stops, ${this.data.buses.length} buses, and ${this.data.bookings.length} bookings.`);
          return;
        }
      } catch (err) {
        console.warn(`[DB] Could not parse existing DB file, reinitializing:`, err.message);
      }
    }

    // Initialize fresh seeded data
    this.data.stops = DEFAULT_STOPS;
    this.data.routes = DEFAULT_ROUTES;
    this.data.buses = generateInitialBuses();
    this.data.bookings = generateInitialBookings(this.data.buses);
    this.save();
    console.log(`[DB] Initialized fresh database with ${this.data.stops.length} stops and ${this.data.buses.length} buses.`);
  }

  save() {
    const temporary = DB_FILE + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(temporary, DB_FILE);
  }

  // --- STOPS ---
  getStops() {
    return this.data.stops;
  }

  findStop(query) {
    if (!query) return null;
    const q = query.trim().toLowerCase();
    return this.data.stops.find(s => s.name.toLowerCase() === q || s.id.toLowerCase() === q || s.code.toLowerCase() === q) || null;
  }

  // --- ROUTES ---
  getRoutes() {
    return this.data.routes;
  }

  // --- BUSES ---
  searchBuses(query) { return Core.search(this.data, query); }
  getBusSeats(busId, date) { return Core.seatsFor(this.data, busId, date || Core.today()); }
  transaction(operation) {
    const before = JSON.stringify(this.data.bookings);
    try {
      const result = operation();
      this.save();
      return result;
    } catch (error) {
      this.data.bookings = JSON.parse(before);
      throw error;
    }
  }
  createBooking(request) { return this.transaction(() => Core.create(this.data, request)); }
  getBookings(ownerEmail) { return Core.bookingsFor(this.data, ownerEmail); }
  getBooking(id, ownerEmail) { return this.getBookings(ownerEmail).find(b => b.id === id || b.pnr === id) || null; }
  cancelBooking(id, ownerEmail) { return this.transaction(() => Core.cancel(this.data, id, ownerEmail)); }

  // --- PROFILE ---
  getProfile() {
    return this.data.profile;
  }

  updateProfile(updates) {
    this.data.profile = {
      ...this.data.profile,
      ...updates
    };
    this.save();
    return this.data.profile;
  }

  // --- DASHBOARD ---
  getDashboard() {
    const confirmed = this.data.bookings.filter(b => b.status === "confirmed");
    const cancelled = this.data.bookings.filter(b => b.status === "cancelled");

    return {
      stats: {
        upcoming: confirmed.length,
        completed: cancelled.length,
        savedRoutes: this.data.routes.length
      },
      upcoming: confirmed.slice(0, 3),
      savedRoutes: this.data.routes.slice(0, 4)
    };
  }
}

const db = new BusVerseDatabase();

module.exports = {
  db,
  DEFAULT_STOPS,
  DEFAULT_ROUTES
};
