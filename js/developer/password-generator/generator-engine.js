/**
 * Password Generator Engine
 * Uses window.crypto.getRandomValues for cryptographically secure random generation.
 * Calculates entropy, strength, and estimated crack time.
 */

export class PasswordGeneratorEngine {
  static CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  static SIMILAR_CHARS = /[il1Lo0OI]/g;
  static AMBIGUOUS_CHARS = /[\{\}\[\]\(\)\/\\\'\"\`\~\,\;\.\<\>]/g;

  /**
   * Generate password based on user options
   * @param {Object} options
   * @returns {Object} { password, entropy, strength, crackTime, poolSize }
   */
  static generate(options = {}) {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
      avoidSequential = false,
      avoidRepeating = false,
    } = options;

    // Build character pools
    let activeSets = [];
    if (includeUppercase) activeSets.push(this.CHAR_SETS.uppercase);
    if (includeLowercase) activeSets.push(this.CHAR_SETS.lowercase);
    if (includeNumbers) activeSets.push(this.CHAR_SETS.numbers);
    if (includeSymbols) activeSets.push(this.CHAR_SETS.symbols);

    if (activeSets.length === 0) {
      return {
        password: "",
        entropy: 0,
        strength: { label: "None", color: "#94a3b8", percentage: 0 },
        crackTime: "Instant",
        poolSize: 0,
        error: "At least one character set must be selected.",
      };
    }

    // Filter sets based on exclusion options
    activeSets = activeSets
      .map((set) => {
        let filtered = set;
        if (excludeSimilar) {
          filtered = filtered.replace(this.SIMILAR_CHARS, "");
        }
        if (excludeAmbiguous) {
          filtered = filtered.replace(this.AMBIGUOUS_CHARS, "");
        }
        return filtered;
      })
      .filter((set) => set.length > 0);

    if (activeSets.length === 0) {
      return {
        password: "",
        entropy: 0,
        strength: { label: "None", color: "#94a3b8", percentage: 0 },
        crackTime: "Instant",
        poolSize: 0,
        error: "No characters left after applying exclusions.",
      };
    }

    // Combined unique pool
    const combinedPool = Array.from(
      new Set(activeSets.join("").split("")),
    ).join("");
    const poolSize = combinedPool.length;

    if (poolSize === 0) {
      return {
        password: "",
        entropy: 0,
        strength: { label: "None", color: "#94a3b8", percentage: 0 },
        crackTime: "Instant",
        poolSize: 0,
        error: "Character pool is empty.",
      };
    }

    // Generate password ensuring at least 1 char from each requested set if possible
    let passwordChars = [];

    // Guarantee at least 1 character from each active character set
    activeSets.forEach((set) => {
      if (set.length > 0 && passwordChars.length < length) {
        const randIndex = this.getRandomInt(set.length);
        passwordChars.push(set[randIndex]);
      }
    });

    // Fill remaining length from combinedPool
    let attempts = 0;
    while (passwordChars.length < length && attempts < 1000) {
      attempts++;
      const nextChar = combinedPool[this.getRandomInt(poolSize)];
      const lastChar = passwordChars[passwordChars.length - 1];

      // Check repeating
      if (avoidRepeating && lastChar === nextChar) {
        continue;
      }

      // Check sequential
      if (avoidSequential && passwordChars.length >= 1) {
        const prevCode = lastChar.charCodeAt(0);
        const nextCode = nextChar.charCodeAt(0);
        if (Math.abs(nextCode - prevCode) === 1) {
          continue;
        }
      }

      passwordChars.push(nextChar);
    }

    // Cryptographic shuffle of password characters
    passwordChars = this.cryptoShuffle(passwordChars);

    // Final sequential fix check if requested
    if (avoidSequential) {
      for (let i = 1; i < passwordChars.length; i++) {
        const prevCode = passwordChars[i - 1].charCodeAt(0);
        const curCode = passwordChars[i].charCodeAt(0);
        if (Math.abs(curCode - prevCode) === 1) {
          // Swap with a non-sequential index if available
          for (let j = 0; j < passwordChars.length; j++) {
            if (j !== i && j !== i - 1) {
              const swapPrev = i > 0 ? passwordChars[i - 1].charCodeAt(0) : -10;
              const candidateCode = passwordChars[j].charCodeAt(0);
              if (Math.abs(candidateCode - swapPrev) !== 1) {
                const temp = passwordChars[i];
                passwordChars[i] = passwordChars[j];
                passwordChars[j] = temp;
                break;
              }
            }
          }
        }
      }
    }

    const password = passwordChars.join("");

    // Metrics calculation
    const entropy = Math.round(length * Math.log2(poolSize));
    const strength = this.calculateStrength(entropy);
    const crackTime = this.calculateCrackTime(poolSize, length);

    return {
      password,
      entropy,
      strength,
      crackTime,
      poolSize,
      error: null,
    };
  }

  /**
   * Secure Cryptographic Random Integer generator in range [0, max)
   */
  static getRandomInt(max) {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  /**
   * Fisher-Yates shuffle using crypto random
   */
  static cryptoShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getRandomInt(i + 1);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  /**
   * Password strength rating and visual properties
   */
  static calculateStrength(entropy) {
    if (entropy < 30) {
      return { label: "Weak", color: "#ef4444", percentage: 25 };
    } else if (entropy < 60) {
      return { label: "Medium", color: "#f59e0b", percentage: 50 };
    } else if (entropy < 90) {
      return { label: "Strong", color: "#3b82f6", percentage: 75 };
    } else {
      return { label: "Very Strong", color: "#10b981", percentage: 100 };
    }
  }

  /**
   * Estimate crack time assuming 100 Billion guesses/second (high speed offline attack)
   */
  static calculateCrackTime(poolSize, length) {
    if (poolSize <= 0 || length <= 0) return "Instant";

    // combinations = poolSize ^ length
    const combinations = Math.pow(poolSize, length);
    const guessesPerSec = 100_000_000_000; // 100 Billion/sec
    const seconds = combinations / guessesPerSec;

    if (seconds < 1) return "Instant (< 1 second)";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;

    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;

    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;

    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;

    const years = days / 365;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1_000_000) return `${(years / 1000).toFixed(1)} thousand years`;
    if (years < 1_000_000_000)
      return `${(years / 1_000_000).toFixed(1)} million years`;
    if (years < 1_000_000_000_000)
      return `${(years / 1_000_000_000).toFixed(1)} billion years`;

    return "Trillions of years";
  }
}
