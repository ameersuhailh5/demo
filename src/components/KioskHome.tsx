import React from "react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  UserPlus,
  Clock,
  FileCheck,
  ChevronRight,
  Shield,
  Sparkles,
  Leaf,
  Pill,
  Globe2,
  Check,
} from "lucide-react";
import { playButtonTap } from "../utils/audio";

interface KioskHomeProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onStartWalkIn: () => void;
  onViewQueue: () => void;
  onUpdateRecords: () => void;
  waitingCount: number;
  averageWaitMinutes: number;
}

export const KioskHome: React.FC<KioskHomeProps> = ({
  language,
  onSelectLanguage,
  onStartWalkIn,
  onViewQueue,
  onUpdateRecords,
  waitingCount,
  averageWaitMinutes,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const languageOptions: Array<{
    id: Language;
    name: string;
    nativeName: string;
    flagDesc: string;
  }> = [
    { id: "en", name: "English", nativeName: "English", flagDesc: "Primary" },
    { id: "ml", name: "Malayalam", nativeName: "മലയാളം", flagDesc: "കേരളം" },
    { id: "hi", name: "Hindi", nativeName: "हिन्दी", flagDesc: "भारत" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Prominent Language Selection Bar / Banner */}
      <div className="mb-8 bg-white border border-slate-200 shadow-sm rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: "#5AA7A7" }}
            >
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                {t.kioskHome.selectLanguagePrompt}
              </span>
              <span className="text-[11px] text-slate-500">
                Touch a language below to change the whole application
              </span>
            </div>
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto"
            style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
          >
            Active: {language === "en" ? "English" : language === "ml" ? "മലയാളം" : "हिन्दी"}
          </span>
        </div>

        {/* 3 Large Touch-Friendly Language Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languageOptions.map((opt) => {
            const isSelected = language === opt.id;
            return (
              <button
                key={opt.id}
                id={`btn-home-lang-${opt.id}`}
                onClick={() => {
                  playButtonTap();
                  onSelectLanguage(opt.id);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left group transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isSelected
                    ? "bg-teal-50/80 border-teal-600 shadow-sm ring-2 ring-teal-500/20"
                    : "bg-slate-50 border-slate-200 hover:border-teal-300 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-base font-black text-slate-900 ${
                        opt.id === "en"
                          ? "font-roman-serif"
                          : opt.id === "ml"
                          ? "font-gayathri"
                          : "font-inknut"
                      }`}
                    >
                      {opt.nativeName}
                    </span>
                    {opt.nativeName !== opt.name && (
                      <span className="text-xs text-slate-500 font-semibold">
                        ({opt.name})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    {opt.flagDesc}
                  </span>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? "text-white shadow-xs"
                      : "border border-slate-300 group-hover:border-teal-500"
                  }`}
                  style={{
                    backgroundColor: isSelected ? "#5AA7A7" : undefined,
                  }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-8 sm:mb-10">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 border shadow-2xs"
          style={{
            backgroundColor: "#f0fdfa",
            color: "#5AA7A7",
            borderColor: "#96D7C6",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#5AA7A7" }} />
          <span>Intelligent Care Routing • Allopathy & Ayurveda</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.kioskHome.welcome}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          {t.kioskHome.subtitle}
        </p>

        {/* Live Clinic Stats Pill */}
        <div className="mt-4 inline-flex items-center gap-6 bg-white border border-slate-200 shadow-2xs rounded-full px-5 py-2 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#BAC94A" }}
            ></span>
            <span>
              <strong>{waitingCount}</strong> {t.kioskHome.waitingCountSuffix}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "#5AA7A7" }} />
            <span>
              {t.kioskHome.avgWait}: <strong>{averageWaitMinutes} {t.common.mins}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Registration Hero Card */}
      <div className="mb-6">
        <button
          id="btn-kiosk-walkin-registration"
          onClick={onStartWalkIn}
          className="w-full text-left relative text-white p-7 sm:p-9 rounded-3xl shadow-xl border transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #4f9696 0%, #5AA7A7 40%, #6C8CBF 100%)",
            borderColor: "#96D7C6",
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span
                    className="text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-xs uppercase tracking-wide inline-block"
                    style={{ backgroundColor: "#BAC94A" }}
                  >
                    {t.kioskHome.walkinBadge}
                  </span>
                  <div className="text-teal-100 text-xs mt-0.5 font-medium">
                    Self-Service Arrival & Rapid Triage
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                {t.kioskHome.walkinTitle}
              </h2>
              <p className="text-teal-50 text-sm sm:text-base leading-relaxed mb-4">
                {t.kioskHome.walkinDesc}
              </p>

              {/* Supported Modalities Pill Indicator */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-semibold">
                  <Pill className="w-3.5 h-3.5 text-teal-200" />
                  <span>{t.common.allopathy}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-semibold">
                  <Leaf className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{t.common.ayurveda}</span>
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:translate-x-1 transition-all duration-200"
                style={{ backgroundColor: "#ffffff", color: "#4f9696" }}
              >
                <ChevronRight className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                {t.common.touchToBegin}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Action Cards (2 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Card 1: Live Queue Monitor */}
        <button
          id="btn-kiosk-queue-tracker"
          onClick={onViewQueue}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-6 rounded-2xl shadow-xs border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between cursor-pointer"
          style={{ borderColor: "#BAC94A" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fbfdec", color: "#BAC94A" }}
              >
                <Clock className="w-6 h-6" style={{ color: "#8a962b" }} />
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}
              >
                Live Monitor
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.kioskHome.queueTitle}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">{t.kioskHome.queueDesc}</p>
          </div>

          <div
            className="mt-5 flex items-center justify-between text-xs font-bold pt-3 border-t border-slate-100"
            style={{ color: "#5AA7A7" }}
          >
            <span>View Calling Screen</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 2: Records & Insurance */}
        <button
          id="btn-kiosk-records-update"
          onClick={onUpdateRecords}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-6 rounded-2xl shadow-xs border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between cursor-pointer"
          style={{ borderColor: "#96D7C6" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
              >
                <FileCheck className="w-6 h-6" style={{ color: "#5AA7A7" }} />
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}
              >
                Card & Insurance
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.kioskHome.recordsTitle}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">{t.kioskHome.recordsDesc}</p>
          </div>

          <div
            className="mt-5 flex items-center justify-between text-xs font-bold pt-3 border-t border-slate-100"
            style={{ color: "#6C8CBF" }}
          >
            <span>{t.records.title}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Security & HIPAA Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 pt-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "#5AA7A7" }} />
          <span>{t.kioskHome.hipaaBadge}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>{t.common.kioskStation}</span>
          <span>•</span>
          <span>{t.common.staffAssistance}</span>
        </div>
      </div>
    </div>
  );
};
