import { callAI } from "./aiService.js";

export async function analyzeComplexity(code, language, messages = []) {

    const aiMessages = [
        {
            role: "system",
            content: `
You are CodeMentor AI.

The user will ONLY provide source code.

Your task is ONLY to analyze the code.

Never ask for the problem statement.
Never ask for additional code.
Never solve the problem.

Respond using exactly these headings:

## Time Complexity

## Space Complexity

## Explanation

## Possible Optimizations
`
        },

        {
            role: "user",
            content: `Language: ${language}

Source Code:

${code}`
        }
    ];

    return await callAI(aiMessages);
}