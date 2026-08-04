/**
 * Color Picker Tool Controller
 * Rebuilt from scratch with live synchronization across Native, HEX, RGB, HSL, HSV, and CMYK.
 */

import { ColorEngine } from "./utils.js";

export class ColorPickerController {
  constructor() {
    this.currentColor = null;
    this.history = [];
    this.initDOM();
    this.bindEvents();
    // Default starting color
    this.updateColor("#2563EB", "initial");
  }

  initDOM() {
    // Large preview
    this.previewCard = document.getElementById("picker-preview-card");
    this.previewHex = document.getElementById("picker-preview-hex");
    this.nativePicker = document.getElementById("native-picker");

    // Status banner
    this.statusBanner = document.getElementById("picker-status-banner");

    // Inputs
    this.inputHex = document.getElementById("input-hex");
    this.inputRgb = document.getElementById("input-rgb");
    this.inputHsl = document.getElementById("input-hsl");
    this.inputHsv = document.getElementById("input-hsv");
    this.displayCmyk = document.getElementById("display-cmyk");
    this.displayCss = document.getElementById("display-css");

    // Copy buttons
    this.btnCopyHex = document.getElementById("btn-copy-hex");
    this.btnCopyRgb = document.getElementById("btn-copy-rgb");
    this.btnCopyHsl = document.getElementById("btn-copy-hsl");
    this.btnCopyHsv = document.getElementById("btn-copy-hsv");
    this.btnCopyCmyk = document.getElementById("btn-copy-cmyk");
    this.btnCopyCssVal = document.getElementById("btn-copy-css-val");
    this.btnCopyCss = document.getElementById("btn-copy-css");

    // Actions
    this.btnRandom = document.getElementById("btn-random-color");
    this.btnExportJson = document.getElementById("btn-export-color-json");

    // History
    this.historyContainer = document.getElementById("picker-history-swatches");
  }

  bindEvents() {
    // Native color wheel change
    if (this.nativePicker) {
      this.nativePicker.addEventListener("input", (e) => {
        this.updateColor(e.target.value, "native");
      });
    }

    // HEX input typing
    if (this.inputHex) {
      this.inputHex.addEventListener("input", (e) => {
        this.updateColor(e.target.value, "hex");
      });
    }

    // RGB input typing
    if (this.inputRgb) {
      this.inputRgb.addEventListener("input", (e) => {
        this.updateColor(e.target.value, "rgb");
      });
    }

    // HSL input typing
    if (this.inputHsl) {
      this.inputHsl.addEventListener("input", (e) => {
        this.updateColor(e.target.value, "hsl");
      });
    }

    // HSV input typing
    if (this.inputHsv) {
      this.inputHsv.addEventListener("input", (e) => {
        this.updateColor(e.target.value, "hsv");
      });
    }

    // Random Color button
    if (this.btnRandom) {
      this.btnRandom.addEventListener("click", () => {
        const randHex =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase();
        this.updateColor(randHex, "random");
        ColorEngine.showToast("Generated random color", "info");
      });
    }

    // Export JSON button
    if (this.btnExportJson) {
      this.btnExportJson.addEventListener("click", () => {
        if (!this.currentColor) return;
        const jsonStr = ColorEngine.exportAsJson([this.currentColor]);
        ColorEngine.downloadFile(
          jsonStr,
          `color-${this.currentColor.hex.replace("#", "")}.json`,
          "application/json",
        );
        ColorEngine.showToast("Downloaded color definition as JSON", "success");
      });
    }

    // Copy buttons
    this.setupCopy(
      this.btnCopyHex,
      () => this.currentColor?.strings.hex,
      "HEX",
    );
    this.setupCopy(
      this.btnCopyRgb,
      () => this.currentColor?.strings.rgb,
      "RGB",
    );
    this.setupCopy(
      this.btnCopyHsl,
      () => this.currentColor?.strings.hsl,
      "HSL",
    );
    this.setupCopy(
      this.btnCopyHsv,
      () => this.currentColor?.strings.hsv,
      "HSV",
    );
    this.setupCopy(
      this.btnCopyCmyk,
      () => this.currentColor?.strings.cmyk,
      "CMYK",
    );
    this.setupCopy(
      this.btnCopyCssVal,
      () => this.currentColor?.strings.cssColor,
      "CSS Value",
    );
    this.setupCopy(
      this.btnCopyCss,
      () => this.currentColor?.strings.cssVar,
      "CSS Variable",
    );
  }

  setupCopy(button, getValFn, label) {
    if (!button) return;
    button.addEventListener("click", async () => {
      const val = getValFn();
      if (!val) return;
      const success = await ColorEngine.copyToClipboard(val);
      if (success) {
        ColorEngine.showToast(`Copied ${label}: ${val}`, "success");
      }
    });
  }

  updateColor(value, source = "manual") {
    const parsed = ColorEngine.parseColor(value);

    if (!parsed.valid) {
      this.showStatus("error", parsed.error);
      return;
    }

    this.showStatus("valid", null);
    this.currentColor = parsed;

    // Update Preview Swatch
    if (this.previewCard) {
      this.previewCard.style.backgroundColor = parsed.hex;
      this.previewCard.style.color = parsed.textContrast;
    }
    if (this.previewHex) {
      this.previewHex.textContent = parsed.hex;
    }
    if (this.nativePicker && source !== "native") {
      this.nativePicker.value = parsed.hex;
    }

    // Synchronize Form Fields
    if (this.inputHex && source !== "hex") {
      this.inputHex.value = parsed.strings.hex;
    }
    if (this.inputRgb && source !== "rgb") {
      this.inputRgb.value = parsed.strings.rgb;
    }
    if (this.inputHsl && source !== "hsl") {
      this.inputHsl.value = parsed.strings.hsl;
    }
    if (this.inputHsv && source !== "hsv") {
      this.inputHsv.value = parsed.strings.hsv;
    }
    if (this.displayCmyk) {
      this.displayCmyk.value = parsed.strings.cmyk;
    }
    if (this.displayCss) {
      this.displayCss.value = parsed.strings.cssColor;
    }

    // Add to Recent Swatches
    this.addToHistory(parsed.hex);
  }

  showStatus(type, message) {
    if (!this.statusBanner) return;
    if (type === "error" && message) {
      this.statusBanner.className = "status-banner status-banner--error";
      this.statusBanner.textContent = message;
    } else {
      this.statusBanner.className = "status-banner";
      this.statusBanner.textContent = "";
      this.statusBanner.style.display = "none";
    }
  }

  addToHistory(hex) {
    if (this.history.includes(hex)) return;
    this.history.unshift(hex);
    if (this.history.length > 10) this.history.pop();
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyContainer) return;
    this.historyContainer.innerHTML = "";

    this.history.forEach((hex) => {
      const dot = document.createElement("div");
      dot.className = "color-history-dot";
      dot.style.backgroundColor = hex;
      dot.title = `Click to pick ${hex}`;
      dot.addEventListener("click", () => {
        this.updateColor(hex, "history");
        ColorEngine.showToast(`Selected ${hex}`, "info");
      });
      this.historyContainer.appendChild(dot);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.colorPickerApp = new ColorPickerController();
});
