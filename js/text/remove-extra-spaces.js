// @ts-nocheck
/**
 * Comprexa Remove Extra Spaces Tool - Independent Implementation
 * Complete client-side real-time whitespace cleanup and text normalization.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class RemoveExtraSpacesProcessing {
  /**
   * Clean extra spaces and white space according to specified rules
   * @param {string} text
   * @param {Object} options
   * @returns {string} Cleaned text
   */
  static cleanSpaces(text = "", options = {}) {
    if (typeof text !== "string" || text.length === 0) {
      return "";
    }

    const {
      removeMultipleSpaces = true,
      removeLeadingSpaces = true,
      removeTrailingSpaces = true,
      trimLines = true,
      removeEmptyLines = false,
      replaceMultipleBlankLines = true,
    } = options;

    let lines = text.split(/\r\n|\r|\n/);

    lines = lines.map((line) => {
      let l = line;

      // 1. Remove multiple consecutive spaces/tabs between words
      if (removeMultipleSpaces) {
        l = l.replace(/[ \t]{2,}/g, " ");
      }

      // 2. Line whitespace trimming rules
      if (trimLines) {
        l = l.trim();
      } else {
        if (removeLeadingSpaces) {
          l = l.replace(/^[ \t]+/, "");
        }
        if (removeTrailingSpaces) {
          l = l.replace(/[ \t]+$/, "");
        }
      }

      return l;
    });

    // 3. Filter empty lines if enabled
    if (removeEmptyLines) {
      lines = lines.filter((line) => line.length > 0);
    }

    let result = lines.join("\n");

    // 4. Collapse multiple consecutive blank lines down to a single blank line
    if (replaceMultipleBlankLines && !removeEmptyLines) {
      result = result.replace(/(\n\s*){2,}\n/g, "\n\n");
    }

    return result;
  }

  /**
   * Analyze raw and cleaned text statistics
   * @param {string} rawText
   * @param {string} cleanedText
   * @returns {Object} { words, chars, lines, spacesSaved }
   */
  static analyze(rawText = "", cleanedText = "") {
    const chars = cleanedText.length;
    const trimmed = cleanedText.trim();

    const wordTokens = trimmed
      ? trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || []
      : [];
    const words = wordTokens.length;

    const lines = cleanedText ? cleanedText.split("\n").length : 0;
    const spacesSaved = Math.max(0, rawText.length - cleanedText.length);

    return { words, chars, lines, spacesSaved };
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class RemoveExtraSpacesValidation {
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
export class RemoveExtraSpacesUtils {
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
      this.showToast("Cleaned text copied to clipboard!", "success");
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
  static downloadTextFile(text, filename = "cleaned-spaces-export.txt") {
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
export class RemoveExtraSpacesUI {
  constructor() {
    this.textarea = document.getElementById("spaces-input");
    this.fileInput = document.getElementById("spaces-file-input");
    this.uploadBtn = document.getElementById("btn-spaces-upload-trigger");
    this.sampleBtn = document.getElementById("btn-spaces-sample");
    this.pasteBtn = document.getElementById("btn-spaces-paste");
    this.clearBtn = document.getElementById("btn-spaces-clear");
    this.copyBtn = document.getElementById("btn-spaces-copy");
    this.downloadBtn = document.getElementById("btn-spaces-download");

    // Option Controls
    this.chkMultipleSpaces = document.getElementById("chk-multiple-spaces");
    this.chkLeadingSpaces = document.getElementById("chk-leading-spaces");
    this.chkTrailingSpaces = document.getElementById("chk-trailing-spaces");
    this.chkTrimLines = document.getElementById("chk-trim-lines");
    this.chkRemoveEmpty = document.getElementById("chk-remove-empty");
    this.chkBlankLines = document.getElementById("chk-blank-lines");

    // Dropzone & File Banner
    this.dropzone = document.getElementById("spaces-dropzone");
    this.dropOverlay = document.getElementById("spaces-drop-overlay");
    this.fileBanner = document.getElementById("spaces-file-banner");
    this.fileInfoSpan = document.getElementById("spaces-file-info");
    this.fileRemoveBtn = document.getElementById("btn-spaces-file-remove");

    // Stat Nodes
    this.statWords = document.getElementById("stat-spaces-words");
    this.statChars = document.getElementById("stat-spaces-chars");
    this.statLines = document.getElementById("stat-spaces-lines");
    this.statSpacesSaved = document.getElementById("stat-spaces-saved");

    this.currentFileName = "";
    this.rawTextMemory = "";
    this.isInternalUpdate = false;
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    // 1. Live Typing / Input Listener
    this.textarea.addEventListener("input", () => {
      if (this.isInternalUpdate) return;
      this.rawTextMemory = this.textarea.value;
      this.processAndRender(false);
    });

    // 2. Option Checkbox Change Listeners
    const optionCheckboxes = [
      this.chkMultipleSpaces,
      this.chkLeadingSpaces,
      this.chkTrailingSpaces,
      this.chkTrimLines,
      this.chkRemoveEmpty,
      this.chkBlankLines,
    ];

    optionCheckboxes.forEach((chk) => {
      if (chk) {
        chk.addEventListener("change", () => this.processAndRender(true));
      }
    });

    // 3. Toolbar Action Buttons
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
        RemoveExtraSpacesUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `cleaned-${this.currentFileName}`
          : "cleaned-spaces-export.txt";
        RemoveExtraSpacesUtils.downloadTextFile(this.textarea.value, fn);
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

  processAndRender(notifyUser = false) {
    const rawText =
      this.rawTextMemory || (this.textarea ? this.textarea.value : "");
    if (!rawText) {
      this.updateStats("", "");
      return;
    }

    const options = {
      removeMultipleSpaces: this.chkMultipleSpaces
        ? this.chkMultipleSpaces.checked
        : true,
      removeLeadingSpaces: this.chkLeadingSpaces
        ? this.chkLeadingSpaces.checked
        : true,
      removeTrailingSpaces: this.chkTrailingSpaces
        ? this.chkTrailingSpaces.checked
        : true,
      trimLines: this.chkTrimLines ? this.chkTrimLines.checked : true,
      removeEmptyLines: this.chkRemoveEmpty
        ? this.chkRemoveEmpty.checked
        : false,
      replaceMultipleBlankLines: this.chkBlankLines
        ? this.chkBlankLines.checked
        : true,
    };

    const cleanedText = RemoveExtraSpacesProcessing.cleanSpaces(
      rawText,
      options,
    );

    this.isInternalUpdate = true;
    this.textarea.value = cleanedText;
    this.isInternalUpdate = false;

    this.updateStats(rawText, cleanedText);

    if (notifyUser) {
      RemoveExtraSpacesUtils.showToast("Updated cleaned text!", "success");
    }
  }

  updateStats(rawText = "", cleanedText = "") {
    const stats = RemoveExtraSpacesProcessing.analyze(rawText, cleanedText);

    if (this.statWords)
      this.statWords.textContent = stats.words.toLocaleString();
    if (this.statChars)
      this.statChars.textContent = stats.chars.toLocaleString();
    if (this.statLines)
      this.statLines.textContent = stats.lines.toLocaleString();
    if (this.statSpacesSaved)
      this.statSpacesSaved.textContent = stats.spacesSaved.toLocaleString();
  }

  async loadSampleText() {
    const sampleText = `   This  sentence    contains   multiple   unnecessary   spaces.  

    Another   line   with    excessive    indentation   and   trailing  spaces.   


   Multiple   consecutive   blank   lines   are   present   above   and   below.  `;

    this.rawTextMemory = sampleText;
    this.currentFileName = "";
    this.hideFileBanner();
    this.processAndRender(false);
    RemoveExtraSpacesUtils.showToast("Sample messy text loaded!", "info");
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.rawTextMemory = text;
          this.processAndRender(false);
          RemoveExtraSpacesUtils.showToast(
            "Pasted text from clipboard!",
            "success",
          );
        } else {
          RemoveExtraSpacesUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        RemoveExtraSpacesUtils.showToast(
          "Press Ctrl+V / Cmd+V to paste",
          "info",
        );
      }
    } catch (err) {
      this.textarea.focus();
      RemoveExtraSpacesUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
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
    const validation = RemoveExtraSpacesValidation.validateFile(file);
    if (!validation.isValid) {
      RemoveExtraSpacesUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await RemoveExtraSpacesUtils.readFileAsText(file);
      this.rawTextMemory = text;
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${RemoveExtraSpacesUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.processAndRender(false);
      RemoveExtraSpacesUtils.showToast(
        `Loaded "${file.name}" and cleaned extra spaces!`,
        "success",
      );
    } catch (err) {
      RemoveExtraSpacesUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    RemoveExtraSpacesUtils.showToast("File attachment unloaded", "info");
  }

  hideFileBanner() {
    if (this.fileBanner) {
      this.fileBanner.style.display = "none";
    }
  }

  clearText() {
    if (!this.textarea.value && !this.rawTextMemory) return;
    this.textarea.value = "";
    this.rawTextMemory = "";
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats("", "");
    RemoveExtraSpacesUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new RemoveExtraSpacesUI();
  controller.init();
});
