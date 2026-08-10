
import {
    getHistoryFromDB,
    deleteConversationFromDB,
    clearHistoryFromDB
} from "../api/conversationApi.js";


// ================= DOM Elements =================

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


// ================= Variables =================

let history = [];

let currentTool = "all";


// ================= Load History =================

async function loadHistory() {

    try {

        console.log("Loading history...");

        history = await getHistoryFromDB();

        console.log("History loaded:", history);

        updateStats();

        applyFilters();

    } catch (error) {

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


// ================= Search =================

if (search) {

    search.addEventListener(
        "input",
        applyFilters
    );

}


// ================= Filters =================

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });


                button.classList.add("active");


                currentTool =
                    button.dataset.tool;


                applyFilters();

            }
        );

    });


// ================= Clear All =================

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        async () => {

            console.log("Clear All clicked");


            const confirmed = confirm(
                "Are you sure you want to delete all conversations?"
            );


            if (!confirmed) {
                return;
            }


            try {

                clearBtn.disabled = true;

                const originalText =
                    clearBtn.textContent;

                clearBtn.textContent =
                    "Clearing...";


                // Delete from MongoDB
                await clearHistoryFromDB();


                // Clear local array
                history = [];


                // Remove currently opened conversation
                localStorage.removeItem(
                    "currentConversationId"
                );


                // Reset statistics
                updateStats();


                // Render empty state
                applyFilters();


                clearBtn.textContent =
                    originalText;

                clearBtn.disabled = false;


                alert(
                    "All conversations cleared successfully."
                );


            } catch (error) {

                console.error(
                    "Clear All failed:",
                    error
                );


                clearBtn.disabled = false;

                clearBtn.textContent =
                    "Clear All";


                alert(
                    "Unable to clear history.\n\n" +
                    error.message
                );

            }

        }
    );

}


// ================= Apply Filters =================

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
                (chat.messages?.[0]?.content || "")

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


// ================= Statistics =================

function updateStats() {

    if (totalChats) {

        totalChats.textContent =
            history.length;

    }


    if (problemChats) {

        problemChats.textContent =
            history.filter(
                chat => chat.tool === "problem"
            ).length;

    }


    if (debugChats) {

        debugChats.textContent =
            history.filter(
                chat => chat.tool === "debug"
            ).length;

    }


    if (complexityChats) {

        complexityChats.textContent =
            history.filter(
                chat => chat.tool === "complexity"
            ).length;

    }


    if (testcaseChats) {

        testcaseChats.textContent =
            history.filter(
                chat => chat.tool === "testcase"
            ).length;

    }


    if (algorithmChats) {

        algorithmChats.textContent =
            history.filter(
                chat => chat.tool === "algorithm"
            ).length;

    }

}


// ================= Render History =================

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

        const icon = {

            problem: "📝",

            debug: "🐞",

            complexity: "📊",

            testcase: "🧪",

            algorithm: "📚"

        }[chat.tool] || "💬";


        const card =
            document.createElement("div");


        card.className =
            "history-card";


        const date =
            new Date(
                chat.createdAt
            ).toLocaleString();


        card.innerHTML = `

            <div class="history-content">

                <div class="history-tool">
                    ${icon}
                    ${
                        chat.tool
                            ? chat.tool
                                .charAt(0)
                                .toUpperCase() +
                              chat.tool.slice(1)
                            : "Chat"
                    }
                </div>

                <div class="history-language">
                    ${chat.language || ""}
                </div>

                <div class="history-title">
                    ${chat.title || "New Chat"}
                </div>

                <div class="history-date">
                    ${date}
                </div>

            </div>

            <button
                class="history-delete"
                title="Delete"
            >
                🗑️
            </button>

        `;


        // ================= Open Conversation =================

        card.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "currentConversationId",
                    chat._id
                );


                switch (chat.tool) {

                    case "problem":

                        location.href =
                            "problem.html";

                        break;


                    case "debug":

                        location.href =
                            "debugger.html";

                        break;


                    case "complexity":

                        location.href =
                            "complexity.html";

                        break;


                    case "testcase":

                        location.href =
                            "testcase.html";

                        break;


                    case "algorithm":

                        location.href =
                            "algorithm.html";

                        break;


                    default:

                        location.href =
                            "problem.html";

                }

            }
        );


        // ================= Delete One =================

        const deleteButton =
            card.querySelector(
                ".history-delete"
            );


        deleteButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();


                const confirmed = confirm(
                    "Delete this conversation?"
                );


                if (!confirmed) {
                    return;
                }


                try {

                    await deleteConversationFromDB(
                        chat._id
                    );


                    if (
                        localStorage.getItem(
                            "currentConversationId"
                        ) === chat._id
                    ) {

                        localStorage.removeItem(
                            "currentConversationId"
                        );

                    }


                    await loadHistory();


                } catch (error) {

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


        container.appendChild(card);

    });

}


// ================= Start =================

loadHistory();
```
