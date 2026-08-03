import dotenv from "dotenv";

import { callGemini } from "./geminiService.js";
import { callOpenRouter } from "./openRouterService.js";

dotenv.config();

const provider =
    (process.env.AI_PROVIDER || "gemini").toLowerCase();

console.log("================================");
console.log("AI Provider :", provider);
console.log("================================");

export async function callAI(messages = []) {

    switch(provider){

        case "gemini":
            return await callGemini(messages);

        case "openrouter":
            return await callOpenRouter(messages);

        default:
            throw new Error(
                `Unknown AI Provider : ${provider}`
            );

    }

}