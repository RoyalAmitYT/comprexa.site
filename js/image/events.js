/**
 * Comprexa Universal Image Engine - Event System
 * Lightweight pub/sub event bus for lifecycle event notifications.
 */

export const ImageEngineEvents = {
  IMAGE_UPLOAD: "image-upload",
  IMAGE_LOADED: "image-loaded",
  PROCESSING_START: "processing-start",
  PROCESSING_PROGRESS: "processing-progress",
  PROCESSING_COMPLETE: "processing-complete",
  DOWNLOAD: "download",
  ERROR: "error",
};

export class ImageEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} Unsubscribe callback function
   */
  on(event, handler) {
    if (typeof handler !== "function") return () => {};

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event once
   * @param {string} event
   * @param {Function} handler
   */
  once(event, handler) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      handler(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  /**
   * Emit an event with data payload
   * @param {string} event
   * @param {Object} [data]
   */
  emit(event, data = {}) {
    if (this.listeners.has(event)) {
      const handlers = Array.from(this.listeners.get(event));
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in ImageEventBus handler for '${event}':`, err);
        }
      });
    }
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.listeners.clear();
  }
}

export const GlobalImageEventBus = new ImageEventBus();
