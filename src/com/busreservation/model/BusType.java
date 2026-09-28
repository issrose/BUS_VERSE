package com.busreservation.model;

/**
 * Supported bus types across Kerala routes
 */
public enum BusType {
    ORDINARY("Non-AC Ordinary", false, 0.0),
    EXPRESS("Non-AC Express", false, 0.15),
    DELUXE("Non-AC Deluxe", false, 0.25),
    AC_SEATER("AC Seater", true, 0.40),
    AC_SLEEPER("AC Sleeper (2+1)", true, 0.60);

    private final String displayName;
    private final boolean isAc;
    private final double premiumRate;

    BusType(String displayName, boolean isAc, double premiumRate) {
        this.displayName = displayName;
        this.isAc = isAc;
        this.premiumRate = premiumRate;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isAc() {
        return isAc;
    }

    public double getPremiumRate() {
        return premiumRate;
    }
}
