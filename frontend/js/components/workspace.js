import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

function getChatContainer() {

    return document.getElementById("chatContainer");

}

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}

// ================= USER MESSAGE =================

export function addUserMessage(text){

    const chat=document.getElementById("chatContainer");

    const wrapper=document.createElement("div");
    wrapper.className="message user-wrapper fade-in";

    wrapper.innerHTML=`

        <div class="user-message">
            ${escapeHTML(text)}
        </div>

        <div class="avatar user-avatar">
            🙂
        </div>

    `;

    chat.appendChild(wrapper);

    scrollBottom();
}

// ================= THINKING =================

export function addThinkingMessage(){

    const chat=document.getElementById("chatContainer");

    const wrapper=document.createElement("div");

    wrapper.className="message ai-wrapper fade-in";

    wrapper.innerHTML=`

        <div class="avatar">
            🤖
        </div>

        <div class="thinking-box">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;

    chat.appendChild(wrapper);

    scrollBottom();

    return wrapper;

}

// ================= AI MESSAGE =================

export async function addAIMessage(markdown){

    const chat=document.getElementById("chatContainer");

    const wrapper=document.createElement("div");

    wrapper.className="message ai-wrapper fade-in";

    wrapper.innerHTML=`

        <div class="avatar">
            🤖
        </div>

        <div class="ai-message"></div>

    `;

    chat.appendChild(wrapper);

    const box=wrapper.querySelector(".ai-message");

    box.innerHTML = formatResponse(markdown);

    if (window.renderMathInElement) {
        renderMathInElement(box, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ],
            throwOnError: false
        });
    }

    // Save the original code before Highlight.js modifies it
    box.querySelectorAll("pre code").forEach(block => {
        block.dataset.raw = block.textContent;
    });

    if (typeof hljs !== "undefined") {
        box.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    attachCopyButtons();

    if (window.hljs) {
        document.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    attachCopyButtons();

    scrollBottom();

}

// ================= SCROLL =================

export function scrollBottom() {

    const chatContainer = getChatContainer();

    if (!chatContainer) return;

    requestAnimationFrame(() => {

        chatContainer.scrollTop = chatContainer.scrollHeight;

    });

}

// ================= MARKDOWN =================

function formatResponse(text) {

    if (typeof marked === "undefined") {
        return escapeHTML(text);
    }

    marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: false,
        mangle: false
    });

    text = text.replace(/\r\n/g, "\n");

    // Fix language names
    text = text.replace(/``` +/g, "```");
    text = text.replace(/```c\+\+/gi, "```cpp");
    text = text.replace(/```C\+\+/g, "```cpp");
    text = text.replace(/```Python/gi, "```python");
    text = text.replace(/```JavaScript/gi, "```javascript");

    text = text.trim();

    // ---------------------------------------
    // Remove an OUTER markdown fence only
    // ---------------------------------------

    const outerFence =
        text.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);

    if (outerFence) {

        text = outerFence[1].trim();

    }

    // Ensure blank line after headings

    text = text.replace(
        /^(#{1,6}\s.+)\n(?!\n)/gm,
        "$1\n\n"
    );

    let html = marked.parse(text);

    html = html.replace(
        /<pre><code(?: class="language-([^"]*)")?>/g,
        (_, lang = "text") => `
<div class="code-block">
<div class="code-header">
<span class="code-language">${lang.toUpperCase()}</span>
<button class="copy-btn">📋 Copy</button>
</div>
<pre><code class="language-${lang}">
`
    );

    html = html.replace(
        /<\/code><\/pre>/g,
        "</code></pre></div>"
    );

    return html;

}

// ================= TYPING EFFECT =================

async function typeMarkdown(container, markdown) {

    // Wait a tiny bit so the fade looks smooth
    await new Promise(resolve => setTimeout(resolve, 150));

    // Render the final formatted markdown
    container.innerHTML = formatResponse(markdown);

    // Highlight code blocks
    if (typeof hljs !== "undefined") {

        container.querySelectorAll("pre code").forEach(block => {

            hljs.highlightElement(block);

        });

    }

    // Enable copy buttons
    attachCopyButtons();

    // Fade in
    container.classList.add("fade-in");

}

// ================= COPY BUTTON =================

// ================= COPY BUTTON =================

export function attachCopyButtons() {

    document.querySelectorAll(".copy-btn").forEach(button => {

        button.onclick = async () => {

            const codeBlock = button
                .closest(".code-block")
                .querySelector("code");

            const code =
                codeBlock.dataset.raw || codeBlock.textContent;

            await navigator.clipboard.writeText(code);

            const original = button.innerHTML;

            button.innerHTML = "✅ Copied";

            setTimeout(() => {

                button.innerHTML = original;

            }, 1500);

        };

    });

}

