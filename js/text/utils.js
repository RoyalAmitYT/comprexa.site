/**
 * Comprexa Shared Text Utilities Module
 * Reusable analysis and conversion logic for all text tools
 */

export class TextAnalyzer {
  /**
   * Count words in a string
   * Handles multi-language whitespace, tabs, and newlines accurately
   * @param {string} text
   * @returns {number}
   */
  static countWords(text) {
    if (!text || typeof text !== "string") return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    // Regex matches unicode word words or non-whitespace sequences
    const words = trimmed.match(/[\w\d\u00C0-\u024F\u0400-\u04FF'-]+/gi);
    return words ? words.length : 0;
  }

  /**
   * Count characters
   * @param {string} text
   * @param {boolean} includeSpaces
   * @returns {number}
   */
  static countCharacters(text, includeSpaces = true) {
    if (!text || typeof text !== "string") return 0;
    if (includeSpaces) return text.length;
    return text.replace(/\s/g, "").length;
  }

  /**
   * Count spaces
   * @param {string} text
   * @returns {number}
   */
  static countSpaces(text) {
    if (!text || typeof text !== "string") return 0;
    const matches = text.match(/\s/g);
    return matches ? matches.length : 0;
  }

  /**
   * Count lines
   * @param {string} text
   * @returns {number}
   */
  static countLines(text) {
    if (!text || typeof text !== "string") return 0;
    if (text.length === 0) return 0;
    return text.split(/\r\n|\r|\n/).length;
  }

  /**
   * Count paragraphs (separated by blank lines or line breaks)
   * @param {string} text
   * @returns {number}
   */
  static countParagraphs(text) {
    if (!text || typeof text !== "string") return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  }

  /**
   * Count sentences
   * @param {string} text
   * @returns {number}
   */
  static countSentences(text) {
    if (!text || typeof text !== "string") return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const sentences = trimmed.match(/[^.!?\n]+[.!?\n]+/g);
    if (sentences) return sentences.length;
    return 1; // Default to 1 sentence if non-empty text without trailing punctuation
  }

  /**
   * Estimate reading time
   * Average adult reading speed: ~200 - 250 wpm
   * @param {number} wordCount
   * @param {number} wpm
   * @returns {Object} { seconds, formatted }
   */
  static estimateReadingTime(wordCount, wpm = 200) {
    if (!wordCount || wordCount <= 0) {
      return { seconds: 0, formatted: "0 sec" };
    }
    const totalSeconds = Math.round((wordCount / wpm) * 60);
    if (totalSeconds < 60) {
      return { seconds: totalSeconds, formatted: `${totalSeconds} sec` };
    }
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (remainingSeconds === 0) {
      return { seconds: totalSeconds, formatted: `${minutes} min` };
    }
    return {
      seconds: totalSeconds,
      formatted: `${minutes} min ${remainingSeconds}s`,
    };
  }

  /**
   * Estimate speaking time
   * Average speaking speed: ~130 - 150 wpm
   * @param {number} wordCount
   * @param {number} wpm
   * @returns {Object} { seconds, formatted }
   */
  static estimateSpeakingTime(wordCount, wpm = 130) {
    return this.estimateReadingTime(wordCount, wpm);
  }

  /**
   * Calculate full text analysis metrics
   * @param {string} text
   * @returns {Object}
   */
  static analyze(text = "") {
    const words = this.countWords(text);
    const charsWithSpaces = this.countCharacters(text, true);
    const charsWithoutSpaces = this.countCharacters(text, false);
    const spaces = this.countSpaces(text);
    const lines = this.countLines(text);
    const paragraphs = this.countParagraphs(text);
    const sentences = this.countSentences(text);
    const readingTime = this.estimateReadingTime(words);
    const speakingTime = this.estimateSpeakingTime(words);

    return {
      words,
      charsWithSpaces,
      charsWithoutSpaces,
      spaces,
      lines,
      paragraphs,
      sentences,
      readingTime: readingTime.formatted,
      speakingTime: speakingTime.formatted,
      readingTimeSeconds: readingTime.seconds,
      speakingTimeSeconds: speakingTime.seconds,
    };
  }
}

export class TextConverter {
  /**
   * Convert text to UPPERCASE
   * @param {string} text
   * @returns {string}
   */
  static toUppercase(text) {
    if (!text) return "";
    return text.toUpperCase();
  }

  /**
   * Convert text to lowercase
   * @param {string} text
   * @returns {string}
   */
  static toLowercase(text) {
    if (!text) return "";
    return text.toLowerCase();
  }

  /**
   * Convert text to Title Case
   * Capitalizes main words, keeps minor articles/prepositions lowercase unless first/last word
   * @param {string} text
   * @returns {string}
   */
  static toTitleCase(text) {
    if (!text) return "";
    const minorWords = new Set([
      "a",
      "an",
      "and",
      "as",
      "at",
      "but",
      "by",
      "en",
      "for",
      "if",
      "in",
      "of",
      "on",
      "or",
      "the",
      "to",
      "v",
      "via",
      "vs",
    ]);

    return text
      .toLowerCase()
      .split(/(\s+)/)
      .map((part, index, array) => {
        if (/^\s+$/.test(part)) return part;
        const cleanWord = part.toLowerCase();
        const isFirstOrLast = index === 0 || index === array.length - 1;

        if (!isFirstOrLast && minorWords.has(cleanWord)) {
          return cleanWord;
        }
        return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
      })
      .join("");
  }

  /**
   * Convert text to Sentence case
   * Capitalizes the first letter of each sentence
   * @param {string} text
   * @returns {string}
   */
  static toSentenceCase(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(
        /(^\s*|[.!?]\s+)([a-z\u00C0-\u024F\u0400-\u04FF])/g,
        (match, separator, char) => {
          return separator + char.toUpperCase();
        },
      );
  }

  /**
   * Capitalize Every Word
   * @param {string} text
   * @returns {string}
   */
  static toCapitalizeWords(text) {
    if (!text) return "";
    return text.replace(/\b([a-z\u00C0-\u024F\u0400-\u04FF])/gi, (match) =>
      match.toUpperCase(),
    );
  }

  /**
   * Toggle Case (swap upper <-> lower)
   * @param {string} text
   * @returns {string}
   */
  static toToggleCase(text) {
    if (!text) return "";
    return text
      .split("")
      .map((char) => {
        const lower = char.toLowerCase();
        const upper = char.toUpperCase();
        if (char === lower) return upper;
        if (char === upper) return lower;
        return char;
      })
      .join("");
  }

  /**
   * Remove extra whitespace & blank lines with configurable options
   * @param {string} text
   * @param {Object} options
   * @returns {string}
   */
  static cleanExtraSpaces(text, options = {}) {
    if (!text) return "";
    const {
      removeMultipleSpaces = true,
      removeLeadingSpaces = true,
      removeTrailingSpaces = true,
      removeBlankLines = false,
      normalizeWhitespace = true,
    } = options;

    let processed = text;

    if (normalizeWhitespace) {
      // Replace tabs, non-breaking spaces with standard space
      processed = processed.replace(
        /[\t\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g,
        " ",
      );
    }

    let lines = processed.split(/\r\n|\r|\n/);

    lines = lines.map((line) => {
      let l = line;
      if (removeMultipleSpaces) {
        l = l.replace(/ {2,}/g, " ");
      }
      if (removeLeadingSpaces) {
        l = l.replace(/^ +/, "");
      }
      if (removeTrailingSpaces) {
        l = l.replace(/ +$/, "");
      }
      return l;
    });

    if (removeBlankLines) {
      lines = lines.filter((l) => l.trim().length > 0);
    }

    return lines.join("\n");
  }

  /**
   * Legacy remove extra spaces
   * @param {string} text
   * @returns {string}
   */
  static removeExtraSpaces(text) {
    return this.cleanExtraSpaces(text, {
      removeMultipleSpaces: true,
      removeLeadingSpaces: true,
      removeTrailingSpaces: true,
      removeBlankLines: true,
      normalizeWhitespace: true,
    });
  }

  /**
   * Remove duplicate lines with detailed metrics
   * @param {string} text
   * @param {Object} options
   * @returns {Object} { result, totalLines, removedCount, remainingCount }
   */
  static removeDuplicateLinesAdvanced(text, options = {}) {
    if (!text) {
      return { result: "", totalLines: 0, removedCount: 0, remainingCount: 0 };
    }

    const {
      caseSensitive = false,
      ignoreEmptyLines = false,
      trimBeforeCompare = true,
    } = options;

    const lines = text.split(/\r\n|\r|\n/);
    const totalLines = lines.length;

    const seen = new Set();
    const resultLines = [];

    lines.forEach((line) => {
      const isBlank = line.trim().length === 0;

      if (isBlank && ignoreEmptyLines) {
        // preserve blank lines as is without deduplicating
        resultLines.push(line);
        return;
      }

      let key = line;
      if (trimBeforeCompare) {
        key = key.trim();
      }
      if (!caseSensitive) {
        key = key.toLowerCase();
      }

      if (!seen.has(key)) {
        seen.add(key);
        resultLines.push(line);
      }
    });

    const remainingCount = resultLines.length;
    const removedCount = totalLines - remainingCount;

    return {
      result: resultLines.join("\n"),
      totalLines,
      removedCount,
      remainingCount,
    };
  }

  /**
   * Sort lines with advanced parameters
   * @param {string} text
   * @param {Object} options
   * @returns {string}
   */
  static sortLinesAdvanced(text, options = {}) {
    if (!text) return "";

    const {
      mode = "alpha-asc", // 'alpha-asc' | 'alpha-desc' | 'length-asc' | 'length-desc'
      ignoreCase = true,
      removeEmptyLines = false,
      trimLines = false,
    } = options;

    let lines = text.split(/\r\n|\r|\n/);

    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmptyLines) {
      lines = lines.filter((l) => l.length > 0);
    }

    lines.sort((a, b) => {
      if (mode === "length-asc") {
        return (
          a.length - b.length ||
          (ignoreCase
            ? a.toLowerCase().localeCompare(b.toLowerCase())
            : a.localeCompare(b))
        );
      }
      if (mode === "length-desc") {
        return (
          b.length - a.length ||
          (ignoreCase
            ? a.toLowerCase().localeCompare(b.toLowerCase())
            : a.localeCompare(b))
        );
      }

      const strA = ignoreCase ? a.toLowerCase() : a;
      const strB = ignoreCase ? b.toLowerCase() : b;

      if (mode === "alpha-desc") {
        return strB.localeCompare(strA);
      }
      // default alpha-asc
      return strA.localeCompare(strB);
    });

    return lines.join("\n");
  }

  /**
   * Sort lines alphabetically
   * @param {string} text
   * @param {boolean} reverse
   * @returns {string}
   */
  static sortLines(text, reverse = false) {
    if (!text) return "";
    const lines = text.split(/\r\n|\r|\n/);
    lines.sort((a, b) => a.localeCompare(b));
    if (reverse) lines.reverse();
    return lines.join("\n");
  }

  /**
   * Remove duplicate lines
   * @param {string} text
   * @returns {string}
   */
  static removeDuplicateLines(text) {
    if (!text) return "";
    const lines = text.split(/\r\n|\r|\n/);
    const unique = Array.from(new Set(lines));
    return unique.join("\n");
  }

  /**
   * Reverse entire text or line by line
   * @param {string} text
   * @returns {string}
   */
  static reverseText(text) {
    if (!text) return "";
    return text.split("").reverse().join("");
  }

  /**
   * Convert string to URL slug
   * @param {string} text
   * @returns {string}
   */
  static slugify(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

window.TextAnalyzer = TextAnalyzer;
window.TextConverter = TextConverter;
