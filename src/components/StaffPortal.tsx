import React, { useState } from "react";
import { QueueItem, PatientRecord } from "../types";
import {
  Users,
  AlertTriangle,
  Stethoscope,
  Volume2,
  FileText,
  Search,
  Filter,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { playClinicChime } from "../utils/audio";

interface StaffPortalProps {
  queue: QueueItem[];
  patients: PatientRecord[];
  onCallPatient: (queueId: string) => void;
  onUpdateStatus: (queueId: string, status: QueueItem["status"]) => void;
  onOpenEHR: (patientMRN: string, queueItem?: QueueItem) => void;
  onAddNewWalkIn: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  queue,
  onCallPatient,
  onUpdateStatus,
  onOpenEHR,
  onAddNewWalkIn,
}) => {
  const [filterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const waitingPatients = queue.filter((q) => q.status === "waiting" || q.status === "called");
  const inConsultCount = queue.filter((q) => q.status === "in_consultation").length;
  const completedCount = queue.filter((q) => q.status === "completed").length;
  const highUrgencyCount = queue.filter(
    (q) => (q.esiScore <= 2 || q.urgency === "critical" || q.urgency === "emergent") && q.status !== "completed"
  ).length;

  const filteredQueue = queue.filter((item) => {
    if (filterDepartment !== "all" && !item.department.toLowerCase().includes(filterDepartment.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.ticketNumber.toLowerCase().includes(q) ||
        item.mrn.toLowerCase().includes(q) ||
        item.chiefComplaint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCall = (item: QueueItem) => {
    playClinicChime();
    onCallPatient(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Clinical Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Waiting Lobby
            </span>
            <Users className="w-4 h-4" style={{ color: "#5AA7A7" }} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              {waitingPatients.length}
            </span>
            <span className="text-[11px] text-slate-500">patients</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              High Priority (ESI 1-2)
            </span>
            <AlertTriangle className="w-4 h-4" style={{ color: "#E2D36B" }} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold" style={{ color: highUrgencyCount > 0 ? "#dc2626" : "#5AA7A7" }}>
              {highUrgencyCount}
            </span>
            <span className="text-[11px] text-slate-500">
              {highUrgencyCount > 0 ? "urgent attention" : "stable"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              In Exam
            </span>
            <Stethoscope className="w-4 h-4" style={{ color: "#6C8CBF" }} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold" style={{ color: "#6C8CBF" }}>
              {inConsultCount}
            </span>
            <span className="text-[11px] text-slate-500">active rooms</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Discharged
            </span>
            <CheckCircle2 className="w-4 h-4" style={{ color: "#BAC94A" }} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              {completedCount}
            </span>
            <span className="text-[11px] text-slate-500">completed</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-staff-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, ticket or MRN..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:bg-white"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 cursor-pointer font-medium text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting in Lobby</option>
              <option value="called">Called to Room</option>
              <option value="in_consultation">In Exam</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            id="btn-staff-add-walkin"
            onClick={onAddNewWalkIn}
            className="text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            style={{ backgroundColor: "#5AA7A7" }}
          >
            + Register Walk-In
          </button>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4" style={{ color: "#5AA7A7" }} />
            <span>Live Triage Queue</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Python Backend Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3.5">Ticket / ESI</th>
                <th className="py-2.5 px-3.5">Patient & MRN</th>
                <th className="py-2.5 px-3.5">Complaint</th>
                <th className="py-2.5 px-3.5">Station</th>
                <th className="py-2.5 px-3.5">Time</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No matching records in queue.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => {
                  const isCritical = item.esiScore <= 2;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.status === "called"
                          ? "bg-amber-50/40"
                          : isCritical
                          ? "bg-rose-50/30"
                          : ""
                      }`}
                    >
                      {/* Ticket & Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.ticketNumber}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                            style={{
                              backgroundColor:
                                item.esiScore <= 2
                                  ? "#fee2e2"
                                  : item.esiScore === 3
                                  ? "#fef9c3"
                                  : "#e0f2fe",
                              color:
                                item.esiScore <= 2
                                  ? "#991b1b"
                                  : item.esiScore === 3
                                  ? "#854d0e"
                                  : "#0369a1",
                              borderColor:
                                item.esiScore <= 2
                                  ? "#fca5a5"
                                  : item.esiScore === 3
                                  ? "#E2D36B"
                                  : "#6C8CBF",
                            }}
                          >
                            ESI {item.esiScore}
                          </span>
                        </div>
                      </td>

                      {/* Patient & MRN */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{item.patientName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {item.mrn}
                        </div>
                      </td>

                      {/* Complaint */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="text-slate-800 line-clamp-1 font-medium text-xs">
                          {item.chiefComplaint}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Pain: {item.painLevel ?? 0}/10
                        </div>
                      </td>

                      {/* Station */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold" style={{ color: "#5AA7A7" }}>
                          {item.assignedRoom}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.doctorName}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-800 font-medium text-xs">
                          {item.checkInTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~{item.estimatedWaitMinutes}m wait
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                          style={{
                            backgroundColor:
                              item.status === "waiting"
                                ? "#f1f5f9"
                                : item.status === "called"
                                ? "#fef9c3"
                                : item.status === "in_consultation"
                                ? "#e0f2fe"
                                : "#dcfce7",
                            color:
                              item.status === "waiting"
                                ? "#475569"
                                : item.status === "called"
                                ? "#854d0e"
                                : item.status === "in_consultation"
                                ? "#6C8CBF"
                                : "#15803d",
                          }}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "waiting" && (
                            <button
                              id={`btn-call-patient-${item.id}`}
                              onClick={() => handleCall(item)}
                              className="text-slate-900 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs shadow-2xs"
                              style={{ backgroundColor: "#E2D36B" }}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Call</span>
                            </button>
                          )}

                          {item.status === "called" && (
                            <button
                              id={`btn-start-consult-${item.id}`}
                              onClick={() => onUpdateStatus(item.id, "in_consultation")}
                              className="text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs shadow-2xs"
                              style={{ backgroundColor: "#6C8CBF" }}
                            >
                              <Stethoscope className="w-3 h-3" />
                              <span>Exam</span>
                            </button>
                          )}

                          {item.status === "in_consultation" && (
                            <button
                              id={`btn-complete-visit-${item.id}`}
                              onClick={() => onUpdateStatus(item.id, "completed")}
                              className="text-slate-900 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs shadow-2xs"
                              style={{ backgroundColor: "#BAC94A" }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Discharge</span>
                            </button>
                          )}

                          <button
                            id={`btn-view-ehr-${item.id}`}
                            onClick={() => onOpenEHR(item.mrn, item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded-lg flex items-center gap-1 text-xs"
                          >
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>EHR</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
