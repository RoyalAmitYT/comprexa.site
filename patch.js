const fs = require('fs');
let code = fs.readFileSync('js/image-tools/crop-image.js', 'utf8');

const replacement = `
  initProgressManager() {
    this.progressBar = document.getElementById("crop-progress-bar");
    this.progressStatus = document.getElementById("crop-progress-status");
    
    GlobalImageProgressManager.subscribe(({ state, percentage, message }) => {
      if (this.progressBar) {
        this.progressBar.style.width = percentage + "%";
      }
      if (this.progressStatus) {
        this.progressStatus.textContent = message;
      }
    });
  }

  bindEvents`;

code = code.replace("bindEvents", replacement.trim());
fs.writeFileSync('js/image-tools/crop-image.js', code);
