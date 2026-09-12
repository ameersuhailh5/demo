import React, { useState, useEffect } from "react";
import { AppMode, Language, AuthUser, StaffRole } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  Activity,
  Tv,
  Stethoscope,
  Users,
  Database,
  Volume2,
  VolumeX,
  Languages,
  AlertTriangle,
  HeartPulse,
  Terminal,
  Lock,
  Unlock,
  LogOut,
  ShieldCheck,
  Globe2,
} from "lucide-react";

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  fontSizeLarge: boolean;
  onToggleFontSize: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeWaitingCount: number;
  authUser?: AuthUser | null;
  onSignOut?: () => void;
  onOpenLanguageModal?: () => void;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  language,
  onSelectLanguage,
  fontSizeLarge,
  onToggleFontSize,
  soundEnabled,
  onToggleSound,
  activeWaitingCount,
  authUser,
  onSignOut,
  onOpenLanguageModal,
  onOpenLiveVoice,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Clinical & Tech Status Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Stack badge */}
          <span className="flex items-center gap-1.5 font-medium text-[11px]" style={{ color: "#5BA8A0" }}>
            <Terminal className="w-3.5 h-3.5" style={{ color: "#CBE54E" }} />
            <span>Java & React Core</span>
          </span>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* HL7 FHIR status badge */}
          <span className="flex items-center gap-1.5 font-medium text-[11px]" style={{ color: "#94B447" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#CBE54E" }}></span>
            <span>FHIR R4 TLS 1.3</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Emergency Alert */}
          <div className="flex items-center gap-1 text-[11px]" style={{ color: "#CBE54E" }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.header.emergency}</span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Sound toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute chimes" : "Enable chimes"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" style={{ color: "#5BA8A0" }} />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-[11px]">{soundEnabled ? t.header.chime : t.header.muted}</span>
          </button>

          {/* Large text toggle */}
          <button
            id="btn-toggle-large-font"
            onClick={onToggleFontSize}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors text-white cursor-pointer"
            style={{
              backgroundColor: fontSizeLarge ? "#5BA8A0" : "#1e293b",
            }}
            title="Toggle text size"
          >
            {t.header.fontSize}
          </button>

          {/* Language selector Button / Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <Globe2 className="w-3 h-3 text-teal-300" />
            <select
              id="select-kiosk-language"
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              aria-label="Select Language"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-slate-900 text-white font-creato-display">English (Creato Display)</option>
              <option value="ml" className="bg-slate-900 text-white font-gayathri">മലയാളം (Gayathri)</option>
              <option value="hi" className="bg-slate-900 text-white font-baloo">हिन्दी (Baloo 2 / बालू 2)</option>
            </select>
          </div>

          <div className="font-mono text-slate-200 text-xs font-semibold px-1">
            {currentTime}
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div
            id="kiosk-brand-logo"
            onClick={() => onSelectMode("kiosk")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #3B5284 0%, #5BA8A0 100%)",
              }}
            >
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {t.header.title}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: "#f0fdf9",
                    color: "#5BA8A0",
                    borderColor: "#5BA8A0",
                  }}
                >
                  Allopathy & Ayurveda
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.header.subtitle}
              </p>
            </div>
          </div>

          {/* Mode Navigation Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              id="tab-kiosk-mode"
              onClick={() => onSelectMode("kiosk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "kiosk"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{
                color: currentMode === "kiosk" ? "#3B5284" : undefined,
              }}
            >
              <Users className="w-3.5 h-3.5" style={{ color: currentMode === "kiosk" ? "#3B5284" : undefined }} />
              <span>{t.header.patientKiosk}</span>
            </button>

            <button
              id="tab-doctor-mode"
              onClick={() => onSelectMode("doctor")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                currentMode === "doctor"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{
                color: currentMode === "doctor" ? "#5BA8A0" : undefined,
              }}
            >
              <Stethoscope className="w-3.5 h-3.5" style={{ color: currentMode === "doctor" ? "#5BA8A0" : undefined }} />
              <span>{t.header.doctorPortal}</span>
              {authUser?.role === "doctor" ? (
                <Unlock className="w-3 h-3 text-emerald-500 ml-0.5" />
              ) : (
                <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
              )}
            </button>

            <button
              id="tab-admin-mode"
              onClick={() => onSelectMode("admin")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                currentMode === "admin"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{
                color: currentMode === "admin" ? "#3B5284" : undefined,
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentMode === "admin" ? "#3B5284" : undefined }} />
              <span>{t.header.adminDashboard}</span>
              {authUser?.role === "admin" ? (
                <Unlock className="w-3 h-3 text-emerald-500 ml-0.5" />
              ) : (
                <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
              )}
              {activeWaitingCount > 0 && (
                <span
                  className="ml-0.5 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full"
                  style={{ backgroundColor: "#CBE54E" }}
                >
                  {activeWaitingCount}
                </span>
              )}
            </button>

            <button
              id="tab-tv-mode"
              onClick={() => onSelectMode("tv-display")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "tv-display"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{
                color: currentMode === "tv-display" ? "#94B447" : undefined,
              }}
            >
              <Tv className="w-3.5 h-3.5" style={{ color: currentMode === "tv-display" ? "#94B447" : undefined }} />
              <span>{t.header.waitingLobby}</span>
            </button>

            <button
              id="tab-ehr-mode"
              onClick={() => onSelectMode("ehr-vault")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "ehr-vault"
                  ? "bg-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={{
                color: currentMode === "ehr-vault" ? "#5D6E1E" : undefined,
              }}
            >
              <Database className="w-3.5 h-3.5" style={{ color: currentMode === "ehr-vault" ? "#5D6E1E" : undefined }} />
              <span>{t.header.ehrVault}</span>
            </button>
          </nav>

          {/* Live Voice AI Assistant Button */}
          {onOpenLiveVoice && (
            <button
              id="btn-header-open-live-voice"
              type="button"
              onClick={onOpenLiveVoice}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-white shadow-sm hover:scale-102 transition-all cursor-pointer text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #3B5284 0%, #5BA8A0 100%)",
                border: "1px solid #5BA8A0",
              }}
              title="Open Gemini 3.1 Live Voice Assistant"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "#CBE54E" }}></span>
              </span>
              <span className="tracking-tight">Live Voice AI</span>
              <span className="text-[10px] text-slate-900 font-bold px-1.5 py-0.2 rounded font-mono" style={{ backgroundColor: "#CBE54E" }}>
                3.1 Live
              </span>
            </button>
          )}

          {/* Active Authenticated Staff User Pill & Lock/Sign Out Button */}
          {authUser && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-500 text-[11px]">Logged in:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]">
                  {authUser.name}
                </span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold uppercase"
                  style={{
                    backgroundColor:
                      authUser.role === "admin"
                        ? "rgba(59, 82, 132, 0.15)"
                        : "rgba(91, 168, 160, 0.15)",
                    color: authUser.role === "admin" ? "#3B5284" : "#5BA8A0",
                  }}
                >
                  {authUser.role}
                </span>
              </div>

              <button
                id="btn-staff-sign-out"
                onClick={onSignOut}
                className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg font-semibold transition-colors ml-1 border border-red-200"
                title="Lock Session & Sign Out (Returns to Kiosk)"
              >
                <Lock className="w-3 h-3" />
                <span>Lock / Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
