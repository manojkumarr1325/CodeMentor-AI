import {
    getHistoryFromDB,
    getConversationFromDB
} from "../api/conversationApi.js";

import {
    setCurrentConversation,
    setStorageType
} from "../utils/storage.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const totalChats =
    document.getElementById("totalChats");

const cppCount =
    document.getElementById("cppCount");

const cCount =
    document.getElementById("cCount");

const javaCount =
    document.getElementById("javaCount");

const pythonCount =
    document.getElementById("pythonCount");

const jsCount =
    document.getElementById("jsCount");

const container =
    document.getElementById("recentActivity");


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const history =
            await getHistoryFromDB();

        console.log(
            "Dashboard history:",
            history
        );

        updateStatistics(history);

        loadRecentActivity(history);

    }

    catch (error) {

        console.error(
            "Unable to load dashboard:",
            error
        );

        showEmptyStatistics();

        showEmptyActivity();

    }

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics(history) {

    if (totalChats) {

        totalChats.textContent =
            history.length;

    }


    if (cppCount) {

        cppCount.textContent =
            history.filter(chat =>
                normalizeLanguage(
                    chat.language
                ) === "cpp"
            ).length;

    }


    if (cCount) {

        cCount.textContent =
            history.filter(chat =>
                normalizeLanguage(
                    chat.language
                ) === "c"
            ).length;

    }


    if (javaCount) {

        javaCount.textContent =
            history.filter(chat =>
                normalizeLanguage(
                    chat.language
                ) === "java"
            ).length;

    }


    if (pythonCount) {

        pythonCount.textContent =
            history.filter(chat =>
                normalizeLanguage(
                    chat.language
                ) === "python"
            ).length;

    }


    if (jsCount) {

        jsCount.textContent =
            history.filter(chat =>
                normalizeLanguage(
                    chat.language
                ) === "javascript"
            ).length;

    }

}


// ==========================================
// NORMALIZE LANGUAGE
// ==========================================

function normalizeLanguage(language) {

    const value =
        String(language || "")
            .trim()
            .toLowerCase();


    const languageMap = {

        "c++": "cpp",

        "cpp": "cpp",

        "c": "c",

        "java": "java",

        "python": "python",

        "javascript": "javascript",

        "js": "javascript"

    };


    return languageMap[value] ||
        value;

}


// ==========================================
// RECENT ACTIVITY
// ==========================================

function loadRecentActivity(history) {

    if (!container) return;


    if (!history || history.length === 0) {

        showEmptyActivity();

        return;

    }


    container.innerHTML = "";


    // ==========================================
    // SORT BY MOST RECENT
    // ==========================================

    const recentChats =
        [...history]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        a.updatedAt ||
                        a.createdAt ||
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.updatedAt ||
                        b.createdAt ||
                        0
                    ).getTime();


                return dateB - dateA;

            })
            .slice(0, 5);


    // ==========================================
    // CREATE ACTIVITY CARDS
    // ==========================================

    recentChats.forEach(chat => {

        const tool =
            chat.tool || "problem";


        const iconMap = {

            problem: "📝",

            debug: "🐞",

            complexity: "📊",

            testcase: "🧪",

            algorithm: "📚"

        };


        const toolNameMap = {

            problem: "Problem Solver",

            debug: "Debugger",

            complexity:
                "Complexity Analyzer",

            testcase:
                "Test Case Generator",

            algorithm:
                "Algorithm Tutor"

        };


        const icon =
            iconMap[tool] || "💬";


        const toolName =
            toolNameMap[tool] ||
            "CodeMentor AI";


        const title =
            chat.title ||
            chat.messages?.[0]?.content
                ?.substring(0, 70) ||
            "Untitled Conversation";


        const language =
            formatLanguage(
                chat.language
            );


        const date =
            formatDate(
                chat.updatedAt ||
                chat.createdAt
            );


        const card =
            document.createElement("div");


        card.className =
            "activity-card";


        card.innerHTML = `

            <div class="activity-language">

                ${icon} ${escapeHTML(toolName)}

            </div>


            <div class="activity-title">

                ${escapeHTML(title)}

            </div>


            <div class="activity-meta">

                ${escapeHTML(language)}

            </div>


            <div class="activity-date">

                ${escapeHTML(date)}

            </div>

        `;


        // ======================================
        // OPEN CONVERSATION
        // ======================================

        card.addEventListener(
            "click",
            async () => {

                try {

                    setStorageType(tool);


                    /*
                     * Store the MongoDB
                     * conversation in the
                     * correct tool storage.
                     */

                    const conversation = {

                        id:
                            chat.id ||
                            chat._id,

                        _id:
                            chat._id,

                        title:
                            chat.title ||
                            "New Chat",

                        tool:

                            tool,

                        language:

                            chat.language || "",

                        messages:

                            chat.messages || [],

                        createdAt:

                            chat.createdAt

                    };


                    setCurrentConversation(
                        conversation
                    );


                    /*
                     * Also save MongoDB ID.
                     */

                    if (chat._id) {

                        localStorage.setItem(

                            "currentConversationId",

                            chat._id

                        );

                    }


                    switch (tool) {

                        case "problem":

                            window.location.href =
                                "problem.html";

                            break;


                        case "debug":

                            window.location.href =
                                "debugger.html";

                            break;


                        case "complexity":

                            window.location.href =
                                "complexity.html";

                            break;


                        case "testcase":

                            window.location.href =
                                "testcase.html";

                            break;


                        case "algorithm":

                            window.location.href =
                                "algorithm.html";

                            break;


                        default:

                            window.location.href =
                                "problem.html";

                    }

                }

                catch (error) {

                    console.error(

                        "Unable to open conversation:",

                        error

                    );

                }

            }

        );


        container.appendChild(card);

    });

}


// ==========================================
// FORMAT LANGUAGE
// ==========================================

function formatLanguage(language) {

    const map = {

        cpp: "C++",

        "c++": "C++",

        c: "C",

        java: "Java",

        python: "Python",

        javascript: "JavaScript",

        js: "JavaScript"

    };


    return map[
        String(language || "")
            .toLowerCase()
    ] || language || "Unknown";

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    const parsedDate =
        new Date(date);


    if (isNaN(parsedDate)) {

        return "";

    }


    return parsedDate.toLocaleString();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// EMPTY STATISTICS
// ==========================================

function showEmptyStatistics() {

    if (totalChats) {

        totalChats.textContent = "0";

    }


    if (cppCount) {

        cppCount.textContent = "0";

    }


    if (cCount) {

        cCount.textContent = "0";

    }


    if (javaCount) {

        javaCount.textContent = "0";

    }


    if (pythonCount) {

        pythonCount.textContent = "0";

    }


    if (jsCount) {

        jsCount.textContent = "0";

    }

}


// ==========================================
// EMPTY ACTIVITY
// ==========================================

function showEmptyActivity() {

    if (!container) return;


    container.innerHTML = `

        <div class="activity-empty">

            No activity yet.

        </div>

    `;

}


// ==========================================
// START
// ==========================================

loadDashboard();
