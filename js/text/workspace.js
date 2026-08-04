// @ts-nocheck
/**
 * Comprexa Shared Text Workspace UI Controller
 * Universal component managing Textarea, History Stack, File Drop, Action Toolbar, and Live Stats
 */

import { TextAnalyzer, TextConverter } from "./utils.js";

export class SharedTextWorkspace {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} options.textareaSelector
   * @param {string|HTMLElement} [options.statsContainerSelector]
   * @param {string|HTMLElement} [options.toolbarSelector]
   * @param {number} [options.maxCharLimit]
   * @param {function} [options.onChange]
   */
  constructor(options = {}) {
    this.textarea =
      typeof options.textareaSelector === "string"
        ? document.querySelector(options.textareaSelector)
        : options.textareaSelector;

    this.statsContainer =
      typeof options.statsContainerSelector === "string"
        ? document.querySelector(options.statsContainerSelector)
        : options.statsContainerSelector;

    this.toolbar =
      typeof options.toolbarSelector === "string"
        ? document.querySelector(options.toolbarSelector)
        : options.toolbarSelector;

    this.maxCharLimit = options.maxCharLimit || 0;
    this.onChange = options.onChange || null;

    // Undo / Redo History Stack
    this.history = [""];
    this.historyIndex = 0;
    this.maxHistory = 50;
    this.debounceTimer = null;

    if (this.textarea) {
      this.init();
    }
  }

  init() {
    this.history = [this.textarea.value || ""];
    this.historyIndex = 0;

    // Listen to input events
    this.textarea.addEventListener("input", () => this.handleInput());

    // Drag & Drop File handler on Textarea
    const dropZone =
      this.textarea.closest(".text-workspace__input-wrap") || this.textarea;

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("text-workspace__input-wrap--dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("text-workspace__input-wrap--dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => this.handleFileDrop(e));

    // Keyboard Shortcuts
    this.textarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
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

    this.bindToolbarButtons();
    this.updateStats();
    this.updateToolbarState();
  }

  handleInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.pushHistory(this.textarea.value);
    }, 300);

    this.updateStats();
    this.updateToolbarState();

    if (typeof this.onChange === "function") {
      this.onChange(
        this.textarea.value,
        TextAnalyzer.analyze(this.textarea.value),
      );
    }
  }

  pushHistory(val) {
    if (this.history[this.historyIndex] === val) return;
    // Slice off redo history if new input occurs
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
      this.textarea.value = this.history[this.historyIndex];
      this.updateStats();
      this.updateToolbarState();
      this.showToast("Undo", "info");
      if (typeof this.onChange === "function") {
        this.onChange(
          this.textarea.value,
          TextAnalyzer.analyze(this.textarea.value),
        );
      }
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.textarea.value = this.history[this.historyIndex];
      this.updateStats();
      this.updateToolbarState();
      this.showToast("Redo", "info");
      if (typeof this.onChange === "function") {
        this.onChange(
          this.textarea.value,
          TextAnalyzer.analyze(this.textarea.value),
        );
      }
    }
  }

  setText(newText) {
    this.textarea.value = newText;
    this.pushHistory(newText);
    this.updateStats();
    this.updateToolbarState();
    if (typeof this.onChange === "function") {
      this.onChange(
        this.textarea.value,
        TextAnalyzer.analyze(this.textarea.value),
      );
    }
  }

  getText() {
    return this.textarea ? this.textarea.value : "";
  }

  clear() {
    if (!this.textarea.value) return;
    this.setText("");
    this.showToast("Text cleared", "info");
  }

  async copy() {
    const val = this.getText();
    if (!val) {
      this.showToast("Nothing to copy", "warning");
      return;
    }
    try {
      await navigator.clipboard.writeText(val);
      this.showToast("Text copied to clipboard!", "success");
    } catch (err) {
      // Fallback
      this.textarea.select();
      document.execCommand("copy");
      this.showToast("Text copied to clipboard!", "success");
    }
  }

  async paste() {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) {
        this.showToast("Clipboard is empty", "warning");
        return;
      }
      this.setText(clipText);
      this.showToast("Text pasted from clipboard!", "success");
    } catch (err) {
      this.showToast(
        "Clipboard access denied. Press Ctrl+V to paste manually.",
        "warning",
      );
      this.textarea.focus();
    }
  }

  downloadTxt(filename = "text-document.txt") {
    const text = this.getText();
    if (!text) {
      this.showToast("No text to download", "warning");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast("Text file downloaded!", "success");
  }

  handleFileDrop(e) {
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (!files || files.length === 0) return;
    this.loadFile(files[0]);
  }

  loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      this.setText(content);
      this.showToast(`Loaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      this.showToast("Failed to read text file", "error");
    };
    reader.readAsText(file);
  }

  bindToolbarButtons() {
    const root = this.toolbar || document;

    const btnCopy = root.querySelector('[data-action="copy"]');
    if (btnCopy) btnCopy.addEventListener("click", () => this.copy());

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
      btnDownload.addEventListener("click", () => this.downloadTxt());

    const fileInput = root.querySelector(
      'input[type="file"][data-action="upload-file"]',
    );
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFile(e.target.files[0]);
          e.target.value = "";
        }
      });
    }
  }

  updateStats() {
    const text = this.getText();
    const stats = TextAnalyzer.analyze(text);

    // Update individual data-stat elements if present
    const updateEl = (selector, val) => {
      const el = document.querySelector(selector);
      if (el)
        el.textContent = typeof val === "number" ? val.toLocaleString() : val;
    };

    updateEl('[data-stat="words"]', stats.words);
    updateEl('[data-stat="chars"]', stats.charsWithSpaces);
    updateEl('[data-stat="chars-no-spaces"]', stats.charsWithoutSpaces);
    updateEl('[data-stat="spaces"]', stats.spaces);
    updateEl('[data-stat="lines"]', stats.lines);
    updateEl('[data-stat="paragraphs"]', stats.paragraphs);
    updateEl('[data-stat="sentences"]', stats.sentences);
    updateEl('[data-stat="reading-time"]', stats.readingTime);
    updateEl('[data-stat="speaking-time"]', stats.speakingTime);

    // Update optional character limit meter
    if (this.maxCharLimit > 0) {
      const limitCountEl = document.querySelector('[data-stat="limit-count"]');
      const limitBarEl = document.querySelector('[data-stat="limit-bar"]');
      const limitWarnEl = document.querySelector('[data-stat="limit-warn"]');

      const used = stats.charsWithSpaces;
      const pct = Math.min(100, Math.round((used / this.maxCharLimit) * 100));

      if (limitCountEl)
        limitCountEl.textContent = `${used.toLocaleString()} / ${this.maxCharLimit.toLocaleString()}`;
      if (limitBarEl) {
        limitBarEl.style.width = `${pct}%`;
        if (pct >= 90) {
          limitBarEl.style.backgroundColor = "var(--error, #ef4444)";
        } else if (pct >= 75) {
          limitBarEl.style.backgroundColor = "var(--warning, #f59e0b)";
        } else {
          limitBarEl.style.backgroundColor = "var(--primary)";
        }
      }
      if (limitWarnEl) {
        limitWarnEl.style.display = used > this.maxCharLimit ? "block" : "none";
      }
    }
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

window.SharedTextWorkspace = SharedTextWorkspace;
