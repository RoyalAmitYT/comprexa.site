/**
 * Comprexa Universal PDF Engine - Validator
 * Comprehensive PDF file validation, size checking, encryption/password detection, and corruption checks.
 */

import { PdfConfig } from "./config.js";

export class PdfValidator {
  constructor(options = {}) {
    this.maxSizeMB = options.maxSizeMB || PdfConfig.maxFileSizeMB;
  }

  /**
   * Validate uploaded file object
   * @param {File} file
   * @returns {Object} { valid: boolean, error: string|null, code: string|null }
   */
  validateFile(file) {
    if (!file) {
      return {
        valid: false,
        error: "No file selected. Please upload a PDF file.",
        code: PdfConfig.errorCodes.FILE_MISSING,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: "The uploaded file is empty (0 bytes).",
        code: PdfConfig.errorCodes.FILE_EMPTY,
      };
    }

    const fileName = file.name || "";
    const ext = fileName.split(".").pop().toLowerCase();
    const isMimeValid =
      PdfConfig.supportedMimeTypes.includes(file.type) || file.type === "";
    const isExtValid = PdfConfig.supportedExtensions.includes(ext);

    if (!isExtValid && !isMimeValid) {
      return {
        valid: false,
        error: `Invalid file format ".${ext}". Only PDF files (.pdf) are supported.`,
        code: PdfConfig.errorCodes.INVALID_TYPE,
      };
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxSizeMB) {
      return {
        valid: false,
        error: `File size (${fileSizeMB.toFixed(1)} MB) exceeds maximum allowed limit of ${this.maxSizeMB} MB.`,
        code: PdfConfig.errorCodes.EXCEEDS_SIZE,
      };
    }

    return { valid: true, error: null, code: null };
  }

  /**
   * Check if ArrayBuffer contains valid PDF header magic bytes (%PDF-)
   */
  checkPdfHeader(buffer) {
    if (!buffer || buffer.byteLength < 5) return false;
    const headerBytes = new Uint8Array(buffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    return headerStr.startsWith("%PDF-");
  }

  /**
   * Inspect PDF document for password encryption or corruption
   * @param {ArrayBuffer} buffer
   * @returns {Promise<Object>} { valid: boolean, encrypted: boolean, corrupted: boolean, version: string|null, error: string|null }
   */
  async inspectBuffer(buffer) {
    if (!this.checkPdfHeader(buffer)) {
      return {
        valid: false,
        encrypted: false,
        corrupted: true,
        version: null,
        error: "File does not have a valid PDF header (%PDF-).",
      };
    }

    // Extract PDF version from header (e.g., %PDF-1.7)
    let version = null;
    try {
      const headerLine = String.fromCharCode.apply(
        null,
        new Uint8Array(buffer.slice(0, 10)),
      );
      const match = headerLine.match(/%PDF-(\d\.\d)/);
      if (match) version = match[1];
    } catch (e) {
      // Non-critical
    }

    // Try loading with PDF-Lib to check for encryption / corruption
    if (typeof window !== "undefined" && window.PDFLib) {
      try {
        const pdfDoc = await window.PDFLib.PDFDocument.load(buffer, {
          ignoreEncryption: true,
        });
        const isEncrypted = pdfDoc.isEncrypted;

        if (isEncrypted) {
          return {
            valid: false,
            encrypted: true,
            corrupted: false,
            version,
            error:
              "This PDF document is password protected. Please unlock it before processing.",
          };
        }

        return {
          valid: true,
          encrypted: false,
          corrupted: false,
          version,
          pageCount: pdfDoc.getPageCount(),
          error: null,
        };
      } catch (err) {
        const errMsg = err.message || "";
        if (errMsg.includes("encrypt") || errMsg.includes("password")) {
          return {
            valid: false,
            encrypted: true,
            corrupted: false,
            version,
            error: "This PDF document is password protected.",
          };
        }

        return {
          valid: false,
          encrypted: false,
          corrupted: true,
          version,
          error: "PDF file structure appears corrupted or invalid: " + errMsg,
        };
      }
    }

    return {
      valid: true,
      encrypted: false,
      corrupted: false,
      version,
      error: null,
    };
  }
}

export const GlobalPdfValidator = new PdfValidator();

if (typeof window !== "undefined") {
  window.ComprexaPdfValidator = GlobalPdfValidator;
}
