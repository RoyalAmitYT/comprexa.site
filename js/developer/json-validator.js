/**
 * JSON Validator Entry Point
 */

import { ValidatorUIController } from "./json-validator/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  new ValidatorUIController();
});
