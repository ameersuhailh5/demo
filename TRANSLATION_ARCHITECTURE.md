# Multilingual Architecture & Translation Strategy Evaluation

This document outlines the **Current Implementation** and the **Proposed Dynamic Multilingual Architecture** for the Smart Clinic Kiosk application. It evaluates performance, medical accuracy, scalability, voice integration, and cost.

---

## 1. Current Architecture: Static i18n Dictionary Mapping

### How It Works
The current application uses a deterministic client-side dictionary pattern located in `/src/data/translations.ts`.

```typescript
// Example: Structured Dictionary Structure
export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en: { ... },
  ml: { ... },
  hi: { ... }
};

export const CLINIC_SYMPTOMS: SymptomItem[] = [
  {
    id: "chest_pain",
    category: "Cardiovascular",
    redFlag: true,
    translations: {
      en: "Chest Discomfort / Pressure",
      ml: "നെഞ്ചുവേദന / ഭാരം",
      hi: "सीने में दर्द / भारीपन",
    },
  },
  // ...
];
```

* **Storage**: In-memory TypeScript data structures bundled directly into the client application.
* **Execution Flow**: 
  1. Patient selects a language via the floating switcher (`en`, `ml`, `hi`).
  2. React updates the root state and persists the choice to `localStorage` (`clinic_kiosk_language`).
  3. All components re-render instantly by accessing `TRANSLATIONS[language]`.
  4. The root container switches typography styling dynamically (Creato Display for EN, Gayathri for ML, Baloo 2 for HI).

### Strengths & Limitations of Current Approach

| Aspect | Status | Analysis |
| :--- | :--- | :--- |
| **Switch Latency** | 🟢 **0 ms** | Instant UI updates with zero loading spinners or network round-trips. |
| **Offline Reliability** | 🟢 **100%** | Works seamlessly without internet connectivity. |
| **Cost** | 🟢 **$0.00** | Zero external API calls or server dependencies. |
| **Clinical Accuracy** | 🟢 **Guaranteed** | Curated by medical professionals, eliminating machine hallucination. |
| **Dynamic Content** | 🔴 **Rigid** | Cannot translate unstructured text, real-time doctor questions, or custom notes. |
| **Voice Interaction** | 🔴 **None** | Does not support real-time speech-to-text or voice responses. |

---

## 2. Proposed Architecture: 3-Tier Hybrid Dynamic Engine

To support **dynamic medical questionnaires**, **doctor-authored forms**, and **real-time voice input** without sacrificing speed or incurring costs, a **3-Tier Hybrid Architecture** is recommended.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: STATIC CORE UI                          │
│  • Buttons, Navigation, Triage Categories, Critical Red Flags          │
│  • Latency: 0ms | Cost: $0 | Source: Local TypeScript Dictionary       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  TIER 2: DYNAMIC AI TRANSLATION + CACHE                │
│  • Department Questions, Intake Forms, Doctor Custom Fields            │
│  • Engine: Gemini 2.5 Flash (AI Studio Free Tier)                     │
│  • Optimization: Multi-Tier Cache (IndexedDB + Memory)                │
│  • Latency: 0ms (Cached) / ~250ms (First run) | Cost: $0 Free Tier    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    TIER 3: MULTIMODAL VOICE ENGINE                     │
│  • Speech-to-Text: Native Web Speech API (`ml-IN`, `hi-IN`, `en-IN`)   │
│  • AI Clinical Parser: Extracts Symptoms & Urgency to Structured JSON  │
│  • Text-to-Speech: Native Browser SpeechSynthesis API                  │
│  • Latency: Real-time streaming | Cost: $0 Free                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Step-by-Step Implementation of the Proposed Strategy

### A. Dynamic Text & Doctor Questionnaire Translation
1. **Request**: Backend or doctor creates a new question in English:  
   *`"Have you experienced sudden swelling in your lower legs or ankles?"`*
2. **Translation Engine (Gemini 2.5 Flash)**:
   - System instruction enforces clinical precision and regional phrasing.
   - Generates Malayalam (*`"നിങ്ങളുടെ കാലുകളിലോ കണങ്കാലുകളിലോ പെട്ടെന്ന് നീർവീക്കം ഉണ്ടായിട്ടുണ്ടോ?"`*) and Hindi (*`"क्या आपके पैरों या टखनों में अचानक सूजन आई है?"`*).
3. **Local Cache Layer**:
   - The result is stored in `IndexedDB` / `localStorage` under key `q_hash_ml`.
   - **Result**: The first patient incurs ~250ms processing; all subsequent patients load the question in **0ms**.

### B. Voice Input & Clinical Parsing (Free & Native)
1. **Patient Speaks**: Uses the kiosk microphone with `webkitSpeechRecognition` set to `ml-IN` or `hi-IN`.
2. **Clinical Extraction**: The native transcript is sent to Gemini Flash:
   ```json
   {
     "raw_transcript": "എനിക്ക് രണ്ടു ദിവസമായിട്ട് കഠിനമായ വയറുവേദനയും ഛർദ്ദിയും ഉണ്ട്",
     "detected_language": "ml",
     "english_translation": "Patient reports severe abdominal pain and vomiting for the past 2 days.",
     "primary_symptoms": ["Acute Abdominal Pain", "Vomiting"],
     "duration": "2 days",
     "triage_urgency": "MODERATE_URGENT"
   }
   ```
3. **UI Sync**: Kiosk screen fills in the Malayalam fields, and the Doctor's Dashboard receives the structured medical summary in English.

---

## 3. Evaluation & Tradeoff Matrix

| Metric | Current Approach (Static Dictionary) | Proposed Approach (Hybrid + Gemini Flash) |
| :--- | :--- | :--- |
| **UI Switch Speed** | 0 ms (Instantaneous) | 0 ms for core UI & cached dynamic questions |
| **New Question Latency** | Requires code redeployment | ~250ms (first time only), 0ms thereafter |
| **Voice Input Support** | ❌ None | ✅ Real-time Malayalam & Hindi speech recognition |
| **Doctor EMR Integration** | ❌ Limited to fixed fields | ✅ Translates patient descriptions to medical English |
| **Infrastructure Cost** | **$0.00** | **$0.00** (Gemini Free Tier: 15 RPM / 1,500 RPD) |
| **Clinical Safety** | High (Pre-audited) | High (Prompt-bounded schema validation + fallback) |
| **Offline Capability** | 100% | 100% for Core UI & Cached Questions |

---

## 4. Recommendation & Roadmap

1. **Keep Tier 1 Static**: Retain the existing `translations.ts` dictionary for all core navigation, high-risk red-flag indicators, and primary triage options.
2. **Add Tier 2 Cache Service**: Implement a lightweight translation utility that checks local storage before invoking Gemini Flash for dynamic content.
3. **Add Tier 3 Voice Input**: Enable native browser Web Speech API for voice-assisted check-ins on touchscreen kiosks.
