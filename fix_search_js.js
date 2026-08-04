import fs from 'fs';

let content = fs.readFileSync('js/script.js', 'utf8');

content = content.replace(
  /<div class="search-results__item"([^>]*)data-url="\$\{escapeHTML\(targetUrl\)\}"([^>]*)>([\s\S]*?)<\/div>/gi,
  '<a href="${escapeHTML(targetUrl)}" class="search-results__item"$1$2>$3</a>'
);

content = content.replace(/searchResults\.addEventListener\("click", \(e\) => \{[\s\S]*?\}\);\s*searchResults\.addEventListener\("keydown", \(e\) => \{[\s\S]*?\}\);/g, '/* search results JS navigation removed for SEO */');

// Let's also check for featured-tool-btn and featured-learn-btn
content = content.replace(/featuredToolBtns\.forEach\(\(btn\) => \{[\s\S]*?\}\);/g, '/* featured btn JS navigation removed */');

fs.writeFileSync('js/script.js', content);
