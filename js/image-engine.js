/**
 * Comprexa Universal Image Engine - Entry Script
 * Exposes window.ComprexaImageEngine and all sub-modules globally across the application.
 */

import { ImageConfig } from "./image/config.js";
import { ImageUtils, GlobalImageUtils } from "./image/utils.js";
import {
  ImageEngineEvents,
  ImageEventBus,
  GlobalImageEventBus,
} from "./image/events.js";
import {
  ImageEngineError,
  ImageErrorCategory,
  ImageErrorManager,
  GlobalImageErrorManager,
} from "./image/errors.js";
import { ImageValidator, GlobalImageValidator } from "./image/validator.js";
import {
  ImageMetadataExtractor,
  GlobalImageMetadataExtractor,
} from "./image/metadata.js";
import {
  AspectRatioUtils,
  GlobalAspectRatioUtils,
} from "./image/aspect-ratio.js";
import {
  ImageQualityManager,
  GlobalImageQualityManager,
} from "./image/quality.js";
import { ImageLoader, GlobalImageLoader } from "./image/loader.js";
import {
  ImagePreviewEngine,
  GlobalImagePreviewEngine,
} from "./image/preview.js";
import {
  CanvasProcessingEngine,
  GlobalCanvasProcessingEngine,
} from "./image/canvas.js";
import { ImageExporter, GlobalImageExporter } from "./image/exporter.js";
import {
  ImageProgressManager,
  ImageProgressState,
  GlobalImageProgressManager,
} from "./image/progress.js";
import {
  BatchProcessingManager,
  BatchItemStatus,
  GlobalBatchProcessingManager,
} from "./image/batch.js";
import { ComprexaBatchUI } from "./image/batch-ui.js";
import {
  ComprexaImageEngine,
  GlobalComprexaImageEngine,
} from "./image/engine.js";

if (typeof window !== "undefined") {
  window.ComprexaImageConfig = ImageConfig;
  window.ComprexaImageUtils = GlobalImageUtils;
  window.ImageUtils = ImageUtils;
  window.ComprexaImageEventBus = GlobalImageEventBus;
  window.ImageEngineEvents = ImageEngineEvents;
  window.ImageEngineError = ImageEngineError;
  window.ImageErrorCategory = ImageErrorCategory;
  window.ComprexaImageErrorManager = GlobalImageErrorManager;
  window.ComprexaImageValidator = GlobalImageValidator;
  window.ImageValidator = ImageValidator;
  window.ComprexaImageMetadataExtractor = GlobalImageMetadataExtractor;
  window.ImageMetadataExtractor = ImageMetadataExtractor;
  window.ComprexaAspectRatioUtils = GlobalAspectRatioUtils;
  window.AspectRatioUtils = AspectRatioUtils;
  window.ComprexaImageQualityManager = GlobalImageQualityManager;
  window.ImageQualityManager = ImageQualityManager;
  window.ComprexaImageLoader = GlobalImageLoader;
  window.ImageLoader = ImageLoader;
  window.ComprexaImagePreviewEngine = GlobalImagePreviewEngine;
  window.ImagePreviewEngine = ImagePreviewEngine;
  window.ComprexaCanvasProcessingEngine = GlobalCanvasProcessingEngine;
  window.CanvasProcessingEngine = CanvasProcessingEngine;
  window.ComprexaImageExporter = GlobalImageExporter;
  window.ImageExporter = ImageExporter;
  window.ComprexaImageProgressManager = GlobalImageProgressManager;
  window.ImageProgressState = ImageProgressState;
  window.ComprexaBatchProcessingManager = GlobalBatchProcessingManager;
  window.BatchItemStatus = BatchItemStatus;
  window.ComprexaBatchUI = ComprexaBatchUI;
  window.ComprexaImageEngine = GlobalComprexaImageEngine;
}

export {
  ImageConfig,
  ImageUtils,
  GlobalImageUtils,
  ImageEngineEvents,
  GlobalImageEventBus,
  ImageEngineError,
  ImageErrorCategory,
  GlobalImageErrorManager,
  GlobalImageValidator,
  ImageValidator,
  GlobalImageMetadataExtractor,
  ImageMetadataExtractor,
  GlobalAspectRatioUtils,
  AspectRatioUtils,
  GlobalImageQualityManager,
  ImageQualityManager,
  GlobalImageLoader,
  GlobalImagePreviewEngine,
  ImagePreviewEngine,
  GlobalCanvasProcessingEngine,
  CanvasProcessingEngine,
  GlobalImageExporter,
  ImageExporter,
  GlobalImageProgressManager,
  ImageProgressState,
  GlobalBatchProcessingManager,
  BatchItemStatus,
  ComprexaBatchUI,
  ComprexaImageEngine,
  GlobalComprexaImageEngine,
};
