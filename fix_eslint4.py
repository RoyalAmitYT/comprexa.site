import re
import os

files = [
    ('js/category-landing.js', r'_getCategoryBenefits\(category\) \{', r'_getCategoryBenefits(_category) {'),
    ('js/document/word-to-pdf.js', r'const parsedContent =', r'const _parsedContent ='),
    ('js/image-engine.js', r'import \{ ImageEngineEvents, ImageEventBus', r'import { ImageEngineEvents'),
    ('js/image-engine.js', r'ImageErrorCategory, ImageErrorManager', r'ImageErrorCategory'),
    ('js/image-engine.js', r'ImageProgressState, GlobalImageProgressManager', r'ImageProgressState'),
    ('js/image-engine.js', r'BatchItemStatus, GlobalBatchProcessingManager', r'BatchItemStatus'),
    ('js/image-tools/crop-image.js', r'function\(e\)', r'function(_e)'),
    ('js/image/engine.js', r'import \{ ImageEngineEvents, ImageEventBus', r'import { ImageEngineEvents'),
    ('js/image/engine.js', r'import \{ ImageErrorCategory \}', r'// import { ImageErrorCategory }'),
    ('js/image/engine.js', r'import \{ ImageEngineError \}', r'// import { ImageEngineError }'),
    ('js/image/engine.js', r'import \{ ImageErrorManager, GlobalImageErrorManager', r'// import { ImageErrorManager, GlobalImageErrorManager'),
    ('js/image/engine.js', r'ImageMetadataExtractor, GlobalImageMetadataExtractor', r'ImageMetadataExtractor'),
    ('js/image/engine.js', r'import \{ ImageLoader \}', r'// import { ImageLoader }'),
    ('js/image/engine.js', r'CanvasProcessingEngine, GlobalCanvasProcessingEngine', r'CanvasProcessingEngine'),
    ('js/image/engine.js', r'BatchItemStatus, GlobalBatchProcessingManager', r'BatchItemStatus'),
    ('js/image/engine.js', r'import \{ BatchItemStatus \}', r'// import { BatchItemStatus }'),
    ('js/pdf-tools/compress-pdf.js', r'function\(options\)', r'function(_options)'),
    ('js/pdf-tools/extract-pdf.js', r'function\(e\)', r'function(_e)'),
    ('js/pdf-tools/pdf-to-images.js', r'function\(file, idx\)', r'function(file, _idx)'),
    ('js/pdf-tools/pdf-to-word.js', r'const \{ Document, Packer, Paragraph, TextRun, AlignmentType \}', r'const { Document, Packer, Paragraph, TextRun }'),
    ('js/pdf-tools/split-pdf.js', r'function\(file, idx\)', r'function(file, _idx)'),
    ('js/qr-tools/qr-scanner.js', r'function\(err\)', r'function(_err)'),
    ('js/quality/logger.js', r'function\(err\)', r'function(_err)'),
    ('js/script.js', r'function\(event\)', r'function(_event)'),
    ('js/search-engine.js', r'function\(options\)', r'function(_options)'),
    ('js/text/workspace.js', r'import \{ TextConverter \}', r'// import { TextConverter }'),
    ('js/tool-content.js', r'function\(tool\)', r'function(_tool)'),
    ('js/tool-landing.js', r'function\(tool\)', r'function(_tool)')
]

for filepath, search, replace in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(search, replace, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
