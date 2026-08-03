let editor = null;
let loading = false;

export function initializeEditor(onSubmit = null) {

    // Already created
    if (editor || loading) return;

    loading = true;

    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    require(["vs/editor/editor.main"], function () {

        const container = document.getElementById("problemInput");

        if (!container) {
            console.error("Monaco container #problemInput not found.");
            loading = false;
            return;
        }

        // Prevent duplicate editors
        if (editor) {
            loading = false;
            return;
        }

        editor = monaco.editor.create(container, {

            value: "",

            language: "cpp",

            theme: document.body.classList.contains("dark")
                ? "vs-dark"
                : "vs",

            automaticLayout: true,

            minimap: {
                enabled: false
            },

            fontSize: 16,
            fontFamily: "Inter, Consolas, monospace",

            lineHeight: 28,

            lineNumbers: "off",

            glyphMargin: false,

            folding: false,

            lineDecorationsWidth: 0,

            lineNumbersMinChars: 0,

            renderLineHighlight: "none",

            renderIndentGuides: false,

            guides: {
                indentation: false,
                highlightActiveIndentation: false
            },

            overviewRulerLanes: 0,

            hideCursorInOverviewRuler: true,

            overviewRulerBorder: false,

            scrollBeyondLastLine: false,

            scrollbar: {

                vertical: "auto",

                horizontal: "hidden",

                verticalScrollbarSize: 8

            },

            wordWrap: "on",

            padding: {

                top: 18,

                bottom: 18

            }

        });

        // Focus automatically
        editor.focus();

        // Ctrl + Enter
        editor.addAction({

            id: "solve-problem",

            label: "Solve Problem",

            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],

            run: () => {

                if (onSubmit) {

                    onSubmit();

                }

            }

        });

        // Resize properly
        window.addEventListener("resize", () => {

            if (editor) {

                editor.layout();

            }

        });

        loading = false;

        console.log("✅ Monaco Editor Initialized");

    });

}

export function getEditor() {

    return editor;

}

export function getEditorText() {

    if (!editor) {
        return "";
    }

    return editor.getValue();
}

export function clearEditor() {

    if (!editor) return;

    editor.setValue("");

    editor.focus();

}

export function setLanguage(lang) {

    if (!editor) return;

    const map = {

        "C++": "cpp",

        "C": "c",

        "Java": "java",

        "Python": "python",

        "JavaScript": "javascript"

    };

    monaco.editor.setModelLanguage(

        editor.getModel(),

        map[lang] || "cpp"

    );

}

export function updateEditorTheme() {

    if (!editor) return;

    monaco.editor.setTheme(

        document.body.classList.contains("dark")

            ? "vs-dark"

            : "vs"

    );

}

export function focusEditor() {

    if (editor) {

        editor.focus();

    }

}

export function destroyEditor() {

    if (editor) {

        editor.dispose();

        editor = null;

    }

}