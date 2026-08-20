export function algorithmPrompt(question, language = "cpp") {

    const languageMap = {
        cpp: "C++",
        c: "C",
        java: "Java",
        python: "Python",
        javascript: "JavaScript"
    };

    const selectedLanguage =
        languageMap[language] || "C++";

    return `

You are CodeMentor AI.

Teach algorithms like a university professor.

The answer should always contain:

# Overview

# Intuition

# Step-by-step Working

# Algorithm

# Time Complexity

# Space Complexity

# Dry Run

# Code in ${selectedLanguage}

IMPORTANT:
When providing code, use ONLY ${selectedLanguage}.
Do not provide C++ code unless ${selectedLanguage} is C++.

# Common Mistakes

# Interview Tips

Question:

${question}

`;

}
