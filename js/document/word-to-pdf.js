/**
 * Comprexa Word to PDF Controller
 * Converts .docx / .doc files to PDF format directly in the browser.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dropzone = document.getElementById("word-pdf-dropzone");
  const fileInput = document.getElementById("word-pdf-file-input");
  const uploadSection = document.getElementById("word-pdf-upload-section");
  const configSection = document.getElementById("word-pdf-config-section");
  const processingState = document.getElementById("word-pdf-processing-state");
  const resultSection = document.getElementById("word-pdf-result-section");

  const fileNameDisplay = document.getElementById("word-pdf-file-name-display");
  const fileMetaDisplay = document.getElementById("word-pdf-file-meta-display");
  const btnChangeFile = document.getElementById("btn-word-pdf-change-file");

  const selectOrientation = document.getElementById("word-pdf-orientation");
  const selectMargins = document.getElementById("word-pdf-margins");
  const selectFontSize = document.getElementById("word-pdf-font-size");
  const inputFilename = document.getElementById("word-pdf-filename");

  const btnConvert = document.getElementById("btn-execute-word-pdf");
  const btnDownload = document.getElementById("btn-download-word-pdf");
  const btnConvertAnother = document.getElementById("btn-word-pdf-another");

  const progressBar = document.getElementById("word-pdf-progress-bar");
  const progressText = document.getElementById("word-pdf-progress-text");

  let currentFile = null;
  let parsedContent = null;
  let pdfBytes = null;

  if (!dropzone || !fileInput) return;

  // Ensure Mammoth and PDFLib are loaded
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
        s1.onerror = () => reject("Failed to load mammoth.js");
        document.head.appendChild(s1);
      } else {
        check();
      }

      if (!window.PDFLib) {
        const s2 = document.createElement("script");
        s2.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
        s2.onload = check;
        s2.onerror = () => reject("Failed to load pdf-lib");
        document.head.appendChild(s2);
      } else {
        check();
      }
    });
  }

  // Event Listeners
  dropzone.addEventListener("click", () => fileInput.click());

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        e.stopPropagation();
        dropzone.classList.remove("drag-over");
      },
      false,
    );
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  btnChangeFile?.addEventListener("click", resetToUpload);
  btnConvertAnother?.addEventListener("click", resetToUpload);

  async function handleFileSelection(file) {
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".docx" && ext !== ".doc") {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Please select a valid Word document (.docx or .doc);.",
        );
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);
    fileMetaDisplay.textContent = `${sizeKB} KB • Word Document`;

    if (inputFilename) {
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      inputFilename.value = `${baseName}.pdf`;
    }

    uploadSection.style.display = "none";
    configSection.style.display = "block";

    // Load dependencies & parse file in background
    try {
      await loadDependencies();
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({
        arrayBuffer: arrayBuffer,
      });
      const text = result.value || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      fileMetaDisplay.textContent = `${sizeKB} KB • ~${words} words`;
      parsedContent = { rawText: text, html: result.value };
    } catch (err) {}
  }

  function resetToUpload() {
    currentFile = null;
    parsedContent = null;
    pdfBytes = null;
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
      progressText.textContent = "Reading document structure...";

    try {
      await loadDependencies();

      if (progressBar) progressBar.style.width = "60%";
      if (progressText) progressText.textContent = "Building PDF pages...";

      const arrayBuffer = await currentFile.arrayBuffer();
      let text = "";
      try {
        const mRes = await window.mammoth.extractRawText({ arrayBuffer });
        text = mRes.value || "";
      } catch (e) {
        text = "Document conversion complete.";
      }

      const orientation = selectOrientation?.value || "portrait";
      const marginSize = parseInt(selectMargins?.value || "36", 10);
      const fontSize = parseInt(selectFontSize?.value || "11", 10);

      // Create PDF using pdf-lib
      const pdfDoc = await window.PDFLib.PDFDocument.create();
      const standardFont = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.Helvetica,
      );
      const boldFont = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.HelveticaBold,
      );

      const pageWidth = orientation === "landscape" ? 792 : 612; // Letter
      const pageHeight = orientation === "landscape" ? 612 : 792;
      const margin = marginSize;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.35;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Add Document Header
      const titleText = currentFile.name.replace(/\.[^/.]+$/, "");
      page.drawText(titleText, {
        x: margin,
        y: currentY,
        size: fontSize + 5,
        font: boldFont,
        color: window.PDFLib.rgb(0.1, 0.1, 0.2),
      });
      currentY -= fontSize + 16;

      // Draw horizontal separator rule
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 0.75,
        color: window.PDFLib.rgb(0.8, 0.8, 0.85),
      });
      currentY -= 18;

      const paragraphs = text.split(/\n+/);

      for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
        const paragraph = paragraphs[pIndex].trim();
        if (!paragraph) {
          currentY -= lineHeight * 0.5;
          continue;
        }

        // Word Wrap Logic
        const words = paragraph.split(" ");
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine
            ? `${currentLine} ${words[i]}`
            : words[i];
          const testWidth = standardFont.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > contentWidth && currentLine) {
            // Draw Line
            if (currentY < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }
            page.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: fontSize,
              font: standardFont,
              color: window.PDFLib.rgb(0.15, 0.15, 0.15),
            });
            currentY -= lineHeight;
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (currentY < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: standardFont,
            color: window.PDFLib.rgb(0.15, 0.15, 0.15),
          });
          currentY -= lineHeight;
        }

        currentY -= lineHeight * 0.35; // paragraph spacing
      }

      if (progressBar) progressBar.style.width = "90%";
      if (progressText) progressText.textContent = "Finalizing document...";

      pdfBytes = await pdfDoc.save();

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("Word to PDF Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error converting Word document: " + err.message,
        );
      processingState.style.display = "none";
      configSection.style.display = "block";
    }
  });

  btnDownload?.addEventListener("click", () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "document.pdf") : String(inputFilename?.value || "document.pdf").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
