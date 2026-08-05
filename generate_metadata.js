import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://comprexa.in';
const OG_IMAGE = `${SITE_URL}/icon-512x512.png`;

const metadataMap = {
  'index.html': {
    title: 'Comprexa — Every File Tool. One Place.',
    desc: 'Compress, convert, merge, resize and optimize your files in seconds with 100% privacy directly in your browser. No data leaves your device.',
    type: 'website'
  },
  'about.html': {
    title: 'About Us | Privacy-First File Tools — Comprexa',
    desc: 'Learn about Comprexa, our mission to provide fast, secure, and privacy-first browser-based file tools without uploading your data to servers.',
    type: 'website'
  },
  'contact.html': {
    title: 'Contact Us | Support & Feedback — Comprexa',
    desc: 'Get in touch with the Comprexa team. We are here to help with support, feedback, or inquiries regarding our suite of free file tools.',
    type: 'website'
  },
  'privacy.html': {
    title: 'Privacy Policy | Data Security — Comprexa',
    desc: 'Read the Comprexa Privacy Policy. We believe in 100% privacy by processing all files locally in your browser. Your data is never uploaded.',
    type: 'website'
  },
  'terms.html': {
    title: 'Terms of Service — Comprexa',
    desc: 'Read the terms of service and usage conditions for Comprexa. By using our free file tools, you agree to our policies.',
    type: 'website'
  },
  'blog.html': {
    title: 'Blog & Tutorials | File Tips — Comprexa',
    desc: 'Explore the Comprexa blog for tutorials, guides, and tips on file conversion, compression, productivity, and privacy-first web tools.',
    type: 'blog'
  },
  'article.html': {
    title: 'Read Article | Blog — Comprexa',
    desc: 'Read our latest article and tutorials on file management, PDF editing, image optimization, and more on the Comprexa blog.',
    type: 'article'
  },
  '404.html': {
    title: '404 Not Found — Comprexa',
    desc: 'The page you are looking for does not exist or has been moved. Return to Comprexa home to access our free tools.',
    type: 'website',
    noindex: true
  },
  
  // Categories
  'pdf-tools.html': {
    title: 'Free PDF Tools | Edit, Merge & Compress — Comprexa',
    desc: 'Access our suite of free PDF tools. Merge, split, compress, and organize PDF documents securely in your browser without uploading files.',
    type: 'website'
  },
  'image-tools.html': {
    title: 'Free Image Tools | Resize, Crop & Convert — Comprexa',
    desc: 'Optimize your images instantly. Resize, crop, convert, and compress images directly in your browser with 100% privacy.',
    type: 'website'
  },
  'converter-tools.html': {
    title: 'Free File Converters | Document & Image — Comprexa',
    desc: 'Convert files between various formats instantly. Convert PDFs to Word, Images to PDFs, and more, right in your browser.',
    type: 'website'
  },
  'qr-tools.html': {
    title: 'Free QR Code Generator & Scanner — Comprexa',
    desc: 'Generate custom QR codes or scan existing ones instantly from your browser. 100% secure, fast, and free QR tools.',
    type: 'website'
  },
  'text-tools.html': {
    title: 'Free Text Tools | Counter & Formatter — Comprexa',
    desc: 'Edit and analyze text instantly. Use our word counter, case converter, duplicate line remover, and more text utilities.',
    type: 'website'
  },
  'developer-tools.html': {
    title: 'Free Developer Tools | JSON & Base64 — Comprexa',
    desc: 'Handy tools for developers. Format JSON, convert YAML, encode/decode Base64, and generate hashes entirely in your browser.',
    type: 'website'
  },
  'color-tools.html': {
    title: 'Free Color Tools | Picker & Palette — Comprexa',
    desc: 'Extract, convert, and generate colors. Use our color picker, HEX to RGB converter, and palette generator for your design projects.',
    type: 'website'
  },
  'utility-tools.html': {
    title: 'Free Web Utilities | Passwords & Timestamps — Comprexa',
    desc: 'A collection of useful web utilities. Generate secure passwords, convert timestamps, and create random numbers or strings.',
    type: 'website'
  },

  // PDF Tools
  'compress-pdf.html': {
    title: 'Compress PDF Online Free | Reduce PDF Size — Comprexa',
    desc: 'Compress PDF files without losing quality. Reduce PDF file size quickly and securely in your browser. No uploads required.',
    type: 'website'
  },
  'merge-pdf.html': {
    title: 'Merge PDF Online | Combine PDF Files — Comprexa',
    desc: 'Combine multiple PDF files into one document quickly. Merge PDFs in the order you want, entirely securely in your browser.',
    type: 'website'
  },
  'split-pdf.html': {
    title: 'Split PDF Online | Extract PDF Pages — Comprexa',
    desc: 'Split PDF files into individual pages or extract specific pages to a new PDF document. Fast, free, and secure.',
    type: 'website'
  },
  'organize-pdf.html': {
    title: 'Organize PDF Pages | Reorder & Sort — Comprexa',
    desc: 'Reorder, sort, and organize pages within your PDF document. Simply drag and drop pages to arrange them in your browser.',
    type: 'website'
  },
  'rotate-pdf.html': {
    title: 'Rotate PDF Pages Online | Free Tool — Comprexa',
    desc: 'Rotate individual PDF pages or entire documents instantly. Fix upside-down PDFs quickly and securely in your browser.',
    type: 'website'
  },
  'extract-pdf.html': {
    title: 'Extract PDF Pages | Save PDF Sections — Comprexa',
    desc: 'Extract specific pages from a PDF document to create a new file. Fast and secure local processing in your web browser.',
    type: 'website'
  },
  'delete-pdf.html': {
    title: 'Delete PDF Pages | Remove Pages — Comprexa',
    desc: 'Remove unwanted pages from your PDF files easily. Select the pages to delete and save a new PDF instantly.',
    type: 'website'
  },
  'watermark-pdf.html': {
    title: 'Add Watermark to PDF | Free PDF Tool — Comprexa',
    desc: 'Stamp an image or text watermark over your PDF document. Securely add watermarks to PDFs locally in your browser.',
    type: 'website'
  },
  'unlock-pdf.html': {
    title: 'Unlock PDF Online | Remove PDF Password — Comprexa',
    desc: 'Remove password protection and restrictions from PDF files. Unlock PDFs securely in your browser if you know the password.',
    type: 'website'
  },
  'protect-pdf.html': {
    title: 'Protect PDF Online | Add Password to PDF — Comprexa',
    desc: 'Encrypt and password protect your PDF files to keep them secure. Add passwords to PDFs locally without server uploads.',
    type: 'website'
  },
  'pdf-to-images.html': {
    title: 'Convert PDF to Images | Extract JPG/PNG — Comprexa',
    desc: 'Convert every page of a PDF document into high-quality JPG or PNG images. Fast and private browser-based conversion.',
    type: 'website'
  },

  // Document Tools
  'word-to-pdf.html': {
    title: 'Convert Word to PDF | DOCX to PDF — Comprexa',
    desc: 'Convert Microsoft Word documents (DOCX) to PDF format easily. Preserve formatting with secure, local file conversion.',
    type: 'website'
  },
  'excel-to-pdf.html': {
    title: 'Convert Excel to PDF | XLSX to PDF — Comprexa',
    desc: 'Convert Microsoft Excel spreadsheets (XLSX) to PDF format instantly. Fast and secure browser-based conversion.',
    type: 'website'
  },
  'powerpoint-to-pdf.html': {
    title: 'Convert PowerPoint to PDF | PPTX to PDF — Comprexa',
    desc: 'Convert Microsoft PowerPoint presentations (PPTX) to PDF format easily. Free and secure local document conversion.',
    type: 'website'
  },
  'word-to-jpg.html': {
    title: 'Convert Word to JPG | DOCX to Images — Comprexa',
    desc: 'Convert Word document pages into high-quality JPG images. Fast, free, and completely secure browser conversion.',
    type: 'website'
  },
  'word-to-txt.html': {
    title: 'Convert Word to TXT | Extract Text — Comprexa',
    desc: 'Extract plain text from Microsoft Word documents. Convert DOCX to TXT files quickly and securely without data uploads.',
    type: 'website'
  },
  'pdf-to-word.html': {
    title: 'Convert PDF to Word | Free PDF to DOCX — Comprexa',
    desc: 'Convert PDF documents into editable Microsoft Word (DOCX) files. High quality, free, and secure browser-based conversion.',
    type: 'website'
  },
  'pdf-to-excel.html': {
    title: 'Convert PDF to Excel | PDF to XLSX — Comprexa',
    desc: 'Extract data and tables from PDF documents into Excel spreadsheets. Convert PDF to XLSX securely in your browser.',
    type: 'website'
  },
  'pdf-to-powerpoint.html': {
    title: 'Convert PDF to PowerPoint | PDF to PPTX — Comprexa',
    desc: 'Convert PDF files into Microsoft PowerPoint presentations. Create PPTX files from PDFs securely and instantly.',
    type: 'website'
  },
  'document-metadata-viewer.html': {
    title: 'View Document Metadata | Exif & Info — Comprexa',
    desc: 'Read and extract hidden metadata and properties from PDF and Office documents. Securely view document info in your browser.',
    type: 'website'
  },

  // Image Tools
  'compress-image.html': {
    title: 'Compress Image Online | Reduce JPG/PNG Size — Comprexa',
    desc: 'Reduce the file size of your JPG, PNG, and WebP images. Compress images in bulk securely within your browser.',
    type: 'website'
  },
  'resize-image.html': {
    title: 'Resize Image Online | Change Image Dimensions — Comprexa',
    desc: 'Resize images by pixels or percentages easily. Change the dimensions of your photos in bulk without losing quality.',
    type: 'website'
  },
  'crop-image.html': {
    title: 'Crop Image Online | Free Photo Cropper — Comprexa',
    desc: 'Crop your images and photos to any size or aspect ratio. Secure, fast, and free online image cropper.',
    type: 'website'
  },
  'rotate-image.html': {
    title: 'Rotate Image Online | Flip & Rotate Photos — Comprexa',
    desc: 'Rotate your images clockwise or counter-clockwise, or flip them vertically and horizontally. Free and fast browser tool.',
    type: 'website'
  },
  'watermark-image.html': {
    title: 'Add Watermark to Image | Protect Photos — Comprexa',
    desc: 'Add custom text or image watermarks to your photos to protect them. Apply watermarks in bulk locally in your browser.',
    type: 'website'
  },
  'convert-image.html': {
    title: 'Convert Image Format | JPG, PNG, WebP — Comprexa',
    desc: 'Convert images between various formats including JPG, PNG, WebP, GIF, and AVIF. Free and secure bulk image converter.',
    type: 'website'
  },
  'jpg-to-png.html': {
    title: 'Convert JPG to PNG Online Free — Comprexa',
    desc: 'Easily convert JPG images to PNG format to add transparency or preserve quality. Fast, free, and secure in your browser.',
    type: 'website'
  },
  'png-to-jpg.html': {
    title: 'Convert PNG to JPG Online Free — Comprexa',
    desc: 'Convert PNG images to JPG format to reduce file size. Free browser-based image converter with no uploads required.',
    type: 'website'
  },
  'webp-to-png.html': {
    title: 'Convert WebP to PNG Online Free — Comprexa',
    desc: 'Convert WebP images to PNG format easily. Ensure maximum compatibility for your images with this free browser tool.',
    type: 'website'
  },

  // QR Tools
  'qr-generator.html': {
    title: 'Free QR Code Generator | Create Custom QR — Comprexa',
    desc: 'Generate custom QR codes for URLs, text, Wi-Fi, email, and more. Download high-quality QR codes in PNG or SVG formats.',
    type: 'website'
  },
  'qr-scanner.html': {
    title: 'Free QR Code Scanner | Read Barcodes — Comprexa',
    desc: 'Scan QR codes and barcodes instantly using your device camera or by uploading an image. Fast, secure, and private.',
    type: 'website'
  },

  // Text Tools
  'word-counter.html': {
    title: 'Word & Character Counter | Text Statistics — Comprexa',
    desc: 'Count words, characters, sentences, and paragraphs in your text instantly. Real-time text statistics in your browser.',
    type: 'website'
  },
  'character-counter.html': {
    title: 'Character Counter | Social Media Limit Check — Comprexa',
    desc: 'Count characters in your text and check limits for social media platforms like Twitter, Facebook, and Instagram.',
    type: 'website'
  },
  'case-converter.html': {
    title: 'Case Converter | UPPERCASE, lowercase — Comprexa',
    desc: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, and more. Fast and free text formatting tool.',
    type: 'website'
  },
  'remove-extra-spaces.html': {
    title: 'Remove Extra Spaces from Text — Comprexa',
    desc: 'Clean up your text by removing extra spaces, trailing spaces, and empty lines. Format your text instantly.',
    type: 'website'
  },
  'remove-duplicate-lines.html': {
    title: 'Remove Duplicate Lines from Text — Comprexa',
    desc: 'Find and remove duplicate lines from a text file or list instantly. Free browser-based text deduplication tool.',
    type: 'website'
  },
  'text-sorter.html': {
    title: 'Sort Text Lines Alphabetically — Comprexa',
    desc: 'Sort lists and text lines alphabetically or numerically. Order items ascending or descending instantly.',
    type: 'website'
  },

  // Developer Tools
  'json-formatter.html': {
    title: 'JSON Formatter & Beautifier — Comprexa',
    desc: 'Format, beautify, and indent JSON strings easily. Validate and parse your JSON data securely in your web browser.',
    type: 'website'
  },
  'json-minifier.html': {
    title: 'JSON Minifier | Compress JSON Data — Comprexa',
    desc: 'Minify and compress JSON data by removing whitespace and comments. Reduce payload sizes instantly and securely.',
    type: 'website'
  },
  'json-validator.html': {
    title: 'JSON Validator | Lint JSON Syntax — Comprexa',
    desc: 'Validate JSON syntax and find errors in your data. Ensure your JSON strings are properly formatted with this free tool.',
    type: 'website'
  },
  'json-tree-viewer.html': {
    title: 'JSON Tree Viewer | Visualize JSON Data — Comprexa',
    desc: 'Visualize JSON data in an interactive tree view. Expand, collapse, and explore complex JSON objects easily.',
    type: 'website'
  },
  'json-yaml-converter.html': {
    title: 'JSON to YAML Converter — Comprexa',
    desc: 'Convert data between JSON and YAML formats instantly. Fast, free, and secure browser-based developer tool.',
    type: 'website'
  },
  'base64-encoder-decoder.html': {
    title: 'Base64 Encoder & Decoder — Comprexa',
    desc: 'Encode text and files to Base64 format, or decode Base64 back to text. Fast and secure local conversion tool.',
    type: 'website'
  },
  'hash-generator.html': {
    title: 'Hash Generator | MD5, SHA-1, SHA-256 — Comprexa',
    desc: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text strings. Fast and secure cryptographic hash generator.',
    type: 'website'
  },

  // Utility Tools
  'password-generator.html': {
    title: 'Secure Password Generator | Random Passwords — Comprexa',
    desc: 'Generate strong, secure, and random passwords instantly. Fully customizable and generated locally for 100% privacy.',
    type: 'website'
  },
  'password-strength-checker.html': {
    title: 'Password Strength Checker — Comprexa',
    desc: 'Test the strength and security of your passwords. Analyze entropy and crack time safely without data leaving your device.',
    type: 'website'
  },
  'random-number-generator.html': {
    title: 'Random Number Generator — Comprexa',
    desc: 'Generate secure random numbers within a custom range. Useful for lotteries, sweepstakes, or cryptographic uses.',
    type: 'website'
  },
  'random-string-generator.html': {
    title: 'Random String Generator — Comprexa',
    desc: 'Generate random text strings of any length using custom character sets. Fast, free, and secure browser utility.',
    type: 'website'
  },
  'uuid-generator.html': {
    title: 'UUID/GUID Generator | Version 4 UUIDs — Comprexa',
    desc: 'Generate cryptographically secure Version 4 UUIDs (Universally Unique Identifiers) instantly in your browser.',
    type: 'website'
  },
  'timestamp-converter.html': {
    title: 'Unix Timestamp Converter — Comprexa',
    desc: 'Convert Unix epoch timestamps to human-readable dates and vice versa. Free timezone and date conversion tool.',
    type: 'website'
  },

  // Color Tools
  'color-picker.html': {
    title: 'Color Picker & Hex Codes — Comprexa',
    desc: 'Pick and extract colors from images or use the color wheel. Get HEX, RGB, HSL, and CMYK color codes instantly.',
    type: 'website'
  },
  'color-converter.html': {
    title: 'Color Format Converter | HEX to RGB — Comprexa',
    desc: 'Convert colors between HEX, RGB, HSL, HSV, and CMYK formats. Free color code converter for web designers.',
    type: 'website'
  },
  'color-palette-generator.html': {
    title: 'Color Palette Generator — Comprexa',
    desc: 'Generate beautiful and harmonious color palettes for your design projects. Create monochromatic, analogous, and complementary themes.',
    type: 'website'
  },
  
  // Generic fallback template
  'category-template.html': {
    title: 'Tool Category — Comprexa',
    desc: 'Explore tools and utilities on Comprexa.',
    type: 'website',
    noindex: true
  },
  'tool-template.html': {
    title: 'Tool Details — Comprexa',
    desc: 'Use this tool on Comprexa.',
    type: 'website',
    noindex: true
  }
};

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if we don't have meta mapped, or just use a generic one
  const meta = metadataMap[file] || {
    title: `${file.replace('.html', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Comprexa`,
    desc: `Free online tool for ${file.replace('.html', '').replace(/-/g, ' ')}. Process your files securely in your browser with Comprexa.`,
    type: 'website'
  };

  const urlPath = file === 'index.html' ? '' : file;
  const canonicalUrl = `${SITE_URL}/${urlPath}`;
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow';

  // Remove existing <title>
  content = content.replace(/<title>.*?<\/title>/gi, '');
  
  // Remove existing meta description
  content = content.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');

  // Remove existing Open Graph tags
  content = content.replace(/<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '');
  
  // Remove existing Twitter tags
  content = content.replace(/<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '');
  
  // Remove existing robots tags
  content = content.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/gi, '');

  // Prepare new metadata block
  const newMeta = `
  <title>${meta.title}</title>
  <meta name="description" content="${meta.desc}" />
  <meta name="robots" content="${robots}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.desc}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:site_name" content="Comprexa" />
  <meta property="og:locale" content="en_US" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.desc}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  `;

  // Insert before the canonical tag from Phase 1, or just before </head>
  if (content.includes('<link rel="canonical"')) {
    content = content.replace('<link rel="canonical"', newMeta + '\n  <link rel="canonical"');
  } else {
    content = content.replace('</head>', newMeta + '\n</head>');
  }

  // Also clean up any extra empty lines around the head if they got generated.
  content = content.replace(/(?:\r?\n\s*){3,}/g, '\n\n');

  fs.writeFileSync(file, content);
});

console.log("Metadata updated successfully.");
