/**
 * Comprexa Universal Image Engine - Image Validator
 * Validates image type, size, dimensions, magic bytes, corruption, and animation status.
 */

import { ImageConfig } from "./config.js";
import { ImageEngineError, ImageErrorCategory } from "./errors.js";
import { ImageUtils } from "./utils.js";

export class ImageValidator {
  /**
   * Complete validation for a File object
   * @param {File|Blob} file
   * @param {Object} [customOptions]
   * @returns {Promise<Object>} { valid: boolean, file: File, mimeType: string, extension: string, dimensions?: {width, height}, isAnimated?: boolean, error?: string, errorCode?: string }
   */
  static async validateFile(file, customOptions = {}) {
    const opts = {
      maxSizeMB: customOptions.maxSizeMB || ImageConfig.maxFileSizeMB,
      maxWidth: customOptions.maxWidth || ImageConfig.maxDimensionWidth,
      maxHeight: customOptions.maxHeight || ImageConfig.maxDimensionHeight,
      allowedMimeTypes:
        customOptions.allowedMimeTypes || ImageConfig.supportedMimeTypes,
      allowedExtensions:
        customOptions.allowedExtensions || ImageConfig.supportedExtensions,
      checkMagicBytes: customOptions.checkMagicBytes !== false,
      checkDecode: customOptions.checkDecode !== false,
      ...customOptions,
    };

    if (!file) {
      throw new ImageEngineError(
        "No image file provided for validation.",
        ImageConfig.errorCodes.FILE_MISSING,
        ImageErrorCategory.VALIDATION,
      );
    }

    // 1. File Size Check
    const maxBytes = opts.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new ImageEngineError(
        `File size (${ImageUtils.formatFileSize(file.size)}) exceeds maximum limit of ${opts.maxSizeMB} MB.`,
        ImageConfig.errorCodes.EXCEEDS_SIZE,
        ImageErrorCategory.VALIDATION,
      );
    }

    if (file.size === 0) {
      throw new ImageEngineError(
        "File is empty (0 bytes).",
        ImageConfig.errorCodes.CORRUPTED,
        ImageErrorCategory.VALIDATION,
      );
    }

    // 2. Extension & MIME Check
    const ext = ImageUtils.getFileExtension(file.name);
    const mime = file.type
      ? file.type.toLowerCase()
      : ImageUtils.extensionToMime(ext);

    const isExtAllowed = opts.allowedExtensions.includes(ext);
    const isMimeAllowed = opts.allowedMimeTypes.includes(mime);

    if (!isExtAllowed && !isMimeAllowed) {
      throw new ImageEngineError(
        `Unsupported file type: .${ext} (${mime}). Allowed formats: ${opts.allowedExtensions.join(", ")}.`,
        ImageConfig.errorCodes.INVALID_TYPE,
        ImageErrorCategory.VALIDATION,
      );
    }

    // 3. Magic Bytes Header Check
    if (opts.checkMagicBytes) {
      const isMagicValid = await this.verifyMagicBytes(file);
      if (!isMagicValid) {
        throw new ImageEngineError(
          "File header magic bytes do not match a recognized image signature. The file may be corrupted or renamed.",
          ImageConfig.errorCodes.CORRUPTED,
          ImageErrorCategory.VALIDATION,
        );
      }
    }

    // 4. Image Decoding & Dimension Check
    let dimensions = { width: 0, height: 0 };
    let isAnimated = false;

    if (opts.checkDecode) {
      try {
        const decodeResult = await this.verifyAndDecodeImage(file);
        dimensions = decodeResult.dimensions;
        isAnimated = decodeResult.isAnimated;

        if (
          dimensions.width > opts.maxWidth ||
          dimensions.height > opts.maxHeight
        ) {
          throw new ImageEngineError(
            `Image resolution (${dimensions.width}x${dimensions.height} px) exceeds maximum allowed dimensions (${opts.maxWidth}x${opts.maxHeight} px).`,
            ImageConfig.errorCodes.EXCEEDS_DIMENSIONS,
            ImageErrorCategory.VALIDATION,
          );
        }
      } catch (err) {
        if (err instanceof ImageEngineError) throw err;
        throw new ImageEngineError(
          `Unable to decode image file: ${err?.message || "File is corrupted or unreadable."}`,
          ImageConfig.errorCodes.DECODE_FAILED,
          ImageErrorCategory.DECODE,
        );
      }
    }

    return {
      valid: true,
      file,
      mimeType: mime,
      extension: ext,
      dimensions,
      isAnimated,
      fileSize: file.size,
      formattedSize: ImageUtils.formatFileSize(file.size),
    };
  }

  /**
   * Check Magic Bytes Header Signature of File
   * @param {File|Blob} file
   * @returns {Promise<boolean>}
   */
  static async verifyMagicBytes(file) {
    try {
      const buffer = await file.slice(0, 12).arrayBuffer();
      const arr = new Uint8Array(buffer);

      if (arr.length < 4) return false;

      // JPEG Magic: FF D8 FF
      if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return true;

      // PNG Magic: 89 50 4E 47 0D 0A 1A 0A
      if (
        arr[0] === 0x89 &&
        arr[1] === 0x50 &&
        arr[2] === 0x4e &&
        arr[3] === 0x47
      )
        return true;

      // GIF Magic: GIF87a or GIF89a (47 49 46 38)
      if (
        arr[0] === 0x47 &&
        arr[1] === 0x49 &&
        arr[2] === 0x46 &&
        arr[3] === 0x38
      )
        return true;

      // WebP Magic: RIFF .... WEBP
      if (
        arr[0] === 0x52 &&
        arr[1] === 0x49 &&
        arr[2] === 0x46 &&
        arr[3] === 0x46
      ) {
        if (
          arr.length >= 12 &&
          arr[8] === 0x57 &&
          arr[9] === 0x45 &&
          arr[10] === 0x42 &&
          arr[11] === 0x50
        ) {
          return true;
        }
      }

      // BMP Magic: BM (42 4D)
      if (arr[0] === 0x42 && arr[1] === 0x4d) return true;

      // SVG text check (<svg or <?xml)
      if (file.type.includes("svg") || file.name.endsWith(".svg")) {
        const text = await file.slice(0, 100).text();
        if (text.includes("<svg") || text.includes("<?xml")) return true;
      }

      // ICO Magic: 00 00 01 00
      if (
        arr[0] === 0x00 &&
        arr[1] === 0x00 &&
        arr[2] === 0x01 &&
        arr[3] === 0x00
      )
        return true;

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Attempt to decode image and retrieve dimensions & animation status
   * @param {File|Blob} file
   * @returns {Promise<{dimensions: {width: number, height: number}, isAnimated: boolean}>}
   */
  static async verifyAndDecodeImage(file) {
    const objectUrl = URL.createObjectURL(file);

    try {
      if (
        typeof window !== "undefined" &&
        "createImageBitmap" in window &&
        !file.type.includes("svg")
      ) {
        const bitmap = await createImageBitmap(file);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();

        const isAnimated = await this.detectAnimatedImage(file);
        URL.revokeObjectURL(objectUrl);
        return { dimensions, isAnimated };
      }

      // HTMLImageElement Fallback (also required for SVG)
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          const dimensions = {
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          };
          const isAnimated = await this.detectAnimatedImage(file);
          URL.revokeObjectURL(objectUrl);
          resolve({ dimensions, isAnimated });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(
            new Error(
              "HTMLImageElement failed to load image src. File may be corrupted.",
            ),
          );
        };
        img.src = objectUrl;
      });
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      throw err;
    }
  }

  /**
   * Detect if GIF or WebP image contains multiple frames (animated)
   * @param {File|Blob} file
   * @returns {Promise<boolean>}
   */
  static async detectAnimatedImage(file) {
    if (!file) return false;

    try {
      if (file.type.includes("gif") || file.name.endsWith(".gif")) {
        const buffer = await file.arrayBuffer();
        const arr = new Uint8Array(buffer);
        let count = 0;
        // Search for GIF graphic control extension block (0x21, 0xF9)
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === 0x21 && arr[i + 1] === 0xf9) {
            count++;
            if (count > 1) return true;
          }
        }
      }

      if (file.type.includes("webp") || file.name.endsWith(".webp")) {
        const buffer = await file.slice(0, 100).arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        if (text.includes("ANIM")) return true;
      }
    } catch (e) {
      // Non-critical
    }

    return false;
  }
}

export const GlobalImageValidator = ImageValidator;
