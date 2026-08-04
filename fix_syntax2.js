import fs from 'fs';
let content = fs.readFileSync('js/script.js', 'utf8');

content = content.replace(/const featuredToolBtns = document\.querySelectorAll\([\s\S]*?\/\/ 8\./, '/* Featured Tool Btns JS Navigation removed */\n  // 8.');

// Also we need to fix the popularGrid event listeners. Let's find it.
content = content.replace(/popularGrid\.addEventListener\("click", \(e\) => \{[\s\S]*?\/\/ --------------------------------------------------------------------------\n  \/\/ 5\. Category Card Interactive Handlers/, '/* popularGrid JS nav removed */\n  // --------------------------------------------------------------------------\n  // 5. Category Card Interactive Handlers');

fs.writeFileSync('js/script.js', content);
