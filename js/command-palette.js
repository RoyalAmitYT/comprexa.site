// @ts-nocheck
/**
 * Comprexa Global Command Palette System
 * Keyboard-first Cmd+K / Ctrl+K search overlay with instant fuzzy search,
 * category filters, arrow key navigation, focus trapping, recent searches, and accessibility.
 */

class ComprexaCommandPalette {
  constructor() {
    this.isOpen = false;
    this.searchEngine = window.ComprexaSearchEngine;
    this.activeCategory = "all";
    this.selectedIndex = -1;
    this.currentResults = [];

    // DOM References
    this.overlay = null;
    this.modal = null;
    this.input = null;
    this.resultsContainer = null;
    this.filterContainer = null;
    this.recentContainer = null;
    this.clearBtn = null;
  }

  /**
   * Initialize Command Palette listeners & DOM structure
   */
  init() {
    this._injectDOM();
    this._bindGlobalKeybindings();
    this._bindTriggers();
  }

  /**
   * Inject Command Palette DOM markup lazily into document body
   */
  _injectDOM() {
    if (document.getElementById("cmd-palette-overlay")) {
      this.overlay = document.getElementById("cmd-palette-overlay");
      this.modal = document.getElementById("cmd-palette-modal");
      this.input = document.getElementById("cmd-palette-input");
      this.resultsContainer = document.getElementById("cmd-palette-results");
      this.filterContainer = document.getElementById("cmd-palette-filters");
      this.recentContainer = document.getElementById("cmd-palette-recent");
      this.clearBtn = document.getElementById("cmd-palette-clear-btn");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "cmd-palette-overlay";
    overlay.className = "cmd-palette-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Global Tool Command Palette");

    overlay.innerHTML = `
      <div class="cmd-palette-modal" id="cmd-palette-modal">
        <!-- Palette Header / Search Input -->
        <div class="cmd-palette-header">
          <div class="cmd-palette-search-box">
            <svg class="cmd-palette-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>

            <input 
              type="text" 
              id="cmd-palette-input" 
              class="cmd-palette-input" 
              placeholder="Type to search tools, categories, or keywords... (e.g. merge pdf, json, qr code)" 
              autocomplete="off" 
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="cmd-palette-results"
            />

            <button type="button" id="cmd-palette-clear-btn" class="cmd-palette-clear-btn" aria-label="Clear Search Input" style="display: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <span class="cmd-palette-shortcut-badge">ESC to close</span>
          </div>

          <!-- Dynamic Category Filters Bar -->
          <div class="cmd-palette-filters" id="cmd-palette-filters" role="tablist" aria-label="Category Filters"></div>
        </div>

        <!-- Palette Body / Search Results -->
        <div class="cmd-palette-body">
          <!-- Recent Searches Section (Shown when query is empty) -->
          <div class="cmd-palette-recent" id="cmd-palette-recent"></div>

          <!-- Dynamic Results List -->
          <div class="cmd-palette-results" id="cmd-palette-results" role="listbox" aria-label="Search Results"></div>
        </div>

        <!-- Palette Footer / Keyboard Shortcuts Hint -->
        <div class="cmd-palette-footer">
          <div class="cmd-palette-hints">
            <span class="cmd-hint-item"><kbd class="cmd-kbd">↑</kbd><kbd class="cmd-kbd">↓</kbd> Navigate</span>
            <span class="cmd-hint-item"><kbd class="cmd-kbd">↵</kbd> Open Tool</span>
            <span class="cmd-hint-item"><kbd class="cmd-kbd">ESC</kbd> Close</span>
          </div>
          <div class="cmd-palette-footer-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a1 1 0 0 0 1 1h4"/><path d="m9 15 2 2 4-4"/></svg>
            <span>Comprexa Search</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.modal = document.getElementById("cmd-palette-modal");
    this.input = document.getElementById("cmd-palette-input");
    this.resultsContainer = document.getElementById("cmd-palette-results");
    this.filterContainer = document.getElementById("cmd-palette-filters");
    this.recentContainer = document.getElementById("cmd-palette-recent");
    this.clearBtn = document.getElementById("cmd-palette-clear-btn");

    this._bindModalEvents();
  }

  /**
   * Bind global keyboard shortcuts (Cmd+K / Ctrl+K and ESC)
   */
  _bindGlobalKeybindings() {
    window.addEventListener("keydown", (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      }
      // ESC key to close if open
      else if (e.key === "Escape" && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });
  }

  /**
   * Bind triggers from header search buttons or hero search boxes
   */
  _bindTriggers() {
    const headerBtn = document.getElementById("header-search-btn");
    if (headerBtn) {
      headerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    }

    // Hero Search Focus / Click Trigger
    const heroSearch = document.getElementById("hero-search");
    if (heroSearch) {
      heroSearch.addEventListener("click", () => {
        this.open();
      });
    }
  }

  /**
   * Bind internal modal interactive events
   */
  _bindModalEvents() {
    // Backdrop click to close
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Input Input event (Debounced)
    let debounceTimer;
    this.input.addEventListener("input", () => {
      const val = this.input.value;
      this.clearBtn.style.display = val.length > 0 ? "flex" : "none";

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.renderResults();
      }, 120);
    });

    // Clear Button Click
    this.clearBtn.addEventListener("click", () => {
      this.input.value = "";
      this.clearBtn.style.display = "none";
      this.input.focus();
      this.renderResults();
    });

    // Keyboard Navigation inside Modal (Up, Down, Enter)
    this.modal.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this._navigateSelection(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this._navigateSelection(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        this._triggerSelectedResult();
      } else if (e.key === "Tab") {
        this._trapFocus(e);
      }
    });
  }

  /**
   * Toggle Command Palette visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open Command Palette
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.overlay.classList.add("open");
    this.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("cmd-palette-open");

    // Make sure search engine index is populated
    if (
      this.searchEngine &&
      typeof this.searchEngine.buildIndex === "function"
    ) {
      this.searchEngine.buildIndex();
    }

    this.renderCategoryFilters();
    this.renderResults();

    // Focus input field
    setTimeout(() => {
      this.input.focus();
      this.input.select();
    }, 50);
  }

  /**
   * Close Command Palette
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.overlay.classList.remove("open");
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cmd-palette-open");
    this.selectedIndex = -1;
  }

  /**
   * Render Category Filter Pills
   */
  renderCategoryFilters() {
    if (!this.filterContainer) return;

    const categories = this.searchEngine
      ? this.searchEngine.getCategories()
      : [
          { id: "all", name: "All Tools" },
          { id: "pdf", name: "PDF Tools" },
          { id: "image", name: "Image Tools" },
          { id: "qr", name: "QR Code" },
          { id: "developer", name: "Developer" },
        ];

    this.filterContainer.innerHTML = categories
      .map(
        (cat) => `
      <button 
        type="button" 
        class="cmd-filter-pill ${this.activeCategory === cat.id ? "active" : ""}" 
        data-category="${cat.id}"
        role="tab"
        aria-selected="${this.activeCategory === cat.id}"
      >
        <span>${cat.name}</span>
        ${cat.count ? `<span class="cmd-filter-count">${cat.count}</span>` : ""}
      </button>
    `,
      )
      .join("");

    // Attach click handlers
    const filterPills =
      this.filterContainer.querySelectorAll(".cmd-filter-pill");
    filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        this.activeCategory = pill.dataset.category;
        this.renderCategoryFilters();
        this.renderResults();
      });
    });
  }

  /**
   * Render Recent Searches Section (when input is empty)
   */
  renderRecentSearches() {
    if (!this.recentContainer) return;

    const searches = this.searchEngine
      ? this.searchEngine.getRecentSearches()
      : [];

    if (searches.length === 0) {
      this.recentContainer.style.display = "none";
      this.recentContainer.innerHTML = "";
      return;
    }

    this.recentContainer.style.display = "block";
    this.recentContainer.innerHTML = `
      <div class="cmd-section-title-wrap">
        <span class="cmd-section-title">Recent Searches</span>
        <button type="button" class="cmd-recent-clear-all" id="cmd-recent-clear-all-btn">Clear All</button>
      </div>
      <div class="cmd-recent-tags">
        ${searches
          .map(
            (term) => `
          <div class="cmd-recent-chip" data-term="${this._escapeHTML(term)}">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="cmd-recent-text">${this._escapeHTML(term)}</span>
            <button type="button" class="cmd-recent-remove" aria-label="Remove recent search">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    // Click handlers for recent chips
    const chips = this.recentContainer.querySelectorAll(".cmd-recent-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", (e) => {
        if (e.target.closest(".cmd-recent-remove")) {
          e.stopPropagation();
          const term = chip.dataset.term;
          if (this.searchEngine) this.searchEngine.removeRecentSearch(term);
          this.renderRecentSearches();
          return;
        }
        this.input.value = chip.dataset.term;
        this.clearBtn.style.display = "flex";
        this.renderResults();
      });
    });

    const clearAllBtn = document.getElementById("cmd-recent-clear-all-btn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        if (this.searchEngine) this.searchEngine.clearRecentSearches();
        this.renderRecentSearches();
      });
    }
  }

  /**
   * Main Search Results Rendering Engine
   */
  renderResults() {
    if (!this.resultsContainer) return;

    const query = this.input.value.trim();

    // Render Recent Searches if query is empty
    if (!query) {
      this.renderRecentSearches();
    } else {
      this.recentContainer.style.display = "none";
    }

    // Perform Search
    const searchResults = this.searchEngine
      ? this.searchEngine.search(query, this.activeCategory)
      : [];
    this.currentResults = searchResults;
    this.selectedIndex = searchResults.length > 0 ? 0 : -1;

    // Zero Results / Empty State
    if (searchResults.length === 0) {
      const popularTools = this.searchEngine
        ? this.searchEngine.getPopularTools(4)
        : [];

      this.resultsContainer.innerHTML = `
        <div class="cmd-empty-state">
          <div class="cmd-empty-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
          <h3 class="cmd-empty-title">No tools found for "${this._escapeHTML(query)}"</h3>
          <p class="cmd-empty-desc">Try searching for keywords like "pdf merge", "json format", "resize image", or "qr code".</p>
          
          <div class="cmd-suggested-wrap" style="margin-top: 20px; width: 100%;">
            <div class="cmd-section-title" style="margin-bottom: 12px; text-align: left;">Suggested Popular Tools</div>
            <div class="cmd-results-list">
              ${popularTools.map((tool, idx) => this._renderResultItemHTML({ item: tool }, "", idx)).join("")}
            </div>
          </div>
        </div>
      `;

      this._bindItemClickHandlers();
      return;
    }

    // Render Scored Result Items
    const isPopularHeader = !query;
    this.resultsContainer.innerHTML = `
      ${isPopularHeader ? '<div class="cmd-section-title" style="padding: 8px 12px 4px 12px;">Popular & Recommended Tools</div>' : ""}
      <div class="cmd-results-list" role="listbox">
        ${searchResults.map((res, idx) => this._renderResultItemHTML(res, query, idx)).join("")}
      </div>
    `;

    this._bindItemClickHandlers();
    this._highlightSelectedItem();
  }

  /**
   * Render Single Result Item HTML
   */
  _renderResultItemHTML(res, query, index) {
    const tool = res.item;
    const titleHighlighted = this.searchEngine
      ? this.searchEngine.highlightMatch(tool.title, query)
      : tool.title;
    const descHighlighted = this.searchEngine
      ? this.searchEngine.highlightMatch(
          tool.desc || tool.shortDescription,
          query,
        )
      : tool.desc || tool.shortDescription;
    const categoryName = tool.categoryName || tool.category || "Utility";
    const colorClass = tool.colorClass || "icon-bg--pdf";
    const isSelected = index === this.selectedIndex;

    // Determine target URL (e.g. /merge-pdf.html or /tool-template.html?tool=slug)
    const targetUrl =
      typeof window.getToolUrl === "function"
        ? window.getToolUrl(tool)
        : `/${tool.slug || tool.id}.html`;

    return `
      <div 
        class="cmd-result-item ${isSelected ? "selected" : ""}" 
        data-index="${index}" 
        data-url="${targetUrl}"
        data-title="${this._escapeHTML(tool.title)}"
        role="option" 
        aria-selected="${isSelected}"
      >
        <div class="cmd-result-icon ${colorClass}" aria-hidden="true">
          ${tool.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`}
        </div>

        <div class="cmd-result-content">
          <div class="cmd-result-title-row">
            <span class="cmd-result-title">${titleHighlighted}</span>
            <span class="cmd-result-badge">${categoryName}</span>
            ${tool.badge ? `<span class="cmd-result-subbadge">${tool.badge}</span>` : ""}
          </div>
          <p class="cmd-result-desc">${descHighlighted}</p>
        </div>

        <div class="cmd-result-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>
    `;
  }

  /**
   * Bind Click Handlers for Search Result Items
   */
  _bindItemClickHandlers() {
    const items = this.resultsContainer.querySelectorAll(".cmd-result-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.dataset.url;
        const title = item.dataset.title;
        if (title && this.searchEngine) {
          this.searchEngine.addRecentSearch(title);
        }
        this.close();
        if (url) {
          window.location.href = url;
        }
      });

      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.dataset.index, 10);
        if (!isNaN(idx)) {
          this.selectedIndex = idx;
          this._highlightSelectedItem();
        }
      });
    });
  }

  /**
   * Keyboard Arrow Navigation Handler
   */
  _navigateSelection(direction) {
    const items = this.resultsContainer.querySelectorAll(".cmd-result-item");
    if (items.length === 0) return;

    this.selectedIndex += direction;

    if (this.selectedIndex < 0) {
      this.selectedIndex = items.length - 1;
    } else if (this.selectedIndex >= items.length) {
      this.selectedIndex = 0;
    }

    this._highlightSelectedItem();
  }

  _highlightSelectedItem() {
    const items = this.resultsContainer.querySelectorAll(".cmd-result-item");
    items.forEach((item, idx) => {
      const isSelected = idx === this.selectedIndex;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-selected", isSelected);

      if (isSelected) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }

  /**
   * Trigger Action on Currently Selected Result (Enter key)
   */
  _triggerSelectedResult() {
    const selectedItem =
      this.resultsContainer.querySelector(
        `.cmd-result-item[data-index="${this.selectedIndex}"]`,
      ) || this.resultsContainer.querySelector(".cmd-result-item");

    if (selectedItem) {
      const url = selectedItem.dataset.url;
      const title = selectedItem.dataset.title;

      if (title && this.searchEngine) {
        this.searchEngine.addRecentSearch(title);
      }
      this.close();
      if (url) {
        window.location.href = url;
      }
    }
  }

  /**
   * Trap Tab Focus inside Modal
   */
  _trapFocus(e) {
    const focusables = this.modal.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  _escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global Singleton Export
window.ComprexaCommandPalette = new ComprexaCommandPalette();

// Auto initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.ComprexaCommandPalette) {
    window.ComprexaCommandPalette.init();
  }
});
