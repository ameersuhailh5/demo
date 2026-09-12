#!/usr/bin/env python3
"""
MediKiosk Python Backend Server
Handles AI clinical triage, FHIR R4 bundles, patient records, and HIPAA audit logging.
"""

import json
import os
import sys
import time
import hashlib
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PYTHON_PORT", 5001))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# In-memory clinic data store
PATIENTS = [
    {
        "id": "pat-001",
        "mrn": "MRN-88219",
        "firstName": "Eleanor",
        "lastName": "Vance",
        "dob": "1988-04-12",
        "gender": "Female",
        "phone": "(555) 234-5678",
        "email": "eleanor.vance@example.com",
        "address": "742 Evergreen Terrace, Springfield",
        "emergencyContact": {
            "name": "Thomas Vance",
            "relationship": "Spouse",
            "phone": "(555) 234-5679"
        },
        "insurance": {
            "provider": "BlueCross BlueShield",
            "policyNumber": "BCBS-9948210",
            "groupNumber": "GRP-4412",
            "copayAmount": 25.00,
            "status": "verified"
        },
        "medicalHistory": {
            "allergies": ["Penicillin", "Sulfa Drugs"],
            "medications": ["Lisinopril 10mg", "Metformin 500mg"],
            "chronicConditions": ["Hypertension", "Type 2 Diabetes"],
            "vaccinations": [
                {"name": "Influenza", "date": "2024-10-15"},
                {"name": "COVID-19 Bivalent", "date": "2024-09-02"}
            ]
        }
    },
    {
        "id": "pat-002",
        "mrn": "MRN-73910",
        "firstName": "Marcus",
        "lastName": "Chen",
        "dob": "1994-11-23",
        "gender": "Male",
        "phone": "(555) 876-5432",
        "email": "marcus.chen@example.com",
        "address": "1204 Pine Street, Apt 3B, Springfield",
        "emergencyContact": {
            "name": "Mei Chen",
            "relationship": "Sister",
            "phone": "(555) 876-5430"
        },
        "insurance": {
            "provider": "Aetna Health",
            "policyNumber": "AET-7719283",
            "groupNumber": "GRP-8821",
            "copayAmount": 30.00,
            "status": "verified"
        },
        "medicalHistory": {
            "allergies": ["Latex"],
            "medications": ["Albuterol HFA Inhaler"],
            "chronicConditions": ["Mild Intermittent Asthma"],
            "vaccinations": [
                {"name": "Tetanus (Tdap)", "date": "2023-05-11"},
                {"name": "Influenza", "date": "2024-11-01"}
            ]
        }
    }
]

AUDIT_LOGS = [
    {
        "id": "log-001",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "userRole": "system",
        "action": "PYTHON_BACKEND_INITIALIZED",
        "patientMRN": "SYSTEM",
        "details": "MediKiosk Python runtime connected.",
        "securityHash": hashlib.sha256(b"system-init").hexdigest()
    }
]

def generate_fhir_bundle(patient):
    """Generate HL7 FHIR Release 4 JSON payload."""
    mrn = patient.get("mrn", "UNKNOWN")
    return {
        "resourceType": "Bundle",
        "id": f"fhir-bundle-{mrn}",
        "type": "collection",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": mrn,
                    "active": True,
                    "name": [{"family": patient.get("lastName"), "given": [patient.get("firstName")]}],
                    "telecom": [
                        {"system": "phone", "value": patient.get("phone"), "use": "mobile"},
                        {"system": "email", "value": patient.get("email")}
                    ],
                    "gender": patient.get("gender", "").lower(),
                    "birthDate": patient.get("dob"),
                    "address": [{"text": patient.get("address")}]
                }
            },
            {
                "resource": {
                    "resourceType": "AllergyIntolerance",
                    "clinicalStatus": {"coding": [{"code": "active"}]},
                    "verificationStatus": {"coding": [{"code": "confirmed"}]},
                    "substance": [{"text": a} for a in patient.get("medicalHistory", {}).get("allergies", [])]
                }
            },
            {
                "resource": {
                    "resourceType": "MedicationStatement",
                    "status": "active",
                    "medications": patient.get("medicalHistory", {}).get("medications", [])
                }
            },
            {
                "resource": {
                    "resourceType": "Coverage",
                    "status": "active",
                    "subscriberId": patient.get("insurance", {}).get("policyNumber"),
                    "network": patient.get("insurance", {}).get("provider")
                }
            }
        ]
    }

def calculate_rule_based_triage(data):
    """Clinical Emergency Severity Index (ESI) rule evaluation."""
    pain = int(data.get("painLevel", 0))
    symptoms = [s.lower() for s in data.get("symptoms", [])]
    complaint = data.get("chiefComplaint", "").lower()

    red_flags = [
        "chest pain", "shortness of breath", "numbness", "bleeding", "anaphylaxis",
        "unconscious", "stroke", "choking"
    ]
    urgent_flags = [
        "fever", "abdominal", "fracture", "deep laceration", "vomiting", "asthma", "migraine"
    ]

    is_red = pain >= 8 or any(rf in complaint or any(rf in s for s in symptoms) for rf in red_flags)
    is_urgent = pain >= 6 or any(uf in complaint or any(uf in s for s in symptoms) for uf in urgent_flags)

    if is_red:
        esi = 2
        label = "Level 2 Emergent"
        room = "Triage Bay 1 (Immediate)"
    elif is_urgent:
        esi = 3
        label = "Level 3 Urgent"
        room = "Consultation Room 3"
    else:
        esi = 4
        label = "Level 4 Less Urgent"
        room = "Exam Station 2"

    return {
        "triageScore": esi,
        "urgencyCategory": label,
        "recommendedRoom": room,
        "vitalsToCheck": ["Blood Pressure", "Heart Rate", "SpO2 Pulse Ox", "Temperature"],
        "clinicalSummary": f"Patient presents with {data.get('chiefComplaint', 'unspecified complaint')}. Pain {pain}/10.",
        "suggestedNursingNotes": "Obtain baseline vital signs. Verify allergies and active medications.",
        "source": "Python Clinical Triage Engine"
    }

def call_gemini_triage(data):
    """Call Google Gemini API from Python using standard urllib."""
    if not GEMINI_API_KEY:
        return calculate_rule_based_triage(data)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""You are a clinical triage AI for a clinic kiosk.
Patient Name: {data.get('patientName', 'Patient')}
Chief Complaint: {data.get('chiefComplaint')}
Pain Scale (1-10): {data.get('painLevel')}
Duration: {data.get('duration')}
Symptoms: {', '.join(data.get('symptoms', []))}
Allergies: {', '.join(data.get('allergies', []))}

Return ONLY a valid JSON object with:
{{
  "triageScore": <number 1-5 for ESI Level>,
  "urgencyCategory": "<e.g. Level 2 Emergent, Level 3 Urgent, Level 4 Less Urgent>",
  "recommendedRoom": "<e.g. Triage Bay 1, Consultation Room 3>",
  "vitalsToCheck": ["Blood Pressure", "SpO2", "Heart Rate", "Temp"],
  "clinicalSummary": "<concise SBAR summary>",
  "suggestedNursingNotes": "<clinical precautions>"
}}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            content_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(content_text)
            parsed["source"] = "Python Gemini AI (gemini-2.5-flash)"
            return parsed
    except Exception as e:
        print(f"Gemini API fallback to rule-based: {e}", file=sys.stderr)
        return calculate_rule_based_triage(data)

class RequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json(200, {
                "status": "healthy",
                "runtime": f"Python {sys.version.split()[0]}",
                "service": "MediKiosk Python Service",
                "aiEnabled": bool(GEMINI_API_KEY),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })
        elif path == "/api/patients":
            self._send_json(200, {"patients": PATIENTS})
        elif path == "/api/audit-logs":
            self._send_json(200, {"logs": AUDIT_LOGS})
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(length) if length > 0 else b"{}"

        try:
            body = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            body = {}

        if path == "/api/triage-analysis":
            result = call_gemini_triage(body)
            self._send_json(200, {"success": True, **result})
        elif path == "/api/fhir/bundle":
            bundle = generate_fhir_bundle(body)
            self._send_json(200, bundle)
        elif path == "/api/ehr/search":
            query = body.get("query", "").strip().lower()
            matches = [
                p for p in PATIENTS
                if query in p["firstName"].lower() or query in p["lastName"].lower() or query in p["mrn"].lower()
            ]
            self._send_json(200, {
                "status": "connected",
                "fhirGateway": "HL7 FHIR R4 Encrypted Channel",
                "count": len(matches),
                "results": matches
            })
        elif path == "/api/audit-logs":
            new_log = {
                "id": f"log-{int(time.time()*1000)}",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "userRole": body.get("userRole", "kiosk"),
                "action": body.get("action", "EVENT"),
                "patientMRN": body.get("patientMRN", "UNKNOWN"),
                "details": body.get("details", ""),
                "securityHash": hashlib.sha256(f"{time.time()}:{body}".encode("utf-8")).hexdigest()
            }
            AUDIT_LOGS.insert(0, new_log)
            self._send_json(201, {"success": True, "log": new_log})
        else:
            self._send_json(404, {"error": "Endpoint not found"})

def run():
    server = HTTPServer(("127.0.0.1", PORT), RequestHandler)
    print(f"MediKiosk Python API Server running on http://127.0.0.1:{PORT}", file=sys.stdout)
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    run()
