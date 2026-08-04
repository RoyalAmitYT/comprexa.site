// @ts-nocheck
/**
 * Comprexa Universal PDF Engine - Export Service
 * Centralized PDF blob serialization, file download triggering, and output formatting.
 */

import { PdfUtils } from "./utils.js";

export class PdfExporter {
  /**
   * Save PDFLib PDFDocument instance into an ArrayBuffer and Blob
   * @param {Object} pdfLibDoc - PDFLib PDFDocument
   * @param {Object} options - { filename, originalName, actionSuffix }
   * @returns {Promise<Object>} { blob, blobUrl, size, filename }
   */
  async exportPdfLibDoc(pdfLibDoc, options = {}) {
    if (!pdfLibDoc) throw new Error("No PDFLib document provided for export.");

    const pdfBytes = await pdfLibDoc.save({
      useObjectStreams: true,
      addMissingComponents: true,
    });

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    let outputFilename = options.filename;
    if (!outputFilename) {
      outputFilename = PdfUtils.generateOutputFilename(
        options.originalName || "document.pdf",
        options.actionSuffix || "processed",
        "pdf",
      );
    }

    return {
      blob,
      blobUrl,
      size: pdfBytes.length,
      formattedSize: PdfUtils.formatBytes(pdfBytes.length),
      filename: outputFilename,
    };
  }

  /**
   * Trigger immediate browser file download for a Blob or URL
   * @param {Blob|string} blobOrUrl
   * @param {string} filename
   */
  downloadFile(blobOrUrl, filename = "download.pdf") {
    let url = blobOrUrl;
    let shouldRevoke = false;

    if (blobOrUrl instanceof Blob) {
      url = URL.createObjectURL(blobOrUrl);
      shouldRevoke = true;
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}

export const GlobalPdfExporter = new PdfExporter();

if (typeof window !== "undefined") {
  window.ComprexaPdfExporter = GlobalPdfExporter;
}
