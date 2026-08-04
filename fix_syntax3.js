import fs from 'fs';
let content = fs.readFileSync('js/script.js', 'utf8');

content = content.replace(/\/\* blog card JS nav removed \*\/[\s\S]*?\}\);\s*\}\);\s*\}\s*\}/, '/* blog card JS nav removed */\n    }\n  }');

fs.writeFileSync('js/script.js', content);
