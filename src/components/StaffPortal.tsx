import React, { useState } from "react";
import { QueueItem, PatientRecord, UrgencyLevel } from "../types";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Volume2,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  Activity,
  HeartPulse,
} from "lucide-react";
import { playClinicChime, playButtonTap } from "../utils/audio";

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
  patients,
  onCallPatient,
  onUpdateStatus,
  onOpenEHR,
  onAddNewWalkIn,
}) => {
  const [filterDepartment, setFilterDepartment] = useState("all");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Clinical Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Waiting In Lobby
            </span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {waitingPatients.length}
            </span>
            <span className="text-xs text-slate-500">patients</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              High Priority / ESI 1-2
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">
              {highUrgencyCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              {highUrgencyCount > 0 ? "Requires Immediate Bed" : "All Stable"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Consultation
            </span>
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {inConsultCount}
            </span>
            <span className="text-xs text-slate-500">exam rooms active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Today
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {completedCount}
            </span>
            <span className="text-xs text-slate-500">encounters</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="input-staff-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, ticket or MRN..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 cursor-pointer font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting in Lobby</option>
              <option value="called">Called to Room</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            id="btn-staff-add-walkin"
            onClick={onAddNewWalkIn}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            + Register Walk-In At Desk
          </button>
        </div>
      </div>

      {/* Live Patient Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <span>Active Triage & Intake Queue</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Real-Time Sync with Kiosks & Lobby Monitors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-4">Ticket / ESI</th>
                <th className="py-3.5 px-4">Patient & MRN</th>
                <th className="py-3.5 px-4">Chief Complaint & Pain</th>
                <th className="py-3.5 px-4">Assigned Station</th>
                <th className="py-3.5 px-4">Wait Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching patient records in the queue.
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
                      {/* Ticket & Triage Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {item.ticketNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.esiScore <= 2
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : item.esiScore === 3
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                            }`}
                          >
                            ESI {item.esiScore}
                          </span>
                        </div>
                      </td>

                      {/* Patient Name & MRN */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {item.patientName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {item.mrn} • {item.type === "walk_in" ? "Walk-In" : "Scheduled"}
                        </div>
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-slate-800 line-clamp-1 font-medium">
                          {item.chiefComplaint}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Pain: {item.painLevel ?? 0}/10</span>
                          {item.symptoms.length > 0 && (
                            <span>• {item.symptoms.slice(0, 2).join(", ")}</span>
                          )}
                        </div>
                      </td>

                      {/* Room & Doctor */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-sky-700">
                          {item.assignedRoom}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.doctorName}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">
                          {item.checkInTime}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ~{item.estimatedWaitMinutes}m est.
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            item.status === "waiting"
                              ? "bg-slate-100 text-slate-700"
                              : item.status === "called"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : item.status === "in_consultation"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call Button */}
                          {item.status === "waiting" && (
                            <button
                              id={`btn-call-patient-${item.id}`}
                              onClick={() => handleCall(item)}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                              title="Announce chime and display on Lobby TV"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </button>
                          )}

                          {/* Move to In Consult */}
                          {item.status === "called" && (
                            <button
                              id={`btn-start-consult-${item.id}`}
                              onClick={() => onUpdateStatus(item.id, "in_consultation")}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>In Exam</span>
                            </button>
                          )}

                          {/* Complete visit */}
                          {item.status === "in_consultation" && (
                            <button
                              id={`btn-complete-visit-${item.id}`}
                              onClick={() => onUpdateStatus(item.id, "completed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Discharge</span>
                            </button>
                          )}

                          {/* View EHR & Triage Record */}
                          <button
                            id={`btn-view-ehr-${item.id}`}
                            onClick={() => onOpenEHR(item.mrn, item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                            title="Open Electronic Health Record & SBAR note"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
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
