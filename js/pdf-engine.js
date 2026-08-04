/**
 * Comprexa Universal PDF Engine - Entry Script
 * Exposes window.ComprexaPdfEngine and all sub-modules globally across the application.
 */

import { PdfConfig } from "./pdf/config.js";
import { PdfUtils } from "./pdf/utils.js";
import { GlobalPdfEventBus } from "./pdf/events.js";
import { GlobalPdfValidator, PdfValidator } from "./pdf/validator.js";
import {
  GlobalPdfMetadataExtractor,
  PdfMetadataExtractor,
} from "./pdf/metadata.js";
import { GlobalPdfLoader, PdfLoader } from "./pdf/loader.js";
import {
  GlobalPdfThumbnailGenerator,
  PdfThumbnailGenerator,
} from "./pdf/thumbnails.js";
import { GlobalPdfExporter, PdfExporter } from "./pdf/exporter.js";
import {
  GlobalPdfProgressManager,
  PdfProgressManager,
  PdfProgressState,
} from "./pdf/progress.js";
import { ComprexaPdfEngine } from "./pdf/engine.js";

if (typeof window !== "undefined") {
  window.ComprexaPdfConfig = PdfConfig;
  window.ComprexaPdfUtils = PdfUtils;
  window.ComprexaPdfEventBus = GlobalPdfEventBus;
  window.ComprexaPdfValidator = GlobalPdfValidator;
  window.PdfValidator = PdfValidator;
  window.ComprexaPdfMetadataExtractor = GlobalPdfMetadataExtractor;
  window.PdfMetadataExtractor = PdfMetadataExtractor;
  window.ComprexaPdfLoader = GlobalPdfLoader;
  window.PdfLoader = PdfLoader;
  window.ComprexaPdfThumbnailGenerator = GlobalPdfThumbnailGenerator;
  window.PdfThumbnailGenerator = PdfThumbnailGenerator;
  window.ComprexaPdfExporter = GlobalPdfExporter;
  window.PdfExporter = PdfExporter;
  window.ComprexaPdfProgressManager = GlobalPdfProgressManager;
  window.PdfProgressManager = PdfProgressManager;
  window.PdfProgressState = PdfProgressState;
  window.ComprexaPdfEngine = ComprexaPdfEngine;
}

export {
  PdfConfig,
  PdfUtils,
  GlobalPdfEventBus,
  GlobalPdfValidator,
  GlobalPdfMetadataExtractor,
  GlobalPdfLoader,
  GlobalPdfThumbnailGenerator,
  GlobalPdfExporter,
  GlobalPdfProgressManager,
  PdfProgressState,
  ComprexaPdfEngine,
};
