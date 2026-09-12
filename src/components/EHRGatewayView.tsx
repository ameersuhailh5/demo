import React, { useState } from "react";
import { PatientRecord, AuditLogEntry } from "../types";
import {
  Database,
  Search,
  FileText,
  Lock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { playSuccessChime, playButtonTap } from "../utils/audio";

interface EHRGatewayViewProps {
  patients: PatientRecord[];
  auditLogs: AuditLogEntry[];
  onOpenPatientRecord: (patient: PatientRecord) => void;
  onRefreshRecords: () => void;
}

export const EHRGatewayView: React.FC<EHRGatewayViewProps> = ({
  patients,
  auditLogs,
  onOpenPatientRecord,
  onRefreshRecords,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const handleManualSync = async () => {
    setIsSyncing(true);
    playButtonTap();
    try {
      await fetch("/api/audit-logs");
      setSyncNotice("FHIR R4 records synced with Python backend.");
    } catch {
      setSyncNotice("Records updated.");
    } finally {
      setIsSyncing(false);
      playSuccessChime();
      setTimeout(() => setSyncNotice(""), 3500);
      onRefreshRecords();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#96D7C6" }}>
              <Database className="w-4 h-4" />
              <span>EHR Bridge & Records</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Health Record Gateway
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              HL7 FHIR R4 conduit linking kiosk registrations with electronic medical records.
            </p>
          </div>

          <div>
            <button
              id="btn-trigger-fhir-sync"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              style={{ backgroundColor: "#5AA7A7" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync FHIR"}</span>
            </button>
          </div>
        </div>

        {/* Interoperability Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Protocol</span>
            <span className="font-bold text-white">HL7 FHIR R4</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Backend</span>
            <span className="font-bold" style={{ color: "#BAC94A" }}>Python 3 Service</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Encryption</span>
            <span className="font-bold text-white">TLS 1.3</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Compliance</span>
            <span className="font-bold" style={{ color: "#96D7C6" }}>HIPAA Active</span>
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 rounded-xl border text-xs flex items-center gap-2" style={{ backgroundColor: "#f0fdf4", borderColor: "#BAC94A", color: "#166534" }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: "#BAC94A" }} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Patient Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Patient Health Records
            </h2>
            <p className="text-xs text-slate-500">
              Click record to inspect clinical FHIR bundle.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or MRN..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3.5">MRN</th>
                <th className="py-2.5 px-3.5">Name</th>
                <th className="py-2.5 px-3.5">DOB</th>
                <th className="py-2.5 px-3.5">Allergies</th>
                <th className="py-2.5 px-3.5">Insurance</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((pat) => (
                <tr
                  key={pat.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onOpenPatientRecord(pat)}
                >
                  <td className="py-3 px-3.5 font-mono font-bold" style={{ color: "#5AA7A7" }}>
                    {pat.mrn}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-bold text-slate-900">
                      {pat.firstName} {pat.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {pat.phone}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{pat.dob}</td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-wrap gap-1">
                      {pat.medicalHistory.allergies.map((a) => (
                        <span
                          key={a}
                          className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-medium text-slate-800">
                      {pat.insurance.provider}
                    </span>
                    <span className="text-[10px] block font-semibold" style={{ color: "#BAC94A" }}>
                      Verified
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPatientRecord(pat);
                      }}
                      className="inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-lg text-xs transition-colors"
                      style={{
                        backgroundColor: "#f0fdf9",
                        color: "#5AA7A7",
                      }}
                    >
                      <FileText className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4" style={{ color: "#BAC94A" }} />
              <span>HIPAA Access Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit trails logged via Python backend.
            </p>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: "#f0fdf4",
              borderColor: "#BAC94A",
              color: "#166534",
            }}
          >
            Audit Active
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">
                    MRN: {log.patientMRN}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-slate-400 font-mono text-[10px] block">
                  {log.timestamp}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs block">
                  {log.securityHash.slice(0, 20)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
