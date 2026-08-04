/**
 * Utility functions for JSON Tree Viewer
 */

export class TreeUtils {
  /**
   * Display toast notification
   */
  static showToast(message, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type);
    }
  }

  /**
   * Copy text to system clipboard
   */
  static async copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        return success;
      }
    } catch (err) {
      console.error("Copy failed:", err);
      return false;
    }
  }

  /**
   * Download text content as a file
   */
  static downloadFile(
    content,
    filename = "tree-view.json",
    mimeType = "application/json",
  ) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Download failed:", err);
      return false;
    }
  }

  /**
   * Format byte count nicely
   */
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
