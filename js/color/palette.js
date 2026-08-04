/**
 * Color Palette Generator Controller
 * Rebuilt from scratch supporting 9 color harmony algorithms, swatch locking, and multi-format exports.
 */
import { ColorEngine } from "./utils.js";

export class ColorPaletteController {
  constructor() {
    this.palette = [];
    this.locked = [];
    this.history = [];
    this.initDOM();
    this.bindEvents();
    // Generate initial default palette
    this.generatePalette();
  }

  initDOM() {
    this.baseInput = document.getElementById("palette-base-input");
    this.nativePicker = document.getElementById("palette-native-picker");
    this.typeSelect = document.getElementById("palette-type-select");
    this.countSelect = document.getElementById("palette-count-select");
    this.btnGenerate = document.getElementById("btn-generate-palette");
    this.grid = document.getElementById("palette-grid");
    this.statusBanner = document.getElementById("palette-status-banner");

    // Export buttons
    this.btnCopyHexList = document.getElementById("btn-copy-palette");
    this.btnExportCssVars = document.getElementById("btn-export-css-vars");
    this.btnExportJson = document.getElementById("btn-export-json-file");
    this.btnExportSvg = document.getElementById("btn-export-svg-file");
    this.btnDownloadPng = document.getElementById("btn-download-png-palette");

    // Create history container if it doesn't exist
    let historyContainer = document.getElementById("palette-history-container");
    if (!historyContainer && this.grid) {
      const container = document.createElement("div");
      container.className = "palette-history-section";
      container.style.marginTop = "24px";
      container.style.borderTop = "1px solid var(--border-color)";
      container.style.paddingTop = "16px";

      const title = document.createElement("h4");
      title.textContent = "Recent Palette History";
      title.style.marginBottom = "12px";

      historyContainer = document.createElement("div");
      historyContainer.id = "palette-history-container";
      historyContainer.style.display = "flex";
      historyContainer.style.gap = "8px";
      historyContainer.style.flexWrap = "wrap";

      container.appendChild(title);
      container.appendChild(historyContainer);
      this.grid.parentNode.insertBefore(container, this.grid.nextSibling);
    }
    this.historyContainer = historyContainer;
  }

  bindEvents() {
    // Base Color HEX Typing
    if (this.baseInput) {
      this.baseInput.addEventListener("input", (e) => {
        if (this.nativePicker && ColorEngine.parseColor(e.target.value).valid) {
          this.nativePicker.value = ColorEngine.parseColor(e.target.value).hex;
        }
        this.generatePalette(false, false);
      });
    }

    // Native picker change
    if (this.nativePicker) {
      this.nativePicker.addEventListener("input", (e) => {
        if (this.baseInput) this.baseInput.value = e.target.value;
        this.generatePalette(false, false);
      });
    }

    // Harmony Rule or Count Change
    if (this.typeSelect) {
      this.typeSelect.addEventListener("change", () =>
        this.generatePalette(false, true),
      );
    }
    if (this.countSelect) {
      this.countSelect.addEventListener("change", () =>
        this.generatePalette(false, true),
      );
    }

    // Generate / Shuffle Button
    if (this.btnGenerate) {
      this.btnGenerate.addEventListener("click", () => {
        // If user explicitly clicks generate, we can tweak base or re-run
        this.generatePalette(true, true);
        if (window.ComprexaToast) {
          window.ComprexaToast.success("New palette generated.");
        } else {
          ColorEngine.showToast("New palette generated.", "success");
        }
      });
    }

    // Export Handlers
    if (this.btnCopyHexList) {
      this.btnCopyHexList.addEventListener("click", async () => {
        if (!this.palette.length) return;
        const hexList = this.palette.map((c) => c.hex).join(", ");
        const success = await ColorEngine.copyToClipboard(hexList);
        if (success && window.ComprexaToast) {
          window.ComprexaToast.success(`Copied palette: ${hexList}`);
        }
      });
    }

    if (this.btnExportCssVars) {
      this.btnExportCssVars.addEventListener("click", async () => {
        if (!this.palette.length) return;
        const cssVars = ColorEngine.exportAsCss(this.palette);
        const success = await ColorEngine.copyToClipboard(cssVars);
        if (success && window.ComprexaToast) {
          window.ComprexaToast.success("Copied CSS Variables to clipboard!");
        }
      });
    }

    if (this.btnExportJson) {
      this.btnExportJson.addEventListener("click", () => {
        if (!this.palette.length) return;
        const jsonStr = ColorEngine.exportAsJson(this.palette);
        ColorEngine.downloadFile(jsonStr, "palette.json", "application/json");
        if (window.ComprexaToast)
          window.ComprexaToast.success("Downloaded palette.json");
      });
    }

    if (this.btnExportSvg) {
      this.btnExportSvg.addEventListener("click", () => {
        if (!this.palette.length) return;
        const svgStr = ColorEngine.exportAsSvg(this.palette);
        ColorEngine.downloadFile(svgStr, "palette.svg", "image/svg+xml");
        if (window.ComprexaToast)
          window.ComprexaToast.success("Downloaded palette.svg");
      });
    }

    if (this.btnDownloadPng) {
      this.btnDownloadPng.addEventListener("click", () => {
        if (!this.palette.length) return;
        ColorEngine.downloadPngPalette(this.palette);
        if (window.ComprexaToast)
          window.ComprexaToast.info("Generating PNG download...");
      });
    }
  }

  generatePalette(shuffleRandom = false, saveToHistory = false) {
    let baseColor = this.baseInput?.value || "#2563EB";
    const type = this.typeSelect?.value || "analogous";

    if (shuffleRandom) {
      if (type === "random") {
        // Completely random base
        baseColor =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");
      } else {
        // Pick a slight variation or fresh color if requested
        const parsedBase = ColorEngine.parseColor(baseColor);
        if (parsedBase.valid) {
          // Shift hue slightly for a shuffle effect
          const newH =
            (parsedBase.hsl.h + Math.floor(Math.random() * 60) - 30 + 360) %
            360;
          const newHex = ColorEngine.fromHsl(
            newH,
            parsedBase.hsl.s,
            parsedBase.hsl.l,
          ).hex;
          baseColor = newHex;
        }
      }
      if (this.baseInput) this.baseInput.value = baseColor;
      if (this.nativePicker) this.nativePicker.value = baseColor;
    }

    const count = parseInt(this.countSelect?.value || "6", 10);
    const parsedBase = ColorEngine.parseColor(baseColor);

    if (!parsedBase.valid) {
      this.showStatus("error", parsedBase.error);
      return;
    }
    this.showStatus("valid", null);

    const freshPalette = ColorEngine.generatePalette(baseColor, type, count);

    // Merge with locked colors
    const merged = [];
    for (let i = 0; i < count; i++) {
      if (this.locked[i] && this.palette[i]) {
        merged.push(this.palette[i]);
      } else {
        merged.push(freshPalette[i] || freshPalette[freshPalette.length - 1]);
      }
    }
    this.palette = merged;

    if (saveToHistory) {
      this.history.unshift([...this.palette]);
      if (this.history.length > 10) {
        this.history.pop();
      }
      this.renderHistory();
    }

    this.renderGrid();
  }

  renderHistory() {
    if (!this.historyContainer) return;
    this.historyContainer.innerHTML = "";

    this.history.forEach((pal, _idx) => {
      const historyRow = document.createElement("div");
      historyRow.style.display = "flex";
      historyRow.style.cursor = "pointer";
      historyRow.style.borderRadius = "4px";
      historyRow.style.overflow = "hidden";
      historyRow.style.border = "1px solid var(--border-color)";
      historyRow.title = "Click to restore this palette";

      pal.forEach((col) => {
        const swatch = document.createElement("div");
        swatch.style.width = "24px";
        swatch.style.height = "24px";
        swatch.style.backgroundColor = col.hex;
        historyRow.appendChild(swatch);
      });

      historyRow.addEventListener("click", () => {
        this.palette = [...pal];
        this.locked = []; // clear locks on restore

        // update base color input based on first color
        if (this.palette[0]) {
          if (this.baseInput) this.baseInput.value = this.palette[0].hex;
          if (this.nativePicker) this.nativePicker.value = this.palette[0].hex;
        }

        // update count select if needed
        if (
          this.countSelect &&
          this.palette.length.toString() !== this.countSelect.value
        ) {
          this.countSelect.value = this.palette.length.toString();
        }

        this.renderGrid();
      });

      this.historyContainer.appendChild(historyRow);
    });
  }

  renderGrid() {
    if (!this.grid) return;
    this.grid.innerHTML = "";

    this.palette.forEach((col, _idx) => {
      const isLocked = !!this.locked[_idx];
      const card = document.createElement("div");
      card.className = "palette-swatch-card";

      // Animation styles
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      card.style.transition =
        "opacity 0.2s ease-in-out, transform 0.2s ease-in-out";

      // Delay animation based on index
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "scale(1)";
      }, _idx * 30);

      // Preview block
      const preview = document.createElement("div");
      preview.className = "palette-swatch-preview";
      preview.style.backgroundColor = col.hex;

      // Lock button
      const lockBtn = document.createElement("button");
      lockBtn.type = "button";
      lockBtn.className = `palette-swatch-lock-btn ${isLocked ? "palette-swatch-lock-btn--locked" : ""}`;
      lockBtn.title = isLocked ? "Unlock color" : "Lock color";
      lockBtn.innerHTML = isLocked ? "🔒" : "🔓";

      lockBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.locked[_idx] = !this.locked[_idx];
        this.renderGrid();
      });

      preview.appendChild(lockBtn);

      // Swatch details
      const info = document.createElement("div");
      info.className = "palette-swatch-info";

      const hexSpan = document.createElement("span");
      hexSpan.className = "palette-swatch-hex";
      hexSpan.textContent = col.hex;

      const rgbSpan = document.createElement("span");
      rgbSpan.className = "palette-swatch-sub";
      rgbSpan.textContent = col.strings.rgb;

      const hslSpan = document.createElement("span");
      hslSpan.className = "palette-swatch-sub";
      hslSpan.textContent = col.strings.hsl;

      info.appendChild(hexSpan);
      info.appendChild(rgbSpan);
      info.appendChild(hslSpan);

      card.appendChild(preview);
      card.appendChild(info);

      // Click card to copy HEX
      card.style.cursor = "pointer";
      card.addEventListener("click", async () => {
        const success = await ColorEngine.copyToClipboard(col.hex);
        if (success && window.ComprexaToast) {
          window.ComprexaToast.success(`Copied ${col.hex} to clipboard`);
        }
      });

      this.grid.appendChild(card);
    });
  }

  showStatus(type, msg) {
    if (!this.statusBanner) return;
    if (type === "error" && msg) {
      this.statusBanner.className = "status-banner status-banner--error";
      this.statusBanner.textContent = msg;
      this.statusBanner.style.display = "block";
    } else {
      this.statusBanner.className = "status-banner";
      this.statusBanner.textContent = "";
      this.statusBanner.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.colorPaletteApp = new ColorPaletteController();
});
