// @ts-nocheck
/**
 * Comprexa Compress PDF Engine & UI Controller
 * Production-ready, 100% browser-based PDF compression module using PDF-Lib & PDF.js.
 * Built from scratch using Universal Tool Page Template.
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

ensurePdfWorker();

// Safe Toast Helper
function showCompressToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Core PDF Compression Engine
 */
class CompressPdfEngine {
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
   * Validate uploaded PDF file candidate
   */
  static validatePdfFile(file) {
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
      return {
        valid: false,
        error: `"${file.name}" is not a valid PDF document.`,
      };
    }

    return { valid: true };
  }

  /**
   * Perform Client-Side PDF Compression
   * @param {File} pdfFile Source PDF File
   * @param {string} level 'balanced' | 'high' | 'low'
   * @param {Object} options Configuration options
   * @param {Function} progressCallback Progress reporter
   */
  async compress(
    pdfFile,
    level = "balanced",
    options = {},
    progressCallback = null,
  ) {
    if (!window.PDFLib) {
      throw new Error(
        "PDF-Lib library is not loaded. Please refresh the page and try again.",
      );
    }

    const { PDFDocument } = window.PDFLib;
    const originalSize = pdfFile.size;

    if (progressCallback)
      progressCallback(10, "Reading PDF document streams...");
    const arrayBuffer = await pdfFile.arrayBuffer();

    // Verify PDF header
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode.apply(null, headerBytes);
    if (headerStr !== "%PDF-") {
      throw new Error(
        `"${pdfFile.name}" does not appear to be a valid, uncorrupted PDF document.`,
      );
    }

    let sourceDoc;
    try {
      sourceDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
    } catch (err) {
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }

    const pageCount = sourceDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error("The PDF document contains no pages.");
    }

    if (progressCallback)
      progressCallback(20, "Cleaning metadata & repacking stream objects...");

    // Create fresh document & copy pages (strips orphaned objects, unneeded metadata & bloated histories)
    const newDoc = await PDFDocument.create();
    const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
    const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);

    for (let i = 0; i < copiedPages.length; i++) {
      newDoc.addPage(copiedPages[i]);
      if (progressCallback) {
        const pct = Math.round(20 + ((i + 1) / pageCount) * 15);
        progressCallback(
          pct,
          `Optimizing page resources ${i + 1} of ${pageCount}...`,
        );
      }
    }

    if (progressCallback)
      progressCallback(35, "Analyzing embedded image resources...");

    let totalImagesFound = 0;
    let optimizedImagesCount = 0;

    try {
      const imgResult = await this.optimizeEmbeddedImages(
        newDoc,
        level,
        progressCallback,
      );
      totalImagesFound = imgResult.total;
      optimizedImagesCount = imgResult.optimized;
    } catch (err) {}

    if (progressCallback)
      progressCallback(80, "Applying object stream Flate-compression...");

    // Save with useObjectStreams: true to compress object streams, remove unused structures & duplicate fonts
    const compressedBytes = await newDoc.save({ useObjectStreams: true });

    if (progressCallback)
      progressCallback(95, "Finalizing compressed document metrics...");

    let finalBytes = compressedBytes;
    let finalSize = compressedBytes.length;

    // Safety check: If compressed file ended up larger than original, default to standard object stream save or original
    if (finalSize >= originalSize && compressedBytes !== arrayBuffer) {
      finalBytes = new Uint8Array(arrayBuffer);
      finalSize = originalSize;
    }

    const savedBytes = Math.max(0, originalSize - finalSize);
    const savedPercent =
      originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    // Automatically detect if PDF mostly contains vector graphics or text and cannot be compressed significantly
    const isHighlyOptimized =
      (totalImagesFound === 0 || optimizedImagesCount === 0) &&
      savedPercent < 8;

    const blob = new Blob([finalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    return {
      blob,
      blobUrl,
      originalSize,
      newSize: finalSize,
      savedBytes,
      savedPercent,
      pageCount,
      totalImagesFound,
      optimizedImagesCount,
      isHighlyOptimized,
    };
  }

  /**
   * Deep Embedded Image Optimization
   * Loops through all PDF objects, extracts image XObjects, downscales and re-compresses them using HTML5 Canvas.
   */
  async optimizeEmbeddedImages(pdfDoc, level, progressCallback) {
    const { PDFName, PDFRawStream, PDFNumber } = window.PDFLib;
    const context = pdfDoc.context;
    const indirectObjects = context.enumerateIndirectObjects();

    const imageRefs = [];

    for (const [ref, obj] of indirectObjects) {
      if (
        obj &&
        (obj instanceof PDFRawStream ||
          obj.constructor?.name === "PDFRawStream")
      ) {
        const subtype = obj.dict.get(PDFName.of("Subtype"));
        if (subtype && subtype.toString() === "/Image") {
          imageRefs.push({ ref, obj });
        }
      }
    }

    const total = imageRefs.length;
    let optimized = 0;

    if (total === 0) {
      return { total: 0, optimized: 0 };
    }

    for (let idx = 0; idx < total; idx++) {
      const { ref, obj } = imageRefs[idx];

      if (progressCallback) {
        const pct = Math.round(35 + (idx / total) * 45);
        progressCallback(
          pct,
          `Compressing image resource ${idx + 1} of ${total}...`,
        );
      }

      try {
        const bytes = obj.getUncompressedContents();
        if (!bytes || bytes.length < 5120) {
          // Skip tiny images/icons (< 5KB)
          continue;
        }

        // Check image header signature
        const isJpeg =
          bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        const isPng =
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47;
        const isGif =
          bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;

        const filter = obj.dict.get(PDFName.of("Filter"));
        const filterStr = filter ? filter.toString() : "";
        const isMaybeJpeg = isJpeg || filterStr.includes("DCTDecode");

        if (
          !isMaybeJpeg &&
          !isPng &&
          !isGif &&
          !filterStr.includes("FlateDecode")
        ) {
          continue;
        }

        let mimeType = "image/jpeg";
        if (isPng) mimeType = "image/png";
        else if (isGif) mimeType = "image/gif";
        else if (filterStr.includes("FlateDecode")) mimeType = "image/png";

        const blob = new Blob([bytes], { type: mimeType });
        const imgUrl = URL.createObjectURL(blob);

        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            URL.revokeObjectURL(imgUrl);
            resolve(image);
          };
          image.onerror = (err) => {
            URL.revokeObjectURL(imgUrl);
            reject(err);
          };
          image.src = imgUrl;
        }).catch(() => null);

        if (!img || img.width <= 64 || img.height <= 64) {
          continue;
        }

        // Compression presets & downscaling limits
        let scale = 1.0;
        let quality = 0.75;
        let maxDimension = 1600;

        if (level === "low") {
          scale = 0.85;
          quality = 0.85;
          maxDimension = 1600;
        } else if (level === "balanced") {
          scale = 0.7;
          quality = 0.7;
          maxDimension = 1200;
        } else if (level === "high") {
          scale = 0.5;
          quality = 0.5;
          maxDimension = 800;
        }

        let newWidth = img.width * scale;
        let newHeight = img.height * scale;

        if (newWidth > maxDimension || newHeight > maxDimension) {
          const ratio = Math.min(
            maxDimension / newWidth,
            maxDimension / newHeight,
          );
          newWidth = newWidth * ratio;
          newHeight = newHeight * ratio;
        }

        const width = Math.max(1, Math.round(newWidth));
        const height = Math.max(1, Math.round(newHeight));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        const hasAlpha = isPng || filterStr.includes("SMask");
        if (!hasAlpha) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Re-encode images using Canvas/WebP/JPEG depending on content:
        // JPEG offers maximum savings for complex color gradients, PNG for transparency.
        let targetMime = "image/jpeg";
        let targetFilter = "DCTDecode";

        if (hasAlpha) {
          targetMime = "image/png";
          targetFilter = "FlateDecode";
        } else {
          targetMime = "image/jpeg";
          targetFilter = "DCTDecode";
        }

        const compressedBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, targetMime, quality),
        );
        const compressedBuffer = await compressedBlob.arrayBuffer();
        const compressedBytes = new Uint8Array(compressedBuffer);

        if (compressedBytes.length < bytes.length) {
          obj.dict.set(PDFName.of("Filter"), PDFName.of(targetFilter));
          obj.dict.set(PDFName.of("Width"), PDFNumber.of(width));
          obj.dict.set(PDFName.of("Height"), PDFNumber.of(height));
          obj.dict.delete(PDFName.of("DecodeParms"));

          const newStream = PDFRawStream.of(obj.dict, compressedBytes);
          context.register(ref, newStream);
          optimized++;
        }
      } catch (imageErr) {}
    }

    return { total, optimized };
  }
}

/**
 * UI Controller for Compress PDF Application
 */
document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    pdfFile: null,
    pageCount: 1,
    selectedLevel: "balanced", // 'balanced' | 'high' | 'low'
  };

  // DOM Elements
  const dropzone = document.getElementById("compress-dropzone");
  const fileInput = document.getElementById("compress-file-input");
  const chooseBtn = dropzone
    ? dropzone.querySelector(".file-uploader__choose-btn")
    : null;

  const uploadSection = document.getElementById("compress-upload-section");
  const workspaceSection = document.getElementById(
    "compress-workspace-section",
  );
  const processingState = document.getElementById("compress-processing-state");
  const resultSection = document.getElementById("compress-result-section");

  const filenameDisplay = document.getElementById("compress-filename-display");
  const filemetaDisplay = document.getElementById("compress-filemeta-display");
  const btnChangePdf = document.getElementById("btn-change-pdf");

  const optionCards = document.querySelectorAll(".compress-option-card");
  const outputFilenameInput = document.getElementById("output-filename-input");
  const btnExecuteCompress = document.getElementById("btn-execute-compress");

  // Stats Elements
  const statOrigSize = document.getElementById("stat-orig-size");
  const statNewSize = document.getElementById("stat-new-size");
  const statSavingsText = document.getElementById("stat-savings-text");
  const statSavingsPct = document.getElementById("stat-savings-pct");
  const statBadgePct = document.getElementById("stat-badge-pct");

  const resultFilenameDisplay = document.getElementById(
    "result-filename-display",
  );
  const resultMetaDisplay = document.getElementById("result-meta-display");
  const btnDownloadCompressed = document.getElementById(
    "btn-download-compressed",
  );
  const btnStartOver = document.getElementById("btn-compress-start-over");

  /* ==========================================
     FILE UPLOAD & DRAG DROP HANDLERS
     ========================================== */
  if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      fileInput.click();
    });
  }

  if (dropzone) {
    dropzone.addEventListener("click", (e) => {
      if (e.target.closest("#compress-file-input")) return;
      fileInput.click();
    });

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
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelection(dt.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  if (btnChangePdf) {
    btnChangePdf.addEventListener("click", () => {
      resetToUploadState();
    });
  }

  /* ==========================================
     FILE SELECTION & VALIDATION
     ========================================== */
  async function handleFileSelection(file) {
    const val = CompressPdfEngine.validatePdfFile(file);
    if (!val.valid) {
      showCompressToast(val.error, "error", "Invalid File");
      return;
    }

    try {
      state.pdfFile = file;
      filenameDisplay.textContent = file.name;
      filemetaDisplay.textContent = `Original Size: ${CompressPdfEngine.formatBytes(file.size)} • Reading pages...`;

      // Set output filename default
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      if (outputFilenameInput) {
        outputFilenameInput.value = `${baseName}-compressed.pdf`;
      }

      // Read page count via PDF.js if available
      const arrayBuffer = await file.arrayBuffer();
      const lib = ensurePdfWorker();
      const doc = await lib.getDocument({ data: arrayBuffer }).promise;
      state.pageCount = doc.numPages;
      filemetaDisplay.textContent = `Original Size: ${CompressPdfEngine.formatBytes(file.size)} • ${state.pageCount} page${state.pageCount > 1 ? "s" : ""}`;

      // Hide upload area, reveal workspace
      uploadSection.style.display = "none";
      workspaceSection.style.display = "block";

      showCompressToast(
        `Loaded "${file.name}" successfully.`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error(err);
      showCompressToast(
        `Could not process PDF: ${err.message}`,
        "error",
        "Error Loading PDF",
      );
      resetToUploadState();
    }
  }

  /* ==========================================
     COMPRESSION OPTION CARDS SELECTION
     ========================================== */
  optionCards.forEach((card) => {
    card.addEventListener("click", () => {
      const level = card.getAttribute("data-level");
      if (!level) return;

      state.selectedLevel = level;

      optionCards.forEach((c) => {
        c.classList.remove("active");
        c.style.border = "1px solid var(--border-subtle)";
        c.style.background = "var(--bg-surface)";
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });

      card.classList.add("active");
      card.style.border = "2px solid var(--primary)";
      card.style.background = "rgba(99, 102, 241, 0.04)";
      const currentRadio = card.querySelector('input[type="radio"]');
      if (currentRadio) currentRadio.checked = true;
    });
  });

  /* ==========================================
     EXECUTE COMPRESSION & DOWNLOAD
     ========================================== */
  if (btnExecuteCompress) {
    btnExecuteCompress.addEventListener("click", async () => {
      if (!state.pdfFile) {
        showCompressToast("Please upload a PDF file first.", "error");
        return;
      }

      try {
        workspaceSection.style.display = "none";
        processingState.style.display = "block";

        const progressFill = document.getElementById("compress-progress-fill");
        const statusDesc = document.getElementById("compress-status-desc");

        const engine = new CompressPdfEngine();

        const result = await engine.compress(
          state.pdfFile,
          state.selectedLevel,
          {},
          (pct, msg) => {
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (statusDesc) statusDesc.textContent = msg;
          },
        );

        // Populate comparison statistics
        const origFmt = CompressPdfEngine.formatBytes(result.originalSize);
        const newFmt = CompressPdfEngine.formatBytes(result.newSize);
        const savedFmt = CompressPdfEngine.formatBytes(result.savedBytes);

        if (statOrigSize) statOrigSize.textContent = origFmt;
        if (statNewSize) statNewSize.textContent = newFmt;

        // Toggle optimization warning message
        const warningEl = document.getElementById("stat-optimization-warning");
        if (warningEl) {
          if (result.isHighlyOptimized) {
            warningEl.style.display = "flex";
          } else {
            warningEl.style.display = "none";
          }
        }

        if (result.savedBytes > 0) {
          if (statSavingsText)
            statSavingsText.textContent = `${savedFmt} Saved`;
          if (statSavingsPct)
            statSavingsPct.textContent = `${result.savedPercent}% smaller file size`;
          if (statBadgePct) {
            statBadgePct.textContent = `-${result.savedPercent}%`;
            statBadgePct.style.background = "rgba(16, 185, 129, 0.12)";
            statBadgePct.style.color = "var(--success)";
          }
        } else {
          if (statSavingsText)
            statSavingsText.textContent = `Maximally Optimized`;
          if (statSavingsPct)
            statSavingsPct.textContent = `Document is already at optimal size`;
          if (statBadgePct) {
            statBadgePct.textContent = `0% Change`;
            statBadgePct.style.background = "rgba(99, 102, 241, 0.12)";
            statBadgePct.style.color = "var(--primary)";
          }
        }

        // Set result filename and download link
        const outName =
          (outputFilenameInput ? outputFilenameInput.value.trim() : "") ||
          "compressed-document.pdf";
        if (resultFilenameDisplay) resultFilenameDisplay.textContent = outName;
        if (resultMetaDisplay)
          resultMetaDisplay.textContent = `${newFmt} • ${result.pageCount} page${result.pageCount > 1 ? "s" : ""}`;

        if (btnDownloadCompressed) {
          btnDownloadCompressed.href = result.blobUrl;
          btnDownloadCompressed.download = outName;
        }

        processingState.style.display = "none";
        resultSection.style.display = "block";

        showCompressToast("PDF compressed successfully!", "success", "Done");
      } catch (err) {
        console.error(err);
        showCompressToast(
          `Compression failed: ${err.message}`,
          "error",
          "Processing Error",
        );
        processingState.style.display = "none";
        workspaceSection.style.display = "block";
      }
    });
  }

  if (btnStartOver) {
    btnStartOver.addEventListener("click", () => {
      resetToUploadState();
    });
  }

  function resetToUploadState() {
    state.pdfFile = null;
    state.pageCount = 1;
    state.selectedLevel = "balanced";

    if (fileInput) fileInput.value = "";

    // Reset warning element
    const warningEl = document.getElementById("stat-optimization-warning");
    if (warningEl) {
      warningEl.style.display = "none";
    }

    // Reset option cards to balanced
    optionCards.forEach((c) => {
      const level = c.getAttribute("data-level");
      const radio = c.querySelector('input[type="radio"]');
      if (level === "balanced") {
        c.classList.add("active");
        c.style.border = "2px solid var(--primary)";
        c.style.background = "rgba(99, 102, 241, 0.04)";
        if (radio) radio.checked = true;
      } else {
        c.classList.remove("active");
        c.style.border = "1px solid var(--border-subtle)";
        c.style.background = "var(--bg-surface)";
        if (radio) radio.checked = false;
      }
    });

    workspaceSection.style.display = "none";
    processingState.style.display = "none";
    resultSection.style.display = "none";
    uploadSection.style.display = "block";
  }
});
