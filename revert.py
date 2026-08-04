import re
import os

files = [
    ('js/category-landing.js', r'_getCategoryBenefits\(_category\) \{', r'_getCategoryBenefits(category) {'),
    ('js/document/word-to-pdf.js', r'const _parsedContent =', r'const parsedContent ='),
    ('js/image-tools/crop-image.js', r'function\(_e\)', r'function(e)'),
    ('js/pdf-tools/compress-pdf.js', r'function\(_options\)', r'function(options)'),
    ('js/pdf-tools/extract-pdf.js', r'function\(_e\)', r'function(e)'),
    ('js/pdf-tools/pdf-to-images.js', r'function\(file, _idx\)', r'function(file, idx)'),
    ('js/pdf-tools/pdf-to-word.js', r'const \{ Document, Packer, Paragraph, TextRun \}', r'const { Document, Packer, Paragraph, TextRun, AlignmentType }'),
    ('js/pdf-tools/split-pdf.js', r'function\(file, _idx\)', r'function(file, idx)'),
    ('js/qr-tools/qr-scanner.js', r'function\(_err\)', r'function(err)'),
    ('js/quality/logger.js', r'function\(_err\)', r'function(err)'),
    ('js/script.js', r'function\(_event\)', r'function(event)'),
    ('js/search-engine.js', r'function\(_options\)', r'function(options)'),
    ('js/tool-content.js', r'function\(_tool\)', r'function(tool)'),
    ('js/tool-landing.js', r'function\(_tool\)', r'function(tool)'),
    ('js/color/workspace.js', r'function\(_e\)', r'function(e)'),
    ('js/developer/json-yaml-converter/ui.js', r'const _selectedMode =', r'const selectedMode ='),
]

for filepath, search, replace in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(search, replace, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# Specific fixes for color/workspace.js
with open('js/color/workspace.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('(_e)', '(e)')
with open('js/color/workspace.js', 'w', encoding='utf-8') as f:
    f.write(c)

