/**
 * JSON Formatter Entry Point
 */

import { FormatterUIController } from "./json-formatter/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  new FormatterUIController();
});
