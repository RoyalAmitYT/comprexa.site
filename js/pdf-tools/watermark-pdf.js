// @ts-nocheck
/**
 * Comprexa Watermark PDF Engine & UI Controller
 * Production-ready, 100% browser-based PDF watermarking module using PDF-Lib & PDF.js.
 * Built from scratch using Universal Tool Page Template.
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

ensurePdfWorker();

// Safe Toast Helper
function showWatermarkToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * Core Watermark PDF Processing Engine
 */
class WatermarkPdfEngine {
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
   * Validate uploaded watermark image file
   */
  static validateImageFile(file) {
    if (!file) return { valid: false, error: "No image file selected." };
    if (file.size === 0) return { valid: false, error: "Image file is empty." };

    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];
    const ext = file.name.split(".").pop().toLowerCase();
    const validExts = ["png", "jpg", "jpeg", "svg", "webp"];

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported image format. Please upload PNG, JPG, SVG, or WebP.`,
      };
    }

    return { valid: true };
  }

  /**
   * Parse hex color string to RGB object (0-1 floats for PDF-Lib)
   */
  static hexToRgbFloat(hex) {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
    };
  }

  /**
   * Parse target page numbers
   * @param {string} pageScope 'all' | 'first' | 'custom'
   * @param {string} customRange e.g. "1, 3, 5-10"
   * @param {number} totalPages Total pages count in PDF
   * @returns {number[]} 1-based page index list
   */
  static parseTargetPages(pageScope, customRange, totalPages) {
    if (pageScope === "first") return [1];
    if (pageScope === "all" || !customRange.trim()) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set();
    const parts = customRange.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (
            let p = Math.max(1, start);
            p <= Math.min(totalPages, end);
            p++
          ) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pages.add(p);
        }
      }
    }

    const result = Array.from(pages).sort((a, b) => a - b);
    return result.length > 0
      ? result
      : Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /**
   * Apply watermark to PDF using PDF-Lib
   * @param {File} pdfFile Source PDF File
   * @param {Object} config Watermark Configuration
   * @param {Function} progressCallback Progress reporter
   */
  async applyWatermark(pdfFile, config, progressCallback = null) {
    if (!window.PDFLib) {
      throw new Error(
        "PDF-Lib library is not loaded. Please refresh the page and try again.",
      );
    }

    const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;

    if (progressCallback) progressCallback(10, "Reading PDF document...");
    const arrayBuffer = await pdfFile.arrayBuffer();

    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err) {
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new Error("The uploaded PDF document contains no pages.");
    }

    const targetPageNums = WatermarkPdfEngine.parseTargetPages(
      config.pageScope,
      config.customPages,
      totalPages,
    );

    if (progressCallback) progressCallback(30, "Preparing watermark assets...");

    // Embed Assets based on mode
    let embeddedFont = null;
    let embeddedImage = null;
    let imgDimensions = { width: 0, height: 0 };

    if (config.mode === "text") {
      const fontName = config.fontFamily || "Helvetica";
      let fontKey = StandardFonts.Helvetica;
      if (fontName === "TimesRoman") fontKey = StandardFonts.TimesRoman;
      if (fontName === "Courier") fontKey = StandardFonts.Courier;

      embeddedFont = await pdfDoc.embedFont(fontKey);
    } else if (config.mode === "image" && config.imageFile) {
      const imgBuffer = await config.imageFile.arrayBuffer();
      const ext = config.imageFile.name.split(".").pop().toLowerCase();

      try {
        if (ext === "png" || config.imageFile.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imgBuffer);
        } else if (
          ext === "jpg" ||
          ext === "jpeg" ||
          config.imageFile.type === "image/jpeg"
        ) {
          embeddedImage = await pdfDoc.embedJpg(imgBuffer);
        } else {
          // Convert SVG or WebP to PNG via Offscreen Canvas
          const pngBuffer = await this.convertImageToPngBuffer(
            config.imageFile,
          );
          embeddedImage = await pdfDoc.embedPng(pngBuffer);
        }
      } catch (e) {
        // Fallback convert to PNG buffer
        const pngBuffer = await this.convertImageToPngBuffer(config.imageFile);
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      }

      const dims = embeddedImage.scale(1);
      imgDimensions = { width: dims.width, height: dims.height };
    }

    if (progressCallback)
      progressCallback(50, "Stamping watermark onto target pages...");

    // Apply to target pages
    for (let idx = 0; idx < totalPages; idx++) {
      const pageNum = idx + 1;
      if (!targetPageNums.includes(pageNum)) continue;

      const page = pages[idx];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      if (config.mode === "text") {
        const text = config.text || "CONFIDENTIAL";
        const fontSize = parseFloat(config.fontSize) || 48;
        const fontColor = WatermarkPdfEngine.hexToRgbFloat(
          config.color || "#dc2626",
        );
        const opacity = Math.min(1, Math.max(0, (config.opacity || 30) / 100));
        const rotationAngle = parseFloat(config.rotation) || 0;

        const textWidth = embeddedFont.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize * 0.8;

        if (config.isTileMode) {
          // Tile Grid Mode across page
          const stepX = Math.max(140, textWidth + 80);
          const stepY = Math.max(120, fontSize + 80);

          for (let x = 40; x < pageWidth; x += stepX) {
            for (let y = 40; y < pageHeight; y += stepY) {
              page.drawText(text, {
                x: x,
                y: y,
                size: fontSize,
                font: embeddedFont,
                color: rgb(fontColor.r, fontColor.g, fontColor.b),
                opacity: opacity,
                rotate: degrees(rotationAngle),
              });
            }
          }
        } else {
          // Single Position Alignment Mode
          const coords = WatermarkPdfEngine.calculatePositionCoordinates(
            config.position,
            pageWidth,
            pageHeight,
            textWidth,
            textHeight,
          );

          page.drawText(text, {
            x: coords.x,
            y: coords.y,
            size: fontSize,
            font: embeddedFont,
            color: rgb(fontColor.r, fontColor.g, fontColor.b),
            opacity: opacity,
            rotate: degrees(rotationAngle),
          });
        }
      } else if (config.mode === "image" && embeddedImage) {
        const scaleFactor = (config.imageScale || 40) / 100;
        const drawWidth = imgDimensions.width * scaleFactor;
        const drawHeight = imgDimensions.height * scaleFactor;
        const opacity = Math.min(
          1,
          Math.max(0, (config.imageOpacity || 30) / 100),
        );
        const rotationAngle = parseFloat(config.imageRotation) || 0;

        if (config.isTileMode) {
          const stepX = Math.max(140, drawWidth + 60);
          const stepY = Math.max(120, drawHeight + 60);

          for (let x = 30; x < pageWidth; x += stepX) {
            for (let y = 30; y < pageHeight; y += stepY) {
              page.drawImage(embeddedImage, {
                x: x,
                y: y,
                width: drawWidth,
                height: drawHeight,
                opacity: opacity,
                rotate: degrees(rotationAngle),
              });
            }
          }
        } else {
          const coords = WatermarkPdfEngine.calculatePositionCoordinates(
            config.position,
            pageWidth,
            pageHeight,
            drawWidth,
            drawHeight,
          );

          page.drawImage(embeddedImage, {
            x: coords.x,
            y: coords.y,
            width: drawWidth,
            height: drawHeight,
            opacity: opacity,
            rotate: degrees(rotationAngle),
          });
        }
      }

      if (progressCallback) {
        const pct = Math.round(50 + ((idx + 1) / totalPages) * 40);
        progressCallback(pct, `Watermarked page ${idx + 1} of ${totalPages}`);
      }
    }

    if (progressCallback)
      progressCallback(95, "Generating final PDF document...");
    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    return {
      blob,
      blobUrl,
      originalSize: pdfFile.size,
      newSize: blob.size,
    };
  }

  /**
   * Calculate (x, y) coordinates for PDF-Lib drawing (0,0 is bottom-left in PDF space)
   */
  static calculatePositionCoordinates(
    pos,
    pageWidth,
    pageHeight,
    objWidth,
    objHeight,
  ) {
    const margin = 30;
    let x = (pageWidth - objWidth) / 2;
    let y = (pageHeight - objHeight) / 2;

    switch (pos) {
      case "top-left":
        x = margin;
        y = pageHeight - margin - objHeight;
        break;
      case "top-center":
        x = (pageWidth - objWidth) / 2;
        y = pageHeight - margin - objHeight;
        break;
      case "top-right":
        x = pageWidth - margin - objWidth;
        y = pageHeight - margin - objHeight;
        break;
      case "center-left":
        x = margin;
        y = (pageHeight - objHeight) / 2;
        break;
      case "center":
        x = (pageWidth - objWidth) / 2;
        y = (pageHeight - objHeight) / 2;
        break;
      case "center-right":
        x = pageWidth - margin - objWidth;
        y = (pageHeight - objHeight) / 2;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-center":
        x = (pageWidth - objWidth) / 2;
        y = margin;
        break;
      case "bottom-right":
        x = pageWidth - margin - objWidth;
        y = margin;
        break;
    }

    return {
      x: Math.max(0, Math.min(pageWidth - objWidth, x)),
      y: Math.max(0, Math.min(pageHeight - objHeight, y)),
    };
  }

  /**
   * Convert image file (SVG / WebP) to PNG ArrayBuffer via canvas
   */
  static convertImageToPngBuffer(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert image format to PNG."));
            return;
          }
          blob.arrayBuffer().then(resolve).catch(reject);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image file."));
      };
      img.src = url;
    });
  }
}

/**
 * UI Controller for Watermark PDF Application
 */
document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    pdfFile: null,
    pdfJsDoc: null,
    currentPreviewPage: 1,
    totalPages: 1,
    watermarkImageFile: null,
    watermarkImageElement: null,
    config: {
      mode: "text", // 'text' | 'image'
      text: "CONFIDENTIAL",
      fontFamily: "Helvetica",
      fontSize: 48,
      color: "#dc2626",
      opacity: 30,
      rotation: -45,
      imageScale: 40,
      imageOpacity: 30,
      imageRotation: 0,
      position: "center",
      isTileMode: false,
      pageScope: "all",
      customPages: "",
    },
  };

  // DOM Elements
  const dropzone = document.getElementById("watermark-dropzone");
  const fileInput = document.getElementById("watermark-file-input");
  const chooseBtn = dropzone
    ? dropzone.querySelector(".file-uploader__choose-btn")
    : null;

  const uploadSection = document.getElementById("watermark-upload-section");
  const workspaceSection = document.getElementById(
    "watermark-workspace-section",
  );
  const processingState = document.getElementById("watermark-processing-state");
  const resultSection = document.getElementById("watermark-result-section");

  const filenameDisplay = document.getElementById("watermark-filename-display");
  const filemetaDisplay = document.getElementById("watermark-filemeta-display");
  const btnChangePdf = document.getElementById("btn-change-pdf");

  // Mode Tabs
  const tabText = document.getElementById("tab-watermark-text");
  const tabImage = document.getElementById("tab-watermark-image");
  const controlsText = document.getElementById("controls-text-watermark");
  const controlsImage = document.getElementById("controls-image-watermark");

  // Text Watermark Inputs
  const wmTextInput = document.getElementById("wm-text-input");
  const wmFontSelect = document.getElementById("wm-font-select");
  const wmColorPicker = document.getElementById("wm-color-picker");
  const wmColorHex = document.getElementById("wm-color-hex");
  const wmSizeSlider = document.getElementById("wm-size-slider");
  const wmSizeBadge = document.getElementById("wm-size-badge");
  const wmOpacitySlider = document.getElementById("wm-opacity-slider");
  const wmOpacityBadge = document.getElementById("wm-opacity-badge");
  const wmRotationSlider = document.getElementById("wm-rotation-slider");
  const wmRotationBadge = document.getElementById("wm-rotation-badge");

  // Image Watermark Inputs
  const wmImgDropzone = document.getElementById("wm-img-dropzone");
  const wmImageFileInput = document.getElementById("wm-image-file-input");
  const wmImgEmptyPrompt = document.getElementById("wm-img-empty-prompt");
  const wmImgLoadedPreview = document.getElementById("wm-img-loaded-preview");
  const wmImgThumb = document.getElementById("wm-img-thumb");
  const wmImgName = document.getElementById("wm-img-name");
  const wmImgDimensions = document.getElementById("wm-img-dimensions");
  const btnRemoveWmImg = document.getElementById("btn-remove-wm-img");

  const wmImgScaleSlider = document.getElementById("wm-img-scale-slider");
  const wmImgScaleBadge = document.getElementById("wm-img-scale-badge");
  const wmImgOpacitySlider = document.getElementById("wm-img-opacity-slider");
  const wmImgOpacityBadge = document.getElementById("wm-img-opacity-badge");
  const wmImgRotationSlider = document.getElementById("wm-img-rotation-slider");
  const wmImgRotationBadge = document.getElementById("wm-img-rotation-badge");

  // Shared Controls
  const btnToggleTile = document.getElementById("btn-toggle-tile");
  const positionBtns = document.querySelectorAll(".wm-pos-btn");
  const wmPagesSelect = document.getElementById("wm-pages-select");
  const wmCustomPagesGroup = document.getElementById("wm-custom-pages-group");
  const wmCustomPagesInput = document.getElementById("wm-custom-pages-input");
  const outputFilenameInput = document.getElementById("output-filename-input");
  const btnApplyWatermark = document.getElementById("btn-apply-watermark");

  // Preview Elements
  const baseCanvas = document.getElementById("pdf-base-canvas");
  const overlayCanvas = document.getElementById("pdf-watermark-overlay");
  const previewPageIndicator = document.getElementById(
    "preview-page-indicator",
  );
  const btnPrevPreviewPage = document.getElementById("btn-prev-preview-page");
  const btnNextPreviewPage = document.getElementById("btn-next-preview-page");

  // Result Elements
  const resultFilenameDisplay = document.getElementById(
    "result-filename-display",
  );
  const resultMetaDisplay = document.getElementById("result-meta-display");
  const btnDownloadWatermarked = document.getElementById(
    "btn-download-watermarked",
  );
  const btnStartOver = document.getElementById("btn-watermark-start-over");

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
      if (e.target.closest("#watermark-file-input")) return;
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
     CORE FILE PROCESSING & RENDER
     ========================================== */
  async function handleFileSelection(file) {
    const val = WatermarkPdfEngine.validatePdfFile(file);
    if (!val.valid) {
      showWatermarkToast(val.error, "error", "Invalid File");
      return;
    }

    try {
      state.pdfFile = file;
      filenameDisplay.textContent = file.name;
      filemetaDisplay.textContent = `Loading pages... • ${WatermarkPdfEngine.formatBytes(file.size)}`;

      // Update output filename default
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      outputFilenameInput.value = `${baseName}-watermarked.pdf`;

      // Read ArrayBuffer for PDF.js preview rendering
      const arrayBuffer = await file.arrayBuffer();
      const lib = ensurePdfWorker();
      state.pdfJsDoc = await lib.getDocument({ data: arrayBuffer }).promise;
      state.totalPages = state.pdfJsDoc.numPages;
      state.currentPreviewPage = 1;

      filemetaDisplay.textContent = `${state.totalPages} page${state.totalPages > 1 ? "s" : ""} • ${WatermarkPdfEngine.formatBytes(file.size)}`;

      // Show workspace, hide upload area
      uploadSection.style.display = "none";
      workspaceSection.style.display = "block";

      // Render Page Preview
      await renderCurrentPagePreview();

      showWatermarkToast(
        `Loaded "${file.name}" successfully.`,
        "success",
        "PDF Ready",
      );
    } catch (err) {
      console.error(err);
      showWatermarkToast(
        `Could not process PDF: ${err.message}`,
        "error",
        "Error Loading PDF",
      );
      resetToUploadState();
    }
  }

  /* ==========================================
     LIVE PREVIEW CANVAS RENDER
     ========================================== */
  async function renderCurrentPagePreview() {
    if (!state.pdfJsDoc || !baseCanvas || !overlayCanvas) return;

    try {
      const page = await state.pdfJsDoc.getPage(state.currentPreviewPage);
      const viewport = page.getViewport({ scale: 1.2 });

      baseCanvas.width = viewport.width;
      baseCanvas.height = viewport.height;
      overlayCanvas.width = viewport.width;
      overlayCanvas.height = viewport.height;

      const ctx = baseCanvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      updatePageNavControls();
      drawWatermarkOverlay();
    } catch (err) {
      console.error("Preview render error:", err);
    }
  }

  function drawWatermarkOverlay() {
    if (!overlayCanvas) return;
    const ctx = overlayCanvas.getContext("2d");
    const width = overlayCanvas.width;
    const height = overlayCanvas.height;

    ctx.clearRect(0, 0, width, height);

    if (state.config.mode === "text") {
      const text = state.config.text || "CONFIDENTIAL";
      const fontSize = parseFloat(state.config.fontSize) * 1.1; // Scale for canvas viewport
      const opacity = Math.min(1, Math.max(0, state.config.opacity / 100));
      const rotationRad = (parseFloat(state.config.rotation) * Math.PI) / 180;
      const color = state.config.color || "#dc2626";

      let fontCSS = "Helvetica, Arial, sans-serif";
      if (state.config.fontFamily === "TimesRoman")
        fontCSS = '"Times New Roman", Times, serif';
      if (state.config.fontFamily === "Courier")
        fontCSS = '"Courier New", Courier, monospace';

      ctx.font = `bold ${fontSize}px ${fontCSS}`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      if (state.config.isTileMode) {
        // Tile Grid Mode
        const stepX = Math.max(160, textWidth + 80);
        const stepY = Math.max(140, textHeight + 80);

        for (let x = 60; x < width; x += stepX) {
          for (let y = 60; y < height; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotationRad);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      } else {
        // Single Alignment Position
        const pos = calculateCanvasPosition(
          state.config.position,
          width,
          height,
          textWidth,
          textHeight,
        );
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(rotationRad);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    } else if (state.config.mode === "image" && state.watermarkImageElement) {
      const img = state.watermarkImageElement;
      const scaleFactor = (state.config.imageScale || 40) / 100;
      const drawWidth = (img.naturalWidth || 200) * scaleFactor * 0.7;
      const drawHeight = (img.naturalHeight || 200) * scaleFactor * 0.7;
      const opacity = Math.min(1, Math.max(0, state.config.imageOpacity / 100));
      const rotationRad =
        (parseFloat(state.config.imageRotation) * Math.PI) / 180;

      ctx.globalAlpha = opacity;

      if (state.config.isTileMode) {
        const stepX = Math.max(160, drawWidth + 60);
        const stepY = Math.max(140, drawHeight + 60);

        for (let x = 60; x < width; x += stepX) {
          for (let y = 60; y < height; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotationRad);
            ctx.drawImage(
              img,
              -drawWidth / 2,
              -drawHeight / 2,
              drawWidth,
              drawHeight,
            );
            ctx.restore();
          }
        }
      } else {
        const pos = calculateCanvasPosition(
          state.config.position,
          width,
          height,
          drawWidth,
          drawHeight,
        );
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(rotationRad);
        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight,
        );
        ctx.restore();
      }
    }
  }

  function calculateCanvasPosition(
    pos,
    canvasWidth,
    canvasHeight,
    objWidth,
    objHeight,
  ) {
    const margin = 40;
    let x = canvasWidth / 2;
    let y = canvasHeight / 2;

    switch (pos) {
      case "top-left":
        x = margin + objWidth / 2;
        y = margin + objHeight / 2;
        break;
      case "top-center":
        x = canvasWidth / 2;
        y = margin + objHeight / 2;
        break;
      case "top-right":
        x = canvasWidth - margin - objWidth / 2;
        y = margin + objHeight / 2;
        break;
      case "center-left":
        x = margin + objWidth / 2;
        y = canvasHeight / 2;
        break;
      case "center":
        x = canvasWidth / 2;
        y = canvasHeight / 2;
        break;
      case "center-right":
        x = canvasWidth - margin - objWidth / 2;
        y = canvasHeight / 2;
        break;
      case "bottom-left":
        x = margin + objWidth / 2;
        y = canvasHeight - margin - objHeight / 2;
        break;
      case "bottom-center":
        x = canvasWidth / 2;
        y = canvasHeight - margin - objHeight / 2;
        break;
      case "bottom-right":
        x = canvasWidth - margin - objWidth / 2;
        y = canvasHeight - margin - objHeight / 2;
        break;
    }

    return { x, y };
  }

  function updatePageNavControls() {
    if (previewPageIndicator) {
      previewPageIndicator.textContent = `Page ${state.currentPreviewPage} of ${state.totalPages}`;
    }
    if (btnPrevPreviewPage)
      btnPrevPreviewPage.disabled = state.currentPreviewPage <= 1;
    if (btnNextPreviewPage)
      btnNextPreviewPage.disabled =
        state.currentPreviewPage >= state.totalPages;
  }

  if (btnPrevPreviewPage) {
    btnPrevPreviewPage.addEventListener("click", () => {
      if (state.currentPreviewPage > 1) {
        state.currentPreviewPage--;
        renderCurrentPagePreview();
      }
    });
  }

  if (btnNextPreviewPage) {
    btnNextPreviewPage.addEventListener("click", () => {
      if (state.currentPreviewPage < state.totalPages) {
        state.currentPreviewPage++;
        renderCurrentPagePreview();
      }
    });
  }

  /* ==========================================
     MODE SWITCHING & EVENT CONTROLS
     ========================================== */
  if (tabText && tabImage) {
    tabText.addEventListener("click", () => {
      state.config.mode = "text";
      tabText.style.background = "var(--bg-surface)";
      tabText.style.color = "var(--primary)";
      tabText.style.boxShadow = "var(--shadow-sm)";
      tabText.classList.remove("btn--ghost");

      tabImage.style.background = "transparent";
      tabImage.style.color = "var(--text-muted)";
      tabImage.style.boxShadow = "none";
      tabImage.classList.add("btn--ghost");

      controlsText.style.display = "flex";
      controlsImage.style.display = "none";

      drawWatermarkOverlay();
    });

    tabImage.addEventListener("click", () => {
      state.config.mode = "image";
      tabImage.style.background = "var(--bg-surface)";
      tabImage.style.color = "var(--primary)";
      tabImage.style.boxShadow = "var(--shadow-sm)";
      tabImage.classList.remove("btn--ghost");

      tabText.style.background = "transparent";
      tabText.style.color = "var(--text-muted)";
      tabText.style.boxShadow = "none";
      tabText.classList.add("btn--ghost");

      controlsText.style.display = "none";
      controlsImage.style.display = "flex";

      drawWatermarkOverlay();
    });
  }

  // Text Watermark Event Listeners
  if (wmTextInput) {
    wmTextInput.addEventListener("input", (e) => {
      state.config.text = e.target.value;
      drawWatermarkOverlay();
    });
  }

  document.querySelectorAll(".wm-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      if (preset && wmTextInput) {
        wmTextInput.value = preset;
        state.config.text = preset;
        drawWatermarkOverlay();
      }
    });
  });

  if (wmFontSelect) {
    wmFontSelect.addEventListener("change", (e) => {
      state.config.fontFamily = e.target.value;
      drawWatermarkOverlay();
    });
  }

  if (wmColorPicker) {
    wmColorPicker.addEventListener("input", (e) => {
      state.config.color = e.target.value;
      if (wmColorHex) wmColorHex.textContent = e.target.value;
      drawWatermarkOverlay();
    });
  }

  if (wmSizeSlider) {
    wmSizeSlider.addEventListener("input", (e) => {
      state.config.fontSize = parseInt(e.target.value, 10);
      if (wmSizeBadge) wmSizeBadge.textContent = `${e.target.value} px`;
      drawWatermarkOverlay();
    });
  }

  if (wmOpacitySlider) {
    wmOpacitySlider.addEventListener("input", (e) => {
      state.config.opacity = parseInt(e.target.value, 10);
      if (wmOpacityBadge) wmOpacityBadge.textContent = `${e.target.value}%`;
      drawWatermarkOverlay();
    });
  }

  if (wmRotationSlider) {
    wmRotationSlider.addEventListener("input", (e) => {
      state.config.rotation = parseInt(e.target.value, 10);
      if (wmRotationBadge) wmRotationBadge.textContent = `${e.target.value}°`;
      drawWatermarkOverlay();
    });
  }

  // Image Watermark Dropzone & File Input
  if (wmImgDropzone && wmImageFileInput) {
    wmImgDropzone.addEventListener("click", () => {
      wmImageFileInput.click();
    });

    wmImageFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleWatermarkImageSelection(e.target.files[0]);
      }
    });
  }

  if (btnRemoveWmImg) {
    btnRemoveWmImg.addEventListener("click", (e) => {
      e.stopPropagation();
      state.watermarkImageFile = null;
      state.watermarkImageElement = null;
      wmImgEmptyPrompt.style.display = "block";
      wmImgLoadedPreview.style.display = "none";
      if (wmImageFileInput) wmImageFileInput.value = "";
      drawWatermarkOverlay();
    });
  }

  function handleWatermarkImageSelection(file) {
    const val = WatermarkPdfEngine.validateImageFile(file);
    if (!val.valid) {
      showWatermarkToast(val.error, "error", "Invalid Image");
      return;
    }

    state.watermarkImageFile = file;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.watermarkImageElement = img;
      if (wmImgThumb) wmImgThumb.src = url;
      if (wmImgName) wmImgName.textContent = file.name;
      if (wmImgDimensions)
        wmImgDimensions.textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;

      wmImgEmptyPrompt.style.display = "none";
      wmImgLoadedPreview.style.display = "flex";

      drawWatermarkOverlay();
      showWatermarkToast(`Watermark image "${file.name}" loaded.`, "success");
    };
    img.src = url;
  }

  if (wmImgScaleSlider) {
    wmImgScaleSlider.addEventListener("input", (e) => {
      state.config.imageScale = parseInt(e.target.value, 10);
      if (wmImgScaleBadge) wmImgScaleBadge.textContent = `${e.target.value}%`;
      drawWatermarkOverlay();
    });
  }

  if (wmImgOpacitySlider) {
    wmImgOpacitySlider.addEventListener("input", (e) => {
      state.config.imageOpacity = parseInt(e.target.value, 10);
      if (wmImgOpacityBadge)
        wmImgOpacityBadge.textContent = `${e.target.value}%`;
      drawWatermarkOverlay();
    });
  }

  if (wmImgRotationSlider) {
    wmImgRotationSlider.addEventListener("input", (e) => {
      state.config.imageRotation = parseInt(e.target.value, 10);
      if (wmImgRotationBadge)
        wmImgRotationBadge.textContent = `${e.target.value}°`;
      drawWatermarkOverlay();
    });
  }

  // Position Alignment Buttons & Tile Toggle
  positionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      positionBtns.forEach((b) => {
        b.classList.remove("btn--primary", "active");
        b.classList.add("btn--outline");
      });
      btn.classList.remove("btn--outline");
      btn.classList.add("btn--primary", "active");

      state.config.position = btn.getAttribute("data-pos");
      state.config.isTileMode = false;
      if (btnToggleTile) btnToggleTile.classList.remove("btn--primary");

      drawWatermarkOverlay();
    });
  });

  if (btnToggleTile) {
    btnToggleTile.addEventListener("click", () => {
      state.config.isTileMode = !state.config.isTileMode;
      if (state.config.isTileMode) {
        btnToggleTile.classList.add("btn--primary");
        positionBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
      } else {
        btnToggleTile.classList.remove("btn--primary");
        // Restore default center
        const centerBtn = document.querySelector(
          '.wm-pos-btn[data-pos="center"]',
        );
        if (centerBtn) {
          centerBtn.classList.remove("btn--outline");
          centerBtn.classList.add("btn--primary", "active");
          state.config.position = "center";
        }
      }
      drawWatermarkOverlay();
    });
  }

  if (wmPagesSelect) {
    wmPagesSelect.addEventListener("change", (e) => {
      state.config.pageScope = e.target.value;
      if (e.target.value === "custom") {
        wmCustomPagesGroup.style.display = "block";
      } else {
        wmCustomPagesGroup.style.display = "none";
      }
    });
  }

  if (wmCustomPagesInput) {
    wmCustomPagesInput.addEventListener("input", (e) => {
      state.config.customPages = e.target.value;
    });
  }

  /* ==========================================
     EXECUTE WATERMARK & DOWNLOAD
     ========================================== */
  if (btnApplyWatermark) {
    btnApplyWatermark.addEventListener("click", async () => {
      if (!state.pdfFile) {
        showWatermarkToast("Please upload a PDF file first.", "error");
        return;
      }

      if (state.config.mode === "image" && !state.watermarkImageFile) {
        showWatermarkToast("Please upload a watermark image first.", "warning");
        return;
      }

      try {
        workspaceSection.style.display = "none";
        processingState.style.display = "block";

        const progressFill = document.getElementById("watermark-progress-fill");
        const _statusTitle = document.getElementById("watermark-status-title");
        const statusDesc = document.getElementById("watermark-status-desc");

        const engine = new WatermarkPdfEngine();

        const configToApply = {
          ...state.config,
          imageFile: state.watermarkImageFile,
        };

        const result = await engine.applyWatermark(
          state.pdfFile,
          configToApply,
          (pct, msg) => {
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (statusDesc) statusDesc.textContent = msg;
          },
        );

        // Update result section
        const outName =
          outputFilenameInput.value.trim() || "watermarked-document.pdf";
        resultFilenameDisplay.textContent = outName;
        resultMetaDisplay.textContent = `Watermarked PDF • ${WatermarkPdfEngine.formatBytes(result.newSize)}`;

        btnDownloadWatermarked.href = result.blobUrl;
        btnDownloadWatermarked.download = outName;

        processingState.style.display = "none";
        resultSection.style.display = "block";

        showWatermarkToast("PDF watermarked successfully!", "success", "Done");
      } catch (err) {
        console.error(err);
        showWatermarkToast(
          `Watermark failed: ${err.message}`,
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
    state.pdfJsDoc = null;
    state.currentPreviewPage = 1;
    state.totalPages = 1;
    state.watermarkImageFile = null;
    state.watermarkImageElement = null;

    if (fileInput) fileInput.value = "";
    if (wmImageFileInput) wmImageFileInput.value = "";

    if (wmImgEmptyPrompt) wmImgEmptyPrompt.style.display = "block";
    if (wmImgLoadedPreview) wmImgLoadedPreview.style.display = "none";

    workspaceSection.style.display = "none";
    processingState.style.display = "none";
    resultSection.style.display = "none";
    uploadSection.style.display = "block";
  }
});
