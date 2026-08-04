/**
 * JSON Tree Viewer Entry Point
 */

import { TreeUIController } from "./json-tree-viewer/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  window.jsonTreeViewerApp = new TreeUIController();
});
