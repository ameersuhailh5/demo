import React from "react";
import { Language } from "../types";
import {
  QrCode,
  UserPlus,
  Clock,
  FileCheck,
  ChevronRight,
  Shield,
  Sparkles,
  Calendar,
} from "lucide-react";

interface KioskHomeProps {
  language: Language;
  onStartCheckIn: (presetCode?: string) => void;
  onStartWalkIn: () => void;
  onViewQueue: () => void;
  onUpdateRecords: () => void;
  waitingCount: number;
  averageWaitMinutes: number;
}

export const KioskHome: React.FC<KioskHomeProps> = ({
  language,
  onStartCheckIn,
  onStartWalkIn,
  onViewQueue,
  onUpdateRecords,
  waitingCount,
  averageWaitMinutes,
}) => {
  const content = {
    en: {
      welcome: "MetroHealth Clinic Check-In",
      subtitle: "Select a self-service option below to begin.",
      scheduledTitle: "Appointment Check-In",
      scheduledDesc: "Fast check-in via QR code, phone number, or confirmation ID.",
      scheduledBadge: "Fastest • ~45s",
      walkinTitle: "Walk-In Registration",
      walkinDesc: "Express symptom intake & triage for patients without an appointment.",
      walkinBadge: "Express Intake",
      queueTitle: "Live Queue Status",
      queueDesc: "View currently called tickets and estimated wait times.",
      recordsTitle: "Update Records",
      recordsDesc: "Scan insurance cards and update patient contact details.",
      quickTryTitle: "Demo Quick-Select:",
      patient1: "Eleanor Vance (Ref: MK-101)",
      patient2: "Marcus Rodriguez (Ref: MK-102)",
      hipaaBadge: "HIPAA Compliant & HL7 FHIR R4 Encrypted",
    },
    es: {
      welcome: "Registro MetroHealth Clinic",
      subtitle: "Seleccione una opción a continuación para comenzar.",
      scheduledTitle: "Registrar Cita",
      scheduledDesc: "Registro rápido con código QR, teléfono o código de confirmación.",
      scheduledBadge: "Rápido • ~45s",
      walkinTitle: "Paciente Sin Cita",
      walkinDesc: "Evaluación inicial y triaje clínico para pacientes sin cita previa.",
      walkinBadge: "Ingreso Exprés",
      queueTitle: "Fila en Vivo",
      queueDesc: "Consulte tickets llamados y tiempo de espera estimado.",
      recordsTitle: "Actualizar Expediente",
      recordsDesc: "Escanee su tarjeta de seguro y actualice sus datos.",
      quickTryTitle: "Citas de demostración:",
      patient1: "Eleanor Vance (Ref: MK-101)",
      patient2: "Marcus Rodriguez (Ref: MK-102)",
      hipaaBadge: "Conforme a HIPAA y Cifrado FHIR R4",
    },
    zh: {
      welcome: "美普健康诊所 自助签到",
      subtitle: "请选择下方服务选项开始登记：",
      scheduledTitle: "预约患者快速签到",
      scheduledDesc: "使用二维码、电话或确认码快速完成到诊签到。",
      scheduledBadge: "极速 • 约45秒",
      walkinTitle: "现场门诊无预约登记",
      walkinDesc: "无预约患者快速录入症状并进行智能分诊排队。",
      walkinBadge: "快速分诊",
      queueTitle: "实时候诊排队",
      queueDesc: "查看当前呼叫号码及预计候诊时长。",
      recordsTitle: "更新医保与资料",
      recordsDesc: "扫描医保卡并核对个人联系方式与知情同意书。",
      quickTryTitle: "测试预约快捷入口：",
      patient1: "Eleanor Vance (预约码: MK-101)",
      patient2: "Marcus Rodriguez (预约码: MK-102)",
      hipaaBadge: "符合HIPAA规范与HL7 FHIR R4加密标准",
    },
  }[language];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="text-center mb-8 sm:mb-10">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3 border shadow-2xs"
          style={{
            backgroundColor: "#f0fdfa",
            color: "#5AA7A7",
            borderColor: "#96D7C6",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#5AA7A7" }} />
          <span>Python AI Triage & FHIR Integration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {content.welcome}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          {content.subtitle}
        </p>

        {/* Live Clinic Stats Pill */}
        <div className="mt-4 inline-flex items-center gap-6 bg-white border border-slate-200 shadow-2xs rounded-full px-5 py-2 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#BAC94A" }}
            ></span>
            <span>
              <strong>{waitingCount}</strong> waiting in lobby
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "#5AA7A7" }} />
            <span>
              Avg. wait: <strong>{averageWaitMinutes} mins</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
        {/* Card 1: Check In */}
        <button
          id="btn-kiosk-scheduled-checkin"
          onClick={() => onStartCheckIn()}
          className="group text-left relative text-white p-6 sm:p-8 rounded-2xl shadow-lg border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between min-h-[210px]"
          style={{
            background: "linear-gradient(135deg, #5AA7A7 0%, #4f9696 100%)",
            borderColor: "#96D7C6",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <span
                className="text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs"
                style={{ backgroundColor: "#96D7C6" }}
              >
                {content.scheduledBadge}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {content.scheduledTitle}
            </h2>
            <p className="text-teal-50 text-xs sm:text-sm leading-relaxed">
              {content.scheduledDesc}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs sm:text-sm font-bold pt-4 border-t border-white/20">
            <span>Touch to Check In</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
              style={{ backgroundColor: "#ffffff", color: "#5AA7A7" }}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card 2: Walk-In Registration */}
        <button
          id="btn-kiosk-walkin-registration"
          onClick={onStartWalkIn}
          className="group text-left relative text-white p-6 sm:p-8 rounded-2xl shadow-lg border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between min-h-[210px]"
          style={{
            background: "linear-gradient(135deg, #6C8CBF 0%, #5d7cb0 100%)",
            borderColor: "#BAC94A",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <span
                className="text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs"
                style={{ backgroundColor: "#BAC94A" }}
              >
                {content.walkinBadge}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {content.walkinTitle}
            </h2>
            <p className="text-blue-50 text-xs sm:text-sm leading-relaxed">
              {content.walkinDesc}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs sm:text-sm font-bold pt-4 border-t border-white/20">
            <span>Start Walk-In Registration</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
              style={{ backgroundColor: "#ffffff", color: "#6C8CBF" }}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card 3: Live Queue Tracker */}
        <button
          id="btn-kiosk-queue-tracker"
          onClick={onViewQueue}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-5 sm:p-6 rounded-2xl shadow-xs border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
          style={{ borderColor: "#BAC94A" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fbfdec", color: "#BAC94A" }}
              >
                <Clock className="w-6 h-6" style={{ color: "#8a962b" }} />
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}
              >
                Live Updates
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {content.queueTitle}
            </h3>
            <p className="text-slate-600 text-xs">{content.queueDesc}</p>
          </div>

          <div
            className="mt-4 flex items-center justify-between text-xs font-bold"
            style={{ color: "#5AA7A7" }}
          >
            <span>View Calling Monitor</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 4: Records & Insurance */}
        <button
          id="btn-kiosk-records-update"
          onClick={onUpdateRecords}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-5 sm:p-6 rounded-2xl shadow-xs border transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
          style={{ borderColor: "#96D7C6" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
              >
                <FileCheck className="w-6 h-6" style={{ color: "#5AA7A7" }} />
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}
              >
                Card & Consent
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {content.recordsTitle}
            </h3>
            <p className="text-slate-600 text-xs">{content.recordsDesc}</p>
          </div>

          <div
            className="mt-4 flex items-center justify-between text-xs font-bold"
            style={{ color: "#6C8CBF" }}
          >
            <span>Update Information</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Demo Quick-Select Bar */}
      <div
        className="rounded-xl p-4 sm:p-5 mb-8 border"
        style={{
          backgroundColor: "#fbfbfe",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4" style={{ color: "#5AA7A7" }} />
          <span>{content.quickTryTitle}</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-demo-checkin-eleanor"
            onClick={() => onStartCheckIn("MK-101")}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs transition-all"
            style={{ borderColor: "#96D7C6" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#BAC94A" }}
            ></span>
            <span>{content.patient1}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{ backgroundColor: "#f0fdf9", color: "#5AA7A7" }}
            >
              Test Check-In
            </span>
          </button>

          <button
            id="btn-demo-checkin-marcus"
            onClick={() => onStartCheckIn("MK-102")}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs transition-all"
            style={{ borderColor: "#6C8CBF" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#BAC94A" }}
            ></span>
            <span>{content.patient2}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{ backgroundColor: "#eef2ff", color: "#6C8CBF" }}
            >
              Test Check-In
            </span>
          </button>
        </div>
      </div>

      {/* Security & HIPAA Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 pt-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "#5AA7A7" }} />
          <span>{content.hipaaBadge}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Kiosk #04</span>
          <span>•</span>
          <span>Assistance: Reception desk on right</span>
        </div>
      </div>
    </div>
  );
};
