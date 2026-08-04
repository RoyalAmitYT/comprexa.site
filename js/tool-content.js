// @ts-nocheck
/**
 * Comprexa Universal Tool Content Repository
 * Decoupled content definitions for features, how-it-works, benefits, FAQs, and specs.
 * Supports explicit tool overrides and intelligent fallback generators for 500+ tools.
 */

class ComprexaToolContent {
  constructor() {
    this.customContent = {
      // ------------------------------------------------------------------------
      // PDF MERGE
      // ------------------------------------------------------------------------
      "merge-pdf": {
        features: [
          {
            title: "Client-Side WebAssembly Processing",
            description:
              "Merge PDF files directly in your browser without uploading confidential documents to remote servers.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
          },
          {
            title: "Visual Page & File Reordering",
            description:
              "Drag and drop individual PDF files or pages to customize your exact sequence before merging.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>`,
          },
          {
            title: "Zero File Limits or Paywalls",
            description:
              "Combine as many PDFs as you need with unlimited file size caps and zero registration required.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
          },
          {
            title: "Metadata & Formatting Preservation",
            description:
              "Retains crisp font vectors, high-resolution graphics, hyperlinks, and document structure intact.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`,
          },
        ],
        howItWorks: [
          {
            step: 1,
            title: "Select PDF Documents",
            description:
              "Drag & drop multiple PDF files into the upload box or select files from your computer or phone.",
          },
          {
            step: 2,
            title: "Arrange Sequence & Settings",
            description:
              "Reorder your documents, adjust auto-rotation options, or configure custom output filenames.",
          },
          {
            step: 3,
            title: "Download Merged PDF",
            description:
              "Click Merge PDFs and instantly save your combined PDF file locally in milliseconds.",
          },
        ],
        benefits: [
          {
            title: "Bank-Grade Privacy",
            description:
              "Your documents never leave your browser window. No cloud uploads, no logging, no trace left behind.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
          },
          {
            title: "Instant Local Speed",
            description:
              "Runs directly on your computer CPU using WebAssembly, delivering processing speeds up to 10x faster.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
          },
          {
            title: "100% Free Forever",
            description:
              "No hidden subscription fees, watermarks, or artificial limits on document processing.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
          },
        ],
        faqs: [
          {
            question: "Is merging PDF files on Comprexa completely secure?",
            answer:
              "Yes, 100%. Comprexa utilizes client-side WebAssembly and JavaScript to process all document operations directly inside your web browser. Your files are never uploaded to any cloud server.",
          },
          {
            question:
              "Is there a limit on how many PDFs I can combine at once?",
            answer:
              "No! Comprexa imposes no restrictions on the number of PDFs or total file size. You can combine dozens of files in a single pass.",
          },
          {
            question: "Can I change the order of pages before merging?",
            answer:
              "Yes. You can drag and drop your uploaded files to reorder them exactly as you wish before initiating the merge process.",
          },
          {
            question:
              "Does merging alter the document quality or text searchability?",
            answer:
              "No. Comprexa preserves vector graphics, searchable text layers, embedded fonts, and image resolutions without introducing compression loss.",
          },
        ],
      },

      // ------------------------------------------------------------------------
      // JSON FORMATTER
      // ------------------------------------------------------------------------
      "json-formatter": {
        features: [
          {
            title: "Syntax Highlighting & Formatting",
            description:
              "Format raw, minified JSON strings into beautifully indented structures with vibrant token colorization.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
          },
          {
            title: "Real-Time Validation & Error Hints",
            description:
              "Detect precise line numbers and syntax errors like missing commas or unmatched brackets instantly.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
          },
          {
            title: "1-Click Copy & File Export",
            description:
              "Copy formatted JSON directly to clipboard or export clean .json files with custom indentation levels.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
          },
          {
            title: "100% Private Client-Side Parsing",
            description:
              "Your sensitive JSON payloads, API response logs, and credentials stay securely in memory.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
          },
        ],
        howItWorks: [
          {
            step: 1,
            title: "Paste or Upload JSON",
            description:
              "Paste your raw JSON code or drag and drop a .json file into the code editor workspace.",
          },
          {
            step: 2,
            title: "Set Indentation & Options",
            description:
              "Choose 2 spaces, 4 spaces, or tabs, and enable key sorting if needed.",
          },
          {
            step: 3,
            title: "Copy or Download",
            description:
              "Copy the prettified output directly to clipboard or download the formatted file.",
          },
        ],
        benefits: [
          {
            title: "Developer Security",
            description:
              "Zero network traffic. Your proprietary JSON data is parsed locally without server logging.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
          },
          {
            title: "Large Payload Support",
            description:
              "Seamlessly handles megabyte-sized JSON responses without browser slowdown.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
          },
          {
            title: "Responsive Developer UI",
            description:
              "Clean line numbers, collapsible object trees, and keyboard shortcuts for rapid debugging.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
          },
        ],
        faqs: [
          {
            question: "Will my JSON data be sent to a server?",
            answer:
              "Never. The Comprexa JSON Formatter parses and formats JSON locally in your browser session using high-performance JavaScript engines.",
          },
          {
            question: "How does it handle invalid JSON syntax?",
            answer:
              "It instantly highlights syntax errors and provides specific line/column locations alongside actionable error messages.",
          },
          {
            question: "Can I sort object keys alphabetically?",
            answer:
              'Yes, check the "Sort Object Keys" option in the tool settings panel to sort JSON keys recursively.',
          },
        ],
      },

      // ------------------------------------------------------------------------
      // COLOR PICKER
      // ------------------------------------------------------------------------
      "color-picker": {
        features: [
          {
            title: "Precise Color Selection Canvas",
            description:
              "Pick colors visually using interactive 2D color gradient picker, hue sliders, and alpha opacity controls.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>`,
          },
          {
            title: "Multi-Format Codes (HEX, RGB, HSL)",
            description:
              "Instantly view and copy corresponding HEX, RGB, RGBA, HSL, HSLA, and CSS variable values with 1-click.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>`,
          },
          {
            title: "Screen Eyedropper Magnifier",
            description:
              "Sample precise pixel colors anywhere from your screen, images, or web page elements.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 22 5-5"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-4 4-5-5z"/></svg>`,
          },
          {
            title: "Shade & Tint Harmony Generation",
            description:
              "Automatically view monochromatic shades, tints, complementary, and triadic color pairings.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 2v20"/></svg>`,
          },
        ],
        howItWorks: [
          {
            step: 1,
            title: "Select or Eyedrop Color",
            description:
              "Use the interactive gradient picker, type a color code, or use the eyedropper tool.",
          },
          {
            step: 2,
            title: "Adjust HSL & Opacity",
            description:
              "Fine-tune saturation, lightness, and transparency values using intuitive sliders.",
          },
          {
            step: 3,
            title: "Copy Format Code",
            description:
              "Click any format badge (HEX, RGB, HSL, CSS) to copy the exact code to clipboard.",
          },
        ],
        benefits: [
          {
            title: "Pixel-Perfect Design Precision",
            description:
              "Essential tool for web developers, UI/UX designers, digital artists, and brand specialists.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
          },
          {
            title: "Saved Color History",
            description:
              "Stores recent color samples locally in your browser storage for quick retrieval.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
          },
          {
            title: "100% Client-Side Engine",
            description:
              "Instant response time without server API calls or latency.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
          },
        ],
        faqs: [
          {
            question: "How do I pick a color from an image or web page?",
            answer:
              'Click the "Eyedropper Tool" button, then hover over any image or element on screen to pick its exact color.',
          },
          {
            question: "Which color formats are supported?",
            answer:
              "HEX, RGB, RGBA, HSL, HSLA, HSV, and CSS custom variable strings are all computed simultaneously.",
          },
        ],
      },

      // ------------------------------------------------------------------------
      // DELETE PDF PAGES
      // ------------------------------------------------------------------------
      "delete-pdf": {
        features: [
          {
            title: "Visual Page Selection & Previews",
            description:
              "Inspect high-resolution page thumbnails to accurately locate blank sheets, covers, or confidential pages before removal.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
          },
          {
            title: "Multi-Page & Bulk Range Selection",
            description:
              "Click thumbnails, use range shortcuts (e.g., 1, 3, 5-8), or use Select All and Invert controls to purge pages in bulk.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
          },
          {
            title: "100% Client-Side Privacy",
            description:
              "PDF stream modifications execute locally in browser memory via WebAssembly. Zero file uploads to external cloud servers.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
          },
          {
            title: "Lossless Output Quality",
            description:
              "Preserves original vector artwork, crisp typography layers, embedded fonts, and hyperlinks on all remaining pages.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
          },
        ],
        howItWorks: [
          {
            step: 1,
            title: "Upload PDF Document",
            description:
              "Drag & drop your PDF file or click Browse Files to load it into the page remover workspace.",
          },
          {
            step: 2,
            title: "Select Pages to Delete",
            description:
              "Click page thumbnails or enter page ranges (e.g., 1, 3, 5-10) to mark unwanted pages for deletion.",
          },
          {
            step: 3,
            title: "Delete & Download PDF",
            description:
              "Click Delete Selected Pages and instantly download your cleaned, updated PDF document.",
          },
        ],
        benefits: [
          {
            title: "Guaranteed File Security",
            description:
              "Your sensitive legal, financial, or personal PDFs stay strictly inside your browser sandbox.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
          },
          {
            title: "Sub-Second Execution Speed",
            description:
              "No network queue delays or slow cloud servers. Process multi-hundred page PDFs instantly.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
          },
          {
            title: "100% Free & Unlimited Usage",
            description:
              "Delete pages from as many PDFs as you need without watermarks, daily caps, or account registration.",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
          },
        ],
        faqs: [
          {
            question:
              "Will deleting pages reduce the quality of remaining pages?",
            answer:
              "No! Comprexa modifies the PDF document structure directly. Text layers, vector artwork, embedded fonts, and graphics on remaining pages stay 100% losslessly preserved.",
          },
          {
            question: "Is my PDF uploaded to any server during deletion?",
            answer:
              "Never. All page extraction and deletion operations happen client-side using WebAssembly and PDF-Lib directly in your browser session.",
          },
          {
            question: "Can I delete all pages from a PDF?",
            answer:
              "A valid PDF document must contain at least one page. The tool requires at least one remaining page to construct the output file.",
          },
          {
            question: "Is there a file size limit for deleting pages?",
            answer:
              "No! Because processing is local on your computer, you can delete pages from large documents without cloud file size restrictions.",
          },
        ],
      },
    };
  }

  /**
   * Get custom or generated tool landing page content for any tool ID
   * @param {Object} tool - Tool metadata object from ComprexaToolsRegistry
   */
  getContentForTool(tool) {
    if (!tool) return this.generateFallbackContent({});

    const custom = this.customContent[tool.id] || this.customContent[tool.slug];
    if (custom) {
      return {
        features: custom.features || this._generateFallbackFeatures(tool),
        howItWorks: custom.howItWorks || this._generateFallbackHowItWorks(tool),
        benefits: custom.benefits || this._generateFallbackBenefits(tool),
        faqs: custom.faqs || this._generateFallbackFAQs(tool),
        supportedFormats: custom.supportedFormats || this._generateFallbackSupportedFormats(tool),
        useCases: custom.useCases || this._generateFallbackUseCases(tool),
      };
    }

    return {
      features: this._generateFallbackFeatures(tool),
      howItWorks: this._generateFallbackHowItWorks(tool),
      benefits: this._generateFallbackBenefits(tool),
      faqs: this._generateFallbackFAQs(tool),
      supportedFormats: this._generateFallbackSupportedFormats(tool),
      useCases: this._generateFallbackUseCases(tool),
    };
  }

  // --------------------------------------------------------------------------
  // Intelligent Category Fallback Generators
  // --------------------------------------------------------------------------

  _generateFallbackFeatures(tool) {
    const title = tool.title || "Utility Tool";
    const cat = tool.category || "general";
    
    let actionWord = "Process";
    if (cat === "pdf-tools") actionWord = "Optimize and edit";
    if (cat === "image-tools") actionWord = "Convert and resize";
    
    return [
      {
        title: "Browser-Based Execution",
        description: `${actionWord} files directly inside your browser. Fast, local, and 100% private for ${title}.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      },
      {
        title: "Zero File Upload Privacy",
        description: `Your documents remain entirely on your computer CPU. No cloud uploads or tracking when using ${title}.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      },
      {
        title: "High-Speed Performance",
        description: `Optimized with modern JavaScript and WebAssembly algorithms for instant results without delay.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      },
      {
        title: "100% Free & Unlimited",
        description: `No registration, hidden subscription fees, watermarks, or artificial limits on usage.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
      },
    ];
  }

  _generateFallbackHowItWorks(tool) {
    const title = tool.title || "Tool";
    const cat = tool.category || "general";
    
    let inputNoun = "Data or Files";
    if (cat === "pdf-tools") inputNoun = "PDF Documents";
    if (cat === "image-tools") inputNoun = "Image Files";
    
    return [
      {
        step: 1,
        title: `Input Your ${inputNoun}`,
        description: `Upload files, drag and drop, or type content into the ${title} workspace.`,
      },
      {
        step: 2,
        title: "Customize Preferences",
        description: "Adjust tool settings, options, or controls to match your exact requirements.",
      },
      {
        step: 3,
        title: "Get Instant Output",
        description: "Click process and immediately download, copy, or export your final result.",
      },
    ];
  }

  _generateFallbackBenefits(tool) {
    const title = tool.title || "this tool";
    return [
      {
        title: "Bank-Grade Security",
        description: `When using ${title}, everything is processed locally on your device. Zero external data exposure.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      },
      {
        title: "Universal Compatibility",
        description: `Works seamlessly on Windows, macOS, Linux, iOS, and Android across all modern browsers.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      },
      {
        title: "No Software Setup Needed",
        description: `Instant web access without installing bloated desktop applications or browser extensions.`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      },
    ];
  }

  _generateFallbackFAQs(tool) {
    const title = tool.title || "this tool";
    return [
      {
        question: `Is using ${title} completely free?`,
        answer: `Yes, ${title} on Comprexa is 100% free forever with no usage limits, ads, or signups required.`,
      },
      {
        question: `Are my files or inputs safe when using ${title}?`,
        answer: `Absolutely. Comprexa processes everything client-side inside your browser session. Your data never touches remote servers.`,
      },
      {
        question: `Do I need to install any software or plugins?`,
        answer: `No setup required. ${title} works directly inside Chrome, Safari, Firefox, Edge, and mobile browsers.`,
      },
    ];
  }

  _generateFallbackSupportedFormats(tool) {
    const title = tool.title || "this tool";
    const category = tool.category || "general";
    
    let input = "Any supported format";
    let output = "Optimized Output";

    if (category === "pdf-tools") {
      input = "PDF Document (.pdf)";
      output = "Modified PDF (.pdf)";
      if (tool.id === "pdf-to-word") { output = "Word Document (.docx)"; }
      if (tool.id === "pdf-to-excel") { output = "Excel Spreadsheet (.xlsx)"; }
      if (tool.id === "pdf-to-powerpoint") { output = "PowerPoint (.pptx)"; }
      if (tool.id === "pdf-to-images") { output = "ZIP Archive of Images (.zip)"; }
    } else if (category === "image-tools") {
      input = "PNG, JPG, JPEG, WEBP, GIF";
      output = "PNG, JPG, WEBP";
    } else if (category === "text-tools" || category === "developer-tools") {
      input = "Plain Text (.txt), JSON, Code";
      output = "Formatted Text / Code";
    }

    return [
      {
        type: "Input",
        format: input
      },
      {
        type: "Output",
        format: output
      }
    ];
  }

  _generateFallbackUseCases(tool) {
    const category = tool.category || "general";
    
    if (category === "pdf-tools") {
      return ["Students & Educators", "Legal Professionals", "Administrative Teams", "Small Business Owners"];
    } else if (category === "image-tools") {
      return ["Web Developers", "Graphic Designers", "Social Media Managers", "Photographers"];
    } else if (category === "developer-tools" || category === "text-tools") {
      return ["Software Engineers", "Data Analysts", "Content Writers", "QA Testers"];
    } else {
      return ["Everyday Users", "Freelancers", "Remote Workers", "Agencies"];
    }
  }
}

// Global Export
window.ComprexaToolContent = new ComprexaToolContent();
