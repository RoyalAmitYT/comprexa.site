/**
 * Comprexa Universal Image Engine - Progress Manager
 * State machine and progress event emitter for image load/process/export workflows.
 */

export const ImageProgressState = {
  READY: "READY",
  LOADING: "LOADING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
};

export class ImageProgressManager {
  constructor() {
    this.state = ImageProgressState.READY;
    this.percentage = 0;
    this.message = "Ready";
    this.subscribers = new Set();
  }

  /**
   * Subscribe to progress state updates
   * @param {Function} callback ({ state, percentage, message }) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.add(callback);
    }
    return () => this.subscribers.delete(callback);
  }

  /**
   * Update progress state, percentage, and user message
   * @param {string} state - From ImageProgressState
   * @param {number} percentage - 0 to 100
   * @param {string} message
   */
  update(state, percentage = 0, message = "") {
    this.state = state;
    this.percentage = Math.min(100, Math.max(0, Math.round(percentage)));
    this.message = message || this.getDefaultMessage(state);

    this.notify();
  }

  getDefaultMessage(state) {
    switch (state) {
      case ImageProgressState.READY:
        return "Ready";
      case ImageProgressState.LOADING:
        return "Loading image file...";
      case ImageProgressState.PROCESSING:
        return "Processing canvas operations...";
      case ImageProgressState.COMPLETED:
        return "Image processing complete!";
      case ImageProgressState.FAILED:
        return "Processing failed.";
      case ImageProgressState.CANCELED:
        return "Processing canceled.";
      default:
        return "";
    }
  }

  notify() {
    const payload = {
      state: this.state,
      percentage: this.percentage,
      message: this.message,
    };

    this.subscribers.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error("Error in ImageProgressManager subscriber:", e);
      }
    });
  }

  reset() {
    this.update(ImageProgressState.READY, 0, "Ready");
  }
}

export const GlobalImageProgressManager = new ImageProgressManager();
