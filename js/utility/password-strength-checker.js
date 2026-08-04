/**
 * Comprexa - Password Strength Checker Engine
 * Client-side cryptographic password security & entropy analyzer
 */

document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const pwdInput = document.getElementById("pwd-input");
  const toggleVisibilityBtn = document.getElementById("btn-toggle-visibility");
  const copyBtn = document.getElementById("btn-copy-pwd");
  const clearBtn = document.getElementById("btn-clear-pwd");
  const sampleBtn = document.getElementById("btn-sample-pwd");

  // Score & Status Elements
  const strengthBadge = document.getElementById("strength-badge");
  const strengthBar = document.getElementById("strength-bar");
  const scorePercentText = document.getElementById("score-percent-text");

  // Metrics
  const statEntropy = document.getElementById("stat-entropy");
  const statCrackTime = document.getElementById("stat-crack-time");
  const statPoolSize = document.getElementById("stat-pool-size");
  const statLength = document.getElementById("stat-length");

  // Counts
  const countUppercase = document.getElementById("count-uppercase");
  const countLowercase = document.getElementById("count-lowercase");
  const countNumbers = document.getElementById("count-numbers");
  const countSymbols = document.getElementById("count-symbols");

  // Feedback Lists
  const vulnerabilitiesList = document.getElementById("vulnerabilities-list");
  const suggestionsList = document.getElementById("suggestions-list");

  if (!pwdInput) return;

  // Initialize Tool Landing Engine if present
  if (window.ComprexaToolLandingPage) {
    const landing = new window.ComprexaToolLandingPage();
    landing.init("password-strength-checker");
  }

  // Common dictionary/weak passwords set
  const commonWeakPasswords = new Set([
    "password",
    "123456",
    "12345678",
    "123456789",
    "12345",
    "1234",
    "qwerty",
    "password123",
    "admin",
    "welcome",
    "letmein",
    "iloveyou",
    "sunshine",
    "monkey",
    "dragon",
    "football",
    "pass123",
    "abc123",
    "master",
    "superman",
    "trustno1",
    "shadow",
    "keyboard",
    "admin123",
    "princess",
    "solo",
  ]);

  // Common sequential patterns
  const sequentialPatterns = [
    "abc",
    "bcd",
    "cde",
    "def",
    "efg",
    "fgh",
    "ghi",
    "hij",
    "ijk",
    "jkl",
    "klm",
    "lmn",
    "mno",
    "nop",
    "opq",
    "pqr",
    "qrs",
    "rst",
    "stu",
    "tuv",
    "uvw",
    "vwx",
    "wxy",
    "xyz",
    "012",
    "123",
    "234",
    "345",
    "456",
    "567",
    "678",
    "789",
    "qwerty",
    "asdf",
    "zxcv",
  ];

  function analyzePassword(pwd) {
    if (!pwd || pwd.length === 0) {
      resetUI();
      return;
    }

    const length = pwd.length;
    let poolSize = 0;

    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    const upperCount = (pwd.match(/[A-Z]/g) || []).length;
    const lowerCount = (pwd.match(/[a-z]/g) || []).length;
    const numberCount = (pwd.match(/[0-9]/g) || []).length;
    const symbolCount = (pwd.match(/[^A-Za-z0-9]/g) || []).length;

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 33; // Standard punctuation / symbols

    // Entropy calculation: E = Length * log2(Pool)
    const entropy = poolSize > 0 ? Math.floor(length * Math.log2(poolSize)) : 0;

    // Estimate Crack Time (Assuming 100 Billion guesses / sec)
    const guessesPerSecond = 100000000000;
    const totalCombinations = poolSize > 0 ? Math.pow(poolSize, length) : 0;
    const secondsToCrack = totalCombinations / guessesPerSecond;

    // Vulnerabilities & Suggestions
    const vulnerabilities = [];
    const suggestions = [];

    const pwdLower = pwd.toLowerCase();

    // Check dictionary
    if (commonWeakPasswords.has(pwdLower)) {
      vulnerabilities.push(
        "Matched extremely common breached password database",
      );
    }

    // Check sequential
    for (const seq of sequentialPatterns) {
      if (pwdLower.includes(seq)) {
        vulnerabilities.push(`Contains sequential sequence "${seq}"`);
        break;
      }
    }

    // Check repeated characters
    if (/(.)\1{2,}/.test(pwd)) {
      vulnerabilities.push(
        "Contains 3 or more identical repeated characters in a row",
      );
    }

    // Length evaluation
    if (length < 8) {
      vulnerabilities.push("Too short (fewer than 8 characters)");
      suggestions.push(
        "Increase length to at least 12–16 characters for modern security",
      );
    } else if (length < 12) {
      suggestions.push(
        "Consider lengthening your password to 16+ characters for extra durability",
      );
    }

    if (!hasUpper)
      suggestions.push("Include at least one uppercase letter (A-Z)");
    if (!hasLower)
      suggestions.push("Include at least one lowercase letter (a-z)");
    if (!hasNumber)
      suggestions.push("Include at least one numeric digit (0-9)");
    if (!hasSymbol)
      suggestions.push("Include at least one special symbol (!@#$%^&*)");

    // Score calculation (0 to 100)
    let score = 0;

    // Base score from entropy (up to 60 pts)
    score += Math.min(60, Math.floor((entropy / 128) * 60));

    // Length bonus (up to 20 pts)
    score += Math.min(20, length * 1.25);

    // Variety bonus (up to 20 pts)
    let varietyTypes = 0;
    if (hasUpper) varietyTypes++;
    if (hasLower) varietyTypes++;
    if (hasNumber) varietyTypes++;
    if (hasSymbol) varietyTypes++;
    score += varietyTypes * 5;

    // Deductions for vulnerabilities
    if (commonWeakPasswords.has(pwdLower)) score = Math.min(score, 10);
    score -= vulnerabilities.length * 15;
    score = Math.max(0, Math.min(100, score));

    // Determine Status Badge & Color
    let level = "Very Weak";
    let badgeClass = "badge--error";
    let barColor = "var(--error)";

    if (score >= 85 && entropy >= 60) {
      level = "Very Strong";
      badgeClass = "badge--success";
      barColor = "#10b981";
    } else if (score >= 65) {
      level = "Strong";
      badgeClass = "badge--success";
      barColor = "var(--primary)";
    } else if (score >= 45) {
      level = "Medium";
      badgeClass = "badge--warning";
      barColor = "#f59e0b";
    } else if (score >= 25) {
      level = "Weak";
      badgeClass = "badge--warning";
      barColor = "#ef4444";
    }

    // Update UI
    if (strengthBadge) {
      strengthBadge.textContent = level;
      strengthBadge.className = `pwd-strength-badge ${badgeClass}`;
    }

    if (strengthBar) {
      strengthBar.style.width = `${Math.max(5, score)}%`;
      strengthBar.style.backgroundColor = barColor;
    }

    if (scorePercentText) {
      scorePercentText.textContent = `${score}/100`;
    }

    if (statEntropy) statEntropy.textContent = `${entropy} bits`;
    if (statCrackTime)
      statCrackTime.textContent = formatCrackTime(secondsToCrack);
    if (statPoolSize) statPoolSize.textContent = `${poolSize} chars`;
    if (statLength) statLength.textContent = `${length} chars`;

    if (countUppercase) countUppercase.textContent = upperCount;
    if (countLowercase) countLowercase.textContent = lowerCount;
    if (countNumbers) countNumbers.textContent = numberCount;
    if (countSymbols) countSymbols.textContent = symbolCount;

    // Render Vulnerabilities
    if (vulnerabilitiesList) {
      if (vulnerabilities.length === 0) {
        vulnerabilitiesList.innerHTML =
          '<li class="pwd-check-item pwd-check-item--pass"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> No obvious security vulnerabilities or dictionary patterns found.</li>';
      } else {
        vulnerabilitiesList.innerHTML = vulnerabilities
          .map(
            (v) =>
              `<li class="pwd-check-item pwd-check-item--fail"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${v}</li>`,
          )
          .join("");
      }
    }

    // Render Suggestions
    if (suggestionsList) {
      if (suggestions.length === 0) {
        suggestionsList.innerHTML =
          '<li class="pwd-check-item pwd-check-item--pass"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Excellent composition! Your password meets ideal security standards.</li>';
      } else {
        suggestionsList.innerHTML = suggestions
          .map(
            (s) =>
              `<li class="pwd-check-item pwd-check-item--tip"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> ${s}</li>`,
          )
          .join("");
      }
    }
  }

  function resetUI() {
    if (strengthBadge) {
      strengthBadge.textContent = "None";
      strengthBadge.className = "pwd-strength-badge badge--subtle";
    }
    if (strengthBar) {
      strengthBar.style.width = "0%";
    }
    if (scorePercentText) scorePercentText.textContent = "0/100";
    if (statEntropy) statEntropy.textContent = "0 bits";
    if (statCrackTime) statCrackTime.textContent = "N/A";
    if (statPoolSize) statPoolSize.textContent = "0 chars";
    if (statLength) statLength.textContent = "0 chars";

    if (countUppercase) countUppercase.textContent = "0";
    if (countLowercase) countLowercase.textContent = "0";
    if (countNumbers) countNumbers.textContent = "0";
    if (countSymbols) countSymbols.textContent = "0";

    if (vulnerabilitiesList)
      vulnerabilitiesList.innerHTML =
        '<li class="pwd-check-item text-muted">Enter a password to run vulnerability checks.</li>';
    if (suggestionsList)
      suggestionsList.innerHTML =
        '<li class="pwd-check-item text-muted">Enter a password to get personalized security tips.</li>';
  }

  function formatCrackTime(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return "Instant";
    if (seconds < 1) return "Instant";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    const years = days / 365;
    if (years < 1000) return `${Math.round(years).toLocaleString()} years`;
    if (years < 1000000) return `${(years / 1000).toFixed(1)} thousand yrs`;
    if (years < 1000000000)
      return `${(years / 1000000).toFixed(1)} million yrs`;
    if (years < 1000000000000)
      return `${(years / 1000000000).toFixed(1)} billion yrs`;
    return "Trillions of years";
  }

  // Event Listeners
  pwdInput.addEventListener("input", (e) => {
    analyzePassword(e.target.value);
  });

  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.addEventListener("click", () => {
      const type =
        pwdInput.getAttribute("type") === "password" ? "text" : "password";
      pwdInput.setAttribute("type", type);
      toggleVisibilityBtn.innerHTML =
        type === "password"
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const val = pwdInput.value;
      if (!val) {
        if (window.ComprexaToast)
          window.ComprexaToast.warning("Please enter a password first");
        return;
      }
      navigator.clipboard
        .writeText(val)
        .then(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.success("Password copied to clipboard!");
        })
        .catch(() => {
          if (window.ComprexaToast)
            window.ComprexaToast.error("Failed to copy to clipboard");
        });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      pwdInput.value = "";
      analyzePassword("");
      pwdInput.focus();
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
      let sample = "";
      const array = new Uint32Array(18);
      crypto.getRandomValues(array);
      for (let i = 0; i < array.length; i++) {
        sample += charset[array[i] % charset.length];
      }
      pwdInput.value = sample;
      analyzePassword(sample);
    });
  }

  resetUI();
});
