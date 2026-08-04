import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf8');

// fix view-all-articles-btn
content = content.replace(/<button([^>]*)id="view-all-articles-btn"([^>]*)>([\s\S]*?)<\/button>/gi, (match, p1, p2, inner) => {
  return `<a href="/blog.html"${p1}id="view-all-articles-btn"${p2}>${inner}</a>`;
});

fs.writeFileSync('index.html', content);

let scriptContent = fs.readFileSync('js/script.js', 'utf8');
scriptContent = scriptContent.replace(/viewAllArticlesBtn\.addEventListener\("click", \(\) => \{\s*window\.location\.href = "\/blog\.html";\s*\}\);/g, '/* viewAllArticlesBtn JS nav removed */');
fs.writeFileSync('js/script.js', scriptContent);

