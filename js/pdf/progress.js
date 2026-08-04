/**
 * Comprexa Universal PDF Engine - Progress & State Manager
 * Tracks state transitions (Ready, Loading, Processing, Success, Error)
 * and emits progress events to UI controllers.
 */

import { GlobalPdfEventBus } from "./events.js";

export const PdfProgressState = {
  READY: "READY",
  LOADING: "LOADING",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

export class PdfProgressManager {
  constructor() {
    this.state = PdfProgressState.READY;
    this.percent = 0;
    this.statusText = "Ready";
    this.error = null;
  }

  /**
   * Reset progress state to Ready
   */
  reset() {
    this.state = PdfProgressState.READY;
    this.percent = 0;
    this.statusText = "Ready";
    this.error = null;
    GlobalPdfEventBus.emit("processing-progress", this.getSnapshot());
  }

  /**
   * Set loading state
   */
  startLoading(message = "Loading PDF document...") {
    this.state = PdfProgressState.LOADING;
    this.percent = 5;
    this.statusText = message;
    this.error = null;
    GlobalPdfEventBus.emit("processing-start", this.getSnapshot());
  }

  /**
   * Update progress percentage and message
   */
  updateProgress(percent, message) {
    this.state = PdfProgressState.PROCESSING;
    this.percent = Math.min(100, Math.max(0, percent));
    if (message) this.statusText = message;
    GlobalPdfEventBus.emit("processing-progress", this.getSnapshot());
  }

  /**
   * Set success state
   */
  setSuccess(resultData, message = "Completed successfully!") {
    this.state = PdfProgressState.SUCCESS;
    this.percent = 100;
    this.statusText = message;
    this.error = null;
    GlobalPdfEventBus.emit("processing-complete", {
      ...this.getSnapshot(),
      result: resultData,
    });
  }

  /**
   * Set error state
   */
  setError(errorMessage, errorCode = "ERR_UNKNOWN") {
    this.state = PdfProgressState.ERROR;
    this.error = { message: errorMessage, code: errorCode };
    this.statusText = errorMessage;
    GlobalPdfEventBus.emit("error", this.getSnapshot());
  }

  getSnapshot() {
    return {
      state: this.state,
      percent: this.percent,
      statusText: this.statusText,
      error: this.error,
    };
  }
}

export const GlobalPdfProgressManager = new PdfProgressManager();

if (typeof window !== "undefined") {
  window.ComprexaPdfProgressManager = GlobalPdfProgressManager;
}
