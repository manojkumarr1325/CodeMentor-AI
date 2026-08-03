import {
    getHistoryFromDB,
    deleteConversationFromDB
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

    }

    catch (err) {

        console.error(err);

        container.innerHTML = `
            <div class="empty">
                Unable to load conversations.
            </div>
        `;

    }

}

await loadHistory();

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

// ================= Clear =================

clearBtn?.addEventListener("click", () => {

    alert("Clear History will be added after MongoDB bulk delete is implemented.");

});

// ================= Apply Filters =================

function applyFilters() {

    const keyword = search.value.trim().toLowerCase();

    const filtered = history.filter(chat => {

        const text = (
            (chat.title || "") +
            " " +
            (chat.messages?.[0]?.content || "")
        ).toLowerCase();

        const matchesSearch = text.includes(keyword);

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
        history.filter(x => x.tool === "problem").length;

    debugChats.textContent =
        history.filter(x => x.tool === "debug").length;

    complexityChats.textContent =
        history.filter(x => x.tool === "complexity").length;

    testcaseChats.textContent =
        history.filter(x => x.tool === "testcase").length;

    algorithmChats.textContent =
        history.filter(x => x.tool === "algorithm").length;

}

// ================= Render =================

function render(list) {

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

        const date = new Date(chat.createdAt)
            .toLocaleString();

        card.innerHTML = `

<div class="history-delete" title="Delete Conversation">
🗑️
</div>

<div class="history-tool">

${icon}
${chat.tool.charAt(0).toUpperCase() + chat.tool.slice(1)}

</div>

<div class="history-language">

${chat.language || ""}

</div>

<h2>

${chat.title || "New Chat"}

</h2>

<div class="meta">

${date}

</div>

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

        // ================= Delete Conversation =================

        card.querySelector(".history-delete")
            .addEventListener("click", async (e) => {

                e.stopPropagation();

                if (!confirm("Delete this conversation?"))
                    return;

                try {

                    await deleteConversationFromDB(chat._id);

                    if (
                        localStorage.getItem("currentConversationId") === chat._id
                    ) {

                        localStorage.removeItem("currentConversationId");

                    }

                    await loadHistory();

                }

                catch (err) {

                    console.error(err);

                    alert("Unable to delete conversation.");

                }

            });

        container.appendChild(card);

    });

}