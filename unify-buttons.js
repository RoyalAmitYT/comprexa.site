import fs from 'fs';

let css = fs.readFileSync('css/style.css', 'utf8');

// Replace standard button padding to also include min-height
css = css.replace(/\.btn \{\n  display: inline-flex;/g, '.btn {\n  display: inline-flex;\n  min-height: 44px;');
css = css.replace(/\.btn--sm \{\n  padding: 6px 14px;/g, '.btn--sm {\n  padding: 6px 14px;\n  min-height: 36px;');
css = css.replace(/\.btn--lg \{\n  padding: 14px 28px;/g, '.btn--lg {\n  padding: 14px 28px;\n  min-height: 48px;');

fs.writeFileSync('css/style.css', css);
