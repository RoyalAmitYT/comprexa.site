/**
 * Comprexa Quality Framework - Debug Mode Controller
 * Lightweight development-only toggle for diagnostic logs, visual bounding boxes, and performance overlays.
 */

import { GlobalLogger, LogCategory } from "./logger.js";

export class ComprexaDebugController {
  constructor() {
    this.debugKey = "comprexa_debug_mode";
    this.active = false;
    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    // Auto-detect localhost or dev environments
    const isDevHost = ["localhost", "127.0.0.1", "run.app"].some((host) =>
      window.location.hostname.includes(host),
    );
    const storedState = localStorage.getItem(this.debugKey);

    if (storedState !== null) {
      this.active = storedState === "true";
    } else {
      this.active = isDevHost;
    }

    if (this.active) {
      GlobalLogger.info(LogCategory.QUALITY, "Debug mode is ACTIVE.");
    }
  }

  enable() {
    this.active = true;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.debugKey, "true");
    }
    GlobalLogger.info(LogCategory.QUALITY, "Debug mode enabled.");
  }

  disable() {
    this.active = false;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.debugKey, "false");
    }
    GlobalLogger.info(LogCategory.QUALITY, "Debug mode disabled.");
  }

  toggle() {
    if (this.active) this.disable();
    else this.enable();
    return this.active;
  }

  isEnabled() {
    return this.active;
  }

  /**
   * Diagnostic summary dump
   */
  dumpState() {
    if (!this.active) return;
    console.group("🔍 Comprexa Debug State Dump");
    console.groupEnd();
  }
}

export const GlobalDebugController = new ComprexaDebugController();

if (typeof window !== "undefined") {
  window.ComprexaDebug = GlobalDebugController;
}
