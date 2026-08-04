// @ts-nocheck
/**
 * Comprexa Universal Search & Tool Discovery Engine
 * Production-grade search index with fuzzy matching, typo tolerance, category filtering,
 * recent search history, popular tools curation, and future-proof AI/voice hooks.
 */

class ComprexaSearchEngine {
  constructor() {
    this.registry = window.ComprexaToolsRegistry || null;
    this.categoriesRepo = window.ComprexaCategories || null;
    this.recentSearchKey = "comprexa-recent-searches";
    this.maxRecentSearches = 10;

    // Fallback static tools if global registry is still loading
    this.fallbackTools =
      typeof COMPREXA_TOOLS_REGISTRY !== "undefined"
        ? COMPREXA_TOOLS_REGISTRY
        : [];

    // Future expansion hooks
    this.aiSearchHandler = null;
    this.voiceSearchHandler = null;
    this.analyticsHandler = null;

    // Search Index Cache
    this.indexedTools = [];
    this.isIndexed = false;
  }

  /**
   * Initialize and build search index from global tools registry
   */
  init() {
    this.buildIndex();
  }

  /**
   * Rebuild or build the search index dynamically
   */
  buildIndex() {
    let rawTools = [];
    if (
      window.ComprexaToolsRegistry &&
      typeof window.ComprexaToolsRegistry.getAll === "function"
    ) {
      rawTools = window.ComprexaToolsRegistry.getAll();
    } else if (typeof COMPREXA_TOOLS_REGISTRY !== "undefined") {
      rawTools = COMPREXA_TOOLS_REGISTRY;
    } else {
      rawTools = this.fallbackTools;
    }

    this.indexedTools = rawTools.map((tool) => {
      const title = tool.title || tool.name || "";
      const desc = tool.shortDescription || tool.description || "";
      const category = tool.category || "";
      const categoryName =
        tool.categoryName ||
        (this.categoriesRepo
          ? this.categoriesRepo.getById(category)?.name || category
          : category);
      const keywords = Array.isArray(tool.keywords) ? tool.keywords : [];
      const tags = Array.isArray(tool.tags) ? tool.tags : [];
      const slug = tool.slug || tool.id;

      // Construct normalized searchable blob
      const normalizedTitle = this._normalizeText(title);
      const normalizedDesc = this._normalizeText(desc);
      const normalizedCategory = this._normalizeText(categoryName);
      const normalizedKeywords = keywords
        .map((k) => this._normalizeText(k))
        .join(" ");
      const normalizedTags = tags.map((t) => this._normalizeText(t)).join(" ");

      return {
        ...tool,
        title,
        desc,
        category,
        categoryName,
        slug,
        keywords,
        tags,
        _searchBlob: {
          title: normalizedTitle,
          desc: normalizedDesc,
          category: normalizedCategory,
          keywords: normalizedKeywords,
          tags: normalizedTags,
          combined: `${normalizedTitle} ${normalizedDesc} ${normalizedCategory} ${normalizedKeywords} ${normalizedTags}`,
        },
      };
    });

    this.isIndexed = true;
    return this.indexedTools;
  }

  /**
   * Perform high-speed search with fuzzy matching and typo tolerance
   * @param {string} rawQuery - The user search input term
   * @param {string} [categoryFilter='all'] - Optional category filter ID
   * @param {Object} [options={}] - Search flags
   * @returns {Array<Object>} Array of result items with relevance score and highlight locations
   */
  search(rawQuery = "", categoryFilter = "all", options = {}) {
    if (!this.isIndexed || this.indexedTools.length === 0) {
      this.buildIndex();
    }

    const query = this._normalizeText(rawQuery.trim());
    const filterCat = categoryFilter ? categoryFilter.toLowerCase() : "all";

    // 1. If empty query, return popular/featured tools or category filtered items
    if (!query) {
      return this.indexedTools
        .filter(
          (t) =>
            filterCat === "all" ||
            t.category.toLowerCase() === filterCat ||
            t.categoryName.toLowerCase() === filterCat,
        )
        .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
        .map((tool) => ({
          item: tool,
          score: tool.popular ? 100 : 50,
          matches: { title: false, desc: false, keywords: [] },
        }));
    }

    // Split query into tokens for multi-term matching
    const queryTokens = query.split(/\s+/).filter(Boolean);
    const results = [];

    for (const tool of this.indexedTools) {
      // Category filter match check
      if (filterCat !== "all") {
        const catMatch =
          tool.category.toLowerCase() === filterCat ||
          tool.categoryName.toLowerCase() === filterCat ||
          tool.slug.toLowerCase().includes(filterCat);
        if (!catMatch) continue;
      }

      const scoreObj = this._calculateRelevanceScore(tool, query, queryTokens);

      if (scoreObj.score > 0) {
        results.push({
          item: tool,
          score: scoreObj.score,
          matches: scoreObj.matches,
        });
      }
    }

    // Log analytics hook if defined
    if (typeof this.analyticsHandler === "function") {
      this.analyticsHandler(query, results.length);
    }

    // Sort by relevance score descending, then popularity
    return results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.item.popular ? 1 : 0) - (a.item.popular ? 1 : 0);
    });
  }

  /**
   * Internal Relevance & Typo Scoring Engine
   */
  _calculateRelevanceScore(tool, query, queryTokens) {
    let score = 0;
    const blob = tool._searchBlob;
    const matches = {
      title: false,
      desc: false,
      keywords: [],
      category: false,
    };

    // A. Exact Title Match
    if (blob.title === query) {
      score += 100;
      matches.title = true;
    }
    // B. Title starts with query
    else if (blob.title.startsWith(query)) {
      score += 85;
      matches.title = true;
    }
    // C. Word in title starts with query or contains query
    else if (blob.title.includes(query)) {
      score += 70;
      matches.title = true;
    }

    // D. Keyword exact match
    tool.keywords.forEach((kw) => {
      const normKw = this._normalizeText(kw);
      if (normKw === query) {
        score += 65;
        matches.keywords.push(kw);
      } else if (normKw.includes(query) || query.includes(normKw)) {
        score += 45;
        matches.keywords.push(kw);
      }
    });

    // E. Category match
    if (blob.category.includes(query)) {
      score += 50;
      matches.category = true;
    }

    // F. Description match
    if (blob.desc.includes(query)) {
      score += 35;
      matches.desc = true;
    }

    // G. Multi-Token Subsequence Match (e.g. "pdf merge" -> matches "Merge PDF")
    let allTokensMatched = true;
    let tokenScore = 0;
    queryTokens.forEach((token) => {
      if (blob.combined.includes(token)) {
        tokenScore += 20;
      } else {
        // Try fuzzy Levenshtein match for token
        const words = blob.combined.split(/\s+/);
        let bestFuzzy = 0;
        words.forEach((w) => {
          if (w.length >= 3 && token.length >= 3) {
            const dist = this._levenshteinDistance(token, w);
            const maxLen = Math.max(token.length, w.length);
            const similarity = 1 - dist / maxLen;
            if (similarity >= 0.65) {
              bestFuzzy = Math.max(bestFuzzy, Math.round(similarity * 25));
            }
          }
        });

        if (bestFuzzy > 0) {
          tokenScore += bestFuzzy;
        } else {
          allTokensMatched = false;
        }
      }
    });

    if (allTokensMatched && queryTokens.length > 1) {
      score += 30 + tokenScore;
    } else {
      score += tokenScore;
    }

    // H. Direct Typo Tolerance / Levenshtein matching on entire title or tool slug
    if (score < 30 && query.length >= 3) {
      const titleDist = this._levenshteinDistance(query, blob.title);
      const titleMax = Math.max(query.length, blob.title.length);
      const titleSimilarity = 1 - titleDist / titleMax;

      if (titleSimilarity >= 0.6) {
        score += Math.round(titleSimilarity * 45);
        matches.title = true;
      } else {
        const slugDist = this._levenshteinDistance(query, tool.slug);
        const slugSimilarity =
          1 - slugDist / Math.max(query.length, tool.slug.length);
        if (slugSimilarity >= 0.6) {
          score += Math.round(slugSimilarity * 40);
        }
      }
    }

    return { score, matches };
  }

  /**
   * Levenshtein Distance Algorithm for typo tolerance
   */
  _levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get dynamic list of available tool categories for filter tabs
   */
  getCategories() {
    if (!this.isIndexed) this.buildIndex();

    const categoryCounts = {};
    this.indexedTools.forEach((t) => {
      const catKey = t.category || "other";
      const catName = t.categoryName || catKey;
      if (!categoryCounts[catKey]) {
        categoryCounts[catKey] = { id: catKey, name: catName, count: 0 };
      }
      categoryCounts[catKey].count++;
    });

    const categoryList = [
      { id: "all", name: "All Tools", count: this.indexedTools.length },
      ...Object.values(categoryCounts),
    ];

    return categoryList;
  }

  /**
   * Recent Searches Management API (Session / LocalStorage)
   */
  getRecentSearches() {
    try {
      const raw = localStorage.getItem(this.recentSearchKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  addRecentSearch(term) {
    if (!term || typeof term !== "string") return;
    const cleanTerm = term.trim();
    if (cleanTerm.length < 2) return;

    let searches = this.getRecentSearches();
    // Remove duplicate if exists
    searches = searches.filter(
      (s) => s.toLowerCase() !== cleanTerm.toLowerCase(),
    );
    // Prepend to top
    searches.unshift(cleanTerm);
    // Limit to max recent searches
    if (searches.length > this.maxRecentSearches) {
      searches = searches.slice(0, this.maxRecentSearches);
    }

    try {
      localStorage.setItem(this.recentSearchKey, JSON.stringify(searches));
    } catch (e) {}
  }

  removeRecentSearch(term) {
    let searches = this.getRecentSearches();
    searches = searches.filter((s) => s.toLowerCase() !== term.toLowerCase());
    try {
      localStorage.setItem(this.recentSearchKey, JSON.stringify(searches));
    } catch (e) {}
    return searches;
  }

  clearRecentSearches() {
    try {
      localStorage.removeItem(this.recentSearchKey);
    } catch (e) {}
    return [];
  }

  /**
   * Retrieve Curated Popular Tools
   */
  getPopularTools(limit = 8) {
    if (!this.isIndexed) this.buildIndex();
    return this.indexedTools
      .filter((t) => t.popular || t.featured)
      .slice(0, limit);
  }

  /**
   * Retrieve Suggested / Related Tools for a given tool ID or category
   */
  getRelatedTools(toolId, limit = 4) {
    if (!this.isIndexed) this.buildIndex();
    const currentTool = this.indexedTools.find(
      (t) => t.id === toolId || t.slug === toolId,
    );

    if (!currentTool) return this.getPopularTools(limit);

    // If explicit related tools defined
    if (
      Array.isArray(currentTool.relatedTools) &&
      currentTool.relatedTools.length > 0
    ) {
      const explicit = currentTool.relatedTools
        .map((relId) =>
          this.indexedTools.find((t) => t.id === relId || t.slug === relId),
        )
        .filter(Boolean);
      if (explicit.length >= limit) return explicit.slice(0, limit);
    }

    // Fallback: match by category
    const sameCategory = this.indexedTools.filter(
      (t) => t.id !== currentTool.id && t.category === currentTool.category,
    );
    return sameCategory.slice(0, limit);
  }

  /**
   * Text Normalization Helper
   */
  _normalizeText(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .replace(/[^a-z0-9\s]/g, "") // strip special punctuation
      .trim();
  }

  /**
   * Highlight query terms in target text safely with HTML
   * @param {string} text - Source plain text
   * @param {string} query - Query string to highlight
   * @returns {string} Safe HTML string with <mark class="search-highlight">
   */
  highlightMatch(text, query) {
    if (!text) return "";
    if (!query || !query.trim()) return this._escapeHTML(text);

    const safeText = this._escapeHTML(text);
    const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!cleanQuery) return safeText;

    const regex = new RegExp(`(${cleanQuery})`, "gi");
    return safeText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  _escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Future Extensibility APIs
   */
  registerAISearchHandler(fn) {
    this.aiSearchHandler = fn;
  }

  registerVoiceSearchHandler(fn) {
    this.voiceSearchHandler = fn;
  }

  registerAnalyticsHandler(fn) {
    this.analyticsHandler = fn;
  }
}

// Global Export Singleton
window.ComprexaSearchEngine = new ComprexaSearchEngine();

// Auto-initialize when registry is available
document.addEventListener("DOMContentLoaded", () => {
  if (window.ComprexaSearchEngine) {
    window.ComprexaSearchEngine.init();
  }
});
