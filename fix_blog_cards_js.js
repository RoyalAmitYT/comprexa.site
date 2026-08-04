import fs from 'fs';

let content = fs.readFileSync('js/script.js', 'utf8');

// replace <article class="blog-card... with <a href... class="blog-card...
content = content.replace(
  /<article class="blog-card fade-in-on-scroll visible" tabindex="0" role="button" data-url="(\/article\.html\?id=\$\{article\.id\})">/g,
  '<a href="$1" class="blog-card fade-in-on-scroll visible">'
);
content = content.replace(
  /<\/article>\s*`,/g,
  '</a>\n      `,'
);

// Comment out the click and keydown handlers
content = content.replace(/blogGrid\.querySelectorAll\("\.blog-card"\)\.forEach\(\(card\) => \{[\s\S]*?\}\);/g, '/* blog card JS nav removed */');

fs.writeFileSync('js/script.js', content);
