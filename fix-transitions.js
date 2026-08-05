import fs from 'fs';

let css = fs.readFileSync('css/style.css', 'utf8');
css = css.replace(/transition:\s+transform,\s+opacity,\s+background-color,\s+border-color,\s+color,\s+box-shadow,\s+filter\s+var\(--transition-fast\);/g, 'transition: all var(--transition-fast);');
css = css.replace(/transition:\s+transform,\s+opacity,\s+background-color,\s+border-color,\s+color,\s+box-shadow,\s+filter\s+var\(--transition-normal\);/g, 'transition: all var(--transition-normal);');
css = css.replace(/transition:\s+transform,\s+opacity,\s+background-color,\s+border-color,\s+color,\s+box-shadow,\s+filter\s+300ms\s+ease;/g, 'transition: all 300ms ease;');
fs.writeFileSync('css/style.css', css);
