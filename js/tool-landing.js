// @ts-nocheck
/**
 * Comprexa Universal Tool Landing Page System Engine
 * Dynamic section rendering, structured SEO injection, FAQ accordion controller, and schema generator.
 * Designed to power 500+ tools seamlessly while reusing shared layouts.
 */

export class ComprexaToolLandingPage {
  constructor() {
    this.registry = window.ComprexaToolsRegistry;
    this.categories = window.ComprexaCategories;
    this.framework = window.ComprexaFramework;
    this.contentRepo = window.ComprexaToolContent;
    this.activeTool = null;
  }

  /**
   * Initialize the landing page for a specific tool ID or slug
   * @param {string} [toolIdOrSlug] - ID or Slug of tool. If omitted, parses from URL parameters.
   */
  init(toolIdOrSlug) {
    const targetSlug = toolIdOrSlug || this._getToolSlugFromURL();
    const tool = this._resolveTool(targetSlug);

    if (!tool) {
      return;
    }

    this.activeTool = tool;

    // 1. Inject / Update Full SEO Metadata & JSON-LD Schemas
    this.applySEO(tool);

    // 2. Render Layout Sections
    this.renderBreadcrumbs(tool);
    this.renderHero(tool);
    this.renderFeatures(tool);
    this.renderHowItWorks(tool);
    this.renderBenefits(tool);
    this.renderSupportedFormats(tool);
    this.renderUseCases(tool);
    this.renderFAQ(tool);
    this.renderRelatedTools(tool);
    this.renderPopularTools(tool);
    this.renderCTA(tool);
    this.renderFooter(tool);

    // 3. Mount Tool Component / Workspace if present
    this.mountWorkspace(tool);

    // 4. Attach Global Event Listeners (FAQ Toggles, CTAs)
    this.bindEvents();
  }

  // --------------------------------------------------------------------------
  // 1. URL & Tool Context Resolution
  // --------------------------------------------------------------------------

  _getToolSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTool =
      urlParams.get("tool") || urlParams.get("id") || urlParams.get("slug");
    if (paramTool) return paramTool;

    // Fallback: Check pathname (e.g. /json-formatter.html or /color-picker)
    const pathname = window.location.pathname;
    const filename = pathname
      .substring(pathname.lastIndexOf("/") + 1)
      .replace(".html", "");
    if (
      filename &&
      filename !== "tool-template" &&
      filename !== "index" &&
      filename !== ""
    ) {
      return filename;
    }

    return "merge-pdf"; // Default fallback
  }

  _resolveTool(slugOrId) {
    if (!this.registry) return null;
    return (
      this.registry.getById(slugOrId) ||
      this.registry.getBySlug(slugOrId) ||
      this.registry.getAll()[0]
    );
  }

  // --------------------------------------------------------------------------
  // 2. SEO & Schema.org JSON-LD Engine
  // --------------------------------------------------------------------------

  applySEO(tool) {
    if (!tool) return;

    if (window.ComprexaSeoEngine) {
      const faqs = this._getToolFAQs ? this._getToolFAQs(tool) : [];
      window.ComprexaSeoEngine.applyPageSeo({
        type: "tool",
        data: tool,
        faqs: faqs,
      });
      return;
    }

    const seo = tool.seo || {};
    const pageTitle =
      seo.title || `${tool.title} — Free Online Tool | Comprexa`;
    const metaDesc =
      seo.metaDescription ||
      tool.shortDescription ||
      `Use ${tool.title} online for free. Fast, secure, browser-based file tool with zero limits.`;
    const canonical =
      seo.canonicalUrl || `https://comprexa.in/${tool.slug}.html`;
    const keywords =
      seo.keywords ||
      (tool.keywords
        ? tool.keywords.join(", ")
        : `${tool.title}, free tool, comprexa`);

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
    this.injectJSONLD(tool, canonical, pageTitle, metaDesc);
  }

  injectJSONLD(tool, canonicalUrl, pageTitle, metaDesc) {
    const category = this.categories
      ? this.categories.getById(tool.category)
      : { name: "Tools" };
    const content = this.contentRepo
      ? this.contentRepo.getContentForTool(tool)
      : {};

    // Remove old Comprexa JSON-LD scripts
    const existingScripts = document.querySelectorAll(
      'script[data-comprexa-schema="true"]',
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
          name: category.name || "Tools",
          item: "https://comprexa.in/#tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.title,
          item: canonicalUrl,
        },
      ],
    };

    // 2. WebApplication / SoftwareApplication Schema
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#webapp`,
      name: tool.title,
      description: metaDesc,
      url: canonicalUrl,
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
        "@id": "https://comprexa.in/#organization",
        name: "Comprexa",
        url: "https://comprexa.in",
      },
    };

    // 3. FAQPage Schema (if FAQs exist)
    let faqSchema = null;
    if (content.faqs && content.faqs.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faqpage`,
        mainEntity: content.faqs.map((item) => ({
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
    this._appendSchemaScript(appSchema);
    if (faqSchema) this._appendSchemaScript(faqSchema);
  }

  _appendSchemaScript(schemaObj) {
    if (!schemaObj) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-comprexa-schema", "true");
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

  renderBreadcrumbs(tool) {
    const container =
      document.getElementById("landing-breadcrumb") ||
      document.getElementById("breadcrumb-nav-root");
    if (!container) return;

    if (
      this.framework &&
      typeof this.framework.renderBreadcrumbs === "function"
    ) {
      this.framework.renderBreadcrumbs(tool.id, container);
    } else {
      const categoryObj = this.categories
        ? this.categories.getById(tool.category)
        : { name: "Tools" };
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
              <a href="/#tools" class="breadcrumb__link" itemprop="item">
                <span itemprop="name">${categoryObj ? categoryObj.name : "Tools"}</span>
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
    }
  }

  renderHero(tool) {
    const container = document.getElementById("landing-hero");
    if (!container) return;

    const categoryObj = this.categories
      ? this.categories.getById(tool.category) || {}
      : {};
    const badgeText = tool.badge || categoryObj.name || "Utility Tool";
    const colorClass = tool.colorClass || "icon-bg--pdf";

    const categoryUrl = window.getCategoryUrl
      ? window.getCategoryUrl(categoryObj)
      : `/#tools`;

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
            <a href="${categoryUrl}" class="breadcrumb__link" itemprop="item">
              <span itemprop="name">${categoryObj.name || "Tools"}</span>
            </a>
            <meta itemprop="position" content="2" />
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item breadcrumb__item--active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${tool.title}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>
    `;

    container.innerHTML = `
      <section class="tool-header tool-header--hero">
        <div class="tool-header__ambient-glow" aria-hidden="true"></div>
        <div class="container">
          ${breadcrumbHTML}
          <div class="tool-header__inner">
            
            <!-- Top Pills / Badges -->
            <div class="tool-header__top-bar">
              <span class="tool-header__pill tool-header__pill--primary">
                <span class="tool-header__live-dot"></span>
                ${badgeText}
              </span>
              <span class="tool-header__pill tool-header__pill--subtle">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                100% Client-Side Engine
              </span>
            </div>

            <!-- Icon & Main Title -->
            <div class="tool-header__title-wrap">
              <div class="tool-header__icon ${colorClass}" aria-hidden="true">
                ${tool.icon || categoryObj.icon || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`}
              </div>
              <h1 class="tool-header__title">${tool.title}</h1>
            </div>

            <!-- Hero Subtitle / Description -->
            <p class="tool-header__desc">
              ${tool.shortDescription} High-speed, browser-first execution powered by WebAssembly with zero server uploads and end-to-end privacy.
            </p>

            <!-- Tool Statistics Grid -->
            <div class="tool-header__stats">
              <div class="tool-stat-card">
                <span class="tool-stat-card__val">⚡ &lt;100ms</span>
                <span class="tool-stat-card__label">Processing Speed</span>
              </div>
              <div class="tool-stat-card">
                <span class="tool-stat-card__val">🔒 0 Bytes</span>
                <span class="tool-stat-card__label">Server Uploads</span>
              </div>
              <div class="tool-stat-card">
                <span class="tool-stat-card__val">♾️ Unlimited</span>
                <span class="tool-stat-card__label">Batch Operations</span>
              </div>
              <div class="tool-stat-card">
                <span class="tool-stat-card__val">✨ Free</span>
                <span class="tool-stat-card__label">No Account Needed</span>
              </div>
            </div>

            <!-- CTA Action Button -->
            <div class="tool-header__cta-wrap">
              <button type="button" id="hero-scroll-workspace-btn" class="btn btn--primary btn--hero-cta">
                <span>Start Processing Files</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </button>
            </div>

            <!-- Trust Badges -->
            <div class="tool-header__trust-badges">
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Zero Server Uploads</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>WebAssembly Isolated</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>Instant Download</span>
              </div>
              <div class="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>No Login Required</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    `;
  }

  mountWorkspace(tool) {
    // If the tool workspace container exists, ensure smooth scrolling works when CTA is clicked
    const scrollBtn = document.getElementById("hero-scroll-workspace-btn");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        const workspaceTarget =
          document.getElementById("landing-workspace") ||
          document.querySelector(".tool-workspace");
        if (workspaceTarget) {
          workspaceTarget.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    }

    // Configure workspace action CTA button
    const actionBtn = document.getElementById("workspace-action-btn");
    const actionSub = document.getElementById("workspace-cta-sub");
    if (actionBtn) {
      const toolActionLabel = tool.title ? tool.title : "Process Files";
      const btnSpan = actionBtn.querySelector("span");
      if (btnSpan) {
        btnSpan.textContent = toolActionLabel;
      }

      // Delegate click to tool-specific trigger buttons if present
      actionBtn.addEventListener("click", () => {
        const triggers = [
          "#btn-trigger-compress-now",
          "#btn-start-compress",
          "#btn-start-merge",
          "#btn-start-split",
          "#btn-start-organize",
          "#btn-start-protect",
          "#btn-start-unlock",
          "#btn-start-delete",
          "#btn-start-extract",
          "#btn-start-watermark",
          "#btn-start-pdf-to-images",
          "#btn-format",
          "#btn-minify-output",
          "#btn-generate-qr",
          "#generate-qr-btn",
          "#btn-process",
        ];
        let triggered = false;
        for (const selector of triggers) {
          const btn = document.querySelector(selector);
          if (btn && btn !== actionBtn && !btn.disabled) {
            btn.click();
            triggered = true;
            break;
          }
        }
        if (!triggered) {
          document.dispatchEvent(
            new CustomEvent("comprexa:process-files", { detail: { tool } }),
          );
        }
      });
    }

    // Bind file selection updates to update the sidebar file list & count
    const selectedFilesMap = new Map();
    const filesContainer = document.getElementById("workspace-files-container");
    const fileCountEl = document.getElementById("workspace-file-count");

    const updateFilesUI = () => {
      if (!filesContainer) return;
      const filesArr = Array.from(selectedFilesMap.values());
      const count = filesArr.length;

      if (fileCountEl) {
        fileCountEl.textContent = `${count} ${count === 1 ? "file" : "files"}`;
      }

      if (actionBtn) {
        if (count > 0) {
          actionBtn.disabled = false;
          if (actionSub)
            actionSub.textContent = "Ready to execute tool workflow";
        } else {
          // If no files, check if there's a text input or textarea present
          const hasInput =
            document.querySelector('textarea, input[type="text"]') !== null;
          if (!hasInput) {
            actionBtn.disabled = true;
            if (actionSub)
              actionSub.textContent =
                "Action button will activate when files are added";
          }
        }
      }

      if (count === 0) {
        filesContainer.innerHTML = `
          <div class="file-list-empty-state">
            <div class="file-list-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="file-list-empty-title">No files added yet</div>
            <div class="file-list-empty-sub">Add files to get started</div>
          </div>
        `;
        return;
      }

      filesContainer.innerHTML = filesArr
        .map((file, idx) => {
          const sizeFormatted = file.size
            ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
            : "";
          return `
          <div class="sidebar-file-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary); flex-shrink: 0;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div style="overflow: hidden;">
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${file.name}</div>
                ${sizeFormatted ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${sizeFormatted}</div>` : ""}
              </div>
            </div>
            <button type="button" class="btn-remove-sidebar-file" data-file-index="${idx}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;" title="Remove file">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;
        })
        .join("");
    };

    document.addEventListener("comprexa:file-selected", (e) => {
      if (e.detail && e.detail.file) {
        selectedFilesMap.set(e.detail.file.name, e.detail.file);
        updateFilesUI();
      }
    });

    document.addEventListener("comprexa:file-removed", (e) => {
      if (e.detail && e.detail.file) {
        selectedFilesMap.delete(e.detail.file.name);
      } else {
        selectedFilesMap.clear();
      }
      updateFilesUI();
    });
  }

  renderFeatures(tool) {
    const container = document.getElementById("landing-features");
    if (!container) return;

    const content = this.contentRepo
      ? this.contentRepo.getContentForTool(tool)
      : {};
    const features = content.features || [
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        title: "Instant Local Processing",
        description:
          "Processes documents inside your browser thread using WebAssembly for sub-second execution speed.",
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        title: "Zero Server Uploads",
        description:
          "Your sensitive files never travel over the network or get saved on remote cloud servers.",
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        title: "Lossless Output Quality",
        description:
          "Advanced compression and conversion algorithms preserve pristine visual clarity and markup.",
      },
    ];

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Key Capabilities</span>
            <h2 class="ui-section-header__title">Built for Speed, Privacy & Precision</h2>
            <p class="ui-section-header__subtitle">Discover why developers, teams, and professionals rely on Comprexa daily.</p>
          </div>

          <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            ${features
              .map(
                (f) => `
              <div class="card feature-card" style="padding: 24px; display: flex; flex-direction: column; gap: 14px; height: 100%; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); transition: all var(--transition-normal);">
                <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${f.icon}
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0;">${f.title}</h3>
                <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin: 0;">${f.description}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderHowItWorks(tool) {
    const container = document.getElementById("landing-how-it-works");
    const content = this.contentRepo
      ? this.contentRepo.getContentForTool(tool)
      : {};
    const steps = content.howItWorks || [
      {
        step: "1",
        title: "Select or Drop Files",
        description: `Choose the files from your device or drop them directly into the file workspace.`,
      },
      {
        step: "2",
        title: "Configure Preferences",
        description: `Adjust compression ratio, parameters, and output format settings to suit your needs.`,
      },
      {
        step: "3",
        title: "Process & Download",
        description: `Click process to run instant local execution and download your finalized files.`,
      },
    ];

    // Populate How It Works card inside the workspace left column
    const workspaceHowSteps = document.querySelector(".workspace-how-steps");
    if (workspaceHowSteps && steps.length >= 3) {
      workspaceHowSteps.innerHTML = `
        <div class="workspace-how-step">
          <div class="workspace-how-step__badge">1</div>
          <div class="workspace-how-step__text">
            <strong>${steps[0].title}</strong>
            <span>${steps[0].description}</span>
          </div>
        </div>
        <div class="workspace-how-arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="workspace-how-step">
          <div class="workspace-how-step__badge">2</div>
          <div class="workspace-how-step__text">
            <strong>${steps[1].title}</strong>
            <span>${steps[1].description}</span>
          </div>
        </div>
        <div class="workspace-how-arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="workspace-how-step">
          <div class="workspace-how-step__badge">3</div>
          <div class="workspace-how-step__text">
            <strong>${steps[2].title}</strong>
            <span>${steps[2].description}</span>
          </div>
        </div>
      `;
    }

    if (!container) return;

    container.innerHTML = `
      <section class="tool-section">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Step-by-Step Guide</span>
            <h2 class="ui-section-header__title">How to Use ${tool.title}</h2>
            <p class="ui-section-header__subtitle">Three simple steps to complete your file task in seconds.</p>
          </div>

          <div class="workspace-how-card" style="margin-top: 0; box-shadow: var(--shadow-md);">
            <div class="workspace-how-steps">
              ${steps
                .map(
                  (s, idx) => `
                <div class="workspace-how-step">
                  <div class="workspace-how-step__badge">${s.step}</div>
                  <div class="workspace-how-step__text">
                    <strong>${s.title}</strong>
                    <span>${s.description}</span>
                  </div>
                </div>
                ${idx < steps.length - 1 ? `<div class="workspace-how-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>` : ''}
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderBenefits(tool) {
    const container = document.getElementById("landing-benefits");
    if (!container) return;

    const content = this.contentRepo
      ? this.contentRepo.getContentForTool(tool)
      : {};
    const benefits = content.benefits || [
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        title: "Guaranteed Client Privacy",
        description:
          "All file processing occurs in your browser sandboxed WebAssembly runtime.",
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        title: "Zero Latency Pipeline",
        description:
          "Eliminates network queue times and slow remote server processing limits.",
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
        title: "Unlimited Batch Execution",
        description:
          "Process as many files as you need without daily file quotas or registration.",
      },
    ];

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Why Comprexa</span>
            <h2 class="ui-section-header__title">The Privacy-First Advantage</h2>
            <p class="ui-section-header__subtitle">Modern client-side architecture designed to protect sensitive data without sacrificing speed.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            ${benefits
              .map(
                (b) => `
              <div class="card" style="padding: 24px; border: 1px solid var(--border-subtle); border-top: 3px solid var(--primary); border-radius: var(--radius-xl); display: flex; flex-direction: column; gap: 12px; background: var(--bg-surface); box-shadow: var(--shadow-sm); transition: transform var(--transition-fast), border-color var(--transition-fast);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: var(--radius-lg); background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${b.icon}
                  </div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0;">${b.title}</h3>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0;">${b.description}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderSupportedFormats(tool) {
    let container = document.getElementById("landing-supported-formats");
    if (!container) {
      container = document.createElement("div");
      container.id = "landing-supported-formats";
      const faqNode = document.getElementById("landing-faq");
      if (faqNode && faqNode.parentNode) {
        faqNode.parentNode.insertBefore(container, faqNode);
      } else {
        return;
      }
    }

    const content = this.contentRepo ? this.contentRepo.getContentForTool(tool) : {};
    const formats = content.supportedFormats || [];

    if (formats.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <section class="tool-section">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Compatibility</span>
            <h2 class="ui-section-header__title">Supported File Formats</h2>
            <p class="ui-section-header__subtitle">High-speed format processing supported by ${tool.title}.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            ${formats
              .map(
                (fmt) => `
              <div class="card" style="padding: 22px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); background: var(--bg-surface); display: flex; align-items: flex-start; gap: 16px; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast), border-color var(--transition-fast);">
                <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: rgba(99, 102, 241, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0;">${fmt.type}</h3>
                  <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0; line-height: 1.5;">${fmt.format}</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderUseCases(tool) {
    let container = document.getElementById("landing-use-cases");
    if (!container) {
      container = document.createElement("div");
      container.id = "landing-use-cases";
      const faqNode = document.getElementById("landing-faq");
      if (faqNode && faqNode.parentNode) {
        faqNode.parentNode.insertBefore(container, faqNode);
      } else {
        return;
      }
    }

    const content = this.contentRepo ? this.contentRepo.getContentForTool(tool) : {};
    const useCases = content.useCases || [];

    if (useCases.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Applications</span>
            <h2 class="ui-section-header__title">Who Is This Tool For?</h2>
            <p class="ui-section-header__subtitle">Practical applications and workflows for ${tool.title}.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px;">
            ${useCases
              .map(
                (uc) => `
              <div class="card" style="padding: 20px 22px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); background: var(--bg-surface); display: flex; align-items: center; gap: 14px; font-weight: 600; font-size: 0.95rem; color: var(--text-main); box-shadow: var(--shadow-sm); transition: transform var(--transition-fast), border-color var(--transition-fast);">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span>${uc}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  renderFAQ(tool) {
    const container = document.getElementById("landing-faq");
    if (!container) return;

    const content = this.contentRepo
      ? this.contentRepo.getContentForTool(tool)
      : {};
    const rawFaqs = content.faqs || [];
    const faqs = rawFaqs.length > 0 ? rawFaqs : this._getToolFAQs(tool);

    if (faqs.length === 0) return;

    container.innerHTML = `
      <section class="tool-section">
        <div class="container">
          <div class="ui-section-header ui-section-header--center">
            <span class="ui-section-header__badge">Got Questions?</span>
            <h2 class="ui-section-header__title">Frequently Asked Questions</h2>
            <p class="ui-section-header__subtitle">Everything you need to know about using ${tool.title}.</p>
          </div>

          <div style="max-width: 800px; margin: 0 auto;">
            <div class="faq-list">
              ${faqs
                .map(
                  (faq, index) => `
                <div class="faq-item">
                  <button class="faq-item__question" aria-expanded="${index === 0 ? "true" : "false"}" id="faq-btn-${index}" aria-controls="faq-ans-${index}">
                    <span>${faq.question}</span>
                    <svg class="faq-item__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="faq-item__answer" id="faq-ans-${index}" role="region" aria-labelledby="faq-btn-${index}">
                    <p style="margin: 0; line-height: 1.6; font-size: 0.925rem;">${faq.answer}</p>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderRelatedTools(tool) {
    const container = document.getElementById("landing-related-tools");
    if (!container) return;

    if (
      this.framework &&
      typeof this.framework.renderRelatedGrid === "function"
    ) {
      container.innerHTML = `
        <section class="tool-section bg-surface-subtle">
          <div class="container">
            <div class="ui-section-header ui-section-header--center">
              <span class="ui-section-header__badge">Explore More</span>
              <h2 class="ui-section-header__title">Related Utility Tools</h2>
              <p class="ui-section-header__subtitle">Discover other high-speed, free, and secure processing utilities in Comprexa.</p>
            </div>

            <div id="related-tools-grid-mount" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;"></div>
          </div>
        </section>
      `;

      const gridMount = document.getElementById("related-tools-grid-mount");
      if (gridMount) {
        this.framework.renderRelatedGrid(tool.id, gridMount, 4);
      }
    }
  }

  _getToolFAQs(tool) {
    if (!tool) return [];
    return [
      {
        question: `Is ${tool.title || tool.name} free to use?`,
        answer: `Yes! ${tool.title || tool.name} is 100% free with no hidden subscriptions, watermarks, or daily file limits.`,
      },
      {
        question: `Are my files safe when using ${tool.title || tool.name}?`,
        answer: `Absolutely. Comprexa processes your files locally inside your web browser. Your data is never uploaded to any cloud server or third-party storage.`,
      },
      {
        question: `Do I need to install any software or plugins?`,
        answer: `No installation required. ${tool.title || tool.name} works directly in any standard HTML5 web browser across desktop, tablet, and mobile devices.`,
      },
      {
        question: `What file formats are supported?`,
        answer:
          tool.supportedFileTypes && tool.supportedFileTypes.length > 0
            ? `This tool supports ${tool.supportedFileTypes.join(", ").toUpperCase()} formats.`
            : `This tool supports standard web and document formats for processing.`,
      },
    ];
  }

  renderPopularTools(tool) {
    let container = document.getElementById("landing-popular-tools");
    if (!container) {
      container = document.createElement("div");
      container.id = "landing-popular-tools";
      const relatedNode = document.getElementById("landing-related-tools");
      if (relatedNode && relatedNode.parentNode) {
        relatedNode.parentNode.insertBefore(container, relatedNode.nextSibling);
      } else {
        return;
      }
    }

    if (this.registry) {
      const popularIds = ["compress-pdf", "compress-image", "word-counter", "qr-generator"];
      const popularTools = popularIds.map(id => this.registry.getById(id)).filter(t => t && t.id !== tool.id);

      if (popularTools.length === 0) {
        container.innerHTML = "";
        return;
      }

      let html = `
        <section class="tool-section">
          <div class="container">
            <div class="ui-section-header ui-section-header--center">
              <span class="ui-section-header__badge">Popular Utilities</span>
              <h2 class="ui-section-header__title">Most Popular Tools</h2>
              <p class="ui-section-header__subtitle">Explore highly used tools across Comprexa.</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
      `;

      popularTools.forEach(t => {
        const href = window.getToolUrl ? window.getToolUrl(t) : `/${t.id}.html`;
        html += `
          <a href="${href}" class="tool-card-mini" data-tool-id="${t.id}">
            <div class="tool-card-mini__icon ${t.colorClass || 'icon-bg--utility'}">
              ${t.icon || ''}
            </div>
            <div class="tool-card-mini__content">
              <h4 class="tool-card-mini__title">${t.title}</h4>
              <p class="tool-card-mini__desc">${t.shortDescription || ''}</p>
            </div>
            <div class="tool-card-mini__arrow">&rarr;</div>
          </a>
        `;
      });

      html += `
            </div>
          </div>
        </section>
      `;

      container.innerHTML = html;
    }
  }

  renderCTA(tool) {
    const container = document.getElementById("landing-cta");
    if (!container) return;

    const totalTools = "50+";

    container.innerHTML = `
      <section class="tool-section bg-surface-subtle" style="padding: 64px 0;">
        <div class="container">
          <div class="cta-card">
            <div class="cta-card__content">
              <h2 class="cta-card__title">Ready to Process More Files?</h2>
              <p class="cta-card__desc">Explore our full catalog of ${totalTools} free, client-side conversion, compression, and developer utilities.</p>
              <a href="/#tools" class="btn btn--primary btn--lg" style="margin-top: 8px;">
                <span>Explore All ${totalTools} Tools</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderFooter(tool) {
    const landingFooter = document.getElementById("landing-footer");
    if (
      landingFooter &&
      this.framework &&
      typeof this.framework.renderUniversalFooter === "function"
    ) {
      this.framework.renderUniversalFooter(landingFooter);
      return;
    }

    const existingFooter = document.querySelector(
      "footer.site-footer, footer.footer, footer#footer, footer",
    );
    if (
      existingFooter &&
      this.framework &&
      typeof this.framework.renderUniversalFooter === "function"
    ) {
      this.framework.renderUniversalFooter(existingFooter);
    }
  }

  // --------------------------------------------------------------------------
  // 4. Global Interactive Event Binding
  // --------------------------------------------------------------------------

  bindEvents() {
    // Accordion FAQ Click Listeners
    const faqQuestions = document.querySelectorAll(".faq-item__question");
    faqQuestions.forEach((q) => {
      // Prevent duplicating event listeners
      if (q.dataset.comprexaBound === "true") return;
      q.dataset.comprexaBound = "true";

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
}

// Global Export
window.ComprexaToolLandingPage = new ComprexaToolLandingPage();
export default ComprexaToolLandingPage;

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.ComprexaToolLandingPage) {
    window.ComprexaToolLandingPage.init();
  }
});
