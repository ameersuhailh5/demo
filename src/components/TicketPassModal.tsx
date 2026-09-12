import React, { useEffect, useState } from "react";
import { QueueItem } from "../types";
import {
  QrCode,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Shield,
  ArrowRight,
  Share2,
} from "lucide-react";
import { playButtonTap } from "../utils/audio";

interface TicketPassModalProps {
  ticket: QueueItem;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  ticket,
  onClose,
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-600 to-teal-600 text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
            Check-In Confirmed
          </span>
          <h2 className="text-2xl font-black mt-0.5">MetroHealth Clinic</h2>
          <p className="text-xs text-sky-100 mt-1">
            Ambulatory & Urgent Care Center
          </p>

          <div className="absolute top-4 right-4 bg-black/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            Auto-reset: {secondsRemaining}s
          </div>
        </div>

        {/* Ticket Body with perforated visual dividers */}
        <div className="p-6 space-y-5">
          {/* Main Ticket Callout */}
          <div className="text-center py-3 bg-slate-50 border-2 border-dashed border-sky-300 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Your Queue Ticket Number
            </span>
            <span className="text-5xl font-black text-sky-700 tracking-tight font-mono block my-1">
              {ticket.ticketNumber}
            </span>
            <span className="text-xs font-medium text-slate-600">
              Estimated Wait:{" "}
              <strong className="text-slate-900">
                ~{ticket.estimatedWaitMinutes} minutes
              </strong>
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs text-slate-700 border-t border-b border-slate-100 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Name:</span>
              <span className="font-bold text-slate-900">{ticket.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Medical Record (MRN):</span>
              <span className="font-mono text-slate-800">{ticket.mrn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Provider:</span>
              <span className="font-medium text-slate-900">{ticket.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department / Room:</span>
              <span className="font-bold text-sky-700">{ticket.assignedRoom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intake Timestamp:</span>
              <span className="text-slate-700">{ticket.checkInTime}</span>
            </div>
          </div>

          {/* QR Code and Instructions */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-0.5">
                Scan on Mobile for Live Updates
              </p>
              <p className="text-[11px] leading-tight text-slate-500">
                Please take a seat in Waiting Zone A. Watch the monitor screens for your ticket number.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              id="btn-print-ticket-pass"
              onClick={handlePrint}
              className="flex-1 py-3 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Paper Slip</span>
            </button>
            <button
              id="btn-finish-kiosk-session"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>Finish & Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
