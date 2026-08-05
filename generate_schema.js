import fs from 'fs';

const SITE_URL = 'https://comprexa.in';
const LOGO_URL = `${SITE_URL}/icon-512x512.png`;

const categories = {
  'pdf': 'PDF Tools',
  'image': 'Image Tools',
  'converter': 'Converter Tools',
  'qr': 'QR Tools',
  'text': 'Text Tools',
  'developer': 'Developer Tools',
  'color': 'Color Tools',
  'utility': 'Utility Tools',
  'document': 'Document Tools'
};

const fileCategoryMap = {
  'compress-pdf.html': 'pdf',
  'merge-pdf.html': 'pdf',
  'split-pdf.html': 'pdf',
  'organize-pdf.html': 'pdf',
  'rotate-pdf.html': 'pdf',
  'extract-pdf.html': 'pdf',
  'delete-pdf.html': 'pdf',
  'watermark-pdf.html': 'pdf',
  'unlock-pdf.html': 'pdf',
  'protect-pdf.html': 'pdf',
  'pdf-to-images.html': 'pdf',

  'word-to-pdf.html': 'converter',
  'excel-to-pdf.html': 'converter',
  'powerpoint-to-pdf.html': 'converter',
  'word-to-jpg.html': 'converter',
  'word-to-txt.html': 'converter',
  'pdf-to-word.html': 'converter',
  'pdf-to-excel.html': 'converter',
  'pdf-to-powerpoint.html': 'converter',
  'document-metadata-viewer.html': 'developer',

  'compress-image.html': 'image',
  'resize-image.html': 'image',
  'crop-image.html': 'image',
  'rotate-image.html': 'image',
  'watermark-image.html': 'image',
  'convert-image.html': 'image',
  'jpg-to-png.html': 'image',
  'png-to-jpg.html': 'image',
  'webp-to-png.html': 'image',

  'qr-generator.html': 'qr',
  'qr-scanner.html': 'qr',

  'word-counter.html': 'text',
  'character-counter.html': 'text',
  'case-converter.html': 'text',
  'remove-extra-spaces.html': 'text',
  'remove-duplicate-lines.html': 'text',
  'text-sorter.html': 'text',

  'json-formatter.html': 'developer',
  'json-minifier.html': 'developer',
  'json-validator.html': 'developer',
  'json-tree-viewer.html': 'developer',
  'json-yaml-converter.html': 'developer',
  'base64-encoder-decoder.html': 'developer',
  'hash-generator.html': 'developer',

  'password-generator.html': 'utility',
  'password-strength-checker.html': 'utility',
  'random-number-generator.html': 'utility',
  'random-string-generator.html': 'utility',
  'uuid-generator.html': 'utility',
  'timestamp-converter.html': 'utility',

  'color-picker.html': 'color',
  'color-converter.html': 'color',
  'color-palette-generator.html': 'color'
};

const categoryLandingPages = {
  'pdf-tools.html': 'pdf',
  'image-tools.html': 'image',
  'converter-tools.html': 'converter',
  'qr-tools.html': 'qr',
  'text-tools.html': 'text',
  'developer-tools.html': 'developer',
  'color-tools.html': 'color',
  'utility-tools.html': 'utility',
  'document-tools.html': 'document'
};

const getTitle = (content) => {
  const match = content.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
};

const getCleanTitle = (fullTitle) => {
  return fullTitle.replace(/\s*[\-\|]\s*Comprexa.*$/i, '').trim();
};

const getDesc = (content) => {
  const match = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return match ? match[1].trim() : '';
};

const extractFAQ = (content) => {
  const faqs = [];

  // Strategy A: itemprop="name" & itemprop="text" (e.g. index.html)
  let qRegex = /<span itemprop="name">([\s\S]*?)<\/span>/gi;
  let aRegex = /<div class="faq-item__content"[^>]*>\s*<p>([\s\S]*?)<\/p>/gi;

  let questions = [...content.matchAll(qRegex)].map(m => m[1].trim());
  let answers = [...content.matchAll(aRegex)].map(m => m[1].trim().replace(/\s+/g, ' '));

  // Strategy B: button.faq-item__question & div.faq-item__answer (e.g. about.html, contact.html)
  if (questions.length === 0 || questions.length !== answers.length) {
    qRegex = /<button class="faq-item__question"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/gi;
    aRegex = /<div class="faq-item__answer"[^>]*>\s*<p>([\s\S]*?)<\/p>/gi;
    questions = [...content.matchAll(qRegex)].map(m => m[1].trim());
    answers = [...content.matchAll(aRegex)].map(m => m[1].trim().replace(/\s+/g, ' '));
  }

  if (questions.length > 0 && questions.length === answers.length) {
    for (let i = 0; i < questions.length; i++) {
      faqs.push({
        "@type": "Question",
        "name": questions[i],
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answers[i]
        }
      });
    }
  }
  return faqs;
};

// Fallback FAQs for tool pages
const getToolFallbackFAQs = (toolTitle) => {
  return [
    {
      "@type": "Question",
      "name": `Is using ${toolTitle} completely free?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes, ${toolTitle} on Comprexa is 100% free forever with no usage limits, ads, or signups required.`
      }
    },
    {
      "@type": "Question",
      "name": `Are my files or inputs safe when using ${toolTitle}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Absolutely. Comprexa processes everything client-side inside your web browser session. Your data never touches remote servers.`
      }
    },
    {
      "@type": "Question",
      "name": `Do I need to install any software or plugins?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `No setup required. ${toolTitle} works directly inside Chrome, Safari, Firefox, Edge, and mobile browsers.`
      }
    }
  ];
};

const getCategoryFAQs = (categoryName) => {
  return [
    {
      "@type": "Question",
      "name": `Are all ${categoryName} on Comprexa free to use?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes, all ${categoryName} on Comprexa are completely free with zero restrictions or daily limits.`
      }
    },
    {
      "@type": "Question",
      "name": `Is my data private when using ${categoryName}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes! Every tool runs 100% in your browser using JavaScript and WebAssembly. No files or private data are ever uploaded.`
      }
    },
    {
      "@type": "Question",
      "name": `Do I need to create an account to access ${categoryName}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `No registration or account creation is required. You can use all tools immediately.`
      }
    }
  ];
};

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Strip existing JSON-LD script tags
  content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/gi, '');

  const urlPath = file === 'index.html' ? '' : file;
  const canonicalUrl = `${SITE_URL}/${urlPath}`;
  const rawTitle = getTitle(content);
  const cleanTitle = getCleanTitle(rawTitle);
  const desc = getDesc(content);

  const schemas = [];

  // 1. HOMEPAGE SPECIFIC SCHEMAS
  if (file === 'index.html') {
    // Organization
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "Comprexa",
      "url": SITE_URL,
      "logo": LOGO_URL,
      "description": desc,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": `${SITE_URL}/contact.html`
      }
    });

    // WebSite (NO SearchAction per prompt rules)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "name": "Comprexa",
      "url": SITE_URL,
      "inLanguage": "en-US",
      "publisher": {
        "@id": `${SITE_URL}/#organization`
      }
    });

    // WebPage
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      "url": `${SITE_URL}/`,
      "name": rawTitle,
      "description": desc,
      "inLanguage": "en-US",
      "isPartOf": {
        "@id": `${SITE_URL}/#website`
      }
    });
  } else {
    // 2. EVERY OTHER PAGE: WebPage Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      "url": canonicalUrl,
      "name": rawTitle,
      "description": desc,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "name": "Comprexa",
        "url": SITE_URL
      },
      "breadcrumb": {
        "@id": `${canonicalUrl}#breadcrumb`
      }
    });
  }

  // 3. BREADCRUMB LIST (Every internal page except index.html and 404.html)
  if (file !== 'index.html' && file !== '404.html') {
    const itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      }
    ];

    if (file === 'blog.html' || file === 'article.html') {
      itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${SITE_URL}/blog.html`
      });
      if (file === 'article.html') {
        itemListElement.push({
          "@type": "ListItem",
          "position": 3,
          "name": cleanTitle,
          "item": canonicalUrl
        });
      }
    } else if (fileCategoryMap[file]) {
      const catKey = fileCategoryMap[file];
      const catName = categories[catKey];
      const catUrl = `${SITE_URL}/${catKey}-tools.html`;
      itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": catName,
        "item": catUrl
      });
      itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": cleanTitle,
        "item": canonicalUrl
      });
    } else if (categoryLandingPages[file]) {
      const catKey = categoryLandingPages[file];
      itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": categories[catKey],
        "item": canonicalUrl
      });
    } else {
      itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": cleanTitle,
        "item": canonicalUrl
      });
    }

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": itemListElement
    });
  }

  // 4. TOOL PAGES: WebApplication Schema
  if (fileCategoryMap[file]) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#webapp`,
      "name": cleanTitle,
      "url": canonicalUrl,
      "description": desc,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires HTML5, JavaScript enabled web browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Comprexa",
        "url": SITE_URL
      }
    });

    // Tool FAQs
    const htmlFaqs = extractFAQ(content);
    const faqs = htmlFaqs.length > 0 ? htmlFaqs : getToolFallbackFAQs(cleanTitle);
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faqpage`,
      "mainEntity": faqs
    });
  }

  // 5. CATEGORY LANDING PAGES: CollectionPage Schema + FAQs
  if (categoryLandingPages[file]) {
    const catKey = categoryLandingPages[file];
    const catName = categories[catKey];
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collectionpage`,
      "name": rawTitle,
      "description": desc,
      "url": canonicalUrl,
      "isPartOf": {
        "@id": `${SITE_URL}/#website`
      }
    });

    const htmlFaqs = extractFAQ(content);
    const faqs = htmlFaqs.length > 0 ? htmlFaqs : getCategoryFAQs(catName);
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faqpage`,
      "mainEntity": faqs
    });
  }

  // 6. BLOG & ARTICLE SCHEMAS
  if (file === 'blog.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collectionpage`,
      "name": rawTitle,
      "description": desc,
      "url": canonicalUrl,
      "isPartOf": {
        "@id": `${SITE_URL}/#website`
      }
    });
  } else if (file === 'article.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#blogposting`,
      "headline": cleanTitle || "Comprexa Blog Article",
      "description": desc,
      "url": canonicalUrl,
      "datePublished": "2026-08-01T00:00:00Z",
      "dateModified": "2026-08-05T00:00:00Z",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "author": {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Comprexa",
        "url": SITE_URL
      },
      "publisher": {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Comprexa",
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_URL
        }
      },
      "image": LOGO_URL
    });
  }

  // 7. STATIC PAGES SPECIFIC SCHEMAS
  if (file === 'about.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${canonicalUrl}#aboutpage`,
      "name": rawTitle,
      "description": desc,
      "url": canonicalUrl
    });
    const faqs = extractFAQ(content);
    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faqpage`,
        "mainEntity": faqs
      });
    }
  } else if (file === 'contact.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${canonicalUrl}#contactpage`,
      "name": rawTitle,
      "description": desc,
      "url": canonicalUrl
    });
    const faqs = extractFAQ(content);
    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faqpage`,
        "mainEntity": faqs
      });
    }
  }

  // 8. INJECT SCHEMA TAGS INTO HEAD
  if (schemas.length > 0) {
    const schemaHtml = schemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n  ');
    
    content = content.replace('</head>', `  ${schemaHtml}\n</head>`);
    fs.writeFileSync(file, content);
  }
});

console.log("Structured Schema JSON-LD injected across all HTML files successfully.");
