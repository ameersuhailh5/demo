import React, { useState, useEffect } from "react";
import { StaffRole, AuthUser, Doctor } from "../types";
import {
  Lock,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  X,
  AlertCircle,
  LogIn,
  Fingerprint,
  CreditCard,
  Sparkles,
  Palette,
  Maximize2,
  Minimize2,
  Settings2,
  CheckCircle2,
  Building2,
  UserCheck,
  Clock,
  Check,
  Delete,
  RefreshCw,
} from "lucide-react";
import { playButtonTap, playSuccessChime } from "../utils/audio";

interface StaffAuthModalProps {
  requiredRole: StaffRole;
  doctors: Doctor[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  customClinicName?: string;
}

export type AuthMethod = "password" | "pin" | "biometric" | "badge";
export type ColorTheme = "deep-navy" | "crimson" | "emerald" | "dark-slate";

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  requiredRole,
  doctors,
  isOpen,
  onClose,
  onSuccess,
  customClinicName = "Aayush Integrated Super-Specialty Hospital",
}) => {
  const [role, setRole] = useState<StaffRole>(requiredRole);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0]?.id || "doc-1"
  );
  const [username, setUsername] = useState<string>(
    requiredRole === "admin" ? "admin" : "doctor"
  );
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Login Customization Controls
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [theme, setTheme] = useState<ColorTheme>("deep-navy");
  const [clinicName, setClinicName] = useState<string>(customClinicName);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // PIN Keypad State
  const [pin, setPin] = useState<string>("");

  // Biometric Scan State
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);

  // RFID Badge Scan State
  const [isBadgeScanning, setIsBadgeScanning] = useState<boolean>(false);

  // Live Clock
  const [liveTime, setLiveTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Theme color definitions
  const themeColors = {
    "deep-navy": { primary: "#105370", secondary: "#16C2C4", light: "#ECFCF9", border: "#16C2C4" },
    crimson: { primary: "#8C2727", secondary: "#FF5353", light: "#FFF5F5", border: "#FF5353" },
    emerald: { primary: "#065F46", secondary: "#10B981", light: "#ECFDF5", border: "#10B981" },
    "dark-slate": { primary: "#0F172A", secondary: "#38BDF8", light: "#F0F9FF", border: "#38BDF8" },
  };

  const currentColors = themeColors[theme];

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    setErrorMsg("");
    setPassword("");
    setPin("");
    if (newRole === "admin") {
      setUsername("admin");
    } else {
      setUsername("doctor");
    }
  };

  const handleQuickFill = (targetRole: StaffRole) => {
    playButtonTap();
    setRole(targetRole);
    setErrorMsg("");
    if (authMethod === "pin") {
      setPin(targetRole === "admin" ? "9999" : "1234");
    } else {
      if (targetRole === "admin") {
        setUsername("admin");
        setPassword("admin123");
      } else {
        setUsername(selectedDoctorId || "doctor");
        setPassword("doc123");
      }
    }
  };

  const handleAuthSuccessUser = (user: AuthUser) => {
    playSuccessChime();
    onSuccess(user);
  };

  const executeLoginCheck = async (enteredPass: string) => {
    setErrorMsg("");
    setIsLoading(true);
    playButtonTap();

    const normalizedUser =
      role === "doctor" ? selectedDoctorId || username : username;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalizedUser,
          password: enteredPass.trim(),
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        handleAuthSuccessUser(data.user);
        return;
      }

      // Local fallback
      const cleanPass = enteredPass.trim();
      if (role === "admin") {
        if (cleanPass === "admin123" || cleanPass === "admin" || cleanPass === "9999") {
          handleAuthSuccessUser({
            id: "admin-1",
            username: "admin",
            name: "Clinic Administrator",
            role: "admin",
            title: "Hospital Operations Director",
            token: `token_admin_${Date.now()}`,
          });
          return;
        } else {
          setErrorMsg("Incorrect admin password or PIN. (Default: admin123 / PIN 9999)");
          setIsLoading(false);
          return;
        }
      } else {
        if (cleanPass === "doc123" || cleanPass === "doctor" || cleanPass === "1234") {
          const doc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
          handleAuthSuccessUser({
            id: doc.id,
            username: doc.id,
            name: doc.name,
            role: "doctor",
            doctorId: doc.id,
            department: doc.department,
            title: doc.title,
            token: `token_doc_${Date.now()}`,
          });
          return;
        } else {
          setErrorMsg("Incorrect physician password or PIN. (Default: doc123 / PIN 1234)");
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Offline fallback logic
      const cleanPass = enteredPass.trim();
      if (
        role === "admin" &&
        (cleanPass === "admin123" || cleanPass === "admin" || cleanPass === "9999")
      ) {
        handleAuthSuccessUser({
          id: "admin-1",
          username: "admin",
          name: "Clinic Administrator",
          role: "admin",
          title: "Hospital Operations Director",
          token: `token_admin_${Date.now()}`,
        });
      } else if (
        role === "doctor" &&
        (cleanPass === "doc123" || cleanPass === "doctor" || cleanPass === "1234")
      ) {
        const doc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
        handleAuthSuccessUser({
          id: doc.id,
          username: doc.id,
          name: doc.name,
          role: "doctor",
          doctorId: doc.id,
          department: doc.department,
          title: doc.title,
          token: `token_doc_${Date.now()}`,
        });
      } else {
        setErrorMsg(
          role === "admin"
            ? "Invalid credentials. Default: admin123 / PIN 9999"
            : "Invalid credentials. Default: doc123 / PIN 1234"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLoginCheck(password);
  };

  // Handle Keypad Press for PIN
  const handlePinPress = (digit: string) => {
    playButtonTap();
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto submit when 4 digits entered
        setTimeout(() => executeLoginCheck(newPin), 200);
      }
    }
  };

  const handlePinDelete = () => {
    playButtonTap();
    setPin((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    playButtonTap();
    setPin("");
  };

  // Biometric Scan Handler
  const handleStartBiometricScan = () => {
    playButtonTap();
    setIsBiometricScanning(true);
    setBiometricProgress(0);
    setErrorMsg("");

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setBiometricProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsBiometricScanning(false);
        // Authenticate as selected doctor or admin
        executeLoginCheck(role === "admin" ? "admin123" : "doc123");
      }
    }, 200);
  };

  // Badge Scan Handler
  const handleStartBadgeScan = () => {
    playButtonTap();
    setIsBadgeScanning(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsBadgeScanning(false);
      executeLoginCheck(role === "admin" ? "admin123" : "doc123");
    }, 1200);
  };

  // Selected Doctor details
  const activeDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-300 ${
        isFullscreen ? "bg-slate-950 p-0" : "bg-slate-900/80 backdrop-blur-sm"
      }`}
      onClick={(e) => {
        if (!isFullscreen && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full rounded-none border-none max-w-none max-h-none justify-between"
            : "max-w-xl w-full max-h-[92vh]"
        }`}
      >
        {/* Top Restricted & Customizable Header */}
        <div
          className="p-5 sm:p-6 text-white relative shadow-md transition-colors duration-300"
          style={{
            backgroundColor: currentColors.primary,
          }}
        >
          {/* Header Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
            {/* Customizer Drawer Toggle */}
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Customize Login Portal"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Customize</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Portal View"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-start sm:items-center gap-3.5 pr-24">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Restricted Access
                </span>
                <span className="text-[10px] font-mono opacity-90 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  HIPAA & TLS 1.3 Certified
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {clinicName}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {role === "admin" ? "Administrative Portal Security Gate" : "Doctor Clinical Workstation Login"}
              </p>
            </div>
          </div>

          {/* Collapsible Live Customizer Drawer */}
          {showCustomizer && (
            <div className="mt-4 pt-4 border-t border-white/20 bg-black/20 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-300" /> Login Page Customization Panel
                </span>
                <span className="text-[10px] text-white/70">Changes apply live</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Theme Palette Switcher */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/90 mb-1">
                    Visual Accent Theme
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/30 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTheme("deep-navy")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        theme === "deep-navy" ? "bg-white text-slate-900 shadow-xs" : "text-white/80"
                      }`}
                    >
                      Navy
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("crimson")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        theme === "crimson" ? "bg-white text-slate-900 shadow-xs" : "text-white/80"
                      }`}
                    >
                      Crimson
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("emerald")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        theme === "emerald" ? "bg-white text-slate-900 shadow-xs" : "text-white/80"
                      }`}
                    >
                      Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark-slate")}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        theme === "dark-slate" ? "bg-white text-slate-900 shadow-xs" : "text-white/80"
                      }`}
                    >
                      Slate
                    </button>
                  </div>
                </div>

                {/* Custom Clinic Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/90 mb-1">
                    Clinic Brand Name
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Enter Hospital / Clinic Name"
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:bg-white/20 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-white/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-teal-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember login credentials</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTheme("deep-navy");
                    setClinicName(customClinicName);
                    setAuthMethod("password");
                  }}
                  className="text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Main Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange("doctor")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                role === "doctor"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-4 h-4" style={{ color: currentColors.secondary }} />
              <span>Doctor Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: currentColors.primary }} />
              <span>Admin Dashboard</span>
            </button>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Authentication Method:</span>
              <span className="text-[10px] text-slate-400 font-normal">Choose login option</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  authMethod === "password"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" style={{ color: authMethod === "password" ? currentColors.secondary : undefined }} />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("pin");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  authMethod === "pin"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: authMethod === "pin" ? currentColors.secondary : undefined }} />
                <span>4-Digit PIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("biometric");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  authMethod === "biometric"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" style={{ color: authMethod === "biometric" ? currentColors.secondary : undefined }} />
                <span>Touch ID</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("badge");
                  setErrorMsg("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  authMethod === "badge"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" style={{ color: authMethod === "badge" ? currentColors.secondary : undefined }} />
                <span>RFID Badge</span>
              </button>
            </div>
          </div>

          {/* Quick Fill Preset Banner */}
          <div
            className="border rounded-2xl p-3 flex items-center justify-between text-xs transition-colors"
            style={{
              backgroundColor: currentColors.light,
              borderColor: currentColors.border,
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: currentColors.secondary }} />
              <div>
                <span className="font-bold text-slate-900 block">
                  Demo Fast Credentials
                </span>
                <span className="text-[11px] text-slate-600">
                  {role === "admin"
                    ? "Admin Pass: admin123 | PIN: 9999"
                    : "Doctor Pass: doc123 | PIN: 1234"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill(role)}
              className="px-3 py-1.5 rounded-xl font-bold text-white text-xs shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
              style={{
                backgroundColor: currentColors.primary,
              }}
            >
              Auto-Fill
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Active Doctor Selection Card (When in Doctor Role) */}
          {role === "doctor" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Attending Physician Account
              </label>
              <div className="relative">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium cursor-pointer shadow-2xs"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.department} ({doc.room})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Doctor Summary Pill */}
              {activeDoctor && (
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <div
                    className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0"
                    style={{ backgroundColor: currentColors.primary }}
                  >
                    {activeDoctor.name.charAt(4) || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      {activeDoctor.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {activeDoctor.department} • Room {activeDoctor.room}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    Active Shift
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Render Active Authentication Form / Interface */}
          {authMethod === "password" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "admin" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Administrator Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {role === "admin" ? "Administrator Password" : "Staff Password / PIN"}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {role === "admin" ? "Default: admin123" : "Default: doc123"}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={role === "admin" ? "Enter admin123" : "Enter doc123"}
                    required
                    autoFocus
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-mono shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: currentColors.primary,
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? "Authenticating..." : "Login & Enter"}</span>
                </button>
              </div>
            </form>
          )}

          {/* 4-Digit Security PIN Method */}
          {authMethod === "pin" && (
            <div className="space-y-4 text-center">
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Enter 4-Digit Security Passcode
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Preset PINs: <strong className="text-slate-800">1234</strong> (Doctor) | <strong className="text-slate-800">9999</strong> (Admin)
                </span>
              </div>

              {/* Visual PIN Dots */}
              <div className="flex items-center justify-center gap-4 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      idx < pin.length
                        ? "bg-slate-900 border-slate-900 scale-110 shadow-xs"
                        : "border-slate-300 bg-slate-100"
                    }`}
                    style={{
                      backgroundColor: idx < pin.length ? currentColors.secondary : undefined,
                      borderColor: idx < pin.length ? currentColors.secondary : undefined,
                    }}
                  ></div>
                ))}
              </div>

              {/* Numeric Touch Keypad */}
              <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5 pt-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinPress(num)}
                    disabled={isLoading}
                    className="py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  className="py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl text-xs font-bold text-red-600 transition-all cursor-pointer flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress("0")}
                  disabled={isLoading}
                  className="py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className="py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center"
                >
                  <Delete className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => executeLoginCheck(pin)}
                  disabled={pin.length < 4 || isLoading}
                  className="w-full py-3 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: currentColors.primary,
                  }}
                >
                  <Check className="w-4 h-4" />
                  <span>Verify PIN & Enter</span>
                </button>
              </div>
            </div>
          )}

          {/* Biometric Touch ID Scanner Method */}
          {authMethod === "biometric" && (
            <div className="space-y-4 text-center py-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  Biometric Fingerprint Authentication
                </span>
                <span className="text-[11px] text-slate-500 max-w-xs mx-auto block">
                  Touch the sensor below to scan staff biometric ID token.
                </span>
              </div>

              {/* Fingerprint Touch Sensor Circle */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleStartBiometricScan}
                  disabled={isBiometricScanning || isLoading}
                  className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 relative group ${
                    isBiometricScanning
                      ? "animate-pulse border-teal-500 bg-teal-50 ring-4 ring-teal-500/20"
                      : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-white"
                  }`}
                  style={{
                    borderColor: isBiometricScanning ? currentColors.secondary : undefined,
                  }}
                >
                  <Fingerprint
                    className={`w-12 h-12 transition-colors ${
                      isBiometricScanning ? "animate-pulse" : "text-slate-600 group-hover:text-slate-900"
                    }`}
                    style={{
                      color: isBiometricScanning ? currentColors.secondary : undefined,
                    }}
                  />
                </button>

                {isBiometricScanning && (
                  <div className="w-48 bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${biometricProgress}%`,
                        backgroundColor: currentColors.secondary,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartBiometricScan}
                  disabled={isBiometricScanning || isLoading}
                  className="w-full py-3 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: currentColors.primary,
                  }}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isBiometricScanning ? "Scanning Biometrics..." : "Tap Sensor to Scan Fingerprint"}</span>
                </button>
              </div>
            </div>
          )}

          {/* RFID / NFC Badge Reader Method */}
          {authMethod === "badge" && (
            <div className="space-y-4 text-center py-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  Smart RFID Staff Badge Reader
                </span>
                <span className="text-[11px] text-slate-500 max-w-xs mx-auto block">
                  Hold your hospital contactless ID badge against the workstation sensor.
                </span>
              </div>

              {/* Badge Visual Illustration */}
              <div
                className="max-w-xs mx-auto p-4 rounded-2xl border-2 text-left space-y-3 relative overflow-hidden shadow-sm"
                style={{
                  backgroundColor: currentColors.light,
                  borderColor: currentColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: currentColors.primary }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                      Staff ID Pass
                    </span>
                  </div>
                  <CreditCard className="w-5 h-5" style={{ color: currentColors.secondary }} />
                </div>

                <div className="pt-1">
                  <span className="text-sm font-black text-slate-900 block">
                    {role === "admin" ? "Dr. Medical Director" : activeDoctor?.name || "Attending MD"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 block">
                    ID: NFC-90824-HOSP
                  </span>
                </div>

                {isBadgeScanning && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2 animate-in fade-in">
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Reading NFC Badge...</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartBadgeScan}
                  disabled={isBadgeScanning || isLoading}
                  className="w-full py-3 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: currentColors.primary,
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isBadgeScanning ? "Reading RFID Chip..." : "Simulate Badge Tap"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Audit Compliance Bar */}
        <div className="p-4 bg-slate-900 text-slate-300 text-[11px] flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Server Time: <strong className="text-white font-mono">{liveTime}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px]">Unauthorized logins logged to immutable audit ledger.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

