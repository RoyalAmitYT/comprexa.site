/**
 * JSON Tree Viewer Engine
 * Performs JSON validation, error line/column extraction, tree stats calculation,
 * and node search matching.
 */

export class TreeEngine {
  /**
   * Validate and parse JSON text
   * @param {string} rawText
   * @returns {Object} { isValid, data, stats, error }
   */
  static parse(rawText) {
    if (!rawText || !rawText.trim()) {
      return {
        isValid: null,
        data: null,
        stats: { objects: 0, arrays: 0, keys: 0, depth: 0 },
        error: null,
      };
    }

    try {
      const parsed = JSON.parse(rawText);
      const stats = this.calculateStats(parsed);

      return {
        isValid: true,
        data: parsed,
        stats,
        error: null,
      };
    } catch (err) {
      const errorDetails = this.extractErrorDetails(rawText, err);
      return {
        isValid: false,
        data: null,
        stats: { objects: 0, arrays: 0, keys: 0, depth: 0 },
        error: errorDetails,
      };
    }
  }

  /**
   * Calculate node statistics (objects, arrays, keys, max depth)
   */
  static calculateStats(data) {
    let objects = 0;
    let arrays = 0;
    let keys = 0;
    let maxDepth = 0;

    function traverse(node, depth) {
      if (depth > maxDepth) maxDepth = depth;

      if (node === null || typeof node !== "object") {
        return;
      }

      if (Array.isArray(node)) {
        arrays++;
        for (let i = 0; i < node.length; i++) {
          traverse(node[i], depth + 1);
        }
      } else {
        objects++;
        const nodeKeys = Object.keys(node);
        keys += nodeKeys.length;
        for (const key of nodeKeys) {
          traverse(node[key], depth + 1);
        }
      }
    }

    traverse(data, 1);

    return {
      objects,
      arrays,
      keys,
      depth: maxDepth,
    };
  }

  /**
   * Extract line number, column, snippet, and friendly message from error
   */
  static extractErrorDetails(text, err) {
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

    let cleanMsg = rawMsg;
    if (rawMsg.includes("Unexpected end of JSON input")) {
      cleanMsg =
        'Unexpected end of JSON input. Missing closing brace `}`, bracket `]`, or quote `"`.';
    } else if (rawMsg.includes("Unexpected token")) {
      const charMatch = rawMsg.match(/Unexpected token (.*?) in JSON/i);
      const token = charMatch ? charMatch[1] : "";
      cleanMsg = token
        ? `Unexpected token ${token} at line ${line}, column ${column}. Check for trailing commas or unquoted keys.`
        : `Syntax error at line ${line}, column ${column}. Check key-value syntax.`;
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
}
