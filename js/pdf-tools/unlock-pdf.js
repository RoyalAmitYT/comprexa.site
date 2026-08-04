/**
 * Comprexa Unlock PDF Tool Controller & Decryption Engine
 * Production-ready, 100% browser-based PDF decryption module using @pdfsmaller/pdf-decrypt & PDF-Lib.
 */

import { decryptPDF, isEncrypted } from "@pdfsmaller/pdf-decrypt";
import { PDFDocument } from "pdf-lib";

/**
 * ============================================================================
 * 1. UTILITIES MODULE
 * ============================================================================
 */
export class UnlockPdfUtils {
  /**
   * Format file size in human-readable bytes
   */
  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Validate uploaded candidate PDF file
   */
  static validatePdfFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected." };
    }
    if (file.size === 0) {
      return { valid: false, error: `File "${file.name}" is empty (0 bytes).` };
    }

    const name = file.name || "";
    const isPdfExt = name.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf" || file.type === "";

    if (!isPdfExt && !isPdfMime) {
      return {
        valid: false,
        error: `"${file.name}" is not a valid PDF document.`,
      };
    }

    return { valid: true };
  }

  /**
   * Toast notification helper
   */
  static showToast(message, type = "info", title = "") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type, title);
    }
  }
}

/**
 * ============================================================================
 * 2. VALIDATION MODULE
 * ============================================================================
 */
export class UnlockPdfValidator {
  /**
   * Validate unlock password input
   * @param {string} password
   * @returns {Object} - { valid: boolean, error?: string }
   */
  static validate(password = "") {
    const pw = (password || "").trim();
    if (!pw) {
      return {
        valid: false,
        error: "Password cannot be empty. Please enter the document password.",
      };
    }
    return { valid: true };
  }
}

/**
 * ============================================================================
 * 3. DECRYPTION ENGINE MODULE
 * ============================================================================
 */
export class UnlockPdfEngine {
  /**
   * Inspect PDF document encryption status
   * @param {File} pdfFile
   * @returns {Promise<{ isEncrypted: boolean, pageCount?: number }>}
   */
  async checkEncryption(pdfFile) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Verify PDF Header
    const headerStr = String.fromCharCode.apply(
      null,
      uint8Array.subarray(0, 5),
    );
    if (headerStr !== "%PDF-") {
      throw new Error(`"${pdfFile.name}" is not a valid PDF document.`);
    }

    let encryptedStatus = false;
    try {
      const info = await isEncrypted(uint8Array);
      encryptedStatus = Boolean(info && info.encrypted);
    } catch (err) {
      try {
        const windowPdfLib = window.PDFLib || { PDFDocument };
        if (windowPdfLib && windowPdfLib.PDFDocument) {
          await windowPdfLib.PDFDocument.load(arrayBuffer);
          encryptedStatus = false;
        }
      } catch (loadErr) {
        const msg = (loadErr.message || "").toLowerCase();
        if (msg.includes("encrypt") || msg.includes("password")) {
          encryptedStatus = true;
        }
      }
    }

    return { isEncrypted: encryptedStatus };
  }

  /**
   * Perform Client-Side PDF Decryption
   * @param {File} pdfFile - Encrypted PDF file
   * @param {string} password - User provided password
   * @param {Function} progressCallback - Progress reporter
   */
  async unlock(pdfFile, password, progressCallback = null) {
    if (!password) {
      throw new Error("Password cannot be empty.");
    }

    if (progressCallback)
      progressCallback(20, "Reading encrypted PDF stream...");
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (progressCallback)
      progressCallback(50, "Verifying password and decrypting PDF...");

    let decryptedBytes;
    try {
      decryptedBytes = await decryptPDF(uint8Array, password);
    } catch (err) {
      const msg = err ? err.message || "" : "";
      if (
        msg.toLowerCase().includes("incorrect password") ||
        msg.toLowerCase().includes("invalid password") ||
        msg.toLowerCase().includes("failed to decrypt")
      ) {
        throw new Error(
          "Incorrect password. Please enter the correct password for this document.",
        );
      }
      throw new Error(
        "Failed to decrypt document. Please verify the password and try again.",
      );
    }

    if (progressCallback)
      progressCallback(85, "Validating decrypted PDF structure...");

    // Read page count from decrypted bytes
    let pageCount = 1;
    try {
      const windowPdfLib = window.PDFLib || { PDFDocument };
      if (windowPdfLib && windowPdfLib.PDFDocument) {
        const unlockedDoc = await windowPdfLib.PDFDocument.load(decryptedBytes);
        pageCount = unlockedDoc.getPageCount();
      }
    } catch (e) {}

    if (progressCallback)
      progressCallback(95, "Generating unlocked PDF file...");

    const blob = new Blob([decryptedBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    return {
      blob,
      blobUrl,
      originalSize: pdfFile.size,
      newSize: decryptedBytes.length,
      pageCount,
    };
  }
}

/**
 * ============================================================================
 * 4. UI CONTROLLER MODULE
 * ============================================================================
 */
class UnlockPdfUIController {
  constructor() {
    this.state = {
      file: null,
      password: "",
      isEncrypted: true,
      showPassword: false,
    };

    this.engine = new UnlockPdfEngine();
    this.init();
  }

  init() {
    if (typeof document === "undefined") return;

    document.addEventListener("DOMContentLoaded", () => {
      this.bindDOMElements();
      this.attachEventListeners();
    });
  }

  bindDOMElements() {
    this.dom = {
      uploadSection: document.getElementById("unlock-upload-section"),
      dropzone: document.getElementById("unlock-dropzone"),
      fileInput: document.getElementById("unlock-file-input"),
      chooseBtn: document.getElementById("unlock-choose-btn"),

      workspaceSection: document.getElementById("unlock-workspace-section"),
      filenameDisplay: document.getElementById("unlock-filename-display"),
      filemetaDisplay: document.getElementById("unlock-filemeta-display"),
      btnChangePdf: document.getElementById("btn-change-unlock-pdf"),

      passwordFormBox: document.getElementById("unlock-password-form-box"),
      passwordInput: document.getElementById("unlock-password-input"),
      btnTogglePassword: document.getElementById("btn-toggle-unlock-pw"),
      passwordError: document.getElementById("unlock-password-error"),

      alreadyUnencryptedBox: document.getElementById("already-unencrypted-box"),
      btnUnencryptedChange: document.getElementById("btn-unencrypted-change"),

      outputFilenameInput: document.getElementById("unlock-output-filename"),
      btnExecuteUnlock: document.getElementById("btn-execute-unlock"),

      processingState: document.getElementById("unlock-processing-state"),
      statusTitle: document.getElementById("unlock-status-title"),
      statusDesc: document.getElementById("unlock-status-desc"),
      progressFill: document.getElementById("unlock-progress-fill"),

      resultSection: document.getElementById("unlock-result-section"),
      resultFilenameDisplay: document.getElementById("unlock-result-filename"),
      resultMetaDisplay: document.getElementById("unlock-result-meta"),
      btnDownloadUnlocked: document.getElementById("btn-download-unlocked"),
      btnUnlockStartOver: document.getElementById("btn-unlock-start-over"),
    };
  }

  attachEventListeners() {
    const { dom } = this;
    if (!dom.dropzone) return;

    // Upload & Dropzone triggers
    if (dom.chooseBtn) {
      dom.chooseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.fileInput.click();
      });
    }

    dom.dropzone.addEventListener("click", (e) => {
      if (e.target.closest("#unlock-file-input")) return;
      dom.fileInput.click();
    });

    ["dragenter", "dragover"].forEach((evt) => {
      dom.dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.dropzone.classList.add("file-uploader__dropzone--active");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      dom.dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.dropzone.classList.remove("file-uploader__dropzone--active");
      });
    });

    dom.dropzone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        this.handleFileSelect(dt.files[0]);
      }
    });

    if (dom.fileInput) {
      dom.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileSelect(e.target.files[0]);
        }
      });
    }

    if (dom.btnChangePdf) {
      dom.btnChangePdf.addEventListener("click", () =>
        this.resetToUploadState(),
      );
    }

    if (dom.btnUnencryptedChange) {
      dom.btnUnencryptedChange.addEventListener("click", () =>
        this.resetToUploadState(),
      );
    }

    // Password Toggles & Real-time Input
    if (dom.btnTogglePassword) {
      dom.btnTogglePassword.addEventListener("click", () => {
        this.state.showPassword = !this.state.showPassword;
        dom.passwordInput.type = this.state.showPassword ? "text" : "password";
        this.updateEyeIcons(dom.btnTogglePassword, this.state.showPassword);
      });
    }

    if (dom.passwordInput) {
      dom.passwordInput.addEventListener("input", () => {
        this.state.password = dom.passwordInput.value;
        this.clearPasswordError();
      });

      dom.passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeUnlock();
        }
      });
    }

    // Action Buttons
    if (dom.btnExecuteUnlock) {
      dom.btnExecuteUnlock.addEventListener("click", () =>
        this.executeUnlock(),
      );
    }

    if (dom.btnUnlockStartOver) {
      dom.btnUnlockStartOver.addEventListener("click", () =>
        this.resetToUploadState(),
      );
    }
  }

  updateEyeIcons(btnEl, showState) {
    if (!btnEl) return;
    const eyeShow = btnEl.querySelector(".eye-icon-show");
    const eyeHide = btnEl.querySelector(".eye-icon-hide");
    if (eyeShow && eyeHide) {
      eyeShow.style.display = showState ? "none" : "block";
      eyeHide.style.display = showState ? "block" : "none";
    }
  }

  clearPasswordError() {
    const { dom } = this;
    if (dom.passwordError) {
      dom.passwordError.style.display = "none";
      dom.passwordError.textContent = "";
    }
    if (dom.passwordInput) {
      dom.passwordInput.style.borderColor = "var(--border-subtle)";
    }
  }

  showPasswordError(message) {
    const { dom } = this;
    if (dom.passwordError) {
      dom.passwordError.textContent = message;
      dom.passwordError.style.display = "block";
    }
    if (dom.passwordInput) {
      dom.passwordInput.style.borderColor = "var(--danger, #ef4444)";
    }
  }

  async handleFileSelect(file) {
    const val = UnlockPdfUtils.validatePdfFile(file);
    if (!val.valid) {
      UnlockPdfUtils.showToast(val.error, "error", "Invalid File");
      return;
    }

    const { dom } = this;
    this.state.file = file;

    dom.filenameDisplay.textContent = file.name;
    dom.filemetaDisplay.textContent = `${UnlockPdfUtils.formatBytes(file.size)} • Checking document encryption...`;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (dom.outputFilenameInput) {
      dom.outputFilenameInput.value = `${baseName}-unlocked.pdf`;
    }

    this.state.password = "";
    if (dom.passwordInput) dom.passwordInput.value = "";
    this.clearPasswordError();

    // Show workspace
    dom.uploadSection.style.display = "none";
    dom.workspaceSection.style.display = "block";

    try {
      const inspection = await this.engine.checkEncryption(file);
      this.state.isEncrypted = inspection.isEncrypted;

      if (inspection.isEncrypted) {
        dom.filemetaDisplay.textContent = `${UnlockPdfUtils.formatBytes(file.size)} • Encrypted PDF Document`;
        dom.passwordFormBox.style.display = "flex";
        dom.alreadyUnencryptedBox.style.display = "none";
        UnlockPdfUtils.showToast(
          "Encrypted PDF detected. Enter password to unlock.",
          "info",
          "Password Required",
        );
        if (dom.passwordInput) dom.passwordInput.focus();
      } else {
        dom.filemetaDisplay.textContent = `${UnlockPdfUtils.formatBytes(file.size)} • Unencrypted PDF Document`;
        dom.passwordFormBox.style.display = "none";
        dom.alreadyUnencryptedBox.style.display = "block";
        UnlockPdfUtils.showToast(
          "This document is already unencrypted!",
          "info",
          "No Lock Detected",
        );
      }
    } catch (err) {
      console.error(err);
      UnlockPdfUtils.showToast(
        `Could not read PDF: ${err.message}`,
        "error",
        "File Error",
      );
      this.resetToUploadState();
    }
  }

  async executeUnlock() {
    const { dom, state } = this;
    if (!state.file) {
      UnlockPdfUtils.showToast(
        "Please upload an encrypted PDF file first.",
        "error",
      );
      return;
    }

    const password = (dom.passwordInput ? dom.passwordInput.value : "").trim();
    const outName =
      (dom.outputFilenameInput ? dom.outputFilenameInput.value.trim() : "") ||
      "unlocked-document.pdf";

    const validation = UnlockPdfValidator.validate(password);
    if (!validation.valid) {
      this.showPasswordError(validation.error);
      UnlockPdfUtils.showToast(validation.error, "error", "Password Required");
      return;
    }

    try {
      dom.workspaceSection.style.display = "none";
      dom.processingState.style.display = "block";

      const result = await this.engine.unlock(
        state.file,
        password,
        (pct, msg) => {
          if (dom.progressFill) dom.progressFill.style.width = `${pct}%`;
          if (dom.statusDesc) dom.statusDesc.textContent = msg;
        },
      );

      // Populate results
      if (dom.resultFilenameDisplay)
        dom.resultFilenameDisplay.textContent = outName;
      if (dom.resultMetaDisplay) {
        dom.resultMetaDisplay.textContent = `${UnlockPdfUtils.formatBytes(result.newSize)} • ${result.pageCount} page${result.pageCount > 1 ? "s" : ""} • Fully Unlocked`;
      }

      if (dom.btnDownloadUnlocked) {
        dom.btnDownloadUnlocked.href = result.blobUrl;
        dom.btnDownloadUnlocked.download = outName;
      }

      dom.processingState.style.display = "none";
      dom.resultSection.style.display = "block";

      UnlockPdfUtils.showToast(
        "PDF unlocked successfully!",
        "success",
        "Decryption Complete",
      );
    } catch (err) {
      console.error(err);
      this.showPasswordError(
        err.message || "Incorrect password or decryption failure.",
      );
      UnlockPdfUtils.showToast(
        err.message || "Incorrect password or decryption failure.",
        "error",
        "Unlock Failed",
      );
      dom.processingState.style.display = "none";
      dom.workspaceSection.style.display = "block";
    }
  }

  resetToUploadState() {
    const { dom } = this;
    this.state.file = null;
    this.state.password = "";
    this.state.isEncrypted = true;

    if (dom.fileInput) dom.fileInput.value = "";
    if (dom.passwordInput) dom.passwordInput.value = "";
    this.clearPasswordError();

    dom.workspaceSection.style.display = "none";
    dom.processingState.style.display = "none";
    dom.resultSection.style.display = "none";
    dom.uploadSection.style.display = "block";
  }
}

// Auto-initialize UI controller
new UnlockPdfUIController();
