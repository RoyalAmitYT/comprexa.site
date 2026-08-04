// @ts-nocheck
/**
 * JSON Validator UI Controller (Independent Implementation)
 * Manages Universal Code Editor, instant validation, diagnostic status banner with error line highlighting,
 * node metrics grid (Objects, Arrays, Keys, Size), and sample/file management.
 */

import { UniversalCodeEditor } from "../code-editor.js";
import { ValidatorEngine } from "./validator-engine.js";
import { ValidatorUtils } from "./utils.js";

export class ValidatorUIController {
  constructor() {
    this.sampleValid = {
      product: "Comprexa Developer Suite",
      active: true,
      statusCode: 200,
      tags: ["json", "validator", "developer", "utility"],
      metrics: {
        totalChecks: 1420,
        avgLatencyMs: 0.12,
        serverless: true,
      },
      contributors: [
        { id: 101, role: "Maintainer" },
        { id: 102, role: "Reviewer" },
      ],
    };

    this.sampleInvalid = `{
  "product": "Comprexa Developer Suite",
  "active": true,
  "statusCode": 200,
  "tags": ["json", "validator", "developer"],
  "metrics": {
    "totalChecks": 1420,
    "avgLatencyMs": 0.12,
  }
}`;

    this.init();
  }

  init() {
    const editorContainer = document.getElementById("json-editor-container");
    if (!editorContainer) {
      return;
    }

    this.editor = UniversalCodeEditor.attach(editorContainer, {
      placeholder:
        "Paste raw JSON code here to validate syntax instantly, or drag & drop a .json file...",
      minHeight: "380px",
      maxHeight: "550px",
      onInput: () => this.handleLiveValidation(),
      onFileDrop: (file) => this.handleFileUpload(file),
    });

    this.statusBanner = document.getElementById("dev-status-banner");
    this.fileUploadInput = document.getElementById("file-upload-input");
    this.activeFileBanner = document.getElementById("active-file-banner");

    if (this.fileUploadInput) {
      this.fileUploadInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
          e.target.value = "";
        }
      });
    }

    this.bindToolbarButtons();
    this.handleLiveValidation();
  }

  bindToolbarButtons() {
    const btnSampleValid = document.getElementById("btn-sample-valid");
    if (btnSampleValid) {
      btnSampleValid.addEventListener("click", () => {
        this.editor.setValue(JSON.stringify(this.sampleValid, null, 2));
        this.handleLiveValidation();
        ValidatorUtils.showToast("Loaded valid JSON sample", "info");
      });
    }

    const btnSampleInvalid = document.getElementById("btn-sample-invalid");
    if (btnSampleInvalid) {
      btnSampleInvalid.addEventListener("click", () => {
        this.editor.setValue(this.sampleInvalid);
        this.handleLiveValidation();
        ValidatorUtils.showToast("Loaded invalid JSON sample", "warning");
      });
    }

    const btnClear = document.getElementById("btn-clear");
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        this.editor.setValue("");
        this.editor.clearErrorLine();
        this.clearStatusBanner();
        this.clearFileBanner();
        this.updateMetrics(
          { objects: 0, arrays: 0, keys: 0, maxDepth: 0, byteSize: 0 },
          null,
        );
        ValidatorUtils.showToast("Cleared editor", "info");
      });
    }

    const btnCopy = document.getElementById("btn-copy");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        ValidatorUtils.copyToClipboard(this.editor.getValue());
      });
    }

    const btnDownload = document.getElementById("btn-download");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        const text = this.editor.getValue();
        if (!text) {
          ValidatorUtils.showToast("Nothing to download", "warning");
          return;
        }
        ValidatorUtils.downloadFile(text, "validated.json");
      });
    }
  }

  handleLiveValidation() {
    const rawText = this.editor.getValue();

    if (!rawText || !rawText.trim()) {
      this.editor.clearErrorLine();
      this.clearStatusBanner();
      this.updateMetrics(
        { objects: 0, arrays: 0, keys: 0, maxDepth: 0, byteSize: 0 },
        null,
      );
      return;
    }

    const result = ValidatorEngine.validate(rawText);

    if (result.isValid === true) {
      this.editor.clearErrorLine();
      this.renderStatusBanner(true, null);
      this.updateMetrics(result.stats, true);
    } else if (result.isValid === false) {
      const err = result.error;
      if (err && err.line) {
        this.editor.setErrorLine(err.line);
      } else {
        this.editor.clearErrorLine();
      }
      this.renderStatusBanner(false, err);
      this.updateMetrics(result.stats, false);
    }
  }

  handleFileUpload(file) {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "json" && ext !== "txt") {
      ValidatorUtils.showToast("Please upload a valid .json file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.editor.setValue(text);
      this.renderFileBanner(file.name, file.size);
      this.handleLiveValidation();
      ValidatorUtils.showToast(`Uploaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      ValidatorUtils.showToast("Error reading uploaded file", "error");
    };
    reader.readAsText(file);
  }

  renderFileBanner(name, size) {
    if (!this.activeFileBanner) return;
    this.activeFileBanner.style.display = "flex";
    this.activeFileBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${name} (${ValidatorUtils.formatBytes(size)})</span>
      </div>
      <button type="button" class="btn btn--ghost btn--sm" id="btn-remove-file" title="Remove File" style="padding: 2px 8px; font-size: 0.75rem;">
        ✕ Clear File
      </button>
    `;

    const btnRemove = document.getElementById("btn-remove-file");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        this.clearFileBanner();
        this.editor.setValue("");
        this.handleLiveValidation();
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
          <div class="dev-status-banner__title" style="color: #10b981;">✓ Valid JSON Document</div>
          <div>All brackets, quotes, keys, and values comply strictly with RFC 8259 specifications.</div>
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
            <span>❌ Invalid JSON</span>
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

  updateMetrics(stats, isValid) {
    const updateEl = (id, val) => {
      const el = document.getElementById(id);
      if (el)
        el.textContent = typeof val === "number" ? val.toLocaleString() : val;
    };

    const statusBadge = document.getElementById("stat-syntax-status");
    if (statusBadge) {
      if (isValid === true) {
        statusBadge.textContent = "✓ Valid";
        statusBadge.style.color = "#10b981";
      } else if (isValid === false) {
        statusBadge.textContent = "❌ Invalid";
        statusBadge.style.color = "#ef4444";
      } else {
        statusBadge.textContent = "—";
        statusBadge.style.color = "var(--text-muted)";
      }
    }

    updateEl("stat-objects", stats.objects || 0);
    updateEl("stat-arrays", stats.arrays || 0);
    updateEl("stat-keys", stats.keys || 0);
    updateEl("stat-file-size", ValidatorUtils.formatBytes(stats.byteSize || 0));
  }
}
