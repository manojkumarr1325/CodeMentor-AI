import {
    getHistoryFromDB,
    deleteConversationFromDB
} from "../api/conversationApi.js";


const historyList =
    document.getElementById("historyList");

const newChatBtn =
    document.getElementById("newChatBtn");


// ================= Render Sidebar =================

async function renderSidebar() {

    if (!historyList) {
        return;
    }


    const currentConversationId =
        localStorage.getItem(
            "currentConversationId"
        );


    let history = [];


    try {

        /*
         * Get the current page/tool.
         *
         * Example:
         * problem
         * debug
         * complexity
         * testcase
         * algorithm
         */

        const tool =
            document.body.dataset.tool;


        history =
            await getHistoryFromDB(tool || "");


    } catch (error) {

        console.error(
            "Unable to load sidebar history:",
            error
        );


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

        const item =
            document.createElement("div");


        item.className =
            chat._id === currentConversationId
                ? "history-item active"
                : "history-item";


        item.innerHTML = `

            <div class="history-title">

                📄 ${chat.title || "New Chat"}

            </div>

            <div class="history-language">

                ${chat.language || ""}

            </div>

            <button
                class="history-delete"
                title="Delete"
            >
                🗑️
            </button>

        `;


        // ================= Open Conversation =================

        item.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "currentConversationId",
                    chat._id
                );


                location.reload();

            }
        );


        // ================= Delete Conversation =================

        const deleteButton =
            item.querySelector(
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


                    await renderSidebar();


                } catch (error) {

                    console.error(
                        "Unable to delete conversation:",
                        error
                    );


                    alert(
                        "Unable to delete conversation."
                    );

                }

            }
        );


        historyList.appendChild(item);

    });

}


// ================= New Chat =================

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        () => {

            console.log(
                "New Chat clicked"
            );


            // --------------------------------
            // Remove MongoDB current ID
            // --------------------------------

            localStorage.removeItem(
                "currentConversationId"
            );


            // --------------------------------
            // Remove current conversation
            // for every tool
            // --------------------------------

            const currentKeys = [

                "codementor_problem_current",

                "codementor_debug_current",

                "codementor_complexity_current",

                "codementor_testcase_current",

                "codementor_algorithm_current"

            ];


            currentKeys.forEach(key => {

                localStorage.removeItem(key);

            });


            // --------------------------------
            // Remove active chat
            // for every tool
            // --------------------------------

            const activeKeys = [

                "codementor_problem_active",

                "codementor_debug_active",

                "codementor_complexity_active",

                "codementor_testcase_active",

                "codementor_algorithm_active"

            ];


            activeKeys.forEach(key => {

                localStorage.removeItem(key);

            });


            // --------------------------------
            // Reload current tool page
            // --------------------------------

            window.location.reload();

        }
    );

}


// ================= Global Sidebar Refresh =================

window.refreshSidebar =
    renderSidebar;


// ================= Initial Load =================

renderSidebar();
```
