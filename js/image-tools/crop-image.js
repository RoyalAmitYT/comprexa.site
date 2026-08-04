// @ts-nocheck
/**
 * Comprexa - Universal Crop Image Controller
 * Completely rebuilt client-side image cropper with touch/mouse/trackpad gesture support,
 * real-time crop preview, rotation, flips, aspect ratios, circle mask, and zero-loss export.
 */

import { ImageUtils } from "../image-engine.js";

export class CropImageController {
  constructor() {
    // Original File & Image
    this.file = null;
    this.originalImg = null;
    this.imgWidth = 0;
    this.imgHeight = 0;

    // Transform State
    this.rotation = 0; // 0, 90, 180, 270
    this.flipH = false;
    this.flipV = false;
    this.zoom = 1.0; // 0.5 to 3.0

    // Crop Selection State (in display canvas coordinates)
    this.cropBox = { x: 0, y: 0, w: 100, h: 100 };
    this.activeAspect = null; // null for free, or numeric ratio (e.g. 1.0, 1.333, 1.777)
    this.isCircleMask = false;

    // Display Stage Measurements
    this.displayScale = 1.0; // Ratio of display canvas pixels to transformed image pixels
    this.displayW = 0;
    this.displayH = 0;

    // Pointer Drag/Resize State
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
    this.dragStart = { x: 0, y: 0 };
    this.boxStart = { x: 0, y: 0, w: 0, h: 0 };

    // Offscreen Canvas for Transformed Full-Res Image
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    // Upload Elements
    this.dropZone = document.getElementById("crop-dropzone");
    this.fileInput = document.getElementById("crop-file-input");

    // Sections
    this.uploadSection = document.getElementById("crop-upload-section");
    this.configSection = document.getElementById("crop-config-section");
    this.progressSection = document.getElementById("crop-progress-section");
    this.resultSection = document.getElementById("crop-result-section");

    // Uploaded File Info
    this.uploadedFilename = document.getElementById("uploaded-filename");
    this.uploadedFiledims = document.getElementById("uploaded-filedims");
    this.uploadedFilesize = document.getElementById("uploaded-filesize");
    this.btnChangeImage = document.getElementById("btn-change-image");

    // Stage & Display
    this.stageContainer = document.getElementById("crop-stage-container");
    this.stageWrapper = document.getElementById("crop-stage-wrapper");
    this.displayCanvas = document.getElementById("crop-display-canvas");
    this.overlayBox = document.getElementById("crop-overlay-box");
    this.boxDimensionsLabel = document.getElementById(
      "crop-box-dimensions-label",
    );

    // Stage Quick Toolbar
    this.btnZoomOut = document.getElementById("btn-zoom-out");
    this.btnZoomIn = document.getElementById("btn-zoom-in");
    this.zoomSlider = document.getElementById("zoom-slider");
    this.zoomValue = document.getElementById("zoom-value");

    this.btnRotateCCW = document.getElementById("btn-rotate-ccw");
    this.btnRotateCW = document.getElementById("btn-rotate-cw");
    this.rotationAngleBadge = document.getElementById("rotation-angle-badge");

    this.btnFlipH = document.getElementById("btn-flip-h");
    this.btnFlipV = document.getElementById("btn-flip-v");
    this.btnResetStage = document.getElementById("btn-reset-stage");

    // Live Preview & Circle Mask
    this.circleMaskCheckbox = document.getElementById("circle-mask-checkbox");
    this.livePreviewCanvas = document.getElementById(
      "live-crop-preview-canvas",
    );
    this.liveCropDimensions = document.getElementById("live-crop-dimensions");
    this.liveAspectText = document.getElementById("live-aspect-text");
    this.liveEstSize = document.getElementById("live-est-size");

    // Controls & Presets
    this.aspectBtns = document.querySelectorAll(".aspect-preset-btn");
    this.socialBtns = document.querySelectorAll(".social-preset-btn");
    this.exportFormatSelect = document.getElementById("export-format-select");
    this.qualitySliderContainer = document.getElementById(
      "quality-slider-container",
    );
    this.qualitySlider = document.getElementById("quality-slider");
    this.qualityValBadge = document.getElementById("quality-val-badge");
    this.outputFilenameInput = document.getElementById("output-filename-input");
    this.btnExecuteCrop = document.getElementById("btn-execute-crop");

    // Progress Elements
    this.progressBar = document.getElementById("crop-progress-bar");
    this.progressStatus = document.getElementById("crop-progress-status");

    // Result Elements
    this.resultCroppedImage = document.getElementById("result-cropped-image");
    this.resOrigDims = document.getElementById("res-orig-dims");
    this.resCroppedDims = document.getElementById("res-cropped-dims");
    this.resOrigSize = document.getElementById("res-orig-size");
    this.resCroppedSize = document.getElementById("res-cropped-size");
    this.btnDownloadCropped = document.getElementById("btn-download-cropped");
    this.btnCropAnother = document.getElementById("btn-crop-another");
  }

  bindEvents() {
    if (!this.dropZone || !this.fileInput) return;

    // Dropzone Click & Drag/Drop
    this.dropZone.addEventListener("click", () => this.fileInput.click());
    this.dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add("file-uploader__dropzone--active");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove("file-uploader__dropzone--active");
      });
    });

    this.dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });

    this.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    if (this.btnChangeImage) {
      this.btnChangeImage.addEventListener("click", () =>
        this.fileInput.click(),
      );
    }

    // Zoom Controls
    if (this.zoomSlider) {
      this.zoomSlider.addEventListener("input", (e) => {
        this.setZoom(parseFloat(e.target.value) / 100);
      });
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener("click", () => {
        const val = Math.max(50, this.zoom * 100 - 10);
        this.setZoom(val / 100);
      });
    }
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener("click", () => {
        const val = Math.min(300, this.zoom * 100 + 10);
        this.setZoom(val / 100);
      });
    }

    // Rotation & Flips
    if (this.btnRotateCCW) {
      this.btnRotateCCW.addEventListener("click", () => {
        this.rotation = (this.rotation - 90 + 360) % 360;
        this.updateTransforms(true);
      });
    }
    if (this.btnRotateCW) {
      this.btnRotateCW.addEventListener("click", () => {
        this.rotation = (this.rotation + 90) % 360;
        this.updateTransforms(true);
      });
    }
    if (this.btnFlipH) {
      this.btnFlipH.addEventListener("click", () => {
        this.flipH = !this.flipH;
        this.updateTransforms(false);
      });
    }
    if (this.btnFlipV) {
      this.btnFlipV.addEventListener("click", () => {
        this.flipV = !this.flipV;
        this.updateTransforms(false);
      });
    }
    if (this.btnResetStage) {
      this.btnResetStage.addEventListener("click", () => {
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.setZoom(1.0);
        this.updateTransforms(true);
      });
    }

    // Circle Mask Checkbox
    if (this.circleMaskCheckbox) {
      this.circleMaskCheckbox.addEventListener("change", (e) => {
        this.isCircleMask = e.target.checked;
        if (this.isCircleMask) {
          // Circle mask forces 1:1 aspect ratio
          this.setAspectRatio(1.0, "1:1");
        } else {
          this.updateOverlayStyles();
          this.renderLivePreview();
        }
      });
    }

    // Aspect Ratio Presets
    this.aspectBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const aspectKey = btn.getAttribute("data-aspect");
        this.aspectBtns.forEach((b) =>
          b.classList.remove("btn--primary", "active"),
        );
        this.aspectBtns.forEach((b) => b.classList.add("btn--outline"));
        btn.classList.remove("btn--outline");
        btn.classList.add("btn--primary", "active");

        this.applyAspectPreset(aspectKey);
      });
    });

    // Social Media Presets
    this.socialBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const ratioAttr = btn.getAttribute("data-ratio");
        let numericRatio = null;

        if (ratioAttr === "1:1") numericRatio = 1.0;
        else if (ratioAttr === "4:5") numericRatio = 4 / 5;
        else if (ratioAttr === "9:16") numericRatio = 9 / 16;
        else if (ratioAttr === "16:9") numericRatio = 16 / 9;
        else if (ratioAttr === "2.63:1") numericRatio = 2.63;

        if (numericRatio) {
          this.aspectBtns.forEach((b) =>
            b.classList.remove("btn--primary", "active"),
          );
          this.aspectBtns.forEach((b) => b.classList.add("btn--outline"));
          this.setAspectRatio(numericRatio, btn.getAttribute("data-name"));
        }
      });
    });

    // Export Options
    if (this.exportFormatSelect) {
      this.exportFormatSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "image/jpeg" || val === "image/webp") {
          this.qualitySliderContainer.style.display = "block";
        } else {
          this.qualitySliderContainer.style.display = "none";
        }
        this.renderLivePreview();
      });
    }

    if (this.qualitySlider) {
      this.qualitySlider.addEventListener("input", (e) => {
        this.qualityValBadge.textContent = `${e.target.value}%`;
        this.renderLivePreview();
      });
    }

    // Interactive Dragging & Resizing with Pointer Events
    if (this.overlayBox) {
      this.overlayBox.addEventListener("pointerdown", (e) =>
        this.onPointerDown(e),
      );
      window.addEventListener("pointermove", (e) => this.onPointerMove(e));
      window.addEventListener("pointerup", (e) => this.onPointerUp(e));
      window.addEventListener("pointercancel", (e) => this.onPointerUp(e));
    }

    // Action Execution & Restart
    if (this.btnExecuteCrop) {
      this.btnExecuteCrop.addEventListener("click", () => this.executeCrop());
    }
    if (this.btnCropAnother) {
      this.btnCropAnother.addEventListener("click", () => this.resetToUpload());
    }
  }

  handleFileSelect(file) {
    if (!file || !file.type.startsWith("image/")) {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Please select a valid image file (JPG, PNG, WEBP, GIF, BMP);.",
        );
      return;
    }

    this.file = file;

    // Load Image Object
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.originalImg = img;
        this.imgWidth = img.naturalWidth;
        this.imgHeight = img.naturalHeight;

        // Display Metadata
        this.uploadedFilename.textContent = file.name;
        this.uploadedFiledims.textContent = `${this.imgWidth} × ${this.imgHeight} px`;
        this.uploadedFilesize.textContent = ImageUtils.formatBytes(file.size);

        if (this.outputFilenameInput) {
          const nameWithoutExt =
            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          this.outputFilenameInput.value = `${nameWithoutExt}-cropped`;
        }

        // Show Config Section
        this.uploadSection.style.display = "none";
        this.progressSection.style.display = "none";
        this.resultSection.style.display = "none";
        this.configSection.style.display = "block";

        // Reset state & render stage
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.zoom = 1.0;
        this.activeAspect = null;
        this.isCircleMask = false;
        if (this.circleMaskCheckbox) this.circleMaskCheckbox.checked = false;

        this.updateTransforms(true);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  setZoom(z) {
    this.zoom = Math.max(0.5, Math.min(3.0, z));
    if (this.zoomSlider) this.zoomSlider.value = Math.round(this.zoom * 100);
    if (this.zoomValue)
      this.zoomValue.textContent = `${Math.round(this.zoom * 100)}%`;

    if (this.stageWrapper) {
      this.stageWrapper.style.transform = `scale(${this.zoom})`;
    }
  }

  updateTransforms(resetCropBox = false) {
    if (!this.originalImg) return;

    // 1. Prepare Full-Res Transformed Offscreen Canvas
    let tw = this.imgWidth;
    let th = this.imgHeight;
    if (this.rotation === 90 || this.rotation === 270) {
      tw = this.imgHeight;
      th = this.imgWidth;
    }

    this.offscreenCanvas.width = tw;
    this.offscreenCanvas.height = th;

    this.offscreenCtx.save();
    this.offscreenCtx.clearRect(0, 0, tw, th);

    // Center transform
    this.offscreenCtx.translate(tw / 2, th / 2);

    // Rotation
    this.offscreenCtx.rotate((this.rotation * Math.PI) / 180);

    // Flips
    const sx = this.flipH ? -1 : 1;
    const sy = this.flipV ? -1 : 1;
    this.offscreenCtx.scale(sx, sy);

    // Draw Image centered
    this.offscreenCtx.drawImage(
      this.originalImg,
      -this.imgWidth / 2,
      -this.imgHeight / 2,
    );
    this.offscreenCtx.restore();

    // 2. Compute Stage Display Scale
    const maxStageW = Math.min(
      580,
      this.stageContainer ? this.stageContainer.clientWidth - 32 : 580,
    );
    const maxStageH = 460;

    this.displayScale = Math.min(maxStageW / tw, maxStageH / th, 1.0);
    this.displayW = Math.round(tw * this.displayScale);
    this.displayH = Math.round(th * this.displayScale);

    // 3. Render Display Canvas
    if (this.displayCanvas) {
      this.displayCanvas.width = this.displayW;
      this.displayCanvas.height = this.displayH;
      const ctx = this.displayCanvas.getContext("2d");
      ctx.drawImage(this.offscreenCanvas, 0, 0, this.displayW, this.displayH);
    }

    // Update Rotation Badge
    if (this.rotationAngleBadge) {
      this.rotationAngleBadge.textContent = `${this.rotation}°`;
    }

    // 4. Update or Reset Crop Box
    if (resetCropBox || !this.cropBox.w) {
      this.centerDefaultCropBox();
    } else {
      this.clampCropBox();
    }

    this.updateOverlayStyles();
    this.renderLivePreview();
  }

  centerDefaultCropBox() {
    let targetW = this.displayW * 0.85;
    let targetH = this.displayH * 0.85;

    if (this.activeAspect) {
      if (targetW / targetH > this.activeAspect) {
        targetW = targetH * this.activeAspect;
      } else {
        targetH = targetW / this.activeAspect;
      }
    }

    this.cropBox = {
      x: Math.round((this.displayW - targetW) / 2),
      y: Math.round((this.displayH - targetH) / 2),
      w: Math.round(targetW),
      h: Math.round(targetH),
    };
  }

  clampCropBox() {
    let { x, y, w, h } = this.cropBox;

    w = Math.min(w, this.displayW);
    h = Math.min(h, this.displayH);

    if (this.activeAspect) {
      if (w / h > this.activeAspect) {
        w = h * this.activeAspect;
      } else {
        h = w / this.activeAspect;
      }
    }

    x = Math.max(0, Math.min(x, this.displayW - w));
    y = Math.max(0, Math.min(y, this.displayH - h));

    this.cropBox = { x, y, w, h };
  }

  applyAspectPreset(presetKey) {
    switch (presetKey) {
      case "free":
        this.setAspectRatio(null, "Free");
        break;
      case "1:1":
        this.setAspectRatio(1.0, "1:1");
        break;
      case "4:3":
        this.setAspectRatio(4 / 3, "4:3");
        break;
      case "3:4":
        this.setAspectRatio(3 / 4, "3:4");
        break;
      case "16:9":
        this.setAspectRatio(16 / 9, "16:9");
        break;
      case "9:16":
        this.setAspectRatio(9 / 16, "9:16");
        break;
      case "3:2":
        this.setAspectRatio(3 / 2, "3:2");
        break;
      case "2:3":
        this.setAspectRatio(2 / 3, "2:3");
        break;
      case "a4":
        this.setAspectRatio(1 / 1.4142, "A4");
        break;
      default:
        this.setAspectRatio(null, "Free");
    }
  }

  setAspectRatio(ratio, labelText) {
    this.activeAspect = ratio;

    if (ratio && this.circleMaskCheckbox && labelText === "1:1") {
      // Keep circle mask state
    } else if (ratio !== 1.0 && this.circleMaskCheckbox) {
      this.isCircleMask = false;
      this.circleMaskCheckbox.checked = false;
    }

    this.centerDefaultCropBox();
    this.updateOverlayStyles();
    this.renderLivePreview();
  }

  updateOverlayStyles() {
    if (!this.overlayBox) return;

    const { x, y, w, h } = this.cropBox;
    this.overlayBox.style.left = `${x}px`;
    this.overlayBox.style.top = `${y}px`;
    this.overlayBox.style.width = `${w}px`;
    this.overlayBox.style.height = `${h}px`;

    if (this.isCircleMask) {
      this.overlayBox.style.borderRadius = "50%";
    } else {
      this.overlayBox.style.borderRadius = "0px";
    }

    // Update real pixel dimension label
    const realW = Math.round(w / this.displayScale);
    const realH = Math.round(h / this.displayScale);

    if (this.boxDimensionsLabel) {
      this.boxDimensionsLabel.textContent = `${realW} × ${realH} px`;
    }
  }

  // Pointer interaction logic for drag & resize
  onPointerDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const handle = e.target.getAttribute("data-handle");
    if (handle) {
      this.isResizing = true;
      this.activeHandle = handle;
    } else {
      this.isDragging = true;
      this.activeHandle = null;
    }

    this.dragStart = { x: e.clientX, y: e.clientY };
    this.boxStart = { ...this.cropBox };

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  }

  onPointerMove(e) {
    if (!this.isDragging && !this.isResizing) return;

    e.preventDefault();

    // Adjust delta by current stage zoom level
    const dx = (e.clientX - this.dragStart.x) / this.zoom;
    const dy = (e.clientY - this.dragStart.y) / this.zoom;

    if (this.isDragging) {
      let newX = this.boxStart.x + dx;
      let newY = this.boxStart.y + dy;

      newX = Math.max(0, Math.min(newX, this.displayW - this.boxStart.w));
      newY = Math.max(0, Math.min(newY, this.displayH - this.boxStart.h));

      this.cropBox.x = Math.round(newX);
      this.cropBox.y = Math.round(newY);
    } else if (this.isResizing) {
      this.resizeCropBox(dx, dy);
    }

    this.updateOverlayStyles();
    this.renderLivePreview();
  }

  onPointerUp(e) {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false;
      this.isResizing = false;
      this.activeHandle = null;
    }
  }

  resizeCropBox(dx, dy) {
    let { x, y, w, h } = this.boxStart;
    const minSize = 24;

    const handle = this.activeHandle;

    if (handle.includes("e")) w += dx;
    if (handle.includes("s")) h += dy;
    if (handle.includes("w")) {
      const possibleW = w - dx;
      if (possibleW >= minSize) {
        x += dx;
        w = possibleW;
      }
    }
    if (handle.includes("n")) {
      const possibleH = h - dy;
      if (possibleH >= minSize) {
        y += dy;
        h = possibleH;
      }
    }

    // Apply active aspect ratio lock
    if (this.activeAspect) {
      if (
        handle === "e" ||
        handle === "w" ||
        handle === "se" ||
        handle === "ne"
      ) {
        h = w / this.activeAspect;
      } else {
        w = h * this.activeAspect;
      }
    }

    // Enforce bounds
    w = Math.max(minSize, Math.min(w, this.displayW - x));
    h = Math.max(minSize, Math.min(h, this.displayH - y));

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    this.cropBox = {
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h),
    };
  }

  renderLivePreview() {
    if (!this.offscreenCanvas || !this.livePreviewCanvas) return;

    const { x, y, w, h } = this.cropBox;

    // Convert display crop box coordinates to full-res offscreen canvas coordinates
    const sourceX = Math.round(x / this.displayScale);
    const sourceY = Math.round(y / this.displayScale);
    const sourceW = Math.round(w / this.displayScale);
    const sourceH = Math.round(h / this.displayScale);

    if (sourceW <= 0 || sourceH <= 0) return;

    this.livePreviewCanvas.width = sourceW;
    this.livePreviewCanvas.height = sourceH;

    const ctx = this.livePreviewCanvas.getContext("2d");
    ctx.clearRect(0, 0, sourceW, sourceH);

    if (this.isCircleMask) {
      ctx.beginPath();
      ctx.arc(
        sourceW / 2,
        sourceH / 2,
        Math.min(sourceW, sourceH) / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(
      this.offscreenCanvas,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      sourceW,
      sourceH,
    );

    // Update live metrics UI
    if (this.liveCropDimensions) {
      this.liveCropDimensions.textContent = `${sourceW} × ${sourceH} px`;
    }

    if (this.liveAspectText) {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(sourceW, sourceH);
      const aspectW = Math.round((sourceW / divisor) * 10) / 10;
      const aspectH = Math.round((sourceH / divisor) * 10) / 10;

      if (this.activeAspect) {
        this.liveAspectText.textContent = `${aspectW}:${aspectH}`;
      } else {
        this.liveAspectText.textContent = `${(sourceW / sourceH).toFixed(2)}:1 (Free)`;
      }
    }

    if (this.liveEstSize) {
      // Rough estimate based on megapixels and quality
      const megaPixels = (sourceW * sourceH) / 1000000;
      const estKB = Math.round(
        megaPixels * 350 * (parseFloat(this.qualitySlider?.value || 90) / 100),
      );
      this.liveEstSize.textContent =
        estKB > 1024 ? `~${(estKB / 1024).toFixed(1)} MB` : `~${estKB} KB`;
    }
  }

  executeCrop() {
    if (!this.offscreenCanvas || !this.cropBox) return;

    this.configSection.style.display = "none";
    this.progressSection.style.display = "block";

    if (this.progressBar) this.progressBar.style.width = "10%";
    if (this.progressStatus)
      this.progressStatus.textContent = "Extracting pixel region...";

    setTimeout(() => {
      const { x, y, w, h } = this.cropBox;
      const sourceX = Math.round(x / this.displayScale);
      const sourceY = Math.round(y / this.displayScale);
      const sourceW = Math.round(w / this.displayScale);
      const sourceH = Math.round(h / this.displayScale);

      // Create output canvas
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = sourceW;
      outputCanvas.height = sourceH;

      const ctx = outputCanvas.getContext("2d");

      if (this.progressBar) this.progressBar.style.width = "50%";
      if (this.progressStatus)
        this.progressStatus.textContent =
          "Applying mask & high quality compression...";

      if (this.isCircleMask) {
        ctx.beginPath();
        ctx.arc(
          sourceW / 2,
          sourceH / 2,
          Math.min(sourceW, sourceH) / 2,
          0,
          Math.PI * 2,
        );
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(
        this.offscreenCanvas,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        sourceW,
        sourceH,
      );

      // Export format & quality
      let format = this.exportFormatSelect?.value || "original";
      if (format === "original") {
        format = this.file.type || "image/jpeg";
      }

      const quality = parseFloat(this.qualitySlider?.value || 90) / 100;

      outputCanvas.toBlob(
        (blob) => {
          if (this.progressBar) this.progressBar.style.width = "100%";

          setTimeout(() => {
            this.progressSection.style.display = "none";
            this.resultSection.style.display = "block";

            const croppedUrl = URL.createObjectURL(blob);
            if (this.resultCroppedImage)
              this.resultCroppedImage.src = croppedUrl;

            // Stats
            if (this.resOrigDims)
              this.resOrigDims.textContent = `${this.imgWidth} × ${this.imgHeight} px`;
            if (this.resCroppedDims)
              this.resCroppedDims.textContent = `${sourceW} × ${sourceH} px`;
            if (this.resOrigSize)
              this.resOrigSize.textContent = ImageUtils.formatBytes(
                this.file.size,
              );
            if (this.resCroppedSize)
              this.resCroppedSize.textContent = ImageUtils.formatBytes(
                blob.size,
              );

            // Download Link
            if (this.btnDownloadCropped) {
              const baseName =
                this.outputFilenameInput?.value.trim() || "cropped-image";
              const ext =
                format === "image/png"
                  ? "png"
                  : format === "image/webp"
                    ? "webp"
                    : "jpg";
              this.btnDownloadCropped.href = croppedUrl;
              this.btnDownloadCropped.download = `${baseName}.${ext}`;
            }
          }, 300);
        },
        format,
        quality,
      );
    }, 200);
  }

  resetToUpload() {
    this.file = null;
    this.originalImg = null;
    this.fileInput.value = "";

    this.resultSection.style.display = "none";
    this.configSection.style.display = "none";
    this.progressSection.style.display = "none";
    this.uploadSection.style.display = "block";
  }
}

// Auto-initialize when DOM ready
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    new CropImageController();
  });
}
