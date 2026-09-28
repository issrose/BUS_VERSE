package com.busreservation.model;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Represents a passenger booking a ticket
 */
public class Passenger {
    private String passengerId; // Auto-generated UUID
    private String name;        // Full name
    private String email;       // Contact email
    private String phone;       // +91 formatted
    private int age;
    private char gender;        // 'M', 'F', 'O'

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+91\\d{10}$");

    public Passenger(String name, String email, String phone, int age, char gender) {
        this.passengerId = generatePassengerId();
        this.name = name;
        this.email = email;
        this.phone = phone != null && !phone.startsWith("+91") && phone.length() == 10 ? "+91" + phone : phone;
        this.age = age;
        this.gender = Character.toUpperCase(gender);
    }

    public boolean validateDetails() {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            return false;
        }
        if (phone == null || !PHONE_PATTERN.matcher(phone.trim()).matches()) {
            return false;
        }
        return age > 5;
    }

    public String getContactInfo() {
        return name + " | " + phone + " | " + email;
    }

    public String generatePassengerId() {
        return "PSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public boolean isSeniorCitizen() {
        return age >= 60;
    }

    public String getPassengerId() {
        return passengerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public char getGender() {
        return gender;
    }

    public void setGender(char gender) {
        this.gender = gender;
    }
}
