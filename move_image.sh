for f in compress-image convert-image crop-image jpg-to-png png-to-jpg resize-image rotate-image watermark-image webp-to-png; do
  if [ -f "js/${f}.js" ]; then
    mv "js/${f}.js" "js/image-tools/"
    sed -i "s|/js/${f}.js|/js/image-tools/${f}.js|g" *.html
  fi
done
