// @ts-nocheck
/**
 * Comprexa - Delete PDF Pages Tool Controller
 * Production-ready, client-side PDF page deletion module.
 * Redesigned to fit Comprexa Universal Tool Page Standard.
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

// Helper Toast function
function showDeleteToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Processing Engine for Delete PDF Pages
 * Preserved Engine Logic
 */
class DeletePdfEngine {
  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static validateFile(file) {
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
    return { valid: true };
  }

  async loadPdfMetadata(file) {
    if (!window.PDFLib) {
      throw new Error(
        "PDF processing library (PDF-Lib) is not loaded. Please refresh the page.",
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { PDFDocument } = window.PDFLib;

    // Verify PDF Header
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    if (headerStr !== "%PDF-") {
      throw new Error(
        `"${file.name}" is not a valid, uncorrupted PDF document.`,
      );
    }

    let pdfLibDoc;
    try {
      pdfLibDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
    } catch (err) {
      throw new Error(
        `Failed to parse "${file.name}". The document may be password-protected or corrupted.`,
      );
    }

    if (pdfLibDoc.isEncrypted) {
      throw new Error(
        `"${file.name}" is password-protected. Please remove encryption before modifying.`,
      );
    }

    const pageCount = pdfLibDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error(`"${file.name}" contains no readable pages.`);
    }

    return {
      pdfLibDoc,
      arrayBuffer,
      pageCount,
      name: file.name,
      size: file.size,
      formattedSize: DeletePdfEngine.formatBytes(file.size),
    };
  }

  async deletePages(
    file,
    arrayBuffer,
    selectedIndicesForDelete,
    progressCallback = null,
  ) {
    if (!window.PDFLib) {
      throw new Error("PDF processing library is not loaded.");
    }

    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    const totalPages = pdfDoc.getPageCount();

    if (!selectedIndicesForDelete || selectedIndicesForDelete.length === 0) {
      throw new Error("Please select at least one page to delete.");
    }

    if (selectedIndicesForDelete.length >= totalPages) {
      throw new Error(
        "Cannot delete all pages from a PDF. At least one page must remain in the document.",
      );
    }

    if (progressCallback) progressCallback(20, "Identifying pages to keep...");

    const deleteSet = new Set(selectedIndicesForDelete);
    const indicesToKeep = [];
    for (let i = 0; i < totalPages; i++) {
      if (!deleteSet.has(i)) {
        indicesToKeep.push(i);
      }
    }

    if (progressCallback)
      progressCallback(50, "Building updated PDF document...");

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(pdfDoc, indicesToKeep);
    copiedPages.forEach((p) => newDoc.addPage(p));

    if (progressCallback) progressCallback(80, "Saving new PDF file...");

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}-deleted.pdf`;

    return {
      blob,
      url,
      filename,
      originalPageCount: totalPages,
      deletedCount: deleteSet.size,
      remainingCount: indicesToKeep.length,
      size: blob.size,
      formattedSize: DeletePdfEngine.formatBytes(blob.size),
    };
  }
}

/**
 * Redesigned Universal UI Controller for Delete PDF Pages Tool
 */
class DeletePdfUI {
  constructor() {
    this.engine = new DeletePdfEngine();
    this.currentFile = null;
    this.arrayBuffer = null;
    this.pdfMeta = null;
    this.pdfJsDoc = null;

    // Page state: array of { pageNum: 1, index: 0, selectedForDelete: false }
    this.pages = [];
    this.createdBlobUrl = null;

    this.init();
  }

  init() {
    if (typeof document === "undefined") return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.bindDOM());
    } else {
      this.bindDOM();
    }
  }

  bindDOM() {
    this.uploadSection = document.getElementById("delete-upload-section");
    this.dropzone = document.getElementById("delete-dropzone");
    this.fileInput = document.getElementById("delete-file-input");

    this.filenameDisplay = document.getElementById("delete-filename-display");
    this.filesizeDisplay = document.getElementById("delete-filesize-display");
    this.btnChangePdf = document.getElementById("btn-change-delete-pdf");
    this.btnRemovePdf = document.getElementById("btn-remove-delete-pdf");

    this.workspaceSection = document.getElementById("delete-workspace-section");
    this.selectionBadge = document.getElementById("delete-selection-badge");
    this.remainingStats = document.getElementById("delete-remaining-stats");
    this.pageRangeInput = document.getElementById("delete-page-range-input");
    this.btnApplyRange = document.getElementById("btn-apply-range-delete");

    this.btnSelectAll = document.getElementById("btn-select-all-delete");
    this.btnDeselectAll = document.getElementById("btn-deselect-all-delete");
    this.btnInvert = document.getElementById("btn-invert-delete");

    this.outputFilenameInput = document.getElementById(
      "delete-output-filename",
    );
    this.btnExecuteDelete = document.getElementById("btn-execute-delete");
    this.pagesGrid = document.getElementById("delete-pages-grid");

    this.processingState = document.getElementById("delete-processing-state");
    this.progressBar = document.getElementById("delete-progress-bar");
    this.statusTitle = document.getElementById("delete-status-title");
    this.statusDesc = document.getElementById("delete-status-desc");

    this.resultSection = document.getElementById("delete-result-section");
    this.resultSummary = document.getElementById("delete-result-summary");
    this.resultFilename = document.getElementById("delete-result-filename");
    this.resultMeta = document.getElementById("delete-result-meta");
    this.btnDownloadPdf = document.getElementById("btn-download-delete-pdf");
    this.btnReset = document.getElementById("btn-reset-delete");

    this.bindEvents();
  }

  bindEvents() {
    // Dropzone & File Input
    if (this.dropzone && this.fileInput) {
      const chooseBtn = this.dropzone.querySelector(
        ".file-uploader__choose-btn",
      );
      if (chooseBtn) {
        chooseBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.fileInput.click();
        });
      }

      this.dropzone.addEventListener("click", () => this.fileInput.click());
      this.dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.fileInput.click();
        }
      });

      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
          this.fileInput.value = "";
        }
      });

      // Drag & Drop
      ["dragenter", "dragover"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("file-uploader__dropzone--active");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("file-uploader__dropzone--active");
        });
      });

      this.dropzone.addEventListener("drop", (e) => {
        const files = e.dataTransfer ? e.dataTransfer.files : null;
        if (files && files.length > 0) {
          const pdfFile = Array.from(files).find(
            (f) =>
              f.type === "application/pdf" ||
              f.name.toLowerCase().endsWith(".pdf"),
          );
          if (pdfFile) {
            this.handleFileSelected(pdfFile);
          } else {
            showDeleteToast(
              "Please drop a valid PDF file.",
              "error",
              "Invalid File",
            );
          }
        }
      });
    }

    // Change PDF & Remove File Buttons
    if (this.btnChangePdf) {
      this.btnChangePdf.addEventListener("click", () => {
        if (this.fileInput) this.fileInput.click();
      });
    }
    if (this.btnRemovePdf) {
      this.btnRemovePdf.addEventListener("click", () => this.removeFile());
    }

    // Selection Controls
    if (this.btnSelectAll) {
      this.btnSelectAll.addEventListener("click", () => this.selectAll());
    }
    if (this.btnDeselectAll) {
      this.btnDeselectAll.addEventListener("click", () => this.deselectAll());
    }
    if (this.btnInvert) {
      this.btnInvert.addEventListener("click", () => this.invertSelection());
    }

    // Apply Range Selection
    if (this.btnApplyRange) {
      this.btnApplyRange.addEventListener("click", () => this.applyPageRange());
    }
    if (this.pageRangeInput) {
      this.pageRangeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.applyPageRange();
        }
      });
    }

    // Execute Delete Action
    if (this.btnExecuteDelete) {
      this.btnExecuteDelete.addEventListener("click", () =>
        this.executeDelete(),
      );
    }

    // Reset View / Start Over
    if (this.btnReset) {
      this.btnReset.addEventListener("click", () => this.resetView());
    }
  }

  async handleFileSelected(file) {
    const validation = DeletePdfEngine.validateFile(file);
    if (!validation.valid) {
      showDeleteToast(validation.error, "error", "Invalid File");
      return;
    }

    showDeleteToast(`Loading "${file.name}"...`, "info", "Reading PDF");

    try {
      const meta = await this.engine.loadPdfMetadata(file);

      this.currentFile = file;
      this.arrayBuffer = meta.arrayBuffer;
      this.pdfMeta = meta;

      // Build pages state
      this.pages = [];
      for (let i = 0; i < meta.pageCount; i++) {
        this.pages.push({
          pageNum: i + 1,
          index: i,
          selectedForDelete: false,
        });
      }

      // Update File Info Bar
      if (this.filenameDisplay) this.filenameDisplay.textContent = meta.name;
      if (this.filesizeDisplay) {
        this.filesizeDisplay.textContent = `${meta.formattedSize} • ${meta.pageCount} total pages`;
      }

      // Set default output filename
      if (this.outputFilenameInput) {
        const baseName = meta.name.replace(/\.[^/.]+$/, "");
        this.outputFilenameInput.value = `${baseName}-deleted.pdf`;
      }

      // Hide upload section, show workspace section
      if (this.uploadSection) this.uploadSection.style.display = "none";
      if (this.workspaceSection) this.workspaceSection.style.display = "block";
      if (this.resultSection) this.resultSection.style.display = "none";
      if (this.processingState) this.processingState.style.display = "none";

      // Load PDF.js document for canvas thumbnail generation
      try {
        const lib = ensurePdfWorker();
        const loadingTask = lib.getDocument({
          data: meta.arrayBuffer.slice(0),
        });
        this.pdfJsDoc = await loadingTask.promise;
      } catch (e) {
        this.pdfJsDoc = null;
      }

      this.renderPagesGrid();
      showDeleteToast(
        `Loaded "${meta.name}" (${meta.pageCount} pages). Click pages to mark for deletion.`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error("[DeletePdf] Load error:", err);
      showDeleteToast(
        err.message || "Could not parse PDF file.",
        "error",
        "Parse Error",
      );
    }
  }

  renderPagesGrid() {
    if (!this.pagesGrid) return;

    this.pagesGrid.innerHTML = this.pages
      .map((p, idx) => {
        const isSel = p.selectedForDelete;

        const cardBorder = isSel
          ? "2px solid #ef4444"
          : "2px solid var(--border-subtle)";
        const cardBg = isSel ? "rgba(239, 68, 68, 0.05)" : "var(--bg-surface)";
        const pageTextDecoration = isSel ? "line-through" : "none";
        const pageTextColor = isSel ? "#ef4444" : "var(--text-main)";

        return `
        <div class="card delete-page-card"
             data-index="${idx}"
             style="position: relative; padding: 10px; border: ${cardBorder}; border-radius: var(--radius-lg); background: ${cardBg}; cursor: pointer; transition: all 0.15s ease; user-select: none;">
          
          <!-- Header Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="event.stopPropagation();">
              <input type="checkbox" class="delete-page-checkbox" data-index="${idx}" ${isSel ? "checked" : ""} style="width: 16px; height: 16px; accent-color: #ef4444; cursor: pointer;" />
              <span style="font-size: 0.85rem; font-weight: 700; color: ${pageTextColor}; text-decoration: ${pageTextDecoration};">
                Page ${p.pageNum}
              </span>
            </label>
            ${isSel ? '<span class="badge" style="background: #ef4444; color: #ffffff; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">DELETE</span>' : ""}
          </div>

          <!-- Thumbnail Canvas Box -->
          <div style="position: relative; width: 100%; height: 160px; background: var(--bg-surface-hover); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <canvas id="delete-canvas-${p.pageNum}" style="max-width: 100%; max-height: 100%; display: block; opacity: ${isSel ? "0.35" : "1"}; transition: opacity 0.15s ease;"></canvas>
            
            ${
              isSel
                ? `
              <div style="position: absolute; inset: 0; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; pointer-events: none;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #ef4444; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                  ✕
                </div>
              </div>
            `
                : ""
            }
          </div>

        </div>
      `;
      })
      .join("");

    this.bindGridEvents();
    this.renderThumbnails();
    this.updateSelectionSummary();
  }

  bindGridEvents() {
    if (!this.pagesGrid) return;

    // Card click toggles page deletion selection
    const cards = this.pagesGrid.querySelectorAll(".delete-page-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const idx = parseInt(card.getAttribute("data-index"), 10);
        if (!isNaN(idx) && this.pages[idx]) {
          this.pages[idx].selectedForDelete =
            !this.pages[idx].selectedForDelete;
          this.renderPagesGrid();
        }
      });
    });

    // Checkbox click
    const checkboxes = this.pagesGrid.querySelectorAll(".delete-page-checkbox");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const idx = parseInt(cb.getAttribute("data-index"), 10);
        if (!isNaN(idx) && this.pages[idx]) {
          this.pages[idx].selectedForDelete = cb.checked;
          this.renderPagesGrid();
        }
      });
    });
  }

  async renderThumbnails() {
    if (!this.pdfJsDoc) return;

    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i];
      const canvas = document.getElementById(`delete-canvas-${p.pageNum}`);
      if (!canvas) continue;

      try {
        const page = await this.pdfJsDoc.getPage(p.pageNum);
        const viewport = page.getViewport({ scale: 0.4 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({
          canvas,
          canvasContext: ctx,
          viewport: viewport,
        }).promise;
      } catch (err) {}
    }
  }

  updateSelectionSummary() {
    const selectedCount = this.pages.filter((p) => p.selectedForDelete).length;
    const total = this.pages.length;
    const remainingCount = total - selectedCount;

    if (this.selectionBadge) {
      if (selectedCount === 0) {
        this.selectionBadge.textContent = `0 of ${total} pages selected to delete`;
        this.selectionBadge.style.background = "var(--border-subtle)";
        this.selectionBadge.style.color = "var(--text-muted)";
      } else if (selectedCount === total) {
        this.selectionBadge.textContent = `ALL ${total} pages selected (At least 1 page must remain)`;
        this.selectionBadge.style.background = "rgba(239, 68, 68, 0.2)";
        this.selectionBadge.style.color = "#dc2626";
      } else {
        this.selectionBadge.textContent = `${selectedCount} of ${total} pages selected to delete`;
        this.selectionBadge.style.background = "rgba(239, 68, 68, 0.12)";
        this.selectionBadge.style.color = "#dc2626";
      }
    }

    if (this.remainingStats) {
      this.remainingStats.textContent = `(${remainingCount} ${remainingCount === 1 ? "page" : "pages"} remaining)`;
    }
  }

  applyPageRange() {
    if (!this.pageRangeInput || !this.pages.length) return;
    const val = this.pageRangeInput.value.trim();
    if (!val) {
      showDeleteToast(
        "Please enter page numbers or range (e.g. 1, 3, 5-8)",
        "info",
        "Page Range",
      );
      return;
    }

    const totalPages = this.pages.length;
    const selectedIndices = new Set();
    const parts = val.split(",");

    parts.forEach((part) => {
      const clean = part.trim();
      if (clean.includes("-")) {
        const rangeParts = clean.split("-");
        const start = parseInt(rangeParts[0], 10);
        const end = parseInt(rangeParts[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            selectedIndices.add(p - 1);
          }
        }
      } else {
        const pNum = parseInt(clean, 10);
        if (!isNaN(pNum) && pNum >= 1 && pNum <= totalPages) {
          selectedIndices.add(pNum - 1);
        }
      }
    });

    if (selectedIndices.size === 0) {
      showDeleteToast(
        `No pages matched range "${val}" (total pages: ${totalPages})`,
        "warning",
        "Invalid Range",
      );
      return;
    }

    this.pages.forEach((p) => {
      if (selectedIndices.has(p.index)) {
        p.selectedForDelete = true;
      }
    });

    this.renderPagesGrid();
    showDeleteToast(
      `Marked ${selectedIndices.size} ${selectedIndices.size === 1 ? "page" : "pages"} for deletion.`,
      "success",
      "Range Applied",
    );
  }

  selectAll() {
    this.pages.forEach((p) => (p.selectedForDelete = true));
    this.renderPagesGrid();
  }

  deselectAll() {
    this.pages.forEach((p) => (p.selectedForDelete = false));
    this.renderPagesGrid();
  }

  invertSelection() {
    this.pages.forEach((p) => (p.selectedForDelete = !p.selectedForDelete));
    this.renderPagesGrid();
  }

  removeFile() {
    if (this.createdBlobUrl) {
      URL.revokeObjectURL(this.createdBlobUrl);
      this.createdBlobUrl = null;
    }
    this.currentFile = null;
    this.arrayBuffer = null;
    this.pdfMeta = null;
    this.pdfJsDoc = null;
    this.pages = [];

    if (this.fileInput) this.fileInput.value = "";
    if (this.pageRangeInput) this.pageRangeInput.value = "";

    if (this.workspaceSection) this.workspaceSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "none";
    if (this.processingState) this.processingState.style.display = "none";
    if (this.uploadSection) this.uploadSection.style.display = "block";

    showDeleteToast("PDF file removed.", "info", "File Removed");
  }

  async executeDelete() {
    if (!this.currentFile || !this.arrayBuffer) {
      showDeleteToast(
        "Please upload a PDF file first.",
        "warning",
        "No PDF Loaded",
      );
      return;
    }

    const selectedIndices = this.pages
      .filter((p) => p.selectedForDelete)
      .map((p) => p.index);

    if (selectedIndices.length === 0) {
      showDeleteToast(
        "Please click on at least one page to select it for deletion.",
        "error",
        "No Pages Selected",
      );
      return;
    }

    if (selectedIndices.length >= this.pages.length) {
      showDeleteToast(
        "Cannot delete all pages. A PDF document must contain at least one page.",
        "error",
        "Cannot Delete All Pages",
      );
      return;
    }

    // UI state: Processing
    if (this.workspaceSection) this.workspaceSection.style.display = "none";
    if (this.processingState) this.processingState.style.display = "block";
    if (this.progressBar) this.progressBar.style.width = "20%";

    try {
      if (this.createdBlobUrl) {
        URL.revokeObjectURL(this.createdBlobUrl);
        this.createdBlobUrl = null;
      }

      const result = await this.engine.deletePages(
        this.currentFile,
        this.arrayBuffer,
        selectedIndices,
        (percent) => {
          if (this.progressBar) this.progressBar.style.width = `${percent}%`;
        },
      );

      this.createdBlobUrl = result.url;

      // Custom output filename
      let customFilename = result.filename;
      if (this.outputFilenameInput && this.outputFilenameInput.value.trim()) {
        const val = this.outputFilenameInput.value.trim();
        customFilename = val.toLowerCase().endsWith(".pdf")
          ? val
          : `${val}.pdf`;
      }

      // Update Result UI
      if (this.resultSummary) {
        this.resultSummary.textContent = `Successfully deleted ${result.deletedCount} ${result.deletedCount === 1 ? "page" : "pages"}. New document contains ${result.remainingCount} ${result.remainingCount === 1 ? "page" : "pages"} (${result.formattedSize}).`;
      }

      if (this.resultFilename) {
        this.resultFilename.textContent = customFilename;
      }

      if (this.resultMeta) {
        this.resultMeta.textContent = `${result.formattedSize} • ${result.remainingCount} ${result.remainingCount === 1 ? "page" : "pages"}`;
      }

      if (this.btnDownloadPdf) {
        this.btnDownloadPdf.href = result.url;
        this.btnDownloadPdf.download = customFilename;
      }

      if (this.processingState) this.processingState.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "block";

      showDeleteToast(
        `Deleted ${result.deletedCount} ${result.deletedCount === 1 ? "page" : "pages"} successfully!`,
        "success",
        "Deletion Complete",
      );
    } catch (err) {
      console.error("[DeletePdf] Execute error:", err);
      if (this.processingState) this.processingState.style.display = "none";
      if (this.workspaceSection) this.workspaceSection.style.display = "block";
      showDeleteToast(
        err.message || "An error occurred while deleting PDF pages.",
        "error",
        "Delete Failed",
      );
    }
  }

  resetView() {
    this.removeFile();
  }
}

// Global Export & Auto-Init
window.DeletePdfEngine = DeletePdfEngine;
window.DeletePdfUI = DeletePdfUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new DeletePdfUI();
  window.ComprexaDeletePdfApp = app;
});
