/**
 * Comprexa Production Analytics & Event Tracking Engine
 * Prepared for Google Analytics 4 (GA4), Google Search Console, and Bing Webmaster Tools
 */

class ComprexaAnalyticsEngine {
  constructor() {
    this.measurementId = window.COMPREXA_GA_ID || this._getMetaMeasurementId() || null;
    this.initialized = false;
    this.init();
  }

  _getMetaMeasurementId() {
    if (typeof document === "undefined") return null;
    const meta = document.querySelector('meta[name="ga-measurement-id"]');
    return meta ? meta.getAttribute("content") : null;
  }

  init() {
    if (this.initialized) return;

    if (this.measurementId && typeof window !== "undefined") {
      this._loadGA4Script(this.measurementId);
    }

    this.initialized = true;
    this._bindGlobalEvents();
  }

  _loadGA4Script(id) {
    if (document.getElementById("ga4-gtag-script")) return;
    
    const script = document.createElement("script");
    script.id = "ga4-gtag-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", id, { send_page_view: true });
  }

  /**
   * Track Custom Analytics Event
   */
  trackEvent(eventName, params = {}) {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  }

  /**
   * Track Page Views
   */
  trackPageView(pageTitle, pageLocation) {
    this.trackEvent("page_view", {
      page_title: pageTitle || document.title,
      page_location: pageLocation || window.location.href,
    });
  }

  /**
   * Track Tool Usage Execution
   */
  trackToolUsage(toolId, action = "process") {
    this.trackEvent("tool_usage", {
      tool_id: toolId,
      action: action,
      timestamp: Date.now(),
    });
  }

  /**
   * Track File Downloads
   */
  trackDownload(toolId, fileType, fileName) {
    this.trackEvent("file_download", {
      tool_id: toolId,
      file_extension: fileType,
      file_name: fileName,
    });
  }

  /**
   * Track Search Queries
   */
  trackSearch(query, resultCount) {
    if (!query) return;
    this.trackEvent("search", {
      search_term: query,
      result_count: resultCount || 0,
    });
  }

  /**
   * Track Call-To-Action (CTA) Clicks
   */
  trackCTAClick(ctaLabel, ctaLocation) {
    this.trackEvent("cta_click", {
      cta_label: ctaLabel,
      cta_location: ctaLocation,
    });
  }

  /**
   * Track Blog Article Views
   */
  trackBlogView(articleId, articleTitle) {
    this.trackEvent("blog_view", {
      article_id: articleId,
      article_title: articleTitle,
    });
  }

  _bindGlobalEvents() {
    if (typeof document === "undefined") return;

    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, a");
      if (!target) return;

      if (target.classList.contains("btn-download") || target.hasAttribute("download")) {
        const toolId = target.dataset.tool || target.closest("[data-tool]")?.dataset.tool || "generic_tool";
        this.trackDownload(toolId, "file", target.getAttribute("download") || "download");
      }

      if (target.classList.contains("btn--cta") || target.dataset.cta) {
        this.trackCTAClick(target.textContent.trim(), window.location.pathname);
      }
    });
  }
}

// Instantiate Global Analytics Manager
if (typeof window !== "undefined") {
  window.ComprexaAnalytics = new ComprexaAnalyticsEngine();
}
