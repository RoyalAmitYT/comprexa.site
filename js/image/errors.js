/**
 * Comprexa Universal Image Engine - Error Manager
 * Categorized error classes, user-facing error formatting, and remote logging hook.
 */

import { ImageConfig } from "./config.js";

export const ImageErrorCategory = {
  VALIDATION: "VALIDATION",
  DECODE: "DECODE",
  CANVAS: "CANVAS",
  EXPORT: "EXPORT",
  MEMORY: "MEMORY",
  BATCH: "BATCH",
  UNKNOWN: "UNKNOWN",
};

export class ImageEngineError extends Error {
  /**
   * @param {string} message - Technical error message
   * @param {string} code - Error code from ImageConfig.errorCodes
   * @param {string} category - ImageErrorCategory
   * @param {string} userMessage - Friendly error message for end users
   * @param {Object} [debugDetails] - Additional contextual telemetry
   */
  constructor(
    message,
    code,
    category = ImageErrorCategory.UNKNOWN,
    userMessage = null,
    debugDetails = {},
  ) {
    super(message);
    this.name = "ImageEngineError";
    this.code = code || ImageConfig.errorCodes.CANVAS_FAILED;
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(this.code);
    this.debugDetails = debugDetails;
    this.timestamp = new Date().toISOString();
  }

  getDefaultUserMessage(code) {
    switch (code) {
      case ImageConfig.errorCodes.FILE_MISSING:
        return "No image file was selected. Please upload an image.";
      case ImageConfig.errorCodes.INVALID_TYPE:
        return "The selected file format is not supported. Please upload a valid image (JPG, PNG, WebP, GIF, SVG, BMP).";
      case ImageConfig.errorCodes.EXCEEDS_SIZE:
        return `The selected image exceeds the maximum allowed upload size of ${ImageConfig.maxFileSizeMB} MB.`;
      case ImageConfig.errorCodes.EXCEEDS_DIMENSIONS:
        return `The image resolution exceeds the maximum supported limit (${ImageConfig.maxDimensionWidth}x${ImageConfig.maxDimensionHeight} px).`;
      case ImageConfig.errorCodes.CORRUPTED:
      case ImageConfig.errorCodes.DECODE_FAILED:
        return "The image file appears to be corrupted or unreadable.";
      case ImageConfig.errorCodes.CANVAS_FAILED:
        return "An error occurred while processing the image on the canvas.";
      case ImageConfig.errorCodes.EXPORT_FAILED:
        return "Failed to encode and export the image file.";
      case ImageConfig.errorCodes.MEMORY_LIMIT:
        return "Your browser ran out of memory while processing this image. Try using a smaller file.";
      default:
        return "An unexpected error occurred while processing the image.";
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      userMessage: this.userMessage,
      debugDetails: this.debugDetails,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class ImageErrorManager {
  static loggers = [];

  /**
   * Register a remote error logger
   * @param {Function} loggerFn
   */
  static registerRemoteLogger(loggerFn) {
    if (typeof loggerFn === "function") {
      this.loggers.push(loggerFn);
    }
  }

  /**
   * Handle an error, format it, and dispatch to loggers
   * @param {Error|ImageEngineError} err
   * @param {Object} [context]
   * @returns {ImageEngineError}
   */
  static handleError(err, context = {}) {
    let engineErr;

    if (err instanceof ImageEngineError) {
      engineErr = err;
      engineErr.debugDetails = { ...engineErr.debugDetails, ...context };
    } else {
      engineErr = new ImageEngineError(
        err?.message || String(err),
        ImageConfig.errorCodes.CANVAS_FAILED,
        ImageErrorCategory.UNKNOWN,
        null,
        { originalError: err, ...context },
      );
    }

    if (typeof console !== "undefined" && console.error) {
      console.error(
        `[ComprexaImageEngine:${engineErr.category}] ${engineErr.code}:`,
        engineErr.message,
        engineErr.debugDetails,
      );
    }

    // Trigger remote logging if enabled or registered
    if (ImageConfig.featureFlags.remoteLogging && this.loggers.length > 0) {
      this.loggers.forEach((fn) => {
        try {
          fn(engineErr.toJSON());
        } catch (e) {
          // Ignore logger errors
        }
      });
    }

    return engineErr;
  }
}

export const GlobalImageErrorManager = ImageErrorManager;
