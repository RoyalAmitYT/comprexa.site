/**
 * UI Controller for JSON Tree Viewer
 */

import { TreeEngine } from "./tree-engine.js";
import { TreeUtils } from "./utils.js";

export class TreeUIController {
  constructor() {
    this.editor = null;
    this.currentData = null;
    this.searchQuery = "";
    this.expandedPaths = new Set(["$"]); // '$' represents root node
    this.history = [];
    this.historyIndex = -1;

    this.sampleJson = {
      appName: "Comprexa Developer Tools",
      version: "2.4.0",
      active: true,
      statusCode: 200,
      features: [
        "Interactive Tree Inspection",
        "Key & Value Search",
        "Path & Value Copying",
        "Instant Syntax Validation",
      ],
      userConfig: {
        theme: "light",
        tabSize: 2,
        autoValidate: true,
        maxDepth: 10,
        notifications: {
          email: false,
          push: true,
          types: ["security", "updates"],
        },
      },
      meta: null,
      analytics: {
        totalRequests: 15420,
        avgResponseTimeMs: 14.8,
        regions: ["us-east", "eu-west", "ap-south"],
      },
    };

    this.initDOM();
    this.initEditor();
    this.bindEvents();
    this.loadInitialValue();
  }

  initDOM() {
    this.statusBanner = document.getElementById("dev-status-banner");
    this.treeContainer = document.getElementById("json-tree-mount");
    this.searchContainer = document.getElementById("tree-search-container");
    this.searchInput = document.getElementById("tree-search-input");
    this.searchCountBadge = document.getElementById("tree-search-count");

    // Stats elements
    this.statObjects = document.getElementById("stat-objects");
    this.statArrays = document.getElementById("stat-arrays");
    this.statKeys = document.getElementById("stat-keys");
    this.statDepth = document.getElementById("stat-depth");
    this.statSize = document.getElementById("stat-size");

    // Controls
    this.btnExpandAll = document.getElementById("btn-expand-all");
    this.btnCollapseAll = document.getElementById("btn-collapse-all");
    this.btnCopyPathRoot = document.getElementById("btn-copy-path");
    this.btnCopyRaw = document.getElementById("btn-copy-raw");
    this.btnDownload = document.getElementById("btn-download");
    this.btnClear = document.getElementById("btn-clear");
    this.btnSample = document.getElementById("btn-sample");
    this.btnUpload = document.getElementById("btn-upload-file");
    this.fileInput = document.getElementById("file-input-hidden");
  }

  initEditor() {
    const container = document.getElementById("json-editor-container");
    if (!container) return;

    this.editor = new window.UniversalCodeEditor(container, {
      placeholder: "Paste, type, or drop JSON code here...",
      minHeight: "400px",
      maxHeight: "600px",
      indentSize: 2,
      onInput: (value) => {
        this.handleEditorChange(value);
      },
      onFileDrop: (file) => {
        this.readFile(file);
      },
    });
  }

  bindEvents() {
    // Toolbar buttons
    if (this.btnExpandAll) {
      this.btnExpandAll.addEventListener("click", () => this.expandAll());
    }
    if (this.btnCollapseAll) {
      this.btnCollapseAll.addEventListener("click", () => this.collapseAll());
    }
    if (this.btnCopyRaw) {
      this.btnCopyRaw.addEventListener("click", () => this.copyRawJson());
    }
    if (this.btnDownload) {
      this.btnDownload.addEventListener("click", () => this.downloadJson());
    }
    if (this.btnClear) {
      this.btnClear.addEventListener("click", () => this.clearEditor());
    }
    if (this.btnSample) {
      this.btnSample.addEventListener("click", () => this.loadSample());
    }

    // File Upload
    if (this.btnUpload && this.fileInput) {
      this.btnUpload.addEventListener("click", () => this.fileInput.click());
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.readFile(e.target.files[0]);
          e.target.value = "";
        }
      });
    }

    // Search Input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderTree();
      });
    }
  }

  loadInitialValue() {
    const initialText = JSON.stringify(this.sampleJson, null, 2);
    if (this.editor) {
      this.editor.setValue(initialText);
      this.handleEditorChange(initialText);
    }
  }

  loadSample() {
    const sampleText = JSON.stringify(this.sampleJson, null, 2);
    if (this.editor) {
      this.editor.setValue(sampleText);
      this.handleEditorChange(sampleText);
      TreeUtils.showToast("Loaded sample JSON", "info");
    }
  }

  clearEditor() {
    if (this.editor) {
      this.editor.setValue("");
      this.handleEditorChange("");
      TreeUtils.showToast("Cleared JSON input", "info");
    }
  }

  readFile(file) {
    if (!file) return;
    if (
      !file.name.endsWith(".json") &&
      !file.name.endsWith(".txt") &&
      file.type !== "application/json"
    ) {
      TreeUtils.showToast("Please select a valid .json or .txt file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (this.editor) {
        this.editor.setValue(content);
        this.handleEditorChange(content);
        TreeUtils.showToast(`Loaded file: ${file.name}`, "success");
      }
    };
    reader.onerror = () => {
      TreeUtils.showToast("Failed to read file", "error");
    };
    reader.readAsText(file);
  }

  handleEditorChange(value) {
    const rawText = value || "";
    const result = TreeEngine.parse(rawText);

    if (result.isValid === null) {
      // Empty input
      this.currentData = null;
      if (this.editor) this.editor.clearErrorLine();
      this.updateStatusBanner("empty");
      this.updateStats({ objects: 0, arrays: 0, keys: 0, depth: 0 }, 0);
      this.renderEmptyTree(
        "Enter or paste JSON above to inspect its interactive tree structure.",
      );
      return;
    }

    if (!result.isValid) {
      this.currentData = null;
      if (this.editor) this.editor.setErrorLine(result.error.line);
      this.updateStatusBanner("error", result.error);
      this.updateStats(result.stats, rawText.length);
      this.renderEmptyTree(
        `Invalid JSON syntax at Line ${result.error.line}, Col ${result.error.column}`,
      );
      return;
    }

    // Valid JSON
    this.currentData = result.data;
    if (this.editor) this.editor.clearErrorLine();
    this.updateStatusBanner("valid", null, result.stats);
    this.updateStats(result.stats, new Blob([rawText]).size);

    // Default expand root + first level if newly parsed
    if (this.expandedPaths.size <= 1) {
      this.expandDefaultLevels(result.data, "$", 2);
    }

    this.renderTree();
  }

  expandDefaultLevels(node, path, maxLevel, currentLevel = 1) {
    if (currentLevel > maxLevel) return;
    this.expandedPaths.add(path);

    if (node && typeof node === "object") {
      const isArr = Array.isArray(node);
      const keys = isArr ? node.map((_, i) => i) : Object.keys(node);
      for (const k of keys) {
        const childPath = `${path}.${k}`;
        if (typeof node[k] === "object" && node[k] !== null) {
          this.expandDefaultLevels(
            node[k],
            childPath,
            maxLevel,
            currentLevel + 1,
          );
        }
      }
    }
  }

  updateStatusBanner(state, error = null, stats = null) {
    if (!this.statusBanner) return;

    if (state === "empty") {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--neutral";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__content">
          <svg class="dev-status-banner__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span class="dev-status-banner__text">Awaiting JSON input...</span>
        </div>
      `;
    } else if (state === "error" && error) {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--error";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__content">
          <svg class="dev-status-banner__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Syntax Error (Line ${error.line}, Column ${error.column}):</strong> ${this.escapeHtml(error.message)}
          </div>
        </div>
      `;
    } else if (state === "valid" && stats) {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--success";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__content">
          <svg class="dev-status-banner__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <strong>Valid JSON</strong> — Parsed successfully (${stats.objects} objects, ${stats.arrays} arrays, ${stats.keys} keys)
          </div>
        </div>
      `;
    }
  }

  updateStats(stats, bytes) {
    if (this.statObjects) this.statObjects.textContent = stats.objects;
    if (this.statArrays) this.statArrays.textContent = stats.arrays;
    if (this.statKeys) this.statKeys.textContent = stats.keys;
    if (this.statDepth) this.statDepth.textContent = stats.depth;
    if (this.statSize) this.statSize.textContent = TreeUtils.formatBytes(bytes);
  }

  renderEmptyTree(message) {
    if (!this.treeContainer) return;
    this.treeContainer.innerHTML = `
      <div class="json-tree-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
    if (this.searchCountBadge) this.searchCountBadge.textContent = "0 matches";
  }

  renderTree() {
    if (!this.treeContainer || this.currentData === null) {
      this.renderEmptyTree("No valid JSON data to display.");
      return;
    }

    this.treeContainer.innerHTML = "";
    const rootWrapper = document.createElement("div");
    rootWrapper.className = "json-tree-root";

    let matchCount = 0;
    const searchLow = this.searchQuery.toLowerCase();

    // If searching, auto-expand matching nodes
    if (searchLow) {
      this.autoExpandSearchResults(this.currentData, "$", searchLow);
    }

    const treeDOM = this.createNodeDOM(
      "root",
      this.currentData,
      "$",
      searchLow,
      (isMatch) => {
        if (isMatch) matchCount++;
      },
    );

    rootWrapper.appendChild(treeDOM);
    this.treeContainer.appendChild(rootWrapper);

    if (this.searchCountBadge) {
      if (searchLow) {
        this.searchCountBadge.textContent = `${matchCount} ${matchCount === 1 ? "match" : "matches"}`;
        this.searchCountBadge.style.display = "inline-block";
      } else {
        this.searchCountBadge.style.display = "none";
      }
    }
  }

  autoExpandSearchResults(node, path, searchLow) {
    let hasMatchInChild = false;

    if (node === null || typeof node !== "object") {
      const valStr = String(node).toLowerCase();
      if (valStr.includes(searchLow)) {
        return true;
      }
      return false;
    }

    const isArr = Array.isArray(node);
    const keys = isArr ? node.map((_, i) => i) : Object.keys(node);

    for (const key of keys) {
      const keyStr = String(key).toLowerCase();
      const childPath = `${path}.${key}`;
      const val = node[key];

      let keyMatches = keyStr.includes(searchLow);
      let childMatches = this.autoExpandSearchResults(
        val,
        childPath,
        searchLow,
      );

      if (keyMatches || childMatches) {
        hasMatchInChild = true;
      }
    }

    if (hasMatchInChild) {
      this.expandedPaths.add(path);
    }

    return hasMatchInChild;
  }

  createNodeDOM(keyName, value, path, searchLow, onMatch) {
    const nodeEl = document.createElement("div");
    nodeEl.className = "tree-node";

    const isObject = value !== null && typeof value === "object";
    const isArray = Array.isArray(value);
    const isExpanded = this.expandedPaths.has(path);

    // Row Container
    const rowEl = document.createElement("div");
    rowEl.className = "tree-node__row";

    // Key match or value match checking
    const keyStr = String(keyName);
    const valStr = isObject ? "" : String(value);
    const keyMatches = searchLow && keyStr.toLowerCase().includes(searchLow);
    const valMatches =
      searchLow && !isObject && valStr.toLowerCase().includes(searchLow);

    if (keyMatches || valMatches) {
      rowEl.classList.add("tree-node__row--matched");
      if (onMatch) onMatch(true);
    }

    // Toggle button (for objects/arrays)
    if (isObject) {
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = `tree-node__toggle ${isExpanded ? "tree-node__toggle--expanded" : ""}`;
      toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePath(path);
      });
      rowEl.appendChild(toggleBtn);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "tree-node__spacer";
      rowEl.appendChild(spacer);
    }

    // Key label
    if (keyName !== "root") {
      const keyEl = document.createElement("span");
      keyEl.className = "tree-node__key";
      keyEl.innerHTML =
        this.highlightText(keyStr, searchLow) +
        '<span class="tree-node__colon">:</span>';
      rowEl.appendChild(keyEl);
    }

    // Value or Composite Badge
    if (isObject) {
      const typeBadge = document.createElement("span");
      typeBadge.className = `tree-node__badge tree-node__badge--${isArray ? "array" : "object"}`;

      const itemCount = isArray ? value.length : Object.keys(value).length;
      const bracketOpen = isArray ? "[" : "{";
      const bracketClose = isArray ? "]" : "}";

      typeBadge.textContent = isExpanded
        ? bracketOpen
        : `${bracketOpen} ${itemCount} ${itemCount === 1 ? "item" : "items"} ${bracketClose}`;

      rowEl.appendChild(typeBadge);
    } else {
      const valueEl = document.createElement("span");
      const valType = value === null ? "null" : typeof value;
      valueEl.className = `tree-node__value tree-node__value--${valType}`;

      let displayVal = JSON.stringify(value);
      if (valType === "string") {
        displayVal = `"${value}"`;
      }

      valueEl.innerHTML = this.highlightText(displayVal, searchLow);
      rowEl.appendChild(valueEl);
    }

    // Action Buttons (Copy Path, Copy Value)
    const actionsEl = document.createElement("div");
    actionsEl.className = "tree-node__actions";

    const btnCopyPath = document.createElement("button");
    btnCopyPath.type = "button";
    btnCopyPath.className = "tree-node__action-btn";
    btnCopyPath.title = `Copy JSON Path (${path})`;
    btnCopyPath.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Path`;
    btnCopyPath.addEventListener("click", (e) => {
      e.stopPropagation();
      TreeUtils.copyToClipboard(path);
      TreeUtils.showToast(`Copied Path: ${path}`, "success");
    });

    const btnCopyValue = document.createElement("button");
    btnCopyValue.type = "button";
    btnCopyValue.className = "tree-node__action-btn";
    btnCopyValue.title = "Copy Node Value";
    btnCopyValue.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Value`;
    btnCopyValue.addEventListener("click", (e) => {
      e.stopPropagation();
      const valToCopy = isObject
        ? JSON.stringify(value, null, 2)
        : String(value);
      TreeUtils.copyToClipboard(valToCopy);
      TreeUtils.showToast("Copied node value to clipboard", "success");
    });

    actionsEl.appendChild(btnCopyPath);
    actionsEl.appendChild(btnCopyValue);
    rowEl.appendChild(actionsEl);

    nodeEl.appendChild(rowEl);

    // Render Children if Expanded
    if (isObject && isExpanded) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-node__children";

      const keys = isArray ? value.map((_, i) => i) : Object.keys(value);
      for (const k of keys) {
        const childPath = `${path}.${k}`;
        const childDOM = this.createNodeDOM(
          k,
          value[k],
          childPath,
          searchLow,
          onMatch,
        );
        childrenContainer.appendChild(childDOM);
      }

      // Closing bracket row
      const closingRow = document.createElement("div");
      closingRow.className = "tree-node__closing-row";
      closingRow.textContent = isArray ? "]" : "}";
      childrenContainer.appendChild(closingRow);

      nodeEl.appendChild(childrenContainer);
    }

    return nodeEl;
  }

  highlightText(text, searchLow) {
    if (!searchLow) return this.escapeHtml(text);
    const escapedText = this.escapeHtml(text);
    const lowText = text.toLowerCase();
    const idx = lowText.indexOf(searchLow);
    if (idx === -1) return escapedText;

    const before = this.escapeHtml(text.substring(0, idx));
    const match = this.escapeHtml(text.substring(idx, idx + searchLow.length));
    const after = this.escapeHtml(text.substring(idx + searchLow.length));

    return `${before}<mark class="tree-search-highlight">${match}</mark>${after}`;
  }

  togglePath(path) {
    if (this.expandedPaths.has(path)) {
      this.expandedPaths.delete(path);
    } else {
      this.expandedPaths.add(path);
    }
    this.renderTree();
  }

  expandAll() {
    if (!this.currentData) return;
    this.collectAllPaths(this.currentData, "$");
    this.renderTree();
    TreeUtils.showToast("Expanded all nodes", "info");
  }

  collectAllPaths(node, path) {
    this.expandedPaths.add(path);
    if (node && typeof node === "object") {
      const isArr = Array.isArray(node);
      const keys = isArr ? node.map((_, i) => i) : Object.keys(node);
      for (const k of keys) {
        this.collectAllPaths(node[k], `${path}.${k}`);
      }
    }
  }

  collapseAll() {
    this.expandedPaths.clear();
    this.expandedPaths.add("$"); // keep root
    this.renderTree();
    TreeUtils.showToast("Collapsed all nodes", "info");
  }

  copyRawJson() {
    if (!this.editor) return;
    const text = this.editor.getValue();
    if (!text) {
      TreeUtils.showToast("Nothing to copy", "error");
      return;
    }
    TreeUtils.copyToClipboard(text);
    TreeUtils.showToast("Copied JSON to clipboard", "success");
  }

  downloadJson() {
    if (!this.editor) return;
    const text = this.editor.getValue();
    if (!text) {
      TreeUtils.showToast("Nothing to download", "error");
      return;
    }
    TreeUtils.downloadFile(text, "data.json");
    TreeUtils.showToast("Downloaded JSON file", "success");
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
