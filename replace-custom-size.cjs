const fs = require('fs');
let html = fs.readFileSync('crop-image.html', 'utf8');

const target = `<div class="control-group">
                    <div class="control-group__title">Transform</div>`;

const customSizeHtml = `<div class="control-group">
                    <div class="control-group__title">Custom Size</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input type="number" id="custom-width" placeholder="W" style="flex: 1; padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                      <span style="color: var(--text-muted);">&times;</span>
                      <input type="number" id="custom-height" placeholder="H" style="flex: 1; padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                      <button type="button" class="btn btn--secondary" id="btn-apply-custom" style="padding: 8px 12px;">Apply</button>
                    </div>
                  </div>

                  <div class="control-group">
                    <div class="control-group__title">Transform</div>`;

fs.writeFileSync('crop-image.html', html.replace(target, customSizeHtml));
