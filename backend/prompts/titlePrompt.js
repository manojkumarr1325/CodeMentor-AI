export function titlePrompt(question) {

    return `
Generate a short chat title.

Rules:
- Maximum 6 words.
- No quotes.
- No markdown.
- No numbering.
- Return ONLY the title.

User:

${question}
`;

}