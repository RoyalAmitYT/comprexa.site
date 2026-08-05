import fs from 'fs';

let css = fs.readFileSync('css/style.css', 'utf8');

const unifyHover = (cls) => {
  const regex = new RegExp(`\\.${cls}:hover\\s*\\{[^}]*\\}`, 'g');
  css = css.replace(regex, `.${cls}:hover {\n  transform: translateY(-4px);\n  border-color: var(--primary-border);\n  box-shadow: var(--shadow-lg), var(--shadow-glow);\n}`);
};

['feature-card', 'category-card', 'featured-card', 'trust-card', 'privacy-card'].forEach(unifyHover);

fs.writeFileSync('css/style.css', css);
