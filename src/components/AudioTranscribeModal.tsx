import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  X,
  FileText,
  Radio,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Send,
} from "lucide-react";
import { Language } from "../types";

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApplyTranscript?: (transcript: string) => void;
  targetFieldLabel?: string;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyTranscript,
  targetFieldLabel = "Chief Complaint / Symptoms",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [visualizerLevels, setVisualizerLevels] = useState<number[]>(new Array(16).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingDuration(0);
      setTranscript("");
      setErrorMessage(null);
      setIsTranscribing(false);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      setTranscript("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });

      // Audio visualizer setup
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const updateLevels = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const newLevels = [];
          const step = Math.floor(dataArray.length / 16);
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            const normalized = Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
            newLevels.push(normalized);
          }
          setVisualizerLevels(newLevels);
          animFrameRef.current = requestAnimationFrame(updateLevels);
        };
        updateLevels();
      } catch (e) {
        console.warn("Visualizer fallback:", e);
      }

      // Check supported mime types
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }

        // Auto transcribe right after stopping recording
        await transcribeAudioBlob(blob);
      };

      recorder.start(250); // collect 250ms chunks
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMessage(
        err?.message || "Could not access microphone. Please allow microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Audio = await base64Promise;

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: blob.type || "audio/webm",
          language: language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setTranscript(data.transcript);
    } catch (err: any) {
      console.error("Transcription error:", err);
      setErrorMessage(err.message || "Error processing transcription with gemini-3.5-transcribe");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyTranscript && transcript) {
      onApplyTranscript(transcript);
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        style={{
          border: "2px solid #16C2C4",
        }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #105370 0%, #16C2C4 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: "rgba(255, 83, 83, 0.2)" }}
            >
              <Mic className="w-5 h-5" style={{ color: "#FF5353" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Audio Speech-to-Text
                </h3>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-slate-950 font-mono"
                  style={{ backgroundColor: "#FF5353" }}
                >
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Speak in English, Malayalam (മലയാളം), or Hindi (हिन्दी)
              </p>
            </div>
          </div>

          <button
            id="btn-close-audio-transcribe-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status & Visualizer Card */}
          <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden">
            {isRecording ? (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Recording Audio ({formatSeconds(recordingDuration)})
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center justify-center gap-1.5 h-14 px-4">
                  {visualizerLevels.map((height, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-75"
                      style={{
                        height: `${height}%`,
                        backgroundColor: i % 2 === 0 ? "#FF5353" : "#16C2C4",
                      }}
                    ></div>
                  ))}
                </div>

                <p className="text-xs text-slate-400">
                  Speak clearly into your microphone... Click Stop when done.
                </p>
              </div>
            ) : isTranscribing ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-teal-500/20 border-t-[#FF5353] animate-spin flex items-center justify-center"></div>
                  <Sparkles className="w-6 h-6 text-[#FF5353] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Transcribing with Gemini 3.5 Transcribe...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Converting audio to multilingual text with medical precision
                  </p>
                </div>
              </div>
            ) : transcript ? (
              <div className="w-full text-left space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1 text-[#FF5353] font-bold">
                    <Check className="w-3.5 h-3.5" /> Transcription Ready
                  </span>
                  {audioUrl && (
                    <div className="flex items-center gap-2">
                      <audio controls src={audioUrl} className="h-7 w-48 rounded" />
                    </div>
                  )}
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-sm text-slate-100 font-sans leading-relaxed select-text whitespace-pre-wrap">
                  {transcript}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white"
                  style={{ backgroundColor: "#105370" }}
                >
                  <Mic className="w-7 h-7" style={{ color: "#FF5353" }} />
                </div>
                <h4 className="text-sm font-bold text-white">Press Record to Start Speaking</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Describe symptoms, medical complaint, or clinic questions in your preferred language.
                </p>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 w-full text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isRecording ? (
              <button
                id="btn-stop-audio-recording"
                type="button"
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop & Transcribe</span>
              </button>
            ) : (
              <button
                id="btn-start-audio-recording"
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="px-6 py-3 rounded-2xl text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "#FF5353",
                  boxShadow: "0 4px 18px rgba(255, 83, 83, 0.4)",
                }}
              >
                <Mic className="w-4 h-4" />
                <span>{transcript ? "Record Again" : "Start Voice Recording"}</span>
              </button>
            )}

            {transcript && (
              <>
                <button
                  id="btn-copy-transcript"
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Text"}</span>
                </button>

                {onApplyTranscript && (
                  <button
                    id="btn-apply-transcript-to-field"
                    type="button"
                    onClick={handleApply}
                    className="px-5 py-3 rounded-2xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
                    style={{
                      backgroundColor: "#105370",
                      border: "1px solid #16C2C4",
                    }}
                  >
                    <span>Insert into {targetFieldLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "#FF5353" }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-[11px] text-slate-500 font-mono">
            Model: <strong className="text-slate-300">gemini-3.5-transcribe</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
