package com.medikiosk.service;

import com.medikiosk.model.Doctor;
import java.util.*;

public class DoctorService {
    private static final List<Doctor> doctors = new ArrayList<>();

    static {
        doctors.add(new Doctor(
            "doc-1", "Dr. Sarah Jenkins, MD", "Lead Attending Physician",
            "Internal Medicine & Urgent Care", "Urgent Care", "Triage Bay 1",
            true, "(555) 019-2831", "s.jenkins@clinic.org", "allopathy"
        ));
        doctors.add(new Doctor(
            "doc-2", "Dr. Gregory House, MD", "Senior Diagnostician",
            "Pulmonology & Diagnostics", "Pulmonology", "Suite 1B",
            true, "(555) 019-2832", "g.house@clinic.org", "allopathy"
        ));
        doctors.add(new Doctor(
            "doc-3", "Dr. Alisha Patel, DO", "Family Physician",
            "Endocrinology & Primary Care", "Family Practice", "Room 4A",
            true, "(555) 019-2833", "a.patel@clinic.org", "allopathy"
        ));
        doctors.add(new Doctor(
            "doc-4", "Dr. Robert Vance, MD", "Cardiologist",
            "Cardiology & Vascular Health", "Cardiology", "Room 2C",
            true, "(555) 019-2834", "r.vance@clinic.org", "allopathy"
        ));
        doctors.add(new Doctor(
            "doc-5", "Dr. Elena Rostova, MD", "Pediatric & General Specialist",
            "General Practice & Pediatrics", "Pediatrics", "Room 5B",
            true, "(555) 019-2835", "e.rostova@clinic.org", "allopathy"
        ));
        doctors.add(new Doctor(
            "doc-6", "Dr. Rajesh Sharma, BAMS, MD (Ayur)", "Senior Ayurvedic Vaidya & Specialist",
            "Ayurvedic Medicine, Dosha Balancing & Panchakarma", "Ayurvedic Medicine", "Ayurveda Suite 1A",
            true, "(555) 019-2836", "r.sharma@clinic.org", "ayurveda"
        ));
        doctors.add(new Doctor(
            "doc-7", "Dr. Ananya Nair, BAMS", "Ayurvedic Consultant & Herbalist",
            "Herbal Pharmacology, Nadi Pariksha & Lifestyle Care", "Ayurvedic Wellness & Dietetics", "Ayurveda Suite 2B",
            true, "(555) 019-2837", "a.nair@clinic.org", "ayurveda"
        ));
    }

    public static synchronized List<Doctor> getAllDoctors() {
        return new ArrayList<>(doctors);
    }

    public static synchronized Doctor findById(String id) {
        if (id == null) return null;
        for (Doctor d : doctors) {
            if (d.getId().equalsIgnoreCase(id)) return d;
        }
        return null;
    }

    public static synchronized void saveOrUpdate(Doctor doc) {
        for (int i = 0; i < doctors.size(); i++) {
            if (doctors.get(i).getId().equalsIgnoreCase(doc.getId())) {
                doctors.set(i, doc);
                return;
            }
        }
        doctors.add(doc);
    }
}
