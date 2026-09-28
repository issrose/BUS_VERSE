package com.busreservation.model;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a bus route with distance, stops, and estimated duration
 */
public class Route {
    private String source;
    private String destination;
    private double distance; // in km
    private List<String> stops;
    private Duration estimatedDuration;
    private double baseFare;

    public Route(String source, String destination, double distance, List<String> stops, Duration estimatedDuration, double baseFare) {
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.stops = stops != null ? stops : new ArrayList<>();
        this.estimatedDuration = estimatedDuration;
        this.baseFare = baseFare;
    }

    public double calculateDistance() {
        return distance;
    }

    public List<String> getBoardingPoints() {
        List<String> list = new ArrayList<>();
        list.add(source);
        list.addAll(stops);
        return list;
    }

    public List<String> getDroppingPoints() {
        List<String> list = new ArrayList<>();
        list.addAll(stops);
        list.add(destination);
        return list;
    }

    public double calculateFare(String busType) {
        return RouteManager.getBaseFare(source, destination);
    }

    public String getSource() {
        return source;
    }

    public String getDestination() {
        return destination;
    }

    public double getDistance() {
        return distance;
    }

    public List<String> getStops() {
        return stops;
    }

    public Duration getEstimatedDuration() {
        return estimatedDuration;
    }

    public double getBaseFare() {
        return baseFare;
    }
}
