/**
 * Comprexa Universal PDF Engine - Loader Service
 * Reusable document loader for ArrayBuffers, PDF-Lib instances, and PDF.js documents.
 * Includes memory management and lazy loading helpers for large files (500+ pages).
 */

import { PdfConfig } from "./config.js";
import { pdfjsLib, ensurePdfWorker } from "./pdf-init.js";

export class PdfLoader {
  constructor() {
    this.activeBuffers = new WeakMap();
  }

  /**
   * Load raw ArrayBuffer from File or Blob
   * @param {File|Blob} file
   * @returns {Promise<ArrayBuffer>}
   */
  async loadArrayBuffer(file) {
    if (!file) throw new Error("No File object provided to PdfLoader.");
    return await file.arrayBuffer();
  }

  /**
   * Ensure PDF.js worker is properly configured
   */
  ensurePdfJsWorker() {
    return ensurePdfWorker();
  }

  /**
   * Load PDF.js PDFDocumentProxy for canvas thumbnail rendering
   * @param {ArrayBuffer} buffer
   * @returns {Promise<Object>} PDFDocumentProxy
   */
  async loadPdfJsDoc(buffer) {
    const lib = ensurePdfWorker();

    // Slice buffer to prevent detachment issues
    const bufferCopy = buffer.slice(0);
    const loadingTask = lib.getDocument({
      data: bufferCopy,
    });

    return await loadingTask.promise;
  }

  /**
   * Load PDF-Lib PDFDocument for document manipulation (Merge, Split, Rotate, Organize, Compress)
   * @param {ArrayBuffer} buffer
   * @returns {Promise<Object>} PDFLib.PDFDocument
   */
  async loadPdfLibDoc(buffer) {
    if (typeof window === "undefined" || !window.PDFLib) {
      throw new Error("PDF-Lib library is not loaded on page.");
    }

    const { PDFDocument } = window.PDFLib;
    return await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
  }

  /**
   * Destroy and clean up PDF.js document from memory
   * @param {Object} pdfJsDoc
   */
  destroyPdfJsDoc(pdfJsDoc) {
    if (pdfJsDoc && typeof pdfJsDoc.destroy === "function") {
      try {
        pdfJsDoc.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

export const GlobalPdfLoader = new PdfLoader();

if (typeof window !== "undefined") {
  window.ComprexaPdfLoader = GlobalPdfLoader;
}
