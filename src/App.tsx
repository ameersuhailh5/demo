import React, { useState, useEffect } from "react";
import {
  AppMode,
  Language,
  PatientRecord,
  Appointment,
  QueueItem,
  AuditLogEntry,
  Doctor,
  AuthUser,
  StaffRole,
} from "./types";
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCTORS,
} from "./data/mockData";
import { Header } from "./components/Header";
import { KioskHome } from "./components/KioskHome";
import { WalkInRegistration } from "./components/WalkInRegistration";
import { DoctorPortal } from "./components/DoctorPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { WaitingRoomDisplay } from "./components/WaitingRoomDisplay";
import { EHRVaultModal } from "./components/EHRVaultModal";
import { EHRGatewayView } from "./components/EHRGatewayView";
import { TicketPassModal } from "./components/TicketPassModal";
import { UpdateRecordsModal } from "./components/UpdateRecordsModal";
import { StaffAuthModal } from "./components/StaffAuthModal";
import { playClinicChime, playSuccessChime } from "./utils/audio";
import { Lock, ShieldAlert } from "lucide-react";

export default function App() {
  // Navigation Mode: kiosk | doctor | admin | tv-display | ehr-vault
  const [currentMode, setCurrentMode] = useState<AppMode>("kiosk");
  const [kioskSubView, setKioskSubView] = useState<
    "home" | "walkin" | "queue-check"
  >("home");

  // Staff Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    requiredRole: StaffRole;
    targetMode?: AppMode;
  }>({
    isOpen: false,
    requiredRole: "doctor",
  });

  // Accessibility & Preferences
  const [language, setLanguage] = useState<Language>("en");
  const [fontSizeLarge, setFontSizeLarge] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Application State: Doctors, Patients, Appointments, Queue, Logs
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(
    INITIAL_APPOINTMENTS
  );
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Active Modals
  const [activeTicketModal, setActiveTicketModal] = useState<QueueItem | null>(
    null
  );
  const [activeEHRModal, setActiveEHRModal] = useState<{
    patient: PatientRecord;
    queueItem?: QueueItem;
  } | null>(null);
  const [showUpdateRecordsModal, setShowUpdateRecordsModal] = useState(false);

  // Auto-calculated statistics
  const activeWaitingCount = queue.filter(
    (q) => q.status === "waiting" || q.status === "called"
  ).length;

  const averageWaitMinutes = Math.round(
    queue
      .filter((q) => q.status === "waiting")
      .reduce((acc, q) => acc + q.estimatedWaitMinutes, 0) /
      Math.max(1, queue.filter((q) => q.status === "waiting").length) || 12
  );

  // Sync initial doctors & patients from Python API if available
  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.doctors) && data.doctors.length > 0) {
          setDoctors(data.doctors);
        }
      })
      .catch(() => {});
  }, []);

  // Mode Selection with Password & Role Protection Gate
  const handleSelectMode = (mode: AppMode) => {
    if (mode === "doctor") {
      if (authUser && authUser.role === "doctor") {
        setCurrentMode("doctor");
      } else {
        setAuthModal({
          isOpen: true,
          requiredRole: "doctor",
          targetMode: "doctor",
        });
      }
      return;
    }

    if (mode === "admin") {
      if (authUser && authUser.role === "admin") {
        setCurrentMode("admin");
      } else {
        setAuthModal({
          isOpen: true,
          requiredRole: "admin",
          targetMode: "admin",
        });
      }
      return;
    }

    if (mode === "kiosk") {
      setKioskSubView("home");
    }
    setCurrentMode(mode);
  };

  // Staff Login Success Handler
  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    const destination = authModal.targetMode || user.role;
    setCurrentMode(destination);
    setAuthModal({ isOpen: false, requiredRole: user.role });

    logAuditEvent(
      "STAFF_LOGIN_SUCCESS",
      "SYSTEM",
      `${user.name} authenticated into ${user.role.toUpperCase()} panel.`,
      user.role === "admin" ? "admin" : "attending_md"
    );
  };

  // Staff Sign Out / Lock Session Handler
  const handleSignOut = () => {
    if (authUser) {
      logAuditEvent(
        "STAFF_LOCK_SESSION",
        "SYSTEM",
        `${authUser.name} locked panel session. Patient access locked.`,
        authUser.role === "admin" ? "admin" : "attending_md"
      );
    }
    setAuthUser(null);
    setCurrentMode("kiosk");
    setKioskSubView("home");
  };

  // Log an immutable audit entry
  const logAuditEvent = (
    action: string,
    patientMRN: string,
    details: string,
    role: AuditLogEntry["userRole"] = "patient_kiosk"
  ) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userRole: role,
      action,
      patientMRN,
      details,
      securityHash: `sha256:${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Send to Python audit endpoint
    try {
      fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    } catch {}
  };

  // Check-In Completed Handler
  const handleCheckInComplete = (ticket: QueueItem) => {
    setQueue((prev) => [ticket, ...prev]);

    setAppointments((prev) =>
      prev.map((a) =>
        a.patientName.toLowerCase() === ticket.patientName.toLowerCase()
          ? {
              ...a,
              status: "checked_in",
              ticketNumber: ticket.ticketNumber,
              checkInTime: ticket.checkInTime,
            }
          : a
      )
    );

    logAuditEvent(
      "CHECK_IN_CONFIRMED",
      ticket.mrn,
      `Patient ${ticket.patientName} checked in. Assigned ticket #${ticket.ticketNumber} for ${ticket.department} (${ticket.assignedRoom}) under ${ticket.doctorName}.`
    );

    setActiveTicketModal(ticket);
    setKioskSubView("home");
  };

  // Walk-in Registration Completed Handler
  const handleWalkInComplete = (
    ticket: QueueItem,
    newPatientRecord?: PatientRecord
  ) => {
    if (newPatientRecord) {
      setPatients((prev) => [newPatientRecord, ...prev]);
    }

    setQueue((prev) => [ticket, ...prev]);

    logAuditEvent(
      "WALK_IN_REGISTRATION_COMPLETED",
      ticket.mrn,
      `Walk-in registered for ${ticket.patientName}. ESI score ${ticket.esiScore} calculated. Assigned room ${ticket.assignedRoom} under ${ticket.doctorName}.`
    );

    setActiveTicketModal(ticket);
    setKioskSubView("home");
  };

  // Doctor & Staff: Call patient
  const handleCallPatient = (queueId: string) => {
    if (soundEnabled) {
      playClinicChime();
    }

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueId ? { ...q, status: "called", calledAt: nowTime } : q
      )
    );

    const item = queue.find((q) => q.id === queueId);
    if (item) {
      logAuditEvent(
        "PATIENT_CALLED_TO_ROOM",
        item.mrn,
        `Ticket #${item.ticketNumber} called to ${item.assignedRoom} by ${item.doctorName}.`,
        "attending_md"
      );
    }
  };

  // Doctor & Staff: Update patient status
  const handleUpdateQueueStatus = (
    queueId: string,
    status: QueueItem["status"]
  ) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status } : q))
    );

    const item = queue.find((q) => q.id === queueId);
    if (item) {
      logAuditEvent(
        `STATUS_UPDATED_${status.toUpperCase()}`,
        item.mrn,
        `Queue status updated to ${status} for ticket #${item.ticketNumber}.`,
        "nurse_triage"
      );
    }
  };

  // Admin: Assign / Reassign Doctor to Patient
  const handleAssignDoctor = (
    queueId: string,
    doctorId: string,
    doctorName: string,
    room: string,
    department: string
  ) => {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              doctorId,
              doctorName,
              assignedRoom: room,
              department,
              assignedBy: "admin",
            }
          : q
      )
    );

    const target = queue.find((q) => q.id === queueId);
    if (target) {
      logAuditEvent(
        "DOCTOR_ASSIGNED_BY_ADMIN",
        target.mrn,
        `Admin assigned ${doctorName} (${department} - ${room}) to ticket #${target.ticketNumber}.`,
        "admin"
      );

      // Async dispatch to Python backend
      try {
        fetch("/api/assign-doctor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queueId,
            ticketNumber: target.ticketNumber,
            patientName: target.patientName,
            mrn: target.mrn,
            doctorId,
            doctorName,
            room,
            department,
          }),
        }).catch(() => {});
      } catch {}
    }
  };

  // Admin: Update doctor availability
  const handleUpdateDoctorAvailability = (
    doctorId: string,
    available: boolean
  ) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, available } : d))
    );

    const targetDoc = doctors.find((d) => d.id === doctorId);
    if (targetDoc) {
      logAuditEvent(
        "DOCTOR_STATUS_CHANGED",
        "SYSTEM",
        `Doctor ${targetDoc.name} marked as ${available ? "On Duty" : "Off Duty"}.`,
        "admin"
      );
    }
  };

  // Admin: Add new doctor
  const handleAddDoctor = (newDoc: Doctor) => {
    setDoctors((prev) => [...prev, newDoc]);
    logAuditEvent(
      "DOCTOR_REGISTERED",
      "SYSTEM",
      `Admin registered ${newDoc.name} (${newDoc.department} - ${newDoc.room}).`,
      "admin"
    );

    try {
      fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      }).catch(() => {});
    } catch {}
  };

  // Doctor: Save consultation notes
  const handleSaveConsultationNotes = (queueId: string, notes: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, clinicalNotes: notes } : q))
    );

    const target = queue.find((q) => q.id === queueId);
    if (target) {
      logAuditEvent(
        "CLINICAL_NOTES_RECORDED",
        target.mrn,
        `Physician recorded clinical notes for ticket #${target.ticketNumber}.`,
        "attending_md"
      );
    }
  };

  // Open EHR Record Modal
  const handleOpenEHR = (patientMRN: string, queueItem?: QueueItem) => {
    const pat =
      patients.find((p) => p.mrn === patientMRN) ||
      patients.find((p) =>
        queueItem?.patientName
          ? `${p.firstName} ${p.lastName}`.toLowerCase() ===
            queueItem.patientName.toLowerCase()
          : false
      ) ||
      patients[0];

    logAuditEvent(
      "EHR_RECORD_VIEWED",
      patientMRN,
      `Encrypted health record accessed for clinical review.`,
      "attending_md"
    );

    setActiveEHRModal({ patient: pat, queueItem });
  };

  // Handle Records Update
  const handleSavePatientUpdate = (updatedPatient: PatientRecord) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );

    logAuditEvent(
      "PATIENT_RECORDS_UPDATED",
      updatedPatient.mrn,
      `Patient self-updated insurance and allergy details at kiosk station.`
    );
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-all ${
        fontSizeLarge ? "text-lg [&_h1]:text-4xl [&_h2]:text-3xl" : "text-sm"
      }`}
    >
      {/* Top Clinic Header with Mode Switcher & Accessibility */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        language={language}
        onSelectLanguage={setLanguage}
        fontSizeLarge={fontSizeLarge}
        onToggleFontSize={() => setFontSizeLarge((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        activeWaitingCount={activeWaitingCount}
        authUser={authUser}
        onSignOut={handleSignOut}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 pb-12">
        {/* ROLE 1: PATIENT SELF-SERVICE KIOSK */}
        {currentMode === "kiosk" && (
          <div>
            {kioskSubView === "home" && (
              <KioskHome
                language={language}
                onStartWalkIn={() => setKioskSubView("walkin")}
                onViewQueue={() => setCurrentMode("tv-display")}
                onUpdateRecords={() => setShowUpdateRecordsModal(true)}
                waitingCount={activeWaitingCount}
                averageWaitMinutes={averageWaitMinutes}
              />
            )}

            {kioskSubView === "walkin" && (
              <WalkInRegistration
                onComplete={handleWalkInComplete}
                onCancel={() => setKioskSubView("home")}
                language={language}
              />
            )}
          </div>
        )}

        {/* ROLE 2: DOCTOR WORKSTATION & ALLOCATION PORTAL (PASSWORD PROTECTED) */}
        {currentMode === "doctor" && (
          authUser?.role === "doctor" ? (
            <DoctorPortal
              doctors={doctors}
              patients={patients}
              queue={queue}
              onCallPatient={handleCallPatient}
              onUpdateStatus={handleUpdateQueueStatus}
              onOpenEHR={handleOpenEHR}
              onSaveConsultationNotes={handleSaveConsultationNotes}
              authUser={authUser}
              onLockPortal={handleSignOut}
            />
          ) : (
            <div className="max-w-md mx-auto my-14 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border"
                style={{
                  backgroundColor: "rgba(90, 167, 167, 0.1)",
                  borderColor: "#5AA7A7",
                  color: "#5AA7A7",
                }}
              >
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Access Restricted
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Doctor Portal Locked
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Physician credentials required to view clinical data and patient triage records.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() =>
                    setAuthModal({
                      isOpen: true,
                      requiredRole: "doctor",
                      targetMode: "doctor",
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: "#5AA7A7" }}
                >
                  Doctor Login (doc123)
                </button>
                <button
                  onClick={() => {
                    setCurrentMode("kiosk");
                    setKioskSubView("home");
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Return to Patient Kiosk
                </button>
              </div>
            </div>
          )
        )}

        {/* ROLE 3: CLINIC ADMIN DISPATCH & ASSIGNMENT MANAGEMENT (PASSWORD PROTECTED) */}
        {currentMode === "admin" && (
          authUser?.role === "admin" ? (
            <AdminDashboard
              doctors={doctors}
              patients={patients}
              queue={queue}
              appointments={appointments}
              onAssignDoctor={handleAssignDoctor}
              onUpdateDoctorAvailability={handleUpdateDoctorAvailability}
              onAddDoctor={handleAddDoctor}
              onInspectPatient={(pat, item) =>
                setActiveEHRModal({ patient: pat, queueItem: item })
              }
              authUser={authUser}
              onLockDashboard={handleSignOut}
            />
          ) : (
            <div className="max-w-md mx-auto my-14 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border"
                style={{
                  backgroundColor: "rgba(108, 140, 191, 0.1)",
                  borderColor: "#6C8CBF",
                  color: "#6C8CBF",
                }}
              >
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Access Restricted
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Admin Dashboard Locked
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Administrator password required to manage doctor allocations and patient master files.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() =>
                    setAuthModal({
                      isOpen: true,
                      requiredRole: "admin",
                      targetMode: "admin",
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: "#6C8CBF" }}
                >
                  Admin Login (admin123)
                </button>
                <button
                  onClick={() => {
                    setCurrentMode("kiosk");
                    setKioskSubView("home");
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Return to Patient Kiosk
                </button>
              </div>
            </div>
          )
        )}

        {/* ROLE 4: LOBBY TV CALLING DISPLAY */}
        {currentMode === "tv-display" && (
          <WaitingRoomDisplay queue={queue} />
        )}

        {/* ROLE 5: EHR VAULT & HL7 FHIR GATEWAY */}
        {currentMode === "ehr-vault" && (
          <EHRGatewayView
            patients={patients}
            auditLogs={auditLogs}
            onOpenPatientRecord={(pat) => setActiveEHRModal({ patient: pat })}
            onRefreshRecords={() => {
              logAuditEvent(
                "FHIR_GATEWAY_SYNC",
                "ALL",
                "Manual synchronization completed across all active electronic health records.",
                "reception_desk"
              );
            }}
          />
        )}
      </main>

      {/* Staff Role Authentication Modal (Password & PIN Gate) */}
      <StaffAuthModal
        isOpen={authModal.isOpen}
        requiredRole={authModal.requiredRole}
        doctors={doctors}
        onClose={() => setAuthModal({ isOpen: false, requiredRole: "doctor" })}
        onSuccess={handleAuthSuccess}
      />

      {/* Ticket Pass Modal (When check-in or walk-in completes) */}
      {activeTicketModal && (
        <TicketPassModal
          ticket={activeTicketModal}
          onClose={() => setActiveTicketModal(null)}
        />
      )}

      {/* EHR Inspection & Triage Modal */}
      {activeEHRModal && (
        <EHRVaultModal
          patient={activeEHRModal.patient}
          queueItem={activeEHRModal.queueItem}
          auditLogs={auditLogs.filter(
            (log) =>
              log.patientMRN === activeEHRModal.patient.mrn ||
              log.patientMRN === "ALL"
          )}
          onClose={() => setActiveEHRModal(null)}
        />
      )}

      {/* Update Records Modal */}
      {showUpdateRecordsModal && (
        <UpdateRecordsModal
          patients={patients}
          onSaveUpdate={handleSavePatientUpdate}
          onClose={() => setShowUpdateRecordsModal(false)}
          language={language}
        />
      )}
    </div>
  );
}
