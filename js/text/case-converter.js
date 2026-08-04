// @ts-nocheck
/**
 * Comprexa Case Converter Tool - Independent Implementation
 * Complete client-side real-time case transformation and text analysis.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class CaseConverterProcessing {
  /**
   * Convert text to UPPERCASE
   * @param {string} text
   * @returns {string}
   */
  static toUppercase(text = "") {
    return text.toUpperCase();
  }

  /**
   * Convert text to lowercase
   * @param {string} text
   * @returns {string}
   */
  static toLowercase(text = "") {
    return text.toLowerCase();
  }

  /**
   * Convert text to Title Case
   * Capitalizes main words, leaving minor articles/prepositions lowercase unless starting a sentence.
   * @param {string} text
   * @returns {string}
   */
  static toTitleCase(text = "") {
    if (!text) return "";
    const smallWords =
      /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v|via)$/i;

    return text
      .toLowerCase()
      .replace(/[^\s:\-–—]+/g, (word, index, fullStr) => {
        // Always capitalize first word or after colon/dash
        if (
          index === 0 ||
          fullStr.charAt(index - 2) === ":" ||
          fullStr.charAt(index - 2) === "-"
        ) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (smallWords.test(word)) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
  }

  /**
   * Convert text to Sentence case
   * Capitalizes the first letter of each sentence.
   * @param {string} text
   * @returns {string}
   */
  static toSentenceCase(text = "") {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(
        /(^\s*|[.!?]\s+|\r?\n\s*)([a-z\u00C0-\u024F\u0400-\u04FF])/g,
        (match, p1, p2) => {
          return p1 + p2.toUpperCase();
        },
      );
  }

  /**
   * Capitalize Each Word
   * @param {string} text
   * @returns {string}
   */
  static toCapitalizeWords(text = "") {
    if (!text) return "";
    return text.replace(/[\w\d\u00C0-\u024F\u0400-\u04FF]+/g, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  /**
   * Toggle Case (swap uppercase and lowercase letters)
   * @param {string} text
   * @returns {string}
   */
  static toToggleCase(text = "") {
    if (!text) return "";
    return text
      .split("")
      .map((char) => {
        const lower = char.toLowerCase();
        const upper = char.toUpperCase();
        if (char === lower && char !== upper) {
          return upper;
        } else if (char === upper && char !== lower) {
          return lower;
        }
        return char;
      })
      .join("");
  }

  /**
   * Find and replace occurrences of text
   * @param {string} text
   * @param {string} findVal
   * @param {string} replaceVal
   * @returns {{ result: string, count: number }}
   */
  static findAndReplace(text = "", findVal = "", replaceVal = "") {
    if (!text || !findVal) {
      return { result: text, count: 0 };
    }
    const escaped = findVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const result = text.replace(regex, replaceVal);
    return { result, count };
  }

  /**
   * Analyze text statistics
   * @param {string} text
   * @returns {Object} { words, chars, sentences, lines }
   */
  static analyze(text = "") {
    if (!text) {
      return { words: 0, chars: 0, sentences: 0, lines: 0 };
    }
    const chars = text.length;
    const trimmed = text.trim();
    const wordTokens = trimmed
      ? trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || []
      : [];
    const words = wordTokens.length;

    const sentenceMatches = trimmed
      ? trimmed.match(/[^.!?\r\n]+[.!?\r\n]+/g)
      : null;
    const sentences = sentenceMatches
      ? sentenceMatches.length
      : trimmed
        ? 1
        : 0;

    const lines = text.split(/\r\n|\r|\n/).length;

    return { words, chars, sentences, lines };
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class CaseConverterValidation {
  static SUPPORTED_EXTENSIONS = ["txt", "md", "csv"];
  static MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

  /**
   * Validate uploaded text file
   * @param {File} file
   * @returns {Object} { isValid, error }
   */
  static validateFile(file) {
    if (!file) {
      return { isValid: false, error: "No file selected." };
    }

    const nameParts = file.name.split(".");
    const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "";

    if (!this.SUPPORTED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported file format ".${ext}". Please upload a .txt, .md, or .csv text file.`,
      };
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error:
          "File size exceeds 10MB limit. Please upload a smaller text file.",
      };
    }

    return { isValid: true, error: null };
  }
}

/* ==========================================================================
   3. UTILITIES
   ========================================================================== */
export class CaseConverterUtils {
  /**
   * Show Toast Notification
   * @param {string} message
   * @param {string} type
   */
  static showToast(message, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type);
    }
  }

  /**
   * Copy text string to system clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(text) {
    if (!text || text.trim() === "") {
      this.showToast("Text box is empty. Nothing to copy.", "info");
      return false;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      this.showToast("Converted text copied to clipboard!", "success");
      return true;
    } catch (err) {
      this.showToast("Failed to copy text to clipboard", "error");
      return false;
    }
  }

  /**
   * Download text content as a .txt file
   * @param {string} text
   * @param {string} filename
   */
  static downloadTextFile(text, filename = "case-converter-export.txt") {
    if (!text || text.trim() === "") {
      this.showToast("Text box is empty. Nothing to download.", "info");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`Downloaded "${filename}"`, "success");
  }

  /**
   * Read file content as text
   * @param {File} file
   * @returns {Promise<string>}
   */
  static readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = () => reject(new Error("Failed reading file content."));
      reader.readAsText(file);
    });
  }

  /**
   * Format file size string
   * @param {number} bytes
   * @returns {string}
   */
  static formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

/* ==========================================================================
   4. UI CONTROLLER
   ========================================================================== */
export class CaseConverterUI {
  constructor() {
    this.textarea = document.getElementById("case-converter-input");
    this.fileInput = document.getElementById("case-file-input");
    this.uploadBtn = document.getElementById("btn-case-upload-trigger");
    this.sampleBtn = document.getElementById("btn-case-sample");
    this.pasteBtn = document.getElementById("btn-case-paste");
    this.clearBtn = document.getElementById("btn-case-clear");
    this.copyBtn = document.getElementById("btn-case-copy");
    this.downloadBtn = document.getElementById("btn-case-download");

    this.actionsContainer = document.getElementById("case-converter-actions");
    this.findInput = document.getElementById("find-input");
    this.replaceInput = document.getElementById("replace-input");
    this.findReplaceBtn = document.getElementById("btn-find-replace");

    this.dropzone = document.getElementById("case-converter-dropzone");
    this.dropOverlay = document.getElementById("case-drop-overlay");
    this.fileBanner = document.getElementById("case-file-banner");
    this.fileInfoSpan = document.getElementById("case-file-info");
    this.fileRemoveBtn = document.getElementById("btn-case-file-remove");

    // Stat Nodes
    this.statWords = document.getElementById("stat-case-words");
    this.statChars = document.getElementById("stat-case-chars");
    this.statSentences = document.getElementById("stat-case-sentences");
    this.statLines = document.getElementById("stat-case-lines");

    this.currentFileName = "";
    this.activeTransform = null;
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    // 1. Live Text Typing Analysis
    this.textarea.addEventListener("input", () => {
      if (this.activeTransform) {
        this.applyCurrentTransform();
      } else {
        this.updateStats();
      }
    });

    // 2. Case Conversion Action Buttons
    if (this.actionsContainer) {
      this.actionsContainer
        .querySelectorAll("[data-transform]")
        .forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const transformKey = e.currentTarget.getAttribute("data-transform");
            this.executeTransform(transformKey);
          });
        });
    }

    // 3. Find & Replace
    if (this.findReplaceBtn) {
      this.findReplaceBtn.addEventListener("click", () =>
        this.handleFindReplace(),
      );
    }

    // 4. Toolbar Buttons
    if (this.sampleBtn) {
      this.sampleBtn.addEventListener("click", () => this.loadSampleText());
    }

    if (this.pasteBtn) {
      this.pasteBtn.addEventListener("click", () => this.pasteFromClipboard());
    }

    if (this.uploadBtn && this.fileInput) {
      this.uploadBtn.addEventListener("click", () => this.fileInput.click());
      this.fileInput.addEventListener("change", (e) =>
        this.handleFileSelect(e),
      );
    }

    if (this.fileRemoveBtn) {
      this.fileRemoveBtn.addEventListener("click", () =>
        this.removeLoadedFile(),
      );
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => this.clearText());
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener("click", () => {
        CaseConverterUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `case-converted-${this.currentFileName}`
          : "case-converter-export.txt";
        CaseConverterUtils.downloadTextFile(this.textarea.value, fn);
      });
    }

    // 5. Drag & Drop File Upload
    if (this.dropzone) {
      ["dragenter", "dragover"].forEach((eventName) => {
        this.dropzone.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.dropOverlay) this.dropOverlay.style.display = "flex";
          },
          false,
        );
      });

      ["dragleave", "drop"].forEach((eventName) => {
        this.dropzone.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.dropOverlay) this.dropOverlay.style.display = "none";
          },
          false,
        );
      });

      this.dropzone.addEventListener("drop", (e) => this.handleDrop(e), false);
    }
  }

  executeTransform(key) {
    const text = this.textarea ? this.textarea.value : "";
    if (!text || text.trim() === "") {
      CaseConverterUtils.showToast(
        "Please enter text to convert case.",
        "info",
      );
      return;
    }

    let result = text;
    let label = "";

    switch (key) {
      case "uppercase":
        result = CaseConverterProcessing.toUppercase(text);
        label = "UPPERCASE";
        break;
      case "lowercase":
        result = CaseConverterProcessing.toLowercase(text);
        label = "lowercase";
        break;
      case "titlecase":
        result = CaseConverterProcessing.toTitleCase(text);
        label = "Title Case";
        break;
      case "sentencecase":
        result = CaseConverterProcessing.toSentenceCase(text);
        label = "Sentence case";
        break;
      case "capitalize":
        result = CaseConverterProcessing.toCapitalizeWords(text);
        label = "Capitalize Words";
        break;
      case "togglecase":
        result = CaseConverterProcessing.toToggleCase(text);
        label = "Toggle Case";
        break;
      default:
        break;
    }

    this.textarea.value = result;
    this.activeTransform = key;
    this.highlightActiveButton(key);
    this.updateStats();
    CaseConverterUtils.showToast(`Converted to ${label}!`, "success");
  }

  applyCurrentTransform() {
    if (this.activeTransform) {
      const text = this.textarea.value;
      let result = text;
      switch (this.activeTransform) {
        case "uppercase":
          result = CaseConverterProcessing.toUppercase(text);
          break;
        case "lowercase":
          result = CaseConverterProcessing.toLowercase(text);
          break;
        case "titlecase":
          result = CaseConverterProcessing.toTitleCase(text);
          break;
        case "sentencecase":
          result = CaseConverterProcessing.toSentenceCase(text);
          break;
        case "capitalize":
          result = CaseConverterProcessing.toCapitalizeWords(text);
          break;
        case "togglecase":
          result = CaseConverterProcessing.toToggleCase(text);
          break;
      }
      this.textarea.value = result;
    }
    this.updateStats();
  }

  highlightActiveButton(key) {
    if (!this.actionsContainer) return;
    this.actionsContainer
      .querySelectorAll("[data-transform]")
      .forEach((btn) => {
        if (btn.getAttribute("data-transform") === key) {
          btn.style.borderColor = "var(--primary)";
          btn.style.backgroundColor =
            "var(--primary-subtle, rgba(99, 102, 241, 0.12))";
          btn.style.color = "var(--primary)";
        } else {
          btn.style.borderColor = "var(--border-subtle)";
          btn.style.backgroundColor = "var(--bg-surface)";
          btn.style.color = "var(--text-main)";
        }
      });
  }

  handleFindReplace() {
    const findVal = this.findInput ? this.findInput.value : "";
    const replaceVal = this.replaceInput ? this.replaceInput.value : "";
    const text = this.textarea ? this.textarea.value : "";

    if (!text || text.trim() === "") {
      CaseConverterUtils.showToast("Text box is empty.", "info");
      return;
    }

    if (!findVal) {
      CaseConverterUtils.showToast("Please enter text to find.", "info");
      return;
    }

    const { result, count } = CaseConverterProcessing.findAndReplace(
      text,
      findVal,
      replaceVal,
    );

    if (count === 0) {
      CaseConverterUtils.showToast(`"${findVal}" not found in text.`, "info");
      return;
    }

    this.textarea.value = result;
    this.updateStats();
    CaseConverterUtils.showToast(
      `Replaced ${count} occurrence${count === 1 ? "" : "s"}!`,
      "success",
    );
  }

  updateStats() {
    const text = this.textarea ? this.textarea.value : "";
    const stats = CaseConverterProcessing.analyze(text);

    if (this.statWords)
      this.statWords.textContent = stats.words.toLocaleString();
    if (this.statChars)
      this.statChars.textContent = stats.chars.toLocaleString();
    if (this.statSentences)
      this.statSentences.textContent = stats.sentences.toLocaleString();
    if (this.statLines)
      this.statLines.textContent = stats.lines.toLocaleString();
  }

  async loadSampleText() {
    const sampleText = `THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.
Case Converter allows instant conversion between UPPERCASE, lowercase, Title Case, Sentence case, and Capitalized words.
Enjoy 100% private in-browser text transformation!`;

    this.textarea.value = sampleText;
    this.activeTransform = null;
    this.highlightActiveButton(null);
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats();
    CaseConverterUtils.showToast("Sample text loaded!", "info");
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.textarea.value = text;
          this.activeTransform = null;
          this.highlightActiveButton(null);
          this.updateStats();
          CaseConverterUtils.showToast(
            "Pasted text from clipboard!",
            "success",
          );
        } else {
          CaseConverterUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        CaseConverterUtils.showToast(
          "Press Ctrl+V / Cmd+V to paste into text box",
          "info",
        );
      }
    } catch (err) {
      this.textarea.focus();
      CaseConverterUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
    }
  }

  async handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      await this.processFile(file);
      this.fileInput.value = "";
    }
  }

  async handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt && dt.files && dt.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async processFile(file) {
    const validation = CaseConverterValidation.validateFile(file);
    if (!validation.isValid) {
      CaseConverterUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await CaseConverterUtils.readFileAsText(file);
      this.textarea.value = text;
      this.activeTransform = null;
      this.highlightActiveButton(null);
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${CaseConverterUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.updateStats();
      CaseConverterUtils.showToast(
        `Loaded "${file.name}" successfully!`,
        "success",
      );
    } catch (err) {
      CaseConverterUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    CaseConverterUtils.showToast("File attachment unloaded", "info");
  }

  hideFileBanner() {
    if (this.fileBanner) {
      this.fileBanner.style.display = "none";
    }
  }

  clearText() {
    if (!this.textarea.value) return;
    this.textarea.value = "";
    this.activeTransform = null;
    this.highlightActiveButton(null);
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats();
    CaseConverterUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new CaseConverterUI();
  controller.init();
});
