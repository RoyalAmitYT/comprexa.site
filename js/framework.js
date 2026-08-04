/**
 * Comprexa Global Tool Framework Engine
 * Core reusable architecture for Cards, Breadcrumbs, Related Tools, SEO, and Search
 */

// Centralized Routing Utilities
window.getToolUrl = function getToolUrl(tool) {
  if (!tool) return "/";
  const id = (typeof tool === "string" ? tool : tool.id || "").toLowerCase();
  
  if (id) {
    return `/${id}.html`;
  }
  
  const slug = (
    typeof tool === "object" && tool.slug ? tool.slug : id
  ).toLowerCase();
  
  return `/${slug || id}.html`;
};

window.getCategoryUrl = function getCategoryUrl(category) {
  if (!category) return "/#categories";
  const id = (
    typeof category === "string" ? category : category.id || ""
  ).toLowerCase();
  const slug = (
    typeof category === "object" && category.slug ? category.slug : id
  ).toLowerCase();

  const knownCategoryMap = {
    pdf: "/pdf-tools.html",
    "pdf tools": "/pdf-tools.html",
    "pdf-tools": "/pdf-tools.html",
    image: "/image-tools.html",
    "image tools": "/image-tools.html",
    "image-tools": "/image-tools.html",
    document: "/category-template.html?category=document-tools",
    "document tools": "/category-template.html?category=document-tools",
    "document-tools": "/category-template.html?category=document-tools",
    converter: "/converter-tools.html",
    "converter tools": "/converter-tools.html",
    "converter-tools": "/converter-tools.html",
    qr: "/qr-tools.html",
    "qr tools": "/qr-tools.html",
    "qr-tools": "/qr-tools.html",
    developer: "/developer-tools.html",
    "developer tools": "/developer-tools.html",
    "developer-tools": "/developer-tools.html",
    text: "/text-tools.html",
    "text tools": "/text-tools.html",
    "text-tools": "/text-tools.html",
    color: "/color-tools.html",
    "color tools": "/color-tools.html",
    "color-tools": "/color-tools.html",
    utilities: "/utility-tools.html",
    "utility tools": "/utility-tools.html",
    utility: "/utility-tools.html",
    "utility-tools": "/utility-tools.html",
  };

  if (knownCategoryMap[id]) return knownCategoryMap[id];
  if (knownCategoryMap[slug]) return knownCategoryMap[slug];

  const cleanSlug = slug.endsWith("-tools") ? slug : `${slug}-tools`;
  if (knownCategoryMap[cleanSlug]) return knownCategoryMap[cleanSlug];

  return `/category-template.html?category=${encodeURIComponent(slug || id)}`;
};

class ComprexaFramework {
  constructor() {
    this.registry = window.ComprexaToolsRegistry || null;
    this.categories = window.ComprexaCategories || null;
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.ensureFooterRendered();
        });
      } else {
        setTimeout(() => this.ensureFooterRendered(), 0);
      }
    }
  }

  ensureFooterRendered() {
    const footerEl = document.querySelector("footer.site-footer, footer.footer, footer#footer, footer");
    if (footerEl && footerEl.innerHTML.trim() === "") {
      this.renderUniversalFooter(footerEl);
    }
  }

  /**
   * Secure filename sanitizer preventing directory traversal and invalid chars
   */
  sanitizeFilename(name, fallback = "download") {
    if (!name || typeof name !== "string") return fallback;
    let sanitized = name
      .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^[\.\-_]+/, "");
    return sanitized.length > 0 ? sanitized : fallback;
  }

  /**
   * Safe URL validator preventing javascript:, data:, vbscript: protocols
   */
  isSafeUrl(url) {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim().toLowerCase();
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("vbscript:") ||
      trimmed.startsWith("file:")
    ) {
      return false;
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // 1. Reusable Tool Card Generator
  // --------------------------------------------------------------------------

  /**
   * Render a single tool card HTML element or string
   * @param {Object} tool - Tool metadata object
   * @param {Object} options - Custom rendering options (layout: 'mini' | 'standard')
   */
  renderCard(tool, options = {}) {
    if (!tool) return "";
    const layout = options.layout || "standard";
    const isMini = layout === "mini";

    const categoryObj =
      this.categories && typeof this.categories.getById === "function"
        ? this.categories.getById(tool.category) || {}
        : {};
    const badgeClass = tool.comingSoon
      ? "badge--subtle"
      : categoryObj.badgeColor || "badge--primary";
    const badgeText = tool.comingSoon ? "Coming Soon" : tool.badge || "Tool";
    let href = "#";
    if (!tool.comingSoon) {
      href = window.getToolUrl(tool);
    }

    if (isMini) {
      return `
        <a href="${href}" class="tool-card-mini" data-tool-id="${tool.id}">
          <div class="tool-card-mini__icon ${tool.colorClass || "icon-bg--pdf"}">
            ${tool.icon || categoryObj.icon || ""}
          </div>
          <div class="tool-card-mini__content">
            <h4 class="tool-card-mini__title">${tool.title}</h4>
            <p class="tool-card-mini__desc">${tool.shortDescription || ""}</p>
          </div>
          <div class="tool-card-mini__arrow">&rarr;</div>
        </a>
      `;
    }

    const catName = categoryObj.name || tool.categoryName || tool.category || "Tool";
    const colorClass = tool.colorClass || categoryObj.colorToken || "icon-bg--utility";
    const iconSvg = tool.icon || categoryObj.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2v4a1 1 0 0 0 1 1h4"/></svg>`;
    const title = tool.title || "";
    const desc = tool.shortDescription || tool.desc || "";
    const badgeHtml = badgeText
      ? `<span class="feature-card__badge badge--pill ${badgeClass}">${badgeText}</span>`
      : "";

    return `
      <a href="${href}" class="feature-card category-tool-card" data-id="${tool.id}" data-tool-id="${tool.id}" data-category="${tool.category}" aria-label="Open ${title} tool">
        <div class="feature-card__header category-tool-card__header">
          <div class="feature-card__icon category-tool-card__icon-wrapper ${colorClass}">
            ${iconSvg}
          </div>
          ${badgeHtml}
        </div>
        <div class="feature-card__body category-tool-card__content">
          <span class="feature-card__category category-tool-card__cat-label">${catName}</span>
          <h3 class="feature-card__title category-tool-card__title">${title}</h3>
          <p class="feature-card__desc category-tool-card__desc">${desc}</p>
        </div>
        <div class="feature-card__footer category-tool-card__footer">
          <span>Use Tool</span>
          <svg class="feature-card__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </div>
      </a>
    `;
  }

  /**
   * Render a list of tool cards into a target DOM container
   * @param {HTMLElement|string} target - Container element or selector
   * @param {Array} tools - Array of tool objects
   * @param {Object} options - Card rendering options
   */
  renderGrid(target, tools, options = {}) {
    const container =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!container) return;

    if (!tools || tools.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 32px 0;">
          <p style="color: var(--text-muted);">No matching tools found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tools
      .map((tool) => this.renderCard(tool, options))
      .join("");
  }

  // --------------------------------------------------------------------------
  // 2. Dynamic Breadcrumb System
  // --------------------------------------------------------------------------

  /**
   * Generate breadcrumbs based on tool or category metadata
   * @param {string} toolIdOrSlug - ID or Slug of active tool
   * @param {HTMLElement|string} target - Container DOM element
   */
  renderBreadcrumbs(toolIdOrSlug, target) {
    const container =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!container) return;

    const tool =
      this.registry && typeof this.registry.getById === "function"
        ? this.registry.getById(toolIdOrSlug) ||
          this.registry.getBySlug(toolIdOrSlug) ||
          (this.registry.getAll ? this.registry.getAll()[0] : null)
        : null;

    if (!tool) return;

    const category =
      this.categories && typeof this.categories.getById === "function"
        ? this.categories.getById(tool.category) || {
            name: "Tools",
            slug: "tools",
          }
        : { name: "Tools", slug: "tools" };

    const categoryUrl = window.getCategoryUrl(category);

    const html = `
      <div class="container">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="/" class="breadcrumb__link" itemprop="item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span itemprop="name">Home</span>
            </a>
            <meta itemprop="position" content="1" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="${categoryUrl}" class="breadcrumb__link" itemprop="item">
              <span itemprop="name">${category.name}</span>
            </a>
            <meta itemprop="position" content="2" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item breadcrumb__item--active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${tool.title}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </div>
    `;

    container.innerHTML = html;
  }

  // --------------------------------------------------------------------------
  // 3. Related Tool Engine
  // --------------------------------------------------------------------------

  /**
   * Find related tools based on category & overlapping keywords
   * @param {string} toolId - Current tool ID
   * @param {number} limit - Maximum number of suggestions
   */
  getRelatedTools(toolId, limit = 4) {
    const current = this.registry.getById(toolId) || this.registry.getAll()[0];
    const allTools = this.registry.getAll();

    if (!current) return allTools.slice(0, limit);

    // Explicit related tools first
    let related = [];
    if (current.relatedTools && Array.isArray(current.relatedTools)) {
      related = current.relatedTools
        .map((id) => this.registry.getById(id))
        .filter(Boolean);
    }

    // Fill remaining slots with same-category tools
    if (related.length < limit) {
      const sameCategory = allTools.filter(
        (t) =>
          t.id !== current.id &&
          t.category === current.category &&
          !related.some((r) => r.id === t.id),
      );
      related = [...related, ...sameCategory];
    }

    // Fill remaining slots with overlapping keyword tools
    if (related.length < limit) {
      const keywordMatches = allTools.filter(
        (t) =>
          t.id !== current.id &&
          !related.some((r) => r.id === t.id) &&
          t.keywords.some((k) => current.keywords.includes(k)),
      );
      related = [...related, ...keywordMatches];
    }

    return related.slice(0, limit);
  }

  /**
   * Render related tool cards into target DOM element
   */
  renderRelatedGrid(toolId, target, limit = 4) {
    const container =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!container) return;

    const related = this.getRelatedTools(toolId, limit);
    this.renderGrid(container, related, { layout: "mini" });
  }

  // --------------------------------------------------------------------------
  // 4. SEO Metadata Engine
  // --------------------------------------------------------------------------

  /**
   * Inject / update dynamic meta tags for active tool
   * @param {string} toolIdOrSlug
   */
  applySEOMetadata(toolIdOrSlug) {
    const tool =
      this.registry.getById(toolIdOrSlug) ||
      this.registry.getBySlug(toolIdOrSlug);
    if (!tool || !tool.seo) return;

    const { title, metaDescription, canonicalUrl, keywords } = tool.seo;

    // Document Title
    if (title) document.title = title;

    // Meta Description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement("meta");
      metaDescEl.name = "description";
      document.head.appendChild(metaDescEl);
    }
    if (metaDescription) metaDescEl.content = metaDescription;

    // Meta Keywords
    let metaKwEl = document.querySelector('meta[name="keywords"]');
    if (!metaKwEl) {
      metaKwEl = document.createElement("meta");
      metaKwEl.name = "keywords";
      document.head.appendChild(metaKwEl);
    }
    if (keywords) metaKwEl.content = keywords;

    // Canonical Link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    if (canonicalUrl) canonicalEl.href = canonicalUrl;

    // Open Graph Tags
    this._setMetaTag("property", "og:title", title);
    this._setMetaTag("property", "og:description", metaDescription);
    this._setMetaTag(
      "property",
      "og:url",
      canonicalUrl || window.location.href,
    );
    this._setMetaTag("name", "twitter:title", title);
    this._setMetaTag("name", "twitter:description", metaDescription);
  }

  _setMetaTag(keyAttr, keyVal, contentVal) {
    if (!contentVal) return;
    let el = document.querySelector(`meta[${keyAttr}="${keyVal}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(keyAttr, keyVal);
      document.head.appendChild(el);
    }
    el.content = contentVal;
  }

  // --------------------------------------------------------------------------
  // 5. Smart Search Integration Engine
  // --------------------------------------------------------------------------

  search(query) {
    return this.registry.search(query);
  }

  // --------------------------------------------------------------------------
  // 6. Universal Reusable SaaS Footer Component
  // --------------------------------------------------------------------------

  showToast(message, type = "info", title = null) {
    if (!title) {
      const msg = (message || "").toLowerCase();

      if (msg.includes("random strings copied")) title = "Strings Copied";
      else if (
        msg.includes("random strings generated") ||
        msg.includes("generated random")
      )
        title = "Strings Generated";
      else if (msg.includes("copi") && msg.includes("hex"))
        title = "HEX Copied";
      else if (msg.includes("copi") && msg.includes("css"))
        title = "CSS Copied";
      else if (msg.includes("copi") && msg.includes("text"))
        title = "Text Copied";
      else if (msg.includes("copi")) title = "Copied to Clipboard";
      else if (msg.includes("generat") && msg.includes("qr"))
        title = "QR Code Generated";
      else if (msg.includes("decod") && msg.includes("qr"))
        title = "QR Code Decoded";
      else if (msg.includes("generat") && msg.includes("color"))
        title = "Random Color Generated";
      else if (msg.includes("generat") && msg.includes("palette"))
        title = "Palette Generated";
      else if (msg.includes("generat") && msg.includes("password"))
        title = "Password Generated";
      else if (msg.includes("merg")) title = "PDF Merged";
      else if (msg.includes("add") && msg.includes("pdf")) title = "PDFs Added";
      else if (msg.includes("add") && msg.includes("image"))
        title = "Images Added";
      else if (msg.includes("add") && msg.includes("photo"))
        title = "Photos Added";
      else if (msg.includes("add") && msg.includes("file"))
        title = "Files Added";
      else if (msg.includes("compress") && msg.includes("pdf"))
        title = "PDF Compressed";
      else if (msg.includes("compress") && msg.includes("image"))
        title = "Image Compressed";
      else if (msg.includes("convert") && msg.includes("pdf"))
        title = "PDF Converted";
      else if (msg.includes("convert") && msg.includes("image"))
        title = "Image Converted";
      else if (msg.includes("protect") || msg.includes("encrypt"))
        title = "PDF Protected";
      else if (msg.includes("unlock") || msg.includes("decrypt"))
        title = "PDF Unlocked";
      else if (msg.includes("rotat") && msg.includes("pdf"))
        title = "PDF Rotated";
      else if (msg.includes("rotat") && msg.includes("image"))
        title = "Image Rotated";
      else if (msg.includes("crop")) title = "Image Cropped";
      else if (msg.includes("resiz")) title = "Image Resized";
      else if (msg.includes("download") && msg.includes("start"))
        title = "Download Started";
      else if (msg.includes("download") && msg.includes("complete"))
        title = "Download Complete";
      else if (msg.includes("download")) title = "Download Complete";
      else if (msg.includes("remov") || msg.includes("clear"))
        title = "File Removed";
      else if (msg.includes("sav")) title = "Settings Saved";
      else if (msg.includes("theme")) title = "Theme Changed";
      else if (msg.includes("load") || msg.includes("ready"))
        title = "File Loaded";
      else if (msg.includes("sort")) title = "Text Sorted";
      else if (msg.includes("clean")) title = "Text Cleaned";
      else if (msg.includes("extract")) title = "Files Extracted";
      else if (msg.includes("split")) title = "PDF Split";
      else if (msg.includes("delet")) title = "PDF Deleted";
      else if (type === "success") title = "Success";
      else if (type === "error") title = "Error";
      else if (type === "warning") title = "Warning";
      else title = "Information";
    }

    if (window.ComprexaToast) {
      if (typeof window.ComprexaToast[type] === "function") {
        window.ComprexaToast[type](message, title);
      } else {
        window.ComprexaToast.info(message, title);
      }
    }
  }

  renderUniversalFooter(target) {
    let footerEl = null;
    if (typeof target === "string") {
      footerEl = document.querySelector(target);
    } else if (target && target.nodeType) {
      footerEl = target;
    }

    if (!footerEl) {
      footerEl = document.querySelector(
        "footer.site-footer, footer.footer, footer#footer, footer",
      );
    }

    if (!footerEl) return;

    footerEl.className = "site-footer";
    footerEl.setAttribute("role", "contentinfo");
    footerEl.id = "footer";

    footerEl.innerHTML = `
      <div class="container">
        <div class="site-footer__top">
          <!-- Column 1: Comprexa & Description -->
          <div class="site-footer__brand">
            <a href="/" class="logo" aria-label="Comprexa Home">
              <div class="logo__icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.29 7 12 12 20.71 7"/>
                  <line x1="12" y1="22" x2="12" y2="12"/>
                </svg>
              </div>
              <span class="logo__text">Comprexa</span>
            </a>
            <p class="site-footer__desc">
              Fast, private, and powerful browser-first utilities for document, image, media, and code processing.
            </p>
          </div>

          <!-- Navigation Grid (Columns 2, 3, 4) -->
          <div class="site-footer__nav-grid">
            <!-- Column 2: Product -->
            <div class="footer-col">
              <h4 class="footer-col__title">Product</h4>
              <ul class="footer-col__list">
                <li><a href="/#tools">All Tools</a></li>
                <li><a href="/#categories">Categories</a></li>
                <li><a href="/#tools">Popular Tools</a></li>
              </ul>
            </div>

                        <!-- Column 3: Tool Categories -->
            <div class="footer-col">
              <h4 class="footer-col__title">Tool Categories</h4>
              <ul class="footer-col__list">
                <li><a href="/pdf-tools.html">PDF Tools</a></li>
                <li><a href="/document-tools.html">Document Tools</a></li>
                <li><a href="/image-tools.html">Image Tools</a></li>
                <li><a href="/color-tools.html">Color Tools</a></li>
                <li><a href="/text-tools.html">Text Tools</a></li>
                <li><a href="/qr-tools.html">QR Tools</a></li>
                <li><a href="/developer-tools.html">Developer Tools</a></li>
                <li><a href="/utility-tools.html">Utility Tools</a></li>
              </ul>
            </div>

                        <!-- Column 4: Company -->
            <div class="footer-col">
              <h4 class="footer-col__title">Company</h4>
              <ul class="footer-col__list">
                <li><a href="/about.html">About</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/contact.html">Contact</a></li>
                <li><a href="/privacy.html">Privacy Policy</a></li>
                <li><a href="/terms.html">Terms of Service</a></li>
                <li><a href="/#faq">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="site-footer__bottom">
          <span class="footer-bottom__text">© 2026 Comprexa. All rights reserved.</span>
          <span class="footer-bottom__text footer-bottom__text--center">Every File Tool. One Place.</span>
          <span class="footer-bottom__text footer-bottom__text--right">100% Browser Processing • Privacy First</span>
        </div>
      </div>
    `;
  }
}

// Global Export
window.ComprexaFramework = new ComprexaFramework();

if (typeof window !== "undefined") {
  window.ComprexaUtils = window.ComprexaUtils || {};
  window.ComprexaUtils.sanitizeFilename = function(name, fallback = "download") {
    if (!name || typeof name !== "string") return fallback;
    let sanitized = name
      .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^[\.\-_]+/, "");
    return sanitized.length > 0 ? sanitized : fallback;
  };
  window.ComprexaUtils.isSafeUrl = function(url) {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim().toLowerCase();
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("vbscript:") ||
      trimmed.startsWith("file:")
    ) {
      return false;
    }
    return true;
  };
}
