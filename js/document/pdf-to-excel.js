/**
 * Comprexa PDF to Excel Controller
 * Extracts tables, numbers, and structured text from PDF files into Excel (.xlsx, .csv).
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("pdf-excel-dropzone");
  const fileInput = document.getElementById("pdf-excel-file-input");
  const uploadSection = document.getElementById("pdf-excel-upload-section");
  const configSection = document.getElementById("pdf-excel-config-section");
  const processingState = document.getElementById("pdf-excel-processing-state");
  const resultSection = document.getElementById("pdf-excel-result-section");

  const fileNameDisplay = document.getElementById(
    "pdf-excel-file-name-display",
  );
  const fileMetaDisplay = document.getElementById(
    "pdf-excel-file-meta-display",
  );
  const btnChangeFile = document.getElementById("btn-pdf-excel-change-file");

  const selectFormat = document.getElementById("pdf-excel-format");
  const inputFilename = document.getElementById("pdf-excel-filename");

  const btnConvert = document.getElementById("btn-execute-pdf-excel");
  const btnDownload = document.getElementById("btn-download-pdf-excel");
  const btnConvertAnother = document.getElementById("btn-pdf-excel-another");

  const progressBar = document.getElementById("pdf-excel-progress-bar");
  const progressText = document.getElementById("pdf-excel-progress-text");

  let currentFile = null;
  let pdfPageCount = 0;
  let excelBuffer = null;
  let outputExtension = "xlsx";

  if (!dropzone || !fileInput) return;

  function loadDependencies() {
    return new Promise((resolve, reject) => {
      let loaded = 0;
      const total = 2;
      function check() {
        loaded++;
        if (loaded >= total) resolve();
      }

      if (!window.pdfjsLib) {
        const s1 = document.createElement("script");
        s1.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        s1.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          check();
        };
        s1.onerror = () => reject("Failed to load PDF.js");
        document.head.appendChild(s1);
      } else {
        check();
      }

      if (!window.XLSX) {
        const s2 = document.createElement("script");
        s2.src =
          "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        s2.onload = check;
        s2.onerror = () => reject("Failed to load XLSX");
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
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      if (window.ComprexaToast)
        window.ComprexaToast.error("Please select a valid PDF file.");
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);

    const baseName = file.name.substring(0, file.name.lastIndexOf("."));
    outputExtension = selectFormat?.value || "xlsx";
    if (inputFilename) inputFilename.value = `${baseName}.${outputExtension}`;

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

  selectFormat?.addEventListener("change", () => {
    outputExtension = selectFormat.value;
    if (inputFilename && currentFile) {
      const baseName = currentFile.name.substring(
        0,
        currentFile.name.lastIndexOf("."),
      );
      inputFilename.value = `${baseName}.${outputExtension}`;
    }
  });

  function resetToUpload() {
    currentFile = null;
    excelBuffer = null;
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
      progressText.textContent = "Extracting PDF text and tables...";

    try {
      await loadDependencies();
      const arrayBuffer = await currentFile.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const wb = window.XLSX.utils.book_new();

      for (let pNo = 1; pNo <= pdf.numPages; pNo++) {
        if (progressBar)
          progressBar.style.width = `${30 + Math.floor((pNo / pdf.numPages) * 50)}%`;
        if (progressText)
          progressText.textContent = `Extracting tables from page ${pNo} of ${pdf.numPages}...`;

        const page = await pdf.getPage(pNo);
        const textContent = await page.getTextContent();

        // Group text items by Y-coordinate (rows) and sort by X-coordinate (cols)
        const rowMap = new Map();
        const yTolerance = 4; // Y tolerance for grouping into lines

        textContent.items.forEach((item) => {
          if (!item.str || !item.str.trim()) return;
          const transform = item.transform;
          const x = transform[4];
          const y = transform[5];

          // Find existing row key within yTolerance
          let foundY = null;
          for (const existingY of rowMap.keys()) {
            if (Math.abs(existingY - y) <= yTolerance) {
              foundY = existingY;
              break;
            }
          }

          if (foundY === null) {
            rowMap.set(y, [{ x, str: item.str }]);
          } else {
            rowMap.get(foundY).push({ x, str: item.str });
          }
        });

        // Sort rows descending by Y (top to bottom)
        const sortedYKeys = Array.from(rowMap.keys()).sort((a, b) => b - a);
        const tableData = [];

        sortedYKeys.forEach((yKey) => {
          const rowItems = rowMap.get(yKey).sort((a, b) => a.x - b.x);
          const rowCells = rowItems.map((it) => it.str.trim());
          tableData.push(rowCells);
        });

        const sheetData =
          tableData.length > 0
            ? tableData
            : [["No structured table text detected on this page."]];
        const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
        window.XLSX.utils.book_append_sheet(wb, ws, `Page ${pNo}`);
      }

      if (progressBar) progressBar.style.width = "90%";
      if (progressText)
        progressText.textContent = "Formatting spreadsheet file...";

      if (outputExtension === "csv") {
        const firstSheetName = wb.SheetNames[0];
        const csvStr = window.XLSX.utils.sheet_to_csv(
          wb.Sheets[firstSheetName],
        );
        excelBuffer = new TextEncoder().encode(csvStr);
      } else {
        excelBuffer = window.XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
        });
      }

      if (progressBar) progressBar.style.width = "100%";
      setTimeout(() => {
        processingState.style.display = "none";
        resultSection.style.display = "block";
      }, 300);
    } catch (err) {
      console.error("PDF to Excel Error:", err);
      if (window.ComprexaToast)
        window.ComprexaToast.error(
          "Error extracting table from PDF: " + err.message,
        );
      processingState.style.display = "none";
      configSection.style.display = "block";
    }
  });

  btnDownload?.addEventListener("click", () => {
    if (!excelBuffer) return;
    const mime =
      outputExtension === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const blob = new Blob([excelBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(inputFilename?.value || `extracted_table.${outputExtension}`) : String(inputFilename?.value || `extracted_table.${outputExtension}`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
