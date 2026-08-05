import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find head block
  const headStart = content.indexOf('<head>');
  const headEnd = content.indexOf('</head>');
  if (headStart === -1 || headEnd === -1) return;
  
  let head = content.substring(headStart, headEnd);
  
  // Find all titles
  const titleRegex = /<title>[\s\S]*?<\/title>/g;
  const matches = [...head.matchAll(titleRegex)];
  
  if (matches.length > 1) {
    // Remove all but the last
    for (let i = 0; i < matches.length - 1; i++) {
      head = head.replace(matches[i][0], '');
    }
    content = content.substring(0, headStart) + head + content.substring(headEnd);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed duplicate titles in ${filePath}`);
  }
}

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => processFile(path.join(dir, f)));

