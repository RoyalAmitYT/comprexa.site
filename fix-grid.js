import fs from 'fs';
let content = fs.readFileSync('extract-pdf.html', 'utf8');

content = content.replace(
/              id="extract-pages-grid"\n              style="\n                display: grid;\n                grid-template-columns: repeat\(auto-fill, minmax\(150px, 1fr\)\);\n                gap: 16px;\n              "/,
`              id="extract-pages-grid"
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 16px;
                max-height: 60vh;
                overflow-y: auto;
                padding: 16px;
                background: var(--bg-surface-hover);
                border: 1px solid var(--border-subtle);
                border-radius: var(--radius-md);
              "`
);

fs.writeFileSync('extract-pdf.html', content);
