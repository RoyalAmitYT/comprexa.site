// @ts-nocheck
/**
 * Comprexa - Extract PDF Pages Tool Controller
 * Fresh, production-ready, client-side PDF page extraction module.
 * Completely rebuilt from scratch.
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

// Helper Toast function
function showExtractToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Processing Engine for Extract PDF Pages
 */
class ExtractPdfEngine {
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

  /**
   * Parse user page range string (e.g., "1-5, 7, 9-12") into sorted array of unique 0-based page indices
   */
  static parsePageRange(rangeStr, totalPages) {
    if (!rangeStr || !rangeStr.trim()) return [];

    const tokens = rangeStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const pageIndices = new Set();

    for (const token of tokens) {
      const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) {
        throw new Error(
          `Invalid page range or number: "${token}". Use formats like "1-5" or "3".`,
        );
      }

      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page numbers in "${token}".`);
      }

      if (start < 1 || end < 1) {
        throw new Error(
          `Page numbers must be 1 or greater (found "${token}").`,
        );
      }

      if (start > end) {
        throw new Error(
          `Range start (${start}) cannot be greater than end (${end}) in "${token}".`,
        );
      }

      if (end > totalPages) {
        throw new Error(
          `Page ${end} exceeds total document pages (${totalPages}).`,
        );
      }

      for (let p = start; p <= end; p++) {
        pageIndices.add(p - 1); // convert 1-based page number to 0-based index
      }
    }

    return Array.from(pageIndices).sort((a, b) => a - b);
  }

  /**
   * Format array of 0-based indices into clean range string (e.g. "1-5, 7, 9-12")
   */
  static formatIndicesToRange(indices) {
    if (!indices || indices.length === 0) return "";

    const sorted = Array.from(new Set(indices))
      .sort((a, b) => a - b)
      .map((i) => i + 1); // convert to 1-based
    const ranges = [];
    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = current;
        prev = current;
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(", ");
  }

  async loadPdfMetadata(file) {
    if (!window.PDFLib) {
      throw new Error(
        "PDF processing library (PDF-Lib) is not loaded. Please refresh the page.",
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { PDFDocument } = window.PDFLib;

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
      formattedSize: ExtractPdfEngine.formatBytes(file.size),
    };
  }

  async extractPages(
    file,
    arrayBuffer,
    selectedIndices,
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

    if (!selectedIndices || selectedIndices.length === 0) {
      throw new Error("Please select at least one page to extract.");
    }

    for (const idx of selectedIndices) {
      if (idx < 0 || idx >= totalPages) {
        throw new Error(
          `Page ${idx + 1} is out of bounds for this document (${totalPages} total pages).`,
        );
      }
    }

    if (progressCallback) progressCallback(30, "Copying selected pages...");

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(pdfDoc, selectedIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));

    if (progressCallback) progressCallback(70, "Building new PDF file...");

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}-extracted.pdf`;

    return {
      blob,
      url,
      filename,
      originalPageCount: totalPages,
      extractedCount: selectedIndices.length,
      size: blob.size,
      formattedSize: ExtractPdfEngine.formatBytes(blob.size),
    };
  }
}

/**
 * UI Controller for Extract PDF Pages Tool
 */
class ExtractPdfUI {
  constructor() {
    this.engine = new ExtractPdfEngine();
    this.currentFile = null;
    this.arrayBuffer = null;
    this.pdfMeta = null;
    this.pdfJsDoc = null;

    // Page state: array of { pageNum: 1, index: 0, selectedForExtract: false }
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
    this.uploadSection = document.getElementById("extract-upload-section");
    this.dropzone = document.getElementById("extract-dropzone");
    this.fileInput = document.getElementById("extract-file-input");

    this.fileInfoCard = document.getElementById("extract-file-info");
    this.filenameDisplay = document.getElementById("extract-filename-display");
    this.filesizeDisplay = document.getElementById("extract-filesize-display");
    this.btnChangePdf = document.getElementById("btn-change-extract-pdf");

    this.workspaceSection = document.getElementById(
      "extract-workspace-section",
    );
    this.rangeInput = document.getElementById("extract-range-input");
    this.btnApplyRange = document.getElementById("btn-apply-range");
    this.selectionBadge = document.getElementById("extract-selection-badge");
    this.btnSelectAll = document.getElementById("btn-select-all-extract");
    this.btnDeselectAll = document.getElementById("btn-deselect-all-extract");
    this.btnExecuteExtract = document.getElementById("btn-execute-extract");
    this.pagesGrid = document.getElementById("extract-pages-grid");

    this.processingState = document.getElementById("extract-processing-state");
    this.progressBar = document.getElementById("extract-progress-bar");

    this.resultSection = document.getElementById("extract-result-section");
    this.resultSummary = document.getElementById("extract-result-summary");
    this.btnDownloadPdf = document.getElementById("btn-download-extract-pdf");
    this.btnReset = document.getElementById("btn-reset-extract");

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
            showExtractToast(
              "Please drop a valid PDF file.",
              "error",
              "Invalid File",
            );
          }
        }
      });
    }

    // Change PDF Button
    if (this.btnChangePdf) {
      this.btnChangePdf.addEventListener("click", () => {
        if (this.fileInput) this.fileInput.click();
      });
    }

    // Range Input Events
    if (this.btnApplyRange) {
      this.btnApplyRange.addEventListener("click", () =>
        this.applyRangeInput(),
      );
    }
    if (this.rangeInput) {
      this.rangeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.applyRangeInput();
        }
      });
      this.rangeInput.addEventListener("change", () => this.applyRangeInput());
    }

    // Selection Controls
    if (this.btnSelectAll) {
      this.btnSelectAll.addEventListener("click", () => this.selectAll());
    }
    if (this.btnDeselectAll) {
      this.btnDeselectAll.addEventListener("click", () => this.deselectAll());
    }

    // Execute Extract Action
    if (this.btnExecuteExtract) {
      this.btnExecuteExtract.addEventListener("click", () =>
        this.executeExtract(),
      );
    }

    // Reset View
    if (this.btnReset) {
      this.btnReset.addEventListener("click", () => this.resetView());
    }
  }

  async handleFileSelected(file) {
    const validation = ExtractPdfEngine.validateFile(file);
    if (!validation.valid) {
      showExtractToast(validation.error, "error", "Invalid File");
      return;
    }

    showExtractToast(`Loading "${file.name}"...`, "info", "Reading PDF");

    try {
      const meta = await this.engine.loadPdfMetadata(file);

      this.currentFile = file;
      this.arrayBuffer = meta.arrayBuffer;
      this.pdfMeta = meta;

      // Build pages state (default page 1 selected)
      this.pages = [];
      for (let i = 0; i < meta.pageCount; i++) {
        this.pages.push({
          pageNum: i + 1,
          index: i,
          selectedForExtract: i === 0, // Default first page selected
        });
      }

      // Update File Info
      if (this.filenameDisplay) this.filenameDisplay.textContent = meta.name;
      if (this.filesizeDisplay) {
        this.filesizeDisplay.textContent = `${meta.formattedSize} • ${meta.pageCount} total pages`;
      }

      // Hide upload zone, show file info & workspace
      if (this.uploadSection) this.uploadSection.style.display = "none";
      if (this.fileInfoCard) {
        this.fileInfoCard.style.display = "flex";
        this.fileInfoCard.classList.add("visible-preview");
      }
      if (this.workspaceSection) this.workspaceSection.style.display = "block";
      if (this.resultSection) this.resultSection.style.display = "none";

      // Set initial range input value
      this.syncRangeInputFromSelection();

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
      showExtractToast(
        `Loaded "${meta.name}" (${meta.pageCount} pages). Select pages to extract.`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error("[ExtractPdf] Load error:", err);
      showExtractToast(
        err.message || "Could not parse PDF file.",
        "error",
        "Parse Error",
      );
    }
  }

  applyRangeInput() {
    if (!this.rangeInput || !this.pdfMeta) return;

    const val = this.rangeInput.value.trim();
    if (!val) {
      this.pages.forEach((p) => (p.selectedForExtract = false));
      this.renderPagesGrid(false);
      return;
    }

    try {
      const selectedIndices = ExtractPdfEngine.parsePageRange(
        val,
        this.pdfMeta.pageCount,
      );
      const selSet = new Set(selectedIndices);

      this.pages.forEach((p) => {
        p.selectedForExtract = selSet.has(p.index);
      });

      this.renderPagesGrid(false); // Don't overwrite range input during sync
      showExtractToast(
        `Applied range "${val}" (${selectedIndices.length} pages selected)`,
        "info",
        "Range Applied",
      );
    } catch (err) {
      showExtractToast(
        err.message || "Invalid page range.",
        "error",
        "Invalid Range",
      );
    }
  }

  syncRangeInputFromSelection() {
    if (!this.rangeInput) return;
    const selectedIndices = this.pages
      .filter((p) => p.selectedForExtract)
      .map((p) => p.index);

    this.rangeInput.value =
      ExtractPdfEngine.formatIndicesToRange(selectedIndices);
  }

  renderPagesGrid(updateRangeInput = true) {
    if (!this.pagesGrid) return;

    if (updateRangeInput) {
      this.syncRangeInputFromSelection();
    }

    this.pagesGrid.innerHTML = this.pages
      .map((p, idx) => {
        const isSel = p.selectedForExtract;

        const cardBorder = isSel
          ? "2px solid var(--primary)"
          : "2px solid var(--border-subtle)";
        const cardBg = isSel ? "rgba(99, 102, 241, 0.06)" : "var(--bg-surface)";
        const pageTextColor = isSel ? "var(--primary)" : "var(--text-main)";

        return `
        <div class="card extract-page-card"
             data-index="${idx}"
             style="position: relative; padding: 10px; border: ${cardBorder}; border-radius: var(--radius-lg); background: ${cardBg}; cursor: pointer; transition: all 0.15s ease; user-select: none;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="event.stopPropagation();">
              <input type="checkbox" class="extract-page-checkbox" data-index="${idx}" ${isSel ? "checked" : ""} style="width: 16px; height: 16px; cursor: pointer;" />
              <span style="font-size: 0.82rem; font-weight: 700; color: ${pageTextColor};">
                Page ${p.pageNum}
              </span>
            </label>
            ${isSel ? '<span class="badge badge--primary" style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">EXTRACT</span>' : ""}
          </div>

          <!-- Thumbnail Canvas Box -->
          <div style="position: relative; width: 100%; height: 160px; background: var(--bg-surface-hover); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <canvas id="extract-canvas-${p.pageNum}" style="max-width: 100%; max-height: 100%; display: block;"></canvas>
            
            ${
              isSel
                ? `
              <div style="position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                ✓
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

    // Card click toggles page extraction selection
    const cards = this.pagesGrid.querySelectorAll(".extract-page-card");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const idx = parseInt(card.getAttribute("data-index"), 10);
        if (!isNaN(idx) && this.pages[idx]) {
          this.pages[idx].selectedForExtract =
            !this.pages[idx].selectedForExtract;
          this.renderPagesGrid(true);
        }
      });
    });

    // Checkbox click
    const checkboxes = this.pagesGrid.querySelectorAll(
      ".extract-page-checkbox",
    );
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const idx = parseInt(cb.getAttribute("data-index"), 10);
        if (!isNaN(idx) && this.pages[idx]) {
          this.pages[idx].selectedForExtract = cb.checked;
          this.renderPagesGrid(true);
        }
      });
    });
  }

  async renderThumbnails() {
    if (!this.pdfJsDoc) return;

    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i];
      const canvas = document.getElementById(`extract-canvas-${p.pageNum}`);
      if (!canvas) continue;

      try {
        const page = await this.pdfJsDoc.getPage(p.pageNum);
        const viewport = page.getViewport({ scale: 0.35 });

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
    const selectedCount = this.pages.filter((p) => p.selectedForExtract).length;
    const total = this.pages.length;

    if (this.selectionBadge) {
      this.selectionBadge.textContent = `${selectedCount} of ${total} pages selected to extract`;
    }
  }

  selectAll() {
    this.pages.forEach((p) => (p.selectedForExtract = true));
    this.renderPagesGrid(true);
  }

  deselectAll() {
    this.pages.forEach((p) => (p.selectedForExtract = false));
    this.renderPagesGrid(true);
  }

  async executeExtract() {
    if (!this.currentFile || !this.arrayBuffer) {
      showExtractToast(
        "Please upload a PDF file first.",
        "warning",
        "No PDF Loaded",
      );
      return;
    }

    const selectedIndices = this.pages
      .filter((p) => p.selectedForExtract)
      .map((p) => p.index);

    if (selectedIndices.length === 0) {
      showExtractToast(
        "Please click on at least one page or enter a page range to select pages for extraction.",
        "error",
        "No Pages Selected",
      );
      return;
    }

    // UI state: Processing
    if (this.workspaceSection) this.workspaceSection.style.display = "none";
    if (this.processingState) this.processingState.style.display = "block";
    if (this.progressBar) this.progressBar.style.width = "30%";

    try {
      if (this.createdBlobUrl) {
        URL.revokeObjectURL(this.createdBlobUrl);
        this.createdBlobUrl = null;
      }

      const result = await this.engine.extractPages(
        this.currentFile,
        this.arrayBuffer,
        selectedIndices,
        (percent) => {
          if (this.progressBar) this.progressBar.style.width = `${percent}%`;
        },
      );

      this.createdBlobUrl = result.url;

      // Update Result UI
      if (this.resultSummary) {
        this.resultSummary.textContent = `Successfully extracted ${result.extractedCount} ${result.extractedCount === 1 ? "page" : "pages"} from "${this.currentFile.name}". New file size is ${result.formattedSize}.`;
      }

      if (this.btnDownloadPdf) {
        this.btnDownloadPdf.href = result.url;
        this.btnDownloadPdf.download = result.filename;
      }

      if (this.processingState) this.processingState.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "block";

      showExtractToast(
        `Extracted ${result.extractedCount} ${result.extractedCount === 1 ? "page" : "pages"} successfully!`,
        "success",
        "Extraction Complete",
      );
    } catch (err) {
      console.error("[ExtractPdf] Execute error:", err);
      if (this.processingState) this.processingState.style.display = "none";
      if (this.workspaceSection) this.workspaceSection.style.display = "block";
      showExtractToast(
        err.message || "An error occurred while extracting PDF pages.",
        "error",
        "Extraction Failed",
      );
    }
  }

  resetView() {
    if (this.resultSection) this.resultSection.style.display = "none";
    if (this.processingState) this.processingState.style.display = "none";

    if (this.currentFile) {
      if (this.workspaceSection) this.workspaceSection.style.display = "block";
    } else {
      if (this.fileInfoCard) {
        this.fileInfoCard.style.display = "none";
        this.fileInfoCard.classList.remove("visible-preview");
      }
      if (this.uploadSection) this.uploadSection.style.display = "block";
    }
  }
}

// Global Export & Auto-Init
window.ExtractPdfEngine = ExtractPdfEngine;
window.ExtractPdfUI = ExtractPdfUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new ExtractPdfUI();
  window.ComprexaExtractPdfApp = app;
});
