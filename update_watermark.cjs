const fs = require('fs');
let html = fs.readFileSync('watermark-image.html', 'utf8');

// We will inject mobile-specific CSS just before </head>
const mobileCss = `
<style id="mobile-wm-styles">
@media (max-width: 768px) {
  /* Studio layout */
  #studio-grid-layout {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  /* Live preview */
  #canvas-preview-container {
    min-height: auto !important;
    aspect-ratio: 16/9;
    padding: 12px !important;
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05) !important;
    border-radius: 20px !important;
    margin-bottom: 8px;
    width: 100% !important;
  }
  
  [data-theme="dark"] #canvas-preview-container {
    background: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
  
  /* Collapsible sections */
  #desktop-controls-panel {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    gap: 12px !important;
  }
  
  .wm-mobile-section {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    border-radius: 18px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.03) !important;
    overflow: hidden;
    margin-bottom: 0;
  }
  
  [data-theme="dark"] .wm-mobile-section {
    background: rgba(30, 41, 59, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
  
  .wm-mobile-header {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px !important;
    font-weight: 700;
    font-size: 1.05rem;
    cursor: pointer;
  }
  
  .wm-mobile-header::after {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.3s;
  }
  
  .wm-mobile-section.is-open .wm-mobile-header::after {
    transform: rotate(180deg);
  }
  
  .wm-mobile-content {
    display: none !important;
    padding: 0 20px 20px 20px !important;
  }
  
  .wm-mobile-section.is-open .wm-mobile-content {
    display: flex !important;
    flex-direction: column;
    gap: 16px;
  }
  
  /* Sticky bottom export button */
  #btn-execute-watermark {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    width: calc(100% - 40px) !important;
    z-index: 99;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4) !important;
    border-radius: 16px !important;
    height: 54px !important;
    font-size: 1.1rem !important;
    margin-top: 0 !important;
  }
  
  /* Added padding to body to account for fixed button */
  body {
    padding-bottom: 90px !important;
  }
  
  /* Sliders and Touch controls */
  input[type="range"] {
    height: 44px !important;
  }
  
  .ui-input, .ui-select, .btn {
    min-height: 44px !important;
  }
  
  /* Buttons */
  #btn-add-more-trigger {
    border-radius: 12px !important;
    padding: 8px 16px !important;
  }
  #btn-clear-all {
    border-radius: 12px !important;
    padding: 8px 16px !important;
    border: 1px solid var(--danger) !important;
    color: var(--danger) !important;
  }
  
  /* Position Grid */
  .pos-grid-btn {
    height: 44px !important;
    border-radius: 10px !important;
  }
  
  /* Color chips */
  .text-color-btn {
    width: 44px !important;
    height: 44px !important;
    border-radius: 22px !important;
    padding: 0 !important;
    font-size: 0 !important; /* Hide text */
  }
  #custom-text-color-picker {
    width: 44px !important;
    height: 44px !important;
    border-radius: 22px !important;
  }
}

/* Hide mobile headers on desktop */
@media (min-width: 769px) {
  .wm-mobile-header {
    display: none !important;
  }
  .wm-mobile-content {
    display: flex !important;
    flex-direction: column;
    padding: 0 !important;
    gap: 14px;
  }
  .wm-mobile-section {
    display: contents; /* Strip out the wrapper visually on desktop */
  }
}
</style>
`;

if (!html.includes('id="mobile-wm-styles"')) {
  html = html.replace('</head>', mobileCss + '</head>');
}

// Add ID to desktop controls panel if not present
if (!html.includes('id="desktop-controls-panel"')) {
  html = html.replace(
    '<!-- Right Column: Watermark Controls Panel -->\n                <div\n                  style="\n                    display: flex;',
    '<!-- Right Column: Watermark Controls Panel -->\n                <div id="desktop-controls-panel"\n                  style="\n                    display: flex;'
  );
}

// Add script to handle accordion toggling
const accordionScript = `
<script id="mobile-wm-script">
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.wm-mobile-section');
  sections.forEach(sec => {
    const header = sec.querySelector('.wm-mobile-header');
    if(header) {
      header.addEventListener('click', () => {
        // Close others
        sections.forEach(other => {
          if(other !== sec) other.classList.remove('is-open');
        });
        // Toggle current
        sec.classList.toggle('is-open');
      });
    }
  });
});
</script>
`;

if (!html.includes('id="mobile-wm-script"')) {
  html = html.replace('</body>', accordionScript + '</body>');
}

// Now replace the sections in HTML using strings
// Instead of complex regex, let's just do it manually with replacements

// 1. Watermark Mode
html = html.replace(
  '<div class="form-group" style="margin-bottom: 0">\n                    <label\n                      class="form-label"\n                      style="\n                        font-weight: 700;\n                        font-size: 0.88rem;\n                        margin-bottom: 8px;\n                        display: block;\n                      "\n                      >Watermark Mode</label\n                    >',
  '<div class="wm-mobile-section is-open">\n<div class="wm-mobile-header">Watermark Mode</div>\n<div class="wm-mobile-content">\n<div class="form-group" style="margin-bottom: 0">\n                    <label\n                      class="form-label"\n                      style="\n                        font-weight: 700;\n                        font-size: 0.88rem;\n                        margin-bottom: 8px;\n                        display: block;\n                      "\n                      >Watermark Mode</label\n                    >'
);
html = html.replace(
  '<!-- PANEL 1: TEXT WATERMARK CONTROLS -->',
  '</div></div>\n<!-- PANEL 1: TEXT WATERMARK CONTROLS -->\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Watermark Text / Image</div>\n<div class="wm-mobile-content">'
);
html = html.replace(
  '<!-- Font Family & Weight -->',
  '</div></div>\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Font Settings</div>\n<div class="wm-mobile-content">\n<!-- Font Family & Weight -->'
);
html = html.replace(
  '<!-- Text Color Options -->',
  '</div></div>\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Color & Settings</div>\n<div class="wm-mobile-content">\n<!-- Text Color Options -->'
);

// We need to close it before PANEL 2
html = html.replace(
  '<!-- PANEL 2: LOGO IMAGE WATERMARK CONTROLS -->',
  '</div></div>\n<!-- PANEL 2: LOGO IMAGE WATERMARK CONTROLS -->\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Image Logo Settings</div>\n<div class="wm-mobile-content">'
);

html = html.replace(
  '<!-- SHARED CONTROLS: Opacity, Rotation, Position, Margin -->',
  '</div></div>\n<!-- SHARED CONTROLS: Opacity, Rotation, Position, Margin -->\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Opacity & Rotation</div>\n<div class="wm-mobile-content">'
);

html = html.replace(
  '<!-- Margin / Offset Slider -->',
  '</div></div>\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Margin / Padding</div>\n<div class="wm-mobile-content">\n<!-- Margin / Offset Slider -->'
);

html = html.replace(
  '<!-- Position Grid Buttons -->',
  '</div></div>\n<div class="wm-mobile-section">\n<div class="wm-mobile-header">Position</div>\n<div class="wm-mobile-content">\n<!-- Position Grid Buttons -->'
);

html = html.replace(
  '<!-- Execute Action Button -->',
  '</div></div>\n<!-- Execute Action Button -->'
);


fs.writeFileSync('watermark-image.html', html);
console.log('Update complete');
