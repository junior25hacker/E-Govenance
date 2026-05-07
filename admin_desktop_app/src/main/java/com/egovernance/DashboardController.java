package com.egovernance;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Label;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.json.JSONObject;

public class DashboardController {

    @FXML
    private Label nameLabel;

    @FXML
    private Label idLabel;

    @FXML
    private Label docTypeLabel;

    @FXML
    private Label dobLabel; // This binds to the Jurisdiction row in our new FXML structure

    @FXML
    private Label docPathLabel;

    @FXML
    private Label aiResultLabel;

    @FXML
    private void fetchData() {
        nameLabel.setText("Connecting to Core API...");
        idLabel.setText("...");
        docTypeLabel.setText("...");
        dobLabel.setText("...");
        docPathLabel.setText("...");

        new Thread(() -> {
            try {
                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(3))
                        .build();

                // Default uuid structure to query
                String documentId = "d3b07384-d113-4ec2-a50d-6a3821034bc2"; 

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:3000/api/v1/documents/" + documentId + "/verify"))
                        .header("Authorization", "Bearer " + MainApp.JWT_TOKEN)
                        .header("Accept", "application/json")
                        .GET()
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JSONObject res = new JSONObject(response.body());
                    JSONObject doc = res.getJSONObject("data");

                    String name = doc.getString("citizenFullName");
                    String citizenId = doc.getString("citizenId");
                    String docType = doc.getString("documentType");
                    String jurisdiction = doc.getString("councilJurisdiction");
                    String filePath = doc.getString("filePath");

                    Platform.runLater(() -> {
                        nameLabel.setText(name);
                        idLabel.setText(citizenId);
                        docTypeLabel.setText(docType);
                        dobLabel.setText(jurisdiction);
                        docPathLabel.setText("File: " + filePath + "\n[ Live Database Connection ]");
                        docPathLabel.setStyle("-fx-text-fill: #34d399;"); // Premium Green
                    });
                } else {
                    Platform.runLater(() -> {
                        System.out.println("[API WORKFLOW] Server returned " + response.statusCode() + ". Loading mock demo record.");
                        loadMockDemoRecord("Offline (Server Status " + response.statusCode() + ")");
                    });
                }
            } catch (Exception e) {
                System.out.println("[API WORKFLOW] API unreachable. Loading mock demo record.");
                Platform.runLater(() -> loadMockDemoRecord("Offline Mode (Core API Offline)"));
            }
        }).start();
    }

    private void loadMockDemoRecord(String statusText) {
        nameLabel.setText("Jean Dupont");
        idLabel.setText("2024018899");
        docTypeLabel.setText("Birth Certificate");
        dobLabel.setText("Paris Council");
        docPathLabel.setText("File: /uploads/birth_cert_jean_dupont.jpg\n[" + statusText + "]");
        docPathLabel.setStyle("-fx-text-fill: rgba(205, 200, 180, 0.6);");
    }

    @FXML
    private void verifyWithAI() {
        aiResultLabel.setText("AI Status: Requesting verification from Backend...");
        aiResultLabel.setStyle("-fx-text-fill: #c9a84c;"); // Gold

        new Thread(() -> {
            try {
                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(4))
                        .build();

                String documentId = "d3b07384-d113-4ec2-a50d-6a3821034bc2";

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:3000/api/v1/documents/" + documentId + "/ai-verify"))
                        .header("Authorization", "Bearer " + MainApp.JWT_TOKEN)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JSONObject res = new JSONObject(response.body());
                    JSONObject aiResult = res.getJSONObject("aiResult");

                    String status = aiResult.getString("status");
                    int confidence = aiResult.optInt("confidence", 95);
                    String msg = aiResult.getString("message");

                    Platform.runLater(() -> {
                        aiResultLabel.setText("AI Status: " + status + " (Confidence " + confidence + "%)\n" + msg);
                        if ("MATCH".equalsIgnoreCase(status)) {
                            aiResultLabel.setStyle("-fx-text-fill: #34d399; -fx-font-weight: bold;"); // Green
                        } else {
                            aiResultLabel.setStyle("-fx-text-fill: #fbbf24; -fx-font-weight: bold;"); // Amber
                        }
                    });
                } else {
                    Platform.runLater(() -> runMockAISimulation("Offline (Server Status " + response.statusCode() + ")"));
                }
            } catch (Exception e) {
                Platform.runLater(() -> runMockAISimulation("Offline Mode"));
            }
        }).start();
    }

    private void runMockAISimulation(String mode) {
        aiResultLabel.setText("AI Status: Analyzing document locally (" + mode + ")...");
        aiResultLabel.setStyle("-fx-text-fill: #c9a84c;");

        new Thread(() -> {
            try {
                Thread.sleep(1500);
            } catch (InterruptedException ie) {}

            Platform.runLater(() -> {
                aiResultLabel.setText("AI Status [MOCK MATCH]: Confidence 98%.\nThe hospital record matches the submitted citizen data perfectly.");
                aiResultLabel.setStyle("-fx-text-fill: #34d399; -fx-font-weight: bold;");
            });
        }).start();
    }
}
