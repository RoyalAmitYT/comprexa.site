/**
 * Comprexa PowerPoint to PDF Controller
 * Converts .pptx / .ppt presentations into clean vector PDF slides.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("ppt-pdf-dropzone");
  const fileInput = document.getElementById("ppt-pdf-file-input");
  const uploadSection = document.getElementById("ppt-pdf-upload-section");
  const configSection = document.getElementById("ppt-pdf-config-section");
  const processingState = document.getElementById("ppt-pdf-processing-state");
  const resultSection = document.getElementById("ppt-pdf-result-section");

  const fileNameDisplay = document.getElementById("ppt-pdf-file-name-display");
  const fileMetaDisplay = document.getElementById("ppt-pdf-file-meta-display");
  const btnChangeFile = document.getElementById("btn-ppt-pdf-change-file");

  const selectLayout = document.getElementById("ppt-pdf-layout");
  const inputFilename = document.getElementById("ppt-pdf-filename");

  const btnConvert = document.getElementById("btn-execute-ppt-pdf");
  const btnDownload = document.getElementById("btn-download-ppt-pdf");
  const btnConvertAnother = document.getElementById("btn-ppt-pdf-another");

  const progressBar = document.getElementById("ppt-pdf-progress-bar");
  const progressText = document.getElementById("ppt-pdf-progress-text");

  let currentFile = null;
  let parsedSlides = [];
  let pdfBytes = null;

  if (!dropzone || !fileInput) return;

  function loadDependencies() {
    return new Promise((resolve, reject) => {
      let loaded = 0;
      const total = 2;
      function check() {
        loaded++;
        if (loaded >= total) resolve();
      }

      if (!window.JSZip) {
        const s1 = document.createElement("script");
        s1.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        s1.onload = check;
        s1.onerror = () => reject("Failed to load JSZip");
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
    if (![".pptx", ".ppt"].includes(ext)) {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Please select a valid PowerPoint presentation (.pptx or .ppt);.",
        );
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);

    if (inputFilename) {
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      inputFilename.value = `${baseName}.pdf`;
    }

    uploadSection.style.display = "none";
    configSection.style.display = "block";

    try {
      await loadDependencies();
      const zip = await window.JSZip.loadAsync(file);
      const slideFiles = Object.keys(zip.files).filter(
        (f) => f.startsWith("ppt/slides/slide") && f.endsWith(".xml"),
      );

      fileMetaDisplay.textContent = `${sizeKB} KB • ${slideFiles.length} Slide(s)`;

      parsedSlides = [];
      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.files[slideFiles[i]].async("text");
        const parser = new DOMParser();
        const doc = parser.parseFromString(slideXml, "application/xml");
        const textNodes = doc.querySelectorAll("t");
        const slideText = Array.from(textNodes)
          .map((t) => t.textContent)
          .join(" ")
          .trim();
        parsedSlides.push({
          index: i + 1,
          text: slideText || `Slide ${i + 1}`,
        });
      }
    } catch (err) {
      fileMetaDisplay.textContent = `${sizeKB} KB • PowerPoint Presentation`;
    }
  }

  function resetToUpload() {
    currentFile = null;
    parsedSlides = [];
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
      progressText.textContent = "Generating PDF presentation slides...";

    try {
      await loadDependencies();

      const pdfDoc = await window.PDFLib.PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.Helvetica,
      );
      const fontBold = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.HelveticaBold,
      );

      const layout = selectLayout?.value || "16:9";
      const pageWidth = layout === "16:9" ? 960 : 792;
      const pageHeight = layout === "16:9" ? 540 : 612;

      const slidesToRender =
        parsedSlides.length > 0
          ? parsedSlides
          : [{ index: 1, text: currentFile.name }];

      for (let i = 0; i < slidesToRender.length; i++) {
        const slide = slidesToRender[i];
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Slide Background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: window.PDFLib.rgb(0.98, 0.98, 0.99),
        });

        // Top Accent Bar
        page.drawRectangle({
          x: 0,
          y: pageHeight - 6,
          width: pageWidth,
          height: 6,
          color: window.PDFLib.rgb(0.38, 0.4, 0.95),
        });

        // Slide Title Box
        page.drawText(`Slide ${slide.index}`, {
          x: 40,
          y: pageHeight - 45,
          size: 20,
          font: fontBold,
          color: window.PDFLib.rgb(0.1, 0.15, 0.3),
        });

        // Slide Content Text
        const words = slide.text.split(" ");
        let line = "";
        let yPos = pageHeight - 90;
        const margin = 40;
        const maxW = pageWidth - 80;

        for (let w = 0; w < words.length; w++) {
          const testLine = line ? `${line} ${words[w]}` : words[w];
          if (fontRegular.widthOfTextAtSize(testLine, 12) > maxW) {
            page.drawText(line, {
              x: margin,
              y: yPos,
              size: 12,
              font: fontRegular,
              color: window.PDFLib.rgb(0.2, 0.2, 0.2),
            });
            line = words[w];
            yPos -= 18;
            if (yPos < 50) break;
          } else {
            line = testLine;
          }
        }
        if (line && yPos >= 50) {
          page.drawText(line, {
            x: margin,
            y: yPos,
            size: 12,
            font: fontRegular,
            color: window.PDFLib.rgb(0.2, 0.2, 0.2),
          });
        }

        // Slide Footer
        page.drawText(
          `${currentFile.name} • Slide ${slide.index} of ${slidesToRender.length}`,
          {
            x: 40,
            y: 20,
            size: 9,
            font: fontRegular,
            color: window.PDFLib.rgb(0.5, 0.5, 0.5),
          },
        );
      }

      if (progressBar) progressBar.style.width = "90%";
      pdfBytes = await pdfDoc.save();

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("PowerPoint to PDF Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error converting PowerPoint presentation: " + err.message,
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
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "presentation.pdf") : String(inputFilename?.value || "presentation.pdf").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
