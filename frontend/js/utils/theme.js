import { updateEditorTheme } from "../components/editor.js";
import { getEditor } from "../components/editor.js";
const THEME_KEY = "codementor_theme";

function updateHighlightTheme(theme) {

    const lightTheme = document.getElementById("hl-light");
    const darkTheme = document.getElementById("hl-dark");

    if (!lightTheme || !darkTheme) return;

    if (theme === "dark") {

        lightTheme.disabled = true;
        darkTheme.disabled = false;

    } else {

        lightTheme.disabled = false;
        darkTheme.disabled = true;

    }

}

function applyTheme(theme) {

    document.body.classList.toggle("dark", theme === "dark");

    updateHighlightTheme(theme);

    updateEditorTheme();

    const editor = getEditor();

    if (editor) {
        monaco.editor.setTheme(
            theme === "dark" ? "vs-dark" : "vs"
        );
    }

    const themeBtn = document.getElementById("themeToggle");

    if (themeBtn) {

        themeBtn.textContent =
            theme === "dark" ? "☀️" : "🌙";

        themeBtn.title =
            theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode";
    }
}

function loadTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY) || "light";

    applyTheme(savedTheme);

}

function toggleTheme() {

    const newTheme =
        document.body.classList.contains("dark")
            ? "light"
            : "dark";

    localStorage.setItem(
        THEME_KEY,
        newTheme
    );

    applyTheme(newTheme);

}

loadTheme();

window.toggleTheme = toggleTheme;

document.addEventListener("DOMContentLoaded", () => {

    const themeBtn =
        document.getElementById("themeToggle");

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            toggleTheme
        );

    }

});