import React, { useState, useEffect } from "react";
import { Appointment, PatientRecord, QueueItem, Language } from "../types";
import {
  Search,
  QrCode,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Building2,
  Sparkles,
  Phone,
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
  language,
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

  // If initialCode provided, automatically search
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
        "No matching scheduled appointment found for today. Please verify your reference number or phone, or proceed to Walk-In Registration."
      );
    }
  };

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsScanning(false);
      // Automatically match Eleanor Vance MK-101
      const apt = appointments.find((a) => a.confirmationCode === "MK-101");
      if (apt) {
        setMatchedAppointment(apt);
        const pat = patients.find((p) => p.id === apt?.patientId);
        setMatchedPatient(pat || null);
        playSuccessChime();
      }
    }, 1500);
  };

  const handleFinalizeCheckIn = () => {
    if (!matchedAppointment) return;

    setCopayProcessing(true);
    playButtonTap();

    setTimeout(() => {
      setCopayProcessing(false);
      playSuccessChime();

      // Generate Ticket
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
        symptoms: hasNewSymptoms ? ["Reported mild symptoms at check-in"] : ["Routine scheduled appointment"],
        insuranceVerified: true,
        signatureCompleted: true,
        estimatedWaitMinutes: 8,
      };

      onCheckInComplete(queueItem);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        id="btn-cancel-checkin"
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Main Menu</span>
      </button>

      {!matchedAppointment ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Appointment Check-In
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Select how you'd like to locate your scheduled visit today
            </p>
          </div>

          {/* Lookup Method Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs sm:text-sm font-medium">
            <button
              id="tab-lookup-code"
              onClick={() => setLookupMethod("code")}
              className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                lookupMethod === "code"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Confirmation Code
            </button>
            <button
              id="tab-lookup-phone"
              onClick={() => setLookupMethod("phone")}
              className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                lookupMethod === "phone"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Phone & Birthday
            </button>
            <button
              id="tab-lookup-camera"
              onClick={() => setLookupMethod("camera")}
              className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                lookupMethod === "camera"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scan QR / Barcode
            </button>
          </div>

          {/* Code Search Form */}
          {lookupMethod === "code" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Appointment Reference / Confirmation Code
                </label>
                <div className="relative">
                  <input
                    id="input-confirmation-code"
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MK-101 or MK-102"
                    className="w-full text-lg tracking-wider font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                  <div className="absolute right-3 top-3.5 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Found in your SMS reminder or clinic confirmation email (e.g. MK-101)
                </p>
              </div>

              <button
                id="btn-submit-code-search"
                onClick={() => handleSearch(confirmationCode, "", "")}
                disabled={!confirmationCode.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-colors text-base"
              >
                Find My Appointment
              </button>
            </div>
          )}

          {/* Phone & Birthday Search Form */}
          {lookupMethod === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  id="input-lookup-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 234-5678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  id="input-lookup-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <button
                id="btn-submit-phone-search"
                onClick={() => handleSearch("", phoneNumber, dob)}
                disabled={!phoneNumber.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-colors text-base"
              >
                Find by Phone Number
              </button>
            </div>
          )}

          {/* Camera Scanner Simulation */}
          {lookupMethod === "camera" && (
            <div className="text-center py-4">
              <div className="relative w-full max-w-sm mx-auto h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center text-white mb-4">
                {isScanning ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-sky-400 border-t-transparent animate-spin"></div>
                    <span className="text-sm font-medium text-sky-200">
                      Reading barcode optical target...
                    </span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-400 px-4">
                      Hold your mobile appointment pass QR code up to the camera
                    </span>
                  </>
                )}

                {/* Laser animation bar */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-pulse"></div>
              </div>

              <button
                id="btn-simulate-qr-scan"
                onClick={handleSimulatedScan}
                disabled={isScanning}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md text-sm transition-colors"
              >
                {isScanning ? "Scanning Optical Target..." : "Simulate QR Scan (Eleanor Vance)"}
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Appointment Not Found</p>
                <p className="text-xs text-amber-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Appointment Details Verification & Copay Flow */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Appointment Verified
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {matchedAppointment.patientName}
              </h2>
              <p className="text-xs text-slate-500">
                DOB: {matchedAppointment.dob} • MRN: {matchedPatient?.mrn || "MRN-89421"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-sky-700 font-mono bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
                {matchedAppointment.confirmationCode}
              </div>
            </div>
          </div>

          {/* Appointment Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">Scheduled Time</span>
                <span className="font-semibold text-slate-900">
                  {matchedAppointment.time} (Today)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">Attending Provider</span>
                <span className="font-semibold text-slate-900">
                  {matchedAppointment.doctorName}
                </span>
                <span className="text-xs text-slate-500 block">
                  {matchedAppointment.specialty}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">Station & Room</span>
                <span className="font-semibold text-slate-900">
                  {matchedAppointment.department} — {matchedAppointment.room}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">Insurance Status</span>
                <span className="font-semibold text-slate-900">
                  {matchedPatient?.insurance.provider || "BlueCross Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Reason for visit */}
          <div className="bg-sky-50/70 border border-sky-100 p-3.5 rounded-xl text-xs text-sky-900">
            <strong>Stated Reason for Visit:</strong> {matchedAppointment.reason}
          </div>

          {/* Symptom Safety Check */}
          <div className="border border-slate-200 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Health & Safety Screening
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Have you developed any sudden acute symptoms today (e.g. chest pain, fever, sudden shortness of breath)?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHasNewSymptoms(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  hasNewSymptoms === false
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                No, Feeling Stable
              </button>
              <button
                type="button"
                onClick={() => setHasNewSymptoms(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  hasNewSymptoms === true
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Yes, I Have New Symptoms
              </button>
            </div>
          </div>

          {/* Copay Section */}
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-bold text-slate-900">
                  Insurance Co-Pay
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Due Today</span>
                <span className="text-lg font-bold text-slate-900">
                  ${matchedAppointment.copayAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCopayMethod("card")}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "card"
                    ? "bg-sky-600 text-white border-sky-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Tap Credit/Debit
              </button>
              <button
                type="button"
                onClick={() => setCopayMethod("apple_pay")}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "apple_pay"
                    ? "bg-sky-600 text-white border-sky-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Apple / Google Pay
              </button>
              <button
                type="button"
                onClick={() => setCopayMethod("bill_later")}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  copayMethod === "bill_later"
                    ? "bg-sky-600 text-white border-sky-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Bill After Visit
              </button>
            </div>
          </div>

          {/* Confirm Check-In CTA Button */}
          <button
            id="btn-confirm-checkin-final"
            onClick={handleFinalizeCheckIn}
            disabled={copayProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-600/20 text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {copayProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Finalizing Check-In & Generating Ticket...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Complete Check-In & Print Ticket Pass</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
