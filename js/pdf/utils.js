/**
 * Comprexa Universal PDF Engine - File & Data Utilities
 * Reusable helper functions for byte formatting, filename generation, unique IDs, and dates.
 */

export const PdfUtils = {
  /**
   * Format byte count to human-readable string (e.g., 2.4 MB)
   */
  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes <= 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  /**
   * Extract base filename without extension
   */
  getBaseFilename(filename = "") {
    return filename.replace(/\.[^/.]+$/, "");
  },

  /**
   * Extract extension from filename
   */
  getFileExtension(filename = "") {
    return filename.split(".").pop().toLowerCase();
  },

  /**
   * Generate output filename based on user settings pattern or action suffix
   * Integrates seamlessly with window.ComprexaSettings
   */
  generateOutputFilename(
    originalName,
    actionSuffix = "processed",
    extension = "pdf",
  ) {
    const baseName = this.getBaseFilename(originalName);

    if (
      window.ComprexaSettings &&
      typeof window.ComprexaSettings.get === "function"
    ) {
      const pattern = window.ComprexaSettings.get(
        "defaultFilenamePattern",
        "{filename}-processed.{ext}",
      );
      let formatted = pattern
        .replace("{filename}", baseName)
        .replace("{ext}", extension);

      if (!formatted.toLowerCase().endsWith("." + extension.toLowerCase())) {
        formatted += "." + extension;
      }
      return formatted;
    }

    return `${baseName}-${actionSuffix}.${extension}`;
  },

  /**
   * Generate cryptographically unique ID for elements & pages
   */
  generateUniqueId(prefix = "pdf_item") {
    const randomPart = Math.random().toString(36).substring(2, 8);
    const timePart = Date.now().toString(36);
    return `${prefix}_${timePart}_${randomPart}`;
  },

  /**
   * Format date into localized ISO/readable format
   */
  formatDate(date = new Date()) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Safely calculate compression percentage reduction
   */
  calculateReductionPercentage(originalSize, newSize) {
    if (!originalSize || originalSize <= 0 || !newSize) return 0;
    const diff = originalSize - newSize;
    if (diff <= 0) return 0;
    return Math.round((diff / originalSize) * 100);
  },

  /**
   * Parse range strings like "1-5, 8, 11-14" into an array of 1-based page numbers
   * @param {string} rangeStr
   * @param {number} [maxPages=Infinity]
   * @returns {number[]} Array of unique, sorted valid page numbers
   */
  parsePageRanges(rangeStr, maxPages = Infinity) {
    if (!rangeStr || typeof rangeStr !== "string") return [];

    const pageSet = new Set();
    const parts = rangeStr.split(/[,;\s]+/);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        let start = parseInt(startStr, 10);
        let end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) continue;

        start = Math.max(1, start);
        end = Math.min(maxPages, end);

        if (start <= end) {
          for (let p = start; p <= end; p++) {
            pageSet.add(p);
          }
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pageSet.add(page);
        }
      }
    }

    return Array.from(pageSet).sort((a, b) => a - b);
  },
};

if (typeof window !== "undefined") {
  window.ComprexaPdfUtils = PdfUtils;
}
