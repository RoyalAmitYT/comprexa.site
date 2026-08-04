/**
 * Comprexa PDF to Images Engine & UI Controller
 * Client-side conversion of PDF pages into PNG/JPG images with ZIP packaging.
 * Built from scratch following the Universal Tool standard.
 */

function showPdfImagesToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Utility functions for PDF to Images Tool
 */
class PdfToImagesUtils {
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static validatePdfFile(file) {
    if (!file) {
      return { valid: false, error: "No file provided." };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: `"${file.name}" is an empty file (0 bytes).`,
      };
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
   * Parse range strings like "1, 3-5, 8" into an array of page numbers [1, 3, 4, 5, 8]
   */
  static parsePageRange(rangeStr, totalPages) {
    if (!rangeStr || !rangeStr.trim()) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set();
    const parts = rangeStr.split(",");

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          throw new Error(
            `Invalid page range component: "${part}". Ensure numbers are positive and in order.`,
          );
        }

        for (let p = start; p <= Math.min(end, totalPages); p++) {
          pages.add(p);
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          throw new Error(
            `Page number ${part} is out of bounds (1-${totalPages}).`,
          );
        }
        pages.add(pageNum);
      }
    }

    const result = Array.from(pages).sort((a, b) => a - b);
    if (result.length === 0) {
      throw new Error("No valid pages selected in specified range.");
    }

    return result;
  }
}

/**
 * Processing Engine for Rendering PDF Pages
 */
class PdfToImagesEngine {
  constructor() {
    this.initWorker();
  }

  initWorker() {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  async loadPdfDocument(file) {
    if (!window.pdfjsLib) {
      throw new Error(
        "PDF processing engine (PDF.js) is not loaded. Please reload the page.",
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // Sanity check header
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    if (headerStr !== "%PDF-") {
      throw new Error(
        `"${file.name}" is not a valid or readable PDF document.`,
      );
    }

    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      return pdfDoc;
    } catch (err) {
      if (err && err.name === "PasswordException") {
        throw new Error(
          `"${file.name}" is password-protected. Please unlock it before converting.`,
        );
      }
      throw new Error(
        `Failed to read "${file.name}". The document may be corrupted or encrypted.`,
      );
    }
  }

  async renderPageToBlob(pdfDoc, pageNum, options = {}) {
    const format = options.format || "png";
    const quality = parseFloat(options.quality) || 0.9;
    const scale = parseFloat(options.resolution) || 2.0;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: format === "png" });

    if (format === "jpg" || format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    const mimeType =
      format === "jpg" || format === "jpeg" ? "image/jpeg" : "image/png";

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          resolve({
            pageNum,
            blob,
            url,
            width: canvas.width,
            height: canvas.height,
            mimeType,
            format: format.toUpperCase(),
            sizeFormatted: PdfToImagesUtils.formatBytes(blob.size),
          });
        },
        mimeType,
        quality,
      );
    });
  }

  async createZipPackage(convertedImages, baseFilename = "pdf-images") {
    if (!window.JSZip) {
      throw new Error("ZIP packaging engine (JSZip) is not loaded.");
    }

    const zip = new window.JSZip();
    const folder = zip.folder(baseFilename);

    convertedImages.forEach((img) => {
      const ext =
        img.format.toLowerCase() === "jpeg" ? "jpg" : img.format.toLowerCase();
      const filename = `page-${String(img.pageNum).padStart(3, "0")}.${ext}`;
      folder.file(filename, img.blob);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    return {
      blob: zipBlob,
      url: zipUrl,
      filename: `${baseFilename}-images.zip`,
    };
  }
}

/**
 * UI Controller for PDF to Images
 */
class PdfToImagesUI {
  constructor() {
    this.engine = new PdfToImagesEngine();
    this.currentFile = null;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.convertedImages = [];
    this.createdBlobUrls = [];

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & Inputs
    this.dropzoneEl = document.getElementById("pdf-images-dropzone");
    this.fileInputEl = document.getElementById("pdf-images-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("pdf-images-upload-section");
    this.configSectionEl = document.getElementById("pdf-images-config-section");
    this.processingStateEl = document.getElementById(
      "pdf-images-processing-state",
    );
    this.resultSectionEl = document.getElementById("pdf-images-result-section");

    // Display fields
    this.fileNameDisplay = document.getElementById("pdf-file-name-display");
    this.fileMetaDisplay = document.getElementById("pdf-file-meta-display");
    this.rangeContainer = document.getElementById("page-range-container");
    this.rangeInput = document.getElementById("page-range-input");

    // Settings
    this.formatSelect = document.getElementById("format-select");
    this.qualitySelect = document.getElementById("quality-select");
    this.resolutionSelect = document.getElementById("resolution-select");
    this.pageOptions = document.getElementsByName("page-option");

    // Buttons
    this.btnChangeFile = document.getElementById("btn-change-file");
    this.btnExecuteConvert = document.getElementById("btn-execute-convert");
    this.btnDownloadAllZip = document.getElementById("btn-download-all-zip");
    this.btnStartOver = document.getElementById("btn-convert-start-over");

    // Status / Progress / Results
    this.statusTitleEl = document.getElementById("convert-status-title");
    this.statusDescEl = document.getElementById("convert-status-desc");
    this.progressFillEl = document.getElementById("convert-progress-fill");
    this.resultSummaryText = document.getElementById("result-summary-text");
    this.previewsGrid = document.getElementById("image-previews-grid");
  }

  init() {
    if (!this.dropzoneEl || !this.fileInputEl) {
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Browse File button
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

    // Dropzone Click
    this.dropzoneEl.addEventListener("click", (e) => {
      if (e.target === this.fileInputEl) return;
      this.fileInputEl.click();
    });

    // File Input Select
    this.fileInputEl.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        this.handleFileSelected(files[0]);
      }
      this.fileInputEl.value = "";
    });

    // Drag & Drop
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
      const files = dt.files;
      if (files && files.length > 0) {
        this.handleFileSelected(files[0]);
      }
    });

    // Change File
    if (this.btnChangeFile) {
      this.btnChangeFile.addEventListener("click", () => {
        this.fileInputEl.click();
      });
    }

    // Page Option Toggle (All vs Range)
    this.pageOptions.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "range") {
          this.rangeContainer.style.display = "block";
        } else {
          this.rangeContainer.style.display = "none";
        }
      });
    });

    // Execute Convert
    if (this.btnExecuteConvert) {
      this.btnExecuteConvert.addEventListener("click", () => {
        this.executeConversion();
      });
    }

    // Download All ZIP
    if (this.btnDownloadAllZip) {
      this.btnDownloadAllZip.addEventListener("click", () => {
        this.downloadAllAsZip();
      });
    }

    // Start Over
    if (this.btnStartOver) {
      this.btnStartOver.addEventListener("click", () => {
        this.resetView();
      });
    }
  }

  async handleFileSelected(file) {
    const validation = PdfToImagesUtils.validatePdfFile(file);
    if (!validation.valid) {
      showPdfImagesToast(validation.error, "error", "Invalid PDF");
      return;
    }

    try {
      showPdfImagesToast("Analyzing PDF pages...", "info", "Reading PDF");
      this.pdfDoc = await this.engine.loadPdfDocument(file);
      this.currentFile = file;
      this.totalPages = this.pdfDoc.numPages;

      // Update UI
      if (this.fileNameDisplay) this.fileNameDisplay.textContent = file.name;
      if (this.fileMetaDisplay) {
        this.fileMetaDisplay.textContent = `${PdfToImagesUtils.formatBytes(file.size)} • ${this.totalPages} ${
          this.totalPages === 1 ? "Page" : "Pages"
        }`;
      }

      this.uploadSectionEl.style.display = "none";
      this.configSectionEl.style.display = "block";

      showPdfImagesToast(
        `Loaded "${file.name}" (${this.totalPages} pages).`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error("Load PDF Error:", err);
      showPdfImagesToast(
        err.message || "Failed to open PDF document.",
        "error",
        "Error",
      );
    }
  }

  getSelectedPageOption() {
    for (let radio of this.pageOptions) {
      if (radio.checked) return radio.value;
    }
    return "all";
  }

  async executeConversion() {
    if (!this.currentFile || !this.pdfDoc) {
      showPdfImagesToast(
        "Please upload a PDF file first.",
        "warning",
        "No PDF Selected",
      );
      return;
    }

    let targetPages = [];
    const pageOpt = this.getSelectedPageOption();

    try {
      if (pageOpt === "range") {
        const rangeText = this.rangeInput ? this.rangeInput.value : "";
        targetPages = PdfToImagesUtils.parsePageRange(
          rangeText,
          this.totalPages,
        );
      } else {
        targetPages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }
    } catch (err) {
      showPdfImagesToast(err.message, "warning", "Invalid Page Selection");
      return;
    }

    const options = {
      format: this.formatSelect ? this.formatSelect.value : "png",
      quality: this.qualitySelect ? this.qualitySelect.value : "0.90",
      resolution: this.resolutionSelect ? this.resolutionSelect.value : "2",
    };

    // UI state -> Processing
    this.configSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Converting PDF to Images...";
    this.statusDescEl.textContent = `Rendering page 1 of ${targetPages.length}...`;
    this.progressFillEl.style.width = "5%";

    this.cleanupBlobUrls();
    this.convertedImages = [];

    try {
      const totalCount = targetPages.length;

      for (let i = 0; i < totalCount; i++) {
        const pageNum = targetPages[i];
        const percent = Math.round(((i + 0.5) / totalCount) * 100);

        this.statusDescEl.textContent = `Rendering page ${pageNum} (${i + 1} of ${totalCount})...`;
        this.progressFillEl.style.width = `${percent}%`;

        const imgData = await this.engine.renderPageToBlob(
          this.pdfDoc,
          pageNum,
          options,
        );
        this.convertedImages.push(imgData);
        this.createdBlobUrls.push(imgData.url);
      }

      this.progressFillEl.style.width = "100%";

      // Render Result Previews
      this.renderPreviewCards();

      if (this.resultSummaryText) {
        const fmt = options.format.toUpperCase();
        this.resultSummaryText.textContent = `Successfully rendered ${this.convertedImages.length} ${fmt} ${
          this.convertedImages.length === 1 ? "image" : "images"
        } from "${this.currentFile.name}".`;
      }

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showPdfImagesToast(
        `Converted ${this.convertedImages.length} pages to images!`,
        "success",
        "Conversion Complete",
      );
    } catch (err) {
      console.error("Conversion Error:", err);
      this.processingStateEl.style.display = "none";
      this.configSectionEl.style.display = "block";

      showPdfImagesToast(
        err.message || "Failed to render PDF pages into images.",
        "error",
        "Conversion Failed",
      );
    }
  }

  renderPreviewCards() {
    if (!this.previewsGrid) return;

    this.previewsGrid.innerHTML = this.convertedImages
      .map(
        (img, idx) => `
      <div class="card" style="padding: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Image Preview Thumbnail -->
        <div style="width: 100%; height: 200px; background: var(--bg-surface-hover); border-radius: var(--radius-md); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 1px solid var(--border-subtle);">
          <img src="${img.url}" alt="Page ${img.pageNum}" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: var(--shadow-sm);" />
        </div>

        <!-- Info & Actions -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span class="badge badge--primary badge--pill" style="font-weight: 700; font-size: 0.78rem;">Page ${img.pageNum}</span>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${img.format}</span>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
            ${img.width} × ${img.height} px • ${img.sizeFormatted}
          </div>

          <a href="${img.url}" download="page-${img.pageNum}.${img.format.toLowerCase()}" class="btn btn--outline btn--sm btn--full" style="font-weight: 600;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download Image</span>
          </a>
        </div>

      </div>
    `,
      )
      .join("");
  }

  async downloadAllAsZip() {
    if (!this.convertedImages || this.convertedImages.length === 0) return;

    try {
      showPdfImagesToast("Generating ZIP package...", "info", "Creating ZIP");
      const baseName = this.currentFile
        ? this.currentFile.name.replace(/\.[^/.]+$/, "")
        : "pdf-images";

      const zipPackage = await this.engine.createZipPackage(
        this.convertedImages,
        baseName,
      );
      this.createdBlobUrls.push(zipPackage.url);

      const link = document.createElement("a");
      link.href = zipPackage.url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(zipPackage.filename) : String(zipPackage.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showPdfImagesToast("ZIP download started!", "success", "Downloaded ZIP");
    } catch (err) {
      console.error("ZIP Error:", err);
      showPdfImagesToast(
        err.message || "Failed to create ZIP package.",
        "error",
        "ZIP Failed",
      );
    }
  }

  cleanupBlobUrls() {
    this.createdBlobUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    this.createdBlobUrls = [];
  }

  resetView() {
    this.cleanupBlobUrls();
    this.convertedImages = [];
    this.currentFile = null;
    this.pdfDoc = null;
    this.totalPages = 0;

    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";
    this.configSectionEl.style.display = "none";
    this.uploadSectionEl.style.display = "block";

    if (this.rangeInput) this.rangeInput.value = "";
  }
}

// Global Export & Auto-Initialization
window.PdfToImagesEngine = PdfToImagesEngine;
window.PdfToImagesUI = PdfToImagesUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new PdfToImagesUI();
  app.init();
  window.ComprexaPdfToImagesApp = app;
});
