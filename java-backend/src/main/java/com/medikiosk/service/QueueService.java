package com.medikiosk.service;

import com.medikiosk.model.Doctor;
import com.medikiosk.model.QueueItem;
import java.util.*;

public class QueueService {
    private static final List<QueueItem> queueItems = new ArrayList<>();

    static {
        queueItems.add(new QueueItem(
            "q-1", "W-101", "Devon Chen", "MRN-66102", "09:12 AM",
            "doc-3", "Dr. Alisha Patel, DO", "Family Practice", "Room 4A",
            "waiting", 4, "Routine A1c diabetic lab review and refill", 0, "allopathy"
        ));
        queueItems.add(new QueueItem(
            "q-2", "W-102", "Rachel Kim", "MRN-50912", "09:18 AM",
            "doc-1", "Dr. Sarah Jenkins, MD", "Urgent Care", "Triage Bay 2",
            "called", 3, "Severe migraine with photophobia and nausea for 6 hours", 7, "allopathy"
        ));
    }

    public static synchronized List<QueueItem> getAllQueueItems() {
        return new ArrayList<>(queueItems);
    }

    public static synchronized QueueItem addQueueItem(QueueItem item) {
        queueItems.add(item);
        return item;
    }

    public static synchronized QueueItem assignDoctor(String queueId, String ticketNumber, String doctorId, String room, String department, String patientName, String mrn) {
        Doctor doc = DoctorService.findById(doctorId);
        String docName = doc != null ? doc.getName() : "Assigned Physician";
        String docRoom = room != null && !room.isEmpty() ? room : (doc != null ? doc.getRoom() : "Exam Room");
        String docDept = department != null && !department.isEmpty() ? department : (doc != null ? doc.getDepartment() : "General Practice");

        for (QueueItem item : queueItems) {
            if ((queueId != null && item.getId().equalsIgnoreCase(queueId)) ||
                (ticketNumber != null && item.getTicketNumber().equalsIgnoreCase(ticketNumber))) {
                item.setDoctorId(doctorId);
                item.setDoctorName(docName);
                item.setAssignedRoom(docRoom);
                item.setDepartment(docDept);
                item.setAssignedBy("admin");
                return item;
            }
        }

        // If not present in queue, create entry
        QueueItem newItem = new QueueItem();
        newItem.setId("q-" + System.currentTimeMillis());
        newItem.setTicketNumber(ticketNumber != null ? ticketNumber : "W-" + (100 + queueItems.size() + 1));
        newItem.setPatientName(patientName != null ? patientName : "Walk-In Patient");
        newItem.setMrn(mrn != null ? mrn : "MRN-WALKIN");
        newItem.setDoctorId(doctorId);
        newItem.setDoctorName(docName);
        newItem.setAssignedRoom(docRoom);
        newItem.setDepartment(docDept);
        newItem.setStatus("waiting");
        newItem.setCheckInTime(new java.text.SimpleDateFormat("hh:mm a").format(new Date()));
        newItem.setAssignedBy("admin");
        queueItems.add(newItem);
        return newItem;
    }

    public static synchronized Map<String, Object> getDoctorMatrix() {
        Map<String, Object> matrix = new LinkedHashMap<>();
        List<Doctor> docs = DoctorService.getAllDoctors();
        for (Doctor d : docs) {
            List<QueueItem> assigned = new ArrayList<>();
            for (QueueItem q : queueItems) {
                if (d.getId().equalsIgnoreCase(q.getDoctorId()) || d.getName().equalsIgnoreCase(q.getDoctorName())) {
                    assigned.add(q);
                }
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("doctor", d);
            entry.put("patientCount", assigned.size());
            entry.put("patients", assigned);
            matrix.put(d.getId(), entry);
        }
        return matrix;
    }
}
