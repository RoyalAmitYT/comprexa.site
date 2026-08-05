import fs from 'fs';
import path from 'path';

const optimizedFonts = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Try to remove old font links
  content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" ?\/?>/g, '');
  content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin ?\/?>/g, '');
  content = content.replace(/<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^"]*"[^>]*>/g, '');
  
  // Re-add them correctly before </head>
  content = content.replace('</head>', optimizedFonts + '\n</head>');
  
  // Clean up any empty spaces left
  content = content.replace(/(?:\r?\n\s*){3,}/g, '\n\n');
  
  fs.writeFileSync(filePath, content);
}

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => processFile(path.join(dir, f)));
