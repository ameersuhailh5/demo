package com.medikiosk.model;

import java.util.List;

public class Doctor {
    private String id;
    private String name;
    private String title;
    private String specialty;
    private String department;
    private String room;
    private boolean available;
    private String phone;
    private String email;
    private String treatmentType; // "allopathy" or "ayurveda"
    private int activePatientCount;

    public Doctor() {}

    public Doctor(String id, String name, String title, String specialty, String department, String room, boolean available, String phone, String email, String treatmentType) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.specialty = specialty;
        this.department = department;
        this.room = room;
        this.available = available;
        this.phone = phone;
        this.email = email;
        this.treatmentType = treatmentType;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTreatmentType() { return treatmentType; }
    public void setTreatmentType(String treatmentType) { this.treatmentType = treatmentType; }

    public int getActivePatientCount() { return activePatientCount; }
    public void setActivePatientCount(int activePatientCount) { this.activePatientCount = activePatientCount; }

    public String toJson() {
        return "{" +
            "\"id\":\"" + escape(id) + "\"," +
            "\"name\":\"" + escape(name) + "\"," +
            "\"title\":\"" + escape(title) + "\"," +
            "\"specialty\":\"" + escape(specialty) + "\"," +
            "\"department\":\"" + escape(department) + "\"," +
            "\"room\":\"" + escape(room) + "\"," +
            "\"available\":" + available + "," +
            "\"phone\":\"" + escape(phone) + "\"," +
            "\"email\":\"" + escape(email) + "\"," +
            "\"treatmentType\":\"" + escape(treatmentType) + "\"," +
            "\"activePatientCount\":" + activePatientCount +
            "}";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
