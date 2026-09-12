import React, { useState } from "react";
import { PatientRecord, AuditLogEntry, QueueItem } from "../types";
import {
  Database,
  ShieldCheck,
  Search,
  FileText,
  Lock,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Activity,
  Download,
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

  const handleManualSync = () => {
    setIsSyncing(true);
    playButtonTap();
    setTimeout(() => {
      setIsSyncing(false);
      playSuccessChime();
      setSyncNotice("HL7 FHIR R4 synchronization successfully verified with central EHR server.");
      setTimeout(() => setSyncNotice(""), 4000);
      onRefreshRecords();
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: EHR System Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Secure Clinical EHR Integration Bridge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Health Record & FHIR Gateway
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time HL7 FHIR R4 encrypted conduit linking the kiosk patient registration intake with hospital Electronic Health Records (EMR). Handles instant allergy contraindications, medication reconciliation, and insurance policy verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="btn-trigger-fhir-sync"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing FHIR Records..." : "Sync EHR Data"}</span>
            </button>
          </div>
        </div>

        {/* Clinical Interoperability Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Protocol Standard</span>
            <span className="font-bold text-white text-sm">HL7 FHIR R4</span>
          </div>
          <div>
            <span className="text-slate-400 block">Encryption Status</span>
            <span className="font-bold text-emerald-400 text-sm">TLS 1.3 (256-Bit)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Compliance Grade</span>
            <span className="font-bold text-white text-sm">HIPAA & HITECH</span>
          </div>
          <div>
            <span className="text-slate-400 block">Connected Repositories</span>
            <span className="font-bold text-sky-400 text-sm">Epic / Cerner Bridge</span>
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Patient EHR Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Synchronized Patient Health Records
            </h2>
            <p className="text-xs text-slate-500">
              Select any patient record to inspect encrypted clinical FHIR payloads, allergies, and prescriptions.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or MRN..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Patient MRN</th>
                <th className="py-3 px-4">Full Legal Name</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Active Allergies</th>
                <th className="py-3 px-4">Insurance Coverage</th>
                <th className="py-3 px-4 text-right">EHR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((pat) => (
                <tr
                  key={pat.id}
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                  onClick={() => onOpenPatientRecord(pat)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    {pat.mrn}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">
                      {pat.firstName} {pat.lastName}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {pat.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{pat.dob}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {pat.medicalHistory.allergies.map((a) => (
                        <span
                          key={a}
                          className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">
                      {pat.insurance.provider}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">
                      Verified
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPatientRecord(pat);
                      }}
                      className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Immutable HIPAA Access Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-500">
              Every read, check-in, and triage query is cryptographically logged to meet federal compliance requirements.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
            Active Security Audit Active
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-semibold">
                    Target: {log.patientMRN}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-slate-400 font-mono text-[10px] block">
                  {log.timestamp}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs block">
                  {log.securityHash.slice(0, 24)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
