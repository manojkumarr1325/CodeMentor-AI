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


// =====================================================
// STORAGE
// =====================================================

setStorageType("complexity");

localStorage.setItem(
    "currentTool",
    "complexity"
);


// =====================================================
// DOM
// =====================================================

const solveBtn =
    document.getElementById("solveBtn");

const language =
    document.getElementById("language");

const welcomeScreen =
    document.getElementById("welcomeScreen");


// =====================================================
// FIRST QUERY
// =====================================================

let firstQuery = true;


// =====================================================
// INITIALIZE MONACO
// =====================================================

initializeEditor(analyzeComplexity);


// Update theme after editor loads

setTimeout(() => {

    updateEditorTheme();

}, 300);


// Set initial language after editor loads

setTimeout(() => {

    if (language) {

        setLanguage(
            language.value
        );

    }

}, 700);


// =====================================================
// LANGUAGE CHANGE
// =====================================================

if (language) {

    language.addEventListener(
        "change",
        () => {

            setLanguage(
                language.value
            );

        }
    );

}


// =====================================================
// LOAD PREVIOUS CONVERSATION
// =====================================================

let savedConversation =
    getCurrentConversation();


if (
    savedConversation &&
    savedConversation.tool !== "complexity"
) {

    clearCurrentConversation();

    savedConversation = null;

}


if (savedConversation) {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }

    firstQuery = false;


    if (savedConversation.messages) {

        savedConversation.messages.forEach(
            msg => {

                if (
                    msg.role === "user"
                ) {

                    addUserMessage(
                        msg.content
                    );

                }

                else if (
                    msg.role === "assistant"
                ) {

                    addAIMessage(
                        msg.content
                    );

                }

            }
        );

    }

    scrollBottom();

}


// =====================================================
// SOLVE BUTTON
// =====================================================

if (solveBtn) {

    solveBtn.addEventListener(
        "click",
        analyzeComplexity
    );

}


// =====================================================
// ANALYZE COMPLEXITY
// =====================================================

async function analyzeComplexity() {

    const code =
        getEditorText().trim();


    // Nothing entered
    if (!code) {

        return;

    }


    // =================================================
    // HIDE WELCOME
    // =================================================

    if (firstQuery) {

        if (welcomeScreen) {

            welcomeScreen.style.display =
                "none";

        }

        firstQuery = false;

    }


    // =================================================
    // SHOW USER MESSAGE
    // =================================================

    addUserMessage(code);


    // Clear Monaco
    clearEditor();


    // =================================================
    // THINKING
    // =================================================

    const thinking =
        addThinkingMessage();


    scrollBottom();


    try {

        // =================================================
        // BACKEND REQUEST
        // =================================================

        const response =
            await fetch(
                `${CONFIG.API_BASE}/complexity`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        code: code,

                        language:
                            language
                                ? language.value
                                : "cpp",

                        messages: []

                    })

                }
            );


        // =================================================
        // CHECK HTTP STATUS
        // =================================================

        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        // =================================================
        // REMOVE THINKING
        // =================================================

        if (thinking) {

            thinking.remove();

        }


        // =================================================
        // SHOW AI RESPONSE
        // =================================================

        await addAIMessage(
            data.answer ||
            "No response received from the server."
        );


        // =================================================
        // SAVE LOCAL HISTORY
        // =================================================

        saveConversation(

            code,

            data.answer,

            language
                ? language.value
                : "cpp",

            "Complexity Analysis",

            "complexity"

        );


        // =================================================
        // UPDATE ACTIVE CHAT
        // =================================================

        const history =
            getHistory();


        if (
            history &&
            history.length > 0
        ) {

            setActiveChat(
                history[0].id
            );

        }


        // =================================================
        // REFRESH SIDEBAR
        // =================================================

        if (
            window.refreshSidebar
        ) {

            await window.refreshSidebar();

        }


        // =================================================
        // COPY BUTTONS
        // =================================================

        attachCopyButtons();

    }


    catch (err) {

        console.error(
            "Complexity Analyzer Error:",
            err
        );


        if (thinking) {

            thinking.remove();

        }


        await addAIMessage(
            "❌ Unable to connect to backend."
        );

    }


    scrollBottom();

}
