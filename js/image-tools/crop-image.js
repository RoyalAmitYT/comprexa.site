// @ts-nocheck
/**
 * Comprexa - Crop Image Tool (Cropper.js integration)
 * Rebuilt from scratch for maximum reliability.
 */

import {
  ImageValidator,
  ImageMetadataExtractor,
  ImageExporter,
  ImageUtils,
  GlobalImageProgressManager,
  ImageProgressState,
} from "../image-engine.js";

class CropImageApp {
  constructor() {
    this.cropper = null;
    this.currentFile = null;
    this.currentMetadata = null;
    this.objectUrl = null;
    this.resultDataUrl = null;
    this.resultBlob = null;
    
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.uploadSection = document.getElementById("crop-upload-section");
    this.configSection = document.getElementById("crop-config-section");
    this.progressSection = document.getElementById("crop-progress-section");
    this.resultSection = document.getElementById("crop-result-section");
    
    // Upload elements
    this.dropZone = document.getElementById("crop-dropzone");
    this.fileInput = document.getElementById("crop-file-input");
    this.btnBrowse = this.dropZone ? this.dropZone.querySelector(".file-uploader__choose-btn") : document.getElementById("btn-browse-files");
    
    // Header elements
    this.filenameEl = document.getElementById("uploaded-filename");
    this.filedimsEl = document.getElementById("uploaded-filedims");
    this.filesizeEl = document.getElementById("uploaded-filesize");
    this.btnChange = document.getElementById("btn-change-image");
    
    // Cropper elements
    this.imageElement = document.getElementById("cropper-image");
    
    // Aspect ratio chips
    this.aspectChips = document.querySelectorAll(".aspect-preset-btn");
    this.socialChips = document.querySelectorAll(".social-preset-btn");
    
    // Zoom and Quality
    this.zoomSlider = document.getElementById("zoom-slider");
    this.zoomValue = document.getElementById("zoom-value");
    this.btnZoomOut = document.getElementById("btn-zoom-out");
    this.btnZoomIn = document.getElementById("btn-zoom-in");
    
    // Export settings
    this.exportFormat = document.getElementById("export-format-select");
    this.exportQuality = document.getElementById("quality-slider");
    this.qualityWrapper = document.getElementById("quality-slider-container");
    this.qualityValBadge = document.getElementById("quality-val-badge");
    this.outputFilenameInput = document.getElementById("output-filename-input");
    
    // Actions
    this.btnResetStage = document.getElementById("btn-reset-stage");
    this.btnExecuteCrop = document.getElementById("btn-execute-crop");
    this.btnDownloadCropped = document.getElementById("btn-download-cropped");
    
    // Live metrics
    this.liveCropDimensions = document.getElementById("live-crop-dimensions");
    this.liveAspectText = document.getElementById("live-aspect-text");
    this.liveEstSize = document.getElementById("live-est-size");
    
    // Result elements
    this.resultImage = document.getElementById("result-cropped-image");
    this.resOrigDims = document.getElementById("res-orig-dims");
    this.resCroppedDims = document.getElementById("res-cropped-dims");
    this.resOrigSize = document.getElementById("res-orig-size");
    this.resCroppedSize = document.getElementById("res-cropped-size");
    
    // Live preview
    this.livePreviewCanvas = document.getElementById("live-crop-preview-canvas");
    this.circleMaskCheckbox = document.getElementById("circle-mask-checkbox");
    
    // Transform buttons
    this.btnRotateCCW = document.getElementById("btn-rotate-ccw");
    this.btnRotateCW = document.getElementById("btn-rotate-cw");
    this.btnFlipH = document.getElementById("btn-flip-h");
    this.btnFlipV = document.getElementById("btn-flip-v");
    this.rotationAngleBadge = document.getElementById("rotation-angle-badge");
  }

  bindEvents() {
    // ----------------------------------------------------
    // UPLOAD EVENTS
    // ----------------------------------------------------
    window.addEventListener("dragover", (e) => { e.preventDefault(); e.stopPropagation(); });
    window.addEventListener("drop", (e) => { e.preventDefault(); e.stopPropagation(); });

    if (this.dropZone) {
      this.dropZone.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON" && e.target !== this.fileInput) {
          if (this.fileInput) this.fileInput.click();
        }
      });
      this.dropZone.addEventListener("dragenter", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      this.dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add("drop-zone--active");
        this.dropZone.classList.add("file-uploader__dropzone--active");
      });
      this.dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove("drop-zone--active");
        this.dropZone.classList.remove("file-uploader__dropzone--active");
      });
      this.dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove("drop-zone--active");
        this.dropZone.classList.remove("file-uploader__dropzone--active");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.processFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.btnBrowse && this.fileInput) {
      this.btnBrowse.addEventListener("click", () => this.fileInput.click());
    }
    
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          e.target.value = ""; // Clear input so same file can be selected again
          this.processFile(file);
        }
      });
    }
    
    window.addEventListener("paste", (e) => {
      if (this.uploadSection && this.uploadSection.style.display !== "none") {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              this.processFile(file);
              break;
            }
          }
        }
      }
    });

    if (this.btnChange) {
      this.btnChange.addEventListener("click", () => this.resetWorkspace());
    }

    // ----------------------------------------------------
    // EDITOR EVENTS
    // ----------------------------------------------------
    this.aspectChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.clearActiveChips();
        chip.classList.add("active", "btn--primary");
        chip.classList.remove("btn--outline");
        if (this.cropper) {
          let aspect = chip.dataset.aspect;
          if (aspect === "free") aspect = NaN;
          else if (aspect === "a4") aspect = 1 / 1.414;
          else {
            const [w, h] = aspect.split(":");
            aspect = parseInt(w, 10) / parseInt(h, 10);
          }
          this.cropper.setAspectRatio(aspect);
        }
      });
    });

    this.socialChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.clearActiveChips();
        chip.classList.add("active", "btn--primary");
        chip.classList.remove("btn--outline");
        if (this.cropper) {
          let ratio = chip.dataset.ratio;
          const [w, h] = ratio.split(":");
          this.cropper.setAspectRatio(parseFloat(w) / parseFloat(h));
        }
      });
    });

    if (this.zoomSlider) {
      this.zoomSlider.addEventListener("input", (e) => {
        if (this.cropper) {
          const val = parseFloat(e.target.value) / 100;
          this.cropper.zoomTo(val);
          if (this.zoomValue) this.zoomValue.textContent = `${e.target.value}%`;
        }
      });
    }

    if (this.btnZoomOut && this.zoomSlider) {
      this.btnZoomOut.addEventListener("click", () => {
        if (!this.cropper) return;
        let val = parseInt(this.zoomSlider.value, 10);
        val = Math.max(parseInt(this.zoomSlider.min, 10), val - 10);
        this.zoomSlider.value = val;
        this.cropper.zoomTo(val / 100);
        if (this.zoomValue) this.zoomValue.textContent = `${val}%`;
      });
    }

    if (this.btnZoomIn && this.zoomSlider) {
      this.btnZoomIn.addEventListener("click", () => {
        if (!this.cropper) return;
        let val = parseInt(this.zoomSlider.value, 10);
        val = Math.min(parseInt(this.zoomSlider.max, 10), val + 10);
        this.zoomSlider.value = val;
        this.cropper.zoomTo(val / 100);
        if (this.zoomValue) this.zoomValue.textContent = `${val}%`;
      });
    }

    if (this.btnRotateCCW) {
      this.btnRotateCCW.addEventListener("click", () => {
        if (!this.cropper) return;
        this.rotation = (this.rotation - 90) % 360;
        this.cropper.rotate(-90);
        this.updateRotationBadge();
      });
    }

    if (this.btnRotateCW) {
      this.btnRotateCW.addEventListener("click", () => {
        if (!this.cropper) return;
        this.rotation = (this.rotation + 90) % 360;
        this.cropper.rotate(90);
        this.updateRotationBadge();
      });
    }

    if (this.btnFlipH) {
      this.btnFlipH.addEventListener("click", () => {
        if (!this.cropper) return;
        this.scaleX = this.scaleX === 1 ? -1 : 1;
        this.cropper.scaleX(this.scaleX);
      });
    }

    if (this.btnFlipV) {
      this.btnFlipV.addEventListener("click", () => {
        if (!this.cropper) return;
        this.scaleY = this.scaleY === 1 ? -1 : 1;
        this.cropper.scaleY(this.scaleY);
      });
    }

    if (this.btnResetStage) {
      this.btnResetStage.addEventListener("click", () => {
        if (!this.cropper) return;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.cropper.reset();
        this.updateRotationBadge();
        this.clearActiveChips();
        const freeChip = document.querySelector('.aspect-preset-btn[data-aspect="free"]');
        if (freeChip) {
          freeChip.classList.add("active", "btn--primary");
          freeChip.classList.remove("btn--outline");
        }
        this.cropper.setAspectRatio(NaN);
      });
    }

    if (this.exportQuality && this.qualityValBadge) {
      this.exportQuality.addEventListener("input", (e) => {
        this.qualityValBadge.textContent = `${e.target.value}%`;
      });
    }

    if (this.btnExecuteCrop) {
      this.btnExecuteCrop.addEventListener("click", () => this.executeExport());
    }

    if (this.btnDownloadCropped) {
      this.btnDownloadCropped.addEventListener("click", (e) => {
        e.preventDefault();
        this.downloadExport();
      });
    }

    if (this.circleMaskCheckbox) {
      this.circleMaskCheckbox.addEventListener("change", () => this.updatePreview());
    }
  }

  // ----------------------------------------------------
  // WORKFLOW: FILE PROCESSING
  // ----------------------------------------------------
  async processFile(file) {
    if (!file) return;

    try {
      this.showToast("Reading image file...", "info");

      // 1. Validate
      await ImageValidator.validateFile(file, {
        allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/x-bmp", "image/avif"],
        allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"],
      });

      this.currentFile = file;

      // 2. Metadata
      this.currentMetadata = await ImageMetadataExtractor.extractMetadata(file);

      // 3. Render Object URL
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(file);

      // 4. Update Header DOM
      if (this.filenameEl) this.filenameEl.textContent = this.currentMetadata.name;
      if (this.filedimsEl) this.filedimsEl.textContent = this.currentMetadata.dimensionsFormatted;
      if (this.filesizeEl) this.filesizeEl.textContent = this.currentMetadata.fileSizeFormatted;

      // 5. Toggle Views
      if (this.uploadSection) this.uploadSection.style.display = "none";
      if (this.configSection) this.configSection.style.display = "block";
      if (this.resultSection) this.resultSection.style.display = "none";
      if (this.progressSection) this.progressSection.style.display = "none";

      // 6. Output Controls
      if (this.exportFormat) {
        const isJpgOrWebp = this.currentMetadata.mimeType === "image/jpeg" || this.currentMetadata.mimeType === "image/webp";
        if (this.qualityWrapper) {
          this.qualityWrapper.style.display = isJpgOrWebp ? "block" : "none";
        }
      }

      // 7. Initialize Cropper Engine
      this.startCropEngine();

    } catch (err) {
      const msg = err.userMessage || err.message || "Failed to load image.";
      this.showToast(msg, "error");
      this.resetWorkspace();
    }
  }

  startCropEngine() {
    if (!this.imageElement) {
      this.showToast("Editor rendering error: Missing image container.", "error");
      return;
    }

    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }

    // Reset scales
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.updateRotationBadge();
    this.clearActiveChips();

    // Default to free crop
    const freeChip = document.querySelector('.aspect-preset-btn[data-aspect="free"]');
    if (freeChip) {
      freeChip.classList.add("active", "btn--primary");
      freeChip.classList.remove("btn--outline");
    }

    // Load image before initializing
    this.imageElement.onload = () => {
      try {
        this.cropper = new Cropper(this.imageElement, {
          viewMode: 1, 
          dragMode: 'crop',
          aspectRatio: NaN,
          autoCropArea: 1,
          restore: false,
          guides: true,
          center: true,
          highlight: true,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          zoomOnTouch: true,
          zoomOnWheel: true,
          ready: () => {
            const canvasData = this.cropper.getCanvasData();
            const minZoom = canvasData.width / canvasData.naturalWidth;
            if (this.zoomSlider) {
              this.zoomSlider.min = Math.floor(minZoom * 100);
              this.zoomSlider.max = 300;
              this.zoomSlider.value = Math.floor(minZoom * 100);
            }
            this.updatePreview();
          },
          zoom: (e) => {
            if (e.detail.ratio && this.zoomSlider) {
               this.zoomSlider.value = Math.floor(e.detail.ratio * 100);
            }
            if (this.zoomValue) {
              this.zoomValue.textContent = `${Math.floor(e.detail.ratio * 100)}%`;
            }
          },
          crop: () => {
            this.updatePreview();
          }
        });
      } catch (err) {
        console.error("Cropper init failed:", err);
        this.showToast("Failed to initialize cropping engine.", "error");
      }
    };
    
    this.imageElement.onerror = () => {
      this.showToast("Image failed to load in editor.", "error");
    };

    // Trigger load
    this.imageElement.src = this.objectUrl;
  }

  // ----------------------------------------------------
  // PREVIEW
  // ----------------------------------------------------
  updatePreview() {
    if (!this.cropper || !this.livePreviewCanvas) return;
    
    const cropData = this.cropper.getData();
    if (!cropData || cropData.width === 0) return;
    
    const width = Math.round(cropData.width);
    const height = Math.round(cropData.height);
    
    // Labels
    if (this.liveCropDimensions) {
      this.liveCropDimensions.textContent = `${width} × ${height} px`;
    }
    if (this.liveAspectText) {
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const div = gcd(width, height);
      this.liveAspectText.textContent = `${width/div}:${height/div}`;
    }
    
    // Canvas preview (throttled)
    if (this.previewTimeout) clearTimeout(this.previewTimeout);
    this.previewTimeout = setTimeout(() => {
      try {
        const canvas = this.cropper.getCroppedCanvas({
          width: 150,
          height: 150,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'low'
        });
        
        if (canvas) {
          const ctx = this.livePreviewCanvas.getContext('2d');
          this.livePreviewCanvas.width = canvas.width;
          this.livePreviewCanvas.height = canvas.height;
          
          if (this.circleMaskCheckbox && this.circleMaskCheckbox.checked) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
          } else {
            ctx.drawImage(canvas, 0, 0);
          }
        }
      } catch(e) {
        // Suppress fast-crop errors
      }
    }, 50);
  }

  // ----------------------------------------------------
  // EXPORT
  // ----------------------------------------------------
  async executeExport() {
    if (!this.cropper || !this.currentFile) return;

    try {
      if (this.configSection) this.configSection.style.display = "none";
      if (this.progressSection) this.progressSection.style.display = "block";
      
      GlobalImageProgressManager.update(ImageProgressState.PROCESSING, 20, "Generating final crop...");

      let mime = this.exportFormat ? this.exportFormat.value : "original";
      if (mime === "original") {
        mime = this.currentMetadata ? this.currentMetadata.mimeType : "image/jpeg";
      }

      let quality = 0.90;
      if (this.exportQuality) {
        quality = parseFloat(this.exportQuality.value) / 100;
      }

      const ext = ImageUtils.mimeToExtension(mime);
      let baseName = this.currentFile.name.substring(0, this.currentFile.name.lastIndexOf('.')) || "image";
      
      if (this.outputFilenameInput && this.outputFilenameInput.value.trim() !== "") {
        baseName = this.outputFilenameInput.value.trim();
      }
      
      this.outputFilename = ImageUtils.generateFilename(baseName, "cropped", ext);

      GlobalImageProgressManager.update(ImageProgressState.PROCESSING, 60, "Encoding image...");

      const canvas = this.cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!canvas) {
        throw new Error("Failed to generate cropped canvas.");
      }

      // Preserve background for JPEG
      if (mime === "image/jpeg" || mime === "image/jpg") {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.fillStyle = "#FFFFFF";
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, 0);
        this.resultBlob = await ImageExporter.exportCanvasToBlob(tmpCanvas, mime, quality);
      } else {
        this.resultBlob = await ImageExporter.exportCanvasToBlob(canvas, mime, quality);
      }

      if (this.resultDataUrl) URL.revokeObjectURL(this.resultDataUrl);
      this.resultDataUrl = URL.createObjectURL(this.resultBlob);

      GlobalImageProgressManager.update(ImageProgressState.COMPLETED, 100, "Crop Complete!");

      // Show Result
      if (this.resultImage) this.resultImage.src = this.resultDataUrl;
      if (this.resOrigDims) this.resOrigDims.textContent = this.currentMetadata.dimensionsFormatted;
      if (this.resCroppedDims) this.resCroppedDims.textContent = `${canvas.width} × ${canvas.height} px`;
      if (this.resOrigSize) this.resOrigSize.textContent = this.currentMetadata.fileSizeFormatted;
      if (this.resCroppedSize) this.resCroppedSize.textContent = ImageUtils.formatFileSize(this.resultBlob.size);
      
      if (this.btnDownloadCropped) {
        this.btnDownloadCropped.download = this.outputFilename;
      }

      if (this.progressSection) this.progressSection.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "block";
      
      this.showToast("Image cropped successfully!", "success");

    } catch (err) {
      if (this.progressSection) this.progressSection.style.display = "none";
      if (this.configSection) this.configSection.style.display = "block";
      this.showToast(err?.message || "An error occurred during crop.", "error");
    }
  }

  downloadExport() {
    if (!this.resultBlob) return;
    ImageExporter.downloadImage(this.resultBlob, this.outputFilename);
    this.showToast("Download started...", "info");
  }

  // ----------------------------------------------------
  // UTILS
  // ----------------------------------------------------
  resetWorkspace() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
    
    this.currentFile = null;
    this.currentMetadata = null;
    this.resultBlob = null;
    
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    if (this.resultDataUrl) URL.revokeObjectURL(this.resultDataUrl);
    this.objectUrl = null;
    this.resultDataUrl = null;
    
    this.outputFilename = "";
    if (this.fileInput) this.fileInput.value = "";
    if (this.outputFilenameInput) this.outputFilenameInput.value = "";
    if (this.imageElement) this.imageElement.src = "";
    
    if (this.uploadSection) this.uploadSection.style.display = "block";
    if (this.configSection) this.configSection.style.display = "none";
    if (this.progressSection) this.progressSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "none";
    
    GlobalImageProgressManager.reset();
  }

  clearActiveChips() {
    this.aspectChips.forEach(c => {
      c.classList.remove("active", "btn--primary");
      c.classList.add("btn--outline");
    });
    this.socialChips.forEach(c => {
      c.classList.remove("active", "btn--primary");
      c.classList.add("btn--outline");
    });
  }

  updateRotationBadge() {
    if (this.rotationAngleBadge) {
      const displayAngle = this.rotation < 0 ? this.rotation + 360 : this.rotation;
      this.rotationAngleBadge.textContent = `${displayAngle}°`;
    }
  }

  showToast(message, type = "info") {
    if (window.ComprexaFramework && typeof window.ComprexaFramework.showToast === "function") {
      return window.ComprexaFramework.showToast(message, type);
    }
    const container = document.getElementById("toast-container") || document.body;
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6"};
      color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Auto-initialize
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.cropImageApp = new CropImageApp();
    });
  } else {
    window.cropImageApp = new CropImageApp();
  }
}
