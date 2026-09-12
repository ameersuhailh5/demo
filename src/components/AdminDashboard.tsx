import React, { useState } from "react";
import { Doctor, PatientRecord, QueueItem, Appointment, AuthUser } from "../types";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Stethoscope,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Building2,
  PlusCircle,
  X,
  Lock,
  Leaf,
  Pill,
} from "lucide-react";
import { playButtonTap, playSuccessChime } from "../utils/audio";

interface AdminDashboardProps {
  doctors: Doctor[];
  patients: PatientRecord[];
  queue: QueueItem[];
  appointments: Appointment[];
  onAssignDoctor: (queueId: string, doctorId: string, doctorName: string, room: string, department: string) => void;
  onUpdateDoctorAvailability: (doctorId: string, available: boolean) => void;
  onAddDoctor: (newDoctor: Doctor) => void;
  onInspectPatient: (patient: PatientRecord, queueItem?: QueueItem) => void;
  authUser?: AuthUser | null;
  onLockDashboard?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  doctors,
  patients,
  queue,
  appointments,
  onAssignDoctor,
  onUpdateDoctorAvailability,
  onAddDoctor,
  onInspectPatient,
  authUser,
  onLockDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<"assignments" | "doctors" | "patients">("assignments");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  // New Doctor Modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocSpecialty, setNewDocSpecialty] = useState("");
  const [newDocDept, setNewDocDept] = useState("General Practice & Family Medicine");
  const [newDocRoom, setNewDocRoom] = useState("");

  // Filtered queue items
  const filteredQueue = queue.filter(
    (q) =>
      q.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered patients
  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const handleAssignChange = (queueItem: QueueItem, selectedDocId: string) => {
    const selectedDoc = doctors.find((d) => d.id === selectedDocId);
    if (!selectedDoc) return;
    playButtonTap();

    onAssignDoctor(
      queueItem.id,
      selectedDoc.id,
      selectedDoc.name,
      selectedDoc.room,
      selectedDoc.department
    );

    setAssignmentNotice(
      `Assigned ${selectedDoc.name} to ${queueItem.patientName} (${queueItem.ticketNumber}).`
    );
    playSuccessChime();
    setTimeout(() => setAssignmentNotice(null), 3000);
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    playButtonTap();

    const isAyur = newDocDept.toLowerCase().includes("ayur");
    const created: Doctor = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      title: isAyur ? "Ayurvedic Vaidya / Attending Physician" : "Attending Physician",
      specialty: newDocSpecialty.trim() || (isAyur ? "Ayurvedic Medicine" : "General Medicine"),
      department: newDocDept,
      room: newDocRoom.trim() || (isAyur ? "Ayurveda Suite" : "Exam Room"),
      available: true,
      treatmentType: isAyur ? "ayurveda" : "allopathy",
    };

    onAddDoctor(created);
    setShowAddDocModal(false);
    setNewDocName("");
    setNewDocSpecialty("");
    setNewDocRoom("");
    playSuccessChime();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Summary Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#96D7C6" }}>
              <ShieldCheck className="w-4 h-4" />
              <span>Administration & Dispatch Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Clinic Admin Dashboard
            </h1>
            <p className="text-xs text-slate-300">
              Assign physicians, manage caseloads, and oversee patient health data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddDocModal(true)}
              className="text-slate-900 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-95"
              style={{ backgroundColor: "#96D7C6" }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>

            {onLockDashboard && (
              <button
                onClick={onLockDashboard}
                className="bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-600 text-slate-300 hover:text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Lock admin session and return to kiosk"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Lock Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Doctors</span>
            <span className="text-lg font-bold text-white">
              {doctors.filter((d) => d.available).length} / {doctors.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Care Modalities</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-teal-300 inline-flex items-center gap-1">
                <Pill className="w-3 h-3" />
                {queue.filter((q) => q.treatmentType !== "ayurveda").length} Allop
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-emerald-300 inline-flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                {queue.filter((q) => q.treatmentType === "ayurveda").length} Ayur
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Patients in Care</span>
            <span className="text-lg font-bold text-white">
              {queue.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">System Status</span>
            <span className="text-sm font-bold flex items-center gap-1" style={{ color: "#BAC94A" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#BAC94A" }}></span>
              <span>Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Flash Notice */}
      {assignmentNotice && (
        <div
          className="p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in"
          style={{ backgroundColor: "#f0fdf4", borderColor: "#BAC94A", color: "#166534" }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#BAC94A" }} />
          <span className="font-semibold">{assignmentNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "assignments"
                ? "text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "assignments" ? "#5AA7A7" : undefined,
            }}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Doctor Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "doctors"
                ? "text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "doctors" ? "#5AA7A7" : undefined,
            }}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Roster ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "patients"
                ? "text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "patients" ? "#5AA7A7" : undefined,
            }}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Records ({patients.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, doctor, ticket..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: DOCTOR ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Patient Dispatch & Doctor Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Assign or reassign registered patients to attending physicians.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredQueue.length} queue entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Patient Data</th>
                  <th className="py-3 px-4">Chief Complaint & Triage</th>
                  <th className="py-3 px-4">Assigned Doctor</th>
                  <th className="py-3 px-4">Department & Room</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item) => {
                  const pat = patients.find(
                    (p) => p.mrn === item.mrn || p.id === item.patientId
                  ) || patients[0];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm" style={{ color: "#5AA7A7" }}>
                          {item.ticketNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.checkInTime}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {item.patientName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {item.mrn}
                        </span>
                        <div className="mt-1">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                            style={{
                              backgroundColor: item.treatmentType === "ayurveda" ? "#ecfdf5" : "#f0fdf9",
                              color: item.treatmentType === "ayurveda" ? "#047857" : "#0f766e",
                              borderColor: item.treatmentType === "ayurveda" ? "#a7f3d0" : "#99f6e4",
                            }}
                          >
                            {item.treatmentType === "ayurveda" ? (
                              <Leaf className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Pill className="w-2.5 h-2.5 text-teal-600" />
                            )}
                            <span>{item.treatmentType === "ayurveda" ? "Ayurveda" : "Allopathy"}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
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
                            ESI {item.esiScore}
                          </span>
                          {item.painLevel !== undefined && item.painLevel > 0 && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Pain {item.painLevel}/10
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] truncate">
                          {item.chiefComplaint}
                        </p>
                      </td>

                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <select
                            value={item.doctorId || doctors.find((d) => d.name === item.doctorName)?.id || ""}
                            onChange={(e) => handleAssignChange(item, e.target.value)}
                            aria-label={`Assign Doctor to ${item.patientName}`}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                            style={{ borderColor: "#96D7C6" }}
                          >
                            <option value="" disabled>Select Doctor</option>
                            <optgroup label="🌿 Ayurvedic Medicine Physicians">
                              {doctors
                                .filter(
                                  (d) =>
                                    d.treatmentType === "ayurveda" ||
                                    d.department.toLowerCase().includes("ayur")
                                )
                                .map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} — {d.department} ({d.room})
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label="💊 Conventional Allopathic Physicians">
                              {doctors
                                .filter(
                                  (d) =>
                                    d.treatmentType !== "ayurveda" &&
                                    !d.department.toLowerCase().includes("ayur")
                                )
                                .map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} — {d.department} ({d.room})
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          <span className="text-[10px] text-slate-400 block">
                            Assigned: {item.doctorName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {item.assignedRoom}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.department}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onInspectPatient(pat, item)}
                          className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors"
                          style={{
                            backgroundColor: "#f0fdf9",
                            color: "#5AA7A7",
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Data</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR ROSTER */}
      {activeTab === "doctors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const docPatients = queue.filter(
              (q) => q.doctorId === doc.id || q.doctorName === doc.name
            );

            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: "#5AA7A7" }}
                    >
                      {doc.name.split(" ")[1]?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onUpdateDoctorAvailability(doc.id, !doc.available)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                    style={{
                      backgroundColor: doc.available ? "#f0fdf4" : "#f1f5f9",
                      borderColor: doc.available ? "#BAC94A" : "#cbd5e1",
                      color: doc.available ? "#166534" : "#64748b",
                    }}
                  >
                    {doc.available ? "On Duty" : "Off Duty"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {doc.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Room</span>
                    <span className="font-semibold text-slate-800 block">
                      {doc.room}
                    </span>
                  </div>
                </div>

                {/* Assigned Patients Mini List */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Current Patients Assigned ({docPatients.length}):
                  </span>
                  {docPatients.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">
                      No patients in queue currently.
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {docPatients.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg"
                        >
                          <span className="font-semibold text-slate-800">
                            {p.ticketNumber} • {p.patientName}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: p.status === "called" ? "#e0f2fe" : "#f1f5f9",
                              color: p.status === "called" ? "#0369a1" : "#475569",
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PATIENT MASTER DIRECTORY */}
      {activeTab === "patients" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Patient Medical Directory
              </h2>
              <p className="text-xs text-slate-500">
                Inspect comprehensive clinical records, insurance, and contact details.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Total {patients.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">MRN</th>
                  <th className="py-3 px-4">Full Legal Name</th>
                  <th className="py-3 px-4">DOB & Gender</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Insurance Status</th>
                  <th className="py-3 px-4 text-right">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: "#5AA7A7" }}>
                      {pat.mrn}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {pat.firstName} {pat.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.dob} ({pat.gender})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{pat.phone}</div>
                      <div className="text-[10px] text-slate-400">{pat.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {pat.medicalHistory.allergies.map((a) => (
                          <span
                            key={a}
                            className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded text-[10px] font-semibold"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {pat.insurance.provider}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {pat.insurance.policyNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onInspectPatient(pat)}
                        className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{
                          backgroundColor: "#f0fdf9",
                          color: "#5AA7A7",
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" style={{ color: "#96D7C6" }} />
                <h3 className="text-sm font-bold">Add Attending Doctor</h3>
              </div>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Conan, MD"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clinical Specialty
                </label>
                <input
                  type="text"
                  required
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Orthopedics, Cardiology"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Department
                </label>
                <select
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none focus:bg-white font-medium"
                >
                  <option value="General Practice & Family Medicine">General Practice & Family Medicine</option>
                  <option value="Urgent Care & Walk-In">Urgent Care & Walk-In</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology & Vascular">Cardiology & Vascular</option>
                  <option value="Pulmonology & Respiratory">Pulmonology & Respiratory</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Ayurvedic Medicine & Panchakarma">Ayurvedic Medicine & Panchakarma</option>
                  <option value="Ayurvedic Holistic Care">Ayurvedic Holistic Care</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Assigned Room / Station
                </label>
                <input
                  type="text"
                  required
                  value={newDocRoom}
                  onChange={(e) => setNewDocRoom(e.target.value)}
                  placeholder="e.g. Room 3B, Triage Bay 4"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                  style={{ backgroundColor: "#5AA7A7" }}
                >
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
