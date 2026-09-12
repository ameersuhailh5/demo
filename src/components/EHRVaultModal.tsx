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
  Sparkles,
} from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(90, 167, 167, 0.15)",
                borderColor: "#5AA7A7",
                color: "#5AA7A7",
              }}
            >
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  {patient.firstName} {patient.lastName}
                </h3>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: "rgba(90, 167, 167, 0.15)",
                    borderColor: "#5AA7A7",
                    color: "#96D7C6",
                  }}
                >
                  {patient.mrn}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                EHR Record • HL7 FHIR R4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2.5 bg-slate-50 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 border-b-2 flex items-center gap-1 ${
              activeTab === "summary"
                ? "font-bold"
                : "border-transparent text-slate-500"
            }`}
            style={{
              borderColor: activeTab === "summary" ? "#5AA7A7" : "transparent",
              color: activeTab === "summary" ? "#5AA7A7" : undefined,
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary & Triage</span>
          </button>

          <button
            onClick={() => setActiveTab("fhir")}
            className={`pb-2.5 border-b-2 flex items-center gap-1 ${
              activeTab === "fhir"
                ? "font-bold"
                : "border-transparent text-slate-500"
            }`}
            style={{
              borderColor: activeTab === "fhir" ? "#5AA7A7" : "transparent",
              color: activeTab === "fhir" ? "#5AA7A7" : undefined,
            }}
          >
            <Database className="w-3.5 h-3.5" />
            <span>FHIR R4 JSON</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 border-b-2 flex items-center gap-1 ${
              activeTab === "audit"
                ? "font-bold"
                : "border-transparent text-slate-500"
            }`}
            style={{
              borderColor: activeTab === "audit" ? "#5AA7A7" : "transparent",
              color: activeTab === "audit" ? "#5AA7A7" : undefined,
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>HIPAA Audit</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === "summary" && (
            <div className="space-y-4">
              {queueItem?.triageEvaluation && (
                <div
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{
                    backgroundColor: "rgba(90, 167, 167, 0.08)",
                    borderColor: "#96D7C6",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1" style={{ color: "#5AA7A7" }}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Triage Assessment</span>
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#BAC94A", color: "#1e293b" }}
                    >
                      ESI {queueItem.triageEvaluation.triageScore}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    {queueItem.triageEvaluation.clinicalSummary}
                  </p>
                </div>
              )}

              {/* Patient Core Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">DOB / Age</span>
                  <span className="font-semibold text-slate-900">
                    {patient.dob} ({patient.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-semibold text-slate-900">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Emergency</span>
                  <span className="font-semibold text-slate-900">
                    {patient.emergencyContact.name} ({patient.emergencyContact.phone})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Insurance</span>
                  <span className="font-semibold text-slate-900">
                    {patient.insurance.provider}
                  </span>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Allergies:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.medicalHistory.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="bg-white border border-rose-300 text-rose-800 font-semibold px-2 py-0.5 rounded text-[11px]"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="border border-slate-200 p-3.5 rounded-xl bg-white">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1.5 text-xs">
                  <Pill className="w-3.5 h-3.5" style={{ color: "#6C8CBF" }} />
                  <span>Prescriptions:</span>
                </div>
                <p className="text-slate-700">
                  {patient.medicalHistory.medications.join(", ") || "None"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "fhir" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">
                  HL7 FHIR R4 Bundle
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
                >
                  <Download className="w-3 h-3" />
                  <span>Download JSON</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(fhirPayload, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 flex items-center justify-between">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Lock className="w-3 h-3" style={{ color: "#BAC94A" }} />
            <span>Encrypted Session</span>
          </span>
          <button
            onClick={onClose}
            className="text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: "#5AA7A7" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
