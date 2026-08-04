// @ts-nocheck
/**
 * Comprexa - Random Number Generator Engine
 * Client-side cryptographically secure random number & decimal generator
 */

document.addEventListener("DOMContentLoaded", () => {
  const minInput = document.getElementById("num-min-input");
  const maxInput = document.getElementById("num-max-input");
  const qtyInput = document.getElementById("num-qty-input");
  const decimalsChk = document.getElementById("chk-decimals");
  const precisionGroup = document.getElementById("precision-group");
  const precisionInput = document.getElementById("num-precision-input");
  const uniqueChk = document.getElementById("chk-unique");
  const sortSelect = document.getElementById("num-sort-select");
  const delimiterSelect = document.getElementById("num-delimiter-select");
  const customDelimiterInput = document.getElementById("num-custom-delimiter");

  const btnGenerate = document.getElementById("btn-generate-nums");
  const btnCopy = document.getElementById("btn-copy-nums");
  const btnDownload = document.getElementById("btn-download-nums");
  const btnClear = document.getElementById("btn-clear-nums");

  const outputArea = document.getElementById("num-output");

  // Stats
  const statCount = document.getElementById("stat-count");
  const statMin = document.getElementById("stat-min");
  const statMax = document.getElementById("stat-max");
  const statSum = document.getElementById("stat-sum");
  const statAvg = document.getElementById("stat-avg");

  if (!outputArea) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("random-number-generator");
  }

  // Toggle precision group visibility
  if (decimalsChk && precisionGroup) {
    decimalsChk.addEventListener("change", () => {
      precisionGroup.style.display = decimalsChk.checked ? "block" : "none";
      if (decimalsChk.checked && uniqueChk) {
        uniqueChk.checked = false; // Disable unique for float mode
      }
      generateNumbers();
    });
  }

  function getRandomFloat(min, max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomRatio = array[0] / (0xffffffff + 1);
    return min + randomRatio * (max - min);
  }

  function getRandomInt(min, max) {
    const range = max - min + 1;
    if (range <= 0) return min;

    const maxUint = 0xffffffff;
    const limit = maxUint - (maxUint % range);

    let rand;
    const array = new Uint32Array(1);
    do {
      crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= limit);

    return min + (rand % range);
  }

  function generateNumbers() {
    let min = parseFloat(minInput ? minInput.value : 1);
    let max = parseFloat(maxInput ? maxInput.value : 100);
    let qty = parseInt(qtyInput ? qtyInput.value : 10, 10);
    const allowDecimals = decimalsChk ? decimalsChk.checked : false;
    const precision = parseInt(precisionInput ? precisionInput.value : 2, 10);
    const requireUnique = uniqueChk ? uniqueChk.checked : false;
    const sortMode = sortSelect ? sortSelect.value : "none";
    const delimiterType = delimiterSelect ? delimiterSelect.value : "newline";
    const customDelimiter = customDelimiterInput
      ? customDelimiterInput.value
      : ", ";

    if (isNaN(min)) min = 1;
    if (isNaN(max)) max = 100;
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 10000) qty = 10000;

    // Check if unique constraint is possible for integer ranges
    if (requireUnique && !allowDecimals) {
      const availableRange = max - min + 1;
      if (qty > availableRange) {
        if (window.ComprexaToast) {
          window.ComprexaToast.warning(
            `Unique count reduced to ${availableRange} (max possible integers in range)`,
          );
        }
        qty = availableRange;
        if (qtyInput) qtyInput.value = qty;
      }
    }

    const numbers = [];
    const usedSet = new Set();

    let attempts = 0;
    const maxAttempts = qty * 100;

    while (numbers.length < qty && attempts < maxAttempts) {
      attempts++;
      let val;
      if (allowDecimals) {
        val = getRandomFloat(min, max);
        val = parseFloat(val.toFixed(precision));
      } else {
        val = getRandomInt(Math.ceil(min), Math.floor(max));
      }

      if (requireUnique) {
        if (!usedSet.has(val)) {
          usedSet.add(val);
          numbers.push(val);
        }
      } else {
        numbers.push(val);
      }
    }

    // Sorting
    if (sortMode === "asc") {
      numbers.sort((a, b) => a - b);
    } else if (sortMode === "desc") {
      numbers.sort((a, b) => b - a);
    }

    // Formatting delimiter
    let delimiter = "\n";
    if (delimiterType === "comma") delimiter = ", ";
    else if (delimiterType === "space") delimiter = " ";
    else if (delimiterType === "custom") delimiter = customDelimiter;

    outputArea.value = numbers.join(delimiter);

    // Compute Statistics
    if (numbers.length > 0) {
      const sum = numbers.reduce((acc, n) => acc + n, 0);
      const computedMin = Math.min(...numbers);
      const computedMax = Math.max(...numbers);
      const avg = sum / numbers.length;

      if (statCount) statCount.textContent = numbers.length;
      if (statMin)
        statMin.textContent = allowDecimals
          ? computedMin.toFixed(precision)
          : computedMin;
      if (statMax)
        statMax.textContent = allowDecimals
          ? computedMax.toFixed(precision)
          : computedMax;
      if (statSum)
        statSum.textContent = allowDecimals
          ? sum.toFixed(precision)
          : sum.toLocaleString();
      if (statAvg) statAvg.textContent = avg.toFixed(2);
    } else {
      if (statCount) statCount.textContent = "0";
      if (statMin) statMin.textContent = "-";
      if (statMax) statMax.textContent = "-";
      if (statSum) statSum.textContent = "0";
      if (statAvg) statAvg.textContent = "0";
    }
  }

  [
    minInput,
    maxInput,
    qtyInput,
    precisionInput,
    uniqueChk,
    sortSelect,
    delimiterSelect,
    customDelimiterInput,
  ].forEach((el) => {
    if (el) el.addEventListener("change", generateNumbers);
  });

  if (delimiterSelect && customDelimiterInput) {
    delimiterSelect.addEventListener("change", () => {
      customDelimiterInput.style.display =
        delimiterSelect.value === "custom" ? "block" : "none";
      generateNumbers();
    });
  }

  if (btnGenerate) btnGenerate.addEventListener("click", generateNumbers);

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No numbers generated to copy");
        return;
      }
      navigator.clipboard.writeText(val).then(() => {
        if (window.ComprexaToast)
          window.ComprexaToast.success("Random numbers copied to clipboard!");
      });
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No numbers to download");
        return;
      }
      const blob = new Blob([val], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`random-numbers-${Date.now()}.txt`) : String(`random-numbers-${Date.now()}.txt`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      outputArea.value = "";
      if (statCount) statCount.textContent = "0";
      if (statMin) statMin.textContent = "-";
      if (statMax) statMax.textContent = "-";
      if (statSum) statSum.textContent = "0";
      if (statAvg) statAvg.textContent = "0";
    });
  }

  // Initial generation
  generateNumbers();
});
