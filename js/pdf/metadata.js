/**
 * Comprexa Universal PDF Engine - Metadata Extractor
 * Extracts document stats, page counts, dimensions, aspect ratios, PDF versions, and author details.
 */

import { PdfUtils } from "./utils.js";

export class PdfMetadataExtractor {
  /**
   * Extract comprehensive PDF metadata
   * @param {File} file
   * @param {ArrayBuffer} buffer
   * @returns {Promise<Object>}
   */
  async extractMetadata(file, buffer) {
    const baseInfo = {
      fileName: file ? file.name : "document.pdf",
      fileSize: file ? file.size : buffer ? buffer.byteLength : 0,
      fileSizeFormatted: PdfUtils.formatBytes(
        file ? file.size : buffer ? buffer.byteLength : 0,
      ),
      pageCount: 0,
      pdfVersion: "1.7",
      encrypted: false,
      title: "",
      author: "",
      creator: "",
      producer: "",
      creationDate: null,
      orientation: "portrait", // 'portrait' | 'landscape' | 'mixed'
      pageDimensions: [], // Array of { pageNum, width, height, orientation }
    };

    if (!buffer) return baseInfo;

    // Detect version from raw bytes
    try {
      const headerBytes = new Uint8Array(buffer.slice(0, 15));
      const headerStr = String.fromCharCode.apply(null, headerBytes);
      const versionMatch = headerStr.match(/%PDF-(\d\.\d)/);
      if (versionMatch) {
        baseInfo.pdfVersion = versionMatch[1];
      }
    } catch (e) {
      // Ignore header parsing failure
    }

    // Use PDF-Lib if loaded
    if (typeof window !== "undefined" && window.PDFLib) {
      try {
        const { PDFDocument } = window.PDFLib;
        const pdfDoc = await PDFDocument.load(buffer, {
          ignoreEncryption: true,
        });

        baseInfo.pageCount = pdfDoc.getPageCount();
        baseInfo.encrypted = pdfDoc.isEncrypted;

        baseInfo.title = pdfDoc.getTitle() || "";
        baseInfo.author = pdfDoc.getAuthor() || "";
        baseInfo.creator = pdfDoc.getCreator() || "";
        baseInfo.producer = pdfDoc.getProducer() || "";
        baseInfo.creationDate = pdfDoc.getCreationDate() || null;

        // Inspect page dimensions and orientation
        const pages = pdfDoc.getPages();
        let portraitCount = 0;
        let landscapeCount = 0;

        pages.forEach((page, index) => {
          const { width, height } = page.getSize();
          const pageOrient = width >= height ? "landscape" : "portrait";
          if (pageOrient === "landscape") landscapeCount++;
          else portraitCount++;

          baseInfo.pageDimensions.push({
            pageNum: index + 1,
            width: Math.round(width),
            height: Math.round(height),
            orientation: pageOrient,
          });
        });

        if (landscapeCount > 0 && portraitCount === 0) {
          baseInfo.orientation = "landscape";
        } else if (landscapeCount > 0 && portraitCount > 0) {
          baseInfo.orientation = "mixed";
        } else {
          baseInfo.orientation = "portrait";
        }
      } catch (err) {}
    }

    return baseInfo;
  }
}

export const GlobalPdfMetadataExtractor = new PdfMetadataExtractor();

if (typeof window !== "undefined") {
  window.ComprexaPdfMetadataExtractor = GlobalPdfMetadataExtractor;
}
