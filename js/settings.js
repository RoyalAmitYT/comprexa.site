/**
 * Comprexa Global Preferences & Settings Engine
 * Reusable, schema-versioned Settings Manager storing preferences in LocalStorage.
 * Foundation for theme, file processing defaults, accessibility, and recent tool memory.
 */

class ComprexaSettingsManager {
  static STORAGE_KEY = "comprexa_settings_v1";
  static CURRENT_VERSION = 1;

  static DEFAULT_SETTINGS = {
    version: 1,
    theme: "system", // 'system' | 'light' | 'dark'
    language: "en", // 'en' | 'es' | 'fr' | 'de' | 'zh'
    defaultCompressionLevel: "recommended", // 'recommended' | 'extreme' | 'less'
    defaultFilenamePattern: "{filename}-processed.{ext}",
    lastUsedTool: null, // e.g. 'compress-pdf'
    recentTools: [], // array of { id, title, slug, icon, colorClass, category, path, timestamp }
    recentCategories: [], // array of category IDs
    animationPreference: "enabled", // 'enabled' | 'disabled' | 'system'
    reducedMotion: false, // boolean manual override
    defaultLayout: "grid", // 'grid' | 'compact' | 'list'
    autoScrollAfterProcess: true, // boolean
    confirmBeforeDelete: true, // boolean
  };

  constructor() {
    this.listeners = new Set();
    this.settings = this.loadSettings();
    this.initSystemListeners();
    this.applyToDOM();
  }

  /**
   * Load settings from LocalStorage with version checking & error handling
   */
  loadSettings() {
    try {
      const raw = localStorage.getItem(ComprexaSettingsManager.STORAGE_KEY);
      if (!raw) {
        return { ...ComprexaSettingsManager.DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(raw);

      // Legacy theme compatibility if user used 'comprexa-theme' key
      if (!parsed.theme) {
        const legacyTheme = localStorage.getItem("comprexa-theme");
        if (legacyTheme) {
          parsed.theme = legacyTheme;
        }
      }

      // Merge defaults with parsed values to handle schema upgrades gracefully
      const merged = {
        ...ComprexaSettingsManager.DEFAULT_SETTINGS,
        ...parsed,
        version: ComprexaSettingsManager.CURRENT_VERSION,
      };

      // Ensure recentTools is an array
      if (!Array.isArray(merged.recentTools)) merged.recentTools = [];
      if (!Array.isArray(merged.recentCategories)) merged.recentCategories = [];

      return merged;
    } catch (e) {
      return { ...ComprexaSettingsManager.DEFAULT_SETTINGS };
    }
  }

  /**
   * Save current settings state to LocalStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        ComprexaSettingsManager.STORAGE_KEY,
        JSON.stringify(this.settings),
      );
      // Sync legacy key for simple scripts
      const effectiveTheme = this.getEffectiveTheme();
      localStorage.setItem("comprexa-theme", effectiveTheme);
    } catch (e) {
      console.error(
        "[ComprexaSettings] Error saving settings to LocalStorage:",
        e,
      );
    }
  }

  /**
   * Get setting value by key
   * @param {string} key
   * @param {any} fallback
   */
  get(key, fallback = undefined) {
    if (Object.prototype.hasOwnProperty.call(this.settings, key)) {
      return this.settings[key];
    }
    return fallback !== undefined
      ? fallback
      : ComprexaSettingsManager.DEFAULT_SETTINGS[key];
  }

  /**
   * Set single setting value and apply changes
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.applyToDOM();
    this.notifyListeners(key, value);
  }

  /**
   * Update multiple settings at once
   * @param {Object} partialObject
   */
  update(partialObject) {
    if (!partialObject || typeof partialObject !== "object") return;
    this.settings = { ...this.settings, ...partialObject };
    this.saveSettings();
    this.applyToDOM();
    this.notifyListeners("batch", partialObject);
  }

  /**
   * Reset all settings to factory default values
   */
  reset() {
    this.settings = { ...ComprexaSettingsManager.DEFAULT_SETTINGS };
    this.saveSettings();
    this.applyToDOM();
    this.notifyListeners("reset", this.settings);
  }

  /**
   * Resolve effective theme taking 'system' preference into account
   * @returns {'light' | 'dark'}
   */
  getEffectiveTheme() {
    const theme = this.settings.theme;
    if (theme === "dark" || theme === "light") {
      return theme;
    }
    // System auto match
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Resolve effective reduced motion setting
   * @returns {boolean}
   */
  isReducedMotion() {
    if (this.settings.reducedMotion === true) return true;
    if (this.settings.animationPreference === "disabled") return true;
    if (this.settings.animationPreference === "enabled") return false;
    // Follow system OS setting
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /**
   * Record a tool being opened/used
   * @param {string} toolIdOrSlug
   */
  recordToolUsage(toolIdOrSlug) {
    if (!toolIdOrSlug) return;

    let toolObj = null;
    if (window.ComprexaToolsRegistry) {
      toolObj =
        window.ComprexaToolsRegistry.getById(toolIdOrSlug) ||
        window.ComprexaToolsRegistry.getBySlug(toolIdOrSlug);
    }

    const toolId = toolObj ? toolObj.id : toolIdOrSlug;
    const toolTitle = toolObj ? toolObj.title : toolIdOrSlug;
    const toolCategory = toolObj ? toolObj.category : "pdf";
    const toolIcon = toolObj ? toolObj.icon : "";
    const colorClass = toolObj ? toolObj.colorClass : "icon-bg--pdf";

    let path = `/tool-template.html?tool=${toolObj ? toolObj.slug : toolId}`;
    if (toolId === "compress-pdf") path = "/compress-pdf.html";
    else if (toolId === "merge-pdf") path = "/merge-pdf.html";
    else if (toolId === "split-pdf") path = "/split-pdf.html";
    else if (toolId === "rotate-pdf") path = "/rotate-pdf.html";
    else if (toolId === "organize-pdf") path = "/organize-pdf.html";

    // 1. Update lastUsedTool
    this.settings.lastUsedTool = toolId;

    // 2. Update recentTools (deduplicated stack, max 10)
    let recent = this.settings.recentTools.filter((item) => item.id !== toolId);
    recent.unshift({
      id: toolId,
      title: toolTitle,
      slug: toolObj ? toolObj.slug : toolId,
      path,
      icon: toolIcon,
      colorClass,
      category: toolCategory,
      timestamp: Date.now(),
    });
    if (recent.length > 10) recent = recent.slice(0, 10);
    this.settings.recentTools = recent;

    // 3. Update recentCategories (deduplicated stack, max 5)
    if (toolCategory) {
      let categories = this.settings.recentCategories.filter(
        (cat) => cat !== toolCategory,
      );
      categories.unshift(toolCategory);
      if (categories.length > 5) categories = categories.slice(0, 5);
      this.settings.recentCategories = categories;
    }

    this.saveSettings();
    this.notifyListeners("tool-recorded", {
      toolId,
      recentTools: this.settings.recentTools,
    });
  }

  /**
   * Get list of recent tools
   * @returns {Array}
   */
  getRecentTools() {
    return this.settings.recentTools || [];
  }

  /**
   * Clear recent tools history
   */
  clearRecentTools() {
    this.settings.recentTools = [];
    this.settings.lastUsedTool = null;
    this.saveSettings();
    this.notifyListeners("recent-cleared", []);
  }

  /**
   * Apply settings variables to <html> root element & UI attributes
   */
  applyToDOM() {
    const root = document.documentElement;
    const effectiveTheme = this.getEffectiveTheme();
    const reducedMotion = this.isReducedMotion();

    // Theme attribute
    root.setAttribute("data-theme", effectiveTheme);

    // Reduced Motion attribute
    if (reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }

    // Animation preference
    root.setAttribute("data-animation-pref", this.settings.animationPreference);

    // Default layout preference
    root.setAttribute("data-layout-pref", this.settings.defaultLayout);

    // Sync theme buttons if script.js icon updating is present
    this.syncThemeToggleIcons(effectiveTheme);

    // Dispatch global event
    const event = new CustomEvent("comprexa:settings-changed", {
      detail: {
        settings: { ...this.settings },
        effectiveTheme,
        reducedMotion,
      },
      bubbles: true,
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  /**
   * Sync theme button icons across header and mobile drawers
   */
  syncThemeToggleIcons(effectiveTheme) {
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>`;

    const themeToggle =
      document.getElementById("theme-toggle") ||
      document.getElementById("theme-toggle-btn");
    const themeToggleMobile = document.getElementById("theme-toggle-mobile");

    const isDark = effectiveTheme === "dark";
    const iconToSet = isDark ? sunIcon : moonIcon;
    const labelToSet = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

    if (themeToggle) {
      themeToggle.innerHTML = iconToSet;
      themeToggle.setAttribute("aria-label", labelToSet);
    }
    if (themeToggleMobile) {
      themeToggleMobile.innerHTML = `${iconToSet} <span>${isDark ? "Light Theme" : "Dark Theme"}</span>`;
      themeToggleMobile.setAttribute("aria-label", labelToSet);
    }
  }

  /**
   * Listen to system OS theme and motion media query changes
   */
  initSystemListeners() {
    if (!window.matchMedia) return;

    // Theme media listener
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      if (this.settings.theme === "system") {
        this.applyToDOM();
      }
    };
    if (colorSchemeQuery.addEventListener) {
      colorSchemeQuery.addEventListener("change", handleThemeChange);
    } else if (colorSchemeQuery.addListener) {
      colorSchemeQuery.addListener(handleThemeChange);
    }

    // Motion media listener
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      if (this.settings.animationPreference === "system") {
        this.applyToDOM();
      }
    };
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleMotionChange);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handleMotionChange);
    }
  }

  /**
   * Export settings as downloadable JSON
   */
  exportJSON() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.settings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comprexa-settings-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Import settings from JSON string
   */
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== "object" || !parsed) {
        throw new Error("Invalid JSON structure.");
      }
      this.update(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Subscribe to setting updates
   * @param {Function} callback
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  notifyListeners(key, value) {
    this.listeners.forEach((cb) => {
      try {
        cb(key, value, this.settings);
      } catch (e) {
        console.error("[ComprexaSettings] Error in settings listener:", e);
      }
    });
  }
}

// Global Export Instance
window.ComprexaSettings = new ComprexaSettingsManager();

/**
 * Comprexa Global Preferences Modal UI Controller
 * Dynamically renders and manages the Preferences & Settings Modal
 */
class ComprexaSettingsModalUI {
  constructor() {
    this.modalEl = null;
    this.activeTab = "appearance";
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.attachTriggers();
    });

    // Delegated click listener for settings triggers
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(
        "#header-settings-btn, #settings-toggle-btn, .btn-settings-trigger",
      );
      if (trigger) {
        e.preventDefault();
        this.openModal();
      }
    });
  }

  attachTriggers() {
    // Check if header settings button exists; if not, inject it next to theme toggle in header if header exists!
    const headerActions = document.querySelector(".header__actions");
    if (headerActions && !document.querySelector("#header-settings-btn")) {
      const settingsBtn = document.createElement("button");
      settingsBtn.id = "header-settings-btn";
      settingsBtn.className = "btn-icon btn-settings-trigger";
      settingsBtn.setAttribute("aria-label", "Global Preferences & Settings");
      settingsBtn.setAttribute("title", "Preferences & Settings");
      settingsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;

      const themeBtn = headerActions.querySelector(
        "#theme-toggle, #theme-toggle-btn",
      );
      if (themeBtn) {
        headerActions.insertBefore(settingsBtn, themeBtn);
      } else {
        headerActions.appendChild(settingsBtn);
      }
    }
  }

  ensureModalDOM() {
    if (this.modalEl) return;

    const modalMarkup = `
      <div id="settings-modal" class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title" style="display: none;">
        <div class="settings-modal__overlay" id="settings-modal-backdrop"></div>
        <div class="settings-modal__container">
          
          <header class="settings-modal__header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="settings-modal__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h2 id="settings-modal-title" class="settings-modal__title">Preferences & Settings</h2>
            </div>
            <button type="button" class="btn-icon" id="btn-close-settings-modal" aria-label="Close preferences modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </header>

          <div class="settings-modal__body">
            
            <!-- Settings Sidebar Navigation -->
            <nav class="settings-nav">
              <button type="button" class="settings-nav__item settings-nav__item--active" data-settings-tab="appearance">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                <span>Appearance</span>
              </button>

              <button type="button" class="settings-nav__item" data-settings-tab="tool-defaults">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span>Tool Defaults</span>
              </button>

              <button type="button" class="settings-nav__item" data-settings-tab="general">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>System & History</span>
              </button>

              <button type="button" class="settings-nav__item" data-settings-tab="data-backup">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Data & Backup</span>
              </button>
            </nav>

            <!-- Settings Content Panels -->
            <div class="settings-content">

              <!-- Tab 1: Appearance -->
              <div class="settings-tab-panel settings-tab-panel--active" data-panel="appearance">
                <div class="settings-group">
                  <h3 class="settings-group__title">Color Theme</h3>
                  <p class="settings-group__desc">Choose your visual appearance or follow your device settings.</p>
                  
                  <div class="settings-radio-grid">
                    <label class="settings-radio-card">
                      <input type="radio" name="opt_theme" value="system" class="settings-radio-input" />
                      <div class="settings-radio-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        <span>System Auto</span>
                      </div>
                    </label>

                    <label class="settings-radio-card">
                      <input type="radio" name="opt_theme" value="light" class="settings-radio-input" />
                      <div class="settings-radio-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        <span>Light Theme</span>
                      </div>
                    </label>

                    <label class="settings-radio-card">
                      <input type="radio" name="opt_theme" value="dark" class="settings-radio-input" />
                      <div class="settings-radio-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        <span>Dark Theme</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <h3 class="settings-group__title">Animations & Reduced Motion</h3>
                  <p class="settings-group__desc">Control UI transition speed and smooth motion behaviors.</p>
                  
                  <div class="settings-row">
                    <div>
                      <div class="settings-row__label">UI Animations</div>
                      <div class="settings-row__hint">Enable or disable smooth visual transition effects.</div>
                    </div>
                    <select id="opt_animation_pref" class="ui-select" style="width: 160px;">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                      <option value="system">Follow OS</option>
                    </select>
                  </div>

                  <div class="settings-row" style="margin-top: 14px;">
                    <div>
                      <div class="settings-row__label">Force Reduced Motion</div>
                      <div class="settings-row__hint">Disable non-essential animations for accessibility.</div>
                    </div>
                    <label class="ui-switch">
                      <input type="checkbox" id="opt_reduced_motion" />
                      <span class="ui-switch__slider"></span>
                    </label>
                  </div>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <h3 class="settings-group__title">Default Tool Grid Layout</h3>
                  <div class="settings-row">
                    <div>
                      <div class="settings-row__label">Card View Density</div>
                      <div class="settings-row__hint">Preferred visual layout for tool catalog grids.</div>
                    </div>
                    <select id="opt_default_layout" class="ui-select" style="width: 160px;">
                      <option value="grid">Grid (Standard)</option>
                      <option value="compact">Compact Grid</option>
                      <option value="list">Single List</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tab 2: Tool Defaults -->
              <div class="settings-tab-panel" data-panel="tool-defaults">
                <div class="settings-group">
                  <h3 class="settings-group__title">PDF Compression Level</h3>
                  <p class="settings-group__desc">Set the initial compression level selected when opening PDF tools.</p>
                  
                  <select id="opt_compression_level" class="ui-select" style="width: 100%;">
                    <option value="recommended">Recommended Compression (Balanced Quality & Size)</option>
                    <option value="extreme">Extreme Compression (Maximum File Reduction)</option>
                    <option value="less">Less Compression (High Visual Quality)</option>
                  </select>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <h3 class="settings-group__title">Default Download Filename Pattern</h3>
                  <p class="settings-group__desc">Use tags like <code>{filename}</code> and <code>{ext}</code> to format output names.</p>
                  
                  <input type="text" id="opt_filename_pattern" class="ui-input" value="{filename}-processed.{ext}" placeholder="{filename}-processed.{ext}" />
                  <p style="font-size: 0.775rem; color: var(--text-muted); margin-top: 6px;">
                    Example output: <code>document-processed.pdf</code>
                  </p>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <h3 class="settings-group__title">Workflow & Interaction</h3>
                  
                  <div class="settings-row">
                    <div>
                      <div class="settings-row__label">Auto-Scroll to Results</div>
                      <div class="settings-row__hint">Automatically focus result card after processing finishes.</div>
                    </div>
                    <label class="ui-switch">
                      <input type="checkbox" id="opt_autoscroll" checked />
                      <span class="ui-switch__slider"></span>
                    </label>
                  </div>

                  <div class="settings-row" style="margin-top: 14px;">
                    <div>
                      <div class="settings-row__label">Confirm Before Clearing Files</div>
                      <div class="settings-row__hint">Show confirmation alert before resetting selected files.</div>
                    </div>
                    <label class="ui-switch">
                      <input type="checkbox" id="opt_confirm_delete" checked />
                      <span class="ui-switch__slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Tab 3: System & History -->
              <div class="settings-tab-panel" data-panel="general">
                <div class="settings-group">
                  <h3 class="settings-group__title">Interface Language</h3>
                  <p class="settings-group__desc">Select preferred localization language (Future-Ready).</p>
                  
                  <select id="opt_language" class="ui-select" style="width: 100%;">
                    <option value="en">English (US)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div>
                      <h3 class="settings-group__title" style="margin: 0;">Recent Tools History</h3>
                      <p class="settings-group__desc" style="margin: 0;">Tools you opened recently in this browser.</p>
                    </div>
                    <button type="button" class="btn btn--outline btn--sm" id="btn-clear-history">Clear History</button>
                  </div>

                  <div id="settings-recent-tools-list" class="settings-recent-list">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>

              <!-- Tab 4: Data & Backup -->
              <div class="settings-tab-panel" data-panel="data-backup">
                <div class="settings-group">
                  <h3 class="settings-group__title">Backup & Restore Preferences</h3>
                  <p class="settings-group__desc">Export your custom settings as a JSON file or import previously saved backup settings.</p>
                  
                  <div style="display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap;">
                    <button type="button" class="btn btn--primary" id="btn-export-settings">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Export Backup (.JSON)</span>
                    </button>

                    <label class="btn btn--outline" style="cursor: pointer;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Import Backup</span>
                      <input type="file" id="file-import-settings" accept=".json" style="display: none;" />
                    </label>
                  </div>
                </div>

                <div class="ui-divider" style="margin: 20px 0;"></div>

                <div class="settings-group">
                  <h3 class="settings-group__title" style="color: #ef4444;">Reset Settings</h3>
                  <p class="settings-group__desc">Restore all preferences and defaults to factory state. This action cannot be undone.</p>
                  
                  <button type="button" class="btn btn--danger" id="btn-reset-all-settings" style="margin-top: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    <span>Reset All Preferences to Default</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          <footer class="settings-modal__footer">
            <span style="font-size: 0.775rem; color: var(--text-muted);">Comprexa Settings Engine v1.0 • Local Storage</span>
            <button type="button" class="btn btn--primary btn--sm" id="btn-save-close-settings">Done</button>
          </footer>

        </div>
      </div>
    `;

    const wrap = document.createElement("div");
    wrap.innerHTML = modalMarkup;
    document.body.appendChild(wrap.firstElementChild);

    this.modalEl = document.getElementById("settings-modal");
    this.bindModalEvents();
  }

  bindModalEvents() {
    if (!this.modalEl) return;

    // Close buttons
    const closeBtn = this.modalEl.querySelector("#btn-close-settings-modal");
    const backdrop = this.modalEl.querySelector("#settings-modal-backdrop");
    const doneBtn = this.modalEl.querySelector("#btn-save-close-settings");

    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
    if (backdrop) backdrop.addEventListener("click", () => this.closeModal());
    if (doneBtn) doneBtn.addEventListener("click", () => this.closeModal());

    // ESC Key to close
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.modalEl &&
        this.modalEl.style.display !== "none"
      ) {
        this.closeModal();
      }
    });

    // Tab Navigation
    const tabNavItems = this.modalEl.querySelectorAll(".settings-nav__item");
    tabNavItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-settings-tab");
        this.switchTab(targetTab);
      });
    });

    // Form Change Listeners
    // 1. Theme
    const themeRadios = this.modalEl.querySelectorAll(
      'input[name="opt_theme"]',
    );
    themeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked)
          window.ComprexaSettings.set("theme", e.target.value);
      });
    });

    // 2. Animation Pref
    const animSelect = this.modalEl.querySelector("#opt_animation_pref");
    if (animSelect) {
      animSelect.addEventListener("change", (e) => {
        window.ComprexaSettings.set("animationPreference", e.target.value);
      });
    }

    // 3. Reduced Motion
    const reducedCheck = this.modalEl.querySelector("#opt_reduced_motion");
    if (reducedCheck) {
      reducedCheck.addEventListener("change", (e) => {
        window.ComprexaSettings.set("reducedMotion", e.target.checked);
      });
    }

    // 4. Default Layout
    const layoutSelect = this.modalEl.querySelector("#opt_default_layout");
    if (layoutSelect) {
      layoutSelect.addEventListener("change", (e) => {
        window.ComprexaSettings.set("defaultLayout", e.target.value);
      });
    }

    // 5. Compression Level
    const compSelect = this.modalEl.querySelector("#opt_compression_level");
    if (compSelect) {
      compSelect.addEventListener("change", (e) => {
        window.ComprexaSettings.set("defaultCompressionLevel", e.target.value);
      });
    }

    // 6. Filename Pattern
    const namePatternInput = this.modalEl.querySelector(
      "#opt_filename_pattern",
    );
    if (namePatternInput) {
      namePatternInput.addEventListener("input", (e) => {
        window.ComprexaSettings.set(
          "defaultFilenamePattern",
          e.target.value || "{filename}-processed.{ext}",
        );
      });
    }

    // 7. AutoScroll
    const scrollCheck = this.modalEl.querySelector("#opt_autoscroll");
    if (scrollCheck) {
      scrollCheck.addEventListener("change", (e) => {
        window.ComprexaSettings.set("autoScrollAfterProcess", e.target.checked);
      });
    }

    // 8. Confirm Delete
    const deleteCheck = this.modalEl.querySelector("#opt_confirm_delete");
    if (deleteCheck) {
      deleteCheck.addEventListener("change", (e) => {
        window.ComprexaSettings.set("confirmBeforeDelete", e.target.checked);
      });
    }

    // 9. Language
    const langSelect = this.modalEl.querySelector("#opt_language");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        window.ComprexaSettings.set("language", e.target.value);
      });
    }

    // 10. Clear History Button
    const clearHistBtn = this.modalEl.querySelector("#btn-clear-history");
    if (clearHistBtn) {
      clearHistBtn.addEventListener("click", () => {
        window.ComprexaSettings.clearRecentTools();
        this.populateRecentTools();
        if (window.ComprexaToast)
          window.ComprexaToast.info(
            "Recent tools history cleared.",
            "History Cleared",
          );
      });
    }

    // 11. Export Settings
    const exportBtn = this.modalEl.querySelector("#btn-export-settings");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        window.ComprexaSettings.exportJSON();
        if (window.ComprexaToast)
          window.ComprexaToast.success(
            "Settings backup file exported.",
            "Backup Saved",
          );
      });
    }

    // 12. Import Settings File
    const importFileInput = this.modalEl.querySelector("#file-import-settings");
    if (importFileInput) {
      importFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = window.ComprexaSettings.importJSON(evt.target.result);
          if (res.success) {
            this.syncControlsFromSettings();
            if (window.ComprexaToast)
              window.ComprexaToast.success(
                "Settings imported successfully!",
                "Settings Restored",
              );
          } else {
            if (window.ComprexaToast)
              window.ComprexaToast.error(
                `Failed to import settings: ${res.error}`,
                "Import Error",
              );
          }
        };
        reader.readAsText(file);
      });
    }

    // 13. Reset Settings Button
    const resetBtn = this.modalEl.querySelector("#btn-reset-all-settings");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (
          confirm("Are you sure you want to reset all preferences to defaults?")
        ) {
          window.ComprexaSettings.reset();
          this.syncControlsFromSettings();
          if (window.ComprexaToast)
            window.ComprexaToast.info(
              "All preferences reset to defaults.",
              "Settings Reset",
            );
        }
      });
    }
  }

  syncControlsFromSettings() {
    if (!this.modalEl) return;
    const mgr = window.ComprexaSettings;

    // Theme radio
    const themeRadio = this.modalEl.querySelector(
      `input[name="opt_theme"][value="${mgr.get("theme")}"]`,
    );
    if (themeRadio) themeRadio.checked = true;

    // Animation Select
    const animSelect = this.modalEl.querySelector("#opt_animation_pref");
    if (animSelect) animSelect.value = mgr.get("animationPreference");

    // Reduced Motion
    const reducedCheck = this.modalEl.querySelector("#opt_reduced_motion");
    if (reducedCheck) reducedCheck.checked = mgr.get("reducedMotion");

    // Layout
    const layoutSelect = this.modalEl.querySelector("#opt_default_layout");
    if (layoutSelect) layoutSelect.value = mgr.get("defaultLayout");

    // Compression
    const compSelect = this.modalEl.querySelector("#opt_compression_level");
    if (compSelect) compSelect.value = mgr.get("defaultCompressionLevel");

    // Filename pattern
    const patternInput = this.modalEl.querySelector("#opt_filename_pattern");
    if (patternInput) patternInput.value = mgr.get("defaultFilenamePattern");

    // Switches
    const scrollCheck = this.modalEl.querySelector("#opt_autoscroll");
    if (scrollCheck) scrollCheck.checked = mgr.get("autoScrollAfterProcess");

    const deleteCheck = this.modalEl.querySelector("#opt_confirm_delete");
    if (deleteCheck) deleteCheck.checked = mgr.get("confirmBeforeDelete");

    // Language
    const langSelect = this.modalEl.querySelector("#opt_language");
    if (langSelect) langSelect.value = mgr.get("language");

    // Populate Recent List
    this.populateRecentTools();
  }

  populateRecentTools() {
    if (!this.modalEl) return;
    const container = this.modalEl.querySelector("#settings-recent-tools-list");
    if (!container) return;

    const list = window.ComprexaSettings.getRecentTools();
    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          No recent tools recorded yet. Open tools to see them listed here.
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map(
        (item) => `
      <a href="${item.path}" class="settings-recent-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); text-decoration: none; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="tool-card-mini__icon ${item.colorClass || "icon-bg--pdf"}" style="width: 28px; height: 28px; font-size: 0.8rem;">
            ${item.icon || '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>'}
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-main);">${item.title}</div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
        <span class="badge badge--subtle badge--pill" style="font-size: 0.7rem;">Open Tool</span>
      </a>
    `,
      )
      .join("");
  }

  switchTab(tabName) {
    if (!this.modalEl) return;
    this.activeTab = tabName;

    const navItems = this.modalEl.querySelectorAll(".settings-nav__item");
    navItems.forEach((item) => {
      if (item.getAttribute("data-settings-tab") === tabName) {
        item.classList.add("settings-nav__item--active");
      } else {
        item.classList.remove("settings-nav__item--active");
      }
    });

    const panels = this.modalEl.querySelectorAll(".settings-tab-panel");
    panels.forEach((panel) => {
      if (panel.getAttribute("data-panel") === tabName) {
        panel.classList.add("settings-tab-panel--active");
      } else {
        panel.classList.remove("settings-tab-panel--active");
      }
    });
  }

  openModal() {
    this.ensureModalDOM();
    this.syncControlsFromSettings();
    this.modalEl.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.style.display = "none";
      document.body.style.overflow = "";
    }
  }
}

// Global Export Settings UI Controller
window.ComprexaSettingsUI = new ComprexaSettingsModalUI();
