import React, { useState, useEffect } from "react";
import { Appointment, PatientRecord, QueueItem, Language } from "../types";
import {
  Search,
  QrCode,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { playSuccessChime, playButtonTap } from "../utils/audio";

interface CheckInFlowProps {
  appointments: Appointment[];
  patients: PatientRecord[];
  initialCode?: string;
  onCheckInComplete: (ticket: QueueItem) => void;
  onCancel: () => void;
  language: Language;
}

export const CheckInFlow: React.FC<CheckInFlowProps> = ({
  appointments,
  patients,
  initialCode = "",
  onCheckInComplete,
  onCancel,
}) => {
  const [lookupMethod, setLookupMethod] = useState<"code" | "phone" | "camera">(
    initialCode ? "code" : "code"
  );
  const [confirmationCode, setConfirmationCode] = useState(initialCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [matchedAppointment, setMatchedAppointment] = useState<Appointment | null>(
    null
  );
  const [matchedPatient, setMatchedPatient] = useState<PatientRecord | null>(null);
  const [hasNewSymptoms, setHasNewSymptoms] = useState<boolean | null>(false);
  const [copayMethod, setCopayMethod] = useState<"card" | "apple_pay" | "bill_later">(
    "card"
  );
  const [copayProcessing, setCopayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode, "", "");
    }
  }, [initialCode]);

  const handleSearch = (codeVal: string, phoneVal: string, dobVal: string) => {
    setErrorMsg("");
    let apt: Appointment | undefined;

    if (codeVal.trim()) {
      apt = appointments.find(
        (a) => a.confirmationCode.toLowerCase() === codeVal.trim().toLowerCase()
      );
    } else if (phoneVal.trim()) {
      const cleanPhone = phoneVal.replace(/\D/g, "");
      apt = appointments.find((a) => {
        const aptPhoneClean = a.phone.replace(/\D/g, "");
        return aptPhoneClean.includes(cleanPhone) || a.dob === dobVal;
      });
    }

    if (apt) {
      setMatchedAppointment(apt);
      const pat = patients.find((p) => p.id === apt?.patientId);
      setMatchedPatient(pat || null);
    } else {
      setErrorMsg(
        "Appointment not found. Please check your reference code or register as walk-in."
      );
    }
  };

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsScanning(false);
      const apt = appointments.find((a) => a.confirmationCode === "MK-101");
      if (apt) {
        setMatchedAppointment(apt);
        const pat = patients.find((p) => p.id === apt?.patientId);
        setMatchedPatient(pat || null);
        playSuccessChime();
      }
    }, 1200);
  };

  const handleFinalizeCheckIn = () => {
    if (!matchedAppointment) return;

    setCopayProcessing(true);
    playButtonTap();

    setTimeout(() => {
      setCopayProcessing(false);
      playSuccessChime();

      const ticketNum =
        matchedAppointment.ticketNumber ||
        `A-${Math.floor(100 + Math.random() * 899)}`;
      const nowTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const queueItem: QueueItem = {
        id: `q-${Date.now()}`,
        ticketNumber: ticketNum,
        patientName: matchedAppointment.patientName,
        patientId: matchedAppointment.patientId,
        mrn: matchedPatient?.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
        checkInTime: nowTime,
        appointmentTime: matchedAppointment.time,
        doctorName: matchedAppointment.doctorName,
        department: matchedAppointment.department,
        assignedRoom: matchedAppointment.room,
        status: "waiting",
        type: "scheduled",
        urgency: "routine",
        esiScore: 4,
        chiefComplaint: matchedAppointment.reason,
        symptoms: hasNewSymptoms ? ["Reported symptoms at check-in"] : ["Routine scheduled appointment"],
        insuranceVerified: true,
        signatureCompleted: true,
        estimatedWaitMinutes: 8,
      };

      onCheckInComplete(queueItem);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        id="btn-cancel-checkin"
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Menu</span>
      </button>

      {!matchedAppointment ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
            >
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Appointment Check-In
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Locate your appointment by reference code, phone, or barcode.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs sm:text-sm font-medium">
            <button
              id="tab-lookup-code"
              onClick={() => setLookupMethod("code")}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                lookupMethod === "code"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{ color: lookupMethod === "code" ? "#5AA7A7" : undefined }}
            >
              Confirmation Code
            </button>
            <button
              id="tab-lookup-phone"
              onClick={() => setLookupMethod("phone")}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                lookupMethod === "phone"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{ color: lookupMethod === "phone" ? "#5AA7A7" : undefined }}
            >
              Phone & Birthday
            </button>
            <button
              id="tab-lookup-camera"
              onClick={() => setLookupMethod("camera")}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                lookupMethod === "camera"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{ color: lookupMethod === "camera" ? "#5AA7A7" : undefined }}
            >
              Scan Barcode
            </button>
          </div>

          {/* Code Search */}
          {lookupMethod === "code" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Confirmation Code
                </label>
                <div className="relative">
                  <input
                    id="input-confirmation-code"
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MK-101"
                    className="w-full text-base tracking-wider font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:bg-white"
                    style={{ borderColor: confirmationCode ? "#5AA7A7" : undefined }}
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <button
                id="btn-submit-code-search"
                onClick={() => handleSearch(confirmationCode, "", "")}
                disabled={!confirmationCode.trim()}
                className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors text-sm disabled:opacity-50"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                Find Appointment
              </button>
            </div>
          )}

          {/* Phone Search */}
          {lookupMethod === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Mobile Phone Number
                </label>
                <input
                  id="input-lookup-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 234-5678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  id="input-lookup-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <button
                id="btn-submit-phone-search"
                onClick={() => handleSearch("", phoneNumber, dob)}
                disabled={!phoneNumber.trim()}
                className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors text-sm disabled:opacity-50"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                Find by Phone
              </button>
            </div>
          )}

          {/* Camera Scanner */}
          {lookupMethod === "camera" && (
            <div className="text-center py-4">
              <div className="relative w-full max-w-sm mx-auto h-48 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center text-white mb-4">
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                      style={{ borderColor: "#96D7C6" }}
                    ></div>
                    <span className="text-xs font-medium" style={{ color: "#96D7C6" }}>
                      Reading barcode target...
                    </span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-400 px-4">
                      Hold QR pass in front of camera
                    </span>
                  </>
                )}
                <div
                  className="absolute inset-x-8 top-1/2 h-0.5 animate-pulse"
                  style={{ backgroundColor: "#E2D36B" }}
                ></div>
              </div>

              <button
                id="btn-simulate-qr-scan"
                onClick={handleSimulatedScan}
                disabled={isScanning}
                className="text-slate-900 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
                style={{ backgroundColor: "#96D7C6" }}
              >
                {isScanning ? "Scanning..." : "Simulate QR Scan (MK-101)"}
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              className="mt-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5"
              style={{
                backgroundColor: "#fefce8",
                borderColor: "#E2D36B",
                color: "#854d0e",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      ) : (
        /* Appointment Details Verification & Copay Flow */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#f0fdf4", color: "#4d7c0f" }}
              >
                Appointment Confirmed
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1.5">
                {matchedAppointment.patientName}
              </h2>
              <p className="text-xs text-slate-500">
                DOB: {matchedAppointment.dob} • MRN: {matchedPatient?.mrn || "MRN-89421"}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg border"
                style={{
                  backgroundColor: "#f0fdf9",
                  color: "#5AA7A7",
                  borderColor: "#96D7C6",
                }}
              >
                {matchedAppointment.confirmationCode}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#5AA7A7" }} />
              <div>
                <span className="text-slate-500 block">Time</span>
                <span className="font-bold text-slate-900">
                  {matchedAppointment.time} (Today)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#6C8CBF" }} />
              <div>
                <span className="text-slate-500 block">Doctor</span>
                <span className="font-bold text-slate-900">
                  {matchedAppointment.doctorName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#5AA7A7" }} />
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-bold text-slate-900">
                  {matchedAppointment.department} — {matchedAppointment.room}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#BAC94A" }} />
              <div>
                <span className="text-slate-500 block">Insurance</span>
                <span className="font-bold text-slate-900">
                  {matchedPatient?.insurance.provider || "Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Health Screen */}
          <div className="border border-slate-200 p-3.5 rounded-xl">
            <h3 className="text-xs font-bold text-slate-800 mb-1">
              Safety Screening
            </h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Any acute new symptoms (chest pain, shortness of breath, severe pain)?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setHasNewSymptoms(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  hasNewSymptoms === false
                    ? "text-white"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
                style={{
                  backgroundColor: hasNewSymptoms === false ? "#5AA7A7" : undefined,
                  borderColor: hasNewSymptoms === false ? "#5AA7A7" : undefined,
                }}
              >
                No, Stable
              </button>
              <button
                type="button"
                onClick={() => setHasNewSymptoms(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  hasNewSymptoms === true
                    ? "text-slate-900"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
                style={{
                  backgroundColor: hasNewSymptoms === true ? "#E2D36B" : undefined,
                  borderColor: hasNewSymptoms === true ? "#E2D36B" : undefined,
                }}
              >
                Yes, New Symptoms
              </button>
            </div>
          </div>

          {/* Copay Section */}
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: "#6C8CBF" }} />
                <span className="text-xs font-bold text-slate-900">Co-Pay</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900">
                  ${matchedAppointment.copayAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCopayMethod("card")}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "card"
                    ? "text-white font-bold"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
                style={{
                  backgroundColor: copayMethod === "card" ? "#6C8CBF" : undefined,
                  borderColor: copayMethod === "card" ? "#6C8CBF" : undefined,
                }}
              >
                Credit / Debit
              </button>
              <button
                type="button"
                onClick={() => setCopayMethod("apple_pay")}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "apple_pay"
                    ? "text-white font-bold"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
                style={{
                  backgroundColor: copayMethod === "apple_pay" ? "#6C8CBF" : undefined,
                  borderColor: copayMethod === "apple_pay" ? "#6C8CBF" : undefined,
                }}
              >
                Digital Wallet
              </button>
              <button
                type="button"
                onClick={() => setCopayMethod("bill_later")}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "bill_later"
                    ? "text-white font-bold"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
                style={{
                  backgroundColor: copayMethod === "bill_later" ? "#6C8CBF" : undefined,
                  borderColor: copayMethod === "bill_later" ? "#6C8CBF" : undefined,
                }}
              >
                Bill Later
              </button>
            </div>
          </div>

          {/* Complete CTA */}
          <button
            id="btn-confirm-checkin-final"
            onClick={handleFinalizeCheckIn}
            disabled={copayProcessing}
            className="w-full text-white font-bold py-3.5 px-6 rounded-xl shadow-md text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            style={{ backgroundColor: "#5AA7A7" }}
          >
            {copayProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Finalizing Check-In...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Check-In & Get Ticket</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
