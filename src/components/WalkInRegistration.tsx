import React, { useState, useRef } from "react";
import { QueueItem, TriageEvaluation, Language, PatientRecord } from "../types";
import { COMMON_SYMPTOMS, INSURANCE_PROVIDERS } from "../data/mockData";
import {
  Activity,
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

  const toggleSymptom = (label: string) => {
    playButtonTap();
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
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

  const handlePrefillDemo = () => {
    setFirstName("Sarah");
    setLastName("Miller");
    setDob("1990-05-12");
    setGender("female");
    setPhone("(555) 789-0123");
    setEmail("sarah.miller@example.com");
    setEmergencyName("David Miller");
    setEmergencyPhone("(555) 789-0124");
    setChiefComplaint("Sharp right ankle pain after stepping off curb");
    setSelectedSymptoms(["Joint Pain or Sprain"]);
    setPainLevel(5);
    setDuration("Past 2 hours");
    setAllergiesText("Sulfa antibiotics");
    setMedicationsText("Ibuprofen 400mg");
    setConditionsText("None");
    setMemberId("BC-992144");
    setGroupNumber("GRP-7721");
    setInsuranceCardScanned(true);
    setHasSignature(true);
  };

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
          urgencyCategory: data.urgencyCategory || "Level 3 Urgent",
          recommendedRoom: data.recommendedRoom || "Triage Bay 2",
          vitalsToCheck: data.vitalsToCheck || ["Blood Pressure", "Heart Rate", "SpO2"],
          clinicalSummary: data.clinicalSummary || "Intake completed.",
          suggestedNursingNotes: data.suggestedNursingNotes || "Standard intake protocol.",
          source: data.source || "Python Gemini AI",
        });
      }
    } catch {
      const isRedFlag = painLevel >= 8 || selectedSymptoms.includes("Chest Discomfort / Pressure");
      setTriageResult({
        triageScore: isRedFlag ? 2 : painLevel >= 5 ? 3 : 4,
        urgencyCategory: isRedFlag ? "Level 2 Emergent" : painLevel >= 5 ? "Level 3 Urgent" : "Level 4 Less Urgent",
        recommendedRoom: isRedFlag ? "Triage Bay 1 (High Priority)" : "Exam Room 2",
        vitalsToCheck: ["Blood Pressure", "Pulse Oximetry", "Temperature", "Heart Rate"],
        clinicalSummary: `Patient presents with ${chiefComplaint || "acute complaint"} (pain ${painLevel}/10).`,
        suggestedNursingNotes: "Assess baseline vitals and allergy reconciliation.",
        source: "Python Clinical Protocol Engine",
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
      doctorName: isUrgent ? "Dr. Sarah Jenkins, MD" : "Dr. Alisha Patel, DO",
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
      address: "Walk-in Patient",
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
    { num: 2, title: "Symptoms" },
    { num: 3, title: "History" },
    { num: 4, title: "Insurance" },
    { num: 5, title: "Consent" },
    { num: 6, title: "Triage" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Navigation Top */}
      <div className="flex items-center justify-between mb-5">
        <button
          id="btn-walkin-cancel"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

        <button
          id="btn-walkin-demo-prefill"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
          style={{
            backgroundColor: "#f0fdf9",
            color: "#5AA7A7",
            borderColor: "#96D7C6",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Fill Sample</span>
        </button>
      </div>

      {/* Steps Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stepsHeader.map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all text-white"
                style={{
                  backgroundColor:
                    currentStep === s.num
                      ? "#5AA7A7"
                      : currentStep > s.num
                      ? "#BAC94A"
                      : "#cbd5e1",
                  boxShadow: currentStep === s.num ? "0 0 0 4px #e0f2fe" : undefined,
                }}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-[10px] font-semibold mt-1 hidden sm:block text-slate-600">
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-200 h-1 mt-2.5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / 5) * 100}%`,
              backgroundColor: "#5AA7A7",
            }}
          ></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Demographics</h2>
              <p className="text-xs text-slate-500">
                Enter your name and contact details for medical record registration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  id="input-walkin-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sarah"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="input-walkin-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Miller"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  id="input-walkin-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  id="select-walkin-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone (Queue SMS) *
                </label>
                <input
                  id="input-walkin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="input-walkin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                id="btn-step1-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(2);
                }}
                disabled={!firstName.trim() || !lastName.trim()}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs disabled:opacity-50"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Symptoms & Pain</h2>
              <p className="text-xs text-slate-500">
                Describe your current symptoms for triage evaluation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chief Complaint *
              </label>
              <textarea
                id="textarea-chief-complaint"
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g., Right ankle swelling after misstep on stairs"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Associated Symptoms:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.label);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.label)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                      style={{
                        backgroundColor: isSelected ? "#5AA7A7" : "#f8fafc",
                        color: isSelected ? "#ffffff" : "#334155",
                        borderColor: isSelected ? "#5AA7A7" : "#e2e8f0",
                      }}
                    >
                      {sym.redFlag && <span className="mr-1">⚠️</span>}
                      {sym.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pain Slider */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Pain Level:</span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: painLevel >= 7 ? "#fee2e2" : painLevel >= 4 ? "#fef9c3" : "#dcfce7",
                    color: painLevel >= 7 ? "#b91c1c" : painLevel >= 4 ? "#854d0e" : "#15803d",
                  }}
                >
                  {painLevel} / 10
                </span>
              </div>
              <input
                id="slider-pain-level"
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: "#5AA7A7" }}
              />
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
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
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs disabled:opacity-50"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <span>Medical History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Medical History</h2>
              <p className="text-xs text-slate-500">
                Allergies and medications for clinical safety.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Allergies *</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoAllergies}
                    onChange={(e) => {
                      setHasNoAllergies(e.target.checked);
                      if (e.target.checked) setAllergiesText("");
                    }}
                    className="rounded text-teal-600"
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
                placeholder={hasNoAllergies ? "NKDA" : "e.g. Penicillin, Sulfa, Latex"}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Medications
              </label>
              <input
                id="input-medications"
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="e.g. Lisinopril 10mg, Multivitamin (or None)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chronic Conditions
              </label>
              <input
                id="input-conditions"
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="e.g. Asthma, Hypertension, Diabetes (or None)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
              >
                Back
              </button>
              <button
                id="btn-step3-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(4);
                }}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <span>Insurance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Insurance</h2>
              <p className="text-xs text-slate-500">
                Scan insurance card or verify details.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 text-center">
              {insuranceCardScanned ? (
                <div className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ backgroundColor: "#f0fdf4", color: "#166534" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#BAC94A" }} />
                    <span className="font-bold">Insurance Card Scanned</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInsuranceCardScanned(false)}
                    className="text-slate-500 underline text-xs"
                  >
                    Rescan
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">Insurance Card Scan</p>
                  <button
                    type="button"
                    id="btn-scan-insurance-card"
                    onClick={() => {
                      setInsuranceCardScanned(true);
                      if (!memberId) setMemberId("AET-894210");
                      if (!groupNumber) setGroupNumber("GRP-5542");
                      playSuccessChime();
                    }}
                    className="mt-2 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs"
                    style={{ backgroundColor: "#96D7C6" }}
                  >
                    Simulate Card Scan
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provider *
                </label>
                <select
                  id="select-insurance-provider"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
                >
                  {INSURANCE_PROVIDERS.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy / Member ID *
                </label>
                <input
                  id="input-member-id"
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. BC-12345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
              >
                Back
              </button>
              <button
                id="btn-step4-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(5);
                }}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <span>Consent & Sign</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Treatment Consent</h2>
              <p className="text-xs text-slate-500">
                Sign below to authorize clinic examination and direct billing.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 space-y-1.5">
              <p>• I consent to outpatient examination and urgent care treatment.</p>
              <p>• I acknowledge receipt of the HIPAA Notice of Privacy Practices.</p>
              <p>• I authorize direct insurance submission for covered services.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" style={{ color: "#5AA7A7" }} />
                  <span>Signature Pad:</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative overflow-hidden">
                <canvas
                  id="canvas-signature-pad"
                  ref={canvasRef}
                  width={540}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 cursor-crosshair touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs">
                    Sign with finger or stylus here
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
              >
                Back
              </button>
              <button
                id="btn-step5-next"
                onClick={performAITriage}
                disabled={!hasSignature}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs disabled:opacity-50"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Triage</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="space-y-5">
            {isAnalyzingAI ? (
              <div className="text-center py-10 space-y-3">
                <div
                  className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor: "#5AA7A7", borderTopColor: "transparent" }}
                ></div>
                <h3 className="text-base font-bold text-slate-900">
                  Python Clinical AI Evaluating Intake...
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluating triage ESI score and clinical department routing.
                </p>
              </div>
            ) : (
              triageResult && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                      >
                        Triage Complete
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {triageResult.source}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {firstName} {lastName}
                    </h2>
                  </div>

                  {/* Triage Rating Card */}
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor:
                        triageResult.triageScore <= 2
                          ? "#fef2f2"
                          : triageResult.triageScore === 3
                          ? "#fefce8"
                          : "#f0fdfa",
                      borderColor:
                        triageResult.triageScore <= 2
                          ? "#fca5a5"
                          : triageResult.triageScore === 3
                          ? "#E2D36B"
                          : "#96D7C6",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">
                        {triageResult.urgencyCategory}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white"
                        style={{ color: "#5AA7A7" }}
                      >
                        ESI {triageResult.triageScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {triageResult.clinicalSummary}
                    </p>
                    <div className="text-[11px] text-slate-600 border-t pt-1.5 border-slate-200">
                      <strong>Station:</strong> {triageResult.recommendedRoom}
                    </div>
                  </div>

                  <button
                    id="btn-walkin-issue-ticket"
                    onClick={handleFinalSubmit}
                    className="w-full text-white font-bold py-3.5 px-6 rounded-xl shadow-md text-base flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: "#5AA7A7" }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Print Queue Ticket</span>
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
