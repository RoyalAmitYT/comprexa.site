const fs = require('fs');
let code = fs.readFileSync('js/tool-landing.js', 'utf8');

const oldGrid = `          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
            \${steps
              .map(
                (s) => \`
              <div class="card" style="padding: 24px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); background: var(--bg-surface); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 12px; transition: transform var(--transition-fast), border-color var(--transition-fast);">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--gradient-accent); color: #fff; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">\${s.step}</div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0;">\${s.title}</h3>
                <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin: 0;">\${s.description}</p>
              </div>
            \`,
              )
              .join("")}
          </div>`;

const newGrid = `          <div class="workspace-how-card" style="margin-top: 0; box-shadow: var(--shadow-md);">
            <div class="workspace-how-steps">
              \${steps
                .map(
                  (s, idx) => \`
                <div class="workspace-how-step">
                  <div class="workspace-how-step__badge">\${s.step}</div>
                  <div class="workspace-how-step__text">
                    <strong>\${s.title}</strong>
                    <span>\${s.description}</span>
                  </div>
                </div>
                \${idx < steps.length - 1 ? \`<div class="workspace-how-arrow" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>\` : ''}
              \`
                )
                .join("")}
            </div>
          </div>`;

if (code.includes(oldGrid)) {
    code = code.replace(oldGrid, newGrid);
    fs.writeFileSync('js/tool-landing.js', code);
    console.log("Updated tool-landing.js successfully.");
} else {
    console.log("Could not find oldGrid in tool-landing.js");
}
