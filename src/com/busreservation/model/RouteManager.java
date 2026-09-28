package com.busreservation.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Route manager with expanded Kerala & Interstate routes and distance-based fare calculation (starting ₹50)
 */
public class RouteManager {

    public static final String[] ALL_BUS_STOPS = {
        "Chemperi", "Kannur", "Taliparamba", "Alakode", "Karuvanchal", "Payyavoor",
        "Sreekandapuram", "Payyanur", "Thalassery", "Mahe", "Iritty", "Mattannur",
        "Koothuparamba", "Peravoor", "Cherupuzha", "Kozhikode", "Vadakara", "Koyilandy",
        "Ramanattukara", "Kalpetta", "Sulthan Bathery", "Mananthavady", "Kasaragod",
        "Kanhangad", "Nileshwar", "Thrissur", "Ernakulam", "Palakkad", "Alappuzha",
        "Kottayam", "Thiruvananthapuram", "Bangalore", "Mysore", "Mangalore", "Udupi",
        "Madikeri", "Chennai", "Coimbatore", "Goa", "Madgaon"
    };

    public static final String[] POPULAR_ROUTES = {
        "Chemperi-Kannur",
        "Taliparamba-Bangalore",
        "Chemperi-Bangalore",
        "Taliparamba-Chennai",
        "Kannur-Mysore",
        "Thalassery-Goa",
        "Kannur-Kozhikode",
        "Taliparamba-Kannur",
        "Payyanur-Mangalore",
        "Kannur-Ernakulam",
        "Kozhikode-Bangalore",
        "Kannur-Kalpetta",
        "Chemperi-Taliparamba",
        "Iritty-Bangalore",
        "Kasaragod-Bangalore",
        "Taliparamba-Goa",
        "Kannur-Bangalore",
        "Thalassery-Bangalore"
    };

    private static final Map<String, Double> ROUTE_DISTANCES = new HashMap<>();

    static {
        addDistance("CHEMPERI", "KANNUR", 48.0);
        addDistance("TALIPARAMBA", "KANNUR", 22.0);
        addDistance("CHEMPERI", "TALIPARAMBA", 28.0);
        addDistance("CHEMPERI", "ALAKODE", 12.0);
        addDistance("ALAKODE", "TALIPARAMBA", 26.0);
        addDistance("CHEMPERI", "SREEKANDAPURAM", 16.0);
        addDistance("SREEKANDAPURAM", "KANNUR", 32.0);
        addDistance("TALIPARAMBA", "PAYYANUR", 24.0);
        addDistance("PAYYANUR", "MANGALORE", 115.0);
        addDistance("KANNUR", "THALASSERY", 21.0);
        addDistance("THALASSERY", "KOZHIKODE", 69.0);
        addDistance("KANNUR", "KOZHIKODE", 90.0);
        addDistance("KANNUR", "KALPETTA", 115.0);
        addDistance("KANNUR", "ERNAKULAM", 270.0);
        addDistance("KANNUR", "THRISSUR", 205.0);
        addDistance("KANNUR", "TRIVANDRUM", 480.0);
        addDistance("TALIPARAMBA", "BANGALORE", 345.0);
        addDistance("CHEMPERI", "BANGALORE", 360.0);
        addDistance("KANNUR", "BANGALORE", 350.0);
        addDistance("KOZHIKODE", "BANGALORE", 350.0);
        addDistance("IRITTY", "BANGALORE", 290.0);
        addDistance("KASARAGOD", "BANGALORE", 375.0);
        addDistance("TALIPARAMBA", "CHENNAI", 650.0);
        addDistance("KANNUR", "CHENNAI", 670.0);
        addDistance("TALIPARAMBA", "MYSORE", 205.0);
        addDistance("KANNUR", "MYSORE", 205.0);
        addDistance("TALIPARAMBA", "GOA", 410.0);
        addDistance("THALASSERY", "GOA", 430.0);
        addDistance("KASARAGOD", "MANGALORE", 52.0);
        addDistance("KANNUR", "COIMBATORE", 220.0);
    }

    private static void addDistance(String src, String dest, double dist) {
        ROUTE_DISTANCES.put(src + "-" + dest, dist);
        ROUTE_DISTANCES.put(dest + "-" + src, dist);
    }

    public static double calculateDistance(String source, String dest) {
        String key = source.trim().toUpperCase() + "-" + dest.trim().toUpperCase();
        return ROUTE_DISTANCES.getOrDefault(key, 250.0);
    }

    /**
     * Fare calculation by distance:
     * < 50 km: ₹50 (Short: Chemperi → Kannur)
     * < 150 km: ₹150 (Medium: Taliparamba → Kannur / Kozhikode)
     * < 300 km: ₹350 (Long: Taliparamba → Mysore / Ernakulam)
     * < 500 km: ₹550 (Very Long: Taliparamba → Bangalore)
     * >= 500 km: ₹750 (Extra Long: Taliparamba → Chennai / Goa)
     */
    public static double getBaseFare(String source, String dest) {
        double distance = calculateDistance(source, dest);
        if (distance < 50) {
            return 50.0;
        } else if (distance < 150) {
            return 150.0;
        } else if (distance < 300) {
            return 350.0;
        } else if (distance < 500) {
            return 550.0;
        } else {
            return 750.0;
        }
    }
}
