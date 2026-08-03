/* ==========================================
   CodeMentor AI - User Display
========================================== */
const user = getCurrentUser();

const username = document.getElementById("username");

if (user && username) {
    username.textContent = user.username;
}