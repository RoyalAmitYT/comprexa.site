// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Canvas Processing Engine
 * Core reusable canvas manipulation APIs: Resize, Crop, Rotate, Flip, Compress, Convert, Watermark.
 */

import { ImageConfig } from "./config.js";
import { ImageEngineError, ImageErrorCategory } from "./errors.js";
import { AspectRatioUtils } from "./aspect-ratio.js";

export class CanvasProcessingEngine {
  /**
   * Helper to create a standard canvas context with high-quality smoothing
   * @param {number} width
   * @param {number} height
   * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
   */
  static createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) {
      throw new ImageEngineError(
        "Failed to obtain 2D rendering context for Canvas.",
        ImageConfig.errorCodes.CANVAS_FAILED,
        ImageErrorCategory.CANVAS,
      );
    }

    ctx.imageSmoothingEnabled = ImageConfig.canvasDefaults.smoothingEnabled;
    ctx.imageSmoothingQuality = ImageConfig.canvasDefaults.smoothingQuality;

    return { canvas, ctx };
  }

  /**
   * Resize Image/Canvas to target dimensions
   * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {number} targetWidth
   * @param {number} targetHeight
   * @param {Object} [options] { fitMode: 'contain'|'cover'|'fill'|'exact', maintainRatio: boolean, bgColor: string }
   * @returns {HTMLCanvasElement}
   */
  static resize(source, targetWidth, targetHeight, options = {}) {
    const {
      fitMode = "exact",
      maintainRatio = true,
      bgColor = ImageConfig.canvasDefaults.backgroundColor,
    } = options;

    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    let finalW = targetWidth;
    let finalH = targetHeight;

    if (maintainRatio && fitMode !== "fill") {
      const dim = AspectRatioUtils.maintainAspectRatio(
        srcW,
        srcH,
        targetWidth,
        targetHeight,
      );
      finalW = dim.width;
      finalH = dim.height;
    }

    const { canvas, ctx } = this.createCanvas(finalW, finalH);

    if (bgColor && bgColor !== "transparent") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, finalW, finalH);
    }

    ctx.drawImage(source, 0, 0, finalW, finalH);

    return canvas;
  }

  /**
   * Crop rectangle region from source image
   * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {number} x
   * @param {number} y
   * @param {number} cropWidth
   * @param {number} cropHeight
   * @returns {HTMLCanvasElement}
   */
  static crop(source, x, y, cropWidth, cropHeight) {
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    const safeX = Math.max(0, Math.min(x, srcW - 1));
    const safeY = Math.max(0, Math.min(y, srcH - 1));
    const safeW = Math.max(1, Math.min(cropWidth, srcW - safeX));
    const safeH = Math.max(1, Math.min(cropHeight, srcH - safeY));

    const { canvas, ctx } = this.createCanvas(safeW, safeH);

    ctx.drawImage(source, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);

    return canvas;
  }

  /**
   * Rotate source image by angle degrees (90, 180, 270, or custom angle)
   * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {number} degrees
   * @returns {HTMLCanvasElement}
   */
  static rotate(source, degrees) {
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    const radians = (degrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    const newW = Math.round(srcW * cos + srcH * sin);
    const newH = Math.round(srcW * sin + srcH * cos);

    const { canvas, ctx } = this.createCanvas(newW, newH);

    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(radians);
    ctx.drawImage(source, -srcW / 2, -srcH / 2);

    return canvas;
  }

  /**
   * Flip image horizontally, vertically, or both
   * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {boolean} flipHorizontal
   * @param {boolean} flipVertical
   * @returns {HTMLCanvasElement}
   */
  static flip(source, flipHorizontal = false, flipVertical = false) {
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    const { canvas, ctx } = this.createCanvas(srcW, srcH);

    ctx.save();
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.drawImage(
      source,
      flipHorizontal ? -srcW : 0,
      flipVertical ? -srcH : 0,
      srcW,
      srcH,
    );
    ctx.restore();

    return canvas;
  }

  /**
   * Convert image format and transparency background if converting to JPEG
   * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} source
   * @param {string} targetMimeType e.g. 'image/jpeg', 'image/webp'
   * @param {Object} [options] { backgroundColor: '#FFFFFF' }
   * @returns {HTMLCanvasElement}
   */
  static convert(source, targetMimeType = "image/jpeg", options = {}) {
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    const { canvas, ctx } = this.createCanvas(srcW, srcH);

    // If target is JPEG (no alpha support), fill background to avoid black transparency fill
    if (targetMimeType === "image/jpeg" || targetMimeType === "image/jpg") {
      ctx.fillStyle =
        options.backgroundColor || ImageConfig.canvasDefaults.backgroundColor;
      ctx.fillRect(0, 0, srcW, srcH);
    }

    ctx.drawImage(source, 0, 0, srcW, srcH);

    return canvas;
  }

  /**
   * Apply text or image watermark over canvas
   * @param {HTMLCanvasElement|HTMLImageElement|ImageBitmap} source
   * @param {Object} watermarkOptions
   * @returns {HTMLCanvasElement}
   */
  static applyWatermark(source, watermarkOptions = {}) {
    const {
      type = "text", // 'text' | 'image'
      text = "COMPREXA",
      imageSource = null,
      opacity = 0.5,
      position = "center", // 'top-left'|'top-center'|'top-right'|'left-center'|'center'|'right-center'|'bottom-left'|'bottom-center'|'bottom-right'|'tile'
      color = "#ffffff",
      fontFamily = "Plus Jakarta Sans",
      fontWeight = "bold",
      fontSize = null,
      fontSizeRatio = 0.05, // Font size relative to canvas width
      rotationDegrees = 0,
      imageScale = 1.0,
      offsetX = 0,
      offsetY = 0,
    } = watermarkOptions;

    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;

    const { canvas, ctx } = this.createCanvas(srcW, srcH);
    ctx.drawImage(source, 0, 0, srcW, srcH);

    ctx.save();
    ctx.globalAlpha = opacity;

    if (type === "text" && text) {
      const computedFontSize = fontSize
        ? Math.round(fontSize)
        : Math.max(14, Math.round(srcW * fontSizeRatio));
      ctx.font = `${fontWeight} ${computedFontSize}px "${fontFamily}", sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = computedFontSize;

      const { x, y } = this.getWatermarkCoordinates(
        position,
        srcW,
        srcH,
        textW,
        textH,
        offsetX,
        offsetY,
      );

      if (position === "tile") {
        const stepX = Math.max(80, textW * 1.8);
        const stepY = Math.max(60, textH * 2.5);
        for (let tx = -srcW; tx < srcW * 2; tx += stepX) {
          for (let ty = -srcH; ty < srcH * 2; ty += stepY) {
            ctx.save();
            ctx.translate(tx, ty);
            if (rotationDegrees) ctx.rotate((rotationDegrees * Math.PI) / 180);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      } else {
        ctx.translate(x + textW / 2, y + textH / 2);
        if (rotationDegrees) ctx.rotate((rotationDegrees * Math.PI) / 180);
        ctx.fillText(text, -textW / 2, 0);
      }
    } else if (type === "image" && imageSource) {
      const baseW = imageSource.naturalWidth || imageSource.width || srcW * 0.2;
      const baseH =
        imageSource.naturalHeight || imageSource.height || srcH * 0.2;
      const imgW = baseW * imageScale;
      const imgH = baseH * imageScale;

      const { x, y } = this.getWatermarkCoordinates(
        position,
        srcW,
        srcH,
        imgW,
        imgH,
        offsetX,
        offsetY,
      );

      if (position === "tile") {
        const stepX = Math.max(100, imgW * 1.8);
        const stepY = Math.max(100, imgH * 1.8);
        for (let tx = -srcW; tx < srcW * 2; tx += stepX) {
          for (let ty = -srcH; ty < srcH * 2; ty += stepY) {
            ctx.save();
            ctx.translate(tx + imgW / 2, ty + imgH / 2);
            if (rotationDegrees) ctx.rotate((rotationDegrees * Math.PI) / 180);
            ctx.drawImage(imageSource, -imgW / 2, -imgH / 2, imgW, imgH);
            ctx.restore();
          }
        }
      } else {
        ctx.translate(x + imgW / 2, y + imgH / 2);
        if (rotationDegrees) ctx.rotate((rotationDegrees * Math.PI) / 180);
        ctx.drawImage(imageSource, -imgW / 2, -imgH / 2, imgW, imgH);
      }
    }

    ctx.restore();

    return canvas;
  }

  /**
   * Helper to compute x, y offset for watermark alignment
   */
  static getWatermarkCoordinates(
    position,
    canvasW,
    canvasH,
    markW,
    markH,
    offsetX = 0,
    offsetY = 0,
  ) {
    const margin = Math.round(Math.min(canvasW, canvasH) * 0.04);
    let x = 0;
    let y = 0;

    switch (position) {
      case "top-left":
        x = margin;
        y = margin;
        break;
      case "top-center":
        x = (canvasW - markW) / 2;
        y = margin;
        break;
      case "top-right":
        x = canvasW - markW - margin;
        y = margin;
        break;
      case "left-center":
        x = margin;
        y = (canvasH - markH) / 2;
        break;
      case "right-center":
        x = canvasW - markW - margin;
        y = (canvasH - markH) / 2;
        break;
      case "bottom-left":
        x = margin;
        y = canvasH - markH - margin;
        break;
      case "bottom-center":
        x = (canvasW - markW) / 2;
        y = canvasH - markH - margin;
        break;
      case "bottom-right":
        x = canvasW - markW - margin;
        y = canvasH - markH - margin;
        break;
      case "center":
      default:
        x = (canvasW - markW) / 2;
        y = (canvasH - markH) / 2;
        break;
    }

    return { x: x + offsetX, y: y + offsetY };
  }
}

export const GlobalCanvasProcessingEngine = CanvasProcessingEngine;
