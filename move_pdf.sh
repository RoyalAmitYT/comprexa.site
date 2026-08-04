for f in compress-pdf delete-pdf extract-pdf merge-pdf organize-pdf protect-pdf rotate-pdf split-pdf unlock-pdf watermark-pdf pdf-to-images pdf-to-word; do
  if [ -f "js/${f}.js" ]; then
    mv "js/${f}.js" "js/pdf-tools/"
    sed -i "s|/js/${f}.js|/js/pdf-tools/${f}.js|g" *.html
  fi
done
