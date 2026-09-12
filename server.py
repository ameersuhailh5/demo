#!/usr/bin/env python3
"""
MediKiosk Python Backend Server
Handles AI clinical triage, FHIR R4 bundles, patient records, doctor allocations, and HIPAA audit logging.
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

# In-memory doctors data store
DOCTORS = [
    {
        "id": "doc-1",
        "name": "Dr. Sarah Jenkins, MD",
        "title": "Lead Attending Physician",
        "specialty": "Internal Medicine & Urgent Care",
        "department": "Urgent Care",
        "room": "Triage Bay 1",
        "available": True,
        "phone": "(555) 019-2831",
        "email": "s.jenkins@clinic.org"
    },
    {
        "id": "doc-2",
        "name": "Dr. Gregory House, MD",
        "title": "Senior Diagnostician",
        "specialty": "Pulmonology & Diagnostics",
        "department": "Pulmonology",
        "room": "Suite 1B",
        "available": True,
        "phone": "(555) 019-2832",
        "email": "g.house@clinic.org"
    },
    {
        "id": "doc-3",
        "name": "Dr. Alisha Patel, DO",
        "title": "Family Physician",
        "specialty": "Endocrinology & Primary Care",
        "department": "Family Practice",
        "room": "Room 4A",
        "available": True,
        "phone": "(555) 019-2833",
        "email": "a.patel@clinic.org"
    },
    {
        "id": "doc-4",
        "name": "Dr. Robert Vance, MD",
        "title": "Cardiologist",
        "specialty": "Cardiology & Vascular Health",
        "department": "Cardiology",
        "room": "Room 2C",
        "available": True,
        "phone": "(555) 019-2834",
        "email": "r.vance@clinic.org"
    },
    {
        "id": "doc-5",
        "name": "Dr. Elena Rostova, MD",
        "title": "Pediatric & General Specialist",
        "specialty": "General Practice & Pediatrics",
        "department": "Pediatrics",
        "room": "Room 5B",
        "available": True,
        "phone": "(555) 019-2835",
        "email": "e.rostova@clinic.org"
    }
]

# In-memory clinic patient data store
PATIENTS = [
    {
        "id": "pat-1",
        "mrn": "MRN-89421",
        "firstName": "Eleanor",
        "lastName": "Vance",
        "dob": "1984-06-14",
        "gender": "female",
        "phone": "(555) 234-5678",
        "email": "eleanor.vance@example.com",
        "address": "428 Oakwood Blvd, Suite 4B, Springfield",
        "emergencyContact": {
            "name": "Thomas Vance",
            "relationship": "Spouse",
            "phone": "(555) 891-2345"
        },
        "insurance": {
            "provider": "BlueCross BlueShield Health Advantage",
            "policyNumber": "BC-9082341",
            "groupNumber": "GRP-44021",
            "copayAmount": 25.0,
            "status": "verified"
        },
        "medicalHistory": {
            "allergies": ["Penicillin", "Latex"],
            "medications": ["Levothyroxine 50mcg", "Lisinopril 10mg"],
            "chronicConditions": ["Mild Hypertension", "Hypothyroidism"],
            "bloodType": "A+",
            "vaccinations": [
                {"name": "COVID-19 Bivalent Booster", "date": "2024-10-12"},
                {"name": "Influenza Quadrivalent", "date": "2024-11-05"}
            ]
        }
    },
    {
        "id": "pat-2",
        "mrn": "MRN-77319",
        "firstName": "Marcus",
        "lastName": "Rodriguez",
        "dob": "1992-11-28",
        "gender": "male",
        "phone": "(555) 345-6789",
        "email": "m.rodriguez@example.com",
        "address": "159 Cypress Ave, Apt 12, Riverdale",
        "emergencyContact": {
            "name": "Sofia Rodriguez",
            "relationship": "Sister",
            "phone": "(555) 902-3344"
        },
        "insurance": {
            "provider": "Aetna Choice POS II",
            "policyNumber": "AET-7890123",
            "groupNumber": "GRP-88120",
            "copayAmount": 30.0,
            "status": "verified"
        },
        "medicalHistory": {
            "allergies": ["Sulfa Drugs"],
            "medications": ["Albuterol Inhaler PRN"],
            "chronicConditions": ["Exercise-induced Asthma"],
            "bloodType": "O-",
            "vaccinations": [
                {"name": "COVID-19 Bivalent Booster", "date": "2024-09-20"}
            ]
        }
    },
    {
        "id": "pat-3",
        "mrn": "MRN-66102",
        "firstName": "Devon",
        "lastName": "Chen",
        "dob": "1975-03-09",
        "gender": "male",
        "phone": "(555) 456-7890",
        "email": "devon.chen@example.com",
        "address": "882 Magnolia Way, Highgrove",
        "emergencyContact": {
            "name": "Mei Chen",
            "relationship": "Spouse",
            "phone": "(555) 345-9988"
        },
        "insurance": {
            "provider": "UnitedHealthcare Premier PPO",
            "policyNumber": "UHC-554410",
            "groupNumber": "GRP-12903",
            "copayAmount": 20.0,
            "status": "verified"
        },
        "medicalHistory": {
            "allergies": ["No Known Drug Allergies (NKDA)"],
            "medications": ["Metformin 500mg", "Atorvastatin 20mg"],
            "chronicConditions": ["Type 2 Diabetes", "Hyperlipidemia"],
            "bloodType": "B+",
            "vaccinations": [
                {"name": "Influenza Quadrivalent", "date": "2024-10-01"}
            ]
        }
    }
]

# Patient queue state in backend
QUEUE_ITEMS = [
    {
        "id": "q-1",
        "ticketNumber": "A-101",
        "patientName": "Devon Chen",
        "mrn": "MRN-66102",
        "checkInTime": "09:12 AM",
        "doctorId": "doc-3",
        "doctorName": "Dr. Alisha Patel, DO",
        "department": "Family Practice",
        "assignedRoom": "Room 4A",
        "status": "waiting",
        "esiScore": 4,
        "chiefComplaint": "Routine A1c diabetic lab review and refill",
        "painLevel": 0
    },
    {
        "id": "q-2",
        "ticketNumber": "W-201",
        "patientName": "Rachel Kim",
        "mrn": "MRN-50912",
        "checkInTime": "09:18 AM",
        "doctorId": "doc-1",
        "doctorName": "Dr. Sarah Jenkins, MD",
        "department": "Urgent Care",
        "assignedRoom": "Triage Bay 2",
        "status": "called",
        "esiScore": 3,
        "chiefComplaint": "Severe migraine with photophobia and nausea for 6 hours",
        "painLevel": 7
    }
]

AUDIT_LOGS = [
    {
        "id": "log-001",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "userRole": "system",
        "action": "PYTHON_BACKEND_INITIALIZED",
        "patientMRN": "SYSTEM",
        "details": "MediKiosk Management Python runtime connected.",
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
        room = "Triage Bay 1"
        dept = "Urgent Care"
        doc = DOCTORS[0]
    elif is_urgent:
        esi = 3
        label = "Level 3 Urgent"
        room = "Consultation Room 3"
        dept = "Internal Medicine"
        doc = DOCTORS[0]
    else:
        esi = 4
        label = "Level 4 Less Urgent"
        room = "Exam Station 2"
        dept = "Family Practice"
        doc = DOCTORS[2]

    return {
        "triageScore": esi,
        "urgencyCategory": label,
        "recommendedRoom": room,
        "recommendedDepartment": dept,
        "recommendedDoctor": doc["name"],
        "recommendedDoctorId": doc["id"],
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

Doctors Available:
- Dr. Sarah Jenkins, MD (Urgent Care, Triage Bay 1)
- Dr. Gregory House, MD (Pulmonology, Suite 1B)
- Dr. Alisha Patel, DO (Family Practice, Room 4A)
- Dr. Robert Vance, MD (Cardiology, Room 2C)
- Dr. Elena Rostova, MD (Pediatrics, Room 5B)

Return ONLY a valid JSON object with:
{{
  "triageScore": <number 1-5 for ESI Level>,
  "urgencyCategory": "<e.g. Level 2 Emergent, Level 3 Urgent, Level 4 Routine>",
  "recommendedRoom": "<room name>",
  "recommendedDepartment": "<department name>",
  "recommendedDoctor": "<one of the doctor names above>",
  "recommendedDoctorId": "<doc-1 to doc-5>",
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
                "service": "MediKiosk Python Management Service",
                "aiEnabled": bool(GEMINI_API_KEY),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })
        elif path == "/api/doctors":
            # calculate active patient counts
            doc_counts = {}
            for q in QUEUE_ITEMS:
                d_id = q.get("doctorId")
                if d_id:
                    doc_counts[d_id] = doc_counts.get(d_id, 0) + 1
            doctors_with_counts = []
            for d in DOCTORS:
                doctors_with_counts.append({
                    **d,
                    "activePatientCount": doc_counts.get(d["id"], 0)
                })
            self._send_json(200, {"doctors": doctors_with_counts})
        elif path == "/api/patients":
            self._send_json(200, {"patients": PATIENTS})
        elif path == "/api/audit-logs":
            self._send_json(200, {"logs": AUDIT_LOGS})
        elif path == "/api/doctor-matrix":
            # Return patient list grouped by doctor
            matrix = {}
            for d in DOCTORS:
                assigned = [q for q in QUEUE_ITEMS if q.get("doctorId") == d["id"] or q.get("doctorName") == d["name"]]
                matrix[d["id"]] = {
                    "doctor": d,
                    "patientCount": len(assigned),
                    "patients": assigned
                }
            self._send_json(200, {"matrix": matrix})
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
        elif path == "/api/assign-doctor":
            # Admin assigns or re-assigns patient to doctor
            queue_id = body.get("queueId")
            ticket_number = body.get("ticketNumber")
            doctor_id = body.get("doctorId")
            room = body.get("room")
            department = body.get("department")

            target_doc = next((d for d in DOCTORS if d["id"] == doctor_id), None)
            doc_name = target_doc["name"] if target_doc else body.get("doctorName", "Assigned Doctor")
            doc_room = room or (target_doc["room"] if target_doc else "Room 1")
            doc_dept = department or (target_doc["department"] if target_doc else "General Clinic")

            updated_item = None
            for q in QUEUE_ITEMS:
                if (queue_id and q.get("id") == queue_id) or (ticket_number and q.get("ticketNumber") == ticket_number):
                    q["doctorId"] = doctor_id
                    q["doctorName"] = doc_name
                    q["assignedRoom"] = doc_room
                    q["department"] = doc_dept
                    q["assignedBy"] = "admin"
                    updated_item = q
                    break

            # If not in queue, create or add
            if not updated_item and ticket_number:
                updated_item = {
                    "id": f"q-{int(time.time())}",
                    "ticketNumber": ticket_number,
                    "patientName": body.get("patientName", "Patient"),
                    "mrn": body.get("mrn", "MRN-TEMP"),
                    "doctorId": doctor_id,
                    "doctorName": doc_name,
                    "assignedRoom": doc_room,
                    "department": doc_dept,
                    "status": "waiting",
                    "checkInTime": time.strftime("%I:%M %p")
                }
                QUEUE_ITEMS.append(updated_item)

            # Audit trail
            new_log = {
                "id": f"log-{int(time.time()*1000)}",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "userRole": "admin",
                "action": "DOCTOR_ASSIGNED_BY_ADMIN",
                "patientMRN": body.get("mrn", updated_item.get("mrn", "UNKNOWN") if updated_item else "UNKNOWN"),
                "details": f"Admin assigned {doc_name} ({doc_dept} - {doc_room}) to patient {body.get('patientName', '')} (Ticket #{ticket_number}).",
                "securityHash": hashlib.sha256(f"{time.time()}:admin-assign".encode("utf-8")).hexdigest()
            }
            AUDIT_LOGS.insert(0, new_log)

            self._send_json(200, {
                "success": True,
                "assigned": updated_item,
                "doctor": target_doc
            })
        elif path == "/api/doctors":
            # Add or update doctor profile
            doc_id = body.get("id") or f"doc-{len(DOCTORS)+1}"
            existing = next((d for d in DOCTORS if d["id"] == doc_id), None)
            if existing:
                existing.update(body)
                target = existing
            else:
                new_doc = {
                    "id": doc_id,
                    "name": body.get("name", "New Doctor"),
                    "title": body.get("title", "Physician"),
                    "specialty": body.get("specialty", "General Medicine"),
                    "department": body.get("department", "General Practice"),
                    "room": body.get("room", "Exam Room 1"),
                    "available": body.get("available", True),
                    "phone": body.get("phone", ""),
                    "email": body.get("email", "")
                }
                DOCTORS.append(new_doc)
                target = new_doc
            self._send_json(200, {"success": True, "doctor": target})
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
    print(f"MediKiosk Python Management API Server running on http://127.0.0.1:{PORT}", file=sys.stdout)
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    run()
