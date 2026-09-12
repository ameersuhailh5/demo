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
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
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
      welcome: "Welcome to MetroHealth Clinic",
      subtitle: "Please select an option below on our self-service touch screen.",
      scheduledTitle: "Appointment Check-In",
      scheduledDesc: "Fast check-in with your QR code, phone number, or confirmation ID.",
      scheduledBadge: "Fastest • ~45 sec",
      walkinTitle: "Walk-In Registration",
      walkinDesc: "No appointment? Register quickly with AI symptom intake and join the line.",
      walkinBadge: "Express Intake",
      queueTitle: "Live Wait & Queue Status",
      queueDesc: "View currently called tickets and your estimated wait time.",
      recordsTitle: "Update Records & Insurance",
      recordsDesc: "Verify your insurance card, update pharmacy, or sign annual consent forms.",
      quickTryTitle: "Quick Demo Pre-filled Appointments:",
      patient1: "Eleanor Vance (Ref: MK-101, Internal Med)",
      patient2: "Marcus Rodriguez (Ref: MK-102, Pulmonology)",
      hipaaBadge: "HIPAA Compliant & Secure HL7 FHIR Encrypted",
    },
    es: {
      welcome: "Bienvenido a MetroHealth Clinic",
      subtitle: "Por favor seleccione una opción en nuestra pantalla táctil de autoservicio.",
      scheduledTitle: "Registrar Cita Programada",
      scheduledDesc: "Registro rápido con su código QR, teléfono o número de confirmación.",
      scheduledBadge: "Más rápido • ~45 seg",
      walkinTitle: "Registro de Paciente Sin Cita",
      walkinDesc: "¿No tiene cita? Regístrese rápidamente con evaluación de síntomas y pase a la fila.",
      walkinBadge: "Ingreso Exprés",
      queueTitle: "Estado de la Fila en Vivo",
      queueDesc: "Consulte los números llamados y su tiempo de espera aproximado.",
      recordsTitle: "Actualizar Seguro y Expediente",
      recordsDesc: "Verifique su tarjeta de seguro, farmacia o firme consentimientos anuales.",
      quickTryTitle: "Citas de prueba rápidas:",
      patient1: "Eleanor Vance (Ref: MK-101, Med. Interna)",
      patient2: "Marcus Rodriguez (Ref: MK-102, Neumología)",
      hipaaBadge: "Cumplimiento con HIPAA y Conexión Cifrada FHIR",
    },
    zh: {
      welcome: "欢迎来到美普健康诊所 (MetroHealth)",
      subtitle: "请在自助触摸屏上选择以下服务项目：",
      scheduledTitle: "预约患者快速签到",
      scheduledDesc: "使用二维码、电话号码或确认码快速完成到诊签到。",
      scheduledBadge: "极速 • 约45秒",
      walkinTitle: "非预约门诊现场登记",
      walkinDesc: "未提前预约？通过智能临床症状分诊完成登记并加入就诊排队。",
      walkinBadge: "快速分诊",
      queueTitle: "实时候诊排队状态",
      queueDesc: "查看正在叫号的诊室及预计等待时间。",
      recordsTitle: "医保卡与电子病历更新",
      recordsDesc: "扫描医保卡、核对个人信息或签署知情同意书。",
      quickTryTitle: "快捷体验已排期预约：",
      patient1: "Eleanor Vance (预约码: MK-101, 内科)",
      patient2: "Marcus Rodriguez (预约码: MK-102, 呼吸科)",
      hipaaBadge: "HIPAA医疗隐私保护及HL7 FHIR加密传输",
    },
  }[language];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Welcome Hero Card */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Automated Touchscreen Check-in System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {content.welcome}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          {content.subtitle}
        </p>

        {/* Live Clinic Stats Pill */}
        <div className="mt-4 inline-flex items-center gap-6 bg-white border border-slate-200/90 shadow-2xs rounded-full px-5 py-2 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>
              <strong>{waitingCount}</strong> patients waiting
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>
              Avg. wait: <strong>{averageWaitMinutes} mins</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2x2 Touch Kiosk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10">
        {/* Card 1: Check In */}
        <button
          id="btn-kiosk-scheduled-checkin"
          onClick={() => onStartCheckIn()}
          className="group text-left relative bg-gradient-to-br from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-sky-600/15 border border-sky-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs">
                {content.scheduledBadge}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {content.scheduledTitle}
            </h2>
            <p className="text-sky-100 text-sm leading-relaxed">
              {content.scheduledDesc}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm font-semibold pt-4 border-t border-white/15">
            <span>Touch to Begin Check-In</span>
            <div className="w-8 h-8 rounded-full bg-white text-sky-700 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card 2: Walk-In Registration */}
        <button
          id="btn-kiosk-walkin-registration"
          onClick={onStartWalkIn}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-6 sm:p-8 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <UserPlus className="w-8 h-8 text-teal-600" />
              </div>
              <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {content.walkinBadge}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {content.walkinTitle}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.walkinDesc}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm font-semibold pt-4 border-t border-slate-100 text-teal-700">
            <span>Start Registration</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card 3: Live Queue Tracker */}
        <button
          id="btn-kiosk-queue-tracker"
          onClick={onViewQueue}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-6 sm:p-8 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                Live Updates
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {content.queueTitle}
            </h3>
            <p className="text-slate-600 text-sm">{content.queueDesc}</p>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-medium text-indigo-600">
            <span>View Current Queue</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 4: Records & Insurance */}
        <button
          id="btn-kiosk-records-update"
          onClick={onUpdateRecords}
          className="group text-left relative bg-white hover:bg-slate-50 text-slate-900 p-6 sm:p-8 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <FileCheck className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2 py-0.5 rounded-md">
                Card & Consent
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {content.recordsTitle}
            </h3>
            <p className="text-slate-600 text-sm">{content.recordsDesc}</p>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-medium text-violet-600">
            <span>Update Information</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Quick Test Demo Bar for Easy Testing */}
      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-4 sm:p-5 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>{content.quickTryTitle}</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-demo-checkin-eleanor"
            onClick={() => onStartCheckIn("MK-101")}
            className="inline-flex items-center gap-2 bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-300 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-sky-700 shadow-2xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{content.patient1}</span>
            <span className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded text-[10px]">
              Tap to Test Check-In
            </span>
          </button>

          <button
            id="btn-demo-checkin-marcus"
            onClick={() => onStartCheckIn("MK-102")}
            className="inline-flex items-center gap-2 bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-300 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-sky-700 shadow-2xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{content.patient2}</span>
            <span className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded text-[10px]">
              Tap to Test Check-In
            </span>
          </button>
        </div>
      </div>

      {/* Trust & Security Footnote */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 pt-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>{content.hipaaBadge}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Station ID: KIOSK-04-A</span>
          <span>•</span>
          <span>Need assistance? Staff desk is directly to your right</span>
        </div>
      </div>
    </div>
  );
};
