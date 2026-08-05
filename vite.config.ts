import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = path.resolve(__dirname, file);
});

export default defineConfig(() => {
  return {
    plugins: [],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
    build: {
      target: 'esnext',
      modulePreload: {
        polyfill: false
      },
      rollupOptions: {
        input,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist')) return 'pdfjs';
              if (id.includes('html5-qrcode') || id.includes('jsqr') || id.includes('zxing') || id.includes('qrcode')) return 'qrcode';
              if (id.includes('pdf-lib') || id.includes('pdfsmaller')) return 'pdf-lib';
              if (id.includes('jszip')) return 'jszip';
              if (id.includes('docx')) return 'docx';
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
