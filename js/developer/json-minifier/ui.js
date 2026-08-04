// @ts-nocheck
/**
 * JSON Minifier UI Controller
 * Integrates UniversalCodeEditor for input and output, live minification, space savings metrics,
 * error line highlighting, active file management, and export actions.
 */

import { UniversalCodeEditor } from "../code-editor.js";
import { MinifierEngine } from "./minifier-engine.js";
import { MinifierUtils } from "./utils.js";

export class MinifierUIController {
  constructor() {
    this.sampleExpanded = {
      product: "Comprexa Core API",
      version: "2.4.0",
      active: true,
      endpoints: [
        {
          path: "/v1/format/json",
          method: "POST",
          rateLimit: 1000,
          description: "High speed local client formatting",
        },
        {
          path: "/v1/minify/json",
          method: "POST",
          rateLimit: 1000,
          description: "Payload whitespace removal",
        },
      ],
      config: {
        cacheControl: "max-age=3600",
        enableGzip: true,
        cors: "*",
      },
    };

    this.init();
  }

  init() {
    const inputContainer = document.getElementById("json-input-editor");
    const outputContainer = document.getElementById("json-output-editor");

    if (!inputContainer || !outputContainer) {
      return;
    }

    this.inputEditor = UniversalCodeEditor.attach(inputContainer, {
      placeholder:
        "Paste raw or expanded JSON code here to minify instantly, or drop a .json file...",
      minHeight: "320px",
      maxHeight: "520px",
      onInput: () => this.handleLiveMinification(),
      onFileDrop: (file) => this.handleFileUpload(file),
    });

    this.outputEditor = UniversalCodeEditor.attach(outputContainer, {
      placeholder: "Minified JSON code will appear here automatically...",
      minHeight: "320px",
      maxHeight: "520px",
      readOnly: true,
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
    this.handleLiveMinification();
  }

  bindToolbarButtons() {
    const btnSample = document.getElementById("btn-sample");
    if (btnSample) {
      btnSample.addEventListener("click", () => {
        this.inputEditor.setValue(JSON.stringify(this.sampleExpanded, null, 2));
        this.handleLiveMinification();
        MinifierUtils.showToast("Loaded sample JSON payload", "info");
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
        this.updateMetrics({
          origSize: 0,
          minSize: 0,
          savedBytes: 0,
          savedPercent: 0,
        });
        MinifierUtils.showToast("Cleared editors", "info");
      });
    }

    const btnCopy = document.getElementById("btn-copy");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const outputText = this.outputEditor.getValue();
        if (!outputText) {
          MinifierUtils.showToast("No minified output to copy", "warning");
          return;
        }
        MinifierUtils.copyToClipboard(outputText);
      });
    }

    const btnDownload = document.getElementById("btn-download");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        const outputText = this.outputEditor.getValue();
        if (!outputText) {
          MinifierUtils.showToast("No minified output to download", "warning");
          return;
        }
        MinifierUtils.downloadFile(outputText, "minified.json");
      });
    }
  }

  handleLiveMinification() {
    const rawText = this.inputEditor.getValue();

    if (!rawText || !rawText.trim()) {
      this.inputEditor.clearErrorLine();
      this.outputEditor.setValue("");
      this.clearStatusBanner();
      this.updateMetrics({
        origSize: 0,
        minSize: 0,
        savedBytes: 0,
        savedPercent: 0,
      });
      return;
    }

    const result = MinifierEngine.minify(rawText);

    if (result.isValid === true) {
      this.inputEditor.clearErrorLine();
      this.outputEditor.setValue(result.minifiedText);
      this.renderStatusBanner(true, null);
      this.updateMetrics(result.stats);
    } else if (result.isValid === false) {
      const err = result.error;
      if (err && err.line) {
        this.inputEditor.setErrorLine(err.line);
      } else {
        this.inputEditor.clearErrorLine();
      }
      this.outputEditor.setValue("");
      this.renderStatusBanner(false, err);
      this.updateMetrics(result.stats);
    }
  }

  handleFileUpload(file) {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "json" && ext !== "txt") {
      MinifierUtils.showToast("Please upload a valid .json file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.inputEditor.setValue(text);
      this.renderFileBanner(file.name, file.size);
      this.handleLiveMinification();
      MinifierUtils.showToast(`Uploaded ${file.name}`, "success");
    };
    reader.onerror = () => {
      MinifierUtils.showToast("Error reading uploaded file", "error");
    };
    reader.readAsText(file);
  }

  renderFileBanner(name, size) {
    if (!this.activeFileBanner) return;
    this.activeFileBanner.style.display = "flex";
    this.activeFileBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${name} (${MinifierUtils.formatBytes(size)})</span>
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
        this.handleLiveMinification();
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
          <div class="dev-status-banner__title" style="color: #10b981;">✓ Valid JSON — Minified Instantly</div>
          <div>All whitespace and line breaks removed while preserving exact document data.</div>
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

  updateMetrics(stats) {
    const updateEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const origSize = stats.origSize || 0;
    const minSize = stats.minSize || 0;
    const savedBytes = stats.savedBytes || 0;
    const savedPercent = stats.savedPercent || 0;

    updateEl("stat-orig-size", MinifierUtils.formatBytes(origSize));
    updateEl("stat-min-size", MinifierUtils.formatBytes(minSize));
    updateEl("stat-saved-bytes", MinifierUtils.formatBytes(savedBytes));
    updateEl("stat-saved-percent", `${savedPercent}%`);

    const barEl = document.getElementById("savings-bar");
    if (barEl) {
      barEl.style.width = `${Math.min(100, Math.max(0, savedPercent))}%`;
    }
  }
}
