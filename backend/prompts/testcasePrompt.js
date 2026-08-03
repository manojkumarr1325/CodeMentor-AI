export function testcasePrompt(problem) {

    return `
You are an expert Competitive Programming Test Case Generator.

Analyze the following problem carefully.

Return your answer in Markdown.

# Sample Test Cases

Provide 5 normal test cases.

# Edge Test Cases

Provide at least 10 edge cases that can break incorrect solutions.

For each test case include:

- Input
- Expected Output
- Why this case is important

Problem:

${problem}
`;

}