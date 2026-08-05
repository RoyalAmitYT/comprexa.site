import fs from 'fs';
let css = fs.readFileSync('css/style.css', 'utf8');

css = css.replace(/--radius-sm: 8px;/g, '--radius-sm: 6px;');
css = css.replace(/--radius-md: 12px;/g, '--radius-md: 8px;');
css = css.replace(/--radius-lg: 16px;/g, '--radius-lg: 12px;');
css = css.replace(/--radius-xl: 24px;/g, '--radius-xl: 16px;');

fs.writeFileSync('css/style.css', css);
