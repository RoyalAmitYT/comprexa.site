const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');
css = css.split('/* ==========================================================================')[0];
fs.writeFileSync('css/style.css', css);
