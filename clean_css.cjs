const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

// Find and remove the old how it works section CSS
const startComment = '/* --------------------------------------------------------------------------\n   9. How It Works Section (Index.html timeline)\n   -------------------------------------------------------------------------- */';
const endComment = '/* --------------------------------------------------------------------------\n   10. Benefits Section';

if (css.includes(startComment) && css.includes(endComment)) {
    const startIndex = css.indexOf(startComment);
    const endIndex = css.indexOf(endComment);
    css = css.substring(0, startIndex) + css.substring(endIndex);
    fs.writeFileSync('css/style.css', css);
    console.log("Removed old how-it-works CSS from style.css");
} else {
    console.log("Could not find old how-it-works CSS block.");
}
