import React from "react";
import { QueueItem } from "../types";
import {
  Bell,
  Clock,
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
    <div className="min-h-[calc(100vh-140px)] bg-slate-950 text-white p-4 sm:p-7 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(90, 167, 167, 0.15)",
                borderColor: "#5AA7A7",
                color: "#5AA7A7",
              }}
            >
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Waiting Room Calling Board
              </h1>
              <p className="text-xs text-slate-400">
                Watch for your ticket number.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 sm:mt-0">
            <button
              onClick={() => playClinicChime()}
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" style={{ color: "#5AA7A7" }} />
              <span>Chime</span>
            </button>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs border"
              style={{
                backgroundColor: "rgba(186, 201, 74, 0.15)",
                borderColor: "#BAC94A",
                color: "#BAC94A",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: "#BAC94A" }}
              ></span>
              <span>LIVE QUEUE</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* NOW CALLING */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: "#E2D36B" }}
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Now Calling</span>
            </div>

            {calledItems.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-400">
                  No Tickets Active
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Called tickets appear here with chime notification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {calledItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 rounded-2xl p-5 sm:p-6 animate-pulse"
                    style={{
                      backgroundColor: "rgba(226, 211, 107, 0.1)",
                      borderColor: "#E2D36B",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider block mb-0.5"
                          style={{ color: "#E2D36B" }}
                        >
                          Ticket Called:
                        </span>
                        <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                          {item.ticketNumber}
                        </div>
                        <div className="text-xs font-medium text-slate-300 mt-1">
                          Patient: {item.patientName.split(" ")[0]} {item.patientName.split(" ")[1]?.[0] || ""}.
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-right sm:min-w-[200px]">
                        <span className="text-[11px] text-slate-400 block mb-0.5">
                          Proceed to:
                        </span>
                        <div
                          className="text-xl sm:text-2xl font-black"
                          style={{ color: "#96D7C6" }}
                        >
                          {item.assignedRoom}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {item.doctorName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* In Consultation */}
            {inConsultItems.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  In Exam Rooms:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inConsultItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold" style={{ color: "#96D7C6" }}>
                        {item.ticketNumber}
                      </span>
                      <span className="text-slate-400">{item.assignedRoom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* UPCOMING QUEUE */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                Next in Queue
              </span>
              <span className="text-xs text-slate-500">
                {waitingItems.length} waiting
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 divide-y divide-slate-800">
              {waitingItems.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No additional patients waiting.
                </div>
              ) : (
                waitingItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div
                          className="font-mono text-base font-bold"
                          style={{ color: "#5AA7A7" }}
                        >
                          {item.ticketNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-300 block">
                        ~{item.estimatedWaitMinutes} min
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#5AA7A7" }} />
              <span>
                Need assistance? Please alert staff at the front desk.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 rounded font-bold text-[10px]"
            style={{ backgroundColor: "rgba(90, 167, 167, 0.2)", color: "#5AA7A7" }}
          >
            INFO
          </span>
          <span>Flu vaccines and booster shots available at desk today.</span>
        </div>
        <div className="font-mono text-slate-500 text-[10px]">
          Lobby Screen Feed
        </div>
      </div>
    </div>
  );
};
