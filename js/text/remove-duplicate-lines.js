// @ts-nocheck
/**
 * Comprexa Remove Duplicate Lines Tool - Independent Implementation
 * Complete client-side real-time line deduplication and sorting engine.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class RemoveDuplicateLinesProcessing {
  /**
   * Remove duplicate lines according to user settings
   * @param {string} text
   * @param {Object} options
   * @returns {Object} { cleanedText, totalLines, removedCount, remainingLines }
   */
  static deduplicate(text = "", options = {}) {
    if (typeof text !== "string" || text.length === 0) {
      return {
        cleanedText: "",
        totalLines: 0,
        removedCount: 0,
        remainingLines: 0,
      };
    }

    const {
      removeDuplicates = true,
      caseSensitive = false,
      occurrenceStrategy = "first", // 'first' | 'last'
      sortOutput = "none", // 'none' | 'alpha-asc' | 'alpha-desc'
      ignoreBlankLines = true,
    } = options;

    const rawLines = text.split(/\r\n|\r|\n/);
    const totalLines = rawLines.length;

    if (!removeDuplicates) {
      let resLines = [...rawLines];
      if (sortOutput === "alpha-asc") {
        resLines.sort((a, b) => a.localeCompare(b));
      } else if (sortOutput === "alpha-desc") {
        resLines.sort((a, b) => b.localeCompare(a));
      }
      return {
        cleanedText: resLines.join("\n"),
        totalLines,
        removedCount: 0,
        remainingLines: resLines.length,
      };
    }

    const normalizedKeys = rawLines.map((line) => {
      return caseSensitive ? line : line.toLowerCase();
    });

    let keptIndices = [];

    if (occurrenceStrategy === "last") {
      const lastIndexMap = new Map();
      for (let i = 0; i < rawLines.length; i++) {
        const isBlank = rawLines[i].trim().length === 0;
        if (isBlank && ignoreBlankLines) {
          lastIndexMap.set(`__blank_${i}__`, i);
        } else {
          const key = normalizedKeys[i];
          lastIndexMap.set(key, i);
        }
      }

      for (let i = 0; i < rawLines.length; i++) {
        const isBlank = rawLines[i].trim().length === 0;
        if (isBlank && ignoreBlankLines) {
          keptIndices.push(i);
        } else {
          const key = normalizedKeys[i];
          if (lastIndexMap.get(key) === i) {
            keptIndices.push(i);
          }
        }
      }
    } else {
      // Default: 'first'
      const seenSet = new Set();
      for (let i = 0; i < rawLines.length; i++) {
        const isBlank = rawLines[i].trim().length === 0;
        if (isBlank && ignoreBlankLines) {
          keptIndices.push(i);
        } else {
          const key = normalizedKeys[i];
          if (!seenSet.has(key)) {
            seenSet.add(key);
            keptIndices.push(i);
          }
        }
      }
    }

    let resultLines = keptIndices.map((idx) => rawLines[idx]);

    if (sortOutput === "alpha-asc") {
      resultLines.sort((a, b) => a.localeCompare(b));
    } else if (sortOutput === "alpha-desc") {
      resultLines.sort((a, b) => b.localeCompare(a));
    }

    const remainingLines = resultLines.length;
    const removedCount = totalLines - remainingLines;

    return {
      cleanedText: resultLines.join("\n"),
      totalLines,
      removedCount,
      remainingLines,
    };
  }

  /**
   * Analyze statistics for cleaned text
   * @param {string} cleanedText
   * @returns {number} Word count
   */
  static countWords(cleanedText = "") {
    const trimmed = cleanedText.trim();
    if (!trimmed) return 0;
    const tokens = trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || [];
    return tokens.length;
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class RemoveDuplicateLinesValidation {
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
export class RemoveDuplicateLinesUtils {
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
      this.showToast("Deduplicated text copied to clipboard!", "success");
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
  static downloadTextFile(text, filename = "deduplicated-lines-export.txt") {
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
export class RemoveDuplicateLinesUI {
  constructor() {
    this.textarea = document.getElementById("dedupe-input");
    this.fileInput = document.getElementById("dedupe-file-input");
    this.uploadBtn = document.getElementById("btn-dedupe-upload-trigger");
    this.sampleBtn = document.getElementById("btn-dedupe-sample");
    this.pasteBtn = document.getElementById("btn-dedupe-paste");
    this.clearBtn = document.getElementById("btn-dedupe-clear");
    this.copyBtn = document.getElementById("btn-dedupe-copy");
    this.downloadBtn = document.getElementById("btn-dedupe-download");

    // Option Controls
    this.chkRemoveDuplicates = document.getElementById("chk-remove-duplicates");
    this.chkCaseSensitive = document.getElementById("chk-case-sensitive");
    this.selOccurrence = document.getElementById("sel-occurrence");
    this.selSort = document.getElementById("sel-sort");
    this.chkIgnoreBlank = document.getElementById("chk-ignore-blank");

    // Dropzone & File Banner
    this.dropzone = document.getElementById("dedupe-dropzone");
    this.dropOverlay = document.getElementById("dedupe-drop-overlay");
    this.fileBanner = document.getElementById("dedupe-file-banner");
    this.fileInfoSpan = document.getElementById("dedupe-file-info");
    this.fileRemoveBtn = document.getElementById("btn-dedupe-file-remove");

    // Stat Nodes
    this.statTotalLines = document.getElementById("stat-dedupe-total-lines");
    this.statRemovedLines = document.getElementById(
      "stat-dedupe-removed-lines",
    );
    this.statRemainingLines = document.getElementById(
      "stat-dedupe-remaining-lines",
    );
    this.statWords = document.getElementById("stat-dedupe-words");

    this.currentFileName = "";
    this.rawTextMemory = "";
    this.isInternalUpdate = false;
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats(0, 0, 0, 0);
  }

  bindEvents() {
    // 1. Live Typing / Input Listener
    this.textarea.addEventListener("input", () => {
      if (this.isInternalUpdate) return;
      this.rawTextMemory = this.textarea.value;
      this.processAndRender(false);
    });

    // 2. Option Controls Change Listeners
    const optionElements = [
      this.chkRemoveDuplicates,
      this.chkCaseSensitive,
      this.selOccurrence,
      this.selSort,
      this.chkIgnoreBlank,
    ];

    optionElements.forEach((el) => {
      if (el) {
        el.addEventListener("change", () => this.processAndRender(true));
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
        RemoveDuplicateLinesUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `deduplicated-${this.currentFileName}`
          : "deduplicated-lines-export.txt";
        RemoveDuplicateLinesUtils.downloadTextFile(this.textarea.value, fn);
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
      this.updateStats(0, 0, 0, 0);
      return;
    }

    const options = {
      removeDuplicates: this.chkRemoveDuplicates
        ? this.chkRemoveDuplicates.checked
        : true,
      caseSensitive: this.chkCaseSensitive
        ? this.chkCaseSensitive.checked
        : false,
      occurrenceStrategy: this.selOccurrence
        ? this.selOccurrence.value
        : "first",
      sortOutput: this.selSort ? this.selSort.value : "none",
      ignoreBlankLines: this.chkIgnoreBlank
        ? this.chkIgnoreBlank.checked
        : true,
    };

    const result = RemoveDuplicateLinesProcessing.deduplicate(rawText, options);
    const wordCount = RemoveDuplicateLinesProcessing.countWords(
      result.cleanedText,
    );

    this.isInternalUpdate = true;
    this.textarea.value = result.cleanedText;
    this.isInternalUpdate = false;

    this.updateStats(
      result.totalLines,
      result.removedCount,
      result.remainingLines,
      wordCount,
    );

    if (notifyUser) {
      RemoveDuplicateLinesUtils.showToast(
        "Duplicate lines updated!",
        "success",
      );
    }
  }

  updateStats(
    totalLines = 0,
    removedCount = 0,
    remainingLines = 0,
    wordCount = 0,
  ) {
    if (this.statTotalLines)
      this.statTotalLines.textContent = totalLines.toLocaleString();
    if (this.statRemovedLines)
      this.statRemovedLines.textContent = removedCount.toLocaleString();
    if (this.statRemainingLines)
      this.statRemainingLines.textContent = remainingLines.toLocaleString();
    if (this.statWords) this.statWords.textContent = wordCount.toLocaleString();
  }

  async loadSampleText() {
    const sampleText = `apple
banana
Apple
cherry
banana
date
apple
elderberry
fig
cherry`;

    this.rawTextMemory = sampleText;
    this.currentFileName = "";
    this.hideFileBanner();
    this.processAndRender(false);
    RemoveDuplicateLinesUtils.showToast(
      "Sample list with duplicates loaded!",
      "info",
    );
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.rawTextMemory = text;
          this.processAndRender(false);
          RemoveDuplicateLinesUtils.showToast(
            "Pasted list from clipboard!",
            "success",
          );
        } else {
          RemoveDuplicateLinesUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        RemoveDuplicateLinesUtils.showToast(
          "Press Ctrl+V / Cmd+V to paste",
          "info",
        );
      }
    } catch (err) {
      this.textarea.focus();
      RemoveDuplicateLinesUtils.showToast(
        "Press Ctrl+V / Cmd+V to paste",
        "info",
      );
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
    const validation = RemoveDuplicateLinesValidation.validateFile(file);
    if (!validation.isValid) {
      RemoveDuplicateLinesUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await RemoveDuplicateLinesUtils.readFileAsText(file);
      this.rawTextMemory = text;
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${RemoveDuplicateLinesUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.processAndRender(false);
      RemoveDuplicateLinesUtils.showToast(
        `Loaded "${file.name}" and removed duplicate lines!`,
        "success",
      );
    } catch (err) {
      RemoveDuplicateLinesUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    RemoveDuplicateLinesUtils.showToast("File attachment unloaded", "info");
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
    this.updateStats(0, 0, 0, 0);
    RemoveDuplicateLinesUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new RemoveDuplicateLinesUI();
  controller.init();
});
