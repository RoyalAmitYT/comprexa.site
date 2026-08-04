// @ts-nocheck
/**
 * Comprexa - Unix Timestamp Converter Engine
 * Client-side epoch timestamp to date and date to timestamp converter
 */

document.addEventListener("DOMContentLoaded", () => {
  // Live Ticker Elements
  const liveSec = document.getElementById("live-timestamp-sec");
  const liveMs = document.getElementById("live-timestamp-ms");
  const btnPauseTicker = document.getElementById("btn-pause-ticker");

  // Mode A: Timestamp -> Date Elements
  const tsInput = document.getElementById("ts-input");
  const tsUnitSelect = document.getElementById("ts-unit-select");
  const resIso = document.getElementById("res-iso");
  const resLocal = document.getElementById("res-local");
  const resUtc = document.getElementById("res-utc");
  const resRelative = document.getElementById("res-relative");
  const resDayOfWeek = document.getElementById("res-day-of-week");
  const resDayOfYear = document.getElementById("res-day-of-year");

  // Mode B: Date -> Timestamp Elements
  const dateInput = document.getElementById("date-picker-input");
  const resSecOut = document.getElementById("res-sec-out");
  const resMsOut = document.getElementById("res-ms-out");

  if (!liveSec) return;

  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("timestamp-converter");
  }

  // --------------------------------------------------------------------------
  // Live Ticker
  // --------------------------------------------------------------------------
  let tickerRunning = true;
  let _tickerInterval = null;

  function updateLiveTicker() {
    if (!tickerRunning) return;
    const now = Date.now();
    const sec = Math.floor(now / 1000);
    if (liveSec)
      liveSec.textContent = sec.toLocaleString("en-US", { useGrouping: false });
    if (liveMs)
      liveMs.textContent = now.toLocaleString("en-US", { useGrouping: false });
  }

  tickerInterval = setInterval(updateLiveTicker, 1000);
  updateLiveTicker();

  if (btnPauseTicker) {
    btnPauseTicker.addEventListener("click", () => {
      tickerRunning = !tickerRunning;
      btnPauseTicker.innerHTML = tickerRunning
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>Pause Ticker</span>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Resume Ticker</span>`;
    });
  }

  // Copy buttons for live ticker
  document.querySelectorAll(".btn-copy-live").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const now = Date.now();
      const val = type === "sec" ? Math.floor(now / 1000) : now;
      navigator.clipboard.writeText(val.toString()).then(() => {
        if (window.ComprexaToast)
          window.ComprexaToast.success(
            `Copied current ${type === "sec" ? "seconds" : "milliseconds"} timestamp!`,
          );
      });
    });
  });

  // --------------------------------------------------------------------------
  // Mode A: Timestamp -> Date Conversion
  // --------------------------------------------------------------------------
  function convertTimestampToDate() {
    let raw = tsInput ? tsInput.value.trim() : "";
    if (!raw) {
      raw = Math.floor(Date.now() / 1000).toString();
      if (tsInput) tsInput.value = raw;
    }

    const unit = tsUnitSelect ? tsUnitSelect.value : "auto";
    let num = parseInt(raw, 10);

    if (isNaN(num)) {
      if (window.ComprexaToast)
        window.ComprexaToast.error("Invalid numeric timestamp");
      return;
    }

    // Auto-detect seconds vs milliseconds if 'auto'
    let ms = num;
    if (unit === "seconds" || (unit === "auto" && num < 100000000000)) {
      ms = num * 1000;
    }

    const d = new Date(ms);

    if (isNaN(d.getTime())) {
      if (resIso) resIso.textContent = "Invalid Date";
      if (resLocal) resLocal.textContent = "Invalid Date";
      if (resUtc) resUtc.textContent = "Invalid Date";
      if (resRelative) resRelative.textContent = "Invalid Date";
      if (resDayOfWeek) resDayOfWeek.textContent = "-";
      if (resDayOfYear) resDayOfYear.textContent = "-";
      return;
    }

    if (resIso) resIso.value = d.toISOString();
    if (resLocal) resLocal.value = d.toString();
    if (resUtc) resUtc.value = d.toUTCString();
    if (resRelative) resRelative.value = getRelativeTimeString(d);

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (resDayOfWeek) resDayOfWeek.value = days[d.getDay()];

    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    if (resDayOfYear)
      resDayOfYear.value = `Day ${dayOfYear} of ${d.getFullYear()}`;
  }

  if (tsInput) tsInput.addEventListener("input", convertTimestampToDate);
  if (tsUnitSelect)
    tsUnitSelect.addEventListener("change", convertTimestampToDate);

  // --------------------------------------------------------------------------
  // Mode B: Date -> Timestamp Conversion
  // --------------------------------------------------------------------------
  function convertDateToTimestamp() {
    let val = dateInput ? dateInput.value : "";
    if (!val) {
      const nowIso = new Date().toISOString().slice(0, 16);
      if (dateInput) dateInput.value = nowIso;
      val = nowIso;
    }

    const d = new Date(val);
    if (isNaN(d.getTime())) {
      if (resSecOut) resSecOut.value = "Invalid Date";
      if (resMsOut) resMsOut.value = "Invalid Date";
      return;
    }

    const ms = d.getTime();
    const sec = Math.floor(ms / 1000);

    if (resSecOut) resSecOut.value = sec;
    if (resMsOut) resMsOut.value = ms;
  }

  if (dateInput) dateInput.addEventListener("input", convertDateToTimestamp);

  // Quick Preset Buttons
  document.querySelectorAll(".ts-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      const now = new Date();

      if (preset === "now") {
        if (tsInput) tsInput.value = Math.floor(now.getTime() / 1000);
        if (dateInput) dateInput.value = now.toISOString().slice(0, 16);
      } else if (preset === "start-today") {
        const startToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        if (tsInput) tsInput.value = Math.floor(startToday.getTime() / 1000);
        if (dateInput) dateInput.value = startToday.toISOString().slice(0, 16);
      } else if (preset === "end-today") {
        const endToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
        );
        if (tsInput) tsInput.value = Math.floor(endToday.getTime() / 1000);
        if (dateInput) dateInput.value = endToday.toISOString().slice(0, 16);
      } else if (preset === "plus-1-day") {
        const plusDay = new Date(now.getTime() + 86400000);
        if (tsInput) tsInput.value = Math.floor(plusDay.getTime() / 1000);
        if (dateInput) dateInput.value = plusDay.toISOString().slice(0, 16);
      } else if (preset === "plus-1-week") {
        const plusWeek = new Date(now.getTime() + 86400000 * 7);
        if (tsInput) tsInput.value = Math.floor(plusWeek.getTime() / 1000);
        if (dateInput) dateInput.value = plusWeek.toISOString().slice(0, 16);
      }

      convertTimestampToDate();
      convertDateToTimestamp();
    });
  });

  // Copy result helper buttons
  document.querySelectorAll(".btn-copy-ts-field").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (targetEl && targetEl.value) {
        navigator.clipboard.writeText(targetEl.value).then(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.success("Copied to clipboard!");
        });
      }
    });
  });

  function getRelativeTimeString(date) {
    const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const cutoffs = [
      60,
      3600,
      86400,
      86400 * 7,
      86400 * 30,
      86400 * 365,
      Infinity,
    ];
    const units = ["second", "minute", "hour", "day", "week", "month", "year"];
    const unitIndex = cutoffs.findIndex(
      (cutoff) => cutoff > Math.abs(deltaSeconds),
    );
    const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
    const count = Math.round(Math.abs(deltaSeconds) / divisor);
    const unit = units[unitIndex];

    if (deltaSeconds === 0) return "Just now";
    if (deltaSeconds > 0) {
      return `In ${count} ${unit}${count > 1 ? "s" : ""}`;
    }
    return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
  }

  // Set default initial values
  const defaultNow = new Date();
  if (tsInput) tsInput.value = Math.floor(defaultNow.getTime() / 1000);
  if (dateInput) {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzoffset)
      .toISOString()
      .slice(0, 16);
    dateInput.value = localISOTime;
  }

  convertTimestampToDate();
  convertDateToTimestamp();
});
