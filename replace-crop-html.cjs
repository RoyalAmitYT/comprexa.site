const fs = require('fs');
let html = fs.readFileSync('crop-image.html', 'utf8');

// We want to replace everything inside `<div class="card workspace-card" id="crop-app-container"...>`
// down to `</section>` (the closing of landing-workspace).

const startPattern = /<div\s+class="card workspace-card"\s+id="crop-app-container"[\s\S]*?<!-- Step 1: Universal Single Dropzone Area -->/;
const endPattern = /<\/section>\s*<!-- 4\. Dynamic Features Section -->/;

let headReplace = html.replace('<!-- Main Stylesheet -->', 
  '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css" />\n    <!-- Main Stylesheet -->');

const replacementHtml = `<div class="card workspace-card" id="crop-app-container" style="padding: 24px;">
            <!-- Upload Area -->
            <div id="crop-upload-section">
              <div class="file-uploader__dropzone" id="crop-dropzone" tabindex="0" role="button">
                <input type="file" id="crop-file-input" class="file-uploader__input" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp" aria-hidden="true" tabindex="-1" />
                <div class="file-uploader__icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div class="file-uploader__title">Upload Image to <span>Crop</span></div>
                <div class="file-uploader__hint-main">Drag & drop your photo here</div>
                <button type="button" class="btn btn--primary file-uploader__choose-btn" tabindex="-1" style="margin: 12px 0; min-width: 150px;">Browse Image</button>
                <div class="file-uploader__sub-text" style="font-size: 0.8rem; color: var(--text-muted);">Supported: JPG, PNG, WEBP, GIF, BMP</div>
              </div>
            </div>

            <!-- Crop Editor -->
            <div id="crop-config-section" style="display: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; flex-direction: column;">
                  <h3 id="uploaded-filename" style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-main);">filename.jpg</h3>
                  <span id="uploaded-filesize" style="font-size: 0.8rem; color: var(--text-muted);">2.4 MB</span>
                </div>
                <button type="button" class="btn btn--outline btn--sm" id="btn-change-image">Change Image</button>
              </div>

              <div class="crop-layout">
                <!-- Left: Canvas -->
                <div class="crop-layout__left">
                  <div class="cropper-container">
                    <img id="cropper-image" src="" alt="To be cropped" style="max-width: 100%; display: block;" />
                  </div>
                </div>

                <!-- Right: Controls -->
                <div class="crop-layout__right">
                  <div class="control-group">
                    <div class="control-group__title">Aspect Ratio</div>
                    <div class="aspect-chips">
                      <button type="button" class="aspect-chip active" data-ratio="NaN">Free</button>
                      <button type="button" class="aspect-chip" data-ratio="1">1:1 Square</button>
                      <button type="button" class="aspect-chip" data-ratio="1.3333333333333333">4:3</button>
                      <button type="button" class="aspect-chip" data-ratio="0.75">3:4</button>
                      <button type="button" class="aspect-chip" data-ratio="1.7777777777777777">16:9</button>
                      <button type="button" class="aspect-chip" data-ratio="0.5625">9:16</button>
                      <button type="button" class="aspect-chip" data-ratio="1.5">3:2</button>
                      <button type="button" class="aspect-chip" data-ratio="0.6666666666666666">2:3</button>
                    </div>
                  </div>

                  <div class="control-group">
                    <div class="control-group__title">Social Presets</div>
                    <div class="aspect-chips">
                      <button type="button" class="aspect-chip" data-ratio="1">IG Square</button>
                      <button type="button" class="aspect-chip" data-ratio="0.8">IG Portrait</button>
                      <button type="button" class="aspect-chip" data-ratio="0.5625">IG Story</button>
                      <button type="button" class="aspect-chip" data-ratio="2.628205128205128">FB Cover</button>
                      <button type="button" class="aspect-chip" data-ratio="1.7777777777777777">YT Thumb</button>
                      <button type="button" class="aspect-chip" data-ratio="3">X Header</button>
                      <button type="button" class="aspect-chip" data-ratio="4">LinkedIn Banner</button>
                    </div>
                  </div>

                  <div class="control-group">
                    <div class="control-group__title">Transform</div>
                    <div class="btn-group">
                      <button type="button" class="btn btn--outline" id="btn-rotate-ccw" aria-label="Rotate Left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                      <button type="button" class="btn btn--outline" id="btn-rotate-cw" aria-label="Rotate Right">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                      </button>
                      <button type="button" class="btn btn--outline" id="btn-flip-h" aria-label="Flip Horizontal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21V3"/><path d="M16 21V3"/><path d="M12 3v18"/></svg>
                      </button>
                      <button type="button" class="btn btn--outline" id="btn-flip-v" aria-label="Flip Vertical">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h18"/><path d="M3 16h18"/><path d="M3 12h18"/></svg>
                      </button>
                      <button type="button" class="btn btn--outline" id="btn-reset" aria-label="Reset">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                    </div>
                  </div>

                  <div class="control-group">
                    <div class="control-group__title">Zoom</div>
                    <div class="zoom-slider-container">
                      <span style="font-size: 0.75rem; color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      </span>
                      <input type="range" id="zoom-slider" class="zoom-slider" min="0" max="3" step="0.01" value="0">
                      <span style="font-size: 0.75rem; color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      </span>
                    </div>
                  </div>

                  <div class="control-group">
                    <div class="control-group__title">Export</div>
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                      <div style="flex: 1;">
                        <label for="export-format" style="display: block; font-size: 0.75rem; margin-bottom: 4px; color: var(--text-muted);">Format</label>
                        <select id="export-format" style="width: 100%; padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                          <option value="image/jpeg">JPG</option>
                          <option value="image/png">PNG</option>
                          <option value="image/webp">WEBP</option>
                        </select>
                      </div>
                      <div style="flex: 1;" id="quality-wrapper">
                        <label for="export-quality" style="display: block; font-size: 0.75rem; margin-bottom: 4px; color: var(--text-muted);">Quality</label>
                        <select id="export-quality" style="width: 100%; padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                          <option value="1">High (100%)</option>
                          <option value="0.9" selected>Good (90%)</option>
                          <option value="0.7">Medium (70%)</option>
                          <option value="0.5">Low (50%)</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" class="btn btn--primary" id="btn-crop-download" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Crop & Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
`;

const newHtml = headReplace.replace(startPattern, replacementHtml + '<!-- Step 1: Universal Single Dropzone Area -->');

// Also need to remove the closing tags up to `</section>` which might be left over.
// Wait, `startPattern` replaces from `<div class="card` to `<!-- Step 1:`
// Let's just do a simpler replace.

const finalRegex = /<div class="card workspace-card" id="crop-app-container"[\s\S]*?<\/section>/;
const replacement = replacementHtml + `\n      </section>`;

let step2Html = headReplace.replace(finalRegex, replacement);

// And we need to add script tag for cropper.min.js before our crop-image.js script.
step2Html = step2Html.replace('<script type="module" src="/js/image-tools/crop-image.js"></script>', 
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>\n    <script type="module" src="/js/image-tools/crop-image.js"></script>');

fs.writeFileSync('crop-image.html', step2Html);
