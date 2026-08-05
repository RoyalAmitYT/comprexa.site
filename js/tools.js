/**
 * Comprexa Global Tool Registry
 * Central metadata repository for 100+ file utilities & processing tools
 */

const COMPREXA_TOOLS_REGISTRY = [
  // --- PDF TOOLS ---
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    title: "Merge PDF",
    shortDescription:
      "Combine multiple PDF documents into a single organized file with zero quality loss.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: true,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "merge",
      "combine",
      "join",
      "append",
      "binder",
      "documents",
    ],
    relatedTools: ["split-pdf", "compress-pdf", "pdf-to-word", "rotate-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a1 1 0 0 0 1 1h4"/><path d="M12 11v6"/><path d="m9 14 3-3 3 3"/></svg>`,
    seo: {
      title: "Merge PDF Files Online — Free & Secure | Comprexa",
      metaDescription:
        "Combine multiple PDF documents into a single organized file directly in your browser. Fast, 100% private, and free with zero file limits.",
      canonicalUrl: "https://comprexa.app/tools/merge-pdf",
      keywords:
        "merge pdf, combine pdf online, join pdf files, pdf binder, free pdf joiner",
    },
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    title: "Split PDF",
    shortDescription:
      "Extract specific pages or split PDF documents into separate individual files.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Fast",
    featured: true,
    popular: false,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: ["pdf", "split", "extract", "pages", "cut", "separate", "range"],
    relatedTools: ["merge-pdf", "compress-pdf", "pdf-to-word", "rotate-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2v4a1 1 0 0 0 1 1h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    seo: {
      title: "Split PDF Online — Extract PDF Pages Free | Comprexa",
      metaDescription:
        "Split large PDF documents into separate files or extract specific page ranges instantly without cloud uploads.",
      canonicalUrl: "https://comprexa.app/tools/split-pdf",
      keywords:
        "split pdf, extract pdf pages, separate pdf, cut pdf pages online",
    },
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    title: "Rotate PDF",
    shortDescription:
      "Rotate PDF pages 90° clockwise, counter-clockwise, or 180° permanently with custom page selection.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "rotate",
      "turn",
      "orientation",
      "pages",
      "degree",
      "angle",
      "landscape",
      "portrait",
    ],
    relatedTools: ["split-pdf", "merge-pdf", "compress-pdf", "organize-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
    seo: {
      title: "Rotate PDF Online — Free & Permanent PDF Rotation | Comprexa",
      metaDescription:
        "Rotate PDF pages 90 or 180 degrees online instantly. Rotate all or selected pages 100% free with browser-first privacy.",
      canonicalUrl: "https://comprexa.app/rotate-pdf.html",
      keywords:
        "rotate pdf, rotate pdf online, turn pdf pages, flip pdf 90 degrees",
    },
  },
  {
    id: "organize-pdf",
    slug: "organize-pdf",
    title: "Organize PDF",
    shortDescription:
      "Reorder, rotate, delete, duplicate, or move PDF pages visually in a responsive workspace.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "organize",
      "reorder",
      "sort",
      "delete pages",
      "duplicate",
      "arrange",
      "rearrange",
      "move",
    ],
    relatedTools: ["split-pdf", "merge-pdf", "rotate-pdf", "delete-pdf", "compress-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    seo: {
      title:
        "Organize PDF Online — Visual PDF Page Reorder & Delete | Comprexa",
      metaDescription:
        "Reorder, delete, rotate, move, and duplicate PDF pages visually online. Free browser-first PDF page organizer with instant preview.",
      canonicalUrl: "https://comprexa.app/organize-pdf.html",
      keywords:
        "organize pdf, reorder pdf pages, delete pdf pages, rearrange pdf, rearrange pages online",
    },
  },
  {
    id: "delete-pdf",
    slug: "delete-pdf",
    title: "Delete PDF Pages",
    shortDescription:
      "Remove unwanted pages, blank sheets, and confidential sections from PDF documents online.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "delete",
      "remove pages",
      "delete pdf pages",
      "remove pdf pages",
      "erase pages",
      "purge pdf",
    ],
    relatedTools: ["extract-pdf", "organize-pdf", "split-pdf", "rotate-pdf", "merge-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    seo: {
      title:
        "Delete PDF Pages Online — Remove PDF Pages Fast & Free | Comprexa",
      metaDescription:
        "Delete unwanted pages from PDF files online. Visual page selection, multi-page remove, undo support, and 100% private browser processing.",
      canonicalUrl: "https://comprexa.app/delete-pdf.html",
      keywords:
        "delete pdf pages, remove pages from pdf, delete pages pdf online, free pdf page remover",
    },
  },
  {
    id: "extract-pdf",
    slug: "extract-pdf",
    title: "Extract PDF Pages",
    shortDescription:
      "Select and extract specific pages or ranges from any PDF into a brand new PDF file instantly.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "extract",
      "extract pages",
      "extract pdf pages",
      "save selected pages",
      "pull pages from pdf",
      "separate pdf pages",
    ],
    relatedTools: ["delete-pdf", "split-pdf", "organize-pdf", "merge-pdf", "watermark-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><polyline points="9 15 12 12 15 15"/></svg>`,
    seo: {
      title:
        "Extract PDF Pages Online — Separate & Save PDF Pages Free | Comprexa",
      metaDescription:
        "Extract specific pages or page ranges from PDF files online. Visual page selection, instant preview, 100% private client-side processing.",
      canonicalUrl: "https://comprexa.app/extract-pdf.html",
      keywords:
        "extract pdf pages, pull pages from pdf, extract pages online, separate pdf pages, save selected pdf pages",
    },
  },
  {
    id: "watermark-pdf",
    slug: "watermark-pdf",
    title: "Watermark PDF",
    shortDescription:
      "Add text or image watermarks to PDF files with custom positioning, font, color, opacity, and rotation controls.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "New",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "watermark",
      "watermark pdf",
      "add watermark to pdf",
      "pdf text watermark",
      "pdf image watermark",
      "brand pdf",
      "stamp pdf",
    ],
    relatedTools: ["extract-pdf", "organize-pdf", "split-pdf", "rotate-pdf", "compress-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>`,
    seo: {
      title:
        "Watermark PDF Online — Add Text & Image Watermarks Free | Comprexa",
      metaDescription:
        "Add custom text or logo image watermarks to PDF documents online. Full control over position, opacity, font, size, rotation, and page selection. 100% private.",
      canonicalUrl: "https://comprexa.app/watermark-pdf.html",
      keywords:
        "watermark pdf, add watermark to pdf, pdf text watermark, pdf logo watermark, stamp pdf online, brand pdf document",
    },
  },
  {
    id: "protect-pdf",
    slug: "protect-pdf",
    title: "Protect PDF",
    shortDescription:
      "Encrypt and password-protect your PDF documents with enterprise security and permission controls.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Security",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "protect",
      "encrypt",
      "password",
      "secure",
      "lock",
      "pdf security",
      "password protect pdf",
    ],
    relatedTools: ["unlock-pdf", "watermark-pdf", "organize-pdf", "split-pdf", "merge-pdf", "compress-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    seo: {
      title:
        "Protect PDF Online — Password Protect & Encrypt PDF Free | Comprexa",
      metaDescription:
        "Secure your PDF documents with custom passwords and encryption. 100% private client-side PDF protection with permission control.",
      canonicalUrl: "https://comprexa.app/protect-pdf.html",
      keywords:
        "protect pdf, password protect pdf, encrypt pdf online, secure pdf, lock pdf document",
    },
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    title: "Unlock PDF",
    shortDescription:
      "Remove password protection and restrictions from encrypted PDF files quickly and securely.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Security",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "unlock",
      "remove password",
      "decrypt pdf",
      "pdf password remover",
      "unprotect pdf",
      "unlock pdf online",
    ],
    relatedTools: ["protect-pdf", "compress-pdf", "merge-pdf", "split-pdf", "watermark-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    seo: {
      title: "Unlock PDF Online — Remove Password from PDF Free | Comprexa",
      metaDescription:
        "Remove passwords and encryption from protected PDF files online. Fast, secure, 100% client-side PDF password removal tool.",
      canonicalUrl: "https://comprexa.app/unlock-pdf.html",
      keywords:
        "unlock pdf, remove password from pdf, pdf password remover, decrypt pdf online, unprotect pdf free",
    },
  },
  {
    id: "pdf-to-images",
    slug: "pdf-to-images",
    title: "PDF to Images",
    shortDescription:
      "Convert PDF pages into high-quality PNG, JPG, or WebP image files with custom DPI and range controls.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Convert",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "images",
    keywords: [
      "pdf",
      "pdf to images",
      "pdf to jpg",
      "pdf to png",
      "pdf to webp",
      "convert pdf to image",
      "pdf image converter",
      "export pdf pages as images",
    ],
    relatedTools: ["compress-pdf", "merge-pdf", "split-pdf", "extract-pdf", "watermark-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M14 2v4a1 1 0 0 0 1 1h4"/></svg>`,
    seo: {
      title:
        "PDF to Images Online — Convert PDF to PNG, JPG & WebP Free | Comprexa",
      metaDescription:
        "Convert PDF pages into high-resolution PNG, JPG, or WebP images online. Choose page ranges, quality levels, and DPI resolutions with 100% private client-side processing.",
      canonicalUrl: "https://comprexa.app/pdf-to-images.html",
      keywords:
        "pdf to images, convert pdf to jpg, pdf to png online, export pdf pages as images, high resolution pdf to image",
    },
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    title: "Compress PDF",
    shortDescription:
      "Reduce PDF file size significantly while preserving text clarity and image resolutions.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Lossless",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: true,
    outputFormat: "pdf",
    keywords: [
      "pdf",
      "compress",
      "shrink",
      "reduce",
      "size",
      "small",
      "optimize",
    ],
    relatedTools: ["merge-pdf", "split-pdf", "protect-pdf", "unlock-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a1 1 0 0 0 1 1h4"/><path d="M12 17v-6"/><path d="m9 14 3 3 3-3"/></svg>`,
    seo: {
      title: "Compress PDF Online — Reduce PDF File Size | Comprexa",
      metaDescription:
        "Shrink PDF file sizes up to 90% without losing visual quality. 100% browser-based compression.",
      canonicalUrl: "https://comprexa.app/tools/compress-pdf",
      keywords:
        "compress pdf, shrink pdf size, reduce pdf file size, optimize pdf",
    },
  },
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    title: "PDF to Word",
    shortDescription:
      "Convert non-editable PDF documents into fully customizable Microsoft Word (.docx) files.",
    category: "pdf",
    categoryName: "PDF Tools",
    badge: "Convert",
    featured: false,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--pdf",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "docx",
    keywords: ["pdf", "word", "docx", "doc", "convert", "edit", "ocr"],
    relatedTools: ["merge-pdf", "compress-pdf", "split-pdf", "rotate-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`,
    seo: {
      title: "Convert PDF to Word Online — Free & Editable | Comprexa",
      metaDescription:
        "Convert PDF documents to Microsoft Word (.docx) files accurately with layout and font formatting intact.",
      canonicalUrl: "https://comprexa.app/tools/pdf-to-word",
      keywords:
        "pdf to word, convert pdf to docx, edit pdf in word, free pdf converter",
    },
  },

  // --- IMAGE TOOLS ---
  {
    id: "compress-image",
    slug: "compress-image",
    title: "Compress Image",
    shortDescription:
      "Shrink JPG, PNG, WebP image file sizes by up to 90% while preserving maximum visual quality.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Lossless",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["jpg", "jpeg", "png", "webp", "avif", "heic"],
    acceptsMultipleFiles: true,
    outputFormat: "optimized_image",
    keywords: [
      "image",
      "photo",
      "compress",
      "shrink",
      "png",
      "jpg",
      "jpeg",
      "webp",
      "optimize",
      "file size",
    ],
    relatedTools: ["resize-image", "crop-image", "png-to-jpg", "jpg-to-png"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    seo: {
      title:
        "Compress Image Online — Reduce JPG, PNG, WebP File Size | Comprexa",
      metaDescription:
        "Optimize and shrink image file sizes online in seconds without visual quality loss. 100% private client-side processing.",
      canonicalUrl: "https://comprexa.app/compress-image.html",
      keywords:
        "compress image, reduce image size, shrink png, shrink jpg size, webp optimizer, image compressor online",
    },
  },
  {
    id: "resize-image",
    slug: "resize-image",
    title: "Resize Image",
    shortDescription:
      "Resize photos by custom pixel dimensions, percentage scales, or social media aspect ratio presets.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Precision",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "svg",
      "bmp",
      "avif",
      "heic",
    ],
    acceptsMultipleFiles: true,
    outputFormat: "resized_image",
    keywords: [
      "image",
      "resize",
      "dimensions",
      "crop",
      "width",
      "height",
      "scale",
      "pixels",
      "aspect ratio",
      "social media presets",
    ],
    relatedTools: ["compress-image", "png-to-jpg", "jpg-to-png", "crop-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M21 3l-7 7"/><path d="M9 21H3v-6"/><path d="M3 21l7-7"/></svg>`,
    seo: {
      title: "Resize Image Online — Change Photo Dimensions & Scale | Comprexa",
      metaDescription:
        "Resize images online with accurate aspect ratio lock, custom pixels, percentage scales, and social media presets.",
      canonicalUrl: "https://comprexa.app/resize-image.html",
      keywords:
        "resize image, change photo dimensions, scale image pixels, aspect ratio resizer, photo dimension editor",
    },
  },
  {
    id: "crop-image",
    slug: "crop-image",
    title: "Crop Image",
    shortDescription:
      "Crop photos with pixel precision using custom selection handles, aspect ratios, and social media presets.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Precision",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["jpg", "jpeg", "png", "webp", "avif", "heic"],
    acceptsMultipleFiles: true,
    outputFormat: "cropped_image",
    keywords: [
      "crop",
      "image",
      "photo",
      "cut",
      "trim",
      "aspect ratio",
      "social media",
      "instagram",
      "youtube",
    ],
    relatedTools: ["resize-image", "rotate-image", "compress-image", "convert-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`,
    seo: {
      title:
        "Crop Image Online — Free Photo Cropper with Aspect Ratio Presets | Comprexa",
      metaDescription:
        "Crop JPG, PNG, WebP images online with custom selection handles, 16:9, 1:1, 4:3 aspect ratio locking, and social media presets.",
      canonicalUrl: "https://comprexa.app/crop-image.html",
      keywords:
        "crop image online, image cropper, photo cropper, crop png, crop jpg, aspect ratio crop, social media photo cropper",
    },
  },
  {
    id: "rotate-image",
    slug: "rotate-image",
    title: "Rotate & Flip Image",
    shortDescription:
      "Rotate photos 90°, 180°, 270° or custom angles, and flip horizontally or vertically with zero quality loss.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Instant",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["jpg", "jpeg", "png", "webp", "avif", "heic"],
    acceptsMultipleFiles: true,
    outputFormat: "rotated_image",
    keywords: [
      "rotate",
      "flip",
      "image",
      "photo",
      "turn",
      "mirror",
      "orientation",
      "angle",
      "horizontal",
      "vertical",
    ],
    relatedTools: ["crop-image", "resize-image", "compress-image", "convert-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
    seo: {
      title:
        "Rotate & Flip Image Online — Free Photo Orientation Tool | Comprexa",
      metaDescription:
        "Rotate images 90, 180, 270 degrees or custom angles, and mirror flip horizontally or vertically online with 100% privacy.",
      canonicalUrl: "https://comprexa.app/rotate-image.html",
      keywords:
        "rotate image online, flip photo, mirror image, rotate 90 degrees, horizontal flip, vertical flip",
    },
  },
  {
    id: "convert-image",
    slug: "convert-image",
    title: "Image Converter",
    shortDescription:
      "Convert images between JPG, PNG, WebP, AVIF, and HEIC formats with maximum color fidelity.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif",
      "heic",
      "bmp",
      "gif",
      "tiff",
    ],
    acceptsMultipleFiles: true,
    outputFormat: "converted_image",
    keywords: [
      "convert",
      "image converter",
      "jpg to png",
      "png to jpg",
      "webp converter",
      "heic to jpg",
      "avif to png",
      "format conversion",
    ],
    relatedTools: ["compress-image", "resize-image", "watermark-image", "crop-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
    seo: {
      title:
        "Universal Image Converter Online — Convert JPG, PNG, WebP Free | Comprexa",
      metaDescription:
        "Convert image files online instantly between JPG, PNG, WebP, AVIF, and HEIC formats with custom quality and background controls. 100% private client-side processing.",
      canonicalUrl: "https://comprexa.app/convert-image.html",
      keywords:
        "image converter, convert jpg to png, convert png to webp, convert heic to jpg, batch image converter",
    },
  },
  {
    id: "watermark-image",
    slug: "watermark-image",
    title: "Watermark Image",
    shortDescription:
      "Apply custom text or logo image watermarks to photos with precise positioning, rotation, font, and opacity controls.",
    category: "image",
    categoryName: "Image Tools",
    badge: "New",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["jpg", "jpeg", "png", "webp", "avif", "heic"],
    acceptsMultipleFiles: true,
    outputFormat: "watermarked_image",
    keywords: [
      "watermark",
      "watermark image",
      "add text to photo",
      "add logo to image",
      "batch watermark",
      "protect photo",
      "photo stamp",
    ],
    relatedTools: ["convert-image", "crop-image", "resize-image", "compress-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><circle cx="12" cy="12" r="10"/></svg>`,
    seo: {
      title:
        "Watermark Image Online — Add Text & Logo Watermark Free | Comprexa",
      metaDescription:
        "Add text or logo watermarks to your photos online. Custom font styling, opacity, 9-grid position, rotation, and batch export to ZIP.",
      canonicalUrl: "https://comprexa.app/watermark-image.html",
      keywords:
        "watermark image, add watermark to photo, batch photo watermark, image logo stamp, protect images",
    },
  },
  {
    id: "png-to-jpg",
    slug: "png-to-jpg",
    title: "PNG to JPG",
    shortDescription:
      "Convert PNG graphics to high-density JPG format with customizable background fills.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Instant",
    featured: false,
    popular: false,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["png"],
    acceptsMultipleFiles: true,
    outputFormat: "jpg",
    keywords: ["png", "jpg", "jpeg", "convert", "image", "format"],
    relatedTools: ["jpg-to-png", "compress-image", "resize-image", "crop-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    seo: {
      title: "Convert PNG to JPG Online Free — Comprexa",
      metaDescription:
        "Batch convert PNG images to JPG format instantly with crisp color preservation.",
      canonicalUrl: "https://comprexa.app/png-to-jpg.html",
      keywords: "png to jpg, convert png to jpeg, image format converter",
    },
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    title: "JPG to PNG",
    shortDescription:
      "Convert JPG photos into lossless PNG format with transparent alpha background support.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Alpha",
    featured: false,
    popular: false,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["jpg", "jpeg"],
    acceptsMultipleFiles: true,
    outputFormat: "png",
    keywords: ["jpg", "jpeg", "png", "transparent", "convert", "image"],
    relatedTools: ["png-to-jpg", "compress-image", "resize-image", "crop-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
    seo: {
      title: "Convert JPG to PNG Online Free — Comprexa",
      metaDescription:
        "Convert JPG photos to high quality PNG format with transparent alpha channels.",
      canonicalUrl: "https://comprexa.app/jpg-to-png.html",
      keywords: "jpg to png, convert jpeg to png, lossless image conversion",
    },
  },
  {
    id: "webp-to-png",
    slug: "webp-to-png",
    title: "WebP to PNG",
    shortDescription:
      "Convert WebP images into transparent PNG format with full resolution and alpha channel preservation.",
    category: "image",
    categoryName: "Image Tools",
    badge: "Alpha",
    featured: false,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--image",
    supportedFileTypes: ["webp"],
    acceptsMultipleFiles: true,
    outputFormat: "png",
    keywords: [
      "webp",
      "png",
      "convert",
      "image",
      "format",
      "transparency",
      "alpha",
      "batch",
    ],
    relatedTools: ["jpg-to-png", "png-to-jpg", "convert-image", "compress-image"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m21 15-3-3a2 2 0 0 0-2.8 0L6 21"/></svg>`,
    seo: {
      title: "Convert WebP to PNG Online Free — Comprexa",
      metaDescription:
        "Convert WebP images to high quality transparent PNG format with batch ZIP export directly in your browser.",
      canonicalUrl: "https://comprexa.app/webp-to-png.html",
      keywords:
        "webp to png, convert webp to png, webp image converter, transparent png from webp",
    },
  },


  // --- DOCUMENT TOOLS ---
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    title: "Word to PDF",
    shortDescription:
      "Convert Microsoft Word documents (.docx, .doc) into high-quality PDF files instantly.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["docx", "doc"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "word",
      "docx",
      "doc",
      "pdf",
      "word to pdf",
      "convert docx to pdf",
      "document converter",
    ],
    relatedTools: ["excel-to-pdf", "powerpoint-to-pdf", "word-to-jpg", "word-to-txt"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`,
    seo: {
      title: "Word to PDF Online — Convert DOCX & DOC to PDF Free | Comprexa",
      metaDescription:
        "Convert Word documents (.docx) to PDF format online in seconds. Preserves fonts, paragraph layout, and headers with 100% private browser processing.",
      canonicalUrl: "https://comprexa.app/word-to-pdf.html",
      keywords:
        "word to pdf, convert docx to pdf, doc to pdf online, free word pdf converter",
    },
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    shortDescription:
      "Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean formatted PDF documents.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["xlsx", "xls", "csv"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "excel",
      "xlsx",
      "xls",
      "csv",
      "pdf",
      "excel to pdf",
      "convert spreadsheet to pdf",
      "table to pdf",
    ],
    relatedTools: ["pdf-to-excel", "word-to-pdf", "powerpoint-to-pdf", "document-metadata-viewer"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6" rx="1"/><path d="M8 15h8"/><path d="M12 12v6"/></svg>`,
    seo: {
      title:
        "Excel to PDF Online — Convert XLSX & Spreadsheets to PDF Free | Comprexa",
      metaDescription:
        "Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean, professional PDF files directly in your browser. Choose sheet range, orientation, and gridlines.",
      canonicalUrl: "https://comprexa.app/excel-to-pdf.html",
      keywords:
        "excel to pdf, convert xlsx to pdf, spreadsheet to pdf, csv to pdf online",
    },
  },
  {
    id: "powerpoint-to-pdf",
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    shortDescription:
      "Convert PowerPoint presentation slides (.pptx, .ppt) into PDF format with original layout.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Convert",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["pptx", "ppt"],
    acceptsMultipleFiles: false,
    outputFormat: "pdf",
    keywords: [
      "powerpoint",
      "pptx",
      "ppt",
      "pdf",
      "powerpoint to pdf",
      "convert ppt to pdf",
      "slides to pdf",
    ],
    relatedTools: ["pdf-to-powerpoint", "word-to-pdf", "excel-to-pdf", "document-metadata-viewer"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6" rx="1"/><path d="M10 12v6"/><path d="M10 12h3a1.5 1.5 0 0 1 0 3h-3"/></svg>`,
    seo: {
      title:
        "PowerPoint to PDF Online — Convert PPTX Slides to PDF Free | Comprexa",
      metaDescription:
        "Convert PowerPoint presentations (.pptx, .ppt) to PDF format online. High-resolution vector slides with zero software downloads.",
      canonicalUrl: "https://comprexa.app/powerpoint-to-pdf.html",
      keywords:
        "powerpoint to pdf, convert pptx to pdf, ppt to pdf online, slides to pdf free",
    },
  },
  {
    id: "pdf-to-excel",
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    shortDescription:
      "Extract tabular data and structured text from PDF files into Excel spreadsheet (.xlsx, .csv) format.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "xlsx",
    keywords: [
      "pdf",
      "excel",
      "pdf to excel",
      "pdf to xlsx",
      "pdf to csv",
      "extract table from pdf",
      "pdf table converter",
    ],
    relatedTools: ["excel-to-pdf", "pdf-to-powerpoint", "word-to-pdf", "powerpoint-to-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6" rx="1"/><path d="M16 12l-4 6"/><path d="M12 12l4 6"/></svg>`,
    seo: {
      title: "PDF to Excel Online — Convert PDF Tables to XLSX Free | Comprexa",
      metaDescription:
        "Extract tables and numerical data from PDF documents directly into Microsoft Excel (.xlsx) or CSV files with 100% private browser processing.",
      canonicalUrl: "https://comprexa.app/pdf-to-excel.html",
      keywords:
        "pdf to excel, convert pdf to xlsx, pdf to csv, extract tables from pdf online",
    },
  },
  {
    id: "pdf-to-powerpoint",
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    shortDescription:
      "Convert PDF document pages into customizable PowerPoint presentation slides (.pptx).",
    category: "document",
    categoryName: "Document Tools",
    badge: "Convert",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["pdf"],
    acceptsMultipleFiles: false,
    outputFormat: "pptx",
    keywords: [
      "pdf",
      "powerpoint",
      "pptx",
      "ppt",
      "pdf to powerpoint",
      "pdf to pptx",
      "convert pdf to slides",
    ],
    relatedTools: ["powerpoint-to-pdf", "pdf-to-excel", "word-to-pdf", "excel-to-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6" rx="1"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>`,
    seo: {
      title: "PDF to PowerPoint Online — Convert PDF to PPTX Free | Comprexa",
      metaDescription:
        "Convert PDF pages into editable PowerPoint (.pptx) slides online. Retains page layout, high-res images, and presentation structure.",
      canonicalUrl: "https://comprexa.app/pdf-to-powerpoint.html",
      keywords:
        "pdf to powerpoint, convert pdf to pptx, pdf to ppt online, turn pdf into slides",
    },
  },
  {
    id: "word-to-jpg",
    slug: "word-to-jpg",
    title: "Word to JPG",
    shortDescription:
      "Render and export Word document pages (.docx, .doc) as high-resolution JPG images or ZIP archive.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["docx", "doc"],
    acceptsMultipleFiles: false,
    outputFormat: "jpg",
    keywords: [
      "word",
      "docx",
      "doc",
      "jpg",
      "jpeg",
      "word to jpg",
      "convert docx to image",
      "doc to picture",
    ],
    relatedTools: ["word-to-pdf", "word-to-txt", "excel-to-pdf", "powerpoint-to-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="1"/><path d="m18 17-3-3-4 4"/></svg>`,
    seo: {
      title: "Word to JPG Online — Convert DOCX to Images Free | Comprexa",
      metaDescription:
        "Convert Word documents (.docx) into high-quality JPG image files. Download individual pages or a single ZIP package directly in your browser.",
      canonicalUrl: "https://comprexa.app/word-to-jpg.html",
      keywords:
        "word to jpg, convert docx to jpg, word to jpeg online, docx image export",
    },
  },
  {
    id: "word-to-txt",
    slug: "word-to-txt",
    title: "Word to TXT",
    shortDescription:
      "Extract clean, unformatted plain text content from Word (.docx) files into TXT format.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Fast",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["docx", "doc"],
    acceptsMultipleFiles: false,
    outputFormat: "txt",
    keywords: [
      "word",
      "docx",
      "doc",
      "txt",
      "text",
      "word to txt",
      "extract text from docx",
      "convert docx to txt",
    ],
    relatedTools: ["word-to-pdf", "word-to-jpg", "document-metadata-viewer", "excel-to-pdf"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    seo: {
      title: "Word to TXT Online — Extract Text from DOCX Free | Comprexa",
      metaDescription:
        "Extract raw text from Word documents (.docx, .doc) into plain TXT format instantly. Zero formatting clutter, 100% private.",
      canonicalUrl: "https://comprexa.app/word-to-txt.html",
      keywords:
        "word to txt, convert docx to txt, extract text from word, plain text word converter",
    },
  },
  {
    id: "document-metadata-viewer",
    slug: "document-metadata-viewer",
    title: "Document Metadata Viewer",
    shortDescription:
      "Inspect hidden metadata, EXIF, author, creation date, keywords, and document properties for PDF, Word, Excel, & PPT.",
    category: "document",
    categoryName: "Document Tools",
    badge: "Security",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--doc",
    supportedFileTypes: ["pdf", "docx", "xlsx", "pptx", "doc", "xls", "ppt"],
    acceptsMultipleFiles: false,
    outputFormat: "json",
    keywords: [
      "metadata",
      "exif",
      "document info",
      "pdf metadata",
      "docx metadata",
      "author",
      "creation date",
      "inspect metadata",
    ],
    relatedTools: ["word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "word-to-txt"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/><line x1="12" y1="11" x2="12" y2="11.01"/></svg>`,
    seo: {
      title:
        "Document Metadata Viewer Online — Inspect PDF, Word, Excel EXIF & Info | Comprexa",
      metaDescription:
        "Inspect document properties, hidden EXIF metadata, author, software, page counts, and security settings for PDF, DOCX, XLSX, and PPTX files 100% privately in browser.",
      canonicalUrl: "https://comprexa.app/document-metadata-viewer.html",
      keywords:
        "document metadata viewer, pdf metadata inspector, docx metadata viewer, excel metadata reader, view hidden document properties",
    },
  },

  // --- QR & UTILITIES ---
  {
    id: "qr-generator",
    slug: "qr-generator",
    title: "QR Generator",
    shortDescription:
      "Create custom vector QR codes for URLs, Wi-Fi networks, contacts, and text messages.",
    category: "qr",
    categoryName: "QR Tools",
    badge: "HD Vector",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "url"],
    acceptsMultipleFiles: false,
    outputFormat: "png_svg",
    keywords: [
      "qr",
      "code",
      "generator",
      "create",
      "vector",
      "barcode",
      "url",
      "wifi",
    ],
    relatedTools: ["qr-scanner"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/></svg>`,
    seo: {
      title:
        "Free QR Code Generator — Create Custom Vector QR Codes | Comprexa",
      metaDescription:
        "Generate custom vector QR codes with colors, logos, and high-resolution SVG or PNG downloads.",
      canonicalUrl: "https://comprexa.app/qr-generator.html",
      keywords:
        "qr code generator, create qr code, free vector qr code, custom qr code maker",
    },
  },
  {
    id: "qr-scanner",
    slug: "qr-scanner",
    title: "QR Scanner",
    shortDescription:
      "Scan and decode QR code images or camera feeds instantly with full client privacy.",
    category: "qr",
    categoryName: "QR Tools",
    badge: "Privacy",
    featured: false,
    popular: false,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["png", "jpg", "jpeg", "webp"],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: ["qr", "scan", "read", "decode", "camera", "code", "barcode"],
    relatedTools: ["qr-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="8" height="8" x="8" y="8" rx="1"/></svg>`,
    seo: {
      title: "Online QR Code Scanner — Read QR Codes Free | Comprexa",
      metaDescription:
        "Scan QR codes from image files or webcam streams directly inside your browser.",
      canonicalUrl: "https://comprexa.app/qr-scanner.html",
      keywords:
        "qr scanner, scan qr code online, decode qr image, web qr reader",
    },
  },

  // --- TEXT & UTILITIES ---
  {
    id: "word-counter",
    slug: "word-counter",
    title: "Word Counter",
    shortDescription:
      "Analyze text statistics, words, characters, sentences, paragraphs, and reading/speaking time in real-time.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Popular",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "analytics",
    keywords: [
      "word",
      "count",
      "characters",
      "text",
      "reading",
      "time",
      "sentences",
      "paragraphs",
    ],
    relatedTools: ["character-counter", "case-converter", "remove-extra-spaces", "remove-duplicate-lines"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    seo: {
      title: "Free Word Counter — Real-Time Word & Text Analytics | Comprexa",
      metaDescription:
        "Count words, characters, sentences, paragraphs, and calculate reading and speaking time in real-time.",
      canonicalUrl: "https://comprexa.app/word-counter.html",
      keywords:
        "word counter, count words online, character counter, reading time calculator, text analytics",
    },
  },
  {
    id: "character-counter",
    slug: "character-counter",
    title: "Character Counter",
    shortDescription:
      "Count characters, spaces, lines, and check limits for Twitter/X, LinkedIn, SMS, and custom text limits.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Limits",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "analytics",
    keywords: [
      "character",
      "count",
      "spaces",
      "lines",
      "twitter limit",
      "character limit",
      "letter counter",
    ],
    relatedTools: ["word-counter", "case-converter", "remove-extra-spaces", "remove-duplicate-lines"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>`,
    seo: {
      title:
        "Free Character Counter — Count Characters & Spaces Online | Comprexa",
      metaDescription:
        "Count characters with or without spaces, lines, and paragraphs. Includes live character limit indicators for social media.",
      canonicalUrl: "https://comprexa.app/character-counter.html",
      keywords:
        "character counter, count characters, twitter character limit, count letters, online letter counter",
    },
  },
  {
    id: "case-converter",
    slug: "case-converter",
    title: "Case Converter",
    shortDescription:
      "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, Capitalized, and Toggle Case instantly.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Instant",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "case",
      "converter",
      "uppercase",
      "lowercase",
      "title case",
      "sentence case",
      "capitalize",
      "toggle case",
    ],
    relatedTools: ["word-counter", "character-counter", "remove-extra-spaces", "remove-duplicate-lines"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><circle cx="18" cy="12" r="3"/><path d="M21 9v6"/></svg>`,
    seo: {
      title:
        "Free Case Converter — UPPERCASE, lowercase, Title Case | Comprexa",
      metaDescription:
        "Convert text case instantly online. Change to UPPERCASE, lowercase, Title Case, Sentence case, and Capitalized words.",
      canonicalUrl: "https://comprexa.app/case-converter.html",
      keywords:
        "case converter, uppercase converter, title case converter, sentence case, lowercase converter",
    },
  },
  {
    id: "remove-extra-spaces",
    slug: "remove-extra-spaces",
    title: "Remove Extra Spaces",
    shortDescription:
      "Clean up text by removing multiple consecutive spaces, leading/trailing spaces, tabs, and blank lines instantly.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Cleanup",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "remove extra spaces",
      "clean spaces",
      "trim whitespace",
      "leading spaces",
      "trailing spaces",
      "blank lines",
    ],
    relatedTools: ["remove-duplicate-lines", "text-sorter", "case-converter", "word-counter"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    seo: {
      title:
        "Free Extra Spaces Remover — Trim & Clean Whitespace Online | Comprexa",
      metaDescription:
        "Remove extra double spaces, leading/trailing whitespace, tabs, and blank lines from text online with live processing.",
      canonicalUrl: "https://comprexa.app/remove-extra-spaces.html",
      keywords:
        "remove extra spaces, space remover online, trim whitespace, clean spaces, remove blank lines",
    },
  },
  {
    id: "remove-duplicate-lines",
    slug: "remove-duplicate-lines",
    title: "Remove Duplicate Lines",
    shortDescription:
      "Deduplicate text lines while preserving original order. Supports case sensitivity and empty line options.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Deduplicate",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "remove duplicate lines",
      "deduplicate text",
      "unique lines",
      "remove duplicates",
      "list deduplicator",
    ],
    relatedTools: ["text-sorter", "remove-extra-spaces", "word-counter", "character-counter"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    seo: {
      title: "Free Duplicate Line Remover — Deduplicate Text Online | Comprexa",
      metaDescription:
        "Remove duplicate lines from lists and text instantly. Preserve order, toggle case sensitivity, and see stats.",
      canonicalUrl: "https://comprexa.app/remove-duplicate-lines.html",
      keywords:
        "remove duplicate lines, deduplicate text, unique line extractor, line deduplicator online",
    },
  },
  {
    id: "text-sorter",
    slug: "text-sorter",
    title: "Text Sorter",
    shortDescription:
      "Sort text lines alphabetically (A-Z, Z-A) or by length (ascending/descending) with custom trimming options.",
    category: "text",
    categoryName: "Text Tools",
    badge: "Organize",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["txt", "md"],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "text sorter",
      "sort lines",
      "alphabetical sort",
      "sort by length",
      "sort list online",
      "line sorter",
    ],
    relatedTools: ["remove-duplicate-lines", "remove-extra-spaces", "case-converter", "word-counter"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>`,
    seo: {
      title:
        "Free Online Text Sorter — Alphabetical & Length Line Sorting | Comprexa",
      metaDescription:
        "Sort text lines alphabetically A to Z or Z to A, or sort by line length ascending or descending. Fast, browser-based, and private.",
      canonicalUrl: "https://comprexa.app/text-sorter.html",
      keywords:
        "text sorter, sort lines alphabetically, sort list by length, alphabetize list online, line sorter",
    },
  },
  {
    id: "password-generator",
    slug: "password-generator",
    title: "Password Generator",
    shortDescription:
      "Generate strong, cryptographic, random passwords and passphrases with entropy scores.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Security",
    featured: false,
    popular: false,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "password",
      "generator",
      "security",
      "crypto",
      "random",
      "secret",
      "key",
    ],
    relatedTools: ["password-strength-checker", "uuid-generator", "hash-generator", "random-number-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`,
    seo: {
      title: "Secure Random Password Generator — Comprexa",
      metaDescription:
        "Generate unbreakable, high-entropy passwords with custom length, symbols, and numbers.",
      canonicalUrl: "https://comprexa.app/password-generator.html",
      keywords:
        "password generator, strong random password, secure passphrase maker",
    },
  },
  {
    id: "password-strength-checker",
    slug: "password-strength-checker",
    title: "Password Strength Checker",
    shortDescription:
      "Check password strength, entropy bits, estimated time to crack, character composition, and common vulnerabilities.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Security",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "analytics",
    keywords: [
      "password strength checker",
      "password analyzer",
      "password entropy",
      "time to crack password",
      "check password security",
    ],
    relatedTools: ["password-generator", "hash-generator", "uuid-generator", "random-number-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="m9 16 2 2 4-4"/></svg>`,
    seo: {
      title: "Password Strength Checker — Free & Private | Comprexa",
      metaDescription:
        "Analyze password security, entropy bits, estimated crack time, and common vulnerabilities with 100% private client-side processing.",
      canonicalUrl: "https://comprexa.app/password-strength-checker.html",
      keywords:
        "password strength checker, password security analyzer, password entropy calculator, time to crack password",
    },
  },
  {
    id: "uuid-generator",
    slug: "uuid-generator",
    title: "UUID Generator",
    shortDescription:
      "Generate RFC 4122 compliant UUID v4 identifiers in bulk with custom uppercase, hyphens, braces, and output format structures.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "RFC 4122",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "uuid generator",
      "guid generator",
      "uuid v4",
      "bulk uuid maker",
      "random uuid",
      "unique id generator",
    ],
    relatedTools: ["hash-generator", "random-string-generator", "password-generator", "password-strength-checker"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    seo: {
      title: "Bulk UUID v4 Generator — Free & Private | Comprexa",
      metaDescription:
        "Generate cryptographically random RFC 4122 UUID v4 identifiers in bulk. Customizable formatting, JSON, array, and SQL output.",
      canonicalUrl: "https://comprexa.app/uuid-generator.html",
      keywords:
        "uuid generator, guid generator, random uuid v4, bulk uuid maker, online uuid tool",
    },
  },
  {
    id: "hash-generator",
    slug: "hash-generator",
    title: "Hash Generator",
    shortDescription:
      "Calculate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes for text and binary files directly in your browser.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Crypto",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "hex",
    keywords: [
      "hash generator",
      "md5 generator",
      "sha256 generator",
      "sha1 calculator",
      "file hash checker",
      "sha512 generator",
      "checksum maker",
    ],
    relatedTools: ["base64-encoder-decoder", "uuid-generator", "password-strength-checker", "password-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
    seo: {
      title:
        "Cryptographic Hash Generator (MD5, SHA-1, SHA-256, SHA-512) — Comprexa",
      metaDescription:
        "Generate MD5, SHA-1, SHA-256, and SHA-512 digests for text and files instantly with zero cloud uploads.",
      canonicalUrl: "https://comprexa.app/hash-generator.html",
      keywords:
        "hash generator, md5 generator, sha256 generator, sha1 calculator, file hash checker, sha512 generator",
    },
  },
  {
    id: "random-number-generator",
    slug: "random-number-generator",
    title: "Random Number Generator",
    shortDescription:
      "Generate cryptographically random numbers, integers, and decimals with custom min/max ranges, uniqueness, and sorting options.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "RNG",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "random number generator",
      "rng tool",
      "random integer maker",
      "random decimal generator",
      "unique random numbers",
    ],
    relatedTools: ["random-string-generator", "uuid-generator", "password-generator", "password-strength-checker"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/></svg>`,
    seo: {
      title: "Random Number Generator — Free & Private | Comprexa",
      metaDescription:
        "Generate cryptographically random numbers and decimals in bulk. Customize min, max, unique values, sorting, and delimiters.",
      canonicalUrl: "https://comprexa.app/random-number-generator.html",
      keywords:
        "random number generator, rng tool, random integer maker, random decimal generator, unique random numbers",
    },
  },
  {
    id: "random-string-generator",
    slug: "random-string-generator",
    title: "Random String Generator",
    shortDescription:
      "Generate cryptographically random strings, tokens, secrets, and API keys with custom character sets and rules.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Token",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "random string generator",
      "token generator",
      "api key generator",
      "secret string maker",
      "random string maker",
    ],
    relatedTools: ["random-number-generator", "uuid-generator", "password-generator", "password-strength-checker"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    seo: {
      title: "Random String & Token Generator — Free & Private | Comprexa",
      metaDescription:
        "Generate random strings, tokens, secrets, and API keys with custom character rules, prefixes, and length limits.",
      canonicalUrl: "https://comprexa.app/random-string-generator.html",
      keywords:
        "random string generator, token generator, api key generator, secret string maker",
    },
  },
  {
    id: "timestamp-converter",
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    shortDescription:
      "Convert Unix epoch timestamps to human-readable dates and human dates to Unix timestamps in local time and UTC.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Converter",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "timestamp converter",
      "unix timestamp to date",
      "epoch converter",
      "date to unix timestamp",
      "utc timestamp tool",
    ],
    relatedTools: ["base64-encoder-decoder", "hash-generator", "uuid-generator", "password-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    seo: {
      title: "Unix Timestamp Converter — Free & Private | Comprexa",
      metaDescription:
        "Convert Unix timestamps to human-readable dates and dates to Unix timestamps in seconds and milliseconds.",
      canonicalUrl: "https://comprexa.app/timestamp-converter.html",
      keywords:
        "timestamp converter, unix timestamp to date, epoch converter, date to unix timestamp",
    },
  },
  {
    id: "base64-encoder-decoder",
    slug: "base64-encoder-decoder",
    title: "Base64 Encoder / Decoder",
    shortDescription:
      "Encode text and binary files to Base64 or decode Base64 strings with UTF-8 Unicode support and URL-safe formatting.",
    category: "utilities",
    categoryName: "Utility Tools",
    badge: "Encoder",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "text",
    keywords: [
      "base64 encoder",
      "base64 decoder",
      "base64 tool",
      "file to base64",
      "url safe base64",
      "utf8 base64 converter",
    ],
    relatedTools: ["hash-generator", "timestamp-converter", "password-generator", "password-strength-checker"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    seo: {
      title: "Base64 Encoder / Decoder — Free & Private | Comprexa",
      metaDescription:
        "Encode and decode text and binary files with Base64. Complete UTF-8 Unicode and URL-safe support.",
      canonicalUrl: "https://comprexa.app/base64-encoder-decoder.html",
      keywords:
        "base64 encoder, base64 decoder, base64 tool, file to base64, url safe base64",
    },
  },

  // --- EXPANDABLE FUTURE TOOL DEFINITIONS (100+ Scalability Architecture) ---

  {
    id: "json-formatter",
    slug: "json-formatter",
    title: "JSON Formatter",
    shortDescription:
      "Prettify and format JSON data with custom indentation (2 spaces, 4 spaces, Tab), Unicode preservation, and instant error detection.",
    category: "developer",
    categoryName: "Developer Tools",
    badge: "Pretty Print",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["json", "txt"],
    acceptsMultipleFiles: false,
    outputFormat: "json",
    keywords: [
      "json formatter",
      "prettify json",
      "pretty print json",
      "format json online",
      "json indenter",
      "indent json",
      "developer",
    ],
    relatedTools: ["json-validator", "json-minifier", "json-yaml-converter"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    seo: {
      title:
        "Free Online JSON Formatter — Prettify & Indent JSON Code | Comprexa",
      metaDescription:
        "Format and prettify JSON data online instantly. Supports 2 spaces, 4 spaces, and tab indentation, syntax validation, Unicode preservation, and 100% browser privacy.",
      canonicalUrl: "https://comprexa.app/json-formatter.html",
      keywords:
        "json formatter, prettify json, format json online, json indenter, pretty print json",
    },
  },
  {
    id: "json-validator",
    slug: "json-validator",
    title: "JSON Validator",
    shortDescription:
      "Validate JSON structure in real-time with error line and column numbers, diagnostic error descriptions, and object/array statistics.",
    category: "developer",
    categoryName: "Developer Tools",
    badge: "Validation",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["json", "txt"],
    acceptsMultipleFiles: false,
    outputFormat: "json",
    keywords: [
      "json validator",
      "validate json",
      "json syntax checker",
      "json error detector",
      "json parse check",
      "json structure analyzer",
    ],
    relatedTools: ["json-formatter", "json-minifier", "json-yaml-converter", "json-tree-viewer"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 22 4"/></svg>`,
    seo: {
      title: "Free Online JSON Validator — Check Syntax & Errors | Comprexa",
      metaDescription:
        "Validate JSON syntax online in real-time. Detect syntax errors with line & column numbers, human-readable error explanations, and node tree metrics.",
      canonicalUrl: "https://comprexa.app/json-validator.html",
      keywords:
        "json validator, validate json, json syntax checker, json error detector",
    },
  },
  {
    id: "json-minifier",
    slug: "json-minifier",
    title: "JSON Minifier",
    shortDescription:
      "Compress and minify JSON code by stripping unnecessary spaces and line breaks to optimize API request payloads.",
    category: "developer",
    categoryName: "Developer Tools",
    badge: "Compress",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["json", "txt"],
    acceptsMultipleFiles: false,
    outputFormat: "json",
    keywords: [
      "json minifier",
      "minify json",
      "compress json",
      "remove json whitespace",
      "json payload optimizer",
      "json compressor online",
    ],
    relatedTools: ["json-formatter", "json-validator", "json-yaml-converter", "json-tree-viewer"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`,
    seo: {
      title: "Free Online JSON Minifier — Compress JSON Code | Comprexa",
      metaDescription:
        "Minify and compress JSON online instantly. Remove unnecessary whitespace, newlines, and comments while measuring payload size reduction and space saved.",
      canonicalUrl: "https://comprexa.app/json-minifier.html",
      keywords:
        "json minifier, minify json, compress json, remove json whitespace",
    },
  },
  {
    id: "json-yaml-converter",
    slug: "json-yaml-converter",
    title: "JSON ↔ YAML Converter",
    shortDescription:
      "Convert JSON to YAML and YAML to JSON online with real-time conversion, syntax diagnostics, and custom indentation.",
    category: "developer",
    categoryName: "Developer Tools",
    badge: "Converter",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["json", "yaml", "yml", "txt"],
    acceptsMultipleFiles: false,
    outputFormat: "yaml",
    keywords: [
      "json to yaml",
      "yaml to json",
      "json yaml converter",
      "convert json to yaml",
      "convert yaml to json",
      "json2yaml",
      "yaml2json",
    ],
    relatedTools: ["json-formatter", "json-tree-viewer", "json-validator", "json-minifier"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    seo: {
      title:
        "Free Online JSON ↔ YAML Converter — Convert JSON & YAML Code | Comprexa",
      metaDescription:
        "Convert JSON to YAML and YAML to JSON online instantly. Features auto-detection, live syntax validation, custom indentation, Unicode support, and 100% browser privacy.",
      canonicalUrl: "https://comprexa.app/json-yaml-converter.html",
      keywords:
        "json to yaml, yaml to json, json yaml converter, convert json to yaml online, convert yaml to json",
    },
  },
  {
    id: "json-tree-viewer",
    slug: "json-tree-viewer",
    title: "JSON Tree Viewer",
    shortDescription:
      "Inspect, expand, collapse, and search nested JSON objects/arrays interactively with one-click path and value copying.",
    category: "developer",
    categoryName: "Developer Tools",
    badge: "Tree View",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: ["json", "txt"],
    acceptsMultipleFiles: false,
    outputFormat: "json",
    keywords: [
      "json tree viewer",
      "json node inspector",
      "json tree",
      "interactive json viewer",
      "copy json path",
      "search json keys",
      "json structure visualizer",
    ],
    relatedTools: ["json-formatter", "json-validator", "json-yaml-converter", "json-minifier"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    seo: {
      title:
        "Free Online JSON Tree Viewer — Interactive Node Inspector | Comprexa",
      metaDescription:
        "Inspect, navigate, and search complex JSON objects and arrays with an interactive tree view. Features expand/collapse all, node path copying, real-time key/value search, and metrics.",
      canonicalUrl: "https://comprexa.app/json-tree-viewer.html",
      keywords:
        "json tree viewer, json node inspector, json tree, interactive json viewer, copy json path",
    },
  },
  {
    id: "color-picker",
    slug: "color-picker",
    title: "Color Picker",
    shortDescription:
      "Pick, inspect, and extract precise color values in HEX, RGB, and HSL formats with instant copy buttons and session swatches.",
    category: "color",
    categoryName: "Color Tools",
    badge: "Color",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "hex",
    keywords: [
      "color picker",
      "online color picker",
      "hex color picker",
      "rgb color picker",
      "hsl color picker",
      "color inspector",
      "hex code finder",
    ],
    relatedTools: ["color-converter", "color-palette-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.43-.17-.83-.44-1.14-.29-.33-.46-.77-.46-1.21 0-.93.75-1.7 1.68-1.7H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg>`,
    seo: {
      title:
        "Free Online Color Picker — Inspect HEX, RGB & HSL Codes | Comprexa",
      metaDescription:
        "Pick, inspect, and extract precise color values in HEX, RGB, and HSL formats with instant copy buttons, native color wheel, and local session history.",
      canonicalUrl: "https://comprexa.app/color-picker.html",
      keywords:
        "color picker, online color picker, hex color picker, rgb color picker, hsl color picker",
    },
  },
  {
    id: "color-converter",
    slug: "color-converter",
    title: "HEX / RGB / HSL Converter",
    shortDescription:
      "Convert color codes bi-directionally between HEX, RGB, and HSL with syntax error diagnostics and instant copying.",
    category: "color",
    categoryName: "Color Tools",
    badge: "Converter",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "hex",
    keywords: [
      "hex to rgb",
      "rgb to hex",
      "hex to hsl",
      "hsl to hex",
      "rgb to hsl",
      "color converter",
      "convert color online",
    ],
    relatedTools: ["color-picker", "color-palette-generator"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    seo: {
      title:
        "Free Online HEX / RGB / HSL Converter — Convert Color Codes | Comprexa",
      metaDescription:
        "Convert color values instantly between HEX, RGB, and HSL formats. Features real-time conversion, syntax error checking, copy buttons, and local privacy.",
      canonicalUrl: "https://comprexa.app/color-converter.html",
      keywords:
        "hex to rgb, rgb to hex, hex to hsl, hsl to hex, rgb to hsl, color converter",
    },
  },
  {
    id: "color-palette-generator",
    slug: "color-palette-generator",
    title: "Color Palette Generator",
    shortDescription:
      "Generate harmonious color schemes (Monochromatic, Analogous, Complementary, Triadic, Tetradic), lock swatches, and export in CSS/SVG.",
    category: "color",
    categoryName: "Color Tools",
    badge: "Palette",
    featured: true,
    popular: true,
    comingSoon: false,
    colorClass: "icon-bg--utility",
    supportedFileTypes: [],
    acceptsMultipleFiles: false,
    outputFormat: "css",
    keywords: [
      "color palette generator",
      "color scheme generator",
      "palette creator",
      "complementary color palette",
      "triadic palette",
      "export css colors",
    ],
    relatedTools: ["color-picker", "color-converter"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>`,
    seo: {
      title:
        "Free Online Color Palette Generator — Harmony & Swatch Exporter | Comprexa",
      metaDescription:
        "Generate harmonious color palettes with Monochromatic, Analogous, Complementary, Triadic, and Tetradic rules. Lock individual swatches, shuffle, and export CSS/SVG.",
      canonicalUrl: "https://comprexa.app/color-palette-generator.html",
      keywords:
        "color palette generator, color scheme generator, palette creator, complementary color palette, triadic palette",
    },
  },
];

/**
 * Comprexa Dynamic Metadata Engine
 * Automatic SEO generation, OpenGraph/Twitter cards, and Schema.org JSON-LD injector.
 */
class ComprexaMetadataEngine {
  constructor(registry, categoriesRepo) {
    this.registry = registry;
    this.categoriesRepo =
      categoriesRepo ||
      (typeof window !== "undefined" ? window.ComprexaCategories : null);
  }

  /**
   * Generate complete metadata object for a tool or category
   * @param {Object} item - Tool or Category object
   * @param {'tool'|'category'} [type='tool']
   */
  generateMetadata(item, type = "tool") {
    if (!item) return null;

    if (type === "category") {
      const catName = item.name || "Category";
      const catDesc =
        item.description ||
        `Browse free online ${catName} at Comprexa. Fast, client-side, zero limits.`;
      const canonical = `https://comprexa.app/${item.slug || "pdf-tools"}.html`;

      return {
        title: `${catName} — Free Online Tools | Comprexa`,
        metaDescription: catDesc,
        canonicalUrl: canonical,
        keywords: `${item.name}, free online tools, comprexa ${item.name}`,
        og: {
          title: `${catName} — Free Online Tools | Comprexa`,
          description: catDesc,
          url: canonical,
          type: "website",
          siteName: "Comprexa",
          image: "https://comprexa.app/assets/og-category.png",
        },
        twitter: {
          card: "summary_large_image",
          title: `${catName} — Free Online Tools | Comprexa`,
          description: catDesc,
          image: "https://comprexa.app/assets/og-category.png",
        },
        breadcrumbs: [
          { position: 1, name: "Home", item: "https://comprexa.app/" },
          { position: 2, name: catName, item: canonical },
        ],
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://comprexa.app/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: catName,
                item: canonical,
              },
            ],
          },
        ],
      };
    }

    // Tool Metadata Engine
    const seo = item.seo || {};
    const title =
      seo.title || `${item.title || item.name} — Free Online Tool | Comprexa`;
    const desc =
      seo.metaDescription ||
      item.shortDescription ||
      item.longDescription ||
      `Free online ${item.title} tool. 100% private, client-side, zero limits.`;
    const canonical =
      seo.canonicalUrl || `https://comprexa.app/${item.slug || item.id}.html`;
    const keywordsStr =
      seo.keywords ||
      (Array.isArray(item.keywords)
        ? item.keywords.join(", ")
        : `${item.title}, free tool, comprexa`);

    let catObj = null;
    if (this.categoriesRepo)
      catObj = this.categoriesRepo.getById(item.category);
    else if (typeof window !== "undefined" && window.ComprexaCategories)
      catObj = window.ComprexaCategories.getById(item.category);

    const catName = catObj ? catObj.name : item.categoryName || "Tools";
    const catSlug = catObj ? catObj.slug : `${item.category}-tools`;

    const breadcrumbs = [
      { position: 1, name: "Home", item: "https://comprexa.app/" },
      {
        position: 2,
        name: catName,
        item: `https://comprexa.app/${catSlug}.html`,
      },
      { position: 3, name: item.title || item.name, item: canonical },
    ];

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b) => ({
        "@type": "ListItem",
        position: b.position,
        name: b.name,
        item: b.item,
      })),
    };

    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: item.title || item.name,
      url: canonical,
      description: desc,
      applicationCategory: catName,
      operatingSystem: "Any",
      browserRequirements: item.browserCapabilities
        ? item.browserCapabilities.join(", ")
        : "Requires HTML5 JavaScript Web Browser",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
      },
      featureList: Array.isArray(item.keywords)
        ? item.keywords.join(", ")
        : desc,
    };

    return {
      title,
      metaDescription: desc,
      canonicalUrl: canonical,
      keywords: keywordsStr,
      og: {
        title,
        description: desc,
        url: canonical,
        type: "website",
        siteName: "Comprexa",
        image: seo.ogImage || "https://comprexa.app/assets/og-image.png",
      },
      twitter: {
        card: seo.twitterCard || "summary_large_image",
        title,
        description: desc,
        image: seo.ogImage || "https://comprexa.app/assets/og-image.png",
      },
      breadcrumbs,
      jsonLd: [breadcrumbSchema, webAppSchema],
    };
  }

  /**
   * Inject / Apply full SEO metadata directly into DOM
   * @param {Object} item - Tool or Category object
   * @param {'tool'|'category'} [type='tool']
   */
  applyMetadata(item, type = "tool") {
    if (typeof document === "undefined") return;
    const meta = this.generateMetadata(item, type);
    if (!meta) return;

    document.title = meta.title;

    this._setMeta("name", "description", meta.metaDescription);
    this._setMeta("name", "keywords", meta.keywords);
    this._setLink("canonical", meta.canonicalUrl);

    // OpenGraph
    this._setMeta("property", "og:title", meta.og.title);
    this._setMeta("property", "og:description", meta.og.description);
    this._setMeta("property", "og:url", meta.og.url);
    this._setMeta("property", "og:type", meta.og.type);
    this._setMeta("property", "og:site_name", meta.og.siteName);
    this._setMeta("property", "og:image", meta.og.image);

    // Twitter Cards
    this._setMeta("name", "twitter:card", meta.twitter.card);
    this._setMeta("name", "twitter:title", meta.twitter.title);
    this._setMeta("name", "twitter:description", meta.twitter.description);
    this._setMeta("name", "twitter:image", meta.twitter.image);

    // Inject JSON-LD
    this._injectJSONLDScripts(meta.jsonLd);
  }

  _setMeta(keyAttr, keyValue, contentValue) {
    if (!contentValue) return;
    let el = document.querySelector(`meta[${keyAttr}="${keyValue}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(keyAttr, keyValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", contentValue);
  }

  _setLink(relValue, hrefValue) {
    if (!hrefValue) return;
    let el = document.querySelector(`link[rel="${relValue}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", relValue);
      document.head.appendChild(el);
    }
    el.setAttribute("href", hrefValue);
  }

  _injectJSONLDScripts(schemasArray) {
    if (!Array.isArray(schemasArray) || typeof document === "undefined") return;
    const oldScripts = document.querySelectorAll(
      'script[data-comprexa-schema="true"]',
    );
    oldScripts.forEach((s) => s.remove());

    schemasArray.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-comprexa-schema", "true");
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });
  }
}

/**
 * Comprexa Production Universal Tool Registry Engine
 * Single source of truth for every tool across the Comprexa platform.
 */
class ComprexaToolRegistry {
  constructor(tools = COMPREXA_TOOLS_REGISTRY) {
    this._tools = [];
    this._idMap = new Map();
    this._slugMap = new Map();
    this._categoryMap = new Map();
    this._tagMap = new Map();
    this._capabilityMap = new Map();
    this._fileTypeMap = new Map();

    this.metadataEngine = new ComprexaMetadataEngine(this);
    this.init(tools);
  }

  /**
   * Initialize / re-index registry with tools array
   * @param {Array<Object>} toolsArray
   */
  init(toolsArray) {
    this._tools = [];
    this._idMap.clear();
    this._slugMap.clear();
    this._categoryMap.clear();
    this._tagMap.clear();
    this._capabilityMap.clear();
    this._fileTypeMap.clear();

    if (Array.isArray(toolsArray)) {
      toolsArray.forEach((t) => this._registerInternal(t));
    }
  }

  _normalizeTool(raw) {
    if (!raw) return null;
    const id = (raw.id || "").toLowerCase();
    if (!id) return null;

    const slug = (raw.slug || id).toLowerCase();
    const title = raw.title || raw.name || id;
    const name = raw.name || title;
    const shortDescription = raw.shortDescription || raw.description || "";
    const longDescription = raw.longDescription || shortDescription;
    const category = (raw.category || "utilities").toLowerCase();

    let categoryName = raw.categoryName;
    if (
      !categoryName &&
      typeof window !== "undefined" &&
      window.ComprexaCategories
    ) {
      const catObj = window.ComprexaCategories.getById(category);
      if (catObj) categoryName = catObj.name;
    }
    if (!categoryName)
      categoryName =
        category.charAt(0).toUpperCase() + category.slice(1) + " Tools";

    const keywords = Array.isArray(raw.keywords) ? raw.keywords : [];
    const tags = Array.isArray(raw.tags) ? raw.tags : [category];
    const icon = raw.icon || "";
    const route = raw.route || `/${slug}.html`;
    const component = raw.component || "";
    const featured = Boolean(raw.featured);
    const popular = Boolean(raw.popular);
    const badge = raw.badge || "Tool";
    const colorClass = raw.colorClass || "icon-bg--utility";
    const supportedFileTypes = Array.isArray(raw.supportedFileTypes)
      ? raw.supportedFileTypes
      : [];
    const acceptsMultipleFiles = Boolean(raw.acceptsMultipleFiles);
    const outputFormat = raw.outputFormat || "file";
    const browserCapabilities = Array.isArray(raw.browserCapabilities)
      ? raw.browserCapabilities
      : ["client-side"];
    const relatedTools = Array.isArray(raw.relatedTools)
      ? raw.relatedTools
      : [];

    const seo = raw.seo || {};
    seo.title = seo.title || `${title} — Free Online Tool | Comprexa`;
    seo.metaDescription = seo.metaDescription || shortDescription;
    seo.canonicalUrl = seo.canonicalUrl || `https://comprexa.app/${slug}.html`;
    seo.keywords =
      seo.keywords ||
      (keywords.length > 0
        ? keywords.join(", ")
        : `${title}, free tool, comprexa`);
    seo.ogImage = seo.ogImage || "https://comprexa.app/assets/og-image.png";
    seo.twitterCard = seo.twitterCard || "summary_large_image";

    return {
      id,
      slug,
      name,
      title,
      shortDescription,
      longDescription,
      category,
      categoryName,
      keywords,
      tags,
      icon,
      route,
      component,
      featured,
      popular,
      badge,
      colorClass,
      supportedFileTypes,
      acceptsMultipleFiles,
      outputFormat,
      browserCapabilities,
      relatedTools,
      seo,
      comingSoon: Boolean(raw.comingSoon),
    };
  }

  _registerInternal(rawTool) {
    const tool = this._normalizeTool(rawTool);
    if (!tool) return null;

    const existingIndex = this._tools.findIndex((t) => t.id === tool.id);
    if (existingIndex >= 0) {
      this._tools[existingIndex] = tool;
    } else {
      this._tools.push(tool);
    }

    this._idMap.set(tool.id, tool);
    this._slugMap.set(tool.slug, tool);

    if (!this._categoryMap.has(tool.category)) {
      this._categoryMap.set(tool.category, []);
    }
    this._categoryMap.get(tool.category).push(tool);

    tool.tags.forEach((tag) => {
      const tKey = tag.toLowerCase();
      if (!this._tagMap.has(tKey)) this._tagMap.set(tKey, []);
      this._tagMap.get(tKey).push(tool);
    });

    tool.browserCapabilities.forEach((cap) => {
      const cKey = cap.toLowerCase();
      if (!this._capabilityMap.has(cKey)) this._capabilityMap.set(cKey, []);
      this._capabilityMap.get(cKey).push(tool);
    });

    tool.supportedFileTypes.forEach((ft) => {
      const ftKey = ft.toLowerCase().replace(".", "");
      if (!this._fileTypeMap.has(ftKey)) this._fileTypeMap.set(ftKey, []);
      this._fileTypeMap.get(ftKey).push(tool);
    });

    return tool;
  }

  getAll() {
    return this._tools;
  }

  getById(id) {
    if (!id) return null;
    return this._idMap.get(id.toLowerCase()) || null;
  }

  getBySlug(slug) {
    if (!slug) return null;
    return this._slugMap.get(slug.toLowerCase()) || null;
  }

  getByCategory(categoryId) {
    if (
      !categoryId ||
      categoryId === "all" ||
      categoryId === "all-tools" ||
      categoryId === "All Tools" ||
      categoryId === "*"
    ) {
      return this._tools;
    }
    const catKey = String(categoryId).toLowerCase().trim();

    let aliasKey = catKey;
    if (
      catKey === "utility" ||
      catKey === "utilities" ||
      catKey === "utility-tools" ||
      catKey === "utility tools"
    ) {
      aliasKey = "utilities";
    } else if (
      catKey === "color" ||
      catKey === "color-tools" ||
      catKey === "color tools"
    ) {
      aliasKey = "color";
    } else if (catKey.endsWith("-tools")) {
      aliasKey = catKey.replace("-tools", "");
    } else if (catKey.endsWith(" tools")) {
      aliasKey = catKey.replace(" tools", "");
    }

    let tools =
      this._categoryMap.get(aliasKey) || this._categoryMap.get(catKey) || [];
    if (!tools || tools.length === 0) {
      tools = this._tools.filter((t) => {
        const c = (t.category || "").toLowerCase();
        const cn = (t.categoryName || "").toLowerCase();
        return (
          c === catKey || cn === catKey || c === aliasKey || cn === aliasKey
        );
      });
    }

    // Dynamically include tools with 'convert' in their id, slug or title if category is converter
    if (
      catKey === "converter" ||
      catKey === "converter-tools" ||
      aliasKey === "converter"
    ) {
      const extraConverters = this._tools.filter((t) => {
        if (tools.some((existingTool) => existingTool.id === t.id))
          return false;
        const matchesName =
          t.id.includes("convert") ||
          t.slug.includes("convert") ||
          t.title.toLowerCase().includes("convert") ||
          (t.shortDescription &&
            t.shortDescription.toLowerCase().includes("convert"));
        return matchesName;
      });
      tools = [...tools, ...extraConverters];
    }

    return tools;
  }

  getByTag(tag) {
    if (!tag) return [];
    return this._tagMap.get(tag.toLowerCase()) || [];
  }

  getByCapability(capability) {
    if (!capability) return [];
    return this._capabilityMap.get(capability.toLowerCase()) || [];
  }

  getByFileType(ext) {
    if (!ext) return [];
    return this._fileTypeMap.get(ext.toLowerCase().replace(".", "")) || [];
  }

  getFeatured() {
    return this._tools.filter((t) => t.featured);
  }

  getPopular() {
    return this._tools.filter((t) => t.popular);
  }

  /**
   * Register a new tool dynamically at runtime or build time
   * @param {Object} toolConfig
   */
  registerTool(toolConfig) {
    const registered = this._registerInternal(toolConfig);
    if (registered && typeof window !== "undefined") {
      if (
        window.ComprexaSearchEngine &&
        typeof window.ComprexaSearchEngine.buildIndex === "function"
      ) {
        window.ComprexaSearchEngine.buildIndex();
      }
      if (
        window.ComprexaUtils &&
        typeof window.ComprexaUtils.updateAllToolCountsUI === "function"
      ) {
        window.ComprexaUtils.updateAllToolCountsUI();
      }
    }
    return registered;
  }

  /**
   * Register multiple tools at once
   * @param {Array<Object>} toolsArray
   */
  registerBatch(toolsArray) {
    if (!Array.isArray(toolsArray)) return [];
    const registeredList = [];
    toolsArray.forEach((t) => {
      const reg = this._registerInternal(t);
      if (reg) registeredList.push(reg);
    });
    if (registeredList.length > 0 && typeof window !== "undefined") {
      if (
        window.ComprexaSearchEngine &&
        typeof window.ComprexaSearchEngine.buildIndex === "function"
      ) {
        window.ComprexaSearchEngine.buildIndex();
      }
      if (
        window.ComprexaUtils &&
        typeof window.ComprexaUtils.updateAllToolCountsUI === "function"
      ) {
        window.ComprexaUtils.updateAllToolCountsUI();
      }
    }
    return registeredList;
  }

  /**
   * Multi-Tier Related Tools Recommendation Engine
   * @param {string} toolIdOrSlug
   * @param {number} [limit=4]
   */
  getRelatedTools(toolIdOrSlug, limit = 4) {
    const current = this.getById(toolIdOrSlug) || this.getBySlug(toolIdOrSlug);
    if (!current) return this.getPopular().slice(0, limit);

    const relatedSet = new Set();
    const results = [];

    // Tier 1: Explicit relatedTools array
    if (Array.isArray(current.relatedTools)) {
      for (const relId of current.relatedTools) {
        const found = this.getById(relId) || this.getBySlug(relId);
        if (found && found.id !== current.id && !relatedSet.has(found.id)) {
          relatedSet.add(found.id);
          results.push(found);
          if (results.length >= limit) return results;
        }
      }
    }

    // Tier 2: Same Category match
    const sameCategory = this.getByCategory(current.category);
    for (const tool of sameCategory) {
      if (tool.id !== current.id && !relatedSet.has(tool.id)) {
        relatedSet.add(tool.id);
        results.push(tool);
        if (results.length >= limit) return results;
      }
    }

    // Tier 3: Tag / Keyword overlap match
    for (const tool of this._tools) {
      if (tool.id !== current.id && !relatedSet.has(tool.id)) {
        const tagIntersection = tool.tags.some((t) => current.tags.includes(t));
        const keywordIntersection = tool.keywords.some((k) =>
          current.keywords.includes(k),
        );
        if (tagIntersection || keywordIntersection) {
          relatedSet.add(tool.id);
          results.push(tool);
          if (results.length >= limit) return results;
        }
      }
    }

    // Tier 4: Popular tools fallback
    const popularList = this.getPopular();
    for (const tool of popularList) {
      if (tool.id !== current.id && !relatedSet.has(tool.id)) {
        relatedSet.add(tool.id);
        results.push(tool);
        if (results.length >= limit) return results;
      }
    }

    return results.slice(0, limit);
  }

  getSearchIndex() {
    return this._tools.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      name: t.name,
      shortDescription: t.shortDescription,
      category: t.category,
      categoryName: t.categoryName,
      keywords: t.keywords,
      tags: t.tags,
      route: t.route,
      icon: t.icon,
      badge: t.badge,
      colorClass: t.colorClass,
      popular: t.popular,
      featured: t.featured,
    }));
  }

  search(query, options = {}) {
    if (!query || typeof query !== "string") return this._tools;
    const q = query.trim().toLowerCase();
    const categoryFilter = options.category
      ? options.category.toLowerCase()
      : null;

    return this._tools.filter((t) => {
      if (categoryFilter && categoryFilter !== "all") {
        if (
          t.category.toLowerCase() !== categoryFilter &&
          t.categoryName.toLowerCase() !== categoryFilter
        ) {
          return false;
        }
      }
      return (
        t.title.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        t.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    });
  }

  getTaxonomy() {
    return {
      totalTools: this._tools.length,
      categoriesCount: this._categoryMap.size,
      tagsCount: this._tagMap.size,
      capabilitiesCount: this._capabilityMap.size,
      fileTypesCount: this._fileTypeMap.size,
    };
  }
}

// Global Exports
if (typeof window !== "undefined") {
  window.COMPREXA_TOOLS_REGISTRY = COMPREXA_TOOLS_REGISTRY;
  window.ComprexaMetadataEngine = new ComprexaMetadataEngine(
    null,
    window.ComprexaCategories,
  );
  window.ComprexaToolsRegistry = new ComprexaToolRegistry();
  window.ComprexaMetadataEngine.registry = window.ComprexaToolsRegistry;

  window.ComprexaUtils = window.ComprexaUtils || {};

  /**
   * Universal Dynamic Tool Counter
   * Queries window.ComprexaToolsRegistry and handles all category aliases
   * @param {string} categoryId
   * @returns {number}
   */
  window.ComprexaUtils.getToolCount = function (categoryId) {
    if (
      !window.ComprexaToolsRegistry ||
      typeof window.ComprexaToolsRegistry.getByCategory !== "function"
    ) {
      return 0;
    }
    return window.ComprexaToolsRegistry.getByCategory(categoryId).length;
  };

  /**
   * Automatically updates all tool counts across the entire Comprexa website DOM
   */
  window.ComprexaUtils.updateAllToolCountsUI = function () {
    if (typeof document === "undefined") return;

    const totalCount = window.ComprexaUtils.getToolCount("all");

    // 1. Update Category Cards
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      const titleEl = card.querySelector(".category-card__title");
      const countSpan = card.querySelector(".category-card__count");
      if (!titleEl || !countSpan) return;

      let catId = card.getAttribute("data-category");
      if (!catId) {
        catId = titleEl.textContent.trim();
      }

      const count = window.ComprexaUtils.getToolCount(catId);
      countSpan.textContent = `${count} Tools`;
    });

    // 2. Update Category Tab Counts
    const tabCountElements = document.querySelectorAll(".category-tab__count");
    tabCountElements.forEach((span) => {
      const id = span.id || "";
      if (id.startsWith("count-")) {
        const catKey = id.replace("count-", "");
        const count = window.ComprexaUtils.getToolCount(catKey);
        span.textContent = String(count);
      }
    });

    // 3. Update Result Counter
    const resultCounters = document.querySelectorAll("#tools-result-counter");
    resultCounters.forEach((counter) => {
      const visibleEl = counter.querySelector("#visible-tools-count");
      if (visibleEl && visibleEl.textContent === "50+") {
        visibleEl.textContent = String(totalCount);
      }
    });
  };

  // Run initial DOM update
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      window.ComprexaUtils.updateAllToolCountsUI,
    );
  } else {
    setTimeout(window.ComprexaUtils.updateAllToolCountsUI, 0);
  }
}
