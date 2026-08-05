/**
 * Verify Flow - Main Controller (verify.js)
 * Manages countdown, progress bar, DOM updates, and step transitions.
 */

import { CountdownTimer } from "./countdown.js";
import { ProgressBar } from "./progress.js";

document.addEventListener("DOMContentLoaded", () => {
  const TOTAL_DURATION_SEC = 10;

  const countdownEl = document.getElementById("nzip-countdown");
  const progressBarEl = document.getElementById("nzip-progress-bar");
  const statusHeadingEl = document.getElementById("nzip-status-heading");
  const actionStatusTextEl = document.getElementById("nzip-action-status-text");
  const statusIconEl = document.getElementById("nzip-status-icon");
  const continueBtn = document.getElementById("nzip-continue-btn");
  const btnTextEl = document.getElementById("nzip-btn-text");

  const progress = new ProgressBar(progressBarEl);

  // Determine next step from data attribute or fallback
  const nextStepUrl = continueBtn?.getAttribute("data-next-step") || "/verify/step-2.html";

  const timer = new CountdownTimer({
    durationSeconds: TOTAL_DURATION_SEC,
    updateIntervalMs: 100,
    onTick: (remainingSec, progressRatio) => {
      if (countdownEl && remainingSec > 0) {
        countdownEl.textContent = String(remainingSec);
      }
      progress.setProgress(progressRatio * 100);

      if (btnTextEl && remainingSec > 0) {
        btnTextEl.textContent = `Please wait for verification (${remainingSec}s)...`;
      }

      if (actionStatusTextEl && remainingSec > 0) {
        actionStatusTextEl.textContent = `Verification in progress (${remainingSec}s remaining)...`;
      }
    },
    onComplete: () => {
      onVerificationComplete();
    }
  });

  timer.start();

  function onVerificationComplete() {
    if (countdownEl) {
      countdownEl.textContent = "0";
      countdownEl.style.color = "var(--success)";
    }

    progress.complete("var(--success)");

    if (statusHeadingEl) {
      statusHeadingEl.innerHTML = `<span style="color: var(--success);">✓ Verification Complete!</span> Your link is ready.`;
    }

    if (actionStatusTextEl) {
      actionStatusTextEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✓ Destination Link Verified & Safe</span>`;
    }

    if (statusIconEl) {
      statusIconEl.setAttribute("stroke", "var(--success)");
      statusIconEl.innerHTML = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`;
    }

    if (continueBtn) {
      continueBtn.removeAttribute("disabled");
      continueBtn.setAttribute("aria-disabled", "false");
      continueBtn.classList.add("active");

      if (btnTextEl) {
        btnTextEl.textContent = continueBtn.getAttribute("data-btn-active-text") || "Continue to Step 2";
      }

      continueBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(nextStepUrl, "_blank");
      });
    }
  }
});
