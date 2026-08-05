import fs from 'fs';
let css = fs.readFileSync('css/style.css', 'utf8');

// There are two .tool-card:hover definitions.
// Remove the second one if it exists or just unify.
const regex = /\.tool-card:hover\s*\{[^}]*\}/g;
css = css.replace(regex, `.tool-card:hover {\n  transform: translateY(-4px);\n  border-color: var(--primary-border);\n  box-shadow: var(--shadow-lg), var(--shadow-glow);\n  background-color: var(--bg-surface-hover);\n}`);

// But we don't want to duplicate it. So we replace all occurrences, and maybe leave the background-color. 
fs.writeFileSync('css/style.css', css);
