import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf8');

const toolUrlMap = {
  'pdf-merger': '/merge-pdf.html',
  'pdf-compressor': '/compress-pdf.html',
  'compress-image': '/compress-image.html',
  'jpg-to-png': '/jpg-to-png.html',
  'qr-generator': '/qr-generator.html',
  'password-generator': '/password-generator.html'
};

content = content.replace(/<button type="button" class="([^"]*featured-tool-btn[^"]*)" data-tool="([^"]+)">([\s\S]*?)<\/button>/g, (match, classes, tool, inner) => {
  const url = toolUrlMap[tool] || `/${tool}.html`;
  return `<a href="${url}" class="${classes}" data-tool="${tool}">${inner}</a>`;
});

// Also fix featured-learn-btn
content = content.replace(/<button type="button" class="([^"]*featured-learn-btn[^"]*)" data-tool="([^"]+)">([\s\S]*?)<\/button>/g, (match, classes, tool, inner) => {
  // Usually this points to a blog article or tutorial
  // Let's assume it goes to /article.html?id=how-to-compress-pdf-without-losing-quality or something. Wait, let's just make it a link to /blog.html for now if we don't know
  const url = `/blog.html`; // or what was it doing? The original JS just did window.location.href = getToolUrl(tool) or scrolled to #tools.
  // Actually, getToolUrl just returned the tool URL! So it was opening the tool anyway? Let's check `js/script.js`
  const toolUrl = toolUrlMap[tool] || `/${tool}.html`;
  return `<a href="${toolUrl}" class="${classes}" data-tool="${tool}">${inner}</a>`;
});

fs.writeFileSync('index.html', content);
