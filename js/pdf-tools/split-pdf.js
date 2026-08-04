/**
 * Comprexa Split PDF Engine & UI Controller
 * Production-ready, client-side PDF splitting module using PDF-Lib and JSZip.
 * Completely rebuilt from scratch.
 */

// Safe Toast Helper
function showSplitToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Core PDF Processing Engine for Split operations
 */
class SplitPdfEngine {
  /**
   * Format bytes to human readable string
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
   * Read and parse PDF document metadata (total pages, encryption check)
   */
  async loadPdfMetadata(file) {
    if (!window.PDFLib) {
      throw new Error(
        "PDF processing library (PDF-Lib) is not loaded. Please refresh the page.",
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { PDFDocument } = window.PDFLib;

    // Header check
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    if (headerStr !== "%PDF-") {
      throw new Error(
        `"${file.name}" does not appear to be a valid, uncorrupted PDF document.`,
      );
    }

    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err) {
      throw new Error(
        `Failed to parse "${file.name}". The document may be password-protected or corrupted.`,
      );
    }

    if (pdfDoc.isEncrypted) {
      throw new Error(
        `"${file.name}" is password-protected. Please remove password protection before splitting.`,
      );
    }

    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error(`"${file.name}" contains no readable pages.`);
    }

    return {
      pdfDoc,
      arrayBuffer,
      pageCount,
      name: file.name,
      size: file.size,
      formattedSize: SplitPdfEngine.formatBytes(file.size),
    };
  }

  /**
   * Perform PDF Split operation according to chosen method
   */
  async split(pdfMeta, options = {}, progressCallback = null) {
    const { PDFDocument } = window.PDFLib;
    const { pdfDoc, name, pageCount } = pdfMeta;
    const method = options.method || "all";

    let baseName = name.replace(/\.[^/.]+$/, "");
    if (!baseName) baseName = "document";

    let generatedParts = []; // Array of { filename, pdfBytes, pageCount }

    if (progressCallback) {
      progressCallback(10, "Preparing PDF pages for splitting...");
    }

    // METHOD 1: Split every single page
    if (method === "all") {
      for (let i = 0; i < pageCount; i++) {
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(copiedPages[0]);
        const bytes = await newDoc.save();

        generatedParts.push({
          filename: `${baseName}_page_${i + 1}.pdf`,
          bytes,
          pageCount: 1,
        });

        if (progressCallback) {
          const pct = Math.round(10 + ((i + 1) / pageCount) * 80);
          progressCallback(pct, `Extracted page ${i + 1} of ${pageCount}`);
        }
      }
    }

    // METHOD 2: Custom Page Ranges (e.g., "1-5, 6-10")
    else if (method === "range") {
      const rangesStr = (options.ranges || "").trim();
      if (!rangesStr) {
        throw new Error(
          "Please enter at least one valid page range (e.g. 1-5, 6-10).",
        );
      }

      const rawRanges = rangesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (rawRanges.length === 0) {
        throw new Error("Please enter valid page ranges separated by commas.");
      }

      for (let idx = 0; idx < rawRanges.length; idx++) {
        const rStr = rawRanges[idx];
        const match = rStr.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!match) {
          throw new Error(
            `Invalid page range "${rStr}". Please use format like "1-5" or "3".`,
          );
        }

        const startPage = parseInt(match[1], 10);
        const endPage = match[2] ? parseInt(match[2], 10) : startPage;

        if (isNaN(startPage) || isNaN(endPage)) {
          throw new Error(`Invalid page numbers in range "${rStr}".`);
        }

        if (startPage < 1 || endPage < 1) {
          throw new Error(
            `Page numbers must be 1 or greater (found "${rStr}").`,
          );
        }

        if (startPage > endPage) {
          throw new Error(
            `Start page (${startPage}) cannot be greater than end page (${endPage}) in range "${rStr}".`,
          );
        }

        if (endPage > pageCount) {
          throw new Error(
            `Page ${endPage} exceeds total document pages (${pageCount}).`,
          );
        }

        // Collect 0-indexed page indices
        const indices = [];
        for (let p = startPage - 1; p <= endPage - 1; p++) {
          indices.push(p);
        }

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(pdfDoc, indices);
        copiedPages.forEach((page) => newDoc.addPage(page));
        const bytes = await newDoc.save();

        const rangeName =
          startPage === endPage
            ? `page_${startPage}`
            : `pages_${startPage}-${endPage}`;
        generatedParts.push({
          filename: `${baseName}_${rangeName}.pdf`,
          bytes,
          pageCount: indices.length,
        });

        if (progressCallback) {
          const pct = Math.round(10 + ((idx + 1) / rawRanges.length) * 80);
          progressCallback(pct, `Processed range ${rStr}`);
        }
      }
    }

    // METHOD 3: Extract Selected Pages (e.g., "1, 3, 5-7")
    else if (method === "extract") {
      const extractStr = (options.extractPages || "").trim();
      if (!extractStr) {
        throw new Error(
          "Please enter the page numbers to extract (e.g. 1, 3, 5-7).",
        );
      }

      const rawTokens = extractStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (rawTokens.length === 0) {
        throw new Error("Please enter valid page numbers or ranges.");
      }

      const selectedPageIndices = [];
      for (const token of rawTokens) {
        const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!match) {
          throw new Error(
            `Invalid page entry "${token}". Use format like "1, 3, 5-7".`,
          );
        }

        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;

        if (start < 1 || end < 1) {
          throw new Error(
            `Page numbers must be 1 or greater (found "${token}").`,
          );
        }

        if (start > end) {
          throw new Error(
            `Start page cannot be greater than end page in "${token}".`,
          );
        }

        if (end > pageCount) {
          throw new Error(
            `Page ${end} exceeds total document pages (${pageCount}).`,
          );
        }

        for (let p = start; p <= end; p++) {
          selectedPageIndices.push(p - 1);
        }
      }

      if (selectedPageIndices.length === 0) {
        throw new Error("No valid pages selected for extraction.");
      }

      const outputMode = options.extractOutputMode || "single";

      if (outputMode === "single") {
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(pdfDoc, selectedPageIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));
        const bytes = await newDoc.save();

        generatedParts.push({
          filename: `${baseName}_extracted_pages.pdf`,
          bytes,
          pageCount: selectedPageIndices.length,
        });
      } else {
        // Multiple 1-page files for extracted pages
        for (let idx = 0; idx < selectedPageIndices.length; idx++) {
          const pageIdx = selectedPageIndices[idx];
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(pdfDoc, [pageIdx]);
          newDoc.addPage(copiedPages[0]);
          const bytes = await newDoc.save();

          generatedParts.push({
            filename: `${baseName}_page_${pageIdx + 1}.pdf`,
            bytes,
            pageCount: 1,
          });
        }
      }

      if (progressCallback) {
        progressCallback(85, "Finalizing extracted PDF pages...");
      }
    }

    // METHOD 4: Fixed Page Chunks (Every N pages)
    else if (method === "fixed") {
      const n = parseInt(options.fixedN, 10);
      if (isNaN(n) || n < 1) {
        throw new Error("Please specify a valid page interval (minimum 1).");
      }

      const totalChunks = Math.ceil(pageCount / n);

      for (let c = 0; c < totalChunks; c++) {
        const startIdx = c * n;
        const endIdx = Math.min((c + 1) * n - 1, pageCount - 1);

        const chunkIndices = [];
        for (let i = startIdx; i <= endIdx; i++) {
          chunkIndices.push(i);
        }

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(pdfDoc, chunkIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));
        const bytes = await newDoc.save();

        const pStart = startIdx + 1;
        const pEnd = endIdx + 1;
        const nameSuffix =
          pStart === pEnd ? `page_${pStart}` : `pages_${pStart}-${pEnd}`;

        generatedParts.push({
          filename: `${baseName}_part_${c + 1}_${nameSuffix}.pdf`,
          bytes,
          pageCount: chunkIndices.length,
        });

        if (progressCallback) {
          const pct = Math.round(10 + ((c + 1) / totalChunks) * 80);
          progressCallback(pct, `Created chunk ${c + 1} of ${totalChunks}`);
        }
      }
    }

    if (generatedParts.length === 0) {
      throw new Error(
        "No PDF pages were generated. Please check your split settings.",
      );
    }

    if (progressCallback) {
      progressCallback(92, "Creating download links...");
    }

    // Generate individual Blob URLs
    const outputFiles = generatedParts.map((part) => {
      const blob = new Blob([part.bytes], { type: "application/pdf" });
      return {
        filename: part.filename,
        blob,
        url: URL.createObjectURL(blob),
        sizeBytes: part.bytes.byteLength,
        formattedSize: SplitPdfEngine.formatBytes(part.bytes.byteLength),
        pageCount: part.pageCount,
      };
    });

    // Generate ZIP if multiple files
    let zipUrl = null;
    let zipFilename = null;

    if (outputFiles.length > 1 && window.JSZip) {
      if (progressCallback) {
        progressCallback(96, "Bundling files into ZIP archive...");
      }

      const zip = new window.JSZip();
      for (const item of generatedParts) {
        zip.file(item.filename, item.bytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      zipUrl = URL.createObjectURL(zipBlob);
      zipFilename = `${baseName}_split_files.zip`;
    }

    if (progressCallback) {
      progressCallback(100, "Split completed successfully!");
    }

    return {
      files: outputFiles,
      zipUrl,
      zipFilename,
      count: outputFiles.length,
    };
  }
}

/**
 * UI Controller for Split PDF Workspace
 */
class SplitPdfUI {
  constructor() {
    this.engine = new SplitPdfEngine();
    this.currentFile = null;
    this.currentMeta = null;
    this.createdBlobUrls = [];

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & Input
    this.dropzoneEl = document.getElementById("split-dropzone");
    this.fileInputEl = document.getElementById("split-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("split-upload-section");
    this.fileSectionEl = document.getElementById("split-file-section");
    this.optionsSectionEl = document.getElementById("split-options-section");
    this.processingStateEl = document.getElementById("split-processing-state");
    this.resultSectionEl = document.getElementById("split-result-section");

    // Displays
    this.filenameDisplay = document.getElementById("split-filename-display");
    this.filesizeDisplay = document.getElementById("split-filesize-display");
    this.pagecountDisplay = document.getElementById("split-pagecount-display");

    // Split Option Controls
    this.methodRadios = document.querySelectorAll('input[name="split_method"]');
    this.inputRanges = document.getElementById("input-split-ranges");
    this.inputExtractPages = document.getElementById(
      "input-split-extract-pages",
    );
    this.extractOutputRadios = document.querySelectorAll(
      'input[name="extract_output_mode"]',
    );
    this.inputFixedN = document.getElementById("input-split-fixed-n");

    // Method Panels
    this.panelRange = document.getElementById("method-panel-range");
    this.panelExtract = document.getElementById("method-panel-extract");
    this.panelFixed = document.getElementById("method-panel-fixed");

    // Buttons
    this.btnRemovePdf = document.getElementById("btn-remove-pdf");
    this.btnChangePdf = document.getElementById("btn-change-pdf");
    this.btnExecuteSplit = document.getElementById("btn-execute-split");
    this.btnStartOver = document.getElementById("btn-split-start-over");

    // Status & Results
    this.statusTitleEl = document.getElementById("split-status-title");
    this.statusDescEl = document.getElementById("split-status-desc");
    this.progressFillEl = document.getElementById("split-progress-fill");
    this.resultSummaryEl = document.getElementById("split-result-summary");
    this.zipContainerEl = document.getElementById(
      "split-zip-download-container",
    );
    this.zipFilenameDisplay = document.getElementById("zip-filename-display");
    this.btnDownloadAllZip = document.getElementById("btn-download-all-zip");
    this.generatedCountBadge = document.getElementById(
      "split-generated-count-badge",
    );
    this.generatedFilesList = document.getElementById(
      "split-generated-files-list",
    );
  }

  init() {
    if (!this.dropzoneEl || !this.fileInputEl) {
      return;
    }

    this.bindEvents();
    this.updateMethodPanels();
  }

  bindEvents() {
    // Browse button inside dropzone
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
    this.fileInputEl.addEventListener("change", async (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        await this.setPdfFile(selectedFiles[0]);
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

    this.dropzoneEl.addEventListener("drop", async (e) => {
      const dt = e.dataTransfer;
      const droppedFiles = Array.from(dt.files || []);
      if (droppedFiles.length > 0) {
        await this.setPdfFile(droppedFiles[0]);
      }
    });

    // Remove / Change PDF buttons
    if (this.btnRemovePdf) {
      this.btnRemovePdf.addEventListener("click", () => this.clearPdfFile());
    }

    if (this.btnChangePdf) {
      this.btnChangePdf.addEventListener("click", () =>
        this.fileInputEl.click(),
      );
    }

    // Radio change handlers for Split Methods
    this.methodRadios.forEach((radio) => {
      radio.addEventListener("change", () => this.updateMethodPanels());
    });

    // Execute Split Button
    if (this.btnExecuteSplit) {
      this.btnExecuteSplit.addEventListener("click", () => this.executeSplit());
    }

    // Start Over Button
    if (this.btnStartOver) {
      this.btnStartOver.addEventListener("click", () => this.resetView());
    }
  }

  /**
   * Set and validate uploaded PDF file (Replaces previous file)
   */
  async setPdfFile(file) {
    const validation = SplitPdfEngine.validateFile(file);
    if (!validation.valid) {
      showSplitToast(validation.error, "error", "Invalid PDF");
      return;
    }

    // Show loading indicator
    showSplitToast(`Loading "${file.name}"...`, "info", "Reading PDF");

    try {
      const meta = await this.engine.loadPdfMetadata(file);

      this.currentFile = file;
      this.currentMeta = meta;

      // Update UI
      if (this.filenameDisplay) this.filenameDisplay.textContent = meta.name;
      if (this.filesizeDisplay)
        this.filesizeDisplay.textContent = meta.formattedSize;
      if (this.pagecountDisplay) {
        this.pagecountDisplay.textContent = `${meta.pageCount} ${meta.pageCount === 1 ? "page" : "pages"}`;
      }

      // Default inputs to smart defaults
      if (this.inputRanges) {
        if (meta.pageCount > 1) {
          const mid = Math.floor(meta.pageCount / 2);
          this.inputRanges.value = `1-${mid}, ${mid + 1}-${meta.pageCount}`;
        } else {
          this.inputRanges.value = `1`;
        }
      }

      if (this.inputExtractPages) {
        this.inputExtractPages.value = meta.pageCount >= 3 ? `1, 3` : `1`;
      }

      this.uploadSectionEl.style.display = "none";
      this.fileSectionEl.style.display = "block";
      this.optionsSectionEl.style.display = "block";

      showSplitToast(
        `Loaded "${meta.name}" (${meta.pageCount} pages). Select split options below.`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error("Failed to load PDF:", err);
      showSplitToast(
        err.message || "Could not parse PDF file.",
        "error",
        "Parse Error",
      );
    }
  }

  /**
   * Clear current file and return to upload step
   */
  clearPdfFile() {
    this.currentFile = null;
    this.currentMeta = null;

    this.fileSectionEl.style.display = "none";
    this.optionsSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";
    this.uploadSectionEl.style.display = "block";

    showSplitToast("PDF file removed.", "info", "File Cleared");
  }

  /**
   * Dynamically toggle options panels based on selected split method
   */
  getSelectedMethod() {
    const checked = document.querySelector(
      'input[name="split_method"]:checked',
    );
    return checked ? checked.value : "all";
  }

  updateMethodPanels() {
    const method = this.getSelectedMethod();

    if (this.panelRange)
      this.panelRange.style.display = method === "range" ? "block" : "none";
    if (this.panelExtract)
      this.panelExtract.style.display = method === "extract" ? "block" : "none";
    if (this.panelFixed)
      this.panelFixed.style.display = method === "fixed" ? "block" : "none";
  }

  /**
   * Revoke existing generated blob URLs
   */
  cleanupBlobUrls() {
    for (const url of this.createdBlobUrls) {
      URL.revokeObjectURL(url);
    }
    this.createdBlobUrls = [];
  }

  /**
   * Execute Split PDF operation
   */
  async executeSplit() {
    if (!this.currentMeta || !this.currentMeta.pdfDoc) {
      showSplitToast(
        "Please upload a PDF file first.",
        "warning",
        "No File Loaded",
      );
      return;
    }

    const method = this.getSelectedMethod();
    const options = {
      method,
      ranges: this.inputRanges ? this.inputRanges.value : "",
      extractPages: this.inputExtractPages ? this.inputExtractPages.value : "",
      extractOutputMode:
        document.querySelector('input[name="extract_output_mode"]:checked')
          ?.value || "single",
      fixedN: this.inputFixedN ? this.inputFixedN.value : 2,
    };

    // UI state: Processing
    this.uploadSectionEl.style.display = "none";
    this.fileSectionEl.style.display = "none";
    this.optionsSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Splitting PDF Document...";
    this.statusDescEl.textContent =
      "Extracting pages with client-side PDF engine...";
    this.progressFillEl.style.width = "10%";

    try {
      this.cleanupBlobUrls();

      const result = await this.engine.split(
        this.currentMeta,
        options,
        (percent, statusMsg) => {
          this.progressFillEl.style.width = `${percent}%`;
          if (statusMsg) this.statusDescEl.textContent = statusMsg;
        },
      );

      // Track blob URLs for memory safety
      result.files.forEach((f) => this.createdBlobUrls.push(f.url));
      if (result.zipUrl) this.createdBlobUrls.push(result.zipUrl);

      // Render Result UI
      this.renderResults(result);

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showSplitToast(
        `Successfully generated ${result.count} PDF ${result.count === 1 ? "file" : "files"}!`,
        "success",
        "Split Complete",
      );
    } catch (err) {
      console.error("Split PDF Error:", err);
      this.processingStateEl.style.display = "none";

      // Restore UI for correction
      this.fileSectionEl.style.display = "block";
      this.optionsSectionEl.style.display = "block";

      showSplitToast(
        err.message || "An unexpected error occurred while splitting your PDF.",
        "error",
        "Split Failed",
      );
    }
  }

  /**
   * Render result cards and ZIP download link
   */
  renderResults(result) {
    if (this.resultSummaryEl) {
      this.resultSummaryEl.textContent = `Generated ${result.count} PDF ${result.count === 1 ? "document" : "documents"} from "${this.currentMeta.name}".`;
    }

    // Zip download container
    if (result.zipUrl) {
      this.zipContainerEl.style.display = "block";
      if (this.zipFilenameDisplay)
        this.zipFilenameDisplay.textContent = result.zipFilename;
      if (this.btnDownloadAllZip) {
        this.btnDownloadAllZip.href = result.zipUrl;
        this.btnDownloadAllZip.download = result.zipFilename;
      }
    } else {
      this.zipContainerEl.style.display = "none";
    }

    // Generated files count
    if (this.generatedCountBadge) {
      this.generatedCountBadge.textContent = `${result.count} ${result.count === 1 ? "file" : "files"}`;
    }

    // List of generated files
    if (this.generatedFilesList) {
      this.generatedFilesList.innerHTML = result.files
        .map(
          (fileItem, idx) => `
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.escapeHtml(fileItem.filename)}">
                ${this.escapeHtml(fileItem.filename)}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1px;">
                ${fileItem.formattedSize} • ${fileItem.pageCount} ${fileItem.pageCount === 1 ? "page" : "pages"}
              </div>
            </div>
          </div>
          <a href="${fileItem.url}" download="${this.escapeHtml(fileItem.filename)}" class="btn btn--outline btn--sm" style="margin-left: 12px; flex-shrink: 0; height: 34px; padding: 0 14px; font-weight: 600;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download</span>
          </a>
        </div>
      `,
        )
        .join("");
    }
  }

  escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Reset view to split another PDF
   */
  resetView() {
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";

    if (this.currentFile) {
      this.fileSectionEl.style.display = "block";
      this.optionsSectionEl.style.display = "block";
    } else {
      this.uploadSectionEl.style.display = "block";
    }
  }
}

// Global Export & Auto-Initialization
window.SplitPdfEngine = SplitPdfEngine;
window.SplitPdfUI = SplitPdfUI;

document.addEventListener("DOMContentLoaded", () => {
  const app = new SplitPdfUI();
  app.init();
  window.ComprexaSplitPdfApp = app;
});
