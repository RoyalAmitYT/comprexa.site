/**
 * Comprexa Universal PDF Engine - Master Facade
 * Unified single API facade combining Config, Utils, Events, Validator, Metadata, Loader, Thumbnails, Exporter & Progress.
 *
 * Exposed globally as window.ComprexaPdfEngine
 */

import { PdfConfig } from "./config.js";
import { PdfUtils } from "./utils.js";
import { GlobalPdfEventBus } from "./events.js";
import { GlobalPdfValidator } from "./validator.js";
import { GlobalPdfMetadataExtractor } from "./metadata.js";
import { GlobalPdfLoader } from "./loader.js";
import { GlobalPdfThumbnailGenerator } from "./thumbnails.js";
import { GlobalPdfExporter } from "./exporter.js";
import { GlobalPdfProgressManager, PdfProgressState } from "./progress.js";

export class ComprexaPdfEngineFacade {
  constructor() {
    this.config = PdfConfig;
    this.utils = PdfUtils;
    this.events = GlobalPdfEventBus;
    this.validator = GlobalPdfValidator;
    this.metadata = GlobalPdfMetadataExtractor;
    this.loader = GlobalPdfLoader;
    this.thumbnails = GlobalPdfThumbnailGenerator;
    this.exporter = GlobalPdfExporter;
    this.progress = GlobalPdfProgressManager;
    this.ProgressState = PdfProgressState;
  }

  /**
   * Quick validate PDF file
   * @param {File} file
   * @returns {Object} { valid, error, code }
   */
  validateFile(file) {
    return this.validator.validateFile(file);
  }

  /**
   * Load and extract full metadata & inspect buffer
   * @param {File} file
   * @returns {Promise<Object>} { fileInfo, buffer, pdfJsDoc, pdfLibDoc, valid, error }
   */
  async loadAndInspectFile(file) {
    // 1. File Validation
    const val = this.validateFile(file);
    if (!val.valid) {
      this.progress.setError(val.error, val.code);
      return { valid: false, error: val.error, code: val.code };
    }

    this.progress.startLoading("Reading file bytes...");

    try {
      // 2. Load ArrayBuffer
      const buffer = await this.loader.loadArrayBuffer(file);

      // 3. Inspect buffer for corruption or encryption
      const inspection = await this.validator.inspectBuffer(buffer);
      if (!inspection.valid) {
        this.progress.setError(inspection.error, "ERR_INSPECT_FAILED");
        return { valid: false, error: inspection.error };
      }

      // 4. Extract rich metadata
      const meta = await this.metadata.extractMetadata(file, buffer);

      this.progress.updateProgress(30, "File loaded and verified.");
      this.events.emit("upload", { file, metadata: meta });

      return {
        valid: true,
        file,
        buffer,
        metadata: meta,
      };
    } catch (err) {
      console.error("[ComprexaPdfEngine] Load error:", err);
      const errMsg = err.message || "Failed to load PDF document.";
      this.progress.setError(errMsg, "ERR_LOAD_FAILED");
      return { valid: false, error: errMsg };
    }
  }

  /**
   * Render single thumbnail canvas
   */
  async renderThumbnail(pdfJsDoc, pageNum, canvasEl, options = {}) {
    return await this.thumbnails.renderToCanvas(
      pdfJsDoc,
      pageNum,
      canvasEl,
      options,
    );
  }

  /**
   * Save and download PDF
   */
  async exportAndDownload(pdfLibDoc, options = {}) {
    const exported = await this.exporter.exportPdfLibDoc(pdfLibDoc, options);
    this.exporter.downloadFile(exported.blob, exported.filename);
    this.events.emit("download", exported);
    return exported;
  }

  /**
   * Format bytes helper
   */
  formatBytes(bytes, decimals) {
    return this.utils.formatBytes(bytes, decimals);
  }

  /**
   * Subscribe to global engine events
   */
  on(eventName, callback) {
    return this.events.on(eventName, callback);
  }
}

export const ComprexaPdfEngine = new ComprexaPdfEngineFacade();

if (typeof window !== "undefined") {
  window.ComprexaPdfEngine = ComprexaPdfEngine;
}
