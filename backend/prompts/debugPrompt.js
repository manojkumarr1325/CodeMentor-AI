export function debugPrompt(code, language) {

return `
You are an expert competitive programming debugger.

Programming Language:
${language}


Source Code:
\`\`\`${language}
${code}
\`\`\`


Analyze the code and find:

1. Compilation errors
2. Logical errors
3. Runtime errors
4. Time complexity issues


Provide your response in this structure:

## Bugs Found

Explain each bug clearly.

## Bug Explanation

Explain why the issue happens.

## Corrected Code

Provide the complete corrected code.

## Why This Correction Works

Explain the solution approach.

## Complexity Analysis

Give the final time and space complexity.


Respond in Markdown.
`;

}