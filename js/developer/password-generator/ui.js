/**
 * UI Controller for Password Generator
 */

import { PasswordGeneratorEngine } from "./generator-engine.js";
import { PasswordUtils } from "./utils.js";

export class PasswordUIController {
  constructor() {
    this.currentPassword = "";
    this.initDOM();
    this.bindEvents();
    this.generatePassword();
  }

  initDOM() {
    // Password display & controls
    this.passwordDisplay = document.getElementById("pwd-display");
    this.btnCopy = document.getElementById("btn-copy-password");
    this.btnRegenerate = document.getElementById("btn-regenerate");
    this.btnDownload = document.getElementById("btn-download-password");

    // Length controls
    this.lengthSlider = document.getElementById("pwd-length-slider");
    this.lengthInput = document.getElementById("pwd-length-input");

    // Checkboxes
    this.chkUppercase = document.getElementById("chk-uppercase");
    this.chkLowercase = document.getElementById("chk-lowercase");
    this.chkNumbers = document.getElementById("chk-numbers");
    this.chkSymbols = document.getElementById("chk-symbols");
    this.chkExcludeSimilar = document.getElementById("chk-exclude-similar");
    this.chkExcludeAmbiguous = document.getElementById("chk-exclude-ambiguous");
    this.chkAvoidSequential = document.getElementById("chk-avoid-sequential");
    this.chkAvoidRepeating = document.getElementById("chk-avoid-repeating");

    // Strength elements
    this.strengthBar = document.getElementById("strength-bar");
    this.strengthBadge = document.getElementById("strength-badge");
    this.statEntropy = document.getElementById("stat-entropy");
    this.statCrackTime = document.getElementById("stat-crack-time");
    this.statPoolSize = document.getElementById("stat-pool-size");
    this.statLength = document.getElementById("stat-length");

    // Status banner
    this.statusBanner = document.getElementById("dev-status-banner");

    // Presets
    this.presetBtns = document.querySelectorAll(".pwd-preset-btn");
  }

  bindEvents() {
    // Sync Slider & Number Input
    if (this.lengthSlider && this.lengthInput) {
      this.lengthSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.lengthInput.value = val;
        this.generatePassword();
      });

      this.lengthInput.addEventListener("input", (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 16;
        val = Math.max(4, Math.min(128, val));
        this.lengthSlider.value = val;
        this.generatePassword();
      });
    }

    // Checkbox changes trigger instant live regeneration
    const checkboxes = [
      this.chkUppercase,
      this.chkLowercase,
      this.chkNumbers,
      this.chkSymbols,
      this.chkExcludeSimilar,
      this.chkExcludeAmbiguous,
      this.chkAvoidSequential,
      this.chkAvoidRepeating,
    ];

    checkboxes.forEach((chk) => {
      if (chk) {
        chk.addEventListener("change", () => this.generatePassword());
      }
    });

    // Action buttons
    if (this.btnRegenerate) {
      this.btnRegenerate.addEventListener("click", () => {
        this.generatePassword();
        PasswordUtils.showToast("Generated new password", "info");
      });
    }

    if (this.btnCopy) {
      this.btnCopy.addEventListener("click", () => this.copyPassword());
    }

    if (this.btnDownload) {
      this.btnDownload.addEventListener("click", () => this.downloadPassword());
    }

    // Presets
    if (this.presetBtns) {
      this.presetBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const presetType = e.currentTarget.dataset.preset;
          this.applyPreset(presetType);
        });
      });
    }
  }

  getOptions() {
    return {
      length: parseInt(this.lengthInput ? this.lengthInput.value : 16, 10),
      includeUppercase: this.chkUppercase ? this.chkUppercase.checked : true,
      includeLowercase: this.chkLowercase ? this.chkLowercase.checked : true,
      includeNumbers: this.chkNumbers ? this.chkNumbers.checked : true,
      includeSymbols: this.chkSymbols ? this.chkSymbols.checked : true,
      excludeSimilar: this.chkExcludeSimilar
        ? this.chkExcludeSimilar.checked
        : false,
      excludeAmbiguous: this.chkExcludeAmbiguous
        ? this.chkExcludeAmbiguous.checked
        : false,
      avoidSequential: this.chkAvoidSequential
        ? this.chkAvoidSequential.checked
        : false,
      avoidRepeating: this.chkAvoidRepeating
        ? this.chkAvoidRepeating.checked
        : false,
    };
  }

  generatePassword() {
    const options = this.getOptions();
    const result = PasswordGeneratorEngine.generate(options);

    if (result.error) {
      this.currentPassword = "";
      if (this.passwordDisplay) this.passwordDisplay.value = "";
      this.updateStatusBanner("error", result.error);
      this.updateStrengthUI(
        { label: "None", color: "#94a3b8", percentage: 0 },
        0,
        "N/A",
        0,
        options.length,
      );
      return;
    }

    this.currentPassword = result.password;
    if (this.passwordDisplay) {
      this.passwordDisplay.value = result.password;
    }

    this.updateStatusBanner("valid", null);
    this.updateStrengthUI(
      result.strength,
      result.entropy,
      result.crackTime,
      result.poolSize,
      options.length,
    );
  }

  updateStrengthUI(strength, entropy, crackTime, poolSize, length) {
    if (this.strengthBar) {
      this.strengthBar.style.width = `${strength.percentage}%`;
      this.strengthBar.style.backgroundColor = strength.color;
    }

    if (this.strengthBadge) {
      this.strengthBadge.textContent = strength.label;
      this.strengthBadge.style.color = strength.color;
      this.strengthBadge.style.backgroundColor = `${strength.color}18`;
      this.strengthBadge.style.borderColor = `${strength.color}40`;
    }

    if (this.statEntropy) this.statEntropy.textContent = `${entropy} bits`;
    if (this.statCrackTime) this.statCrackTime.textContent = crackTime;
    if (this.statPoolSize) this.statPoolSize.textContent = `${poolSize} chars`;
    if (this.statLength) this.statLength.textContent = `${length} chars`;
  }

  updateStatusBanner(type, errorMsg = null) {
    if (!this.statusBanner) return;

    if (type === "error" && errorMsg) {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--error";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__content">
          <svg class="dev-status-banner__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>Generation Error:</strong> ${this.escapeHtml(errorMsg)}</div>
        </div>
      `;
    } else {
      this.statusBanner.className =
        "dev-status-banner dev-status-banner--success";
      this.statusBanner.innerHTML = `
        <div class="dev-status-banner__content">
          <svg class="dev-status-banner__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div><strong>Cryptographically Secure:</strong> Generated using browser <code style="font-family: monospace;">window.crypto.getRandomValues</code> API.</div>
        </div>
      `;
    }
  }

  applyPreset(preset) {
    switch (preset) {
      case "high-security":
        this.setFormValues(
          32,
          true,
          true,
          true,
          true,
          false,
          false,
          false,
          false,
        );
        break;
      case "easy-to-read":
        this.setFormValues(16, true, true, true, false, true, true, true, true);
        break;
      case "pin-code":
        this.setFormValues(
          6,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
        );
        break;
      case "balanced":
      default:
        this.setFormValues(
          16,
          true,
          true,
          true,
          true,
          false,
          false,
          false,
          false,
        );
        break;
    }
    this.generatePassword();
    PasswordUtils.showToast(
      `Applied preset: ${preset.replace(/-/g, " ")}`,
      "info",
    );
  }

  setFormValues(len, upper, lower, num, sym, exSim, exAmb, avSeq, avRep) {
    if (this.lengthSlider) this.lengthSlider.value = len;
    if (this.lengthInput) this.lengthInput.value = len;
    if (this.chkUppercase) this.chkUppercase.checked = upper;
    if (this.chkLowercase) this.chkLowercase.checked = lower;
    if (this.chkNumbers) this.chkNumbers.checked = num;
    if (this.chkSymbols) this.chkSymbols.checked = sym;
    if (this.chkExcludeSimilar) this.chkExcludeSimilar.checked = exSim;
    if (this.chkExcludeAmbiguous) this.chkExcludeAmbiguous.checked = exAmb;
    if (this.chkAvoidSequential) this.chkAvoidSequential.checked = avSeq;
    if (this.chkAvoidRepeating) this.chkAvoidRepeating.checked = avRep;
  }

  copyPassword() {
    if (!this.currentPassword) {
      PasswordUtils.showToast("No password to copy", "error");
      return;
    }
    PasswordUtils.copyToClipboard(this.currentPassword);
    PasswordUtils.showToast("Copied password to clipboard!", "success");
  }

  downloadPassword() {
    if (!this.currentPassword) {
      PasswordUtils.showToast("No password to download", "error");
      return;
    }
    const content = `Generated Password:\n${this.currentPassword}\n\nGenerated with Comprexa Password Generator (100% Private Client-Side)`;
    PasswordUtils.downloadFile(content, "password.txt");
    PasswordUtils.showToast("Downloaded password.txt", "success");
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
