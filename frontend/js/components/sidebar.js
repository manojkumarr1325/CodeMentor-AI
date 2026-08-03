const sidebar = document.querySelector(".sidebar");
const workspace = document.querySelector(".workspace");
const toggleBtn = document.getElementById("toggleSidebar");

const KEY = "codementor_sidebar";

function updateSidebar(collapsed) {

    if (!sidebar || !workspace || !toggleBtn) return;

    if (collapsed) {

        sidebar.classList.add("collapsed");
        workspace.classList.add("sidebar-hidden");

        toggleBtn.innerHTML = "☰";
        toggleBtn.title = "Show Sidebar";

    } else {

        sidebar.classList.remove("collapsed");
        workspace.classList.remove("sidebar-hidden");

        toggleBtn.innerHTML = "✕";
        toggleBtn.title = "Hide Sidebar";

    }

}

function loadSidebar() {

    const collapsed =
        localStorage.getItem(KEY) === "collapsed";

    updateSidebar(collapsed);

}

function toggleSidebar() {

    const collapsed =
        !sidebar.classList.contains("collapsed");

    updateSidebar(collapsed);

    localStorage.setItem(
        KEY,
        collapsed ? "collapsed" : "open"
    );

}

if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
}

loadSidebar();