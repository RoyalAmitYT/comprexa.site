/**
 * Comprexa Universal Image Engine - Configuration
 * Centralized settings, limits, formats, quality presets, and feature flags.
 */

export const ImageConfig = {
  // Max file size limits (50 MB default)
  maxFileSizeMB: 50,
  maxFileSizeBytes: 50 * 1024 * 1024,

  // Max dimension limits (8192 x 8192 px default)
  maxDimensionWidth: 8192,
  maxDimensionHeight: 8192,
  maxPixelCount: 8192 * 8192,

  // Supported format declarations
  supportedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/bmp",
    "image/x-icon",
  ],

  supportedExtensions: [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "svg",
    "bmp",
    "ico",
  ],

  // Extended / Future Formats
  futureMimeTypes: ["image/avif", "image/heic", "image/heif", "image/tiff"],

  futureExtensions: ["avif", "heic", "heif", "tiff", "tif"],

  // Default export format
  defaultExportFormat: "image/jpeg",

  // Quality presets mapping
  qualityPresets: {
    low: {
      name: "Low",
      quality: 0.5,
      desc: "Maximum compression, smallest file size",
    },
    medium: {
      name: "Medium",
      quality: 0.75,
      desc: "Balanced compression and visual clarity",
    },
    high: {
      name: "High",
      quality: 0.9,
      desc: "High visual fidelity with moderate savings",
    },
    maximum: {
      name: "Maximum",
      quality: 1.0,
      desc: "Best visual quality, largest file size",
    },
    custom: {
      name: "Custom",
      quality: 0.8,
      desc: "User specified quality parameter",
    },
  },

  // Default canvas processing options
  canvasDefaults: {
    smoothingEnabled: true,
    smoothingQuality: "high", // 'low' | 'medium' | 'high'
    preserveAlpha: true,
    backgroundColor: "#FFFFFF", // Fallback when converting PNG/WebP with transparency to JPG
  },

  // Error Code Constants
  errorCodes: {
    FILE_MISSING: "ERR_IMAGE_FILE_MISSING",
    INVALID_TYPE: "ERR_IMAGE_INVALID_TYPE",
    EXCEEDS_SIZE: "ERR_IMAGE_EXCEEDS_SIZE",
    EXCEEDS_DIMENSIONS: "ERR_IMAGE_EXCEEDS_DIMENSIONS",
    CORRUPTED: "ERR_IMAGE_CORRUPTED",
    DECODE_FAILED: "ERR_IMAGE_DECODE_FAILED",
    CANVAS_FAILED: "ERR_IMAGE_CANVAS_FAILED",
    EXPORT_FAILED: "ERR_IMAGE_EXPORT_FAILED",
    UNSUPPORTED_FORMAT: "ERR_IMAGE_UNSUPPORTED_FORMAT",
    BATCH_FAILED: "ERR_IMAGE_BATCH_FAILED",
    MEMORY_LIMIT: "ERR_IMAGE_MEMORY_LIMIT",
  },

  // Feature capability flags
  featureFlags: {
    offscreenCanvas:
      typeof window !== "undefined" && "OffscreenCanvas" in window,
    createImageBitmap:
      typeof window !== "undefined" && "createImageBitmap" in window,
    avifExportSupport: false, // Detected at runtime
    heicImportSupport: false, // Future lib integration
    batchProcessing: true,
    parallelWorkers: true,
    maxWorkerConcurrency: 4,
    aiUpscaler: false,
    bgRemoval: false,
    remoteLogging: false,
  },
};

if (typeof window !== "undefined") {
  window.ComprexaImageConfig = ImageConfig;
}
