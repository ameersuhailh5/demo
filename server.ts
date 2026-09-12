import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";
import dotenv from "dotenv";

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

// Proxy all /api/* requests directly to the Python backend
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediKiosk (Python + React) live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
