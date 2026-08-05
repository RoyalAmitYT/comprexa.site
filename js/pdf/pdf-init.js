// @ts-nocheck
/**
 * Comprexa Unified PDF.js Engine & Worker Setup
 * Centralized initialization for PDF.js and its worker using installed pdfjs-dist.
 */

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure worker URL once globally if not already set
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
}

// Guarantee window.pdfjsLib is available for all legacy and modular scripts
if (typeof window !== "undefined") {
  window.pdfjsLib = pdfjsLib;
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
}

export function ensurePdfWorker() {
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    }
  }
  if (typeof window !== "undefined" && window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    }
  }
  return pdfjsLib;
}

export { pdfjsLib, pdfWorker };
