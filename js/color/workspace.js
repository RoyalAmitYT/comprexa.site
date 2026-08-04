// @ts-nocheck
/**
 * Comprexa Shared Color Workspace Component
 * Manages color inputs, swatches, copy actions, history persistence, and palette exporting
 */

import { ColorUtils } from "./utils.js";

export class SharedColorWorkspace {
  /**
   * @param {Object} config
   * @param {string} [config.pickerInputSelector] native <input type="color">
   * @param {string} [config.hexInputSelector] <input type="text"> for HEX
   * @param {string} [config.rgbInputSelector] <input type="text"> for RGB
   * @param {string} [config.hslInputSelector] <input type="text"> for HSL
   * @param {string} [config.previewSelector] element for live color preview
   * @param {string} [config.historySelector] container for recent colors
   * @param {Function} [config.onColorChange] callback(colorObj)
   */
  constructor(config = {}) {
    this.pickerInput = config.pickerInputSelector
      ? document.querySelector(config.pickerInputSelector)
      : null;
    this.hexInput = config.hexInputSelector
      ? document.querySelector(config.hexInputSelector)
      : null;
    this.rgbInput = config.rgbInputSelector
      ? document.querySelector(config.rgbInputSelector)
      : null;
    this.hslInput = config.hslInputSelector
      ? document.querySelector(config.hslInputSelector)
      : null;
    this.previewEl = config.previewSelector
      ? document.querySelector(config.previewSelector)
      : null;
    this.historyContainer = config.historySelector
      ? document.querySelector(config.historySelector)
      : null;
    this.onColorChange = config.onColorChange || null;

    this.currentColor = ColorUtils.parseColor("#2563EB"); // default blue
    this.history = this.loadHistory();

    this.init();
  }

  init() {
    // Attach event listeners
    if (this.pickerInput) {
      this.pickerInput.addEventListener("input", (e) => {
        this.setColor(e.target.value, "picker");
      });
      this.pickerInput.addEventListener("change", (e) => {
        this.addToHistory(this.currentColor.hex);
      });
    }

    if (this.hexInput) {
      this.hexInput.addEventListener("input", (e) => {
        const parsed = ColorUtils.parseColor(e.target.value);
        if (parsed) {
          this.setColor(parsed.hex, "hex");
        }
      });
      this.hexInput.addEventListener("blur", () => {
        if (this.currentColor) this.addToHistory(this.currentColor.hex);
      });
    }

    if (this.rgbInput) {
      this.rgbInput.addEventListener("input", (e) => {
        const parsed = ColorUtils.parseColor(e.target.value);
        if (parsed) {
          this.setColor(parsed.hex, "rgb");
        }
      });
      this.rgbInput.addEventListener("blur", () => {
        if (this.currentColor) this.addToHistory(this.currentColor.hex);
      });
    }

    if (this.hslInput) {
      this.hslInput.addEventListener("input", (e) => {
        const parsed = ColorUtils.parseColor(e.target.value);
        if (parsed) {
          this.setColor(parsed.hex, "hsl");
        }
      });
      this.hslInput.addEventListener("blur", () => {
        if (this.currentColor) this.addToHistory(this.currentColor.hex);
      });
    }

    // Attach copy buttons
    document.querySelectorAll("[data-copy-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const format = btn.getAttribute("data-copy-color");
        if (this.currentColor) {
          const val = ColorUtils.formatCss(this.currentColor, format);
          this.copyText(val, `Copied ${format.toUpperCase()}: ${val}`);
        }
      });
    });

    // Initial sync
    this.setColor(this.currentColor.hex);
    this.renderHistory();
  }

  setColor(input, source = "external") {
    const parsed = ColorUtils.parseColor(input);
    if (!parsed) return;

    this.currentColor = parsed;

    // Sync input fields if not currently being typed into
    if (source !== "picker" && this.pickerInput) {
      this.pickerInput.value = parsed.hex;
    }
    if (source !== "hex" && this.hexInput) {
      this.hexInput.value = parsed.hex;
    }
    if (source !== "rgb" && this.rgbInput) {
      this.rgbInput.value = `rgb(${parsed.rgb.r}, ${parsed.rgb.g}, ${parsed.rgb.b})`;
    }
    if (source !== "hsl" && this.hslInput) {
      this.hslInput.value = `hsl(${parsed.hsl.h}, ${parsed.hsl.s}%, ${parsed.hsl.l}%)`;
    }

    // Sync preview swatch
    if (this.previewEl) {
      this.previewEl.style.backgroundColor = parsed.hex;
      const textContrast = ColorUtils.getContrastColor(
        parsed.rgb.r,
        parsed.rgb.g,
        parsed.rgb.b,
      );
      this.previewEl.style.color = textContrast;
      const hexLabel = this.previewEl.querySelector(".color-preview__hex");
      if (hexLabel) hexLabel.textContent = parsed.hex;
    }

    if (this.onColorChange) {
      this.onColorChange(parsed);
    }
  }

  loadHistory() {
    try {
      const stored = sessionStorage.getItem("comprexa_color_history");
      return stored
        ? JSON.parse(stored)
        : ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    } catch (e) {
      return ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    }
  }

  addToHistory(hex) {
    if (!hex) return;
    const norm = ColorUtils.normalizeHex(hex);
    if (!norm) return;

    this.history = [norm, ...this.history.filter((h) => h !== norm)].slice(
      0,
      12,
    );
    try {
      sessionStorage.setItem(
        "comprexa_color_history",
        JSON.stringify(this.history),
      );
    } catch (e) {
      // Ignore
    }
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyContainer) return;
    this.historyContainer.innerHTML = "";

    if (this.history.length === 0) {
      this.historyContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-tertiary);">No recent colors saved.</span>`;
      return;
    }

    this.history.forEach((hex) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "color-history-swatch";
      swatch.style.backgroundColor = hex;
      swatch.setAttribute("aria-label", `Select history color ${hex}`);
      swatch.title = `Click to select ${hex}`;

      swatch.addEventListener("click", () => {
        this.setColor(hex);
        this.showToast(`Selected ${hex}`, "info");
      });

      this.historyContainer.appendChild(swatch);
    });
  }

  async copyText(text, toastMsg) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(toastMsg || "Copied to clipboard!", "success");
    } catch (err) {
      this.showToast("Failed to copy", "error");
    }
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
