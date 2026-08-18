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
    setActiveChat
} from "../utils/storage.js";

import {
    saveConversationToDB,
    getConversationFromDB
} from "../api/conversationApi.js";


// ==========================================
// STORAGE
// ==========================================

setStorageType("problem");

localStorage.setItem(
    "currentTool",
    "problem"
);


// ==========================================
// DOM
// ==========================================

const solveBtn =
    document.getElementById("solveBtn");

const language =
    document.getElementById("language");

const welcomeScreen =
    document.getElementById("welcomeScreen");


// ==========================================
// INITIALIZE EDITOR
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
// LOAD CURRENT CONVERSATION
// ==========================================

let firstQuery = true;

let savedConversation =
    getCurrentConversation();


/*
 * Make sure the conversation belongs
 * to the Problem Solver.
 */

if (
    savedConversation &&
    savedConversation.tool !== "problem"
) {

    clearCurrentConversation();

    savedConversation = null;

}


/*
 * Display saved conversation
 */

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


// ==========================================
// EVENTS
// ==========================================

if (solveBtn) {

    solveBtn.addEventListener(
        "click",
        solveProblem
    );

}


// ==========================================
// SOLVE PROBLEM
// ==========================================

async function solveProblem() {

    const problem =
        getEditorText().trim();


    if (!problem) {

        return;

    }


    // ======================================
    // FIRST QUERY
    // ======================================

    if (firstQuery) {

        welcomeScreen.style.display =
            "none";

        firstQuery = false;

    }


    // ======================================
    // USER MESSAGE
    // ======================================

    addUserMessage(
        problem
    );


    clearEditor();


    const thinking =
        addThinkingMessage();


    scrollBottom();


    // ======================================
    // GET CURRENT CONVERSATION
    // ======================================

    const current =
        getCurrentConversation();


    const currentId =
        current?._id || null;


    let previousMessages =
        current?.messages || [];


    // ======================================
    // GET LATEST VERSION FROM DATABASE
    // ======================================

    if (currentId) {

        try {

            const conversation =
                await getConversationFromDB(
                    currentId
                );


            if (conversation) {

                previousMessages =
                    conversation.messages || [];

            }

        }

        catch (err) {

            console.error(
                "Conversation load failed:",
                err
            );

            /*
             * Continue solving even if
             * previous history cannot load.
             */

        }

    }


    // ======================================
    // CALL AI
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


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "AI request failed"
            );

        }


        if (!data.answer) {

            throw new Error(
                "No answer received"
            );

        }


        // ==================================
        // REMOVE THINKING
        // ==================================

        thinking.remove();


        // ==================================
        // SHOW AI ANSWER
        // ==================================

        await addAIMessage(
            data.answer
        );


        // ==================================
        // GENERATE TITLE
        // ==================================

        let chatTitle =
            current?.title ||
            "New Chat";


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

                            question:
                                problem

                        })

                    }
                );


            const titleData =
                await titleResponse.json();


            if (titleResponse.ok) {

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

        }


        // ==================================
        // SAVE CONVERSATION
        // ==================================

        const updatedMessages = [

            ...previousMessages,

            {

                role: "user",

                content:
                    problem

            },

            {

                role: "assistant",

                content:
                    data.answer

            }

        ];


        /*
         * Save to MongoDB.
         *
         * This is separated from the AI
         * request so a save/token error
         * does not produce a fake AI error.
         */

        try {

            const saved =
                await saveConversationToDB({

                    conversationId:
                        currentId,

                    tool:
                        "problem",

                    title:
                        chatTitle,

                    language:
                        language?.value || "cpp",

                    messages:
                        updatedMessages

                });


            // ==================================
            // UPDATE LOCAL CURRENT CONVERSATION
            // ==================================

            const localConversation = {

                id:
                    saved?.id ||
                    saved?._id ||
                    current?.id ||
                    Date.now(),

                _id:
                    saved?._id ||
                    current?._id ||
                    null,

                title:
                    chatTitle,

                question:
                    problem,

                answer:
                    data.answer,

                language:
                    language?.value || "cpp",

                tool:
                    "problem",

                createdAt:
                    saved?.createdAt ||
                    current?.createdAt ||
                    new Date().toISOString(),

                messages:
                    updatedMessages

            };


            setCurrentConversation(
                localConversation
            );


            if (
                saved &&
                saved._id
            ) {

                setActiveChat(
                    localConversation.id
                );

            }


            // ==================================
            // REFRESH SIDEBAR
            // ==================================

            if (
                window.refreshSidebar
            ) {

                await window.refreshSidebar();

            }


        }

        catch (saveError) {

            /*
             * IMPORTANT:
             *
             * If MongoDB returns 401,
             * DO NOT show an AI error.
             *
             * The AI answer is already
             * successfully displayed.
             */

            console.error(
                "Conversation save failed:",
                saveError
            );

        }


        attachCopyButtons();

    }


    // ======================================
    // AI ERROR
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


    scrollBottom();

}
