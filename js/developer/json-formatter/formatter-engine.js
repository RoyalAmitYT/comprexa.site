// @ts-nocheck
/**
 * JSON Formatter Engine (Independent Implementation)
 * Provides high-performance formatting, minification, indentation control, and recursive key sorting.
 */

export class FormatterEngine {
  /**
   * Format JSON data according to options
   * @param {string} rawText - Raw input JSON string
   * @param {Object} options
   * @param {string} options.mode - 'pretty' | 'minify'
   * @param {number|string} options.indentation - 2, 4, or 'tab'
   * @param {boolean} options.sortKeys - Whether to sort object keys alphabetically
   * @returns {Object} { success, formattedText, error, byteSize, originalSize, bytesSaved }
   */
  static format(rawText, options = {}) {
    if (!rawText || !rawText.trim()) {
      return {
        success: true,
        formattedText: "",
        error: null,
        byteSize: 0,
        originalSize: 0,
        bytesSaved: 0,
      };
    }

    const { mode = "pretty", indentation = 2, sortKeys = false } = options;

    const originalSize = new Blob([rawText]).size;

    try {
      let parsed = JSON.parse(rawText);

      // Sort keys if requested
      if (sortKeys) {
        parsed = this.sortObjectKeys(parsed);
      }

      let formattedText = "";
      if (mode === "minify") {
        formattedText = JSON.stringify(parsed);
      } else {
        let space = indentation;
        if (indentation === "tab" || indentation === "\t") {
          space = "\t";
        } else {
          space = parseInt(indentation, 10) || 2;
        }
        formattedText = JSON.stringify(parsed, null, space);
      }

      const byteSize = new Blob([formattedText]).size;
      const bytesSaved = Math.max(0, originalSize - byteSize);

      return {
        success: true,
        formattedText,
        error: null,
        byteSize,
        originalSize,
        bytesSaved,
      };
    } catch (err) {
      return {
        success: false,
        formattedText: "",
        error: err,
        byteSize: 0,
        originalSize,
        bytesSaved: 0,
      };
    }
  }

  /**
   * Recursively sort object keys alphabetically
   * @param {any} value
   * @returns {any}
   */
  static sortObjectKeys(value) {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sortObjectKeys(item));
    }

    const sortedObj = {};
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));

    for (const key of keys) {
      sortedObj[key] = this.sortObjectKeys(value[key]);
    }

    return sortedObj;
  }
}
