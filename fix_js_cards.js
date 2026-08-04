import fs from 'fs';

let content = fs.readFileSync('js/script.js', 'utf8');

// Replace feature-card article with a tag
content = content.replace(
  /<article class="feature-card"([^>]*)data-url="\$\{escapeHTML\(targetUrl\)\}"([^>]*)>([\s\S]*?)<\/article>/gi,
  '<a href="${escapeHTML(targetUrl)}" class="feature-card"$1$2>$3</a>'
);

// We need to disable the JS click handlers for feature-card and category-card because they are now links.
// Let's find those lines in script.js and comment them out.
content = content.replace(/popularGrid\.addEventListener\("click", \(e\) => \{[\s\S]*?\}\);\s*popularGrid\.addEventListener\("keydown", \(e\) => \{[\s\S]*?\}\);/g, '/* JS navigation removed for SEO */');
content = content.replace(/categoryCards\.forEach\(\(card\) => \{[\s\S]*?\}\);/g, '/* JS navigation removed for SEO */');

fs.writeFileSync('js/script.js', content);
