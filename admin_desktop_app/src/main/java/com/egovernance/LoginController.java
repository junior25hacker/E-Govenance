package com.egovernance;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.json.JSONObject;

public class LoginController {

    @FXML
    private TextField usernameField;

    @FXML
    private PasswordField passwordField;

    @FXML
    private Label statusLabel;

    @FXML
    private void handleLogin() {
        String user = usernameField.getText();
        String pass = passwordField.getText();

        if (user.isEmpty() || pass.isEmpty()) {
            statusLabel.setText("Username and Password cannot be empty.");
            return;
        }

        statusLabel.setText("Authenticating with Core API...");

        // Start a background task for the API call to keep GUI responsive
        new Thread(() -> {
            try {
                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(3))
                        .build();

                JSONObject jsonPayload = new JSONObject();
                jsonPayload.put("username", user);
                jsonPayload.put("password", pass);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:3000/api/v1/auth/login"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload.toString()))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JSONObject responseJson = new JSONObject(response.body());
                    String token = responseJson.getString("token");
                    MainApp.JWT_TOKEN = token;

                    javafx.application.Platform.runLater(() -> {
                        try {
                            MainApp.setRoot("Dashboard");
                        } catch (IOException e) {
                            e.printStackTrace();
                            statusLabel.setText("Failed to load dashboard view.");
                        }
                    });
                } else {
                    try {
                        JSONObject errJson = new JSONObject(response.body());
                        String msg = errJson.optString("message", "Invalid credentials.");
                        javafx.application.Platform.runLater(() -> statusLabel.setText(msg));
                    } catch (Exception parseEx) {
                        javafx.application.Platform.runLater(() -> statusLabel.setText("Authentication failed. (" + response.statusCode() + ")"));
                    }
                }

            } catch (Exception e) {
                // Connection or timeout error -> Fallback to Mock Offline Mode so development is not blocked
                System.out.println("[API WORKFLOW] Backend offline. Falling back to local offline authentication.");
                
                javafx.application.Platform.runLater(() -> {
                    if ("admin".equals(user) && "admin123".equals(pass)) {
                        MainApp.JWT_TOKEN = "mock-offline-token";
                        statusLabel.setText("Backend offline. Logging in via Offline Mode...");
                        
                        // Small delay before transition so they can see the message
                        new Thread(() -> {
                            try {
                                Thread.sleep(1000);
                            } catch (InterruptedException ie) {}
                            javafx.application.Platform.runLater(() -> {
                                try {
                                    MainApp.setRoot("Dashboard");
                                } catch (IOException ex) {
                                    ex.printStackTrace();
                                    statusLabel.setText("Failed to load dashboard.");
                                }
                            });
                        }).start();
                    } else {
                        statusLabel.setText("Offline Mode: Invalid credentials.");
                    }
                });
            }
        }).start();
    }
}
