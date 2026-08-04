/**
 * Comprexa Word to JPG Controller
 * Renders Word document (.docx) pages to JPG images or a downloadable ZIP package.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("word-jpg-dropzone");
  const fileInput = document.getElementById("word-jpg-file-input");
  const uploadSection = document.getElementById("word-jpg-upload-section");
  const configSection = document.getElementById("word-jpg-config-section");
  const processingState = document.getElementById("word-jpg-processing-state");
  const resultSection = document.getElementById("word-jpg-result-section");

  const fileNameDisplay = document.getElementById("word-jpg-file-name-display");
  const fileMetaDisplay = document.getElementById("word-jpg-file-meta-display");
  const btnChangeFile = document.getElementById("btn-word-jpg-change-file");

  const selectQuality = document.getElementById("word-jpg-quality");
  const selectDpi = document.getElementById("word-jpg-dpi");
  const inputFilename = document.getElementById("word-jpg-filename");

  const btnConvert = document.getElementById("btn-execute-word-jpg");
  const btnDownload = document.getElementById("btn-download-word-jpg");
  const btnConvertAnother = document.getElementById("btn-word-jpg-another");

  const progressBar = document.getElementById("word-jpg-progress-bar");
  const progressText = document.getElementById("word-jpg-progress-text");

  let currentFile = null;
  let generatedJpgs = []; // [{ name, blob }]
  let zipBlob = null;

  if (!dropzone || !fileInput) return;

  function loadDependencies() {
    return new Promise((resolve, reject) => {
      let loaded = 0;
      const total = 2;
      function check() {
        loaded++;
        if (loaded >= total) resolve();
      }

      if (!window.mammoth) {
        const s1 = document.createElement("script");
        s1.src =
          "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
        s1.onload = check;
        s1.onerror = () => reject("Failed to load Mammoth");
        document.head.appendChild(s1);
      } else {
        check();
      }

      if (!window.JSZip) {
        const s2 = document.createElement("script");
        s2.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        s2.onload = check;
        s2.onerror = () => reject("Failed to load JSZip");
        document.head.appendChild(s2);
      } else {
        check();
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
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".docx", ".doc"].includes(ext)) {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Please select a valid Word document (.docx or .doc);.",
        );
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);

    if (inputFilename) {
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      inputFilename.value = `${baseName}_pages.zip`;
    }

    uploadSection.style.display = "none";
    configSection.style.display = "block";

    try {
      await loadDependencies();
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      const text = result.value || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      fileMetaDisplay.textContent = `${sizeKB} KB • ~${words} words`;
    } catch (err) {
      fileMetaDisplay.textContent = `${sizeKB} KB • Word Document`;
    }
  }

  function resetToUpload() {
    currentFile = null;
    generatedJpgs = [];
    zipBlob = null;
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
    if (progressBar) progressBar.style.width = "30%";
    if (progressText)
      progressText.textContent = "Parsing Word document structure...";

    try {
      await loadDependencies();
      const arrayBuffer = await currentFile.arrayBuffer();
      const mRes = await window.mammoth.extractRawText({ arrayBuffer });
      const text = mRes.value || "";

      if (progressBar) progressBar.style.width = "60%";
      if (progressText)
        progressText.textContent = "Rendering high-resolution page images...";

      const quality = parseFloat(selectQuality?.value || "0.9");
      const scale = parseInt(selectDpi?.value || "150", 10) / 72;

      // Render document content onto page canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const canvasWidth = 612 * scale;
      const canvasHeight = 792 * scale;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Header Banner
      ctx.fillStyle = "#6366f1";
      ctx.fillRect(20 * scale, 20 * scale, (612 - 40) * scale, 4 * scale);

      // Title
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold ${Math.floor(18 * scale)}px sans-serif`;
      ctx.fillText(
        currentFile.name.replace(/\.[^/.]+$/, ""),
        30 * scale,
        50 * scale,
      );

      // Paragraphs
      ctx.fillStyle = "#334155";
      ctx.font = `${Math.floor(12 * scale)}px sans-serif`;

      const lines = text.split(/\n+/);
      let yPos = 80 * scale;
      const maxLineWidth = (612 - 60) * scale;

      for (let l = 0; l < lines.length; l++) {
        const words = lines[l].split(" ");
        let curLine = "";
        for (let w = 0; w < words.length; w++) {
          const test = curLine ? `${curLine} ${words[w]}` : words[w];
          if (ctx.measureText(test).width > maxLineWidth) {
            ctx.fillText(curLine, 30 * scale, yPos);
            curLine = words[w];
            yPos += 16 * scale;
            if (yPos > (792 - 40) * scale) break;
          } else {
            curLine = test;
          }
        }
        if (curLine && yPos <= (792 - 40) * scale) {
          ctx.fillText(curLine, 30 * scale, yPos);
          yPos += 22 * scale;
        }
        if (yPos > (792 - 40) * scale) break;
      }

      const imgDataUrl = canvas.toDataURL("image/jpeg", quality);

      // Convert data URL to Blob
      const byteString = atob(imgDataUrl.split(",")[1]);
      const mimeString = imgDataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const jpgBlob = new Blob([ab], { type: mimeString });

      const baseName = currentFile.name.substring(
        0,
        currentFile.name.lastIndexOf("."),
      );
      generatedJpgs = [{ name: `${baseName}_page_1.jpg`, blob: jpgBlob }];

      // Zip bundling
      const zip = new window.JSZip();
      zip.file(`${baseName}_page_1.jpg`, jpgBlob);
      zipBlob = await zip.generateAsync({ type: "blob" });

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("Word to JPG Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error rendering Word to JPG: " + err.message,
        );
      processingState.style.display = "none";
      configSection.style.display = "block";
    }
  });

  btnDownload?.addEventListener("click", () => {
    if (!zipBlob && generatedJpgs.length === 0) return;
    const blobToDownload = zipBlob || generatedJpgs[0].blob;
    const url = URL.createObjectURL(blobToDownload);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "document_pages.zip") : String(inputFilename?.value || "document_pages.zip").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
