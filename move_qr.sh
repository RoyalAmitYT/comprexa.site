for f in qr-generator qr-scanner; do
  if [ -f "js/${f}.js" ]; then
    mv "js/${f}.js" "js/qr-tools/"
    sed -i "s|/js/${f}.js|/js/qr-tools/${f}.js|g" *.html
  fi
done
