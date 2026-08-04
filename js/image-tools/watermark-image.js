/**
 * Comprexa - Universal Watermark Image Controller
 * Completely rebuilt client-side image watermark generator with live preview,
 * custom text & logo watermarks, 9-grid alignment, tile patterns, and batch ZIP export.
 */

import JSZip from "jszip";

export class WatermarkImageController {
  constructor() {
    // Queue State
    this.queue = []; // [{ id, file, name, size, type, ext, width, height, previewUrl, imgElement }]
    this.activeQueueIndex = 0;
    this.nextId = 1;

    // Watermark Configuration State
    this.watermarkMode = "text"; // 'text' | 'image'

    // Text Watermark Settings
    this.wmText = "© COMPREXA WATERMARK";
    this.fontFamily = "Plus Jakarta Sans";
    this.fontSize = 48; // in px
    this.isBold = true;
    this.isItalic = false;
    this.textColor = "#FFFFFF";

    // Logo Image Watermark Settings
    this.logoFile = null;
    this.logoImg = null; // HTMLImageElement
    this.logoScale = 25; // % of target image width

    // Shared Watermark Settings
    this.opacity = 0.7; // 0.05 to 1.0
    this.rotation = 0; // -180 to 180 degrees
    this.margin = 24; // margin in px from edges
    this.position = "center"; // 'top-left' | 'top-center' | 'top-right' | 'left-center' | 'center' | 'right-center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'tile'

    // Results State
    this.convertedResults = []; // [{ id, filename, blob, dataUrl, width, height, originalSize, convertedSize }]

    this.initDOM();
    this.bindEvents();
    this.createDefaultLogo();
  }

  initDOM() {
    // Main Sections
    this.uploadSection = document.getElementById("watermark-upload-section");
    this.studioSection = document.getElementById("watermark-studio-section");
    this.processingSection = document.getElementById(
      "watermark-processing-state",
    );
    this.resultSection = document.getElementById("watermark-result-section");

    // Upload Elements
    this.dropzone = document.getElementById("watermark-dropzone");
    this.fileInput = document.getElementById("watermark-file-input");
    this.addMoreInput = document.getElementById("add-more-file-input");
    this.browseTriggerBtn = document.getElementById("btn-browse-trigger");

    // Studio Header & Queue
    this.countBadge = document.getElementById("uploaded-count-badge");
    this.addMoreBtn = document.getElementById("btn-add-more-trigger");
    this.clearAllBtn = document.getElementById("btn-clear-all");
    this.queueStrip = document.getElementById("image-queue-strip");

    // Live Canvas Preview
    this.canvas = document.getElementById("watermark-canvas");
    this.resolutionTag = document.getElementById("preview-resolution-tag");

    // Mode Tabs
    this.tabTextMode = document.getElementById("tab-text-mode");
    this.tabImageMode = document.getElementById("tab-image-mode");
    this.textControlsPanel = document.getElementById("text-controls-panel");
    this.imageControlsPanel = document.getElementById("image-controls-panel");

    // Text Controls
    this.wmTextInput = document.getElementById("wm-text-input");
    this.wmFontFamilySelect = document.getElementById("wm-font-family");
    this.btnToggleBold = document.getElementById("btn-toggle-bold");
    this.btnToggleItalic = document.getElementById("btn-toggle-italic");
    this.fontSizeSlider = document.getElementById("wm-font-size-slider");
    this.fontSizeVal = document.getElementById("wm-font-size-val");
    this.textColorBtns = document.querySelectorAll(".text-color-btn");
    this.customColorPicker = document.getElementById(
      "custom-text-color-picker",
    );

    // Image Logo Controls
    this.logoFileInput = document.getElementById("logo-file-input");
    this.btnBrowseLogo = document.getElementById("btn-browse-logo");
    this.logoFilenameText = document.getElementById("logo-filename-text");
    this.logoScaleSlider = document.getElementById("wm-logo-scale-slider");
    this.logoScaleVal = document.getElementById("wm-logo-scale-val");

    // Shared Controls
    this.opacitySlider = document.getElementById("wm-opacity-slider");
    this.opacityVal = document.getElementById("wm-opacity-val");
    this.rotationSlider = document.getElementById("wm-rotation-slider");
    this.rotationVal = document.getElementById("wm-rotation-val");
    this.marginSlider = document.getElementById("wm-margin-slider");
    this.marginVal = document.getElementById("wm-margin-val");
    this.posGridBtns = document.querySelectorAll(".pos-grid-btn");

    // Execute Action Button
    this.executeBtn = document.getElementById("btn-execute-watermark");
    this.executeLabel = document.getElementById("btn-execute-label");

    // Processing Progress
    this.statusTitle = document.getElementById("watermark-status-title");
    this.statusDesc = document.getElementById("watermark-status-desc");
    this.progressFill = document.getElementById("watermark-progress-fill");
    this.progressPercent = document.getElementById(
      "watermark-progress-percent",
    );

    // Results Section
    this.resultSummaryText = document.getElementById("result-summary-text");
    this.downloadAllZipBtn = document.getElementById("btn-download-all-zip");
    this.startOverBtn = document.getElementById("btn-start-over");
    this.resultsContainer = document.getElementById(
      "watermark-results-container",
    );
  }

  bindEvents() {
    // Dropzone Upload Trigger
    if (this.dropzone) {
      this.dropzone.addEventListener("click", (e) => {
        if (e.target.closest("#btn-browse-trigger")) return;
        if (this.fileInput) this.fileInput.click();
      });

      this.dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (this.fileInput) this.fileInput.click();
        }
      });

      ["dragenter", "dragover"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("drop-zone--active");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("drop-zone--active");
        });
      });

      this.dropzone.addEventListener("drop", (e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length > 0) this.addFilesToQueue(files);
      });
    }

    if (this.browseTriggerBtn && this.fileInput) {
      this.browseTriggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.fileInput.click();
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          this.addFilesToQueue(files);
          this.fileInput.value = "";
        }
      });
    }

    // Add More Input
    if (this.addMoreBtn && this.addMoreInput) {
      this.addMoreBtn.addEventListener("click", () =>
        this.addMoreInput.click(),
      );
      this.addMoreInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          this.addFilesToQueue(files);
          this.addMoreInput.value = "";
        }
      });
    }

    // Clear All Queue
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener("click", () => this.clearQueue());
    }

    // Clipboard Paste Listener
    document.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        this.showToast(
          `Pasted ${pastedFiles.length} image(s) from clipboard`,
          "success",
        );
        this.addFilesToQueue(pastedFiles);
      }
    });

    // Mode Switcher Tabs
    if (this.tabTextMode && this.tabImageMode) {
      this.tabTextMode.addEventListener("click", () => this.switchMode("text"));
      this.tabImageMode.addEventListener("click", () =>
        this.switchMode("image"),
      );
    }

    // Text Watermark Inputs
    if (this.wmTextInput) {
      this.wmTextInput.addEventListener("input", (e) => {
        this.wmText = e.target.value;
        this.renderLivePreview();
      });
    }

    if (this.wmFontFamilySelect) {
      this.wmFontFamilySelect.addEventListener("change", (e) => {
        this.fontFamily = e.target.value;
        this.renderLivePreview();
      });
    }

    if (this.btnToggleBold) {
      this.btnToggleBold.addEventListener("click", () => {
        this.isBold = !this.isBold;
        if (this.isBold) {
          this.btnToggleBold.classList.add("btn--primary", "active");
          this.btnToggleBold.classList.remove("btn--outline");
        } else {
          this.btnToggleBold.classList.remove("btn--primary", "active");
          this.btnToggleBold.classList.add("btn--outline");
        }
        this.renderLivePreview();
      });
    }

    if (this.btnToggleItalic) {
      this.btnToggleItalic.addEventListener("click", () => {
        this.isItalic = !this.isItalic;
        if (this.isItalic) {
          this.btnToggleItalic.classList.add("btn--primary", "active");
          this.btnToggleItalic.classList.remove("btn--outline");
        } else {
          this.btnToggleItalic.classList.remove("btn--primary", "active");
          this.btnToggleItalic.classList.add("btn--outline");
        }
        this.renderLivePreview();
      });
    }

    if (this.fontSizeSlider) {
      this.fontSizeSlider.addEventListener("input", (e) => {
        this.fontSize = parseInt(e.target.value, 10);
        if (this.fontSizeVal)
          this.fontSizeVal.textContent = `${this.fontSize} px`;
        this.renderLivePreview();
      });
    }

    this.textColorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.textColorBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
        btn.classList.add("btn--primary", "active");
        btn.classList.remove("btn--outline");

        this.textColor = btn.getAttribute("data-color");
        if (this.customColorPicker)
          this.customColorPicker.value = this.textColor;
        this.renderLivePreview();
      });
    });

    if (this.customColorPicker) {
      this.customColorPicker.addEventListener("input", (e) => {
        this.textColor = e.target.value;
        this.textColorBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
        this.renderLivePreview();
      });
    }

    // Logo Image Controls
    if (this.btnBrowseLogo && this.logoFileInput) {
      this.btnBrowseLogo.addEventListener("click", () =>
        this.logoFileInput.click(),
      );
      this.logoFileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) this.loadLogoImageFromFile(file);
      });
    }

    if (this.logoScaleSlider) {
      this.logoScaleSlider.addEventListener("input", (e) => {
        this.logoScale = parseInt(e.target.value, 10);
        if (this.logoScaleVal)
          this.logoScaleVal.textContent = `${this.logoScale}%`;
        this.renderLivePreview();
      });
    }

    // Shared Controls
    if (this.opacitySlider) {
      this.opacitySlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.opacity = val / 100;
        if (this.opacityVal) this.opacityVal.textContent = `${val}%`;
        this.renderLivePreview();
      });
    }

    if (this.rotationSlider) {
      this.rotationSlider.addEventListener("input", (e) => {
        this.rotation = parseInt(e.target.value, 10);
        if (this.rotationVal)
          this.rotationVal.textContent = `${this.rotation}°`;
        this.renderLivePreview();
      });
    }

    if (this.marginSlider) {
      this.marginSlider.addEventListener("input", (e) => {
        this.margin = parseInt(e.target.value, 10);
        if (this.marginVal) this.marginVal.textContent = `${this.margin} px`;
        this.renderLivePreview();
      });
    }

    this.posGridBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.posGridBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
        btn.classList.add("btn--primary", "active");
        btn.classList.remove("btn--outline");

        this.position = btn.getAttribute("data-pos");
        this.renderLivePreview();
      });
    });

    // Execute Watermark Button
    if (this.executeBtn) {
      this.executeBtn.addEventListener("click", () =>
        this.executeWatermarkProcess(),
      );
    }

    // Download All ZIP
    if (this.downloadAllZipBtn) {
      this.downloadAllZipBtn.addEventListener("click", () =>
        this.downloadAllZip(),
      );
    }

    // Start Over Button
    if (this.startOverBtn) {
      this.startOverBtn.addEventListener("click", () => this.resetToUpload());
    }
  }

  createDefaultLogo() {
    // Generates a clean default SVG watermark icon if user hasn't uploaded a logo
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#6366f1" fill-opacity="0.85"/>
      <path d="m9 12 2 2 4-4" stroke="#FFFFFF" stroke-width="2.5"/>
    </svg>`;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      this.logoImg = img;
    };
    img.src = url;
  }

  switchMode(mode) {
    this.watermarkMode = mode;
    if (mode === "text") {
      if (this.tabTextMode) {
        this.tabTextMode.classList.add("btn--primary", "active");
        this.tabTextMode.classList.remove("btn--outline");
      }
      if (this.tabImageMode) {
        this.tabImageMode.classList.remove("btn--primary", "active");
        this.tabImageMode.classList.add("btn--outline");
      }
      if (this.textControlsPanel) this.textControlsPanel.style.display = "flex";
      if (this.imageControlsPanel)
        this.imageControlsPanel.style.display = "none";
    } else {
      if (this.tabImageMode) {
        this.tabImageMode.classList.add("btn--primary", "active");
        this.tabImageMode.classList.remove("btn--outline");
      }
      if (this.tabTextMode) {
        this.tabTextMode.classList.remove("btn--primary", "active");
        this.tabTextMode.classList.add("btn--outline");
      }
      if (this.textControlsPanel) this.textControlsPanel.style.display = "none";
      if (this.imageControlsPanel)
        this.imageControlsPanel.style.display = "flex";
    }
    this.renderLivePreview();
  }

  loadLogoImageFromFile(file) {
    const validTypes = [
      "image/png",
      "image/webp",
      "image/jpeg",
      "image/bmp",
      "image/svg+xml",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(png|webp|jpg|jpeg|bmp|svg)$/i)
    ) {
      this.showToast("Unsupported logo image format", "error");
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.logoFile = file;
      this.logoImg = img;
      if (this.logoFilenameText) this.logoFilenameText.textContent = file.name;
      this.showToast("Watermark logo loaded successfully", "success");
      this.renderLivePreview();
    };
    img.onerror = () => {
      this.showToast("Failed to load logo image", "error");
    };
    img.src = url;
  }

  async addFilesToQueue(files) {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/bmp",
    ];
    const validExts = ["jpg", "jpeg", "png", "webp", "bmp"];

    let addedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const isTypeValid =
        validTypes.includes(file.type) || validExts.includes(ext);

      if (!isTypeValid) {
        skippedCount++;
        continue;
      }

      try {
        const loadedData = await this.loadImageElement(file);
        const item = {
          id: this.nextId++,
          file: file,
          name: file.name,
          size: file.size,
          sizeFormatted: this.formatFileSize(file.size),
          type: file.type || `image/${ext}`,
          ext: ext.toUpperCase(),
          width: loadedData.width,
          height: loadedData.height,
          previewUrl: loadedData.previewUrl,
          imgElement: loadedData.imgElement,
        };

        this.queue.push(item);
        addedCount++;
      } catch (err) {}
    }

    if (skippedCount > 0) {
      this.showToast(
        `Skipped ${skippedCount} unsupported file(s). Supported: JPG, PNG, WebP & BMP`,
        "info",
      );
    }

    if (addedCount > 0) {
      this.showToast(`Added ${addedCount} photo(s)`, "success");
      this.renderQueueUI();
    }
  }

  loadImageElement(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          previewUrl: url,
          imgElement: img,
        });
      };
      img.onerror = () => {
        reject(new Error(`Failed to decode image ${file.name}`));
      };
      img.src = url;
    });
  }

  removeFileFromQueue(id) {
    const idx = this.queue.findIndex((item) => item.id === id);
    if (idx !== -1) {
      const removed = this.queue.splice(idx, 1)[0];
      if (removed && removed.previewUrl)
        URL.revokeObjectURL(removed.previewUrl);

      if (this.activeQueueIndex >= this.queue.length) {
        this.activeQueueIndex = Math.max(0, this.queue.length - 1);
      }
      this.renderQueueUI();
    }
  }

  clearQueue() {
    this.queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    this.queue = [];
    this.activeQueueIndex = 0;
    this.renderQueueUI();
  }

  renderQueueUI() {
    const count = this.queue.length;

    if (this.countBadge) {
      this.countBadge.textContent = `${count} image${count === 1 ? "" : "s"}`;
    }

    if (count === 0) {
      if (this.uploadSection) this.uploadSection.style.display = "block";
      if (this.studioSection) this.studioSection.style.display = "none";
      if (this.processingSection) this.processingSection.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "none";
      return;
    }

    if (this.uploadSection) this.uploadSection.style.display = "none";
    if (this.studioSection) this.studioSection.style.display = "block";
    if (this.processingSection) this.processingSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "none";

    if (this.executeLabel) {
      this.executeLabel.textContent =
        count === 1
          ? "Apply & Export Watermark"
          : `Apply Watermark to All ${count} Images`;
    }

    // Render Queue Thumbnails Strip
    if (this.queueStrip) {
      this.queueStrip.innerHTML = "";
      if (count > 1) {
        this.queueStrip.style.display = "flex";
        this.queue.forEach((item, index) => {
          const isActive = index === this.activeQueueIndex;
          const thumb = document.createElement("div");
          thumb.style.cssText = `
            width: 58px;
            height: 58px;
            border-radius: var(--radius-md);
            overflow: hidden;
            flex-shrink: 0;
            cursor: pointer;
            border: 2px solid ${isActive ? "var(--primary)" : "var(--border-subtle)"};
            background: var(--bg-surface-subtle);
            position: relative;
            transition: all 0.15s ease;
          `;

          thumb.innerHTML = `
            <img src="${item.previewUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            <button type="button" class="btn-remove-thumb" data-id="${item.id}" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.7); color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">×</button>
          `;

          thumb.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-remove-thumb")) {
              e.stopPropagation();
              const id = parseInt(e.target.getAttribute("data-id"), 10);
              this.removeFileFromQueue(id);
              return;
            }
            this.activeQueueIndex = index;
            this.renderQueueUI();
          });

          this.queueStrip.appendChild(thumb);
        });
      } else {
        this.queueStrip.style.display = "none";
      }
    }

    this.renderLivePreview();
  }

  renderLivePreview() {
    if (this.queue.length === 0 || !this.canvas) return;

    const activeItem = this.queue[this.activeQueueIndex] || this.queue[0];
    if (!activeItem || !activeItem.imgElement) return;

    if (this.resolutionTag) {
      this.resolutionTag.textContent = `${activeItem.width} × ${activeItem.height} px`;
    }

    // Draw Watermark on Canvas
    this.drawWatermarkOnCanvas(this.canvas, activeItem.imgElement);
  }

  drawWatermarkOnCanvas(targetCanvas, baseImg) {
    const width = baseImg.naturalWidth || baseImg.width;
    const height = baseImg.naturalHeight || baseImg.height;

    targetCanvas.width = width;
    targetCanvas.height = height;

    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. Draw Base Photo
    ctx.drawImage(baseImg, 0, 0, width, height);

    // 2. Draw Watermark Layer
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.watermarkMode === "text") {
      this.drawTextWatermarkLayer(ctx, width, height);
    } else {
      this.drawImageWatermarkLayer(ctx, width, height);
    }

    ctx.restore();
  }

  drawTextWatermarkLayer(ctx, width, height) {
    if (!this.wmText || this.wmText.trim() === "") return;

    const fontStyleStr = `${this.isItalic ? "italic " : ""}${this.isBold ? "bold " : ""}${this.fontSize}px "${this.fontFamily}", sans-serif`;
    ctx.font = fontStyleStr;
    ctx.fillStyle = this.textColor;

    const textMetrics = ctx.measureText(this.wmText);
    const textWidth = textMetrics.width;
    const textHeight = this.fontSize; // Approximate text bounding height

    if (this.position === "tile") {
      // Repeat Grid Tile Mode
      const stepX = Math.max(textWidth + this.margin * 2, 120);
      const stepY = Math.max(textHeight + this.margin * 3, 100);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = -height; y < height * 2; y += stepY) {
        for (let x = -width; x < width * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.fillText(this.wmText, 0, 0);
          ctx.restore();
        }
      }
    } else {
      // 9-Grid Position Alignment
      const coords = this.calculateAnchorPosition(
        this.position,
        width,
        height,
        textWidth,
        textHeight,
        this.margin,
      );

      ctx.save();
      ctx.translate(coords.centerX, coords.centerY);
      ctx.rotate((this.rotation * Math.PI) / 180);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.wmText, 0, 0);
      ctx.restore();
    }
  }

  drawImageWatermarkLayer(ctx, width, height) {
    if (!this.logoImg) return;

    const logoNatWidth = this.logoImg.naturalWidth || this.logoImg.width || 100;
    const logoNatHeight =
      this.logoImg.naturalHeight || this.logoImg.height || 100;

    // Calculate Target Logo Dimensions based on logoScale %
    const targetLogoWidth = Math.max((width * this.logoScale) / 100, 20);
    const targetLogoHeight = (logoNatHeight / logoNatWidth) * targetLogoWidth;

    if (this.position === "tile") {
      const stepX = Math.max(targetLogoWidth + this.margin * 2, 100);
      const stepY = Math.max(targetLogoHeight + this.margin * 2, 100);

      for (let y = -height; y < height * 2; y += stepY) {
        for (let x = -width; x < width * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.drawImage(
            this.logoImg,
            -targetLogoWidth / 2,
            -targetLogoHeight / 2,
            targetLogoWidth,
            targetLogoHeight,
          );
          ctx.restore();
        }
      }
    } else {
      const coords = this.calculateAnchorPosition(
        this.position,
        width,
        height,
        targetLogoWidth,
        targetLogoHeight,
        this.margin,
      );

      ctx.save();
      ctx.translate(coords.centerX, coords.centerY);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.drawImage(
        this.logoImg,
        -targetLogoWidth / 2,
        -targetLogoHeight / 2,
        targetLogoWidth,
        targetLogoHeight,
      );
      ctx.restore();
    }
  }

  calculateAnchorPosition(
    pos,
    canvasWidth,
    canvasHeight,
    elementWidth,
    elementHeight,
    margin,
  ) {
    let centerX = canvasWidth / 2;
    let centerY = canvasHeight / 2;

    switch (pos) {
      case "top-left":
        centerX = margin + elementWidth / 2;
        centerY = margin + elementHeight / 2;
        break;
      case "top-center":
        centerX = canvasWidth / 2;
        centerY = margin + elementHeight / 2;
        break;
      case "top-right":
        centerX = canvasWidth - margin - elementWidth / 2;
        centerY = margin + elementHeight / 2;
        break;
      case "left-center":
        centerX = margin + elementWidth / 2;
        centerY = canvasHeight / 2;
        break;
      case "center":
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
        break;
      case "right-center":
        centerX = canvasWidth - margin - elementWidth / 2;
        centerY = canvasHeight / 2;
        break;
      case "bottom-left":
        centerX = margin + elementWidth / 2;
        centerY = canvasHeight - margin - elementHeight / 2;
        break;
      case "bottom-center":
        centerX = canvasWidth / 2;
        centerY = canvasHeight - margin - elementHeight / 2;
        break;
      case "bottom-right":
        centerX = canvasWidth - margin - elementWidth / 2;
        centerY = canvasHeight - margin - elementHeight / 2;
        break;
    }

    return { centerX, centerY };
  }

  async executeWatermarkProcess() {
    if (this.queue.length === 0) return;

    if (this.studioSection) this.studioSection.style.display = "none";
    if (this.processingSection) this.processingSection.style.display = "block";

    this.convertedResults = [];
    const total = this.queue.length;

    for (let i = 0; i < total; i++) {
      const item = this.queue[i];
      const pct = Math.round(((i + 1) / total) * 100);

      if (this.statusTitle)
        this.statusTitle.textContent = `Watermarking Images (${i + 1}/${total})...`;
      if (this.statusDesc)
        this.statusDesc.textContent = `Processing "${item.name}"...`;
      if (this.progressFill) this.progressFill.style.width = `${pct}%`;
      if (this.progressPercent) this.progressPercent.textContent = `${pct}%`;

      try {
        const result = await this.processSingleWatermark(item);
        this.convertedResults.push(result);
      } catch (err) {
        console.error(`Error processing ${item.name}`, err);
        this.showToast(`Error processing ${item.name}`, "error");
      }
    }

    setTimeout(() => {
      if (this.processingSection) this.processingSection.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "block";
      this.renderResultsUI();
      this.showToast("Watermark applied successfully!", "success");
    }, 300);
  }

  processSingleWatermark(item) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      this.drawWatermarkOnCanvas(canvas, item.imgElement);

      const mimeType = item.type || "image/jpeg";
      const baseName =
        item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
      const ext = item.ext.toLowerCase();
      const filename = `${baseName}_watermarked.${ext}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback blob
            canvas.toBlob((fallbackBlob) => {
              const dataUrl = URL.createObjectURL(fallbackBlob);
              resolve({
                id: item.id,
                filename: filename,
                blob: fallbackBlob,
                dataUrl: dataUrl,
                width: canvas.width,
                height: canvas.height,
                originalSize: item.size,
                convertedSize: fallbackBlob.size,
              });
            }, "image/png");
            return;
          }

          const dataUrl = URL.createObjectURL(blob);
          resolve({
            id: item.id,
            filename: filename,
            blob: blob,
            dataUrl: dataUrl,
            width: canvas.width,
            height: canvas.height,
            originalSize: item.size,
            convertedSize: blob.size,
          });
        },
        mimeType === "image/bmp" ? "image/png" : mimeType,
        0.95,
      );
    });
  }

  renderResultsUI() {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = "";

    const count = this.convertedResults.length;

    if (this.resultSummaryText) {
      this.resultSummaryText.textContent = `Applied watermark to ${count} photo${count === 1 ? "" : "s"} with high-quality pixel preservation.`;
    }

    if (this.downloadAllZipBtn) {
      if (count > 1) {
        this.downloadAllZipBtn.style.display = "inline-flex";
      } else {
        this.downloadAllZipBtn.style.display = "none";
      }
    }

    this.convertedResults.forEach((res) => {
      const card = document.createElement("div");
      card.className = "result-item-card";
      card.style.cssText = `
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        background: var(--bg-surface);
        flex-wrap: wrap;
      `;

      card.innerHTML = `
        <div style="width: 64px; height: 64px; border-radius: var(--radius-lg); overflow: hidden; background: #0f172a; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
          <img src="${res.dataUrl}" alt="${res.filename}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <div style="flex: 1; min-width: 220px;">
          <div style="font-size: 0.98rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${res.filename}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
            <span>${res.width} × ${res.height} px</span>
            <span>•</span>
            <span>Size: <strong>${this.formatFileSize(res.convertedSize)}</strong></span>
            <span class="badge badge--success badge--sm" style="font-size: 0.7rem; font-weight: 800;">Protected</span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button type="button" class="btn btn--primary btn--sm btn-download-single" data-id="${res.id}" style="height: 38px; padding: 0 16px; font-weight: 700;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download</span>
          </button>
        </div>
      `;

      const downloadBtn = card.querySelector(".btn-download-single");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () =>
          this.downloadSingleResult(res),
        );
      }

      this.resultsContainer.appendChild(card);
    });
  }

  downloadSingleResult(res) {
    const a = document.createElement("a");
    a.href = res.dataUrl;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(res.filename) : String(res.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast(`Downloading "${res.filename}"...`, "info");
  }

  async downloadAllZip() {
    if (this.convertedResults.length === 0) return;

    try {
      this.showToast("Generating ZIP archive...", "info");

      const ZipClass = window.JSZip || JSZip;
      const zip = new ZipClass();

      this.convertedResults.forEach((item) => {
        zip.file(item.filename, item.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename("watermarked_images.zip") : String("watermarked_images.zip").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
      this.showToast("ZIP archive downloaded successfully!", "success");
    } catch (err) {
      console.error("ZIP generation error", err);
      this.showToast("Failed to create ZIP package.", "error");
    }
  }

  resetToUpload() {
    this.clearQueue();
    this.convertedResults.forEach((res) => {
      if (res.dataUrl) URL.revokeObjectURL(res.dataUrl);
    });
    this.convertedResults = [];

    if (this.uploadSection) this.uploadSection.style.display = "block";
    if (this.studioSection) this.studioSection.style.display = "none";
    if (this.processingSection) this.processingSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "none";
  }

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  showToast(message, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type);
    }
  }
}

// Auto Initialize
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.watermarkImageControllerInstance = new WatermarkImageController();
  });
}
