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

setStorageType("debug");
localStorage.setItem("currentTool", "debug");

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");

let firstQuery = true;

/* ================= Initialize Monaco ================= */

initializeEditor(debugCode);

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

let savedConversation = getCurrentConversation();

if (
    savedConversation &&
    savedConversation.tool !== "debug"
) {
    clearCurrentConversation();
    savedConversation = null;
}

if (savedConversation) {

    welcomeScreen.style.display = "none";

    firstQuery = false;

    if (savedConversation.messages) {

        savedConversation.messages.forEach(msg => {

            if (msg.role === "user") {

                addUserMessage(msg.content);

            } else if (msg.role === "assistant") {

                addAIMessage(msg.content);

            }

        });

    }

}

/* ================= Events ================= */

solveBtn.addEventListener("click", debugCode);

/* ================= Debug ================= */

async function debugCode() {

    const code = getEditorText().trim();

    if (!code) return;

    if (firstQuery) {

        welcomeScreen.style.display = "none";

        firstQuery = false;

    }

    addUserMessage(code);

    clearEditor();

    const thinking = addThinkingMessage();

    scrollBottom();

    try {

        const current = getCurrentConversation();

        const response = await fetch(`${CONFIG.API_BASE}/debug`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                code,

                language: language.value,

                messages: current?.messages || []

            })

        });

        const data = await response.json();

        thinking.remove();

        await addAIMessage(
            data.answer || "❌ No response received from AI."
        );

        saveConversation(

            code,

            data.answer || "❌ No response received from AI.",

            language.value,

            "Debug Session",

            "debug"

        );

        const history = getHistory();

        if (history.length > 0) {

            setActiveChat(history[0].id);

        }

        if (window.refreshSidebar) {

            window.refreshSidebar();

        }

        attachCopyButtons();

    }

    catch (err) {

        thinking.remove();

        await addAIMessage("❌ Unable to connect to backend.");

        console.error(err);

    }

    scrollBottom();

}
