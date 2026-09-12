import React, { useState, useEffect, useRef } from "react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  RotateCcw,
  Activity,
  MessageSquare,
  ShieldCheck,
  Send,
  Radio,
  Zap,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  onStartWalkIn?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "model" | "system";
  text: string;
  timestamp: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  onStartWalkIn,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to connect");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Context & WebSocket references
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);
  const isSpeakerMutedRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentModelTurnTextRef = useRef<string>("");

  isMutedRef.current = isMuted;
  isSpeakerMutedRef.current = isSpeakerMuted;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Auto-scroll chat transcripts
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSpeaking]);

  // Connect to Live API on open
  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      stopLiveSession();
    }
    return () => {
      stopLiveSession();
    };
  }, [isOpen]);

  // Convert Float32Array to 16-bit PCM Little Endian base64
  const floatTo16BitPCMBase64 = (input: Float32Array): string => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert Base64 16-bit PCM to Float32Array for Web Audio playback
  const base64ToFloat32 = (base64: string): Float32Array => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  };

  // Play audio chunk through 24kHz AudioContext with precise timeline scheduling
  const queueAudioChunk = (base64Data: string) => {
    if (isSpeakerMutedRef.current) return;

    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const float32Data = base64ToFloat32(base64Data);
      const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05; // 50ms buffer for jitter
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  // Stop currently playing audio on interruption
  const stopAudioPlayback = () => {
    try {
      activeSourcesRef.current.forEach((src) => {
        try {
          src.stop();
        } catch {}
      });
      activeSourcesRef.current = [];
      if (outputAudioCtxRef.current) {
        nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
      }
      setIsSpeaking(false);
    } catch (err) {
      console.error("Error interrupting audio:", err);
    }
  };

  const startLiveSession = async () => {
    setIsConnecting(true);
    setStatusMessage("Connecting to Gemini 3.1 Live API...");
    stopAudioPlayback();

    try {
      // 1. Initialize Microphone Capture (16kHz preferred)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      const sourceNode = inputAudioCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      sourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioCtx.destination);

      scriptProcessor.onaudioprocess = (e) => {
        if (isMutedRef.current) {
          setAudioLevel(0);
          return;
        }

        const inputChannel = e.inputBuffer.getChannelData(0);
        // Calculate audio visualizer level
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += Math.abs(inputChannel[i]);
        }
        const avg = sum / inputChannel.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));
        setIsListening(avg > 0.015);

        // Send audio chunk to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64PCM = floatTo16BitPCMBase64(inputChannel);
          wsRef.current.send(
            JSON.stringify({
              type: "audio",
              audio: base64PCM,
            })
          );
        }
      };

      // 2. Initialize WebSocket to Server's Gemini Live Endpoint
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live-voice`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Client] WebSocket connected to /live-voice");
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage("Live • Speak naturally in English, മലയാളം, or हिन्दी");

        // Greet user in their selected language
        const initialGreeting =
          language === "ml"
            ? "നമസ്കാരം! മെഡികിളീനിക്കിലേക്ക് സ്വാഗതം. ഞാൻ എങ്ങനെയാണ് നിങ്ങളെ സഹായിക്കേണ്ടത്?"
            : language === "hi"
            ? "नमस्ते! मेडीकिओस्क में आपका स्वागत है। मैं आपकी क्या मदद कर सकता हूँ?"
            : "Hello! Welcome to MediKiosk. How can I help you with your clinic visit today?";

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "model",
            text: initialGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ready") {
            setIsConnected(true);
            setIsConnecting(false);
            setStatusMessage("Gemini 3.1 Live API Ready");
          } else if (data.type === "audio" && data.audio) {
            queueAudioChunk(data.audio);
          } else if (data.type === "transcript" && data.text) {
            currentModelTurnTextRef.current += data.text;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === data.sender) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.text },
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: `msg-${Date.now()}-${Math.random()}`,
                    sender: data.sender || "model",
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ];
              }
            });
          } else if (data.type === "interrupted") {
            stopAudioPlayback();
            currentModelTurnTextRef.current = "";
          } else if (data.type === "error") {
            console.error("[Live API] Error:", data.error);
            setStatusMessage(`Error: ${data.error}`);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Client] WebSocket error:", err);
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage("Connection error. Make sure GEMINI_API_KEY is configured.");
      };

      ws.onclose = () => {
        console.log("[Client] WebSocket closed");
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage("Session ended");
      };
    } catch (err: any) {
      console.error("Microphone or session error:", err);
      setIsConnecting(false);
      setIsConnected(false);
      setStatusMessage(
        err.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone permissions."
          : `Connection error: ${err.message || "Failed to initialize audio."}`
      );
    }
  };

  const stopLiveSession = () => {
    stopAudioPlayback();

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userText = textInput.trim();
    setTextInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    wsRef.current.send(
      JSON.stringify({
        type: "text",
        text: userText,
      })
    );
  };

  const handleQuickPrompt = (prompt: string) => {
    setTextInput(prompt);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: prompt,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      wsRef.current.send(
        JSON.stringify({
          type: "text",
          text: prompt,
        })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="live-voice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="live-voice-modal-container"
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              id="btn-voice-modal-header-back"
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer text-xs font-bold shadow-xs active:scale-95"
              title="Return to Kiosk"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>
                {language === "ml"
                  ? "തിരികെ (Back)"
                  : language === "hi"
                  ? "वापस (Back)"
                  : "Back"}
              </span>
            </button>

            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  MediKiosk Live Voice Assistant
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-700/50">
                  Gemini 3.1 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Radio className={`w-3 h-3 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
                <span>{statusMessage}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-voice-modal"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Stage */}
        <div className="px-6 py-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center border-b border-slate-800/80">
          {/* Animated Central Orb */}
          <div className="relative flex items-center justify-center w-28 h-28 my-2">
            {/* Outer Ripple Waveforms */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                isSpeaking
                  ? "bg-teal-500/20 scale-150 animate-ping opacity-60"
                  : isListening
                  ? "bg-amber-500/20 scale-125 animate-pulse opacity-50"
                  : "bg-slate-800/30 scale-100 opacity-20"
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full border-2 transition-all duration-200 ${
                isSpeaking
                  ? "border-teal-400 scale-110 shadow-[0_0_25px_rgba(45,212,191,0.5)]"
                  : isListening
                  ? "border-amber-400 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                  : "border-slate-700 scale-100"
              }`}
            />

            {/* Core Icon Button */}
            <button
              id="btn-voice-toggle-mic"
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isMuted
                  ? "bg-rose-950/80 border-2 border-rose-500 text-rose-300"
                  : isSpeaking
                  ? "bg-gradient-to-tr from-teal-600 to-emerald-500 text-slate-950 shadow-teal-500/30 scale-105"
                  : isListening
                  ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 scale-105"
                  : "bg-slate-800 border border-slate-700 text-teal-400 hover:bg-slate-700"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? (
                <MicOff className="w-8 h-8" />
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Voice State Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isMuted
                  ? "bg-rose-950/70 border-rose-700 text-rose-300"
                  : isSpeaking
                  ? "bg-teal-950/80 border-teal-600 text-teal-300 animate-pulse"
                  : isListening
                  ? "bg-amber-950/80 border-amber-600 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              {isMuted
                ? "Microphone Muted"
                : isSpeaking
                ? "Gemini Speaking (24kHz Live Audio)..."
                : isListening
                ? "Listening to Patient..."
                : isConnected
                ? "Listening • Speak anytime"
                : "Connecting..."}
            </span>
          </div>

          {/* Multilingual Guidance Pills */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/50">
              🇺🇸 English
            </span>
            <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/50 font-gayathri">
              🌴 മലയാളം
            </span>
            <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/50 font-baloo">
              🇮🇳 हिन्दी
            </span>
          </div>
        </div>

        {/* Conversation Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[260px] bg-slate-950/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                <span>{msg.sender === "user" ? "You (Patient)" : "MediKiosk Voice"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-xs font-medium"
                    : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/80"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Quick:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPrompt("What are the current clinic waiting times?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 cursor-pointer"
          >
            ⏱️ Wait Times
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("എനിക്ക് പനിയും കഠിനമായ തലവേദനയും ഉണ്ട് (Fever & Headache)")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] whitespace-nowrap border border-teal-800/60 font-gayathri cursor-pointer"
          >
            🌴 പനി / തലവേദന
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Should I consult Allopathy or Ayurveda for joint pain?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 cursor-pointer"
          >
            🌿 Allopathy vs Ayurveda
          </button>
        </div>

        {/* Input & Control Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex flex-col gap-3">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <input
              id="input-voice-text-query"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a question for Live API..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
            <button
              id="btn-send-voice-text"
              type="submit"
              disabled={!textInput.trim() || !isConnected}
              className="px-3.5 py-2 bg-teal-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              {/* Back to Kiosk Button */}
              <button
                id="btn-voice-modal-footer-back"
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer font-medium active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {language === "ml"
                    ? "തിരികെ (Back to Kiosk)"
                    : language === "hi"
                    ? "वापस (Back to Kiosk)"
                    : "Back to Kiosk"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {isSpeakerMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-teal-400" />
                )}
                <span className="hidden sm:inline">{isSpeakerMuted ? "Speaker Off" : "Speaker On (24kHz)"}</span>
              </button>

              <button
                type="button"
                onClick={startLiveSession}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-slate-400"
                title="Reconnect Live Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reconnect</span>
              </button>
            </div>

            {onStartWalkIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartWalkIn();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold hover:bg-teal-500 hover:text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>
                  {language === "ml"
                    ? "രജിസ്ട്രേഷനിലേക്ക് പോകുക"
                    : language === "hi"
                    ? "पंजीकरण जारी रखें"
                    : "Proceed to Walk-In Form"}
                </span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
