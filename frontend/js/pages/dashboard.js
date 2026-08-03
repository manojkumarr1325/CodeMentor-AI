import {
    getAllHistory,
    setCurrentConversation,
    setStorageType
} from "../utils/storage.js";

/* ==========================================
   Load All Conversations
========================================== */

const history = getAllHistory();

/* ==========================================
   Statistics
========================================== */

document.getElementById("totalChats").textContent = history.length;

document.getElementById("cppCount").textContent =
    history.filter(chat => chat.language === "C++").length;

document.getElementById("cCount").textContent =
    history.filter(chat => chat.language === "C").length;

document.getElementById("javaCount").textContent =
    history.filter(chat => chat.language === "Java").length;

document.getElementById("pythonCount").textContent =
    history.filter(chat => chat.language === "Python").length;

const jsElement = document.getElementById("jsCount");

if (jsElement) {
    jsElement.textContent =
        history.filter(chat => chat.language === "JavaScript").length;
}

/* ==========================================
   Recent Activity
========================================== */

const container = document.getElementById("recentActivity");

function loadRecentActivity() {

    if (!container) return;

    if (history.length === 0) {

        container.innerHTML = `
            <div class="activity-empty">
                No activity yet.
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    const recentChats = [...history]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    recentChats.forEach(chat => {

        const tool = chat.tool || "problem";

        const iconMap = {
            problem: "📝",
            debug: "🐞",
            complexity: "📊",
            testcase: "🧪",
            algorithm: "📚"
        };

        const toolName =
            tool.charAt(0).toUpperCase() + tool.slice(1);

        const icon = iconMap[tool] || "💬";

        const title =
            chat.title ||
            chat.question?.substring(0, 70) ||
            "Untitled Conversation";

        const language = chat.language || "Unknown";

        const date = chat.createdAt || "";

        const card = document.createElement("div");

        card.className = "activity-card";

        card.innerHTML = `
            <div class="activity-language">
                ${icon} ${toolName}
            </div>

            <div class="activity-title">
                ${title}
            </div>

            <div class="activity-meta">
                ${language}
            </div>

            <div class="activity-date">
                ${date}
            </div>
        `;

        card.addEventListener("click", () => {

            setStorageType(tool);

            setCurrentConversation(chat);

            switch (tool) {

                case "problem":
                    window.location.href = "problem.html";
                    break;

                case "debug":
                    window.location.href = "debugger.html";
                    break;

                case "complexity":
                    window.location.href = "complexity.html";
                    break;

                case "testcase":
                    window.location.href = "testcase.html";
                    break;

                case "algorithm":
                    window.location.href = "algorithm.html";
                    break;

                default:
                    window.location.href = "problem.html";
            }

        });

        container.appendChild(card);

    });

}

loadRecentActivity();