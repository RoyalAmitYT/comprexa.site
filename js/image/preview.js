// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Preview Engine
 * Reusable preview generation, thumbnails, before/after comparisons, responsive scaling, zoom/pan helpers.
 */

import { AspectRatioUtils } from "./aspect-ratio.js";
import { GlobalImageLoader } from "./loader.js";

export class ImagePreviewEngine {
  constructor() {
    this.previewCache = new Map();
  }

  /**
   * Generate a fast lightweight thumbnail canvas or DataURL for UI cards/lists
   * @param {File|Blob|HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {number} [maxDimension=300]
   * @returns {Promise<{canvas: HTMLCanvasElement, dataUrl: string, width: number, height: number}>}
   */
  static async generateThumbnail(source, maxDimension = 300) {
    let imgSource = source;
    let urlToCleanup = null;

    if (source instanceof File || source instanceof Blob) {
      const loaded = await GlobalImageLoader.loadImage(source, {
        useBitmap: true,
      });
      imgSource = loaded.image;
      if (loaded.isCreatedUrl) urlToCleanup = loaded.url;
    }

    const srcWidth = imgSource.naturalWidth || imgSource.width;
    const srcHeight = imgSource.naturalHeight || imgSource.height;

    const { width, height } = AspectRatioUtils.calculateResizeDimensions(
      srcWidth,
      srcHeight,
      maxDimension,
      maxDimension,
      "contain",
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(imgSource, 0, 0, width, height);

    if (urlToCleanup) URL.revokeObjectURL(urlToCleanup);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    return { canvas, dataUrl, width, height };
  }

  /**
   * Create Before / After side-by-side or split comparison data model
   * @param {Object} originalInfo { dataUrl/canvas, size, dimensions }
   * @param {Object} processedInfo { dataUrl/canvas, size, dimensions }
   * @returns {Object}
   */
  static createBeforeAfterComparison(originalInfo, processedInfo) {
    const origSize = originalInfo.size || 0;
    const procSize = processedInfo.size || 0;
    const diffBytes = origSize - procSize;
    const percentageSaved =
      origSize > 0 ? parseFloat(((diffBytes / origSize) * 100).toFixed(1)) : 0;

    return {
      original: {
        src: originalInfo.dataUrl || originalInfo.src,
        dimensions: originalInfo.dimensions,
        size: origSize,
        sizeFormatted: originalInfo.sizeFormatted,
      },
      processed: {
        src: processedInfo.dataUrl || processedInfo.src,
        dimensions: processedInfo.dimensions,
        size: procSize,
        sizeFormatted: processedInfo.sizeFormatted,
      },
      metrics: {
        savedBytes: diffBytes,
        savedPercentage: percentageSaved,
        isSmaller: diffBytes > 0,
      },
    };
  }

  /**
   * Helper state controller for Zoom & Pan interactions on Preview canvases
   * @param {HTMLElement} container
   * @param {HTMLElement} targetElement
   * @returns {Object} Zoom/Pan API methods
   */
  static createZoomPanController(container, targetElement) {
    let scale = 1.0;
    let panX = 0;
    let panY = 0;
    let _isDragging = false;
    let _startX = 0;
    let _startY = 0;

    const updateTransform = () => {
      if (targetElement) {
        targetElement.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      }
    };

    return {
      zoomIn: (factor = 0.2) => {
        scale = Math.min(5.0, scale + factor);
        updateTransform();
      },
      zoomOut: (factor = 0.2) => {
        scale = Math.max(0.2, scale - factor);
        updateTransform();
      },
      reset: () => {
        scale = 1.0;
        panX = 0;
        panY = 0;
        updateTransform();
      },
      setPan: (x, y) => {
        panX = x;
        panY = y;
        updateTransform();
      },
      getState: () => ({ scale, panX, panY }),
    };
  }
}

export const GlobalImagePreviewEngine = ImagePreviewEngine;
