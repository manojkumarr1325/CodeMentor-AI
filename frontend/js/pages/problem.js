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
    setStorageType
} from "../utils/storage.js";

import {
    saveConversationToDB,
    getConversationFromDB
} from "../api/conversationApi.js";

setStorageType("problem");
localStorage.setItem("currentTool", "problem");

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");

// ==========================================
// Initialize Monaco
// ==========================================

initializeEditor(solveProblem);

setTimeout(() => {
    updateEditorTheme();
}, 200);

setTimeout(() => {
    setLanguage(language.value);
}, 500);

language.addEventListener("change", () => {
    setLanguage(language.value);
});

// ==========================================
// Load Existing Conversation
// ==========================================

let firstQuery = true;

const conversationId =
    localStorage.getItem("currentConversationId");

if (conversationId) {

    try {

        const savedConversation =
            await getConversationFromDB(conversationId);

        if (savedConversation) {

            welcomeScreen.style.display = "none";

            firstQuery = false;

            savedConversation.messages.forEach(msg => {

                if (msg.role === "user") {

                    addUserMessage(msg.content);

                } else {

                    addAIMessage(msg.content);

                }

            });

            scrollBottom();

            attachCopyButtons();

        }

    }

    catch (err) {

        console.error(
            "Failed to load conversation:",
            err
        );

    }

}

// ==========================================
// Events
// ==========================================

if (solveBtn) {

    solveBtn.addEventListener(
        "click",
        solveProblem
    );

}

// ==========================================
// Solve Problem
// ==========================================

async function solveProblem() {

    const problem =
        getEditorText().trim();

    if (!problem) return;

    if (firstQuery) {

        welcomeScreen.style.display = "none";

        firstQuery = false;

    }

    addUserMessage(problem);

    clearEditor();

    const thinking =
        addThinkingMessage();

    scrollBottom();

    try {

        let previousMessages = [];

        const currentId =
            localStorage.getItem(
                "currentConversationId"
            );

        if (currentId) {

            try {

                const conversation =
                    await getConversationFromDB(
                        currentId
                    );

                previousMessages =
                    conversation.messages || [];

            }

            catch (err) {

                console.error(
                    "Conversation load failed:",
                    err
                );

            }

        }

        const response = await fetch(
            `${CONFIG.API_BASE}/solve`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    problem,

                    language:
                        language.value,

                    messages:
                        previousMessages

                })

            }
        );

        const data =
            await response.json();

        thinking.remove();

        await addAIMessage(data.answer);

        // ==================================
        // Generate Title
        // ==================================

        let chatTitle = "New Chat";

        try {

            const titleRes =
                await fetch(
                    `${CONFIG.API_BASE}/title`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question: problem

                        })

                    }
                );

            const titleData =
                await titleRes.json();

            chatTitle =
                titleData.title || chatTitle;

        }

        catch (err) {

            console.error(
                "Title generation failed:",
                err
            );

        }

        // ==================================
        // Save To MongoDB
        // ==================================

        const saved =
            await saveConversationToDB({

                conversationId:
                    currentId || null,

                tool: "problem",

                title: chatTitle,

                language:
                    language.value,

                messages: [

                    ...previousMessages,

                    {
                        role: "user",
                        content: problem
                    },

                    {
                        role: "assistant",
                        content: data.answer
                    }

                ]

            });

        if (saved && saved._id) {

            localStorage.setItem(
                "currentConversationId",
                saved._id
            );

        }

        if (window.refreshSidebar) {

            await window.refreshSidebar();

        }

        attachCopyButtons();

    }

    catch (error) {

        console.error(error);

        thinking.remove();

        addAIMessage(
            "❌ Unable to connect to backend."
        );

    }

    scrollBottom();

}