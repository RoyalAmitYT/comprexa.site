/**
 * Comprexa - Random String Generator Engine
 * Client-side cryptographically secure string, token & API key generator
 */

document.addEventListener("DOMContentLoaded", () => {
  const lenInput = document.getElementById("str-len-input");
  const lenSlider = document.getElementById("str-len-slider");
  const qtyInput = document.getElementById("str-qty-input");
  const qtySlider = document.getElementById("str-qty-slider");

  const upperChk = document.getElementById("chk-uppercase");
  const lowerChk = document.getElementById("chk-lowercase");
  const numbersChk = document.getElementById("chk-numbers");
  const symbolsChk = document.getElementById("chk-symbols");
  const ambiguousChk = document.getElementById("chk-exclude-ambiguous");
  const customSetChk = document.getElementById("chk-custom-set");
  const customSetInput = document.getElementById("str-custom-set-input");

  const prefixInput = document.getElementById("str-prefix-input");
  const suffixInput = document.getElementById("str-suffix-input");
  const delimiterSelect = document.getElementById("str-delimiter-select");

  const btnGenerate = document.getElementById("btn-generate-strings");
  const btnCopy = document.getElementById("btn-copy-strings");
  const btnDownload = document.getElementById("btn-download-strings");
  const btnClear = document.getElementById("btn-clear-strings");

  const outputArea = document.getElementById("str-output");
  const countBadge = document.getElementById("str-count-badge");

  if (!outputArea) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("random-string-generator");
  }

  // Sync sliders and inputs
  if (lenInput && lenSlider) {
    lenInput.addEventListener("input", () => {
      lenSlider.value = lenInput.value;
      generateStrings();
    });
    lenSlider.addEventListener("input", () => {
      lenInput.value = lenSlider.value;
      generateStrings();
    });
  }

  if (qtyInput && qtySlider) {
    qtyInput.addEventListener("input", () => {
      qtySlider.value = qtyInput.value;
      generateStrings();
    });
    qtySlider.addEventListener("input", () => {
      qtyInput.value = qtySlider.value;
      generateStrings();
    });
  }

  if (customSetChk && customSetInput) {
    customSetChk.addEventListener("change", () => {
      customSetInput.style.display = customSetChk.checked ? "block" : "none";
      generateStrings();
    });
  }

  function generateStrings() {
    let length = parseInt(lenInput ? lenInput.value : 16, 10);
    let qty = parseInt(qtyInput ? qtyInput.value : 10, 10);

    if (isNaN(length) || length < 1) length = 1;
    if (length > 256) length = 256;

    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 500) qty = 500;

    const useUpper = upperChk ? upperChk.checked : true;
    const useLower = lowerChk ? lowerChk.checked : true;
    const useNumbers = numbersChk ? numbersChk.checked : true;
    const useSymbols = symbolsChk ? symbolsChk.checked : false;
    const excludeAmbiguous = ambiguousChk ? ambiguousChk.checked : false;
    const useCustom = customSetChk ? customSetChk.checked : false;
    const customCharset = customSetInput ? customSetInput.value : "";

    let charset = "";

    if (useCustom && customCharset.length > 0) {
      charset = customCharset;
    } else {
      if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (useLower) charset += "abcdefghijklmnopqrstuvwxyz";
      if (useNumbers) charset += "0123456789";
      if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (excludeAmbiguous) {
      charset = charset.replace(/[iI1lLoO0]/g, "");
    }

    if (!charset || charset.length === 0) {
      outputArea.value = "";
      if (countBadge) countBadge.textContent = "0 Strings";
      if (window.ComprexaToast)
        window.ComprexaToast.warning(
          "Please select at least one character set",
        );
      return;
    }

    const prefix = prefixInput ? prefixInput.value : "";
    const suffix = suffixInput ? suffixInput.value : "";
    const delimiterType = delimiterSelect ? delimiterSelect.value : "newline";

    let delimiter = "\n";
    if (delimiterType === "comma") delimiter = ", ";
    else if (delimiterType === "space") delimiter = " ";

    const resultList = [];
    const randomArray = new Uint32Array(length);

    for (let i = 0; i < qty; i++) {
      crypto.getRandomValues(randomArray);
      let str = "";
      for (let j = 0; j < length; j++) {
        str += charset[randomArray[j] % charset.length];
      }
      resultList.push(`${prefix}${str}${suffix}`);
    }

    outputArea.value = resultList.join(delimiter);

    if (countBadge) {
      countBadge.textContent = `${qty} ${qty === 1 ? "String" : "Strings"}`;
    }
  }

  [
    upperChk,
    lowerChk,
    numbersChk,
    symbolsChk,
    ambiguousChk,
    customSetInput,
    prefixInput,
    suffixInput,
    delimiterSelect,
  ].forEach((el) => {
    if (el) el.addEventListener("input", generateStrings);
    if (el) el.addEventListener("change", generateStrings);
  });

  if (btnGenerate) btnGenerate.addEventListener("click", generateStrings);

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No strings to copy");
        return;
      }
      navigator.clipboard.writeText(val).then(() => {
        if (window.ComprexaToast)
          window.ComprexaToast.success("Random strings copied to clipboard!");
      });
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No strings to download");
        return;
      }
      const blob = new Blob([val], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`random-strings-${Date.now()}.txt`) : String(`random-strings-${Date.now()}.txt`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      outputArea.value = "";
      if (countBadge) countBadge.textContent = "0 Strings";
    });
  }

  // Quick Presets
  document.querySelectorAll(".str-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      if (preset === "api-key") {
        if (lenInput) lenInput.value = 32;
        if (lenSlider) lenSlider.value = 32;
        if (upperChk) upperChk.checked = true;
        if (lowerChk) lowerChk.checked = true;
        if (numbersChk) numbersChk.checked = true;
        if (symbolsChk) symbolsChk.checked = false;
        if (prefixInput) prefixInput.value = "sk_live_";
      } else if (preset === "hex-token") {
        if (lenInput) lenInput.value = 64;
        if (lenSlider) lenSlider.value = 64;
        if (customSetChk) customSetChk.checked = true;
        if (customSetInput) {
          customSetInput.style.display = "block";
          customSetInput.value = "0123456789abcdef";
        }
        if (prefixInput) prefixInput.value = "";
      } else if (preset === "alphanumeric") {
        if (lenInput) lenInput.value = 16;
        if (lenSlider) lenSlider.value = 16;
        if (customSetChk) customSetChk.checked = false;
        if (customSetInput) customSetInput.style.display = "none";
        if (upperChk) upperChk.checked = true;
        if (lowerChk) lowerChk.checked = true;
        if (numbersChk) numbersChk.checked = true;
        if (symbolsChk) symbolsChk.checked = false;
        if (prefixInput) prefixInput.value = "";
      }
      generateStrings();
    });
  });

  // Initial generation
  generateStrings();
});
