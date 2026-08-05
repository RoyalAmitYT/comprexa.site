// @ts-nocheck
/**
 * Comprexa Universal Category Landing Page System Engine
 * Dynamic category context resolution, structured SEO injection, search & sorting controls,
 * schema generator, and future-proof category rendering.
 */

class ComprexaCategoryLandingPage {
  constructor() {
    this.registry = window.ComprexaToolsRegistry;
    this.categories = window.ComprexaCategories;
    this.framework = window.ComprexaFramework;
    this.activeCategory = null;
    this.categoryTools = [];
    this.filteredTools = [];
    this.currentSearchQuery = "";
    this.currentSortOption = "popular"; // 'popular' | 'a-z' | 'newest'
  }

  /**
   * Initialize category landing page
   * @param {string} [categoryIdOrSlug] Optional category ID or slug
   */
  init(categoryIdOrSlug) {
    const targetSlug = categoryIdOrSlug || this._getCategorySlugFromURL();
    const category = this._resolveCategory(targetSlug);

    if (!category) {
      return;
    }

    this.activeCategory = category;

    // Fetch tools belonging to this category
    this.categoryTools = this._getCategoryTools(category.id);
    this.filteredTools = [...this.categoryTools];

    // 1. Inject / Update Full SEO Metadata & JSON-LD Schemas
    this.applySEO(category, this.categoryTools);

    // 2. Render Layout Sections
    this.renderBreadcrumbs(category);
    this.renderHero(category, this.categoryTools.length);
    this.renderFeaturedTools(category, this.categoryTools);
    this.renderWorkspace(category);
    this.renderBenefits(category);
    this.renderHowItWorks(category);
    this.renderFAQ(category);
    this.renderRelatedCategories(category);
    this.renderCTA(category);

    // 3. Attach Global Event Listeners (Search, Sort, FAQ Toggles, Scroll CTAs)
    this.bindEvents();
  }

  // --------------------------------------------------------------------------
  // 1. URL & Category Context Resolution
  // --------------------------------------------------------------------------

  _getCategorySlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramCategory =
      urlParams.get("category") ||
      urlParams.get("id") ||
      urlParams.get("slug") ||
      urlParams.get("cat");
    if (paramCategory) return paramCategory;

    // Fallback: Check pathname (e.g. /pdf-tools.html, /image-tools, /qr-tools)
    const pathname = window.location.pathname;
    const filename = pathname
      .substring(pathname.lastIndexOf("/") + 1)
      .replace(".html", "");
    if (
      filename &&
      filename !== "category-template" &&
      filename !== "index" &&
      filename !== ""
    ) {
      return filename;
    }

    return "pdf-tools"; // Default fallback
  }

  _resolveCategory(slugOrId) {
    if (!this.categories) return null;

    // Try exact slug or id match
    let category =
      this.categories.getBySlug(slugOrId) || this.categories.getById(slugOrId);
    if (category) return category;

    // Try stripped suffix match (e.g. 'pdf' from 'pdf-tools')
    const cleanId = slugOrId.replace("-tools", "");
    category =
      this.categories.getById(cleanId) ||
      this.categories.getBySlug(`${cleanId}-tools`);
    if (category) return category;

    // Fallback to first available category
    const all = this.categories.getAll();
    return all && all.length > 0 ? all[0] : null;
  }

  _getCategoryTools(categoryId) {
    if (!this.registry) return [];

    // Exact category match
    let tools = this.registry.getByCategory(categoryId);

    // Fallback search if empty (e.g., matching slug or category name)
    if (!tools || tools.length === 0) {
      const allTools = this.registry.getAll();
      const catLower = categoryId.toLowerCase();
      tools = allTools.filter(
        (t) =>
          t.category.toLowerCase() === catLower ||
          t.category.toLowerCase().includes(catLower) ||
          t.categoryName.toLowerCase().includes(catLower),
      );
    }

    return tools || [];
  }

  // --------------------------------------------------------------------------
  // 2. Dynamic SEO & Schema.org JSON-LD Engine
  // --------------------------------------------------------------------------

  applySEO(category, tools) {
    if (!category) return;

    if (window.ComprexaSeoEngine) {
      const faqs = this._getCategoryFAQs ? this._getCategoryFAQs(category) : [];
      window.ComprexaSeoEngine.applyPageSeo({
        type: "category",
        data: category,
        tools: tools,
        faqs: faqs,
      });
      return;
    }

    const pageTitle =
      category.seoTitle ||
      `Free Online ${category.name} — Free Browser Utilities | Comprexa`;
    const metaDesc =
      category.seoDescription ||
      category.description ||
      `Explore free, privacy-first ${category.name} on Comprexa. 100% browser-based processing with zero limits.`;
    const canonical = `https://comprexa.in/${category.slug || category.id + "-tools"}.html`;
    const keywords = `${category.name}, free ${category.name.toLowerCase()}, online file tools, browser tools, comprexa`;

    // Document Title
    document.title = pageTitle;

    // Standard Meta Tags
    this._setMeta("name", "description", metaDesc);
    this._setMeta("name", "keywords", keywords);
    this._setLink("canonical", canonical);

    // OpenGraph & Twitter Cards
    this._setMeta("property", "og:title", pageTitle);
    this._setMeta("property", "og:description", metaDesc);
    this._setMeta("property", "og:url", canonical);
    this._setMeta("property", "og:type", "website");
    this._setMeta("property", "og:site_name", "Comprexa");

    this._setMeta("name", "twitter:card", "summary_large_image");
    this._setMeta("name", "twitter:title", pageTitle);
    this._setMeta("name", "twitter:description", metaDesc);

    // Inject JSON-LD Schemas
    this.injectJSONLD(category, tools, canonical, pageTitle, metaDesc);
  }

  injectJSONLD(category, tools, canonicalUrl, pageTitle, metaDesc) {
    // Remove old Comprexa category JSON-LD scripts
    const existingScripts = document.querySelectorAll(
      'script[data-comprexa-category-schema="true"]',
    );
    existingScripts.forEach((s) => s.remove());

    // 1. BreadcrumbList Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://comprexa.in/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Categories",
          item: "https://comprexa.in/#categories",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: canonicalUrl,
        },
      ],
    };

    // 2. CollectionPage / ItemList Schema
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.name,
      description: metaDesc,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.title,
          description: tool.shortDescription,
          url:
            tool.seo?.canonicalUrl || `https://comprexa.in/${tool.slug}.html`,
        })),
      },
    };

    // 3. FAQPage Schema (if category FAQs exist)
    const categoryFaqs = this._getCategoryFAQs(category);
    let faqSchema = null;
    if (categoryFaqs && categoryFaqs.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: categoryFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };
    }

    this._appendSchemaScript(breadcrumbSchema);
    this._appendSchemaScript(collectionSchema);
    if (faqSchema) this._appendSchemaScript(faqSchema);
  }

  _appendSchemaScript(schemaObj) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-comprexa-category-schema", "true");
    script.textContent = JSON.stringify(schemaObj, null, 2);
    document.head.appendChild(script);
  }

  _setMeta(attrName, attrValue, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attrName, attrValue);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  _setLink(relValue, href) {
    if (!href) return;
    let link = document.querySelector(`link[rel="${relValue}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", relValue);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }

  // --------------------------------------------------------------------------
  // 3. Section Rendering Modules
  // --------------------------------------------------------------------------

  renderBreadcrumbs(category) {
    const container = document.getElementById("category-breadcrumb");
    if (!container) return;

    container.innerHTML = `
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
            <a href="/#categories" class="breadcrumb__link" itemprop="item">
              <span itemprop="name">Categories</span>
            </a>
            <meta itemprop="position" content="2" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item breadcrumb__item--active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${category.name}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </div>
    `;
  }

  renderHero(category, toolCount) {
    const container = document.getElementById("category-hero");
    if (!container) return;

    const colorClass = category.colorToken || "icon-bg--utility";

    const breadcrumbHTML = `
      <nav class="tool-hero-breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="/" class="breadcrumb__link" itemprop="item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span itemprop="name">Home</span>
            </a>
            <meta itemprop="position" content="1" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="/#categories" class="breadcrumb__link" itemprop="item">
              <span itemprop="name">Categories</span>
            </a>
            <meta itemprop="position" content="2" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item breadcrumb__item--active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${category.name}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>
    `;

    container.innerHTML = `
      <section class="tool-header">
        <div class="container">
          ${breadcrumbHTML}
          <div class="tool-header__inner">
            <div class="tool-header__badge">
              <span class="badge ${category.badgeColor || "badge--primary"} badge--pill">${toolCount} Free Tools</span>
            </div>

            <div class="tool-header__title-wrap">
              <div class="tool-header__icon ${colorClass}" aria-hidden="true">
                ${category.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`}
              </div>
              <h1 class="tool-header__title">${category.name}</h1>
            </div>

            <p class="tool-header__desc">
              ${category.description} 100% free, browser-based processing with high-speed execution and zero cloud uploads.
            </p>

            <div class="tool-header__cta-wrap" style="margin-top: 20px;">
              <button type="button" id="category-scroll-workspace-btn" class="btn btn--primary btn--lg">
                <span>Explore ${category.shortName || category.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </button>
            </div>

            <!-- Trust Badges -->
            <div class="tool-header__trust-badges">
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>Instant Processing</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>100% Client-Side</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>No File Limits</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>No Registration</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderFeaturedTools(category, tools) {
    const container = document.getElementById("category-featured");
    if (!container) return;

    const featured = tools.filter((t) => t.featured || t.popular);
    const displayList =
      featured.length > 0 ? featured.slice(0, 4) : tools.slice(0, 4);

    if (displayList.length === 0) {
      container.style.display = "none";
      return;
    }

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle" style="padding-top: 40px; padding-bottom: 40px;">
        <div class="container">
          <div class="ui-section-header" style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <span class="ui-section-header__badge">Top Picks</span>
                <h2 class="ui-section-header__title" style="font-size: 1.5rem; margin-top: 4px;">Featured ${category.name}</h2>
              </div>
            </div>
          </div>

          <div class="category-tools-grid">
            ${displayList.map((tool) => this._renderToolCard(tool)).join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderWorkspace(category) {
    const container = document.getElementById("category-workspace");
    if (!container) return;

    container.innerHTML = `
      <section class="tool-section" id="tools-catalog-section">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Complete Collection</span>
            <h2 class="ui-section-header__title">All ${category.name}</h2>
            <p class="ui-section-header__subtitle">Search, filter, and open any tool instantly directly in your browser.</p>
          </div>

          <!-- Controls Toolbar: Search & Sorting -->
          <div class="category-toolbar">
            
            <!-- Category Search Input -->
            <div class="category-toolbar__search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="category-toolbar__search-icon">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text" 
                id="category-search-input" 
                class="form-control category-toolbar__input" 
                placeholder="Search tools in ${category.name}..." 
                value="${this.currentSearchQuery}"
                aria-label="Search tools in this category"
              />
              <button type="button" id="category-search-clear-btn" class="category-toolbar__clear" style="display: ${this.currentSearchQuery ? "flex" : "none"};" aria-label="Clear search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Sort Dropdown & Counter -->
            <div class="category-toolbar__controls">
              <span id="category-tool-counter" class="category-toolbar__counter">
                Showing ${this.filteredTools.length} tools
              </span>

              <div class="category-toolbar__sort-wrap">
                <label for="category-sort-select" class="category-toolbar__sort-label">Sort:</label>
                <select id="category-sort-select" class="form-control category-toolbar__sort-select" aria-label="Sort tools">
                  <option value="popular" ${this.currentSortOption === "popular" ? "selected" : ""}>Popular First</option>
                  <option value="a-z" ${this.currentSortOption === "a-z" ? "selected" : ""}>Alphabetical (A-Z)</option>
                  <option value="newest" ${this.currentSortOption === "newest" ? "selected" : ""}>Recently Added</option>
                </select>
              </div>
            </div>

          </div>

          <!-- Tools Grid Container -->
          <div id="category-tools-grid" class="category-tools-grid">
            ${this._renderToolsGridHTML(this.filteredTools)}
          </div>

          <!-- Empty State -->
          <div id="category-empty-state" class="card" style="display: ${this.filteredTools.length === 0 ? "flex" : "none"}; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 24px; margin-top: 24px; gap: 16px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--surface-subtle); color: var(--text-muted); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin: 0;">No tools found</h3>
            <p style="font-size: 0.95rem; color: var(--text-muted); max-width: 420px; margin: 0; line-height: 1.5;">
              We couldn't find any tool in <strong style="color: var(--text-main);">${category.name}</strong> matching "<span id="category-empty-query-text">${this.currentSearchQuery}</span>".
            </p>
            <button type="button" id="category-reset-search-btn" class="btn btn--secondary btn--sm" style="margin-top: 8px;">
              <span>Clear Filter</span>
            </button>
          </div>

        </div>
      </section>
    `;
  }

  _renderToolsGridHTML(tools) {
    if (!tools || tools.length === 0) return "";
    return tools.map((tool) => this._renderToolCard(tool)).join("");
  }

  _renderToolCard(tool) {
    if (this.framework && typeof this.framework.renderCard === "function") {
      return this.framework.renderCard(tool);
    }

    // High quality fallback card renderer matching standard feature-card
    const catObj = this.categories
      ? this.categories.getById(tool.category) || {}
      : {};
    let href = "#";
    if (!tool.comingSoon) {
      if (typeof window.getToolUrl === "function") {
        href = window.getToolUrl(tool);
      } else {
        href = `/${tool.id}.html`;
      }
    }

    const catName = catObj.name || tool.categoryName || tool.category || "Tool";
    const badgeText = tool.comingSoon ? "Coming Soon" : (tool.badge || (tool.popular ? "Popular" : ""));
    const badgeClass = tool.comingSoon ? "badge--subtle" : (tool.badge || tool.popular ? "badge--primary" : "badge--subtle");
    const colorClass = tool.colorClass || catObj.colorToken || "icon-bg--utility";
    const iconSvg = tool.icon || catObj.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2v4a1 1 0 0 0 1 1h4"/></svg>`;
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

  renderBenefits(category) {
    const container = document.getElementById("category-benefits");
    if (!container) return;

    const benefits = this._getCategoryBenefits(category);

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Why Choose Comprexa</span>
            <h2 class="ui-section-header__title">Built for ${category.name} Speed & Privacy</h2>
            <p class="ui-section-header__subtitle">Enterprise security meets zero-latency browser execution.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            ${benefits
              .map(
                (b) => `
              <div class="card" style="padding: 24px; border-top: 3px solid var(--primary); display: flex; flex-direction: column; gap: 12px; height: 100%;">
                <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--primary-subtle); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                  ${b.icon}
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0;">${b.title}</h3>
                <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin: 0;">${b.description}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderHowItWorks(category) {
    const container = document.getElementById("category-how-it-works");
    if (!container) return;

    const steps = [
      {
        step: 1,
        title: `Select a ${category.shortName || category.name} Tool`,
        description: `Choose the exact utility you need from the ${category.name} catalog above.`,
      },
      {
        step: 2,
        title: "Input or Upload Your Data",
        description:
          "Drag and drop your files or paste your content directly into the tool workspace.",
      },
      {
        step: 3,
        title: "Instant Execution & Download",
        description:
          "Process files locally in real-time with zero cloud delays and download your result instantly.",
      },
    ];

    container.innerHTML = `
      <section class="tool-section">
        <div class="container container--narrow">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Simple Workflow</span>
            <h2 class="ui-section-header__title">How to Use ${category.name}</h2>
            <p class="ui-section-header__subtitle">Get your tasks done in three effortless steps.</p>
          </div>

          <div class="seo-steps-grid">
            ${steps
              .map(
                (s) => `
              <div class="seo-step">
                <div class="seo-step__num">${s.step}</div>
                <h3 class="seo-step__title">${s.title}</h3>
                <p class="seo-step__desc">${s.description}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderFAQ(category) {
    const container = document.getElementById("category-faq");
    if (!container) return;

    const faqs = this._getCategoryFAQs(category);

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle">
        <div class="container container--narrow">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Answers & Help</span>
            <h2 class="ui-section-header__title">Frequently Asked Questions</h2>
            <p class="ui-section-header__subtitle">Common questions about using our ${category.name}.</p>
          </div>

          <div class="faq-list">
            ${faqs
              .map(
                (faq, index) => `
              <div class="faq-item">
                <button class="faq-item__question" aria-expanded="false" id="cat-faq-btn-${index}" aria-controls="cat-faq-ans-${index}">
                  <span>${faq.question}</span>
                  <svg class="faq-item__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="faq-item__answer" id="cat-faq-ans-${index}" role="region" aria-labelledby="cat-faq-btn-${index}">
                  <p>${faq.answer}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderRelatedCategories(category) {
    const container = document.getElementById("category-related-categories");
    if (!container) return;

    const allCats = this.categories ? this.categories.getAll() : [];
    const related = allCats.filter((c) => c.id !== category.id);

    if (related.length === 0) {
      container.style.display = "none";
      return;
    }

    container.innerHTML = `
      <section class="tool-section">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">More Categories</span>
            <h2 class="ui-section-header__title">Explore Other Tool Categories</h2>
            <p class="ui-section-header__subtitle">Discover our complete suit of free browser utilities.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
            ${related
              .map((cat) => {
                const catHref =
                  typeof window.getCategoryUrl === "function"
                    ? window.getCategoryUrl(cat)
                    : `/${cat.slug || cat.id + "-tools"}.html`;
                return `
              <a href="${catHref}" class="card" style="padding: 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; transition: transform 0.2s ease, border-color 0.2s ease;">
                <div class="tool-card__icon ${cat.colorToken || "icon-bg--utility"}" style="width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${cat.icon}
                </div>
                <div>
                  <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0;">${cat.name}</h3>
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin: 2px 0 0 0; line-clamp: 1; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${cat.description}</p>
                </div>
              </a>
            `;
              })
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderCTA(category) {
    const container = document.getElementById("category-cta");
    if (!container) return;

    const totalTools = "50+";

    container.innerHTML = `
      <section class="cta-section">
        <div class="container">
          <div class="cta-card">
            <div class="cta-card__content">
              <h2 class="cta-card__title">Need More File Utilities?</h2>
              <p class="cta-card__desc">Explore our universal search or press <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">⌘K</kbd> to launch the command palette anytime.</p>
              <a href="/#tools" class="btn btn--primary btn--lg">
                <span>View All ${totalTools} Tools</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. Content Helpers
  // --------------------------------------------------------------------------

  _getCategoryBenefits(category) {
    return [
      {
        title: "100% Private & Secure",
        description: `Your files and data processed in ${category.name} never leave your computer or browser.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      },
      {
        title: "Zero Latency Speed",
        description:
          "Executed client-side via WebAssembly and modern JS APIs for instantaneous results.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      },
      {
        title: "Free Forever & Unlimited",
        description:
          "Enjoy complete access with zero daily limits, watermarks, or mandatory user accounts.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
      },
      {
        title: "Cross-Platform Compatibility",
        description:
          "Works smoothly on Desktop, Tablet, Chrome, Safari, Firefox, and Mobile devices.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      },
    ];
  }

  _getCategoryFAQs(category) {
    return [
      {
        question: `Are these ${category.name} free to use?`,
        answer: `Yes, all tools in ${category.name} are 100% free with zero file quantity restrictions, watermarks, or subscription fees.`,
      },
      {
        question: `Are my files uploaded to any external server?`,
        answer: `No. Comprexa uses a 100% client-side execution engine. All processing happens locally in your browser memory.`,
      },
      {
        question: `Do I need to create an account or sign in?`,
        answer: `No registration or email is required. Simply open any tool in ${category.name} and get your job done immediately.`,
      },
      {
        question: `Can I use ${category.name} on mobile devices?`,
        answer: `Yes, all ${category.name} are fully responsive and optimized for mobile, tablet, and desktop screens.`,
      },
    ];
  }

  // --------------------------------------------------------------------------
  // 5. Interactive Filtering & Event Binding
  // --------------------------------------------------------------------------

  bindEvents() {
    // Scroll CTA Listener
    const scrollBtn = document.getElementById("category-scroll-workspace-btn");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        const target =
          document.getElementById("tools-catalog-section") ||
          document.getElementById("category-workspace");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // Live Search Input Listener
    const searchInput = document.getElementById("category-search-input");
    const searchClearBtn = document.getElementById("category-search-clear-btn");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentSearchQuery = e.target.value.trim();
        if (searchClearBtn) {
          searchClearBtn.style.display = this.currentSearchQuery
            ? "block"
            : "none";
        }
        this.applyFilterAndSort();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          this.currentSearchQuery = "";
          searchClearBtn.style.display = "none";
          this.applyFilterAndSort();
        }
      });
    }

    // Reset Search Button in Empty State
    const resetBtn = document.getElementById("category-reset-search-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          this.currentSearchQuery = "";
          if (searchClearBtn) searchClearBtn.style.display = "none";
          this.applyFilterAndSort();
        }
      });
    }

    // Sort Dropdown Selector Listener
    const sortSelect = document.getElementById("category-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSortOption = e.target.value;
        this.applyFilterAndSort();
      });
    }

    // Accordion FAQ Click Listeners
    const faqQuestions = document.querySelectorAll(".faq-item__question");
    faqQuestions.forEach((q) => {
      if (q.dataset.comprexaCatBound === "true") return;
      q.dataset.comprexaCatBound = "true";

      q.addEventListener("click", () => {
        const isExpanded = q.getAttribute("aria-expanded") === "true";
        q.setAttribute("aria-expanded", !isExpanded);
        const faqItem = q.closest(".faq-item");
        if (faqItem) {
          faqItem.classList.toggle("active", !isExpanded);
        }
      });
    });
  }


  applyFilterAndSort() {
    let result = [...this.allTools];

    // 1. Apply Search Filter
    if (this.currentSearchQuery) {
      const q = this.currentSearchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // 2. Apply Sort
    if (this.currentSortOption === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.currentSortOption === "newest") {
      result.reverse();
    } else {
      // Popular first
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    this.filteredTools = result;

    // 3. Update DOM Grid & Counters
    const grid = document.getElementById("category-tools-grid");
    const counter = document.getElementById("category-tool-counter");
    const emptyState = document.getElementById("category-empty-state");
    const emptyQueryText = document.getElementById("category-empty-query-text");

    if (grid) {
      grid.innerHTML = this._renderToolsGridHTML(result);
    }

    if (counter) {
      counter.textContent = `Showing ${result.length} tools`;
    }

    if (emptyState) {
      emptyState.style.display = result.length === 0 ? "flex" : "none";
      if (emptyQueryText) emptyQueryText.textContent = this.currentSearchQuery;
    }
  }
}

// Global Export
window.ComprexaCategoryLandingPage = new ComprexaCategoryLandingPage();

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.ComprexaCategoryLandingPage) {
    window.ComprexaCategoryLandingPage.init();
  }
});
