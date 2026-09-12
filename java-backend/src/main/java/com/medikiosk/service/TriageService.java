package com.medikiosk.service;

import com.medikiosk.model.Doctor;
import java.util.*;

public class TriageService {

    public static Map<String, Object> evaluate(String chiefComplaint, int painLevel, List<String> symptoms, String treatmentType) {
        if (treatmentType == null) treatmentType = "allopathy";
        treatmentType = treatmentType.toLowerCase();
        chiefComplaint = chiefComplaint != null ? chiefComplaint.toLowerCase() : "";

        List<String> redFlags = Arrays.asList(
            "chest pain", "shortness of breath", "numbness", "bleeding", "anaphylaxis",
            "unconscious", "stroke", "choking"
        );
        List<String> urgentFlags = Arrays.asList(
            "fever", "abdominal", "fracture", "deep laceration", "vomiting", "asthma", "migraine"
        );

        boolean isRed = painLevel >= 8;
        for (String rf : redFlags) {
            if (chiefComplaint.contains(rf)) isRed = true;
            if (symptoms != null) {
                for (String s : symptoms) {
                    if (s.toLowerCase().contains(rf)) isRed = true;
                }
            }
        }

        boolean isUrgent = painLevel >= 6;
        for (String uf : urgentFlags) {
            if (chiefComplaint.contains(uf)) isUrgent = true;
            if (symptoms != null) {
                for (String s : symptoms) {
                    if (s.toLowerCase().contains(uf)) isUrgent = true;
                }
            }
        }

        int esi;
        String label;
        String room;
        String dept;
        Doctor doc;
        List<String> vitals;
        String summary;
        String notes;

        if (isRed) {
            esi = 2;
            label = "Level 2 Emergent";
            room = "Triage Bay 1";
            dept = "Urgent Care";
            doc = DoctorService.findById("doc-1");
            vitals = Arrays.asList("Blood Pressure", "Heart Rate", "SpO2 Pulse Ox", "Temperature");
            summary = "EMERGENT: Severe acute distress identified. Prioritizing immediate conventional emergency stabilization.";
            notes = "Immediate vital signs and physician alert. Red-flag symptoms present.";
        } else if ("ayurveda".equalsIgnoreCase(treatmentType)) {
            esi = isUrgent ? 3 : 4;
            label = isUrgent ? "Level 3 Moderate (Ayurvedic)" : "Level 4 Routine (Ayurvedic)";
            room = esi == 3 ? "Ayurveda Suite 1A" : "Ayurveda Suite 2B";
            dept = "Ayurvedic Medicine";
            doc = esi == 3 ? DoctorService.findById("doc-6") : DoctorService.findById("doc-7");
            vitals = Arrays.asList("Blood Pressure", "Nadi Pariksha (Radial Pulse Rate & Rhythm)", "Agni / Digestive Assessment", "Weight");
            summary = "Patient requested Traditional Ayurvedic Care. Evaluating Tridosha balance (Vata/Pitta/Kapha) and herbal regimen.";
            notes = "Assess pulse rhythm, tongue coating, digestive agni, and current dietary/herbal usage.";
        } else if (isUrgent) {
            esi = 3;
            label = "Level 3 Urgent";
            room = "Consultation Room 3";
            dept = "Internal Medicine";
            doc = DoctorService.findById("doc-1");
            vitals = Arrays.asList("Blood Pressure", "Heart Rate", "SpO2 Pulse Ox", "Temperature");
            summary = "Patient presents with acute discomfort (Pain: " + painLevel + "/10). Evaluation required.";
            notes = "Obtain baseline vital signs. Verify allergies and active medications.";
        } else {
            esi = 4;
            label = "Level 4 Less Urgent";
            room = "Exam Station 2";
            dept = "Family Practice";
            doc = DoctorService.findById("doc-3");
            vitals = Arrays.asList("Blood Pressure", "Heart Rate", "SpO2 Pulse Ox", "Temperature");
            summary = "Routine walk-in presentation (Pain: " + painLevel + "/10). Standard outpatient triage.";
            notes = "Standard clinic intake and vital signs.";
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("triageScore", esi);
        result.put("urgencyCategory", label);
        result.put("recommendedRoom", room);
        result.put("recommendedDepartment", dept);
        result.put("recommendedDoctor", doc != null ? doc.getName() : "Attending Physician");
        result.put("recommendedDoctorId", doc != null ? doc.getId() : "doc-1");
        result.put("treatmentType", treatmentType);
        result.put("vitalsToCheck", vitals);
        result.put("clinicalSummary", summary);
        result.put("suggestedNursingNotes", notes);
        result.put("source", "Java 17 Clinical Triage Engine (com.medikiosk)");
        return result;
    }
}
