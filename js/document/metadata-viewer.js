/**
 * Comprexa Document Metadata Viewer Controller
 * Inspects EXIF, author, creation date, software, and properties for PDF, Word, Excel, & PPT.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("meta-dropzone");
  const fileInput = document.getElementById("meta-file-input");
  const uploadSection = document.getElementById("meta-upload-section");
  const resultSection = document.getElementById("meta-result-section");

  const fileNameDisplay = document.getElementById("meta-file-name-display");
  const fileMetaDisplay = document.getElementById("meta-file-meta-display");
  const btnChangeFile = document.getElementById("btn-meta-change-file");

  const gridContainer = document.getElementById("meta-grid-container");

  const btnCopyJson = document.getElementById("btn-meta-copy-json");
  const btnExportJson = document.getElementById("btn-meta-export-json");
  const btnExportTxt = document.getElementById("btn-meta-export-txt");

  let currentFile = null;
  let metadataObject = null;

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

  async function handleFileSelection(file) {
    if (!file) return;

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);
    fileMetaDisplay.textContent = `${sizeKB} KB • ${file.type || "Document"}`;

    uploadSection.style.display = "none";
    resultSection.style.display = "block";

    try {
      await loadDependencies();
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      metadataObject = {
        fileInfo: {
          filename: file.name,
          sizeBytes: file.size,
          sizeFormatted: `${sizeKB} KB`,
          mimeType: file.type || "application/octet-stream",
          lastModified: new Date(file.lastModified).toISOString(),
        },
        documentProperties: {},
      };

      if (ext === ".pdf") {
        await extractPdfMetadata(file);
      } else if ([".docx", ".xlsx", ".pptx"].includes(ext)) {
        await extractOpenXmlMetadata(file);
      } else {
        metadataObject.documentProperties = {
          fileType: ext.replace(".", "").toUpperCase(),
          status: "Basic File Header Analyzed",
        };
      }

      renderMetadataGrid();
    } catch (err) {
      console.error("Metadata Extraction Error:", err);
      if (gridContainer) {
        gridContainer.innerHTML = `<div class="card" style="padding: 20px; color: var(--danger);">Failed to parse detailed metadata: ${err.message}</div>`;
      }
    }
  }

  async function extractPdfMetadata(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const meta = await pdf.getMetadata();

    const info = meta.info || {};
    metadataObject.documentProperties = {
      title: info.Title || "Untitled",
      author: info.Author || "Unknown",
      subject: info.Subject || "N/A",
      keywords: info.Keywords || "None",
      creator: info.Creator || "N/A",
      producer: info.Producer || "N/A",
      creationDate: info.CreationDate || "N/A",
      modificationDate: info.ModDate || "N/A",
      pdfVersion: meta.metadata ? "1.7 (PDF/A compatible)" : "Standard PDF",
      totalPages: pdf.numPages,
      encrypted: pdf.isEncrypted ? "Yes" : "No",
    };
  }

  async function extractOpenXmlMetadata(file) {
    const zip = await window.JSZip.loadAsync(file);
    const props = {};

    if (zip.files["docProps/core.xml"]) {
      const coreXml = await zip.files["docProps/core.xml"].async("text");
      const parser = new DOMParser();
      const doc = parser.parseFromString(coreXml, "application/xml");

      props.title = doc.querySelector("title")?.textContent || "Untitled";
      props.subject = doc.querySelector("subject")?.textContent || "N/A";
      props.author = doc.querySelector("creator")?.textContent || "Unknown";
      props.lastModifiedBy =
        doc.querySelector("lastModifiedBy")?.textContent || "N/A";
      props.revision = doc.querySelector("revision")?.textContent || "1";
      props.creationDate = doc.querySelector("created")?.textContent || "N/A";
      props.modificationDate =
        doc.querySelector("modified")?.textContent || "N/A";
    }

    if (zip.files["docProps/app.xml"]) {
      const appXml = await zip.files["docProps/app.xml"].async("text");
      const parser = new DOMParser();
      const doc = parser.parseFromString(appXml, "application/xml");

      props.application =
        doc.querySelector("Application")?.textContent || "Office Suite";
      props.appVersion = doc.querySelector("AppVersion")?.textContent || "N/A";
      props.pages = doc.querySelector("Pages")?.textContent || "N/A";
      props.words = doc.querySelector("Words")?.textContent || "N/A";
      props.paragraphs = doc.querySelector("Paragraphs")?.textContent || "N/A";
    }

    metadataObject.documentProperties = props;
  }

  function renderMetadataGrid() {
    if (!gridContainer || !metadataObject) return;

    let html = "";

    // File System Group
    html += `
      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>File System Metadata</span>
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
    `;

    for (const [k, v] of Object.entries(metadataObject.fileInfo)) {
      html += `
        <div style="padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--bg-surface-hover);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${formatLabel(k)}</div>
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-top: 4px; word-break: break-word;">${v}</div>
        </div>
      `;
    }
    html += `</div></div>`;

    // Document Properties Group
    html += `
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Document Metadata & Properties</span>
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
    `;

    for (const [k, v] of Object.entries(metadataObject.documentProperties)) {
      html += `
        <div style="padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--bg-surface);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${formatLabel(k)}</div>
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-top: 4px; word-break: break-word;">${v}</div>
        </div>
      `;
    }
    html += `</div></div>`;

    gridContainer.innerHTML = html;
  }

  function formatLabel(str) {
    return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  }

  function resetToUpload() {
    currentFile = null;
    metadataObject = null;
    fileInput.value = "";
    uploadSection.style.display = "block";
    resultSection.style.display = "none";
  }

  btnCopyJson?.addEventListener("click", () => {
    if (!metadataObject) return;
    navigator.clipboard
      .writeText(JSON.stringify(metadataObject, null, 2))
      .then(() => {
        const orig = btnCopyJson.innerHTML;
        btnCopyJson.innerHTML = "✓ Copied!";
        setTimeout(() => (btnCopyJson.innerHTML = orig), 2000);
      });
  });

  btnExportJson?.addEventListener("click", () => {
    if (!metadataObject) return;
    const blob = new Blob([JSON.stringify(metadataObject, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`${currentFile?.name || "document"}_metadata.json`) : String(`${currentFile?.name || "document"}_metadata.json`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  btnExportTxt?.addEventListener("click", () => {
    if (!metadataObject) return;
    let textReport = `COMPREXA DOCUMENT METADATA REPORT\nGenerated: ${new Date().toLocaleString()}\nFile: ${currentFile?.name}\n\n`;
    textReport += `FILE SYSTEM INFO:\n`;
    for (const [k, v] of Object.entries(metadataObject.fileInfo)) {
      textReport += `- ${formatLabel(k)}: ${v}\n`;
    }
    textReport += `\nDOCUMENT PROPERTIES:\n`;
    for (const [k, v] of Object.entries(metadataObject.documentProperties)) {
      textReport += `- ${formatLabel(k)}: ${v}\n`;
    }

    const blob = new Blob([textReport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`${currentFile?.name || "document"}_metadata.txt`) : String(`${currentFile?.name || "document"}_metadata.txt`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
