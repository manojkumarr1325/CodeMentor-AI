import {
    getHistoryFromDB,
    deleteConversationFromDB,
    clearHistoryFromDB
} from "../api/conversationApi.js";


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

        console.error(
            "Unable to load history:",
            err
        );

        container.innerHTML = `
            <div class="empty">
                Unable to load conversations.
            </div>
        `;

    }

}


await loadHistory();


// ================= Search =================

search?.addEventListener(
    "input",
    applyFilters
);


// ================= Filters =================

document
    .querySelectorAll(".filter-btn")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(b =>
                        b.classList.remove("active")
                    );

                btn.classList.add("active");

                currentTool =
                    btn.dataset.tool;

                applyFilters();

            }
        );

    });


// ================= Clear All =================

clearBtn?.addEventListener(
    "click",
    async () => {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete ALL conversations?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            clearBtn.disabled = true;

            clearBtn.textContent =
                "Clearing...";


            await clearHistoryFromDB();


            // Clear local history
            history = [];


            // Remove current conversation
            localStorage.removeItem(
                "currentConversationId"
            );


            // Reset statistics
            updateStats();


            // Update UI
            applyFilters();


            alert(
                "All conversations have been cleared successfully."
            );


        }

        catch (err) {

            console.error(
                "Clear history error:",
                err
            );

            alert(
                "Unable to clear history.\n\n" +
                err.message
            );

        }

        finally {

            clearBtn.disabled = false;

            clearBtn.textContent =
                "Clear All";

        }

    }
);


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
                x => x.tool === "problem"
            ).length;

    }


    if (debugChats) {

        debugChats.textContent =
            history.filter(
                x => x.tool === "debug"
            ).length;

    }


    if (complexityChats) {

        complexityChats.textContent =
            history.filter(
                x => x.tool === "complexity"
            ).length;

    }


    if (testcaseChats) {

        testcaseChats.textContent =
            history.filter(
                x => x.tool === "testcase"
            ).length;

    }


    if (algorithmChats) {

        algorithmChats.textContent =
            history.filter(
                x => x.tool === "algorithm"
            ).length;

    }

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


        const card =
            document.createElement("div");


        card.className =
            "history-card";


        const date =
            new Date(
                chat.createdAt
            ).toLocaleString();


        card.innerHTML = `

            <div class="history-icon">
                ${icon}
            </div>

            <div class="history-info">

                <div class="history-tool">
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

        card
            .querySelector(".history-delete")
            .addEventListener(
                "click",
                async (e) => {

                    e.stopPropagation();


                    if (
                        !confirm(
                            "Delete this conversation?"
                        )
                    ) {

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

                    }

                    catch (err) {

                        console.error(
                            "Delete error:",
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
