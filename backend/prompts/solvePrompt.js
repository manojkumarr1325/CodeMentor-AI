export function solvePrompt(problem, language) {

    const looksLikeCode =
        problem.includes("#include") ||
        problem.includes("using namespace") ||
        problem.includes("int main") ||
        problem.includes("public class") ||
        problem.includes("def ") ||
        problem.includes("function ") ||
        problem.includes(";");

    if (looksLikeCode) {

        return `
You are CodeMentor AI, an Expert Competitive Programming Mentor.

The user has pasted SOURCE CODE written in ${language}.

Return RAW GitHub Markdown.

IMPORTANT RULES

- The FIRST character of your response MUST be '#'.
- DO NOT wrap the entire response inside \`\`\`markdown or \`\`\`.
- ONLY wrap the corrected source code inside a language code block.
- Never output raw code outside a code block.
- Leave one blank line after every heading.
- Use bullet points wherever appropriate.

Use EXACTLY these headings:

# Code Analysis

# Bugs Found

# Optimized ${language} Code

# Time Complexity

# Space Complexity

# Suggestions

The corrected code MUST be inside:

\`\`\`${language.toLowerCase()}
...
\`\`\`

If the code has no bugs, clearly state that under **Bugs Found** and still provide suggestions for improvement.

Source Code:

${problem}
`;

    }

    return `
You are CodeMentor AI, an Expert Competitive Programming Teacher.

Return RAW GitHub Markdown.

IMPORTANT RULES

- The FIRST character of your response MUST be '#'.
- DO NOT wrap the entire response inside \`\`\`markdown or \`\`\`.
- ONLY wrap the solution code inside a language code block.
- Leave one blank line after every heading.
- Use bullet points wherever appropriate.

Use EXACTLY these headings:

# Problem Explanation

# Approach

# Time Complexity

# Space Complexity

# ${language} Solution

# Explanation

The solution MUST be inside:

\`\`\`${language.toLowerCase()}
...
\`\`\`

Problem:

${problem}
`;

}