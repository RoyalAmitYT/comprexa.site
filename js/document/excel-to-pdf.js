/**
 * Comprexa Excel to PDF Controller
 * Converts .xlsx, .xls, .csv spreadsheets into clean formatted PDF files.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("excel-pdf-dropzone");
  const fileInput = document.getElementById("excel-pdf-file-input");
  const uploadSection = document.getElementById("excel-pdf-upload-section");
  const configSection = document.getElementById("excel-pdf-config-section");
  const processingState = document.getElementById("excel-pdf-processing-state");
  const resultSection = document.getElementById("excel-pdf-result-section");

  const fileNameDisplay = document.getElementById(
    "excel-pdf-file-name-display",
  );
  const fileMetaDisplay = document.getElementById(
    "excel-pdf-file-meta-display",
  );
  const sheetSelector = document.getElementById("excel-pdf-sheet-select");
  const btnChangeFile = document.getElementById("btn-excel-pdf-change-file");

  const selectOrientation = document.getElementById("excel-pdf-orientation");
  const selectGridlines = document.getElementById("excel-pdf-gridlines");
  const inputFilename = document.getElementById("excel-pdf-filename");

  const btnConvert = document.getElementById("btn-execute-excel-pdf");
  const btnDownload = document.getElementById("btn-download-excel-pdf");
  const btnConvertAnother = document.getElementById("btn-excel-pdf-another");

  const progressBar = document.getElementById("excel-pdf-progress-bar");
  const progressText = document.getElementById("excel-pdf-progress-text");

  let currentFile = null;
  let workbook = null;
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

      if (!window.XLSX) {
        const s1 = document.createElement("script");
        s1.src =
          "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        s1.onload = check;
        s1.onerror = () => reject("Failed to load SheetJS XLSX library");
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
    if (![".xlsx", ".xls", ".csv"].includes(ext)) {
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Please select a valid Excel spreadsheet or CSV file (.xlsx, .xls, .csv);.",
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
      const data = await file.arrayBuffer();
      workbook = window.XLSX.read(data, { type: "array" });

      // Populate sheet dropdown
      if (sheetSelector) {
        sheetSelector.innerHTML =
          '<option value="__ALL__">All Worksheets</option>';
        workbook.SheetNames.forEach((name) => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          sheetSelector.appendChild(opt);
        });
      }

      fileMetaDisplay.textContent = `${sizeKB} KB • ${workbook.SheetNames.length} Sheet(s)`;
    } catch (err) {
      console.error("Error reading Excel file:", err);
      fileMetaDisplay.textContent = `${sizeKB} KB • Spreadsheet`;
    }
  }

  function resetToUpload() {
    currentFile = null;
    workbook = null;
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
    if (progressText) progressText.textContent = "Parsing spreadsheet data...";

    try {
      await loadDependencies();
      const orientation = selectOrientation?.value || "landscape";
      const showGridlines = selectGridlines?.value !== "false";
      const selectedSheet = sheetSelector?.value || "__ALL__";

      const pdfDoc = await window.PDFLib.PDFDocument.create();
      const font = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.Helvetica,
      );
      const fontBold = await pdfDoc.embedFont(
        window.PDFLib.StandardFonts.HelveticaBold,
      );

      const pageWidth = orientation === "landscape" ? 792 : 612;
      const pageHeight = orientation === "landscape" ? 612 : 792;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      const targetSheets =
        selectedSheet === "__ALL__" ? workbook.SheetNames : [selectedSheet];

      for (let sIdx = 0; sIdx < targetSheets.length; sIdx++) {
        const sheetName = targetSheets[sIdx];
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const rows = window.XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });
        if (rows.length === 0) continue;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let currentY = pageHeight - margin;

        // Sheet Header
        page.drawText(`${currentFile.name} — ${sheetName}`, {
          x: margin,
          y: currentY,
          size: 13,
          font: fontBold,
          color: window.PDFLib.rgb(0.1, 0.1, 0.25),
        });
        currentY -= 20;

        // Determine columns count
        const colCount = Math.max(...rows.map((r) => r.length), 1);
        const colWidth = Math.max(contentWidth / colCount, 40);
        const rowHeight = 20;
        const fontSize = Math.min(10, Math.max(6, Math.floor(colWidth / 7)));

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];

          if (currentY < margin + rowHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          const isHeader = rIdx === 0;

          // Row Background
          if (isHeader) {
            page.drawRectangle({
              x: margin,
              y: currentY - rowHeight,
              width: colCount * colWidth,
              height: rowHeight,
              color: window.PDFLib.rgb(0.92, 0.94, 0.98),
            });
          }

          for (let cIdx = 0; cIdx < colCount; cIdx++) {
            const cellValue = String(
              row[cIdx] !== undefined ? row[cIdx] : "",
            ).trim();
            const cellX = margin + cIdx * colWidth;
            const cellY = currentY - rowHeight + 5;

            // Draw Gridlines
            if (showGridlines) {
              page.drawRectangle({
                x: cellX,
                y: currentY - rowHeight,
                width: colWidth,
                height: rowHeight,
                borderWidth: 0.5,
                borderColor: window.PDFLib.rgb(0.82, 0.84, 0.88),
              });
            }

            // Draw Cell Text
            if (cellValue) {
              let truncated = cellValue;
              const maxChars = Math.floor(colWidth / (fontSize * 0.55));
              if (truncated.length > maxChars) {
                truncated =
                  truncated.substring(0, Math.max(maxChars - 2, 1)) + "…";
              }

              page.drawText(truncated, {
                x: cellX + 4,
                y: cellY,
                size: fontSize,
                font: isHeader ? fontBold : font,
                color: isHeader
                  ? window.PDFLib.rgb(0.1, 0.15, 0.3)
                  : window.PDFLib.rgb(0.2, 0.2, 0.2),
              });
            }
          }

          currentY -= rowHeight;
        }
      }

      if (progressBar) progressBar.style.width = "90%";
      pdfBytes = await pdfDoc.save();

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("Excel to PDF Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error converting spreadsheet: " + err.message,
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
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || "spreadsheet.pdf") : String(inputFilename?.value || "spreadsheet.pdf").replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
