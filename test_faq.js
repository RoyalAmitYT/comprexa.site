import fs from 'fs';
const content = fs.readFileSync('about.html', 'utf8');

const titleRegex = /<button class="faq-item__question"[^>]*>\s*<span>([\s\S]*?)<\/span>/gi;
const contentRegex = /<div class="faq-item__answer"[^>]*>\s*<p>([\s\S]*?)<\/p>/gi;

let titles = [...content.matchAll(titleRegex)].map(m => m[1].trim());
let contents = [...content.matchAll(contentRegex)].map(m => m[1].trim().replace(/\s+/g, ' '));

console.log(titles);
console.log(contents);
