import React, { useState } from "react";
import { PatientRecord, Language } from "../types";
import {
  X,
  ShieldCheck,
  Camera,
  CheckCircle2,
  FileText,
  AlertTriangle,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { playSuccessChime, playButtonTap } from "../utils/audio";

interface UpdateRecordsModalProps {
  patients: PatientRecord[];
  onSaveUpdate: (updatedPatient: PatientRecord) => void;
  onClose: () => void;
  language: Language;
}

export const UpdateRecordsModal: React.FC<UpdateRecordsModalProps> = ({
  patients,
  onSaveUpdate,
  onClose,
  language,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const [provider, setProvider] = useState(selectedPatient?.insurance.provider || "");
  const [policyNum, setPolicyNum] = useState(selectedPatient?.insurance.policyNumber || "");
  const [phone, setPhone] = useState(selectedPatient?.phone || "");
  const [allergiesText, setAllergiesText] = useState(
    selectedPatient?.medicalHistory.allergies.join(", ") || ""
  );
  const [cardScanned, setCardScanned] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    const pat = patients.find((p) => p.id === id);
    if (pat) {
      setProvider(pat.insurance.provider);
      setPolicyNum(pat.insurance.policyNumber);
      setPhone(pat.phone);
      setAllergiesText(pat.medicalHistory.allergies.join(", "));
      setCardScanned(false);
    }
  };

  const handleSave = () => {
    if (!selectedPatient) return;
    playButtonTap();

    const updated: PatientRecord = {
      ...selectedPatient,
      phone,
      insurance: {
        ...selectedPatient.insurance,
        provider,
        policyNumber: policyNum,
        status: "verified",
      },
      medicalHistory: {
        ...selectedPatient.medicalHistory,
        allergies: allergiesText ? allergiesText.split(",").map((s) => s.trim()) : ["NKDA"],
      },
    };

    onSaveUpdate(updated);
    playSuccessChime();
    setSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 flex items-center justify-center text-violet-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Update Records & Insurance</h3>
              <p className="text-[11px] text-slate-400">
                Self-Service Health Information Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {successNotice ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Records Successfully Updated!
              </h4>
              <p className="text-slate-500 max-w-xs mx-auto">
                Your new insurance coverage and allergy records have been reconciled with your EHR file.
              </p>
            </div>
          ) : (
            <>
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient Record:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Insurance Scanner Tray */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 text-center">
                {cardScanned ? (
                  <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-semibold">
                    <span>Card front scanned and verified</span>
                    <button
                      type="button"
                      onClick={() => setCardScanned(false)}
                      className="text-slate-500 hover:underline text-[11px]"
                    >
                      Rescan
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="font-semibold text-slate-700 block">
                      Scan New Physical Insurance Card
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCardScanned(true);
                        setProvider("Aetna Choice POS II (Updated)");
                        setPolicyNum("AET-992188");
                        playSuccessChime();
                      }}
                      className="mt-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px]"
                    >
                      Simulate Card Scan
                    </button>
                  </div>
                )}
              </div>

              {/* Provider & Policy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Policy / Member ID
                  </label>
                  <input
                    type="text"
                    value={policyNum}
                    onChange={(e) => setPolicyNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Primary Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Active Drug Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-record-updates"
                  type="button"
                  onClick={handleSave}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  Save to Health Record
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
