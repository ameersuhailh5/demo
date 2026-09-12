import React, { useState, useRef, useEffect } from "react";
import { QueueItem, TriageEvaluation, Language, PatientRecord } from "../types";
import { COMMON_SYMPTOMS, INSURANCE_PROVIDERS } from "../data/mockData";
import {
  User,
  Activity,
  ShieldCheck,
  CreditCard,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  HeartPulse,
  RotateCcw,
} from "lucide-react";
import { playSuccessChime, playButtonTap } from "../utils/audio";

interface WalkInRegistrationProps {
  onComplete: (ticket: QueueItem, patientRecord?: PatientRecord) => void;
  onCancel: () => void;
  language: Language;
}

export const WalkInRegistration: React.FC<WalkInRegistrationProps> = ({
  onComplete,
  onCancel,
  language,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Demographics
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("female");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Step 2: Symptoms & Pain
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [duration, setDuration] = useState("Past 24 hours");

  // Step 3: Medical History
  const [allergiesText, setAllergiesText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [hasNoAllergies, setHasNoAllergies] = useState(false);

  // Step 4: Insurance
  const [insuranceProvider, setInsuranceProvider] = useState(
    INSURANCE_PROVIDERS[0]
  );
  const [memberId, setMemberId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [insuranceCardScanned, setInsuranceCardScanned] = useState(false);

  // Step 5: Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Step 6: AI Triage Result
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageEvaluation | null>(null);

  // Toggle symptom tag
  const toggleSymptom = (label: string) => {
    playButtonTap();
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0284c7"; // Sky 600
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Pre-fill quick demo data
  const handlePrefillDemo = () => {
    setFirstName("Sarah");
    setLastName("Miller");
    setDob("1990-05-12");
    setGender("female");
    setPhone("(555) 789-0123");
    setEmail("sarah.miller@example.com");
    setEmergencyName("David Miller (Spouse)");
    setEmergencyPhone("(555) 789-0124");
    setChiefComplaint("Sharp ankle pain following twisted step on sidewalk");
    setSelectedSymptoms(["Joint Pain or Sprain", "Laceration / Cut / Bleeding"]);
    setPainLevel(6);
    setDuration("Past 2 hours");
    setAllergiesText("Sulfa antibiotics");
    setMedicationsText("Daily Multivitamin, Ibuprofen 400mg");
    setConditionsText("None");
    setMemberId("BC-992144");
    setGroupNumber("GRP-7721");
    setInsuranceCardScanned(true);
    setHasSignature(true);
  };

  // Trigger AI Triage Analysis
  const performAITriage = async () => {
    setIsAnalyzingAI(true);
    setCurrentStep(6);

    const allergiesList = hasNoAllergies
      ? ["No Known Drug Allergies (NKDA)"]
      : allergiesText
      ? allergiesText.split(",").map((s) => s.trim())
      : ["NKDA"];

    const conditionsList = conditionsText
      ? conditionsText.split(",").map((s) => s.trim())
      : [];

    try {
      const res = await fetch("/api/triage-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: `${firstName} ${lastName}`.trim() || "Walk-In Patient",
          age: dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : 35,
          chiefComplaint: chiefComplaint || "General malaise",
          painLevel,
          duration,
          symptoms: selectedSymptoms,
          existingConditions: conditionsList,
          allergies: allergiesList,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTriageResult({
          triageScore: data.triageScore || 3,
          urgencyCategory: data.urgencyCategory || "Urgent Care (ESI Level 3)",
          recommendedRoom: data.recommendedRoom || "Triage Station 1",
          vitalsToCheck: data.vitalsToCheck || ["Blood Pressure", "Heart Rate", "SpO2"],
          clinicalSummary: data.clinicalSummary || "Intake complete.",
          suggestedNursingNotes: data.suggestedNursingNotes || "Standard intake protocol.",
          source: data.source,
        });
      }
    } catch (e) {
      console.warn("AI Triage fetch fallback:", e);
      // Fallback evaluation
      const isRedFlag = painLevel >= 8 || selectedSymptoms.includes("Chest Discomfort / Pressure");
      setTriageResult({
        triageScore: isRedFlag ? 2 : painLevel >= 5 ? 3 : 4,
        urgencyCategory: isRedFlag ? "Emergent (ESI Level 2)" : painLevel >= 5 ? "Urgent (ESI Level 3)" : "Routine (ESI Level 4)",
        recommendedRoom: isRedFlag ? "Triage Bay 1 (High Priority)" : "Exam Room 2",
        vitalsToCheck: ["Blood Pressure", "Pulse Oximetry", "Temperature", "Heart Rate"],
        clinicalSummary: `Patient presents with ${chiefComplaint || "acute complaint"} and pain level ${painLevel}/10 for ${duration}.`,
        suggestedNursingNotes: "Assess vitals upon rooming and confirm allergy history.",
        source: "Clinical Algorithm Engine",
      });
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleFinalSubmit = () => {
    playSuccessChime();

    const randomMRN = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomTicket = `W-${Math.floor(200 + Math.random() * 799)}`;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isUrgent = (triageResult?.triageScore || 3) <= 2;

    const newQueueItem: QueueItem = {
      id: `q-${Date.now()}`,
      ticketNumber: randomTicket,
      patientName: `${firstName} ${lastName}`.trim(),
      mrn: randomMRN,
      checkInTime: nowTime,
      doctorName: isUrgent ? "Dr. Sarah Jenkins, MD (On-Duty)" : "Dr. Alisha Patel, DO",
      department: "Urgent Care & Walk-In",
      assignedRoom: triageResult?.recommendedRoom || "Triage Bay 2",
      status: "waiting",
      type: "walk_in",
      urgency: isUrgent ? "urgent" : "moderate",
      esiScore: triageResult?.triageScore || 3,
      chiefComplaint: chiefComplaint || "General health concern",
      painLevel,
      symptoms: selectedSymptoms,
      triageEvaluation: triageResult || undefined,
      insuranceVerified: true,
      signatureCompleted: true,
      estimatedWaitMinutes: isUrgent ? 4 : 14,
    };

    const newPatient: PatientRecord = {
      id: `pat-${Date.now()}`,
      mrn: randomMRN,
      firstName,
      lastName,
      dob: dob || "1990-01-01",
      gender,
      phone,
      email,
      address: "Walk-in Registration",
      emergencyContact: {
        name: emergencyName || "Not provided",
        relationship: "Family",
        phone: emergencyPhone || phone,
      },
      insurance: {
        provider: insuranceProvider,
        policyNumber: memberId || "PENDING-01",
        groupNumber: groupNumber || "GRP-900",
        copayAmount: 25,
        status: "verified",
      },
      medicalHistory: {
        allergies: hasNoAllergies
          ? ["No Known Drug Allergies (NKDA)"]
          : allergiesText
          ? allergiesText.split(",")
          : ["NKDA"],
        medications: medicationsText ? medicationsText.split(",") : [],
        chronicConditions: conditionsText ? conditionsText.split(",") : [],
        bloodType: "Unknown",
        vaccinations: [],
      },
    };

    onComplete(newQueueItem, newPatient);
  };

  const stepsHeader = [
    { num: 1, title: "Demographics" },
    { num: 2, title: "Symptoms & Pain" },
    { num: 3, title: "Medical History" },
    { num: 4, title: "Insurance & ID" },
    { num: 5, title: "Consent & Sign" },
    { num: 6, title: "AI Triage & Ticket" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header with Cancel and Demo fill */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-walkin-cancel"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Main Screen</span>
        </button>

        <button
          id="btn-walkin-demo-prefill"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Fill Sample Walk-In</span>
        </button>
      </div>

      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepsHeader.map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center flex-1 relative ${
                currentStep >= s.num ? "text-sky-600" : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? "bg-sky-600 text-white ring-4 ring-sky-100"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-[11px] font-medium mt-1 hidden sm:block text-center">
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* STEP 1: Personal Demographics */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Patient Demographics
              </h2>
              <p className="text-xs text-slate-500">
                Please enter your legal name and contact details for medical records linkage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  id="input-walkin-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="input-walkin-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Miller"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  id="input-walkin-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Sex / Gender
                </label>
                <select
                  id="select-walkin-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone (for Queue SMS Alerts) *
                </label>
                <input
                  id="input-walkin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="input-walkin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Name & Relation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. David Miller (Spouse)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Emergency Phone"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="btn-step1-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(2);
                }}
                disabled={!firstName.trim() || !lastName.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                <span>Continue to Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Symptoms & Pain Assessment */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Reason for Visit & Symptoms
              </h2>
              <p className="text-xs text-slate-500">
                Help our clinical triage engine route you to the correct room and physician.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What is your main health concern today? (Chief Complaint) *
              </label>
              <textarea
                id="textarea-chief-complaint"
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g., Severe right ankle swelling after twisting it on stairs..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            {/* Common Symptom Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Any Symptoms You Are Experiencing:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.label);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? sym.redFlag
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-sky-600 text-white border-sky-600 shadow-xs"
                          : sym.redFlag
                          ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {sym.redFlag && <span className="mr-1">⚠️</span>}
                      {sym.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pain Scale Slider (0-10) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Current Pain Scale:
                </span>
                <span
                  className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                    painLevel >= 8
                      ? "bg-rose-100 text-rose-700 border border-rose-300"
                      : painLevel >= 5
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {painLevel} / 10 —{" "}
                  {painLevel === 0
                    ? "No Pain"
                    : painLevel <= 3
                    ? "Mild"
                    : painLevel <= 6
                    ? "Moderate"
                    : painLevel <= 8
                    ? "Severe"
                    : "Worst Possible"}
                </span>
              </div>
              <input
                id="slider-pain-level"
                type="range"
                min="0"
                max="10"
                step="1"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0 (No Pain)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                How long have these symptoms persisted?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  "Past 2 hours",
                  "Past 24 hours",
                  "2-3 days",
                  "More than a week",
                ].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-2 px-2 rounded-lg border text-center font-medium transition-all ${
                      duration === dur
                        ? "bg-sky-600 text-white border-sky-600 font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2"
              >
                Back
              </button>
              <button
                id="btn-step2-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(3);
                }}
                disabled={!chiefComplaint.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                <span>Medical History</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Medical History & EHR Integration */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Medical History & Safeguards
              </h2>
              <p className="text-xs text-slate-500">
                Vital for drug interactions, clinical safety, and electronic health record reconciliation.
              </p>
            </div>

            {/* Allergies */}
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Allergies (Medications, Latex, Food) *</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoAllergies}
                    onChange={(e) => {
                      setHasNoAllergies(e.target.checked);
                      if (e.target.checked) setAllergiesText("");
                    }}
                    className="rounded text-sky-600"
                  />
                  <span>No Known Allergies (NKDA)</span>
                </label>
              </div>
              <input
                id="input-allergies"
                type="text"
                disabled={hasNoAllergies}
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder={
                  hasNoAllergies
                    ? "Patient reports no known allergies"
                    : "e.g. Penicillin, Sulfa, Aspirin, Shellfish"
                }
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Medications & Dosages
              </label>
              <input
                id="input-medications"
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="e.g. Lisinopril 10mg, Metformin 500mg, Daily Vitamin (or None)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pre-existing Medical Conditions
              </label>
              <input
                id="input-conditions"
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="e.g. Asthma, High Blood Pressure, Diabetes, Kidney Disease"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2"
              >
                Back
              </button>
              <button
                id="btn-step3-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(4);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                <span>Insurance & Billing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Insurance & ID Verification */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Insurance & Card Capture
              </h2>
              <p className="text-xs text-slate-500">
                Scan your physical insurance card or enter details manually.
              </p>
            </div>

            {/* Simulated Insurance Card Camera Scanner */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
              {insuranceCardScanned ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold">
                      Insurance Card Front Scanned & OCR Verified
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInsuranceCardScanned(false)}
                    className="text-slate-500 hover:text-slate-800 underline"
                  >
                    Rescan
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Place Insurance Card on Kiosk Scanner Tray
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Optical card reader will auto-detect policy and group codes
                  </p>
                  <button
                    type="button"
                    id="btn-scan-insurance-card"
                    onClick={() => {
                      setInsuranceCardScanned(true);
                      if (!memberId) setMemberId("AET-894210");
                      if (!groupNumber) setGroupNumber("GRP-5542");
                      playSuccessChime();
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
                  >
                    Simulate Card Scan
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Insurance Provider *
                </label>
                <select
                  id="select-insurance-provider"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  {INSURANCE_PROVIDERS.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Member / Policy ID Number *
                </label>
                <input
                  id="input-member-id"
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. BC-12345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group Number
                </label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  placeholder="e.g. GRP-99201"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Walk-In Co-Pay
                </label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800">
                  $25.00 (Due at clinic checkout)
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2"
              >
                Back
              </button>
              <button
                id="btn-step4-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(5);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                <span>Consent & Signature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: HIPAA & Consent Electronic Signature */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Consent for Treatment & HIPAA Notice
              </h2>
              <p className="text-xs text-slate-500">
                Please review the terms and draw your signature below with your finger or stylus.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600 max-h-32 overflow-y-auto space-y-2 leading-relaxed">
              <p>
                <strong>1. Consent to Medical Care:</strong> I voluntarily consent to outpatient examination, diagnostic procedures, laboratory tests, and urgent care treatment as deemed medically necessary by the attending clinical staff.
              </p>
              <p>
                <strong>2. Notice of Privacy Practices (HIPAA):</strong> I acknowledge receipt of the MetroHealth Notice of Privacy Practices governing the confidential use and disclosure of my protected health information.
              </p>
              <p>
                <strong>3. Financial Responsibility:</strong> I authorize direct billing of my insurance provider and agree to settle any unverified copays or non-covered services.
              </p>
            </div>

            {/* Signature Pad */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-sky-600" />
                  <span>Patient / Guardian Signature (Sign Below):</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative overflow-hidden">
                <canvas
                  id="canvas-signature-pad"
                  ref={canvasRef}
                  width={560}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 cursor-crosshair touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">
                    Draw signature here with your finger or mouse
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2"
              >
                Back
              </button>
              <button
                id="btn-step5-next"
                onClick={performAITriage}
                disabled={!hasSignature}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit & Run AI Triage</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: AI Clinical Triage & Intake Review */}
        {currentStep === 6 && (
          <div className="space-y-6">
            {isAnalyzingAI ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto"></div>
                <h3 className="text-lg font-bold text-slate-900">
                  Synthesizing Clinical Triage Evaluation...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cross-referencing symptoms, pain index, and allergy warnings with clinical triage protocols.
                </p>
              </div>
            ) : (
              triageResult && (
                <div className="space-y-5">
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Registration & Triage Complete
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {triageResult.source || "Clinical AI Engine"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Welcome, {firstName} {lastName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Your intake details have been securely transmitted to the triage nurse station.
                    </p>
                  </div>

                  {/* Triage Rating Card */}
                  <div
                    className={`p-4 rounded-xl border ${
                      triageResult.triageScore <= 2
                        ? "bg-rose-50 border-rose-200 text-rose-950"
                        : triageResult.triageScore === 3
                        ? "bg-amber-50 border-amber-200 text-amber-950"
                        : "bg-sky-50 border-sky-200 text-sky-950"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HeartPulse
                          className={`w-5 h-5 ${
                            triageResult.triageScore <= 2
                              ? "text-rose-600"
                              : triageResult.triageScore === 3
                              ? "text-amber-600"
                              : "text-sky-600"
                          }`}
                        />
                        <span className="font-bold text-sm">
                          Triage Assessment: {triageResult.urgencyCategory}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                        ESI Level {triageResult.triageScore}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed mb-3">
                      {triageResult.clinicalSummary}
                    </p>

                    <div className="text-xs pt-2 border-t border-current/20">
                      <strong>Required Nursing Vitals:</strong>{" "}
                      {triageResult.vitalsToCheck?.join(", ")}
                    </div>
                  </div>

                  {/* Room routing */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1">
                    <span className="text-slate-500 block">Recommended Clinic Station:</span>
                    <span className="text-base font-bold text-slate-900">
                      {triageResult.recommendedRoom}
                    </span>
                  </div>

                  {/* Issue Ticket CTA */}
                  <button
                    id="btn-walkin-issue-ticket"
                    onClick={handleFinalSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-600/20 text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Print Queue Ticket & Take Seat</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
