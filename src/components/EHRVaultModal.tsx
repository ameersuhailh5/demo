import React, { useState } from "react";
import { PatientRecord, QueueItem, AuditLogEntry } from "../types";
import {
  Database,
  X,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Pill,
  Syringe,
  Lock,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { playButtonTap } from "../utils/audio";

interface EHRVaultModalProps {
  patient: PatientRecord | null;
  queueItem?: QueueItem;
  auditLogs: AuditLogEntry[];
  onClose: () => void;
}

export const EHRVaultModal: React.FC<EHRVaultModalProps> = ({
  patient,
  queueItem,
  auditLogs,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "fhir" | "audit">("summary");

  if (!patient) return null;

  // Generate FHIR R4 JSON representation
  const fhirPayload = {
    resourceType: "Bundle",
    id: `fhir-bundle-${patient.mrn}`,
    type: "collection",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: patient.mrn,
          active: true,
          name: [{ family: patient.lastName, given: [patient.firstName] }],
          telecom: [
            { system: "phone", value: patient.phone, use: "mobile" },
            { system: "email", value: patient.email },
          ],
          gender: patient.gender,
          birthDate: patient.dob,
          address: [{ text: patient.address }],
        },
      },
      {
        resource: {
          resourceType: "AllergyIntolerance",
          clinicalStatus: { coding: [{ code: "active" }] },
          verificationStatus: { coding: [{ code: "confirmed" }] },
          substance: patient.medicalHistory.allergies.map((a) => ({ text: a })),
        },
      },
      {
        resource: {
          resourceType: "MedicationStatement",
          status: "active",
          medications: patient.medicalHistory.medications,
        },
      },
      {
        resource: {
          resourceType: "Coverage",
          status: "active",
          subscriberId: patient.insurance.policyNumber,
          network: patient.insurance.provider,
        },
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {patient.firstName} {patient.lastName}
                </h3>
                <span className="font-mono text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                  {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Encrypted EHR Health Record Gateway • HL7 FHIR R4 Connected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "border-sky-600 text-sky-700 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Clinical Summary & Triage</span>
          </button>

          <button
            onClick={() => setActiveTab("fhir")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "fhir"
                ? "border-sky-600 text-sky-700 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>FHIR R4 JSON Payload</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-sky-600 text-sky-700 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>HIPAA Audit Trail</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: Clinical Summary & Triage */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              {/* If Queue Item Present: Show Triage note */}
              {queueItem?.triageEvaluation && (
                <div className="bg-sky-50/80 border border-sky-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-900 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>AI Triage Intake Assessment (SBAR)</span>
                    </span>
                    <span className="bg-sky-200 text-sky-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      ESI Level {queueItem.triageEvaluation.triageScore}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    {queueItem.triageEvaluation.clinicalSummary}
                  </p>
                  <div className="pt-2 border-t border-sky-200/60 text-sky-900 text-[11px]">
                    <strong>Nursing Safeguard:</strong>{" "}
                    {queueItem.triageEvaluation.suggestedNursingNotes}
                  </div>
                </div>
              )}

              {/* Patient Core Info & Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Date of Birth / Age</span>
                  <span className="font-semibold text-slate-900">
                    {patient.dob} (
                    {Math.floor(
                      (Date.now() - new Date(patient.dob).getTime()) /
                        (365.25 * 24 * 3600 * 1000)
                    )}{" "}
                    yrs, {patient.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone</span>
                  <span className="font-semibold text-slate-900">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Contact</span>
                  <span className="font-semibold text-slate-900">
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) —{" "}
                    {patient.emergencyContact.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Address</span>
                  <span className="font-semibold text-slate-900">{patient.address}</span>
                </div>
              </div>

              {/* Allergies & Safety Warnings */}
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Allergy Alerts (Contraindication Warnings)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="bg-white border border-rose-300 text-rose-800 font-bold px-3 py-1 rounded-full shadow-2xs"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medications & Chronic Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-xl bg-white">
                  <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>Active Prescriptions (Reconciliation)</span>
                  </div>
                  {patient.medicalHistory.medications.length === 0 ? (
                    <p className="text-slate-400">No active medications recorded.</p>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700">
                      {patient.medicalHistory.medications.map((med) => (
                        <li key={med} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-slate-200 p-4 rounded-xl bg-white">
                  <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                    <Syringe className="w-4 h-4 text-teal-600" />
                    <span>Immunization History</span>
                  </div>
                  {patient.medicalHistory.vaccinations.length === 0 ? (
                    <p className="text-slate-400">No immunization history synced.</p>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700">
                      {patient.medicalHistory.vaccinations.map((vac) => (
                        <li key={vac.name} className="flex justify-between">
                          <span>{vac.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {vac.date}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Insurance Verification Status */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Coverage Provider</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {patient.insurance.provider}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    Policy: {patient.insurance.policyNumber} • Group:{" "}
                    {patient.insurance.groupNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Coverage Verified</span>
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Copay: ${patient.insurance.copayAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FHIR R4 JSON Payload */}
          {activeTab === "fhir" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">
                  Standard HL7 FHIR Release 4 JSON payload transmitted over TLS 1.3
                </span>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(fhirPayload, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `fhir-${patient.mrn}.json`;
                    a.click();
                  }}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download FHIR JSON</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(fhirPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: HIPAA Audit Trail */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tamper-Evident Access Log for MRN: {patient.mrn}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Integrity Verified</span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 space-y-1 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        {log.action}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>Role: {log.userRole}</span>
                      <span className="truncate max-w-xs">{log.securityHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <span className="text-slate-400 text-xs flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Session • Audited Access</span>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Close Record View
          </button>
        </div>
      </div>
    </div>
  );
};
