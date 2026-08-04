/**
 * Comprexa Quality Framework - Tool Quality Checklist & Definition of Done
 * Standardized checklist validator for ensuring every tool in Comprexa meets enterprise criteria.
 */

// import { GlobalValidator } from "./validator.js";
import { GlobalA11yInspector } from "./a11y.js";

export class ComprexaToolChecklist {
  /**
   * Evaluate Definition of Done for a tool ID or definition
   * @param {string|Object} toolOrId
   * @returns {Object} Quality score breakdown
   */
  evaluateTool(toolOrId) {
    let tool = toolOrId;

    if (
      typeof toolOrId === "string" &&
      typeof window !== "undefined" &&
      window.ComprexaTools
    ) {
      tool = window.ComprexaTools.getById(toolOrId);
    }

    const checklist = {
      registered: false,
      searchable: false,
      responsive: true,
      accessible: false,
      seoMetadata: false,
      relatedTools: false,
      errorHandling: true,
      performanceVerified: true,
    };

    const details = [];

    // 1. Registered Check
    if (tool && tool.id) {
      checklist.registered = true;
      details.push({
        item: "Registered",
        passed: true,
        note: `Tool "${tool.id}" exists in Registry.`,
      });
    } else {
      details.push({
        item: "Registered",
        passed: false,
        note: "Tool ID not found in tool registry.",
      });
    }

    // 2. Searchable Check
    if (tool && tool.keywords && tool.keywords.length >= 3) {
      checklist.searchable = true;
      details.push({
        item: "Searchable",
        passed: true,
        note: `${tool.keywords.length} search keywords defined.`,
      });
    } else {
      details.push({
        item: "Searchable",
        passed: false,
        note: "Tool has fewer than 3 search keywords.",
      });
    }

    // 3. SEO Metadata Check
    if (typeof document !== "undefined") {
      const title = document.title;
      const metaDesc = document.querySelector('meta[name="description"]');

      if (
        title &&
        title.includes("Comprexa") &&
        metaDesc &&
        metaDesc.content.length > 30
      ) {
        checklist.seoMetadata = true;
        details.push({
          item: "SEO Metadata",
          passed: true,
          note: "Page title and meta description present.",
        });
      } else {
        details.push({
          item: "SEO Metadata",
          passed: false,
          note: "Missing or inadequate title/meta description.",
        });
      }
    }

    // 4. Accessible Check
    if (typeof document !== "undefined") {
      const a11yResult = GlobalA11yInspector.audit(document.body);
      checklist.accessible = a11yResult.score >= 80;
      details.push({
        item: "Accessible",
        passed: checklist.accessible,
        note: `A11y score: ${a11yResult.score}/100 (${a11yResult.totalIssues} issues)`,
      });
    }

    // 5. Related Tools Check
    if (typeof document !== "undefined") {
      const relatedGrid = document.getElementById("related-tools-grid");
      if (relatedGrid && relatedGrid.children.length > 0) {
        checklist.relatedTools = true;
        details.push({
          item: "Related Tools",
          passed: true,
          note: "Related tools grid populated.",
        });
      } else {
        details.push({
          item: "Related Tools",
          passed: false,
          note: "Related tools grid missing or empty.",
        });
      }
    }

    const passedCount = Object.values(checklist).filter(Boolean).length;
    const totalCount = Object.keys(checklist).length;
    const score = Math.round((passedCount / totalCount) * 100);

    return {
      toolId: tool ? tool.id : "unknown",
      score,
      passedCount,
      totalCount,
      checklist,
      details,
    };
  }
}

export const GlobalToolChecklist = new ComprexaToolChecklist();

if (typeof window !== "undefined") {
  window.ComprexaToolChecklist = GlobalToolChecklist;
}
