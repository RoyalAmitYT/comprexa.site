// @ts-nocheck
/**
 * Comprexa QR Code Scanner Engine
 * ---------------------------------------------------------------------------
 * Rebuilt from scratch. 100% client-side, production-grade QR decoding.
 *
 * Decoding engine: @zxing/browser + @zxing/library (ISO/IEC 18004 compliant
 * multi-format reader used in production by countless commercial products).
 *
 * Capabilities:
 *  - Image upload (click-to-browse)
 *  - Drag & drop
 *  - Paste from clipboard (button + native Ctrl/Cmd+V anywhere on page)
 *  - Webcam / mobile rear camera live scanning
 *  - Automatic decode as soon as an image/frame is available
 *  - Manual "Scan QR Code" button for on-demand / repeat scans
 *  - Rich payload parsing: URL, Text, Wi-Fi, Email, Phone, SMS, WhatsApp,
 *    vCard, MeCard, Calendar (vEvent), Geo/Maps location
 * ---------------------------------------------------------------------------
 */

import { BrowserQRCodeReader } from "@zxing/browser";
import {
  DecodeHintType,
  BarcodeFormat,
  NotFoundException,
  ChecksumException,
  FormatException,
} from "@zxing/library";

// --- APPLICATION STATE MACHINE -----------------------------------------
const ScannerState = {
  IDLE: "IDLE",
  READY_TO_SCAN: "READY_TO_SCAN",
  SCANNING: "SCANNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

class QrScannerApp {
  constructor() {
    this.state = ScannerState.IDLE;

    // --- Decoding engine ---
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.reader = new BrowserQRCodeReader(hints, {
      delayBetweenScanAttempts: 150,
      delayBetweenScanSuccess: 500,
    });

    // --- Active image data ---
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;

    // --- Camera data ---
    this.cameraControls = null;
    this.isCameraActive = false;
    this.activeCameraId = undefined;
    this.videoDevices = [];

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.setupGlobalPaste();
    this.updateUI();
  }

  cacheDOM() {
    // Upload & States
    this.uploadState = document.getElementById("scanner-upload-state");
    this.previewState = document.getElementById("scanner-preview-state");
    this.dropzone = document.getElementById("scanner-dropzone");
    this.fileInput = document.getElementById("scanner-file-input");
    this.selectFileBtn = document.getElementById("scanner-select-file-btn");
    this.pasteBtn = document.getElementById("paste-clipboard-btn");
    this.clearImageBtn = document.getElementById("clear-image-btn");

    // Preview details
    this.imagePreview = document.getElementById("image-preview");
    this.metaFilename = document.getElementById("img-meta-filename");
    this.metaSize = document.getElementById("img-meta-size");
    this.metaDimensions = document.getElementById("img-meta-dimensions");
    this.warningCard = document.getElementById("scanner-warning-card");

    // Primary Buttons
    this.scanActionBtn = document.getElementById("scan-action-btn");
    this.scanBtnSpinner = document.getElementById("scan-btn-spinner");
    this.scanBtnIcon = document.getElementById("scan-btn-icon");
    this.scanBtnText = document.getElementById("scan-btn-text");
    this.scanAnotherBtn = document.getElementById("scan-another-btn");

    // Camera
    this.startCameraBtn = document.getElementById("start-camera-btn");
    this.stopCameraBtn = document.getElementById("stop-camera-btn");
    this.cameraSelect = document.getElementById("camera-select");
    this.cameraContainer = document.getElementById(
      "camera-viewfinder-container",
    );
    this.cameraVideo = document.getElementById("camera-video");

    // Results Panel
    this.resultsPanel = document.getElementById("scanner-results-panel");
    this.emptyState = document.getElementById("scanner-empty-state");
    this.resultText = document.getElementById("scanner-result-text");
    this.resultCharCount = document.getElementById(
      "scanner-result-char-count",
    );
    this.resultTypeBadge = document.getElementById(
      "scanner-result-type-badge",
    );

    // Action Buttons
    this.copyBtn = document.getElementById("copy-result-btn");
    this.openUrlBtn = document.getElementById("open-url-btn");
    this.callBtn = document.getElementById("call-btn");
    this.emailBtn = document.getElementById("email-btn");
    this.smsBtn = document.getElementById("sms-btn");
    this.whatsappBtn = document.getElementById("whatsapp-btn");
    this.mapsBtn = document.getElementById("maps-btn");
    this.generateQrBtn = document.getElementById("generate-qr-again-btn");
    this.downloadTxtBtn = document.getElementById("download-txt-btn");
    this.downloadVcfBtn = document.getElementById("download-vcf-btn");
    this.downloadIcsBtn = document.getElementById("download-ics-btn");
    this.scanAgainBtn = document.getElementById("scan-again-btn"); // In sidebar

    // Wi-Fi Card
    this.wifiDetailsCard = document.getElementById("wifi-details-card");
    this.wifiSsid = document.getElementById("wifi-ssid");
    this.wifiPassword = document.getElementById("wifi-password");
    this.wifiEncryption = document.getElementById("wifi-encryption");
    this.copyWifiPassBtn = document.getElementById("copy-wifi-pass-btn");

    // vCard Card
    this.vcardDetailsCard = document.getElementById("vcard-details-card");
    this.vcardName = document.getElementById("vcard-name");
    this.vcardPhone = document.getElementById("vcard-phone");
    this.vcardEmail = document.getElementById("vcard-email");
    this.vcardOrg = document.getElementById("vcard-org");

    // Universal Tool Page Template: the results sidebar is only revealed
    // once the workspace's progressive-disclosure state is "has-file"
    // (see WorkspaceProgressiveController in script.js). Since the scanner
    // uses its own bespoke upload/camera UI instead of the generic
    // [data-file-uploader] component, we drive that same state machine
    // directly so the template's layout/visibility rules apply correctly.
    this.workspaceEl = document.getElementById("landing-workspace");
  }

  setWorkspaceHasFile() {
    if (this.workspaceEl)
      this.workspaceEl.setAttribute("data-workspace-state", "has-file");
  }

  setWorkspaceEmpty() {
    if (this.workspaceEl)
      this.workspaceEl.setAttribute("data-workspace-state", "empty");
  }

  bindEvents() {
    // Upload Events
    if (this.selectFileBtn)
      this.selectFileBtn.addEventListener("click", () =>
        this.fileInput?.click(),
      );
    if (this.dropzone) {
      this.dropzone.addEventListener("click", (e) => {
        if (e.target.closest("button")) return; // let buttons handle themselves
        this.fileInput?.click();
      });
    }
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (this.dropzone) {
      ["dragenter", "dragover"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("dropzone--active");
        });
      });
      ["dragleave", "dragend"].forEach((evt) => {
        this.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("dropzone--active");
        });
      });
      this.dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzone.classList.remove("dropzone--active");
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.pasteBtn)
      this.pasteBtn.addEventListener("click", () => this.handlePasteButton());
    if (this.clearImageBtn)
      this.clearImageBtn.addEventListener("click", () => this.resetState());

    // Main Scan Action (manual trigger / re-scan)
    if (this.scanActionBtn)
      this.scanActionBtn.addEventListener("click", () =>
        this.executeScan(true),
      );
    if (this.scanAnotherBtn)
      this.scanAnotherBtn.addEventListener("click", () => this.resetState());
    if (this.scanAgainBtn)
      this.scanAgainBtn.addEventListener("click", () => this.resetState());

    // Camera Events
    if (this.startCameraBtn)
      this.startCameraBtn.addEventListener("click", () => this.startCamera());
    if (this.stopCameraBtn)
      this.stopCameraBtn.addEventListener("click", () => this.stopCamera());
    if (this.cameraSelect) {
      this.cameraSelect.addEventListener("change", (e) => {
        this.activeCameraId = e.target.value;
        if (this.isCameraActive) {
          this.startCamera(); // Restart with new device
        }
      });
    }

    // Result Action Events
    if (this.copyBtn)
      this.copyBtn.addEventListener("click", () =>
        this.copyResultToClipboard(),
      );
    if (this.openUrlBtn)
      this.openUrlBtn.addEventListener("click", () => this.openResultUrl());
    if (this.downloadTxtBtn)
      this.downloadTxtBtn.addEventListener("click", () =>
        this.downloadResultAs("txt"),
      );
    if (this.downloadVcfBtn)
      this.downloadVcfBtn.addEventListener("click", () =>
        this.downloadResultAs("vcf"),
      );
    if (this.downloadIcsBtn)
      this.downloadIcsBtn.addEventListener("click", () =>
        this.downloadCalendarIcs(),
      );
    if (this.copyWifiPassBtn) {
      this.copyWifiPassBtn.addEventListener("click", () => {
        if (this.wifiPassword && this.wifiPassword.textContent !== "-") {
          navigator.clipboard
            .writeText(this.wifiPassword.textContent)
            .then(() => this.toast("Wi-Fi password copied!", "success"));
        }
      });
    }
  }

  setupGlobalPaste() {
    window.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            this.handleFileSelected(file);
            break;
          }
        }
      }
    });
  }

  async handlePasteButton() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      this.toast("Press Ctrl+V / Cmd+V to paste an image.", "info");
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-image.png", {
            type: imageType,
          });
          this.handleFileSelected(file);
          return;
        }
      }
      this.toast("No image found in clipboard.", "warning");
    } catch (err) {
      this.toast("Press Ctrl+V / Cmd+V to paste an image.", "info");
    }
  }

  // --- STATE CONTROLLER ---------------------------------------------------
  setState(newState) {
    this.state = newState;
    this.updateUI();
  }

  resetState() {
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;
    if (this.fileInput) this.fileInput.value = "";

    // Stop camera if running
    this.stopCamera();

    this.setWorkspaceEmpty();
    this.setState(ScannerState.IDLE);
  }

  updateUI() {
    switch (this.state) {
      case ScannerState.IDLE:
        this.toggleElement(this.uploadState, true);
        this.toggleElement(this.previewState, false);
        this.toggleElement(this.warningCard, false);
        this.toggleElement(this.scanActionBtn, true);
        this.toggleElement(this.scanAnotherBtn, false);
        this.setScanButtonMode("ready");
        this.hideResultPanel();
        break;

      case ScannerState.READY_TO_SCAN:
        this.toggleElement(this.uploadState, false);
        this.toggleElement(this.previewState, true);
        this.toggleElement(this.warningCard, false);
        this.toggleElement(this.scanActionBtn, true);
        this.toggleElement(this.scanAnotherBtn, false);
        this.setScanButtonMode("ready");
        this.hideResultPanel();
        break;

      case ScannerState.SCANNING:
        this.toggleElement(this.warningCard, false);
        this.setScanButtonMode("scanning");
        break;

      case ScannerState.SUCCESS:
        this.toggleElement(this.scanActionBtn, false);
        this.toggleElement(this.scanAnotherBtn, true);
        this.toggleElement(this.warningCard, false);
        this.renderResultPanel();
        break;

      case ScannerState.FAILED:
        this.toggleElement(this.scanActionBtn, true);
        this.toggleElement(this.scanAnotherBtn, false);
        this.toggleElement(this.warningCard, true);
        this.setScanButtonMode("ready");
        this.hideResultPanel();
        break;
    }
  }

  // --- IMAGE HANDLING -------------------------------------------------
  async handleFileSelected(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      this.toast("Please provide a valid image file.", "error");
      return;
    }

    // Stop camera if running — image & camera modes are mutually exclusive
    this.stopCamera();

    this.selectedFile = file;
    this.selectedDataUrl = await this.fileToDataUrl(file);

    // Render Preview
    if (this.imagePreview) {
      this.imagePreview.src = this.selectedDataUrl;
    }
    if (this.metaFilename)
      this.metaFilename.innerHTML = `<strong>File:</strong> ${this.escapeHtml(file.name)}`;
    if (this.metaSize)
      this.metaSize.innerHTML = `<strong>Size:</strong> ${this.formatFileSize(file.size)}`;

    // Get dimensions
    try {
      const img = await this.loadImage(this.selectedDataUrl);
      if (this.metaDimensions) {
        this.metaDimensions.innerHTML = `<strong>Dimensions:</strong> ${img.naturalWidth} × ${img.naturalHeight} px`;
      }
    } catch (e) {
      /* non-fatal */
    }

    this.setWorkspaceHasFile();
    this.setState(ScannerState.READY_TO_SCAN);

    // Automatic QR Detection: immediately attempt a scan once the image
    // is ready. The manual "Scan QR Code" button remains available for a
    // deliberate re-attempt at any time.
    this.executeScan(false);
  }

  // --- SCAN ENGINE ---------------------------------------------------
  async executeScan(isManualTrigger) {
    if (
      this.state !== ScannerState.READY_TO_SCAN &&
      this.state !== ScannerState.FAILED
    )
      return;
    if (!this.selectedDataUrl || !this.imagePreview) return;

    this.setState(ScannerState.SCANNING);

    try {
      // Let the "Scanning..." UI paint before the (synchronous-ish) decode work
      await new Promise((resolve) => setTimeout(resolve, 40));

      const result = await this.decodeImage(this.imagePreview);

      if (result && result.getText()) {
        this.decodedResult = result.getText();
        this.toast("QR Code decoded successfully!", "success");
        this.setState(ScannerState.SUCCESS);
      } else {
        throw new Error("No QR code detected");
      }
    } catch (err) {
      this.setState(ScannerState.FAILED);
      if (isManualTrigger) {
        this.toast("No QR code could be detected in this image.", "error");
      }
    }
  }

  /**
   * Attempts to decode a QR code from an <img> element using multiple
   * strategies for maximum real-world reliability (small codes inside large
   * photos, low-contrast prints, slightly rotated scans, etc.).
   */
  async decodeImage(imgEl) {
    // Pass 1 — direct decode at native resolution (fast path, handles the
    // vast majority of clean uploads/screenshots).
    try {
      const result = await this.reader.decodeFromImageElement(imgEl);
      if (result) return result;
    } catch (e) {
      if (!this.isDecodeMiss(e)) throw e;
    }

    const img = await this.loadImage(imgEl.src);
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    if (!naturalW || !naturalH) return null;

    // Pass 2 — upscale small images (helps tiny/low-res QR codes resolve
    // enough contrast for the binarizer).
    if (naturalW < 700 || naturalH < 700) {
      try {
        const scale = Math.min(4, 900 / Math.max(naturalW, naturalH));
        const canvas = this.drawToCanvas(img, naturalW * scale, naturalH * scale);
        const result = this.reader.decodeFromCanvas(canvas);
        if (result) return result;
      } catch (e) {
        if (!this.isDecodeMiss(e)) throw e;
      }
    }

    // Pass 3 — center-crop & zoom in, in case the QR code occupies only a
    // small region of a much larger photograph.
    try {
      const cropSize = Math.min(naturalW, naturalH);
      const canvas = document.createElement("canvas");
      const targetSize = Math.max(cropSize, 800);
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const sx = (naturalW - cropSize) / 2;
      const sy = (naturalH - cropSize) / 2;
      ctx.drawImage(
        img,
        sx,
        sy,
        cropSize,
        cropSize,
        0,
        0,
        targetSize,
        targetSize,
      );
      const result = this.reader.decodeFromCanvas(canvas);
      if (result) return result;
    } catch (e) {
      if (!this.isDecodeMiss(e)) throw e;
    }

    return null;
  }

  isDecodeMiss(err) {
    return (
      err instanceof NotFoundException ||
      err instanceof ChecksumException ||
      err instanceof FormatException ||
      (err && /not found/i.test(err.message || ""))
    );
  }

  drawToCanvas(img, w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // --- CAMERA HANDLING -------------------------------------------------
  async startCamera() {
    // Stop any existing stream and clear image mode — camera & image
    // workflows are mutually exclusive on this page.
    this.stopCamera();
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;
    if (this.fileInput) this.fileInput.value = "";
    this.setState(ScannerState.IDLE);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.toast("Camera access is not supported in this browser.", "error");
      return;
    }

    if (this.cameraContainer) this.cameraContainer.style.display = "block";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "none";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "inline-flex";
    this.setWorkspaceHasFile();

    try {
      this.isCameraActive = true;

      // Kick off the stream immediately using the preferred device (or the
      // rear/environment camera by default on mobile when none is chosen
      // yet), then populate the device picker in the background.
      this.cameraControls = await this.reader.decodeFromVideoDevice(
        this.activeCameraId,
        this.cameraVideo,
        (result, err) => {
          if (result && this.isCameraActive) {
            this.decodedResult = result.getText();
            this.toast("QR Code detected via camera!", "success");
            this.stopCamera();
            this.setState(ScannerState.SUCCESS);
            return;
          }
          if (err && !this.isDecodeMiss(err)) {
            // Non-fatal per-frame decode error; ignore and keep scanning.
          }
        },
      );

      this.populateCameraDevices();
    } catch (err) {
      console.error("Camera startup error:", err);
      this.stopCamera();
      this.setWorkspaceEmpty();
      if (err && err.name === "NotAllowedError") {
        this.toast(
          "Camera permission denied. Please allow camera access.",
          "error",
        );
      } else if (err && err.name === "NotFoundError") {
        this.toast("No camera device was found on this device.", "error");
      } else {
        this.toast("Could not start camera. Check permissions.", "error");
      }
    }
  }

  async populateCameraDevices() {
    try {
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      this.videoDevices = devices || [];

      if (this.cameraSelect && this.videoDevices.length > 1) {
        this.cameraSelect.style.display = "inline-block";
        this.cameraSelect.innerHTML = "";
        this.videoDevices.forEach((d, i) => {
          const opt = document.createElement("option");
          opt.value = d.deviceId;
          opt.text = d.label || `Camera ${i + 1}`;
          this.cameraSelect.appendChild(opt);
        });
        if (this.activeCameraId) {
          this.cameraSelect.value = this.activeCameraId;
        }
      }
    } catch (e) {
      /* device enumeration is best-effort */
    }
  }

  stopCamera() {
    this.isCameraActive = false;
    if (this.cameraControls) {
      try {
        this.cameraControls.stop();
      } catch (e) {
        /* ignore */
      }
      this.cameraControls = null;
    }

    if (this.cameraContainer) this.cameraContainer.style.display = "none";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "inline-flex";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "none";
  }

  // --- RESULTS UI -------------------------------------------------------
  hideResultPanel() {
    if (this.resultsPanel) this.resultsPanel.style.display = "none";
    if (this.emptyState) this.emptyState.style.display = "block";
    if (this.resultTypeBadge)
      this.resultTypeBadge.textContent = "Awaiting Code";
  }

  renderResultPanel() {
    if (!this.decodedResult) return;

    if (this.emptyState) this.emptyState.style.display = "none";
    if (this.resultsPanel) this.resultsPanel.style.display = "block";

    if (this.resultText) this.resultText.value = this.decodedResult;
    if (this.resultCharCount)
      this.resultCharCount.textContent = `${this.decodedResult.length} chars`;

    const parsedData = this.parseQrData(this.decodedResult);
    this.currentParsedData = parsedData;

    if (this.resultTypeBadge) this.resultTypeBadge.textContent = parsedData.label;

    // Reset action buttons visibility
    const actionEls = [
      this.openUrlBtn,
      this.callBtn,
      this.emailBtn,
      this.smsBtn,
      this.whatsappBtn,
      this.mapsBtn,
      this.wifiDetailsCard,
      this.vcardDetailsCard,
      this.downloadVcfBtn,
      this.downloadIcsBtn,
    ];
    actionEls.forEach((el) => this.toggleElement(el, false));

    // Display context-specific buttons
    if (parsedData.isUrl) {
      this.toggleElement(this.openUrlBtn, true, "inline-flex");
    }

    if (parsedData.phone && this.callBtn) {
      this.callBtn.href = `tel:${parsedData.phone}`;
      this.toggleElement(this.callBtn, true, "inline-flex");
    }
    if (parsedData.email && this.emailBtn) {
      this.emailBtn.href = parsedData.mailtoUrl || `mailto:${parsedData.email}`;
      this.toggleElement(this.emailBtn, true, "inline-flex");
    }

    if (parsedData.type === "SMS" && this.smsBtn) {
      this.smsBtn.href = parsedData.actionUrl;
      this.toggleElement(this.smsBtn, true, "inline-flex");
    } else if (parsedData.type === "WHATSAPP" && this.whatsappBtn) {
      this.whatsappBtn.href = parsedData.actionUrl;
      this.toggleElement(this.whatsappBtn, true, "inline-flex");
    } else if (parsedData.type === "LOCATION" && this.mapsBtn) {
      this.mapsBtn.href = parsedData.actionUrl;
      this.toggleElement(this.mapsBtn, true, "inline-flex");
    } else if (parsedData.type === "WIFI" && this.wifiDetailsCard) {
      this.toggleElement(this.wifiDetailsCard, true, "block");
      if (this.wifiSsid) this.wifiSsid.textContent = parsedData.ssid || "-";
      if (this.wifiPassword)
        this.wifiPassword.textContent = parsedData.password || "-";
      if (this.wifiEncryption)
        this.wifiEncryption.textContent = parsedData.encryption || "-";
    } else if (
      (parsedData.type === "VCARD" || parsedData.type === "MECARD") &&
      this.vcardDetailsCard
    ) {
      this.toggleElement(this.vcardDetailsCard, true, "block");
      if (this.vcardName) this.vcardName.textContent = parsedData.name || "-";
      if (this.vcardPhone)
        this.vcardPhone.textContent = parsedData.phone || "-";
      if (this.vcardEmail)
        this.vcardEmail.textContent = parsedData.email || "-";
      if (this.vcardOrg) this.vcardOrg.textContent = parsedData.org || "-";
      this.toggleElement(this.downloadVcfBtn, true, "inline-flex");
    } else if (parsedData.type === "CALENDAR" && this.downloadIcsBtn) {
      this.toggleElement(this.downloadIcsBtn, true, "inline-flex");
    }

    if (this.generateQrBtn) {
      this.generateQrBtn.href = "/qr-generator.html";
    }
  }

  // --- QR PAYLOAD PARSER --------------------------------------------------
  parseQrData(text) {
    const str = (text || "").trim();

    // --- URL ---
    if (/^https?:\/\//i.test(str) || /^www\./i.test(str)) {
      const url = /^www\./i.test(str) ? `https://${str}` : str;
      // WhatsApp share links are URLs but deserve their own action
      if (/^https?:\/\/(api\.)?wa\.me\//i.test(str)) {
        return { type: "WHATSAPP", label: "WhatsApp", isUrl: true, actionUrl: str };
      }
      return { type: "URL", label: "Website Link", isUrl: true, actionUrl: url };
    }

    // --- WhatsApp deep link ---
    if (/^whatsapp:\/\//i.test(str)) {
      return { type: "WHATSAPP", label: "WhatsApp", actionUrl: str };
    }

    // --- SMS ---
    if (/^smsto:/i.test(str) || /^sms:/i.test(str)) {
      const rest = str.split(":").slice(1).join(":");
      const number = rest.split(":")[0].split("?")[0];
      return {
        type: "SMS",
        label: "SMS Message",
        phone: number,
        actionUrl: `sms:${number}`,
      };
    }

    // --- Phone ---
    if (/^tel:/i.test(str)) {
      const phone = str.replace(/^tel:/i, "").trim();
      return { type: "PHONE", label: "Phone Number", phone };
    }
    if (/^\+?[0-9][0-9\s-]{6,16}$/.test(str)) {
      return { type: "PHONE", label: "Phone Number", phone: str };
    }

    // --- Email ---
    if (/^mailto:/i.test(str)) {
      const raw = str.replace(/^mailto:/i, "");
      const email = raw.split("?")[0].trim();
      return { type: "EMAIL", label: "Email Address", email, mailtoUrl: str };
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      return {
        type: "EMAIL",
        label: "Email Address",
        email: str,
        mailtoUrl: `mailto:${str}`,
      };
    }

    // --- Geo / Maps location ---
    if (/^geo:/i.test(str)) {
      const coords = str.replace(/^geo:/i, "").split("?")[0];
      return {
        type: "LOCATION",
        label: "Location Coordinates",
        actionUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`,
      };
    }
    if (/google\.com\/maps|goo\.gl\/maps|maps\.apple\.com/i.test(str)) {
      return { type: "LOCATION", label: "Location Coordinates", actionUrl: str };
    }

    // --- Wi-Fi ---
    if (/^WIFI:/i.test(str)) {
      const unescape = (v) =>
        v ? v.replace(/\\;/g, ";").replace(/\\,/g, ",").replace(/\\:/g, ":") : v;
      const ssid = unescape(str.match(/S:((?:[^;\\]|\\.)*);/)?.[1]) || "Unknown";
      const pass = unescape(str.match(/P:((?:[^;\\]|\\.)*);/)?.[1]) || "";
      const enc = str.match(/T:([^;]*);/)?.[1] || "WPA";
      return {
        type: "WIFI",
        label: "Wi-Fi Network",
        ssid,
        password: pass || "None",
        encryption: enc || "None",
      };
    }

    // --- vCard ---
    if (/BEGIN:VCARD/i.test(str)) {
      return this.parseVCard(str);
    }

    // --- MeCard (common alternative contact-card format) ---
    if (/^MECARD:/i.test(str)) {
      return this.parseMeCard(str);
    }

    // --- Calendar event ---
    if (/BEGIN:VEVENT/i.test(str)) {
      const summary = str.match(/SUMMARY:([^\r\n]+)/i)?.[1] || "Event";
      const location = str.match(/LOCATION:([^\r\n]+)/i)?.[1] || "";
      return {
        type: "CALENDAR",
        label: "Calendar Event",
        eventTitle: summary,
        eventLocation: location,
      };
    }

    // --- Plain text fallback ---
    return { type: "TEXT", label: "Plain Text" };
  }

  parseVCard(str) {
    const lines = str.split(/\r\n|\r|\n/);
    let name = "";
    let phone = "";
    let email = "";
    let org = "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).toUpperCase();
      const value = line.slice(colonIdx + 1).trim();

      if (key.startsWith("FN")) {
        name = value;
      } else if (key.startsWith("N") && !name) {
        // N:LastName;FirstName;...
        name = value
          .split(";")
          .filter(Boolean)
          .reverse()
          .join(" ")
          .trim();
      } else if (key.startsWith("TEL") && !phone) {
        phone = value;
      } else if (key.startsWith("EMAIL") && !email) {
        email = value;
      } else if (key.startsWith("ORG") && !org) {
        org = value.replace(/;/g, " ").trim();
      }
    }

    return {
      type: "VCARD",
      label: "vCard Contact",
      name: name || "Unknown",
      phone,
      email,
      org,
      mailtoUrl: email ? `mailto:${email}` : undefined,
    };
  }

  parseMeCard(str) {
    const body = str.replace(/^MECARD:/i, "");
    const get = (key) => body.match(new RegExp(`${key}:([^;]*);`, "i"))?.[1];
    const nRaw = get("N") || "";
    const name = nRaw.split(",").filter(Boolean).join(" ").trim();
    return {
      type: "MECARD",
      label: "Contact Card",
      name: name || "Unknown",
      phone: get("TEL") || "",
      email: get("EMAIL") || "",
      org: get("ORG") || "",
      mailtoUrl: get("EMAIL") ? `mailto:${get("EMAIL")}` : undefined,
    };
  }

  // --- ACTIONS -------------------------------------------------------
  async copyResultToClipboard() {
    if (!this.decodedResult) return;
    try {
      await navigator.clipboard.writeText(this.decodedResult);
      this.toast("Copied result to clipboard!", "success");
    } catch {
      this.toast("Failed to copy", "error");
    }
  }

  openResultUrl() {
    if (!this.decodedResult) return;
    const parsed = this.currentParsedData || this.parseQrData(this.decodedResult);
    if (parsed.isUrl && parsed.actionUrl) {
      window.open(parsed.actionUrl, "_blank", "noopener,noreferrer");
    }
  }

  downloadResultAs(ext) {
    if (!this.decodedResult) return;
    const mime =
      ext === "vcf" ? "text/vcard;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([this.decodedResult], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `qr-decoded-result.${ext}`;
    a.download =
      window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename
        ? window.ComprexaUtils.sanitizeFilename(filename)
        : filename.replace(/[^a-zA-Z0-9_\-.]/g, "_");
    a.click();
    URL.revokeObjectURL(url);
    this.toast(
      ext === "vcf" ? "Contact saved as .vcf" : "Result downloaded as TXT",
      "success",
    );
  }

  downloadCalendarIcs() {
    if (!this.decodedResult) return;
    let content = this.decodedResult;
    if (!/BEGIN:VCALENDAR/i.test(content)) {
      content = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${content}\r\nEND:VCALENDAR`;
    }
    const blob = new Blob([content], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-calendar-event.ics";
    a.click();
    URL.revokeObjectURL(url);
    this.toast("Event saved as .ics", "success");
  }

  // --- UTILS -------------------------------------------------------
  toggleElement(el, show, displayStyle = "block") {
    if (el) el.style.display = show ? displayStyle : "none";
  }

  setScanButtonMode(mode) {
    if (!this.scanActionBtn) return;
    if (mode === "scanning") {
      this.scanActionBtn.disabled = true;
      this.toggleElement(this.scanBtnSpinner, true, "inline-block");
      this.toggleElement(this.scanBtnIcon, false);
      if (this.scanBtnText) this.scanBtnText.textContent = "Scanning...";
    } else {
      this.scanActionBtn.disabled = false;
      this.toggleElement(this.scanBtnSpinner, false);
      this.toggleElement(this.scanBtnIcon, true, "inline-block");
      if (this.scanBtnText) this.scanBtnText.textContent = "Scan QR Code";
    }
  }

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  toast(msg, type = "info") {
    if (window.ComprexaToast && typeof window.ComprexaToast[type] === "function") {
      window.ComprexaToast[type](msg);
      return;
    }
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      window.ComprexaFramework.showToast(msg, type);
    }
  }
}

// Start App Engine
new QrScannerApp();
