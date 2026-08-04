/**
 * JSON Formatter Utilities (Independent Implementation)
 * Provides toast notifications, clipboard operations, file downloads, and byte formatting.
 */

export class FormatterUtils {
  static showToast(message, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type);
    }
  }

  static async copyToClipboard(text) {
    if (!text) {
      this.showToast("Nothing to copy", "warning");
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.showToast("Copied to clipboard!", "success");
      return true;
    } catch (err) {
      this.showToast("Failed to copy to clipboard", "error");
      return false;
    }
  }

  static downloadFile(text, filename = "formatted.json") {
    if (!text) {
      this.showToast("Nothing to download", "warning");
      return;
    }
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast("File downloaded!", "success");
  }

  static formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
