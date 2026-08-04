/**
 * Comprexa - Universal Image Converter Controller
 * Completely rebuilt client-side image converter with multi-file batch processing,
 * format conversion (JPG, PNG, WebP, BMP, TIFF), quality control, background fill,
 * and bulk ZIP download.
 */

import JSZip from "jszip";

export class ConvertImageController {
  constructor() {
    // State
    this.filesQueue = []; // [{ id, file, name, size, type, ext, dimensionsFormatted, width, height, previewUrl }]
    this.targetFormat = "jpg"; // 'jpg' | 'png' | 'webp' | 'bmp' | 'tiff'
    this.quality = 0.85; // 0.1 to 1.0
    this.backgroundColor = "transparent"; // 'transparent' | '#FFFFFF' | '#000000' | custom hex
    this.convertedResults = []; // [{ id, file, name, convertedBlob, convertedDataUrl, originalSize, convertedSize, originalFormat, targetFormat, filename, width, height }]
    this.nextFileId = 1;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    // Sections
    this.uploadSection = document.getElementById("convert-upload-section");
    this.configSection = document.getElementById("convert-config-section");
    this.processingSection = document.getElementById(
      "convert-processing-state",
    );
    this.resultSection = document.getElementById("convert-result-section");

    // Upload Elements
    this.dropzone = document.getElementById("convert-dropzone");
    this.fileInput = document.getElementById("convert-file-input");
    this.addMoreInput = document.getElementById("add-more-file-input");
    this.browseTriggerBtn = document.getElementById("btn-browse-trigger");

    // Config Elements
    this.filesCountBadge = document.getElementById("convert-files-count-badge");
    this.addMoreBtn = document.getElementById("btn-add-more-trigger");
    this.clearAllBtn = document.getElementById("btn-clear-all");
    this.filesContainer = document.getElementById("convert-files-container");

    // Settings Controls
    this.targetFormatBtns = document.querySelectorAll(".format-option-btn");
    this.formatDescText = document.getElementById("format-description-text");
    this.qualitySettingGroup = document.getElementById("quality-setting-group");
    this.qualitySlider = document.getElementById("quality-slider");
    this.qualityValDisplay = document.getElementById("quality-val-display");
    this.presetQBtns = document.querySelectorAll(".preset-q-btn");
    this.bgFillGroup = document.getElementById("bgfill-setting-group");
    this.bgPresetBtns = document.querySelectorAll(".bg-preset-btn");
    this.customBgColorPicker = document.getElementById("custom-bg-color");

    // Execute Button
    this.executeConvertBtn = document.getElementById("btn-execute-convert");
    this.executeConvertLabel = document.getElementById(
      "btn-execute-convert-label",
    );

    // Progress Elements
    this.statusTitle = document.getElementById("convert-status-title");
    this.statusDesc = document.getElementById("convert-status-desc");
    this.progressFill = document.getElementById("convert-progress-fill");
    this.progressPercent = document.getElementById("convert-progress-percent");

    // Result Elements
    this.resultSummaryText = document.getElementById("result-summary-text");
    this.downloadAllZipBtn = document.getElementById("btn-download-all-zip");
    this.startOverBtn = document.getElementById("btn-start-over");
    this.resultsContainer = document.getElementById(
      "convert-results-container",
    );
  }

  bindEvents() {
    // Dropzone Click & Keyboard Trigger
    if (this.dropzone) {
      this.dropzone.addEventListener("click", (e) => {
        // Don't trigger input if user clicked directly on browse button (to avoid double popup)
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

    // Add More Images Button
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

    // Format Selector Buttons
    this.targetFormatBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const fmt = btn.getAttribute("data-format");
        this.selectTargetFormat(fmt);
      });
    });

    // Quality Slider & Presets
    if (this.qualitySlider) {
      this.qualitySlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.quality = val / 100;
        if (this.qualityValDisplay)
          this.qualityValDisplay.textContent = `${val}%`;

        // Update active preset button styling
        this.presetQBtns.forEach((b) => {
          const q = parseInt(b.getAttribute("data-quality"), 10);
          if (q === val) {
            b.classList.add("btn--primary");
            b.classList.remove("btn--outline");
          } else {
            b.classList.remove("btn--primary");
            b.classList.add("btn--outline");
          }
        });
      });
    }

    this.presetQBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = parseInt(btn.getAttribute("data-quality"), 10);
        this.quality = q / 100;
        if (this.qualitySlider) this.qualitySlider.value = String(q);
        if (this.qualityValDisplay)
          this.qualityValDisplay.textContent = `${q}%`;

        this.presetQBtns.forEach((b) => {
          b.classList.remove("btn--primary");
          b.classList.add("btn--outline");
        });
        btn.classList.add("btn--primary");
        btn.classList.remove("btn--outline");
      });
    });

    // Background Fill Color Buttons
    this.bgPresetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.bgPresetBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
        btn.classList.add("btn--primary", "active");
        btn.classList.remove("btn--outline");

        this.backgroundColor = btn.getAttribute("data-color");
      });
    });

    if (this.customBgColorPicker) {
      this.customBgColorPicker.addEventListener("input", (e) => {
        this.backgroundColor = e.target.value;
        this.bgPresetBtns.forEach((b) => {
          b.classList.remove("btn--primary", "active");
          b.classList.add("btn--outline");
        });
      });
    }

    // Execute Conversion Button
    if (this.executeConvertBtn) {
      this.executeConvertBtn.addEventListener("click", () => {
        this.executeConversion();
      });
    }

    // Download All (.zip) Button
    if (this.downloadAllZipBtn) {
      this.downloadAllZipBtn.addEventListener("click", () => {
        this.downloadAllZip();
      });
    }

    // Start Over / Convert More Images Button
    if (this.startOverBtn) {
      this.startOverBtn.addEventListener("click", () => {
        this.resetToUpload();
      });
    }
  }

  selectTargetFormat(fmt) {
    this.targetFormat = fmt;

    // Update button active state
    this.targetFormatBtns.forEach((btn) => {
      if (btn.getAttribute("data-format") === fmt) {
        btn.classList.add("btn--primary", "active");
        btn.classList.remove("btn--outline");
      } else {
        btn.classList.remove("btn--primary", "active");
        btn.classList.add("btn--outline");
      }
    });

    // Format Description Text & Controls Visibility
    if (this.formatDescText) {
      if (fmt === "jpg") {
        this.formatDescText.textContent =
          "JPG is ideal for photos and web graphics with compact file size.";
        if (this.qualitySettingGroup)
          this.qualitySettingGroup.style.display = "block";
        if (this.bgFillGroup) this.bgFillGroup.style.display = "block";
        // Auto default bg fill to white if currently transparent
        if (this.backgroundColor === "transparent") {
          this.setBgFillOption("#FFFFFF");
        }
      } else if (fmt === "png") {
        this.formatDescText.textContent =
          "PNG provides lossless image quality with full transparency support.";
        if (this.qualitySettingGroup)
          this.qualitySettingGroup.style.display = "none";
        if (this.bgFillGroup) this.bgFillGroup.style.display = "block";
      } else if (fmt === "webp") {
        this.formatDescText.textContent =
          "WebP offers modern high compression with both lossy/lossless modes and transparency.";
        if (this.qualitySettingGroup)
          this.qualitySettingGroup.style.display = "block";
        if (this.bgFillGroup) this.bgFillGroup.style.display = "block";
      } else if (fmt === "bmp") {
        this.formatDescText.textContent =
          "BMP generates uncompressed bitmap raster images with max fidelity.";
        if (this.qualitySettingGroup)
          this.qualitySettingGroup.style.display = "none";
        if (this.bgFillGroup) this.bgFillGroup.style.display = "block";
        if (this.backgroundColor === "transparent") {
          this.setBgFillOption("#FFFFFF");
        }
      } else if (fmt === "tiff") {
        this.formatDescText.textContent =
          "TIFF creates professional baseline raster images widely used in printing and publishing.";
        if (this.qualitySettingGroup)
          this.qualitySettingGroup.style.display = "none";
        if (this.bgFillGroup) this.bgFillGroup.style.display = "block";
      }
    }
  }

  setBgFillOption(color) {
    this.backgroundColor = color;
    this.bgPresetBtns.forEach((btn) => {
      if (btn.getAttribute("data-color") === color) {
        btn.classList.add("btn--primary", "active");
        btn.classList.remove("btn--outline");
      } else {
        btn.classList.remove("btn--primary", "active");
        btn.classList.add("btn--outline");
      }
    });
  }

  async addFilesToQueue(files) {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/x-bmp",
      "image/tiff",
      "image/svg+xml",
    ];
    const validExts = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "bmp",
      "tiff",
      "tif",
      "svg",
    ];

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

      // Read dimensions & generate thumbnail preview URL
      try {
        const metadata = await this.readImageMetadata(file);
        const item = {
          id: this.nextFileId++,
          file: file,
          name: file.name,
          size: file.size,
          sizeFormatted: this.formatFileSize(file.size),
          type: file.type || `image/${ext}`,
          ext: ext.toUpperCase(),
          dimensionsFormatted: metadata.dimensionsFormatted,
          width: metadata.width,
          height: metadata.height,
          previewUrl: metadata.previewUrl,
        };

        this.filesQueue.push(item);
        addedCount++;
      } catch (err) {
        const previewUrl = URL.createObjectURL(file);
        const item = {
          id: this.nextFileId++,
          file: file,
          name: file.name,
          size: file.size,
          sizeFormatted: this.formatFileSize(file.size),
          type: file.type || `image/${ext}`,
          ext: ext.toUpperCase(),
          dimensionsFormatted: "Original Image",
          width: 0,
          height: 0,
          previewUrl: previewUrl,
        };
        this.filesQueue.push(item);
        addedCount++;
      }
    }

    if (skippedCount > 0) {
      this.showToast(
        `Skipped ${skippedCount} unsupported file(s). Supported: JPG, PNG, WebP, GIF, BMP, TIFF, SVG`,
        "info",
      );
    }

    if (addedCount > 0) {
      this.showToast(
        `Added ${addedCount} image(s) to converter queue`,
        "success",
      );
      this.renderQueue();
    }
  }

  readImageMetadata(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          dimensionsFormatted: `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height} px`,
          previewUrl: url,
        });
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image metadata for ${file.name}`));
      };
      img.src = url;
    });
  }

  removeFileFromQueue(id) {
    const idx = this.filesQueue.findIndex((item) => item.id === id);
    if (idx !== -1) {
      const removed = this.filesQueue.splice(idx, 1)[0];
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      this.renderQueue();
      this.showToast(`Removed "${removed.name}"`, "info");
    }
  }

  clearQueue() {
    this.filesQueue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    this.filesQueue = [];
    this.renderQueue();
  }

  renderQueue() {
    const count = this.filesQueue.length;

    if (this.filesCountBadge) {
      this.filesCountBadge.textContent = `${count} image${count === 1 ? "" : "s"}`;
    }

    if (count === 0) {
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

    if (this.executeConvertLabel) {
      this.executeConvertLabel.textContent = `Convert ${count} Image${count === 1 ? "" : "s"}`;
    }

    if (!this.filesContainer) return;
    this.filesContainer.innerHTML = "";

    this.filesQueue.forEach((item) => {
      const card = document.createElement("div");
      card.className = "queue-file-card";
      card.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        position: relative;
        overflow: hidden;
      `;

      card.innerHTML = `
        <div style="width: 48px; height: 48px; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-surface-subtle); flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
          <img src="${item.previewUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-bottom: 2px;" title="${item.name}">
            ${item.name}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span>${item.dimensionsFormatted}</span>
            <span>•</span>
            <span>${item.sizeFormatted}</span>
            <span class="badge badge--subtle badge--sm" style="font-size: 0.68rem; font-weight: 700;">${item.ext}</span>
          </div>
        </div>
        <button type="button" class="btn btn--ghost btn--icon btn--sm btn-remove-item" data-id="${item.id}" title="Remove image" style="color: var(--text-muted); flex-shrink: 0; width: 30px; height: 30px; padding: 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

  async executeConversion() {
    if (this.filesQueue.length === 0) return;

    if (this.configSection) this.configSection.style.display = "none";
    if (this.processingSection) this.processingSection.style.display = "block";

    this.convertedResults = [];
    const total = this.filesQueue.length;

    for (let i = 0; i < total; i++) {
      const item = this.filesQueue[i];
      const pct = Math.round((i / total) * 100);

      if (this.statusTitle)
        this.statusTitle.textContent = `Converting Images (${i + 1}/${total})...`;
      if (this.statusDesc)
        this.statusDesc.textContent = `Processing "${item.name}"...`;
      if (this.progressFill) this.progressFill.style.width = `${pct}%`;
      if (this.progressPercent) this.progressPercent.textContent = `${pct}%`;

      try {
        const result = await this.convertSingleFile(
          item,
          this.targetFormat,
          this.quality,
          this.backgroundColor,
        );
        this.convertedResults.push(result);
      } catch (err) {
        console.error(`Failed to convert ${item.name}`, err);
        this.showToast(
          `Error converting "${item.name}": ${err.message}`,
          "error",
        );
      }
    }

    if (this.progressFill) this.progressFill.style.width = "100%";
    if (this.progressPercent) this.progressPercent.textContent = "100%";

    setTimeout(() => {
      if (this.processingSection) this.processingSection.style.display = "none";
      if (this.resultSection) this.resultSection.style.display = "block";
      this.renderResults();
      this.showToast("Batch image conversion complete!", "success");
    }, 300);
  }

  convertSingleFile(item, targetFormat, quality, bgColor) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(item.file);

      img.onload = async () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Canvas 2D context unavailable");
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Handle Background Fill
          const needBgFill =
            targetFormat === "jpg" ||
            targetFormat === "bmp" ||
            bgColor !== "transparent";
          if (needBgFill) {
            ctx.fillStyle =
              bgColor === "transparent" || !bgColor ? "#FFFFFF" : bgColor;
            ctx.fillRect(0, 0, width, height);
          }

          // Draw Image
          ctx.drawImage(img, 0, 0, width, height);

          // Export Canvas to Target Format
          let outputBlob = null;
          let mimeType = "image/jpeg";
          let ext = targetFormat.toLowerCase();

          if (targetFormat === "jpg") {
            mimeType = "image/jpeg";
            outputBlob = await new Promise((r) =>
              canvas.toBlob(r, mimeType, quality),
            );
          } else if (targetFormat === "png") {
            mimeType = "image/png";
            outputBlob = await new Promise((r) => canvas.toBlob(r, mimeType));
          } else if (targetFormat === "webp") {
            mimeType = "image/webp";
            outputBlob = await new Promise((r) =>
              canvas.toBlob(r, mimeType, quality),
            );
          } else if (targetFormat === "bmp") {
            mimeType = "image/bmp";
            outputBlob = this.canvasToBmpBlob(canvas);
          } else if (targetFormat === "tiff") {
            mimeType = "image/tiff";
            outputBlob = this.canvasToTiffBlob(canvas);
          }

          if (!outputBlob) {
            // Fallback to PNG blob if specific browser encoder failed
            outputBlob = await new Promise((r) =>
              canvas.toBlob(r, "image/png"),
            );
          }

          const convertedDataUrl = URL.createObjectURL(outputBlob);
          const baseName =
            item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
          const outFilename = `${baseName}_converted.${ext === "jpg" ? "jpg" : ext}`;

          URL.revokeObjectURL(objectUrl);

          resolve({
            id: item.id,
            file: item.file,
            name: item.name,
            convertedBlob: outputBlob,
            convertedDataUrl: convertedDataUrl,
            originalSize: item.size,
            convertedSize: outputBlob.size,
            originalFormat: item.ext,
            targetFormat: targetFormat.toUpperCase(),
            filename: outFilename,
            width: width,
            height: height,
          });
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to decode raster pixels for "${item.name}"`));
      };

      img.src = objectUrl;
    });
  }

  canvasToBmpBlob(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // File Header (14 bytes)
    view.setUint16(0, 0x4d42, false); // 'BM'
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, 54, true);

    // DIB Header (40 bytes - BITMAPINFOHEADER)
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Top-down
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true); // 24-bit RGB
    view.setUint32(30, 0, true); // Uncompressed
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true); // 72 DPI
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    const bytes = new Uint8Array(buffer);
    for (let y = 0; y < height; y++) {
      const rowStart = y * width * 4;
      let colPos = 54 + y * rowSize;
      for (let x = 0; x < width; x++) {
        const idx = rowStart + x * 4;
        bytes[colPos++] = data[idx + 2]; // Blue
        bytes[colPos++] = data[idx + 1]; // Green
        bytes[colPos++] = data[idx]; // Red
      }
    }

    return new Blob([buffer], { type: "image/bmp" });
  }

  canvasToTiffBlob(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data; // RGBA uint8

    const numPixels = width * height;
    const imageBytes = numPixels * 4; // 32-bit RGBA
    const ifdOffset = 8;
    const numDirEntries = 11;
    const ifdSize = 2 + numDirEntries * 12 + 4;
    const extraValuesOffset = ifdOffset + ifdSize;
    const extraValuesSize = 8 + 8 + 8; // BitsPerSample + XRes + YRes
    const pixelDataOffset = extraValuesOffset + extraValuesSize;
    const totalFileSize = pixelDataOffset + imageBytes;

    const buffer = new ArrayBuffer(totalFileSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Little Endian Header 'II'
    bytes[0] = 0x49;
    bytes[1] = 0x49;
    view.setUint16(2, 42, true);
    view.setUint32(4, ifdOffset, true);

    let p = ifdOffset;
    view.setUint16(p, numDirEntries, true);
    p += 2;

    function writeTag(tag, type, count, valueOrOffset) {
      view.setUint16(p, tag, true);
      view.setUint16(p + 2, type, true);
      view.setUint32(p + 4, count, true);
      view.setUint32(p + 8, valueOrOffset, true);
      p += 12;
    }

    const bitsPerSampleOffset = extraValuesOffset;
    const xResOffset = bitsPerSampleOffset + 8;
    const yResOffset = xResOffset + 8;

    // BitsPerSample [8, 8, 8, 8]
    view.setUint16(bitsPerSampleOffset, 8, true);
    view.setUint16(bitsPerSampleOffset + 2, 8, true);
    view.setUint16(bitsPerSampleOffset + 4, 8, true);
    view.setUint16(bitsPerSampleOffset + 6, 8, true);

    // XRes 72/1
    view.setUint32(xResOffset, 72, true);
    view.setUint32(xResOffset + 4, 1, true);

    // YRes 72/1
    view.setUint32(yResOffset, 72, true);
    view.setUint32(yResOffset + 4, 1, true);

    // Write IFD Tags
    writeTag(256, 3, 1, width); // ImageWidth
    writeTag(257, 3, 1, height); // ImageLength
    writeTag(258, 3, 4, bitsPerSampleOffset); // BitsPerSample
    writeTag(259, 3, 1, 1); // Compression = 1 (Uncompressed)
    writeTag(262, 3, 1, 2); // PhotometricInterpretation = 2 (RGB)
    writeTag(273, 4, 1, pixelDataOffset); // StripOffsets
    writeTag(277, 3, 1, 4); // SamplesPerPixel = 4 (RGBA)
    writeTag(278, 3, 1, height); // RowsPerStrip
    writeTag(279, 4, 1, imageBytes); // StripByteCounts
    writeTag(282, 5, 1, xResOffset); // XResolution
    writeTag(283, 5, 1, yResOffset); // YResolution

    view.setUint32(p, 0, true);

    // Write Pixels
    bytes.set(data, pixelDataOffset);

    return new Blob([buffer], { type: "image/tiff" });
  }

  renderResults() {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = "";

    const count = this.convertedResults.length;
    let totalOrigBytes = 0;
    let totalConvBytes = 0;

    this.convertedResults.forEach((res) => {
      totalOrigBytes += res.originalSize;
      totalConvBytes += res.convertedSize;
    });

    if (this.resultSummaryText) {
      const origFormatted = this.formatFileSize(totalOrigBytes);
      const convFormatted = this.formatFileSize(totalConvBytes);
      this.resultSummaryText.textContent = `Converted ${count} image${count === 1 ? "" : "s"} to ${this.targetFormat.toUpperCase()} (${origFormatted} → ${convFormatted})`;
    }

    this.convertedResults.forEach((res) => {
      const card = document.createElement("div");
      card.className = "result-item-card";
      card.style.cssText = `
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        background: var(--bg-surface);
        flex-wrap: wrap;
      `;

      const diffBytes = res.convertedSize - res.originalSize;
      const diffPct = Math.round((diffBytes / res.originalSize) * 100);
      let diffBadgeHtml = "";

      if (diffPct <= 0) {
        diffBadgeHtml = `<span class="badge badge--success" style="font-weight: 700;">${diffPct}%</span>`;
      } else {
        diffBadgeHtml = `<span class="badge badge--subtle" style="font-weight: 700; color: var(--text-muted);">+${diffPct}%</span>`;
      }

      card.innerHTML = `
        <div style="width: 56px; height: 56px; border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-surface-subtle); flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
          <img src="${res.convertedDataUrl}" alt="${res.filename}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <div style="flex: 1; min-width: 200px;">
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${res.filename}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap;">
            <span>${res.width} × ${res.height} px</span>
            <span>•</span>
            <span>${this.formatFileSize(res.originalSize)} → <strong>${this.formatFileSize(res.convertedSize)}</strong></span>
            ${diffBadgeHtml}
            <span class="badge badge--primary badge--sm" style="font-size: 0.7rem; font-weight: 800;">${res.originalFormat} → ${res.targetFormat}</span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button type="button" class="btn btn--primary btn--sm btn-download-single" data-id="${res.id}" style="height: 36px; padding: 0 14px; font-weight: 700;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download</span>
          </button>
        </div>
      `;

      const downloadBtn = card.querySelector(".btn-download-single");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          this.downloadSingleResult(res);
        });
      }

      this.resultsContainer.appendChild(card);
    });
  }

  downloadSingleResult(item) {
    const a = document.createElement("a");
    a.href = item.convertedDataUrl;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(item.filename) : String(item.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast(`Downloading "${item.filename}"...`, "info");
  }

  async downloadAllZip() {
    if (this.convertedResults.length === 0) return;

    try {
      this.showToast("Generating ZIP package...", "info");

      // Use window.JSZip or ES Module JSZip
      const ZipClass = window.JSZip || JSZip;
      const zip = new ZipClass();

      this.convertedResults.forEach((item) => {
        zip.file(item.filename, item.convertedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`converted_images_${this.targetFormat}.zip`) : String(`converted_images_${this.targetFormat}.zip`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
      this.showToast("ZIP download started successfully!", "success");
    } catch (err) {
      console.error("ZIP generation error", err);
      this.showToast("Failed to create ZIP package.", "error");
    }
  }

  resetToUpload() {
    this.clearQueue();
    this.convertedResults.forEach((res) => {
      if (res.convertedDataUrl) URL.revokeObjectURL(res.convertedDataUrl);
    });
    this.convertedResults = [];

    if (this.uploadSection) this.uploadSection.style.display = "block";
    if (this.configSection) this.configSection.style.display = "none";
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

// Auto-initialize when DOM is loaded
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.convertImageControllerInstance = new ConvertImageController();
  });
}
