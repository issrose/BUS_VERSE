-- ==========================================================
-- BusVerse Relational Database Schema (SQLite / PostgreSQL)
-- ==========================================================

CREATE TABLE IF NOT EXISTS stops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16) NOT NULL,
    district VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    landmark TEXT,
    is_hub BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(128) NOT NULL,
    destination VARCHAR(128) NOT NULL,
    fare_from NUMERIC(10, 2) NOT NULL,
    buses_count INT DEFAULT 0,
    accent VARCHAR(32) DEFAULT 'lime',
    distance_km NUMERIC(10, 2) DEFAULT 0,
    duration VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS buses (
    id VARCHAR(64) PRIMARY KEY,
    bus_number VARCHAR(32) NOT NULL,
    operator VARCHAR(128) NOT NULL,
    bus_type VARCHAR(64) NOT NULL,
    is_ac BOOLEAN DEFAULT 0,
    source VARCHAR(128) NOT NULL,
    destination VARCHAR(128) NOT NULL,
    departure VARCHAR(32) NOT NULL,
    arrival VARCHAR(32) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 4.0,
    available_seats INT DEFAULT 36,
    total_seats INT DEFAULT 36,
    amenities TEXT, -- JSON array
    boarding_points TEXT, -- JSON array
    dropping_points TEXT -- JSON array
);

CREATE TABLE IF NOT EXISTS seats (
    id VARCHAR(64) PRIMARY KEY,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    seat_number VARCHAR(16) NOT NULL,
    row_num INT NOT NULL,
    col_num INT NOT NULL,
    seat_type VARCHAR(32) DEFAULT 'seater',
    fare NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    pnr VARCHAR(32) UNIQUE NOT NULL,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id),
    seat_id VARCHAR(64) NOT NULL,
    seat_number VARCHAR(16) NOT NULL,
    passenger_name VARCHAR(128) NOT NULL,
    passenger_phone VARCHAR(32),
    passenger_email VARCHAR(128),
    journey_date VARCHAR(32) NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'confirmed', -- confirmed, cancelled
    cancellable_until VARCHAR(64),
    created_at VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    phone VARCHAR(32),
    default_class VARCHAR(32) DEFAULT 'all',
    max_fare NUMERIC(10, 2) DEFAULT 1200
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_buses_route ON buses(source, destination);
CREATE INDEX IF NOT EXISTS idx_seats_bus ON seats(bus_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr);
