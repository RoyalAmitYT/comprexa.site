/**
 * Color Converter Controller
 * Rebuilt from scratch with live format auto-detection and multi-format conversion.
 */

import { ColorEngine } from "./utils.js";

export class ColorConverterController {
  constructor() {
    this.currentColor = null;
    this.initDOM();
    this.bindEvents();
    // Initialize default conversion
    this.convertColor("#2563EB", "initial");
  }

  initDOM() {
    this.masterInput = document.getElementById("converter-master-input");
    this.statusBanner = document.getElementById("converter-status-banner");
    this.previewSwatch = document.getElementById("converter-preview-swatch");
    this.swatchLabel = document.getElementById("converter-swatch-label");
    this.nativePicker = document.getElementById("converter-native-picker");

    // Outputs
    this.outHex = document.getElementById("out-hex");
    this.outRgb = document.getElementById("out-rgb");
    this.outRgba = document.getElementById("out-rgba");
    this.outHsl = document.getElementById("out-hsl");
    this.outHsla = document.getElementById("out-hsla");
    this.outHsv = document.getElementById("out-hsv");
    this.outCmyk = document.getElementById("out-cmyk");
    this.outCssvar = document.getElementById("out-cssvar");

    // Buttons
    this.btnClear = document.getElementById("btn-converter-clear");
    this.btnCopyAll = document.getElementById("btn-copy-all-formats");

    this.btnCopyHex = document.getElementById("btn-copy-out-hex");
    this.btnCopyRgb = document.getElementById("btn-copy-out-rgb");
    this.btnCopyRgba = document.getElementById("btn-copy-out-rgba");
    this.btnCopyHsl = document.getElementById("btn-copy-out-hsl");
    this.btnCopyHsla = document.getElementById("btn-copy-out-hsla");
    this.btnCopyHsv = document.getElementById("btn-copy-out-hsv");
    this.btnCopyCmyk = document.getElementById("btn-copy-out-cmyk");
    this.btnCopyCssvar = document.getElementById("btn-copy-out-cssvar");
  }

  bindEvents() {
    // Master input typing
    if (this.masterInput) {
      this.masterInput.addEventListener("input", (e) => {
        this.convertColor(e.target.value, "input");
      });
    }

    // Native picker change
    if (this.nativePicker) {
      this.nativePicker.addEventListener("input", (e) => {
        if (this.masterInput) this.masterInput.value = e.target.value;
        this.convertColor(e.target.value, "native");
      });
    }

    // Clear Button
    if (this.btnClear) {
      this.btnClear.addEventListener("click", () => {
        if (this.masterInput) this.masterInput.value = "";
        this.clearOutputs();
        this.showStatus(
          "error",
          "Input cleared. Enter a color format to convert.",
        );
      });
    }

    // Copy All Formats
    if (this.btnCopyAll) {
      this.btnCopyAll.addEventListener("click", async () => {
        if (!this.currentColor) {
          ColorEngine.showToast("No valid color to copy", "error");
          return;
        }
        const summary = [
          `HEX: ${this.currentColor.strings.hex}`,
          `RGB: ${this.currentColor.strings.rgb}`,
          `RGBA: ${this.currentColor.strings.rgba}`,
          `HSL: ${this.currentColor.strings.hsl}`,
          `HSLA: ${this.currentColor.strings.hsla}`,
          `HSV: ${this.currentColor.strings.hsv}`,
          `CMYK: ${this.currentColor.strings.cmyk}`,
          `CSS Variable: ${this.currentColor.strings.cssVar}`,
        ].join("\n");

        const success = await ColorEngine.copyToClipboard(summary);
        if (success) {
          ColorEngine.showToast(
            "Copied all color conversions to clipboard!",
            "success",
          );
        }
      });
    }

    // Setup Copy Buttons
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
      this.btnCopyRgba,
      () => this.currentColor?.strings.rgba,
      "RGBA",
    );
    this.setupCopy(
      this.btnCopyHsl,
      () => this.currentColor?.strings.hsl,
      "HSL",
    );
    this.setupCopy(
      this.btnCopyHsla,
      () => this.currentColor?.strings.hsla,
      "HSLA",
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
      this.btnCopyCssvar,
      () => this.currentColor?.strings.cssVar,
      "CSS Variable",
    );
  }

  setupCopy(button, getValFn, label) {
    if (!button) return;
    button.addEventListener("click", async () => {
      const val = getValFn();
      if (!val) {
        ColorEngine.showToast("No value to copy", "error");
        return;
      }
      const success = await ColorEngine.copyToClipboard(val);
      if (success) {
        ColorEngine.showToast(`Copied ${label}: ${val}`, "success");
      }
    });
  }

  convertColor(val, source = "manual") {
    const parsed = ColorEngine.parseColor(val);

    if (!parsed.valid) {
      this.currentColor = null;
      this.showStatus("error", parsed.error);
      this.clearOutputs();
      return;
    }

    this.showStatus("valid", null);
    this.currentColor = parsed;

    // Swatch preview
    if (this.previewSwatch) {
      this.previewSwatch.style.backgroundColor = parsed.hex;
      this.previewSwatch.style.color = parsed.textContrast;
    }
    if (this.swatchLabel) {
      this.swatchLabel.textContent = parsed.hex;
    }
    if (this.nativePicker && source !== "native") {
      this.nativePicker.value = parsed.hex;
    }

    // Render converted values
    if (this.outHex) this.outHex.textContent = parsed.strings.hex;
    if (this.outRgb) this.outRgb.textContent = parsed.strings.rgb;
    if (this.outRgba) this.outRgba.textContent = parsed.strings.rgba;
    if (this.outHsl) this.outHsl.textContent = parsed.strings.hsl;
    if (this.outHsla) this.outHsla.textContent = parsed.strings.hsla;
    if (this.outHsv) this.outHsv.textContent = parsed.strings.hsv;
    if (this.outCmyk) this.outCmyk.textContent = parsed.strings.cmyk;
    if (this.outCssvar) this.outCssvar.textContent = parsed.strings.cssVar;
  }

  clearOutputs() {
    if (this.outHex) this.outHex.textContent = "—";
    if (this.outRgb) this.outRgb.textContent = "—";
    if (this.outRgba) this.outRgba.textContent = "—";
    if (this.outHsl) this.outHsl.textContent = "—";
    if (this.outHsla) this.outHsla.textContent = "—";
    if (this.outHsv) this.outHsv.textContent = "—";
    if (this.outCmyk) this.outCmyk.textContent = "—";
    if (this.outCssvar) this.outCssvar.textContent = "—";
    if (this.previewSwatch) {
      this.previewSwatch.style.backgroundColor = "#e2e8f0";
      this.previewSwatch.style.color = "#0f172a";
    }
    if (this.swatchLabel) this.swatchLabel.textContent = "Invalid / Empty";
  }

  showStatus(type, msg) {
    if (!this.statusBanner) return;
    if (type === "error" && msg) {
      this.statusBanner.className = "status-banner status-banner--error";
      this.statusBanner.textContent = msg;
    } else {
      this.statusBanner.className = "status-banner";
      this.statusBanner.textContent = "";
      this.statusBanner.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.colorConverterApp = new ColorConverterController();
});
