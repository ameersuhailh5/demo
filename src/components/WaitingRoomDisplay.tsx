import React from "react";
import { QueueItem } from "../types";
import {
  Tv,
  Bell,
  Clock,
  Building2,
  Volume2,
  HeartPulse,
  Info,
} from "lucide-react";
import { playClinicChime } from "../utils/audio";

interface WaitingRoomDisplayProps {
  queue: QueueItem[];
}

export const WaitingRoomDisplay: React.FC<WaitingRoomDisplayProps> = ({
  queue,
}) => {
  const calledItems = queue.filter((q) => q.status === "called");
  const waitingItems = queue.filter((q) => q.status === "waiting");
  const inConsultItems = queue.filter((q) => q.status === "in_consultation");

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between">
      {/* Top TV Screen Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                MetroHealth Clinic Waiting Room
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Live Patient Calling Board • Please watch for your ticket number
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 mt-3 sm:mt-0">
            <button
              onClick={() => playClinicChime()}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-sky-500 px-3 py-1.5 rounded-xl text-slate-300 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Test Chime</span>
            </button>
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-xl font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE QUEUE</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Now Calling on Left, Next Up on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* NOW CALLING / NOW SERVING (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-widest">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Now Calling (Proceed to Assigned Room)</span>
            </div>

            {calledItems.length === 0 ? (
              <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-400">
                  All Called Patients Currently Roomed
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Physicians are completing active consultations. Next ticket will appear here momentarily with a chime alert.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {calledItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-teal-500/20 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 animate-pulse"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                          Ticket Called Just Now:
                        </span>
                        <div className="text-6xl sm:text-7xl font-black font-mono text-white tracking-tight">
                          {item.ticketNumber}
                        </div>
                        <div className="text-sm font-medium text-slate-300 mt-1">
                          Patient: {item.patientName.split(" ")[0]} {item.patientName.split(" ")[1]?.[0] || ""}.
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-amber-400/50 rounded-2xl p-5 text-right sm:min-w-[240px]">
                        <span className="text-xs text-slate-400 block mb-1">
                          Please Proceed To:
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-amber-300">
                          {item.assignedRoom}
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-medium">
                          {item.doctorName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Currently In Exam Rooms */}
            {inConsultItems.length > 0 && (
              <div className="pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Currently in Consultation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {inConsultItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-teal-400">
                        {item.ticketNumber}
                      </span>
                      <span className="text-slate-400">{item.assignedRoom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NEXT IN LINE (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm font-bold uppercase tracking-wider">
                Upcoming in Queue
              </span>
              <span className="text-xs text-slate-500">
                {waitingItems.length} awaiting triage
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 divide-y divide-slate-800">
              {waitingItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No additional patients currently waiting.
                </div>
              ) : (
                waitingItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-mono text-xl font-bold text-sky-400">
                          {item.ticketNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-300 block">
                        ~{item.estimatedWaitMinutes} min
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Est. Wait
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Assistance banner */}
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                Need water, a wheelchair, or experiencing severe changes in condition? Please press the call button or visit the front desk nurse.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Clinic News Ticker */}
      <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold text-[10px]">
            ANNOUNCEMENT
          </span>
          <span>
            Complimentary seasonal flu vaccinations and COVID-19 boosters available today at Station 4.
          </span>
        </div>
        <div className="font-mono text-slate-500 text-[11px]">
          Lobby Monitor Feed #01 • Auto-Refreshing
        </div>
      </div>
    </div>
  );
};
