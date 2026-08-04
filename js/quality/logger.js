/**
 * Comprexa Quality Framework - Centralized Error & Event Logger
 * Categorized logging with developer debug output, user-friendly messages, and remote telemetry hooks.
 */

export const LogCategory = {
  UI: "UI",
  PDF: "PDF",
  SETTINGS: "SETTINGS",
  FRAMEWORK: "FRAMEWORK",
  NETWORK: "NETWORK",
  QUALITY: "QUALITY",
};

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

export class ComprexaLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
    this.minLevel = LogLevel.INFO;
    this.remoteEndpoints = [];
  }

  /**
   * Set minimum log level
   * @param {number} level
   */
  setLogLevel(level) {
    this.minLevel = level;
  }

  /**
   * Primary log method
   * @param {number} level
   * @param {string} category
   * @param {string} message
   * @param {Object} [details]
   */
  log(level, category, message, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Server",
    };

    // Store in-memory buffer
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console if meets min level or debug mode is active
    const isDebugActive =
      typeof window !== "undefined" &&
      window.ComprexaDebug &&
      window.ComprexaDebug.isEnabled();

    if (level >= this.minLevel || isDebugActive) {
      const prefix = `[Comprexa:${category}]`;
      switch (level) {
        case LogLevel.DEBUG:
          break;
        case LogLevel.INFO:
          break;
        case LogLevel.WARN:
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, details || "");
          break;
      }
    }

    // Trigger remote logging callbacks if registered
    if (level === LogLevel.ERROR) {
      this.flushRemote(logEntry);
    }

    return logEntry;
  }

  debug(category, message, details) {
    return this.log(LogLevel.DEBUG, category, message, details);
  }

  info(category, message, details) {
    return this.log(LogLevel.INFO, category, message, details);
  }

  warn(category, message, details) {
    return this.log(LogLevel.WARN, category, message, details);
  }

  error(category, message, details) {
    return this.log(LogLevel.ERROR, category, message, details);
  }

  /**
   * Register remote telemetry collector (future-ready)
   */
  registerRemoteEndpoint(endpointUrl) {
    if (endpointUrl && !this.remoteEndpoints.includes(endpointUrl)) {
      this.remoteEndpoints.push(endpointUrl);
    }
  }

  /**
   * Flush error to remote logging endpoints
   */
  flushRemote(logEntry) {
    this.remoteEndpoints.forEach((url) => {
      if (typeof fetch === "function") {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEntry),
        }).catch((err) => {
          // Silent fallback to avoid recursive logging loop
        });
      }
    });
  }

  /**
   * Retrieve in-memory log entries
   */
  getLogs(filterCategory = null) {
    if (!filterCategory) return [...this.logs];
    return this.logs.filter((l) => l.category === filterCategory);
  }

  clear() {
    this.logs = [];
  }
}

export const GlobalLogger = new ComprexaLogger();

if (typeof window !== "undefined") {
  window.ComprexaLogger = GlobalLogger;
}
