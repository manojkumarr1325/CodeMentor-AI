import { CONFIG } from "../utils/config.js";

import {
    initializeEditor,
    getEditorText,
    clearEditor,
    setLanguage,
    updateEditorTheme
} from "../components/editor.js";

import {
    addUserMessage,
    addThinkingMessage,
    addAIMessage,
    scrollBottom,
    attachCopyButtons
} from "../components/workspace.js";

import {
    setStorageType,
    saveConversation,
    getCurrentConversation,
    clearCurrentConversation,
    getHistory,
    setActiveChat
} from "../utils/storage.js";

setStorageType("testcase");
localStorage.setItem("currentTool", "testcase");

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");

/* ================= Initialize Monaco ================= */

initializeEditor(generateTestcases);

setTimeout(() => {
    updateEditorTheme();
}, 200);

setTimeout(() => {
    setLanguage(language.value);
}, 500);

language.addEventListener("change", () => {
    setLanguage(language.value);
});

/* ================= Load Previous Conversation ================= */

let savedConversation =
    getCurrentConversation();

if (
    savedConversation &&
    savedConversation.tool !== "testcase"
) {

    clearCurrentConversation();

    savedConversation = null;

}

let firstQuery = true;

if (savedConversation) {

    welcomeScreen.style.display =
        "none";

    firstQuery = false;

    if (savedConversation.messages) {

        savedConversation.messages.forEach(msg => {

            if (msg.role === "user") {

                addUserMessage(
                    msg.content
                );

            } else if (
                msg.role === "assistant"
            ) {

                addAIMessage(
                    msg.content
                );

            }

        });

    }

}

/* ================= Button ================= */

solveBtn.addEventListener("click", generateTestcases);

/* ================= Generate Testcases ================= */

async function generateTestcases() {

    const problem = getEditorText().trim();

    if (!problem) return;

    if (firstQuery) {

        welcomeScreen.style.display = "none";

        firstQuery = false;

    }

    addUserMessage(problem);

    clearEditor();

    const thinking = addThinkingMessage();

    scrollBottom();

    try {

        const response = await fetch(

            `${CONFIG.API_BASE}/testcases`,

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    problem,
                    language: language.value,
                    messages: []

                })

            }

        );

        const data = await response.json();

        thinking.remove();

        await addAIMessage(
            data.answer || "❌ No response received from AI."
        );

        saveConversation(

            problem,

            data.answer,

            language.value,

            "Test Case Generation",

            "testcase"

        );

        const history = getHistory();

        if (history.length > 0) {

            setActiveChat(history[0].id);

        }

        if (window.refreshSidebar) {

            window.refreshSidebar();

        }

        document.querySelectorAll("pre code").forEach(block => {

            hljs.highlightElement(block);

        });

        attachCopyButtons();

    }

    catch (err) {

        thinking.remove();

        await addAIMessage(
            "❌ Unable to connect to backend."
        );

        console.error(err);

    }

    scrollBottom();

}
