import React, { useState } from "react";
import { Doctor, PatientRecord, QueueItem, Appointment, AuthUser, AuditLogEntry } from "../types";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Stethoscope,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Building2,
  PlusCircle,
  X,
  Lock,
  Leaf,
  Pill,
  Settings2,
  Palette,
  Eye,
  LayoutGrid,
  List,
  Download,
  BarChart3,
  Activity,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Layers,
  ShieldAlert,
  Printer,
  ChevronRight,
  UserPlus,
  Shield,
  HelpCircle,
} from "lucide-react";
import { playButtonTap, playSuccessChime } from "../utils/audio";

interface AdminDashboardProps {
  doctors: Doctor[];
  patients: PatientRecord[];
  queue: QueueItem[];
  appointments: Appointment[];
  auditLogs?: AuditLogEntry[];
  onAssignDoctor: (queueId: string, doctorId: string, doctorName: string, room: string, department: string) => void;
  onUpdateDoctorAvailability: (doctorId: string, available: boolean) => void;
  onAddDoctor: (newDoctor: Doctor) => void;
  onInspectPatient: (patient: PatientRecord, queueItem?: QueueItem) => void;
  authUser?: AuthUser | null;
  onLockDashboard?: () => void;
}

export type AdminTheme = "deep-navy" | "dark-slate" | "crimson" | "emerald" | "royal-purple";
export type AdminAccent = "bright-teal" | "vibrant-crimson" | "amber-gold" | "mint-green";
export type ViewDensity = "table" | "compact" | "grid";
export type SurgeAlertMode = "normal" | "surge" | "triage-code-red" | "shift-change";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  doctors,
  patients,
  queue,
  appointments,
  auditLogs = [],
  onAssignDoctor,
  onUpdateDoctorAvailability,
  onAddDoctor,
  onInspectPatient,
  authUser,
  onLockDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<
    "assignments" | "doctors" | "patients" | "audit-logs" | "analytics"
  >("assignments");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState<"all" | "allopathy" | "ayurveda">("all");
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  // Customization Controls State
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [adminTheme, setAdminTheme] = useState<AdminTheme>("deep-navy");
  const [adminAccent, setAdminAccent] = useState<AdminAccent>("bright-teal");
  const [viewDensity, setViewDensity] = useState<ViewDensity>("table");
  const [clinicTitle, setClinicTitle] = useState("Aayush Integrated Super-Specialty Hospital");
  const [clinicSubtitle, setClinicSubtitle] = useState("Administration & Central Triage Dispatch Control");
  const [surgeMode, setSurgeMode] = useState<SurgeAlertMode>("normal");
  const [dispatchStrategy, setDispatchStrategy] = useState<"balanced" | "modality-match" | "speed-first">("balanced");

  // Toggle Visibility Widgets
  const [showQuickStats, setShowQuickStats] = useState(true);
  const [showModalityBreakdown, setShowModalityBreakdown] = useState(true);

  // Print Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  // New Doctor Modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocSpecialty, setNewDocSpecialty] = useState("");
  const [newDocDept, setNewDocDept] = useState("General Practice & Family Medicine");
  const [newDocRoom, setNewDocRoom] = useState("");

  // Color Mapping Configurations
  const themeHeaderBg: Record<AdminTheme, string> = {
    "deep-navy": "#105370",
    "dark-slate": "#0F172A",
    crimson: "#8C2727",
    emerald: "#065F46",
    "royal-purple": "#312E81",
  };

  const accentHex: Record<AdminAccent, string> = {
    "bright-teal": "#16C2C4",
    "vibrant-crimson": "#FF5353",
    "amber-gold": "#EAB308",
    "mint-green": "#10B981",
  };

  const currentThemeBg = themeHeaderBg[adminTheme];
  const currentAccent = accentHex[adminAccent];

  // Filtered Queue Items
  const filteredQueue = queue.filter((q) => {
    const matchesSearch =
      q.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModality =
      modalityFilter === "all" || q.treatmentType === modalityFilter;

    return matchesSearch && matchesModality;
  });

  // Filtered Patients
  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const handleAssignChange = (queueItem: QueueItem, selectedDocId: string) => {
    const selectedDoc = doctors.find((d) => d.id === selectedDocId);
    if (!selectedDoc) return;
    playButtonTap();

    onAssignDoctor(
      queueItem.id,
      selectedDoc.id,
      selectedDoc.name,
      selectedDoc.room,
      selectedDoc.department
    );

    setAssignmentNotice(
      `Reallocated Ticket #${queueItem.ticketNumber} (${queueItem.patientName}) to ${selectedDoc.name} (${selectedDoc.room}).`
    );
    playSuccessChime();
    setTimeout(() => setAssignmentNotice(null), 3500);
  };

  // Smart Auto-Assign Suggestion Handler
  const handleAutoRecommendDoctor = (queueItem: QueueItem) => {
    playButtonTap();
    let eligibleDocs = doctors.filter((d) => d.available);
    if (dispatchStrategy === "modality-match" && queueItem.treatmentType) {
      const matchModality = doctors.filter(
        (d) => d.available && d.treatmentType === queueItem.treatmentType
      );
      if (matchModality.length > 0) eligibleDocs = matchModality;
    }

    if (eligibleDocs.length === 0) eligibleDocs = doctors;

    // Pick doctor with minimum assigned active count
    const bestDoc = eligibleDocs.reduce((prev, curr) => {
      const prevCount = queue.filter((q) => q.doctorId === prev.id).length;
      const currCount = queue.filter((q) => q.doctorId === curr.id).length;
      return currCount < prevCount ? curr : prev;
    }, eligibleDocs[0]);

    if (bestDoc) {
      handleAssignChange(queueItem, bestDoc.id);
    }
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    playButtonTap();

    const isAyur = newDocDept.toLowerCase().includes("ayur");
    const created: Doctor = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      title: isAyur ? "Ayurvedic Vaidya / Attending Physician" : "Attending Physician",
      specialty: newDocSpecialty.trim() || (isAyur ? "Ayurvedic Medicine" : "General Medicine"),
      department: newDocDept,
      room: newDocRoom.trim() || (isAyur ? "Ayurveda Suite" : "Exam Room"),
      available: true,
      treatmentType: isAyur ? "ayurveda" : "allopathy",
    };

    onAddDoctor(created);
    setShowAddDocModal(false);
    setNewDocName("");
    setNewDocSpecialty("");
    setNewDocRoom("");
    playSuccessChime();
  };

  // Statistics Metrics
  const activeDocCount = doctors.filter((d) => d.available).length;
  const allopathyCount = queue.filter((q) => q.treatmentType !== "ayurveda").length;
  const ayurvedaCount = queue.filter((q) => q.treatmentType === "ayurveda").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Customizable Banner */}
      <div
        className="rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-white/10 relative transition-all duration-300 overflow-hidden"
        style={{ backgroundColor: currentThemeBg }}
      >
        {/* Banner Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-0.5 rounded-full text-white">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentAccent }} />
                <span>Admin Master Controls</span>
              </span>
              <span className="text-[10px] font-mono text-white/80">
                {authUser?.name ? `Signed in: ${authUser.name}` : "System Admin Mode"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {clinicTitle}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium max-w-2xl">
              {clinicSubtitle}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Customizer Drawer Toggle */}
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="Customize Dashboard Theme, Layout & Policies"
            >
              <Settings2 className="w-4 h-4" style={{ color: currentAccent }} />
              <span>Customize View</span>
            </button>

            {/* Print & Export Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="Generate Administrative Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* Add Doctor Button */}
            <button
              onClick={() => setShowAddDocModal(true)}
              className="text-slate-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:opacity-95 active:scale-95"
              style={{ backgroundColor: currentAccent }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Doctor</span>
            </button>

            {/* Lock Session */}
            {onLockDashboard && (
              <button
                onClick={onLockDashboard}
                className="bg-black/30 hover:bg-red-950/80 border border-white/20 hover:border-red-500 text-white/90 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Lock admin session and return to kiosk"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
          </div>
        </div>

        {/* Operational Surge Level Alert Indicator (If non-normal) */}
        {surgeMode !== "normal" && (
          <div
            className={`mt-4 p-3 rounded-2xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 ${
              surgeMode === "surge"
                ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                : surgeMode === "triage-code-red"
                ? "bg-red-500/30 border-red-400/60 text-red-100"
                : "bg-purple-500/20 border-purple-400/50 text-purple-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {surgeMode === "surge" && "⚠️ HIGH PATIENT SURGE MODE: Triage prioritizing rapid doctor allocation."}
                {surgeMode === "triage-code-red" && "🚨 CODE RED EMERGENCY DISPATCH: Urgent ESI Level 1-2 cases prioritized."}
                {surgeMode === "shift-change" && "🔄 SHIFT CHANGEOVER IN PROGRESS: Reassigning active patient cases."}
              </span>
            </div>
            <button
              onClick={() => setSurgeMode("normal")}
              className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Collapsible Admin Customizer Panel */}
        {showCustomizer && (
          <div className="mt-5 pt-5 border-t border-white/20 bg-black/30 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-300" /> Dashboard Layout & Preference Customizer
              </span>
              <button
                onClick={() => setShowCustomizer(false)}
                className="text-white/70 hover:text-white text-xs cursor-pointer flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Close Settings
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Header Color Theme */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-white/90">
                  Dashboard Header Theme
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAdminTheme("deep-navy")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminTheme === "deep-navy" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Deep Navy
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTheme("dark-slate")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminTheme === "dark-slate" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Dark Slate
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTheme("crimson")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminTheme === "crimson" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Crimson
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTheme("emerald")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminTheme === "emerald" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Emerald
                  </button>
                </div>
              </div>

              {/* Accent Color Highlight */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-white/90">
                  Primary Accent Highlight
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAdminAccent("bright-teal")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminAccent === "bright-teal" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Teal Cyan
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAccent("vibrant-crimson")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminAccent === "vibrant-crimson" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Crimson
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAccent("amber-gold")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminAccent === "amber-gold" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Amber Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAccent("mint-green")}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      adminAccent === "mint-green" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    Mint Emerald
                  </button>
                </div>
              </div>

              {/* Layout Density */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-white/90">
                  Patient Table View Mode
                </label>
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewDensity("table")}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                      viewDensity === "table" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    <List className="w-3 h-3" /> Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDensity("compact")}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                      viewDensity === "compact" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" /> Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDensity("grid")}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                      viewDensity === "grid" ? "bg-white text-slate-900" : "text-white/80"
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" /> Cards Grid
                  </button>
                </div>
              </div>

              {/* Surge Mode Alert */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-white/90">
                  Operational Alert Mode
                </label>
                <select
                  value={surgeMode}
                  onChange={(e) => setSurgeMode(e.target.value as SurgeAlertMode)}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/20 font-bold"
                >
                  <option value="normal" className="text-slate-900">🟢 Normal Operations</option>
                  <option value="surge" className="text-slate-900">⚠️ High Surge Volume Alert</option>
                  <option value="triage-code-red" className="text-slate-900">🚨 Code Red Emergency Dispatch</option>
                  <option value="shift-change" className="text-slate-900">🔄 Shift Changeover</option>
                </select>
              </div>
            </div>

            {/* Title Customization & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-white/90 mb-1">
                  Hospital Brand Header Title
                </label>
                <input
                  type="text"
                  value={clinicTitle}
                  onChange={(e) => setClinicTitle(e.target.value)}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/90 mb-1">
                  Auto-Dispatch Strategy Policy
                </label>
                <select
                  value={dispatchStrategy}
                  onChange={(e) => setDispatchStrategy(e.target.value as any)}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="balanced" className="text-slate-900">Balanced Doctor Workload</option>
                  <option value="modality-match" className="text-slate-900">Strict Specialty Modality Match</option>
                  <option value="speed-first" className="text-slate-900">First Ready Room Speed</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4 text-xs text-white">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQuickStats}
                    onChange={(e) => setShowQuickStats(e.target.checked)}
                    className="rounded text-teal-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Show Stats Bar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showModalityBreakdown}
                    onChange={(e) => setShowModalityBreakdown(e.target.checked)}
                    className="rounded text-teal-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Show Care Modality Badges</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Quick Statistics Bar */}
        {showQuickStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-white/70 block text-[11px] font-medium">On-Duty Doctors</span>
              <span className="text-lg font-black text-white">
                {activeDocCount} / {doctors.length} Physicians
              </span>
            </div>

            <div>
              <span className="text-white/70 block text-[11px] font-medium">Care Modality Ratio</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-teal-200 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                  <Pill className="w-3 h-3 text-teal-300" />
                  {allopathyCount} Allopathic
                </span>
                <span className="text-xs font-bold text-emerald-200 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  {ayurvedaCount} Ayurvedic
                </span>
              </div>
            </div>

            <div>
              <span className="text-white/70 block text-[11px] font-medium font-medium">Total Queue Workload</span>
              <span className="text-lg font-black text-white">
                {queue.length} Active Patients
              </span>
            </div>

            <div>
              <span className="text-white/70 block text-[11px] font-medium">Dispatch Gateway Status</span>
              <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-300 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active • TLS 1.3 Certified</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Flash Notice */}
      {assignmentNotice && (
        <div
          className="p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200"
          style={{ backgroundColor: "#ECFCF9", borderColor: "#16C2C4", color: "#105370" }}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16C2C4" }} />
            <span className="font-bold">{assignmentNotice}</span>
          </div>
          <button
            onClick={() => setAssignmentNotice(null)}
            className="text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "assignments"
                ? "text-white shadow-md font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "assignments" ? currentThemeBg : undefined,
            }}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Doctor Dispatch ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "doctors"
                ? "text-white shadow-md font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "doctors" ? currentThemeBg : undefined,
            }}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Physician Roster ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "patients"
                ? "text-white shadow-md font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "patients" ? currentThemeBg : undefined,
            }}
          >
            <Users className="w-4 h-4" />
            <span>Patient Directory ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit-logs")}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "audit-logs"
                ? "text-white shadow-md font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "audit-logs" ? currentThemeBg : undefined,
            }}
          >
            <Shield className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "analytics"
                ? "text-white shadow-md font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            style={{
              backgroundColor: activeTab === "analytics" ? currentThemeBg : undefined,
            }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          {/* Modality Filter */}
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Modalities</option>
            <option value="allopathy">💊 Allopathy Only</option>
            <option value="ayurveda">🌿 Ayurveda Only</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search MRN, ticket, name..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DOCTOR ASSIGNMENTS & DISPATCH MATRIX */}
      {activeTab === "assignments" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Patient Queue Dispatch & Doctor Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Assign or reallocate triage cases to attending physicians. Policy Strategy: <strong className="text-slate-800 uppercase">{dispatchStrategy}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredQueue.length} entries
              </span>
            </div>
          </div>

          {/* Render Mode: Table View (Standard or Compact) */}
          {viewDensity !== "grid" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4">Ticket & Time</th>
                    <th className="py-3 px-4">Patient Details</th>
                    <th className="py-3 px-4">Chief Complaint & Triage</th>
                    <th className="py-3 px-4">Assigned Doctor</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => {
                    const pat = patients.find(
                      (p) => p.mrn === item.mrn || p.id === item.patientId
                    ) || patients[0];

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-sm block" style={{ color: currentThemeBg }}>
                            {item.ticketNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.checkInTime}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">
                            {item.patientName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {item.mrn}
                          </span>
                          {showModalityBreakdown && (
                            <div className="mt-1">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                                style={{
                                  backgroundColor: item.treatmentType === "ayurveda" ? "#ECFDF5" : "#ECFCF9",
                                  color: item.treatmentType === "ayurveda" ? "#047857" : "#105370",
                                  borderColor: item.treatmentType === "ayurveda" ? "#A7F3D0" : "#16C2C4",
                                }}
                              >
                                {item.treatmentType === "ayurveda" ? (
                                  <Leaf className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Pill className="w-2.5 h-2.5 text-teal-600" />
                                )}
                                <span>{item.treatmentType === "ayurveda" ? "Ayurveda" : "Allopathy"}</span>
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                              style={{
                                backgroundColor:
                                  item.esiScore <= 2
                                    ? "#FEE2E2"
                                    : item.esiScore === 3
                                    ? "#FEF3C7"
                                    : "#F0FDF4",
                                color:
                                  item.esiScore <= 2
                                    ? "#991B1B"
                                    : item.esiScore === 3
                                    ? "#92400E"
                                    : "#166534",
                              }}
                            >
                              ESI {item.esiScore}
                            </span>
                            {item.painLevel !== undefined && item.painLevel > 0 && (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                Pain {item.painLevel}/10
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] truncate">
                            {item.chiefComplaint}
                          </p>
                        </td>

                        <td className="py-3 px-4 min-w-[210px]">
                          <div className="space-y-1">
                            <select
                              value={item.doctorId || doctors.find((d) => d.name === item.doctorName)?.id || ""}
                              onChange={(e) => handleAssignChange(item, e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none shadow-2xs cursor-pointer"
                            >
                              <option value="" disabled>Select Doctor</option>
                              <optgroup label="🌿 Ayurvedic Physicians">
                                {doctors
                                  .filter((d) => d.treatmentType === "ayurveda" || d.department.toLowerCase().includes("ayur"))
                                  .map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} — {d.department} ({d.room})
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label="💊 Conventional Allopathic Physicians">
                                {doctors
                                  .filter((d) => d.treatmentType !== "ayurveda" && !d.department.toLowerCase().includes("ayur"))
                                  .map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} — {d.department} ({d.room})
                                    </option>
                                  ))}
                              </optgroup>
                            </select>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Currently: {item.doctorName}</span>
                              <button
                                type="button"
                                onClick={() => handleAutoRecommendDoctor(item)}
                                className="text-teal-600 hover:underline font-bold cursor-pointer"
                              >
                                Auto Recommend
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {item.assignedRoom}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {item.department}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onInspectPatient(pat, item)}
                            className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                            style={{
                              backgroundColor: "#ECFCF9",
                              color: "#105370",
                            }}
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>Inspect EHR</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Render Mode: Visual Card Grid */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQueue.map((item) => {
                const pat = patients.find(
                  (p) => p.mrn === item.mrn || p.id === item.patientId
                ) || patients[0];

                return (
                  <div
                    key={item.id}
                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-base block text-teal-700">
                          {item.ticketNumber}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {item.patientName}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          MRN: {item.mrn} • Arrived {item.checkInTime}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: item.esiScore <= 2 ? "#FEE2E2" : "#FEF3C7",
                          color: item.esiScore <= 2 ? "#991B1B" : "#92400E",
                        }}
                      >
                        ESI Level {item.esiScore}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100 italic line-clamp-2">
                      "{item.chiefComplaint}"
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Attending Doctor Assignment
                      </label>
                      <select
                        value={item.doctorId || doctors.find((d) => d.name === item.doctorName)?.id || ""}
                        onChange={(e) => handleAssignChange(item, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs"
                      >
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Room: <strong>{item.assignedRoom}</strong>
                      </span>
                      <button
                        onClick={() => onInspectPatient(pat, item)}
                        className="font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Patient Data</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCTOR ROSTER MANAGEMENT */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Active Medical Staff & Department Allocations
            </h2>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              style={{ backgroundColor: currentThemeBg }}
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-300" />
              <span>Register New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const docPatients = queue.filter(
                (q) => q.doctorId === doc.id || q.doctorName === doc.name
              );

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0"
                        style={{ backgroundColor: currentThemeBg }}
                      >
                        {doc.name.split(" ")[1]?.charAt(0) || "D"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{doc.specialty}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateDoctorAvailability(doc.id, !doc.available)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer"
                      style={{
                        backgroundColor: doc.available ? "#F0FDF4" : "#F1F5F9",
                        borderColor: doc.available ? "#BAC94A" : "#CBD5E1",
                        color: doc.available ? "#166534" : "#64748B",
                      }}
                    >
                      {doc.available ? "● On Duty" : "○ Off Duty"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Department</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {doc.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Assigned Room</span>
                      <span className="font-bold text-slate-800 block">
                        {doc.room}
                      </span>
                    </div>
                  </div>

                  {/* Active Patient List */}
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      Assigned Patients ({docPatients.length}):
                    </span>
                    {docPatients.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic block py-1">
                        No active patients in queue.
                      </span>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {docPatients.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <span className="font-bold text-slate-800">
                              {p.ticketNumber} • {p.patientName}
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: p.status === "called" ? "#E0F2FE" : "#F1F5F9",
                                color: p.status === "called" ? "#0369A1" : "#475569",
                              }}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT MASTER DIRECTORY */}
      {activeTab === "patients" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Patient Medical Record Directory
              </h2>
              <p className="text-xs text-slate-500">
                Inspect clinical history, allergies, insurance status, and EHR files.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total {patients.length} Master Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-4">MRN</th>
                  <th className="py-3 px-4">Full Legal Name</th>
                  <th className="py-3 px-4">DOB & Gender</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Insurance Verified</th>
                  <th className="py-3 px-4 text-right">EHR Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: currentThemeBg }}>
                      {pat.mrn}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {pat.firstName} {pat.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.dob} ({pat.gender})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{pat.phone}</div>
                      <div className="text-[10px] text-slate-400">{pat.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {pat.medicalHistory.allergies.map((a) => (
                          <span
                            key={a}
                            className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded text-[10px] font-semibold"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {pat.insurance.provider}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {pat.insurance.policyNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onInspectPatient(pat)}
                        className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                        style={{
                          backgroundColor: "#ECFCF9",
                          color: "#105370",
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspect File</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT LOG LEDGER */}
      {activeTab === "audit-logs" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-3 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" /> HIPAA Security Audit Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Immutable record of dispatch actions, patient check-in events, and staff authentications.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
              {auditLogs.length} Logged Events
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No audit events recorded yet in this session.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Role: {log.userRole} | MRN: {log.patientMRN}</span>
                    <span className="truncate max-w-xs">{log.securityHash}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & CASELOAD REPORTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Average Wait Time
              </span>
              <span className="text-3xl font-black text-slate-900 block">
                12 <span className="text-sm font-semibold text-slate-500">mins</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                ↓ 4 mins faster than target SLA
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Doctor Capacity Index
              </span>
              <span className="text-3xl font-black text-slate-900 block">
                84% <span className="text-sm font-semibold text-slate-500">capacity</span>
              </span>
              <span className="text-[11px] text-teal-600 font-semibold block">
                Optimal patient flow distribution
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Care Modality Choice
              </span>
              <span className="text-3xl font-black text-slate-900 block">
                60% Allopathy / 40% Ayurveda
              </span>
              <span className="text-[11px] text-slate-500 block">
                Balanced integrated medicine demand
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" /> Triage ESI Severity Distribution
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-700">ESI Level 1 & 2 (Emergent / Critical)</span>
                  <span className="font-mono font-bold text-red-700">
                    {queue.filter((q) => q.esiScore <= 2).length} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{
                      width: `${(queue.filter((q) => q.esiScore <= 2).length / (queue.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-700">ESI Level 3 (Urgent / Moderate)</span>
                  <span className="font-mono font-bold text-amber-700">
                    {queue.filter((q) => q.esiScore === 3).length} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${(queue.filter((q) => q.esiScore === 3).length / (queue.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-700">ESI Level 4 & 5 (Routine / Standard)</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {queue.filter((q) => q.esiScore >= 4).length} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(queue.filter((q) => q.esiScore >= 4).length / (queue.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-bold">Register Attending Doctor</h3>
              </div>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Conan, MD"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clinical Specialty
                </label>
                <input
                  type="text"
                  required
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Orthopedics, Panchakarma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Department
                </label>
                <select
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 focus:outline-none focus:bg-white font-medium cursor-pointer"
                >
                  <option value="General Practice & Family Medicine">General Practice & Family Medicine</option>
                  <option value="Urgent Care & Walk-In">Urgent Care & Walk-In</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology & Vascular">Cardiology & Vascular</option>
                  <option value="Pulmonology & Respiratory">Pulmonology & Respiratory</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Ayurvedic Medicine & Panchakarma">Ayurvedic Medicine & Panchakarma</option>
                  <option value="Ayurvedic Holistic Care">Ayurvedic Holistic Care</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Assigned Room / Station
                </label>
                <input
                  type="text"
                  required
                  value={newDocRoom}
                  onChange={(e) => setNewDocRoom(e.target.value)}
                  placeholder="e.g. Room 3B, Triage Bay 4"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white font-bold px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: currentThemeBg }}
                >
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-600" /> Administrative Queue Summary Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono text-slate-800">
              <div className="font-bold border-b pb-1 text-slate-900">
                {clinicTitle} — DAILY REPORT
              </div>
              <div>Generated: {new Date().toLocaleString()}</div>
              <div>Active Patient Queue: {queue.length}</div>
              <div>Physicians On Duty: {activeDocCount} / {doctors.length}</div>
              <div>Allopathy Patients: {allopathyCount} | Ayurveda: {ayurvedaCount}</div>
              <div>Surge Level: {surgeMode.toUpperCase()}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowReportModal(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                style={{ backgroundColor: currentThemeBg }}
              >
                Print Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
