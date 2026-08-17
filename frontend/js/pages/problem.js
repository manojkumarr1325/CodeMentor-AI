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


// ==========================================
// Storage Setup
// ==========================================

setStorageType("problem");

localStorage.setItem(
    "currentTool",
    "problem"
);


// ==========================================
// DOM Elements
// ==========================================

const solveBtn =
    document.getElementById("solveBtn");

const language =
    document.getElementById("language");

const welcomeScreen =
    document.getElementById("welcomeScreen");


// ==========================================
// Initialize Monaco
// ==========================================

initializeEditor(solveProblem);


setTimeout(() => {

    updateEditorTheme();

}, 200);


setTimeout(() => {

    if (language) {

        setLanguage(
            language.value
        );

    }

}, 500);


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


// ==========================================
// Load Existing Conversation
// ==========================================

let firstQuery = true;

const conversationId =
    localStorage.getItem(
        "currentConversationId"
    );


if (conversationId) {

    try {

        const savedConversation =
            await getConversationFromDB(
                conversationId
            );


        if (savedConversation) {

            welcomeScreen.style.display =
                "none";

            firstQuery = false;


            if (
                savedConversation.messages &&
                Array.isArray(
                    savedConversation.messages
                )
            ) {

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


    if (!problem) {

        return;

    }


    // ======================================
    // First Query
    // ======================================

    if (firstQuery) {

        welcomeScreen.style.display =
            "none";

        firstQuery = false;

    }


    // ======================================
    // Show User Message
    // ======================================

    addUserMessage(
        problem
    );


    clearEditor();


    const thinking =
        addThinkingMessage();


    scrollBottom();


    // ======================================
    // Get Previous Messages
    // ======================================

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

            /*
             * Do NOT stop the problem solving.
             *
             * If history cannot be loaded,
             * simply continue with an empty
             * previous message list.
             */

            previousMessages = [];

        }

    }


    // ======================================
    // CALL AI BACKEND
    // ======================================

    let data;


    try {

        const response =
            await fetch(
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
                            language?.value || "cpp",

                        messages:
                            previousMessages

                    })

                }
            );


        data =
            await response.json();


        // ==================================
        // Check AI Response
        // ==================================

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "AI request failed"
            );

        }


        if (!data.answer) {

            throw new Error(
                "No answer received from AI"
            );

        }


        // ==================================
        // Remove Thinking
        // ==================================

        thinking.remove();


        // ==================================
        // Display AI Answer
        // ==================================

        await addAIMessage(
            data.answer
        );


        // ==================================
        // Generate Title
        // ==================================

        let chatTitle =
            "New Chat";


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

                            question:
                                problem

                        })

                    }
                );


            const titleData =
                await titleRes.json();


            if (titleRes.ok) {

                chatTitle =
                    titleData.title ||
                    chatTitle;

            }

        }

        catch (err) {

            console.error(
                "Title generation failed:",
                err
            );

            /*
             * Title failure should NOT
             * affect the AI answer.
             */

        }


        // ==================================
        // SAVE TO MONGODB
        // ==================================

        try {

            const saved =
                await saveConversationToDB({

                    conversationId:
                        currentId || null,

                    tool:
                        "problem",

                    title:
                        chatTitle,

                    language:
                        language?.value || "cpp",

                    messages: [

                        ...previousMessages,

                        {

                            role:
                                "user",

                            content:
                                problem

                        },

                        {

                            role:
                                "assistant",

                            content:
                                data.answer

                        }

                    ]

                });


            // ==================================
            // Save Conversation ID
            // ==================================

            if (
                saved &&
                saved._id
            ) {

                localStorage.setItem(
                    "currentConversationId",
                    saved._id
                );

            }


            // ==================================
            // Refresh Sidebar
            // ==================================

            if (
                window.refreshSidebar
            ) {

                await window.refreshSidebar();

            }


            attachCopyButtons();

        }

        catch (saveError) {

            /*
             * IMPORTANT:
             *
             * MongoDB/auth errors must NOT
             * replace the successful AI answer.
             */

            console.error(
                "Conversation save failed:",
                saveError
            );

            /*
             * We intentionally do NOT show:
             *
             * ❌ Unable to connect to backend
             *
             * because the AI already answered.
             */

        }

    }


    // ======================================
    // AI REQUEST ERROR
    // ======================================

    catch (error) {

        console.error(
            "Problem solving failed:",
            error
        );


        if (
            thinking &&
            thinking.parentNode
        ) {

            thinking.remove();

        }


        await addAIMessage(
            "❌ Unable to get a response from the AI backend. Please try again."
        );

    }


    // ======================================
    // Final Scroll
    // ======================================

    scrollBottom();

}
