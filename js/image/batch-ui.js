// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Reusable Batch UI Component
 * Modular, accessible UI for multi-file upload, queue management, progress tracking, and batch export.
 */

import { BatchItemStatus, GlobalBatchProcessingManager } from "./batch.js";
import { ImageUtils } from "./utils.js";

export class ComprexaBatchUI {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - DOM container element or selector
   * @param {BatchProcessingManager} [options.batchManager] - Custom or global batch manager instance
   * @param {Function} [options.itemProcessor] - Async function (file, item) => { blob, filename, metadata }
   * @param {string} [options.zipFilename='comprexa_batch_processed.zip'] - Default output ZIP name
   * @param {string} [options.title='Batch Image Queue']
   * @param {string} [options.subtitle='Drag & drop multiple images or click browse to add to queue']
   * @param {Function} [options.onQueueChange] - Callback on queue updates
   * @param {Function} [options.onBatchComplete] - Callback on batch finish
   */
  constructor(options = {}) {
    this.options = {
      zipFilename: "comprexa_batch_processed.zip",
      title: "Batch Image Processing Queue",
      subtitle:
        "Upload multiple images to process, convert, compress, or edit them in bulk.",
      ...options,
    };

    this.container =
      typeof this.options.container === "string"
        ? document.querySelector(this.options.container)
        : this.options.container;

    this.batchManager =
      this.options.batchManager || GlobalBatchProcessingManager;
    this.itemProcessor = this.options.itemProcessor || null;
    this.unsubscribe = null;

    if (this.container) {
      this.init();
    }
  }

  /**
   * Initialize component DOM and subscribe to batch state
   */
  init() {
    if (!this.container) return;

    this.renderSkeleton();
    this.bindEvents();

    // Subscribe to batch state updates
    this.unsubscribe = this.batchManager.subscribe((summary) => {
      this.renderQueue(summary);
      if (typeof this.options.onQueueChange === "function") {
        this.options.onQueueChange(summary);
      }
    });

    // Initial render with current manager state
    this.renderQueue({
      queue: this.batchManager.queue,
      isProcessing: this.batchManager.isProcessing,
      overallProgress: this.batchManager.getOverallProgress(),
      concurrencyLimit: this.batchManager.concurrencyLimit,
      stats: this.batchManager.getStatsSummary(),
    });
  }

  /**
   * Render base structural template
   */
  renderSkeleton() {
    this.container.classList.add("batch-ui-root");
    this.container.innerHTML = `
      <section class="batch-ui-card" aria-label="Batch Image Processing System">
        <!-- Header -->
        <header class="batch-ui-header">
          <div>
            <h3 class="batch-ui-title">${ImageUtils.escapeHtml(this.options.title)}</h3>
            <p class="batch-ui-subtitle">${ImageUtils.escapeHtml(this.options.subtitle)}</p>
          </div>
          <div class="batch-ui-concurrency-box">
            <label for="batch-concurrency-select" class="batch-ui-label">Processing Speed:</label>
            <select id="batch-concurrency-select" class="batch-ui-select" title="Worker Concurrency Level">
              <option value="1">1 Worker (Sequential)</option>
              <option value="2">2 Workers (Parallel)</option>
              <option value="4" selected>4 Workers (Fast)</option>
              <option value="8">8 Workers (Ultra)</option>
            </select>
          </div>
        </header>

        <!-- Dropzone -->
        <div class="batch-dropzone" id="batch-dropzone" tabIndex="0" role="region" aria-label="Drag and drop multiple images here">
          <input type="file" id="batch-file-input" class="batch-file-input" multiple accept="image/*" style="display:none" />
          <div class="batch-dropzone-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div class="batch-dropzone-text">
            <strong>Drag & Drop Multiple Images Here</strong>
            <span>or click to browse files from your device</span>
          </div>
          <div class="batch-dropzone-badges">
            <span class="batch-badge">JPG, PNG, WEBP, AVIF, HEIC</span>
            <span class="batch-badge">Multiple Selection Supported</span>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="batch-toolbar" id="batch-toolbar" style="display: none;">
          <div class="batch-toolbar-info">
            <span class="batch-queue-count" id="batch-queue-count">0 items in queue</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="batch-add-more-btn">
              + Add More Files
            </button>
            <button type="button" class="btn btn-ghost btn-sm text-danger" id="batch-clear-btn">
              Clear Queue
            </button>
            <button type="button" class="btn btn-primary" id="batch-start-btn">
              Start Batch Processing
            </button>
            <button type="button" class="btn btn-danger" id="batch-cancel-btn" style="display:none;">
              Cancel Processing
            </button>
          </div>
        </div>

        <!-- Overall Progress Box -->
        <div class="batch-progress-box" id="batch-progress-box" style="display: none;" aria-live="polite">
          <div class="batch-progress-header">
            <span id="batch-progress-status">Processing batch queue...</span>
            <strong id="batch-progress-percent">0%</strong>
          </div>
          <div class="batch-progress-track">
            <div class="batch-progress-bar" id="batch-progress-bar" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Queue List -->
        <div class="batch-queue-container" id="batch-queue-container" style="display: none;">
          <ul class="batch-queue-list" id="batch-queue-list" role="list"></ul>
        </div>

        <!-- Results & Summary Panel -->
        <div class="batch-summary-panel" id="batch-summary-panel" style="display: none;">
          <div class="batch-summary-grid">
            <div class="batch-stat-card">
              <span class="batch-stat-label">Processed</span>
              <strong class="batch-stat-value text-success" id="batch-stat-success">0</strong>
            </div>
            <div class="batch-stat-card">
              <span class="batch-stat-label">Failed</span>
              <strong class="batch-stat-value text-danger" id="batch-stat-failed">0</strong>
            </div>
            <div class="batch-stat-card">
              <span class="batch-stat-label">Original Total Size</span>
              <strong class="batch-stat-value" id="batch-stat-original">0 MB</strong>
            </div>
            <div class="batch-stat-card">
              <span class="batch-stat-label">Output Total Size</span>
              <strong class="batch-stat-value" id="batch-stat-output">0 MB</strong>
            </div>
            <div class="batch-stat-card highlight">
              <span class="batch-stat-label">Space Saved</span>
              <strong class="batch-stat-value text-primary" id="batch-stat-saved">0 MB (0%)</strong>
            </div>
          </div>

          <div class="batch-summary-actions">
            <button type="button" class="btn btn-primary btn-lg" id="batch-download-zip-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download All as ZIP
            </button>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Bind event listeners for UI controls
   */
  bindEvents() {
    const dropzone = this.container.querySelector("#batch-dropzone");
    const fileInput = this.container.querySelector("#batch-file-input");
    const addMoreBtn = this.container.querySelector("#batch-add-more-btn");
    const startBtn = this.container.querySelector("#batch-start-btn");
    const cancelBtn = this.container.querySelector("#batch-cancel-btn");
    const clearBtn = this.container.querySelector("#batch-clear-btn");
    const downloadZipBtn = this.container.querySelector(
      "#batch-download-zip-btn",
    );
    const concurrencySelect = this.container.querySelector(
      "#batch-concurrency-select",
    );

    // Click dropzone to browse
    dropzone?.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") {
        fileInput.click();
      }
    });

    addMoreBtn?.addEventListener("click", () => fileInput.click());

    // File input selection
    fileInput?.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.batchManager.addFiles(files);
        fileInput.value = "";
      }
    });

    // Drag & Drop handlers
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("drag-over");
      });
    });

    dropzone?.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) {
        this.batchManager.addFiles(files);
      }
    });

    // Concurrency selector change
    concurrencySelect?.addEventListener("change", (e) => {
      this.batchManager.setConcurrencyLimit(e.target.value);
    });

    // Clear Queue
    clearBtn?.addEventListener("click", () => {
      this.batchManager.clear();
    });

    // Start Batch Processing
    startBtn?.addEventListener("click", () => {
      this.startProcessing();
    });

    // Cancel Processing
    cancelBtn?.addEventListener("click", () => {
      this.batchManager.cancel();
    });

    // Download ZIP
    downloadZipBtn?.addEventListener("click", async () => {
      try {
        downloadZipBtn.disabled = true;
        downloadZipBtn.innerText = "Compressing ZIP...";
        await this.batchManager.downloadAsZip(this.options.zipFilename);
      } catch (err) {
        if (window.ComprexaToast)
          window.ComprexaToast.error(
            err.message || "Failed to generate ZIP archive.",
          );
      } finally {
        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download All as ZIP
        `;
      }
    });

    // Event delegation for queue item action buttons
    const queueList = this.container.querySelector("#batch-queue-list");
    queueList?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-batch-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-batch-action");
      const id = btn.getAttribute("data-item-id");

      if (action === "remove") {
        this.batchManager.removeItem(id);
      } else if (action === "retry") {
        this.batchManager.retryItem(id);
      } else if (action === "move-up") {
        this.batchManager.moveItemUp(id);
      } else if (action === "move-down") {
        this.batchManager.moveItemDown(id);
      } else if (action === "download-item") {
        const item = this.batchManager.queue.find((i) => i.id === id);
        if (item && item.resultBlob) {
          const url = URL.createObjectURL(item.resultBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(item.outputFilename || item.name) : String(item.outputFilename || item.name).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      }
    });
  }

  /**
   * Set dynamic item processor function
   * @param {Function} processorFn async (file, item) => { blob, filename, metadata }
   */
  setItemProcessor(processorFn) {
    this.itemProcessor = processorFn;
  }

  /**
   * Trigger batch execution
   */
  async startProcessing() {
    if (!this.itemProcessor || typeof this.itemProcessor !== "function") {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Batch processor function is not configured for this tool.",
        );
      return;
    }

    try {
      if (typeof this.options.onBatchStart === "function") {
        this.options.onBatchStart();
      }

      const results = await this.batchManager.processBatch(this.itemProcessor);

      if (typeof this.options.onBatchComplete === "function") {
        this.options.onBatchComplete({
          results,
          stats: this.batchManager.getStatsSummary(),
        });
      }
    } catch (err) {
      console.error("Batch processing error:", err);
    }
  }

  /**
   * Render updated queue state
   * @param {Object} summary
   */
  renderQueue(summary) {
    const { queue, isProcessing, overallProgress, stats } = summary;

    const toolbar = this.container.querySelector("#batch-toolbar");
    const queueContainer = this.container.querySelector(
      "#batch-queue-container",
    );
    const queueList = this.container.querySelector("#batch-queue-list");
    const queueCount = this.container.querySelector("#batch-queue-count");
    const progressBox = this.container.querySelector("#batch-progress-box");
    const progressBar = this.container.querySelector("#batch-progress-bar");
    const progressPercent = this.container.querySelector(
      "#batch-progress-percent",
    );
    const progressStatus = this.container.querySelector(
      "#batch-progress-status",
    );
    const startBtn = this.container.querySelector("#batch-start-btn");
    const cancelBtn = this.container.querySelector("#batch-cancel-btn");
    const summaryPanel = this.container.querySelector("#batch-summary-panel");

    const totalCount = queue.length;

    // Toggle visibility of queue & toolbar
    if (totalCount > 0) {
      toolbar.style.display = "flex";
      queueContainer.style.display = "block";
      queueCount.innerText = `${totalCount} file${totalCount === 1 ? "" : "s"} in queue`;
    } else {
      toolbar.style.display = "none";
      queueContainer.style.display = "none";
      summaryPanel.style.display = "none";
      progressBox.style.display = "none";
      return;
    }

    // Processing buttons state
    if (isProcessing) {
      startBtn.style.display = "none";
      cancelBtn.style.display = "inline-flex";
      progressBox.style.display = "block";
      progressBar.style.width = `${overallProgress}%`;
      progressPercent.innerText = `${overallProgress}%`;
      progressStatus.innerText = `Processing batch (${stats.completedCount + stats.failedCount} / ${totalCount} completed)...`;
    } else {
      startBtn.style.display = "inline-flex";
      cancelBtn.style.display = "none";
      if (stats.completedCount > 0 || stats.failedCount > 0) {
        progressBox.style.display = "block";
        progressBar.style.width = `100%`;
        progressPercent.innerText = `100%`;
        progressStatus.innerText = `Batch finished. ${stats.completedCount} succeeded, ${stats.failedCount} failed.`;
      } else {
        progressBox.style.display = "none";
      }
    }

    // Render Queue Items
    queueList.innerHTML = queue
      .map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === totalCount - 1;

        let statusBadgeClass = "badge-pending";
        let statusText = "Pending";

        if (item.status === BatchItemStatus.PROCESSING) {
          statusBadgeClass = "badge-processing";
          statusText = "Processing...";
        } else if (item.status === BatchItemStatus.COMPLETED) {
          statusBadgeClass = "badge-success";
          statusText = "Completed";
        } else if (item.status === BatchItemStatus.FAILED) {
          statusBadgeClass = "badge-danger";
          statusText = "Failed";
        } else if (item.status === BatchItemStatus.CANCELED) {
          statusBadgeClass = "badge-warning";
          statusText = "Canceled";
        }

        return `
        <li class="batch-queue-item ${item.status === BatchItemStatus.PROCESSING ? "active-processing" : ""}" data-item-id="${item.id}">
          <!-- Reorder Handles -->
          <div class="batch-item-reorder">
            <button type="button" class="btn-icon-xs" data-batch-action="move-up" data-item-id="${item.id}" ${isFirst || isProcessing ? "disabled" : ""} title="Move Up">
              ▲
            </button>
            <button type="button" class="btn-icon-xs" data-batch-action="move-down" data-item-id="${item.id}" ${isLast || isProcessing ? "disabled" : ""} title="Move Down">
              ▼
            </button>
          </div>

          <!-- Thumbnail -->
          <div class="batch-item-thumb">
            ${item.previewUrl ? `<img src="${item.previewUrl}" alt="${ImageUtils.escapeHtml(item.name)}" />` : '<div class="thumb-placeholder">IMG</div>'}
          </div>

          <!-- Meta Info -->
          <div class="batch-item-info">
            <div class="batch-item-filename" title="${ImageUtils.escapeHtml(item.name)}">
              ${ImageUtils.escapeHtml(item.name)}
            </div>
            <div class="batch-item-specs">
              <span>Original: ${item.formattedSize}</span>
              ${item.outputSize > 0 ? `<span class="text-success">• Output: ${item.formattedOutputSize}</span>` : ""}
            </div>
            ${item.error ? `<div class="batch-item-error text-danger">${ImageUtils.escapeHtml(item.error)}</div>` : ""}
          </div>

          <!-- Status Badge & Item Progress -->
          <div class="batch-item-status-box">
            <span class="batch-status-badge ${statusBadgeClass}">${statusText}</span>
            ${
              item.status === BatchItemStatus.PROCESSING
                ? `
              <div class="batch-item-progress-track">
                <div class="batch-item-progress-bar" style="width: ${item.progress || 20}%"></div>
              </div>
            `
                : ""
            }
          </div>

          <!-- Individual Item Actions -->
          <div class="batch-item-actions">
            ${
              item.status === BatchItemStatus.COMPLETED
                ? `
              <button type="button" class="btn btn-secondary btn-xs" data-batch-action="download-item" data-item-id="${item.id}" title="Download Processed Image">
                Download
              </button>
            `
                : ""
            }

            ${
              item.status === BatchItemStatus.FAILED ||
              item.status === BatchItemStatus.CANCELED
                ? `
              <button type="button" class="btn btn-warning btn-xs" data-batch-action="retry" data-item-id="${item.id}" title="Retry File">
                Retry
              </button>
            `
                : ""
            }

            <button type="button" class="btn-icon-sm text-muted hover-danger" data-batch-action="remove" data-item-id="${item.id}" ${isProcessing ? "disabled" : ""} title="Remove file from queue">
              ✕
            </button>
          </div>
        </li>
      `;
      })
      .join("");

    // Summary Panel Render
    if (stats.completedCount > 0 || stats.failedCount > 0) {
      summaryPanel.style.display = "block";
      this.container.querySelector("#batch-stat-success").innerText =
        `${stats.completedCount} / ${stats.totalCount}`;
      this.container.querySelector("#batch-stat-failed").innerText =
        `${stats.failedCount}`;
      this.container.querySelector("#batch-stat-original").innerText =
        stats.formattedTotalOriginalSize;
      this.container.querySelector("#batch-stat-output").innerText =
        stats.formattedTotalOutputSize;
      this.container.querySelector("#batch-stat-saved").innerText =
        `${stats.formattedBytesSaved} (${stats.percentSaved}% saved)`;
    } else {
      summaryPanel.style.display = "none";
    }
  }

  /**
   * Destroy component and cleanup listeners
   */
  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}
