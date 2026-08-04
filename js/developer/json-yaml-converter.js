/**
 * JSON ↔ YAML Converter Entry Point
 */

import { ConverterUIController } from "./json-yaml-converter/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  new ConverterUIController();
});
