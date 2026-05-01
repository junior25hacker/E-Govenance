import { Router } from "express";
import { Pool } from "pg";
import { RoutingService } from "../services/RoutingService";

const router = Router();
const pool = new Pool(); // Uses your .env DB settings automatically
const routingService = new RoutingService();

router.post("/submit-birth-record", async (req, res) => {
    const { citizen_name, date_of_birth, hospital_id } = req.body;

    try {
        // 1. Save initial record to PostgreSQL
        const newRecord = await pool.query(
            "INSERT INTO birth_certificates (citizen_name, date_of_birth, hospital_id) VALUES ($1, $2, $3) RETURNING id",
            [citizen_name, date_of_birth, hospital_id]
        );

        const applicationId = newRecord.rows[0].id;

        // 2. Trigger AI Automation (Issue #12)
        // LangChain analyzes the hospital_id and routes it to a council
        const assignedCouncil = await routingService.processAndRoute(
            applicationId, 
            { hospital_id }, 
            pool
        );

        res.status(201).json({
            message: "Application submitted and routed by AI.",
            applicationId,
            assignedTo: assignedCouncil
        });

    } catch (error) {
        console.error("Routing Error:", error);
        res.status(500).json({ error: "Failed to process application" });
    }
});

export default router;