// @ts-nocheck
/**
 * Comprexa Text Sorter Tool - Independent Implementation
 * Complete client-side real-time line sorting and text organization.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class TextSorterProcessing {
  /**
   * Sort lines according to mode and options
   * @param {string} text
   * @param {Object} options
   * @returns {string}
   */
  static sortLines(text = "", options = {}) {
    if (!text) return "";

    const {
      mode = "alpha-asc",
      removeEmpty = false,
      removeDuplicates = false,
      trimLines = false,
      caseSensitive = false,
    } = options;

    let lines = text.split(/\r\n|\r|\n/);

    // 1. Trim line whitespace if enabled
    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    // 2. Remove empty lines if enabled
    if (removeEmpty) {
      lines = lines.filter((l) => l.trim().length > 0);
    }

    // 3. Remove duplicate lines if enabled
    if (removeDuplicates) {
      const seen = new Set();
      lines = lines.filter((l) => {
        const key = caseSensitive ? l : l.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // 4. Sort according to selected mode
    switch (mode) {
      case "alpha-asc":
        lines.sort((a, b) => {
          if (caseSensitive) {
            return a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "variant",
            });
          }
          return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        break;

      case "alpha-desc":
        lines.sort((a, b) => {
          if (caseSensitive) {
            return b.localeCompare(a, undefined, {
              numeric: true,
              sensitivity: "variant",
            });
          }
          return b.localeCompare(a, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        break;

      case "length-asc":
        lines.sort((a, b) => {
          const diff = a.length - b.length;
          if (diff !== 0) return diff;
          return a.localeCompare(b);
        });
        break;

      case "length-desc":
        lines.sort((a, b) => {
          const diff = b.length - a.length;
          if (diff !== 0) return diff;
          return a.localeCompare(b);
        });
        break;

      case "reverse":
        lines.reverse();
        break;

      default:
        break;
    }

    return lines.join("\n");
  }

  /**
   * Analyze line and character statistics
   * @param {string} text
   * @returns {Object} { lines, unique, words, chars }
   */
  static analyze(text = "") {
    if (!text) {
      return { lines: 0, unique: 0, words: 0, chars: 0 };
    }

    const rawLines = text.split(/\r\n|\r|\n/);
    const totalLines = rawLines.length;

    const uniqueSet = new Set(rawLines.map((l) => l.trim().toLowerCase()));
    const uniqueLines = uniqueSet.size;

    const chars = text.length;
    const trimmed = text.trim();
    const wordTokens = trimmed
      ? trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || []
      : [];
    const words = wordTokens.length;

    return { lines: totalLines, unique: uniqueLines, words, chars };
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class TextSorterValidation {
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
export class TextSorterUtils {
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
   * Copy text to clipboard
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
      this.showToast("Sorted text copied to clipboard!", "success");
      return true;
    } catch (err) {
      this.showToast("Failed to copy text to clipboard", "error");
      return false;
    }
  }

  /**
   * Download text as .txt file
   * @param {string} text
   * @param {string} filename
   */
  static downloadTextFile(text, filename = "sorted-lines-export.txt") {
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
   * Format file size
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
export class TextSorterUI {
  constructor() {
    this.textarea = document.getElementById("sorter-input");
    this.fileInput = document.getElementById("sort-file-input");
    this.uploadBtn = document.getElementById("btn-sort-upload-trigger");
    this.sampleBtn = document.getElementById("btn-sort-sample");
    this.pasteBtn = document.getElementById("btn-sort-paste");
    this.clearBtn = document.getElementById("btn-sort-clear");
    this.copyBtn = document.getElementById("btn-sort-copy");
    this.downloadBtn = document.getElementById("btn-sort-download");

    // Sort Options Controls
    this.modeSelect = document.getElementById("sort-mode-select");
    this.chkRemoveEmpty = document.getElementById("chk-remove-empty");
    this.chkRemoveDuplicates = document.getElementById("chk-remove-duplicates");
    this.chkTrimLines = document.getElementById("chk-trim-lines");
    this.chkCaseSensitive = document.getElementById("chk-case-sensitive");

    // Drag & Drop / File Banner
    this.dropzone = document.getElementById("sorter-dropzone");
    this.dropOverlay = document.getElementById("sorter-drop-overlay");
    this.fileBanner = document.getElementById("sorter-file-banner");
    this.fileInfoSpan = document.getElementById("sorter-file-info");
    this.fileRemoveBtn = document.getElementById("btn-sorter-file-remove");

    // Stats
    this.statLines = document.getElementById("stat-sort-lines");
    this.statUnique = document.getElementById("stat-sort-unique");
    this.statWords = document.getElementById("stat-sort-words");
    this.statChars = document.getElementById("stat-sort-chars");

    this.currentFileName = "";
    this.isInternalUpdate = false;
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    // 1. Text Typing / Input Change -> Auto Sort
    this.textarea.addEventListener("input", () => {
      if (this.isInternalUpdate) return;
      this.updateStats();
    });

    // 2. Option Controls -> Auto Apply Sort
    const options = [
      this.modeSelect,
      this.chkRemoveEmpty,
      this.chkRemoveDuplicates,
      this.chkTrimLines,
      this.chkCaseSensitive,
    ];

    options.forEach((control) => {
      if (control) {
        control.addEventListener("change", () => this.applySort(true));
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
        TextSorterUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `sorted-${this.currentFileName}`
          : "sorted-lines-export.txt";
        TextSorterUtils.downloadTextFile(this.textarea.value, fn);
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

  applySort(notifyUser = false) {
    const text = this.textarea ? this.textarea.value : "";
    if (!text || text.trim() === "") {
      this.updateStats();
      return;
    }

    const sortOptions = {
      mode: this.modeSelect ? this.modeSelect.value : "alpha-asc",
      removeEmpty: this.chkRemoveEmpty ? this.chkRemoveEmpty.checked : false,
      removeDuplicates: this.chkRemoveDuplicates
        ? this.chkRemoveDuplicates.checked
        : false,
      trimLines: this.chkTrimLines ? this.chkTrimLines.checked : false,
      caseSensitive: this.chkCaseSensitive
        ? this.chkCaseSensitive.checked
        : false,
    };

    const sortedText = TextSorterProcessing.sortLines(text, sortOptions);

    this.isInternalUpdate = true;
    this.textarea.value = sortedText;
    this.isInternalUpdate = false;

    this.updateStats();

    if (notifyUser) {
      TextSorterUtils.showToast("Lines sorted successfully!", "success");
    }
  }

  updateStats() {
    const text = this.textarea ? this.textarea.value : "";
    const stats = TextSorterProcessing.analyze(text);

    if (this.statLines)
      this.statLines.textContent = stats.lines.toLocaleString();
    if (this.statUnique)
      this.statUnique.textContent = stats.unique.toLocaleString();
    if (this.statWords)
      this.statWords.textContent = stats.words.toLocaleString();
    if (this.statChars)
      this.statChars.textContent = stats.chars.toLocaleString();
  }

  async loadSampleText() {
    const sampleText = `Banana
apple
Orange
Cherry
apple
Banana
  Dragonfruit  
Elderberry
fig`;

    this.textarea.value = sampleText;
    this.currentFileName = "";
    this.hideFileBanner();
    this.applySort(false);
    TextSorterUtils.showToast("Sample lines loaded and sorted!", "info");
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.textarea.value = text;
          this.applySort(false);
          TextSorterUtils.showToast("Pasted text from clipboard!", "success");
        } else {
          TextSorterUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        TextSorterUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
      }
    } catch (err) {
      this.textarea.focus();
      TextSorterUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
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
    const validation = TextSorterValidation.validateFile(file);
    if (!validation.isValid) {
      TextSorterUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await TextSorterUtils.readFileAsText(file);
      this.textarea.value = text;
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${TextSorterUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.applySort(false);
      TextSorterUtils.showToast(
        `Loaded "${file.name}" and sorted lines!`,
        "success",
      );
    } catch (err) {
      TextSorterUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    TextSorterUtils.showToast("File attachment unloaded", "info");
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
    TextSorterUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new TextSorterUI();
  controller.init();
});
