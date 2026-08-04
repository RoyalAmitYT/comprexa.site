// @ts-nocheck
/**
 * Comprexa Merge PDF Engine & UI Controller
 * Production-ready, client-side PDF merging module using PDF-Lib.
 * Completely rebuilt from scratch.
 */

// Safe Toast Helper
function showMergeToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Core PDF Processing Engine
 */
class MergePdfEngine {
  /**
   * Format file size in human-readable bytes
   */
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Validate file candidate
   */
  static validateFile(file, existingFiles = []) {
    if (!file) {
      return { valid: false, error: "No file selected." };
    }

    if (file.size === 0) {
      return { valid: false, error: `File "${file.name}" is empty (0 bytes).` };
    }

    const name = file.name || "";
    const isPdfExt = name.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf" || file.type === "";

    if (!isPdfExt && !isPdfMime) {
      return { valid: false, error: `"${file.name}" is not a valid PDF file.` };
    }

    // Check duplicate
    const isDuplicate = existingFiles.some(
      (item) => item.file.name === file.name && item.file.size === file.size,
    );

    if (isDuplicate) {
      return {
        valid: false,
        isDuplicate: true,
        error: `"${file.name}" is already in your merge list.`,
      };
    }

    return { valid: true };
  }

  /**
   * Perform client-side PDF merge
   * @param {File[]} fileList Array of File objects
   * @param {Object} options Options including outputFilename
   * @param {Function} progressCallback Progress reporter
   */
  async merge(fileList, options = {}, progressCallback = null) {
    if (!fileList || fileList.length < 2) {
      throw new Error("At least 2 PDF files are required to merge.");
    }

    if (!window.PDFLib) {
      throw new Error(
        "PDF processing library (PDF-Lib) is not loaded. Please refresh the page and try again.",
      );
    }

    const { PDFDocument } = window.PDFLib;
    const mergedPdf = await PDFDocument.create();
    let totalPagesMerged = 0;
    const totalFiles = fileList.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = fileList[i];
      if (progressCallback) {
        const percent = Math.round(((i + 0.2) / totalFiles) * 100);
        progressCallback(
          percent,
          `Processing file ${i + 1} of ${totalFiles}: ${file.name}`,
        );
      }

      const arrayBuffer = await file.arrayBuffer();

      // Simple header check
      const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
      const headerStr = String.fromCharCode.apply(null, headerBytes);
      if (headerStr !== "%PDF-") {
        throw new Error(
          `"${file.name}" does not appear to be a valid, uncorrupted PDF document.`,
        );
      }

      let sourceDoc;
      try {
        sourceDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
      } catch (err) {
        throw new Error(
          `Failed to parse "${file.name}". The document may be password-protected or corrupted.`,
        );
      }

      if (sourceDoc.isEncrypted) {
        throw new Error(
          `"${file.name}" is password-protected. Please remove password protection before merging.`,
        );
      }

      const pageIndices = sourceDoc.getPageIndices();
      const pageCount = pageIndices.length;

      if (pageCount === 0) {
        throw new Error(`"${file.name}" contains no readable pages.`);
      }

      const copiedPages = await mergedPdf.copyPages(sourceDoc, pageIndices);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      totalPagesMerged += pageCount;

      if (progressCallback) {
        const percent = Math.round(((i + 1) / totalFiles) * 100);
        progressCallback(percent, `Added ${pageCount} pages from ${file.name}`);
      }
    }

    if (progressCallback) {
      progressCallback(95, "Generating finalized PDF file...");
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);

    let cleanFilename = options.outputFilename
      ? options.outputFilename.trim()
      : "merged-document.pdf";
    if (!cleanFilename.toLowerCase().endsWith(".pdf")) {
      cleanFilename += ".pdf";
    }

    if (progressCallback) {
      progressCallback(100, "Merge completed successfully!");
    }

    return {
      blob,
      url: downloadUrl,
      filename: cleanFilename,
      totalPages: totalPagesMerged,
      fileCount: totalFiles,
      totalSizeBytes: mergedPdfBytes.byteLength,
      totalSizeFormatted: MergePdfEngine.formatBytes(mergedPdfBytes.byteLength),
    };
  }
}

/**
 * UI Controller for Merge PDF Workspace
 */
class MergePdfUI {
  constructor() {
    this.engine = new MergePdfEngine();
    this.files = []; // [{ id, file, name, size }]
    this.draggedIndex = null;
    this.currentBlobUrl = null;

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & Inputs
    this.dropzoneEl = document.getElementById("merge-dropzone");
    this.fileInputEl = document.getElementById("merge-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("merge-upload-section");
    this.listSectionEl = document.getElementById("merge-list-section");
    this.minNoticeEl = document.getElementById("merge-min-notice");
    this.optionsSectionEl = document.getElementById("merge-options-section");
    this.processingStateEl = document.getElementById("merge-processing-state");
    this.resultSectionEl = document.getElementById("merge-result-section");

    // Container & Badges
    this.filesContainerEl = document.getElementById("merge-files-container");
    this.countBadgeEl = document.getElementById("merge-files-count-badge");
    this.outputFilenameInput = document.getElementById("output-filename-input");

    // Buttons
    this.btnAddMoreTrigger = document.getElementById("btn-add-more-trigger");
    this.btnClearAll = document.getElementById("btn-clear-all");
    this.btnExecuteMerge = document.getElementById("btn-execute-merge");
    this.btnDownloadMerged = document.getElementById("btn-download-merged");
    this.btnStartOver = document.getElementById("btn-merge-start-over");

    // Status / Progress / Result displays
    this.statusTitleEl = document.getElementById("merge-status-title");
    this.statusDescEl = document.getElementById("merge-status-desc");
    this.progressFillEl = document.getElementById("merge-progress-fill");
    this.resultFilenameDisplay = document.getElementById(
      "result-filename-display",
    );
    this.resultMetaDisplay = document.getElementById("result-meta-display");
    this.resultSummaryEl = document.getElementById("merge-result-summary");
  }

  init() {
    if (!this.dropzoneEl || !this.fileInputEl) {
      return;
    }

    this.bindEvents();
    this.renderList();
  }

  bindEvents() {
    // Browse Files button handler
    const chooseBtn = this.dropzoneEl.querySelector(
      ".file-uploader__choose-btn",
    );
    if (chooseBtn) {
      chooseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.fileInputEl.click();
      });
    }

    // Dropzone File Selector Click
    this.dropzoneEl.addEventListener("click", (e) => {
      if (e.target === this.fileInputEl) return;
      this.fileInputEl.click();
    });

    // File Input Selection
    this.fileInputEl.addEventListener("change", (e) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length > 0) {
        this.addFiles(selected);
      }
      this.fileInputEl.value = ""; // reset so same file can be re-selected if needed
    });

    // Drag & Drop on Dropzone
    ["dragenter", "dragover"].forEach((eventName) => {
      this.dropzoneEl.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzoneEl.classList.add("file-uploader__dropzone--active");
        },
        false,
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.dropzoneEl.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzoneEl.classList.remove("file-uploader__dropzone--active");
        },
        false,
      );
    });

    this.dropzoneEl.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const droppedFiles = Array.from(dt.files || []);
      if (droppedFiles.length > 0) {
        this.addFiles(droppedFiles);
      }
    });

    // Add More PDFs trigger
    if (this.btnAddMoreTrigger) {
      this.btnAddMoreTrigger.addEventListener("click", () => {
        this.fileInputEl.click();
      });
    }

    // Clear All
    if (this.btnClearAll) {
      this.btnClearAll.addEventListener("click", () => {
        this.clearAllFiles();
      });
    }

    // Execute Merge Button
    if (this.btnExecuteMerge) {
      this.btnExecuteMerge.addEventListener("click", () => {
        this.executeMerge();
      });
    }

    // Start Over Button
    if (this.btnStartOver) {
      this.btnStartOver.addEventListener("click", () => {
        this.resetView();
      });
    }
  }

  /**
   * Add new PDF files (Always APPENDS, never replaces)
   */
  addFiles(incomingFiles) {
    if (!incomingFiles || incomingFiles.length === 0) return;

    let addedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    incomingFiles.forEach((file) => {
      const validation = MergePdfEngine.validateFile(file, this.files);
      if (!validation.valid) {
        if (validation.isDuplicate) {
          duplicateCount++;
        } else {
          invalidCount++;
          showMergeToast(validation.error, "error", "Invalid File");
        }
        return;
      }

      this.files.push({
        id: "pdf_" + Math.random().toString(36).substring(2, 9),
        file: file,
        name: file.name,
        size: file.size,
        formattedSize: MergePdfEngine.formatBytes(file.size),
      });

      addedCount++;
    });

    if (addedCount > 0) {
      showMergeToast(
        `Added ${addedCount} PDF ${addedCount === 1 ? "file" : "files"} to merge list.`,
        "success",
        "PDFs Added",
      );
    }

    if (duplicateCount > 0 && addedCount === 0) {
      showMergeToast(
        "Duplicate files were skipped.",
        "warning",
        "Duplicate Skipped",
      );
    }

    this.renderList();
  }

  /**
   * Move item up in order
   */
  moveUp(index) {
    if (index <= 0) return;
    const temp = this.files[index];
    this.files[index] = this.files[index - 1];
    this.files[index - 1] = temp;
    this.renderList();
  }

  /**
   * Move item down in order
   */
  moveDown(index) {
    if (index >= this.files.length - 1) return;
    const temp = this.files[index];
    this.files[index] = this.files[index + 1];
    this.files[index + 1] = temp;
    this.renderList();
  }

  /**
   * Remove single file item
   */
  removeFile(index) {
    if (index < 0 || index >= this.files.length) return;
    const removed = this.files.splice(index, 1)[0];
    if (removed) {
      showMergeToast(`Removed "${removed.name}"`, "info", "File Removed");
    }
    this.renderList();
  }

  /**
   * Clear all files
   */
  clearAllFiles() {
    if (this.files.length === 0) return;
    this.files = [];
    showMergeToast("All uploaded PDFs cleared.", "info", "Cleared");
    this.renderList();
  }

  /**
   * Render file list & update step visibility
   */
  renderList() {
    const fileCount = this.files.length;

    // Update count badge
    if (this.countBadgeEl) {
      this.countBadgeEl.textContent = `${fileCount} ${fileCount === 1 ? "file" : "files"}`;
    }

    // Toggle list section visibility
    if (fileCount === 0) {
      this.listSectionEl.style.display = "none";
      this.minNoticeEl.style.display = "none";
      this.optionsSectionEl.style.display = "none";
      this.filesContainerEl.innerHTML = "";
      return;
    }

    this.listSectionEl.style.display = "block";

    // Render File Cards
    this.filesContainerEl.innerHTML = this.files
      .map(
        (item, index) => `
      <div class="card file-card-item" 
           data-index="${index}" 
           draggable="true"
           style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface); transition: transform 0.15s ease, box-shadow 0.15s ease;">
        
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
          <!-- Drag Handle -->
          <div class="drag-handle" style="cursor: grab; color: var(--text-muted); display: flex; align-items: center;" title="Drag to reorder">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>

          <!-- Order Badge -->
          <span class="badge badge--pill" style="font-weight: 700; font-size: 0.75rem; min-width: 24px; text-align: center;">${index + 1}</span>

          <!-- PDF Icon -->
          <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>

          <!-- File Info -->
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.escapeHtml(item.name)}">
              ${this.escapeHtml(item.name)}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1px;">
              ${item.formattedSize}
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; margin-left: 12px;">
          <button type="button" class="btn btn--icon btn--ghost btn--sm btn-move-up" data-index="${index}" ${index === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ""} title="Move Up">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          
          <button type="button" class="btn btn--icon btn--ghost btn--sm btn-move-down" data-index="${index}" ${index === fileCount - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ""} title="Move Down">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          <button type="button" class="btn btn--icon btn--ghost btn--danger btn--sm btn-remove-file" data-index="${index}" title="Remove file">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

      </div>
    `,
      )
      .join("");

    // Attach card event listeners
    this.bindCardEvents();

    // Minimum requirement logic: Require at least 2 files
    if (fileCount < 2) {
      this.minNoticeEl.style.display = "block";
      this.optionsSectionEl.style.display = "none";
    } else {
      this.minNoticeEl.style.display = "none";
      this.optionsSectionEl.style.display = "block";
    }
  }

  bindCardEvents() {
    const cards = this.filesContainerEl.querySelectorAll(".file-card-item");

    cards.forEach((card) => {
      const idx = parseInt(card.getAttribute("data-index"), 10);

      // Buttons
      const btnUp = card.querySelector(".btn-move-up");
      if (btnUp) btnUp.addEventListener("click", () => this.moveUp(idx));

      const btnDown = card.querySelector(".btn-move-down");
      if (btnDown) btnDown.addEventListener("click", () => this.moveDown(idx));

      const btnRemove = card.querySelector(".btn-remove-file");
      if (btnRemove)
        btnRemove.addEventListener("click", () => this.removeFile(idx));

      // Drag & drop card reordering
      card.addEventListener("dragstart", (e) => {
        this.draggedIndex = idx;
        e.dataTransfer.effectAllowed = "move";
        card.style.opacity = "0.5";
      });

      card.addEventListener("dragend", () => {
        this.draggedIndex = null;
        card.style.opacity = "1";
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        if (this.draggedIndex !== null && this.draggedIndex !== idx) {
          const draggedItem = this.files.splice(this.draggedIndex, 1)[0];
          this.files.splice(idx, 0, draggedItem);
          this.renderList();
        }
      });
    });
  }

  escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Execute PDF Merge Operation
   */
  async executeMerge() {
    if (this.files.length < 2) {
      showMergeToast(
        "Please add at least 2 PDF files to merge.",
        "warning",
        "Minimum 2 Files Required",
      );
      return;
    }

    // UI state: Processing
    this.uploadSectionEl.style.display = "none";
    this.listSectionEl.style.display = "none";
    this.minNoticeEl.style.display = "none";
    this.optionsSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Merging PDF Files...";
    this.statusDescEl.textContent = `Combining ${this.files.length} PDF documents safely in your browser...`;
    this.progressFillEl.style.width = "10%";

    try {
      const outputName = this.outputFilenameInput
        ? this.outputFilenameInput.value
        : "merged-document.pdf";
      const fileObjects = this.files.map((item) => item.file);

      const result = await this.engine.merge(
        fileObjects,
        { outputFilename: outputName },
        (percent, statusMsg) => {
          this.progressFillEl.style.width = `${percent}%`;
          if (statusMsg) this.statusDescEl.textContent = statusMsg;
        },
      );

      // Clean up previous blob URL if any
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = result.url;

      // Update Result UI
      if (this.resultFilenameDisplay)
        this.resultFilenameDisplay.textContent = result.filename;
      if (this.resultMetaDisplay) {
        this.resultMetaDisplay.textContent = `${result.totalSizeFormatted} • ${result.totalPages} total ${result.totalPages === 1 ? "page" : "pages"}`;
      }
      if (this.resultSummaryEl) {
        this.resultSummaryEl.textContent = `Successfully merged ${result.fileCount} PDF documents into ${result.totalPages} total pages.`;
      }

      if (this.btnDownloadMerged) {
        this.btnDownloadMerged.href = result.url;
        this.btnDownloadMerged.download = result.filename;
      }

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showMergeToast(
        "Your merged PDF is ready for download!",
        "success",
        "Merge Complete",
      );
    } catch (err) {
      console.error("Merge PDF Error:", err);
      this.processingStateEl.style.display = "none";

      // Restore UI for retry
      this.uploadSectionEl.style.display = "block";
      this.listSectionEl.style.display = "block";
      this.renderList();

      showMergeToast(
        err.message || "An unexpected error occurred while merging your PDFs.",
        "error",
        "Merge Failed",
      );
    }
  }

  /**
   * Reset view to merge more PDFs
   */
  resetView() {
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";
    this.uploadSectionEl.style.display = "block";
    this.listSectionEl.style.display = this.files.length > 0 ? "block" : "none";
    this.renderList();
  }
}

// Global Export & Auto-Initialization
window.MergePdfEngine = MergePdfEngine;
window.MergePdfUI = MergePdfUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new MergePdfUI();
  app.init();
  window.ComprexaMergePdfApp = app;
});
