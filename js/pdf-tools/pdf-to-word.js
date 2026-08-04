/**
 * Comprexa PDF to Word Engine & UI Controller
 * Converts PDF documents into editable Microsoft Word (.docx) files.
 * Built from scratch following the Universal Tool standard.
 */

function showPdfWordToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Utility functions for PDF to Word
 */
class PdfToWordUtils {
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static validatePdfFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected." };
    }

    if (file.size === 0) {
      return { valid: false, error: `"${file.name}" is empty (0 bytes).` };
    }

    const name = file.name || "";
    const isPdfExt = name.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf" || file.type === "";

    if (!isPdfExt && !isPdfMime) {
      return {
        valid: false,
        error: `"${file.name}" is not a valid PDF document.`,
      };
    }

    return { valid: true };
  }
}

/**
 * Core Processing Engine for Extracting Text & Generating DOCX
 */
class PdfToWordEngine {
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
        "PDF processing library (PDF.js) is not loaded. Please refresh the page.",
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // Verify PDF header
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    if (headerStr !== "%PDF-") {
      throw new Error(`"${file.name}" is not a valid PDF document.`);
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

  /**
   * Extract text content page-by-page and group into structured lines & paragraphs
   */
  async extractPageLines(page) {
    const textContent = await page.getTextContent();
    const rawItems = textContent.items || [];

    if (rawItems.length === 0) {
      return [];
    }

    // Process items with coordinates
    const items = rawItems
      .filter((item) => item.str && item.str.trim().length > 0)
      .map((item) => {
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const fontSize = Math.abs(transform[3]) || Math.abs(item.height) || 12;
        const x = transform[4] || 0;
        const y = transform[5] || 0;
        const fontName = (item.fontName || "").toLowerCase();
        const isBold =
          fontName.includes("bold") ||
          fontName.includes("black") ||
          fontName.includes("heavy");
        const isItalic =
          fontName.includes("italic") || fontName.includes("oblique");

        return {
          str: item.str,
          x,
          y,
          fontSize,
          isBold,
          isItalic,
          width: item.width || 0,
        };
      });

    if (items.length === 0) {
      return [];
    }

    // Sort items vertically (Y descending: top to bottom), then horizontally (X ascending)
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 3) {
        return yDiff;
      }
      return a.x - b.x;
    });

    // Group items into logical lines
    const lines = [];
    let currentLine = [];
    let currentY = null;

    items.forEach((item) => {
      if (
        currentY === null ||
        Math.abs(item.y - currentY) > (item.fontSize * 0.4 || 4)
      ) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [item];
        currentY = item.y;
      } else {
        currentLine.push(item);
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Convert PDF document to DOCX blob using docx library
   */
  async convertToDocx(pdfDoc, options = {}, progressCallback = null) {
    const docxLib = window.docx;
    if (!docxLib) {
      throw new Error("Word document generator library (docx) is not loaded.");
    }

    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      PageBreak,
      AlignmentType,
    } = docxLib;

    const numPages = pdfDoc.numPages;
    const docChildren = [];

    for (let p = 1; p <= numPages; p++) {
      if (progressCallback) {
        const percent = Math.round(((p - 0.5) / numPages) * 90);
        progressCallback(
          percent,
          `Extracting text from page ${p} of ${numPages}...`,
        );
      }

      const page = await pdfDoc.getPage(p);
      const lines = await this.extractPageLines(page);

      if (p > 1) {
        docChildren.push(new Paragraph({ children: [new PageBreak()] }));
      }

      if (lines.length === 0) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Page ${p}: Scanned or image-only content]`,
                italics: true,
                color: "888888",
              }),
            ],
          }),
        );
        continue;
      }

      // Calculate median font size for heading detection
      const fontSizes = lines.flatMap((line) =>
        line.map((item) => item.fontSize),
      );
      fontSizes.sort((a, b) => a - b);
      const medianFontSize = fontSizes[Math.floor(fontSizes.length / 2)] || 12;

      // Group lines into paragraphs
      lines.forEach((lineItems) => {
        const fullLineText = lineItems
          .map((item) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (!fullLineText) return;

        const maxFontSize = Math.max(...lineItems.map((item) => item.fontSize));
        const isHeader = maxFontSize > medianFontSize * 1.35;
        const isSubHeader =
          maxFontSize > medianFontSize * 1.15 &&
          maxFontSize <= medianFontSize * 1.35;

        const runs = lineItems.map((item) => {
          return new TextRun({
            text: item.str + " ",
            bold: item.isBold || isHeader || isSubHeader,
            italics: item.isItalic,
            size: Math.round(Math.min(Math.max(item.fontSize, 8), 36) * 2), // Half-points in docx
          });
        });

        if (isHeader) {
          docChildren.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
              children: runs,
            }),
          );
        } else if (isSubHeader) {
          docChildren.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 90 },
              children: runs,
            }),
          );
        } else {
          docChildren.push(
            new Paragraph({
              spacing: { before: 60, after: 60, line: 276 },
              children: runs,
            }),
          );
        }
      });
    }

    if (progressCallback) {
      progressCallback(92, "Packaging editable Word document (.docx)...");
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const docxBlob = await Packer.toBlob(doc);
    const downloadUrl = URL.createObjectURL(docxBlob);

    let cleanFilename = options.outputFilename
      ? options.outputFilename.trim()
      : "document.docx";
    if (!cleanFilename.toLowerCase().endsWith(".docx")) {
      cleanFilename += ".docx";
    }

    if (progressCallback) {
      progressCallback(100, "Conversion completed successfully!");
    }

    return {
      blob: docxBlob,
      url: downloadUrl,
      filename: cleanFilename,
      totalPages: numPages,
      totalSizeBytes: docxBlob.size,
      totalSizeFormatted: PdfToWordUtils.formatBytes(docxBlob.size),
    };
  }
}

/**
 * UI Controller for PDF to Word
 */
class PdfToWordUI {
  constructor() {
    this.engine = new PdfToWordEngine();
    this.currentFile = null;
    this.pdfDoc = null;
    this.currentBlobUrl = null;

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & Inputs
    this.dropzoneEl = document.getElementById("pdf-word-dropzone");
    this.fileInputEl = document.getElementById("pdf-word-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("pdf-word-upload-section");
    this.configSectionEl = document.getElementById("pdf-word-config-section");
    this.processingStateEl = document.getElementById(
      "pdf-word-processing-state",
    );
    this.resultSectionEl = document.getElementById("pdf-word-result-section");

    // Displays
    this.fileNameDisplay = document.getElementById(
      "pdf-word-file-name-display",
    );
    this.fileMetaDisplay = document.getElementById(
      "pdf-word-file-meta-display",
    );
    this.outputFilenameInput = document.getElementById("word-output-filename");

    // Buttons
    this.btnChangeFile = document.getElementById("btn-word-change-file");
    this.btnExecuteConvert = document.getElementById(
      "btn-execute-word-convert",
    );
    this.btnDownloadDoc = document.getElementById("btn-download-word-doc");
    this.btnStartOver = document.getElementById("btn-word-start-over");

    // Status / Progress / Result Displays
    this.statusTitleEl = document.getElementById("word-status-title");
    this.statusDescEl = document.getElementById("word-status-desc");
    this.progressFillEl = document.getElementById("word-progress-fill");
    this.resultFilenameDisplay = document.getElementById(
      "word-result-filename-display",
    );
    this.resultMetaDisplay = document.getElementById(
      "word-result-meta-display",
    );
    this.resultSummary = document.getElementById("word-result-summary");
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

    // File Input Selection
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

    // Convert Action
    if (this.btnExecuteConvert) {
      this.btnExecuteConvert.addEventListener("click", () => {
        this.executeConversion();
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
    const validation = PdfToWordUtils.validatePdfFile(file);
    if (!validation.valid) {
      showPdfWordToast(validation.error, "error", "Invalid PDF");
      return;
    }

    try {
      showPdfWordToast("Reading PDF structure...", "info", "Reading PDF");
      this.pdfDoc = await this.engine.loadPdfDocument(file);
      this.currentFile = file;

      const numPages = this.pdfDoc.numPages;

      if (this.fileNameDisplay) this.fileNameDisplay.textContent = file.name;
      if (this.fileMetaDisplay) {
        this.fileMetaDisplay.textContent = `${PdfToWordUtils.formatBytes(file.size)} • ${numPages} ${
          numPages === 1 ? "Page" : "Pages"
        }`;
      }

      if (this.outputFilenameInput) {
        const base = file.name.replace(/\.[^/.]+$/, "");
        this.outputFilenameInput.value = `${base}.docx`;
      }

      this.uploadSectionEl.style.display = "none";
      this.configSectionEl.style.display = "block";

      showPdfWordToast(
        `Loaded "${file.name}" (${numPages} pages).`,
        "success",
        "PDF Loaded",
      );
    } catch (err) {
      console.error("Load PDF Error:", err);
      showPdfWordToast(
        err.message || "Failed to open PDF document.",
        "error",
        "Error",
      );
    }
  }

  async executeConversion() {
    if (!this.currentFile || !this.pdfDoc) {
      showPdfWordToast(
        "Please select a PDF file first.",
        "warning",
        "No PDF Selected",
      );
      return;
    }

    this.configSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Converting PDF to Word...";
    this.statusDescEl.textContent = "Extracting document text and layout...";
    this.progressFillEl.style.width = "10%";

    try {
      const outputName = this.outputFilenameInput
        ? this.outputFilenameInput.value
        : "document.docx";

      const result = await this.engine.convertToDocx(
        this.pdfDoc,
        { outputFilename: outputName },
        (percent, statusMsg) => {
          this.progressFillEl.style.width = `${percent}%`;
          if (statusMsg) this.statusDescEl.textContent = statusMsg;
        },
      );

      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = result.url;

      if (this.resultFilenameDisplay)
        this.resultFilenameDisplay.textContent = result.filename;
      if (this.resultMetaDisplay) {
        this.resultMetaDisplay.textContent = `${result.totalSizeFormatted} • ${result.totalPages} ${
          result.totalPages === 1 ? "Page" : "Pages"
        } • Editable Word Document`;
      }
      if (this.resultSummary) {
        this.resultSummary.textContent = `Successfully converted ${result.totalPages} PDF pages into an editable Microsoft Word document (.docx).`;
      }

      if (this.btnDownloadDoc) {
        this.btnDownloadDoc.href = result.url;
        this.btnDownloadDoc.download = result.filename;
      }

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showPdfWordToast(
        "Your Word document is ready for download!",
        "success",
        "Conversion Complete",
      );
    } catch (err) {
      console.error("PDF to Word Error:", err);
      this.processingStateEl.style.display = "none";
      this.configSectionEl.style.display = "block";

      showPdfWordToast(
        err.message || "Failed to convert PDF to Word document.",
        "error",
        "Conversion Failed",
      );
    }
  }

  resetView() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.currentFile = null;
    this.pdfDoc = null;

    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";
    this.configSectionEl.style.display = "none";
    this.uploadSectionEl.style.display = "block";
  }
}

// Global Export & Auto-Initialization
window.PdfToWordEngine = PdfToWordEngine;
window.PdfToWordUI = PdfToWordUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new PdfToWordUI();
  app.init();
  window.ComprexaPdfToWordApp = app;
});
