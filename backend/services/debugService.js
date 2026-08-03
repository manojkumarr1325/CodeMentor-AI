import { callAI } from "./aiService.js";
import { debugPrompt } from "../prompts/debugPrompt.js";


export async function debugCode(code, language, messages = []) {

    console.log("===== DEBUG SERVICE =====");


    const prompt = debugPrompt(code, language);

    console.log(prompt);


    const aiMessages = [
        {
            role: "system",
            content:
            "You are CodeMentor AI Debugger. Analyze code errors, explain the cause, and provide fixes."
        },

        ...messages,

        {
            role: "user",
            content: prompt
        }
    ];


    const answer = await callAI(aiMessages);


    return answer;

}