package com.egovernance;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import java.io.IOException;

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

        if ("admin".equals(user) && "admin123".equals(pass)) {
            MainApp.JWT_TOKEN = "mock-token";
            try {
                MainApp.setRoot("Dashboard");
            } catch (IOException e) {
                e.printStackTrace();
                statusLabel.setText("Failed to load dashboard.");
            }
        } else {
            statusLabel.setText("Invalid credentials.");
        }
    }
}
