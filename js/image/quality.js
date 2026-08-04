// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Quality Manager
 * Standardized compression presets, custom quality sliders, and quality rating calculation.
 */

import { ImageConfig } from "./config.js";

export class ImageQualityManager {
  /**
   * Get pre-configured quality object by preset key ('low', 'medium', 'high', 'maximum', 'custom')
   * @param {string} presetKey
   * @param {number} [customValue] - Value between 0.01 and 1.0 if presetKey is 'custom'
   * @returns {{key: string, name: string, quality: number, desc: string}}
   */
  static getQualityPreset(presetKey = "medium", customValue = 0.8) {
    const key = (presetKey || "medium").toLowerCase();

    if (key === "custom") {
      const validVal = Math.min(
        1.0,
        Math.max(0.01, parseFloat(customValue) || 0.8),
      );
      return {
        key: "custom",
        name: "Custom",
        quality: validVal,
        desc: `Custom compression factor (${Math.round(validVal * 100)}%)`,
      };
    }

    const preset =
      ImageConfig.qualityPresets[key] || ImageConfig.qualityPresets.medium;
    return {
      key,
      name: preset.name,
      quality: preset.quality,
      desc: preset.desc,
    };
  }

  /**
   * Get recommended resolution downscale factor based on compression level
   * @param {string} presetKey
   * @returns {number} Scale multiplier (e.g., 1.0 for High/Max, 0.85 for Medium, 0.70 for Low)
   */
  static getRecommendedScaleFactor(presetKey) {
    switch ((presetKey || "").toLowerCase()) {
      case "low":
        return 0.7;
      case "medium":
        return 0.85;
      case "high":
      case "maximum":
      default:
        return 1.0;
    }
  }

  /**
   * Calculate quality score badge and rating for UI display
   * @param {number} qualityDecimal (0.0 - 1.0)
   * @returns {{label: string, badgeClass: string, percentage: number}}
   */
  static calculateQualityRating(qualityDecimal) {
    const q = Math.min(1.0, Math.max(0, parseFloat(qualityDecimal) || 0.8));
    const percentage = Math.round(q * 100);

    if (q >= 0.9) {
      return {
        label: "Maximum Quality",
        badgeClass: "badge--success",
        percentage,
      };
    }
    if (q >= 0.75) {
      return {
        label: "High Quality",
        badgeClass: "badge--primary",
        percentage,
      };
    }
    if (q >= 0.55) {
      return {
        label: "Medium Quality",
        badgeClass: "badge--warning",
        percentage,
      };
    }
    return { label: "Low Quality", badgeClass: "badge--danger", percentage };
  }
}

export const GlobalImageQualityManager = ImageQualityManager;
