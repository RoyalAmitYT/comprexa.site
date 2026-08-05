import fs from 'fs';

let css = fs.readFileSync('css/style.css', 'utf8');

// Unify feature-card, category-card, featured-card paddings
// But wait, the prompt asks for "Same card padding". 
// I will just use `padding: 24px;` for all standard cards to be consistent.

css = css.replace(/\.category-card \{\n  display: flex;\n  flex-direction: column;\n  background-color: var\(--bg-surface\);\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-xl\);\n  padding: [^\n]+;/g, 
  '.category-card {\n  display: flex;\n  flex-direction: column;\n  background-color: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-xl);\n  padding: 24px;');

css = css.replace(/\.featured-card \{\n  display: flex;\n  flex-direction: column;\n  background-color: var\(--bg-surface\);\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-xl\);\n  padding: [^\n]+;/g, 
  '.featured-card {\n  display: flex;\n  flex-direction: column;\n  background-color: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-xl);\n  padding: 24px;');

css = css.replace(/\.trust-card \{\n  display: flex;\n  flex-direction: column;\n  background-color: var\(--bg-surface\);\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-xl\);\n  padding: [^\n]+;/g, 
  '.trust-card {\n  display: flex;\n  flex-direction: column;\n  background-color: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-xl);\n  padding: 24px;');
  
css = css.replace(/\.privacy-card \{\n  display: flex;\n  flex-direction: column;\n  background-color: var\(--bg-surface\);\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-xl\);\n  padding: [^\n]+;/g, 
  '.privacy-card {\n  display: flex;\n  flex-direction: column;\n  background-color: var(--bg-surface);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-xl);\n  padding: 24px;');

fs.writeFileSync('css/style.css', css);
