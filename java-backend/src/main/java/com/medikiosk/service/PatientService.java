package com.medikiosk.service;

import com.medikiosk.model.Patient;
import java.util.*;

public class PatientService {
    private static final List<Patient> patients = new ArrayList<>();

    static {
        Patient p1 = new Patient("pat-1", "MRN-89421", "Eleanor", "Vance", "1984-06-14", "female", "(555) 234-5678", "eleanor.vance@example.com", "428 Oakwood Blvd, Suite 4B, Springfield");
        p1.setEmergencyContactName("Thomas Vance");
        p1.setEmergencyContactRelationship("Spouse");
        p1.setEmergencyContactPhone("(555) 891-2345");
        p1.setInsuranceProvider("BlueCross BlueShield Health Advantage");
        p1.setInsurancePolicyNumber("BC-9082341");
        p1.setInsuranceGroupNumber("GRP-44021");
        p1.setInsuranceCopay(25.0);
        p1.setInsuranceStatus("verified");
        p1.setBloodType("A+");
        p1.setAllergies(Arrays.asList("Penicillin", "Latex"));
        p1.setMedications(Arrays.asList("Levothyroxine 50mcg", "Lisinopril 10mg"));
        p1.setChronicConditions(Arrays.asList("Mild Hypertension", "Hypothyroidism"));
        patients.add(p1);

        Patient p2 = new Patient("pat-2", "MRN-77319", "Marcus", "Rodriguez", "1992-11-28", "male", "(555) 345-6789", "m.rodriguez@example.com", "159 Cypress Ave, Apt 12, Riverdale");
        p2.setEmergencyContactName("Sofia Rodriguez");
        p2.setEmergencyContactRelationship("Sister");
        p2.setEmergencyContactPhone("(555) 902-3344");
        p2.setInsuranceProvider("Aetna Choice POS II");
        p2.setInsurancePolicyNumber("AET-7890123");
        p2.setInsuranceGroupNumber("GRP-88120");
        p2.setInsuranceCopay(30.0);
        p2.setInsuranceStatus("verified");
        p2.setBloodType("O-");
        p2.setAllergies(Arrays.asList("Sulfa Drugs"));
        p2.setMedications(Arrays.asList("Albuterol Inhaler PRN"));
        p2.setChronicConditions(Arrays.asList("Exercise-induced Asthma"));
        patients.add(p2);

        Patient p3 = new Patient("pat-3", "MRN-66102", "Devon", "Chen", "1975-03-09", "male", "(555) 456-7890", "devon.chen@example.com", "882 Magnolia Way, Highgrove");
        p3.setEmergencyContactName("Mei Chen");
        p3.setEmergencyContactRelationship("Spouse");
        p3.setEmergencyContactPhone("(555) 345-9988");
        p3.setInsuranceProvider("UnitedHealthcare Premier PPO");
        p3.setInsurancePolicyNumber("UHC-554410");
        p3.setInsuranceGroupNumber("GRP-12903");
        p3.setInsuranceCopay(20.0);
        p3.setInsuranceStatus("verified");
        p3.setBloodType("B+");
        p3.setAllergies(Arrays.asList("No Known Drug Allergies (NKDA)"));
        p3.setMedications(Arrays.asList("Metformin 500mg", "Atorvastatin 20mg"));
        p3.setChronicConditions(Arrays.asList("Type 2 Diabetes", "Hyperlipidemia"));
        patients.add(p3);
    }

    public static synchronized List<Patient> getAllPatients() {
        return new ArrayList<>(patients);
    }

    public static synchronized List<Patient> search(String query) {
        if (query == null || query.trim().isEmpty()) return getAllPatients();
        String q = query.trim().toLowerCase();
        List<Patient> matches = new ArrayList<>();
        for (Patient p : patients) {
            if (p.getFirstName().toLowerCase().contains(q) ||
                p.getLastName().toLowerCase().contains(q) ||
                p.getMrn().toLowerCase().contains(q) ||
                p.getPhone().contains(q)) {
                matches.add(p);
            }
        }
        return matches;
    }
}
