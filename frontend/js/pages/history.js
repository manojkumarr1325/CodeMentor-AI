import {
    getHistoryFromDB,
    deleteConversationFromDB,
    clearHistoryFromDB
} from "../api/conversationApi.js";

import {
    setStorageType,
    getHistory,
    setCurrentConversation,
    clearCurrentConversation,
    setActiveChat
} from "../utils/storage.js";


// =====================================================
// DETECT CURRENT TOOL
// =====================================================

const tool =
    document.body.dataset.tool || "problem";


// Make storage specific to this page

setStorageType(tool);


// =====================================================
// DOM ELEMENTS
// =====================================================

const historyList =
    document.getElementById("historyList");

const newChatBtn =
    document.getElementById("newChatBtn");


// =====================================================
// TOOL CONFIGURATION
// =====================================================

const toolConfig = {

    problem: {
        name: "Problem Solver",
        icon: "📝",
        page: "problem.html"
    },

    debug: {
        name: "Debugger",
        icon: "🐞",
        page: "debugger.html"
    },

    complexity: {
        name: "Complexity Analyzer",
        icon: "📊",
        page: "complexity.html"
    },

    testcase: {
        name: "Test Case Generator",
        icon: "🧪",
        page: "testcase.html"
    },

    algorithm: {
        name: "Algorithm Tutor",
        icon: "📚",
        page: "algorithm.html"
    }

};


// =====================================================
// LOAD SIDEBAR HISTORY
// =====================================================

async function loadSidebarHistory() {

    if (!historyList) return;

    try {

        /*
         * Ask MongoDB only for this tool.
         *
         * This is important.
         *
         * Problem page → problem history
         * Debug page → debug history
         * etc.
         */

        const history =
            await getHistoryFromDB(tool);

        renderHistory(history);

    }

    catch (error) {

        console.error(
            `Failed to load ${tool} history:`,
            error
        );

        /*
         * If MongoDB is temporarily unavailable,
         * show local history instead.
         */

        const localHistory =
            getHistory();

        renderHistory(localHistory);

    }

}


// =====================================================
// RENDER SIDEBAR
// =====================================================

function renderHistory(history) {

    if (!historyList) return;

    historyList.innerHTML = "";


    if (!history || history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">
                No recent chats
            </div>

        `;

        return;

    }


    /*
     * Most recent first
     */

    const sortedHistory =
        [...history].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();

                return dateB - dateA;

            }
        );


    sortedHistory.forEach(chat => {

        const card =
            document.createElement("div");

        card.className =
            "history-item";


        /*
         * MongoDB uses _id.
         * Local conversations use id.
         */

        const mongoId =
            chat._id || chat.id;


        const title =
            chat.title ||
            toolConfig[tool]?.name ||
            "New Chat";


        const icon =
            toolConfig[tool]?.icon ||
            "💬";


        card.innerHTML = `

            <div class="history-item-content">

                <div class="history-item-icon">
                    ${icon}
                </div>

                <div class="history-item-info">

                    <div class="history-item-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="history-item-language">
                        ${escapeHTML(
                            chat.language || ""
                        )}
                    </div>

                </div>

            </div>

            <button
                class="history-delete"
                title="Delete conversation"
            >
                🗑️
            </button>

        `;


        // =================================================
        // OPEN CONVERSATION
        // =================================================

        card.addEventListener(
            "click",
            async () => {

                try {

                    /*
                     * IMPORTANT:
                     *
                     * Save this conversation into
                     * the CURRENT TOOL'S storage.
                     *
                     * We do NOT use:
                     *
                     * currentConversationId
                     */

                    const localConversation = {

                        id:
                            chat.id ||
                            Date.now(),

                        _id:
                            chat._id || null,

                        title:
                            chat.title ||
                            "New Chat",

                        question:
                            chat.messages?.[0]?.content ||
                            "",

                        answer:
                            chat.messages?.[
                                chat.messages.length - 1
                            ]?.content ||
                            "",

                        language:
                            chat.language || "",

                        tool:
                            tool,

                        createdAt:
                            chat.createdAt ||
                            new Date().toISOString(),

                        messages:
                            chat.messages || []

                    };


                    /*
                     * Store ONLY in this tool's
                     * current storage.
                     */

                    setCurrentConversation(
                        localConversation
                    );


                    if (mongoId) {

                        setActiveChat(
                            localConversation.id
                        );

                    }


                    /*
                     * Stay on the same page.
                     *
                     * The page will reload the
                     * conversation from its
                     * tool-specific storage.
                     */

                    location.reload();

                }

                catch (error) {

                    console.error(
                        "Unable to open conversation:",
                        error
                    );

                }

            }
        );


        // =================================================
        // DELETE CONVERSATION
        // =================================================

        const deleteButton =
            card.querySelector(
                ".history-delete"
            );


        deleteButton.addEventListener(
            "click",
            async event => {

                /*
                 * Prevent opening the conversation
                 * when delete button is clicked.
                 */

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "Delete this conversation?"
                    );


                if (!confirmed) return;


                try {

                    if (chat._id) {

                        await deleteConversationFromDB(
                            chat._id
                        );

                    }


                    /*
                     * If this is the currently
                     * opened conversation,
                     * clear only THIS tool.
                     */

                    const current =
                        JSON.parse(
                            localStorage.getItem(
                                `codementor_${tool}_current`
                            )
                        );


                    if (
                        current &&
                        (
                            current._id === chat._id ||
                            current.id === chat.id
                        )
                    ) {

                        clearCurrentConversation();

                    }


                    await loadSidebarHistory();


                }

                catch (error) {

                    console.error(
                        "Delete conversation failed:",
                        error
                    );

                    alert(
                        "Unable to delete conversation."
                    );

                }

            }
        );


        historyList.appendChild(card);

    });

}


// =====================================================
// NEW CHAT
// =====================================================

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        () => {

            /*
             * IMPORTANT:
             *
             * Clear only the current tool.
             *
             * Example:
             *
             * Debug → codementor_debug_current
             *
             * NOT all tools.
             */

            clearCurrentConversation();


            /*
             * Also clear the chat UI.
             */

            const chatContainer =
                document.getElementById(
                    "chatContainer"
                );


            if (chatContainer) {

                chatContainer.innerHTML = "";

            }


            /*
             * Show welcome screen again.
             */

            const welcomeScreen =
                document.getElementById(
                    "welcomeScreen"
                );


            if (welcomeScreen) {

                welcomeScreen.style.display =
                    "";

            }


            /*
             * Reload the current page so
             * Monaco/editor state is clean.
             */

            location.reload();

        }
    );

}


// =====================================================
// REFRESH SIDEBAR
// =====================================================

window.refreshSidebar =
    async function () {

        await loadSidebarHistory();

    };


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// START
// =====================================================

loadSidebarHistory();
