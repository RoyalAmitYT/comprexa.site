/**
 * Universal Code Editor Component for Comprexa Developer Tools
 * Features:
 * - Line numbers gutter with synchronized scrolling
 * - Real-time syntax highlighting for JSON (keys, strings, numbers, booleans, null, punctuation)
 * - Error line highlighting in gutter & backdrop
 * - Auto indentation on Enter & Tab key insertion
 * - Drag & Drop file zone integration
 * - Instant reactive event listeners
 */

export class UniversalCodeEditor {
  /**
   * Attach or build a Universal Code Editor inside a target container
   * @param {HTMLElement|string} target - Container element or selector
   * @param {Object} options
   */
  constructor(target, options = {}) {
    this.container =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.container) {
      throw new Error(`UniversalCodeEditor: Target container not found`);
    }

    this.options = {
      value: options.value || "",
      placeholder:
        options.placeholder || "Paste, type, or drop JSON code here...",
      readOnly: options.readOnly || false,
      minHeight: options.minHeight || "360px",
      maxHeight: options.maxHeight || "600px",
      indentSize: options.indentSize || 2,
      onInput: options.onInput || null,
      onFileDrop: options.onFileDrop || null,
      ...options,
    };

    this.errorLine = null;
    this.initDOM();
    this.bindEvents();
    this.setValue(this.options.value);
  }

  static attach(target, options) {
    return new UniversalCodeEditor(target, options);
  }

  initDOM() {
    this.container.innerHTML = "";
    this.container.className = `code-editor-container ${this.options.readOnly ? "code-editor-container--readonly" : ""}`;
    this.container.style.minHeight = this.options.minHeight;
    this.container.style.maxHeight = this.options.maxHeight;

    // Gutter for line numbers
    this.gutter = document.createElement("div");
    this.gutter.className = "code-editor-gutter";
    this.gutter.setAttribute("aria-hidden", "true");

    // Body wrapper
    this.body = document.createElement("div");
    this.body.className = "code-editor-body";

    // Backdrop for syntax highlighting
    this.backdrop = document.createElement("pre");
    this.backdrop.className = "code-editor-backdrop";
    this.backdrop.setAttribute("aria-hidden", "true");
    this.codeElement = document.createElement("code");
    this.codeElement.className = "code-editor-highlight";
    this.backdrop.appendChild(this.codeElement);

    // Textarea for editing
    this.textarea = document.createElement("textarea");
    this.textarea.className = "code-editor-textarea";
    this.textarea.placeholder = this.options.placeholder;
    this.textarea.readOnly = this.options.readOnly;
    this.textarea.setAttribute("spellcheck", "false");
    this.textarea.setAttribute("autocomplete", "off");
    this.textarea.setAttribute("autocorrect", "off");
    this.textarea.setAttribute("autocapitalize", "off");

    // File drop overlay indicator
    this.dropZone = document.createElement("div");
    this.dropZone.className = "code-editor-dropzone";
    this.dropZone.innerHTML = `
      <div class="code-editor-dropzone__content">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Drop JSON File to Load</span>
      </div>
    `;

    this.body.appendChild(this.backdrop);
    this.body.appendChild(this.textarea);
    this.body.appendChild(this.dropZone);

    this.container.appendChild(this.gutter);
    this.container.appendChild(this.body);
  }

  bindEvents() {
    // Sync scrolling between textarea, backdrop, and line numbers gutter
    this.textarea.addEventListener("scroll", () => {
      this.gutter.scrollTop = this.textarea.scrollTop;
      this.backdrop.scrollTop = this.textarea.scrollTop;
      this.backdrop.scrollLeft = this.textarea.scrollLeft;
    });

    // Handle typing and reactivity
    this.textarea.addEventListener("input", () => {
      this.updateHighlighting();
      this.updateGutter();
      if (typeof this.options.onInput === "function") {
        this.options.onInput(this.getValue());
      }
    });

    // Auto Indentation & Tab Key handling
    this.textarea.addEventListener("keydown", (e) => {
      if (this.options.readOnly) return;

      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const val = this.textarea.value;
        const indentStr = " ".repeat(this.options.indentSize || 2);

        if (e.shiftKey) {
          // Outdent
          const lineStart = val.lastIndexOf("\n", start - 1) + 1;
          if (
            val.substring(lineStart, lineStart + indentStr.length) === indentStr
          ) {
            this.textarea.value =
              val.substring(0, lineStart) +
              val.substring(lineStart + indentStr.length);
            this.textarea.selectionStart = Math.max(
              lineStart,
              start - indentStr.length,
            );
            this.textarea.selectionEnd = Math.max(
              lineStart,
              end - indentStr.length,
            );
          }
        } else {
          // Indent
          this.textarea.value =
            val.substring(0, start) + indentStr + val.substring(end);
          this.textarea.selectionStart = this.textarea.selectionEnd =
            start + indentStr.length;
        }

        this.updateHighlighting();
        this.updateGutter();
        if (typeof this.options.onInput === "function") {
          this.options.onInput(this.getValue());
        }
      } else if (e.key === "Enter") {
        // Auto-indent on Enter
        const start = this.textarea.selectionStart;
        const val = this.textarea.value;
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const currentLine = val.substring(lineStart, start);

        // Count leading whitespace
        const match = currentLine.match(/^[\t ]*/);
        let indent = match ? match[0] : "";

        // Extra indent if line ends with { or [
        if (/[\{\[]\s*$/.test(currentLine)) {
          indent += " ".repeat(this.options.indentSize || 2);
        }

        e.preventDefault();
        const insertText = "\n" + indent;
        this.textarea.value =
          val.substring(0, start) +
          insertText +
          val.substring(this.textarea.selectionEnd);
        this.textarea.selectionStart = this.textarea.selectionEnd =
          start + insertText.length;

        this.updateHighlighting();
        this.updateGutter();
        if (typeof this.options.onInput === "function") {
          this.options.onInput(this.getValue());
        }
      }
    });

    // Drag and Drop File Handlers
    ["dragenter", "dragover"].forEach((evt) => {
      this.container.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.add("code-editor-container--dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      this.container.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.remove("code-editor-container--dragover");
      });
    });

    this.container.addEventListener("drop", (e) => {
      const files = e.dataTransfer ? e.dataTransfer.files : null;
      if (files && files.length > 0) {
        if (typeof this.options.onFileDrop === "function") {
          this.options.onFileDrop(files[0]);
        }
      }
    });
  }

  getValue() {
    return this.textarea ? this.textarea.value : "";
  }

  setValue(val = "") {
    if (!this.textarea) return;
    this.textarea.value = val;
    this.updateHighlighting();
    this.updateGutter();
  }

  setErrorLine(lineNum) {
    this.errorLine = lineNum;
    this.container.classList.add("code-editor-container--error");
    this.updateGutter();
    this.updateHighlighting();
  }

  clearErrorLine() {
    this.errorLine = null;
    this.container.classList.remove("code-editor-container--error");
    this.updateGutter();
    this.updateHighlighting();
  }

  updateGutter() {
    const text = this.getValue();
    const lineCount = Math.max(1, text.split("\n").length);
    let gutterHTML = "";

    for (let i = 1; i <= lineCount; i++) {
      const isError = this.errorLine === i;
      gutterHTML += `<div class="code-editor-gutter-line ${isError ? "code-editor-gutter-line--error" : ""}">${i}</div>`;
    }

    this.gutter.innerHTML = gutterHTML;
  }

  updateHighlighting() {
    const text = this.getValue();
    const lines = text.split("\n");

    const highlightedLines = lines.map((line, idx) => {
      const lineNum = idx + 1;
      const isError = this.errorLine === lineNum;
      const highlightedText = this.highlightJsonLine(line);

      if (isError) {
        return `<span class="syn-error-line">${highlightedText || " "}</span>`;
      }
      return highlightedText || " ";
    });

    // Add trailing newline if text ends with \n so pre alignment matches textarea
    let innerHTML = highlightedLines.join("\n");
    if (text.endsWith("\n")) {
      innerHTML += "\n ";
    }

    this.codeElement.innerHTML = innerHTML;
  }

  highlightJsonLine(line) {
    if (!line) return "";

    // Escape HTML special characters
    let escaped = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Syntax Highlighting Regex matching JSON tokens
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[\{\}\[\]:,])/g,
      (match) => {
        let cls = "syn-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "syn-key";
          } else {
            cls = "syn-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "syn-boolean";
        } else if (/null/.test(match)) {
          cls = "syn-null";
        } else if (/[\{\}\[\]:,]/.test(match)) {
          cls = "syn-punct";
        }
        return `<span class="${cls}">${match}</span>`;
      },
    );
  }

  focus() {
    if (this.textarea) this.textarea.focus();
  }
}

window.UniversalCodeEditor = UniversalCodeEditor;
