# MediKiosk Java Enterprise Backend

This directory contains the complete standalone Java enterprise backend for MediKiosk.

## Architecture
- **Package Structure**: `com.medikiosk`
  - **Models**:
    - `Doctor.java`: Physician records with multi-modality (Allopathy / Ayurveda) support.
    - `Patient.java`: Clinical EHR records with insurance, allergies, medications, and conditions.
    - `QueueItem.java`: Real-time queue tokens, ESI triage severity levels, room allocation, and status tracking.
  - **Services**:
    - `DoctorService.java`: Provider registry and active load balancing.
    - `PatientService.java`: FHIR R4 encrypted health record search and retrieval.
    - `QueueService.java`: Real-time queue management, doctor allocations, and matrix generation.
    - `TriageService.java`: Clinical Emergency Severity Index (ESI 1–5) rule evaluation engine.
  - **Server**:
    - `MediKioskServer.java`: Standard Java SE HTTP Server exposing REST API endpoints on port `5002` (configurable via `JAVA_PORT`).

## Endpoints Implemented
- `GET /api/health`: Microservice health check and runtime metrics.
- `GET /api/doctors`: Available doctors list with active patient load.
- `POST /api/doctors`: Add or update doctor profile.
- `GET /api/patients`: Clinic patient registry.
- `POST /api/triage-analysis`: Evaluates patient complaint, pain level, and care modality for triage scoring.
- `POST /api/assign-doctor`: Allocates a doctor and exam room to a patient ticket with audit logging.
- `GET /api/doctor-matrix`: Grouped patient distribution across active providers.
- `GET /api/audit-logs` & `POST /api/audit-logs`: Immutable SHA-256 audit trail.
- `POST /api/auth/login`: Administrator (`admin` / `admin123`) and Physician (`doc-1` / `doc123`) authentication.
- `POST /api/ehr/search`: FHIR R4 medical records search gateway.
- `POST /api/fhir/bundle`: Generates HL7 FHIR Release 4 JSON payload.

## Building & Running with Maven
```bash
mvn clean package
java -jar target/medikiosk-server-1.0.0.jar
```

## Running directly with `javac`:
```bash
cd src/main/java
javac com/medikiosk/*.java com/medikiosk/*/*.java
java com.medikiosk.MediKioskServer
```
