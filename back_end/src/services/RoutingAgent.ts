import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export class RoutingAgent {
    private model = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });

    async routeApplication(metadata: any) {
        const prompt = PromptTemplate.fromTemplate(
            "Analyze this birth certificate data: {data}. " +
            "Assign it to 'YAOUNDE_COUNCIL', 'REGIONAL_OFFICE', or 'FLAG_FOR_REVIEW' based on the hospital location."
        );

        const chain = prompt.pipe(this.model);
        const result = await chain.invoke({ data: JSON.stringify(metadata) });
        
        return result.content;
    }
}