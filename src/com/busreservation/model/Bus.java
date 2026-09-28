package com.busreservation.model;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Represents a bus in the reservation system
 * Supports both AC and Non-AC buses with varying fare structures
 */
public class Bus {
    private String busNumber;        // e.g., "KL01AB1234"
    private String source;           // e.g., "Taliparamba", "Chemperi"
    private String destination;      // e.g., "Bangalore", "Kannur"
    private int totalCapacity;       // e.g., 45 (Non-AC), 36 (AC Sleeper)
    private List<Seat> seats;        // All seats on bus
    private Map<String, Double> seatClassFares; // {"Non-AC": 450, "AC": 750}
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private String operator;         // "Orange", "Kallada", "KSRTC", "Greenline"
    private BusType busType;         // Enum: ORDINARY, EXPRESS, DELUXE, AC_SLEEPER
    private double baseFare;         // Starting from ₹50 for short routes
    private List<String> boardingPoints;
    private List<String> droppingPoints;
    private double rating;           // Operator rating (e.g. 4.3)

    public Bus(String busNumber, String source, String destination, int totalCapacity,
               String operator, BusType busType, double baseFare,
               String departureTimeStr, String arrivalTimeStr) {
        this.busNumber = busNumber;
        this.source = source;
        this.destination = destination;
        this.totalCapacity = totalCapacity;
        this.operator = operator;
        this.busType = busType;
        this.baseFare = baseFare;
        this.departureTime = LocalTime.parse(departureTimeStr);
        this.arrivalTime = LocalTime.parse(arrivalTimeStr);
        this.seats = new ArrayList<>();
        this.seatClassFares = new HashMap<>();
        this.boardingPoints = new ArrayList<>(Arrays.asList(source + " Bus Stand"));
        this.droppingPoints = new ArrayList<>(Arrays.asList(destination + " Central"));
        this.rating = 4.2;

        initializeSeats();
    }

    public Bus(String busNumber, String source, String destination, int totalCapacity,
               String operator, BusType busType, double baseFare,
               String departureTimeStr, String arrivalTimeStr, double rating,
               List<String> boardingPoints, List<String> droppingPoints) {
        this(busNumber, source, destination, totalCapacity, operator, busType, baseFare, departureTimeStr, arrivalTimeStr);
        this.rating = rating;
        if (boardingPoints != null && !boardingPoints.isEmpty()) {
            this.boardingPoints = boardingPoints;
        }
        if (droppingPoints != null && !droppingPoints.isEmpty()) {
            this.droppingPoints = droppingPoints;
        }
    }

    private void initializeSeats() {
        boolean isAc = busType.isAc();
        String seatClass = isAc ? (busType == BusType.AC_SLEEPER ? "AC Sleeper" : "AC Seater") : "Non-AC";
        double seatFare = calculateFare(seatClass, 1);

        for (int i = 1; i <= totalCapacity; i++) {
            // Standard 2+2 layout: Seat numbers like 1A, 1B, 1C, 1D or numbers 1..totalCapacity
            int col = (i - 1) % 4; // 0, 1 aisle 2, 3
            SeatPosition pos = (col == 0 || col == 3) ? SeatPosition.WINDOW : SeatPosition.AISLE;
            seats.add(new Seat(String.valueOf(i), seatClass, pos, seatFare));
        }
        seatClassFares.put(seatClass, seatFare);
    }

    public boolean checkSeatAvailability(String seatNumber) {
        return seats.stream()
                .filter(s -> s.getSeatNumber().equalsIgnoreCase(seatNumber))
                .map(Seat::isAvailable)
                .findFirst()
                .orElse(false);
    }

    public double getFareByClass(String seatClass) {
        return calculateFare(seatClass, 1);
    }

    public Route getRouteDetails() {
        return new Route(source, destination, RouteManager.calculateDistance(source, destination),
                boardingPoints, java.time.Duration.between(departureTime, arrivalTime), baseFare);
    }

    public boolean updateSeatStatus(String seatNumber, boolean isAvailable) {
        for (Seat s : seats) {
            if (s.getSeatNumber().equalsIgnoreCase(seatNumber)) {
                s.setAvailable(isAvailable);
                return true;
            }
        }
        return false;
    }

    public List<String> getAvailableSeats() {
        return seats.stream()
                .filter(Seat::isAvailable)
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());
    }

    public int getAvailableSeatCount() {
        return (int) seats.stream().filter(Seat::isAvailable).count();
    }

    public boolean isNonAC() {
        return !busType.isAc();
    }

    public double calculateFare(String seatClass, int passengerCount) {
        double premium = busType.getPremiumRate();
        double subtotal = baseFare * (1.0 + premium);
        double gst = subtotal * 0.05; // 5% GST
        double totalOne = Math.max(50.0, Math.round((subtotal + gst) * 100.0) / 100.0);
        return totalOne * passengerCount;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public String getSource() {
        return source;
    }

    public String getDestination() {
        return destination;
    }

    public int getTotalCapacity() {
        return totalCapacity;
    }

    public List<Seat> getSeats() {
        return seats;
    }

    public Map<String, Double> getSeatClassFares() {
        return seatClassFares;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public String getOperator() {
        return operator;
    }

    public BusType getBusType() {
        return busType;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public List<String> getBoardingPoints() {
        return boardingPoints;
    }

    public List<String> getDroppingPoints() {
        return droppingPoints;
    }

    public double getRating() {
        return rating;
    }
}
