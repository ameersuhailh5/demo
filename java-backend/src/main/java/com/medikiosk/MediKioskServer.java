package com.medikiosk;

import com.medikiosk.model.*;
import com.medikiosk.service.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;

public class MediKioskServer {
    private static final int PORT = 5002;
    private static final List<Map<String, String>> auditLogs = new ArrayList<>();

    static {
        Map<String, String> initLog = new LinkedHashMap<>();
        initLog.put("id", "log-001");
        initLog.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        initLog.put("userRole", "system");
        initLog.put("action", "JAVA_BACKEND_INITIALIZED");
        initLog.put("patientMRN", "SYSTEM");
        initLog.put("details", "MediKiosk Management Java 17 SE Enterprise Microservice online.");
        initLog.put("securityHash", sha256("java-init"));
        auditLogs.add(initLog);
    }

    public static void main(String[] args) throws IOException {
        int port = PORT;
        String portEnv = System.getenv("JAVA_PORT");
        if (portEnv != null && !portEnv.isEmpty()) {
            try { port = Integer.parseInt(portEnv); } catch (Exception ignored) {}
        }

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/doctors", new DoctorsHandler());
        server.createContext("/api/patients", new PatientsHandler());
        server.createContext("/api/triage-analysis", new TriageHandler());
        server.createContext("/api/assign-doctor", new AssignDoctorHandler());
        server.createContext("/api/doctor-matrix", new DoctorMatrixHandler());
        server.createContext("/api/audit-logs", new AuditLogsHandler());
        server.createContext("/api/auth/login", new AuthLoginHandler());
        server.createContext("/api/ehr/search", new EhrSearchHandler());
        server.createContext("/api/fhir/bundle", new FhirBundleHandler());

        server.setExecutor(null);
        System.out.println("MediKiosk Java Backend Server running on port " + port);
        server.start();
    }

    private static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String resp = "{" +
                "\"status\":\"healthy\"," +
                "\"runtime\":\"Java " + System.getProperty("java.version") + " (" + System.getProperty("java.vendor") + ")\"," +
                "\"service\":\"MediKiosk Java 17 Enterprise Microservice\"," +
                "\"architecture\":\"Pure Java Standard SE Service & Models\"," +
                "\"timestamp\":\"" + new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()) + "\"" +
                "}";
            sendJson(exchange, 200, resp);
        }
    }

    private static class DoctorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<Doctor> docs = DoctorService.getAllDoctors();
                List<QueueItem> queue = QueueService.getAllQueueItems();
                Map<String, Integer> counts = new HashMap<>();
                for (QueueItem q : queue) {
                    if (q.getDoctorId() != null) {
                        counts.put(q.getDoctorId(), counts.getOrDefault(q.getDoctorId(), 0) + 1);
                    }
                }

                StringBuilder sb = new StringBuilder("{\"doctors\":[");
                for (int i = 0; i < docs.size(); i++) {
                    if (i > 0) sb.append(",");
                    Doctor d = docs.get(i);
                    d.setActivePatientCount(counts.getOrDefault(d.getId(), 0));
                    sb.append(d.toJson());
                }
                sb.append("]}");
                sendJson(exchange, 200, sb.toString());
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                String id = extractJsonString(body, "id");
                String name = extractJsonString(body, "name");
                String specialty = extractJsonString(body, "specialty");
                String department = extractJsonString(body, "department");
                String room = extractJsonString(body, "room");
                String treatmentType = extractJsonString(body, "treatmentType");

                Doctor doc = new Doctor(
                    id != null ? id : "doc-" + System.currentTimeMillis(),
                    name != null ? name : "Attending Physician",
                    "Physician",
                    specialty != null ? specialty : "General Medicine",
                    department != null ? department : "General Practice",
                    room != null ? room : "Room 1",
                    true, "(555) 019-9999", "doctor@clinic.org",
                    treatmentType != null ? treatmentType : "allopathy"
                );
                DoctorService.saveOrUpdate(doc);
                sendJson(exchange, 200, "{\"success\":true,\"doctor\":" + doc.toJson() + "}");
            }
        }
    }

    private static class PatientsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            List<Patient> patients = PatientService.getAllPatients();
            StringBuilder sb = new StringBuilder("{\"patients\":[");
            for (int i = 0; i < patients.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(patients.get(i).toJson());
            }
            sb.append("]}");
            sendJson(exchange, 200, sb.toString());
        }
    }

    private static class TriageHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String body = readBody(exchange);
            String complaint = extractJsonString(body, "chiefComplaint");
            String treatmentType = extractJsonString(body, "treatmentType");
            int pain = extractJsonInt(body, "painLevel", 0);

            Map<String, Object> result = TriageService.evaluate(complaint, pain, Collections.emptyList(), treatmentType);
            
            StringBuilder sb = new StringBuilder("{");
            sb.append("\"success\":true,");
            sb.append("\"triageScore\":").append(result.get("triageScore")).append(",");
            sb.append("\"urgencyCategory\":\"").append(escape((String)result.get("urgencyCategory"))).append("\",");
            sb.append("\"recommendedRoom\":\"").append(escape((String)result.get("recommendedRoom"))).append("\",");
            sb.append("\"recommendedDepartment\":\"").append(escape((String)result.get("recommendedDepartment"))).append("\",");
            sb.append("\"recommendedDoctor\":\"").append(escape((String)result.get("recommendedDoctor"))).append("\",");
            sb.append("\"recommendedDoctorId\":\"").append(escape((String)result.get("recommendedDoctorId"))).append("\",");
            sb.append("\"treatmentType\":\"").append(escape((String)result.get("treatmentType"))).append("\",");
            sb.append("\"clinicalSummary\":\"").append(escape((String)result.get("clinicalSummary"))).append("\",");
            sb.append("\"suggestedNursingNotes\":\"").append(escape((String)result.get("suggestedNursingNotes"))).append("\",");
            sb.append("\"source\":\"").append(escape((String)result.get("source"))).append("\"");
            sb.append("}");

            sendJson(exchange, 200, sb.toString());
        }
    }

    private static class AssignDoctorHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String body = readBody(exchange);
            String queueId = extractJsonString(body, "queueId");
            String ticketNumber = extractJsonString(body, "ticketNumber");
            String doctorId = extractJsonString(body, "doctorId");
            String room = extractJsonString(body, "room");
            String department = extractJsonString(body, "department");
            String patientName = extractJsonString(body, "patientName");
            String mrn = extractJsonString(body, "mrn");

            QueueItem item = QueueService.assignDoctor(queueId, ticketNumber, doctorId, room, department, patientName, mrn);
            Doctor doc = DoctorService.findById(doctorId);

            // Audit
            Map<String, String> log = new LinkedHashMap<>();
            log.put("id", "log-" + System.currentTimeMillis());
            log.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            log.put("userRole", "admin");
            log.put("action", "DOCTOR_ASSIGNED_BY_ADMIN_JAVA");
            log.put("patientMRN", mrn != null ? mrn : "WALKIN");
            log.put("details", "Java backend dispatched " + (doc != null ? doc.getName() : doctorId) + " to " + (patientName != null ? patientName : ticketNumber));
            log.put("securityHash", sha256(System.currentTimeMillis() + ":java-assign"));
            auditLogs.add(0, log);

            String resp = "{\"success\":true,\"assigned\":" + item.toJson() + (doc != null ? ",\"doctor\":" + doc.toJson() : "") + "}";
            sendJson(exchange, 200, resp);
        }
    }

    private static class DoctorMatrixHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            Map<String, Object> matrix = QueueService.getDoctorMatrix();
            StringBuilder sb = new StringBuilder("{\"matrix\":{");
            int idx = 0;
            for (Map.Entry<String, Object> e : matrix.entrySet()) {
                if (idx > 0) sb.append(",");
                sb.append("\"").append(e.getKey()).append("\":{");
                Map<String, Object> val = (Map<String, Object>) e.getValue();
                Doctor doc = (Doctor) val.get("doctor");
                int pCount = (int) val.get("patientCount");
                List<QueueItem> patients = (List<QueueItem>) val.get("patients");

                sb.append("\"doctor\":").append(doc.toJson()).append(",");
                sb.append("\"patientCount\":").append(pCount).append(",");
                sb.append("\"patients\":[");
                for (int pIdx = 0; pIdx < patients.size(); pIdx++) {
                    if (pIdx > 0) sb.append(",");
                    sb.append(patients.get(pIdx).toJson());
                }
                sb.append("]}");
                idx++;
            }
            sb.append("}}");
            sendJson(exchange, 200, sb.toString());
        }
    }

    private static class AuditLogsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> log = new LinkedHashMap<>();
                log.put("id", "log-" + System.currentTimeMillis());
                log.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                log.put("userRole", extractJsonString(body, "userRole") != null ? extractJsonString(body, "userRole") : "kiosk");
                log.put("action", extractJsonString(body, "action") != null ? extractJsonString(body, "action") : "EVENT");
                log.put("patientMRN", extractJsonString(body, "patientMRN") != null ? extractJsonString(body, "patientMRN") : "WALKIN");
                log.put("details", extractJsonString(body, "details") != null ? extractJsonString(body, "details") : "");
                log.put("securityHash", sha256(System.currentTimeMillis() + ":audit"));
                auditLogs.add(0, log);
                sendJson(exchange, 201, "{\"success\":true}");
                return;
            }

            StringBuilder sb = new StringBuilder("{\"logs\":[");
            for (int i = 0; i < auditLogs.size(); i++) {
                if (i > 0) sb.append(",");
                Map<String, String> l = auditLogs.get(i);
                sb.append("{")
                  .append("\"id\":\"").append(escape(l.get("id"))).append("\",")
                  .append("\"timestamp\":\"").append(escape(l.get("timestamp"))).append("\",")
                  .append("\"userRole\":\"").append(escape(l.get("userRole"))).append("\",")
                  .append("\"action\":\"").append(escape(l.get("action"))).append("\",")
                  .append("\"patientMRN\":\"").append(escape(l.get("patientMRN"))).append("\",")
                  .append("\"details\":\"").append(escape(l.get("details"))).append("\",")
                  .append("\"securityHash\":\"").append(escape(l.get("securityHash"))).append("\"")
                  .append("}");
            }
            sb.append("]}");
            sendJson(exchange, 200, sb.toString());
        }
    }

    private static class AuthLoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String body = readBody(exchange);
            String username = extractJsonString(body, "username");
            String password = extractJsonString(body, "password");
            String role = extractJsonString(body, "role");

            if (username == null) username = "";
            if (password == null) password = "";
            if (role == null) role = "";

            if ("admin".equalsIgnoreCase(role) || "admin".equalsIgnoreCase(username)) {
                if (Arrays.asList("admin123", "admin", "9999", "medikiosk").contains(password)) {
                    String token = sha256("admin-java-" + System.currentTimeMillis()).substring(0, 24);
                    String resp = "{\"success\":true,\"user\":{\"id\":\"admin-1\",\"username\":\"admin\",\"name\":\"Clinic Administrator (Java Backend)\",\"role\":\"admin\",\"title\":\"Hospital System Administrator\",\"token\":\"bearer_" + token + "\"}}";
                    sendJson(exchange, 200, resp);
                    return;
                } else {
                    sendJson(exchange, 401, "{\"success\":false,\"message\":\"Invalid administrator password. Default: admin123\"}");
                    return;
                }
            }

            if ("doctor".equalsIgnoreCase(role) || "doctor".equalsIgnoreCase(username) || username.startsWith("doc-")) {
                if (Arrays.asList("doc123", "doctor", "1234", "physician").contains(password)) {
                    Doctor doc = DoctorService.findById(username);
                    if (doc == null) doc = DoctorService.getAllDoctors().get(0);
                    String token = sha256("doc-java-" + System.currentTimeMillis()).substring(0, 24);
                    String resp = "{\"success\":true,\"user\":{\"id\":\"" + doc.getId() + "\",\"username\":\"" + doc.getId() + "\",\"name\":\"" + doc.getName() + "\",\"role\":\"doctor\",\"doctorId\":\"" + doc.getId() + "\",\"department\":\"" + doc.getDepartment() + "\",\"title\":\"" + doc.getTitle() + "\",\"token\":\"bearer_" + token + "\"}}";
                    sendJson(exchange, 200, resp);
                    return;
                } else {
                    sendJson(exchange, 401, "{\"success\":false,\"message\":\"Invalid physician password. Default: doc123\"}");
                    return;
                }
            }

            sendJson(exchange, 401, "{\"success\":false,\"message\":\"Unauthorized credentials.\"}");
        }
    }

    private static class EhrSearchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String body = readBody(exchange);
            String query = extractJsonString(body, "query");
            List<Patient> matches = PatientService.search(query);
            StringBuilder sb = new StringBuilder("{\"status\":\"connected\",\"fhirGateway\":\"Java HL7 FHIR R4 Encrypted Channel\",\"count\":")
                .append(matches.size())
                .append(",\"results\":[");
            for (int i = 0; i < matches.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(matches.get(i).toJson());
            }
            sb.append("]}");
            sendJson(exchange, 200, sb.toString());
        }
    }

    private static class FhirBundleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendOptions(exchange);
                return;
            }
            String body = readBody(exchange);
            String mrn = extractJsonString(body, "mrn");
            if (mrn == null) mrn = "UNKNOWN";

            String bundle = "{" +
                "\"resourceType\":\"Bundle\"," +
                "\"id\":\"fhir-bundle-java-" + escape(mrn) + "\"," +
                "\"type\":\"collection\"," +
                "\"timestamp\":\"" + new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()) + "\"," +
                "\"entry\":[{\"resource\":{\"resourceType\":\"Patient\",\"id\":\"" + escape(mrn) + "\",\"active\":true}}]" +
                "}";
            sendJson(exchange, 200, bundle);
        }
    }

    private static void sendOptions(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
        exchange.close();
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(status, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        int read;
        while ((read = is.read(buf)) != -1) {
            baos.write(buf, 0, read);
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    private static String extractJsonString(String json, String key) {
        if (json == null) return null;
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx + pattern.length());
        if (colon == -1) return null;
        int firstQuote = json.indexOf("\"", colon);
        if (firstQuote == -1) return null;
        int secondQuote = json.indexOf("\"", firstQuote + 1);
        if (secondQuote == -1) return null;
        return json.substring(firstQuote + 1, secondQuote);
    }

    private static int extractJsonInt(String json, String key, int def) {
        if (json == null) return def;
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return def;
        int colon = json.indexOf(":", idx + pattern.length());
        if (colon == -1) return def;
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) end++;
        try {
            return Integer.parseInt(json.substring(start, end));
        } catch (Exception e) {
            return def;
        }
    }

    private static String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return "hash-err";
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
