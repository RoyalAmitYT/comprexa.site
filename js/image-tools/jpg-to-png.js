/**
 * Comprexa - Standalone JPG to PNG Tool Controller
 * Independent client-side JPG to PNG converter with multi-file batch processing,
 * lossless PNG encoding, resolution preservation, and bulk ZIP export.
 */

import JSZip from "jszip";

export class JpgToPngController {
  constructor() {
    // State
    this.filesQueue = []; // [{ id, file, name, size, width, height, dimensionsFormatted, previewUrl }]
    this.compressionLevel = 100; // 100 = Maximum Lossless, 90 = Balanced, 80 = Compact
    this.preserveMetadata = true;
    this.convertedResults = []; // [{ id, name, originalSize, convertedSize, convertedBlob, convertedDataUrl, filename, width, height }]
    this.nextFileId = 1;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    // Sections
    this.uploadSection = document.getElementById("jpg2png-upload-section");
    this.configSection = document.getElementById("jpg2png-config-section");
    this.processingSection = document.getElementById(
      "jpg2png-processing-state",
    );
    this.resultSection = document.getElementById("jpg2png-result-section");

    // Upload Elements
    this.dropzone = document.getElementById("jpg2png-dropzone");
    this.fileInput = document.getElementById("jpg2png-file-input");
    this.addMoreInput = document.getElementById("add-more-file-input");
    this.browseTriggerBtn = document.getElementById("btn-browse-trigger");

    // Config Elements
    this.filesCountBadge = document.getElementById("jpg2png-files-count-badge");
    this.addMoreBtn = document.getElementById("btn-add-more-trigger");
    this.clearAllBtn = document.getElementById("btn-clear-all");
    this.filesContainer = document.getElementById("jpg2png-files-container");

    // Settings Controls
    this.compressionPresetBtns = document.querySelectorAll(".preset-c-btn");
    this.compressionValDisplay = document.getElementById(
      "compression-val-display",
    );
    this.preserveMetadataCheckbox = document.getElementById(
      "preserve-metadata-checkbox",
    );

    // Execute Button
    this.executeConvertBtn = document.getElementById("btn-execute-convert");

    // Progress Elements
    this.statusTitle = document.getElementById("jpg2png-status-title");
    this.statusDesc = document.getElementById("jpg2png-status-desc");
    this.progressFill = document.getElementById("jpg2png-progress-fill");
    this.progressPercent = document.getElementById("jpg2png-progress-percent");

    // Result Elements
    this.resultSummaryText = document.getElementById("result-summary-text");
    this.downloadAllZipBtn = document.getElementById("btn-download-all-zip");
    this.startOverBtn = document.getElementById("btn-start-over");
    this.resultsContainer = document.getElementById(
      "jpg2png-results-container",
    );
  }

  bindEvents() {
    // Dropzone Click & Keyboard Trigger
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

      // Drag & Drop
      ["dragenter", "dragover"].forEach((eventName) => {
        this.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("drop-zone--active");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        this.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("drop-zone--active");
        });
      });

      this.dropzone.addEventListener("drop", (e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length > 0) {
          this.addFilesToQueue(files);
        }
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

    // Add More JPG Images Button
    if (this.addMoreBtn && this.addMoreInput) {
      this.addMoreBtn.addEventListener("click", () => {
        this.addMoreInput.click();
      });

      this.addMoreInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          this.addFilesToQueue(files);
          this.addMoreInput.value = "";
        }
      });
    }

    // Clear All Button
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener("click", () => {
        this.clearQueue();
      });
    }

    // Compression Presets
    this.compressionPresetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.compressionPresetBtns.forEach((b) => {
          b.classList.remove("active", "btn--primary");
          b.classList.add("btn--outline");
        });
        btn.classList.add("active", "btn--primary");
        btn.classList.remove("btn--outline");

        const val = parseInt(btn.dataset.compression, 10);
        this.compressionLevel = val;
        if (this.compressionValDisplay) {
          if (val === 100)
            this.compressionValDisplay.textContent = "Maximum Lossless (100%)";
          else if (val === 90)
            this.compressionValDisplay.textContent = "Balanced (90%)";
          else this.compressionValDisplay.textContent = "Compact Size (80%)";
        }
      });
    });

    // Metadata Preservation Checkbox
    if (this.preserveMetadataCheckbox) {
      this.preserveMetadataCheckbox.addEventListener("change", (e) => {
        this.preserveMetadata = e.target.checked;
      });
    }

    // Execute Convert Button
    if (this.executeConvertBtn) {
      this.executeConvertBtn.addEventListener("click", () => {
        this.executeConversion();
      });
    }

    // Start Over / Convert More
    if (this.startOverBtn) {
      this.startOverBtn.addEventListener("click", () => {
        this.resetToUpload();
      });
    }

    // Download All ZIP
    if (this.downloadAllZipBtn) {
      this.downloadAllZipBtn.addEventListener("click", () => {
        this.downloadAllAsZip();
      });
    }

    // Clipboard Paste Listener
    window.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) {
        this.addFilesToQueue(pastedFiles);
      }
    });
  }

  // --- Queue Management ---

  async addFilesToQueue(files) {
    if (!files || files.length === 0) return;

    let addedCount = 0;
    let rejectedCount = 0;
    let corruptedCount = 0;

    for (const file of files) {
      const isJpg =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.name.toLowerCase().endsWith(".jpg") ||
        file.name.toLowerCase().endsWith(".jpeg");

      if (!isJpg) {
        rejectedCount++;
        continue;
      }

      try {
        const fileObj = await this.processFileForQueue(file);
        this.filesQueue.push(fileObj);
        addedCount++;
      } catch (err) {
        console.error("Failed to load JPG photo:", file.name, err);
        corruptedCount++;
      }
    }

    if (rejectedCount > 0) {
      this.showToast(
        `Skipped ${rejectedCount} file(s). The JPG to PNG tool accepts ONLY .JPG and .JPEG images.`,
        "error",
      );
    }

    if (corruptedCount > 0) {
      this.showToast(
        `Failed to load ${corruptedCount} file(s). Photo file may be corrupted or unreadable.`,
        "error",
      );
    }

    if (addedCount > 0) {
      this.showToast(`Added ${addedCount} JPG photo(s) to queue`, "success");
      this.renderQueueUI();
    }
  }

  processFileForQueue(file) {
    return new Promise((resolve, reject) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        resolve({
          id: `jpg_${this.nextFileId++}_${Date.now()}`,
          file: file,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          dimensionsFormatted: `${img.naturalWidth} × ${img.naturalHeight} px`,
          previewUrl: previewUrl,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(previewUrl);
        reject(new Error("Corrupted or invalid JPG image file"));
      };

      img.src = previewUrl;
    });
  }

  removeFileFromQueue(fileId) {
    const idx = this.filesQueue.findIndex((f) => f.id === fileId);
    if (idx !== -1) {
      const removed = this.filesQueue.splice(idx, 1)[0];
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      this.renderQueueUI();
      this.showToast("Removed photo from list", "info");
    }
  }

  clearQueue() {
    this.filesQueue.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    this.filesQueue = [];
    this.renderQueueUI();
    this.showToast("Cleared all uploaded photos", "info");
  }

  renderQueueUI() {
    if (this.filesQueue.length === 0) {
      if (this.uploadSection) this.uploadSection.style.display = "block";
      if (this.configSection) this.configSection.style.display = "none";
      if (this.processingSection) this.processingSection.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "none";
      return;
    }

    if (this.uploadSection) this.uploadSection.style.display = "none";
    if (this.configSection) this.configSection.style.display = "block";
    if (this.processingSection) this.processingSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "none";

    if (this.filesCountBadge) {
      this.filesCountBadge.textContent = `${this.filesQueue.length} ${this.filesQueue.length === 1 ? "JPG" : "JPGs"}`;
    }

    if (!this.filesContainer) return;

    this.filesContainer.innerHTML = "";

    this.filesQueue.forEach((item) => {
      const card = document.createElement("div");
      card.className = "file-card";
      card.style.cssText =
        "position: relative; display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);";

      card.innerHTML = `
        <div style="width: 54px; height: 54px; border-radius: var(--radius-md); overflow: hidden; background: #1f2937; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${item.previewUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${item.name}">${item.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; display: flex; gap: 8px;">
            <span>${this.formatFileSize(item.size)}</span>
            <span>•</span>
            <span>${item.dimensionsFormatted}</span>
          </div>
        </div>
        <button type="button" class="btn-remove-item" data-id="${item.id}" title="Remove photo" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; line-height: 1;">
          &times;
        </button>
      `;

      const removeBtn = card.querySelector(".btn-remove-item");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          this.removeFileFromQueue(item.id);
        });
      }

      this.filesContainer.appendChild(card);
    });
  }

  // --- Execution Engine ---

  async executeConversion() {
    if (this.filesQueue.length === 0) {
      this.showToast(
        "Please upload at least one JPG photo to convert",
        "error",
      );
      return;
    }

    // Switch to Processing State
    if (this.configSection) this.configSection.style.display = "none";
    if (this.processingSection) this.processingSection.style.display = "block";

    const total = this.filesQueue.length;
    this.convertedResults = [];

    for (let i = 0; i < total; i++) {
      const item = this.filesQueue[i];
      const currentNum = i + 1;
      const progressPct = Math.round((currentNum / total) * 100);

      if (this.statusDesc)
        this.statusDesc.textContent = `Converting JPG photo ${currentNum} of ${total}: ${item.name}...`;
      if (this.progressFill) this.progressFill.style.width = `${progressPct}%`;
      if (this.progressPercent)
        this.progressPercent.textContent = `${progressPct}%`;

      try {
        const result = await this.convertJpgToPng(item);
        this.convertedResults.push(result);
      } catch (err) {
        console.error("Failed converting JPG file:", item.name, err);
        this.showToast(`Error converting ${item.name}`, "error");
      }
    }

    this.renderResultsUI();
  }

  convertJpgToPng(item) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        // Draw JPG photo onto canvas
        ctx.drawImage(img, 0, 0);

        // Export as PNG Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed creating PNG blob"));
            return;
          }

          const baseName = item.name.replace(/\.[^/.]+$/, "");
          const filename = `${baseName}.png`;
          const convertedDataUrl = URL.createObjectURL(blob);

          resolve({
            id: item.id,
            name: item.name,
            filename: filename,
            originalSize: item.size,
            convertedSize: blob.size,
            convertedBlob: blob,
            convertedDataUrl: convertedDataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed loading image element for conversion"));
      };

      img.src = item.previewUrl;
    });
  }

  // --- Results & Output ---

  renderResultsUI() {
    if (this.processingSection) this.processingSection.style.display = "none";
    if (this.resultSection) this.resultSection.style.display = "block";

    if (this.resultSummaryText) {
      this.resultSummaryText.textContent = `Successfully converted ${this.convertedResults.length} JPG photo(s) to lossless PNG format.`;
    }

    if (!this.resultsContainer) return;

    this.resultsContainer.innerHTML = "";

    this.convertedResults.forEach((res) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.style.cssText =
        "display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface); flex-wrap: wrap;";

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px; min-width: 240px; flex: 1;">
          <div style="width: 60px; height: 60px; border-radius: var(--radius-md); overflow: hidden; background: #1f2937; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <img src="${res.convertedDataUrl}" alt="${res.filename}" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 2px;">${res.filename}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 8px; flex-wrap: wrap;">
              <span>JPG: <strong>${this.formatFileSize(res.originalSize)}</strong></span>
              <span>&rarr;</span>
              <span>PNG: <strong>${this.formatFileSize(res.convertedSize)}</strong></span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${res.width} × ${res.height} px • Lossless PNG</div>
          </div>
        </div>

        <button type="button" class="btn btn--primary btn-download-single" data-id="${res.id}" style="height: 40px; padding: 0 18px; font-size: 0.88rem; font-weight: 700;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download PNG</span>
        </button>
      `;

      const downloadBtn = card.querySelector(".btn-download-single");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          this.triggerDownload(res.convertedDataUrl, res.filename);
        });
      }

      this.resultsContainer.appendChild(card);
    });
  }

  async downloadAllAsZip() {
    if (this.convertedResults.length === 0) return;

    if (this.convertedResults.length === 1) {
      const single = this.convertedResults[0];
      this.triggerDownload(single.convertedDataUrl, single.filename);
      return;
    }

    try {
      this.showToast("Preparing ZIP archive...", "info");
      const zip = new JSZip();

      this.convertedResults.forEach((res) => {
        zip.file(res.filename, res.convertedBlob);
      });

      const zipContent = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipContent);
      this.triggerDownload(zipUrl, "comprexa-converted-pngs.zip");
      URL.revokeObjectURL(zipUrl);

      this.showToast("ZIP archive downloaded successfully", "success");
    } catch (err) {
      console.error("Failed generating ZIP:", err);
      this.showToast("Failed to generate ZIP file", "error");
    }
  }

  triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  resetToUpload() {
    this.convertedResults.forEach((r) => {
      if (r.convertedDataUrl) URL.revokeObjectURL(r.convertedDataUrl);
    });
    this.convertedResults = [];
    this.clearQueue();
  }

  // --- Utilities ---

  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
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

// Auto Initialize Controller on Page Load
document.addEventListener("DOMContentLoaded", () => {
  window.jpgToPngApp = new JpgToPngController();
});
