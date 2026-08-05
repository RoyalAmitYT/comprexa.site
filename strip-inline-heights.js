import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Regex to remove height:\s*\d+px;? from style attributes in buttons or .btn elements
  // This is tricky with regex, let's just find and replace specific known strings or use simple string replacements
  let count = 0;
  
  content = content.replace(/style="([^"]*?)height:\s*\d+px;?([^"]*)"/g, (match, p1, p2) => {
    count++;
    const newStyle = (p1 + p2).trim().replace(/;$/, '');
    if (newStyle === '') return '';
    return `style="${newStyle}"`;
  });

  if (count > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}: removed ${count} inline heights`);
  }
}

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => processFile(path.join(dir, f)));

