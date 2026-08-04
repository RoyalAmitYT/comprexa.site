// @ts-nocheck
/**
 * Comprexa Word Counter Tool - Independent Implementation
 * Complete client-side real-time text analysis.
 */

/* ==========================================================================
   1. PROCESSING ENGINE
   ========================================================================== */
export class WordCounterProcessing {
  /**
   * Analyze raw text and compute word statistics
   * @param {string} text
   * @returns {Object} Calculated stats object
   */
  static analyze(text = "") {
    if (typeof text !== "string" || text.length === 0) {
      return {
        words: 0,
        characters: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        avgWordLength: "0.0",
        readingTime: "0 sec",
        speakingTime: "0 sec",
        longestWord: "-",
        shortestWord: "-",
      };
    }

    const characters = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const trimmed = text.trim();

    if (!trimmed) {
      return {
        words: 0,
        characters,
        charsNoSpaces,
        sentences: 0,
        paragraphs: 0,
        avgWordLength: "0.0",
        readingTime: "0 sec",
        speakingTime: "0 sec",
        longestWord: "-",
        shortestWord: "-",
      };
    }

    // Extract word tokens supporting Unicode letters, numbers, hyphens, and apostrophes
    const wordTokens =
      trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi) || [];
    const words = wordTokens.length;

    // Sentences: match sentence terminators or non-empty blocks
    const sentenceMatches = trimmed.match(/[^.!?\r\n]+[.!?\r\n]+/g);
    const sentences = sentenceMatches
      ? sentenceMatches.length
      : trimmed.length > 0
        ? 1
        : 0;

    // Paragraphs: non-empty line chunks
    const paragraphChunks = trimmed
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);
    const paragraphs = paragraphChunks.length || (trimmed.length > 0 ? 1 : 0);

    // Reading time (~200 WPM)
    const readSecs = Math.round((words / 200) * 60);
    const readingTime = this.formatDuration(readSecs);

    // Speaking time (~130 WPM)
    const speakSecs = Math.round((words / 130) * 60);
    const speakingTime = this.formatDuration(speakSecs);

    // Average word length, longest & shortest words
    let avgWordLength = "0.0";
    let longestWord = "-";
    let shortestWord = "-";

    if (words > 0) {
      const totalWordCharCount = wordTokens.reduce(
        (acc, w) => acc + w.length,
        0,
      );
      avgWordLength = (totalWordCharCount / words).toFixed(1);

      let maxLen = -1;
      let minLen = Infinity;

      for (const token of wordTokens) {
        // Strip trailing/leading non-alphanumeric chars for accurate length evaluation
        const clean = token.replace(
          /^[^\w\u00C0-\u024F\u0400-\u04FF]+|[^\w\u00C0-\u024F\u0400-\u04FF]+$/g,
          "",
        );
        const target = clean.length > 0 ? clean : token;

        if (target.length > maxLen) {
          maxLen = target.length;
          longestWord = target;
        }
        if (target.length < minLen) {
          minLen = target.length;
          shortestWord = target;
        }
      }
    }

    return {
      words,
      characters,
      charsNoSpaces,
      sentences,
      paragraphs,
      avgWordLength,
      readingTime,
      speakingTime,
      longestWord,
      shortestWord,
    };
  }

  static formatDuration(totalSeconds) {
    if (totalSeconds <= 0) return "0 sec";
    if (totalSeconds < 60) return `${totalSeconds} sec`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs}s`;
  }
}

/* ==========================================================================
   2. VALIDATION ENGINE
   ========================================================================== */
export class WordCounterValidation {
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
}

/* ==========================================================================
   3. UTILITIES
   ========================================================================== */
export class WordCounterUtils {
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
  static downloadTextFile(text, filename = "word-counter-export.txt") {
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
export class WordCounterUI {
  constructor() {
    this.textarea = document.getElementById("word-counter-input");
    this.fileInput = document.getElementById("word-file-input");
    this.uploadBtn = document.getElementById("btn-word-upload-trigger");
    this.sampleBtn = document.getElementById("btn-word-sample");
    this.pasteBtn = document.getElementById("btn-word-paste");
    this.clearBtn = document.getElementById("btn-word-clear");
    this.copyBtn = document.getElementById("btn-word-copy");
    this.downloadBtn = document.getElementById("btn-word-download");
    this.dropzone = document.getElementById("word-counter-dropzone");
    this.dropOverlay = document.getElementById("word-drop-overlay");
    this.fileBanner = document.getElementById("word-file-banner");
    this.fileInfoSpan = document.getElementById("word-file-info");
    this.fileRemoveBtn = document.getElementById("btn-word-file-remove");

    // DOM Stat Nodes
    this.statWords = document.getElementById("stat-words");
    this.statChars = document.getElementById("stat-chars");
    this.statCharsNoSpaces = document.getElementById("stat-chars-no-spaces");
    this.statSentences = document.getElementById("stat-sentences");
    this.statParagraphs = document.getElementById("stat-paragraphs");
    this.statAvgLength = document.getElementById("stat-avg-length");
    this.statReadingTime = document.getElementById("stat-reading-time");
    this.statSpeakingTime = document.getElementById("stat-speaking-time");
    this.statLongestWord = document.getElementById("stat-longest-word");
    this.statShortestWord = document.getElementById("stat-shortest-word");

    this.debounceTimer = null;
    this.currentFileName = "";
  }

  init() {
    if (!this.textarea) return;

    this.bindEvents();
    this.updateStats(); // Initial zero state check
  }

  bindEvents() {
    // 1. Live Input Analysis
    this.textarea.addEventListener("input", () => this.handleInputDebounced());
    this.textarea.addEventListener("keyup", () => this.handleInputDebounced());

    // 2. Toolbar Actions
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
        WordCounterUtils.copyToClipboard(this.textarea.value);
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const fn = this.currentFileName
          ? `word-count-${this.currentFileName}`
          : "word-counter-export.txt";
        WordCounterUtils.downloadTextFile(this.textarea.value, fn);
      });
    }

    // 3. Drag & Drop File Upload
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

  handleInputDebounced() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updateStats();
    }, 20); // Fast 20ms real-time recalculation
  }

  updateStats() {
    const text = this.textarea ? this.textarea.value : "";
    const stats = WordCounterProcessing.analyze(text);

    if (this.statWords)
      this.statWords.textContent = stats.words.toLocaleString();
    if (this.statChars)
      this.statChars.textContent = stats.characters.toLocaleString();
    if (this.statCharsNoSpaces)
      this.statCharsNoSpaces.textContent = stats.charsNoSpaces.toLocaleString();
    if (this.statSentences)
      this.statSentences.textContent = stats.sentences.toLocaleString();
    if (this.statParagraphs)
      this.statParagraphs.textContent = stats.paragraphs.toLocaleString();
    if (this.statAvgLength)
      this.statAvgLength.textContent = `${stats.avgWordLength} chars`;
    if (this.statReadingTime)
      this.statReadingTime.textContent = stats.readingTime;
    if (this.statSpeakingTime)
      this.statSpeakingTime.textContent = stats.speakingTime;
    if (this.statLongestWord)
      this.statLongestWord.textContent = stats.longestWord;
    if (this.statShortestWord)
      this.statShortestWord.textContent = stats.shortestWord;
  }

  async loadSampleText() {
    const sampleText = `The quick brown fox jumps over the lazy dog. Comprexa delivers high-performance, 100% private client-side browser utilities for developers, writers, and digital professionals.

With zero server dependencies or cloud file uploads, every word processing and analysis task is computed entirely inside your local browser memory. Enjoy instant responsiveness, complete security, and infinite productivity.`;

    this.textarea.value = sampleText;
    this.currentFileName = "";
    this.hideFileBanner();
    this.updateStats();
    WordCounterUtils.showToast("Sample text loaded!", "info");
  }

  async pasteFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.textarea.value = text;
          this.updateStats();
          WordCounterUtils.showToast("Pasted text from clipboard!", "success");
        } else {
          WordCounterUtils.showToast("Clipboard is empty", "info");
        }
      } else {
        this.textarea.focus();
        WordCounterUtils.showToast(
          "Press Ctrl+V / Cmd+V to paste into text box",
          "info",
        );
      }
    } catch (err) {
      this.textarea.focus();
      WordCounterUtils.showToast("Press Ctrl+V / Cmd+V to paste", "info");
    }
  }

  async handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      await this.processFile(file);
      this.fileInput.value = ""; // reset input
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
    const validation = WordCounterValidation.validateFile(file);
    if (!validation.isValid) {
      WordCounterUtils.showToast(validation.error, "error");
      return;
    }

    try {
      const text = await WordCounterUtils.readFileAsText(file);
      this.textarea.value = text;
      this.currentFileName = file.name;

      if (this.fileBanner && this.fileInfoSpan) {
        this.fileInfoSpan.textContent = `Loaded file: ${file.name} (${WordCounterUtils.formatBytes(file.size)})`;
        this.fileBanner.style.display = "flex";
      }

      this.updateStats();
      WordCounterUtils.showToast(
        `Loaded "${file.name}" successfully!`,
        "success",
      );
    } catch (err) {
      WordCounterUtils.showToast(
        err.message || "Failed to read file content.",
        "error",
      );
    }
  }

  removeLoadedFile() {
    this.currentFileName = "";
    this.hideFileBanner();
    WordCounterUtils.showToast("File attachment unloaded", "info");
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
    WordCounterUtils.showToast("Text cleared", "info");
  }
}

// Auto Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const controller = new WordCounterUI();
  controller.init();
});
