// @ts-nocheck
/**
 * Comprexa Protect PDF Tool Controller & Processing Engine
 * Production-ready, 100% browser-based PDF protection module using @pdfsmaller/pdf-encrypt & PDF-Lib.
 */

import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import { PDFDocument } from "pdf-lib";

/**
 * ============================================================================
 * 1. UTILITIES MODULE
 * ============================================================================
 */
export class ProtectPdfUtils {
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
export class ProtectPdfValidator {
  /**
   * Validate password inputs
   * @param {Object} data - { openPassword, confirmPassword }
   * @returns {Object} - { valid: boolean, errors: { openPassword?: string, confirmPassword?: string } }
   */
  static validate(data = {}) {
    const errors = {};
    const openPw = (data.openPassword || "").trim();
    const confirmPw = (data.confirmPassword || "").trim();

    if (!openPw) {
      errors.openPassword =
        "Open password cannot be empty. Please enter a password.";
    } else if (openPw.length < 3) {
      errors.openPassword = "Password must be at least 3 characters long.";
    }

    if (confirmPw !== openPw) {
      errors.confirmPassword = "Confirm password does not match open password.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

/**
 * ============================================================================
 * 3. PROCESSING ENGINE MODULE
 * ============================================================================
 */
export class ProtectPdfEngine {
  /**
   * Perform Client-Side PDF Protection & Encryption
   * @param {File} pdfFile - Original PDF file
   * @param {string} openPassword - Open password
   * @param {Object} options - Configuration options (ownerPassword, permissions)
   * @param {Function} progressCallback - Progress reporter callback
   */
  async protect(pdfFile, openPassword, options = {}, progressCallback = null) {
    if (!openPassword) {
      throw new Error("User password is required to encrypt the document.");
    }

    if (progressCallback) progressCallback(15, "Reading PDF file contents...");
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Verify PDF Header
    const headerStr = String.fromCharCode.apply(
      null,
      uint8Array.subarray(0, 5),
    );
    if (headerStr !== "%PDF-") {
      throw new Error(
        `"${pdfFile.name}" does not appear to be a valid, uncorrupted PDF file.`,
      );
    }

    // Determine page count via PDF-Lib
    let pageCount = 1;
    try {
      const windowPdfLib = window.PDFLib || { PDFDocument };
      if (windowPdfLib && windowPdfLib.PDFDocument) {
        const doc = await windowPdfLib.PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        pageCount = doc.getPageCount();
      }
    } catch (e) {}

    if (progressCallback)
      progressCallback(45, "Generating 256-bit AES encryption dictionary...");

    const { ownerPassword = openPassword, permissions = {} } = options;

    const encryptionOptions = {
      ownerPassword: ownerPassword || openPassword,
      algorithm: "AES-256",
      permissions: {
        printing: permissions.printing !== false,
        copying: Boolean(permissions.copying),
        modifying: Boolean(permissions.modifying),
        annotating: Boolean(permissions.annotating),
        fillingForms: Boolean(permissions.annotating),
        contentAccessibility: true,
      },
    };

    if (progressCallback)
      progressCallback(75, "Applying security locks and stream obfuscation...");

    let encryptedBytes;
    try {
      encryptedBytes = await encryptPDF(
        uint8Array,
        openPassword,
        encryptionOptions,
      );
    } catch (err) {
      throw new Error(
        `Encryption failed: ${err.message || "Unknown processing error"}`,
      );
    }

    if (progressCallback)
      progressCallback(95, "Finalizing protected document...");

    const blob = new Blob([encryptedBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    return {
      blob,
      blobUrl,
      originalSize: pdfFile.size,
      newSize: encryptedBytes.length,
      pageCount,
    };
  }
}

/**
 * ============================================================================
 * 4. UI CONTROLLER MODULE
 * ============================================================================
 */
class ProtectPdfUIController {
  constructor() {
    this.state = {
      file: null,
      openPassword: "",
      confirmPassword: "",
      ownerPassword: "",
      permissions: {
        printing: true,
        copying: false,
        modifying: false,
        annotating: false,
      },
      showOpenPw: false,
      showConfirmPw: false,
      outputFilename: "",
    };

    this.engine = new ProtectPdfEngine();
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
      uploadSection: document.getElementById("protect-upload-section"),
      dropzone: document.getElementById("protect-dropzone"),
      fileInput: document.getElementById("protect-file-input"),
      chooseBtn: document.getElementById("protect-choose-btn"),

      workspaceSection: document.getElementById("protect-workspace-section"),
      filenameDisplay: document.getElementById("protect-filename-display"),
      filemetaDisplay: document.getElementById("protect-filemeta-display"),
      btnChangePdf: document.getElementById("btn-change-pdf"),

      openPasswordInput: document.getElementById("open-password-input"),
      btnToggleOpenPw: document.getElementById("btn-toggle-open-pw"),
      openPasswordError: document.getElementById("open-password-error"),

      confirmPasswordInput: document.getElementById("confirm-password-input"),
      btnToggleConfirmPw: document.getElementById("btn-toggle-confirm-pw"),
      confirmPasswordError: document.getElementById("confirm-password-error"),

      ownerPasswordInput: document.getElementById("owner-password-input"),
      permPrinting: document.getElementById("perm-printing"),
      permCopying: document.getElementById("perm-copying"),
      permEditing: document.getElementById("perm-editing"),
      permAnnotating: document.getElementById("perm-annotating"),

      outputFilenameInput: document.getElementById("output-filename-input"),
      btnExecuteProtect: document.getElementById("btn-execute-protect"),

      processingState: document.getElementById("protect-processing-state"),
      statusTitle: document.getElementById("protect-status-title"),
      statusDesc: document.getElementById("protect-status-desc"),
      progressFill: document.getElementById("protect-progress-fill"),

      resultSection: document.getElementById("protect-result-section"),
      resultFilenameDisplay: document.getElementById("result-filename-display"),
      resultMetaDisplay: document.getElementById("result-meta-display"),
      btnDownloadProtected: document.getElementById("btn-download-protected"),
      btnProtectStartOver: document.getElementById("btn-protect-start-over"),
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
      if (e.target.closest("#protect-file-input")) return;
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

    // Password Toggles & Real-Time Input Handlers
    if (dom.btnToggleOpenPw) {
      dom.btnToggleOpenPw.addEventListener("click", () => {
        this.state.showOpenPw = !this.state.showOpenPw;
        dom.openPasswordInput.type = this.state.showOpenPw
          ? "text"
          : "password";
        this.updateEyeIcons(dom.btnToggleOpenPw, this.state.showOpenPw);
      });
    }

    if (dom.btnToggleConfirmPw) {
      dom.btnToggleConfirmPw.addEventListener("click", () => {
        this.state.showConfirmPw = !this.state.showConfirmPw;
        dom.confirmPasswordInput.type = this.state.showConfirmPw
          ? "text"
          : "password";
        this.updateEyeIcons(dom.btnToggleConfirmPw, this.state.showConfirmPw);
      });
    }

    if (dom.openPasswordInput) {
      dom.openPasswordInput.addEventListener("input", () => {
        this.state.openPassword = dom.openPasswordInput.value;
        this.clearInputErrors();
      });
    }

    if (dom.confirmPasswordInput) {
      dom.confirmPasswordInput.addEventListener("input", () => {
        this.state.confirmPassword = dom.confirmPasswordInput.value;
        this.clearInputErrors();
      });
    }

    // Protect Action Button
    if (dom.btnExecuteProtect) {
      dom.btnExecuteProtect.addEventListener("click", () =>
        this.executeProtection(),
      );
    }

    if (dom.btnProtectStartOver) {
      dom.btnProtectStartOver.addEventListener("click", () =>
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

  clearInputErrors() {
    const { dom } = this;
    if (dom.openPasswordError) {
      dom.openPasswordError.style.display = "none";
      dom.openPasswordError.textContent = "";
    }
    if (dom.confirmPasswordError) {
      dom.confirmPasswordError.style.display = "none";
      dom.confirmPasswordError.textContent = "";
    }
    if (dom.openPasswordInput)
      dom.openPasswordInput.style.borderColor = "var(--border-subtle)";
    if (dom.confirmPasswordInput)
      dom.confirmPasswordInput.style.borderColor = "var(--border-subtle)";
  }

  showValidationError(field, message) {
    const { dom } = this;
    if (field === "openPassword" && dom.openPasswordError) {
      dom.openPasswordError.textContent = message;
      dom.openPasswordError.style.display = "block";
      if (dom.openPasswordInput)
        dom.openPasswordInput.style.borderColor = "var(--danger, #ef4444)";
    }
    if (field === "confirmPassword" && dom.confirmPasswordError) {
      dom.confirmPasswordError.textContent = message;
      dom.confirmPasswordError.style.display = "block";
      if (dom.confirmPasswordInput)
        dom.confirmPasswordInput.style.borderColor = "var(--danger, #ef4444)";
    }
  }

  handleFileSelect(file) {
    const val = ProtectPdfUtils.validatePdfFile(file);
    if (!val.valid) {
      ProtectPdfUtils.showToast(val.error, "error", "Invalid File");
      return;
    }

    this.state.file = file;
    const { dom } = this;

    dom.filenameDisplay.textContent = file.name;
    dom.filemetaDisplay.textContent = ProtectPdfUtils.formatBytes(file.size);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (dom.outputFilenameInput) {
      dom.outputFilenameInput.value = `${baseName}-protected.pdf`;
    }

    // Clear password state
    this.state.openPassword = "";
    this.state.confirmPassword = "";
    if (dom.openPasswordInput) dom.openPasswordInput.value = "";
    if (dom.confirmPasswordInput) dom.confirmPasswordInput.value = "";
    if (dom.ownerPasswordInput) dom.ownerPasswordInput.value = "";
    this.clearInputErrors();

    // Show workspace
    dom.uploadSection.style.display = "none";
    dom.workspaceSection.style.display = "block";

    ProtectPdfUtils.showToast(`Loaded "${file.name}"`, "success", "PDF Ready");
  }

  async executeProtection() {
    const { dom, state } = this;
    if (!state.file) {
      ProtectPdfUtils.showToast("Please upload a PDF file first.", "error");
      return;
    }

    // Collect latest form values
    const openPassword = (
      dom.openPasswordInput ? dom.openPasswordInput.value : ""
    ).trim();
    const confirmPassword = (
      dom.confirmPasswordInput ? dom.confirmPasswordInput.value : ""
    ).trim();
    const ownerPassword = (
      dom.ownerPasswordInput ? dom.ownerPasswordInput.value : ""
    ).trim();
    const outName =
      (dom.outputFilenameInput ? dom.outputFilenameInput.value.trim() : "") ||
      "protected-document.pdf";

    const validation = ProtectPdfValidator.validate({
      openPassword,
      confirmPassword,
    });
    if (!validation.valid) {
      this.clearInputErrors();
      if (validation.errors.openPassword) {
        this.showValidationError(
          "openPassword",
          validation.errors.openPassword,
        );
      }
      if (validation.errors.confirmPassword) {
        this.showValidationError(
          "confirmPassword",
          validation.errors.confirmPassword,
        );
      }
      ProtectPdfUtils.showToast(
        "Please fix password validation errors before proceeding.",
        "error",
        "Validation Error",
      );
      return;
    }

    const permissions = {
      printing: dom.permPrinting ? dom.permPrinting.checked : true,
      copying: dom.permCopying ? dom.permCopying.checked : false,
      modifying: dom.permEditing ? dom.permEditing.checked : false,
      annotating: dom.permAnnotating ? dom.permAnnotating.checked : false,
    };

    try {
      dom.workspaceSection.style.display = "none";
      dom.processingState.style.display = "block";

      const result = await this.engine.protect(
        state.file,
        openPassword,
        { ownerPassword, permissions },
        (pct, msg) => {
          if (dom.progressFill) dom.progressFill.style.width = `${pct}%`;
          if (dom.statusDesc) dom.statusDesc.textContent = msg;
        },
      );

      // Populate results
      if (dom.resultFilenameDisplay)
        dom.resultFilenameDisplay.textContent = outName;
      if (dom.resultMetaDisplay) {
        dom.resultMetaDisplay.textContent = `${ProtectPdfUtils.formatBytes(result.newSize)} • ${result.pageCount} page${result.pageCount > 1 ? "s" : ""} • AES-256 Protected`;
      }

      if (dom.btnDownloadProtected) {
        dom.btnDownloadProtected.href = result.blobUrl;
        dom.btnDownloadProtected.download = outName;
      }

      dom.processingState.style.display = "none";
      dom.resultSection.style.display = "block";

      ProtectPdfUtils.showToast(
        "PDF protected successfully!",
        "success",
        "Done",
      );
    } catch (err) {
      console.error(err);
      ProtectPdfUtils.showToast(
        err.message || "Encryption processing failed.",
        "error",
        "Processing Failure",
      );
      dom.processingState.style.display = "none";
      dom.workspaceSection.style.display = "block";
    }
  }

  resetToUploadState() {
    const { dom } = this;
    this.state.file = null;
    this.state.openPassword = "";
    this.state.confirmPassword = "";

    if (dom.fileInput) dom.fileInput.value = "";
    if (dom.openPasswordInput) dom.openPasswordInput.value = "";
    if (dom.confirmPasswordInput) dom.confirmPasswordInput.value = "";
    if (dom.ownerPasswordInput) dom.ownerPasswordInput.value = "";
    this.clearInputErrors();

    dom.workspaceSection.style.display = "none";
    dom.processingState.style.display = "none";
    dom.resultSection.style.display = "none";
    dom.uploadSection.style.display = "block";
  }
}

// Auto-initialize UI controller
new ProtectPdfUIController();
