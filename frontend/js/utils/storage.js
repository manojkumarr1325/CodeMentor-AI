import { saveConversationToDB } from "../api/conversationApi.js";

let STORAGE_TYPE = "problem";

let HISTORY_KEY = "codementor_problem_history";
let CURRENT_KEY = "codementor_problem_current";
let ACTIVE_CHAT_KEY = "codementor_problem_active";

export function setStorageType(type) {

    STORAGE_TYPE = type;

    HISTORY_KEY = `codementor_${type}_history`;
    CURRENT_KEY = `codementor_${type}_current`;
    ACTIVE_CHAT_KEY = `codementor_${type}_active`;

}

/* ================= History ================= */

export function getHistory() {

    return JSON.parse(
        localStorage.getItem(HISTORY_KEY)
    ) || [];

}

export function getCurrentConversation() {

    return JSON.parse(
        localStorage.getItem(CURRENT_KEY)
    );

}

export function setCurrentConversation(chat) {

    localStorage.setItem(
        CURRENT_KEY,
        JSON.stringify(chat)
    );

}

export function clearCurrentConversation() {

    localStorage.removeItem(CURRENT_KEY);

    localStorage.removeItem(ACTIVE_CHAT_KEY);

}

/* ================= Save Conversation ================= */

export function saveConversation(
    question,
    answer,
    language,
    title = "New Chat",
    tool = STORAGE_TYPE
) {

    const history = getHistory();

    let current = getCurrentConversation();

    /* ================= Existing ================= */

    if (current) {

        if (!current.messages) {
            current.messages = [];
        }

        current.messages.push({
            role: "user",
            content: question
        });

        current.messages.push({
            role: "assistant",
            content: answer
        });

        current.question = question;
        current.answer = answer;
        current.language = language;
        current.tool = tool;

        const index = history.findIndex(
            chat => chat.id === current.id
        );

        if (index !== -1) {

            history[index] = current;

        } else {

            history.unshift(current);

        }

    }

    /* ================= New ================= */

    else {

        current = {

            id: Date.now(),

            _id: null,

            title,

            question,

            answer,

            language,

            tool,

            createdAt: new Date().toISOString(),

            messages: [

                {
                    role: "user",
                    content: question
                },

                {
                    role: "assistant",
                    content: answer
                }

            ]

        };

        history.unshift(current);

    }

    /* ================= Local Storage ================= */

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    localStorage.setItem(
        CURRENT_KEY,
        JSON.stringify(current)
    );

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        current.id
    );

    /* ================= MongoDB ================= */

    saveConversationToDB({

        conversationId:
            current._id || null,

        tool,

        title: current.title,

        language,

        messages: current.messages

    })
    .then(saved => {

        console.log(
            "✅ Conversation saved to MongoDB"
        );

        /*
         * Store MongoDB _id inside the
         * current local conversation.
         */

        if (saved && saved._id) {

            current._id = saved._id;

            localStorage.setItem(
                CURRENT_KEY,
                JSON.stringify(current)
            );

            const updatedHistory =
                getHistory();

            const index =
                updatedHistory.findIndex(
                    chat => chat.id === current.id
                );

            if (index !== -1) {

                updatedHistory[index] = current;

                localStorage.setItem(
                    HISTORY_KEY,
                    JSON.stringify(
                        updatedHistory
                    )
                );

            }

        }

    })
    .catch(err => {

        console.warn(
            "⚠️ MongoDB sync failed:",
            err.message
        );

    });

}

/* ================= Delete ================= */

export function deleteConversation(id) {

    const history =
        getHistory().filter(
            chat => chat.id !== id
        );

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    const current =
        getCurrentConversation();

    if (
        current &&
        current.id === id
    ) {

        clearCurrentConversation();

    }

}

/* ================= Clear History ================= */

export function clearHistory() {

    const keys = [

        "codementor_problem_history",
        "codementor_problem_current",
        "codementor_problem_active",

        "codementor_debug_history",
        "codementor_debug_current",
        "codementor_debug_active",

        "codementor_complexity_history",
        "codementor_complexity_current",
        "codementor_complexity_active",

        "codementor_testcase_history",
        "codementor_testcase_current",
        "codementor_testcase_active",

        "codementor_algorithm_history",
        "codementor_algorithm_current",
        "codementor_algorithm_active"

    ];

    keys.forEach(key => {

        localStorage.removeItem(key);

    });

    localStorage.removeItem(
        "currentConversationId"
    );

}

/* ================= Get Conversation ================= */

export function getConversation(id) {

    return getHistory().find(
        chat => chat.id === id
    );

}

/* ================= Active Chat ================= */

export function setActiveChat(id) {

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        id
    );

}

export function getActiveChat() {

    return localStorage.getItem(
        ACTIVE_CHAT_KEY
    );

}

/* ================= Messages ================= */

export function appendMessage(
    role,
    content
) {

    const current =
        getCurrentConversation();

    if (!current) return;

    if (!current.messages) {

        current.messages = [];

    }

    current.messages.push({

        role,
        content

    });

    setCurrentConversation(current);

    const history =
        getHistory();

    const index =
        history.findIndex(
            chat => chat.id === current.id
        );

    if (index !== -1) {

        history[index] = current;

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );

    }

}

export function getMessages() {

    return (
        getCurrentConversation()
            ?.messages || []
    );

}

/* ================= Statistics ================= */

export function getStats() {

    const history =
        getHistory();

    return {

        total: history.length,

        cpp:
            history.filter(
                x => x.language === "C++"
            ).length,

        c:
            history.filter(
                x => x.language === "C"
            ).length,

        java:
            history.filter(
                x => x.language === "Java"
            ).length,

        python:
            history.filter(
                x => x.language === "Python"
            ).length,

        javascript:
            history.filter(
                x => x.language === "JavaScript"
            ).length

    };

}

/* ================= All History ================= */

export function getAllHistory() {

    const keys = [

        "codementor_problem_history",
        "codementor_debug_history",
        "codementor_complexity_history",
        "codementor_testcase_history",
        "codementor_algorithm_history"

    ];

    let all = [];

    keys.forEach(key => {

        const data =
            JSON.parse(
                localStorage.getItem(key)
            ) || [];

        all = all.concat(data);

    });

    all.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.createdAt
                ).getTime();

            const dateB =
                new Date(
                    b.createdAt
                ).getTime();

            return dateB - dateA;

        }
    );

    return all;

}

/* ================= Delete By Tool ================= */

export function deleteConversationFromTool(
    tool,
    id
) {

    const historyKey =
        `codementor_${tool}_history`;

    const history =
        JSON.parse(
            localStorage.getItem(historyKey)
        ) || [];

    const updated =
        history.filter(
            chat => chat.id !== id
        );

    localStorage.setItem(
        historyKey,
        JSON.stringify(updated)
    );

}
