/**
 * Password Generator Entry Point
 */

import { PasswordUIController } from "./password-generator/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  window.passwordGeneratorApp = new PasswordUIController();
});
