import fs from 'fs';
import path from 'path';

// Parse generate_metadata.js to get the metadataMap
const metadataContent = fs.readFileSync('generate_metadata.js', 'utf8');
const mapStr = metadataContent.match(/const metadataMap = (\{[\s\S]*?\});/)[1];
const metadataMap = eval('(' + mapStr + ')');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('<div id="landing-hero"></div>')) {
    const meta = metadataMap[file] || {
      title: `${file.replace('.html', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Comprexa`,
      desc: `Free online tool for ${file.replace('.html', '').replace(/-/g, ' ')}. Process your files securely in your browser with Comprexa.`
    };
    
    // Extract the main part of the title (before the pipe or dash)
    let mainTitle = meta.title.split('|')[0].split('—')[0].trim();
    
    const injection = `<div id="landing-hero">\n        <h1 class="visually-hidden">${mainTitle}</h1>\n        <p class="visually-hidden">${meta.desc}</p>\n      </div>`;
    content = content.replace('<div id="landing-hero"></div>', injection);
    
    fs.writeFileSync(file, content);
  }
});
console.log("H1 tags injected successfully.");
