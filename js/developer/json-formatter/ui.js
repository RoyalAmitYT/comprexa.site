// @ts-nocheck
/**
 * JSON Formatter UI Controller (Independent Implementation)
 * Connects input/output Universal Code Editors, options (indentation, minify, sort keys),
 * live reactivity, file drop/upload, and diagnostic status.
 */

import { UniversalCodeEditor } from "../code-editor.js";
import { FormatterEngine } from "./formatter-engine.js";
import { ValidatorEngine } from "./validator-engine.js";
import { FormatterUtils } from "./utils.js";

export class FormatterUIController {
  constructor() {
    this.sampleJson = {
      app: "Comprexa",
      version: "2.5.0",
      description: "Universal Browser-First Developer Tools",
      features: [
        "JSON Formatter",
        "JSON Validator",
        "Word Counter",
        "Image Tools",
      ],
      settings: {
        theme: "auto",
        privacyMode: true,
        maxMemoryMb: 512,
      },
      stats: {
        totalTools: 100,
        serverless: true,
      },
    };

    this.init();
  }

  init() {
    // 1. Initialize Input & Output Universal Code Editors
    const inputContainer = document.getElementById("json-input-editor");
    const outputContainer = document.getElementById("json-output-editor");

    if (!inputContainer || !outputContainer) {
      return;
    }

    this.inputEditor = UniversalCodeEditor.attach(inputContainer, {
      placeholder: "Paste raw JSON or drag & drop a .json file here...",
      minHeight: "380px",
      maxHeight: "500px",
      onInput: () => this.handleLiveUpdate(),
      onFileDrop: (file) => this.handleFileUpload(file),
    });

    this.outputEditor = UniversalCodeEditor.attach(outputContainer, {
      placeholder: "Formatted JSON output will appear here automatically...",
      readOnly: true,
      minHeight: "380px",
      maxHeight: "500px",
    });

    // 2. Options DOM Elements
    this.indentSelect = document.getElementById("indent-select");
    this.formatModeSelect = document.getElementById("format-mode-select");
    this.sortKeysCheckbox = document.getElementById("sort-keys-checkbox");
    this.statusBanner = document.getElementById("dev-status-banner");
    this.fileUploadInput = document.getElementById("file-upload-input");
    this.activeFileBanner = document.getElementById("active-file-banner");

    // 3. Bind Event Listeners
    if (this.indentSelect) {
      this.indentSelect.addEventListener("change", () =>
        this.handleLiveUpdate(),
      );
    }

    if (this.formatModeSelect) {
      this.formatModeSelect.addEventListener("change", () =>
        this.handleLiveUpdate(),
      );
    }

    if (this.sortKeysCheckbox) {
      this.sortKeysCheckbox.addEventListener("change", () =>
        this.handleLiveUpdate(),
      );
    }

    if (this.fileUploadInput) {
      this.fileUploadInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
          e.target.value = "";
        }
      });
    }

    // Toolbar buttons
    this.bindToolbarButtons();

    // Initial run if default content present
    this.handleLiveUpdate();
  }

  bindToolbarButtons() {
    const btnSample = document.getElementById("btn-sample");
    if (btnSample) {
      btnSample.addEventListener("click", () => {
        const sampleStr = JSON.stringify(this.sampleJson, null, 2);
        this.inputEditor.setValue(sampleStr);
        this.handleLiveUpdate();
        FormatterUtils.showToast("Loaded sample JSON", "info");
      });
    }

    const btnClear = document.getElementById("btn-clear");
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        this.inputEditor.setValue("");
        this.outputEditor.setValue("");
        this.inputEditor.clearErrorLine();
        this.clearStatusBanner();
        this.clearFileBanner();
        FormatterUtils.showToast("Cleared editor", "info");
      });
    }

    const btnCopy = document.getElementById("btn-copy");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const textToCopy =
          this.outputEditor.getValue() || this.inputEditor.getValue();
        FormatterUtils.copyToClipboard(textToCopy);
      });
    }

    const btnDownload = document.getElementById("btn-download");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        const textToDownload =
          this.outputEditor.getValue() || this.inputEditor.getValue();
        if (!textToDownload) {
          FormatterUtils.showToast("Nothing to download", "warning");
          return;
        }
        const isMinified =
          this.formatModeSelect && this.formatModeSelect.value === "minify";
        const filename = isMinified ? "formatted.min.json" : "formatted.json";
        FormatterUtils.downloadFile(textToDownload, filename);
      });
    }
  }

  handleLiveUpdate() {
    const rawInput = this.inputEditor.getValue();

    if (!rawInput || !rawInput.trim()) {
      this.outputEditor.setValue("");
      this.inputEditor.clearErrorLine();
      this.clearStatusBanner();
      this.updateStats(0, 0, 0);
      return;
    }

    // 1. Validate
    const validation = ValidatorEngine.validate(rawInput);

    if (!validation.isValid) {
      const err = validation.error;
      this.outputEditor.setValue("");
      if (err && err.line) {
        this.inputEditor.setErrorLine(err.line);
      } else {
        this.inputEditor.clearErrorLine();
      }
      this.renderStatusBanner(false, err);
      this.updateStats(0, new Blob([rawInput]).size, 0);
      return;
    }

    // 2. When valid: Format automatically according to options
    this.inputEditor.clearErrorLine();
    this.renderStatusBanner(true, null);

    const mode = this.formatModeSelect ? this.formatModeSelect.value : "pretty";
    const indentation = this.indentSelect ? this.indentSelect.value : 2;
    const sortKeys = this.sortKeysCheckbox
      ? this.sortKeysCheckbox.checked
      : false;

    const formatResult = FormatterEngine.format(rawInput, {
      mode,
      indentation,
      sortKeys,
    });

    if (formatResult.success) {
      this.outputEditor.setValue(formatResult.formattedText);
      this.updateStats(
        formatResult.originalSize,
        formatResult.byteSize,
        formatResult.bytesSaved,
      );
    }
  }

  handleFileUpload(file) {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "json" && ext !== "txt") {
      FormatterUtils.showToast("Please upload a valid .json file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.inputEditor.setValue(text);
      this.renderFileBanner(file.name, file.size);
      this.handleLiveUpdate();
      FormatterUtils.showToast(`Uploaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      FormatterUtils.showToast("Error reading uploaded file", "error");
    };
    reader.readAsText(file);
  }

  renderFileBanner(name, size) {
    if (!this.activeFileBanner) return;
    this.activeFileBanner.style.display = "flex";
    this.activeFileBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${name} (${FormatterUtils.formatBytes(size)})</span>
      </div>
      <button type="button" class="btn btn--ghost btn--sm" id="btn-remove-file" title="Remove File" style="padding: 2px 8px; font-size: 0.75rem;">
        ✕ Clear File
      </button>
    `;

    const btnRemove = document.getElementById("btn-remove-file");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        this.clearFileBanner();
        this.inputEditor.setValue("");
        this.handleLiveUpdate();
      });
    }
  }

  clearFileBanner() {
    if (this.activeFileBanner) {
      this.activeFileBanner.style.display = "none";
      this.activeFileBanner.innerHTML = "";
    }
  }

  renderStatusBanner(isValid, error) {
    if (!this.statusBanner) return;

    if (isValid === true) {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--valid";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__icon" style="color: #10b981;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="dev-status-banner__content">
          <div class="dev-status-banner__title" style="color: #10b981;">Valid JSON Syntax</div>
          <div>Automatically formatted according to selected indentation and options.</div>
        </div>
      `;
    } else if (isValid === false) {
      const locStr =
        error && error.line
          ? `Line ${error.line}, Column ${error.column}`
          : "Syntax Error";
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--invalid";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__icon" style="color: #ef4444;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="dev-status-banner__content">
          <div class="dev-status-banner__title">
            <span>Invalid JSON</span>
            <span class="dev-status-banner__location">${locStr}</span>
          </div>
          <div>${error ? error.message : "JSON Syntax Error"}</div>
          ${error && error.snippet ? `<pre class="dev-status-banner__code-snippet">${error.snippetWithCaret || error.snippet}</pre>` : ""}
        </div>
      `;
    }
  }

  clearStatusBanner() {
    if (this.statusBanner) {
      this.statusBanner.className = "dev-status-banner";
      this.statusBanner.innerHTML = "";
    }
  }

  updateStats(originalBytes, formattedBytes, savedBytes) {
    const elOriginal = document.getElementById("stat-original-size");
    const elFormatted = document.getElementById("stat-formatted-size");
    const elSavings = document.getElementById("stat-savings");

    if (elOriginal)
      elOriginal.textContent = FormatterUtils.formatBytes(originalBytes);
    if (elFormatted)
      elFormatted.textContent = FormatterUtils.formatBytes(formattedBytes);
    if (elSavings) {
      const pct =
        originalBytes > 0
          ? ((savedBytes / originalBytes) * 100).toFixed(1)
          : "0";
      elSavings.textContent = `${FormatterUtils.formatBytes(savedBytes)} (${pct}%)`;
    }
  }
}
