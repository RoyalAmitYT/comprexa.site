/**
 * Comprexa Word to TXT Controller
 * Extracts clean, unformatted plain text from Word documents (.docx, .doc).
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("word-txt-dropzone");
  const fileInput = document.getElementById("word-txt-file-input");
  const uploadSection = document.getElementById("word-txt-upload-section");
  const configSection = document.getElementById("word-txt-config-section");
  const processingState = document.getElementById("word-txt-processing-state");
  const resultSection = document.getElementById("word-txt-result-section");

  const fileNameDisplay = document.getElementById("word-txt-file-name-display");
  const fileMetaDisplay = document.getElementById("word-txt-file-meta-display");
  const btnChangeFile = document.getElementById("btn-word-txt-change-file");

  const selectLineBreaks = document.getElementById("word-txt-line-breaks");
  const inputFilename = document.getElementById("word-txt-filename");

  const textPreviewArea = document.getElementById("word-txt-preview-area");
  const txtWordsMeta = document.getElementById("word-txt-words-meta");
  const txtCharsMeta = document.getElementById("word-txt-chars-meta");

  const btnConvert = document.getElementById("btn-execute-word-txt");
  const btnCopyText = document.getElementById("btn-copy-word-txt");
  const btnDownload = document.getElementById("btn-download-word-txt");
  const btnConvertAnother = document.getElementById("btn-word-txt-another");

  const progressBar = document.getElementById("word-txt-progress-bar");
  const progressText = document.getElementById("word-txt-progress-text");

  let currentFile = null;
  let extractedRawText = "";
  let formattedTxtContent = "";

  if (!dropzone || !fileInput) return;

  function loadDependencies() {
    return new Promise((resolve, reject) => {
      if (!window.mammoth) {
        const s1 = document.createElement("script");
        s1.src =
          "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
        s1.onload = resolve;
        s1.onerror = () => reject("Failed to load Mammoth");
        document.head.appendChild(s1);
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
      inputFilename.value = `${baseName}.txt`;
    }

    uploadSection.style.display = "none";
    configSection.style.display = "block";

    try {
      await loadDependencies();
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      extractedRawText = result.value || "";
      const words = extractedRawText.trim()
        ? extractedRawText.trim().split(/\s+/).length
        : 0;
      fileMetaDisplay.textContent = `${sizeKB} KB • ~${words} words`;
    } catch (err) {
      fileMetaDisplay.textContent = `${sizeKB} KB • Word Document`;
    }
  }

  function resetToUpload() {
    currentFile = null;
    extractedRawText = "";
    formattedTxtContent = "";
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
    if (progressBar) progressBar.style.width = "40%";
    if (progressText)
      progressText.textContent = "Extracting plain text content...";

    try {
      await loadDependencies();
      if (!extractedRawText) {
        const arrayBuffer = await currentFile.arrayBuffer();
        const mRes = await window.mammoth.extractRawText({ arrayBuffer });
        extractedRawText = mRes.value || "";
      }

      if (progressBar) progressBar.style.width = "80%";
      if (progressText) progressText.textContent = "Formatting line breaks...";

      const lineBreakMode = selectLineBreaks?.value || "crlf";
      formattedTxtContent = extractedRawText;

      if (lineBreakMode === "crlf") {
        formattedTxtContent = formattedTxtContent.replace(/\r?\n/g, "\r\n");
      } else {
        formattedTxtContent = formattedTxtContent.replace(/\r\n/g, "\n");
      }

      const words = formattedTxtContent.trim()
        ? formattedTxtContent.trim().split(/\s+/).length
        : 0;
      const chars = formattedTxtContent.length;

      if (txtWordsMeta)
        txtWordsMeta.textContent = `${words.toLocaleString()} Words`;
      if (txtCharsMeta)
        txtCharsMeta.textContent = `${chars.toLocaleString()} Characters`;

      if (textPreviewArea) {
        textPreviewArea.value = formattedTxtContent;
      }

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("Word to TXT Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error("Error extracting text: " + err.message);
      processingState.style.display = "none";
      configSection.style.display = "block";
    }
  });

  btnCopyText?.addEventListener("click", () => {
    if (!formattedTxtContent) return;
    navigator.clipboard.writeText(formattedTxtContent).then(() => {
      const origText = btnCopyText.innerHTML;
      btnCopyText.innerHTML = "✓ Copied!";
      setTimeout(() => (btnCopyText.innerHTML = origText), 2000);
    });
  });

  btnDownload?.addEventListener("click", () => {
    if (!formattedTxtContent) return;
    const blob = new Blob([formattedTxtContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "document.txt") : String(inputFilename?.value || "document.txt").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
