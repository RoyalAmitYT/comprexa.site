/**
 * Comprexa Universal Image Engine - Image Utilities
 * Helper functions for file naming, format conversion, size formatting, and IDs.
 */

export class ImageUtils {
  /**
   * Format bytes into human readable string
   * @param {number} bytes
   * @param {number} [decimals=2]
   * @returns {string} e.g. "2.45 MB"
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0 || !bytes || isNaN(bytes)) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Alias for formatFileSize
   */
  static formatBytes(bytes, decimals = 2) {
    return this.formatFileSize(bytes, decimals);
  }

  /**
   * Format width and height dimensions
   * @param {number} width
   * @param {number} height
   * @returns {string} e.g. "1920 × 1080 px"
   */
  static formatDimensions(width, height) {
    if (!width || !height) return "Unknown Dimensions";
    return `${Math.round(width)} × ${Math.round(height)} px`;
  }

  /**
   * Extract extension from filename or path
   * @param {string} filename
   * @returns {string} e.g. "png"
   */
  static getFileExtension(filename) {
    if (!filename) return "";
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  /**
   * Convert filename extension to a new extension
   * @param {string} originalName
   * @param {string} newExtension e.g. "jpg", "webp", "png"
   * @returns {string}
   */
  static convertExtension(originalName, newExtension) {
    if (!originalName) return `image.${newExtension}`;
    const cleanExt = newExtension.replace(/^\./, "").toLowerCase();
    const lastDot = originalName.lastIndexOf(".");
    if (lastDot === -1) return `${originalName}.${cleanExt}`;
    return `${originalName.substring(0, lastDot)}.${cleanExt}`;
  }

  /**
   * Generate output filename with action suffix
   * @param {string} originalName
   * @param {string} actionSuffix e.g. "resized", "compressed", "watermarked"
   * @param {string} targetExtension e.g. "webp", "jpg"
   * @returns {string}
   */
  static generateFilename(originalName, actionSuffix, targetExtension) {
    if (!originalName) originalName = "image.png";
    const cleanExt = targetExtension
      ? targetExtension.replace(/^\./, "").toLowerCase()
      : this.getFileExtension(originalName) || "jpg";

    const lastDot = originalName.lastIndexOf(".");
    const baseName =
      lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
    const suffix = actionSuffix ? `_${actionSuffix}` : "";

    return `${baseName}${suffix}.${cleanExt}`;
  }

  /**
   * Generate unique random string ID
   * @param {string} [prefix='img']
   * @returns {string}
   */
  static generateId(prefix = "img") {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  /**
   * Get timestamp string e.g. "20260730_104500"
   * @returns {string}
   */
  static getTimestampString() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  /**
   * Map MIME type to standard file extension
   * @param {string} mimeType
   * @returns {string}
   */
  static mimeToExtension(mimeType) {
    switch ((mimeType || "").toLowerCase()) {
      case "image/jpeg":
      case "image/jpg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
      case "image/gif":
        return "gif";
      case "image/svg+xml":
        return "svg";
      case "image/bmp":
        return "bmp";
      case "image/x-icon":
      case "image/vnd.microsoft.icon":
        return "ico";
      case "image/avif":
        return "avif";
      case "image/heic":
        return "heic";
      case "image/tiff":
        return "tiff";
      default:
        return "jpg";
    }
  }

  /**
   * Map file extension to standard MIME type
   * @param {string} extension
   * @returns {string}
   */
  static extensionToMime(extension) {
    const ext = (extension || "").replace(/^\./, "").toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      case "bmp":
        return "image/bmp";
      case "ico":
        return "image/x-icon";
      case "avif":
        return "image/avif";
      case "heic":
      case "heif":
        return "image/heic";
      case "tif":
      case "tiff":
        return "image/tiff";
      default:
        return "image/jpeg";
    }
  }

  /**
   * Escape HTML characters in string
   * @param {string} str
   * @returns {string}
   */
  static escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export const GlobalImageUtils = ImageUtils;
