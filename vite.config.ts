import path from "path";
import fs from "fs";
import { defineConfig, Plugin } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = path.resolve(__dirname, file);
});

function copySeoAssetsPlugin(): Plugin {
  const seoFiles = [
    'robots.txt',
    'sitemap.xml',
    'sitemap-tools.xml',
    'sitemap-pages.xml',
    'sitemap-blog.xml',
    'site.webmanifest',
    'manifest.json'
  ];

  return {
    name: 'copy-seo-assets',
    buildStart() {
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      seoFiles.forEach(file => {
        const rootPath = path.resolve(__dirname, file);
        const publicPath = path.resolve(publicDir, file);
        if (fs.existsSync(rootPath)) {
          fs.copyFileSync(rootPath, publicPath);
        } else if (fs.existsSync(publicPath)) {
          fs.copyFileSync(publicPath, rootPath);
        }
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        seoFiles.forEach(file => {
          const rootPath = path.resolve(__dirname, file);
          const publicPath = path.resolve(__dirname, 'public', file);
          const distPath = path.resolve(distDir, file);
          
          if (fs.existsSync(publicPath)) {
            fs.copyFileSync(publicPath, distPath);
          } else if (fs.existsSync(rootPath)) {
            fs.copyFileSync(rootPath, distPath);
          }
        });
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [copySeoAssetsPlugin()],
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
