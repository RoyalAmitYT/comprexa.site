// @ts-nocheck
/**
 * JSON ↔ YAML Converter Engine
 * Handles format auto-detection, JSON parsing/dumping, YAML parsing/dumping via js-yaml,
 * and error line/column extraction for both formats.
 */

import * as yaml from "js-yaml";

export class ConverterEngine {
  /**
   * Auto-detect input format as 'json' or 'yaml'
   * @param {string} text
   * @returns {'json' | 'yaml'}
   */
  static detectFormat(text) {
    if (!text || !text.trim()) return "json";

    const trimmed = text.trim();

    // Fast check: starts with { or [ -> high likelihood of JSON
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        JSON.parse(trimmed);
        return "json";
      } catch (e) {
        // Fallback checks below
      }
    }

    // Try YAML parse
    try {
      const parsed = yaml.load(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        // If it starts with { or [ it could be valid JSON as well (JSON is valid YAML)
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          return "json";
        }
        return "yaml";
      }
    } catch (e) {
      // If YAML parse failed, fallback based on brackets
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return "json";
      }
    }

    return "yaml";
  }

  /**
   * Convert text according to requested mode ('json-to-yaml', 'yaml-to-json', or 'auto')
   * @param {string} rawText
   * @param {string} mode 'json-to-yaml' | 'yaml-to-json' | 'auto'
   * @param {number} indent
   * @returns {Object} { isValid, actualMode, outputText, error }
   */
  static convert(rawText, mode = "auto", indent = 2) {
    if (!rawText || !rawText.trim()) {
      return {
        isValid: null,
        actualMode: mode === "auto" ? "json-to-yaml" : mode,
        outputText: "",
        error: null,
      };
    }

    let actualMode = mode;
    if (mode === "auto") {
      const detected = this.detectFormat(rawText);
      actualMode = detected === "yaml" ? "yaml-to-json" : "json-to-yaml";
    }

    if (actualMode === "json-to-yaml") {
      return this.convertJsonToYaml(rawText, indent);
    } else {
      return this.convertYamlToJson(rawText, indent);
    }
  }

  /**
   * Convert JSON text to YAML
   */
  static convertJsonToYaml(rawText, indent = 2) {
    try {
      const parsed = JSON.parse(rawText);
      const yamlOutput = yaml.dump(parsed, {
        indent,
        noRefs: true,
        lineWidth: -1,
        noCompatMode: true,
      });

      return {
        isValid: true,
        actualMode: "json-to-yaml",
        outputText: yamlOutput,
        error: null,
      };
    } catch (err) {
      const errorDetails = this.extractJsonErrorDetails(rawText, err);
      return {
        isValid: false,
        actualMode: "json-to-yaml",
        outputText: "",
        error: errorDetails,
      };
    }
  }

  /**
   * Convert YAML text to JSON
   */
  static convertYamlToJson(rawText, indent = 2) {
    try {
      const parsed = yaml.load(rawText);
      if (parsed === undefined) {
        return {
          isValid: true,
          actualMode: "yaml-to-json",
          outputText: "",
          error: null,
        };
      }

      const jsonOutput = JSON.stringify(parsed, null, indent);

      return {
        isValid: true,
        actualMode: "yaml-to-json",
        outputText: jsonOutput,
        error: null,
      };
    } catch (err) {
      const errorDetails = this.extractYamlErrorDetails(rawText, err);
      return {
        isValid: false,
        actualMode: "yaml-to-json",
        outputText: "",
        error: errorDetails,
      };
    }
  }

  /**
   * Extract JSON error line & column
   */
  static extractJsonErrorDetails(text, err) {
    const rawMsg = err ? err.message : "Invalid JSON Syntax";
    let line = 1;
    let column = 1;
    let pos = -1;

    const posMatch = rawMsg.match(/at position (\d+)/i);
    if (posMatch) {
      pos = parseInt(posMatch[1], 10);
    } else {
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
    const caretPadding = Math.max(0, column - 1);
    const snippetWithCaret = `${errLineContent}\n${" ".repeat(caretPadding)}^`;

    return {
      message: rawMsg,
      line,
      column,
      position: pos,
      snippet: errLineContent,
      snippetWithCaret,
    };
  }

  /**
   * Extract YAML error line & column using js-yaml YAMLException mark
   */
  static extractYamlErrorDetails(text, err) {
    let line = 1;
    let column = 1;
    let snippet = "";
    let message = err ? err.message : "Invalid YAML Syntax";

    if (err && err.mark) {
      line = err.mark.line + 1;
      column = err.mark.column + 1;
      snippet = err.mark.snippet || "";
      if (err.reason) {
        message = `YAML Syntax Error: ${err.reason} at line ${line}, column ${column}`;
      }
    }

    const lines = text.split(/\r\n|\r|\n/);
    const errLineContent = lines[line - 1] || "";
    const caretPadding = Math.max(0, column - 1);
    const snippetWithCaret =
      snippet || `${errLineContent}\n${" ".repeat(caretPadding)}^`;

    return {
      message,
      line,
      column,
      snippet: errLineContent,
      snippetWithCaret,
    };
  }
}
