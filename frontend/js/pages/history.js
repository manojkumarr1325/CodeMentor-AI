import {
    getHistoryFromDB,
    deleteConversationFromDB
} from "../api/conversationApi.js";

const historyList = document.getElementById("historyList");
const newChatBtn = document.getElementById("newChatBtn");



async function renderSidebar() {

    const currentConversationId =
        localStorage.getItem("currentConversationId");

    if (!historyList) return;

    let history = [];

    try {

        const tool = document.body.dataset.tool;

        history = await getHistoryFromDB(tool);

    } catch (err) {

        console.error("Unable to load history", err);

        historyList.innerHTML = `
            <div class="history-empty">
                Unable to load history
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="history-empty">
                No conversations yet
            </div>
        `;

        return;
    }

    history.forEach(chat => {

        const item = document.createElement("div");

        item.className =
            chat._id === currentConversationId
                ? "history-item active"
                : "history-item";

        item.innerHTML = `

<div class="history-content">

    <div class="history-title">

        📄 ${chat.title || "New Chat"}

    </div>

    <div class="history-language">

        ${chat.language || ""}

    </div>

</div>

<div class="history-actions">

    <button class="history-delete" title="Delete">
        🗑️
    </button>

</div>

`;

        // Open Conversation
        item.addEventListener("click", () => {

            localStorage.setItem(
                "currentConversationId",
                chat._id
            );

            location.reload();

        });

        // Delete Conversation
        item.querySelector(".history-delete")
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

                    await renderSidebar();

                }
                catch(err){

                    console.error(err);

                }

            });

        historyList.appendChild(item);

    });

}

// New Chat
if (newChatBtn) {

    newChatBtn.onclick = () => {


        // MongoDB current conversation
        localStorage.removeItem(
            "currentConversationId"
        );


        // Clear all tool current chats
        const keys = [

            "codementor_problem_current",
            "codementor_algorithm_current",
            "codementor_debug_current",
            "codementor_complexity_current",
            "codementor_testcase_current",

            "codementor_problem_active",
            "codementor_algorithm_active",
            "codementor_debug_active",
            "codementor_complexity_active",
            "codementor_testcase_active"

        ];


        keys.forEach(key => {

            localStorage.removeItem(key);

        });


        window.location.reload();

    };

}

window.refreshSidebar = renderSidebar;

renderSidebar();