package com.busreservation.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Represents a booked ticket with journey details, 90-minute cancellation check, and QR data
 */
public class Ticket {
    private String ticketId;       // e.g. "BV2026091501"
    private Bus bus;
    private String seatNumber;     // e.g. "12B" or "12"
    private String seatClass;      // "Non-AC", "AC Sleeper", etc.
    private double fare;           // Total calculated fare
    private Passenger passenger;
    private LocalDateTime bookingDate;
    private LocalDate journeyDate;
    private TicketStatus status;
    private String qrCode;
    private String pnr;

    public Ticket(Bus bus, Passenger passenger, String seatNumber, String seatClass, LocalDate journeyDate) {
        this.bus = bus;
        this.passenger = passenger;
        this.seatNumber = seatNumber;
        this.seatClass = seatClass;
        this.journeyDate = journeyDate;
        this.bookingDate = LocalDateTime.now();
        this.status = TicketStatus.CONFIRMED;
        this.fare = bus.calculateFare(seatClass, 1);
        this.pnr = generatePNR();
        this.ticketId = generateTicketId();
        this.qrCode = generateQRCode();
    }

    private String generatePNR() {
        Random rand = new Random();
        long pnrNum = 1000000000L + (long)(rand.nextDouble() * 8999999999L);
        return String.valueOf(pnrNum);
    }

    private String generateTicketId() {
        String datePart = journeyDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randSuffix = 10 + new Random().nextInt(90);
        return "BV" + datePart + randSuffix;
    }

    public String generateQRCode() {
        return "BVQR|" + ticketId + "|" + pnr + "|" + bus.getOperator() + "|"
                + bus.getSource() + "-" + bus.getDestination() + "|Seat:"
                + seatNumber + "|Fare:" + fare + "|Date:" + journeyDate;
    }

    public boolean isCancellable(LocalDateTime currentTime) {
        if (status != TicketStatus.CONFIRMED) {
            return false;
        }
        LocalDateTime departureDateTime = journeyDate.atTime(bus.getDepartureTime());
        return !currentTime.isAfter(departureDateTime.minusMinutes(90));
    }

    public boolean cancelTicket(LocalDateTime currentTime) {
        if (status != TicketStatus.CONFIRMED) {
            return false;
        }
        LocalDateTime departureDateTime = journeyDate.atTime(bus.getDepartureTime());
        if (currentTime.isAfter(departureDateTime.minusMinutes(90))) {
            throw new CancellationException(
                "Cancellation not allowed within 90 minutes of departure. "
                + "Departure: " + departureDateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
                + ". Policy: You can cancel until 90 minutes before departure time."
            );
        }

        this.status = TicketStatus.CANCELLED;
        bus.updateSeatStatus(seatNumber, true); // release seat
        return true;
    }

    public double calculateRefund() {
        if (status != TicketStatus.CANCELLED) {
            return 0.0;
        }
        double refundPercentage = 0.90; // 90% refund
        double refundAmount = (fare * refundPercentage) - 10.0; // Minus ₹10 payment gateway fee
        return Math.max(0.0, Math.round(refundAmount * 100.0) / 100.0);
    }

    public void printTicketDetails() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║             BUSVERSE E-TICKET                ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ PNR: " + pnr + "  Ticket ID: " + ticketId);
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ Bus: " + bus.getOperator() + " (" + bus.getBusNumber() + ")");
        System.out.println("║ Type: " + bus.getBusType().getDisplayName());
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ Route: " + bus.getSource() + " → " + bus.getDestination());
        System.out.println("║ Date:  " + journeyDate.format(dtf));
        System.out.println("║ Time:  " + bus.getDepartureTime() + " - " + bus.getArrivalTime());
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ Passenger: " + passenger.getName() + " (" + passenger.getPhone() + ")");
        System.out.println("║ Seat: " + seatNumber + " (" + seatClass + ")");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ Fare Breakdown:                              ║");
        double baseFarePart = fare / 1.05;
        double gstPart = fare - baseFarePart;
        System.out.printf("║ Base Fare:  ₹%.2f%n", baseFarePart);
        System.out.printf("║ GST (5%%):   ₹%.2f%n", gstPart);
        System.out.printf("║ Total Fare: ₹%.2f%n", fare);
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ Status: " + status);
        System.out.println("║ QR Code Data: " + qrCode.substring(0, Math.min(35, qrCode.length())) + "...");
        System.out.println("║ ⚠️ Cancellation allowed until 90 minutes before ║");
        System.out.println("║    departure time. 90% refund applicable.    ║");
        System.out.println("╚══════════════════════════════════════════════╝");
    }

    public String getTicketId() {
        return ticketId;
    }

    public Bus getBus() {
        return bus;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public String getSeatClass() {
        return seatClass;
    }

    public double getFare() {
        return fare;
    }

    public Passenger getPassenger() {
        return passenger;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getQrCode() {
        return qrCode;
    }

    public String getPnr() {
        return pnr;
    }
}
