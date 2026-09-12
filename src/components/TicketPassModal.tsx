import React, { useEffect, useState } from "react";
import { QueueItem, Language } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  QrCode,
  Printer,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { playButtonTap } from "../utils/audio";

interface TicketPassModalProps {
  ticket: QueueItem;
  onClose: () => void;
  language?: Language;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  ticket,
  onClose,
  language = "en",
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handlePrint = () => {
    playButtonTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div
          className="text-white p-5 text-center relative"
          style={{ backgroundColor: "#5AA7A7" }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1.5">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">
            {t.ticketPass.confirmed}
          </span>
          <h2 className="text-xl font-black mt-0.5">{t.ticketPass.title}</h2>

          <div className="absolute top-3 right-3 bg-black/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            {secondsRemaining}s
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-5 space-y-4 text-xs">
          <div
            className="text-center py-3 bg-slate-50 border-2 border-dashed rounded-xl"
            style={{ borderColor: "#96D7C6" }}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t.ticketPass.ticketNumber}
            </span>
            <span
              className="text-4xl font-black tracking-tight font-mono block my-0.5"
              style={{ color: "#5AA7A7" }}
            >
              {ticket.ticketNumber}
            </span>
            <span className="text-[11px] text-slate-600">
              {t.walkin.estimatedWait}:{" "}
              <strong className="text-slate-900">
                ~{ticket.estimatedWaitMinutes} {t.common.mins}
              </strong>
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 border-t border-b border-slate-100 py-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">{t.ticketPass.patient}:</span>
              <span className="font-bold text-slate-900">{ticket.patientName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t.ticketPass.treatmentModality}:</span>
              <span
                className="font-bold px-2 py-0.5 rounded-full text-[11px] border"
                style={{
                  backgroundColor: ticket.treatmentType === "ayurveda" ? "#ecfdf5" : "#f0fdf9",
                  color: ticket.treatmentType === "ayurveda" ? "#047857" : "#0f766e",
                  borderColor: ticket.treatmentType === "ayurveda" ? "#a7f3d0" : "#99f6e4",
                }}
              >
                {ticket.treatmentType === "ayurveda" ? "🌿 " + t.common.ayurveda : "💊 " + t.common.allopathy}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.ticketPass.doctor}:</span>
              <span className="font-medium text-slate-900">{ticket.assignedDoctor || ticket.doctorName || "Duty Physician"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.ticketPass.room}:</span>
              <span className="font-bold" style={{ color: "#5AA7A7" }}>
                {ticket.assignedRoom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="text-slate-700">{ticket.checkInTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800">
                {t.queue.title}
              </p>
              <p className="text-[11px] text-slate-500">
                {t.ticketPass.keepSafeNotice}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              id="btn-print-ticket-pass"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.ticketPass.printPass}</span>
            </button>
            <button
              id="btn-finish-kiosk-session"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              style={{ backgroundColor: "#5AA7A7" }}
            >
              <span>{t.ticketPass.done}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
