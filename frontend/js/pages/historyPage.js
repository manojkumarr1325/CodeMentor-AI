import {
    getHistoryFromDB,
    deleteConversationFromDB,
    clearHistoryFromDB
} from "../api/conversationApi.js";

import {
    setStorageType,
    setCurrentConversation,
    clearHistory as clearLocalHistory
} from "../utils/storage.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const container =
    document.getElementById("historyContainer");

const search =
    document.getElementById("searchInput");

const clearBtn =
    document.getElementById("clearBtn");

const totalChats =
    document.getElementById("totalCount");

const problemChats =
    document.getElementById("problemCount");

const debugChats =
    document.getElementById("debugCount");

const complexityChats =
    document.getElementById("complexityCount");

const testcaseChats =
    document.getElementById("testcaseCount");

const algorithmChats =
    document.getElementById("algorithmCount");


// =====================================================
// VARIABLES
// =====================================================

let history = [];

let currentTool = "all";


// =====================================================
// TOOL CONFIG
// =====================================================

const toolConfig = {

    problem: {
        icon: "📝",
        page: "problem.html"
    },

    debug: {
        icon: "🐞",
        page: "debugger.html"
    },

    complexity: {
        icon: "📊",
        page: "complexity.html"
    },

    testcase: {
        icon: "🧪",
        page: "testcase.html"
    },

    algorithm: {
        icon: "📚",
        page: "algorithm.html"
    }

};


// =====================================================
// LOAD HISTORY
// =====================================================

async function loadHistory() {

    try {

        console.log(
            "Loading complete history..."
        );

        history =
            await getHistoryFromDB();

        console.log(
            "History loaded:",
            history
        );

        updateStats();

        applyFilters();

    }

    catch (error) {

        console.error(
            "Unable to load history:",
            error
        );

        if (container) {

            container.innerHTML = `

                <div class="empty">

                    Unable to load conversations.

                </div>

            `;

        }

    }

}


// =====================================================
// SEARCH
// =====================================================

if (search) {

    search.addEventListener(
        "input",
        applyFilters
    );

}


// =====================================================
// FILTER BUTTONS
// =====================================================

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentTool =
                    button.dataset.tool;


                applyFilters();

            }
        );

    });


// ================= Clear All =================

clearBtn?.addEventListener("click", async () => {

    if (history.length === 0) {
        alert("There is no history to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear all conversations?"
    );

    if (!confirmed) return;

    try {

        clearBtn.disabled = true;
        clearBtn.textContent = "Clearing...";

        await clearHistoryFromDB();

        history = [];

        localStorage.removeItem("currentConversationId");

        updateStats();

        applyFilters();

        alert("All conversations have been cleared.");

    } catch (err) {

        console.error("Clear history error:", err);

        alert("Unable to clear history.");

    } finally {

        clearBtn.disabled = false;
        clearBtn.textContent = "Clear All";

    }

});

// =====================================================
// APPLY FILTERS
// =====================================================

function applyFilters() {

    const keyword =
        search?.value
            .trim()
            .toLowerCase() || "";


    const filtered =
        history.filter(chat => {

            const text = (

                (chat.title || "") +

                " " +

                (
                    chat.messages?.[0]?.content ||
                    ""
                )

            ).toLowerCase();


            const matchesSearch =
                text.includes(keyword);


            const matchesTool =
                currentTool === "all" ||
                chat.tool === currentTool;


            return (
                matchesSearch &&
                matchesTool
            );

        });


    render(filtered);

}


// =====================================================
// STATISTICS
// =====================================================

function updateStats() {

    if (totalChats) {

        totalChats.textContent =
            history.length;

    }


    if (problemChats) {

        problemChats.textContent =
            history.filter(
                chat =>
                    chat.tool === "problem"
            ).length;

    }


    if (debugChats) {

        debugChats.textContent =
            history.filter(
                chat =>
                    chat.tool === "debug"
            ).length;

    }


    if (complexityChats) {

        complexityChats.textContent =
            history.filter(
                chat =>
                    chat.tool === "complexity"
            ).length;

    }


    if (testcaseChats) {

        testcaseChats.textContent =
            history.filter(
                chat =>
                    chat.tool === "testcase"
            ).length;

    }


    if (algorithmChats) {

        algorithmChats.textContent =
            history.filter(
                chat =>
                    chat.tool === "algorithm"
            ).length;

    }

}


// =====================================================
// RENDER HISTORY
// =====================================================

function render(list) {

    if (!container) {

        console.error(
            "historyContainer not found"
        );

        return;

    }


    if (list.length === 0) {

        container.innerHTML = `

            <div class="empty">

                No conversations found.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    list.forEach(chat => {

        const tool =
            chat.tool || "problem";


        const config =
            toolConfig[tool] ||
            toolConfig.problem;


        const icon =
            config.icon;


        const date =
            chat.createdAt
                ? new Date(
                    chat.createdAt
                ).toLocaleString()
                : "";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "history-card";


        card.innerHTML = `

            <div class="history-icon">

                ${icon}

            </div>


            <div class="history-info">

                <div class="history-tool">

                    ${escapeHTML(
                        formatToolName(tool)
                    )}

                </div>


                <div class="history-language">

                    ${escapeHTML(
                        chat.language || ""
                    )}

                </div>


                <div class="history-title">

                    ${escapeHTML(
                        chat.title ||
                        "New Chat"
                    )}

                </div>


                <div class="history-date">

                    ${escapeHTML(date)}

                </div>

            </div>


            <button
                class="history-delete"
                title="Delete"
            >

                🗑️

            </button>

        `;


        // =================================================
        // OPEN CONVERSATION
        // =================================================

        card.addEventListener(
            "click",
            () => {

                openConversation(
                    chat
                );

            }
        );


        // =================================================
        // DELETE ONE
        // =================================================

        const deleteButton =
            card.querySelector(
                ".history-delete"
            );


        deleteButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "Delete this conversation?"
                    );


                if (!confirmed) {

                    return;

                }


                try {

                    // -------------------------------------
                    // Delete MongoDB conversation
                    // -------------------------------------

                    if (chat._id) {

                        await deleteConversationFromDB(
                            chat._id
                        );

                    }


                    // -------------------------------------
                    // Clear only this tool's current chat
                    // -------------------------------------

                    clearToolCurrentConversation(
                        chat
                    );


                    // -------------------------------------
                    // Remove from local history
                    // -------------------------------------

                    history =
                        history.filter(
                            item =>
                                item._id !==
                                chat._id
                        );


                    updateStats();

                    applyFilters();

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


        container.appendChild(
            card
        );

    });

}


// =====================================================
// OPEN CONVERSATION
// =====================================================

function openConversation(chat) {

    const tool =
        chat.tool || "problem";


    const config =
        toolConfig[tool];


    if (!config) {

        console.error(
            "Unknown conversation tool:",
            tool
        );

        return;

    }


    /*
     * IMPORTANT
     *
     * We no longer use:
     *
     * currentConversationId
     *
     * Instead we use:
     *
     * codementor_<tool>_current
     */


    setStorageType(tool);


    const localConversation = {

        id:
            chat.id ||
            Date.now(),

        _id:
            chat._id ||
            null,

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
            chat.language ||
            "",

        tool:
            tool,

        createdAt:
            chat.createdAt ||
            new Date().toISOString(),

        messages:
            chat.messages ||
            []

    };


    /*
     * Store inside:
     *
     * codementor_problem_current
     * codementor_debug_current
     * codementor_complexity_current
     * codementor_testcase_current
     * codementor_algorithm_current
     */

    setCurrentConversation(
        localConversation
    );


    /*
     * Remove the old global mechanism.
     */

    localStorage.removeItem(
        "currentConversationId"
    );


    console.log(
        `Opening ${tool} conversation`
    );


    /*
     * Go to the correct page.
     */

    location.href =
        config.page;

}


// =====================================================
// CLEAR CURRENT CONVERSATION FOR ONE TOOL
// =====================================================

function clearToolCurrentConversation(
    chat
) {

    if (!chat || !chat.tool) {

        return;

    }


    const tool =
        chat.tool;


    const currentKey =
        `codementor_${tool}_current`;


    const activeKey =
        `codementor_${tool}_active`;


    const current =
        JSON.parse(
            localStorage.getItem(
                currentKey
            )
        );


    if (!current) {

        return;

    }


    const sameMongoConversation =
        current._id &&
        chat._id &&
        current._id === chat._id;


    const sameLocalConversation =
        current.id &&
        chat.id &&
        String(current.id) ===
        String(chat.id);


    if (
        sameMongoConversation ||
        sameLocalConversation
    ) {

        localStorage.removeItem(
            currentKey
        );

        localStorage.removeItem(
            activeKey
        );

    }

}


// =====================================================
// FORMAT TOOL NAME
// =====================================================

function formatToolName(tool) {

    const names = {

        problem:
            "Problem Solver",

        debug:
            "Debugger",

        complexity:
            "Complexity Analyzer",

        testcase:
            "Test Case Generator",

        algorithm:
            "Algorithm Tutor"

    };


    return (
        names[tool] ||
        "Chat"
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// START
// =====================================================

loadHistory();
