// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Image Metadata Extractor
 * Extracts dimensions, aspect ratio, orientation, transparency, color depth, EXIF & profile placeholders.
 */

import { ImageUtils } from "./utils.js";
import { AspectRatioUtils } from "./aspect-ratio.js";

export class ImageMetadataExtractor {
  /**
   * Extract comprehensive metadata from an image file, element, or bitmap
   * @param {File|Blob|HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @returns {Promise<Object>}
   */
  static async extractMetadata(source) {
    let _file = null;
    let width = 0;
    let height = 0;
    let mimeType = "image/png";
    let extension = "png";
    let fileSize = 0;
    let name = "image";

    if (source instanceof File || source instanceof Blob) {
      file = source;
      fileSize = source.size;
      name = source.name || "image";
      extension = ImageUtils.getFileExtension(name);
      mimeType = source.type || ImageUtils.extensionToMime(extension);

      // Load dimensions
      const loaded = await this.getDimensionsFromBlob(source);
      width = loaded.width;
      height = loaded.height;
    } else if (source instanceof HTMLImageElement) {
      width = source.naturalWidth || source.width;
      height = source.naturalHeight || source.height;
      mimeType = "image/png";
      extension = "png";
    } else if (
      typeof ImageBitmap !== "undefined" &&
      source instanceof ImageBitmap
    ) {
      width = source.width;
      height = source.height;
    } else if (source instanceof HTMLCanvasElement) {
      width = source.width;
      height = source.height;
    }

    const numericAspectRatio =
      height > 0 ? parseFloat((width / height).toFixed(4)) : 1;
    const formattedAspectRatio = AspectRatioUtils.formatRatio(width, height);
    const orientation = this.getOrientation(width, height);

    // Transparency detection
    const hasAlpha = await this.detectTransparency(source, width, height);

    // Color depth calculation
    const colorDepth = hasAlpha
      ? "32-bit (8-bit per channel + Alpha)"
      : "24-bit (8-bit per channel RGB)";

    return {
      name,
      width,
      height,
      dimensionsFormatted: ImageUtils.formatDimensions(width, height),
      aspectRatio: numericAspectRatio,
      aspectRatioFormatted: formattedAspectRatio,
      orientation, // 'landscape' | 'portrait' | 'square'
      fileSize,
      fileSizeFormatted: ImageUtils.formatFileSize(fileSize),
      mimeType,
      extension,
      hasAlpha,
      colorDepth,
      // Future compatibility placeholders
      exif: {
        camera: null,
        lens: null,
        iso: null,
        focalLength: null,
        exposureTime: null,
        dateTimeOriginal: null,
        gps: null,
        hasExifData: false,
      },
      colorProfile: {
        name: hasAlpha ? "sRGB (Alpha Enabled)" : "sRGB Standard",
        iccProfileDetected: false,
      },
    };
  }

  /**
   * Determine orientation classification
   * @param {number} w
   * @param {number} h
   * @returns {string} 'landscape' | 'portrait' | 'square'
   */
  static getOrientation(w, h) {
    if (w > h) return "landscape";
    if (h > w) return "portrait";
    return "square";
  }

  /**
   * Get image dimensions from Blob/File safely
   * @param {Blob|File} blob
   * @returns {Promise<{width: number, height: number}>}
   */
  static async getDimensionsFromBlob(blob) {
    if (
      typeof window !== "undefined" &&
      "createImageBitmap" in window &&
      !blob.type.includes("svg")
    ) {
      try {
        const bitmap = await createImageBitmap(blob);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dimensions;
      } catch (e) {
        // Fallback
      }
    }

    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };
        URL.revokeObjectURL(url);
        resolve(dimensions);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  }

  /**
   * Sample canvas pixels to detect transparency (alpha < 255)
   * @param {File|Blob|HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {number} width
   * @param {number} height
   * @returns {Promise<boolean>}
   */
  static async detectTransparency(source, width, height) {
    if (!width || !height) return false;

    // Fast check by file type first
    if (source instanceof File || source instanceof Blob) {
      const type = source.type || "";
      if (
        type.includes("jpeg") ||
        type.includes("jpg") ||
        type.includes("bmp")
      ) {
        return false; // JPEGs & BMPs do not support alpha channels
      }
    }

    try {
      const sampleCanvas = document.createElement("canvas");
      const sampleWidth = Math.min(width, 100);
      const sampleHeight = Math.min(height, 100);
      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      const ctx = sampleCanvas.getContext("2d");
      if (!ctx) return false;

      let drawSource = source;
      let urlToRevoke = null;

      if (source instanceof File || source instanceof Blob) {
        urlToRevoke = URL.createObjectURL(source);
        drawSource = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = urlToRevoke;
        });
      }

      if (!drawSource) return false;

      ctx.drawImage(drawSource, 0, 0, sampleWidth, sampleHeight);

      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);

      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

      // Sample alpha channel bytes (every 4th byte)
      for (let i = 3; i < imgData.length; i += 4) {
        if (imgData[i] < 255) {
          sampleCanvas.width = 0;
          sampleCanvas.height = 0;
          return true; // Transparent pixel found
        }
      }

      sampleCanvas.width = 0;
      sampleCanvas.height = 0;
      return false;
    } catch (e) {
      return false;
    }
  }
}

export const GlobalImageMetadataExtractor = ImageMetadataExtractor;
