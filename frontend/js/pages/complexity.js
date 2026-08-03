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

setStorageType("complexity");
localStorage.setItem("currentTool", "complexity");

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");

// ================= Initialize Monaco =================

initializeEditor(analyzeComplexity);

setTimeout(() => {

    updateEditorTheme();

}, 200);

setTimeout(() => {

    setLanguage(language.value);

}, 500);

language.addEventListener("change", () => {

    setLanguage(language.value);

});

// ================= Load Previous Conversation =================

const savedConversation = getCurrentConversation();

if(
    savedConversation &&
    savedConversation.tool !== "complexity"
){
    clearCurrentConversation();
}

let firstQuery = true;

if (savedConversation) {

    welcomeScreen.style.display = "none";

    firstQuery = false;

    if (savedConversation.messages) {

        savedConversation.messages.forEach(msg => {

            if (msg.role === "user") {

                addUserMessage(msg.content);

            }
            else {

                addAIMessage(msg.content);

            }

        });

    }

}

// ================= Button =================

solveBtn.addEventListener("click", analyzeComplexity);

// ================= Analyze =================

async function analyzeComplexity() {

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

        const response = await fetch(

            `${CONFIG.API_BASE}/complexity`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    code: code,
                    language: language.value,
                    messages: []

                })

            }

        );

        const data = await response.json();

        thinking.remove();

        await addAIMessage(data.answer);

        saveConversation(

            code,

            data.answer,

            language.value,

            "Complexity Analysis",

            "complexity"

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