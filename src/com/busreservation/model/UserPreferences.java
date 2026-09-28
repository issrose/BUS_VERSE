package com.busreservation.model;

/**
 * User travel preferences and notification flags
 */
public class UserPreferences {
    private String defaultRoute;
    private String preferredClass;
    private double maxFare;
    private boolean emailNotification;
    private boolean smsNotification;
    private boolean whatsappNotification;

    public UserPreferences() {
        this.defaultRoute = "Taliparamba-Bangalore";
        this.preferredClass = "Non-AC Seater";
        this.maxFare = 600.0;
        this.emailNotification = true;
        this.smsNotification = true;
        this.whatsappNotification = true;
    }

    public String getDefaultRoute() {
        return defaultRoute;
    }

    public void setDefaultRoute(String defaultRoute) {
        this.defaultRoute = defaultRoute;
    }

    public String getPreferredClass() {
        return preferredClass;
    }

    public void setPreferredClass(String preferredClass) {
        this.preferredClass = preferredClass;
    }

    public double getMaxFare() {
        return maxFare;
    }

    public void setMaxFare(double maxFare) {
        this.maxFare = maxFare;
    }

    public boolean isEmailNotification() {
        return emailNotification;
    }

    public void setEmailNotification(boolean emailNotification) {
        this.emailNotification = emailNotification;
    }

    public boolean isSmsNotification() {
        return smsNotification;
    }

    public void setSmsNotification(boolean smsNotification) {
        this.smsNotification = smsNotification;
    }

    public boolean isWhatsappNotification() {
        return whatsappNotification;
    }

    public void setWhatsappNotification(boolean whatsappNotification) {
        this.whatsappNotification = whatsappNotification;
    }
}
