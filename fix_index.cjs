const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldIndexSection = `        <!-- How It Works Timeline Container -->
        <div class="how-it-works__timeline-wrap">
          <div class="how-it-works__line" aria-hidden="true"></div>
          <div class="how-it-works__grid">
            
            <!-- Step 1 -->
            <div class="step-card fade-in-on-scroll">
              <div class="step-card__top">
                <span class="step-card__number">01</span>
                <div class="step-card__icon step-icon--blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
              </div>
              <h3 class="step-card__title">Upload your file</h3>
              <p class="step-card__desc">
                Choose the file you want to process using drag & drop or the file picker.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="step-card fade-in-on-scroll">
              <div class="step-card__top">
                <span class="step-card__number">02</span>
                <div class="step-card__icon step-icon--purple">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"/>
                    <line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="3"/>
                  </svg>
                </div>
              </div>
              <h3 class="step-card__title">Configure settings</h3>
              <p class="step-card__desc">
                Adjust compression levels, formats, or specialized tool parameters.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="step-card fade-in-on-scroll">
              <div class="step-card__top">
                <span class="step-card__number">03</span>
                <div class="step-card__icon step-icon--green">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="16 12 12 8 8 12"/>
                    <line x1="12" y1="16" x2="12" y2="8"/>
                  </svg>
                </div>
              </div>
              <h3 class="step-card__title">Instant processing</h3>
              <p class="step-card__desc">
                Files are processed securely in your browser instantly.
              </p>
            </div>

            <!-- Step 4 -->
            <div class="step-card fade-in-on-scroll">
              <div class="step-card__top">
                <span class="step-card__number">04</span>
                <div class="step-card__icon step-icon--orange">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
              </div>
              <h3 class="step-card__title">Download result</h3>
              <p class="step-card__desc">
                Save the optimized or converted file directly to your device.
              </p>
            </div>

          </div>
        </div>`;

const newIndexSection = `        <!-- Universal How It Works Component -->
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
        </div>`;

if (code.includes(oldIndexSection)) {
    code = code.replace(oldIndexSection, newIndexSection);
    fs.writeFileSync('index.html', code);
    console.log("Updated index.html successfully.");
} else {
    console.log("Could not find oldIndexSection in index.html");
}
