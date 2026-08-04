// @ts-nocheck
/**
 * Comprexa Universal QR Generator Engine
 * High-performance, client-side vector & image QR generator.
 */

import QRCode from "qrcode";

export class QrGeneratorApp {
  constructor() {
    this.activeType = "url";
    this.fgColor = "#000000";
    this.bgColor = "#ffffff";
    this.isTransparent = false;
    this.moduleStyle = "square"; // 'square', 'rounded', 'dots'
    this.qrSize = 512;
    this.margin = 2;
    this.eccLevel = "M"; // 'L', 'M', 'Q', 'H'

    this.logoDataUrl = null;
    this.currentPayload = "";
    this.generatedCanvas = null;
    this.generatedDataUrl = "";
    this.generatedSvgString = "";

    this.hasGenerated = false;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.cacheElements();
    this.bindEvents();
    this.renderForm();
    this.renderEmpty();
  }

  cacheElements() {
    this.typeTabs = document.querySelectorAll(".qr-type-tab");
    this.formContainer = document.getElementById("qr-form-fields");
    this.previewContainer = document.getElementById("qr-preview-wrapper");
    this.statusBadge = document.getElementById("qr-status-badge");
    this.contrastWarning = document.getElementById("contrast-warning-box");
    this.filenameInput = document.getElementById("qr-filename-input");

    // Controls
    this.darkPicker = document.getElementById("qr-dark-color");
    this.darkHex = document.getElementById("qr-dark-hex");
    this.lightPicker = document.getElementById("qr-light-color");
    this.lightHex = document.getElementById("qr-light-hex");
    this.transparentCheckbox = document.getElementById("qr-transparent-bg");
    this.colorSwatches = document.querySelectorAll(".qr-swatch-btn");

    this.stylePills = document.querySelectorAll("[data-qr-style]");
    this.sizePills = document.querySelectorAll("[data-qr-size]");
    this.marginPills = document.querySelectorAll("[data-qr-margin]");
    this.eccPills = document.querySelectorAll("[data-qr-ecc]");

    // Logo
    this.logoInput = document.getElementById("qr-logo-upload");
    this.logoPreview = document.getElementById("qr-logo-img-preview");
    this.logoRemoveBtn = document.getElementById("qr-logo-remove");

    // Result & Info
    this.resMetaType = document.getElementById("res-meta-type");
    this.resMetaRes = document.getElementById("res-meta-res");
    this.resMetaEcl = document.getElementById("res-meta-ecl");
    this.resMetaPayload = document.getElementById("res-meta-payload");

    // Actions
    this.generateBtn = document.getElementById("generate-qr-cta");
    this.downloadPngBtn = document.getElementById("dl-png-btn");
    this.downloadSvgBtn = document.getElementById("dl-svg-btn");
    this.downloadJpgBtn = document.getElementById("dl-jpg-btn");
    this.copyImgBtn = document.getElementById("copy-img-btn");
    this.copySvgBtn = document.getElementById("copy-svg-btn");
    this.copyDataUrlBtn = document.getElementById("copy-dataurl-btn");
    this.resetBtn = document.getElementById("reset-qr-cta");
  }

  bindEvents() {
    // Type selection tabs
    this.typeTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.typeTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeType = tab.dataset.type || "url";
        this.renderForm();
      });
    });

    // Dark Color
    if (this.darkPicker && this.darkHex) {
      this.darkPicker.addEventListener("input", (e) => {
        this.fgColor = e.target.value;
        this.darkHex.value = e.target.value.toUpperCase();
        this.onOptionChange();
      });
      this.darkHex.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          this.fgColor = val;
          this.darkPicker.value = val;
          this.onOptionChange();
        }
      });
    }

    // Light Color
    if (this.lightPicker && this.lightHex) {
      this.lightPicker.addEventListener("input", (e) => {
        this.bgColor = e.target.value;
        this.lightHex.value = e.target.value.toUpperCase();
        this.onOptionChange();
      });
      this.lightHex.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          this.bgColor = val;
          this.lightPicker.value = val;
          this.onOptionChange();
        }
      });
    }

    // Preset Color Swatches
    this.colorSwatches.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        const color = btn.dataset.color;
        if (target === "dark") {
          this.fgColor = color;
          if (this.darkPicker) this.darkPicker.value = color;
          if (this.darkHex) this.darkHex.value = color.toUpperCase();
        } else if (target === "light") {
          this.bgColor = color;
          if (this.lightPicker) this.lightPicker.value = color;
          if (this.lightHex) this.lightHex.value = color.toUpperCase();
        }
        this.onOptionChange();
      });
    });

    // Transparent Background Checkbox
    if (this.transparentCheckbox) {
      this.transparentCheckbox.addEventListener("change", (e) => {
        this.isTransparent = e.target.checked;
        this.onOptionChange();
      });
    }

    // Style Pills
    this.stylePills.forEach((p) => {
      p.addEventListener("click", () => {
        this.stylePills.forEach((item) =>
          item.classList.remove("pill--active"),
        );
        p.classList.add("pill--active");
        this.moduleStyle = p.dataset.qrStyle || "square";
        this.onOptionChange();
      });
    });

    // Size Pills
    this.sizePills.forEach((p) => {
      p.addEventListener("click", () => {
        this.sizePills.forEach((item) => item.classList.remove("pill--active"));
        p.classList.add("pill--active");
        this.qrSize = parseInt(p.dataset.qrSize, 10) || 512;
        this.onOptionChange();
      });
    });

    // Margin Pills
    this.marginPills.forEach((p) => {
      p.addEventListener("click", () => {
        this.marginPills.forEach((item) =>
          item.classList.remove("pill--active"),
        );
        p.classList.add("pill--active");
        this.margin = parseInt(p.dataset.qrMargin, 10) ?? 2;
        this.onOptionChange();
      });
    });

    // Error Correction Level Pills
    this.eccPills.forEach((p) => {
      p.addEventListener("click", () => {
        this.eccPills.forEach((item) => item.classList.remove("pill--active"));
        p.classList.add("pill--active");
        this.eccLevel = p.dataset.qrEcc || "M";
        this.onOptionChange();
      });
    });

    // Logo Upload
    if (this.logoInput) {
      this.logoInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) {
          if (!file.type.startsWith("image/")) {
            this.toast("Please upload a valid image file", "error");
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.logoDataUrl = evt.target.result;
            if (this.logoPreview) {
              this.logoPreview.src = this.logoDataUrl;
              this.logoPreview.style.display = "block";
            }
            if (this.logoRemoveBtn)
              this.logoRemoveBtn.style.display = "inline-flex";
            this.onOptionChange();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (this.logoRemoveBtn) {
      this.logoRemoveBtn.addEventListener("click", () => {
        this.logoDataUrl = null;
        if (this.logoInput) this.logoInput.value = "";
        if (this.logoPreview) {
          this.logoPreview.src = "";
          this.logoPreview.style.display = "none";
        }
        this.logoRemoveBtn.style.display = "none";
        this.onOptionChange();
      });
    }

    // CTA & Downloads
    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => {
        this.generate(true);
      });
    }

    if (this.downloadPngBtn)
      this.downloadPngBtn.addEventListener("click", () => this.downloadPng());
    if (this.downloadSvgBtn)
      this.downloadSvgBtn.addEventListener("click", () => this.downloadSvg());
    if (this.downloadJpgBtn)
      this.downloadJpgBtn.addEventListener("click", () => this.downloadJpg());

    if (this.copyImgBtn)
      this.copyImgBtn.addEventListener("click", () => this.copyImage());
    if (this.copySvgBtn)
      this.copySvgBtn.addEventListener("click", () => this.copySvg());
    if (this.copyDataUrlBtn)
      this.copyDataUrlBtn.addEventListener("click", () => this.copyDataUrl());

    if (this.resetBtn)
      this.resetBtn.addEventListener("click", () => this.reset());
  }

  onOptionChange() {
    this.checkContrast();
    if (this.filenameInput) {
      this.filenameInput.value = this.getSmartBaseName();
    }
    if (this.hasGenerated) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.generate(false), 20);
    }
  }

  getSmartBaseName() {
    const type = this.activeType;
    let name = "";

    switch (type) {
      case "url": {
        const urlVal = document.getElementById("inp-url")?.value.trim() || "";
        if (urlVal) {
          try {
            const formatted = /^https?:\/\//i.test(urlVal)
              ? urlVal
              : `https://${urlVal}`;
            const parsed = new URL(formatted);
            let hostname = parsed.hostname.replace(/^www\./i, "");
            if (hostname) name = hostname;
          } catch {
            name = urlVal
              .replace(/^https?:\/\//i, "")
              .replace(/^www\./i, "")
              .split("/")[0];
          }
        }
        break;
      }
      case "email": {
        const email =
          document.getElementById("inp-email-to")?.value.trim() || "";
        if (email) {
          name = email.replace(/@/g, "-").replace(/\./g, "-");
        }
        break;
      }
      case "phone": {
        const phone = document.getElementById("inp-phone")?.value.trim() || "";
        if (phone) {
          name = phone.replace(/[^0-9]/g, "");
        }
        break;
      }
      case "sms": {
        const smsNum =
          document.getElementById("inp-sms-num")?.value.trim() || "";
        if (smsNum) {
          name = smsNum.replace(/[^0-9]/g, "");
        }
        break;
      }
      case "whatsapp": {
        const waNum = document.getElementById("inp-wa-num")?.value.trim() || "";
        if (waNum) {
          name = waNum.replace(/[^0-9]/g, "");
        }
        break;
      }
      case "wifi": {
        const ssid =
          document.getElementById("inp-wifi-ssid")?.value.trim() || "";
        if (ssid) {
          name = ssid.replace(/[^a-zA-Z0-9]/g, "");
        }
        break;
      }
      case "vcard": {
        const fn = document.getElementById("inp-vc-fn")?.value.trim() || "";
        const ln = document.getElementById("inp-vc-ln")?.value.trim() || "";
        if (fn || ln) {
          name = `${fn} ${ln}`.trim();
        }
        break;
      }
      case "location": {
        const lat = document.getElementById("inp-loc-lat")?.value.trim() || "";
        const lng = document.getElementById("inp-loc-lng")?.value.trim() || "";
        if (lat || lng) {
          name = `location-${lat}-${lng}`;
        }
        break;
      }
      case "text": {
        const txt = document.getElementById("inp-text")?.value.trim() || "";
        if (txt) {
          name = txt.substring(0, 30);
        }
        break;
      }
    }

    if (name) {
      let sanitized = name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (sanitized) {
        return `${sanitized}-qr`;
      }
    }

    return "comprexa-qr";
  }

  renderForm() {
    if (!this.formContainer) return;
    this.formContainer.innerHTML = "";

    switch (this.activeType) {
      case "url":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Website URL <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <input type="url" id="inp-url" class="ui-input" placeholder="https://example.com" required style="width: 100%;" />
            <div class="form-hint" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Enter a web address starting with https:// or http://</div>
          </div>
        `;
        break;

      case "text":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Text Content <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <textarea id="inp-text" class="ui-textarea" rows="4" placeholder="Enter your text..." required style="width: 100%; min-height: 100px; resize: vertical;"></textarea>
          </div>
        `;
        break;

      case "email":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Recipient Email <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <input type="email" id="inp-email-to" class="ui-input" placeholder="example@email.com" required style="width: 100%;" />
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Subject</label>
              <input type="text" id="inp-email-subj" class="ui-input" placeholder="Enter email subject" style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Body</label>
              <input type="text" id="inp-email-body" class="ui-input" placeholder="Enter email message" style="width: 100%;" />
            </div>
          </div>
        `;
        break;

      case "phone":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Phone Number <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <input type="tel" id="inp-phone" class="ui-input" placeholder="+91XXXXXXXXXX" required style="width: 100%;" />
          </div>
        `;
        break;

      case "sms":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Phone Number <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <input type="tel" id="inp-sms-num" class="ui-input" placeholder="Enter phone number" required style="width: 100%;" />
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">SMS Message <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <textarea id="inp-sms-body" class="ui-textarea" rows="3" placeholder="Enter SMS message" style="width: 100%; resize: vertical;"></textarea>
          </div>
        `;
        break;

      case "whatsapp":
        this.formContainer.innerHTML = `
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">WhatsApp Phone Number <span style="color: var(--color-danger, #ef4444);">*</span></label>
            <input type="tel" id="inp-wa-num" class="ui-input" placeholder="+91XXXXXXXXXX" required style="width: 100%;" />
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Pre-filled Message</label>
            <textarea id="inp-wa-body" class="ui-textarea" rows="3" placeholder="Enter WhatsApp message" style="width: 100%; resize: vertical;"></textarea>
          </div>
        `;
        break;

      case "wifi":
        this.formContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">SSID (Network Name) <span style="color: var(--color-danger, #ef4444);">*</span></label>
              <input type="text" id="inp-wifi-ssid" class="ui-input" placeholder="Network Name (SSID)" required style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Password</label>
              <input type="text" id="inp-wifi-pass" class="ui-input" placeholder="Wi-Fi Password" style="width: 100%;" />
            </div>
          </div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Encryption</label>
              <select id="inp-wifi-type" class="ui-select" style="width: 100%;">
                <option value="WPA" selected>WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
        `;
        break;

      case "vcard":
        this.formContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">First Name <span style="color: var(--color-danger, #ef4444);">*</span></label>
              <input type="text" id="inp-vc-fn" class="ui-input" placeholder="First Name" required style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Last Name</label>
              <input type="text" id="inp-vc-ln" class="ui-input" placeholder="Last Name" style="width: 100%;" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Company</label>
              <input type="text" id="inp-vc-org" class="ui-input" placeholder="Company" style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Phone Number</label>
              <input type="tel" id="inp-vc-tel" class="ui-input" placeholder="Phone Number" style="width: 100%;" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Email Address</label>
              <input type="email" id="inp-vc-email" class="ui-input" placeholder="Email Address" style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Website URL</label>
              <input type="url" id="inp-vc-url" class="ui-input" placeholder="Website URL" style="width: 100%;" />
            </div>
          </div>
        `;
        break;

      case "location":
        this.formContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Latitude <span style="color: var(--color-danger, #ef4444);">*</span></label>
              <input type="text" id="inp-loc-lat" class="ui-input" placeholder="e.g. 22.5726" required style="width: 100%;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 8px;">Longitude <span style="color: var(--color-danger, #ef4444);">*</span></label>
              <input type="text" id="inp-loc-lng" class="ui-input" placeholder="e.g. 88.3639" required style="width: 100%;" />
            </div>
          </div>
        `;
        break;
    }

    if (this.filenameInput) {
      this.filenameInput.value = this.getSmartBaseName();
    }

    const inputs = this.formContainer.querySelectorAll(
      "input, textarea, select",
    );
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.onOptionChange());
      input.addEventListener("change", () => this.onOptionChange());
    });
  }

  getPayload() {
    switch (this.activeType) {
      case "url": {
        const url = document.getElementById("inp-url")?.value.trim() || "";
        if (!url) return "";
        return /^https?:\/\//i.test(url) ? url : `https://${url}`;
      }
      case "text": {
        return document.getElementById("inp-text")?.value.trim() || "";
      }
      case "email": {
        const to = document.getElementById("inp-email-to")?.value.trim() || "";
        if (!to) return "";
        const subj = encodeURIComponent(
          document.getElementById("inp-email-subj")?.value.trim() || "",
        );
        const body = encodeURIComponent(
          document.getElementById("inp-email-body")?.value.trim() || "",
        );
        let mailto = `mailto:${to}`;
        let params = [];
        if (subj) params.push(`subject=${subj}`);
        if (body) params.push(`body=${body}`);
        if (params.length) mailto += `?${params.join("&")}`;
        return mailto;
      }
      case "phone": {
        const tel = document.getElementById("inp-phone")?.value.trim() || "";
        return tel ? `tel:${tel.replace(/\s+/g, "")}` : "";
      }
      case "sms": {
        const num = document.getElementById("inp-sms-num")?.value.trim() || "";
        const body =
          document.getElementById("inp-sms-body")?.value.trim() || "";
        return num ? `smsto:${num.replace(/\s+/g, "")}:${body}` : "";
      }
      case "whatsapp": {
        const num = document.getElementById("inp-wa-num")?.value.trim() || "";
        if (!num) return "";
        const clean = num.replace(/[^0-9]/g, "");
        const body = encodeURIComponent(
          document.getElementById("inp-wa-body")?.value.trim() || "",
        );
        return `https://wa.me/${clean}${body ? "?text=" + body : ""}`;
      }
      case "wifi": {
        const ssid =
          document.getElementById("inp-wifi-ssid")?.value.trim() || "";
        if (!ssid) return "";
        const pass =
          document.getElementById("inp-wifi-pass")?.value.trim() || "";
        const type = document.getElementById("inp-wifi-type")?.value || "WPA";
        return `WIFI:S:${ssid};T:${type};P:${pass};;`;
      }
      case "vcard": {
        const fn = document.getElementById("inp-vc-fn")?.value.trim() || "";
        const ln = document.getElementById("inp-vc-ln")?.value.trim() || "";
        if (!fn && !ln) return "";
        const org = document.getElementById("inp-vc-org")?.value.trim() || "";
        const tel = document.getElementById("inp-vc-tel")?.value.trim() || "";
        const email =
          document.getElementById("inp-vc-email")?.value.trim() || "";
        const url = document.getElementById("inp-vc-url")?.value.trim() || "";
        let lines = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${ln};${fn};;;`,
          `FN:${fn} ${ln}`.trim(),
        ];
        if (org) lines.push(`ORG:${org}`);
        if (tel) lines.push(`TEL:${tel}`);
        if (email) lines.push(`EMAIL:${email}`);
        if (url) lines.push(`URL:${url}`);
        lines.push("END:VCARD");
        return lines.join("\n");
      }
      case "location": {
        const lat = document.getElementById("inp-loc-lat")?.value.trim() || "";
        const lng = document.getElementById("inp-loc-lng")?.value.trim() || "";
        if (!lat || !lng) return "";
        return `geo:${lat},${lng}`;
      }
      default:
        return "";
    }
  }

  checkContrast() {
    if (!this.contrastWarning) return;

    const hexToRgb = (hex) => {
      const c = hex.replace("#", "");
      return {
        r: parseInt(c.substring(0, 2), 16) || 0,
        g: parseInt(c.substring(2, 4), 16) || 0,
        b: parseInt(c.substring(4, 6), 16) || 0,
      };
    };

    try {
      const fg = hexToRgb(this.fgColor);
      const bg = hexToRgb(this.bgColor);

      const lum = (rgb) => {
        const a = [rgb.r, rgb.g, rgb.b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };

      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      if (ratio < 2.5 && !this.isTransparent) {
        this.contrastWarning.style.display = "flex";
      } else {
        this.contrastWarning.style.display = "none";
      }
    } catch {
      this.contrastWarning.style.display = "none";
    }
  }

  async generate(isExplicitUserClick = false) {
    const payload = this.getPayload();
    this.currentPayload = payload;

    if (!payload) {
      this.renderEmpty();
      return;
    }

    try {
      const ecc = this.logoDataUrl ? "H" : this.eccLevel || "M";
      const qrData = QRCode.create(payload, { errorCorrectionLevel: ecc });

      if (!qrData || !qrData.modules) {
        throw new Error("Matrix calculation failed");
      }

      const matrix = qrData.modules;
      const size = matrix.size;
      const margin = typeof this.margin === "number" ? this.margin : 2;
      const totalModules = size + margin * 2;

      // Canvas Rendering
      const canvasDim = this.qrSize || 512;
      const canvas = document.createElement("canvas");
      canvas.width = canvasDim;
      canvas.height = canvasDim;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D Context failed");

      const cellSize = canvasDim / totalModules;

      if (this.isTransparent) {
        ctx.clearRect(0, 0, canvasDim, canvasDim);
      } else {
        ctx.fillStyle = this.bgColor || "#ffffff";
        ctx.fillRect(0, 0, canvasDim, canvasDim);
      }

      ctx.fillStyle = this.fgColor || "#000000";

      const isFinder = (r, c) => {
        if (r < 7 && c < 7) return true;
        if (r < 7 && c >= size - 7) return true;
        if (r >= size - 7 && c < 7) return true;
        return false;
      };

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!matrix.get(r, c)) continue;

          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;

          if (isFinder(r, c) || this.moduleStyle === "square") {
            ctx.fillRect(x, y, cellSize + 0.4, cellSize + 0.4);
          } else if (this.moduleStyle === "dots") {
            ctx.beginPath();
            ctx.arc(
              x + cellSize / 2,
              y + cellSize / 2,
              (cellSize / 2) * 0.88,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          } else if (this.moduleStyle === "rounded") {
            const rad = cellSize * 0.35;
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") {
              ctx.roundRect(
                x + cellSize * 0.05,
                y + cellSize * 0.05,
                cellSize * 0.9,
                cellSize * 0.9,
                rad,
              );
            } else {
              ctx.rect(x, y, cellSize + 0.4, cellSize + 0.4);
            }
            ctx.fill();
          }
        }
      }

      // Overlay Logo if present
      if (this.logoDataUrl) {
        await this.drawLogo(ctx, canvasDim);
      }

      this.generatedCanvas = canvas;
      this.generatedDataUrl = canvas.toDataURL("image/png");
      this.generatedSvgString = this.buildSvg(
        matrix,
        size,
        margin,
        totalModules,
      );

      this.hasGenerated = true;
      this.renderPreview();

      if (isExplicitUserClick) {
        this.toast("QR Code generated successfully!", "success");

        // Smooth scroll to preview card
        const previewCard = document.getElementById("qr-preview-card");
        if (previewCard) {
          previewCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    } catch (err) {
      console.error("QR Generator Error:", err);
      this.toast(`QR Error: ${err.message}`, "error");
      this.renderEmpty();
    }
  }

  drawLogo(ctx, canvasDim) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const logoDim = Math.floor(canvasDim * 0.22);
        const x = Math.floor((canvasDim - logoDim) / 2);
        const y = Math.floor((canvasDim - logoDim) / 2);
        const padding = Math.floor(logoDim * 0.12);

        ctx.fillStyle = this.isTransparent
          ? "#ffffff"
          : this.bgColor || "#ffffff";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(
            x - padding,
            y - padding,
            logoDim + padding * 2,
            logoDim + padding * 2,
            Math.floor((logoDim + padding * 2) * 0.2),
          );
        } else {
          ctx.rect(
            x - padding,
            y - padding,
            logoDim + padding * 2,
            logoDim + padding * 2,
          );
        }
        ctx.fill();

        ctx.drawImage(img, x, y, logoDim, logoDim);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = this.logoDataUrl;
    });
  }

  buildSvg(matrix, size, margin, totalModules) {
    const view = totalModules * 10;
    const bg = this.isTransparent ? "none" : this.bgColor || "#ffffff";

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view} ${view}" width="${this.qrSize}" height="${this.qrSize}">`;
    if (!this.isTransparent) {
      svg += `<rect width="100%" height="100%" fill="${bg}"/>`;
    }
    svg += `<g fill="${this.fgColor || "#000000"}">`;

    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= size - 7) return true;
      if (r >= size - 7 && c < 7) return true;
      return false;
    };

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!matrix.get(r, c)) continue;
        const x = (c + margin) * 10;
        const y = (r + margin) * 10;

        if (isFinder(r, c) || this.moduleStyle === "square") {
          svg += `<rect x="${x}" y="${y}" width="10" height="10"/>`;
        } else if (this.moduleStyle === "dots") {
          svg += `<circle cx="${x + 5}" cy="${y + 5}" r="4.2"/>`;
        } else if (this.moduleStyle === "rounded") {
          svg += `<rect x="${x + 0.5}" y="${y + 0.5}" width="9" height="9" rx="3" ry="3"/>`;
        }
      }
    }
    svg += `</g>`;

    if (this.logoDataUrl) {
      const logoDim = view * 0.22;
      const x = (view - logoDim) / 2;
      const y = (view - logoDim) / 2;
      const pad = logoDim * 0.12;

      svg += `<rect x="${x - pad}" y="${y - pad}" width="${logoDim + pad * 2}" height="${logoDim + pad * 2}" rx="${(logoDim + pad * 2) * 0.2}" fill="${bg === "none" ? "#ffffff" : bg}"/>`;
      svg += `<image href="${this.logoDataUrl}" x="${x}" y="${y}" width="${logoDim}" height="${logoDim}"/>`;
    }

    svg += `</svg>`;
    return svg;
  }

  renderPreview() {
    if (!this.previewContainer) return;

    this.previewContainer.innerHTML = `
      <img src="${this.generatedDataUrl}" alt="Generated QR Code" id="qr-preview-img" style="max-width: 100%; max-height: 280px; width: auto; height: auto; object-fit: contain; border-radius: var(--radius-md); filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08)); display: block; margin: 0 auto;" />
    `;

    if (this.statusBadge) {
      this.statusBadge.textContent = "Vector Ready";
      this.statusBadge.style.background = "rgba(99, 102, 241, 0.12)";
      this.statusBadge.style.color = "var(--primary)";
    }

    if (this.resMetaType)
      this.resMetaType.textContent = this.activeType.toUpperCase();
    if (this.resMetaRes)
      this.resMetaRes.textContent = `${this.qrSize} × ${this.qrSize} px`;
    if (this.resMetaEcl) this.resMetaEcl.textContent = `Level ${this.eccLevel}`;
    if (this.resMetaPayload)
      this.resMetaPayload.textContent = this.currentPayload;

    [
      this.downloadPngBtn,
      this.downloadSvgBtn,
      this.downloadJpgBtn,
      this.copyImgBtn,
      this.copySvgBtn,
      this.copyDataUrlBtn,
    ].forEach((btn) => {
      if (btn) btn.disabled = false;
    });
  }

  renderEmpty() {
    if (!this.previewContainer) return;
    this.previewContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 36px 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px; opacity: 0.5;"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/></svg>
        <p style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Ready to Generate</p>
        <p style="font-size: 0.82rem;">Click the "Generate QR Code" button above to create your QR code</p>
      </div>
    `;

    if (this.statusBadge) {
      this.statusBadge.textContent = "Awaiting Generation";
      this.statusBadge.style.background = "var(--bg-surface-subtle)";
      this.statusBadge.style.color = "var(--text-muted)";
    }

    if (this.resMetaPayload)
      this.resMetaPayload.textContent = "Awaiting generation...";

    [
      this.downloadPngBtn,
      this.downloadSvgBtn,
      this.downloadJpgBtn,
      this.copyImgBtn,
      this.copySvgBtn,
      this.copyDataUrlBtn,
    ].forEach((btn) => {
      if (btn) btn.disabled = true;
    });
  }

  getFilename(ext) {
    let raw = this.filenameInput?.value.trim() || this.getSmartBaseName();
    let sanitized = raw
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!sanitized) sanitized = "comprexa-qr";
    if (sanitized.endsWith(`.${ext}`)) return sanitized;
    return `${sanitized}.${ext}`;
  }

  downloadPng() {
    if (!this.generatedDataUrl) return;
    this.triggerDownload(this.generatedDataUrl, this.getFilename("png"));
    this.toast("PNG QR Code downloaded", "success");
  }

  downloadSvg() {
    if (!this.generatedSvgString) return;
    const blob = new Blob([this.generatedSvgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, this.getFilename("svg"));
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast("SVG Vector QR Code downloaded", "success");
  }

  downloadJpg() {
    if (!this.generatedCanvas) return;
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = this.generatedCanvas.width;
    jpgCanvas.height = this.generatedCanvas.height;
    const ctx = jpgCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = this.isTransparent ? "#ffffff" : this.bgColor || "#ffffff";
    ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
    ctx.drawImage(this.generatedCanvas, 0, 0);

    const url = jpgCanvas.toDataURL("image/jpeg", 0.96);
    this.triggerDownload(url, this.getFilename("jpg"));
    this.toast("JPG QR Code downloaded", "success");
  }

  async copyImage() {
    if (!this.generatedCanvas) return;
    try {
      this.generatedCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        this.toast("Copied QR Image to clipboard", "success");
      });
    } catch {
      this.copyDataUrl();
    }
  }

  async copySvg() {
    if (!this.generatedSvgString) return;
    try {
      await navigator.clipboard.writeText(this.generatedSvgString);
      this.toast("Copied SVG code to clipboard", "success");
    } catch {
      this.toast("Failed copying SVG", "error");
    }
  }

  async copyDataUrl() {
    if (!this.generatedDataUrl) return;
    try {
      await navigator.clipboard.writeText(this.generatedDataUrl);
      this.toast("Copied Data URL to clipboard", "success");
    } catch {
      this.toast("Failed copying Data URL", "error");
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

  reset() {
    this.activeType = "url";
    this.typeTabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.type === "url"),
    );
    this.fgColor = "#000000";
    this.bgColor = "#ffffff";
    this.isTransparent = false;
    this.moduleStyle = "square";
    this.qrSize = 512;
    this.margin = 2;
    this.eccLevel = "M";
    this.logoDataUrl = null;
    this.hasGenerated = false;

    if (this.darkPicker) this.darkPicker.value = "#000000";
    if (this.darkHex) this.darkHex.value = "#000000";
    if (this.lightPicker) this.lightPicker.value = "#ffffff";
    if (this.lightHex) this.lightHex.value = "#FFFFFF";
    if (this.transparentCheckbox) this.transparentCheckbox.checked = false;
    if (this.logoInput) this.logoInput.value = "";
    if (this.logoPreview) this.logoPreview.style.display = "none";
    if (this.logoRemoveBtn) this.logoRemoveBtn.style.display = "none";

    this.stylePills.forEach((p) =>
      p.classList.toggle("pill--active", p.dataset.qrStyle === "square"),
    );
    this.sizePills.forEach((p) =>
      p.classList.toggle("pill--active", p.dataset.qrSize === "512"),
    );
    this.marginPills.forEach((p) =>
      p.classList.toggle("pill--active", p.dataset.qrMargin === "2"),
    );
    this.eccPills.forEach((p) =>
      p.classList.toggle("pill--active", p.dataset.qrEcc === "M"),
    );

    this.renderForm();
    this.renderEmpty();
    this.toast("Reset settings to defaults", "info");
  }

  toast(msg, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      window.ComprexaFramework.showToast(msg, type);
    }
  }
}

new QrGeneratorApp();
