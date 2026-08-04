// @ts-nocheck
/**
 * Comprexa Shared Developer Workspace Controller
 * Reusable Code Editor, Dual-Panel/Single-Panel Layout, File Drop, History, Toolbar, & Diagnostics
 */

import { JsonUtils } from "./utils.js";

export class SharedDevWorkspace {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} options.inputSelector
   * @param {string|HTMLElement} [options.outputSelector]
   * @param {string|HTMLElement} [options.toolbarSelector]
   * @param {string|HTMLElement} [options.statusSelector]
   * @param {string} [options.fileExtension] - default 'json'
   * @param {function} [options.onInput]
   */
  constructor(options = {}) {
    this.inputArea =
      typeof options.inputSelector === "string"
        ? document.querySelector(options.inputSelector)
        : options.inputSelector;

    this.outputArea =
      typeof options.outputSelector === "string"
        ? document.querySelector(options.outputSelector)
        : options.outputSelector;

    this.toolbar =
      typeof options.toolbarSelector === "string"
        ? document.querySelector(options.toolbarSelector)
        : options.toolbarSelector;

    this.statusBanner =
      typeof options.statusSelector === "string"
        ? document.querySelector(options.statusSelector)
        : options.statusSelector;

    this.fileExtension = options.fileExtension || "json";
    this.onInput = options.onInput || null;

    // History Stack
    this.history = [""];
    this.historyIndex = 0;
    this.maxHistory = 50;
    this.debounceTimer = null;

    if (this.inputArea) {
      this.init();
    }
  }

  init() {
    this.history = [this.inputArea.value || ""];
    this.historyIndex = 0;

    // Input listeners
    this.inputArea.addEventListener("input", () => this.handleInput());

    // Tab key inside textarea
    this.inputArea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.inputArea.selectionStart;
        const end = this.inputArea.selectionEnd;
        const val = this.inputArea.value;
        this.inputArea.value =
          val.substring(0, start) + "  " + val.substring(end);
        this.inputArea.selectionStart = this.inputArea.selectionEnd = start + 2;
        this.handleInput();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        this.redo();
      }
    });

    // Drag & Drop File handler
    const dropZone =
      this.inputArea.closest(".dev-code-editor-wrap") || this.inputArea;

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dev-code-editor-wrap--dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dev-code-editor-wrap--dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => this.handleFileDrop(e));

    this.bindToolbarButtons();
    this.updateToolbarState();
  }

  handleInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.pushHistory(this.inputArea.value);
    }, 300);

    this.updateToolbarState();

    if (typeof this.onInput === "function") {
      this.onInput(this.inputArea.value);
    }
  }

  pushHistory(val) {
    if (this.history[this.historyIndex] === val) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(val);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    this.updateToolbarState();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.inputArea.value = this.history[this.historyIndex];
      this.updateToolbarState();
      this.showToast("Undo", "info");
      if (typeof this.onInput === "function") {
        this.onInput(this.inputArea.value);
      }
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.inputArea.value = this.history[this.historyIndex];
      this.updateToolbarState();
      this.showToast("Redo", "info");
      if (typeof this.onInput === "function") {
        this.onInput(this.inputArea.value);
      }
    }
  }

  getInput() {
    return this.inputArea ? this.inputArea.value : "";
  }

  setInput(text) {
    if (!this.inputArea) return;
    this.inputArea.value = text;
    this.pushHistory(text);
    this.updateToolbarState();
    if (typeof this.onInput === "function") {
      this.onInput(text);
    }
  }

  getOutput() {
    return this.outputArea ? this.outputArea.value : "";
  }

  setOutput(text) {
    if (this.outputArea) {
      this.outputArea.value = text;
    }
  }

  clear() {
    if (!this.getInput() && !this.getOutput()) return;
    this.setInput("");
    this.setOutput("");
    this.clearStatus();
    this.showToast("Workspace cleared", "info");
  }

  async copy(target = "output") {
    const text =
      target === "input"
        ? this.getInput()
        : this.outputArea
          ? this.getOutput()
          : this.getInput();
    if (!text) {
      this.showToast("Nothing to copy", "warning");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.showToast("Copied to clipboard!", "success");
    } catch (err) {
      this.showToast("Failed to copy to clipboard", "error");
    }
  }

  async paste() {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) {
        this.showToast("Clipboard is empty", "warning");
        return;
      }
      this.setInput(clipText);
      this.showToast("Pasted from clipboard!", "success");
    } catch (err) {
      this.showToast(
        "Clipboard access denied. Press Ctrl+V to paste manually.",
        "warning",
      );
      this.inputArea.focus();
    }
  }

  download(filename = `document.${this.fileExtension}`, target = "output") {
    const text =
      target === "input"
        ? this.getInput()
        : this.outputArea
          ? this.getOutput()
          : this.getInput();
    if (!text) {
      this.showToast("Nothing to download", "warning");
      return;
    }
    const mime =
      this.fileExtension === "json" ? "application/json" : "text/plain";
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast("File downloaded!", "success");
  }

  handleFileDrop(e) {
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (!files || files.length === 0) return;
    this.loadFile(files[0]);
  }

  loadFile(file) {
    if (!file) return;

    // Resolve allowed file formats from the Global Tool Registry or current configuration
    let allowedTypes = this.fileExtension
      ? [this.fileExtension.toLowerCase()]
      : [];
    let toolId = null;
    if (typeof window !== "undefined" && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      toolId = urlParams.get("tool");
      if (!toolId) {
        const pathSegments = window.location.pathname.split("/");
        const filename = pathSegments[pathSegments.length - 1];
        if (filename && filename.endsWith(".html")) {
          const slug = filename.replace(".html", "");
          if (window.ComprexaToolsRegistry) {
            const toolObj =
              window.ComprexaToolsRegistry.getBySlug(slug) ||
              window.ComprexaToolsRegistry.getById(slug);
            if (toolObj) {
              toolId = toolObj.id;
            }
          }
        }
      }
    }

    if (toolId && window.ComprexaToolsRegistry) {
      const toolObj =
        window.ComprexaToolsRegistry.getById(toolId) ||
        window.ComprexaToolsRegistry.getBySlug(toolId);
      if (toolObj && toolObj.supportedFileTypes) {
        allowedTypes = toolObj.supportedFileTypes.map((t) => t.toLowerCase());
      }
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (
      allowedTypes.length > 0 &&
      !allowedTypes.includes(ext) &&
      !allowedTypes.includes("*")
    ) {
      this.showToast(
        `Unsupported file format. Please upload a ${allowedTypes.map((t) => "." + t.toUpperCase()).join(" or ")} file.`,
        "error",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setInput(e.target.result);
      this.showToast(`Loaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      this.showToast("Failed to read file", "error");
    };
    reader.readAsText(file);
  }

  bindToolbarButtons() {
    const root = this.toolbar || document;

    const btnCopy = root.querySelector('[data-action="copy"]');
    if (btnCopy) btnCopy.addEventListener("click", () => this.copy("output"));

    const btnCopyInput = root.querySelector('[data-action="copy-input"]');
    if (btnCopyInput)
      btnCopyInput.addEventListener("click", () => this.copy("input"));

    const btnPaste = root.querySelector('[data-action="paste"]');
    if (btnPaste) btnPaste.addEventListener("click", () => this.paste());

    const btnClear = root.querySelector('[data-action="clear"]');
    if (btnClear) btnClear.addEventListener("click", () => this.clear());

    const btnUndo = root.querySelector('[data-action="undo"]');
    if (btnUndo) btnUndo.addEventListener("click", () => this.undo());

    const btnRedo = root.querySelector('[data-action="redo"]');
    if (btnRedo) btnRedo.addEventListener("click", () => this.redo());

    const btnDownload = root.querySelector('[data-action="download"]');
    if (btnDownload)
      btnDownload.addEventListener("click", () => this.download());

    const fileInput = root.querySelector(
      'input[type="file"][data-action="upload-file"]',
    );
    if (fileInput) {
      // Configure native file picker filter based on supported file formats
      let allowedTypes = this.fileExtension
        ? [this.fileExtension.toLowerCase()]
        : [];
      let toolId = null;
      if (typeof window !== "undefined" && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        toolId = urlParams.get("tool");
        if (!toolId) {
          const pathSegments = window.location.pathname.split("/");
          const filename = pathSegments[pathSegments.length - 1];
          if (filename && filename.endsWith(".html")) {
            const slug = filename.replace(".html", "");
            if (window.ComprexaToolsRegistry) {
              const toolObj =
                window.ComprexaToolsRegistry.getBySlug(slug) ||
                window.ComprexaToolsRegistry.getById(slug);
              if (toolObj) {
                toolId = toolObj.id;
              }
            }
          }
        }
      }

      if (toolId && window.ComprexaToolsRegistry) {
        const toolObj =
          window.ComprexaToolsRegistry.getById(toolId) ||
          window.ComprexaToolsRegistry.getBySlug(toolId);
        if (toolObj && toolObj.supportedFileTypes) {
          allowedTypes = toolObj.supportedFileTypes.map((t) => t.toLowerCase());
        }
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes("*")) {
        fileInput.setAttribute(
          "accept",
          allowedTypes.map((ext) => "." + ext).join(","),
        );
      }

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFile(e.target.files[0]);
          e.target.value = "";
        }
      });
    }
  }

  renderStatus(result) {
    const wrap = this.inputArea.closest(".dev-code-editor-wrap");

    if (!this.statusBanner) return;

    if (!result || result.valid === null) {
      this.clearStatus();
      if (wrap) wrap.classList.remove("dev-code-editor-wrap--error");
      return;
    }

    if (result.valid) {
      if (wrap) wrap.classList.remove("dev-code-editor-wrap--error");
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--valid";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="dev-status-banner__content">
          <div class="dev-status-banner__title">Valid JSON Document</div>
          <div>Ready for copy, download, formatting, or API integration.</div>
        </div>
      `;
    } else {
      if (wrap) wrap.classList.add("dev-code-editor-wrap--error");
      const err = result.error || {};
      const locStr = err.line
        ? `Line ${err.line}, Col ${err.column}`
        : "Syntax Error";

      this.statusBanner.className =
        "dev-status-banner dev-status-banner--invalid";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__icon" style="color: #ef4444;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="dev-status-banner__content">
          <div class="dev-status-banner__title">
            <span>Invalid JSON</span>
            <span class="dev-status-banner__location">${locStr}</span>
          </div>
          <div>${err.message || "JSON Syntax error encountered."}</div>
          ${err.snippet ? `<pre class="dev-status-banner__code-snippet">${err.snippetWithCaret || err.snippet}</pre>` : ""}
        </div>
      `;
    }
  }

  clearStatus() {
    if (this.statusBanner) {
      this.statusBanner.className = "dev-status-banner";
      this.statusBanner.innerHTML = "";
    }
    const wrap = this.inputArea
      ? this.inputArea.closest(".dev-code-editor-wrap")
      : null;
    if (wrap) wrap.classList.remove("dev-code-editor-wrap--error");
  }

  updateToolbarState() {
    const root = this.toolbar || document;
    const btnUndo = root.querySelector('[data-action="undo"]');
    const btnRedo = root.querySelector('[data-action="redo"]');

    if (btnUndo) {
      btnUndo.disabled = this.historyIndex <= 0;
      btnUndo.classList.toggle("btn--disabled", this.historyIndex <= 0);
    }
    if (btnRedo) {
      btnRedo.disabled = this.historyIndex >= this.history.length - 1;
      btnRedo.classList.toggle(
        "btn--disabled",
        this.historyIndex >= this.history.length - 1,
      );
    }
  }

  showToast(msg, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(msg, type);
    }
  }
}

window.SharedDevWorkspace = SharedDevWorkspace;
