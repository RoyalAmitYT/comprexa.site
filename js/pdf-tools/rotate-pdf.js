/**
 * Comprexa Rotate PDF Controller
 * Clean, modern client-side PDF rotation tool built on PDF-Lib.
 */

class RotatePdfUI {
  constructor() {
    this.selectedFile = null;
    this.pdfDoc = null;
    this.pageCount = 0;
    this.init();
  }

  init() {
    this.bindDropzone();
    this.bindOptionsToggle();
    this.bindActionButtons();
  }

  bindDropzone() {
    const dropzone = document.getElementById("rotate-dropzone");
    const fileInput = document.getElementById("rotate-file-input");
    const chooseBtn = dropzone
      ? dropzone.querySelector(".file-uploader__choose-btn")
      : null;

    if (!dropzone || !fileInput) return;

    // Trigger file picker when Browse Files button or dropzone is clicked
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
        fileInput.value = ""; // reset input so re-selecting same file triggers change
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
        // Filter for PDF
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
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = window.PDFLib;
      this.pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      this.pageCount = this.pdfDoc.getPageCount();

      if (this.pageCount === 0) {
        throw new Error("PDF contains no pages.");
      }

      this.showFileSection();
    } catch (err) {
      console.error("[RotatePdf] Error loading PDF:", err);
      if (window.ComprexaToast) {
        window.ComprexaToast.error(
          "Failed to load PDF file. It may be encrypted or corrupted.",
          "PDF Error",
        );
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error("Failed to load PDF file.");
      }
    }
  }

  showFileSection() {
    const uploadSection = document.getElementById("rotate-upload-section");
    const fileSection = document.getElementById("rotate-file-section");
    const optionsSection = document.getElementById("rotate-options-section");
    const filenameDisplay = document.getElementById("rotate-filename-display");
    const filesizeDisplay = document.getElementById("rotate-filesize-display");
    const pagecountDisplay = document.getElementById(
      "rotate-pagecount-display",
    );
    const outputFilenameInput = document.getElementById(
      "rotate-output-filename",
    );

    if (uploadSection) uploadSection.style.display = "none";
    if (fileSection) fileSection.style.display = "block";
    if (optionsSection) optionsSection.style.display = "block";

    if (filenameDisplay) filenameDisplay.textContent = this.selectedFile.name;
    if (filesizeDisplay)
      filesizeDisplay.textContent = this.formatBytes(this.selectedFile.size);
    if (pagecountDisplay)
      pagecountDisplay.textContent = `${this.pageCount} ${this.pageCount === 1 ? "page" : "pages"}`;

    if (outputFilenameInput) {
      const defaultName =
        this.selectedFile.name.replace(/\.pdf$/i, "") + "-rotated.pdf";
      outputFilenameInput.value = defaultName;
    }
  }

  bindOptionsToggle() {
    const targetRadios = document.querySelectorAll(
      'input[name="rotate_target"]',
    );
    const customPagesPanel = document.getElementById(
      "rotate-custom-pages-panel",
    );

    targetRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (customPagesPanel) {
          customPagesPanel.style.display =
            radio.value === "custom" ? "block" : "none";
        }
      });
    });

    const removeBtn = document.getElementById("btn-remove-rotate-pdf");
    const changeBtn = document.getElementById("btn-change-rotate-pdf");
    const fileInput = document.getElementById("rotate-file-input");

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        this.resetToUpload();
      });
    }

    if (changeBtn && fileInput) {
      changeBtn.addEventListener("click", () => {
        fileInput.click();
      });
    }
  }

  bindActionButtons() {
    const executeBtn = document.getElementById("btn-execute-rotate");
    const startOverBtn = document.getElementById("btn-rotate-start-over");

    if (executeBtn) {
      executeBtn.addEventListener("click", () => {
        this.executeRotate();
      });
    }

    if (startOverBtn) {
      startOverBtn.addEventListener("click", () => {
        this.resetToUpload();
      });
    }
  }

  parsePageSelection(inputStr, totalPages) {
    if (!inputStr || !inputStr.trim()) {
      throw new Error("Please specify the page numbers or ranges to rotate.");
    }

    const pagesToRotate = new Set();
    const parts = inputStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
          throw new Error(`Invalid page range: "${part}". Example format: 1-5`);
        }

        if (start > totalPages || end > totalPages) {
          throw new Error(
            `Page range "${part}" exceeds total document pages (${totalPages}).`,
          );
        }

        for (let p = start; p <= end; p++) {
          pagesToRotate.add(p - 1); // 0-indexed
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (isNaN(pageNum) || pageNum < 1) {
          throw new Error(`Invalid page number: "${part}".`);
        }

        if (pageNum > totalPages) {
          throw new Error(
            `Page number ${pageNum} exceeds total document pages (${totalPages}).`,
          );
        }

        pagesToRotate.add(pageNum - 1); // 0-indexed
      }
    }

    if (pagesToRotate.size === 0) {
      throw new Error("No valid pages selected for rotation.");
    }

    return pagesToRotate;
  }

  async executeRotate() {
    if (!this.selectedFile || !this.pdfDoc) return;

    const angleRadio = document.querySelector(
      'input[name="rotate_angle"]:checked',
    );
    const targetRadio = document.querySelector(
      'input[name="rotate_target"]:checked',
    );
    const pagesInput = document.getElementById("input-rotate-pages");
    const outputFilenameInput = document.getElementById(
      "rotate-output-filename",
    );

    const angle = parseInt(angleRadio ? angleRadio.value : "90", 10);
    const targetMode = targetRadio ? targetRadio.value : "all";

    let pagesToRotate = new Set();

    if (targetMode === "custom") {
      try {
        pagesToRotate = this.parsePageSelection(
          pagesInput ? pagesInput.value : "",
          this.pageCount,
        );
      } catch (err) {
        if (window.ComprexaToast) {
          window.ComprexaToast.error(err.message, "Invalid Page Range");
        } else {
          if (window.ComprexaToast) window.ComprexaToast.error(err.message);
        }
        return;
      }
    } else {
      for (let i = 0; i < this.pageCount; i++) {
        pagesToRotate.add(i);
      }
    }

    // Show processing UI
    this.showProcessingState();

    try {
      const { degrees } = window.PDFLib;
      const pages = this.pdfDoc.getPages();

      pages.forEach((page, index) => {
        if (pagesToRotate.has(index)) {
          const currentRotation = page.getRotation().angle || 0;
          const newRotation = (currentRotation + angle) % 360;
          page.setRotation(degrees(newRotation));
        }
      });

      this.updateProgress(75, "Saving rotated PDF file...");

      const pdfBytes = await this.pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      let customName =
        outputFilenameInput && outputFilenameInput.value.trim()
          ? outputFilenameInput.value.trim()
          : `${this.selectedFile.name.replace(/\.pdf$/i, "")}-rotated.pdf`;

      if (!customName.toLowerCase().endsWith(".pdf")) {
        customName += ".pdf";
      }

      this.showResultState({
        filename: customName,
        blobUrl,
        fileSize: blob.size,
        rotatedCount: pagesToRotate.size,
        angle,
      });
    } catch (err) {
      console.error("[RotatePdf] Error during rotation:", err);
      this.hideProcessingState();
      if (window.ComprexaToast) {
        window.ComprexaToast.error(`Rotation failed: ${err.message}`, "Error");
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.error(`Rotation failed: ${err.message}`);
      }
    }
  }

  showProcessingState() {
    const fileSection = document.getElementById("rotate-file-section");
    const optionsSection = document.getElementById("rotate-options-section");
    const processingState = document.getElementById("rotate-processing-state");

    if (fileSection) fileSection.style.display = "none";
    if (optionsSection) optionsSection.style.display = "none";
    if (processingState) processingState.style.display = "block";

    this.updateProgress(25, "Updating page rotation matrices...");
  }

  hideProcessingState() {
    const fileSection = document.getElementById("rotate-file-section");
    const optionsSection = document.getElementById("rotate-options-section");
    const processingState = document.getElementById("rotate-processing-state");

    if (processingState) processingState.style.display = "none";
    if (fileSection) fileSection.style.display = "block";
    if (optionsSection) optionsSection.style.display = "block";
  }

  updateProgress(percent, desc) {
    const fill = document.getElementById("rotate-progress-fill");
    const descEl = document.getElementById("rotate-status-desc");
    if (fill) fill.style.width = `${percent}%`;
    if (descEl && desc) descEl.textContent = desc;
  }

  showResultState(result) {
    const processingState = document.getElementById("rotate-processing-state");
    const resultSection = document.getElementById("rotate-result-section");
    const resultFilename = document.getElementById("rotate-result-filename");
    const resultMeta = document.getElementById("rotate-result-meta");
    const downloadBtn = document.getElementById("btn-download-rotated");
    const resultSummary = document.getElementById("rotate-result-summary");

    if (processingState) processingState.style.display = "none";
    if (resultSection) resultSection.style.display = "block";

    if (resultFilename) resultFilename.textContent = result.filename;
    if (resultMeta)
      resultMeta.textContent = `${this.formatBytes(result.fileSize)} • Rotated ${result.rotatedCount} of ${this.pageCount} ${this.pageCount === 1 ? "page" : "pages"}`;
    if (resultSummary) {
      let angleText = "90° Clockwise";
      if (result.angle === 270) angleText = "90° Counter-Clockwise";
      if (result.angle === 180) angleText = "180° Flip";
      resultSummary.textContent = `Applied ${angleText} rotation to ${result.rotatedCount} ${result.rotatedCount === 1 ? "page" : "pages"}.`;
    }

    if (downloadBtn) {
      downloadBtn.href = result.blobUrl;
      downloadBtn.download = result.filename;
    }

    if (window.ComprexaToast) {
      window.ComprexaToast.success("PDF rotated successfully!", "Success");
    }
  }

  resetToUpload() {
    this.selectedFile = null;
    this.pdfDoc = null;
    this.pageCount = 0;

    const uploadSection = document.getElementById("rotate-upload-section");
    const fileSection = document.getElementById("rotate-file-section");
    const optionsSection = document.getElementById("rotate-options-section");
    const processingState = document.getElementById("rotate-processing-state");
    const resultSection = document.getElementById("rotate-result-section");
    const fileInput = document.getElementById("rotate-file-input");

    if (fileInput) fileInput.value = "";
    if (uploadSection) uploadSection.style.display = "block";
    if (fileSection) fileSection.style.display = "none";
    if (optionsSection) optionsSection.style.display = "none";
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
  if (document.getElementById("rotate-app-container")) {
    window.rotatePdfUI = new RotatePdfUI();
  }
});
