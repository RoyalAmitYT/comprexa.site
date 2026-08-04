/**
 * Comprexa Universal Image Engine - Aspect Ratio Utilities
 * Mathematical calculation, proportional scaling, ratio formatting, and standard presets.
 */

export class AspectRatioUtils {
  static standardRatios = [
    { label: "Original", ratio: null },
    { label: "1:1 Square", ratio: 1.0, width: 1, height: 1 },
    { label: "16:9 Widescreen", ratio: 1.7778, width: 16, height: 9 },
    { label: "4:3 Standard", ratio: 1.3333, width: 4, height: 3 },
    { label: "3:2 Classic Photo", ratio: 1.5, width: 3, height: 2 },
    { label: "9:16 Story / Mobile", ratio: 0.5625, width: 9, height: 16 },
    { label: "5:4 Portrait", ratio: 1.25, width: 5, height: 4 },
    { label: "21:9 Ultrawide", ratio: 2.3333, width: 21, height: 9 },
  ];

  /**
   * Calculate numerical aspect ratio (width / height)
   * @param {number} width
   * @param {number} height
   * @returns {number}
   */
  static calculateRatio(width, height) {
    if (!height || height === 0) return 1;
    return parseFloat((width / height).toFixed(4));
  }

  /**
   * Format numerical aspect ratio into string ratio representation (e.g., "16:9")
   * @param {number} width
   * @param {number} height
   * @returns {string}
   */
  static formatRatio(width, height) {
    if (!width || !height) return "1:1";

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(Math.round(width), Math.round(height));

    const simplifiedW = Math.round(width / divisor);
    const simplifiedH = Math.round(height / divisor);

    // If ratio reduces to clean numbers under 50, use simplified, otherwise fallback to decimal ratio
    if (simplifiedW <= 50 && simplifiedH <= 50) {
      return `${simplifiedW}:${simplifiedH}`;
    }

    const ratioDecimal = (width / height).toFixed(2);
    return `${ratioDecimal}:1`;
  }

  /**
   * Maintain aspect ratio when changing either width or height
   * @param {number} originalWidth
   * @param {number} originalHeight
   * @param {number|null} targetWidth
   * @param {number|null} targetHeight
   * @returns {{width: number, height: number}}
   */
  static maintainAspectRatio(
    originalWidth,
    originalHeight,
    targetWidth,
    targetHeight,
  ) {
    if (!originalWidth || !originalHeight)
      return { width: targetWidth || 0, height: targetHeight || 0 };

    const ratio = originalWidth / originalHeight;

    if (targetWidth && !targetHeight) {
      return {
        width: Math.round(targetWidth),
        height: Math.round(targetWidth / ratio),
      };
    }

    if (targetHeight && !targetWidth) {
      return {
        width: Math.round(targetHeight * ratio),
        height: Math.round(targetHeight),
      };
    }

    return {
      width: Math.round(targetWidth || originalWidth),
      height: Math.round(targetHeight || originalHeight),
    };
  }

  /**
   * Scale image dimensions proportionally by a percentage scale factor (e.g. 50%)
   * @param {number} originalWidth
   * @param {number} originalHeight
   * @param {number} scalePercentage e.g. 50 for 50%
   * @returns {{width: number, height: number}}
   */
  static scaleProportionally(originalWidth, originalHeight, scalePercentage) {
    const factor = (scalePercentage || 100) / 100;
    return {
      width: Math.max(1, Math.round(originalWidth * factor)),
      height: Math.max(1, Math.round(originalHeight * factor)),
    };
  }

  /**
   * Calculate bounding box resize dimensions fitting within constraint bounds (Contain / Cover / Fill)
   * @param {number} srcW
   * @param {number} srcH
   * @param {number} maxW
   * @param {number} maxH
   * @param {'contain'|'cover'|'fill'} [fitMode='contain']
   * @returns {{width: number, height: number}}
   */
  static calculateResizeDimensions(
    srcW,
    srcH,
    maxW,
    maxH,
    fitMode = "contain",
  ) {
    if (!maxW || !maxH) return { width: srcW, height: srcH };

    if (fitMode === "fill") {
      return { width: maxW, height: maxH };
    }

    const srcRatio = srcW / srcH;
    const maxRatio = maxW / maxH;

    let targetW = srcW;
    let targetH = srcH;

    if (fitMode === "contain") {
      if (srcRatio > maxRatio) {
        targetW = maxW;
        targetH = Math.round(maxW / srcRatio);
      } else {
        targetH = maxH;
        targetW = Math.round(maxH * srcRatio);
      }
    } else if (fitMode === "cover") {
      if (srcRatio > maxRatio) {
        targetH = maxH;
        targetW = Math.round(maxH * srcRatio);
      } else {
        targetW = maxW;
        targetH = Math.round(maxW / srcRatio);
      }
    }

    return { width: Math.max(1, targetW), height: Math.max(1, targetH) };
  }
}

export const GlobalAspectRatioUtils = AspectRatioUtils;
