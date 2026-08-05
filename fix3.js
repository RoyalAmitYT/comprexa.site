import fs from 'fs';
let content = fs.readFileSync('extract-pdf.html', 'utf8');

const startTag = '            <!-- Action & Range Bar -->';
const midTag = '            <!-- Page Thumbnails Grid -->';
// Use the end of the grid part which is '            ></div>'
const endTag = '            ></div>';

const startIndex = content.indexOf(startTag);
const midIndex = content.indexOf(midTag);
const endIndex = content.indexOf(endTag) + endTag.length;

if (startIndex > -1 && midIndex > -1 && endIndex > -1) {
  const actionPart = content.substring(startIndex, midIndex);
  const gridPart = content.substring(midIndex, endIndex);
  
  // Swap them! But wait, we should add some spacing between them.
  // Add margin-bottom to gridPart or actionPart?
  const swapped = gridPart + '\n' + actionPart;
  
  const newContent = content.substring(0, startIndex) + swapped + content.substring(endIndex);
  fs.writeFileSync('extract-pdf.html', newContent);
  console.log("Swapped successfully");
} else {
  console.log("Indexes not found", startIndex, midIndex, endIndex);
}
