/**
 * Comprexa - Base64 Encoder / Decoder Engine
 * Client-side Unicode-safe text & file Base64 encoder/decoder
 */

document.addEventListener("DOMContentLoaded", () => {
  // Mode Tabs
  const tabEncode = document.getElementById("tab-mode-encode");
  const tabDecode = document.getElementById("tab-mode-decode");
  const tabFile = document.getElementById("tab-mode-file");

  const textSection = document.getElementById("section-b64-text");
  const fileSection = document.getElementById("section-b64-file");

  const inputArea = document.getElementById("b64-input");
  const outputArea = document.getElementById("b64-output");

  const fileDropzone = document.getElementById("b64-file-dropzone");
  const fileInput = document.getElementById("b64-file-input");
  const fileOutputArea = document.getElementById("b64-file-output");

  const urlSafeChk = document.getElementById("chk-url-safe");
  const wrap76Chk = document.getElementById("chk-wrap-76");
  const statusBadge = document.getElementById("b64-status-badge");

  const btnSwap = document.getElementById("btn-swap-b64");
  const btnCopy = document.getElementById("btn-copy-b64");
  const btnDownload = document.getElementById("btn-download-b64");
  const btnClear = document.getElementById("btn-clear-b64");

  if (!outputArea) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("base64-encoder-decoder");
  }

  let currentMode = "encode"; // 'encode', 'decode', 'file'

  // Tab Handlers
  if (tabEncode && tabDecode && tabFile) {
    tabEncode.addEventListener("click", () => {
      setMode("encode");
    });

    tabDecode.addEventListener("click", () => {
      setMode("decode");
    });

    tabFile.addEventListener("click", () => {
      setMode("file");
    });
  }

  function setMode(mode) {
    currentMode = mode;

    [tabEncode, tabDecode, tabFile].forEach((tab) => {
      if (tab) tab.classList.remove("category-tab--active");
    });

    if (mode === "encode" && tabEncode)
      tabEncode.classList.add("category-tab--active");
    if (mode === "decode" && tabDecode)
      tabDecode.classList.add("category-tab--active");
    if (mode === "file" && tabFile)
      tabFile.classList.add("category-tab--active");

    if (mode === "file") {
      textSection.style.display = "none";
      fileSection.style.display = "block";
    } else {
      textSection.style.display = "block";
      fileSection.style.display = "none";
      processTextConversion();
    }
  }

  // Unicode-safe Base64 Encoding
  function utf8ToBase64(str, isUrlSafe, wrap76) {
    const bytes = new TextEncoder().encode(str);
    let binString = "";
    for (let i = 0; i < bytes.length; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    let b64 = btoa(binString);

    if (isUrlSafe) {
      b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    if (wrap76) {
      b64 = b64.match(/.{1,76}/g)?.join("\n") || b64;
    }

    return b64;
  }

  // Unicode-safe Base64 Decoding
  function base64ToUtf8(b64, isUrlSafe) {
    let cleanB64 = b64.replace(/\s/g, "");

    if (isUrlSafe) {
      cleanB64 = cleanB64.replace(/-/g, "+").replace(/_/g, "/");
      while (cleanB64.length % 4 !== 0) {
        cleanB64 += "=";
      }
    }

    const binString = atob(cleanB64);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  function processTextConversion() {
    if (!inputArea || !outputArea) return;

    const input = inputArea.value;
    const isUrlSafe = urlSafeChk ? urlSafeChk.checked : false;
    const wrap76 = wrap76Chk ? wrap76Chk.checked : false;

    if (!input || input.trim().length === 0) {
      outputArea.value = "";
      if (statusBadge) {
        statusBadge.textContent = "Ready";
        statusBadge.className = "badge badge--subtle";
      }
      return;
    }

    if (currentMode === "encode") {
      try {
        const result = utf8ToBase64(input, isUrlSafe, wrap76);
        outputArea.value = result;
        if (statusBadge) {
          statusBadge.textContent = "Encoded Successfully";
          statusBadge.className = "badge badge--success";
        }
      } catch (err) {
        outputArea.value = "";
        if (statusBadge) {
          statusBadge.textContent = "Encoding Error";
          statusBadge.className = "badge badge--error";
        }
      }
    } else if (currentMode === "decode") {
      try {
        const result = base64ToUtf8(input, isUrlSafe);
        outputArea.value = result;
        if (statusBadge) {
          statusBadge.textContent = "Decoded Successfully";
          statusBadge.className = "badge badge--success";
        }
      } catch (err) {
        outputArea.value = "";
        if (statusBadge) {
          statusBadge.textContent = "Invalid Base64 Input";
          statusBadge.className = "badge badge--error";
        }
      }
    }
  }

  if (inputArea) {
    inputArea.addEventListener("input", processTextConversion);
  }

  [urlSafeChk, wrap76Chk].forEach((el) => {
    if (el) el.addEventListener("change", processTextConversion);
  });

  // Swap Input & Output
  if (btnSwap) {
    btnSwap.addEventListener("click", () => {
      const currentOut = outputArea.value;
      if (!currentOut) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("Output is empty. Nothing to swap.");
        return;
      }
      inputArea.value = currentOut;
      if (currentMode === "encode") {
        setMode("decode");
      } else if (currentMode === "decode") {
        setMode("encode");
      }
    });
  }

  // File Upload Mode
  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener("click", () => fileInput.click());

    fileDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileDropzone.classList.add("drag-over");
    });

    fileDropzone.addEventListener("dragleave", () => {
      fileDropzone.classList.remove("drag-over");
    });

    fileDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      fileDropzone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    });
  }

  function processFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      if (fileOutputArea) fileOutputArea.value = dataUri;
      if (window.ComprexaToast)
        window.ComprexaToast.success(
          `Encoded ${file.name} to Base64 Data URI!`,
        );
    };
    reader.readAsDataURL(file);
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const val =
        currentMode === "file"
          ? fileOutputArea
            ? fileOutputArea.value
            : ""
          : outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No output content to copy");
        return;
      }
      navigator.clipboard.writeText(val).then(() => {
        if (window.ComprexaToast)
          window.ComprexaToast.success("Output copied to clipboard!");
      });
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const val =
        currentMode === "file"
          ? fileOutputArea
            ? fileOutputArea.value
            : ""
          : outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No output content to download");
        return;
      }
      const blob = new Blob([val], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`base64-result-${Date.now()}.txt`) : String(`base64-result-${Date.now()}.txt`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (inputArea) inputArea.value = "";
      if (outputArea) outputArea.value = "";
      if (fileInput) fileInput.value = "";
      if (fileOutputArea) fileOutputArea.value = "";
      if (statusBadge) {
        statusBadge.textContent = "Cleared";
        statusBadge.className = "badge badge--subtle";
      }
    });
  }

  // Initial conversion
  processTextConversion();
});
