/**
 * Comprexa Universal PDF Engine - Thumbnail Generator
 * High-performance thumbnail generation, canvas rendering, and LRU memory caching.
 */

import { PdfConfig } from "./config.js";

export class PdfThumbnailGenerator {
  constructor() {
    this.cache = new Map(); // Key: `${docId}_p${pageNum}_s${scale}_r${rotation}`
    this.maxCacheSize = PdfConfig.thumbnailDefaults.maxCacheEntries;
  }

  /**
   * Generate cache key
   */
  getCacheKey(docId, pageNum, scale, rotation = 0) {
    return `${docId}_p${pageNum}_s${scale}_r${rotation}`;
  }

  /**
   * Render page thumbnail onto a target HTML5 Canvas
   * @param {Object} pdfJsDoc - PDF.js Document Proxy
   * @param {number} pageNum - 1-based page number
   * @param {HTMLCanvasElement} canvasEl
   * @param {Object} options - { scale, rotation, docId }
   */
  async renderToCanvas(pdfJsDoc, pageNum, canvasEl, options = {}) {
    if (!pdfJsDoc || !canvasEl) return false;

    const scale = options.scale || PdfConfig.thumbnailDefaults.scale;
    const rotation = options.rotation || 0;

    try {
      const page = await pdfJsDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation });

      canvasEl.width = viewport.width;
      canvasEl.height = viewport.height;

      const ctx = canvasEl.getContext("2d");
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Render page to a Data URL string (with caching)
   * @param {Object} pdfJsDoc
   * @param {number} pageNum
   * @param {Object} options
   * @returns {Promise<string|null>} Data URL
   */
  async renderToDataUrl(pdfJsDoc, pageNum, options = {}) {
    const docId = options.docId || "doc";
    const scale = options.scale || PdfConfig.thumbnailDefaults.scale;
    const rotation = options.rotation || 0;
    const cacheKey = this.getCacheKey(docId, pageNum, scale, rotation);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const tempCanvas = document.createElement("canvas");
    const success = await this.renderToCanvas(pdfJsDoc, pageNum, tempCanvas, {
      scale,
      rotation,
    });

    if (!success) return null;

    const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.85);

    // Enforce LRU cache limit
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, dataUrl);
    return dataUrl;
  }

  /**
   * Clear thumbnail cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const GlobalPdfThumbnailGenerator = new PdfThumbnailGenerator();

if (typeof window !== "undefined") {
  window.ComprexaPdfThumbnailGenerator = GlobalPdfThumbnailGenerator;
}
