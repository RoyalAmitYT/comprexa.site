/**
 * JSON Minifier Engine
 * Performs real-time JSON validation, whitespace removal, byte calculation, and error line extraction.
 */

export class MinifierEngine {
  /**
   * Validate and minify JSON text
   * @param {string} rawText
   * @returns {Object} { isValid, minifiedText, stats, error }
   */
  static minify(rawText) {
    if (!rawText || !rawText.trim()) {
      return {
        isValid: null,
        minifiedText: "",
        stats: { origSize: 0, minSize: 0, savedBytes: 0, savedPercent: 0 },
        error: null,
      };
    }

    const origSize = new Blob([rawText]).size;

    try {
      const parsed = JSON.parse(rawText);
      const minifiedText = JSON.stringify(parsed);
      const minSize = new Blob([minifiedText]).size;

      const savedBytes = Math.max(0, origSize - minSize);
      const savedPercent =
        origSize > 0
          ? parseFloat(((savedBytes / origSize) * 100).toFixed(1))
          : 0;

      return {
        isValid: true,
        data: parsed,
        minifiedText,
        stats: {
          origSize,
          minSize,
          savedBytes,
          savedPercent,
        },
        error: null,
      };
    } catch (err) {
      const errorDetails = this.extractErrorDetails(rawText, err);
      return {
        isValid: false,
        minifiedText: "",
        stats: {
          origSize,
          minSize: 0,
          savedBytes: 0,
          savedPercent: 0,
        },
        error: errorDetails,
      };
    }
  }

  /**
   * Extract line number, column, snippet and error message from JSON parse error
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
}
