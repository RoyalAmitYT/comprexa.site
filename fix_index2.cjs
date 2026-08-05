const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const startTag = '<!-- How It Works Timeline Container -->';
const endTag = '</div>\n        </div>\n      </div>\n    </section>';

const startIndex = code.indexOf(startTag);
if (startIndex !== -1) {
    let subStr = code.substring(startIndex);
    // find the end tag
    const endStr = '      </div>\n    </section>';
    const endIndex = code.indexOf(endStr, startIndex);
    
    if (endIndex !== -1) {
        const replacement = `        <!-- Universal How It Works Component -->
        <div class="workspace-how-card fade-in-on-scroll" style="max-width: 1000px; margin: 40px auto 0;">
          <div class="workspace-how-steps">
            <!-- Step 1 -->
            <div class="workspace-how-step">
              <div class="workspace-how-step__badge">1</div>
              <div class="workspace-how-step__text">
                <strong>Upload your file</strong>
                <span>Choose the file you want to process using drag & drop or the file picker.</span>
              </div>
            </div>
            <div class="workspace-how-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
            
            <!-- Step 2 -->
            <div class="workspace-how-step">
              <div class="workspace-how-step__badge">2</div>
              <div class="workspace-how-step__text">
                <strong>Configure settings</strong>
                <span>Adjust compression levels, formats, or specialized tool parameters.</span>
              </div>
            </div>
            <div class="workspace-how-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>

            <!-- Step 3 -->
            <div class="workspace-how-step">
              <div class="workspace-how-step__badge">3</div>
              <div class="workspace-how-step__text">
                <strong>Instant processing</strong>
                <span>Files are processed securely in your browser instantly.</span>
              </div>
            </div>
            <div class="workspace-how-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>

            <!-- Step 4 -->
            <div class="workspace-how-step">
              <div class="workspace-how-step__badge">4</div>
              <div class="workspace-how-step__text">
                <strong>Download result</strong>
                <span>Save the optimized or converted file directly to your device.</span>
              </div>
            </div>
          </div>
        </div>\n`;
        code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
        fs.writeFileSync('index.html', code);
        console.log("Updated index.html successfully.");
    }
}
