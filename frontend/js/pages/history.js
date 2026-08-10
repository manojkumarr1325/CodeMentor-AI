import {
    getHistoryFromDB,
    deleteConversationFromDB,
    clearHistoryFromDB
} from "../api/conversationApi.js";

const container = document.getElementById("historyContainer");
const search = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

const totalChats = document.getElementById("totalCount");
const problemChats = document.getElementById("problemCount");
const debugChats = document.getElementById("debugCount");
const complexityChats = document.getElementById("complexityCount");
const testcaseChats = document.getElementById("testcaseCount");
const algorithmChats = document.getElementById("algorithmCount");

let history = [];
let currentTool = "all";


// ================= Load History =================

async function loadHistory() {

    try {

        history = await getHistoryFromDB();

        updateStats();

        applyFilters();

    } catch (err) {

        console.error("Unable to load history:", err);

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

search?.addEventListener("input", applyFilters);


// ================= Filters =================

document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document
            .querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        currentTool = btn.dataset.tool;

        applyFilters();

    });

});


// ================= Clear All =================

clearBtn?.addEventListener("click", async () => {

    const confirmDelete = confirm(
        "Are you sure you want to delete all conversations?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        clearBtn.disabled = true;

        const originalText = clearBtn.textContent;

        clearBtn.textContent = "Clearing...";


        // Delete all conversations from MongoDB
        await clearHistoryFromDB();


        // Clear local history array
        history = [];


        // Remove current MongoDB conversation ID
        localStorage.removeItem("currentConversationId");


        // Reset statistics
        updateStats();


        // Show empty history
        applyFilters();


        clearBtn.textContent = originalText;

        clearBtn.disabled = false;

        alert("History cleared successfully.");

    } catch (err) {

        console.error("Clear All error:", err);

        clearBtn.disabled = false;

        clearBtn.textContent = "Clear All";

        alert(
            "Unable to clear history.\n\n" +
            err.message
        );

    }

});


// ================= Apply Filters =================

function applyFilters() {

    const keyword =
        search?.value.trim().toLowerCase() || "";

    const filtered = history.filter(chat => {

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

        return matchesSearch && matchesTool;

    });

    render(filtered);

}


// ================= Statistics =================

function updateStats() {

    totalChats.textContent = history.length;

    problemChats.textContent =
        history.filter(
            x => x.tool === "problem"
        ).length;

    debugChats.textContent =
        history.filter(
            x => x.tool === "debug"
        ).length;

    complexityChats.textContent =
        history.filter(
            x => x.tool === "complexity"
        ).length;

    testcaseChats.textContent =
        history.filter(
            x => x.tool === "testcase"
        ).length;

    algorithmChats.textContent =
        history.filter(
            x => x.tool === "algorithm"
        ).length;

}


// ================= Render =================

function render(list) {

    if (!container) {
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


        const card = document.createElement("div");

        card.className = "history-card";


        const date = new Date(
            chat.createdAt
        ).toLocaleString();


        /*
         * Keep the simple card structure.
         * Do NOT change this structure unnecessarily,
         * because your existing CSS/sidebar may depend on it.
         */

        card.innerHTML = `

            <div class="history-content">

                <div class="history-tool">
                    ${icon}
                    ${
                        chat.tool
                            ? chat.tool.charAt(0).toUpperCase() +
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

        card.addEventListener("click", () => {

            localStorage.setItem(
                "currentConversationId",
                chat._id
            );


            switch (chat.tool) {

                case "problem":
                    location.href = "problem.html";
                    break;

                case "debug":
                    location.href = "debugger.html";
                    break;

                case "complexity":
                    location.href = "complexity.html";
                    break;

                case "testcase":
                    location.href = "testcase.html";
                    break;

                case "algorithm":
                    location.href = "algorithm.html";
                    break;

                default:
                    location.href = "problem.html";

            }

        });


        // ================= Delete One =================

        const deleteButton =
            card.querySelector(".history-delete");


        deleteButton.addEventListener(
            "click",
            async (e) => {

                e.stopPropagation();


                const confirmDelete = confirm(
                    "Delete this conversation?"
                );

                if (!confirmDelete) {
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

                } catch (err) {

                    console.error(
                        "Delete conversation error:",
                        err
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
