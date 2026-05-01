import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { Pool } from "pg";

export class RoutingService {
    private model = new ChatOpenAI({ 
        // This pulls your real key from the .env file
        openAIApiKey: process.env.OPENAI_API_KEY, 
        temperature: 0,
        modelName: "gpt-4-turbo" // High-accuracy model for routing
    });

    async processAndRoute(applicationId: number, metadata: { hospital_id: string }, pool: Pool) {
        const prompt = PromptTemplate.fromTemplate(
            "You are a Cameroon government routing assistant. " +
            "Analyze the hospital ID: {hospitalId}. " +
            "Based on this ID, determine which regional council should handle the birth registration. " +
            "Return ONLY the name: YAOUNDE, DOUALA, or BANDJOUN."
        );

        const chain = prompt.pipe(this.model);
        const response = await chain.invoke({ hospitalId: metadata.hospital_id });
        const assignedCouncil = response.content.toString().trim();

        // Update PostgreSQL to bridge to the JavaFX Dashboard (Issue #13)
        await pool.query(
            "UPDATE birth_certificates SET assigned_council = $1, status = 'PENDING_VERIFICATION' WHERE id = $2",
            [assignedCouncil, applicationId]
        );

        return assignedCouncil;
    }
}