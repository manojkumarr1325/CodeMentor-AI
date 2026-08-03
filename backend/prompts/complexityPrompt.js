export function complexityPrompt(code, language) {

    return `
You are a Time and Space Complexity Analyzer.

Analyze ONLY the given ${language} code.

DO NOT:
- Explain the algorithm.
- Rewrite the code.
- Generate new code.
- Solve the problem.

Return ONLY the following Markdown format:

# Time Complexity

Explain the time complexity with reasoning.

# Space Complexity

Explain the space complexity with reasoning.

# Bottlenecks

Mention inefficient parts if any.

# Optimization Suggestions

Suggest improvements without rewriting the complete code.

Code:

${code}
`;

}