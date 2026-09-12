import React, { useState, useEffect } from "react";
import {
  AppMode,
  Language,
  PatientRecord,
  Appointment,
  QueueItem,
  AuditLogEntry,
} from "./types";
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_AUDIT_LOGS,
} from "./data/mockData";
import { Header } from "./components/Header";
import { KioskHome } from "./components/KioskHome";
import { CheckInFlow } from "./components/CheckInFlow";
import { WalkInRegistration } from "./components/WalkInRegistration";
import { StaffPortal } from "./components/StaffPortal";
import { WaitingRoomDisplay } from "./components/WaitingRoomDisplay";
import { EHRVaultModal } from "./components/EHRVaultModal";
import { EHRGatewayView } from "./components/EHRGatewayView";
import { TicketPassModal } from "./components/TicketPassModal";
import { UpdateRecordsModal } from "./components/UpdateRecordsModal";
import { playClinicChime, playSuccessChime } from "./utils/audio";

export default function App() {
  // Navigation Mode
  const [currentMode, setCurrentMode] = useState<AppMode>("kiosk");
  const [kioskSubView, setKioskSubView] = useState<
    "home" | "checkin" | "walkin" | "queue-check"
  >("home");
  const [presetCheckInCode, setPresetCheckInCode] = useState<string>("");

  // Accessibility & Preferences
  const [language, setLanguage] = useState<Language>("en");
  const [fontSizeLarge, setFontSizeLarge] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Application State
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
  };

  // Check-In Completed Handler
  const handleCheckInComplete = (ticket: QueueItem) => {
    // Add to queue
    setQueue((prev) => [ticket, ...prev]);

    // Update appointment status if applicable
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

    // Audit trail
    logAuditEvent(
      "CHECK_IN_CONFIRMED",
      ticket.mrn,
      `Patient ${ticket.patientName} checked in. Assigned ticket #${ticket.ticketNumber} for ${ticket.department} (${ticket.assignedRoom}).`
    );

    // Show ticket modal and return kiosk to home
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
      `Walk-in intake registered for ${ticket.patientName}. ESI score ${ticket.esiScore} calculated. Assigned room ${ticket.assignedRoom}.`
    );

    setActiveTicketModal(ticket);
    setKioskSubView("home");
  };

  // Staff Portal Actions: Call patient
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
        `Ticket #${item.ticketNumber} called to ${item.assignedRoom} by clinical staff.`,
        "attending_md"
      );
    }
  };

  // Staff Portal Actions: Update patient status
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
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          if (mode === "kiosk") setKioskSubView("home");
        }}
        language={language}
        onSelectLanguage={setLanguage}
        fontSizeLarge={fontSizeLarge}
        onToggleFontSize={() => setFontSizeLarge((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        activeWaitingCount={activeWaitingCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 pb-12">
        {/* MODE 1: PATIENT SELF-SERVICE KIOSK */}
        {currentMode === "kiosk" && (
          <div>
            {kioskSubView === "home" && (
              <KioskHome
                language={language}
                onStartCheckIn={(presetCode) => {
                  setPresetCheckInCode(presetCode || "");
                  setKioskSubView("checkin");
                }}
                onStartWalkIn={() => setKioskSubView("walkin")}
                onViewQueue={() => setCurrentMode("tv-display")}
                onUpdateRecords={() => setShowUpdateRecordsModal(true)}
                waitingCount={activeWaitingCount}
                averageWaitMinutes={averageWaitMinutes}
              />
            )}

            {kioskSubView === "checkin" && (
              <CheckInFlow
                appointments={appointments}
                patients={patients}
                initialCode={presetCheckInCode}
                onCheckInComplete={handleCheckInComplete}
                onCancel={() => {
                  setPresetCheckInCode("");
                  setKioskSubView("home");
                }}
                language={language}
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

        {/* MODE 2: STAFF CLINICAL PORTAL */}
        {currentMode === "staff" && (
          <StaffPortal
            queue={queue}
            patients={patients}
            onCallPatient={handleCallPatient}
            onUpdateStatus={handleUpdateQueueStatus}
            onOpenEHR={handleOpenEHR}
            onAddNewWalkIn={() => {
              setCurrentMode("kiosk");
              setKioskSubView("walkin");
            }}
          />
        )}

        {/* MODE 3: WAITING ROOM TV MONITOR */}
        {currentMode === "tv-display" && (
          <WaitingRoomDisplay queue={queue} />
        )}

        {/* MODE 4: SECURE EHR & FHIR GATEWAY VIEW */}
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
