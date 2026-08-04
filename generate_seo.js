import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://comprexa.com'; // We'll assume a generic domain, or we can use https://comprexa.com
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

// 1. Generate robots.txt
fs.writeFileSync('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);

// 2. Generate Sitemaps
const tools = [];
const pages = [];
const blog = ['blog.html', 'article.html'];

htmlFiles.forEach(f => {
  if (['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(f)) {
    pages.push(f);
  } else if (f.endsWith('-tools.html') || f === 'category-template.html') {
    pages.push(f);
  } else if (!blog.includes(f) && f !== 'tool-template.html') {
    tools.push(f);
  }
});

const generateSitemap = (files) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map(f => `  <url>
    <loc>${SITE_URL}/${f === 'index.html' ? '' : f}</loc>
    <changefreq>${f === 'index.html' ? 'daily' : 'weekly'}</changefreq>
    <priority>${f === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
};

fs.writeFileSync('sitemap-pages.xml', generateSitemap(pages));
fs.writeFileSync('sitemap-tools.xml', generateSitemap(tools));
fs.writeFileSync('sitemap-blog.xml', generateSitemap(blog));

fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-tools.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
  </sitemap>
</sitemapindex>`);

// 3. Web Manifest
const manifest = {
  "name": "Comprexa",
  "short_name": "Comprexa",
  "description": "Comprexa - Every File Tool. One Place. Compress, convert, merge, resize and optimize your files in seconds with 100% privacy.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
};
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

// 4. Update HTML Files
htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Ensure <html lang="en">
  content = content.replace(/<html[^>]*>/i, (match) => {
    if (!match.includes('lang=')) {
      return match.replace('<html', '<html lang="en"');
    }
    return match;
  });

  const urlPath = file === 'index.html' ? '' : file;
  const canonicalUrl = `${SITE_URL}/${urlPath}`;
  
  // Meta tags to insert
  const metaTags = `
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="color-scheme" content="light dark" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="theme-color" content="#6366f1" />
`;

  // Remove existing canonical, manifest, etc. if they exist to avoid duplicates
  content = content.replace(/<link rel="canonical"[^>]*>/gi, '');
  content = content.replace(/<link rel="manifest"[^>]*>/gi, '');
  content = content.replace(/<link rel="icon"[^>]*>/gi, '');
  content = content.replace(/<link rel="apple-touch-icon"[^>]*>/gi, '');
  content = content.replace(/<meta name="color-scheme"[^>]*>/gi, '');
  content = content.replace(/<meta name="mobile-web-app-capable"[^>]*>/gi, '');
  content = content.replace(/<meta name="apple-mobile-web-app-capable"[^>]*>/gi, '');
  content = content.replace(/<meta name="apple-mobile-web-app-status-bar-style"[^>]*>/gi, '');
  content = content.replace(/<meta name="format-detection"[^>]*>/gi, '');
  content = content.replace(/<meta name="referrer"[^>]*>/gi, '');
  content = content.replace(/<meta name="theme-color"[^>]*>/gi, '');

  content = content.replace('</head>', `${metaTags}</head>`);
  
  fs.writeFileSync(file, content);
});

