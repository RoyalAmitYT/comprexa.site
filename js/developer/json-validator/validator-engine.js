/**
 * JSON Validator Engine (Independent Implementation)
 * Performs real-time syntax parsing, error location extraction (line, column, position, caret snippet),
 * and object tree metric calculations (Objects, Arrays, Keys, Size, Max Depth).
 */

export class ValidatorEngine {
  /**
   * Parse and validate JSON input with structural analysis
   * @param {string} text
   * @returns {Object} { isValid, error, stats }
   */
  static validate(text) {
    if (!text || !text.trim()) {
      return {
        isValid: null,
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

    const byteSize = new Blob([text]).size;

    try {
      const parsed = JSON.parse(text);
      const stats = this.analyzeTreeStructure(parsed);
      stats.byteSize = byteSize;

      return {
        isValid: true,
        data: parsed,
        error: null,
        stats,
      };
    } catch (err) {
      const errorDetails = this.extractErrorDetails(text, err);
      return {
        isValid: false,
        data: null,
        error: errorDetails,
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
   * Extract error line, column, snippet, and friendly error message
   */
  static extractErrorDetails(text, err) {
    const rawMsg = err ? err.message : "Invalid JSON Syntax";
    let line = 1;
    let column = 1;
    let pos = -1;

    // V8 match: "at position 123"
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

    const caretPadding = Math.max(0, column - 1);
    const snippetWithCaret = `${errLineContent}\n${" ".repeat(caretPadding)}^`;

    let cleanMsg = rawMsg;
    if (rawMsg.includes("Unexpected end of JSON input")) {
      cleanMsg =
        'Unexpected end of JSON input. Missing closing brace `}`, bracket `]`, or string quote `"`.';
    } else if (rawMsg.includes("Unexpected token")) {
      const charMatch = rawMsg.match(/Unexpected token (.*?) in JSON/i);
      const token = charMatch ? charMatch[1] : "";
      cleanMsg = token
        ? `Unexpected token ${token} at line ${line}, column ${column}. Check for trailing commas or missing quotes.`
        : `Syntax error at line ${line}, column ${column}. Check key-value pair syntax.`;
    }

    return {
      message: cleanMsg,
      line,
      column,
      position: pos,
      snippet: errLineContent,
      snippetWithCaret,
    };
  }

  /**
   * Calculate node metrics by traversing the JSON object
   */
  static analyzeTreeStructure(data) {
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
}
