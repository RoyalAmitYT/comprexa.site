/**
 * Comprexa - Cryptographic Hash Generator Engine
 * Client-side MD5, SHA-1, SHA-256, and SHA-512 text & file hasher
 */

document.addEventListener("DOMContentLoaded", () => {
  // Tabs / Input mode
  const tabText = document.getElementById("tab-mode-text");
  const tabFile = document.getElementById("tab-mode-file");
  const textSection = document.getElementById("section-hash-text");
  const fileSection = document.getElementById("section-hash-file");

  const textInput = document.getElementById("hash-text-input");
  const fileDropzone = document.getElementById("hash-file-dropzone");
  const fileInput = document.getElementById("hash-file-input");
  const fileInfoCard = document.getElementById("file-info-card");
  const fileNameText = document.getElementById("file-name-text");
  const fileSizeText = document.getElementById("file-size-text");

  const uppercaseChk = document.getElementById("chk-uppercase");
  const compareInput = document.getElementById("hash-compare-input");
  const compareStatus = document.getElementById("hash-compare-status");

  // Result Fields
  const resMd5 = document.getElementById("hash-res-md5");
  const resSha1 = document.getElementById("hash-res-sha1");
  const resSha256 = document.getElementById("hash-res-sha256");
  const resSha512 = document.getElementById("hash-res-sha512");

  const btnCopyAll = document.getElementById("btn-copy-all-hashes");
  const btnClear = document.getElementById("btn-clear-hashes");

  if (!resSha256) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("hash-generator");
  }

  let currentMode = "text"; // 'text' or 'file'
  let currentFileBuffer = null;

  // --------------------------------------------------------------------------
  // Tab Switching
  // --------------------------------------------------------------------------
  if (tabText && tabFile) {
    tabText.addEventListener("click", () => {
      tabText.classList.add("category-tab--active");
      tabFile.classList.remove("category-tab--active");
      textSection.style.display = "block";
      fileSection.style.display = "none";
      currentMode = "text";
      computeTextHashes();
    });

    tabFile.addEventListener("click", () => {
      tabFile.classList.add("category-tab--active");
      tabText.classList.remove("category-tab--active");
      fileSection.style.display = "block";
      textSection.style.display = "none";
      currentMode = "file";
      if (currentFileBuffer) {
        computeFileHashes(currentFileBuffer);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Text Mode Hashes
  // --------------------------------------------------------------------------
  async function computeTextHashes() {
    const text = textInput ? textInput.value : "";
    if (!text && currentMode === "text") {
      clearResults();
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    await processBuffer(data.buffer);
  }

  if (textInput) {
    textInput.addEventListener("input", () => {
      if (currentMode === "text") computeTextHashes();
    });
  }

  // --------------------------------------------------------------------------
  // File Mode Drag & Drop / Select
  // --------------------------------------------------------------------------
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
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    if (!file) return;

    if (fileNameText) fileNameText.textContent = file.name;
    if (fileSizeText) fileSizeText.textContent = formatBytes(file.size);
    if (fileInfoCard) fileInfoCard.style.display = "flex";

    const reader = new FileReader();
    reader.onload = async (e) => {
      currentFileBuffer = e.target.result;
      if (currentMode === "file") {
        await computeFileHashes(currentFileBuffer);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function computeFileHashes(buffer) {
    if (!buffer) return;
    await processBuffer(buffer);
  }

  // --------------------------------------------------------------------------
  // Core Crypto Processor
  // --------------------------------------------------------------------------
  async function processBuffer(buffer) {
    const isUpper = uppercaseChk ? uppercaseChk.checked : false;

    // 1. MD5
    const md5Hex = calcMD5FromBuffer(buffer);

    // 2. SHA-1
    const sha1Buf = await crypto.subtle.digest("SHA-1", buffer);
    const sha1Hex = bufferToHex(sha1Buf);

    // 3. SHA-256
    const sha256Buf = await crypto.subtle.digest("SHA-256", buffer);
    const sha256Hex = bufferToHex(sha256Buf);

    // 4. SHA-512
    const sha512Buf = await crypto.subtle.digest("SHA-512", buffer);
    const sha512Hex = bufferToHex(sha512Buf);

    const format = (str) => (isUpper ? str.toUpperCase() : str.toLowerCase());

    if (resMd5) resMd5.value = format(md5Hex);
    if (resSha1) resSha1.value = format(sha1Hex);
    if (resSha256) resSha256.value = format(sha256Hex);
    if (resSha512) resSha512.value = format(sha512Hex);

    checkCompareMatch();
  }

  function clearResults() {
    if (resMd5) resMd5.value = "";
    if (resSha1) resSha1.value = "";
    if (resSha256) resSha256.value = "";
    if (resSha512) resSha512.value = "";
    if (compareStatus) compareStatus.innerHTML = "";
  }

  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // --------------------------------------------------------------------------
  // Pure JS MD5 Algorithm (RFC 1321)
  // --------------------------------------------------------------------------
  function calcMD5FromBuffer(buffer) {
    const u8 = new Uint8Array(buffer);
    const len = u8.length;

    // MD5 Constants
    const S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4,
      11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6,
      10, 15, 21,
    ];
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) {
      K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    }

    // Padding
    const paddedLen = (((len + 8) >> 6) + 1) << 6;
    const msg = new Uint8Array(paddedLen);
    msg.set(u8);
    msg[len] = 0x80;

    // Append length in bits (little-endian 64-bit int)
    const bitsLen = len * 8;
    msg[paddedLen - 8] = bitsLen & 0xff;
    msg[paddedLen - 7] = (bitsLen >>> 8) & 0xff;
    msg[paddedLen - 6] = (bitsLen >>> 16) & 0xff;
    msg[paddedLen - 5] = (bitsLen >>> 24) & 0xff;

    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;

    for (let offset = 0; offset < paddedLen; offset += 64) {
      const M = new Uint32Array(16);
      for (let j = 0; j < 16; j++) {
        M[j] =
          msg[offset + j * 4] |
          (msg[offset + j * 4 + 1] << 8) |
          (msg[offset + j * 4 + 2] << 16) |
          (msg[offset + j * 4 + 3] << 24);
      }

      let A = h0,
        B = h1,
        C = h2,
        D = h3;

      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) {
          F = (B & C) | (~B & D);
          g = i;
        } else if (i < 32) {
          F = (D & B) | (~D & C);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = (7 * i) % 16;
        }

        const temp = D;
        D = C;
        C = B;
        const sum = (A + F + K[i] + M[g]) >>> 0;
        const rot = (sum << S[i]) | (sum >>> (32 - S[i]));
        B = (B + rot) >>> 0;
        A = temp;
      }

      h0 = (h0 + A) >>> 0;
      h1 = (h1 + B) >>> 0;
      h2 = (h2 + C) >>> 0;
      h3 = (h3 + D) >>> 0;
    }

    const toHexLE = (val) => {
      let hex = "";
      for (let i = 0; i < 4; i++) {
        hex += ((val >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
      }
      return hex;
    };

    return toHexLE(h0) + toHexLE(h1) + toHexLE(h2) + toHexLE(h3);
  }

  // --------------------------------------------------------------------------
  // Hash Match / Verification
  // --------------------------------------------------------------------------
  function checkCompareMatch() {
    if (!compareInput || !compareStatus) return;
    const expected = compareInput.value.trim().toLowerCase();
    if (!expected) {
      compareStatus.innerHTML = "";
      return;
    }

    const md5 = resMd5.value.toLowerCase();
    const sha1 = resSha1.value.toLowerCase();
    const sha256 = resSha256.value.toLowerCase();
    const sha512 = resSha512.value.toLowerCase();

    let matchedAlgo = null;
    if (expected === md5 && md5) matchedAlgo = "MD5";
    else if (expected === sha1 && sha1) matchedAlgo = "SHA-1";
    else if (expected === sha256 && sha256) matchedAlgo = "SHA-256";
    else if (expected === sha512 && sha512) matchedAlgo = "SHA-512";

    if (matchedAlgo) {
      compareStatus.innerHTML = `<span class="badge badge--success" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 0.85rem;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> MATCH FOUND! Hash matches ${matchedAlgo} algorithm digest.</span>`;
    } else {
      compareStatus.innerHTML = `<span class="badge badge--error" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 0.85rem;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> NO MATCH. Hash does not match any computed algorithm digest.</span>`;
    }
  }

  if (compareInput) {
    compareInput.addEventListener("input", checkCompareMatch);
  }

  if (uppercaseChk) {
    uppercaseChk.addEventListener("change", () => {
      if (currentMode === "text") computeTextHashes();
      else if (currentFileBuffer) computeFileHashes(currentFileBuffer);
    });
  }

  // Individual Copy Buttons
  document.querySelectorAll(".btn-copy-single-hash").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (targetInput && targetInput.value) {
        navigator.clipboard.writeText(targetInput.value).then(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.success("Hash copied to clipboard!");
        });
      } else {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No hash available to copy");
      }
    });
  });

  if (btnCopyAll) {
    btnCopyAll.addEventListener("click", () => {
      const md5 = resMd5 ? resMd5.value : "";
      const sha1 = resSha1 ? resSha1.value : "";
      const sha256 = resSha256 ? resSha256.value : "";
      const sha512 = resSha512 ? resSha512.value : "";

      if (!md5 && !sha256) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No hashes generated yet");
        return;
      }

      const allText = `MD5:    ${md5}\nSHA-1:  ${sha1}\nSHA-256:${sha256}\nSHA-512:${sha512}`;
      navigator.clipboard.writeText(allText).then(() => {
        if (window.ComprexaToast)
          window.ComprexaToast.success("All hashes copied to clipboard!");
      });
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (textInput) textInput.value = "";
      if (fileInput) fileInput.value = "";
      if (compareInput) compareInput.value = "";
      if (fileInfoCard) fileInfoCard.style.display = "none";
      currentFileBuffer = null;
      clearResults();
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Default sample calculation
  computeTextHashes();
});
