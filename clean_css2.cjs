const fs = require('fs');
const lines = fs.readFileSync('css/style.css', 'utf8').split('\n');

const startLine = 2584; // /* --------------------------------------------------------------------------
const endLine = 2703;

const newLines = [...lines.slice(0, startLine - 1), ...lines.slice(endLine - 1)];
fs.writeFileSync('css/style.css', newLines.join('\n'));
console.log("Removed old how-it-works CSS from style.css using lines");
