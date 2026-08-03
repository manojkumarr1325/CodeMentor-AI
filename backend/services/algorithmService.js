import { callAI } from "./aiService.js";
import { algorithmPrompt } from "../prompts/algorithmPrompt.js";

export async function algorithmService(
    question,
    messages = []
) {

    const aiMessages = [

        {
            role: "system",
            content:
            "You are CodeMentor AI. Teach algorithms like an experienced university professor. Always respond in GitHub Markdown."
        },

        ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
        })),

        {
            role: "user",
            content: algorithmPrompt(question)
        }

    ];


    return await callAI(aiMessages);

}