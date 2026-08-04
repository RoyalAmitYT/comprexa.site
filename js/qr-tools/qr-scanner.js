// @ts-nocheck
/**
 * Comprexa QR Code Scanner Engine (Rewritten)
 * Enterprise-grade 100% Client-Side QR Scanner.
 * Architecture: State Machine + UI Controller + Scanner Engine.
 */

import {
  BrowserQRCodeReader,
  MultiFormatReader,
  RGBLuminanceSource,
  HybridBinarizer,
  BinaryBitmap,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

// --- STATE MACHINE ---
const ScannerState = {
  IDLE: "IDLE",
  IMAGE_SELECTED: "IMAGE_SELECTED",
  READY_TO_SCAN: "READY_TO_SCAN",
  SCANNING: "SCANNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

class QrScannerApp {
  constructor() {
    // Current application state
    this.state = ScannerState.IDLE;

    // Decoders
    this.zxingBrowserReader = new BrowserQRCodeReader();
    this.zxingMultiReader = new MultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.zxingMultiReader.setHints(hints);

    // Active Data
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;

    // Camera Data
    this.isCameraActive = false;
    this.activeCameraId = null;

    // Wait for DOM
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
    this.resultCharCount = document.getElementById("scanner-result-char-count");
    this.resultTypeBadge = document.getElementById("scanner-result-type-badge");

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
    this.scanAgainBtn = document.getElementById("scan-again-btn"); // In sidebar

    // WiFi Card
    this.wifiDetailsCard = document.getElementById("wifi-details-card");
    this.wifiSsid = document.getElementById("wifi-ssid");
    this.wifiPassword = document.getElementById("wifi-password");
    this.wifiEncryption = document.getElementById("wifi-encryption");
    this.copyWifiPassBtn = document.getElementById("copy-wifi-pass-btn");
  }

  bindEvents() {
    // Upload Events
    if (this.selectFileBtn)
      this.selectFileBtn.addEventListener("click", () =>
        this.fileInput?.click(),
      );
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (this.dropzone) {
      this.dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.dropzone.classList.add("dropzone--active");
      });
      this.dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        this.dropzone.classList.remove("dropzone--active");
      });
      this.dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        this.dropzone.classList.remove("dropzone--active");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.pasteBtn)
      this.pasteBtn.addEventListener("click", () => this.handlePaste());
    if (this.clearImageBtn)
      this.clearImageBtn.addEventListener("click", () => this.resetState());

    // Main Scan Action
    if (this.scanActionBtn)
      this.scanActionBtn.addEventListener("click", () => this.executeScan());
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
        this.downloadResultTxt(),
      );
    if (this.copyWifiPassBtn) {
      this.copyWifiPassBtn.addEventListener("click", () => {
        if (this.wifiPassword && this.wifiPassword.textContent !== "-") {
          navigator.clipboard
            .writeText(this.wifiPassword.textContent)
            .then(() => {
              this.toast("Wi-Fi password copied!", "success");
            });
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

  async handlePaste() {
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

  // --- STATE CONTROLLER ---
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

      case ScannerState.IMAGE_SELECTED:
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

  // --- IMAGE HANDLING ---
  async handleFileSelected(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.toast("Please provide a valid image file.", "error");
      return;
    }

    // Stop camera if running
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
    } catch (e) {}

    this.setState(ScannerState.READY_TO_SCAN);
  }

  // --- SCAN ENGINE ---
  async executeScan() {
    if (
      this.state !== ScannerState.READY_TO_SCAN &&
      this.state !== ScannerState.FAILED
    )
      return;
    if (!this.selectedDataUrl) return;

    this.setState(ScannerState.SCANNING);

    try {
      // Allow UI to render scanning state
      await new Promise((resolve) => setTimeout(resolve, 50));

      const result = await this.decodeImageElement(this.imagePreview);

      if (result && result.getText()) {
        this.decodedResult = result.getText();
        this.toast("QR Code decoded successfully!", "success");
        this.setState(ScannerState.SUCCESS);
      } else {
        throw new Error("No QR detected");
      }
    } catch (err) {
      this.setState(ScannerState.FAILED);
    }
  }

  async decodeImageElement(imgEl) {
    // Pass 1: BrowserQRCodeReader directly on image element
    try {
      const result =
        await this.zxingBrowserReader.decodeFromImageElement(imgEl);
      if (result) return result;
    } catch (e) {
      // Continue to next pass
    }

    // Pass 2: Canvas based robust scanning
    try {
      const img = await this.loadImage(imgEl.src);
      const canvas = document.createElement("canvas");
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);

        const luminanceSource = new RGBLuminanceSource(imgData.data, w, h);
        const binarizer = new HybridBinarizer(luminanceSource);
        const binaryBitmap = new BinaryBitmap(binarizer);

        const result = this.zxingMultiReader.decode(binaryBitmap);
        if (result) return result;
      }
    } catch (e) {
      // Continue
    }

    return null;
  }

  // --- CAMERA HANDLING ---
  async startCamera() {
    this.stopCamera(); // Clean up existing
    this.resetState(); // Clear image states

    if (this.cameraContainer) this.cameraContainer.style.display = "block";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "none";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "inline-flex";

    try {
      const devices = await this.zxingBrowserReader.listVideoInputDevices();

      if (devices.length === 0) {
        throw new Error("No camera found");
      }

      if (this.cameraSelect && devices.length > 1) {
        this.cameraSelect.style.display = "inline-block";
        if (this.cameraSelect.options.length === 0) {
          devices.forEach((d) => {
            const opt = document.createElement("option");
            opt.value = d.deviceId;
            opt.text =
              d.label || `Camera ${this.cameraSelect.options.length + 1}`;
            this.cameraSelect.appendChild(opt);
          });
        }
      }

      const deviceId = this.activeCameraId || devices[0].deviceId;
      this.isCameraActive = true;

      this.zxingBrowserReader.decodeFromVideoDevice(
        deviceId,
        this.cameraVideo,
        (result, err) => {
          if (result && this.isCameraActive) {
            // Success!
            this.decodedResult = result.getText();
            this.toast("QR Code detected via camera!", "success");
            this.stopCamera();
            this.setState(ScannerState.SUCCESS);
          }
        },
      );
    } catch (err) {
      console.error("Camera startup error:", err);
      this.stopCamera();
      this.toast("Could not start camera. Check permissions.", "error");
    }
  }

  stopCamera() {
    this.isCameraActive = false;
    try {
      this.zxingBrowserReader.reset();
    } catch (e) {}

    if (this.cameraContainer) this.cameraContainer.style.display = "none";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "inline-flex";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "none";
  }

  // --- RESULTS UI ---
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

    if (this.resultTypeBadge)
      this.resultTypeBadge.textContent = parsedData.label;

    // Reset action buttons visibility
    const actionBtns = [
      this.openUrlBtn,
      this.callBtn,
      this.emailBtn,
      this.smsBtn,
      this.whatsappBtn,
      this.mapsBtn,
      this.wifiDetailsCard,
    ];
    actionBtns.forEach((btn) => this.toggleElement(btn, false));

    // Display context specific buttons
    if (parsedData.isUrl) {
      this.toggleElement(this.openUrlBtn, true, "inline-flex");
    } else if (parsedData.type === "PHONE" && this.callBtn) {
      this.callBtn.href = parsedData.actionUrl;
      this.toggleElement(this.callBtn, true, "inline-flex");
    } else if (parsedData.type === "EMAIL" && this.emailBtn) {
      this.emailBtn.href = parsedData.actionUrl;
      this.toggleElement(this.emailBtn, true, "inline-flex");
    } else if (parsedData.type === "SMS" && this.smsBtn) {
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
      if (this.wifiSsid) this.wifiSsid.textContent = parsedData.ssid;
      if (this.wifiPassword)
        this.wifiPassword.textContent = parsedData.password;
      if (this.wifiEncryption)
        this.wifiEncryption.textContent = parsedData.encryption;
    }

    if (this.generateQrBtn) {
      this.generateQrBtn.href = `/?text=${encodeURIComponent(this.decodedResult)}`;
    }
  }

  parseQrData(text) {
    const str = text.trim();

    if (/^https?:\/\//i.test(str) || /^www\./i.test(str)) {
      const url = /^www\./i.test(str) ? `https://${str}` : str;
      return {
        type: "URL",
        label: "Website Link",
        isUrl: true,
        actionUrl: url,
      };
    }

    if (/^tel:/i.test(str) || /^\+?[0-9\s-]{7,15}$/.test(str)) {
      const phone = str.replace(/^tel:/i, "").trim();
      return {
        type: "PHONE",
        label: "Phone Number",
        actionUrl: `tel:${phone}`,
      };
    }

    if (/^mailto:/i.test(str) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      const email = str
        .replace(/^mailto:/i, "")
        .split("?")[0]
        .trim();
      return {
        type: "EMAIL",
        label: "Email Address",
        actionUrl: str.startsWith("mailto:") ? str : `mailto:${email}`,
      };
    }

    if (/^smsto:/i.test(str) || /^sms:/i.test(str)) {
      const number = str.split(":")[1] || "";
      return { type: "SMS", label: "SMS Message", actionUrl: `sms:${number}` };
    }

    if (/^https:\/\/wa\.me\//i.test(str) || /^whatsapp:\/\//i.test(str)) {
      return { type: "WHATSAPP", label: "WhatsApp", actionUrl: str };
    }

    if (/^geo:/i.test(str) || /google\.com\/maps/i.test(str)) {
      const url = /^geo:/i.test(str)
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str.replace(/^geo:/i, ""))}`
        : str;
      return {
        type: "LOCATION",
        label: "Location Coordinates",
        actionUrl: url,
      };
    }

    if (/^WIFI:/i.test(str)) {
      const ssid = str.match(/S:([^;]+)/)?.[1] || "Unknown";
      const pass = str.match(/P:([^;]+)/)?.[1] || "None";
      const enc = str.match(/T:([^;]+)/)?.[1] || "WPA";
      return {
        type: "WIFI",
        label: "Wi-Fi Network",
        ssid,
        password: pass,
        encryption: enc,
      };
    }

    if (/BEGIN:VCARD/i.test(str))
      return { type: "VCARD", label: "vCard Contact" };
    if (/BEGIN:VEVENT/i.test(str))
      return { type: "CALENDAR", label: "Calendar Event" };

    return { type: "TEXT", label: "Plain Text" };
  }

  // --- ACTIONS ---
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
    const parsed = this.parseQrData(this.decodedResult);
    if (parsed.isUrl && parsed.actionUrl) {
      window.open(parsed.actionUrl, "_blank", "noopener,noreferrer");
    }
  }

  downloadResultTxt() {
    if (!this.decodedResult) return;
    const blob = new Blob([this.decodedResult], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename("qr-decoded-result.txt") : String("qr-decoded-result.txt").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    a.click();
    URL.revokeObjectURL(url);
    this.toast("Result downloaded as TXT", "success");
  }

  // --- UTILS ---
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
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      window.ComprexaFramework.showToast(msg, type);
    } else {
    }
  }
}

// Start App Engine
new QrScannerApp();
