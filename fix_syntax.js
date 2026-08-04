import fs from 'fs';
let content = fs.readFileSync('js/script.js', 'utf8');

// I'll replace the block from 
// "const categoryCards =" up to "// 7. Featured Tool Button Handlers"
// with a commented out block.
content = content.replace(/const categoryCards = document\.querySelectorAll\("\.category-card"\);[\s\S]*?\/\/ 7\. Featured Tool Button Handlers/, '/* Category Cards JS Navigation removed */\n  // 7. Featured Tool Button Handlers');

// Similarly for featured tools
content = content.replace(/const featuredToolBtns = document\.querySelectorAll\([\s\S]*?\/\/ 8\. Smooth Scrolling Anchor Links/, '/* Featured Tool Btns JS Navigation removed */\n  // 8. Smooth Scrolling Anchor Links');

fs.writeFileSync('js/script.js', content);
