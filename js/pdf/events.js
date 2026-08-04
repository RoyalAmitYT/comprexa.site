/**
 * Comprexa Universal PDF Engine - Lightweight Event Bus
 * Enables decoupled lifecycle event listening across all PDF tools:
 * upload | processing-start | processing-progress | processing-complete | download | error
 */

export class PdfEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to a named PDF engine event
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (typeof callback !== "function") return () => {};
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from a named event
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) return;
    this.listeners.get(eventName).delete(callback);
  }

  /**
   * Emit an event to all registered listeners
   */
  emit(eventName, payload = {}) {
    if (!this.listeners.has(eventName)) return;
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      ...payload,
    };

    this.listeners.get(eventName).forEach((cb) => {
      try {
        cb(eventData);
      } catch (err) {
        console.error(
          `[PdfEventBus] Error in listener for event '${eventName}':`,
          err,
        );
      }
    });
  }

  /**
   * Clear all registered event listeners
   */
  clear() {
    this.listeners.clear();
  }
}

export const GlobalPdfEventBus = new PdfEventBus();

if (typeof window !== "undefined") {
  window.ComprexaPdfEventBus = GlobalPdfEventBus;
}
