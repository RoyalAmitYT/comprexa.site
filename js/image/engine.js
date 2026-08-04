// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Core Engine Entry point
 * Unifies validator, metadata, loader, preview, canvas, exporter, quality, aspect ratio, batch, progress, errors, and events.
 */

import { ImageConfig } from "./config.js";
import { ImageUtils, /* GlobalImageUtils */ } from "./utils.js";
import {
  ImageEngineEvents,
  ImageEventBus,
  GlobalImageEventBus,
} from "./events.js";
import {
  ImageEngineError,
  ImageErrorCategory,
  ImageErrorManager,
  GlobalImageErrorManager,
} from "./errors.js";
import { ImageValidator, /* GlobalImageValidator */ } from "./validator.js";
import {
  ImageMetadataExtractor,
  GlobalImageMetadataExtractor,
} from "./metadata.js";
import { AspectRatioUtils, /* GlobalAspectRatioUtils */ } from "./aspect-ratio.js";
import { ImageQualityManager, /* GlobalImageQualityManager */ } from "./quality.js";
import { ImageLoader, GlobalImageLoader } from "./loader.js";
import { ImagePreviewEngine, /* GlobalImagePreviewEngine */ } from "./preview.js";
import {
  CanvasProcessingEngine,
  GlobalCanvasProcessingEngine,
} from "./canvas.js";
import { ImageExporter, /* GlobalImageExporter */ } from "./exporter.js";
import {
  ImageProgressManager,
  ImageProgressState,
  GlobalImageProgressManager,
} from "./progress.js";
import {
  BatchProcessingManager,
  BatchItemStatus,
  GlobalBatchProcessingManager,
} from "./batch.js";
import { ComprexaBatchUI } from "./batch-ui.js";

export class ComprexaImageEngine {
  constructor() {
    this.config = ImageConfig;
    this.utils = ImageUtils;
    this.events = GlobalImageEventBus;
    this.validator = ImageValidator;
    this.metadata = ImageMetadataExtractor;
    this.aspectRatio = AspectRatioUtils;
    this.quality = ImageQualityManager;
    this.loader = GlobalImageLoader;
    this.preview = ImagePreviewEngine;
    this.canvas = CanvasProcessingEngine;
    this.exporter = ImageExporter;
    this.progress = GlobalImageProgressManager;
    this.batch = GlobalBatchProcessingManager;
    this.batchUI = ComprexaBatchUI;
    this.errors = ImageErrorManager;
  }

  /**
   * One-step convenience pipeline to validate, load, process on canvas, and export image
   * @param {File|Blob} file
   * @param {Function} [canvasProcessCallback] (canvas) => HTMLCanvasElement
   * @param {Object} [exportOptions] { mimeType: 'image/jpeg', quality: 0.85, filename: 'output.jpg' }
   * @returns {Promise<{blob: Blob, dataUrl: string, metadata: Object, filename: string}>}
   */
  async processAndExport(
    file,
    canvasProcessCallback = null,
    exportOptions = {},
  ) {
    try {
      this.progress.update(
        ImageProgressState.LOADING,
        10,
        "Validating and decoding image file...",
      );
      this.events.emit(ImageEngineEvents.PROCESSING_START, {
        filename: file.name,
      });

      // 1. Validate
      const _valResult = await this.validator.validateFile(file);

      // 2. Load
      const loaded = await this.loader.loadImage(file, { useBitmap: true });
      this.progress.update(
        ImageProgressState.PROCESSING,
        40,
        "Processing canvas layers...",
      );

      // 3. Extract Metadata
      const meta = await this.metadata.extractMetadata(file);

      // 4. Initial Canvas Creation
      let workingCanvas = this.canvas.convert(
        loaded.image,
        exportOptions.mimeType || "image/jpeg",
        { backgroundColor: exportOptions.backgroundColor },
      );

      // 5. User/Tool Canvas Operations Callback
      if (typeof canvasProcessCallback === "function") {
        workingCanvas =
          (await canvasProcessCallback(workingCanvas, loaded.image, meta)) ||
          workingCanvas;
      }

      this.progress.update(
        ImageProgressState.PROCESSING,
        80,
        "Encoding output format...",
      );

      // 6. Export
      const targetMime =
        exportOptions.mimeType || meta.mimeType || "image/jpeg";
      const targetQuality = exportOptions.quality || 0.85;

      const blob = await this.exporter.exportCanvasToBlob(
        workingCanvas,
        targetMime,
        targetQuality,
      );
      const dataUrl = this.exporter.exportCanvasToDataUrl(
        workingCanvas,
        targetMime,
        targetQuality,
      );

      const outputFilename =
        exportOptions.filename ||
        this.utils.generateFilename(
          file.name,
          exportOptions.actionSuffix || "processed",
          this.utils.mimeToExtension(targetMime),
        );

      // Clean loaded resources
      loaded.cleanup();

      this.progress.update(
        ImageProgressState.COMPLETED,
        100,
        "Image processing complete!",
      );
      this.events.emit(ImageEngineEvents.PROCESSING_COMPLETE, {
        filename: outputFilename,
        size: blob.size,
      });

      return {
        blob,
        dataUrl,
        metadata: meta,
        outputSize: blob.size,
        formattedOutputSize: this.utils.formatFileSize(blob.size),
        filename: outputFilename,
      };
    } catch (err) {
      this.progress.update(
        ImageProgressState.FAILED,
        0,
        err?.message || "Processing failed",
      );
      const handled = this.errors.handleError(err, { file: file.name });
      this.events.emit(ImageEngineEvents.ERROR, handled);
      throw handled;
    }
  }
}

export const GlobalComprexaImageEngine = new ComprexaImageEngine();
