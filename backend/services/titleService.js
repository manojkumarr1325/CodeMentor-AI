import { callAI } from "./aiService.js";
import { titlePrompt } from "../prompts/titlePrompt.js";

export async function generateTitle(question) {

    const aiMessages = [
        {
            role: "user",
            content: titlePrompt(question)
        }
    ];

    return await callAI(aiMessages);

}