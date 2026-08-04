// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Batch Processing Manager
 * Queue management, concurrency throttling, item-level status, retry, and cancellation.
 */

import JSZip from "jszip";
import { ImageConfig } from "./config.js";
import { ImageUtils } from "./utils.js";
import { ImageEngineEvents, GlobalImageEventBus } from "./events.js";
import { ImageValidator } from "./validator.js";
import { ImageExporter } from "./exporter.js";

export const BatchItemStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
};

export class BatchProcessingManager {
  constructor(options = {}) {
    this.concurrencyLimit =
      options.concurrencyLimit ||
      ImageConfig.featureFlags.maxWorkerConcurrency ||
      4;
    this.queue = []; // Array of BatchItem
    this.activeWorkerCount = 0;
    this.isProcessing = false;
    this.isCanceled = false;
    this.listeners = new Set();
  }

  /**
   * Set max concurrent workers (1 to 8)
   * @param {number} limit
   */
  setConcurrencyLimit(limit) {
    const parsed = parseInt(limit, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
      this.concurrencyLimit = parsed;
      this.notify();
    }
  }

  /**
   * Add image files to batch queue with duplicate detection and validation
   * @param {File[]|Blob[]} files
   * @param {Object} [options] { allowDuplicates: false }
   * @returns {Object[]} Array of created BatchItems
   */
  addFiles(files, options = {}) {
    if (!Array.isArray(files)) files = [files];
    const allowDuplicates = options.allowDuplicates ?? false;

    const addedItems = [];

    files.forEach((file) => {
      const fileName = file.name || "unnamed_image.png";
      const fileSize = file.size || 0;

      // Duplicate detection
      if (!allowDuplicates) {
        const isDuplicate = this.queue.some(
          (item) => item.name === fileName && item.size === fileSize,
        );
        if (isDuplicate) {
          return;
        }
      }

      // Create preview object URL safely
      let previewUrl = null;
      try {
        if (file instanceof Blob || file instanceof File) {
          previewUrl = URL.createObjectURL(file);
        }
      } catch (e) {}

      // Initial validation check
      const validation = ImageValidator.validateFileType(file);
      const isInvalid = !validation.isValid;

      const newItem = {
        id: ImageUtils.generateId("batch_item"),
        file,
        name: fileName,
        size: fileSize,
        formattedSize: ImageUtils.formatFileSize(fileSize),
        type: file.type || "image/unknown",
        previewUrl,
        status: isInvalid ? BatchItemStatus.FAILED : BatchItemStatus.PENDING,
        progress: 0,
        resultBlob: null,
        resultDataUrl: null,
        outputSize: 0,
        formattedOutputSize: "0 B",
        outputFilename: fileName,
        error: isInvalid ? validation.error : null,
      };

      this.queue.push(newItem);
      addedItems.push(newItem);
    });

    this.notify();
    return addedItems;
  }

  /**
   * Reorder items in queue
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  reorderItems(fromIndex, toIndex) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [movedItem] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, movedItem);
    this.notify();
  }

  /**
   * Move item up by 1 position
   * @param {string} id
   */
  moveItemUp(id) {
    const idx = this.queue.findIndex((item) => item.id === id);
    if (idx > 0) {
      this.reorderItems(idx, idx - 1);
    }
  }

  /**
   * Move item down by 1 position
   * @param {string} id
   */
  moveItemDown(id) {
    const idx = this.queue.findIndex((item) => item.id === id);
    if (idx >= 0 && idx < this.queue.length - 1) {
      this.reorderItems(idx, idx + 1);
    }
  }

  /**
   * Remove item from queue by ID and free memory
   * @param {string} id
   */
  removeItem(id) {
    const target = this.queue.find((item) => item.id === id);
    if (target) {
      this._freeItemResources(target);
      this.queue = this.queue.filter((item) => item.id !== id);
      this.notify();
    }
  }

  /**
   * Retry single failed/canceled item
   * @param {string} id
   */
  retryItem(id) {
    const item = this.queue.find((i) => i.id === id);
    if (
      item &&
      (item.status === BatchItemStatus.FAILED ||
        item.status === BatchItemStatus.CANCELED)
    ) {
      item.status = BatchItemStatus.PENDING;
      item.progress = 0;
      item.error = null;
      this.notify();
    }
  }

  /**
   * Cancel single pending item
   * @param {string} id
   */
  cancelItem(id) {
    const item = this.queue.find((i) => i.id === id);
    if (item && item.status === BatchItemStatus.PENDING) {
      item.status = BatchItemStatus.CANCELED;
      this.notify();
    }
  }

  /**
   * Clear whole batch queue and clean up memory
   */
  clear() {
    this.queue.forEach((item) => this._freeItemResources(item));
    this.queue = [];
    this.activeWorkerCount = 0;
    this.isProcessing = false;
    this.isCanceled = false;
    this.notify();
  }

  /**
   * Helper to revoke object URLs
   * @private
   */
  _freeItemResources(item) {
    if (!item) return;
    if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch (e) {}
      item.previewUrl = null;
    }
  }

  /**
   * Start processing batch items with itemProcessor callback function
   * @param {Function} itemProcessorFn async (file, item) => { blob, dataUrl, filename, metadata }
   */
  async processBatch(itemProcessorFn) {
    if (typeof itemProcessorFn !== "function") {
      throw new Error("itemProcessorFn must be a valid function.");
    }

    this.isProcessing = true;
    this.isCanceled = false;
    GlobalImageEventBus.emit(ImageEngineEvents.PROCESSING_START, {
      totalItems: this.queue.length,
    });

    const pendingItems = this.queue.filter(
      (item) => item.status === BatchItemStatus.PENDING,
    );

    if (pendingItems.length === 0) {
      this.isProcessing = false;
      this.notify();
      return this.queue;
    }

    const worker = async () => {
      while (pendingItems.length > 0 && !this.isCanceled) {
        const item = pendingItems.shift();
        if (!item || item.status === BatchItemStatus.CANCELED) continue;

        item.status = BatchItemStatus.PROCESSING;
        item.progress = 15;
        this.notify();

        try {
          const result = await itemProcessorFn(item.file, item);
          item.status = BatchItemStatus.COMPLETED;
          item.progress = 100;
          item.resultBlob = result.blob || null;
          item.resultDataUrl = result.dataUrl || null;
          item.outputFilename = result.filename || item.name;
          item.outputSize = result.blob ? result.blob.size : 0;
          item.formattedOutputSize = ImageUtils.formatFileSize(item.outputSize);
          item.metadata = result.metadata || null;
        } catch (err) {
          item.status = BatchItemStatus.FAILED;
          item.error = err?.message || "Processing failed.";
          item.progress = 0;
        }

        this.notify();
      }
    };

    const workerPromises = [];
    const concurrency = Math.min(
      this.concurrencyLimit,
      pendingItems.length || 1,
    );

    for (let i = 0; i < concurrency; i++) {
      workerPromises.push(worker());
    }

    await Promise.all(workerPromises);

    this.isProcessing = false;

    GlobalImageEventBus.emit(ImageEngineEvents.PROCESSING_COMPLETE, {
      total: this.queue.length,
      completed: this.getCompletedItems().length,
      failed: this.getFailedItems().length,
    });

    this.notify();
    return this.queue;
  }

  /**
   * Cancel active batch processing
   */
  cancel() {
    this.isCanceled = true;
    this.isProcessing = false;
    this.queue.forEach((item) => {
      if (
        item.status === BatchItemStatus.PENDING ||
        item.status === BatchItemStatus.PROCESSING
      ) {
        item.status = BatchItemStatus.CANCELED;
      }
    });
    this.notify();
  }

  getCompletedItems() {
    return this.queue.filter((i) => i.status === BatchItemStatus.COMPLETED);
  }

  getFailedItems() {
    return this.queue.filter((i) => i.status === BatchItemStatus.FAILED);
  }

  getPendingItems() {
    return this.queue.filter((i) => i.status === BatchItemStatus.PENDING);
  }

  getOverallProgress() {
    if (this.queue.length === 0) return 0;
    const totalProgress = this.queue.reduce(
      (acc, item) => acc + (item.progress || 0),
      0,
    );
    return Math.round(totalProgress / this.queue.length);
  }

  /**
   * Calculate summary metrics for completed items
   */
  getStatsSummary() {
    const totalOriginalSize = this.queue.reduce(
      (acc, item) => acc + (item.size || 0),
      0,
    );
    const completedItems = this.getCompletedItems();
    const totalOutputSize = completedItems.reduce(
      (acc, item) => acc + (item.outputSize || 0),
      0,
    );
    const completedOriginalSize = completedItems.reduce(
      (acc, item) => acc + (item.size || 0),
      0,
    );

    const bytesSaved = Math.max(0, completedOriginalSize - totalOutputSize);
    const percentSaved =
      completedOriginalSize > 0
        ? Math.round((bytesSaved / completedOriginalSize) * 100)
        : 0;

    return {
      totalCount: this.queue.length,
      completedCount: completedItems.length,
      failedCount: this.getFailedItems().length,
      pendingCount: this.getPendingItems().length,
      totalOriginalSize,
      formattedTotalOriginalSize: ImageUtils.formatFileSize(totalOriginalSize),
      totalOutputSize,
      formattedTotalOutputSize: ImageUtils.formatFileSize(totalOutputSize),
      bytesSaved,
      formattedBytesSaved: ImageUtils.formatFileSize(bytesSaved),
      percentSaved,
    };
  }

  /**
   * Export all completed items into a single ZIP file and trigger browser download
   * @param {string} [zipFilename='comprexa_images.zip']
   * @returns {Promise<Blob>}
   */
  async downloadAsZip(zipFilename = "comprexa_batch_processed.zip") {
    const completed = this.getCompletedItems();
    if (completed.length === 0) {
      throw new Error("No completed images available to bundle in ZIP.");
    }

    const zip = new JSZip();
    const usedNames = new Set();

    completed.forEach((item) => {
      if (item.resultBlob) {
        let name = item.outputFilename || item.name || "image.jpg";

        // Prevent name collisions in zip
        if (usedNames.has(name)) {
          const parts = name.split(".");
          const ext = parts.length > 1 ? parts.pop() : "";
          const base = parts.join(".");
          name = `${base}_${ImageUtils.generateId()}.${ext}`;
        }
        usedNames.add(name);

        zip.file(name, item.resultBlob);
      }
    });

    const zipContent = await zip.generateAsync({ type: "blob" });
    ImageExporter.downloadImage(zipContent, zipFilename);
    return zipContent;
  }

  subscribe(cb) {
    if (typeof cb === "function") this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    const summary = {
      queue: this.queue,
      isProcessing: this.isProcessing,
      isCanceled: this.isCanceled,
      overallProgress: this.getOverallProgress(),
      concurrencyLimit: this.concurrencyLimit,
      stats: this.getStatsSummary(),
    };

    this.listeners.forEach((cb) => {
      try {
        cb(summary);
      } catch (e) {
        console.error("Error in BatchProcessingManager subscriber:", e);
      }
    });
  }
}

export const GlobalBatchProcessingManager = new BatchProcessingManager();
