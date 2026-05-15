package com.egovernance;

import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

public class ReportLostDocController {

    @FXML
    private ComboBox<String> docTypeComboBox;

    @FXML
    private VBox dynamicFormArea;

    @FXML
    private Button submitBtn;

    @FXML
    public void initialize() {
        // Initialize ComboBox
        docTypeComboBox.setItems(FXCollections.observableArrayList(
                "National ID",
                "Passport",
                "Birth Certificate"
        ));

        // Listen for changes
        docTypeComboBox.setOnAction(e -> {
            updateDynamicForm();
            submitBtn.setDisable(docTypeComboBox.getValue() == null);
        });
    }

    private void updateDynamicForm() {
        dynamicFormArea.getChildren().clear();
        String selectedDoc = docTypeComboBox.getValue();

        if (selectedDoc == null) return;

        switch (selectedDoc) {
            case "National ID":
                addFormRow("National ID Number (if known):");
                addFormRow("Date of Loss (YYYY-MM-DD):");
                addFormRow("Location of Loss:");
                addFormRow("Police Report Number:");
                break;
            case "Passport":
                addFormRow("Passport Number (if known):");
                addFormRow("Country of Issue:");
                addFormRow("Visa Status in Lost Passport:");
                addFormRow("Date of Loss (YYYY-MM-DD):");
                break;
            case "Birth Certificate":
                addFormRow("Full Name at Birth:");
                addFormRow("Date of Birth (YYYY-MM-DD):");
                addFormRow("City/Region of Birth:");
                addFormRow("Mother's Maiden Name:");
                addFormRow("Father's Full Name:");
                break;
            default:
                break;
        }
    }

    private void addFormRow(String labelText) {
        Label label = new Label(labelText);
        label.setStyle("-fx-text-fill: #cdc8b4; -fx-font-family: 'DM Sans'; -fx-font-size: 14px;");

        TextField textField = new TextField();
        // Matching the dark mode input style
        textField.setStyle("-fx-background-color: rgba(5, 13, 31, 0.6); -fx-border-color: rgba(201, 168, 76, 0.3); -fx-text-fill: #cdc8b4; -fx-padding: 8px; -fx-font-size: 14px;");
        textField.setPrefWidth(400);

        VBox row = new VBox(5, label, textField);
        dynamicFormArea.getChildren().add(row);
    }

    @FXML
    private void submitReport() {
        System.out.println("Submitting report for: " + docTypeComboBox.getValue());
        
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Report Submitted");
        alert.setHeaderText(null);
        alert.setContentText("The report for " + docTypeComboBox.getValue() + " has been submitted successfully and entered the workflow queue.");
        alert.showAndWait();
        
        try {
            MainApp.setRoot("Dashboard");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @FXML
    private void goBack() {
        try {
            MainApp.setRoot("Dashboard");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
