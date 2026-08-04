// @ts-nocheck
/**
 * Comprexa Global Article Registry
 */
const COMPREXA_ARTICLE_REGISTRY = [
  {
    id: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress PDF Without Losing Quality",
    category: "PDF Guides",
    readTime: "2 min read",
    excerpt:
      "Learn step-by-step techniques to shrink large PDF documents down to 90% smaller size while keeping text and graphics crystal clear.",
    imageClass: "blog-img-bg--pdf",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>',
    author: "Comprexa Team",
    publishedAt: "2026-07-25T00:00:00Z",
    relatedTools: ["compress-pdf","pdf-to-word"],
    content: `
      <p class="article-lead">
        Have you ever tried to email a PDF, only to get an error that
        the file is too large? It's a frustrating but common issue,
        especially when dealing with scanned documents or
        high-resolution graphics.
      </p>
      <h2 id="understanding-compression">Understanding PDF Compression</h2>
      <p>
        When we talk about compressing a PDF, we are usually talking
        about one of two primary methods: lossless and lossy
        compression. Understanding the difference is crucial to
        maintaining the quality of your documents.
      </p>
      <blockquote>
        "Good compression isn't just about reducing file size; it's
        about preserving intent and readability."
      </blockquote>
      <h3 id="lossless-vs-lossy">1. Lossless vs. Lossy</h3>
      <ul>
        <li>
          <strong>Lossless Compression:</strong> Reduces file size by
          removing redundant data and optimizing the internal structure
          (like font subsets and unused objects) without affecting the
          visual quality of the document at all.
        </li>
        <li>
          <strong>Lossy Compression:</strong> Achieves much smaller file
          sizes by actively reducing the resolution or quality of
          embedded images and media.
        </li>
      </ul>
      <h3 id="developer-code">Code Example for Developers</h3>
      <p>
        If you're building a web application, you can utilize modern
        JavaScript libraries to optimize PDFs directly in the browser.
        This ensures privacy since the file never leaves the user's
        device.
      </p>
      <pre><code>import { PDFDocument } from 'pdf-lib';

async function optimizePdf(bytes) {
  // Load the document
  const doc = await PDFDocument.load(bytes);
  
  // Save with optimization flags
  const optimizedBytes = await doc.save({ 
    useObjectStreams: false,
    addDefaultPage: false
  });
  
  return optimizedBytes;
}</code></pre>
      <h2 id="best-practices">Best Practices</h2>
      <p>
        For most standard documents containing text and a few graphics,
        using a robust lossless optimization tool will yield a 20-40%
        reduction in size. If your PDF is mostly scanned images, you
        will likely need to employ lossy compression by dropping the DPI
        of the images to 144 or 72.
      </p>
      <p>
        Remember that the Comprexa PDF Compressor tool handles this
        automatically entirely in your browser using WebAssembly.
      </p>
      <!-- Final CTA -->
      <div style="margin-top: 40px; padding: 24px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; text-align: center;">
        <h3 style="margin-bottom: 12px; font-size: 1.25rem;">Ready to shrink your PDF?</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted);">Try our free, secure, in-browser PDF compressor.</p>
        <a href="/compress-pdf.html" class="btn btn--primary">Compress PDF Now</a>
      </div>
    `,
  },
  {
    id: "best-free-image-compression-tools-in-2026",
    title: "Best Free Image Compression Tools in 2026",
    category: "Image Processing",
    readTime: "2 min read",
    excerpt:
      "A comprehensive comparison of modern lossy and lossless web image optimizers for WebP, PNG, and JPG formats.",
    imageClass: "blog-img-bg--image",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    author: "Comprexa Team",
    publishedAt: "2026-07-28T00:00:00Z",
    relatedTools: ["compress-image","webp-to-png"],
    content: `
      <p class="article-lead">
        Web image formats have evolved. Learn which algorithms provide the best balance between visual fidelity and file size for your websites and apps.
      </p>
      <h2 id="evolution">The Evolution of Image Formats</h2>
      <p>
        Over the past decade, we've moved from standard JPEGs and PNGs to more advanced formats like WebP and AVIF.
      </p>
      <h3 id="webp-advantages">Why WebP?</h3>
      <p>
        WebP provides superior lossless and lossy compression for images on the web. It is widely supported and can reduce file sizes by up to 30% compared to JPEG.
      </p>
      <ul>
        <li>Smaller file sizes</li>
        <li>Supports transparency</li>
        <li>Animation support</li>
      </ul>
      <h2 id="tools">Top Tools for Compression</h2>
      <p>
        Browser-based image compression allows you to optimize images without sending them to a remote server. This is both faster and more secure.
      </p>
      <h3 id="recommendation">Our Recommendation</h3>
      <p>
        Use modern WebAssembly tools to perform local compression. This ensures that your private photos remain entirely on your device.
      </p>
      <!-- Final CTA -->
      <div style="margin-top: 40px; padding: 24px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; text-align: center;">
        <h3 style="margin-bottom: 12px; font-size: 1.25rem;">Compress your images instantly</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted);">No uploads, no quality loss. 100% in-browser.</p>
        <a href="/compress-image.html" class="btn btn--primary">Optimize Image Now</a>
      </div>
    `,
  },
  {
    id: "everything-you-need-to-know-about-pdf-files",
    title: "Everything You Need to Know About PDF Files",
    category: "Document Tech",
    readTime: "2 min read",
    excerpt:
      "Explore how PDF specifications work under the hood, how page rendering functions, and how browser WebAssembly keeps documents private.",
    imageClass: "blog-img-bg--tech",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
    author: "Comprexa Team",
    publishedAt: "2026-07-30T00:00:00Z",
    relatedTools: ["pdf-to-word","split-pdf"],
    content: `
      <p class="article-lead">
        The Portable Document Format (PDF) is universally used, but how does it actually work? Let's dive into the core architecture of PDF rendering and parsing.
      </p>
      <h2 id="pdf-structure">Understanding PDF Structure</h2>
      <p>
        A PDF file is not just a collection of pixels. It is a highly structured document that includes text, fonts, vector graphics, and raster images.
      </p>
      <h3 id="objects-dictionaries">Objects and Dictionaries</h3>
      <p>
        PDFs are built using a series of objects (booleans, strings, arrays) and dictionaries. This allows the format to be highly flexible and cross-platform.
      </p>
      <h2 id="security">Privacy and Security</h2>
      <p>
        One of the biggest concerns with PDFs is privacy. When you use cloud-based tools, your sensitive documents are uploaded to third-party servers. 
      </p>
      <h3 id="client-side">The Client-Side Revolution</h3>
      <p>
        By utilizing WebAssembly (Wasm), modern web applications can parse, edit, and render PDFs entirely on the client side.
      </p>
      <!-- Final CTA -->
      <div style="margin-top: 40px; padding: 24px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; text-align: center;">
        <h3 style="margin-bottom: 12px; font-size: 1.25rem;">Manage your PDFs securely</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted);">Try our suite of 100% private, local PDF tools.</p>
        <a href="/#tools" class="btn btn--primary">Explore PDF Tools</a>
      </div>
    `,
  },
  {
    id: "the-future-of-browser-based-tools",
    title: "The Future of Browser-Based Tools",
    category: "News",
    readTime: "2 min read",
    excerpt:
      "How WebAssembly and modern browser APIs are making desktop applications obsolete for everyday tasks.",
    imageClass: "blog-img-bg--tech",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><circle cx="12" cy="12" r="10"/></svg>',
    author: "Comprexa Team",
    publishedAt: "2026-07-20T00:00:00Z",
    relatedTools: ["qr-generator","password-generator"],
    content: `
      <p class="article-lead">
        The landscape of software is shifting. With WebAssembly and advanced browser APIs, tasks that once required hefty desktop software can now be performed entirely in the browser.
      </p>
      <h2 id="webassembly">The Rise of WebAssembly</h2>
      <p>
        WebAssembly (Wasm) is a binary instruction format that allows code written in languages like C, C++, and Rust to run natively in the browser.
      </p>
      <h3 id="performance">Near-Native Performance</h3>
      <p>
        Because Wasm executes at near-native speed, computationally heavy tasks like video encoding, file compression, and cryptography can now happen locally.
      </p>
      <h2 id="privacy-first">Privacy-First Architecture</h2>
      <p>
        The biggest advantage of browser-based tools is privacy. By eliminating the need to upload files to a server, user data remains strictly on their device.
      </p>
      <h3 id="conclusion">Looking Forward</h3>
      <p>
        As APIs continue to mature, the gap between desktop applications and web applications will completely disappear.
      </p>
      <!-- Final CTA -->
      <div style="margin-top: 40px; padding: 24px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; text-align: center;">
        <h3 style="margin-bottom: 12px; font-size: 1.25rem;">Experience the future today</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted);">Generate passwords and QR codes directly in your browser.</p>
        <a href="/#tools" class="btn btn--primary">Try Comprexa Tools</a>
      </div>
    `,
  },
];

class ComprexaArticleRegistry {
  constructor(articles = COMPREXA_ARTICLE_REGISTRY) {
    this.articles = articles;
  }

  getAll() {
    return [...this.articles].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    );
  }

  getLatest(count = 3) {
    return this.getAll().slice(0, count);
  }

  getById(id) {
    return this.articles.find((a) => a.id === id);
  }
}

if (typeof window !== "undefined") {
  window.ComprexaArticleRegistry = new ComprexaArticleRegistry();
}
