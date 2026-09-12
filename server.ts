import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client lazily if key is available
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "MediKiosk Server",
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Clinical Triage & Symptom Analysis Endpoint
app.post("/api/triage-analysis", async (req, res) => {
  try {
    const {
      patientName,
      age,
      chiefComplaint,
      painLevel,
      duration,
      symptoms = [],
      existingConditions = [],
      allergies = [],
    } = req.body;

    const ai = getGenAIClient();

    if (!ai) {
      // Fallback rule-based triage score if API key is not yet set
      const isRedFlag =
        painLevel >= 8 ||
        symptoms.some((s: string) =>
          [
            "Chest pain or pressure",
            "Severe shortness of breath",
            "Sudden numbness or speech difficulty",
            "Severe uncontrolled bleeding",
            "Anaphylaxis / Throat swelling",
          ].includes(s)
        );

      const isUrgent =
        painLevel >= 6 ||
        symptoms.some((s: string) =>
          [
            "High fever (>102°F)",
            "Acute abdominal pain",
            "Deep laceration",
            "Persistent vomiting / Dehydration",
          ].includes(s)
        );

      const esiLevel = isRedFlag ? 2 : isUrgent ? 3 : 4;
      const priorityLabel =
        esiLevel === 2
          ? "High Urgency (ESI Level 2)"
          : esiLevel === 3
          ? "Moderate Urgency (ESI Level 3)"
          : "Standard / Non-Urgent (ESI Level 4)";

      return res.json({
        success: true,
        triageScore: esiLevel,
        urgencyCategory: priorityLabel,
        recommendedRoom: isRedFlag ? "Triage Bay 1 (Immediate)" : "Consultation Room 3",
        vitalsToCheck: [
          "Blood Pressure",
          "Pulse Oximetry (SpO2)",
          "Heart Rate",
          "Body Temperature",
        ],
        clinicalSummary: `Patient presents with ${chiefComplaint || "general health concern"}. Pain reported at ${painLevel}/10 for ${duration || "current episode"}. Identified symptoms: ${symptoms.join(", ") || "None recorded"}. Allergies noted: ${allergies.join(", ") || "No known drug allergies (NKDA)"}.`,
        suggestedNursingNotes: `Prioritize rapid triage vitals and screen for red flags. Verify medication reconciliation and past reactions to ${allergies.join(", ") || "none"}.`,
        source: "Clinical Triage Protocol Engine",
      });
    }

    const prompt = `You are a clinical decision support system for an ambulatory clinic self-check-in kiosk.
Analyze the following patient intake data and output a structured triage evaluation.

Patient Info:
- Name: ${patientName || "Anonymous"}
- Age: ${age || "Adult"}
- Chief Complaint: ${chiefComplaint}
- Pain Scale (1-10): ${painLevel}
- Duration: ${duration}
- Associated Symptoms: ${symptoms.join(", ")}
- Known Conditions: ${existingConditions.join(", ")}
- Known Allergies: ${allergies.join(", ")}

Evaluate the Emergency Severity Index (ESI Level from 1 to 5):
- Level 1: Resuscitation (immediate life-saving intervention required)
- Level 2: Emergent (high risk, confused/lethargic, severe pain/distress)
- Level 3: Urgent (stable, needs 2+ resources)
- Level 4: Less Urgent (stable, needs 1 resource)
- Level 5: Non-Urgent (stable, needs no resources, routine)

Return realistic, helpful clinical triage guidance for the intake nurse.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageScore: {
              type: Type.INTEGER,
              description: "ESI Level from 1 to 5",
            },
            urgencyCategory: {
              type: Type.STRING,
              description: "e.g., Level 2 Emergent, Level 3 Urgent, Level 4 Less Urgent",
            },
            recommendedRoom: {
              type: Type.STRING,
              description: "Recommended clinic station or room name",
            },
            vitalsToCheck: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key nursing vitals to obtain immediately",
            },
            clinicalSummary: {
              type: Type.STRING,
              description: "Concise clinical SBAR intake summary for attending physician",
            },
            suggestedNursingNotes: {
              type: Type.STRING,
              description: "Actionable nursing intake notes and clinical safeguards",
            },
          },
          required: [
            "triageScore",
            "urgencyCategory",
            "recommendedRoom",
            "vitalsToCheck",
            "clinicalSummary",
            "suggestedNursingNotes",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      ...parsedData,
      source: "Gemini 3.8 Flash Clinical AI",
    });
  } catch (error: any) {
    console.error("Triage analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to complete AI triage analysis",
    });
  }
});

// Secure EHR / Medical Record Integration Mock Gateway
// Simulates an authenticated FHIR R4 bridge connecting to hospital EHR (Epic / Cerner / Athena)
app.post("/api/ehr/search", (req, res) => {
  const { query, dob } = req.body;
  // Normalized lookup
  const cleanQuery = (query || "").trim().toLowerCase();
  
  res.json({
    status: "connected",
    fhirGateway: "HL7 FHIR R4 Encrypted Channel (TLS 1.3)",
    institution: "MetroHealth Integrated Clinical Network",
  });
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`MediKiosk Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
