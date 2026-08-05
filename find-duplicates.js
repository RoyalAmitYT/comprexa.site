import fs from 'fs';

const css = fs.readFileSync('css/style.css', 'utf8');

const regex = /\.([a-zA-Z0-9_-]+)\s*\{/g;
const counts = {};
let match;
while ((match = regex.exec(css)) !== null) {
  const className = match[1];
  counts[className] = (counts[className] || 0) + 1;
}

const duplicates = Object.entries(counts)
  .filter(([cls, count]) => count > 1)
  .sort((a, b) => b[1] - a[1]);

console.log(duplicates.slice(0, 30));
