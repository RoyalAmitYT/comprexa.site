/**
 * JSON Formatter Validator Engine (Independent Implementation)
 * Extracts precise line numbers, columns, caret snippets, and clean user messages for JSON syntax errors.
 */

export class ValidatorEngine {
  /**
   * Validate JSON syntax and extract diagnostic position info
   * @param {string} text
   * @returns {Object} { isValid, error: { message, line, column, position, snippet, snippetWithCaret } }
   */
  static validate(text) {
    if (!text || !text.trim()) {
      return { isValid: null, error: null };
    }

    try {
      JSON.parse(text);
      return { isValid: true, error: null };
    } catch (err) {
      const errorDetails = this.extractErrorDetails(text, err);
      return { isValid: false, error: errorDetails };
    }
  }

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
        ? `Unexpected token ${token} at line ${line}, column ${column}. Check for trailing commas or unquoted strings.`
        : `Syntax error at line ${line}, column ${column}. Check key-value pair formatting.`;
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
