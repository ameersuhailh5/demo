package com.medikiosk.model;

public class QueueItem {
    private String id;
    private String ticketNumber;
    private String patientName;
    private String mrn;
    private String checkInTime;
    private String doctorId;
    private String doctorName;
    private String department;
    private String assignedRoom;
    private String status; // "waiting", "called", "in-consultation", "completed"
    private int esiScore;
    private String chiefComplaint;
    private int painLevel;
    private String treatmentType; // "allopathy" or "ayurveda"
    private String assignedBy;

    public QueueItem() {}

    public QueueItem(String id, String ticketNumber, String patientName, String mrn, String checkInTime, String doctorId, String doctorName, String department, String assignedRoom, String status, int esiScore, String chiefComplaint, int painLevel, String treatmentType) {
        this.id = id;
        this.ticketNumber = ticketNumber;
        this.patientName = patientName;
        this.mrn = mrn;
        this.checkInTime = checkInTime;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.department = department;
        this.assignedRoom = assignedRoom;
        this.status = status;
        this.esiScore = esiScore;
        this.chiefComplaint = chiefComplaint;
        this.painLevel = painLevel;
        this.treatmentType = treatmentType != null ? treatmentType : "allopathy";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAssignedRoom() { return assignedRoom; }
    public void setAssignedRoom(String assignedRoom) { this.assignedRoom = assignedRoom; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getEsiScore() { return esiScore; }
    public void setEsiScore(int esiScore) { this.esiScore = esiScore; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public int getPainLevel() { return painLevel; }
    public void setPainLevel(int painLevel) { this.painLevel = painLevel; }

    public String getTreatmentType() { return treatmentType; }
    public void setTreatmentType(String treatmentType) { this.treatmentType = treatmentType; }

    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }

    public String toJson() {
        return "{" +
            "\"id\":\"" + escape(id) + "\"," +
            "\"ticketNumber\":\"" + escape(ticketNumber) + "\"," +
            "\"patientName\":\"" + escape(patientName) + "\"," +
            "\"mrn\":\"" + escape(mrn) + "\"," +
            "\"checkInTime\":\"" + escape(checkInTime) + "\"," +
            "\"doctorId\":\"" + escape(doctorId) + "\"," +
            "\"doctorName\":\"" + escape(doctorName) + "\"," +
            "\"department\":\"" + escape(department) + "\"," +
            "\"assignedRoom\":\"" + escape(assignedRoom) + "\"," +
            "\"status\":\"" + escape(status) + "\"," +
            "\"esiScore\":" + esiScore + "," +
            "\"chiefComplaint\":\"" + escape(chiefComplaint) + "\"," +
            "\"painLevel\":" + painLevel + "," +
            "\"treatmentType\":\"" + escape(treatmentType) + "\"," +
            "\"assignedBy\":\"" + escape(assignedBy) + "\"" +
            "}";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
