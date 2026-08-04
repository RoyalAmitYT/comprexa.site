/**
 * JSON Minifier Entry Point
 */

import { MinifierUIController } from "./json-minifier/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  new MinifierUIController();
});
