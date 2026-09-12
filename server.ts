import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PYTHON_PORT = 5001;

app.use(express.json({ limit: "10mb" }));

// Launch Python backend runtime
const pythonProcess = spawn("python3", ["server.py"], {
  env: { ...process.env, PYTHON_PORT: String(PYTHON_PORT) },
  stdio: "inherit",
});

pythonProcess.on("error", (err) => {
  console.error("Python process startup warning:", err.message);
});

// Initialize server-side Gemini client
const getGenAI = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health and Live API status endpoint
app.get("/api/live/status", (_req, res) => {
  res.json({
    status: "active",
    model: "gemini-3.1-flash-live-preview",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedModalities: ["AUDIO"],
    voiceName: "Zephyr",
    supportedLanguages: ["en", "ml", "hi"],
  });
});

// Proxy all /api/* requests directly to the Python backend (except live status)
app.all("/api/*", async (req, res) => {
  try {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}${req.originalUrl}`;
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": req.get("Content-Type") || "application/json",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    // Fallback if Python is warming up
    console.warn("Python backend connection note:", err?.message);
    return res.json({
      status: "fallback",
      service: "MediKiosk Python Service Bridge",
      timestamp: new Date().toISOString(),
    });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  // Setup WebSocket server for Gemini Live API audio streaming
  const wss = new WebSocketServer({ server: httpServer, path: "/live-voice" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Live API] Client connected to live voice stream");

    let liveSession: any = null;

    try {
      const ai = getGenAI();

      liveSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          systemInstruction:
            "You are an intelligent, empathetic, and professional multilingual medical clinic voice assistant at MediKiosk. " +
            "You help clinic patients and visitors with walk-in check-in, understanding symptoms, triage categorization, " +
            "waiting times, choosing between Allopathy and Ayurveda consultations, and general clinic questions. " +
            "You can converse fluently in English, Malayalam (മലയാളം), and Hindi (हिन्दी) based on the patient's language. " +
            "Keep responses conversational, warm, concise, and easy to hear over a kiosk loudspeaker. " +
            "Never give conclusive pharmaceutical prescriptions, but guide patients gently to the right doctor and provide reassurance.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              const modelTurn = message.serverContent?.modelTurn;
              if (modelTurn?.parts) {
                for (const part of modelTurn.parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(
                      JSON.stringify({
                        type: "audio",
                        audio: part.inlineData.data,
                      })
                    );
                  }
                  if (part.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: "transcript",
                        text: part.text,
                        sender: "model",
                      })
                    );
                  }
                }
              }

              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }

              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: "turn_complete" }));
              }
            } catch (err) {
              console.error("[Live API] Error forwarding server message:", err);
            }
          },
          onclose: () => {
            console.log("[Live API] Gemini session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "session_closed" }));
            }
          },
          onerror: (err) => {
            console.error("[Live API] Gemini session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err?.message || "Live API session encountered an error",
                })
              );
            }
          },
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "ready",
            model: "gemini-3.1-flash-live-preview",
            message: "Connected to Gemini Live Voice Assistant",
          })
        );
      }
    } catch (err: any) {
      console.error("[Live API] Connection initialization failed:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            error:
              err?.message ||
              "Could not initialize Gemini Live API session. Please verify API key configuration.",
          })
        );
      }
      return;
    }

    clientWs.on("message", (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        if (msg.type === "audio" && msg.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } else if (msg.type === "text" && msg.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        }
      } catch (err) {
        console.error("[Live API] Error handling client message:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("[Live API] Client disconnected");
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`MediKiosk (Live Voice + React) live on http://0.0.0.0:${PORT}`);
  });
}

startServer();

