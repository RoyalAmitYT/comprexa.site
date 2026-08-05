import fs from 'fs';
let content = fs.readFileSync('js/image-tools/crop-image.js', 'utf8');

// 1. Add btnCropAnother to constructor
content = content.replace(
  /this.btnDownloadCropped = document.getElementById\("btn-download-cropped"\);/,
  `this.btnDownloadCropped = document.getElementById("btn-download-cropped");
    this.btnCropAnother = document.getElementById("btn-crop-another");`
);

// 2. Bind btnCropAnother
content = content.replace(
  /if \(this.btnChange\) {\n      this.btnChange.addEventListener\("click", \(\) => this.resetWorkspace\(\)\);\n    }/,
  `if (this.btnChange) {
      this.btnChange.addEventListener("click", () => this.resetWorkspace());
    }
    if (this.btnCropAnother) {
      this.btnCropAnother.addEventListener("click", () => this.resetWorkspace());
    }`
);

// 3. Bind Circle Mask properly (uncheck on reset and add UI style logic)
content = content.replace(
  /if \(this.circleMaskCheckbox\) {\n      this.circleMaskCheckbox.addEventListener\("change", \(\) => this.updatePreview\(\)\);\n    }/,
  `if (this.circleMaskCheckbox) {
      this.circleMaskCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          if (this.cropper) {
            this.cropper.setAspectRatio(1);
          }
          this.clearActiveChips();
          const squareChip = document.querySelector('.aspect-preset-btn[data-aspect="1"]');
          if (squareChip) {
            squareChip.classList.add("active", "btn--primary");
            squareChip.classList.remove("btn--outline");
          }
          document.body.classList.add("cropper-circle-mask");
        } else {
          document.body.classList.remove("cropper-circle-mask");
          // Revert to free
          if (this.cropper) {
            this.cropper.setAspectRatio(NaN);
          }
          this.clearActiveChips();
          const freeChip = document.querySelector('.aspect-preset-btn[data-aspect="free"]');
          if (freeChip) {
            freeChip.classList.add("active", "btn--primary");
            freeChip.classList.remove("btn--outline");
          }
        }
        this.updatePreview();
      });
    }`
);

// 4. Update executeExport for the circle mask
content = content.replace(
  /      if \(!canvas\) {\n        throw new Error\("Failed to generate cropped canvas."\);\n      }\n\n      \/\/ Preserve background for JPEG\n      if \(mime === "image\/jpeg" \|\| mime === "image\/jpg"\) {\n        const tmpCanvas = document.createElement\("canvas"\);\n        tmpCanvas.width = canvas.width;\n        tmpCanvas.height = canvas.height;\n        const tmpCtx = tmpCanvas.getContext\("2d"\);\n        tmpCtx.fillStyle = "#FFFFFF";\n        tmpCtx.fillRect\(0, 0, tmpCanvas.width, tmpCanvas.height\);\n        tmpCtx.drawImage\(canvas, 0, 0\);\n        this.resultBlob = await ImageExporter.exportCanvasToBlob\(tmpCanvas, mime, quality\);\n      } else {\n        this.resultBlob = await ImageExporter.exportCanvasToBlob\(canvas, mime, quality\);\n      }/,
  `      if (!canvas) {
        throw new Error("Failed to generate cropped canvas.");
      }

      let finalCanvas = canvas;
      if (this.circleMaskCheckbox && this.circleMaskCheckbox.checked) {
        const maskedCanvas = document.createElement("canvas");
        maskedCanvas.width = canvas.width;
        maskedCanvas.height = canvas.height;
        const ctx = maskedCanvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(canvas, 0, 0);
        finalCanvas = maskedCanvas;
      }

      // Preserve background for JPEG
      if (mime === "image/jpeg" || mime === "image/jpg") {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = finalCanvas.width;
        tmpCanvas.height = finalCanvas.height;
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.fillStyle = "#FFFFFF";
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(finalCanvas, 0, 0);
        this.resultBlob = await ImageExporter.exportCanvasToBlob(tmpCanvas, mime, quality);
      } else {
        this.resultBlob = await ImageExporter.exportCanvasToBlob(finalCanvas, mime, quality);
      }`
);

// 5. Uncheck circle mask inside resetWorkspace
content = content.replace(
  /  resetWorkspace\(\) {\n    if \(this.cropper\) {\n      this.cropper.destroy\(\);\n      this.cropper = null;\n    }/,
  `  resetWorkspace() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
    if (this.circleMaskCheckbox) {
      this.circleMaskCheckbox.checked = false;
    }
    document.body.classList.remove("cropper-circle-mask");`
);

fs.writeFileSync('js/image-tools/crop-image.js', content);
