// @ts-nocheck
/**
 * Comprexa - Universal Rotate & Flip Image Controller
 * Completely rebuilt client-side image orientation controller with full precision rotation, flip, live preview, and high-quality canvas export.
 */

import {
  ImageValidator,
  ImageMetadataExtractor,
  ImageExporter,
  GlobalImageProgressManager,
  ImageUtils,
  ImageEngineError,
} from "../image-engine.js";

export class RotateImageController {
  constructor() {
    // Current File & Image State
    this.currentFile = null;
    this.currentMetadata = null;
    this.loadedImage = null; // Source HTMLImageElement
    this.objectUrl = null;

    // Transformation State
    this.rotationAngle = 0; // Degrees (0 to 360)
    this.flipHorizontal = false;
    this.flipVertical = false;
    this.targetMime = "original";
    this.quality = 0.92;

    // Output State
    this.resultBlob = null;
    this.resultDataUrl = null;
    this.outputFilename = "";

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    // Dropzone & File Input
    this.dropZone = document.getElementById("drop-zone");
    this.fileInput = document.getElementById("file-input");
    this.browseBtn = document.getElementById("browse-btn");

    // Section Visibility Cards
    this.uploadCard = document.getElementById("upload-card");
    this.settingsCard = document.getElementById("settings-card");
    this.progressCard = document.getElementById("progress-card");
    this.resultCard = document.getElementById("result-card");

    // Stage & Preview
    this.rotatorPreviewImg = document.getElementById("rotator-preview-img");

    // Meta Tags
    this.fileNameEl = document.getElementById("file-name");
    this.fileDimensionsEl = document.getElementById("file-dimensions");
    this.fileSizeEl = document.getElementById("file-size");
    this.fileTypeBadge = document.getElementById("file-type-badge");
    this.changeFileBtn = document.getElementById("change-file-btn");
    this.resetOrientationBtn = document.getElementById("reset-orientation-btn");
    this.resetControlsBtn = document.getElementById("reset-controls-btn");

    // Rotation & Flip Buttons
    this.rotateLeftBtn =
      document.getElementById("rotate-left-btn") ||
      document.getElementById("rotate-ccw-btn");
    this.rotateRightBtn =
      document.getElementById("rotate-right-btn") ||
      document.getElementById("rotate-cw-btn");
    this.rotate180Btn = document.getElementById("rotate-180-btn");
    this.rotate270Btn = document.getElementById("rotate-270-btn");

    this.angleSlider = document.getElementById("angle-slider");
    this.angleValText = document.getElementById("angle-val-text");

    this.flipHBtn = document.getElementById("flip-h-btn");
    this.flipVBtn = document.getElementById("flip-v-btn");

    this.formatSelect = document.getElementById("format-select");

    // Live Metrics Panel
    this.origDimensionsEl = document.getElementById("orig-dimensions");
    this.newDimensionsEl = document.getElementById("new-dimensions");
    this.currentAngleTextEl = document.getElementById("current-angle-text");
    this.currentFlipTextEl = document.getElementById("current-flip-text");

    // Actions & Progress
    this.processBtn = document.getElementById("process-btn");
    this.downloadBtn = document.getElementById("download-btn");
    this.resetBtn = document.getElementById("reset-btn");

    this.progressBar = document.getElementById("progress-bar");
    this.progressText = document.getElementById("progress-text");
    this.progressPercent = document.getElementById("progress-percent");

    // Result Card Elements
    this.resultPreviewImg = document.getElementById("result-preview-img");
    this.resOrigResEl = document.getElementById("res-orig-res");
    this.resNewResEl = document.getElementById("res-new-res");
    this.resAngleEl = document.getElementById("res-angle");
    this.resNewSizeEl = document.getElementById("res-new-size");

    // Sidebar Elements
    this.workspaceFileCount = document.getElementById("workspace-file-count");
    this.workspaceFilesContainer = document.getElementById(
      "workspace-files-container",
    );
    this.workspaceActionBtn = document.getElementById("workspace-action-btn");
    this.workspaceCtaSub = document.getElementById("workspace-cta-sub");
  }

  bindEvents() {
    if (!this.dropZone || !this.fileInput) return;

    // Dropzone Click & Keyboard Trigger
    this.dropZone.addEventListener("click", (e) => {
      if (e.target.closest("#browse-btn")) return; // Avoid double click if browse button clicked
      this.fileInput.click();
    });

    this.dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    // Drag & Drop Handling
    ["dragenter", "dragover"].forEach((name) => {
      this.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add("drop-zone--active");
        this.dropZone.classList.add("file-uploader__dropzone--active");
      });
    });

    ["dragleave", "drop"].forEach((name) => {
      this.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove("drop-zone--active");
        this.dropZone.classList.remove("file-uploader__dropzone--active");
      });
    });

    this.dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });

    if (this.browseBtn) {
      this.browseBtn.addEventListener("click", () => this.fileInput.click());
    }

    this.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    if (this.changeFileBtn) {
      this.changeFileBtn.addEventListener("click", () => this.reset());
    }

    if (this.resetOrientationBtn) {
      this.resetOrientationBtn.addEventListener("click", () =>
        this.resetTransformations(),
      );
    }

    if (this.resetControlsBtn) {
      this.resetControlsBtn.addEventListener("click", () =>
        this.resetTransformations(),
      );
    }

    // Rotation Control Buttons
    if (this.rotateLeftBtn) {
      this.rotateLeftBtn.addEventListener("click", () => this.addRotation(-90));
    }
    if (this.rotateRightBtn) {
      this.rotateRightBtn.addEventListener("click", () => this.addRotation(90));
    }
    if (this.rotate180Btn) {
      this.rotate180Btn.addEventListener("click", () => this.addRotation(180));
    }
    if (this.rotate270Btn) {
      this.rotate270Btn.addEventListener("click", () => this.setRotation(270));
    }

    // Angle Slider
    if (this.angleSlider) {
      this.angleSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.setRotation(val, false);
      });
    }

    // Flip Controls
    if (this.flipHBtn) {
      this.flipHBtn.addEventListener("click", () => {
        this.flipHorizontal = !this.flipHorizontal;
        this.updateFlipButtonsUI();
        this.updateLivePreview();
      });
    }

    if (this.flipVBtn) {
      this.flipVBtn.addEventListener("click", () => {
        this.flipVertical = !this.flipVertical;
        this.updateFlipButtonsUI();
        this.updateLivePreview();
      });
    }

    // Output Format Selection
    if (this.formatSelect) {
      this.formatSelect.addEventListener("change", (e) => {
        this.targetMime = e.target.value;
      });
    }

    // Primary Action Buttons
    if (this.processBtn) {
      this.processBtn.addEventListener("click", () =>
        this.processOrientation(),
      );
    }
    if (this.workspaceActionBtn) {
      this.workspaceActionBtn.addEventListener("click", () =>
        this.processOrientation(),
      );
    }
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => this.downloadResult());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.reset());
    }

    // Progress Notification Subscription
    GlobalImageProgressManager.subscribe(({ percentage, message }) => {
      if (this.progressBar) this.progressBar.style.width = `${percentage}%`;
      if (this.progressPercent)
        this.progressPercent.textContent = `${percentage}%`;
      if (this.progressText) this.progressText.textContent = message;
    });
  }

  async handleFileSelect(file) {
    try {
      this.showToast("Loading image file...", "info");

      // 1. Validate File Format (JPG, JPEG, PNG, WebP, GIF, BMP)
      await ImageValidator.validateFile(file, {
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/bmp",
          "image/x-bmp",
        ],
        allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp"],
      });

      this.currentFile = file;

      // 2. Extract Metadata
      this.currentMetadata = await ImageMetadataExtractor.extractMetadata(file);

      // 3. Load Source Image
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(file);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () =>
          reject(new Error("Failed to render source image preview."));
        img.src = this.objectUrl;
      });
      this.loadedImage = img;

      if (this.rotatorPreviewImg) {
        this.rotatorPreviewImg.src = this.objectUrl;
      }

      // Update Header Metadata Labels
      if (this.fileNameEl)
        this.fileNameEl.textContent = this.currentMetadata.name;
      if (this.fileDimensionsEl)
        this.fileDimensionsEl.textContent =
          this.currentMetadata.dimensionsFormatted;
      if (this.fileSizeEl)
        this.fileSizeEl.textContent = this.currentMetadata.fileSizeFormatted;
      if (this.fileTypeBadge)
        this.fileTypeBadge.textContent =
          this.currentMetadata.extension.toUpperCase();

      // Update Sidebar Files Panel
      this.updateSidebarFiles();

      // Switch Visible Card to Settings Editor
      if (this.uploadCard) this.uploadCard.style.display = "none";
      if (this.settingsCard) this.settingsCard.style.display = "block";
      if (this.resultCard) this.resultCard.style.display = "none";

      // Reset Transformations to Defaults
      this.resetTransformations();
    } catch (err) {
      const msg =
        err instanceof ImageEngineError
          ? err.userMessage
          : err?.message || "Failed to open image file.";
      this.showToast(msg, "error");
    }
  }

  updateSidebarFiles() {
    if (!this.workspaceFileCount || !this.workspaceFilesContainer) return;

    if (this.currentFile && this.currentMetadata) {
      this.workspaceFileCount.textContent = "1 file";
      this.workspaceFilesContainer.innerHTML = `
        <div class="sidebar-file-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <div style="width: 36px; height: 36px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">
              ${this.currentMetadata.extension.toUpperCase()}
            </div>
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <div style="font-size: 0.85rem; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.currentFile.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${this.currentMetadata.dimensionsFormatted} • ${this.currentMetadata.fileSizeFormatted}</div>
            </div>
          </div>
          <button type="button" class="btn btn--subtle btn--sm btn--icon" id="sidebar-remove-file-btn" title="Remove File">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;

      const removeBtn = document.getElementById("sidebar-remove-file-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => this.reset());
      }

      if (this.workspaceActionBtn) {
        this.workspaceActionBtn.disabled = false;
      }
      if (this.workspaceCtaSub) {
        this.workspaceCtaSub.textContent =
          "Click to apply rotation & download image";
      }
    } else {
      this.workspaceFileCount.textContent = "0 files";
      this.workspaceFilesContainer.innerHTML = `
        <div class="file-list-empty-state">
          <div class="file-list-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="file-list-empty-title">No files added yet</div>
          <div class="file-list-empty-sub">Add image to get started</div>
        </div>
      `;

      if (this.workspaceActionBtn) {
        this.workspaceActionBtn.disabled = true;
      }
      if (this.workspaceCtaSub) {
        this.workspaceCtaSub.textContent =
          "Action button activates when image is selected";
      }
    }
  }

  resetTransformations() {
    this.rotationAngle = 0;
    this.flipHorizontal = false;
    this.flipVertical = false;

    if (this.angleSlider) this.angleSlider.value = "0";
    if (this.angleValText) this.angleValText.textContent = "0°";

    this.updateFlipButtonsUI();
    this.updateLivePreview();
  }

  addRotation(deg) {
    let newAngle = (this.rotationAngle + deg) % 360;
    if (newAngle < 0) newAngle += 360;
    this.setRotation(newAngle);
  }

  setRotation(deg, syncSlider = true) {
    this.rotationAngle = deg % 360;
    if (this.rotationAngle < 0) this.rotationAngle += 360;

    if (syncSlider && this.angleSlider) {
      this.angleSlider.value = String(this.rotationAngle);
    }
    if (this.angleValText) {
      this.angleValText.textContent = `${this.rotationAngle}°`;
    }

    this.updateLivePreview();
  }

  updateFlipButtonsUI() {
    if (this.flipHBtn) {
      if (this.flipHorizontal) {
        this.flipHBtn.classList.add("btn--primary");
        this.flipHBtn.classList.remove("btn--subtle");
      } else {
        this.flipHBtn.classList.remove("btn--primary");
        this.flipHBtn.classList.add("btn--subtle");
      }
    }

    if (this.flipVBtn) {
      if (this.flipVertical) {
        this.flipVBtn.classList.add("btn--primary");
        this.flipVBtn.classList.remove("btn--subtle");
      } else {
        this.flipVBtn.classList.remove("btn--primary");
        this.flipVBtn.classList.add("btn--subtle");
      }
    }
  }

  updateLivePreview() {
    if (!this.rotatorPreviewImg || !this.loadedImage) return;

    // Apply CSS Transform for real-time visual feedback
    const scaleX = this.flipHorizontal ? -1 : 1;
    const scaleY = this.flipVertical ? -1 : 1;

    this.rotatorPreviewImg.style.transform = `rotate(${this.rotationAngle}deg) scale(${scaleX}, ${scaleY})`;

    // Calculate Oriented Dimensions based on exact trigonometry
    const rad = (this.rotationAngle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    const origW = this.loadedImage.naturalWidth;
    const origH = this.loadedImage.naturalHeight;

    const orientedW = Math.round(origW * cos + origH * sin);
    const orientedH = Math.round(origW * sin + origH * cos);

    if (this.origDimensionsEl)
      this.origDimensionsEl.textContent = `${origW} × ${origH} px`;
    if (this.newDimensionsEl)
      this.newDimensionsEl.textContent = `${orientedW} × ${orientedH} px`;
    if (this.currentAngleTextEl)
      this.currentAngleTextEl.textContent = `${this.rotationAngle}°`;

    let flipDesc = "None";
    if (this.flipHorizontal && this.flipVertical)
      flipDesc = "Horizontal & Vertical";
    else if (this.flipHorizontal) flipDesc = "Horizontal";
    else if (this.flipVertical) flipDesc = "Vertical";

    if (this.currentFlipTextEl) this.currentFlipTextEl.textContent = flipDesc;
  }

  async processOrientation() {
    if (!this.currentFile || !this.loadedImage) return;

    try {
      if (this.settingsCard) this.settingsCard.style.display = "none";
      if (this.progressCard) this.progressCard.style.display = "block";

      GlobalImageProgressManager.update(15, "Preparing rotation canvas...");

      let mime = this.targetMime;
      if (mime === "original") {
        mime = this.currentMetadata
          ? this.currentMetadata.mimeType
          : "image/jpeg";
      }

      const ext = ImageUtils.mimeToExtension(mime);
      this.outputFilename = ImageUtils.generateFilename(
        this.currentFile.name,
        `oriented_${this.rotationAngle}deg`,
        ext,
      );

      GlobalImageProgressManager.update(
        40,
        "Applying pixel transformations on canvas...",
      );

      // Calculate Oriented Canvas Bounding Box
      const rad = (this.rotationAngle * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      const origW = this.loadedImage.naturalWidth;
      const origH = this.loadedImage.naturalHeight;

      const destW = Math.max(1, Math.round(origW * cos + origH * sin));
      const destH = Math.max(1, Math.round(origW * sin + origH * cos));

      // Create Canvas
      const canvas = document.createElement("canvas");
      canvas.width = destW;
      canvas.height = destH;
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill white background for JPEG exports
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, destW, destH);
      }

      ctx.save();
      // Translate to center
      ctx.translate(destW / 2, destH / 2);
      // Rotate
      ctx.rotate(rad);
      // Flip
      const scaleX = this.flipHorizontal ? -1 : 1;
      const scaleY = this.flipVertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw image centered
      ctx.drawImage(this.loadedImage, -origW / 2, -origH / 2);
      ctx.restore();

      GlobalImageProgressManager.update(
        80,
        "Encoding processed output image...",
      );

      // Export Canvas to Blob
      this.resultBlob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), mime, this.quality);
      });

      if (!this.resultBlob) {
        throw new Error("Failed to encode output blob from canvas.");
      }

      if (this.resultDataUrl) URL.revokeObjectURL(this.resultDataUrl);
      this.resultDataUrl = URL.createObjectURL(this.resultBlob);

      GlobalImageProgressManager.update(100, "Rotation & Flip complete!");

      // Populate Result View Elements
      if (this.resultPreviewImg) this.resultPreviewImg.src = this.resultDataUrl;
      if (this.resOrigResEl)
        this.resOrigResEl.textContent = `${origW} × ${origH} px`;
      if (this.resNewResEl)
        this.resNewResEl.textContent = `${destW} × ${destH} px`;

      let flipLabel = "";
      if (this.flipHorizontal && this.flipVertical) flipLabel = " (H+V Flip)";
      else if (this.flipHorizontal) flipLabel = " (H Flip)";
      else if (this.flipVertical) flipLabel = " (V Flip)";

      if (this.resAngleEl)
        this.resAngleEl.textContent = `${this.rotationAngle}°${flipLabel}`;
      if (this.resNewSizeEl)
        this.resNewSizeEl.textContent = ImageUtils.formatFileSize(
          this.resultBlob.size,
        );

      if (this.progressCard) this.progressCard.style.display = "none";
      if (this.resultCard) this.resultCard.style.display = "block";

      this.showToast("Image orientation updated successfully!", "success");
    } catch (err) {
      if (this.progressCard) this.progressCard.style.display = "none";
      if (this.settingsCard) this.settingsCard.style.display = "block";
      const msg =
        err?.message || "An error occurred while processing image orientation.";
      this.showToast(msg, "error");
    }
  }

  downloadResult() {
    if (!this.resultBlob) return;
    ImageExporter.downloadImage(this.resultBlob, this.outputFilename);
    this.showToast("Download started...", "info");
  }

  reset() {
    this.currentFile = null;
    this.currentMetadata = null;
    this.loadedImage = null;
    this.resultBlob = null;

    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    if (this.resultDataUrl) URL.revokeObjectURL(this.resultDataUrl);
    this.objectUrl = null;
    this.resultDataUrl = null;
    this.outputFilename = "";

    if (this.fileInput) this.fileInput.value = "";

    this.updateSidebarFiles();

    if (this.uploadCard) this.uploadCard.style.display = "block";
    if (this.settingsCard) this.settingsCard.style.display = "none";
    if (this.progressCard) this.progressCard.style.display = "none";
    if (this.resultCard) this.resultCard.style.display = "none";

    GlobalImageProgressManager.reset();
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

// Auto-initialize when DOM is loaded
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.rotateImageController = new RotateImageController();
  });
}
