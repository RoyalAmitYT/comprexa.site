<div align="center">
  <img src="public/icon-512x512.png" alt="Comprexa Logo" width="120" />

  # Comprexa

  **Fast, Private, and Powerful Browser-First Utilities**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=fff)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
  [![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?logo=webassembly&logoColor=white)](#)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

  [Live Demo](https://comprexa.in) • [Report Bug](#) • [Request Feature](#)
</div>

<br />

## ⚡ Overview

**Comprexa** is a comprehensive suite of 53+ powerful browser-based utility tools for document processing, image manipulation, text formatting, and developer workflows. 

Designed with a **100% Privacy-First Architecture**, Comprexa processes all your files entirely within your device's web browser. Powered by modern WebAssembly and cutting-edge JavaScript libraries, it delivers lightning-fast performance without ever uploading your sensitive data to remote servers.

---

## ✨ Key Features

- **🔒 100% Client-Side Processing**: Zero server uploads. Your data never leaves your device, guaranteeing absolute privacy.
- **🚀 WebAssembly Powered**: Desktop-level performance in the browser using WASM-compiled engines for heavy lifting.
- **📱 Fully Responsive Design**: Carefully crafted, mobile-optimized layouts for every single tool. Works beautifully on phones, tablets, and desktops.
- **⚡ Blazing Fast**: Near-instant processing times, eliminating upload and download bottlenecks.
- **🌐 Offline Capable**: Once loaded, tools function without an active internet connection.
- **🎨 Beautiful UI/UX**: Clean, modern interface designed with Tailwind-inspired principles and smooth interactions.

---

## 🧰 53+ Browser-Based Tools

Comprexa offers a growing collection of tools organized into intuitive categories:

### 📄 PDF Tools (Powered by PDF.js & PDF-lib)
Merge, Split, Extract Pages, Rotate, Compress, Watermark, Unlock, Protect, Delete Pages, Organize, PDF to Word, PDF to Images, PDF to Excel, PDF to PowerPoint, Word to PDF, Excel to PDF, PowerPoint to PDF.

### 🖼️ Image Tools
Compress, Crop, Resize, Rotate, Convert Formats (PNG, JPG, WebP), Watermark.

### 📝 Text Tools
Word Counter, Character Counter, Case Converter, Remove Extra Spaces, Remove Duplicate Lines, Text Sorter, Find & Replace.

### 🧑‍💻 Developer Tools
JSON Formatter, JSON Minifier, JSON Validator, JSON Tree Viewer, JSON to YAML, Base64 Encoder/Decoder, Hash Generator (MD5, SHA).

### 🎨 Color Tools
Color Picker, Color Format Converter (HEX, RGB, HSL), Color Palette Generator.

### 🛠️ Utility & QR Tools
Password Generator, Password Strength Checker, Random Number/String Generator, UUID Generator, Timestamp Converter, QR Code Generator, QR Code Scanner.

---

## 🏗️ Tech Stack

- **Core**: Vanilla JavaScript (ESM), HTML5, CSS3
- **Build System**: Vite, Rollup
- **PDF Engine**: PDF.js (Mozilla), pdf-lib (WebAssembly)
- **Image Processing**: Canvas API, Pica, JSZip
- **QR Engine**: html5-qrcode, qrcode
- **Styling**: Custom CSS Framework (Tailwind architecture)
- **Architecture**: MPA (Multi-Page Application) for optimal SEO and independent tool loading

---

## 📁 Folder Structure

```text
comprexa/
├── css/                  # Global and component styles
├── js/                   # Core application logic
│   ├── pdf/              # PDF processing engines
│   ├── image/            # Image manipulation engines
│   ├── qr/               # QR scanning/generation
│   ├── tool-landing.js   # Universal tool interface logic
│   └── ...
├── public/               # Static assets (Favicons, manifest)
├── *.html                # Independent tool entry points (MPA)
├── generate_metadata.js  # SEO and meta tag generator
├── package.json          # Project dependencies
└── vite.config.js        # Vite build configuration
```

---

## 🚀 Installation & Development

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/comprexa.git
   cd comprexa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000` (or the port specified by Vite).

### Build Instructions

To build the project for production:

```bash
# Update SEO meta tags (Optional but recommended)
node generate_metadata.js

# Run the Vite production build
npm run build
```

The optimized, minified files will be generated in the `dist/` directory, ready to be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

---

## 💻 Browser Compatibility

Comprexa is tested and supported on all modern browsers:
- Chrome (Latest)
- Firefox (Latest)
- Safari (14+)
- Edge (Latest)
- iOS Safari (14+)
- Chrome for Android

---

## 📊 Performance Highlights

- **Lighthouse Scores**: 95+ across Performance, Accessibility, Best Practices, and SEO.
- **Lazy Loading**: Heavy WASM workers and PDF libraries are lazy-loaded only when requested by the specific tool.
- **Brotli/Gzip**: Highly optimized output chunks designed for edge-network compression.

---

## 📸 Screenshots

*(Add screenshots of your application here)*
- **Home Dashboard**: Clean grid of available tools.
- **Tool Interface**: Example of the split-panel design for PDF merging.
- **Mobile View**: Showcasing the responsive design.

---

## 🗺️ Roadmap

- [ ] Add offline PWA support (Service Workers)
- [ ] Implement Dark Mode toggle globally
- [ ] Add Video/Audio compression utilities (via FFmpeg.wasm)
- [ ] Multi-language support (i18n)
- [ ] PDF OCR capabilities (via Tesseract.js)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Credits

Comprexa relies on several outstanding open-source projects:
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [pdf-lib](https://pdf-lib.js.org/) by Hopding
- [Vite](https://vitejs.dev/) by Evan You
- [JSZip](https://stuk.github.io/jszip/)
- Icons by [Lucide](https://lucide.dev/)

---
<div align="center">
  <i>Built with absolute focus on privacy, speed, and usability.</i>
</div>
