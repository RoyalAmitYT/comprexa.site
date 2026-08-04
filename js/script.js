// @ts-nocheck
import './categories.js';
import './articles.js';
import './tools.js';
import './framework.js';
import './settings.js';
import './search-engine.js';
import './command-palette.js';
import './seo-engine.js';

/**
 * Comprexa - Modern File Utility Hub
 * Core Scripting & Interactive Features
 */

function initComprexaApp() {
  // Dynamically render Article Content
  const articleMain = document.querySelector(".article-main");
  if (articleMain && window.ComprexaArticleRegistry) {
    const urlParams = new URLSearchParams(window.location.search);
    let articleId = urlParams.get("id");

    // Default to a specific article if no ID is provided, so it doesn't break
    if (!articleId) {
      articleId = "how-to-compress-pdf-without-losing-quality";
    }

    const article = window.ComprexaArticleRegistry.getById(articleId);

    if (article) {
      document.title = `${article.title} - Comprexa Blog`;

      // Update Meta Tags
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc)
        metaDesc.content = `Comprexa Blog Article - ${article.title}`;

      // Top meta elements
      const topCategory = articleMain.querySelector(
        ".blog-card-modern__category",
      );
      if (topCategory) topCategory.textContent = article.category;

      const metaContainer = articleMain.querySelector(".article-meta-top");
      if (metaContainer) {
        const dateStr = new Date(article.publishedAt).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" },
        );
        metaContainer.innerHTML = `
          <span class="blog-card-modern__category">${article.category}</span>
          <span class="article-meta-dot">•</span>
          <span style="display: inline-flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${article.readTime}
          </span>
          <span class="article-meta-dot">•</span>
          <span>${dateStr}</span>
        `;
      }

      const titleEl = articleMain.querySelector(".article-title");
      if (titleEl) titleEl.textContent = article.title;

      const subtitleEl = articleMain.querySelector(".article-subtitle");
      if (subtitleEl) subtitleEl.textContent = article.excerpt;

      const authorName = articleMain.querySelector(".article-author-name");
      if (authorName && article.author) authorName.textContent = article.author;
      const authorDate = articleMain.querySelector(".article-author-date");
      if (authorDate) {
        authorDate.textContent = `Updated ${new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
      }

      const heroFigure = articleMain.querySelector(".article-hero-image");
      if (heroFigure) {
        heroFigure.innerHTML = `
           <div class="${article.imageClass || "blog-img-bg--tech"}" style="width:100%; height: 400px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.9); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm);">
               ${article.icon || ""}
           </div>
        `;
      }

      const contentEl = articleMain.querySelector(".article-content");
      if (contentEl) {
        let contentHtml = article.content;
        
        // Add Author Card
        const authorCard = `
          <div style="margin-top: 48px; padding: 24px; display: flex; align-items: center; gap: 16px; background: var(--bg-surface-subtle); border-radius: 12px;">
             <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             </div>
             <div>
                <h4 style="margin: 0 0 4px 0; font-size: 1.125rem;">${article.author || 'Comprexa Team'}</h4>
                <p style="margin: 0 0 8px 0; color: var(--text-muted); font-size: 0.875rem;">Building tools to make file processing fast, secure, and entirely in your browser.</p>
                <a href="/about.html" style="font-size: 0.875rem; color: var(--primary); text-decoration: none; font-weight: 500;">Explore Details about us &rarr;</a>
             </div>
          </div>
        `;
        
        // Add Social Sharing
        const currentUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(article.title);
        const socialHtml = `
          <div style="margin-top: 32px; display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 24px;">
             <span style="font-weight: 600; color: var(--text-main);">Share this article:</span>
             <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--icon btn--sm" aria-label="Share on X" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
             </a>
             <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--icon btn--sm" aria-label="Share on Facebook" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
             </a>
             <a href="https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${shareText}" target="_blank" rel="noopener noreferrer" class="btn btn--icon btn--sm" aria-label="Share on LinkedIn" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
             </a>
             <a href="https://api.whatsapp.com/send?text=${shareText} ${currentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--icon btn--sm" aria-label="Share on WhatsApp" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
             </a>
             <button onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!');" class="btn btn--icon btn--sm" aria-label="Copy Link" title="Copy Link" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
             </button>
          </div>
        `;
        
        contentEl.innerHTML = contentHtml + socialHtml + authorCard;
      }

      // Update Table of Contents
      const tocContainer = articleMain.querySelector(".article-toc__list");
      const tocTitle = articleMain.querySelector(".article-toc__title");
      if (tocTitle && window.innerWidth < 992) {
         tocTitle.addEventListener("click", () => {
             const tocBlock = articleMain.querySelector(".article-toc");
             if (tocBlock) tocBlock.classList.toggle("expanded");
         });
      }
      
      if (tocContainer && contentEl) {
        const headings = contentEl.querySelectorAll("h2, h3");
        if (headings.length > 0) {
          tocContainer.innerHTML = Array.from(headings)
            .map((h, i) => {
              // Ensure heading has an ID
              if (!h.id) {
                h.id = "heading-" + i;
              }
              const isH3 = h.tagName.toLowerCase() === "h3";
              return `<li style="${isH3 ? "padding-left: 1rem;" : ""}"><a href="#${h.id}" style="color: var(--text-muted); text-decoration: none; display: block; padding: 4px 0; transition: color var(--transition-fast);">${h.textContent}</a></li>`;
            })
            .join("");
        } else {
          const tocBlock = articleMain.querySelector(".article-toc");
          if (tocBlock) tocBlock.style.display = "none";
        }
      }

      // Update Related Articles and Tools in Sidebar
      const relatedContainer = articleMain.querySelector(".article-related-tools");
      if (relatedContainer) {
        let toolsHtml = "";
        if (article.relatedTools && window.ComprexaRegistry) {
           toolsHtml = `
             <div style="margin-top: 32px;">
                <h4 class="article-sidebar__heading">Related Tools</h4>
                ${article.relatedTools.map(tId => {
                   const t = window.ComprexaRegistry.getById(tId);
                   if(!t) return "";
                   return `
                     <a href="${t.url || ('/' + t.id + '.html')}" class="sidebar-tool-card" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; border: 1px solid var(--border-subtle); transition: all var(--transition-fast);">
                        <div class="sidebar-tool-card__icon" style="width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); color: var(--primary);">
                          ${t.icon}
                        </div>
                        <div class="sidebar-tool-card__info" style="flex: 1; min-width: 0;">
                          <div class="sidebar-tool-card__name" style="font-size: 0.875rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</div>
                          <div class="sidebar-tool-card__desc" style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.shortDescription || 'Tool'}</div>
                        </div>
                      </a>
                   `;
                }).join("")}
             </div>
           `;
        }
      
        relatedContainer.innerHTML = `
          <div>
            <h4 class="article-sidebar__heading">Related Articles</h4>
            ${window.ComprexaArticleRegistry.getAll()
              .filter((a) => a.id !== article.id)
              .slice(0, 3)
              .map(
                (a) => `
                <a href="/article.html?id=${a.id}" class="sidebar-tool-card" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; border: 1px solid var(--border-subtle); transition: all var(--transition-fast);">
                  <div class="sidebar-tool-card__icon" style="width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); color: var(--primary);">
                    ${a.icon}
                  </div>
                  <div class="sidebar-tool-card__info" style="flex: 1; min-width: 0;">
                    <div class="sidebar-tool-card__name" style="font-size: 0.875rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.title}</div>
                    <div class="sidebar-tool-card__desc" style="font-size: 0.75rem; color: var(--text-muted);">${a.readTime}</div>
                  </div>
                </a>
              `,
              )
              .join("")}
          </div>
          ${toolsHtml}
        `;
      }

      // Update Prev / Next navigation
      const allArticles = window.ComprexaArticleRegistry.getAll();
      const currentIndex = allArticles.findIndex((a) => a.id === article.id);

      const navContainer = articleMain.querySelector(".article-bottom-nav");
      if (navContainer) {
        let navHTML = "";

        if (currentIndex < allArticles.length - 1) {
          const prevArticle = allArticles[currentIndex + 1]; // Older article is "Previous" in time
          navHTML += `
            <a href="/article.html?id=${prevArticle.id}" class="article-nav-card">
              <span class="article-nav-card__label">Previous Article</span>
              <span class="article-nav-card__title">${prevArticle.title}</span>
            </a>
          `;
        } else {
          navHTML += `<div></div>`; // empty placeholder
        }

        if (currentIndex > 0) {
          const nextArticle = allArticles[currentIndex - 1]; // Newer article is "Next"
          navHTML += `
            <a href="/article.html?id=${nextArticle.id}" class="article-nav-card article-nav-card--next">
              <span class="article-nav-card__label">Next Article</span>
              <span class="article-nav-card__title">${nextArticle.title}</span>
            </a>
          `;
        }
        navContainer.innerHTML = navHTML;
      }
    } else {
      const container = articleMain.querySelector(".article-container");
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 100px 20px;">
            <h1 class="article-title">Article Not Found</h1>
            <p class="article-subtitle">The article you are looking for does not exist or has been removed.</p>
            <a href="/blog.html" class="btn btn--primary" style="margin-top: 24px;">Return to Blog</a>
          </div>
        `;
      }
    }
  }

  // --------------------------------------------------------------------------

  // 1. Theme Manager (Light / Dark Mode)
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleMobile = document.getElementById("theme-toggle-mobile");
  const rootElement = document.documentElement;

  // Icons SVG definitions
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>`;

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem("comprexa-theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    rootElement.setAttribute("data-theme", theme);
    localStorage.setItem("comprexa-theme", theme);

    const isDark = theme === "dark";
    const iconToSet = isDark ? sunIcon : moonIcon;
    const labelToSet = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

    if (themeToggle) {
      themeToggle.innerHTML = iconToSet;
      themeToggle.setAttribute("aria-label", labelToSet);
    }
    if (themeToggleMobile) {
      themeToggleMobile.innerHTML = `${iconToSet} <span>${isDark ? "Light Theme" : "Dark Theme"}</span>`;
      themeToggleMobile.setAttribute("aria-label", labelToSet);
    }
  }

  // Initialize theme
  setTheme(getPreferredTheme());

  function toggleTheme() {
    const currentTheme = rootElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    if (window.ComprexaSettings) {
      window.ComprexaSettings.set("theme", newTheme);
    } else {
      setTheme(newTheme);
    }
  }

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleMobile)
    themeToggleMobile.addEventListener("click", toggleTheme);

  // --------------------------------------------------------------------------
  // 2. Sticky Header Scroll Observer & Active Navigation Controller
  // --------------------------------------------------------------------------
  const header = document.querySelector(".header");
  const desktopNavLinks = document.querySelectorAll(".nav__link");
  const mobileNavLinks = document.querySelectorAll(".mobile-drawer__link");
  let scrollTicking = false;

  function updateHeaderAndActiveNav() {
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // 1. Header Scrolled State Transition (> 0px)
    if (header) {
      if (scrollY > 0) {
        header.classList.add("header--scrolled");
      } else {
        header.classList.remove("header--scrolled");
      }
    }

    // 2. Active Section Scroll Spy for Homepage
    const pathname = window.location.pathname.toLowerCase();
    const isHomePage =
      pathname === "/" || pathname === "/index.html" || pathname === "";

    if (isHomePage) {
      const toolsSec = document.getElementById("tools");
      const categoriesSec = document.getElementById("categories");
      const blogSec = document.getElementById("blog");

      let currentActive = "Home";
      const offset = 140; // Height threshold including navbar

      if (blogSec && scrollY + offset >= blogSec.offsetTop) {
        currentActive = "Blog";
      } else if (categoriesSec && scrollY + offset >= categoriesSec.offsetTop) {
        currentActive = "Categories";
      } else if (toolsSec && scrollY + offset >= toolsSec.offsetTop) {
        currentActive = "Tools";
      }

      highlightActiveLink(currentActive);
    }

    scrollTicking = false;
  }

  function highlightActiveLink(activeName) {
    desktopNavLinks.forEach((link) => {
      const text = link.textContent.trim();
      if (text === activeName) {
        link.classList.add("nav__link--active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("nav__link--active");
        link.removeAttribute("aria-current");
      }
    });

    mobileNavLinks.forEach((link) => {
      const text = link.textContent.trim();
      if (text === activeName) {
        link.classList.add("mobile-drawer__link--active", "active");
      } else {
        link.classList.remove("mobile-drawer__link--active", "active");
      }
    });
  }

  // Non-homepage static route active link setup
  function initRouteActiveNav() {
    const pathname = window.location.pathname.toLowerCase();
    const isHomePage =
      pathname === "/" || pathname === "/index.html" || pathname === "";

    if (isHomePage) {
      updateHeaderAndActiveNav();
      return;
    }

    let activeName = "";
    if (pathname.includes("about")) {
      activeName = "About";
    } else if (pathname.includes("contact")) {
      activeName = "Contact";
    } else if (pathname.includes("blog") || pathname.includes("article")) {
      activeName = "Blog";
    } else if (
      pathname.includes("category") ||
      pathname.endsWith("-tools.html")
    ) {
      activeName = "Categories";
    } else {
      activeName = "Tools";
    }

    highlightActiveLink(activeName);
  }

  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        if (!scrollTicking) {
          window.requestAnimationFrame(updateHeaderAndActiveNav);
          scrollTicking = true;
        }
      },
      { passive: true },
    );

    // Initial check on DOM load
    updateHeaderAndActiveNav();
    initRouteActiveNav();
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Menu Drawer Controller
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById("menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");

  function toggleMobileMenu() {
    const isOpen = mobileDrawer.classList.contains("open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    mobileDrawer.classList.add("open");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Close drawer on link click
  const drawerLinks = document.querySelectorAll(".mobile-drawer__link");
  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // --------------------------------------------------------------------------
  // 4. Smart Search & Popular Tools Engine (Dynamic from Global Registry)
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById("hero-search");
  const searchResults = document.getElementById("search-results");
  const searchClearBtn = document.getElementById("search-clear-btn");
  const headerSearchBtn = document.getElementById("header-search-btn");
  const popularGrid = document.getElementById("popular-tools-grid");
  const emptyState = document.getElementById("tools-empty-state");
  const emptyStateQuery = document.getElementById("empty-state-query");
  const emptyStateResetBtn = document.getElementById("empty-state-reset-btn");
  const toolsResultCounter = document.getElementById("tools-result-counter");
  const categoryTabsContainer = document.querySelector(".category-tabs");

  let activeCategory = "all";

  // Retrieve completed tools from Global Tool Registry
  function getCompletedTools() {
    let registryTools = [];
    if (
      window.ComprexaToolsRegistry &&
      typeof window.ComprexaToolsRegistry.getAll === "function"
    ) {
      registryTools = window.ComprexaToolsRegistry.getAll();
    }
    if ((!registryTools || registryTools.length === 0) && window.COMPREXA_TOOLS_REGISTRY) {
      registryTools = window.COMPREXA_TOOLS_REGISTRY;
    }
    if (
      (!registryTools || registryTools.length === 0) &&
      typeof COMPREXA_TOOLS_REGISTRY !== "undefined" &&
      Array.isArray(COMPREXA_TOOLS_REGISTRY)
    ) {
      registryTools = COMPREXA_TOOLS_REGISTRY;
    }
    return registryTools.filter((tool) => !tool.comingSoon);
  }

  // Universal Tool URL Resolver
  function getToolUrl(tool) {
    if (typeof window.getToolUrl === "function") {
      return window.getToolUrl(tool);
    }
    if (!tool) return "/";
    const id = (typeof tool === "string" ? tool : tool.id || "").toLowerCase();
    const slug = (
      typeof tool === "object" && tool.slug ? tool.slug : id
    ).toLowerCase();
    return `/tool-template.html?tool=${encodeURIComponent(slug || id)}`;
  }

  function matchesCategory(tool, category) {
    if (!category || category === "all") return true;
    const catLower = category.toLowerCase().trim();
    const toolCat = (tool.category || "").toLowerCase().trim();
    const toolCatName = (tool.categoryName || "").toLowerCase().trim();
    return toolCat === catLower || toolCatName === catLower;
  }

  function matchesQuery(tool, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const title = (tool.title || "").toLowerCase();
    const desc = (tool.shortDescription || tool.desc || "").toLowerCase();
    const cat = (tool.categoryName || tool.category || "").toLowerCase();
    const keywords = Array.isArray(tool.keywords) ? tool.keywords : [];

    return (
      title.includes(q) ||
      desc.includes(q) ||
      cat.includes(q) ||
      keywords.some((kw) => String(kw).toLowerCase().includes(q))
    );
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }

  // Dynamically build and render Category Tabs based on completed tools in Registry
  function initCategoryTabs() {
    if (!categoryTabsContainer) return;

    const completedTools = getCompletedTools();
    const totalCount = completedTools.length;

    // Group tools by category
    const categoryMap = new Map();

    completedTools.forEach((tool) => {
      const catId = (tool.category || "utilities").toLowerCase().trim();
      const catName = tool.categoryName || tool.category || "Utilities";
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { id: catId, name: catName, count: 0 });
      }
      categoryMap.get(catId).count++;
    });

    // Preferred category order for clean UI layout
    const preferredOrder = [
      "pdf",
      "image",
      "qr",
      "text",
      "developer",
      "color",
      "utilities",
    ];
    const sortedCategories = [];

    preferredOrder.forEach((catId) => {
      if (categoryMap.has(catId)) {
        sortedCategories.push(categoryMap.get(catId));
        categoryMap.delete(catId);
      }
    });

    // Append any newly added categories automatically
    for (const cat of categoryMap.values()) {
      sortedCategories.push(cat);
    }

    let tabsHtml = `
      <button class="category-tab ${activeCategory === "all" ? "category-tab--active" : ""}" role="tab" aria-selected="${activeCategory === "all"}" data-category="all">
        <span>All Tools</span>
        <span class="category-tab__count" id="count-all">${totalCount}</span>
      </button>
    `;

    sortedCategories.forEach((cat) => {
      const isActive =
        matchesCategory(
          { category: cat.id, categoryName: cat.name },
          activeCategory,
        ) && activeCategory !== "all";
      tabsHtml += `
        <button class="category-tab ${isActive ? "category-tab--active" : ""}" role="tab" aria-selected="${isActive}" data-category="${escapeHTML(cat.id)}">
          <span>${escapeHTML(cat.name)}</span>
          <span class="category-tab__count" id="count-${escapeHTML(cat.id)}">${cat.count}</span>
        </button>
      `;
    });

    categoryTabsContainer.innerHTML = tabsHtml;

    // Bind event handlers to tabs
    categoryTabsContainer.querySelectorAll(".category-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        categoryTabsContainer.querySelectorAll(".category-tab").forEach((t) => {
          t.classList.remove("category-tab--active");
          t.setAttribute("aria-selected", "false");
        });

        tab.classList.add("category-tab--active");
        tab.setAttribute("aria-selected", "true");

        activeCategory = tab.getAttribute("data-category") || "all";
        const currentQuery = searchInput ? searchInput.value : "";
        renderPopularTools(currentQuery, activeCategory);
      });
    });
  }

  // Render Popular Tools Cards
  function renderPopularTools(query = "", category = activeCategory) {
    if (!popularGrid) return;

    const completedTools = getCompletedTools();
    const categoryTotal = completedTools.filter((tool) =>
      matchesCategory(tool, category),
    ).length;
    const filtered = completedTools.filter(
      (tool) => matchesCategory(tool, category) && matchesQuery(tool, query),
    );

    // Update Result Counter
    if (toolsResultCounter) {
      toolsResultCounter.innerHTML = `Showing <strong id="visible-tools-count">${filtered.length}</strong> of ${categoryTotal} tools`;
    }

    if (filtered.length === 0) {
      popularGrid.style.display = "none";
      if (emptyState) {
        emptyState.style.display = "flex";
        if (emptyStateQuery) emptyStateQuery.textContent = query || category;
      }
    } else {
      popularGrid.style.display = "grid";
      if (emptyState) emptyState.style.display = "none";

      popularGrid.innerHTML = filtered
        .map((tool) => {
          const targetUrl = getToolUrl(tool);
          const colorClass = tool.colorClass || "icon-bg--utility";
          const badge = tool.badge || "Tool";
          const categoryName = tool.categoryName || tool.category || "Utility";
          const title = tool.title || "";
          const desc = tool.shortDescription || tool.desc || "";
          const iconSvg = tool.icon || tool.svgIcon || "";

          return `
          <a href="${escapeHTML(targetUrl)}" class="feature-card" tabindex="0" role="button" data-id="${escapeHTML(tool.id)}"  aria-label="Open ${escapeHTML(title)} tool">
            <div class="feature-card__header">
              <div class="feature-card__icon ${colorClass}">
                ${iconSvg}
              </div>
              <span class="feature-card__badge">${escapeHTML(badge)}</span>
            </div>
            <div class="feature-card__body">
              <span class="feature-card__category">${escapeHTML(categoryName)}</span>
              <h3 class="feature-card__title">${escapeHTML(title)}</h3>
              <p class="feature-card__desc">${escapeHTML(desc)}</p>
            </div>
            <div class="feature-card__footer">
              <span>Use Tool</span>
              <svg class="feature-card__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>
        `;
        })
        .join("");
    }
  }

  // Bind navigation handlers for popular tools grid
  if (popularGrid) {
    /* JS navigation removed for SEO */
  }

  // Render Quick Dropdown Suggestions in Hero
  function renderSearchResults(query) {
    if (!searchResults) return;

    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
      return;
    }

    const completedTools = getCompletedTools();
    const filtered = completedTools.filter((tool) =>
      matchesQuery(tool, trimmed),
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No quick matches found for "<strong>${escapeHTML(query)}</strong>"
        </div>
      `;
    } else {
      searchResults.innerHTML = filtered
        .map((tool) => {
          const targetUrl = getToolUrl(tool);
          const colorClass = tool.colorClass || "icon-bg--utility";
          const iconSvg = tool.icon || tool.svgIcon || "";
          const title = tool.title || "";
          const desc = tool.shortDescription || tool.desc || "";

          return `
          <a href="${escapeHTML(targetUrl)}" class="search-results__item" role="button" tabindex="0" data-id="${escapeHTML(tool.id)}" >
            <div class="search-results__icon ${colorClass}">${iconSvg}</a>
            <div class="search-results__info">
              <span class="search-results__title">${escapeHTML(title)}</span>
              <span class="search-results__desc">${escapeHTML(desc)}</span>
            </div>
          </div>
        `;
        })
        .join("");
    }

    searchResults.classList.add("active");
  }

  if (searchResults) {
    /* search results JS navigation removed for SEO */
  }

  // Handle Search Input & Clear Button
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value;

      // Toggle Clear Button
      if (searchClearBtn) {
        searchClearBtn.style.display = val ? "flex" : "none";
      }

      renderSearchResults(val);
      renderPopularTools(val);
    });

    searchInput.addEventListener("focus", (e) => {
      if (e.target.value.trim()) {
        renderSearchResults(e.target.value);
      }
    });
  }

  // Handle Clear Button Click
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      searchClearBtn.style.display = "none";
      if (searchResults) searchResults.classList.remove("active");
      renderPopularTools("");
    });
  }

  // Popular Search Chips Click Handlers
  const popularChips = document.querySelectorAll(".search-chip");
  popularChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query") || chip.textContent.trim();
      if (searchInput) {
        searchInput.value = query;
        searchInput.focus();
        if (searchClearBtn) searchClearBtn.style.display = "flex";
      }
      renderSearchResults(query);
      renderPopularTools(query);

      // Scroll smoothly to grid if needed
      const toolsSection = document.getElementById("tools");
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Reset Button in Empty State
  if (emptyStateResetBtn) {
    emptyStateResetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (searchClearBtn) searchClearBtn.style.display = "none";
      if (searchResults) searchResults.classList.remove("active");

      activeCategory = "all";
      initCategoryTabs();
      renderPopularTools("", "all");
    });
  }

  // Header quick search trigger focuses main input
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  // Global Keyboard Shortcuts (⌘K / Ctrl+K / Escape)
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (e.key === "Escape") {
      if (searchResults) searchResults.classList.remove("active");
      if (mobileDrawer && mobileDrawer.classList.contains("open")) {
        closeMobileMenu();
      }
    }
  });

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      if (searchResults) searchResults.classList.remove("active");
    }
  });

  // Initial render of category tabs and popular tools on page load
  initCategoryTabs();
  renderPopularTools();

  // --------------------------------------------------------------------------
  // 5. Category Card Interactive Handlers
  // --------------------------------------------------------------------------
  /* Category Cards JS Navigation removed */
  // 7. Featured Tool Button Handlers
  // --------------------------------------------------------------------------
  /* Featured Tool Btns JS Navigation removed */
  // 8. FAQ Accordion Handler & Keyboard Accessibility
  // --------------------------------------------------------------------------
  const faqTriggers = Array.from(
    document.querySelectorAll(".faq-item__trigger"),
  );
  if (faqTriggers.length > 0) {
    faqTriggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".faq-item");
        const panelId = trigger.getAttribute("aria-controls");
        const panel = document.getElementById(panelId);
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";

        // Close all accordion items
        faqTriggers.forEach((otherTrigger) => {
          const otherItem = otherTrigger.closest(".faq-item");
          const otherPanelId = otherTrigger.getAttribute("aria-controls");
          const otherPanel = document.getElementById(otherPanelId);

          otherTrigger.setAttribute("aria-expanded", "false");
          if (otherItem) otherItem.classList.remove("faq-item--active");
          if (otherPanel) otherPanel.setAttribute("hidden", "");
        });

        // Toggle clicked item if it was not expanded before
        if (!isExpanded) {
          trigger.setAttribute("aria-expanded", "true");
          if (item) item.classList.add("faq-item--active");
          if (panel) panel.removeAttribute("hidden");
        }
      });

      // Keyboard arrow navigation between FAQ triggers
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (index + 1) % faqTriggers.length;
          faqTriggers[nextIndex].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            (index - 1 + faqTriggers.length) % faqTriggers.length;
          faqTriggers[prevIndex].focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          faqTriggers[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          faqTriggers[faqTriggers.length - 1].focus();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. Footer Interactions & Theme Shortcut
  // --------------------------------------------------------------------------
  const footerThemeToggle = document.getElementById("footer-theme-toggle");
  if (footerThemeToggle) {
    footerThemeToggle.addEventListener("click", toggleTheme);
  }

  // Ctrl+D shortcut for dark mode toggle
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Back to Top Button
  const backToTopBtn = document.getElementById("back-to-top-btn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // View All Articles Button
  const viewAllArticlesBtn = document.getElementById("view-all-articles-btn");
  if (viewAllArticlesBtn) {
    /* viewAllArticlesBtn JS nav removed */
  }

  // Dynamically render Latest Articles
  const blogGrid = document.querySelector(".blog-grid");
  if (blogGrid && window.ComprexaArticleRegistry) {
    // Only render on homepage where #blog exists, but not on blog.html itself
    // Or if it's blog.html, render all articles
    const isBlogPage = window.location.pathname.includes("blog.html");
    const articles = isBlogPage
      ? window.ComprexaArticleRegistry.getAll()
      : window.ComprexaArticleRegistry.getLatest(3);

    if (articles.length > 0) {
      blogGrid.innerHTML = articles
        .map(
          (article) => `
          <a href="/article.html?id=${article.id}" class="blog-card fade-in-on-scroll visible">
            <div class="blog-card__image-wrap">
              <div class="blog-card__placeholder-img ${article.imageClass || "blog-img-bg--pdf"}">
                ${article.icon || ""}
              </div>
            </div>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span class="blog-card__category">${article.category}</span>
                <span class="blog-card__read-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${article.readTime}
                </span>
              </div>
              <h3 class="blog-card__title">
                <a href="/article.html?id=${article.id}" class="blog-article-link">${article.title}</a>
              </h3>
              <p class="blog-card__excerpt">
                ${article.excerpt}
              </p>
              <div class="blog-card__footer">
                <a href="/article.html?id=${article.id}" class="blog-card__link blog-article-link" tabindex="-1">
                  <span>Read Article</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </a>
      `,
        )
        .join("");

      // Attach click to whole card
      /* blog card JS nav removed */
    }
  }

  // --------------------------------------------------------------------------
  // 6. Universal Global Loader & Smooth Page Transition Engine
  // --------------------------------------------------------------------------
  initPageTransitions();
  initRoutePrefetching();
  initScrollRevealEngine();
  initUploadMicroInteractions();
  initImageBlurUp();

  // --------------------------------------------------------------------------
  // Floating Actions & Dashboard Animated Counters
  // --------------------------------------------------------------------------
  initAnimatedCounters();

  // --------------------------------------------------------------------------
  // 10. Global Toast Notification System
  // --------------------------------------------------------------------------
  window.ComprexaToast = {
    show: function ({
      title = "",
      message = "",
      type = "info",
      duration = 4000,
    }) {
      let container = document.getElementById("toast-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
      }

      const toast = document.createElement("div");
      toast.className = `ui-toast ui-toast--${type}`;

      const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      };

      toast.innerHTML = `
        <div class="ui-toast__icon">${icons[type] || icons.info}</div>
        <div class="ui-toast__content">
          ${title ? `<div class="ui-toast__title">${title}</div>` : ""}
          <div class="ui-toast__msg">${message}</div>
        </div>
        <button type="button" class="ui-toast__close" aria-label="Close notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="ui-toast__progress" style="animation-duration: ${duration}ms;"></div>
      `;

      container.appendChild(toast);

      const closeToast = () => {
        toast.classList.add("ui-toast--out");
        toast.addEventListener(
          "animationend",
          () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
          },
          { once: true },
        );
      };

      const closeBtn = toast.querySelector(".ui-toast__close");
      if (closeBtn) closeBtn.addEventListener("click", closeToast);

      let timer = setTimeout(closeToast, duration);

      toast.addEventListener("mouseenter", () => {
        const progress = toast.querySelector(".ui-toast__progress");
        if (progress) progress.style.animationPlayState = "paused";
        clearTimeout(timer);
      });

      toast.addEventListener("mouseleave", () => {
        const progress = toast.querySelector(".ui-toast__progress");
        if (progress) progress.style.animationPlayState = "running";
        timer = setTimeout(closeToast, duration); // Reset duration or resume, this is fine
      });
    },
    success: function (message, title = "Success") {
      this.show({ title, message, type: "success" });
    },
    error: function (message, title = "Error") {
      this.show({ title, message, type: "error" });
    },
    warning: function (message, title = "Warning") {
      this.show({ title, message, type: "warning" });
    },
    info: function (message, title = "Information") {
      this.show({ title, message, type: "info" });
    },
  };

  // --------------------------------------------------------------------------
  // 11. Global Modal Dialog System
  // --------------------------------------------------------------------------
  window.ComprexaModal = {
    open: function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";

      // Focus first focusable element
      const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }

      const closeHandler = (e) => {
        if (
          e.target === modal ||
          e.target.closest(".ui-modal__close") ||
          e.target.closest("[data-modal-close]")
        ) {
          this.close(modalId);
        }
      };

      modal.addEventListener("click", closeHandler);
      modal._closeHandler = closeHandler;
    },
    close: function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      modal.classList.remove("is-open");
      document.body.style.overflow = "";

      if (modal._closeHandler) {
        modal.removeEventListener("click", modal._closeHandler);
        delete modal._closeHandler;
      }
    },
  };

  // Escape key to close open modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".ui-modal-backdrop.is-open");
      if (openModal && openModal.id) {
        window.ComprexaModal.close(openModal.id);
      }
    }
  });

  // Data attribute triggers for modal open/close
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-modal-target]");
    if (trigger) {
      const targetId = trigger.getAttribute("data-modal-target");
      if (targetId) window.ComprexaModal.open(targetId);
    }
  });

  // --------------------------------------------------------------------------
  // 12. Interactive Chip Component Handlers
  // --------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const chipRemoveBtn = e.target.closest(".chip__remove");
    if (chipRemoveBtn) {
      e.stopPropagation();
      const chip = chipRemoveBtn.closest(".chip");
      if (chip) {
        chip.style.opacity = "0";
        chip.style.transform = "scale(0.8)";
        setTimeout(() => {
          if (chip.parentNode) chip.parentNode.removeChild(chip);
        }, 200);
      }
    } else {
      const chip = e.target.closest(".chip:not(.chip--dismissible)");
      if (chip && chip.classList.contains("chip--selectable")) {
        chip.classList.toggle("chip--active");
      }
    }
  });

  // --------------------------------------------------------------------------
  // 13. Universal File Upload System Engine
  // --------------------------------------------------------------------------
  class ComprexaUploader {
    static init(element, options = {}) {
      let allowedTypes = undefined;
      if (options.accept) {
        allowedTypes = options.accept
          .split(",")
          .map((s) => s.trim().replace(/^\./, "").toLowerCase());
      }
      const mappedOptions = Object.assign({}, options, {
        allowedTypes: allowedTypes || options.allowedTypes,
        onSelect: options.onFileSelect || options.onSelect,
      });
      return new ComprexaUploader(element, mappedOptions);
    }

    constructor(element, options = {}) {
      this.container =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!this.container) return;
      this.container._uploaderInstance = this;

      // Determine active tool ID for registry configuration lookup
      let toolId = options.tool || this.container.getAttribute("data-tool");
      if (!toolId && typeof window !== "undefined" && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        toolId = urlParams.get("tool");
        if (!toolId) {
          const pathSegments = window.location.pathname.split("/");
          const filename = pathSegments[pathSegments.length - 1];
          if (filename && filename.endsWith(".html")) {
            const slug = filename.replace(".html", "");
            if (window.ComprexaToolsRegistry) {
              const toolObj =
                window.ComprexaToolsRegistry.getBySlug(slug) ||
                window.ComprexaToolsRegistry.getById(slug);
              if (toolObj) {
                toolId = toolObj.id;
              }
            }
          }
        }
      }

      let registryAllowedTypes = undefined;
      let registryMultiple = undefined;
      let registryToolTitle = undefined;
      let registryIcon = undefined;

      if (toolId && window.ComprexaToolsRegistry) {
        const toolObj =
          window.ComprexaToolsRegistry.getById(toolId) ||
          window.ComprexaToolsRegistry.getBySlug(toolId);
        if (toolObj) {
          if (toolObj.supportedFileTypes) {
            registryAllowedTypes = toolObj.supportedFileTypes.map((t) =>
              t.toLowerCase().replace(/^\./, "").trim(),
            );
          }
          if (toolObj.acceptsMultipleFiles !== undefined) {
            registryMultiple = toolObj.acceptsMultipleFiles;
          }
          if (toolObj.title) {
            registryToolTitle = toolObj.title;
          }
          if (toolObj.icon) {
            registryIcon = toolObj.icon;
          }
        }
      }

      this.options = Object.assign(
        {
          maxSizeMB: 100,
          allowedTypes: registryAllowedTypes || [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "png",
            "jpg",
            "jpeg",
            "webp",
            "gif",
            "svg",
            "zip",
            "rar",
            "mp4",
            "mp3",
            "txt",
            "csv",
          ],
          multiple: registryMultiple !== undefined ? registryMultiple : false,
          toolTitle: registryToolTitle,
          toolIcon: registryIcon,
          simulatedUploadTime: 600,
          onSelect: null,
          onRemove: null,
          onError: null,
        },
        options,
      );

      // Clean up options.allowedTypes
      if (
        this.options.allowedTypes &&
        Array.isArray(this.options.allowedTypes)
      ) {
        this.options.allowedTypes = this.options.allowedTypes.map((t) =>
          t.toLowerCase().replace(/^\./, "").trim(),
        );
      }

      this.currentFiles = [];
      this.initUI();
      this.bindEvents();
    }

    initUI() {
      this.container.classList.add("file-uploader");
      const acceptAttr =
        this.options.allowedTypes &&
        this.options.allowedTypes.length > 0 &&
        !this.options.allowedTypes.includes("*")
          ? `accept="${this.options.allowedTypes.map((ext) => "." + ext).join(",")}"`
          : "";

      const fileLabel = this.options.multiple ? "files" : "file";
      const fileTitle = this.options.toolTitle
        ? `Upload ${fileLabel} to <span>${this.options.toolTitle}</span>`
        : `Upload your ${fileLabel} here`;
      const dragText = `Drag & drop your ${fileLabel} here`;
      const subText = this.options.multiple
        ? "You can select 2 or more files"
        : "Select a file to get started";

      const uploadIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

      this.container.innerHTML = `
        <div class="file-uploader__dropzone" tabindex="0" role="button" aria-label="Upload file zone. Click or drag and drop files here.">
          <input type="file" class="file-uploader__input" ${this.options.multiple ? "multiple" : ""} ${acceptAttr} aria-hidden="true" tabindex="-1" />
          <div class="file-uploader__icon-wrap">
            ${uploadIcon}
          </div>
          <div class="file-uploader__title">
            ${fileTitle}
          </div>
          <div class="file-uploader__hint-main">
            ${dragText}
          </div>
          <button type="button" class="btn btn--primary file-uploader__choose-btn" tabindex="-1" style="margin-top: 4px; margin-bottom: 8px; min-width: 140px; height: 36px; padding: 0 16px; font-size: 0.9rem;">Browse Files</button>
          
          <div class="file-uploader__sub-text" style="font-size: 0.8rem; font-weight: 500; color: var(--text-main); margin-bottom: 4px;">
            ${subText}
          </div>
          ${
            this.options.allowedTypes &&
            this.options.allowedTypes.length > 0 &&
            !this.options.allowedTypes.includes("*")
              ? `
          <div class="file-uploader__formats" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; margin-bottom: 2px;">
            Supported formats: ${
              this.options.allowedTypes.length > 8
                ? this.options.allowedTypes
                    .slice(0, 8)
                    .map((ext) => ext.toUpperCase())
                    .join(", ") + " and more"
                : this.options.allowedTypes
                    .map((ext) => ext.toUpperCase())
                    .join(", ")
            }
          </div>`
              : ""
          }
          <div class="file-uploader__hint" style="font-size: 0.75rem;">
            Max file size: ${this.options.maxSizeMB}MB
          </div>
          <div class="file-uploader__error-banner" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span class="file-uploader__error-text">Invalid file format or file too large.</span>
          </div>
        </div>
        <div class="file-uploader__preview-list" style="display: flex; flex-direction: column; gap: 12px; width: 100%;"></div>
      `;

      this.dropzone = this.container.querySelector(".file-uploader__dropzone");
      this.fileInput = this.container.querySelector(".file-uploader__input");
      this.errorBanner = this.container.querySelector(
        ".file-uploader__error-banner",
      );
      this.errorText = this.container.querySelector(
        ".file-uploader__error-text",
      );
      this.previewList = this.container.querySelector(
        ".file-uploader__preview-list",
      );
    }

    bindEvents() {
      // Click & Keyboard trigger file input
      this.dropzone.addEventListener("click", () => this.fileInput.click());
      this.dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.fileInput.click();
        }
      });

      this.fileInput.addEventListener("change", (e) => {
        this.handleFiles(Array.from(e.target.files));
      });

      // Drag & Drop event handlers
      ["dragenter", "dragover"].forEach((eventName) => {
        this.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.add("file-uploader__dropzone--dragging");
        });
      });

      ["dragleave", "dragend"].forEach((eventName) => {
        this.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropzone.classList.remove("file-uploader__dropzone--dragging");
        });
      });

      this.dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzone.classList.remove("file-uploader__dropzone--dragging");
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          this.handleFiles(Array.from(e.dataTransfer.files));
        }
      });
    }

    handleFiles(files) {
      if (!files || files.length === 0) return;
      this.clearError();

      const validFiles = [];
      for (const file of files) {
        const ext = file.name.split(".").pop().toLowerCase();
        const sizeMB = file.size / (1024 * 1024);

        if (sizeMB > this.options.maxSizeMB) {
          this.showError(
            `File size (${this.formatBytes(file.size)}) exceeds maximum allowed ${this.options.maxSizeMB}MB.`,
          );
          return;
        }

        if (
          this.options.allowedTypes.length > 0 &&
          !this.options.allowedTypes.includes(ext) &&
          !this.options.allowedTypes.includes("*")
        ) {
          this.showError(`Unsupported .${ext.toUpperCase()} file extension.`);
          return;
        }

        validFiles.push(file);
      }
      if (this.options.multiple) {
        this.currentFiles = [...this.currentFiles, ...validFiles];
        this.container.dispatchEvent(
          new CustomEvent("comprexa:files-selected", {
            detail: { files: validFiles },
          }),
        );
        this.fileInput.value = "";
      } else {
        this.currentFiles = [validFiles[0]];
        this.container.dispatchEvent(
          new CustomEvent("comprexa:file-selected", {
            detail: { file: validFiles[0] },
          }),
        );
        this.renderUploadingState(validFiles[0]);
      }
    }

    renderUploadingState(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileTypeTheme = this.getFileThemeClass(ext);
      const iconSvg = this.getFileIconSvg(ext);

      this.previewList.innerHTML = `
        <div class="file-preview-card">
          <div class="file-preview-card__icon-wrap ${fileTypeTheme}">
            ${iconSvg}
          </div>
          <div class="file-preview-card__details">
            <div class="file-preview-card__header">
              <span class="file-preview-card__name" title="${file.name}">${file.name}</span>
              <span class="badge badge--primary badge--pill">.${ext.toUpperCase()}</span>
            </div>
            <div class="file-preview-card__meta">
              <span>${this.formatBytes(file.size)}</span>
              <span>•</span>
              <span style="color: var(--primary); font-weight: 600;">Uploading...</span>
            </div>
            <div class="ui-progress-bar file-preview-card__progress">
              <div class="ui-progress-bar__inner" style="width: 25%;"></div>
            </div>
          </div>
        </div>
      `;

      // Animate progress bar
      const progressBar = this.previewList.querySelector(
        ".ui-progress-bar__inner",
      );
      setTimeout(() => {
        if (progressBar) progressBar.style.width = "70%";
      }, 200);
      setTimeout(() => {
        if (progressBar) progressBar.style.width = "100%";
        setTimeout(() => this.renderUploadedState(file), 250);
      }, this.options.simulatedUploadTime);
    }

    renderUploadedState(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileTypeTheme = this.getFileThemeClass(ext);
      const iconSvg = this.getFileIconSvg(ext);

      this.previewList.innerHTML = `
        <div class="file-preview-card">
          <div class="file-preview-card__icon-wrap ${fileTypeTheme}">
            ${iconSvg}
          </div>
          <div class="file-preview-card__details">
            <div class="file-preview-card__header">
              <span class="file-preview-card__name" title="${file.name}">${file.name}</span>
              <span class="badge badge--success badge--pill">.${ext.toUpperCase()}</span>
            </div>
            <div class="file-preview-card__meta">
              <span>${this.formatBytes(file.size)}</span>
              <span>•</span>
              <span class="badge badge--success" style="padding: 2px 8px; font-size: 0.7rem;">Ready</span>
            </div>
          </div>
          <div class="file-preview-card__actions">
            <button type="button" class="btn btn--outline btn--sm btn-replace" data-tooltip="Replace file">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              <span>Replace</span>
            </button>
            <button type="button" class="btn btn--ghost btn--danger btn--sm btn-remove" data-tooltip="Remove file">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;

      this.dropzone.classList.add("file-uploader__dropzone--success");

      // Bind replace & remove inside card
      const replaceBtn = this.previewList.querySelector(".btn-replace");
      if (replaceBtn) {
        replaceBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.fileInput.click();
        });
      }

      const removeBtn = this.previewList.querySelector(".btn-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.reset();
          if (typeof this.options.onRemove === "function") {
            this.options.onRemove();
          }
          if (window.ComprexaToast) {
            window.ComprexaToast.info("File removed.", "Uploader");
          }
        });
      }

      if (typeof this.options.onSelect === "function") {
        this.options.onSelect(file, this);
      }

      if (window.ComprexaToast) {
        window.ComprexaToast.success(
          `Successfully loaded ${file.name}`,
          "File Ready",
        );
      }

      // Dispatch custom DOM event
      this.container.dispatchEvent(
        new CustomEvent("comprexa:file-selected", { detail: { file } }),
      );
    }

    showError(msg) {
      this.dropzone.classList.add("file-uploader__dropzone--error");
      this.errorText.textContent = msg;
      this.errorBanner.classList.add("is-visible");

      if (typeof this.options.onError === "function") {
        this.options.onError(msg, this);
      }

      if (window.ComprexaToast) {
        window.ComprexaToast.error(msg, "Upload Failed");
      }

      setTimeout(() => {
        this.dropzone.classList.remove("file-uploader__dropzone--error");
      }, 500);
    }

    clearError() {
      this.dropzone.classList.remove("file-uploader__dropzone--error");
      this.errorBanner.classList.remove("is-visible");
    }

    reset() {
      this.currentFiles = [];
      this.fileInput.value = "";
      this.previewList.innerHTML = "";
      this.clearError();
      this.dropzone.classList.remove("file-uploader__dropzone--success");
      this.container.dispatchEvent(new CustomEvent("comprexa:file-removed"));
    }

    formatBytes(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    getFileThemeClass(ext) {
      if (["pdf"].includes(ext)) return "file-preview-card__icon-wrap--pdf";
      if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext))
        return "file-preview-card__icon-wrap--image";
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
        return "file-preview-card__icon-wrap--archive";
      if (
        ["js", "ts", "html", "css", "json", "py", "cpp", "java"].includes(ext)
      )
        return "file-preview-card__icon-wrap--code";
      return "file-preview-card__icon-wrap--default";
    }

    getFileIconSvg(ext) {
      if (["pdf"].includes(ext)) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h3a1.5 1.5 0 0 0 0-3H9v6"/></svg>`;
      }
      if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
      }
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"/></svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    }
  }

  // Global Export
  window.ComprexaUploader = ComprexaUploader;

  if (window.ComprexaFramework) {
    window.ComprexaFramework.renderUploader = function (element, options = {}) {
      if (window.ComprexaUploader) {
        let allowedTypes = undefined;
        if (options.acceptedFormats) {
          allowedTypes = options.acceptedFormats
            .split(",")
            .map((s) => s.trim().replace(/^\./, "").toLowerCase());
        }
        return window.ComprexaUploader.init(
          element,
          Object.assign({}, options, {
            allowedTypes: allowedTypes || options.allowedTypes,
          }),
        );
      }
    };
  }

  // Auto-initialize elements with [data-file-uploader]
  document.querySelectorAll("[data-file-uploader]").forEach((el) => {
    const options = {};
    if (el.hasAttribute("data-max-size-mb")) {
      options.maxSizeMB = parseInt(el.getAttribute("data-max-size-mb")) || 100;
    }
    const allowedStr =
      el.getAttribute("data-allowed-types") || el.getAttribute("data-accept");
    if (allowedStr) {
      options.allowedTypes = allowedStr.split(",").map((s) => s.trim());
    }
    new ComprexaUploader(el, options);
  });

  // --------------------------------------------------------------------------
  // 14. Universal Processing & Download System Engine
  // --------------------------------------------------------------------------
  class ComprexaProcessor {
    constructor(element, options = {}) {
      this.container =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!this.container) return;

      this.options = Object.assign(
        {
          title: "Document Processing Engine",
          steps: [
            "Analyzing document structure...",
            "Extracting data & vector graphics...",
            "Optimizing compression ratios...",
            "Finalizing output file...",
          ],
          onStart: null,
          onComplete: null,
          onError: null,
          onReset: null,
        },
        options,
      );

      this.state = "idle"; // 'idle', 'ready', 'processing', 'success', 'error'
      this.progress = 0;
      this.timer = null;
      this.fileData = null;

      this.initUI();
    }

    initUI() {
      this.container.classList.add("processing-card");
      this.renderReadyState();
    }

    renderReadyState(fileInfo = null) {
      this.state = "ready";
      this.fileData = fileInfo || {
        name: "sample_document.pdf",
        size: "2.4 MB",
        type: "PDF",
      };

      this.container.innerHTML = `
        <div class="processing-state">
          <div class="processing-state__icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          </div>
          <div>
            <div class="processing-state__title">${this.fileData.name}</div>
            <div class="processing-state__desc">File loaded (${this.fileData.size}). Ready to process with Comprexa Core Engine.</div>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; width: 100%; margin-top: 8px;">
            <button type="button" class="btn btn--primary btn--lg btn-start-processing">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Start Processing</span>
            </button>
            <button type="button" class="btn btn--outline btn--lg btn-test-error">
              <span>Test Error State</span>
            </button>
          </div>
        </div>
      `;

      const startBtn = this.container.querySelector(".btn-start-processing");
      if (startBtn) {
        startBtn.addEventListener("click", () => this.startProcessing());
      }

      const errBtn = this.container.querySelector(".btn-test-error");
      if (errBtn) {
        errBtn.addEventListener("click", () =>
          this.renderError(
            "Processing failed due to corrupted file header. Please retry.",
          ),
        );
      }
    }

    startProcessing() {
      this.state = "processing";
      this.progress = 0;
      this.container.classList.add("processing-card--active");

      this.renderProcessingState();

      // Simulate step-by-step progress
      let stepIndex = 0;
      const totalSteps = this.options.steps.length;

      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.progress += 2;
        if (this.progress > 100) this.progress = 100;

        stepIndex = Math.min(
          Math.floor((this.progress / 100) * totalSteps),
          totalSteps - 1,
        );
        const currentStep = this.options.steps[stepIndex];
        const remainingSec = Math.max(1, Math.ceil((100 - this.progress) / 25));

        this.updateProgressUI(
          this.progress,
          currentStep,
          `${remainingSec}s remaining`,
        );

        if (this.progress >= 100) {
          clearInterval(this.timer);
          setTimeout(() => {
            this.renderSuccessState({
              name: `processed_${this.fileData.name || "document.pdf"}`,
              size: "1.1 MB (54% saved)",
              downloadUrl: "#",
              type: this.fileData.type || "PDF",
            });
          }, 300);
        }
      }, 50);

      if (typeof this.options.onStart === "function") {
        this.options.onStart();
      }
    }

    renderProcessingState() {
      this.container.innerHTML = `
        <div class="processing-state">
          <div class="processing-circle">
            <svg viewBox="0 0 100 100">
              <circle class="processing-circle__bg" cx="50" cy="50" r="42"/>
              <circle class="processing-circle__fill" cx="50" cy="50" r="42"/>
            </svg>
            <div class="processing-circle__text">0%</div>
          </div>

          <div style="text-align: center; width: 100%;">
            <div class="processing-state__title">Processing File...</div>
            <div class="processing-state__desc">Please keep this window open while processing completes.</div>
          </div>

          <div class="processing-linear">
            <div class="processing-linear__header">
              <span class="processing-linear__step">
                <span class="ui-spinner ui-spinner--sm"></span>
                <span class="step-text">${this.options.steps[0]}</span>
              </span>
              <span class="processing-linear__time time-text">3s remaining</span>
            </div>
            <div class="ui-progress-bar">
              <div class="ui-progress-bar__inner progress-bar-fill" style="width: 0%;"></div>
            </div>
          </div>

          <button type="button" class="btn btn--ghost btn--sm btn-cancel-processing" style="margin-top: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Cancel Processing</span>
          </button>
        </div>
      `;

      this.circleFill = this.container.querySelector(
        ".processing-circle__fill",
      );
      this.circleText = this.container.querySelector(
        ".processing-circle__text",
      );
      this.stepText = this.container.querySelector(".step-text");
      this.timeText = this.container.querySelector(".time-text");
      this.barFill = this.container.querySelector(".progress-bar-fill");

      const cancelBtn = this.container.querySelector(".btn-cancel-processing");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => this.cancel());
      }
    }

    updateProgressUI(percent, stepText, timeText) {
      if (this.circleText) this.circleText.textContent = `${percent}%`;
      if (this.barFill) this.barFill.style.width = `${percent}%`;
      if (this.stepText && stepText) this.stepText.textContent = stepText;
      if (this.timeText && timeText) this.timeText.textContent = timeText;

      if (this.circleFill) {
        const circumference = 264; // 2 * PI * 42
        const offset = circumference - (percent / 100) * circumference;
        this.circleFill.style.strokeDashoffset = offset;
      }
    }

    renderSuccessState(outputData) {
      this.state = "success";
      this.container.classList.remove("processing-card--active");

      this.container.innerHTML = `
        <div class="processing-state">
          <div class="processing-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <div>
            <div class="processing-state__title">Processing Complete!</div>
            <div class="processing-state__desc">Your file has been processed successfully and is ready for download.</div>
          </div>

          <!-- Reusable Download Card -->
          <div class="download-card">
            <div class="download-card__main">
              <div class="download-card__icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
              </div>
              <div class="download-card__details">
                <div class="download-card__title" title="${outputData.name}">${outputData.name}</div>
                <div class="download-card__meta">
                  <span>${outputData.size}</span>
                  <span>•</span>
                  <span class="badge badge--success badge--pill">High Quality</span>
                </div>
              </div>
            </div>

            <div class="download-card__actions">
              <button type="button" class="btn btn--primary btn-download">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download File</span>
              </button>
              <button type="button" class="btn btn--outline btn-copy-link" data-tooltip="Copy link to clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copy Link</span>
              </button>
              <button type="button" class="btn btn--ghost btn-share" data-tooltip="Share file">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>

          <button type="button" class="btn btn--ghost btn--sm btn-process-again">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            <span>Process Another File</span>
          </button>
        </div>
      `;

      const downloadBtn = this.container.querySelector(".btn-download");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          if (window.ComprexaToast)
            window.ComprexaToast.success("Download started!", "File Transfer");
        });
      }

      const copyBtn = this.container.querySelector(".btn-copy-link");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          if (window.ComprexaToast)
            window.ComprexaToast.info("Link copied to clipboard.", "Share");
        });
      }

      const shareBtn = this.container.querySelector(".btn-share");
      if (shareBtn) {
        shareBtn.addEventListener("click", () => {
          if (window.ComprexaToast)
            window.ComprexaToast.info("Share options opened.", "Share");
        });
      }

      const processAgainBtn =
        this.container.querySelector(".btn-process-again");
      if (processAgainBtn) {
        processAgainBtn.addEventListener("click", () =>
          this.renderReadyState(),
        );
      }

      if (window.ComprexaToast) {
        window.ComprexaToast.success(
          "Processing finished with 100% accuracy!",
          "Success",
        );
      }
    }

    renderError(msg = "An unexpected processing error occurred.") {
      this.state = "error";
      clearInterval(this.timer);
      this.container.classList.remove("processing-card--active");

      this.container.innerHTML = `
        <div class="processing-state">
          <div class="processing-error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>

          <div>
            <div class="processing-state__title">Processing Failed</div>
            <div class="processing-state__desc">We encountered an issue while processing your document.</div>
          </div>

          <div class="processing-error-box">
            ${msg}
          </div>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; width: 100%;">
            <button type="button" class="btn btn--primary btn-retry">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              <span>Retry Processing</span>
            </button>
            <button type="button" class="btn btn--outline btn-upload-new">
              <span>Upload New File</span>
            </button>
          </div>
        </div>
      `;

      const retryBtn = this.container.querySelector(".btn-retry");
      if (retryBtn)
        retryBtn.addEventListener("click", () => this.startProcessing());

      const uploadNewBtn = this.container.querySelector(".btn-upload-new");
      if (uploadNewBtn)
        uploadNewBtn.addEventListener("click", () => this.renderReadyState());

      if (window.ComprexaToast) {
        window.ComprexaToast.error(msg, "Error");
      }
    }

    cancel() {
      clearInterval(this.timer);
      if (window.ComprexaToast)
        window.ComprexaToast.info("Processing cancelled.", "Cancelled");
      this.renderReadyState();
    }
  }

  // Global Export
  window.ComprexaProcessor = ComprexaProcessor;

  // Auto-initialize elements with [data-processing-engine]
  document.querySelectorAll("[data-processing-engine]").forEach((el) => {
    new ComprexaProcessor(el);
  });

  // --------------------------------------------------------------------------
  // 15. Universal Tool Template Interactivity Engine
  // --------------------------------------------------------------------------

  // Compression slider live value listener
  const slider = document.getElementById("compression-range");
  const sliderVal = document.getElementById("compression-value-display");
  if (slider && sliderVal) {
    slider.addEventListener("input", (e) => {
      sliderVal.textContent = `${e.target.value}%`;
    });
  }

  // Tool settings form action buttons
  const saveSettingsBtn = document.getElementById("apply-settings-btn");
  const resetSettingsBtn = document.getElementById("reset-settings-btn");
  const settingsForm = document.getElementById("tool-settings-form");

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      if (window.ComprexaToast) {
        window.ComprexaToast.success(
          "Tool settings saved successfully.",
          "Settings",
        );
      }
    });
  }

  if (resetSettingsBtn && settingsForm) {
    resetSettingsBtn.addEventListener("click", () => {
      settingsForm.reset();
      if (slider && sliderVal) sliderVal.textContent = `${slider.value}%`;
      if (window.ComprexaToast) {
        window.ComprexaToast.info(
          "Settings reset to default options.",
          "Settings",
        );
      }
    });
  }

  // FAQ Accordion Toggle
  document.querySelectorAll(".faq-item__question").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", !isExpanded);
    });
  });

  // --------------------------------------------------------------------------
  // 16. Global Tool Framework Auto-Initialization
  // --------------------------------------------------------------------------
  if (window.ComprexaFramework) {
    const urlParams = new URLSearchParams(window.location.search);
    const activeToolId = urlParams.get("tool") || "merge-pdf";

    // Auto-render Breadcrumbs on tool pages
    const breadcrumbRoot = document.getElementById("breadcrumb-nav-root");
    if (breadcrumbRoot) {
      window.ComprexaFramework.renderBreadcrumbs(activeToolId, breadcrumbRoot);
    }

    // Auto-render Related Tools Grid on tool pages
    const relatedGridRoot = document.getElementById("related-tools-grid");
    if (relatedGridRoot) {
      window.ComprexaFramework.renderRelatedGrid(
        activeToolId,
        relatedGridRoot,
        4,
      );
    }

    // Auto-apply SEO metadata
    window.ComprexaFramework.applySEOMetadata(activeToolId);

    // Auto-render Universal SaaS Footer
    if (typeof window.ComprexaFramework.renderUniversalFooter === "function") {
      window.ComprexaFramework.renderUniversalFooter();
    }

    // Auto-record tool usage in settings
    if (
      window.ComprexaSettings &&
      window.location.pathname.includes("tool-template.html")
    ) {
      window.ComprexaSettings.recordToolUsage(activeToolId);
    }
  }

  // --------------------------------------------------------------------------
  // 17. Universal Workspace Progressive Disclosure Controller
  // --------------------------------------------------------------------------
  class WorkspaceProgressiveController {
    constructor() {
      this.initWorkspaces();
      this.bindEvents();
    }

    initWorkspaces() {
      document.querySelectorAll(".tool-workspace").forEach((ws) => {
        const uploaderEl = ws.querySelector("[data-file-uploader]");
        const uploaderInst = uploaderEl ? uploaderEl._uploaderInstance : null;
        if (
          uploaderInst &&
          uploaderInst.currentFiles &&
          uploaderInst.currentFiles.length > 0
        ) {
          ws.setAttribute("data-workspace-state", "has-file");
          this.updatePipeline(ws, 2);
        } else {
          ws.setAttribute("data-workspace-state", "empty");
          this.updatePipeline(ws, 1);
        }
      });
    }

    bindEvents() {
      document.addEventListener("comprexa:file-selected", (e) => {
        const ws =
          e.target && e.target.closest
            ? e.target.closest(".tool-workspace") ||
              document.querySelector(".tool-workspace")
            : document.querySelector(".tool-workspace");
        if (ws) {
          ws.setAttribute("data-workspace-state", "has-file");
          this.updatePipeline(ws, 2);
        }
      });

      document.addEventListener("comprexa:files-selected", (e) => {
        const ws =
          e.target && e.target.closest
            ? e.target.closest(".tool-workspace") ||
              document.querySelector(".tool-workspace")
            : document.querySelector(".tool-workspace");
        if (ws) {
          ws.setAttribute("data-workspace-state", "has-file");
          this.updatePipeline(ws, 2);
        }
      });

      document.addEventListener("comprexa:file-removed", (e) => {
        const ws =
          e.target && e.target.closest
            ? e.target.closest(".tool-workspace") ||
              document.querySelector(".tool-workspace")
            : document.querySelector(".tool-workspace");
        if (ws) {
          ws.setAttribute("data-workspace-state", "empty");
          this.updatePipeline(ws, 1);
        }
      });
    }

    updatePipeline(workspace, stepNum) {
      const pipeline = workspace.querySelector(".workspace-pipeline");
      if (!pipeline) return;

      const step1 =
        pipeline.querySelector("#pipeline-step-1") || pipeline.children[0];
      const step2 =
        pipeline.querySelector("#pipeline-step-2") || pipeline.children[2];
      const step3 =
        pipeline.querySelector("#pipeline-step-3") || pipeline.children[4];

      if (stepNum === 1) {
        if (step1) {
          step1.classList.add("pipeline-step--active");
          step1.classList.remove("pipeline-step--completed");
          const num1 = step1.querySelector(".pipeline-step__num");
          if (num1) num1.innerHTML = "1";
        }
        if (step2) {
          step2.classList.remove(
            "pipeline-step--active",
            "pipeline-step--completed",
          );
        }
        if (step3) {
          step3.classList.remove(
            "pipeline-step--active",
            "pipeline-step--completed",
          );
        }
      } else if (stepNum === 2) {
        if (step1) {
          step1.classList.remove("pipeline-step--active");
          step1.classList.add("pipeline-step--completed");
          const num1 = step1.querySelector(".pipeline-step__num");
          if (num1)
            num1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        }
        if (step2) {
          step2.classList.add("pipeline-step--active");
          step2.classList.remove("pipeline-step--completed");
        }
        if (step3) {
          step3.classList.remove(
            "pipeline-step--active",
            "pipeline-step--completed",
          );
        }
      } else if (stepNum === 3) {
        if (step1) {
          step1.classList.remove("pipeline-step--active");
          step1.classList.add("pipeline-step--completed");
        }
        if (step2) {
          step2.classList.remove("pipeline-step--active");
          step2.classList.add("pipeline-step--completed");
        }
        if (step3) {
          step3.classList.add("pipeline-step--active");
        }
      }
    }
  }

  window.ComprexaWorkspaceController = new WorkspaceProgressiveController();

  // --------------------------------------------------------------------------
  // 18. Dynamic Home Page Blog Grid
  // --------------------------------------------------------------------------
  const homeBlogGrid = document.getElementById("home-blog-grid");

  if (homeBlogGrid && window.ComprexaArticleRegistry) {
    const latestArticles = window.ComprexaArticleRegistry.getLatest(3);

    if (latestArticles && latestArticles.length > 0) {
      homeBlogGrid.innerHTML = "";

      latestArticles.forEach((article, index) => {
        const articleHTML = `
          <article class="blog-card fade-in-on-scroll visible" style="animation-delay: ${index * 100}ms; position: relative;">
            <a href="/article.html?id=${article.id}" class="blog-card__link-overlay" aria-label="Read ${article.title}" style="position: absolute; inset: 0; z-index: 10;"></a>
            <div class="blog-card__image-wrap">
              <div class="blog-card__placeholder-img ${article.imageClass || "blog-img-bg--tech"}">
                ${article.icon || ""}
              </div>
            </div>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span class="blog-card__category">${article.category}</span>
                <span class="blog-card__read-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${article.readTime}
                </span>
              </div>
              <h3 class="blog-card__title">
                <a href="/article.html?id=${article.id}" class="blog-article-link" style="position: relative; z-index: 20;">${article.title}</a>
              </h3>
              <p class="blog-card__excerpt">
                ${article.excerpt}
              </p>
              <div class="blog-card__footer">
                <a href="/article.html?id=${article.id}" class="blog-card__link blog-article-link" style="position: relative; z-index: 20;">
                  <span>Read Article</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </article>
        `;
        homeBlogGrid.insertAdjacentHTML("beforeend", articleHTML);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Floating Action Widget & Feedback Modal Implementation
  // --------------------------------------------------------------------------
  function initFloatingActions() {
    if (document.getElementById("floating-action-widget")) return;

    const widget = document.createElement("div");
    widget.id = "floating-action-widget";
    widget.className = "floating-action-widget";
    widget.innerHTML = `
      <div class="fab-menu" id="fab-menu">
        <a href="/contact.html" class="fab-btn fab-btn--sub" title="Need Help">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span class="fab-btn__tooltip">Need Help?</span>
        </a>
        <button type="button" class="fab-btn fab-btn--sub" id="fab-feedback-trigger" title="Feedback">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="fab-btn__tooltip">Send Feedback</span>
        </button>
        <button type="button" class="fab-btn fab-btn--primary" id="fab-back-to-top" title="Back to Top" aria-label="Back to Top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span class="fab-btn__tooltip">Back to Top</span>
        </button>
      </div>
    `;
    document.body.appendChild(widget);

    let lastScrollY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 300) {
          if (currentScrollY > lastScrollY + 10) {
            widget.classList.add("fab-hidden");
          } else if (currentScrollY < lastScrollY - 10) {
            widget.classList.remove("fab-hidden");
          }
          widget.classList.add("fab-visible");
        } else {
          widget.classList.remove("fab-visible");
          widget.classList.remove("fab-hidden");
        }
        lastScrollY = currentScrollY;
      },
      { passive: true },
    );

    const backToTop = document.getElementById("fab-back-to-top");
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const feedbackTrigger = document.getElementById("fab-feedback-trigger");
    if (feedbackTrigger) {
      feedbackTrigger.addEventListener("click", () => {
        ensureFeedbackModal();
        if (window.ComprexaModal) {
          window.ComprexaModal.open("feedback-modal");
        }
      });
    }
  }

  function ensureFeedbackModal() {
    if (document.getElementById("feedback-modal")) return;

    const modal = document.createElement("div");
    modal.id = "feedback-modal";
    modal.className = "ui-modal-backdrop";
    modal.innerHTML = `
      <div class="ui-modal ui-modal--sm" role="dialog" aria-labelledby="feedback-title" aria-modal="true">
        <div class="ui-modal__header">
          <h3 id="feedback-title" class="ui-modal__title">Send Feedback</h3>
          <button type="button" class="ui-modal__close" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="ui-modal__body">
          <p style="margin-bottom: 16px; font-size: 0.9rem;">We would love your thoughts or feature requests to make Comprexa even better.</p>
          <form id="feedback-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label class="ui-label">Rating</label>
              <div class="rating-stars" style="display: flex; gap: 8px; margin-top: 6px;">
                <button type="button" class="rating-star-btn" data-rating="1">★</button>
                <button type="button" class="rating-star-btn" data-rating="2">★</button>
                <button type="button" class="rating-star-btn" data-rating="3">★</button>
                <button type="button" class="rating-star-btn" data-rating="4">★</button>
                <button type="button" class="rating-star-btn active" data-rating="5">★</button>
              </div>
            </div>
            <div>
              <label class="ui-label" for="feedback-msg">Your Message</label>
              <textarea id="feedback-msg" class="ui-input" rows="4" placeholder="Tell us what you like or what could be improved..." required style="width: 100%; resize: vertical;"></textarea>
            </div>
            <div>
              <label class="ui-label" for="feedback-email">Email (Optional)</label>
              <input type="email" id="feedback-email" class="ui-input" placeholder="you@example.com" style="width: 100%;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
              <button type="button" class="btn btn--secondary" data-modal-close>Cancel</button>
              <button type="submit" class="btn btn--primary">Submit Feedback</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const stars = modal.querySelectorAll(".rating-star-btn");
    let selectedRating = 5;
    stars.forEach((s) => {
      s.addEventListener("click", () => {
        selectedRating = parseInt(s.dataset.rating, 10);
        stars.forEach((st, idx) => {
          if (idx < selectedRating) {
            st.classList.add("active");
          } else {
            st.classList.remove("active");
          }
        });
      });
    });

    const form = modal.querySelector("#feedback-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (window.ComprexaModal) window.ComprexaModal.close("feedback-modal");
        if (window.ComprexaToast) {
          window.ComprexaToast.success(
            "Thank you! Your feedback has been received.",
            "Feedback Sent",
          );
        }
        form.reset();
      });
    }
  }

  function initAnimatedCounters() {
    const statValues = document.querySelectorAll(
      ".stats-card__value[data-count]",
    );
    if (statValues.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-count"), 10);
            const suffix = el.getAttribute("data-suffix") || "";
            let current = 0;
            const duration = 1200;
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(current) + suffix;
              }
            }, stepTime);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 },
    );

    statValues.forEach((el) => observer.observe(el));
  }

  // --------------------------------------------------------------------------
  // Global Loader Engine
  // --------------------------------------------------------------------------
  function initGlobalLoader() {
    let loader = document.getElementById("global-loader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "global-loader";
      loader.className = "global-loader";
      loader.innerHTML = `
        <div class="global-loader__card">
          <div class="global-loader__logo-wrap">
            <div class="global-loader__glow"></div>
            <svg class="global-loader__logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <div class="global-loader__brand">Comprexa</div>
          <div class="global-loader__text" id="global-loader-text">Preparing Application...</div>
          <div class="global-loader__bar">
            <div class="global-loader__progress"></div>
          </div>
          <div class="global-loader__particles">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    }

    window.ComprexaLoader = {
      show: function (msg = "Loading...") {
        const txt = document.getElementById("global-loader-text");
        if (txt) txt.textContent = msg;
        loader.classList.remove("loader--hidden");
      },
      hide: function () {
        loader.classList.add("loader--hidden");
      },
      setText: function (msg) {
        const txt = document.getElementById("global-loader-text");
        if (txt) txt.textContent = msg;
      },
    };

    // Smoothly hide loader after small threshold on load
    const hideLoaderNow = () => {
      setTimeout(() => {
        if (window.ComprexaLoader) window.ComprexaLoader.hide();
      }, 150);
    };

    if (document.readyState === "complete") {
      hideLoaderNow();
    } else {
      window.addEventListener("load", hideLoaderNow, { once: true });
      setTimeout(hideLoaderNow, 600); // Fallback limit
    }
  }

  // --------------------------------------------------------------------------
  // Smooth Page Transitions Engine
  // --------------------------------------------------------------------------
  function initPageTransitions() {
    // Entrance animation
    document.body.classList.remove("page-entering");

    // Intercept internal link clicks
    document.addEventListener("click", (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip non-navigational links
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if same origin or relative internal page
      const currentHost = window.location.host;
      let targetUrl;
      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch (err) {
        return;
      }

      if (
        targetUrl.host === currentHost &&
        targetUrl.pathname !== window.location.pathname
      ) {
        e.preventDefault();

        // Trigger page exit transition
        document.body.classList.add("page-exiting");
        if (window.ComprexaLoader) {
          window.ComprexaLoader.show("Opening Page...");
        }

        const navigate = () => { window.location.href = targetUrl.href; };

        // Use Document-Level View Transitions if available and fast
        // We reduce the artificial delay to 50ms to feel much faster
        // while still allowing the loader to show up briefly.
        setTimeout(navigate, 50);
      }
    });

    // Handle browser back/forward (bfcache)
    window.addEventListener("pageshow", (event) => {
      document.body.classList.remove("page-exiting", "page-entering");
      if (window.ComprexaLoader) {
        window.ComprexaLoader.hide();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Smart Route Prefetching
  // --------------------------------------------------------------------------
  function initRoutePrefetching() {
    const prefetchedUrls = new Set();
    const prefetch = (url) => {
      if (prefetchedUrls.has(url)) return;
      prefetchedUrls.add(url);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    };

    // Proactively prefetch critical routes on idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const routes = ['/', '/blog.html', '/about.html', '/contact.html', '/privacy.html', '/terms.html'];
        routes.forEach(url => prefetch(url));
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        const routes = ['/', '/blog.html', '/about.html', '/contact.html', '/privacy.html', '/terms.html'];
        routes.forEach(url => prefetch(url));
      }, 3000);
    }

    document.addEventListener(
      "pointerover",
      (e) => {
        const anchor = e.target.closest("a[href]");
        if (anchor && anchor.origin === window.location.origin) {
          const href = anchor.getAttribute("href");
          if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("javascript:")
          ) {
            prefetch(anchor.href);
          }
        }
      },
      { passive: true },
    );

    document.addEventListener(
      "touchstart",
      (e) => {
        const anchor = e.target.closest("a[href]");
        if (anchor && anchor.origin === window.location.origin) {
          const href = anchor.getAttribute("href");
          if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("javascript:")
          ) {
            prefetch(anchor.href);
          }
        }
      },
      { passive: true },
    );
  }

  // --------------------------------------------------------------------------
  // GitHub-Style Scroll Reveal & Stagger Engine
  // --------------------------------------------------------------------------
  function initScrollRevealEngine() {
    // Select elements to reveal
    const revealTargets = document.querySelectorAll(
      ".fade-in-on-scroll, [data-reveal], section:not(.hero-section), .tool-card, .blog-card, .category-card, .stats-card, .faq-item, .why-choose-card",
    );

    revealTargets.forEach((el) => {
      if (!el.classList.contains("fade-in-on-scroll")) {
        el.classList.add("fade-in-on-scroll");
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200 && rect.bottom > -100) {
        el.classList.add("visible");
      }
    });

    // Auto-add stagger-children to grid parents
    const grids = document.querySelectorAll(
      ".popular-grid, .popular-tools__grid, .categories-grid, .articles-grid, .features-grid, .stats-grid",
    );
    grids.forEach((grid) => grid.classList.add("stagger-children"));

    if ("IntersectionObserver" in window && revealTargets.length > 0) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "100px 0px 100px 0px",
          threshold: 0.01,
        },
      );

      revealTargets.forEach((el) => observer.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add("visible"));
    }
  }

  // --------------------------------------------------------------------------
  // Upload Zone Interactive Polish
  // --------------------------------------------------------------------------
  function initUploadMicroInteractions() {
    const uploadZones = document.querySelectorAll(
      ".ui-upload-area, .upload-drop-zone, .drop-zone",
    );
    uploadZones.forEach((zone) => {
      ["dragenter", "dragover"].forEach((eventName) => {
        zone.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add("drag-over");
          },
          false,
        );
      });

      ["dragleave", "drop"].forEach((eventName) => {
        zone.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove("drag-over");
            if (eventName === "drop") {
              zone.classList.add("drop-bounce");
              setTimeout(() => zone.classList.remove("drop-bounce"), 350);
            }
          },
          false,
        );
      });
    });
  }

  // --------------------------------------------------------------------------
  // Image Blur-Up Loading
  // --------------------------------------------------------------------------
  function initImageBlurUp() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (
        !img.hasAttribute("loading") &&
        !img.closest(".site-header") &&
        !img.closest(".global-loader")
      ) {
        img.setAttribute("loading", "lazy");
      }
      img.classList.add("lazy-blur");

      if (img.complete) {
        img.classList.add("img-loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("img-loaded"), {
          once: true,
        });
        img.addEventListener("error", () => img.classList.add("img-loaded"), {
          once: true,
        });
      }
    });
  }

  // Auto-render universal footer on all pages
  if (window.ComprexaFramework && typeof window.ComprexaFramework.renderUniversalFooter === "function") {
    const footerExists = document.querySelector('footer.site-footer');
    if (footerExists && footerExists.innerHTML.trim() === "") {
        window.ComprexaFramework.renderUniversalFooter(footerExists);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initComprexaApp);
} else {
  initComprexaApp();
}
