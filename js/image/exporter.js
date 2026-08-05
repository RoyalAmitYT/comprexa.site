// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Image Exporter & Download Service
 * Encodes canvases into JPG, PNG, WEBP, AVIF blobs/dataURLs and handles browser downloads.
 */

import { ImageConfig } from "./config.js";
import { ImageEngineError, ImageErrorCategory } from "./errors.js";
import { ImageUtils } from "./utils.js";

export class ImageExporter {
  /**
   * Convert Canvas to Blob with specified target MIME type and quality
   * @param {HTMLCanvasElement} canvas
   * @param {string} [mimeType='image/jpeg']
   * @param {number} [quality=0.85]
   * @returns {Promise<Blob>}
   */
  static async exportCanvasToBlob(
    canvas,
    mimeType = "image/jpeg",
    quality = 0.85,
  ) {
    if (!canvas || typeof canvas.toBlob !== "function") {
      throw new ImageEngineError(
        "Invalid HTMLCanvasElement provided for export.",
        ImageConfig.errorCodes.EXPORT_FAILED,
        ImageErrorCategory.EXPORT,
      );
    }

    const cleanMime = (mimeType || "image/jpeg").toLowerCase();
    const clampedQuality = Math.min(
      1.0,
      Math.max(0.01, parseFloat(quality) || 0.85),
    );

    try {
      return await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error(`Browser failed to encode canvas into ${cleanMime}.`),
              );
            }
          },
          cleanMime,
          clampedQuality,
        );
      });
    } catch (err) {
      // Fallback to PNG if WebP or AVIF encoding is unsupported by browser
      if (cleanMime !== "image/png") {
        return this.exportCanvasToBlob(canvas, "image/png", 1.0);
      }
      throw new ImageEngineError(
        `Failed to export canvas image: ${err?.message}`,
        ImageConfig.errorCodes.EXPORT_FAILED,
        ImageErrorCategory.EXPORT,
      );
    }
  }

  /**
   * Convert Canvas to DataURL string
   * @param {HTMLCanvasElement} canvas
   * @param {string} [mimeType='image/jpeg']
   * @param {number} [quality=0.85]
   * @returns {string}
   */
  static exportCanvasToDataUrl(
    canvas,
    mimeType = "image/jpeg",
    quality = 0.85,
  ) {
    if (!canvas || typeof canvas.toDataURL !== "function") {
      throw new ImageEngineError(
        "Invalid HTMLCanvasElement provided for dataURL export.",
        ImageConfig.errorCodes.EXPORT_FAILED,
        ImageErrorCategory.EXPORT,
      );
    }

    const cleanMime = (mimeType || "image/jpeg").toLowerCase();
    const clampedQuality = Math.min(
      1.0,
      Math.max(0.01, parseFloat(quality) || 0.85),
    );

    try {
      return canvas.toDataURL(cleanMime, clampedQuality);
    } catch (e) {
      return canvas.toDataURL("image/png");
    }
  }

  /**
   * Trigger browser file download for Blob, ArrayBuffer, or DataURL
   * @param {Blob|ArrayBuffer|string} data
   * @param {string} filename
   */
  static downloadImage(data, filename = "processed_image.jpg") {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    let blobUrl = "";
    let isCreated = false;

    if (data instanceof Blob) {
      blobUrl = URL.createObjectURL(data);
      isCreated = true;
    } else if (data instanceof ArrayBuffer) {
      const blob = new Blob([data]);
      blobUrl = URL.createObjectURL(blob);
      isCreated = true;
    } else if (typeof data === "string") {
      blobUrl = data;
    }

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename || "image.jpg") : String(filename || "image.jpg").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (isCreated) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
  }

  /**
   * Check browser runtime export support for formats like AVIF or WebP
   * @param {string} mimeType
   * @returns {Promise<boolean>}
   */
  static async checkFormatSupport(mimeType) {
    if (typeof document === "undefined") return false;

    try {
      const testCanvas = document.createElement("canvas");
      testCanvas.width = 1;
      testCanvas.height = 1;
      const dataUrl = testCanvas.toDataURL(mimeType);
      return dataUrl.startsWith(`data:${mimeType}`);
    } catch (e) {
      return false;
    }
  }
}

export const GlobalImageExporter = ImageExporter;
