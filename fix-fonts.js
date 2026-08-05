import fs from 'fs';
let css = fs.readFileSync('css/style.css', 'utf8');

css = css.replace(/var\(--font-display\)/g, 'var(--font-family)');

fs.writeFileSync('css/style.css', css);
