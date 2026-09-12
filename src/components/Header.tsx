import React, { useState, useEffect } from "react";
import {
  AppMode,
  Language,
} from "../types";
import {
  Activity,
  ShieldCheck,
  Tv,
  Stethoscope,
  Users,
  Database,
  Volume2,
  VolumeX,
  Languages,
  AlertTriangle,
  HeartPulse,
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
}) => {
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
      {/* Top Clinical Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            FHIR R4 Encrypted (256-Bit TLS)
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            MetroHealth Clinic Kiosk Station #04
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Emergency note */}
          <div className="flex items-center gap-1 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] hidden md:inline">
              Emergency: Notify front desk immediately or call 911
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Sound toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-[11px]">{soundEnabled ? "Chime On" : "Muted"}</span>
          </button>

          {/* Large text accessibility */}
          <button
            id="btn-toggle-large-font"
            onClick={onToggleFontSize}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              fontSizeLarge
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Toggle larger senior-friendly text size"
          >
            A+ Large Font
          </button>

          {/* Language selector */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded">
            <Languages className="w-3 h-3 text-slate-400" />
            <select
              id="select-kiosk-language"
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              aria-label="Select Language"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="es" className="bg-slate-900 text-white">Español</option>
              <option value="zh" className="bg-slate-900 text-white">中文 (Mandarin)</option>
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
          {/* Logo & Clinic Brand */}
          <div
            id="kiosk-brand-logo"
            onClick={() => onSelectMode("kiosk")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-100 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Medi<span className="text-sky-600">Kiosk</span>
                </span>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Clinical v3.4
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Self-Service Patient Registration & Automated Check-In
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
            <button
              id="tab-kiosk-mode"
              onClick={() => onSelectMode("kiosk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "kiosk"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-sky-600" />
              <span>Patient Kiosk</span>
            </button>

            <button
              id="tab-staff-mode"
              onClick={() => onSelectMode("staff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
                currentMode === "staff"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Staff Desk</span>
              {activeWaitingCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeWaitingCount}
                </span>
              )}
            </button>

            <button
              id="tab-tv-mode"
              onClick={() => onSelectMode("tv-display")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "tv-display"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tv className="w-4 h-4 text-indigo-600" />
              <span>Lobby Display</span>
            </button>

            <button
              id="tab-ehr-mode"
              onClick={() => onSelectMode("ehr-vault")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === "ehr-vault"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Database className="w-4 h-4 text-violet-600" />
              <span>EHR Bridge</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
