package com.busreservation.service;

import com.busreservation.model.Bus;
import com.busreservation.model.BusType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Preloaded Kerala & Interstate routes data satisfying mixed fleet and fares starting from ₹50.
 * Covers 40+ stops including Chemperi, Kannur, Taliparamba, Kozhikode, Wayanad, Bangalore, and more.
 */
public class SampleBusData {

    public static List<Bus> getAllKeralaBuses() {
        List<Bus> buses = new ArrayList<>();

        // 1. CHEMPERI -> KANNUR (Short Route: 48 km, starting ₹50)
        buses.add(new Bus("KL59A1001", "Chemperi", "Kannur", 45, "KSRTC", BusType.ORDINARY, 50, "06:00", "07:30", 4.1,
                Arrays.asList("Chemperi Bus Stand", "Alakode", "Karuvanchal"), Arrays.asList("Kannur Railway Station", "Kannur New Bus Stand")));
        buses.add(new Bus("KL59A1002", "Chemperi", "Kannur", 45, "KSRTC", BusType.ORDINARY, 50, "06:45", "08:15", 4.0,
                Arrays.asList("Chemperi Bus Stand", "Sreekandapuram"), Arrays.asList("Kannur Old Bus Stand")));
        buses.add(new Bus("KL59A1003", "Chemperi", "Kannur", 42, "Greenline Express", BusType.EXPRESS, 65, "07:30", "08:45", 4.3,
                Arrays.asList("Chemperi", "Payyavoor"), Arrays.asList("Kannur HQ", "Kannur Railway Station")));
        buses.add(new Bus("KL59A1004", "Chemperi", "Kannur", 45, "KSRTC Fast Passenger", BusType.EXPRESS, 65, "08:15", "09:30", 4.2,
                Arrays.asList("Chemperi Bus Stand"), Arrays.asList("Kannur Bus Terminal")));
        buses.add(new Bus("KL59A1005", "Chemperi", "Kannur", 40, "Malabar Travels", BusType.DELUXE, 80, "09:00", "10:15", 4.4,
                Arrays.asList("Chemperi Central"), Arrays.asList("Kannur City")));
        buses.add(new Bus("KL59AC01", "Chemperi", "Kannur", 32, "Royal AC Lines", BusType.AC_SEATER, 100, "14:00", "15:15", 4.5,
                Arrays.asList("Chemperi Main"), Arrays.asList("Kannur Railway Station")));
        buses.add(new Bus("KL59AC02", "Chemperi", "Kannur", 32, "Greenline AC", BusType.AC_SEATER, 110, "16:15", "17:30", 4.6,
                Arrays.asList("Chemperi"), Arrays.asList("Kannur")));
        buses.add(new Bus("KL59AC03", "Chemperi", "Kannur", 30, "Orange AC", BusType.AC_SLEEPER, 120, "22:15", "23:30", 4.6,
                Arrays.asList("Chemperi"), Arrays.asList("Kannur")));

        // 2. TALIPARAMBA -> BANGALORE (345 km)
        buses.add(new Bus("KA01AB1234", "Taliparamba", "Bangalore", 45, "KSRTC", BusType.ORDINARY, 450, "20:30", "06:30", 4.1,
                Arrays.asList("Taliparamba Highway Stand", "Kannur"), Arrays.asList("Mysore", "Bangalore Satellite")));
        buses.add(new Bus("KA01AB5678", "Taliparamba", "Bangalore", 42, "Orange Travels", BusType.EXPRESS, 520, "21:00", "07:00", 4.3,
                Arrays.asList("Taliparamba Bypass", "Payyanur"), Arrays.asList("Electronic City", "Silk Board", "Majestic")));
        buses.add(new Bus("KA01AB9012", "Taliparamba", "Bangalore", 40, "Kallada", BusType.DELUXE, 620, "21:30", "07:30", 4.4,
                Arrays.asList("Taliparamba Private Stand"), Arrays.asList("Madiwala", "Shantinagar", "Majestic")));
        buses.add(new Bus("KA01AC3456", "Taliparamba", "Bangalore", 36, "Orange Travels AC", BusType.AC_SLEEPER, 890, "21:00", "07:00", 4.6,
                Arrays.asList("Taliparamba Bypass"), Arrays.asList("Electronic City", "Silk Board", "Majestic")));
        buses.add(new Bus("KA01AC7890", "Taliparamba", "Bangalore", 32, "Kallada G4 Bharat Benz", BusType.AC_SLEEPER, 950, "21:30", "07:30", 4.7,
                Arrays.asList("Taliparamba Private Stand"), Arrays.asList("Madiwala", "Majestic")));
        buses.add(new Bus("KA01AC7878", "Taliparamba", "Bangalore", 30, "Evacay Multi-Axle AC", BusType.AC_SLEEPER, 1100, "23:15", "09:00", 4.8,
                Arrays.asList("Taliparamba Bypass"), Arrays.asList("Bellandur", "Marathahalli", "Majestic")));

        // 3. CHEMPERI -> BANGALORE (360 km)
        buses.add(new Bus("KL59CB01", "Chemperi", "Bangalore", 45, "KSRTC SWIFT Deluxe", BusType.DELUXE, 520, "19:00", "06:00", 4.0,
                Arrays.asList("Chemperi", "Alakode", "Payyanur"), Arrays.asList("Mysore", "Bangalore Satellite")));
        buses.add(new Bus("KL59CB03", "Chemperi", "Bangalore", 36, "Orange Travels AC", BusType.AC_SLEEPER, 890, "20:30", "07:00", 4.6,
                Arrays.asList("Chemperi"), Arrays.asList("Silk Board", "Majestic")));
        buses.add(new Bus("KL59CB04", "Chemperi", "Bangalore", 32, "Kallada AC", BusType.AC_SLEEPER, 960, "21:00", "07:30", 4.7,
                Arrays.asList("Chemperi"), Arrays.asList("Madiwala", "Majestic")));

        // 4. TALIPARAMBA -> CHENNAI & GOA
        buses.add(new Bus("KL01TC01", "Taliparamba", "Chennai", 40, "KSRTC", BusType.DELUXE, 550, "18:00", "08:30", 4.1,
                Arrays.asList("Taliparamba"), Arrays.asList("Koyambedu", "Tambaram")));
        buses.add(new Bus("KL01TC02", "Taliparamba", "Chennai", 32, "Kallada AC", BusType.AC_SLEEPER, 1050, "19:30", "09:00", 4.8,
                Arrays.asList("Taliparamba"), Arrays.asList("Koyambedu", "Guindy")));
        buses.add(new Bus("KL01TG01", "Taliparamba", "Goa", 42, "KSRTC Interstate Express", BusType.EXPRESS, 580, "20:00", "07:30", 4.2,
                Arrays.asList("Taliparamba"), Arrays.asList("Madgaon", "Panaji")));
        buses.add(new Bus("KL01TG02", "Taliparamba", "Goa", 32, "Orange Travels AC", BusType.AC_SLEEPER, 890, "21:30", "08:15", 4.7,
                Arrays.asList("Taliparamba"), Arrays.asList("Madgaon", "Panaji Central")));

        // 5. KANNUR -> KOZHIKODE & WAYANAD (KALPETTA)
        buses.add(new Bus("KL13KZ01", "Kannur", "Kozhikode", 45, "KSRTC Super Fast", BusType.EXPRESS, 95, "07:00", "09:15", 4.3,
                Arrays.asList("Kannur Thavakkara", "Thalassery", "Vadakara"), Arrays.asList("Koyilandy", "Kozhikode Mofussil Stand")));
        buses.add(new Bus("KL13KZ02", "Kannur", "Kozhikode", 40, "Greenline AC Seater", BusType.AC_SEATER, 180, "15:00", "16:50", 4.7,
                Arrays.asList("Kannur Central"), Arrays.asList("Kozhikode KSRTC Stand")));
        buses.add(new Bus("KL13KW01", "Kannur", "Kalpetta", 45, "KSRTC Ghat Express", BusType.EXPRESS, 160, "07:30", "11:00", 4.4,
                Arrays.asList("Kannur Thavakkara", "Mattannur", "Koothuparamba", "Mananthavady"), Arrays.asList("Kalpetta Main Bus Stand")));

        // 6. PAYYANUR -> MANGALORE & KANNUR -> ERNAKULAM
        buses.add(new Bus("KL14PM01", "Payyanur", "Mangalore", 45, "KSRTC Interstate", BusType.EXPRESS, 110, "06:30", "09:00", 4.3,
                Arrays.asList("Payyanur Perumba Stand", "Kanhangad", "Kasaragod"), Arrays.asList("State Bank", "Bejai KSRTC Terminal")));
        buses.add(new Bus("KL13KE01", "Kannur", "Ernakulam", 45, "KSRTC SWIFT Super", BusType.DELUXE, 350, "21:00", "04:30", 4.3,
                Arrays.asList("Kannur Central", "Thalassery", "Kozhikode"), Arrays.asList("Edapally", "Vyttila Mobility Hub")));
        buses.add(new Bus("KL13KE02", "Kannur", "Ernakulam", 32, "KSRTC SWIFT Gajaraj AC", BusType.AC_SLEEPER, 720, "22:30", "05:15", 4.8,
                Arrays.asList("Kannur Thavakkara Stand"), Arrays.asList("Vyttila Mobility Hub", "Ernakulam KSRTC Stand")));

        // 7. CHEMPERI -> TALIPARAMBA & IRITTY -> BANGALORE
        buses.add(new Bus("KL59CT01", "Chemperi", "Taliparamba", 45, "Hillway Local", BusType.ORDINARY, 40, "07:00", "07:50", 4.2,
                Arrays.asList("Chemperi Stand", "Karuvanchal"), Arrays.asList("Taliparamba Highway Stand")));
        buses.add(new Bus("KL58IB01", "Iritty", "Bangalore", 45, "KSRTC SWIFT Super Fast", BusType.EXPRESS, 460, "20:30", "04:30", 4.3,
                Arrays.asList("Iritty Terminal", "Mattannur"), Arrays.asList("Satellite Stand", "Majestic")));

        return buses;
    }
}
