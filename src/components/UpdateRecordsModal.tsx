import React, { useState } from "react";
import { PatientRecord, Language } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  X,
  Camera,
  CheckCircle2,
  FileText,
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
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(90, 167, 167, 0.15)",
                borderColor: "#5AA7A7",
                color: "#5AA7A7",
              }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t.records.title}</h3>
              <p className="text-[10px] text-slate-400">
                {t.records.subtitle}
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

        <div className="p-5 space-y-3.5 text-xs">
          {successNotice ? (
            <div className="text-center py-6 space-y-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "#f0fdf4", color: "#BAC94A" }}
              >
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {t.records.savedSuccess}
              </h4>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.records.selectPatient}:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:bg-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Card Scan */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                {cardScanned ? (
                  <div
                    className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                  >
                    <span>{t.walkin.cardScanned}</span>
                    <button
                      type="button"
                      onClick={() => setCardScanned(false)}
                      className="text-slate-500 underline text-[10px]"
                    >
                      Rescan
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setCardScanned(true);
                        setProvider("Aetna Choice POS (Updated)");
                        setPolicyNum("AET-992188");
                        playSuccessChime();
                      }}
                      className="mt-1 text-slate-900 font-bold px-3 py-1 rounded-lg text-xs"
                      style={{ backgroundColor: "#96D7C6" }}
                    >
                      {t.records.scanCard}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                    {t.records.provider}
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                    {t.records.policyNumber}
                  </label>
                  <input
                    type="text"
                    value={policyNum}
                    onChange={(e) => setPolicyNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                  {t.records.updatePhone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                  {t.records.allergies}
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  id="btn-save-record-updates"
                  type="button"
                  onClick={handleSave}
                  className="text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
                  style={{ backgroundColor: "#5AA7A7" }}
                >
                  {t.records.saveChanges}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
