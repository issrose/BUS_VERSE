package com.busreservation.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a registered user with account management, saved routes, and booking history
 */
public class User {
    private String userId;
    private String username;
    private String passwordHash;
    private String email;
    private String phone;
    private List<Ticket> bookingHistory;
    private List<String> savedRoutes;
    private UserPreferences preferences;
    private LocalDateTime lastLogin;
    private boolean isActive;

    public User(String username, String email, String phone, String password) {
        this.userId = UUID.randomUUID().toString();
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.passwordHash = hashPassword(password);
        this.bookingHistory = new ArrayList<>();
        this.savedRoutes = new ArrayList<>();
        this.preferences = new UserPreferences();
        this.lastLogin = LocalDateTime.now();
        this.isActive = true;

        // Default Kerala routes
        this.savedRoutes.add("Taliparamba-Bangalore");
        this.savedRoutes.add("Taliparamba-Chennai");
        this.savedRoutes.add("Chemperi-Kannur");
        this.savedRoutes.add("Chemperi-Bangalore");
    }

    private String hashPassword(String pass) {
        // Simple hash representation for demonstration
        return "SECURE_HASH_" + Integer.toHexString(pass.hashCode());
    }

    public boolean authenticate(String inputPassword) {
        return hashPassword(inputPassword).equals(this.passwordHash);
    }

    public void updateProfile(String newUsername, String newPhone) {
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            this.username = newUsername;
        }
        if (newPhone != null && !newPhone.trim().isEmpty()) {
            this.phone = newPhone;
        }
    }

    public void changePassword(String oldPass, String newPass) {
        if (!authenticate(oldPass)) {
            throw new IllegalArgumentException("Current password does not match.");
        }
        if (newPass == null || newPass.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }
        this.passwordHash = hashPassword(newPass);
    }

    public void addBooking(Ticket ticket) {
        this.bookingHistory.add(0, ticket);
    }

    public List<Ticket> viewBookings() {
        return new ArrayList<>(this.bookingHistory);
    }

    public void addSavedRoute(String route) {
        if (!savedRoutes.contains(route)) {
            savedRoutes.add(route);
        }
    }

    public void removeSavedRoute(String route) {
        savedRoutes.remove(route);
    }

    public Ticket getUpcomingTrip() {
        return bookingHistory.stream()
                .filter(t -> t.getStatus() == TicketStatus.CONFIRMED)
                .findFirst()
                .orElse(null);
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public List<Ticket> getBookingHistory() {
        return bookingHistory;
    }

    public List<String> getSavedRoutes() {
        return savedRoutes;
    }

    public UserPreferences getPreferences() {
        return preferences;
    }

    public void setPreferences(UserPreferences preferences) {
        this.preferences = preferences;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
