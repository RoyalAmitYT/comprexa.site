// @ts-nocheck
/**
 * Comprexa - UUID Generator Engine
 * Client-side RFC 4122 compliant UUID v4 batch generator
 */

document.addEventListener("DOMContentLoaded", () => {
  const qtyInput = document.getElementById("uuid-qty-input");
  const qtySlider = document.getElementById("uuid-qty-slider");
  const uppercaseChk = document.getElementById("chk-uppercase");
  const hyphensChk = document.getElementById("chk-hyphens");
  const bracesChk = document.getElementById("chk-braces");
  const formatSelect = document.getElementById("uuid-format-select");

  const btnGenerate = document.getElementById("btn-generate-uuid");
  const btnCopy = document.getElementById("btn-copy-uuid");
  const btnDownload = document.getElementById("btn-download-uuid");
  const btnClear = document.getElementById("btn-clear-uuid");

  const outputArea = document.getElementById("uuid-output");
  const countBadge = document.getElementById("uuid-count-badge");

  if (!outputArea) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("uuid-generator");
  }

  // Generate single RFC 4122 v4 UUID using crypto.randomUUID or fallback
  function generateSingleUUID() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    // Fallback using crypto.getRandomValues
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16),
    );
  }

  function generateUUIDs() {
    let qty = parseInt(qtyInput ? qtyInput.value : 10, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 1000) qty = 1000;

    const isUppercase = uppercaseChk ? uppercaseChk.checked : false;
    const includeHyphens = hyphensChk ? hyphensChk.checked : true;
    const includeBraces = bracesChk ? bracesChk.checked : false;
    const format = formatSelect ? formatSelect.value : "plain";

    const rawList = [];
    for (let i = 0; i < qty; i++) {
      let uuid = generateSingleUUID();
      if (!includeHyphens) {
        uuid = uuid.replace(/-/g, "");
      }
      if (isUppercase) {
        uuid = uuid.toUpperCase();
      } else {
        uuid = uuid.toLowerCase();
      }
      if (includeBraces) {
        uuid = `{${uuid}}`;
      }
      rawList.push(uuid);
    }

    let outputText = "";
    if (format === "json") {
      outputText = JSON.stringify(rawList, null, 2);
    } else if (format === "array") {
      outputText = `[\n  ${rawList.map((u) => `"${u}"`).join(",\n  ")}\n]`;
    } else if (format === "sql") {
      outputText = rawList.map((u) => `'${u}'`).join(",\n");
    } else if (format === "comma") {
      outputText = rawList.join(", ");
    } else {
      outputText = rawList.join("\n");
    }

    outputArea.value = outputText;

    if (countBadge) {
      countBadge.textContent = `${qty} ${qty === 1 ? "UUID" : "UUIDs"}`;
    }
  }

  // Sync Slider & Input
  if (qtyInput && qtySlider) {
    qtyInput.addEventListener("input", () => {
      let val = parseInt(qtyInput.value, 10);
      if (val < 1) val = 1;
      if (val > 1000) val = 1000;
      qtySlider.value = val;
      generateUUIDs();
    });

    qtySlider.addEventListener("input", () => {
      qtyInput.value = qtySlider.value;
      generateUUIDs();
    });
  }

  [uppercaseChk, hyphensChk, bracesChk, formatSelect].forEach((el) => {
    if (el) el.addEventListener("change", generateUUIDs);
  });

  if (btnGenerate) btnGenerate.addEventListener("click", generateUUIDs);

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No UUIDs to copy");
        return;
      }
      navigator.clipboard
        .writeText(val)
        .then(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.success("UUIDs copied to clipboard!");
        })
        .catch(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.error("Failed to copy");
        });
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const val = outputArea.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("No UUIDs to download");
        return;
      }
      const blob = new Blob([val], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (window.ComprexaUtils && window.ComprexaUtils.sanitizeFilename ? window.ComprexaUtils.sanitizeFilename(`uuids-${Date.now()}.txt`) : String(`uuids-${Date.now()}.txt`).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      outputArea.value = "";
      if (countBadge) countBadge.textContent = "0 UUIDs";
    });
  }

  // Quick preset buttons
  document.querySelectorAll(".uuid-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = parseInt(btn.getAttribute("data-qty"), 10);
      if (q && qtyInput && qtySlider) {
        qtyInput.value = q;
        qtySlider.value = q;
        generateUUIDs();
      }
    });
  });

  // Initial generation
  generateUUIDs();
});
