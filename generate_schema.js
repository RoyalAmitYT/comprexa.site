import fs from 'fs';

const SITE_URL = 'https://comprexa.com';
const LOGO_URL = `${SITE_URL}/icon-512x512.png`;

const categories = {
  'pdf': 'PDF Tools',
  'image': 'Image Tools',
  'converter': 'Converter Tools',
  'qr': 'QR Tools',
  'text': 'Text Tools',
  'developer': 'Developer Tools',
  'color': 'Color Tools',
  'utility': 'Utility Tools'
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

const getTitle = (content) => {
  const match = content.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1] : '';
};

const getDesc = (content) => {
  const match = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return match ? match[1] : '';
};

const extractFAQ = (content) => {
  const faqs = [];
  
  // Strategy 1: index.html
  let titleRegex = /<span itemprop="name">([\s\S]*?)<\/span>/gi;
  let contentRegex = /<div class="faq-item__content" itemprop="text">\s*<p>([\s\S]*?)<\/p>/gi;

  let titles = [...content.matchAll(titleRegex)].map(m => m[1].trim());
  let contents = [...content.matchAll(contentRegex)].map(m => m[1].trim().replace(/\s+/g, ' '));

  // Strategy 2: contact.html & about.html
  if (titles.length === 0) {
    titleRegex = /<button class="faq-item__question"[^>]*>\s*<span>([\s\S]*?)<\/span>/gi;
    contentRegex = /<div class="faq-item__answer"[^>]*>\s*<p>([\s\S]*?)<\/p>/gi;
    titles = [...content.matchAll(titleRegex)].map(m => m[1].trim());
    contents = [...content.matchAll(contentRegex)].map(m => m[1].trim().replace(/\s+/g, ' '));
  }

  if (titles.length > 0 && titles.length === contents.length) {
    for (let i = 0; i < titles.length; i++) {
      faqs.push({
        "@type": "Question",
        "name": titles[i],
        "acceptedAnswer": {
          "@type": "Answer",
          "text": contents[i]
        }
      });
    }
  }
  return faqs;
};

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Clean up any existing JSON-LD schema
  content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/gi, '');

  const urlPath = file === 'index.html' ? '' : file;
  const canonicalUrl = `${SITE_URL}/${urlPath}`;
  const title = getTitle(content);
  const desc = getDesc(content);
  
  const schemas = [];

  // 1 & 2. Organization and WebSite schema on all pages (or just index, but good on index)
  if (file === 'index.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Comprexa",
      "url": SITE_URL,
      "logo": LOGO_URL,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": `${SITE_URL}/contact.html`
      },
      "sameAs": [
        "https://twitter.com/comprexa",
        "https://facebook.com/comprexa",
        "https://linkedin.com/company/comprexa"
      ]
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Comprexa",
      "url": SITE_URL,
      "language": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
  }

  // 3. BreadcrumbList
  if (file !== 'index.html' && file !== '404.html') {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        }
      ]
    };

    let pos = 2;

    if (file === 'blog.html' || file === 'article.html') {
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": pos++,
        "name": "Blog",
        "item": `${SITE_URL}/blog.html`
      });
      if (file === 'article.html') {
        breadcrumbList.itemListElement.push({
          "@type": "ListItem",
          "position": pos++,
          "name": "Article",
          "item": canonicalUrl
        });
      }
    } else if (fileCategoryMap[file]) {
      const catKey = fileCategoryMap[file];
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": pos++,
        "name": categories[catKey],
        "item": `${SITE_URL}/${catKey}-tools.html`
      });
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": pos++,
        "name": title.split('|')[0].trim(),
        "item": canonicalUrl
      });
    } else {
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": pos++,
        "name": title.split('|')[0].trim(),
        "item": canonicalUrl
      });
    }
    schemas.push(breadcrumbList);
  }

  // 4. SoftwareApplication
  if (fileCategoryMap[file]) {
    const catKey = fileCategoryMap[file];
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": title.split('|')[0].trim(),
      "url": canonicalUrl,
      "description": desc,
      "applicationCategory": "BrowserApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
  }

  // 5. FAQPage
  const faqs = extractFAQ(content);
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs
    });
  }

  // 6. Blog Schema
  if (file === 'blog.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": desc,
      "url": canonicalUrl
    });
  } else if (file === 'article.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Comprexa Blog Article", 
      "description": desc,
      "image": LOGO_URL,
      "author": {
        "@type": "Organization",
        "name": "Comprexa",
        "url": SITE_URL
      },
      "publisher": {
        "@type": "Organization",
        "name": "Comprexa",
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_URL
        }
      },
      "datePublished": "2026-08-01T00:00:00Z",
      "dateModified": "2026-08-01T00:00:00Z"
    });
  }

  // 7, 8, 9, 10
  if (file === 'about.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": title,
      "description": desc,
      "url": canonicalUrl
    });
  } else if (file === 'contact.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": title,
      "description": desc,
      "url": canonicalUrl
    });
  } else if (file === 'privacy.html' || file === 'terms.html') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": desc,
      "url": canonicalUrl
    });
  }

  if (schemas.length > 0) {
    const schemaHtml = schemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n  ');
    
    // Insert before </head>
    content = content.replace('</head>', `${schemaHtml}\n</head>`);
    
    fs.writeFileSync(file, content);
  }
});

console.log("Schema injected.");
