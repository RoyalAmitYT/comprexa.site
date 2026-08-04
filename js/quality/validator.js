/**
 * Comprexa Quality Framework - Validation Test Utilities
 * Reusable functions to test and validate files, user inputs, global settings, and tool registry schemas.
 */

// import { Assert } from "./assert.js";

export class ComprexaValidator {
  /**
   * Test File Object validity
   */
  validateFileObject(file, options = {}) {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      return {
        valid: false,
        error: "Invalid file object. Must be an instance of File or Blob.",
      };
    }

    const maxSizeMB = options.maxSizeMB || 100;
    const allowedExtensions = options.allowedExtensions || [];

    if (file.size === 0) {
      return { valid: false, error: "File is empty (0 bytes)." };
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File size (${fileSizeMB.toFixed(1)} MB) exceeds limit of ${maxSizeMB} MB.`,
      };
    }

    if (allowedExtensions.length > 0) {
      const ext = (file.name || "").split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return {
          valid: false,
          error: `File extension ".${ext}" is not in allowed list: [${allowedExtensions.join(", ")}].`,
        };
      }
    }

    return { valid: true, error: null };
  }

  /**
   * Validate Tool Registry Configuration Entry
   */
  validateToolDefinition(tool) {
    const requiredFields = [
      "id",
      "name",
      "category",
      "icon",
      "description",
      "url",
    ];
    const missing = [];

    requiredFields.forEach((field) => {
      if (!tool || !tool[field]) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Tool definition missing required fields: ${missing.join(", ")}`,
        missingFields: missing,
      };
    }

    if (!tool.url.startsWith("/") && !tool.url.startsWith("http")) {
      return {
        valid: false,
        error: `Tool URL "${tool.url}" must be relative starting with / or absolute.`,
      };
    }

    return { valid: true, error: null };
  }

  /**
   * Validate Settings Object schema
   */
  validateSettingsSchema(settingsObj) {
    if (typeof settingsObj !== "object" || settingsObj === null) {
      return { valid: false, error: "Settings must be a key-value object." };
    }

    const validKeys = [
      "theme",
      "accentColor",
      "defaultFilenamePattern",
      "autoDownloadOnProcess",
      "clearFilesOnExport",
      "soundEffects",
      "highPerformanceCanvas",
      "analyticsOptOut",
    ];

    const invalidKeys = Object.keys(settingsObj).filter(
      (k) => !validKeys.includes(k),
    );

    if (invalidKeys.length > 0) {
      return {
        valid: false,
        error: `Settings contain unknown configuration keys: ${invalidKeys.join(", ")}`,
      };
    }

    return { valid: true, error: null };
  }
}

export const GlobalValidator = new ComprexaValidator();

if (typeof window !== "undefined") {
  window.ComprexaQualityValidator = GlobalValidator;
}
