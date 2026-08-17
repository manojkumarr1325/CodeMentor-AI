import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";


// =====================================================
// CHAT CONTAINER
// =====================================================

function getChatContainer() {

    return document.getElementById("chatContainer");

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =====================================================
// USER MESSAGE
// =====================================================

export function addUserMessage(text) {

    const chat =
        document.getElementById("chatContainer");

    if (!chat) return;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message user-wrapper fade-in";

    wrapper.innerHTML = `

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


// =====================================================
// THINKING MESSAGE
// =====================================================

export function addThinkingMessage() {

    const chat =
        document.getElementById("chatContainer");

    if (!chat) return null;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai-wrapper fade-in";

    wrapper.innerHTML = `

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


// =====================================================
// WAIT FOR MATHJAX
// =====================================================

async function waitForMathJax() {

    // MathJax already available
    if (
        window.MathJax &&
        window.MathJax.startup &&
        window.MathJax.startup.promise
    ) {

        try {

            await window.MathJax.startup.promise;

            return true;

        }

        catch (error) {

            console.error(
                "MathJax startup error:",
                error
            );

            return false;

        }

    }


    // MathJax is still loading
    return new Promise(resolve => {

        let attempts = 0;

        const interval =
            setInterval(() => {

                attempts++;

                if (
                    window.MathJax &&
                    window.MathJax.startup &&
                    window.MathJax.startup.promise
                ) {

                    clearInterval(interval);

                    window.MathJax.startup.promise
                        .then(() => {

                            resolve(true);

                        })
                        .catch(() => {

                            resolve(false);

                        });

                }


                // Stop waiting after 10 seconds
                if (attempts >= 100) {

                    clearInterval(interval);

                    resolve(false);

                }

            }, 100);

    });

}


// =====================================================
// RENDER MATH
// =====================================================

async function renderMath(container) {

    if (!window.MathJax) {

        console.warn(
            "MathJax is not loaded yet."
        );

        return;

    }


    if (
        !window.MathJax.typesetPromise
    ) {

        console.warn(
            "MathJax typesetPromise unavailable."
        );

        return;

    }


    try {

        await waitForMathJax();

        await window.MathJax.typesetPromise([
            container
        ]);

    }

    catch (error) {

        console.error(
            "MathJax rendering failed:",
            error
        );

    }

}


// =====================================================
// AI MESSAGE
// =====================================================

export async function addAIMessage(markdown) {

    const chat =
        document.getElementById("chatContainer");

    if (!chat) return;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai-wrapper fade-in";

    wrapper.innerHTML = `

        <div class="avatar">
            🤖
        </div>

        <div class="ai-message"></div>

    `;

    chat.appendChild(wrapper);


    const box =
        wrapper.querySelector(".ai-message");


    // =================================================
    // MARKDOWN → HTML
    // =================================================

    box.innerHTML =
        formatResponse(markdown);


    // =================================================
    // MATHJAX
    // =================================================

    await renderMath(box);


    // =================================================
    // SAVE RAW CODE
    // =================================================

    box.querySelectorAll("pre code")
        .forEach(block => {

            block.dataset.raw =
                block.textContent;

        });


    // =================================================
    // HIGHLIGHT.JS
    // =================================================

    if (typeof hljs !== "undefined") {

        box.querySelectorAll("pre code")
            .forEach(block => {

                try {

                    hljs.highlightElement(
                        block
                    );

                }

                catch (error) {

                    console.error(
                        "Highlight.js error:",
                        error
                    );

                }

            });

    }


    // =================================================
    // COPY BUTTONS
    // =================================================

    attachCopyButtons();


    scrollBottom();

}


// =====================================================
// SCROLL
// =====================================================

export function scrollBottom() {

    const chatContainer =
        getChatContainer();

    if (!chatContainer) return;

    requestAnimationFrame(() => {

        chatContainer.scrollTop =
            chatContainer.scrollHeight;

    });

}


// =====================================================
// MARKDOWN FORMATTER
// =====================================================

function formatResponse(text) {

    if (!text) {

        return "";

    }


    if (typeof marked === "undefined") {

        return escapeHTML(text);

    }


    marked.setOptions({

        gfm: true,

        breaks: false,

        headerIds: false,

        mangle: false

    });


    // Normalize line endings
    text =
        String(text)
            .replace(/\r\n/g, "\n");


    // =================================================
    // FIX CODE BLOCK LANGUAGE
    // =================================================

    text =
        text.replace(
            /``` +/g,
            "```"
        );


    text =
        text.replace(
            /```c\+\+/gi,
            "```cpp"
        );


    text =
        text.replace(
            /```C\+\+/g,
            "```cpp"
        );


    text =
        text.replace(
            /```Python/gi,
            "```python"
        );


    text =
        text.replace(
            /```JavaScript/gi,
            "```javascript"
        );


    text = text.trim();


    // =================================================
    // REMOVE OUTER MARKDOWN FENCE
    // =================================================

    const outerFence =
        text.match(
            /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i
        );


    if (outerFence) {

        text =
            outerFence[1].trim();

    }


    // =================================================
    // HEADING SPACING
    // =================================================

    text =
        text.replace(
            /^(#{1,6}\s.+)\n(?!\n)/gm,
            "$1\n\n"
        );


    // =================================================
    // MARKDOWN → HTML
    // =================================================

    let html =
        marked.parse(text);


    // =================================================
    // CODE BLOCK WRAPPER
    // =================================================

    html =
        html.replace(
            /<pre><code(?: class="language-([^"]*)")?>/g,
            (_, lang = "text") => `

<div class="code-block">

    <div class="code-header">

        <span class="code-language">
            ${lang.toUpperCase()}
        </span>

        <button class="copy-btn">
            📋 Copy
        </button>

    </div>

    <pre><code class="language-${lang}">
`
        );


    // =================================================
    // CLOSE CODE BLOCK WRAPPER
    // =================================================

    html =
        html.replace(
            /<\/code><\/pre>/g,
            "</code></pre></div>"
        );


    return html;

}


// =====================================================
// TYPING / RENDER EFFECT
// =====================================================

async function typeMarkdown(
    container,
    markdown
) {

    await new Promise(resolve =>
        setTimeout(resolve, 150)
    );


    container.innerHTML =
        formatResponse(markdown);


    // Render mathematics
    await renderMath(container);


    // Highlight code
    if (typeof hljs !== "undefined") {

        container
            .querySelectorAll("pre code")
            .forEach(block => {

                try {

                    block.dataset.raw =
                        block.textContent;

                    hljs.highlightElement(
                        block
                    );

                }

                catch (error) {

                    console.error(
                        "Highlight.js error:",
                        error
                    );

                }

            });

    }


    attachCopyButtons();


    container.classList.add(
        "fade-in"
    );

}


// =====================================================
// COPY BUTTONS
// =====================================================

export function attachCopyButtons() {

    document
        .querySelectorAll(".copy-btn")
        .forEach(button => {


            // Prevent attaching multiple handlers
            if (
                button.dataset.copyAttached === "true"
            ) {

                return;

            }


            button.dataset.copyAttached =
                "true";


            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();


                    const codeBlock =
                        button.closest(
                            ".code-block"
                        );


                    if (!codeBlock) return;


                    const codeElement =
                        codeBlock.querySelector(
                            "code"
                        );


                    if (!codeElement) return;


                    const code =
                        codeElement.dataset.raw ||
                        codeElement.textContent;


                    try {

                        await navigator
                            .clipboard
                            .writeText(code);


                        const original =
                            button.innerHTML;


                        button.innerHTML =
                            "✅ Copied";


                        setTimeout(() => {

                            button.innerHTML =
                                original;

                        }, 1500);

                    }

                    catch (error) {

                        console.error(
                            "Copy failed:",
                            error
                        );

                    }

                }
            );

        });

}
