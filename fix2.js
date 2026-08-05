import fs from 'fs';
let content = fs.readFileSync('extract-pdf.html', 'utf8');

content = content.replace(
/          <\/div>\n        <\/div>\n      <\/section>/,
`            </div>
          </div>
        </div>
      </section>`
);

fs.writeFileSync('extract-pdf.html', content);
