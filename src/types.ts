export type AppMode = "kiosk" | "staff" | "tv-display" | "ehr-vault";

export type Language = "en" | "es" | "zh";

export type UrgencyLevel = "routine" | "moderate" | "urgent" | "emergent" | "critical";

export interface PatientRecord {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dob: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    copayAmount: number;
    status: "verified" | "pending" | "self_pay";
    cardFrontUrl?: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    chronicConditions: string[];
    bloodType: string;
    vaccinations: Array<{ name: string; date: string }>;
  };
}

export interface Appointment {
  id: string;
  confirmationCode: string;
  patientId: string;
  patientName: string;
  dob: string;
  phone: string;
  time: string;
  date: string;
  doctorName: string;
  specialty: string;
  department: string;
  room: string;
  status: "scheduled" | "checked_in" | "in_consultation" | "completed" | "cancelled";
  reason: string;
  copayAmount: number;
  copayPaid: boolean;
  ticketNumber?: string;
  checkInTime?: string;
}

export interface TriageEvaluation {
  triageScore: number; // ESI Level 1-5
  urgencyCategory: string;
  recommendedRoom: string;
  vitalsToCheck: string[];
  clinicalSummary: string;
  suggestedNursingNotes: string;
  source?: string;
}

export interface QueueItem {
  id: string;
  ticketNumber: string;
  patientName: string;
  patientId?: string;
  mrn: string;
  checkInTime: string;
  appointmentTime?: string;
  doctorName: string;
  department: string;
  assignedRoom: string;
  status: "waiting" | "called" | "in_consultation" | "completed";
  type: "scheduled" | "walk_in";
  urgency: UrgencyLevel;
  esiScore: number; // 1 to 5
  chiefComplaint: string;
  painLevel?: number;
  symptoms: string[];
  triageEvaluation?: TriageEvaluation;
  insuranceVerified: boolean;
  signatureCompleted: boolean;
  calledAt?: string;
  estimatedWaitMinutes: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: "patient_kiosk" | "nurse_triage" | "attending_md" | "reception_desk";
  action: string;
  patientMRN: string;
  details: string;
  securityHash: string;
}
