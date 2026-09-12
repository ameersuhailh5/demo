import React, { useEffect, useState } from "react";
import { QueueItem } from "../types";
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
            Check-In Confirmed
          </span>
          <h2 className="text-xl font-black mt-0.5">Clinic Queue Ticket</h2>

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
              Ticket Number
            </span>
            <span
              className="text-4xl font-black tracking-tight font-mono block my-0.5"
              style={{ color: "#5AA7A7" }}
            >
              {ticket.ticketNumber}
            </span>
            <span className="text-[11px] text-slate-600">
              Est. Wait:{" "}
              <strong className="text-slate-900">
                ~{ticket.estimatedWaitMinutes} min
              </strong>
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 border-t border-b border-slate-100 py-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{ticket.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MRN:</span>
              <span className="font-mono text-slate-800">{ticket.mrn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Provider:</span>
              <span className="font-medium text-slate-900">{ticket.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room:</span>
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
                Lobby Calling Display
              </p>
              <p className="text-[11px] text-slate-500">
                Please take a seat. Your number will appear on the lobby monitor.
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
              <span>Print</span>
            </button>
            <button
              id="btn-finish-kiosk-session"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              style={{ backgroundColor: "#5AA7A7" }}
            >
              <span>Done</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
