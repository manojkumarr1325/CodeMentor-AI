import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-flash-lite-latest";;

export async function callGemini(messages = []) {

    const prompt = messages
        .map(m => `${m.role.toUpperCase()}:\n${m.content}`)
        .join("\n\n");

    try {

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt
        });

        return response.text;

    } catch (err) {

        console.error("Gemini Error:", err);

        if (err.status === 503) {
            throw new Error("AI service is temporarily busy. Please try again in a minute.");
        }

        throw err;
    }
}
