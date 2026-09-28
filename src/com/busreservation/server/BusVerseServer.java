package com.busreservation.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

public class BusVerseServer {
    private static final int PORT = 5000;
    private static final Path WEB_ROOT = Paths.get("web");
    private static final Path DB_PATH = Paths.get("busverse_db.json");

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Core API Endpoints
        server.createContext("/api/stops", new StopsHandler());
        server.createContext("/api/routes", new RoutesHandler());
        server.createContext("/api/buses", new BusesHandler());
        server.createContext("/api/bookings", new BookingsHandler());
        server.createContext("/api/profile", new ProfileHandler());
        server.createContext("/api/dashboard", new DashboardHandler());
        server.createContext("/api/auth/login", new AuthLoginHandler());
        server.createContext("/api/auth/register", new AuthRegisterHandler());

        // Static Web Serving (Frontend SPA)
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("====================================================");
        System.out.println("  🚀 BusVerse Java Server is running!");
        System.out.println("  🌐 Local: http://localhost:" + PORT);
        System.out.println("  🚍 Web Root: " + WEB_ROOT.toAbsolutePath());
        System.out.println("  🔒 Auth: Active (Login & Registration Online)");
        System.out.println("====================================================");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void handleCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String readDbJson() {
        try {
            if (Files.exists(DB_PATH)) {
                return Files.readString(DB_PATH, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            System.err.println("Failed to read busverse_db.json: " + e.getMessage());
        }
        return "{}";
    }

    // --- HANDLERS ---

    static class StopsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            String db = readDbJson();
            int start = db.indexOf("\"stops\":");
            if (start != -1) {
                int arrStart = db.indexOf("[", start);
                int arrEnd = findMatchingBracket(db, arrStart, '[', ']');
                if (arrStart != -1 && arrEnd != -1) {
                    sendJsonResponse(exchange, 200, db.substring(arrStart, arrEnd + 1));
                    return;
                }
            }
            sendJsonResponse(exchange, 200, "[]");
        }
    }

    static class RoutesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            String db = readDbJson();
            int start = db.indexOf("\"routes\":");
            if (start != -1) {
                int arrStart = db.indexOf("[", start);
                int arrEnd = findMatchingBracket(db, arrStart, '[', ']');
                if (arrStart != -1 && arrEnd != -1) {
                    sendJsonResponse(exchange, 200, db.substring(arrStart, arrEnd + 1));
                    return;
                }
            }
            sendJsonResponse(exchange, 200, "[]");
        }
    }

    static class BusesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            String path = exchange.getRequestURI().getPath();

            // Check if /api/buses/:busId/seats
            if (path.matches("^/api/buses/[^/]+/seats$")) {
                String busId = path.split("/")[3];
                String db = readDbJson();
                int busIdx = db.indexOf("\"id\": \"" + busId + "\"");
                if (busIdx == -1) busIdx = db.indexOf("\"id\":\"" + busId + "\"");

                if (busIdx != -1) {
                    int nextBusIdx = db.indexOf("\"id\":", busIdx + 10);
                    if (nextBusIdx == -1) nextBusIdx = db.length();

                    int seatsIdx = db.indexOf("\"seats\":", busIdx);
                    if (seatsIdx != -1 && seatsIdx < nextBusIdx) {
                        int arrStart = db.indexOf("[", seatsIdx);
                        int arrEnd = findMatchingBracket(db, arrStart, '[', ']');
                        if (arrStart != -1 && arrEnd != -1) {
                            String seatsJson = db.substring(arrStart, arrEnd + 1);
                            sendJsonResponse(exchange, 200, "{\"bus\":{\"id\":\"" + busId + "\"},\"seats\":" + seatsJson + "}");
                            return;
                        }
                    }
                }
                sendJsonResponse(exchange, 404, "{\"error\":\"Bus not found\"}");
                return;
            }

            // GET /api/buses (list buses)
            String db = readDbJson();
            int start = db.indexOf("\"buses\":");
            if (start != -1) {
                int arrStart = db.indexOf("[", start);
                int arrEnd = findMatchingBracket(db, arrStart, '[', ']');
                if (arrStart != -1 && arrEnd != -1) {
                    sendJsonResponse(exchange, 200, db.substring(arrStart, arrEnd + 1));
                    return;
                }
            }
            sendJsonResponse(exchange, 200, "[]");
        }
    }

    static class BookingsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            String method = exchange.getRequestMethod();

            if ("GET".equalsIgnoreCase(method)) {
                String db = readDbJson();
                int start = db.indexOf("\"bookings\":");
                if (start != -1) {
                    int arrStart = db.indexOf("[", start);
                    int arrEnd = findMatchingBracket(db, arrStart, '[', ']');
                    if (arrStart != -1 && arrEnd != -1) {
                        sendJsonResponse(exchange, 200, db.substring(arrStart, arrEnd + 1));
                        return;
                    }
                }
                sendJsonResponse(exchange, 200, "[]");
                return;
            }

            sendJsonResponse(exchange, 501, "{\"error\":\"Legacy Java booking API is disabled. Use the browser demo or the Node v2 booking server.\"}");
        }
    }

    static class ProfileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            // Return empty profile when unauthenticated
            sendJsonResponse(exchange, 200, "{}");
        }
    }

    static class DashboardHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            String dashJson = "{\"stats\":{\"upcoming\":0,\"completed\":0,\"savedRoutes\":15},\"upcoming\":[]}";
            sendJsonResponse(exchange, 200, dashJson);
        }
    }

    static class AuthLoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readRequestBody(exchange);
                String email = extractJsonField(body, "email", "traveler@busverse.in");
                String name = extractJsonField(body, "name", "");
                String phone = extractJsonField(body, "phone", "+91 98765 43210");
                String role = "Passenger";

                if (email.equalsIgnoreCase("admin@busverse.in")) {
                    name = "Fleet Operations Admin";
                    role = "Fleet Admin";
                } else if (name.isEmpty()) {
                    String userPart = email.contains("@") ? email.substring(0, email.indexOf("@")) : "Traveler";
                    name = Character.toUpperCase(userPart.charAt(0)) + userPart.substring(1);
                }

                String initials = getInitials(name);
                String response = String.format(
                    "{\"success\":true,\"user\":{\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\",\"role\":\"%s\",\"initials\":\"%s\"}}",
                    escapeJson(name), escapeJson(email), escapeJson(phone), role, initials
                );
                sendJsonResponse(exchange, 200, response);
                return;
            }
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    static class AuthRegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCors(exchange);
                return;
            }
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readRequestBody(exchange);
                String name = extractJsonField(body, "name", "Traveler");
                String email = extractJsonField(body, "email", "traveler@gmail.com");
                String phone = extractJsonField(body, "phone", "+91 98765 43210");
                String initials = getInitials(name);

                String response = String.format(
                    "{\"success\":true,\"message\":\"Account registered successfully\",\"user\":{\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\",\"role\":\"Passenger\",\"initials\":\"%s\"}}",
                    escapeJson(name), escapeJson(email), escapeJson(phone), initials
                );
                sendJsonResponse(exchange, 201, response);
                return;
            }
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String requestPath = exchange.getRequestURI().getPath();
            if (requestPath == null || requestPath.equals("/") || requestPath.equals("/login")) {
                requestPath = "/index.html";
            }

            // Clean path
            String relative = requestPath.startsWith("/") ? requestPath.substring(1) : requestPath;
            Path filePath = WEB_ROOT.resolve(relative).normalize();

            // Fallback for SPA routing
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                filePath = WEB_ROOT.resolve("index.html");
            }

            if (Files.exists(filePath)) {
                String contentType = getMimeType(filePath.getFileName().toString());
                exchange.getResponseHeaders().set("Content-Type", contentType);
                byte[] bytes = Files.readAllBytes(filePath);
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            } else {
                String notFound = "404 Not Found";
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
            }
        }

        private String getMimeType(String filename) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".html")) return "text/html; charset=utf-8";
            if (lower.endsWith(".css")) return "text/css; charset=utf-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (lower.endsWith(".json")) return "application/json; charset=utf-8";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".ico")) return "image/x-icon";
            return "application/octet-stream";
        }
    }

    private static int findMatchingBracket(String text, int startIdx, char open, char close) {
        if (startIdx < 0 || startIdx >= text.length()) return -1;
        int depth = 0;
        for (int i = startIdx; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == open) depth++;
            else if (c == close) {
                depth--;
                if (depth == 0) return i;
            }
        }
        return -1;
    }

    private static String extractJsonField(String json, String field, String defaultValue) {
        if (json == null) return defaultValue;
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return defaultValue;
    }

    private static String getInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "TR";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        } else if (name.length() >= 2) {
            return name.substring(0, 2).toUpperCase();
        }
        return name.toUpperCase();
    }

    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
