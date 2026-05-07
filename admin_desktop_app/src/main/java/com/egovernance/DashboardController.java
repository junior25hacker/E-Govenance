package com.egovernance;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Label;

public class DashboardController {

    @FXML
    private Label nameLabel;

    @FXML
    private Label idLabel;

    @FXML
    private Label docTypeLabel;

    @FXML
    private Label dobLabel;

    @FXML
    private Label aiResultLabel;

    @FXML
    private void fetchData() {
        // Placeholder for calling Node.js backend with JWT token
        System.out.println("Using JWT: " + MainApp.JWT_TOKEN);
        
        nameLabel.setText("Jean Dupont");
        idLabel.setText("2024018899");
        docTypeLabel.setText("Birth Certificate");
        dobLabel.setText("1995-10-24");
    }

    @FXML
    private void verifyWithAI() {
        aiResultLabel.setText("AI Status: Analyzing document via Backend...");
        aiResultLabel.setStyle("-fx-text-fill: #c9a84c;"); // Gold

        // Simulate network call to backend /api/v1/documents/:id/ai-verify
        new Thread(() -> {
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            Platform.runLater(() -> {
                aiResultLabel.setText("AI Status: MATCH (Confidence 98%). The hospital record matches the submitted data.");
                aiResultLabel.setStyle("-fx-text-fill: #34d399; -fx-font-weight: bold;"); // Green
            });
        }).start();
    }
}
