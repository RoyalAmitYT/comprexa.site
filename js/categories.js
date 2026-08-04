/**
 * Comprexa Global Category Registry
 * Reusable category definitions and styling metadata
 */

const COMPREXA_CATEGORIES = [
  {
    id: "document",
    slug: "document-tools",
    name: "Document Tools",
    shortName: "Document",
    description:
      "Process Word documents, Excel spreadsheets, PPT presentations, and text files.",
    colorToken: "icon-bg--doc",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  },
  {
    id: "pdf",
    slug: "pdf-tools",
    name: "PDF Tools",
    shortName: "PDF",
    description:
      "Merge, split, compress, convert and edit PDF documents locally.",
    colorToken: "icon-bg--pdf",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`,
  },
  {
    id: "image",
    slug: "image-tools",
    name: "Image Tools",
    shortName: "Image",
    description:
      "Compress, resize, convert, and edit PNG, JPG, WebP, and SVG images.",
    colorToken: "icon-bg--image",
    badgeColor: "badge--success",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  },
  {
    id: "converter",
    slug: "converter-tools",
    name: "Converter Tools",
    shortName: "Converter",
    description:
      "Transform documents, audio, video, and formats with zero quality loss.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--warning",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
  },
  {
    id: "qr",
    slug: "qr-tools",
    name: "QR Tools",
    shortName: "QR Code",
    description:
      "Generate customizable vector QR codes and scan/decode QR images.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/></svg>`,
  },
  {
    id: "developer",
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Developer",
    description:
      "Format JSON, calculate file hashes, edit Markdown, encode/decode strings.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--subtle",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  },
  {
    id: "text",
    slug: "text-tools",
    name: "Text Tools",
    shortName: "Text",
    description:
      "Count words, generate strong passwords, analyze text readability & cases.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--subtle",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  {
    id: "color",
    slug: "color-tools",
    name: "Color Tools",
    shortName: "Color",
    description:
      "Pick, convert, inspect, and generate harmonious color schemes and palettes.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.43-.17-.83-.44-1.14-.29-.33-.46-.77-.46-1.21 0-.93.75-1.7 1.68-1.7H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg>`,
  },
  {
    id: "utilities",
    slug: "utility-tools",
    name: "Utility Tools",
    shortName: "Utilities",
    description:
      "Generators, security helpers, color pickers, and everyday digital tools.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  },
  {
    id: "ai",
    slug: "ai-tools",
    name: "AI Tools",
    shortName: "AI",
    description:
      "Generative AI content creation, smart summarizers, and prompt intelligence.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--warning",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><circle cx="12" cy="12" r="10"/></svg>`,
  },
  {
    id: "audio",
    slug: "audio-tools",
    name: "Audio Tools",
    shortName: "Audio",
    description:
      "Trim, convert, compress, and edit audio files directly in browser.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  },
  {
    id: "video",
    slug: "video-tools",
    name: "Video Tools",
    shortName: "Video",
    description:
      "Compress, trim, convert, and extract frames from MP4, WebM, and AVI videos.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--success",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>`,
  },
  {
    id: "ocr",
    slug: "ocr-tools",
    name: "OCR Tools",
    shortName: "OCR",
    description:
      "Extract text from scanned documents, images, and PDF pages with optical character recognition.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--primary",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>`,
  },
  {
    id: "integrations",
    slug: "integration-tools",
    name: "External Integrations",
    shortName: "Integrations",
    description:
      "Connect cloud drives, Webhooks, and external cloud service APIs.",
    colorToken: "icon-bg--utility",
    badgeColor: "badge--subtle",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
];

class ComprexaCategoryRegistry {
  constructor(categories = COMPREXA_CATEGORIES) {
    this.categories = categories;
    this.categoryMap = new Map();
    this.slugMap = new Map();
    this._index();
  }

  _index() {
    this.categoryMap.clear();
    this.slugMap.clear();
    this.categories.forEach((c) => {
      this.categoryMap.set(c.id.toLowerCase(), c);
      this.slugMap.set(c.slug.toLowerCase(), c);
    });
  }

  getAll() {
    return this.categories;
  }

  getById(id) {
    if (!id) return null;
    const key = id.toLowerCase();
    return (
      this.categoryMap.get(key) ||
      this.categories.find(
        (c) =>
          c.name.toLowerCase() === key || c.shortName.toLowerCase() === key,
      ) ||
      null
    );
  }

  getBySlug(slug) {
    if (!slug) return null;
    return this.slugMap.get(slug.toLowerCase()) || null;
  }

  registerCategory(catConfig) {
    if (!catConfig || !catConfig.id) return null;
    const existing = this.getById(catConfig.id);
    if (existing) {
      Object.assign(existing, catConfig);
      this._index();
      return existing;
    }
    const normalized = {
      id: catConfig.id.toLowerCase(),
      slug: catConfig.slug || `${catConfig.id.toLowerCase()}-tools`,
      name: catConfig.name || catConfig.id,
      shortName: catConfig.shortName || catConfig.name || catConfig.id,
      description: catConfig.description || "",
      colorToken: catConfig.colorToken || "icon-bg--utility",
      badgeColor: catConfig.badgeColor || "badge--primary",
      icon: catConfig.icon || "",
    };
    this.categories.push(normalized);
    this._index();
    return normalized;
  }
}

// Global Export
window.ComprexaCategories = new ComprexaCategoryRegistry();
