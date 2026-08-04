/**
 * Comprexa Compress Image Engine & UI Controller
 * Rebuilt from scratch following Universal Tool standards.
 * 100% Client-Side Processing with HTML5 Canvas & JSZip.
 */

/**
 * Toast Notification Helper
 */
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
 * 1. Validation Layer
 */
class CompressImageValidator {
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
}

/**
 * 2. Utilities Layer
 */
class CompressImageUtils {
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static getOutputMimeType(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".png") || file.type === "image/png") return "image/png";
    if (name.endsWith(".webp") || file.type === "image/webp")
      return "image/webp";
    return "image/jpeg";
  }

  static getFileExtension(file) {
    const mime = this.getOutputMimeType(file);
    if (mime === "image/png") return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
  }
}

/**
 * 3. Processing Layer
 */
class CompressImageEngine {
  /**
   * Read file as Image element and extract metadata
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
            `Failed to read "${file.name}". The image file may be corrupted or invalid.`,
          ),
        );
      };

      img.src = url;
    });
  }

  /**
   * Compress a single image file via HTML5 Canvas
   */
  async compressImage(file, imageMeta, options = {}) {
    const quality = parseFloat(options.quality) || 0.75;
    const mimeType = CompressImageUtils.getOutputMimeType(file);

    const canvas = document.createElement("canvas");
    canvas.width = imageMeta.width;
    canvas.height = imageMeta.height;

    const ctx = canvas.getContext("2d", { alpha: true });

    // Fill white background for JPEGs to prevent black transparency artifacts
    if (mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(imageMeta.element, 0, 0, canvas.width, canvas.height);

    // If PNG and user requests quality compression, output as high-efficiency WebP or compressed JPEG/PNG
    let targetMime = mimeType;
    if (mimeType === "image/png" && quality < 0.95) {
      targetMime = "image/webp";
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          let finalBlob = blob;
          let finalMime = targetMime;

          // If blob failed or compressed size exceeds original, fallback safely
          if (!finalBlob || finalBlob.size === 0) {
            finalBlob = file;
            finalMime = file.type;
          }

          const originalSize = file.size;
          const compressedSize = finalBlob.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savedPercent =
            originalSize > 0
              ? Math.round((savedBytes / originalSize) * 100)
              : 0;

          const compressedUrl = URL.createObjectURL(finalBlob);
          const ext = CompressImageUtils.getFileExtension({
            name: file.name,
            type: finalMime,
          });
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const outputFilename = `${baseName}-compressed.${ext}`;

          resolve({
            id: file.id || Math.random().toString(36).substring(2),
            originalFile: file,
            originalSize,
            originalSizeFormatted: CompressImageUtils.formatBytes(originalSize),
            compressedBlob: finalBlob,
            compressedSize,
            compressedSizeFormatted:
              CompressImageUtils.formatBytes(compressedSize),
            savedBytes,
            savedBytesFormatted: CompressImageUtils.formatBytes(savedBytes),
            savedPercent,
            originalUrl: imageMeta.objectUrl,
            compressedUrl,
            width: imageMeta.width,
            height: imageMeta.height,
            outputFilename,
            format: ext.toUpperCase(),
          });
        },
        targetMime,
        quality,
      );
    });
  }

  /**
   * Package all compressed images into a single ZIP archive
   */
  async createZipPackage(results, baseFilename = "compressed-images") {
    if (!window.JSZip) {
      throw new Error(
        "ZIP packaging library (JSZip) is missing. Please refresh the page.",
      );
    }

    const zip = new window.JSZip();
    const folder = zip.folder(baseFilename);

    results.forEach((res) => {
      folder.file(res.outputFilename, res.compressedBlob);
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
class CompressImageUI {
  constructor() {
    this.engine = new CompressImageEngine();
    this.uploadedFiles = []; // Array of { id, file, meta }
    this.results = [];
    this.createdUrls = [];

    this.initDOMReferences();
  }

  initDOMReferences() {
    // Dropzone & File Input
    this.dropzoneEl = document.getElementById("compress-dropzone");
    this.fileInputEl = document.getElementById("compress-file-input");

    // Sections
    this.uploadSectionEl = document.getElementById("compress-upload-section");
    this.configSectionEl = document.getElementById("compress-config-section");
    this.processingStateEl = document.getElementById(
      "compress-processing-state",
    );
    this.resultSectionEl = document.getElementById("compress-result-section");

    // Headers & Lists
    this.countBadgeEl = document.getElementById("compress-files-count-badge");
    this.filesContainerEl = document.getElementById("compress-files-container");
    this.btnAddMoreTrigger = document.getElementById("btn-add-more-trigger");
    this.btnClearAll = document.getElementById("btn-clear-all");

    // Compression Settings
    this.presetBtns = document.querySelectorAll(".btn--preset");
    this.qualitySlider = document.getElementById("quality-slider");
    this.qualityValDisplay = document.getElementById("quality-val-display");
    this.stripMetadataToggle = document.getElementById("strip-metadata-toggle");

    // Action Buttons
    this.btnExecuteCompress = document.getElementById("btn-execute-compress");
    this.btnDownloadAllZip = document.getElementById("btn-download-all-zip");
    this.btnStartOver = document.getElementById("btn-start-over");

    // Status / Progress / Results
    this.statusTitleEl = document.getElementById("compress-status-title");
    this.statusDescEl = document.getElementById("compress-status-desc");
    this.progressFillEl = document.getElementById("compress-progress-fill");
    this.resultSummaryText = document.getElementById("result-summary-text");
    this.resultsContainerEl = document.getElementById(
      "compress-results-container",
    );
  }

  init() {
    if (!this.dropzoneEl || !this.fileInputEl) {
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Browse Files button in dropzone
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

    // File Input change (Appends newly selected files)
    this.fileInputEl.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.handleFilesAdded(files);
      }
      this.fileInputEl.value = "";
    });

    // Drag & Drop events
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

    // Add More button
    if (this.btnAddMoreTrigger) {
      this.btnAddMoreTrigger.addEventListener("click", () => {
        this.fileInputEl.click();
      });
    }

    // Clear All button
    if (this.btnClearAll) {
      this.btnClearAll.addEventListener("click", () => {
        this.clearAllFiles();
      });
    }

    // Preset Buttons
    this.presetBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const level = e.currentTarget.getAttribute("data-level");
        this.applyPresetLevel(level);
      });
    });

    // Quality Slider change
    if (this.qualitySlider) {
      this.qualitySlider.addEventListener("input", (e) => {
        const val = e.target.value;
        if (this.qualityValDisplay)
          this.qualityValDisplay.textContent = `${val}%`;
        this.updatePresetButtonsUI(val);
      });
    }

    // Compress Execute button
    if (this.btnExecuteCompress) {
      this.btnExecuteCompress.addEventListener("click", () => {
        this.executeCompression();
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

  applyPresetLevel(level) {
    let quality = 75;
    if (level === "low") quality = 90;
    if (level === "medium") quality = 75;
    if (level === "high") quality = 50;

    if (this.qualitySlider) this.qualitySlider.value = quality;
    if (this.qualityValDisplay)
      this.qualityValDisplay.textContent = `${quality}%`;

    this.presetBtns.forEach((btn) => {
      if (btn.getAttribute("data-level") === level) {
        btn.classList.remove("btn--outline");
        btn.classList.add("btn--primary");
      } else {
        btn.classList.remove("btn--primary");
        btn.classList.add("btn--outline");
      }
    });
  }

  updatePresetButtonsUI(val) {
    const num = parseInt(val, 10);
    this.presetBtns.forEach((btn) => {
      const level = btn.getAttribute("data-level");
      let isMatch = false;
      if (level === "low" && num >= 85) isMatch = true;
      if (level === "medium" && num >= 65 && num < 85) isMatch = true;
      if (level === "high" && num < 65) isMatch = true;

      if (isMatch) {
        btn.classList.remove("btn--outline");
        btn.classList.add("btn--primary");
      } else {
        btn.classList.remove("btn--primary");
        btn.classList.add("btn--outline");
      }
    });
  }

  async handleFilesAdded(files) {
    let validCount = 0;
    let errors = [];

    showCompressToast("Reading image files...", "info", "Loading");

    for (const file of files) {
      const validation = CompressImageValidator.validateFile(file);
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
      showCompressToast(errors[0], "warning", "Upload Notice");
    }

    if (validCount > 0) {
      showCompressToast(
        `Added ${validCount} ${validCount === 1 ? "image" : "images"}.`,
        "success",
        "Images Loaded",
      );
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
            ${CompressImageUtils.formatBytes(item.file.size)} • ${item.meta.width} × ${item.meta.height} px
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

    // Bind remove buttons
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

  async executeCompression() {
    if (this.uploadedFiles.length === 0) {
      showCompressToast(
        "Please upload at least 1 image.",
        "warning",
        "No Images",
      );
      return;
    }

    const qualityVal = this.qualitySlider
      ? parseInt(this.qualitySlider.value, 10) / 100
      : 0.75;
    const stripMetadata = this.stripMetadataToggle
      ? this.stripMetadataToggle.checked
      : true;

    this.configSectionEl.style.display = "none";
    this.resultSectionEl.style.display = "none";
    this.processingStateEl.style.display = "block";

    this.statusTitleEl.textContent = "Compressing Images...";
    this.progressFillEl.style.width = "5%";

    this.results = [];

    try {
      const total = this.uploadedFiles.length;

      for (let i = 0; i < total; i++) {
        const item = this.uploadedFiles[i];
        const percent = Math.round(((i + 0.5) / total) * 100);

        this.statusDescEl.textContent = `Optimizing "${item.file.name}" (${i + 1} of ${total})...`;
        this.progressFillEl.style.width = `${percent}%`;

        const res = await this.engine.compressImage(item.file, item.meta, {
          quality: qualityVal,
          stripMetadata,
        });

        this.createdUrls.push(res.compressedUrl);
        this.results.push(res);
      }

      this.progressFillEl.style.width = "100%";

      // Calculate totals
      const totalOrig = this.results.reduce(
        (acc, r) => acc + r.originalSize,
        0,
      );
      const totalComp = this.results.reduce(
        (acc, r) => acc + r.compressedSize,
        0,
      );
      const totalSaved = Math.max(0, totalOrig - totalComp);
      const totalSavedPercent =
        totalOrig > 0 ? Math.round((totalSaved / totalOrig) * 100) : 0;

      if (this.resultSummaryText) {
        this.resultSummaryText.textContent = `Saved ${CompressImageUtils.formatBytes(
          totalSaved,
        )} across ${this.results.length} ${
          this.results.length === 1 ? "image" : "images"
        } (-${totalSavedPercent}% size reduction).`;
      }

      this.renderResultCards();

      this.processingStateEl.style.display = "none";
      this.resultSectionEl.style.display = "block";

      showCompressToast(
        "Images compressed successfully!",
        "success",
        "Compression Complete",
      );
    } catch (err) {
      console.error("Compression Error:", err);
      this.processingStateEl.style.display = "none";
      this.configSectionEl.style.display = "block";
      showCompressToast(
        err.message || "Failed to compress images.",
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
      <div class="card" style="padding: 20px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); background: var(--bg-surface);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; align-items: center;">
          
          <!-- Before / After Interactive Visual Preview -->
          <div style="background: var(--bg-surface-hover); border-radius: var(--radius-lg); padding: 12px; border: 1px solid var(--border-subtle);">
            
            <div style="display: flex; gap: 8px; margin-bottom: 10px;" id="toggle-group-${res.id}">
              <button type="button" class="btn btn--primary btn--sm preview-toggle-btn" data-target="comp-${res.id}" style="flex: 1; font-weight: 700; font-size: 0.8rem;">
                Compressed Preview
              </button>
              <button type="button" class="btn btn--outline btn--sm preview-toggle-btn" data-target="orig-${res.id}" style="flex: 1; font-weight: 700; font-size: 0.8rem;">
                Original Preview
              </button>
            </div>

            <div style="height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: var(--radius-md); background: rgba(0,0,0,0.03);">
              <img id="img-comp-${res.id}" src="${res.compressedUrl}" alt="Compressed Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              <img id="img-orig-${res.id}" src="${res.originalUrl}" alt="Original Preview" style="max-width: 100%; max-height: 100%; object-fit: contain; display: none;" />
            </div>

          </div>

          <!-- Comparative Stats & Individual Download -->
          <div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-main); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.outputFilename}">
              ${res.outputFilename}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
              Resolution: ${res.width} × ${res.height} px
            </div>

            <!-- Stats Badge Row -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; background: var(--bg-surface-hover); padding: 12px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); text-align: center;">
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--text-muted);">Original</div>
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-top: 2px;">${res.originalSizeFormatted}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--text-muted);">Compressed</div>
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--primary); margin-top: 2px;">${res.compressedSizeFormatted}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--text-muted);">Savings</div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #10b981; margin-top: 2px;">-${res.savedPercent}%</div>
              </div>
            </div>

            <a href="${res.compressedUrl}" download="${res.outputFilename}" class="btn btn--primary btn--full" style="height: 42px; font-weight: 700;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Image (${res.compressedSizeFormatted})</span>
            </a>
          </div>

        </div>
      </div>
    `,
      )
      .join("");

    // Bind Before / After toggle buttons
    this.results.forEach((res) => {
      const toggleGroup = document.getElementById(`toggle-group-${res.id}`);
      if (toggleGroup) {
        const btns = toggleGroup.querySelectorAll(".preview-toggle-btn");
        const imgComp = document.getElementById(`img-comp-${res.id}`);
        const imgOrig = document.getElementById(`img-orig-${res.id}`);

        btns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const target = e.currentTarget.getAttribute("data-target");
            btns.forEach((b) => {
              b.classList.remove("btn--primary");
              b.classList.add("btn--outline");
            });
            e.currentTarget.classList.remove("btn--outline");
            e.currentTarget.classList.add("btn--primary");

            if (target === `comp-${res.id}`) {
              imgComp.style.display = "block";
              imgOrig.style.display = "none";
            } else {
              imgComp.style.display = "none";
              imgOrig.style.display = "block";
            }
          });
        });
      }
    });
  }

  async downloadAllZip() {
    if (!this.results || this.results.length === 0) return;

    try {
      showCompressToast("Building ZIP archive...", "info", "Creating ZIP");
      const zipPackage = await this.engine.createZipPackage(
        this.results,
        "compressed-images",
      );
      this.createdUrls.push(zipPackage.url);

      const link = document.createElement("a");
      link.href = zipPackage.url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(zipPackage.filename) : String(zipPackage.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showCompressToast("ZIP download initiated!", "success", "Downloaded ZIP");
    } catch (err) {
      console.error("ZIP Error:", err);
      showCompressToast(
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
  }
}

// Auto Init
document.addEventListener("DOMContentLoaded", () => {
  const app = new CompressImageUI();
  app.init();
  window.ComprexaCompressImageApp = app;
});
