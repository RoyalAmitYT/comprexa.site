// @ts-nocheck
/**
 * Comprexa Character Counter Tool - Independent Implementation
 * Real-time character analytics and social media character limit tracking.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class CharacterCounterProcessing {
  /**
   * Analyze raw text for character breakdown
   * @param {string} text
   * @returns {Object} Character stats
   */
  static analyze(text = "") {
    if (typeof text !== "string" || text.length === 0) {
      return {
        totalChars: 0,
        charsNoSpaces: 0,
        spaces: 0,
        letters: 0,
        numbers: 0,
        symbols: 0,
        lines: 0,
        words: 0,
      };
    }

    const totalChars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const spaces = (text.match(/\s/g) || []).length;

    // Count letters (including Unicode accented characters)
    let letters = 0;
    try {
      letters = (text.match(/[\p{L}]/gu) || []).length;
    } catch (e) {
      letters = (text.match(/[a-zA-Z\u00C0-\u024F\u0400-\u04FF]/g) || [])
        .length;
    }

    // Count numbers
    const numbers = (text.match(/[0-9]/g) || []).length;

    // Symbols: characters that are not letters, numbers, or whitespace
    const symbols = Math.max(0, totalChars - letters - numbers - spaces);

    // Total lines
    const lines = totalChars === 0 ? 0 : text.split(/\r\n|\r|\n/).length;

    // Total words
    const trimmed = text.trim();
    const wordTokens = trimmed
      ? trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || []
      : [];
    const words = wordTokens.length;

    return {
      totalChars,
      charsNoSpaces,
      spaces,
      letters,
      numbers,
      symbols,
      lines,
      words,
    };
  }

  /**
   * Calculate limit progress metrics
   * @param {number} current
   * @param {number} max
   * @returns {Object}
   */
  static calculateLimitProgress(current, max) {
    if (!max || max <= 0) {
      return {
        percentage: 0,
        remaining: 0,
        isWarning: false,
        isExceeded: false,
      };
    }

    const percentage = Math.min(Math.round((current / max) * 100), 100);
    const rawPercentage = (current / max) * 100;
    const remaining = max - current;
    const isWarning = rawPercentage >= 90 && rawPercentage <= 100;
    const isExceeded = current > max;

    return {
      percentage,
      rawPercentage,
      remaining,
      isWarning,
      isExceeded,
    };
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class CharacterCounterValidation {
  static SUPPORTED_EXTENSIONS = ["txt", "md", "csv"];
  static MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

  /**
   * Validate file before reading
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

  /**
   * Validate custom limit input
   * @param {number|string} val
   * @returns {number}
   */
  static sanitizeLimit(val) {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) return 280;
    return Math.min(num, 1000000); // capped at 1,000,000 chars
  }
}

/* ==========================================================================
   3. UTILITIES
   ========================================================================== */
export class CharacterCounterUtils {
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
      this.showToast("Text copied to clipboard!", "success");
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
  static downloadTextFile(text, filename = "character-counter-export.txt") {
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
export class CharacterCounterUI {
  constructor() {
    this.textarea = document.getElementById("char-counter-input");
    this.presetSelect = document.getElementById("char-limit-preset");
    this.customInput = document.getElementById("char-limit-custom");

    this.fileInput = document.getElementById("char-file-input");
    this.uploadBtn = document.getElementById("btn-char-upload-trigger");
    this.sampleBtn = document.getElementById("btn-char-sample");
    this.pasteBtn = document.getElementById("btn-char-paste");
    this.clearBtn = document.getElementById("btn-char-clear");
    this.copyBtn = document.getElementById("btn-char-copy");
    this.downloadBtn = document.getElementById("btn-char-download");

    this.dropzone = document.getElementById("char-counter-dropzone");
    this.dropOverlay = document.getElementById("char-drop-overlay");
    this.fileBanner = document.getElementById("char-file-banner");
    this.fileInfoSpan = document.getElementById("char-file-info");
    this.fileRemoveBtn = document.getElementById("btn-char-file-remove");

    // Progress Bar Elements
    this.limitCountDisplay = document.getElementById(
      "char-limit-count-display",
    );
    this.progressBar = document.getElementById("char-limit-progress-bar");
    this.warnBanner = document.getElementById("char-limit-warn-banner");

    // Stat Nodes
    this.statTotal = document.getElementById("stat-char-total");
    this.statNoSpaces = document.getElementById("stat-char-no-spaces");
    this.statSpaces = document.getElementById("stat-char-spaces");
    this.statLetters = document.getElementById("stat-char-letters");
    this.statNumbers = document.getElementById("stat-char-numbers");
    this.statSymbols = document.getElementById("stat-char-symbols");
    this.statLines = document.getElementById("stat-char-lines");
    this.statWords = document.getElementById("stat-char-words");

    this.currentLimit = 280; // default Twitter/X
    this.debounceTimer = null;
    this.currentFileName = "";
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    // 1. Live Input Event
    this.textarea.addEventListener("input", () => this.handleInputDebounced());
    this.textarea.addEventListener("keyup", () => this.handleInputDebounced());

    // 2. Preset Select
    if (this.presetSelect) {
      this.presetSelect.addEventListener("change", (e) =>
        this.handlePresetChange(e),
      );
    }

    if (this.customInput) {
      this.customInput.addEventListener("input", (e) => {
        this.currentLimit = CharacterCounterValidation.sanitizeLimit(
          e.target.value,
        );
        this.updateStats();
      });
    }

    // 3. Toolbar Buttons
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
        CharacterCounterUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `char-count-${this.currentFileName}`
          : "character-counter-export.txt";
        CharacterCounterUtils.downloadTextFile(this.textarea.value, fn);
      });
    }

    // 4. Drag & Drop File Upload
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

  handlePresetChange(e) {
    const val = e.target.value;
    if (val === "custom") {
      if (this.customInput) {
        this.customInput.style.display = "inline-block";
        this.customInput.focus();
        this.currentLimit = CharacterCounterValidation.sanitizeLimit(
          this.customInput.value || 5000,
        );
      }
    } else {
      if (this.customInput) this.customInput.style.display = "none";
      this.currentLimit = CharacterCounterValidation.sanitizeLimit(val);
    }
    this.updateStats();
  }

  handleInputDebounced() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updateStats();
    }, 20);
  }

  updateStats() {
    const text = this.textarea ? this.textarea.value : "";
    const stats = CharacterCounterProcessing.analyze(text);

    // Update Stat Cards
    if (this.statTotal)
      this.statTotal.textContent = stats.totalChars.toLocaleString();
    if (this.statNoSpaces)
      this.statNoSpaces.textContent = stats.charsNoSpaces.toLocaleString();
    if (this.statSpaces)
      this.statSpaces.textContent = stats.spaces.toLocaleString();
    if (this.statLetters)
      this.statLetters.textContent = stats.letters.toLocaleString();
    if (this.statNumbers)
      this.statNumbers.textContent = stats.numbers.toLocaleString();
    if (this.statSymbols)
      this.statSymbols.textContent = stats.symbols.toLocaleString();
    if (this.statLines)
      this.statLines.textContent = stats.lines.toLocaleString();
    if (this.statWords)
      this.statWords.textContent = stats.words.toLocaleString();

    // Update Limit Progress Bar
    const progress = CharacterCounterProcessing.calculateLimitProgress(
      stats.totalChars,
      this.currentLimit,
    );

    if (this.limitCountDisplay) {
      const pctStr = `${Math.round((stats.totalChars / this.currentLimit) * 100)}%`;
      this.limitCountDisplay.textContent = `${stats.totalChars.toLocaleString()} / ${this.currentLimit.toLocaleString()} (${pctStr})`;
    }

    if (this.progressBar) {
      const barWidth = Math.min(
        100,
        Math.round((stats.totalChars / this.currentLimit) * 100),
      );
      this.progressBar.style.width = `${barWidth}%`;

      if (progress.isExceeded) {
        this.progressBar.style.backgroundColor = "#ef4444"; // Red danger
      } else if (progress.isWarning) {
        this.progressBar.style.backgroundColor = "#f59e0b"; // Amber warning
      } else {
        this.progressBar.style.backgroundColor = "var(--primary)"; // Primary theme
      }
    }

    if (this.warnBanner) {
      if (progress.isExceeded) {
        const overCount = stats.totalChars - this.currentLimit;
        this.warnBanner.textContent = `Warning: You have exceeded the selected character limit by ${overCount.toLocaleString()} character${overCount === 1 ? "" : "s"}!`;
        this.warnBanner.style.display = "block";
      } else {
        this.warnBanner.style.display = "none";
      }
    }
  }

  async loadSampleText() {
    const sampleText = `Hello world! Character Counter lets you verify string lengths for Twitter (280), SMS (160), LinkedIn (3,000), and Instagram captions. Enjoy 100% private client-side processing!`;
    this.textarea.value = sampleText;
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats();
    CharacterCounterUtils.showToast("Sample text loaded!", "info");
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.textarea.value = text;
          this.updateStats();
          CharacterCounterUtils.showToast(
            "Pasted text from clipboard!",
            "success",
          );
        } else {
          CharacterCounterUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        CharacterCounterUtils.showToast(
          "Press Ctrl+V / Cmd+V to paste into text box",
          "info",
        );
      }
    } catch (err) {
      this.textarea.focus();
      CharacterCounterUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
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
    const validation = CharacterCounterValidation.validateFile(file);
    if (!validation.isValid) {
      CharacterCounterUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await CharacterCounterUtils.readFileAsText(file);
      this.textarea.value = text;
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${CharacterCounterUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.updateStats();
      CharacterCounterUtils.showToast(
        `Loaded "${file.name}" successfully!`,
        "success",
      );
    } catch (err) {
      CharacterCounterUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    CharacterCounterUtils.showToast("File attachment unloaded", "info");
  }

  hideFileBanner() {
    if (this.fileBanner) {
      this.fileBanner.style.display = "none";
    }
  }

  clearText() {
    if (!this.textarea.value) return;
    this.textarea.value = "";
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats();
    CharacterCounterUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new CharacterCounterUI();
  controller.init();
});
