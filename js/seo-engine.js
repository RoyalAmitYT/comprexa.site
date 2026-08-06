// @ts-nocheck
/**
 * Comprexa Universal SEO & Structured Data Engine
 * Enterprise-grade SEO automation for Comprexa tool ecosystem.
 * Automatically handles metadata generation, OpenGraph, Twitter Cards,
 * Schema.org JSON-LD injection, XML Sitemaps, Robots.txt, and SEO Audits.
 */

class ComprexaSeoEngine {
  constructor() {
    this.siteName = "Comprexa";
    this.baseUrl = "https://comprexa.in";
    this.defaultOgImage = "https://comprexa.in/assets/og-image.png";
    this.defaultTwitterCard = "summary_large_image";
    this.defaultThemeColor = "#4f46e5";
    this.defaultRobots =
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    this.registry =
      typeof window !== "undefined" ? window.ComprexaToolsRegistry : null;
    this.categories =
      typeof window !== "undefined" ? window.ComprexaCategories : null;
  }

  // --------------------------------------------------------------------------
  // 1. Structured Data (JSON-LD) Generators
  // --------------------------------------------------------------------------

  getOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${this.baseUrl}/#organization`,
      name: this.siteName,
      url: this.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${this.baseUrl}/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      description:
        "Comprexa is a privacy-first collection of free, client-side online developer, PDF, image, and utility tools.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${this.baseUrl}/contact.html`,
      },
    };
  }

  getWebsiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${this.baseUrl}/#website`,
      url: this.baseUrl,
      name: this.siteName,
      description:
        "Free Online Tools for PDF, Images, Code, QR Codes, and Text Processing.",
      inLanguage: "en-US",
      publisher: {
        "@id": `${this.baseUrl}/#organization`,
      },
    };
  }

  getWebPageSchema(title, description, canonicalUrl) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description: description,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${this.baseUrl}/#website`,
        name: this.siteName,
        url: this.baseUrl,
      },
      inLanguage: "en-US",
    };
  }

  getBreadcrumbSchema(items, canonicalUrl) {
    if (!Array.isArray(items) || items.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl || this.baseUrl}#breadcrumb`,
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: item.url
          ? item.url.startsWith("http")
            ? item.url
            : `${this.baseUrl}${item.url.startsWith("/") ? "" : "/"}${item.url}`
          : undefined,
      })),
    };
  }

  getCollectionPageSchema(category, tools, canonicalUrl) {
    const catName = category ? category.name : "Tools";
    const catDesc = category
      ? category.description
      : "Browse free online tools on Comprexa.";

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collectionpage`,
      url: canonicalUrl,
      name: `${catName} — Free Online Tools`,
      description: catDesc,
      isPartOf: {
        "@id": `${this.baseUrl}/#website`,
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: tools ? tools.length : 0,
        itemListElement: (tools || []).map((t, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: t.title || t.name,
          description: t.shortDescription || t.description,
          url: `${this.baseUrl}/${t.slug || t.id}.html`,
        })),
      },
    };
  }

  getSoftwareApplicationSchema(tool, canonicalUrl) {
    if (!tool) return null;

    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#webapp`,
      name: tool.title || tool.name,
      url: canonicalUrl,
      description:
        tool.shortDescription ||
        tool.longDescription ||
        `Free online ${tool.title} tool.`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires HTML5, JavaScript enabled web browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        "@id": `${this.baseUrl}/#organization`,
        name: this.siteName,
        url: this.baseUrl,
      },
      featureList: Array.isArray(tool.keywords)
        ? tool.keywords.join(", ")
        : tool.shortDescription || "Browser execution",
    };
  }

  getFAQPageSchema(faqs) {
    if (!Array.isArray(faqs) || faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    };
  }

  // --------------------------------------------------------------------------
  // 2. Dynamic Page SEO Applicator
  // --------------------------------------------------------------------------

  /**
   * Universal SEO applicability function
   * @param {Object} options
   * @param {'home'|'tool'|'category'|'static'|'custom'} [options.type='custom']
   * @param {Object} [options.data] - Tool, category, or static page context object
   * @param {string} [options.title]
   * @param {string} [options.metaDescription]
   * @param {string} [options.keywords]
   * @param {string} [options.canonicalUrl]
   * @param {string} [options.ogImage]
   * @param {string} [options.robots]
   * @param {string} [options.themeColor]
   * @param {Array<{name: string, url: string}>} [options.breadcrumbs]
   * @param {Array<{question: string, answer: string}>} [options.faqs]
   * @param {Array<{lang: string, href: string}>} [options.hreflangs]
   */
  applyPageSeo(options = {}) {
    if (typeof document === "undefined") return;

    this.registry = this.registry || window.ComprexaToolsRegistry;
    this.categories = this.categories || window.ComprexaCategories;

    const pageType = options.type || this._detectPageType();
    let meta = this._resolveMetadataForType(pageType, options);

    // Apply Document Title
    if (meta.title) {
      document.title = meta.title;
    }

    // Standard Metas & Canonical
    this._setMeta("name", "description", meta.metaDescription);
    this._setMeta("name", "keywords", meta.keywords);
    this._setMeta("name", "robots", meta.robots || this.defaultRobots);
    this._setMeta(
      "name",
      "theme-color",
      meta.themeColor || this.defaultThemeColor,
    );
    this._setLink("canonical", meta.canonicalUrl);

    // Open Graph Tags
    this._setMeta("property", "og:title", meta.title);
    this._setMeta("property", "og:description", meta.metaDescription);
    this._setMeta("property", "og:url", meta.canonicalUrl);
    this._setMeta("property", "og:type", meta.ogType || "website");
    this._setMeta("property", "og:site_name", this.siteName);
    this._setMeta("property", "og:image", meta.ogImage || this.defaultOgImage);
    this._setMeta("property", "og:locale", "en_US");

    // Twitter Card Tags
    this._setMeta(
      "name",
      "twitter:card",
      meta.twitterCard || this.defaultTwitterCard,
    );
    this._setMeta("name", "twitter:title", meta.title);
    this._setMeta("name", "twitter:description", meta.metaDescription);
    this._setMeta("name", "twitter:image", meta.ogImage || this.defaultOgImage);
    this._setMeta("name", "twitter:site", "@comprexa");

    // Multilingual Hreflang Tags (Preparation)
    this._applyHreflangs(meta.hreflangs, meta.canonicalUrl);

    // JSON-LD Schemas Generation & Injection
    const schemas = this._generateSchemasForPage(pageType, meta, options);
    this._injectSchemas(schemas);
  }

  _detectPageType() {
    if (typeof window === "undefined") return "custom";
    const path = window.location.pathname;

    if (path === "/" || path === "/index.html") return "home";

    const catSlugMatches = [
      "pdf-tools",
      "image-tools",
      "text-tools",
      "developer-tools",
      "qr-tools",
      "color-tools",
      "quality-tools",
      "ai-tools",
      "audio-tools",
      "video-tools",
      "ocr-tools",
    ];
    if (
      catSlugMatches.some((s) => path.includes(s)) ||
      window.location.search.includes("category=")
    ) {
      return "category";
    }

    if (
      path.includes("tool-template") ||
      window.location.search.includes("tool=") ||
      path.endsWith(".html")
    ) {
      return "tool";
    }

    return "static";
  }

  _resolveMetadataForType(type, options) {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href.split("?")[0].split("#")[0]
        : `${this.baseUrl}/`;

    let resolved = {
      title: options.title,
      metaDescription: options.metaDescription,
      keywords: options.keywords,
      canonicalUrl: options.canonicalUrl || currentUrl,
      ogImage: options.ogImage || this.defaultOgImage,
      ogType: "website",
      twitterCard: this.defaultTwitterCard,
      robots: options.robots || this.defaultRobots,
      themeColor: options.themeColor || this.defaultThemeColor,
      breadcrumbs: options.breadcrumbs || [],
      faqs: options.faqs || [],
      hreflangs: options.hreflangs || [],
    };

    if (type === "home") {
      resolved.title =
        options.title ||
        "Comprexa — Free Online Browser Utilities & File Tools";
      resolved.metaDescription =
        options.metaDescription ||
        "Comprexa is a privacy-first suite of free browser utilities for PDF, Images, Text, QR Codes, and Code formatting. 100% client-side with zero file limits.";
      resolved.keywords =
        options.keywords ||
        "free online tools, pdf tools, image compressor, qr generator, json formatter, browser tools, comprexa";
      resolved.canonicalUrl = options.canonicalUrl || `${this.baseUrl}/`;
      resolved.breadcrumbs = [{ name: "Home", url: "/" }];
    } else if (type === "category" && options.data) {
      const cat = options.data;
      resolved.title =
        options.title ||
        `${cat.name || "Category"} — Free Online Tools | Comprexa`;
      resolved.metaDescription =
        options.metaDescription ||
        cat.description ||
        `Browse free ${cat.name} online. 100% browser-based with zero file limits.`;
      resolved.keywords =
        options.keywords ||
        `${cat.name}, free online ${cat.name}, comprexa tools`;
      resolved.canonicalUrl =
        options.canonicalUrl ||
        `${this.baseUrl}/${cat.slug || cat.id + "-tools"}.html`;
      resolved.breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Categories", url: "/#categories" },
        {
          name: cat.name || "Category",
          url: `/${cat.slug || cat.id + "-tools"}.html`,
        },
      ];
    } else if (type === "tool" && options.data) {
      const tool = options.data;
      const catName = tool.categoryName || "Tools";
      const catSlug = tool.category ? `${tool.category}-tools` : "tools";

      resolved.title =
        options.title ||
        tool.seo?.title ||
        `${tool.title || tool.name} — Free Online Tool | Comprexa`;
      resolved.metaDescription =
        options.metaDescription ||
        tool.seo?.metaDescription ||
        tool.shortDescription ||
        `Free online ${tool.title} tool. 100% browser-based, client-side, zero limits.`;
      resolved.keywords =
        options.keywords ||
        tool.seo?.keywords ||
        (tool.keywords
          ? tool.keywords.join(", ")
          : `${tool.title}, free tool, comprexa`);
      resolved.canonicalUrl =
        options.canonicalUrl ||
        tool.seo?.canonicalUrl ||
        `${this.baseUrl}/${tool.slug || tool.id}.html`;
      resolved.ogType = "article";
      resolved.breadcrumbs = [
        { name: "Home", url: "/" },
        { name: catName, url: `/${catSlug}.html` },
        { name: tool.title || tool.name, url: `/${tool.slug || tool.id}.html` },
      ];
    }

    return resolved;
  }

  _generateSchemasForPage(pageType, meta, options) {
    const schemas = [];
    if (pageType === "home") {
      schemas.push(this.getOrganizationSchema(), this.getWebsiteSchema());
    }

    // WebPage schema
    schemas.push(
      this.getWebPageSchema(
        meta.title,
        meta.metaDescription,
        meta.canonicalUrl,
      ),
    );

    // Breadcrumbs Schema
    if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
      const breadcrumbSchema = this.getBreadcrumbSchema(
        meta.breadcrumbs,
        meta.canonicalUrl,
      );
      if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    }

    // Page-specific Schemas
    if (pageType === "category" && options.data) {
      const tools =
        options.tools ||
        (this.registry ? this.registry.getByCategory(options.data.id) : []);
      schemas.push(
        this.getCollectionPageSchema(options.data, tools, meta.canonicalUrl),
      );
    } else if (pageType === "tool" && options.data) {
      const appSchema = this.getSoftwareApplicationSchema(
        options.data,
        meta.canonicalUrl,
      );
      if (appSchema) schemas.push(appSchema);
    }

    // FAQ Schema
    if (meta.faqs && meta.faqs.length > 0) {
      const faqSchema = this.getFAQPageSchema(meta.faqs);
      if (faqSchema) schemas.push(faqSchema);
    }

    return schemas;
  }

  _injectSchemas(schemasArray) {
    if (!Array.isArray(schemasArray) || typeof document === "undefined") return;

    // Purge previous injection scripts
    const oldScripts = document.querySelectorAll(
      'script[data-comprexa-universal-seo="true"]',
    );
    oldScripts.forEach((s) => s.remove());

    schemasArray.forEach((schema) => {
      if (!schema) return;
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-comprexa-universal-seo", "true");
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });
  }

  _setMeta(attrKey, attrVal, content) {
    if (!content || typeof document === "undefined") return;
    let el = document.querySelector(`meta[${attrKey}="${attrVal}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attrKey, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  _setLink(relVal, href) {
    if (!href || typeof document === "undefined") return;
    let el = document.querySelector(`link[rel="${relVal}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", relVal);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  _applyHreflangs(hreflangs, canonicalUrl) {
    if (typeof document === "undefined") return;

    // Remove old alternate links
    const oldLangs = document.querySelectorAll(
      'link[rel="alternate"][hreflang]',
    );
    oldLangs.forEach((l) => l.remove());

    const list =
      Array.isArray(hreflangs) && hreflangs.length > 0
        ? hreflangs
        : [
            { lang: "en", href: canonicalUrl },
            { lang: "x-default", href: canonicalUrl },
          ];

    list.forEach((item) => {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", item.lang);
      link.setAttribute("href", item.href);
      document.head.appendChild(link);
    });
  }

  // --------------------------------------------------------------------------
  // 3. XML Sitemap Generator
  // --------------------------------------------------------------------------

  /**
   * Generates production XML Sitemap string
   * @returns {string} XML Sitemap
   */
  generateXmlSitemap() {
    this.registry = this.registry || window.ComprexaToolsRegistry;
    this.categories = this.categories || window.ComprexaCategories;

    const lastMod = new Date().toISOString().split("T")[0];

    const urls = [
      { loc: `${this.baseUrl}/`, changefreq: "daily", priority: "1.0" },
    ];

    // Add Categories
    if (this.categories) {
      const allCats = this.categories.getAll();
      allCats.forEach((cat) => {
        urls.push({
          loc: `${this.baseUrl}/${cat.slug || cat.id + "-tools"}.html`,
          changefreq: "weekly",
          priority: "0.9",
        });
      });
    }

    // Add Tools
    if (this.registry) {
      const allTools = this.registry.getAll();
      allTools.forEach((tool) => {
        urls.push({
          loc: `${this.baseUrl}/${tool.slug || tool.id}.html`,
          changefreq: "weekly",
          priority: "0.8",
        });
      });
    }

    // Add Static Pages
    const staticPages = [
      "privacy.html",
      "terms.html",
      "about.html",
      "contact.html",
    ];
    staticPages.forEach((p) => {
      urls.push({
        loc: `${this.baseUrl}/${p}`,
        changefreq: "monthly",
        priority: "0.5",
      });
    });

    const xmlItems = urls
      .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
  }

  // --------------------------------------------------------------------------
  // 4. Robots.txt Generator
  // --------------------------------------------------------------------------

  /**
   * Generates Robots.txt configuration content string
   * @returns {string} robots.txt content
   */
  generateRobotsTxt() {
    return `# Comprexa Universal Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*?*

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
`;
  }

  // --------------------------------------------------------------------------
  // 5. SEO Audit & Validation Engine
  // --------------------------------------------------------------------------

  /**
   * Audits current page DOM for SEO completeness and compliance
   * @returns {Object} SEO Report
   */
  validatePageSeo() {
    if (typeof document === "undefined") return { error: "DOM not available" };

    const errors = [];
    const warnings = [];
    const passed = [];

    // 1. Document Title Check
    const title = document.title;
    if (!title || title.trim() === "") {
      errors.push("Missing document <title>");
    } else if (title.length < 15) {
      warnings.push(
        `Document title is very short (${title.length} chars). Recommend 30-60 chars.`,
      );
    } else if (title.length > 70) {
      warnings.push(
        `Document title is long (${title.length} chars). May be truncated in SERPs.`,
      );
    } else {
      passed.push(`Title OK (${title.length} chars): "${title}"`);
    }

    // 2. Meta Description Check
    const metaDesc = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    if (!metaDesc || metaDesc.trim() === "") {
      errors.push('Missing <meta name="description">');
    } else if (metaDesc.length < 50) {
      warnings.push(
        `Meta description is short (${metaDesc.length} chars). Recommend 120-160 chars.`,
      );
    } else if (metaDesc.length > 165) {
      warnings.push(
        `Meta description is long (${metaDesc.length} chars). Recommend capping under 160 chars.`,
      );
    } else {
      passed.push(`Meta Description OK (${metaDesc.length} chars)`);
    }

    // 3. Canonical Link Check
    const canonical = document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href");
    if (!canonical) {
      errors.push('Missing <link rel="canonical"> tag');
    } else {
      passed.push(`Canonical URL OK: ${canonical}`);
    }

    // 4. OpenGraph Tags Check
    const ogTitle = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content");
    const ogDesc = document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content");
    const ogImage = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content");

    if (!ogTitle || !ogDesc || !ogImage) {
      warnings.push(
        "Incomplete OpenGraph metadata (missing og:title, og:description, or og:image)",
      );
    } else {
      passed.push("OpenGraph metadata present");
    }

    // 5. Twitter Card Check
    const twitterCard = document
      .querySelector('meta[name="twitter:card"]')
      ?.getAttribute("content");
    if (!twitterCard) {
      warnings.push('Missing <meta name="twitter:card">');
    } else {
      passed.push("Twitter Card present");
    }

    // 6. JSON-LD Structured Data Check
    const jsonLdScripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    if (jsonLdScripts.length === 0) {
      errors.push("No JSON-LD structured data schemas found");
    } else {
      passed.push(
        `JSON-LD present (${jsonLdScripts.length} schema blocks found)`,
      );
    }

    // 7. Robots Meta Check
    const robots = document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content");
    if (!robots) {
      warnings.push('Missing <meta name="robots">');
    } else {
      passed.push(`Robots Meta OK: ${robots}`);
    }

    // Calculate Score
    const totalChecks = errors.length + warnings.length + passed.length;
    const score = Math.max(
      0,
      Math.round(
        ((passed.length + warnings.length * 0.5) / (totalChecks || 1)) * 100,
      ),
    );

    return {
      score,
      healthy: errors.length === 0,
      errors,
      warnings,
      passed,
      summary: `${score}/100 SEO Health Score — ${errors.length} errors, ${warnings.length} warnings.`,
    };
  }
}

// Global Export Singleton
if (typeof window !== "undefined") {
  window.ComprexaSeoEngine = new ComprexaSeoEngine();

  // Auto initialize page SEO when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    if (window.ComprexaSeoEngine) {
      // Allow a tiny microtask delay so page controllers (like tool-landing or category-landing) can pass exact data first
      setTimeout(() => {
        const hasExistingCustomTitle =
          document.title && !document.title.includes("Untitled");
        if (
          !hasExistingCustomTitle ||
          !document.querySelector('script[data-comprexa-universal-seo="true"]')
        ) {
          window.ComprexaSeoEngine.applyPageSeo();
        }
      }, 50);
    }
  });
}
