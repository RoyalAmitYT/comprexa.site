/**
 * Comprexa Global Quality Framework - Master Facade
 * Bundles Logger, Debug Controller, Performance Monitor, Feature Flags, Validator, Assertions, A11y & Checklist.
 *
 * Exposed globally as window.ComprexaQuality
 */

import { GlobalLogger, LogCategory, LogLevel } from "./quality/logger.js";
import { GlobalDebugController } from "./quality/debug.js";
import { GlobalFeatureFlags } from "./quality/feature-flags.js";
import { Assert } from "./quality/assert.js";
import { GlobalPerformanceMonitor } from "./quality/performance.js";
import { GlobalValidator } from "./quality/validator.js";
import { GlobalA11yInspector } from "./quality/a11y.js";
import { GlobalToolChecklist } from "./quality/checklist.js";

export class ComprexaQualityFrameworkFacade {
  constructor() {
    this.logger = GlobalLogger;
    this.debug = GlobalDebugController;
    this.flags = GlobalFeatureFlags;
    this.assert = Assert;
    this.performance = GlobalPerformanceMonitor;
    this.validator = GlobalValidator;
    this.a11y = GlobalA11yInspector;
    this.checklist = GlobalToolChecklist;
    this.LogCategory = LogCategory;
    this.LogLevel = LogLevel;
  }

  /**
   * Run full quality diagnostic report on current page
   */
  runFullDiagnostic() {
    console.group("🛡️ Comprexa Quality Framework Diagnostic Report");

    // 1. Feature flags

    // 2. Performance metrics

    // 3. Accessibility audit
    const a11yReport = this.a11y.audit();

    // 4. Tool Checklist
    const checklistReport = this.checklist.evaluateTool();

    console.groupEnd();

    return {
      a11y: a11yReport,
      checklist: checklistReport,
      performance: this.performance.getMetrics(),
      flags: this.flags.getAll(),
    };
  }
}

export const GlobalQualityFramework = new ComprexaQualityFrameworkFacade();

if (typeof window !== "undefined") {
  window.ComprexaQuality = GlobalQualityFramework;
  window.ComprexaLogger = GlobalLogger;
  window.ComprexaDebug = GlobalDebugController;
  window.ComprexaFeatureFlags = GlobalFeatureFlags;
  window.ComprexaAssert = Assert;
  window.ComprexaPerformance = GlobalPerformanceMonitor;
  window.ComprexaQualityValidator = GlobalValidator;
  window.ComprexaA11y = GlobalA11yInspector;
  window.ComprexaToolChecklist = GlobalToolChecklist;
}

export {
  GlobalLogger,
  GlobalDebugController,
  GlobalFeatureFlags,
  Assert,
  GlobalPerformanceMonitor,
  GlobalValidator,
  GlobalA11yInspector,
  GlobalToolChecklist,
};
