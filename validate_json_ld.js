import fs from 'fs';

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

let allValid = true;

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const scriptRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  
  const matches = [...content.matchAll(scriptRegex)];
  
  matches.forEach(match => {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      console.error(`Invalid JSON in ${file}:`, e.message);
      console.error(match[1]);
      allValid = false;
    }
  });
});

if (allValid) {
  console.log('All JSON-LD blocks are valid.');
} else {
  console.log('Errors found.');
}
