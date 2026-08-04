// @ts-nocheck
/**
 * Comprexa Universal Image Engine - Image Loader
 * Efficient image decoding, object URL caching, memory management, and high-res optimization.
 */

import { ImageConfig } from "./config.js";
import { ImageEngineError, ImageErrorCategory } from "./errors.js";

export class ImageLoader {
  constructor() {
    this.cache = new Map(); // id -> { bitmap/element, url, metadata, timestamp }
    this.maxCacheSize = 50;
  }

  /**
   * Load and decode image from File, Blob, or URL
   * @param {File|Blob|string} source
   * @param {Object} [options]
   * @returns {Promise<{image: ImageBitmap|HTMLImageElement, url: string, width: number, height: number, cleanup: Function}>}
   */
  async loadImage(source, options = {}) {
    const {
      cacheKey = null,
      useBitmap = ImageConfig.featureFlags.createImageBitmap,
      lazy = false,
    } = options;

    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      cached.timestamp = Date.now();
      return cached;
    }

    if (!source) {
      throw new ImageEngineError(
        "No image source provided to ImageLoader.",
        ImageConfig.errorCodes.FILE_MISSING,
        ImageErrorCategory.DECODE,
      );
    }

    let url = "";
    let isCreatedUrl = false;

    if (typeof source === "string") {
      url = source;
    } else if (source instanceof File || source instanceof Blob) {
      url = URL.createObjectURL(source);
      isCreatedUrl = true;
    }

    try {
      let imageObj = null;
      let width = 0;
      let height = 0;

      const isSvg =
        (source instanceof File || source instanceof Blob) &&
        source.type.includes("svg");

      if (
        useBitmap &&
        typeof window !== "undefined" &&
        "createImageBitmap" in window &&
        !isSvg
      ) {
        if (source instanceof Blob || source instanceof File) {
          imageObj = await createImageBitmap(source);
        } else {
          const res = await fetch(url);
          const blob = await res.blob();
          imageObj = await createImageBitmap(blob);
        }
        width = imageObj.width;
        height = imageObj.height;
      } else {
        // HTMLImageElement Fallback
        imageObj = await new Promise((resolve, reject) => {
          const img = new Image();
          if (lazy) img.loading = "lazy";

          img.onload = () => resolve(img);
          img.onerror = () =>
            reject(new Error("HTMLImageElement failed to load source URL."));
          img.src = url;
        });
        width = imageObj.naturalWidth || imageObj.width;
        height = imageObj.naturalHeight || imageObj.height;
      }

      const cleanup = () => {
        if (imageObj && typeof imageObj.close === "function") {
          imageObj.close(); // ImageBitmap memory release
        }
        if (isCreatedUrl && url) {
          URL.revokeObjectURL(url);
        }
        if (cacheKey) {
          this.cache.delete(cacheKey);
        }
      };

      const result = {
        image: imageObj,
        url,
        width,
        height,
        isCreatedUrl,
        cleanup,
      };

      if (cacheKey) {
        this.storeInCache(cacheKey, result);
      }

      return result;
    } catch (err) {
      if (isCreatedUrl && url) URL.revokeObjectURL(url);
      throw new ImageEngineError(
        `Failed to load and decode image: ${err?.message || "Invalid or unreadable image source."}`,
        ImageConfig.errorCodes.DECODE_FAILED,
        ImageErrorCategory.DECODE,
        null,
        { source },
      );
    }
  }

  /**
   * Store loaded image in internal LRU cache
   */
  storeInCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // Evict oldest entry
      let oldestKey = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        const item = this.cache.get(oldestKey);
        if (item && item.cleanup) item.cleanup();
        this.cache.delete(oldestKey);
      }
    }

    value.timestamp = Date.now();
    this.cache.set(key, value);
  }

  /**
   * Clear all cached images and free memory
   */
  clearCache() {
    for (const item of this.cache.values()) {
      if (item && item.cleanup) {
        item.cleanup();
      }
    }
    this.cache.clear();
  }
}

export const GlobalImageLoader = new ImageLoader();
