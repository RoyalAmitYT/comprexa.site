import re
import os

files = [
    ('js/color/palette.js', r'idx', r'_idx'),
    ('js/color/workspace.js', r'\(e\)', r'(_e)'),
    ('js/developer/json-yaml-converter/ui.js', r'const selectedMode =', r'const _selectedMode ='),
    ('js/developer/workspace.js', r'import { JsonUtils', r'import { _JsonUtils'),
    ('js/document/word-to-pdf.js', r'const parsedContent =', r'const _parsedContent ='),
    ('js/image-tools/crop-image.js', r'function\(e\)', r'function(_e)'),
    ('js/image/exporter.js', r'import { ImageUtils', r'import { _ImageUtils'),
    ('js/image/metadata.js', r'let file =', r'let _file ='),
    ('js/image/preview.js', r'let isDragging =', r'let _isDragging ='),
    ('js/image/preview.js', r'let startX =', r'let _startX ='),
    ('js/image/preview.js', r'let startY =', r'let _startY ='),
    ('js/pdf-tools/compress-pdf.js', r'function\(options\)', r'function(_options)'),
    ('js/pdf-tools/extract-pdf.js', r'function\(e\)', r'function(_e)'),
    ('js/pdf-tools/merge-pdf.js', r'let invalidCount =', r'let _invalidCount ='),
    ('js/pdf-tools/pdf-to-images.js', r'function\(file, idx\)', r'function(file, _idx)'),
    ('js/pdf-tools/pdf-to-word.js', r'const { Document, Packer, Paragraph, TextRun, AlignmentType }', r'const { Document, Packer, Paragraph, TextRun }'),
    ('js/pdf-tools/split-pdf.js', r'function\(file, idx\)', r'function(file, _idx)'),
    ('js/pdf-tools/watermark-pdf.js', r'const statusTitle =', r'const _statusTitle ='),
    ('js/qr-tools/qr-scanner.js', r'function\(err\)', r'function(_err)'),
    ('js/quality/checklist.js', r'import { GlobalValidator }', r'// import { GlobalValidator }'),
    ('js/quality/logger.js', r'function\(err\)', r'function(_err)'),
    ('js/quality/validator.js', r'import { Assert }', r'// import { Assert }'),
    ('js/script.js', r'function\(event\)', r'function(_event)'),
    ('js/search-engine.js', r'function\(options\)', r'function(_options)'),
    ('js/text/workspace.js', r'import { TextConverter }', r'// import { TextConverter }'),
    ('js/tool-content.js', r'const title =', r'const _title ='),
    ('js/tool-content.js', r'const cat =', r'const _cat ='),
    ('js/tool-content.js', r'function\(tool\)', r'function(_tool)'),
    ('js/tool-landing.js', r'function\(tool\)', r'function(_tool)'),
    ('js/utility/timestamp-converter.js', r'let tickerInterval =', r'let _tickerInterval =')
]

for filepath, search, replace in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(search, replace, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
