/**
 * Comprexa Universal PDF Engine - Configuration
 * Centralized settings, constraints, defaults, and future feature flags.
 */

import { pdfWorker } from "./pdf-init.js";

export const PdfConfig = {
  // Max file size limits
  maxFileSizeMB: 100,
  maxFileSizeBytes: 100 * 1024 * 1024,

  // File type definitions
  supportedMimeTypes: ["application/pdf"],
  supportedExtensions: ["pdf"],

  // Default compression parameters
  compressionDefaults: {
    level: "recommended", // 'extreme' | 'recommended' | 'less'
    imageQuality: 0.75,
    scaleFactor: 0.85,
    compressStreams: true,
  },

  // Thumbnail generator configuration
  thumbnailDefaults: {
    scale: 0.35,
    highResScale: 1.2,
    maxCacheEntries: 300,
    placeholderBg: "var(--bg-surface)",
  },

  // PDF.js Worker path
  pdfJsWorkerUrl: pdfWorker,

  // Universal Error Codes
  errorCodes: {
    FILE_MISSING: "ERR_PDF_FILE_MISSING",
    INVALID_TYPE: "ERR_PDF_INVALID_TYPE",
    EXCEEDS_SIZE: "ERR_PDF_EXCEEDS_SIZE",
    FILE_EMPTY: "ERR_PDF_FILE_EMPTY",
    ENCRYPTED: "ERR_PDF_ENCRYPTED",
    CORRUPTED: "ERR_PDF_CORRUPTED",
    PROCESSING_FAILED: "ERR_PDF_PROCESSING_FAILED",
    LIBRARY_NOT_LOADED: "ERR_PDF_LIB_NOT_LOADED",
  },

  // Future-ready capability flags
  featureFlags: {
    passwordProtection: true,
    batchProcessing: true,
    largePdfChunking: true, // For 500+ page PDFs
    ocrSupport: false,
    cloudStorageSync: false,
    serverSideProcessing: false,
  },
};

if (typeof window !== "undefined") {
  window.ComprexaPdfConfig = PdfConfig;
}
