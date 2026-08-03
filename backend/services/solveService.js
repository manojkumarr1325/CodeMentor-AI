import { callAI } from "./aiService.js";
import { solvePrompt } from "../prompts/solvePrompt.js";

/* ==========================================
   Remove outer markdown wrapper if AI adds it
========================================== */

function cleanMarkdown(text) {

    if (!text) return "";

    text = text.trim();

    // Remove ```markdown ... ```
    if (text.startsWith("```markdown")) {

        text = text
            .replace(/^```markdown\s*/i, "")
            .replace(/```$/i, "")
            .trim();

    }

    // Remove ```md ... ```
    if (text.startsWith("```md")) {

        text = text
            .replace(/^```md\s*/i, "")
            .replace(/```$/i, "")
            .trim();

    }

    // Remove outer ``` if the model wraps the whole response
    if (
        text.startsWith("```") &&
        text.endsWith("```")
    ) {

        const lines = text.split("\n");

        // remove first fence
        lines.shift();

        // remove last fence
        if (lines[lines.length - 1].trim() === "```") {
            lines.pop();
        }

        text = lines.join("\n").trim();

    }

    return text;

}

/* ==========================================
   Solve Problem
========================================== */

export async function solveProblem(
    problem,
    language,
    messages = []
) {

    const aiMessages = [

        {
            role: "system",
            content: `
You are CodeMentor AI.

You are an expert Competitive Programming mentor.

Always return RAW GitHub Markdown.

IMPORTANT RULES

1. The FIRST character of every response must be '#'.

2. NEVER wrap the ENTIRE response inside

\`\`\`markdown

or

\`\`\`

3. ONLY source code should be inside language fences such as

\`\`\`cpp
...
\`\`\`

\`\`\`python
...
\`\`\`

4. Never output code as plain text.

5. Never place explanations inside code blocks.

6. Leave one blank line after every heading.

7. Use proper GitHub Markdown headings and bullet points.
`
        },

        ...messages,

        {
            role: "user",
            content: solvePrompt(
                problem,
                language
            )
        }

    ];

    let answer = await callAI(aiMessages);

    answer = cleanMarkdown(answer);

    return answer;

}