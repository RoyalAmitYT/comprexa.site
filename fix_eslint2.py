import re
import os

files = [
    ('js/image-engine.js', r'import \{ ImageEngineEvents, ImageEventBus', r'import { ImageEngineEvents, /* ImageEventBus */'),
    ('js/image-engine.js', r'ImageErrorCategory, ImageErrorManager', r'ImageErrorCategory, /* ImageErrorManager */'),
    ('js/image-engine.js', r'ImageProgressState, GlobalImageProgressManager', r'ImageProgressState, /* GlobalImageProgressManager */'),
    ('js/image-engine.js', r'BatchItemStatus, GlobalBatchProcessingManager', r'BatchItemStatus, /* GlobalBatchProcessingManager */'),
    ('js/image/engine.js', r'ImageUtils, GlobalImageUtils', r'ImageUtils, /* GlobalImageUtils */'),
    ('js/image/engine.js', r'ImageEngineEvents, ImageEventBus', r'ImageEngineEvents, /* ImageEventBus */'),
    ('js/image/engine.js', r'import \{ ImageEngineError', r'// import { ImageEngineError'),
    ('js/image/engine.js', r'import \{ ImageErrorCategory', r'// import { ImageErrorCategory'),
    ('js/image/engine.js', r'import \{ ImageErrorManager, GlobalImageErrorManager', r'import { ImageErrorManager, /* GlobalImageErrorManager */'),
    ('js/image/engine.js', r'ImageValidator, GlobalImageValidator', r'ImageValidator, /* GlobalImageValidator */'),
    ('js/image/engine.js', r'ImageMetadataExtractor, GlobalImageMetadataExtractor', r'ImageMetadataExtractor, /* GlobalImageMetadataExtractor */'),
    ('js/image/engine.js', r'AspectRatioUtils, GlobalAspectRatioUtils', r'AspectRatioUtils, /* GlobalAspectRatioUtils */'),
    ('js/image/engine.js', r'ImageQualityManager, GlobalImageQualityManager', r'ImageQualityManager, /* GlobalImageQualityManager */'),
    ('js/image/engine.js', r'import \{ ImageLoader \}', r'// import { ImageLoader }'),
    ('js/image/engine.js', r'ImagePreviewEngine, GlobalImagePreviewEngine', r'ImagePreviewEngine, /* GlobalImagePreviewEngine */'),
    ('js/image/engine.js', r'CanvasProcessingEngine, GlobalCanvasProcessingEngine', r'CanvasProcessingEngine, /* GlobalCanvasProcessingEngine */'),
    ('js/image/engine.js', r'ImageExporter, GlobalImageExporter', r'ImageExporter, /* GlobalImageExporter */'),
    ('js/image/engine.js', r'ImageProgressState, GlobalImageProgressManager', r'ImageProgressState, /* GlobalImageProgressManager */'),
    ('js/image/engine.js', r'BatchItemStatus, GlobalBatchProcessingManager', r'BatchItemStatus, /* GlobalBatchProcessingManager */'),
    ('js/image/engine.js', r'import \{ BatchItemStatus', r'// import { BatchItemStatus'),
    ('js/image/engine.js', r'const valResult =', r'const _valResult =')
]

for filepath, search, replace in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(search, replace, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
