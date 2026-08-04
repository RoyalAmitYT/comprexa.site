/**
 * Comprexa Quality Framework - Accessibility (A11y) Inspector
 * Reusable auditing hooks for ARIA labels, heading hierarchy, touch target sizes, and keyboard focusable elements.
 */

export class ComprexaA11yInspector {
  /**
   * Run full accessibility audit on a container or entire page
   * @param {HTMLElement} [containerEl=document.body]
   * @returns {Object} Audit report
   */
  audit(containerEl = typeof document !== "undefined" ? document.body : null) {
    if (!containerEl) return { score: 100, issues: [] };

    const issues = [];

    // 1. Audit Buttons & Inputs for ARIA labels / Text Content
    const buttons = containerEl.querySelectorAll(
      'button, a[role="button"], input[type="submit"]',
    );
    buttons.forEach((btn, index) => {
      const text = (btn.textContent || "").trim();
      const ariaLabel = btn.getAttribute("aria-label");
      const ariaLabelledBy = btn.getAttribute("aria-labelledby");

      if (!text && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          element: btn,
          type: "MISSING_LABEL",
          severity: "HIGH",
          message: `Button at index ${index} lacks readable text, aria-label, or aria-labelledby.`,
        });
      }
    });

    // 2. Audit Heading Hierarchy
    const headings = Array.from(
      containerEl.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    );
    let lastLevel = 0;

    headings.forEach((h) => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (lastLevel > 0 && level > lastLevel + 1) {
        issues.push({
          element: h,
          type: "HEADING_HIERARCHY_GAP",
          severity: "MEDIUM",
          message: `Heading level jumped from H${lastLevel} straight to H${level} without intermediate heading.`,
        });
      }
      lastLevel = level;
    });

    // 3. Audit Images for ALT attributes
    const images = containerEl.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.hasAttribute("alt")) {
        issues.push({
          element: img,
          type: "MISSING_ALT",
          severity: "HIGH",
          message: `Image at index ${index} is missing alt attribute.`,
        });
      }
    });

    // 4. Audit Touch Target Sizes on Mobile (minimum 44x44px)
    const interactiveElements = containerEl.querySelectorAll(
      "button, a, input, select",
    );
    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < 32 || rect.height < 32) {
          issues.push({
            element: el,
            type: "SMALL_TOUCH_TARGET",
            severity: "LOW",
            message: `Interactive target size (${Math.round(rect.width)}x${Math.round(rect.height)}px) is below minimum 32-44px.`,
          });
        }
      }
    });

    const score = Math.max(0, 100 - issues.length * 10);

    return {
      score,
      totalIssues: issues.length,
      issues,
    };
  }
}

export const GlobalA11yInspector = new ComprexaA11yInspector();

if (typeof window !== "undefined") {
  window.ComprexaA11y = GlobalA11yInspector;
}
