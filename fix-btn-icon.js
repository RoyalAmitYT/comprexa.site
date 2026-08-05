import fs from 'fs';

let css = fs.readFileSync('css/style.css', 'utf8');

css = css.replace(/\.btn--icon \{\n  width: 35px;\n  height: 35px;/g, '.btn--icon {\n  width: 36px;\n  height: 36px;\n  min-height: 36px !important;');

fs.writeFileSync('css/style.css', css);
