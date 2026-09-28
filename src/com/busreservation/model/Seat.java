package com.busreservation.model;

/**
 * Represents an individual seat on a bus
 */
public class Seat {
    private String seatNumber; // e.g. "1A", "12B"
    private String seatClass;  // "Non-AC", "AC"
    private SeatPosition position; // WINDOW, AISLE, LOWER, UPPER
    private boolean isAvailable;
    private double fare;

    public Seat(String seatNumber, String seatClass, SeatPosition position, double fare) {
        this.seatNumber = seatNumber;
        this.seatClass = seatClass;
        this.position = position;
        this.isAvailable = true;
        this.fare = fare;
    }

    public void book() {
        this.isAvailable = false;
    }

    public void cancel() {
        this.isAvailable = true;
    }

    public boolean isWindow() {
        return this.position == SeatPosition.WINDOW;
    }

    public String getSeatType() {
        return seatClass;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public String getSeatClass() {
        return seatClass;
    }

    public SeatPosition getPosition() {
        return position;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public double getFare() {
        return fare;
    }

    public void setFare(double fare) {
        this.fare = fare;
    }
}
