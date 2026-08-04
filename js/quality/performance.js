/**
 * Comprexa Quality Framework - Performance Monitor
 * Tracks operation start/end times, UI render durations, slow operation warnings, and memory usage benchmarks.
 */

import { GlobalLogger, LogCategory } from "./logger.js";

export class ComprexaPerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.metrics = [];
    this.slowThresholdMs = 2500; // Operations taking > 2.5s warn
  }

  /**
   * Start timing a performance metric
   * @param {string} markName
   */
  start(markName) {
    const startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    this.marks.set(markName, {
      startTime,
      startMemory: this.getMemoryUsageMB(),
    });
  }

  /**
   * End timing and record duration
   * @param {string} markName
   * @param {Object} [metadata]
   * @returns {number} Duration in milliseconds
   */
  end(markName, metadata = null) {
    if (!this.marks.has(markName)) {
      GlobalLogger.warn(
        LogCategory.QUALITY,
        `Performance mark '${markName}' was ended before being started.`,
      );
      return 0;
    }

    const { startTime, startMemory } = this.marks.get(markName);
    this.marks.delete(markName);

    const endTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const durationMs = Math.round((endTime - startTime) * 100) / 100;
    const endMemory = this.getMemoryUsageMB();

    const metric = {
      name: markName,
      durationMs,
      startMemoryMB: startMemory,
      endMemoryMB: endMemory,
      memoryDeltaMB:
        endMemory && startMemory
          ? Math.round((endMemory - startMemory) * 100) / 100
          : null,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);

    // Issue slow operation warning
    if (durationMs > this.slowThresholdMs) {
      GlobalLogger.warn(
        LogCategory.QUALITY,
        `Slow operation detected: '${markName}' took ${durationMs}ms`,
        metric,
      );
    } else {
      GlobalLogger.debug(
        LogCategory.QUALITY,
        `Performance metric '${markName}': ${durationMs}ms`,
        metric,
      );
    }

    return durationMs;
  }

  /**
   * Measure an async function directly
   * @param {string} markName
   * @param {Function} asyncFn
   * @param {Object} [metadata]
   */
  async measureAsync(markName, asyncFn, metadata = null) {
    this.start(markName);
    try {
      const result = await asyncFn();
      this.end(markName, metadata);
      return result;
    } catch (err) {
      this.end(markName, { ...metadata, error: err.message });
      throw err;
    }
  }

  /**
   * Safely read browser JS Heap Memory if supported
   */
  getMemoryUsageMB() {
    if (typeof performance !== "undefined" && performance.memory) {
      return (
        Math.round((performance.memory.usedJSHeapSize / (1024 * 1024)) * 100) /
        100
      );
    }
    return null;
  }

  /**
   * Get recorded metric logs
   */
  getMetrics() {
    return [...this.metrics];
  }

  clear() {
    this.marks.clear();
    this.metrics = [];
  }
}

export const GlobalPerformanceMonitor = new ComprexaPerformanceMonitor();

if (typeof window !== "undefined") {
  window.ComprexaPerformance = GlobalPerformanceMonitor;
}
