/**
 * Comprexa PDF to PowerPoint Controller
 * Converts PDF document pages into PowerPoint presentation slides (.pptx).
 */

import { pdfjsLib, ensurePdfWorker } from "../pdf/pdf-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("pdf-ppt-dropzone");
  const fileInput = document.getElementById("pdf-ppt-file-input");
  const uploadSection = document.getElementById("pdf-ppt-upload-section");
  const configSection = document.getElementById("pdf-ppt-config-section");
  const processingState = document.getElementById("pdf-ppt-processing-state");
  const resultSection = document.getElementById("pdf-ppt-result-section");

  const fileNameDisplay = document.getElementById("pdf-ppt-file-name-display");
  const fileMetaDisplay = document.getElementById("pdf-ppt-file-meta-display");
  const btnChangeFile = document.getElementById("btn-pdf-ppt-change-file");

  const selectLayout = document.getElementById("pdf-ppt-layout");
  const inputFilename = document.getElementById("pdf-ppt-filename");

  const btnConvert = document.getElementById("btn-execute-pdf-ppt");
  const btnDownload = document.getElementById("btn-download-pdf-ppt");
  const btnConvertAnother = document.getElementById("btn-pdf-ppt-another");

  const progressBar = document.getElementById("pdf-ppt-progress-bar");
  const progressText = document.getElementById("pdf-ppt-progress-text");

  let currentFile = null;
  let pdfPageCount = 0;
  let pptxBlob = null;

  if (!dropzone || !fileInput) return;

  function loadDependencies() {
    ensurePdfWorker();
    return new Promise((resolve, reject) => {
      if (!window.PptxGenJS) {
        const s2 = document.createElement("script");
        s2.src =
          "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
        s2.onload = () => resolve();
        s2.onerror = () => reject("Failed to load PptxGenJS");
        document.head.appendChild(s2);
      } else {
        resolve();
      }
    });
  }

  dropzone.addEventListener("click", () => fileInput.click());

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-over");
      },
      false,
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");
      },
      false,
    );
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) handleFileSelection(files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0)
      handleFileSelection(e.target.files[0]);
  });

  btnChangeFile?.addEventListener("click", resetToUpload);
  btnConvertAnother?.addEventListener("click", resetToUpload);

  async function handleFileSelection(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      if (window.ComprexaToast)
        window.ComprexaToast.error("Please select a valid PDF file.");
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);

    if (inputFilename) {
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      inputFilename.value = `${baseName}.pptx`;
    }

    uploadSection.style.display = "none";
    configSection.style.display = "block";

    try {
      await loadDependencies();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      pdfPageCount = pdf.numPages;
      fileMetaDisplay.textContent = `${sizeKB} KB • ${pdfPageCount} Page(s)`;
    } catch (err) {
      fileMetaDisplay.textContent = `${sizeKB} KB • PDF Document`;
    }
  }

  function resetToUpload() {
    currentFile = null;
    pptxBlob = null;
    fileInput.value = "";
    uploadSection.style.display = "block";
    configSection.style.display = "none";
    processingState.style.display = "none";
    resultSection.style.display = "none";
  }

  btnConvert?.addEventListener("click", async () => {
    if (!currentFile) return;

    configSection.style.display = "none";
    processingState.style.display = "block";
    if (progressBar) progressBar.style.width = "20%";
    if (progressText) progressText.textContent = "Rendering PDF slides...";

    try {
      await loadDependencies();

      const pptx = new window.PptxGenJS();
      const layout = selectLayout?.value || "16:9";
      pptx.layout = layout === "16:9" ? "LAYOUT_16x9" : "LAYOUT_4x3";

      const arrayBuffer = await currentFile.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let pNo = 1; pNo <= pdf.numPages; pNo++) {
        if (progressBar)
          progressBar.style.width = `${20 + Math.floor((pNo / pdf.numPages) * 70)}%`;
        if (progressText)
          progressText.textContent = `Converting page ${pNo} of ${pdf.numPages} to slide...`;

        const page = await pdf.getPage(pNo);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const imgDataUrl = canvas.toDataURL("image/png");

        const slide = pptx.addSlide();
        slide.addImage({
          data: imgDataUrl,
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      }

      if (progressBar) progressBar.style.width = "95%";
      if (progressText)
        progressText.textContent = "Generating PPTX presentation file...";

      const outputData = await pptx.write({ outputType: "blob" });
      pptxBlob = outputData;

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("PDF to PowerPoint Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error converting PDF to PowerPoint: " + err.message,
        );
      processingState.style.display = "none";
      configSection.style.display = "block";
    }
  });

  btnDownload?.addEventListener("click", () => {
    if (!pptxBlob) return;
    const url = URL.createObjectURL(pptxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "presentation.pptx") : String(inputFilename?.value || "presentation.pptx").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
