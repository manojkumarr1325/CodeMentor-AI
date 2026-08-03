import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-3.5-flash";

export async function callGemini(messages = []) {

    const prompt = messages
        .map(m => `${m.role.toUpperCase()}:\n${m.content}`)
        .join("\n\n");

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt
    });

    return response.text;
}