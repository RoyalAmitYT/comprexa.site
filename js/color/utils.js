/**
 * Comprexa Color Engine & Utility Suite
 * High-precision color parsing, multi-format conversion (HEX, RGB, RGBA, HSL, HSLA, HSV, CMYK, CSS),
 * palette generation algorithms, WCAG contrast checks, and file export utilities.
 */

export class ColorEngine {
  /**
   * Parse any input string (HEX, RGB, RGBA, HSL, HSLA, HSV) or object.
   * Returns a complete color representation object or error details.
   */
  static parseColor(input) {
    if (!input || typeof input !== "string") {
      if (typeof input === "object" && input !== null) {
        if ("r" in input && "g" in input && "b" in input) {
          return this.fromRgb(input.r, input.g, input.b, input.a ?? 1);
        }
      }
      return { valid: false, error: "Color input is empty." };
    }

    const str = input.trim();
    if (!str) {
      return { valid: false, error: "Color input is empty." };
    }

    // 1. Try HEX (#FFF, #FFFF, #FFFFFF, #FFFFFFFF, or without #)
    if (/^#?[0-9A-Fa-f]{3,8}$/.test(str)) {
      let hex = str.startsWith("#") ? str : "#" + str;
      if (hex.length === 4) {
        // #RGB -> #RRGGBB
        hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      } else if (hex.length === 5) {
        // #RGBA -> #RRGGBBAA
        hex =
          "#" +
          hex[1] +
          hex[1] +
          hex[2] +
          hex[2] +
          hex[3] +
          hex[3] +
          hex[4] +
          hex[4];
      }

      if (hex.length === 7) {
        const num = parseInt(hex.slice(1), 16);
        return this.fromRgb((num >> 16) & 255, (num >> 8) & 255, num & 255, 1);
      } else if (hex.length === 9) {
        const num = parseInt(hex.slice(1), 16);
        const r = (num >> 24) & 255;
        const g = (num >> 16) & 255;
        const b = (num >> 8) & 255;
        const a = parseFloat(((num & 255) / 255).toFixed(2));
        return this.fromRgb(r, g, b, a);
      }
    }

    // 2. Try RGB / RGBA: e.g. "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.8)", or "255, 0, 0"
    const rgbMatch =
      str.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)$/i,
      ) ||
      str.match(
        /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?$/,
      );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;

      if (r > 255 || g > 255 || b > 255) {
        return { valid: false, error: "RGB values must be between 0 and 255." };
      }
      if (a < 0 || a > 1) {
        return {
          valid: false,
          error: "Alpha transparency must be between 0 and 1.",
        };
      }
      return this.fromRgb(r, g, b, a);
    }

    // 3. Try HSL / HSLA: e.g. "hsl(210, 100%, 50%)", "hsla(210, 100%, 50%, 0.5)"
    const hslMatch = str.match(
      /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*([\d.]+))?\s*\)$/i,
    );
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10);
      const s = parseInt(hslMatch[2], 10);
      const l = parseInt(hslMatch[3], 10);
      const a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;

      if (h > 360)
        return {
          valid: false,
          error: "Hue must be between 0 and 360 degrees.",
        };
      if (s > 100 || l > 100)
        return {
          valid: false,
          error: "Saturation and Lightness must be between 0% and 100%.",
        };
      if (a < 0 || a > 1)
        return { valid: false, error: "Alpha must be between 0 and 1." };

      return this.fromHsl(h, s, l, a);
    }

    // 4. Try HSV / HSVA: e.g. "hsv(210, 100%, 50%)" or "hsv(210, 100, 50)"
    const hsvMatch = str.match(
      /^hsva?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?(?:\s*,\s*([\d.]+))?\s*\)$/i,
    );
    if (hsvMatch) {
      const h = parseInt(hsvMatch[1], 10);
      const s = parseInt(hsvMatch[2], 10);
      const v = parseInt(hsvMatch[3], 10);
      const a = hsvMatch[4] !== undefined ? parseFloat(hsvMatch[4]) : 1;

      if (h > 360)
        return { valid: false, error: "HSV Hue must be between 0 and 360." };
      if (s > 100 || v > 100)
        return {
          valid: false,
          error: "HSV Saturation and Value must be between 0 and 100.",
        };

      const rgb = this.hsvToRgb(h, s, v);
      return this.fromRgb(rgb.r, rgb.g, rgb.b, a);
    }

    return {
      valid: false,
      error:
        "Unrecognized or malformed color syntax. Use HEX (#2563EB), RGB (rgb(37,99,235)), HSL (hsl(221,83%,53%)), or HSV.",
    };
  }

  /**
   * Build complete Color Object from RGB
   */
  static fromRgb(r, g, b, a = 1) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    a = Math.max(0, Math.min(1, parseFloat(a.toFixed(2))));

    const hex = this.rgbToHex(r, g, b);
    const hexAlpha =
      a < 1
        ? hex +
          Math.round(a * 255)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase()
        : hex;
    const hsl = this.rgbToHsl(r, g, b);
    const hsv = this.rgbToHsv(r, g, b);
    const cmyk = this.rgbToCmyk(r, g, b);
    const textContrast = this.getContrastColor(r, g, b);

    return {
      valid: true,
      error: null,
      hex,
      hexAlpha,
      rgb: { r, g, b, a },
      hsl: { h: hsl.h, s: hsl.s, l: hsl.l, a },
      hsv: { h: hsv.h, s: hsv.s, v: hsv.v, a },
      cmyk,
      strings: {
        hex,
        hexAlpha,
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`,
        hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
        cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
        cssVar: `--color-accent: ${hex};`,
        cssColor: a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : hex,
      },
      textContrast,
    };
  }

  /**
   * Build complete Color Object from HSL
   */
  static fromHsl(h, s, l, a = 1) {
    const rgb = this.hslToRgb(h, s, l);
    return this.fromRgb(rgb.r, rgb.g, rgb.b, a);
  }

  // --- Math Conversions ---

  static rgbToHex(r, g, b) {
    const toHex = (v) => v.toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r1 = 0,
      g1 = 0,
      b1 = 0;
    if (h < 60) {
      r1 = c;
      g1 = x;
      b1 = 0;
    } else if (h < 120) {
      r1 = x;
      g1 = c;
      b1 = 0;
    } else if (h < 180) {
      r1 = 0;
      g1 = c;
      b1 = x;
    } else if (h < 240) {
      r1 = 0;
      g1 = x;
      b1 = c;
    } else if (h < 300) {
      r1 = x;
      g1 = 0;
      b1 = c;
    } else {
      r1 = c;
      g1 = 0;
      b1 = x;
    }

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  static rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const v = max;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }

  static hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r1 = 0,
      g1 = 0,
      b1 = 0;
    if (h < 60) {
      r1 = c;
      g1 = x;
      b1 = 0;
    } else if (h < 120) {
      r1 = x;
      g1 = c;
      b1 = 0;
    } else if (h < 180) {
      r1 = 0;
      g1 = c;
      b1 = x;
    } else if (h < 240) {
      r1 = 0;
      g1 = x;
      b1 = c;
    } else if (h < 300) {
      r1 = x;
      g1 = 0;
      b1 = c;
    } else {
      r1 = c;
      g1 = 0;
      b1 = x;
    }

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  static rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;

    const k = 1 - Math.max(r1, g1, b1);
    const c = (1 - r1 - k) / (1 - k);
    const m = (1 - g1 - k) / (1 - k);
    const y = (1 - b1 - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  }

  /**
   * Determine ideal foreground text color (#FFFFFF or #000000) for contrast
   */
  static getContrastColor(r, g, b) {
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#0f172a" : "#ffffff";
  }

  // --- Palette Generation Algorithms ---

  /**
   * Generate 5 to 10 colors based on palette type and base color
   * Types: monochromatic, analogous, complementary, split-complementary, triadic, tetradic, shades, tints, tones
   */
  static generatePalette(baseInput, type = "analogous", count = 6) {
    const base = this.parseColor(baseInput);
    if (!base.valid) {
      return [];
    }

    const { h, s, l } = base.hsl;
    const palette = [];

    const addHsl = (hue, sat, light) => {
      const normalizedH = ((hue % 360) + 360) % 360;
      const normalizedS = Math.max(0, Math.min(100, sat));
      const normalizedL = Math.max(0, Math.min(100, light));
      palette.push(this.fromHsl(normalizedH, normalizedS, normalizedL));
    };

    switch (type.toLowerCase()) {
      case "monochromatic": {
        const step = 80 / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          addHsl(h, s, 10 + i * step);
        }
        break;
      }
      case "analogous": {
        const spread = 60;
        const step = spread / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          addHsl(h - spread / 2 + i * step, s, l);
        }
        break;
      }
      case "complementary": {
        const compH = (h + 180) % 360;
        for (let i = 0; i < count; i++) {
          // alternate between base and complement, varying lightness
          const isComp = i % 2 !== 0;
          const hue = isComp ? compH : h;
          const lightShift = i > 1 ? (isComp ? 20 : -20) : 0;
          addHsl(hue, s, Math.max(10, Math.min(90, l + lightShift)));
        }
        break;
      }
      case "split-complementary": {
        const comp1 = (h + 150) % 360;
        const comp2 = (h + 210) % 360;
        const hues = [h, comp1, comp2];
        for (let i = 0; i < count; i++) {
          const hue = hues[i % 3];
          const lightShift = i > 2 ? (i % 2 === 0 ? 15 : -15) : 0;
          addHsl(hue, s, Math.max(10, Math.min(90, l + lightShift)));
        }
        break;
      }
      case "triadic": {
        const h2 = (h + 120) % 360;
        const h3 = (h + 240) % 360;
        const hues = [h, h2, h3];
        for (let i = 0; i < count; i++) {
          const hue = hues[i % 3];
          const lightShift = i > 2 ? (i % 2 === 0 ? 20 : -20) : 0;
          addHsl(hue, s, Math.max(10, Math.min(90, l + lightShift)));
        }
        break;
      }
      case "tetradic": {
        const h2 = (h + 90) % 360;
        const h3 = (h + 180) % 360;
        const h4 = (h + 270) % 360;
        const hues = [h, h2, h3, h4];
        for (let i = 0; i < count; i++) {
          const hue = hues[i % 4];
          const lightShift = i > 3 ? (i % 2 === 0 ? 15 : -15) : 0;
          addHsl(hue, s, Math.max(10, Math.min(90, l + lightShift)));
        }
        break;
      }
      case "square": {
        const h2 = (h + 90) % 360;
        const h3 = (h + 180) % 360;
        const h4 = (h + 270) % 360;
        const hues = [h, h2, h3, h4];
        for (let i = 0; i < count; i++) {
          const hue = hues[i % 4];
          const lightShift = i > 3 ? (i % 2 === 0 ? 15 : -15) : 0;
          addHsl(hue, s, Math.max(10, Math.min(90, l + lightShift)));
        }
        break;
      }
      case "random": {
        for (let i = 0; i < count; i++) {
          const hue = Math.floor(Math.random() * 360);
          const sat = Math.floor(Math.random() * 60) + 40; // 40-100
          const light = Math.floor(Math.random() * 60) + 20; // 20-80
          addHsl(hue, sat, light);
        }
        break;
      }
      case "shades": {
        const step = (l - 10) / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          addHsl(h, s, Math.max(5, l - i * step));
        }
        break;
      }
      case "tints": {
        const step = (95 - l) / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          addHsl(h, s, Math.min(98, l + i * step));
        }
        break;
      }
      case "tones": {
        const step = s / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          addHsl(h, Math.max(0, s - i * step), l);
        }
        break;
      }
      default:
        return this.generatePalette(baseInput, "analogous", count);
    }

    return palette.slice(0, count);
  }

  // --- Export Utilities ---

  static exportAsCss(palette) {
    const vars = palette
      .map((col, i) => `  --color-${i + 1}: ${col.hex};`)
      .join("\n");
    return `:root {\n${vars}\n}`;
  }

  static exportAsJson(palette) {
    const data = palette.map((col, i) => ({
      name: `Color ${i + 1}`,
      hex: col.hex,
      rgb: col.strings.rgb,
      hsl: col.strings.hsl,
      hsv: col.strings.hsv,
      cmyk: col.strings.cmyk,
    }));
    return JSON.stringify(data, null, 2);
  }

  static exportAsSvg(palette) {
    const width = 120 * palette.length;
    const height = 180;
    let rects = "";

    palette.forEach((col, i) => {
      const x = i * 120;
      rects += `
        <g transform="translate(${x}, 0)">
          <rect width="120" height="120" fill="${col.hex}" />
          <text x="60" y="145" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#333">${col.hex}</text>
          <text x="60" y="165" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#666">${col.strings.rgb}</text>
        </g>
      `;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${rects}
    </svg>`;
  }

  static downloadPngPalette(palette, filename = "palette.png") {
    const cardWidth = 160;
    const cardHeight = 260;
    const totalWidth = cardWidth * palette.length;
    const totalHeight = cardHeight;

    const canvas = document.createElement("canvas");
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");

    palette.forEach((col, i) => {
      const x = i * cardWidth;

      // Color Box
      ctx.fillStyle = col.hex;
      ctx.fillRect(x, 0, cardWidth, 180);

      // Info Footer
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, 180, cardWidth, 80);

      ctx.fillStyle = "#0f172a";
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(col.hex, x + cardWidth / 2, 210);

      ctx.fillStyle = "#64748b";
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(col.strings.rgb, x + cardWidth / 2, 230);
      ctx.fillText(col.strings.hsl, x + cardWidth / 2, 248);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  // --- UI Toast & Helper Utils ---

  static showToast(message, type = "info") {
    if (
      window.ComprexaFramework &&
      typeof window.ComprexaFramework.showToast === "function"
    ) {
      return window.ComprexaFramework.showToast(message, type);
    }
  }

  static async copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        return success;
      }
    } catch (err) {
      console.error("Copy failed:", err);
      return false;
    }
  }

  static downloadFile(content, filename, mimeType = "text/plain") {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(filename) : String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Download failed:", err);
      return false;
    }
  }
}
