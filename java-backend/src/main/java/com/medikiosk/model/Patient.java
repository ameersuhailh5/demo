package com.medikiosk.model;

import java.util.List;

public class Patient {
    private String id;
    private String mrn;
    private String firstName;
    private String lastName;
    private String dob;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactPhone;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private double insuranceCopay;
    private String insuranceStatus;
    private List<String> allergies;
    private List<String> medications;
    private List<String> chronicConditions;
    private String bloodType;

    public Patient() {}

    public Patient(String id, String mrn, String firstName, String lastName, String dob, String gender, String phone, String email, String address) {
        this.id = id;
        this.mrn = mrn;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String v) { this.emergencyContactName = v; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String v) { this.emergencyContactRelationship = v; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String v) { this.emergencyContactPhone = v; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String v) { this.insuranceProvider = v; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String v) { this.insurancePolicyNumber = v; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String v) { this.insuranceGroupNumber = v; }

    public double getInsuranceCopay() { return insuranceCopay; }
    public void setInsuranceCopay(double v) { this.insuranceCopay = v; }

    public String getInsuranceStatus() { return insuranceStatus; }
    public void setInsuranceStatus(String v) { this.insuranceStatus = v; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }

    public List<String> getMedications() { return medications; }
    public void setMedications(List<String> medications) { this.medications = medications; }

    public List<String> getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(List<String> chronicConditions) { this.chronicConditions = chronicConditions; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String toJson() {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":\"").append(escape(id)).append("\",");
        sb.append("\"mrn\":\"").append(escape(mrn)).append("\",");
        sb.append("\"firstName\":\"").append(escape(firstName)).append("\",");
        sb.append("\"lastName\":\"").append(escape(lastName)).append("\",");
        sb.append("\"dob\":\"").append(escape(dob)).append("\",");
        sb.append("\"gender\":\"").append(escape(gender)).append("\",");
        sb.append("\"phone\":\"").append(escape(phone)).append("\",");
        sb.append("\"email\":\"").append(escape(email)).append("\",");
        sb.append("\"address\":\"").append(escape(address)).append("\",");
        
        sb.append("\"emergencyContact\":{");
        sb.append("\"name\":\"").append(escape(emergencyContactName)).append("\",");
        sb.append("\"relationship\":\"").append(escape(emergencyContactRelationship)).append("\",");
        sb.append("\"phone\":\"").append(escape(emergencyContactPhone)).append("\"");
        sb.append("},");

        sb.append("\"insurance\":{");
        sb.append("\"provider\":\"").append(escape(insuranceProvider)).append("\",");
        sb.append("\"policyNumber\":\"").append(escape(insurancePolicyNumber)).append("\",");
        sb.append("\"groupNumber\":\"").append(escape(insuranceGroupNumber)).append("\",");
        sb.append("\"copayAmount\":").append(insuranceCopay).append(",");
        sb.append("\"status\":\"").append(escape(insuranceStatus)).append("\"");
        sb.append("},");

        sb.append("\"medicalHistory\":{");
        sb.append("\"bloodType\":\"").append(escape(bloodType)).append("\",");
        sb.append("\"allergies\":").append(jsonArray(allergies)).append(",");
        sb.append("\"medications\":").append(jsonArray(medications)).append(",");
        sb.append("\"chronicConditions\":").append(jsonArray(chronicConditions));
        sb.append("}");

        sb.append("}");
        return sb.toString();
    }

    private static String jsonArray(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(list.get(i))).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
