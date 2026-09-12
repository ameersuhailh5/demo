import React, { useState, useRef } from "react";
import { QueueItem, TriageEvaluation, Language, PatientRecord, TreatmentType } from "../types";
import { INSURANCE_PROVIDERS } from "../data/mockData";
import { TRANSLATIONS, CLINIC_SYMPTOMS, DURATION_OPTIONS } from "../data/translations";
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
  Leaf,
  Pill,
  Stethoscope,
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
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
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

  // Step 2: Treatment Modality & Symptoms
  const [treatmentType, setTreatmentType] = useState<TreatmentType>("allopathy");
  const [ayurvedicFocus, setAyurvedicFocus] = useState<string>("Holistic & Preventive Care");
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
    setInsuranceCardScanned(true);
    setMemberId("AET-99421");
    setGroupNumber("GRP-7721");
    setHasSignature(true);
  };

  const performAITriage = async () => {
    setIsAnalyzingAI(true);
    setCurrentStep(6);
    playButtonTap();

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms.join(", ") || chiefComplaint || "General consultation",
          painLevel,
          duration,
          allergies: hasNoAllergies ? "NKDA" : allergiesText,
          medications: medicationsText,
          conditions: conditionsText,
          language,
          treatmentType,
          ayurvedicFocus: treatmentType === "ayurveda" ? ayurvedicFocus : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTriageResult(data);
      } else {
        fallbackTriageLogic();
      }
    } catch {
      fallbackTriageLogic();
    } finally {
      setIsAnalyzingAI(false);
      playSuccessChime();
    }
  };

  const fallbackTriageLogic = () => {
    let score: 1 | 2 | 3 | 4 | 5 = 4;
    let urgency: "routine" | "moderate" | "urgent" | "emergent" | "critical" = "routine";
    let room = treatmentType === "ayurveda" ? "Ayur-Bay 1" : "Bay 4";
    let summary = `Patient presents with ${chiefComplaint || "routine symptoms"}. Stable vitals recommended.`;

    if (painLevel >= 8 || selectedSymptoms.includes("Chest Pain or Pressure")) {
      score = 2;
      urgency = "emergent";
      room = "Trauma Bay 1";
      summary = "High acuity detected. Immediate nursing assessment ordered.";
    } else if (painLevel >= 5) {
      score = 3;
      urgency = "urgent";
      room = treatmentType === "ayurveda" ? "Ayur-Bay 2" : "Bay 2";
      summary = "Moderate discomfort reported. Standard triage protocol applied.";
    }

    setTriageResult({
      triageScore: score,
      urgencyCategory: urgency,
      recommendedRoom: room,
      clinicalSummary: summary,
      requiredVitals: ["BP", "HR", "SpO2", "Temp"],
      assignedDepartment: treatmentType === "ayurveda" ? "Ayurvedic Medicine" : "Urgent Care",
      estimatedWaitTimeMinutes: score <= 2 ? 5 : score === 3 ? 15 : 30,
      source: "Java/Spring SE Microservice Triage Engine",
    });
  };

  const handleFinalSubmit = () => {
    playSuccessChime();

    const newTicketNumber =
      (treatmentType === "ayurveda" ? "AY-" : "WK-") +
      Math.floor(100 + Math.random() * 900);

    const newQueueItem: QueueItem = {
      id: "q-" + Date.now(),
      ticketNumber: newTicketNumber,
      patientId: "pat-" + Date.now(),
      patientName: `${firstName} ${lastName}`,
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      doctorName:
        treatmentType === "ayurveda"
          ? "Dr. Rajesh Sharma, BAMS, MD (Ayur)"
          : (triageResult?.triageScore || 4) <= 2
          ? "Dr. Sarah Jenkins, MD"
          : "Dr. Alisha Patel, DO",
      department: treatmentType === "ayurveda" ? "Ayurvedic Medicine" : "General Medicine",
      assignedRoom: triageResult?.recommendedRoom || (treatmentType === "ayurveda" ? "Ayur-Room 1" : "Room 102"),
      status: "waiting",
      type: "walk_in",
      urgency: (triageResult?.urgencyCategory as any) || "routine",
      esiScore: triageResult?.triageScore || 4,
      chiefComplaint: chiefComplaint || selectedSymptoms.join(", ") || (treatmentType === "ayurveda" ? "Ayurvedic Consultation" : "General Examination"),
      painLevel,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : [chiefComplaint || "General Checkup"],
      triageEvaluation: triageResult || undefined,
      insuranceVerified: true,
      signatureCompleted: true,
      estimatedWaitMinutes: triageResult?.estimatedWaitTimeMinutes || 20,
      treatmentType: treatmentType,
      clinicalNotes: `Language: ${language.toUpperCase()}. ${triageResult?.clinicalSummary || "Intake completed."}`,
    };

    const newPatient: PatientRecord = {
      id: newQueueItem.patientId || `pat-${Date.now()}`,
      mrn: newQueueItem.mrn,
      firstName,
      lastName,
      dob: dob || "1990-01-01",
      gender: gender === "female" ? "female" : gender === "male" ? "male" : "other",
      phone: phone || "(555) 000-0000",
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      address: "Walk-in Registration, Local Area",
      preferredTreatment: treatmentType,
      emergencyContact: {
        name: emergencyName || "Emergency Contact",
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
    { num: 1, title: t.walkin.step1Title.split(" ")[0] || "Demographics" },
    { num: 2, title: t.walkin.step2Title.split(" ")[0] || "Symptoms" },
    { num: 3, title: t.walkin.step3Title.split(" ")[0] || "History" },
    { num: 4, title: t.walkin.step4Title.split(" ")[0] || "Insurance" },
    { num: 5, title: t.walkin.step5Title.split(" ")[0] || "Consent" },
    { num: 6, title: t.walkin.step6Title.split(" ")[0] || "Triage" },
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
          <span>{t.common.cancel}</span>
        </button>

        <button
          id="btn-walkin-demo-prefill"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
          style={{
            backgroundColor: "rgba(91, 168, 160, 0.1)",
            color: "#3B5284",
            borderColor: "#5BA8A0",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#5BA8A0" }} />
          <span>Auto-Fill Sample</span>
        </button>
      </div>

      {/* Steps Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stepsHeader.map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor:
                    currentStep === s.num
                      ? "#3B5284"
                      : currentStep > s.num
                      ? "#94B447"
                      : "#cbd5e1",
                  color: currentStep > s.num && currentStep !== s.num ? "#ffffff" : "#ffffff",
                  boxShadow: currentStep === s.num ? "0 0 0 4px rgba(91, 168, 160, 0.3)" : undefined,
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
              background: "linear-gradient(90deg, #3B5284 0%, #5BA8A0 50%, #94B447 100%)",
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
              <h2 className="text-xl font-bold text-slate-900">{t.walkin.step1Title}</h2>
              <p className="text-xs text-slate-500">{t.walkin.step1Desc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.walkin.firstName} *
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
                  {t.walkin.lastName} *
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
                  {t.walkin.dob} *
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
                  {t.walkin.gender}
                </label>
                <select
                  id="select-walkin-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="female">{t.walkin.female}</option>
                  <option value="male">{t.walkin.male}</option>
                  <option value="other">{t.walkin.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.walkin.phone} *
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
                  {t.walkin.email}
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
                <span>{t.common.continue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.walkin.step2Title}</h2>
              <p className="text-xs text-slate-500">{t.walkin.step2Desc}</p>
            </div>

            {/* Treatment System Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                <span>{t.common.activeModality} *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Allopathy Card */}
                <button
                  type="button"
                  id="btn-modality-allopathy"
                  onClick={() => {
                    playButtonTap();
                    setTreatmentType("allopathy");
                  }}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all relative cursor-pointer ${
                    treatmentType === "allopathy"
                      ? "border-[#5BA8A0] bg-[#5BA8A0]/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: "#3B5284" }}
                      >
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{t.common.allopathy}</h4>
                        <span className="text-[10px] font-semibold block" style={{ color: "#3B5284" }}>
                          Conventional Western Medicine
                        </span>
                      </div>
                    </div>
                    {treatmentType === "allopathy" && (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#5BA8A0" }} />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {t.common.allopathyDesc}
                  </p>
                </button>

                {/* Ayurveda Card */}
                <button
                  type="button"
                  id="btn-modality-ayurveda"
                  onClick={() => {
                    playButtonTap();
                    setTreatmentType("ayurveda");
                    if (!chiefComplaint) {
                      setChiefComplaint("Ayurvedic consultation & Dosha constitution assessment");
                    }
                  }}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all relative cursor-pointer ${
                    treatmentType === "ayurveda"
                      ? "border-[#94B447] bg-[#94B447]/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "#5D6E1E" }}>
                        <Leaf className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{t.common.ayurveda}</h4>
                        <span className="text-[10px] font-semibold block" style={{ color: "#5D6E1E" }}>
                          Traditional Holistic Medicine
                        </span>
                      </div>
                    </div>
                    {treatmentType === "ayurveda" && (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#94B447" }} />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {t.common.ayurvedaDesc}
                  </p>
                </button>
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.walkin.chiefComplaint} *
              </label>
              <textarea
                id="textarea-chief-complaint"
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder={t.walkin.chiefComplaintPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            {/* Common Symptoms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.walkin.symptomsTitle}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CLINIC_SYMPTOMS.map((sym) => {
                  const localizedLabel = sym.translations[language] || sym.translations.en;
                  const active =
                    selectedSymptoms.includes(sym.id) ||
                    selectedSymptoms.includes(sym.translations.en) ||
                    selectedSymptoms.includes(localizedLabel);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      id={`btn-symptom-${sym.id}`}
                      onClick={() => toggleSymptom(sym.id)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white border-slate-900 font-semibold shadow-xs scale-102"
                          : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs">{sym.redFlag ? "⚠️" : "•"}</span>
                      <span className={language === "hi" ? "font-normal" : "font-medium"}>
                        {localizedLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptom Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.walkin.duration}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(DURATION_OPTIONS[language] || DURATION_OPTIONS.en).map((opt) => {
                  const isSelected = duration === opt.id || duration === opt.label;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      id={`btn-duration-${opt.id}`}
                      onClick={() => {
                        playButtonTap();
                        setDuration(opt.label);
                      }}
                      className={`px-2.5 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pain Scale */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {t.walkin.painLevel}
                </label>
                <span
                  className="font-bold text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: painLevel > 6 ? "#fee2e2" : painLevel > 3 ? "#fef9c3" : "#dcfce7",
                    color: painLevel > 6 ? "#991b1b" : painLevel > 3 ? "#854d0e" : "#166534",
                  }}
                >
                  {painLevel} / 10
                </span>
              </div>
              <input
                id="range-pain-level"
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
              >
                {t.common.back}
              </button>
              <button
                id="btn-step2-next"
                onClick={() => {
                  playButtonTap();
                  setCurrentStep(3);
                }}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs"
                style={{ backgroundColor: "#5AA7A7" }}
              >
                <span>{t.common.continue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.walkin.step3Title}</h2>
              <p className="text-xs text-slate-500">{t.walkin.step3Desc}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {t.walkin.allergies}
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoAllergies}
                    onChange={(e) => setHasNoAllergies(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>{t.walkin.noAllergies}</span>
                </label>
              </div>
              {!hasNoAllergies && (
                <input
                  id="input-allergies"
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder={t.walkin.allergiesPlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.walkin.medications}
              </label>
              <input
                id="input-medications"
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder={t.walkin.medicationsPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.walkin.conditions}
              </label>
              <input
                id="input-conditions"
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder={t.walkin.conditionsPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-slate-600 text-xs font-semibold px-3 py-2"
              >
                {t.common.back}
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
                <span>{t.common.continue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.walkin.step4Title}</h2>
              <p className="text-xs text-slate-500">{t.walkin.step4Desc}</p>
            </div>

            {/* Scan Simulation Card */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
              {insuranceCardScanned ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.walkin.cardScanned}</span>
                  <button
                    type="button"
                    onClick={() => setInsuranceCardScanned(false)}
                    className="ml-2 text-xs underline text-slate-500"
                  >
                    Rescan
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">{t.walkin.scanInsurance}</p>
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
                  {t.walkin.insuranceProvider} *
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
                  {t.walkin.memberId} *
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
                {t.common.back}
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
                <span>{t.common.continue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.walkin.step5Title}</h2>
              <p className="text-xs text-slate-500">{t.walkin.step5Desc}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 space-y-1.5">
              <p>• {t.walkin.hipaaConsent}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" style={{ color: "#5AA7A7" }} />
                  <span>{t.walkin.signaturePrompt}</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.walkin.clearSignature}</span>
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
                    {t.walkin.signaturePrompt}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-slate-600 text-xs font-semibold px-3 py-2 cursor-pointer hover:text-slate-900"
              >
                {t.common.back}
              </button>
              <button
                id="btn-step5-next"
                onClick={performAITriage}
                disabled={!hasSignature}
                className="text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-xs disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#3B5284" }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#CBE54E" }} />
                <span>{t.common.submit}</span>
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
                  {t.walkin.analyzingTriage}
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
                        {t.walkin.triageCompleted}
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
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: treatmentType === "ayurveda" ? "#ecfdf5" : "#f0fdf9",
                            color: treatmentType === "ayurveda" ? "#047857" : "#0f766e",
                            borderColor: treatmentType === "ayurveda" ? "#a7f3d0" : "#99f6e4",
                          }}
                        >
                          {treatmentType === "ayurveda" ? "🌿 " + t.common.ayurveda : "💊 " + t.common.allopathy}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white"
                          style={{ color: "#5AA7A7" }}
                        >
                          ESI {triageResult.triageScore}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {triageResult.clinicalSummary}
                    </p>
                    <div className="text-[11px] text-slate-600 border-t pt-2 border-slate-200 grid grid-cols-2 gap-2">
                      <div>
                        <strong>{t.walkin.department}:</strong>{" "}
                        {treatmentType === "ayurveda" ? "Ayurvedic Medicine & Panchakarma" : "Urgent Care & Walk-In"}
                      </div>
                      <div>
                        <strong>{t.walkin.room}:</strong> {triageResult.recommendedRoom}
                      </div>
                      <div className="col-span-2 text-slate-700">
                        <strong>{t.walkin.assignedDoctor}:</strong>{" "}
                        {treatmentType === "ayurveda"
                          ? "Dr. Rajesh Sharma, BAMS, MD (Ayur)"
                          : (triageResult.triageScore <= 2 ? "Dr. Sarah Jenkins, MD" : "Dr. Alisha Patel, DO")}
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-walkin-issue-ticket"
                    onClick={handleFinalSubmit}
                    className="w-full text-white font-bold py-3.5 px-6 rounded-xl shadow-md text-base flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-95 active:scale-98"
                    style={{ background: "linear-gradient(135deg, #3B5284 0%, #5BA8A0 100%)" }}
                  >
                    <CheckCircle2 className="w-5 h-5" style={{ color: "#CBE54E" }} />
                    <span>{t.ticketPass.printPass}</span>
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
