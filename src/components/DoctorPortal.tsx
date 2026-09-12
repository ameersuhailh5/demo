import React, { useState } from "react";
import { Doctor, PatientRecord, QueueItem } from "../types";
import {
  Stethoscope,
  Users,
  Building2,
  PhoneCall,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pill,
  Sparkles,
  Search,
  Check,
  Send,
  UserCheck,
} from "lucide-react";
import { playButtonTap, playSuccessChime, playClinicChime } from "../utils/audio";

interface DoctorPortalProps {
  doctors: Doctor[];
  patients: PatientRecord[];
  queue: QueueItem[];
  onCallPatient: (queueId: string) => void;
  onUpdateStatus: (queueId: string, status: QueueItem["status"]) => void;
  onOpenEHR: (patientMRN: string, queueItem?: QueueItem) => void;
  onSaveConsultationNotes: (queueId: string, notes: string) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  doctors,
  patients,
  queue,
  onCallPatient,
  onUpdateStatus,
  onOpenEHR,
  onSaveConsultationNotes,
}) => {
  // Current active doctor
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "doc-1");
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Active view: "my-patients" or "clinic-allocation" (which patient goes to which doctor)
  const [activeTab, setActiveTab] = useState<"my-patients" | "clinic-allocation">("my-patients");
  const [searchTerm, setSearchTerm] = useState("");

  // Notes drawer / modal state
  const [consultationQueueItem, setConsultationQueueItem] = useState<QueueItem | null>(null);
  const [clinicalNotesInput, setClinicalNotesInput] = useState("");

  // Filter patients assigned to the currently selected doctor
  const myAssignedPatients = queue.filter(
    (q) =>
      (q.doctorId === currentDoctor.id || q.doctorName === currentDoctor.name) &&
      (q.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.mrn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartConsultation = (item: QueueItem) => {
    playButtonTap();
    onUpdateStatus(item.id, "in_consultation");
    setConsultationQueueItem(item);
    setClinicalNotesInput(item.clinicalNotes || "");
  };

  const handleSaveNotes = () => {
    if (!consultationQueueItem) return;
    playButtonTap();
    onSaveConsultationNotes(consultationQueueItem.id, clinicalNotesInput);
    playSuccessChime();
    setConsultationQueueItem(null);
  };

  const handleCompleteVisit = (item: QueueItem) => {
    playButtonTap();
    onUpdateStatus(item.id, "completed");
    playSuccessChime();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Doctor Profile & Switcher Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md"
              style={{ backgroundColor: "#5AA7A7" }}
            >
              <Stethoscope className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#96D7C6" }}>
                  Physician Workstation
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.2 rounded-full border"
                  style={{
                    backgroundColor: currentDoctor.available ? "#f0fdf4" : "#f1f5f9",
                    borderColor: currentDoctor.available ? "#BAC94A" : "#cbd5e1",
                    color: currentDoctor.available ? "#BAC94A" : "#94a3b8",
                  }}
                >
                  {currentDoctor.available ? "Active On Duty" : "Off Duty"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {currentDoctor.name}
              </h1>
              <p className="text-xs text-slate-300">
                {currentDoctor.specialty} • {currentDoctor.department} ({currentDoctor.room})
              </p>
            </div>
          </div>

          {/* Doctor Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-semibold pl-2">
              Logged in Doctor:
            </span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              aria-label="Select Active Doctor"
              className="bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs py-1.5 px-3 focus:outline-none cursor-pointer"
              style={{ color: "#96D7C6" }}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Caseload Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">My Patient Caseload</span>
            <span className="text-lg font-bold text-white">
              {myAssignedPatients.length} Active
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Assigned Room</span>
            <span className="text-lg font-bold" style={{ color: "#96D7C6" }}>
              {currentDoctor.room}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Department</span>
            <span className="text-lg font-bold" style={{ color: "#BAC94A" }}>
              {currentDoctor.department}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Clinic Queue</span>
            <span className="text-lg font-bold text-white">
              {queue.length} Patients
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("my-patients")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "my-patients"
                ? "text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "my-patients" ? "#5AA7A7" : undefined,
            }}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Assigned Patients ({myAssignedPatients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("clinic-allocation")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "clinic-allocation"
                ? "text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "clinic-allocation" ? "#5AA7A7" : undefined,
            }}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Patient-Doctor Allocation Matrix</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient or ticket..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* VIEW 1: MY ASSIGNED PATIENTS */}
      {activeTab === "my-patients" && (
        <div className="space-y-4">
          {myAssignedPatients.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No Patients in Your Queue
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No patients are currently assigned to your room. Check the Clinic Allocation Matrix to review other department queues.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignedPatients.map((item) => {
                const pat = patients.find(
                  (p) => p.mrn === item.mrn || p.id === item.patientId
                ) || patients[0];

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5 transition-all hover:border-slate-300"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono font-bold text-lg"
                            style={{ color: "#5AA7A7" }}
                          >
                            {item.ticketNumber}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                            style={{
                              backgroundColor:
                                item.status === "in_consultation"
                                  ? "#e0f2fe"
                                  : item.status === "called"
                                  ? "#fef3c7"
                                  : "#f1f5f9",
                              color:
                                item.status === "in_consultation"
                                  ? "#0369a1"
                                  : item.status === "called"
                                  ? "#92400e"
                                  : "#475569",
                            }}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-0.5">
                          {item.patientName}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          {item.mrn} • {pat.dob} ({pat.gender})
                        </span>
                      </div>

                      {/* ESI Triage Pill */}
                      <div className="text-right">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block"
                          style={{
                            backgroundColor:
                              item.esiScore <= 2
                                ? "#fee2e2"
                                : item.esiScore === 3
                                ? "#fef3c7"
                                : "#f0fdf4",
                            color:
                              item.esiScore <= 2
                                ? "#991b1b"
                                : item.esiScore === 3
                                ? "#92400e"
                                : "#166534",
                          }}
                        >
                          ESI Level {item.esiScore}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Check-in: {item.checkInTime}
                        </span>
                      </div>
                    </div>

                    {/* Chief Complaint & Pain */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold">Chief Complaint:</span>
                        {item.painLevel !== undefined && (
                          <span
                            className="font-bold text-[11px]"
                            style={{ color: item.painLevel >= 7 ? "#dc2626" : "#475569" }}
                          >
                            Pain: {item.painLevel}/10
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-medium">
                        {item.chiefComplaint}
                      </p>
                    </div>

                    {/* Allergies Alert (Clinical Safety) */}
                    {pat.medicalHistory.allergies.length > 0 && (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div className="text-rose-800">
                          <span className="font-bold">Allergies: </span>
                          <span>{pat.medicalHistory.allergies.join(", ")}</span>
                        </div>
                      </div>
                    )}

                    {/* AI SBAR Assessment */}
                    {item.triageEvaluation && (
                      <div
                        className="p-2.5 rounded-xl border text-xs space-y-1"
                        style={{
                          backgroundColor: "rgba(90, 167, 167, 0.05)",
                          borderColor: "#96D7C6",
                        }}
                      >
                        <div className="flex items-center gap-1 font-bold text-[11px]" style={{ color: "#5AA7A7" }}>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Triage Assessment:</span>
                        </div>
                        <p className="text-slate-700 text-[11px]">
                          {item.triageEvaluation.clinicalSummary}
                        </p>
                        <div className="text-[10px] text-slate-500">
                          <strong>Recommended Vitals:</strong>{" "}
                          {item.triageEvaluation.vitalsToCheck.join(", ")}
                        </div>
                      </div>
                    )}

                    {/* Existing Clinical Notes */}
                    {item.clinicalNotes && (
                      <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs text-sky-900">
                        <span className="font-bold block text-[11px]">Recorded Notes:</span>
                        <p className="text-[11px]">{item.clinicalNotes}</p>
                      </div>
                    )}

                    {/* Doctor Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenEHR(item.mrn, item)}
                        className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition-colors"
                        style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Full Patient Data</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {item.status === "waiting" && (
                          <button
                            onClick={() => onCallPatient(item.id)}
                            className="text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                            style={{ backgroundColor: "#5AA7A7" }}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call to Room</span>
                          </button>
                        )}

                        {item.status === "called" && (
                          <button
                            onClick={() => handleStartConsultation(item)}
                            className="text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                            style={{ backgroundColor: "#96D7C6" }}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Start Consultation</span>
                          </button>
                        )}

                        {item.status === "in_consultation" && (
                          <>
                            <button
                              onClick={() => {
                                setConsultationQueueItem(item);
                                setClinicalNotesInput(item.clinicalNotes || "");
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl text-xs"
                            >
                              Edit Notes
                            </button>
                            <button
                              onClick={() => handleCompleteVisit(item)}
                              className="text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                              style={{ backgroundColor: "#BAC94A" }}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Complete Visit</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: WHICH PATIENT GOES TO WHICH DOCTOR ("FOR EACH PART") */}
      {activeTab === "clinic-allocation" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">
              Department & Physician Patient Allocations
            </h2>
            <p className="text-xs text-slate-500">
              Cross-department visibility: see which patients are routed to which physician across every clinic part.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const assignedPatients = queue.filter(
                (q) => q.doctorId === doc.id || q.doctorName === doc.name
              );
              const isCurrentDoc = doc.id === currentDoctor.id;

              return (
                <div
                  key={doc.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                    isCurrentDoc
                      ? "ring-2 ring-teal-500/50 border-teal-400"
                      : "border-slate-200"
                  }`}
                >
                  {/* Doctor Card Top */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                        {isCurrentDoc && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: "#96D7C6", color: "#0f766e" }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 block">
                        {doc.department}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Room: {doc.room}
                      </span>
                    </div>

                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: assignedPatients.length > 0 ? "#e0f2fe" : "#f1f5f9",
                        color: assignedPatients.length > 0 ? "#0369a1" : "#64748b",
                      }}
                    >
                      {assignedPatients.length} Patients
                    </span>
                  </div>

                  {/* List of Patients Assigned to this Doctor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Patient Queue:
                    </span>

                    {assignedPatients.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                        No patients assigned to this doctor.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {assignedPatients.map((patItem) => (
                          <div
                            key={patItem.id}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {patItem.ticketNumber} • {patItem.patientName}
                              </span>
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                                style={{
                                  backgroundColor:
                                    patItem.status === "in_consultation"
                                      ? "#e0f2fe"
                                      : patItem.status === "called"
                                      ? "#fef3c7"
                                      : "#f1f5f9",
                                  color:
                                    patItem.status === "in_consultation"
                                      ? "#0369a1"
                                      : patItem.status === "called"
                                      ? "#92400e"
                                      : "#475569",
                                }}
                              >
                                {patItem.status.replace("_", " ")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>ESI {patItem.esiScore}</span>
                              <span className="truncate max-w-[140px]">
                                {patItem.chiefComplaint}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consultation Notes Modal */}
      {consultationQueueItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: "#96D7C6" }} />
                <div>
                  <h3 className="text-sm font-bold">
                    Clinical Encounter Notes: {consultationQueueItem.patientName}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Ticket #{consultationQueueItem.ticketNumber} • {consultationQueueItem.mrn}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Physician Diagnosis & Clinical Notes:
                </label>
                <textarea
                  rows={4}
                  value={clinicalNotesInput}
                  onChange={(e) => setClinicalNotesInput(e.target.value)}
                  placeholder="Enter assessment, prescription, lab orders, or follow-up instructions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:bg-white text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConsultationQueueItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                  style={{ backgroundColor: "#5AA7A7" }}
                >
                  Save Notes to Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
