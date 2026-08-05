// @ts-nocheck
/**
 * Comprexa QR Code Scanner Engine
 * Enterprise-grade 100% Client-Side QR Scanner.
 * Architecture: State Machine + UI Controller + Scanner Engine using html5-qrcode.
 */

import { Html5Qrcode } from "html5-qrcode";

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
    this.state = ScannerState.IDLE;
    
    this.html5Qrcode = null;

    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;

    this.isCameraActive = false;
    this.activeCameraId = null;

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
    
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.isCameraActive && this.html5Qrcode && this.html5Qrcode.getState() === 2) {
          this.html5Qrcode.pause();
        }
      } else {
        if (this.isCameraActive && this.html5Qrcode && this.html5Qrcode.getState() === 3) {
          this.html5Qrcode.resume();
        }
      }
    });

    window.addEventListener("beforeunload", () => {
      this.stopCamera();
    });
  }

  cacheDOM() {
    this.uploadState = document.getElementById("scanner-upload-state");
    this.previewState = document.getElementById("scanner-preview-state");
    this.dropzone = document.getElementById("scanner-dropzone");
    this.fileInput = document.getElementById("scanner-file-input");
    this.selectFileBtn = document.getElementById("scanner-select-file-btn");
    this.pasteBtn = document.getElementById("paste-clipboard-btn");
    this.clearImageBtn = document.getElementById("clear-image-btn");

    this.imagePreview = document.getElementById("image-preview");
    this.metaFilename = document.getElementById("img-meta-filename");
    this.metaSize = document.getElementById("img-meta-size");
    this.metaDimensions = document.getElementById("img-meta-dimensions");
    this.warningCard = document.getElementById("scanner-warning-card");

    this.scanActionBtn = document.getElementById("scan-action-btn");
    this.scanBtnSpinner = document.getElementById("scan-btn-spinner");
    this.scanBtnIcon = document.getElementById("scan-btn-icon");
    this.scanBtnText = document.getElementById("scan-btn-text");
    this.scanAnotherBtn = document.getElementById("scan-another-btn");

    this.startCameraBtn = document.getElementById("start-camera-btn");
    this.stopCameraBtn = document.getElementById("stop-camera-btn");
    this.cameraSelect = document.getElementById("camera-select");
    this.cameraContainer = document.getElementById("camera-viewfinder-container");

    // Sidebar Result elements
    this.resultsPanel = document.getElementById("scanner-results-panel");
    this.emptyState = document.getElementById("scanner-empty-state");
    this.resultText = document.getElementById("scanner-result-text");
    this.resultCharCount = document.getElementById("scanner-result-char-count");
    this.resultTypeBadge = document.getElementById("scanner-result-type-badge");

    this.copyBtn = document.getElementById("copy-result-btn");
    this.shareBtn = document.getElementById("share-result-btn");
    this.openUrlBtn = document.getElementById("open-url-btn");
    this.callBtn = document.getElementById("call-btn");
    this.emailBtn = document.getElementById("email-btn");
    this.smsBtn = document.getElementById("sms-btn");
    this.whatsappBtn = document.getElementById("whatsapp-btn");
    this.mapsBtn = document.getElementById("maps-btn");
    this.generateQrBtn = document.getElementById("generate-qr-again-btn");
    this.downloadTxtBtn = document.getElementById("download-txt-btn");
    this.scanAgainBtn = document.getElementById("scan-again-btn"); 

    this.wifiDetailsCard = document.getElementById("wifi-details-card");
    this.wifiSsid = document.getElementById("wifi-ssid");
    this.wifiPassword = document.getElementById("wifi-password");
    this.wifiEncryption = document.getElementById("wifi-encryption");
    this.copyWifiPassBtn = document.getElementById("copy-wifi-pass-btn");

    // DEDICATED MAIN RESULT CARD ELEMENTS
    this.mainDecodedResultCard = document.getElementById("main-decoded-result-card");
    this.decodedResultMeta = document.getElementById("decoded-result-meta");
    this.decodedTypeBadge = document.getElementById("decoded-type-badge");
    this.decodedCharCount = document.getElementById("decoded-char-count");
    
    this.decodedTextBox = document.getElementById("decoded-text-box");
    this.decodedUrlBox = document.getElementById("decoded-url-box");
    this.decodedUrlLink = document.getElementById("decoded-url-link");
    
    this.decodedWifiBox = document.getElementById("decoded-wifi-box");
    this.resWifiSsid = document.getElementById("res-wifi-ssid");
    this.resWifiPass = document.getElementById("res-wifi-pass");
    this.resWifiSec = document.getElementById("res-wifi-sec");

    this.decodedVcardBox = document.getElementById("decoded-vcard-box");
    this.resVcardFields = document.getElementById("res-vcard-fields");

    this.decodedEmailBox = document.getElementById("decoded-email-box");
    this.resEmailTo = document.getElementById("res-email-to");
    this.resEmailSub = document.getElementById("res-email-sub");
    this.resEmailSubWrap = document.getElementById("res-email-sub-wrap");
    this.resEmailBody = document.getElementById("res-email-body");
    this.resEmailBodyWrap = document.getElementById("res-email-body-wrap");

    this.decodedPhoneBox = document.getElementById("decoded-phone-box");
    this.resPhoneNum = document.getElementById("res-phone-num");

    this.decodedSmsBox = document.getElementById("decoded-sms-box");
    this.resSmsNum = document.getElementById("res-sms-num");
    this.resSmsBody = document.getElementById("res-sms-body");
    this.resSmsBodyWrap = document.getElementById("res-sms-body-wrap");

    this.decodedGeoBox = document.getElementById("decoded-geo-box");
    this.resGeoCoords = document.getElementById("res-geo-coords");

    this.mainCopyBtn = document.getElementById("main-copy-btn");
    this.mainDownloadBtn = document.getElementById("main-download-btn");
    this.mainActionLinkBtn = document.getElementById("main-action-link-btn");
    this.mainActionText = document.getElementById("main-action-text");
    this.mainScanAnotherBtn = document.getElementById("main-scan-another-btn");
  }

  bindEvents() {
    if (this.selectFileBtn) this.selectFileBtn.addEventListener("click", () => this.fileInput?.click());
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

    if (this.pasteBtn) this.pasteBtn.addEventListener("click", () => this.handlePaste());
    if (this.clearImageBtn) this.clearImageBtn.addEventListener("click", () => this.resetState());

    if (this.scanActionBtn) this.scanActionBtn.addEventListener("click", () => this.executeScan());
    if (this.scanAnotherBtn) this.scanAnotherBtn.addEventListener("click", () => this.resetState());
    if (this.scanAgainBtn) this.scanAgainBtn.addEventListener("click", () => this.resetState());
    if (this.mainScanAnotherBtn) this.mainScanAnotherBtn.addEventListener("click", () => this.resetState());

    if (this.startCameraBtn) this.startCameraBtn.addEventListener("click", () => this.startCamera());
    if (this.stopCameraBtn) this.stopCameraBtn.addEventListener("click", async () => await this.stopCamera());
    if (this.cameraSelect) {
      this.cameraSelect.addEventListener("change", (e) => {
        this.activeCameraId = e.target.value;
        if (this.isCameraActive) {
          this.startCamera(); 
        }
      });
    }

    if (this.copyBtn) this.copyBtn.addEventListener("click", () => this.copyResultToClipboard());
    if (this.mainCopyBtn) this.mainCopyBtn.addEventListener("click", () => this.copyResultToClipboard());
    
    if (this.shareBtn) this.shareBtn.addEventListener("click", () => this.shareResult());
    if (this.openUrlBtn) this.openUrlBtn.addEventListener("click", () => this.openResultUrl());
    
    if (this.downloadTxtBtn) this.downloadTxtBtn.addEventListener("click", () => this.downloadResultTxt());
    if (this.mainDownloadBtn) this.mainDownloadBtn.addEventListener("click", () => this.downloadResultTxt());

    if (this.copyWifiPassBtn) {
      this.copyWifiPassBtn.addEventListener("click", () => {
        if (this.wifiPassword && this.wifiPassword.textContent !== "-") {
          navigator.clipboard.writeText(this.wifiPassword.textContent).then(() => {
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
          const file = new File([blob], "pasted-image.png", { type: imageType });
          this.handleFileSelected(file);
          return;
        }
      }
      this.toast("No image found in clipboard.", "warning");
    } catch (err) {
      this.toast("Press Ctrl+V / Cmd+V to paste an image.", "info");
    }
  }

  setState(newState) {
    this.state = newState;
    this.updateUI();
  }

  async resetState() {
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.decodedResult = null;
    if (this.fileInput) this.fileInput.value = "";

    await this.stopCamera();
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

  async handleFileSelected(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.toast("Please provide a valid image file.", "error");
      return;
    }

    await this.stopCamera();

    this.selectedFile = file;
    this.selectedDataUrl = await this.fileToDataUrl(file);

    if (this.imagePreview) {
      this.imagePreview.src = this.selectedDataUrl;
    }
    if (this.metaFilename) this.metaFilename.innerHTML = `<strong>File:</strong> ${this.escapeHtml(file.name)}`;
    if (this.metaSize) this.metaSize.innerHTML = `<strong>Size:</strong> ${this.formatFileSize(file.size)}`;

    try {
      const img = await this.loadImage(this.selectedDataUrl);
      if (this.metaDimensions) {
        this.metaDimensions.innerHTML = `<strong>Dimensions:</strong> ${img.naturalWidth} &times; ${img.naturalHeight} px`;
      }
    } catch (e) {}

    this.setState(ScannerState.READY_TO_SCAN);
    
    // Auto execute scan immediately on file selection
    await this.executeScan();
  }

  async executeScan() {
    if (!this.selectedFile) return;

    this.setState(ScannerState.SCANNING);

    try {
      if (!this.html5Qrcode) {
        this.html5Qrcode = new Html5Qrcode("qr-reader");
      }
      
      const rawResult = await this.html5Qrcode.scanFile(this.selectedFile, false);
      
      let decodedText = "";
      if (typeof rawResult === "string") {
        decodedText = rawResult;
      } else if (rawResult && typeof rawResult === "object") {
        decodedText = rawResult.decodedText || rawResult.text || String(rawResult);
      }

      if (decodedText && decodedText.trim()) {
        this.decodedResult = decodedText.trim();
        this.toast("QR Code decoded successfully!", "success");
        this.setState(ScannerState.SUCCESS);
      } else {
        throw new Error("No QR code detected");
      }
    } catch (err) {
      console.log("Scan error:", err);
      this.setState(ScannerState.FAILED);
      this.toast("No QR Code detected in image.", "warning");
    }
  }

  async startCamera() {
    await this.stopCamera(); 
    await this.resetState(); 

    if (this.cameraContainer) this.cameraContainer.style.display = "block";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "none";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "inline-flex";

    try {
      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        if (this.cameraSelect) {
          this.cameraSelect.style.display = "inline-block";
          if (this.cameraSelect.options.length === 0) {
            devices.forEach((d, idx) => {
              const opt = document.createElement("option");
              opt.value = d.id;
              opt.text = d.label || `Camera ${idx + 1}`;
              this.cameraSelect.appendChild(opt);
            });
            
            // Default to back camera if available
            const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
            if (backCamera) {
              this.cameraSelect.value = backCamera.id;
            }
          }
        }
        this.activeCameraId = this.cameraSelect.value || devices[0].id;
      }

      this.isCameraActive = true;
      
      if (!this.html5Qrcode) {
        this.html5Qrcode = new Html5Qrcode("qr-reader");
      }

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      const cameraIdOrConfig = this.activeCameraId ? this.activeCameraId : { facingMode: "environment" };

      await this.html5Qrcode.start(
        cameraIdOrConfig,
        config,
        async (decodedText, rawResult) => {
          if (this.isCameraActive) {
            let text = decodedText;
            if (!text && rawResult) {
              text = typeof rawResult === "string" ? rawResult : rawResult.decodedText;
            }
            if (text && text.trim()) {
              this.decodedResult = text.trim();
              this.toast("QR Code detected via camera!", "success");
              await this.stopCamera();
              this.setState(ScannerState.SUCCESS);
            }
          }
        },
        (_errorMessage) => {
          // ignore constant frame scanning errors
        }
      );
    } catch (err) {
      console.error("Camera startup error:", err);
      await this.stopCamera();
      this.toast("Could not start camera. Check permissions.", "error");
    }
  }

  async stopCamera() {
    this.isCameraActive = false;
    
    if (this.html5Qrcode && this.html5Qrcode.getState() === 2) {
      try {
        await this.html5Qrcode.stop();
        this.html5Qrcode.clear();
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }

    if (this.cameraContainer) this.cameraContainer.style.display = "none";
    if (this.startCameraBtn) this.startCameraBtn.style.display = "inline-flex";
    if (this.stopCameraBtn) this.stopCameraBtn.style.display = "none";
  }

  hideResultPanel() {
    if (this.resultsPanel) this.resultsPanel.style.display = "none";
    if (this.emptyState) this.emptyState.style.display = "block";
    if (this.resultTypeBadge) this.resultTypeBadge.textContent = "Awaiting Code";

    if (this.mainDecodedResultCard) this.mainDecodedResultCard.style.display = "none";
  }

  renderResultPanel() {
    if (!this.decodedResult) return;

    const rawStr = String(this.decodedResult);
    const charCountText = `${rawStr.length} chars`;

    // 1. Update Sidebar panel if visible
    if (this.emptyState) this.emptyState.style.display = "none";
    if (this.resultsPanel) this.resultsPanel.style.display = "block";
    if (this.resultText) this.resultText.value = rawStr;
    if (this.resultCharCount) this.resultCharCount.textContent = charCountText;

    const parsedData = this.parseQrData(rawStr);

    if (this.resultTypeBadge) this.resultTypeBadge.textContent = parsedData.label;

    const actionBtns = [
      this.openUrlBtn, this.callBtn, this.emailBtn, this.smsBtn,
      this.whatsappBtn, this.mapsBtn, this.wifiDetailsCard,
    ];
    actionBtns.forEach((btn) => this.toggleElement(btn, false));

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
      if (this.wifiPassword) this.wifiPassword.textContent = parsedData.password;
      if (this.wifiEncryption) this.wifiEncryption.textContent = parsedData.security;
    }

    if (this.generateQrBtn) {
      this.generateQrBtn.href = `/?text=${encodeURIComponent(rawStr)}`;
    }

    // 2. UPDATE DEDICATED MAIN DECODED RESULT CARD
    if (this.mainDecodedResultCard) {
      this.mainDecodedResultCard.style.display = "block";
      
      if (this.decodedTypeBadge) this.decodedTypeBadge.textContent = parsedData.label;
      if (this.decodedCharCount) this.decodedCharCount.textContent = charCountText;
      if (this.decodedResultMeta) this.decodedResultMeta.textContent = `Type: ${parsedData.label}`;

      // Reset content view containers
      const boxes = [
        this.decodedTextBox, this.decodedUrlBox, this.decodedWifiBox,
        this.decodedVcardBox, this.decodedEmailBox, this.decodedPhoneBox,
        this.decodedSmsBox, this.decodedGeoBox
      ];
      boxes.forEach(b => { if (b) b.style.display = "none"; });

      if (this.mainActionLinkBtn) this.mainActionLinkBtn.style.display = "none";

      // Populate specific view based on type
      switch (parsedData.type) {
        case "URL":
          if (this.decodedUrlBox) {
            this.decodedUrlBox.style.display = "block";
            if (this.decodedUrlLink) {
              this.decodedUrlLink.href = parsedData.actionUrl;
              this.decodedUrlLink.textContent = parsedData.url || parsedData.actionUrl;
            }
          }
          if (this.mainActionLinkBtn) {
            this.mainActionLinkBtn.href = parsedData.actionUrl;
            this.mainActionLinkBtn.style.display = "inline-flex";
            if (this.mainActionText) this.mainActionText.textContent = "Open Link";
          }
          break;

        case "WIFI":
          if (this.decodedWifiBox) {
            this.decodedWifiBox.style.display = "block";
            if (this.resWifiSsid) this.resWifiSsid.textContent = parsedData.ssid || "-";
            if (this.resWifiPass) this.resWifiPass.textContent = parsedData.password || "-";
            if (this.resWifiSec) this.resWifiSec.textContent = parsedData.security || "Open";
          }
          break;

        case "VCARD":
          if (this.decodedVcardBox && this.resVcardFields && parsedData.contact) {
            this.decodedVcardBox.style.display = "block";
            const c = parsedData.contact;
            let html = "";
            if (c.fn) html += `<div class="result-kv-item"><span class="result-kv-label">Name</span><span class="result-kv-val">${this.escapeHtml(c.fn)}</span></div>`;
            if (c.tel) html += `<div class="result-kv-item"><span class="result-kv-label">Phone</span><span class="result-kv-val">${this.escapeHtml(c.tel)}</span></div>`;
            if (c.email) html += `<div class="result-kv-item"><span class="result-kv-label">Email</span><span class="result-kv-val">${this.escapeHtml(c.email)}</span></div>`;
            if (c.org) html += `<div class="result-kv-item"><span class="result-kv-label">Company</span><span class="result-kv-val">${this.escapeHtml(c.org)}</span></div>`;
            if (c.title) html += `<div class="result-kv-item"><span class="result-kv-label">Job Title</span><span class="result-kv-val">${this.escapeHtml(c.title)}</span></div>`;
            if (c.url) html += `<div class="result-kv-item"><span class="result-kv-label">Website</span><span class="result-kv-val">${this.escapeHtml(c.url)}</span></div>`;
            if (c.note) html += `<div class="result-kv-item"><span class="result-kv-label">Note</span><span class="result-kv-val">${this.escapeHtml(c.note)}</span></div>`;
            
            this.resVcardFields.innerHTML = html || `<div class="result-kv-item"><span class="result-kv-val">${this.escapeHtml(rawStr)}</span></div>`;

            if (c.tel && this.mainActionLinkBtn) {
              this.mainActionLinkBtn.href = `tel:${c.tel}`;
              this.mainActionLinkBtn.style.display = "inline-flex";
              if (this.mainActionText) this.mainActionText.textContent = "Call Contact";
            }
          }
          break;

        case "EMAIL":
          if (this.decodedEmailBox) {
            this.decodedEmailBox.style.display = "block";
            if (this.resEmailTo) this.resEmailTo.textContent = parsedData.email || "-";
            
            if (parsedData.subject && this.resEmailSub) {
              this.resEmailSub.textContent = parsedData.subject;
              if (this.resEmailSubWrap) this.resEmailSubWrap.style.display = "block";
            }
            if (parsedData.body && this.resEmailBody) {
              this.resEmailBody.textContent = parsedData.body;
              if (this.resEmailBodyWrap) this.resEmailBodyWrap.style.display = "block";
            }
          }
          if (this.mainActionLinkBtn) {
            this.mainActionLinkBtn.href = parsedData.actionUrl;
            this.mainActionLinkBtn.style.display = "inline-flex";
            if (this.mainActionText) this.mainActionText.textContent = "Send Email";
          }
          break;

        case "PHONE":
          if (this.decodedPhoneBox && this.resPhoneNum) {
            this.decodedPhoneBox.style.display = "block";
            this.resPhoneNum.textContent = parsedData.phone || "-";
          }
          if (this.mainActionLinkBtn) {
            this.mainActionLinkBtn.href = parsedData.actionUrl;
            this.mainActionLinkBtn.style.display = "inline-flex";
            if (this.mainActionText) this.mainActionText.textContent = "Call Number";
          }
          break;

        case "SMS":
          if (this.decodedSmsBox) {
            this.decodedSmsBox.style.display = "block";
            if (this.resSmsNum) this.resSmsNum.textContent = parsedData.recipient || "-";
            if (parsedData.body && this.resSmsBody) {
              this.resSmsBody.textContent = parsedData.body;
              if (this.resSmsBodyWrap) this.resSmsBodyWrap.style.display = "block";
            }
          }
          if (this.mainActionLinkBtn) {
            this.mainActionLinkBtn.href = parsedData.actionUrl;
            this.mainActionLinkBtn.style.display = "inline-flex";
            if (this.mainActionText) this.mainActionText.textContent = "Send SMS";
          }
          break;

        case "LOCATION":
          if (this.decodedGeoBox && this.resGeoCoords) {
            this.decodedGeoBox.style.display = "block";
            this.resGeoCoords.textContent = parsedData.coords || rawStr;
          }
          if (this.mainActionLinkBtn) {
            this.mainActionLinkBtn.href = parsedData.actionUrl;
            this.mainActionLinkBtn.style.display = "inline-flex";
            if (this.mainActionText) this.mainActionText.textContent = "Open in Maps";
          }
          break;

        default:
          if (this.decodedTextBox) {
            this.decodedTextBox.style.display = "block";
            this.decodedTextBox.textContent = rawStr;
          }
          break;
      }

      // Smooth scroll into view if card wasn't already visible
      setTimeout(() => {
        this.mainDecodedResultCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }

  parseQrData(text) {
    if (!text || typeof text !== "string") {
      return { type: "TEXT", label: "Plain Text", text: "" };
    }
    const str = text.trim();

    // 1. URL
    if (/^(https?:\/\/|ftps?:\/\/|www\.)/i.test(str)) {
      const url = /^www\./i.test(str) ? `https://${str}` : str;
      return { type: "URL", label: "Website Link", isUrl: true, actionUrl: url, url };
    }

    // 2. Wi-Fi
    if (/^WIFI:/i.test(str)) {
      const ssidMatch = str.match(/S:((?:\\;|[^;])+)/i);
      const passMatch = str.match(/P:((?:\\;|[^;])+)/i);
      const secMatch = str.match(/T:([^;]+)/i);
      const hiddenMatch = str.match(/H:([^;]+)/i);

      const ssid = ssidMatch ? ssidMatch[1].replace(/\\;/g, ";") : "Unknown Network";
      const password = passMatch ? passMatch[1].replace(/\\;/g, ";") : "(No password)";
      const security = secMatch ? secMatch[1].toUpperCase() : "Open";
      const hidden = hiddenMatch ? hiddenMatch[1].toLowerCase() === "true" : false;

      return { type: "WIFI", label: "Wi-Fi Network", ssid, password, security, hidden };
    }

    // 3. vCard / MeCard
    if (/BEGIN:VCARD/i.test(str) || /^MECARD:/i.test(str)) {
      let fn = str.match(/FN:(.*)/i)?.[1]?.trim();
      if (!fn) {
        const n = str.match(/N:(.*)/i)?.[1]?.split(";").filter(Boolean).reverse().join(" ").trim();
        fn = n || "Contact";
      }
      const tel = str.match(/TEL.*?:(.*)/i)?.[1]?.trim();
      const email = str.match(/EMAIL.*?:(.*)/i)?.[1]?.trim();
      const org = str.match(/ORG:(.*)/i)?.[1]?.trim();
      const title = str.match(/TITLE:(.*)/i)?.[1]?.trim();
      const url = str.match(/URL.*?:(.*)/i)?.[1]?.trim();
      const note = str.match(/NOTE:(.*)/i)?.[1]?.trim();

      return {
        type: "VCARD",
        label: "vCard Contact",
        contact: { fn, tel, email, org, title, url, note }
      };
    }

    // 4. Email
    if (/^mailto:/i.test(str) || /^MATMSG:/i.test(str) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      let email = "";
      let subject = "";
      let body = "";

      if (/^MATMSG:/i.test(str)) {
        email = str.match(/TO:([^;]+)/i)?.[1] || "";
        subject = str.match(/SUB:([^;]+)/i)?.[1] || "";
        body = str.match(/BODY:([^;]+)/i)?.[1] || "";
      } else if (/^mailto:/i.test(str)) {
        try {
          const u = new URL(str);
          email = u.pathname;
          subject = u.searchParams.get("subject") || "";
          body = u.searchParams.get("body") || "";
        } catch (e) {
          email = str.replace(/^mailto:/i, "").split("?")[0];
        }
      } else {
        email = str;
      }

      const actionUrl = `mailto:${email}` + (subject || body ? `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : "");
      return { type: "EMAIL", label: "Email Address", email, subject, body, actionUrl };
    }

    // 5. Phone
    if (/^tel:/i.test(str) || /^\+?[0-9\s\-\.\(\)]{7,20}$/.test(str)) {
      const phone = str.replace(/^tel:/i, "").trim();
      return { type: "PHONE", label: "Phone Number", phone, actionUrl: `tel:${phone}` };
    }

    // 6. SMS
    if (/^smsto:/i.test(str) || /^sms:/i.test(str) || /^SMS:/i.test(str)) {
      let recipient = "";
      let body = "";
      if (str.includes("?body=")) {
        const parts = str.split("?body=");
        recipient = parts[0].replace(/^(sms|smsto):/i, "");
        body = decodeURIComponent(parts[1] || "");
      } else {
        const parts = str.split(":");
        recipient = parts[1] || "";
        body = parts.slice(2).join(":") || "";
      }
      const actionUrl = `sms:${recipient}` + (body ? `?body=${encodeURIComponent(body)}` : "");
      return { type: "SMS", label: "SMS Message", recipient, body, actionUrl };
    }

    // 7. Geo Location
    if (/^geo:/i.test(str) || /maps\.google\.com/i.test(str) || /google\.com\/maps/i.test(str)) {
      let coords = str;
      let actionUrl = str;
      if (/^geo:/i.test(str)) {
        coords = str.replace(/^geo:/i, "");
        actionUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`;
      }
      return { type: "LOCATION", label: "Geo Location", coords, actionUrl };
    }

    // 8. Plain Text (fallback)
    return { type: "TEXT", label: "Plain Text" };
  }

  async copyResultToClipboard() {
    if (!this.decodedResult) return;
    const str = String(this.decodedResult);
    try {
      await navigator.clipboard.writeText(str);
      this.toast("Copied result to clipboard!", "success");
    } catch {
      this.toast("Failed to copy", "error");
    }
  }

  async shareResult() {
    if (!this.decodedResult) return;
    const str = String(this.decodedResult);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code Result',
          text: str,
        });
        this.toast("Shared successfully!", "success");
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.toast("Failed to share.", "error");
        }
      }
    } else {
      this.toast("Sharing is not supported on this browser.", "warning");
    }
  }

  openResultUrl() {
    if (!this.decodedResult) return;
    const parsed = this.parseQrData(String(this.decodedResult));
    if (parsed.isUrl && parsed.actionUrl) {
      window.open(parsed.actionUrl, "_blank", "noopener,noreferrer");
    }
  }

  downloadResultTxt() {
    if (!this.decodedResult) return;
    const str = String(this.decodedResult);
    const blob = new Blob([str], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename("qr-decoded-result.txt") : String("qr-decoded-result.txt").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    a.click();
    URL.revokeObjectURL(url);
    this.toast("Result downloaded as TXT", "success");
  }

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
    if (window.ComprexaFramework && typeof window.ComprexaFramework.showToast === "function") {
      window.ComprexaFramework.showToast(msg, type);
    } else {
      console.log(msg);
    }
  }
}

new QrScannerApp();
