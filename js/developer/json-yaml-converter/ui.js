// @ts-nocheck
/**
 * JSON ↔ YAML Converter UI Controller
 * Manages dual UniversalCodeEditors, format auto-detection, live conversion, direction swapping,
 * active file banner, status banner, and file downloads.
 */

import { UniversalCodeEditor } from "../code-editor.js";
import { ConverterEngine } from "./converter-engine.js";
import { ConverterUtils } from "./utils.js";

export class ConverterUIController {
  constructor() {
    this.sampleJson = {
      server: {
        host: "api.comprexa.app",
        port: 8080,
        ssl: true,
        cluster: ["us-east-1", "us-west-2", "eu-central-1"],
      },
      database: {
        driver: "postgres",
        poolSize: 20,
        timeoutMs: 5000,
        credentials: {
          username: "comprexa_admin",
          vaultKey: "secret/db/prod",
        },
      },
      features: {
        developerTools: true,
        aiOptimization: false,
        maxPayloadMb: 10,
      },
    };

    this.sampleYaml = `server:
  host: api.comprexa.app
  port: 8080
  ssl: true
  cluster:
    - us-east-1
    - us-west-2
    - eu-central-1
database:
  driver: postgres
  poolSize: 20
  timeoutMs: 5000
  credentials:
    username: comprexa_admin
    vaultKey: secret/db/prod
features:
  developerTools: true
  aiOptimization: false
  maxPayloadMb: 10`;

    this.init();
  }

  init() {
    const inputContainer = document.getElementById("converter-input-editor");
    const outputContainer = document.getElementById("converter-output-editor");

    if (!inputContainer || !outputContainer) {
      return;
    }

    this.inputEditor = UniversalCodeEditor.attach(inputContainer, {
      placeholder:
        "Paste JSON or YAML code here to convert instantly, or drag & drop a .json / .yaml file...",
      minHeight: "340px",
      maxHeight: "540px",
      onInput: () => this.handleLiveConversion(),
      onFileDrop: (file) => this.handleFileUpload(file),
    });

    this.outputEditor = UniversalCodeEditor.attach(outputContainer, {
      placeholder: "Converted code will appear here automatically...",
      minHeight: "340px",
      maxHeight: "540px",
      readOnly: true,
    });

    this.modeSelect = document.getElementById("conversion-mode");
    this.indentSelect = document.getElementById("indent-select");
    this.statusBanner = document.getElementById("dev-status-banner");
    this.fileUploadInput = document.getElementById("file-upload-input");
    this.activeFileBanner = document.getElementById("active-file-banner");
    this.inputTitle = document.getElementById("input-panel-title");
    this.outputTitle = document.getElementById("output-panel-title");
    this.detectedBadge = document.getElementById("detected-format-badge");

    if (this.modeSelect) {
      this.modeSelect.addEventListener("change", () =>
        this.handleLiveConversion(),
      );
    }

    if (this.indentSelect) {
      this.indentSelect.addEventListener("change", () =>
        this.handleLiveConversion(),
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

    this.bindToolbarButtons();
    this.handleLiveConversion();
  }

  bindToolbarButtons() {
    const btnSampleJson = document.getElementById("btn-sample-json");
    if (btnSampleJson) {
      btnSampleJson.addEventListener("click", () => {
        if (this.modeSelect) this.modeSelect.value = "json-to-yaml";
        this.inputEditor.setValue(JSON.stringify(this.sampleJson, null, 2));
        this.handleLiveConversion();
        ConverterUtils.showToast("Loaded sample JSON payload", "info");
      });
    }

    const btnSampleYaml = document.getElementById("btn-sample-yaml");
    if (btnSampleYaml) {
      btnSampleYaml.addEventListener("click", () => {
        if (this.modeSelect) this.modeSelect.value = "yaml-to-json";
        this.inputEditor.setValue(this.sampleYaml);
        this.handleLiveConversion();
        ConverterUtils.showToast("Loaded sample YAML document", "info");
      });
    }

    const btnSwap = document.getElementById("btn-swap");
    if (btnSwap) {
      btnSwap.addEventListener("click", () => {
        this.swapInputOutput();
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
        this.updatePanelTitles("json-to-yaml");
        ConverterUtils.showToast("Cleared editors", "info");
      });
    }

    const btnCopy = document.getElementById("btn-copy");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const outputText = this.outputEditor.getValue();
        if (!outputText) {
          ConverterUtils.showToast("No converted output to copy", "warning");
          return;
        }
        ConverterUtils.copyToClipboard(outputText);
      });
    }

    const btnDownload = document.getElementById("btn-download");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        const outputText = this.outputEditor.getValue();
        if (!outputText) {
          ConverterUtils.showToast(
            "No converted output to download",
            "warning",
          );
          return;
        }
        const selectedMode = this.modeSelect ? this.modeSelect.value : "auto";
        const isYamlOutput = this.lastActualMode === "json-to-yaml";
        const filename = isYamlOutput ? "converted.yaml" : "converted.json";
        ConverterUtils.downloadFile(outputText, filename);
      });
    }
  }

  swapInputOutput() {
    const outputText = this.outputEditor.getValue();
    if (!outputText || !outputText.trim()) {
      // Toggle mode if empty
      if (this.modeSelect) {
        this.modeSelect.value =
          this.modeSelect.value === "yaml-to-json"
            ? "json-to-yaml"
            : "yaml-to-json";
        this.handleLiveConversion();
      }
      return;
    }

    // Toggle mode explicitly
    if (this.modeSelect) {
      this.modeSelect.value =
        this.lastActualMode === "json-to-yaml"
          ? "yaml-to-json"
          : "json-to-yaml";
    }

    this.inputEditor.setValue(outputText);
    this.handleLiveConversion();
    ConverterUtils.showToast("Swapped input & output direction!", "info");
  }

  handleLiveConversion() {
    const rawText = this.inputEditor.getValue();

    if (!rawText || !rawText.trim()) {
      this.inputEditor.clearErrorLine();
      this.outputEditor.setValue("");
      this.clearStatusBanner();
      const selectedMode = this.modeSelect ? this.modeSelect.value : "auto";
      this.updatePanelTitles(
        selectedMode === "auto" ? "json-to-yaml" : selectedMode,
        selectedMode,
      );
      return;
    }

    const requestedMode = this.modeSelect ? this.modeSelect.value : "auto";
    const indent = this.indentSelect
      ? parseInt(this.indentSelect.value, 10)
      : 2;

    const result = ConverterEngine.convert(rawText, requestedMode, indent);
    this.lastActualMode = result.actualMode;

    this.updatePanelTitles(result.actualMode, requestedMode);

    if (result.isValid === true) {
      this.inputEditor.clearErrorLine();
      this.outputEditor.setValue(result.outputText);
      this.renderStatusBanner(true, null, result.actualMode);
    } else if (result.isValid === false) {
      const err = result.error;
      if (err && err.line) {
        this.inputEditor.setErrorLine(err.line);
      } else {
        this.inputEditor.clearErrorLine();
      }
      this.outputEditor.setValue("");
      this.renderStatusBanner(false, err, result.actualMode);
    }
  }

  updatePanelTitles(actualMode, requestedMode = "auto") {
    if (actualMode === "json-to-yaml") {
      if (this.inputTitle) this.inputTitle.textContent = "JSON Input";
      if (this.outputTitle) this.outputTitle.textContent = "YAML Output";
    } else {
      if (this.inputTitle) this.inputTitle.textContent = "YAML Input";
      if (this.outputTitle) this.outputTitle.textContent = "JSON Output";
    }

    if (this.detectedBadge) {
      if (requestedMode === "auto") {
        const detectedFmt = actualMode === "json-to-yaml" ? "JSON" : "YAML";
        this.detectedBadge.style.display = "inline-flex";
        this.detectedBadge.textContent = `Auto-Detected: ${detectedFmt}`;
      } else {
        this.detectedBadge.style.display = "none";
      }
    }
  }

  handleFileUpload(file) {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["json", "yaml", "yml", "txt"].includes(ext)) {
      ConverterUtils.showToast("Please upload a .json or .yaml file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (ext === "json") {
        if (this.modeSelect) this.modeSelect.value = "json-to-yaml";
      } else if (ext === "yaml" || ext === "yml") {
        if (this.modeSelect) this.modeSelect.value = "yaml-to-json";
      }
      this.inputEditor.setValue(text);
      this.renderFileBanner(file.name, file.size);
      this.handleLiveConversion();
      ConverterUtils.showToast(`Uploaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      ConverterUtils.showToast("Error reading uploaded file", "error");
    };
    reader.readAsText(file);
  }

  renderFileBanner(name, size) {
    if (!this.activeFileBanner) return;
    this.activeFileBanner.style.display = "flex";
    this.activeFileBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${name} (${ConverterUtils.formatBytes(size)})</span>
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
        this.handleLiveConversion();
      });
    }
  }

  clearFileBanner() {
    if (this.activeFileBanner) {
      this.activeFileBanner.style.display = "none";
      this.activeFileBanner.innerHTML = "";
    }
  }

  renderStatusBanner(isValid, error, actualMode) {
    if (!this.statusBanner) return;

    const sourceFmt = actualMode === "json-to-yaml" ? "JSON" : "YAML";
    const targetFmt = actualMode === "json-to-yaml" ? "YAML" : "JSON";

    if (isValid === true) {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--valid";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__icon" style="color: #10b981;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="dev-status-banner__content">
          <div class="dev-status-banner__title" style="color: #10b981;">✓ Valid ${sourceFmt} — Converted to ${targetFmt}</div>
          <div>Data structure parsed cleanly and converted with selected indentation.</div>
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
          <div class="dev-status-banner__title" style="color: #ef4444;">
            <span>❌ Invalid ${sourceFmt}</span>
            <span class="dev-status-banner__location">${locStr}</span>
          </div>
          <div>${error ? error.message : `${sourceFmt} Syntax Error`}</div>
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
}
