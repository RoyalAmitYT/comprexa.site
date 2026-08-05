const fs = require('fs');
let js = fs.readFileSync('js/image-tools/crop-image.js', 'utf8');

const targetInitDom = `    // Zoom
    this.zoomSlider = document.getElementById("zoom-slider");`;

const replacementInitDom = `    // Custom Size
    this.customWidth = document.getElementById("custom-width");
    this.customHeight = document.getElementById("custom-height");
    this.btnApplyCustom = document.getElementById("btn-apply-custom");

    // Zoom
    this.zoomSlider = document.getElementById("zoom-slider");`;

const targetBindEvents = `    // Transforms
    this.btnRotateCCW.addEventListener("click", () => {`;

const replacementBindEvents = `    // Custom Size
    this.btnApplyCustom.addEventListener("click", () => {
      if (this.cropper) {
        const w = parseFloat(this.customWidth.value);
        const h = parseFloat(this.customHeight.value);
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
          this.saveState();
          this.aspectChips.forEach(c => c.classList.remove("active"));
          this.cropper.setAspectRatio(w / h);
          this.cropper.setData({ width: w, height: h });
        }
      }
    });

    // Transforms
    this.btnRotateCCW.addEventListener("click", () => {`;

js = js.replace(targetInitDom, replacementInitDom);
js = js.replace(targetBindEvents, replacementBindEvents);
fs.writeFileSync('js/image-tools/crop-image.js', js);
