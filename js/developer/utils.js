// @ts-nocheck
/**
 * Comprexa Developer Tools Shared Utility Suite
 * High-performance JSON parsing, error diagnosis, node tree statistics, and byte metrics
 */

import jsYaml from "js-yaml";

export class JsonUtils {
  /**
   * Parse JSON string and extract diagnostic errors & node metrics
   * @param {string} text
   * @returns {Object} { valid, data, error, stats }
   */
  static parseJson(text) {
    if (!text || !text.trim()) {
      return {
        valid: null,
        data: null,
        error: null,
        stats: {
          objects: 0,
          arrays: 0,
          keys: 0,
          primitiveValues: 0,
          maxDepth: 0,
          byteSize: 0,
        },
      };
    }

    const byteSize = this.getByteSize(text);

    try {
      const data = JSON.parse(text);
      const stats = this.analyzeJsonStructure(data);
      stats.byteSize = byteSize;

      return {
        valid: true,
        data,
        error: null,
        stats,
      };
    } catch (err) {
      const errorInfo = this.getJsonErrorInfo(text, err);
      return {
        valid: false,
        data: null,
        error: errorInfo,
        stats: {
          objects: 0,
          arrays: 0,
          keys: 0,
          primitiveValues: 0,
          maxDepth: 0,
          byteSize,
        },
      };
    }
  }

  /**
   * Parse YAML string using js-yaml with detailed error diagnosis
   * @param {string} text
   * @returns {Object} { valid, data, error, stats }
   */
  static parseYaml(text) {
    if (!text || !text.trim()) {
      return {
        valid: null,
        data: null,
        error: null,
        stats: {
          objects: 0,
          arrays: 0,
          keys: 0,
          primitiveValues: 0,
          maxDepth: 0,
          byteSize: 0,
        },
      };
    }

    const byteSize = this.getByteSize(text);

    try {
      const data = jsYaml.load(text);
      const stats = this.analyzeJsonStructure(data);
      stats.byteSize = byteSize;

      return {
        valid: true,
        data,
        error: null,
        stats,
      };
    } catch (err) {
      const line = err.mark ? err.mark.line + 1 : 1;
      const column = err.mark ? err.mark.column + 1 : 1;
      const lines = text.split(/\r\n|\r|\n/);
      const errLineContent = lines[line - 1] || "";
      const caretPadding = Math.max(0, column - 1);
      const snippetWithCaret = `${errLineContent}\n${" ".repeat(caretPadding)}^`;

      return {
        valid: false,
        data: null,
        error: {
          message: err.reason || err.message || "Invalid YAML Syntax",
          line,
          column,
          snippet: errLineContent,
          snippetWithCaret,
        },
        stats: {
          objects: 0,
          arrays: 0,
          keys: 0,
          primitiveValues: 0,
          maxDepth: 0,
          byteSize,
        },
      };
    }
  }

  /**
   * Convert JS object to YAML string
   * @param {any} data
   * @param {number} indent - 2 or 4
   * @returns {string}
   */
  static jsonToYaml(data, indent = 2) {
    if (data === undefined || data === null) return "";
    try {
      return jsYaml.dump(data, {
        indent: parseInt(indent, 10) || 2,
        lineWidth: -1,
        noRefs: true,
        skipInvalid: true,
      });
    } catch (err) {
      throw new Error(`YAML Conversion Error: ${err.message}`);
    }
  }

  /**
   * Convert YAML string to JSON string
   * @param {string} yamlText
   * @param {number|string} indent - 2, 4, or '\t'
   * @returns {Object} { valid, jsonText, yamlData, error }
   */
  static yamlToJson(yamlText, indent = 2) {
    const parseResult = this.parseYaml(yamlText);
    if (!parseResult.valid) {
      return {
        valid: false,
        jsonText: "",
        yamlData: null,
        error: parseResult.error,
      };
    }

    const jsonText = this.prettyPrintJson(parseResult.data, indent);
    return { valid: true, jsonText, yamlData: parseResult.data, error: null };
  }

  /**
   * Auto-detect format (JSON vs YAML vs future XML/TOML/CSV)
   * @param {string} text
   * @returns {'json'|'yaml'|'xml'|'unknown'}
   */
  static detectFormat(text) {
    if (!text || !text.trim()) return "unknown";
    const trimmed = text.trim();

    // Check JSON
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        JSON.parse(trimmed);
        return "json";
      } catch (e) {
        // Fallthrough
      }
    }

    // Check XML
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      return "xml";
    }

    // Check YAML
    try {
      const data = jsYaml.load(trimmed);
      if (data && typeof data === "object") {
        return "yaml";
      }
    } catch (e) {
      // Fallthrough
    }

    return "unknown";
  }

  /**
   * Format JSON with configurable indentation
   * @param {any} data
   * @param {number|string} indent - 2, 4, or '\t'
   * @returns {string}
   */
  static prettyPrintJson(data, indent = 2) {
    if (data === undefined) return "";
    let space = indent;
    if (indent === "tab" || indent === "\t") {
      space = "\t";
    } else if (typeof indent === "string") {
      const parsedInt = parseInt(indent, 10);
      space = isNaN(parsedInt) ? 2 : parsedInt;
    }
    return JSON.stringify(data, null, space);
  }

  /**
   * Minify JSON data
   * @param {any} data
   * @param {string} rawText
   * @returns {Object} { minifiedText, originalSize, minifiedSize, bytesSaved, percentSaved }
   */
  static minifyJson(data, rawText = "") {
    if (data === undefined) {
      return {
        minifiedText: "",
        originalSize: 0,
        minifiedSize: 0,
        bytesSaved: 0,
        percentSaved: 0,
      };
    }

    const minifiedText = JSON.stringify(data);
    const originalSize = rawText
      ? this.getByteSize(rawText)
      : this.getByteSize(JSON.stringify(data, null, 2));
    const minifiedSize = this.getByteSize(minifiedText);
    const bytesSaved = Math.max(0, originalSize - minifiedSize);
    const percentSaved =
      originalSize > 0 ? ((bytesSaved / originalSize) * 100).toFixed(1) : "0";

    return {
      minifiedText,
      originalSize,
      minifiedSize,
      bytesSaved,
      percentSaved: parseFloat(percentSaved),
    };
  }

  /**
   * Extract human-readable error, line number, column number, and snippet
   */
  static getJsonErrorInfo(text, err) {
    const rawMsg = err ? err.message : "Invalid JSON Syntax";
    let line = 1;
    let column = 1;
    let pos = -1;

    // V8 match: "in JSON at position 123"
    const posMatch = rawMsg.match(/at position (\d+)/i);
    if (posMatch) {
      pos = parseInt(posMatch[1], 10);
    } else {
      // Firefox match: "line 2 column 5"
      const lineColMatch = rawMsg.match(/line (\d+) column (\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      }
    }

    if (pos >= 0 && pos <= text.length) {
      line = 1;
      column = 1;
      for (let i = 0; i < pos; i++) {
        if (text[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
    }

    const lines = text.split(/\r\n|\r|\n/);
    const errLineContent = lines[line - 1] || "";

    // Create a visual indicator caret
    const caretPadding = Math.max(0, column - 1);
    const snippetWithCaret = `${errLineContent}\n${" ".repeat(caretPadding)}^`;

    let userFriendlyMsg = rawMsg;
    if (rawMsg.includes("Unexpected end of JSON input")) {
      userFriendlyMsg =
        'Unexpected end of JSON input. Missing closing brace `}`, bracket `]`, or string quote `"`.';
    } else if (rawMsg.includes("Unexpected token")) {
      const charMatch = rawMsg.match(/Unexpected token (.*?) in JSON/i);
      const token = charMatch ? charMatch[1] : "";
      userFriendlyMsg = token
        ? `Unexpected token ${token} at line ${line}, column ${column}. Check for trailing commas or missing quotes.`
        : `Syntax error at line ${line}, column ${column}. Check for valid JSON key-value pairs.`;
    }

    return {
      message: userFriendlyMsg,
      line,
      column,
      position: pos,
      snippet: errLineContent,
      snippetWithCaret,
    };
  }

  /**
   * Traverse JSON structure and aggregate node counts
   */
  static analyzeJsonStructure(data) {
    let objects = 0;
    let arrays = 0;
    let keys = 0;
    let primitiveValues = 0;
    let maxDepth = 0;

    function traverse(node, depth = 1) {
      if (depth > maxDepth) maxDepth = depth;

      if (node === null || typeof node !== "object") {
        primitiveValues++;
        return;
      }

      if (Array.isArray(node)) {
        arrays++;
        for (let i = 0; i < node.length; i++) {
          traverse(node[i], depth + 1);
        }
      } else {
        objects++;
        const keyList = Object.keys(node);
        keys += keyList.length;
        for (let i = 0; i < keyList.length; i++) {
          traverse(node[keyList[i]], depth + 1);
        }
      }
    }

    if (data !== undefined && data !== null) {
      traverse(data, 1);
    }

    return { objects, arrays, keys, primitiveValues, maxDepth };
  }

  /**
   * Get byte count of UTF-8 string
   */
  static getByteSize(str) {
    if (!str) return 0;
    return new Blob([str]).size;
  }

  /**
   * Format bytes to human readable size (Bytes, KB, MB)
   */
  static formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

window.JsonUtils = JsonUtils;
