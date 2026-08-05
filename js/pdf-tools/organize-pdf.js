// @ts-nocheck
/**
 * Comprexa Organize PDF Controller
 * Reusable client-side PDF page organization engine powered by PDF-Lib & PDF.js.
 * Supports visual drag-and-drop reordering, page selection, rotation, deletion, duplication, move, and undo/redo.
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

class OrganizePdfUI {
  constructor() {
    this.selectedFile = null;
    this.arrayBuffer = null;
    this.pdfJsDoc = null;
    this.pdfLibDoc = null;
    this.pageItems = []; // Array of { id, originalIndex, rotation }
    this.selectedIds = new Set();
    this.historyStack = [];
    this.redoStack = [];
    this.draggedIndex = null;

    this.init();
  }

  init() {
    ensurePdfWorker();

    this.bindDropzone();
    this.bindToolbarEvents();
    this.bindKeyboardShortcuts();
  }

  bindDropzone() {
    const dropzone = document.getElementById("organize-dropzone");
    const fileInput = document.getElementById("organize-file-input");
    const chooseBtn = dropzone
      ? dropzone.querySelector(".file-uploader__choose-btn")
      : null;

    if (!dropzone || !fileInput) return;

    if (chooseBtn) {
      chooseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    dropzone.addEventListener("click", () => {
      fileInput.click();
    });

    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelected(e.target.files[0]);
        fileInput.value = "";
      }
    });

    // Drag & Drop
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("file-uploader__dropzone--active");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("file-uploader__dropzone--active");
      });
    });

    dropzone.addEventListener("drop", (e) => {
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
          if (window.ComprexaToast) {
            window.ComprexaToast.error(
              "Please drop a valid PDF file.",
              "Invalid File",
            );
          } else {
            if (window.ComprexaToast)
              window.ComprexaToast.error("Please drop a valid PDF file.");
          }
        }
      }
    });
  }

  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      const workspaceSection = document.getElementById(
        "organize-workspace-section",
      );
      if (!workspaceSection || workspaceSection.style.display === "none")
        return;

      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      // Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        if (this.selectedIds.size > 0) {
          e.preventDefault();
          this.deleteSelected();
        }
      }
      // Ctrl/Cmd + A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        this.selectAll();
      }
      // Ctrl/Cmd + Z (Undo)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        this.undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl + Y (Redo)
      if (
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        this.redo();
      }
    });
  }

  async handleFileSelected(file) {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      if (window.ComprexaToast) {
        window.ComprexaToast.error(
          "Only PDF files are supported.",
          "Invalid File",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Only PDF files are supported.");
      }
      return;
    }

    this.selectedFile = file;

    try {
      this.arrayBuffer = await file.arrayBuffer();

      const { PDFDocument } = window.PDFLib;
      this.pdfLibDoc = await PDFDocument.load(this.arrayBuffer, {
        ignoreEncryption: true,
      });
      const totalPages = this.pdfLibDoc.getPageCount();

      if (totalPages === 0) {
        throw new Error("PDF contains no pages.");
      }

      // Initialize page items array
      this.pageItems = [];
      for (let i = 0; i < totalPages; i++) {
        this.pageItems.push({
          id:
            "p_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substring(2, 7) +
            "_" +
            i,
          originalIndex: i,
          rotation: 0,
        });
      }

      this.selectedIds.clear();
      this.historyStack = [];
      this.redoStack = [];

      // Load PDF.js document for canvas thumbnail rendering
      try {
        const lib = ensurePdfWorker();
        const loadingTask = lib.getDocument({
          data: this.arrayBuffer.slice(0),
        });
        this.pdfJsDoc = await loadingTask.promise;
      } catch (e) {}

      this.showWorkspaceSection();
    } catch (err) {
      console.error("[OrganizePdf] Error loading PDF:", err);
      if (window.ComprexaToast) {
        window.ComprexaToast.error("Failed to load PDF file.", "Error");
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Failed to load PDF file.");
      }
    }
  }

  showWorkspaceSection() {
    const uploadSection = document.getElementById("organize-upload-section");
    const workspaceSection = document.getElementById(
      "organize-workspace-section",
    );
    const docName = document.getElementById("organize-doc-name");
    const docMeta = document.getElementById("organize-doc-meta");
    const outputFilenameInput = document.getElementById(
      "organize-output-filename",
    );

    if (uploadSection) uploadSection.style.display = "none";
    if (workspaceSection) workspaceSection.style.display = "block";

    if (docName) docName.textContent = this.selectedFile.name;
    if (docMeta)
      docMeta.textContent = `${this.formatBytes(this.selectedFile.size)} • ${this.pageItems.length} pages`;

    if (outputFilenameInput) {
      outputFilenameInput.value =
        this.selectedFile.name.replace(/\.pdf$/i, "") + "-organized.pdf";
    }

    this.renderGrid();
  }

  bindToolbarEvents() {
    document
      .getElementById("btn-change-organize-pdf")
      ?.addEventListener("click", () => {
        document.getElementById("organize-file-input")?.click();
      });

    document
      .getElementById("btn-remove-organize-pdf")
      ?.addEventListener("click", () => {
        this.resetToUpload();
      });

    document
      .getElementById("btn-select-all")
      ?.addEventListener("click", () => this.selectAll());
    document
      .getElementById("btn-deselect-all")
      ?.addEventListener("click", () => this.deselectAll());
    document
      .getElementById("btn-rotate-ccw")
      ?.addEventListener("click", () => this.rotateSelected(-90));
    document
      .getElementById("btn-rotate-cw")
      ?.addEventListener("click", () => this.rotateSelected(90));
    document
      .getElementById("btn-duplicate-selected")
      ?.addEventListener("click", () => this.duplicateSelected());
    document
      .getElementById("btn-delete-selected")
      ?.addEventListener("click", () => this.deleteSelected());
    document
      .getElementById("btn-undo")
      ?.addEventListener("click", () => this.undo());
    document
      .getElementById("btn-redo")
      ?.addEventListener("click", () => this.redo());

    document
      .getElementById("btn-save-organize")
      ?.addEventListener("click", () => this.executeSave());
    document
      .getElementById("btn-organize-start-over")
      ?.addEventListener("click", () => this.resetToUpload());
  }

  pushStateToHistory() {
    this.historyStack.push(JSON.parse(JSON.stringify(this.pageItems)));
    this.redoStack = [];
    this.updateToolbarButtons();
  }

  undo() {
    if (this.historyStack.length === 0) return;
    this.redoStack.push(JSON.parse(JSON.stringify(this.pageItems)));
    this.pageItems = this.historyStack.pop();
    this.renderGrid();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.historyStack.push(JSON.parse(JSON.stringify(this.pageItems)));
    this.pageItems = this.redoStack.pop();
    this.renderGrid();
  }

  updateToolbarButtons() {
    const counterEl = document.getElementById("organize-page-counter");
    const selCounterEl = document.getElementById("organize-selection-counter");
    const docMeta = document.getElementById("organize-doc-meta");
    const undoBtn = document.getElementById("btn-undo");
    const redoBtn = document.getElementById("btn-redo");

    if (counterEl) counterEl.textContent = `${this.pageItems.length} Pages`;
    if (selCounterEl)
      selCounterEl.textContent = `${this.selectedIds.size} Selected`;
    if (docMeta && this.selectedFile)
      docMeta.textContent = `${this.formatBytes(this.selectedFile.size)} • ${this.pageItems.length} pages`;

    if (undoBtn) undoBtn.disabled = this.historyStack.length === 0;
    if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
  }

  renderGrid() {
    const grid = document.getElementById("organize-grid");
    if (!grid) return;

    if (this.pageItems.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; background: var(--bg-surface-hover); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 12px;">All pages have been deleted.</p>
          <button type="button" class="btn btn--outline btn--sm" id="btn-restore-deleted">Undo Last Delete</button>
        </div>
      `;
      grid
        .querySelector("#btn-restore-deleted")
        ?.addEventListener("click", () => this.undo());
      this.updateToolbarButtons();
      return;
    }

    grid.innerHTML = this.pageItems
      .map((item, index) => {
        const isSelected = this.selectedIds.has(item.id);
        const isFirst = index === 0;
        const isLast = index === this.pageItems.length - 1;
        const rotBadge =
          item.rotation !== 0
            ? `<span class="badge badge--pill" style="font-size: 0.7rem; background: var(--primary-subtle); color: var(--primary);">${item.rotation}°</span>`
            : "";

        return `
        <div class="card page-card" 
             style="position: relative; padding: 12px; border: 2px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}; border-radius: var(--radius-lg); background: var(--bg-surface); cursor: pointer; transition: all 0.15s ease; user-select: none;"
             data-index="${index}" 
             data-id="${item.id}"
             draggable="true">
          
          <!-- Card Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="event.stopPropagation();">
              <input type="checkbox" class="page-checkbox" ${isSelected ? "checked" : ""} style="width: 16px; height: 16px; cursor: pointer;" />
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Page ${index + 1}</span>
            </label>
            ${rotBadge}
          </div>

          <!-- Thumbnail Canvas Box -->
          <div style="position: relative; width: 100%; height: 160px; background: var(--bg-surface-hover); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px;">
            <canvas id="canvas-${item.id}" style="max-width: 100%; max-height: 100%; transform: rotate(${item.rotation}deg); transition: transform 0.2s ease;"></canvas>
            
            <!-- Quick Floating Action Overlay -->
            <div class="card-overlay" style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; gap: 6px; opacity: 0; transition: opacity 0.15s ease;">
              <button type="button" class="btn-card-rot-left" title="Rotate 90° CCW" style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface); color: var(--text-main); display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">↶</button>
              <button type="button" class="btn-card-rot-right" title="Rotate 90° CW" style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface); color: var(--text-main); display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">↷</button>
              <button type="button" class="btn-card-delete" title="Delete Page" style="width: 32px; height: 32px; border-radius: 50%; background: #ef4444; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">🗑</button>
            </div>
          </div>

          <!-- Card Footer Movement Controls -->
          <div style="display: flex; gap: 4px;" onclick="event.stopPropagation();">
            <button type="button" class="btn btn--outline btn--sm btn-move-left" ${isFirst ? "disabled" : ""} style="flex: 1; padding: 4px 6px; font-size: 0.75rem;" title="Move Left">
              ← Left
            </button>
            <button type="button" class="btn btn--outline btn--sm btn-move-right" ${isLast ? "disabled" : ""} style="flex: 1; padding: 4px 6px; font-size: 0.75rem;" title="Move Right">
              Right →
            </button>
          </div>

        </div>
      `;
      })
      .join("");

    this.bindGridEvents(grid);
    this.renderThumbnails();
    this.updateToolbarButtons();
  }

  async renderThumbnails() {
    if (!this.pdfJsDoc) return;

    for (let i = 0; i < this.pageItems.length; i++) {
      const item = this.pageItems[i];
      const canvas = document.getElementById(`canvas-${item.id}`);
      if (!canvas) continue;

      try {
        const page = await this.pdfJsDoc.getPage(item.originalIndex + 1);
        const viewport = page.getViewport({ scale: 0.35 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      } catch (e) {}
    }
  }

  bindGridEvents(grid) {
    const cards = grid.querySelectorAll(".page-card");

    cards.forEach((card) => {
      const index = parseInt(card.getAttribute("data-index"), 10);
      const id = card.getAttribute("data-id");

      // Hover overlay
      const overlay = card.querySelector(".card-overlay");
      if (overlay) {
        card.addEventListener(
          "mouseenter",
          () => (overlay.style.opacity = "1"),
        );
        card.addEventListener(
          "mouseleave",
          () => (overlay.style.opacity = "0"),
        );
      }

      // Checkbox click
      const checkbox = card.querySelector(".page-checkbox");
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          e.stopPropagation();
          this.toggleSelection(id);
        });
      }

      // Card click selection
      card.addEventListener("click", () => {
        this.toggleSelection(id);
      });

      // Quick buttons inside overlay
      card
        .querySelector(".btn-card-rot-left")
        ?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.rotatePageItem(index, -90);
        });

      card
        .querySelector(".btn-card-rot-right")
        ?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.rotatePageItem(index, 90);
        });

      card.querySelector(".btn-card-delete")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deletePageItem(index);
      });

      // Move Left / Move Right
      card.querySelector(".btn-move-left")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.moveItem(index, -1);
      });

      card.querySelector(".btn-move-right")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.moveItem(index, 1);
      });

      // HTML5 Drag & Drop
      card.addEventListener("dragstart", (e) => {
        this.draggedIndex = index;
        card.style.opacity = "0.5";
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
      });

      card.addEventListener("dragend", () => {
        card.style.opacity = "1";
        cards.forEach(
          (c) =>
            (c.style.border = this.selectedIds.has(c.getAttribute("data-id"))
              ? "2px solid var(--primary)"
              : "2px solid var(--border-subtle)"),
        );
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        card.style.borderColor = "var(--primary)";
      });

      card.addEventListener("dragleave", () => {
        card.style.border = this.selectedIds.has(id)
          ? "2px solid var(--primary)"
          : "2px solid var(--border-subtle)";
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        if (this.draggedIndex !== null && this.draggedIndex !== index) {
          this.reorderItem(this.draggedIndex, index);
        }
      });
    });
  }

  toggleSelection(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.renderGrid();
  }

  selectAll() {
    this.selectedIds.clear();
    this.pageItems.forEach((item) => this.selectedIds.add(item.id));
    this.renderGrid();
  }

  deselectAll() {
    this.selectedIds.clear();
    this.renderGrid();
  }

  rotatePageItem(index, deg) {
    if (index < 0 || index >= this.pageItems.length) return;
    this.pushStateToHistory();
    const curr = this.pageItems[index].rotation || 0;
    this.pageItems[index].rotation = (curr + deg + 360) % 360;
    this.renderGrid();
  }

  rotateSelected(deg) {
    if (this.selectedIds.size === 0) {
      if (window.ComprexaToast) {
        window.ComprexaToast.info(
          "Select at least one page to rotate.",
          "Notice",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Select at least one page to rotate.");
      }
      return;
    }
    this.pushStateToHistory();
    this.pageItems.forEach((item) => {
      if (this.selectedIds.has(item.id)) {
        item.rotation = (item.rotation + deg + 360) % 360;
      }
    });
    this.renderGrid();
  }

  deletePageItem(index) {
    if (index < 0 || index >= this.pageItems.length) return;
    this.pushStateToHistory();
    const deleted = this.pageItems.splice(index, 1)[0];
    this.selectedIds.delete(deleted.id);
    this.renderGrid();
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) {
      if (window.ComprexaToast) {
        window.ComprexaToast.info(
          "Select at least one page to delete.",
          "Notice",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Select at least one page to delete.");
      }
      return;
    }
    this.pushStateToHistory();
    this.pageItems = this.pageItems.filter(
      (item) => !this.selectedIds.has(item.id),
    );
    this.selectedIds.clear();
    this.renderGrid();
  }

  duplicateSelected() {
    if (this.selectedIds.size === 0) {
      if (window.ComprexaToast) {
        window.ComprexaToast.info(
          "Select at least one page to duplicate.",
          "Notice",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Select at least one page to duplicate.");
      }
      return;
    }
    this.pushStateToHistory();
    const newItems = [];
    this.pageItems.forEach((item) => {
      newItems.push(item);
      if (this.selectedIds.has(item.id)) {
        newItems.push({
          id:
            "p_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substring(2, 7),
          originalIndex: item.originalIndex,
          rotation: item.rotation,
        });
      }
    });
    this.pageItems = newItems;
    this.renderGrid();
  }

  moveItem(fromIndex, delta) {
    const toIndex = fromIndex + delta;
    if (toIndex < 0 || toIndex >= this.pageItems.length) return;
    this.pushStateToHistory();
    const temp = this.pageItems[fromIndex];
    this.pageItems[fromIndex] = this.pageItems[toIndex];
    this.pageItems[toIndex] = temp;
    this.renderGrid();
  }

  reorderItem(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    this.pushStateToHistory();
    const moved = this.pageItems.splice(fromIndex, 1)[0];
    this.pageItems.splice(toIndex, 0, moved);
    this.renderGrid();
  }

  async executeSave() {
    if (!this.selectedFile || this.pageItems.length === 0) {
      if (window.ComprexaToast) {
        window.ComprexaToast.error(
          "Please ensure at least one page exists.",
          "Error",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Please ensure at least one page exists.");
      }
      return;
    }

    this.showProcessingState();

    try {
      const { PDFDocument, degrees } = window.PDFLib;
      const srcDoc = await PDFDocument.load(this.arrayBuffer, {
        ignoreEncryption: true,
      });
      const outputDoc = await PDFDocument.create();

      const total = this.pageItems.length;

      for (let i = 0; i < total; i++) {
        const item = this.pageItems[i];
        const percent = Math.round(((i + 1) / total) * 80) + 10;
        this.updateProgress(percent, `Processing page ${i + 1} of ${total}...`);

        const [copiedPage] = await outputDoc.copyPages(srcDoc, [
          item.originalIndex,
        ]);

        if (item.rotation && item.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle || 0;
          const newRotation = (currentRotation + item.rotation) % 360;
          copiedPage.setRotation(degrees(newRotation));
        }

        outputDoc.addPage(copiedPage);
      }

      this.updateProgress(95, "Saving organized PDF document...");

      const outputBytes = await outputDoc.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const outputFilenameInput = document.getElementById(
        "organize-output-filename",
      );
      let customName =
        outputFilenameInput && outputFilenameInput.value.trim()
          ? outputFilenameInput.value.trim()
          : `${this.selectedFile.name.replace(/\.pdf$/i, "")}-organized.pdf`;

      if (!customName.toLowerCase().endsWith(".pdf")) {
        customName += ".pdf";
      }

      this.showResultState({
        filename: customName,
        blobUrl,
        fileSize: blob.size,
        pageCount: total,
      });
    } catch (err) {
      console.error("[OrganizePdf] Error saving PDF:", err);
      this.hideProcessingState();
      if (window.ComprexaToast) {
        window.ComprexaToast.error(`Save failed: ${err.message}`, "Error");
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error(`Save failed: ${err.message}`);
      }
    }
  }

  showProcessingState() {
    const workspaceSection = document.getElementById(
      "organize-workspace-section",
    );
    const processingState = document.getElementById(
      "organize-processing-state",
    );

    if (workspaceSection) workspaceSection.style.display = "none";
    if (processingState) processingState.style.display = "block";

    this.updateProgress(10, "Rebuilding document structure...");
  }

  hideProcessingState() {
    const workspaceSection = document.getElementById(
      "organize-workspace-section",
    );
    const processingState = document.getElementById(
      "organize-processing-state",
    );

    if (processingState) processingState.style.display = "none";
    if (workspaceSection) workspaceSection.style.display = "block";
  }

  updateProgress(percent, desc) {
    const fill = document.getElementById("organize-progress-fill");
    const descEl = document.getElementById("organize-status-desc");
    if (fill) fill.style.width = `${percent}%`;
    if (descEl && desc) descEl.textContent = desc;
  }

  showResultState(result) {
    const processingState = document.getElementById(
      "organize-processing-state",
    );
    const resultSection = document.getElementById("organize-result-section");
    const resultFilename = document.getElementById("organize-result-filename");
    const resultMeta = document.getElementById("organize-result-meta");
    const downloadBtn = document.getElementById("btn-download-organized");
    const resultSummary = document.getElementById("organize-result-summary");

    if (processingState) processingState.style.display = "none";
    if (resultSection) resultSection.style.display = "block";

    if (resultFilename) resultFilename.textContent = result.filename;
    if (resultMeta)
      resultMeta.textContent = `${this.formatBytes(result.fileSize)} • ${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"}`;
    if (resultSummary) {
      resultSummary.textContent = `Reordered, updated, and assembled ${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} into a new PDF document.`;
    }

    if (downloadBtn) {
      downloadBtn.href = result.blobUrl;
      downloadBtn.download = result.filename;
    }

    if (window.ComprexaToast) {
      window.ComprexaToast.success("PDF organized successfully!", "Success");
    }
  }

  resetToUpload() {
    this.selectedFile = null;
    this.arrayBuffer = null;
    this.pdfJsDoc = null;
    this.pdfLibDoc = null;
    this.pageItems = [];
    this.selectedIds.clear();
    this.historyStack = [];
    this.redoStack = [];

    const uploadSection = document.getElementById("organize-upload-section");
    const workspaceSection = document.getElementById(
      "organize-workspace-section",
    );
    const processingState = document.getElementById(
      "organize-processing-state",
    );
    const resultSection = document.getElementById("organize-result-section");
    const fileInput = document.getElementById("organize-file-input");

    if (fileInput) fileInput.value = "";
    if (uploadSection) uploadSection.style.display = "block";
    if (workspaceSection) workspaceSection.style.display = "none";
    if (processingState) processingState.style.display = "none";
    if (resultSection) resultSection.style.display = "none";
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

// Auto-initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("organize-app-container")) {
    window.organizePdfUI = new OrganizePdfUI();
  }
});
