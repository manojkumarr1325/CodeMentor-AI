import { callAI } from "./aiService.js";
import { testcasePrompt } from "../prompts/testcasePrompt.js";

export async function generateTestcases(problem) {

    const aiMessages = [
        {
            role: "system",
            content: "You are an expert competitive programming testcase generator."
        },
        {
            role: "user",
            content: testcasePrompt(problem)
        }
    ];

    return await callAI(aiMessages);

}