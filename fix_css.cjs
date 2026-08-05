const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

const marker = '/* ==========================================================================\n   How It Works Section (Universal Workspace)';
if (css.includes(marker)) {
    css = css.substring(0, css.indexOf(marker));
    fs.writeFileSync('css/style.css', css);
    console.log("Removed old block.");
} else {
    console.log("Marker not found.");
}
