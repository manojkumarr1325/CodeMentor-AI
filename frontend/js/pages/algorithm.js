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
    getCurrentConversation,
    setCurrentConversation,
    clearCurrentConversation,
    getHistory,
    setActiveChat
} from "../utils/storage.js";

import {
    saveConversationToDB,
    getConversationFromDB
} from "../api/conversationApi.js";


// ==========================================
// Storage Setup
// ==========================================

setStorageType("algorithm");
localStorage.setItem("currentTool", "algorithm");


// ==========================================
// DOM Elements
// ==========================================

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");


// ==========================================
// Initialize Monaco Editor
// ==========================================

initializeEditor(solveProblem);


setTimeout(() => {

    updateEditorTheme();

}, 200);


setTimeout(() => {

    if(language){
        setLanguage(language.value);
    }

}, 500);


if(language){

    language.addEventListener(
        "change",
        () => {

            setLanguage(language.value);

        }
    );

}


let firstQuery = true;

let savedConversation =
    getCurrentConversation();

if (
    savedConversation &&
    savedConversation.tool !== "algorithm"
) {

    clearCurrentConversation();

    savedConversation = null;

}

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

    scrollBottom();

    attachCopyButtons();

}



// ==========================================
// Events
// ==========================================

if(solveBtn){

    solveBtn.addEventListener(
        "click",
        solveProblem
    );

}



// ==========================================
// Solve Algorithm Query
// ==========================================

async function solveProblem() {

    const question = getEditorText().trim();

    if (!question) {
        return;
    }

    if (firstQuery) {

        welcomeScreen.style.display = "none";

        firstQuery = false;
    }

    addUserMessage(question);

    clearEditor();

    const thinking = addThinkingMessage();

    scrollBottom();

    try {

        // ==========================================
        // Previous Messages
        // ==========================================

        const current = getCurrentConversation();

        const currentId =
            current?._id || null;

        const previousMessages =
            current?.messages || [];


        // ==========================================
        // AI REQUEST
        // ==========================================

        const response = await fetch(
            `${CONFIG.API_BASE}/algorithm`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    question,

                    language:
                        language?.value || "C++",

                    messages:
                        previousMessages

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Algorithm request failed"
            );

        }


        // Remove thinking animation
        thinking.remove();


        // ==========================================
        // DISPLAY AI ANSWER
        // ==========================================

        await addAIMessage(
            data.answer
        );


        // ==========================================
        // TITLE GENERATION
        // ==========================================

        let chatTitle = "New Chat";

        try {

            const titleResponse =
                await fetch(
                    `${CONFIG.API_BASE}/title`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            question
                        })
                    }
                );


            if (titleResponse.ok) {

                const titleData =
                    await titleResponse.json();

                chatTitle =
                    titleData.title ||
                    chatTitle;

            }

        }
        catch (titleError) {

            console.error(
                "Title generation failed:",
                titleError
            );

            // Do NOT show backend error to user.
            // Just use default title.

        }


        // ==========================================
        // SAVE CONVERSATION
        // ==========================================

        try {

            const saved =
                await saveConversationToDB({

                    conversationId:
                        currentId || null,

                    tool:
                        "algorithm",

                    title:
                        chatTitle,

                    language:
                        language?.value || "C++",

                    messages: [

                        ...previousMessages,

                        {
                            role: "user",
                            content: question
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


            // Refresh sidebar
            if (window.refreshSidebar) {

                await window.refreshSidebar();

            }

        }
        catch (saveError) {

            console.error(
                "Conversation save failed:",
                saveError
            );

            // Answer is already displayed.
            // Do NOT show "Unable to connect to backend."

        }


        attachCopyButtons();

    }
    catch (error) {

        console.error(
            "Algorithm request failed:",
            error
        );


        thinking.remove();


        await addAIMessage(
            "❌ Unable to connect to backend."
        );

    }


    scrollBottom();

}
