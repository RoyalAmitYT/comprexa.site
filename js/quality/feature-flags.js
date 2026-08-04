/**
 * Comprexa Quality Framework - Feature Flags Controller
 * Supports staged feature rollouts, experimental capabilities, and canary testing.
 */

import { GlobalLogger, LogCategory } from "./logger.js";

export class ComprexaFeatureFlags {
  constructor() {
    this.flags = new Map([
      ["pdf_ocr_support", false],
      ["pdf_batch_processing", true],
      ["pdf_watermark_editor", false],
      ["pdf_digital_signatures", false],
      ["compressed_image_preview", true],
      ["dark_mode_auto_detect", true],
      ["web_worker_acceleration", true],
      ["quality_telemetry", false],
    ]);

    this.loadOverrides();
  }

  loadOverrides() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("comprexa_feature_flags");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach((key) => {
          this.flags.set(key, Boolean(parsed[key]));
        });
      }
    } catch (e) {
      // Fallback
    }
  }

  /**
   * Check if a feature flag is enabled
   * @param {string} flagName
   * @param {boolean} [defaultValue=false]
   * @returns {boolean}
   */
  isEnabled(flagName, defaultValue = false) {
    if (this.flags.has(flagName)) {
      return this.flags.get(flagName);
    }
    return defaultValue;
  }

  /**
   * Set feature flag status
   * @param {string} flagName
   * @param {boolean} value
   */
  set(flagName, value) {
    this.flags.set(flagName, Boolean(value));
    this.persist();
    GlobalLogger.info(
      LogCategory.QUALITY,
      `Feature flag '${flagName}' set to ${value}`,
    );
  }

  /**
   * Get list of all feature flags
   */
  getAll() {
    return Object.fromEntries(this.flags);
  }

  persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "comprexa_feature_flags",
        JSON.stringify(this.getAll()),
      );
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export const GlobalFeatureFlags = new ComprexaFeatureFlags();

if (typeof window !== "undefined") {
  window.ComprexaFeatureFlags = GlobalFeatureFlags;
}
