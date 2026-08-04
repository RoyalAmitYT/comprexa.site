/**
 * Comprexa Resize Image Engine & UI Controller
 * Rebuilt from scratch following Universal Tool standards.
 * 100% Client-Side Processing with HTML5 Canvas & JSZip.
 */

/**
 * Toast Notification Helper
 */
function showResizeToast(message, type = "info", title = "") {
  if (
    window.ComprexaToast &&
    typeof window.ComprexaToast[type] === "function"
  ) {
    window.ComprexaToast[type](message, title);
  } else {
  }
}

/**
 * 1. Validation Layer
 */
class ResizeImageValidator {
  static ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  static ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

  static validateFile(file) {
    if (!file) {
      return { valid: false, error: "No file provided." };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: `"${file.name}" is an empty file (0 bytes).`,
      };
    }

    const name = (file.name || "").toLowerCase();
    const hasAllowedExt = this.ALLOWED_EXTENSIONS.some((ext) =>
      name.endsWith(ext),
    );
    const isAllowedMime =
      this.ALLOWED_MIME_TYPES.includes(file.type) || file.type === "";

    if (!hasAllowedExt && !isAllowedMime) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported image format. Please upload JPG, PNG, or WebP.`,
      };
    }

    return { valid: true };
  }

  static validateDimensions(w, h) {
    const width = parseInt(w, 10);
    const height = parseInt(h, 10);

    if (isNaN(width) || width <= 0) {
      return {
        valid: false,
        error: "Target width must be a positive number greater than 0.",
      };
    }

    if (isNaN(height) || height <= 0) {
      return {
        valid: false,
        error: "Target height must be a positive number greater than 0.",
      };
    }

    if (width > 10000 || height > 10000) {
      return {
        valid: false,
        error: "Target dimensions exceed maximum limit of 10,000 pixels.",
      };
    }

    return { valid: true, width, height };
  }
}

/**
 * 2. Utilities Layer
 */
class ResizeImageUtils {
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static getOutputMimeType(file, requestedFormat = "original") {
    if (requestedFormat === "png") return "image/png";
    if (requestedFormat === "jpg" || requestedFormat === "jpeg")
      return "image/jpeg";
    if (requestedFormat === "webp") return "image/webp";

    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".png") || file.type === "image/png") return "image/png";
    if (name.endsWith(".webp") || file.type === "image/webp")
      return "image/webp";
    return "image/jpeg";
  }

  static getExtensionForMime(mime) {
    if (mime === "image/png") return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
  }
}

/**
 * 3. Processing Layer
 */
class ResizeImageEngine {
  /**
   * Load image and read natural dimensions
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        resolve({
          element: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          objectUrl: url,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(
          new Error(
            `Failed to read "${file.name}". The image file may be corrupted.`,
          ),
        );
      };

      img.src = url;
    });
  }

  /**
   * Resize image to target width & height using HTML5 Canvas
   */
  async resizeImage(file, imageMeta, targetWidth, targetHeight, options = {}) {
    const formatSetting = options.format || "original";
    const mimeType = ResizeImageUtils.getOutputMimeType(file, formatSetting);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // White canvas background for JPEGs
    if (mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(imageMeta.element, 0, 0, targetWidth, targetHeight);

    const quality =
      mimeType === "image/jpeg" || mimeType === "image/webp" ? 0.92 : undefined;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          let finalBlob = blob;
          if (!finalBlob || finalBlob.size === 0) {
            finalBlob = file;
          }

          const resizedUrl = URL.createObjectURL(finalBlob);
          const ext = ResizeImageUtils.getExtensionForMime(mimeType);
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const outputFilename = `${baseName}-resized.${ext}`;

          resolve({
            id: file.id || Math.random().toString(36).substring(2),
            originalFile: file,
            originalWidth: imageMeta.width,
            originalHeight: imageMeta.height,
            originalSizeFormatted: ResizeImageUtils.formatBytes(file.size),
            resizedWidth: targetWidth,
            resizedHeight: targetHeight,
            resizedBlob: finalBlob,
            resizedSize: finalBlob.size,
            resizedSizeFormatted: ResizeImageUtils.formatBytes(finalBlob.size),
            resizedUrl,
            outputFilename,
            format: ext.toUpperCase(),
          });
        },
        mimeType,
        quality,
      );
    });
  }

  /**
   * Create ZIP package of all resized outputs
   */
  async createZipPackage(results, baseFilename = "resized-images") {
    if (!window.JSZip) {
      throw new Error(
        "ZIP packaging library (JSZip) is missing. Please refresh the page.",
      );
    }

    const zip = new window.JSZip();
    const folder = zip.folder(baseFilename);

    results.forEach((res) => {
      folder.file(res.outputFilename, res.resizedBlob);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    return {
      blob: zipBlob,
      url: zipUrl,
      filename: `${baseFilename}.zip`,
    };
  }
}

/**
 * 4. UI Layer
 */
class ResizeImageUI {
  constructor() {
    this.engine = new ResizeImageEngine();
    this.uploadedFiles = []; // Array of { id, file, meta }
    this.results = [];
    this.createdUrls = [];

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & Inputs
    this.dropzoneEl = document.getElementById("resize-dropzone");
    this.fileInputEl = document.getElementById("resize-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("resize-upload-section");
    this.configSectionEl = document.getElementById("resize-config-section");
    this.processingStateEl = document.getElementById("resize-processing-state");
    this.resultSectionEl = document.getElementById("resize-result-section");

    // Headers & Lists
    this.countBadgeEl = document.getElementById("resize-files-count-badge");
    this.filesContainerEl = document.getElementById("resize-files-container");
    this.btnAddMoreTrigger = document.getElementById("btn-add-more-trigger");
    this.btnClearAll = document.getElementById("btn-clear-all");

    // Dimension Inputs & Controls
    this.inputWidth = document.getElementById("input-width");
    this.inputHeight = document.getElementById("input-height");
    this.keepAspectToggle = document.getElementById("keep-aspect-toggle");
    this.outputFormatSelect = document.getElementById("output-format-select");

    // Percentage & Preset Buttons
    this.pctBtns = document.querySelectorAll(".btn--pct");
    this.presetSizeBtns = document.querySelectorAll(".btn--preset-size");

    // Actions
    this.btnExecuteResize = document.getElementById("btn-execute-resize");
    this.btnDownloadAllZip = document.getElementById("btn-download-all-zip");
    this.btnStartOver = document.getElementById("btn-start-over");

    // Status / Results
    this.statusTitleEl = document.getElementById("resize-status-title");
    this.statusDescEl = document.getElementById("resize-status-desc");
    this.progressFillEl = document.getElementById("resize-progress-fill");
    this.summaryTextEl = document.getElementById("resize-summary-text");
    this.resultsContainerEl = document.getElementById(
      "resize-results-container",
    );
  }

  init() {
    if (!this.dropzoneEl || !this.fileInputEl) {
      return;
    }

    this.bindEvents();
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

    // Dropzone click
    this.dropzoneEl.addEventListener("click", (e) => {
      if (e.target === this.fileInputEl) return;
      this.fileInputEl.click();
    });

    // File Input Selection
    this.fileInputEl.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.handleFilesAdded(files);
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
      const files = Array.from(dt.files || []);
      if (files.length > 0) {
        this.handleFilesAdded(files);
      }
    });

    // Add More
    if (this.btnAddMoreTrigger) {
      this.btnAddMoreTrigger.addEventListener("click", () => {
        this.fileInputEl.click();
      });
    }

    // Clear All
    if (this.btnClearAll) {
      this.btnClearAll.addEventListener("click", () => {
        this.clearAllFiles();
      });
    }

    // Width Input change (Calculate height if Keep Aspect is checked)
    if (this.inputWidth) {
      this.inputWidth.addEventListener("input", () => {
        this.handleDimensionInputChange("width");
      });
    }

    // Height Input change (Calculate width if Keep Aspect is checked)
    if (this.inputHeight) {
      this.inputHeight.addEventListener("input", () => {
        this.handleDimensionInputChange("height");
      });
    }

    // Percentage Scaling Buttons
    this.pctBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pct = parseInt(e.currentTarget.getAttribute("data-pct"), 10);
        this.applyPercentageScale(pct);
        this.highlightActiveButton(e.currentTarget, this.pctBtns);
      });
    });

    // Preset Dimension Buttons
    this.presetSizeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const dataW = e.currentTarget.getAttribute("data-w");
        const dataH = e.currentTarget.getAttribute("data-h");

        let w, h;
        if (dataW === "original" || dataH === "original") {
          if (this.uploadedFiles.length > 0) {
            const firstMeta = this.uploadedFiles[0].meta;
            w = firstMeta.width;
            h = firstMeta.height;
          } else {
            return;
          }
        } else {
          w = parseInt(dataW, 10);
          h = parseInt(dataH, 10);
        }

        this.applyPresetDimensions(w, h);

        if (dataW === "original") {
          if (this.keepAspectToggle) this.keepAspectToggle.checked = true;
        }

        this.highlightActiveButton(e.currentTarget, this.presetSizeBtns);
      });
    });

    // Execute Resize
    if (this.btnExecuteResize) {
      this.btnExecuteResize.addEventListener("click", () => {
        this.executeResize();
      });
    }

    // Download All ZIP
    if (this.btnDownloadAllZip) {
      this.btnDownloadAllZip.addEventListener("click", () => {
        this.downloadAllZip();
      });
    }

    // Start Over
    if (this.btnStartOver) {
      this.btnStartOver.addEventListener("click", () => {
        this.resetView();
      });
    }
  }

  highlightActiveButton(activeBtn, groupList) {
    groupList.forEach((btn) => {
      btn.classList.remove("btn--primary");
      btn.classList.add("btn--outline");
    });
    if (activeBtn) {
      activeBtn.classList.remove("btn--outline");
      activeBtn.classList.add("btn--primary");
    }
  }

  handleDimensionInputChange(source) {
    if (!this.keepAspectToggle || !this.keepAspectToggle.checked) return;
    if (this.uploadedFiles.length === 0) return;

    const referenceMeta = this.uploadedFiles[0].meta;
    const ratio = referenceMeta.width / referenceMeta.height;

    if (source === "width" && this.inputWidth.value) {
      const w = parseFloat(this.inputWidth.value);
      if (!isNaN(w) && w > 0) {
        this.inputHeight.value = Math.round(w / ratio);
      }
    } else if (source === "height" && this.inputHeight.value) {
      const h = parseFloat(this.inputHeight.value);
      if (!isNaN(h) && h > 0) {
        this.inputWidth.value = Math.round(h * ratio);
      }
    }
  }

  applyPercentageScale(pct) {
    if (this.uploadedFiles.length === 0) return;

    const baseMeta = this.uploadedFiles[0].meta;
    const factor = pct / 100;

    const newW = Math.round(baseMeta.width * factor);
    const newH = Math.round(baseMeta.height * factor);

    if (this.inputWidth) this.inputWidth.value = newW;
    if (this.inputHeight) this.inputHeight.value = newH;
  }

  applyPresetDimensions(w, h) {
    if (this.inputWidth) this.inputWidth.value = w;
    if (this.inputHeight) this.inputHeight.value = h;
    if (this.keepAspectToggle) this.keepAspectToggle.checked = false; // Turn aspect check off for exact preset fit
  }

  async handleFilesAdded(files) {
    let validCount = 0;
    let errors = [];

    showResizeToast("Reading image files...", "info", "Loading");

    for (const file of files) {
      const validation = ResizeImageValidator.validateFile(file);
      if (!validation.valid) {
        errors.push(validation.error);
        continue;
      }

      try {
        const meta = await this.engine.loadImage(file);
        const item = {
          id: "img_" + Math.random().toString(36).substring(2, 9),
          file,
          meta,
        };
        this.createdUrls.push(meta.objectUrl);
        this.uploadedFiles.push(item);
        validCount++;
      } catch (err) {
        errors.push(err.message || `Failed to read "${file.name}".`);
      }
    }

    if (errors.length > 0) {
      showResizeToast(errors[0], "warning", "Upload Notice");
    }

    if (validCount > 0) {
      showResizeToast(
        `Added ${validCount} ${validCount === 1 ? "image" : "images"}.`,
        "success",
        "Loaded",
      );

      // Auto fill initial dimensions from first uploaded file if fields are empty
      if (this.uploadedFiles.length > 0 && !this.inputWidth.value) {
        const firstMeta = this.uploadedFiles[0].meta;
        this.inputWidth.value = firstMeta.width;
        this.inputHeight.value = firstMeta.height;
      }

      this.renderUploadedCards();
      this.uploadSectionEl.style.display = "none";
      this.configSectionEl.style.display = "block";
    }
  }

  renderUploadedCards() {
    if (!this.countBadgeEl || !this.filesContainerEl) return;

    const count = this.uploadedFiles.length;
    this.countBadgeEl.textContent = `${count} ${count === 1 ? "image" : "images"}`;

    if (count === 0) {
      this.configSectionEl.style.display = "none";
      this.uploadSectionEl.style.display = "block";
      return;
    }

    this.filesContainerEl.innerHTML = this.uploadedFiles
      .map(
        (item) => `
      <div class="card" id="card-${item.id}" style="padding: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Thumbnail -->
        <div style="width: 100%; height: 140px; background: var(--bg-surface-hover); border-radius: var(--radius-md); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border: 1px solid var(--border-subtle);">
          <img src="${item.meta.objectUrl}" alt="${item.file.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>

        <!-- Meta -->
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;" title="${item.file.name}">
            ${item.file.name}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">
            ${ResizeImageUtils.formatBytes(item.file.size)} • ${item.meta.width} × ${item.meta.height} px
          </div>

          <button type="button" class="btn btn--outline btn--sm btn--full btn-remove-item" data-id="${item.id}" style="color: var(--color-danger, #ef4444); border-color: rgba(239, 68, 68, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Remove</span>
          </button>
        </div>

      </div>
    `,
      )
      .join("");

    // Bind remove button handlers
    this.filesContainerEl
      .querySelectorAll(".btn-remove-item")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          this.removeFileById(id);
        });
      });
  }

  removeFileById(id) {
    const idx = this.uploadedFiles.findIndex((f) => f.id === id);
    if (idx !== -1) {
      this.uploadedFiles.splice(idx, 1);
      this.renderUploadedCards();
    }
  }

  clearAllFiles() {
    this.uploadedFiles = [];
    this.renderUploadedCards();
  }

  async executeResize() {
    if (this.uploadedFiles.length === 0) {
      showResizeToast(
        "Please upload at least 1 image.",
        "warning",
        "No Images",
      );
      return;
    }

    const valResult = ResizeImageValidator.validateDimensions(
      this.inputWidth ? this.inputWidth.value : 0,
      this.inputHeight ? this.inputHeight.value : 0,
    );

    if (!valResult.valid) {
      showResizeToast(valResult.error, "warning", "Invalid Dimensions");
      return;
    }

    const targetW = valResult.width;
    const targetH = valResult.height;
    const formatSetting = this.outputFormatSelect
      ? this.outputFormatSelect.value
      : "original";
    const keepAspect = this.keepAspectToggle
      ? this.keepAspectToggle.checked
      : true;

    this.configSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Resizing Images...";
    this.progressFillEl.style.width = "5%";

    this.results = [];

    try {
      const total = this.uploadedFiles.length;

      for (let i = 0; i < total; i++) {
        const item = this.uploadedFiles[i];
        const percent = Math.round(((i + 0.5) / total) * 100);

        this.statusDescEl.textContent = `Resizing "${item.file.name}" (${i + 1} of ${total})...`;
        this.progressFillEl.style.width = `${percent}%`;

        let finalW = targetW;
        let finalH = targetH;

        // If Keep Aspect Ratio is enabled, adjust height per individual image's original ratio
        if (keepAspect) {
          const imgRatio = item.meta.width / item.meta.height;
          finalH = Math.round(targetW / imgRatio);
        }

        const res = await this.engine.resizeImage(
          item.file,
          item.meta,
          finalW,
          finalH,
          {
            format: formatSetting,
          },
        );

        this.createdUrls.push(res.resizedUrl);
        this.results.push(res);
      }

      this.progressFillEl.style.width = "100%";

      if (this.summaryTextEl) {
        this.summaryTextEl.textContent = `Successfully resized ${this.results.length} ${
          this.results.length === 1 ? "image" : "images"
        }.`;
      }

      this.renderResultCards();

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showResizeToast(
        "Images resized successfully!",
        "success",
        "Resize Complete",
      );
    } catch (err) {
      console.error("Resize Error:", err);
      this.processingStateEl.style.display = "none";
      this.configSectionEl.style.display = "block";
      showResizeToast(
        err.message || "Failed to resize images.",
        "error",
        "Error",
      );
    }
  }

  renderResultCards() {
    if (!this.resultsContainerEl) return;

    this.resultsContainerEl.innerHTML = this.results
      .map(
        (res) => `
      <div class="card" style="padding: 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Thumbnail -->
        <div style="width: 100%; height: 160px; background: var(--bg-surface-hover); border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 1px solid var(--border-subtle);">
          <img src="${res.resizedUrl}" alt="${res.outputFilename}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>

        <!-- Info & Dimensions -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span class="badge badge--primary badge--pill" style="font-weight: 700; font-size: 0.75rem;">${res.format}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${res.resizedSizeFormatted}</span>
          </div>

          <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;" title="${res.outputFilename}">
            ${res.outputFilename}
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px; background: var(--bg-surface-hover); padding: 8px; border-radius: var(--radius-md); text-align: center;">
            <span style="opacity: 0.7; text-decoration: line-through; margin-right: 4px;">${res.originalWidth}×${res.originalHeight}</span>
            <strong style="color: var(--primary); font-size: 0.88rem;">→ ${res.resizedWidth}×${res.resizedHeight} px</strong>
          </div>

          <a href="${res.resizedUrl}" download="${res.outputFilename}" class="btn btn--primary btn--full btn--sm" style="height: 38px; font-weight: 700;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download Resized Image</span>
          </a>
        </div>

      </div>
    `,
      )
      .join("");
  }

  async downloadAllZip() {
    if (!this.results || this.results.length === 0) return;

    try {
      showResizeToast("Generating ZIP package...", "info", "Creating ZIP");
      const zipPackage = await this.engine.createZipPackage(
        this.results,
        "resized-images",
      );
      this.createdUrls.push(zipPackage.url);

      const link = document.createElement("a");
      link.href = zipPackage.url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(zipPackage.filename) : String(zipPackage.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showResizeToast("ZIP download initiated!", "success", "Downloaded ZIP");
    } catch (err) {
      console.error("ZIP Error:", err);
      showResizeToast(
        err.message || "Failed to create ZIP package.",
        "error",
        "Error",
      );
    }
  }

  cleanupUrls() {
    this.createdUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    this.createdUrls = [];
  }

  resetView() {
    this.cleanupUrls();
    this.uploadedFiles = [];
    this.results = [];

    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "none";
    this.configSectionEl.style.display = "none";
    this.uploadSectionEl.style.display = "block";

    if (this.inputWidth) this.inputWidth.value = "";
    if (this.inputHeight) this.inputHeight.value = "";
  }
}

// Auto Init
document.addEventListener("DOMContentLoaded", () => {
  const app = new ResizeImageUI();
  app.init();
  window.ComprexaResizeImageApp = app;
});
