/**
 * Verify Flow - Progress Bar Utility
 */

export class ProgressBar {
  /**
   * @param {HTMLElement} element Progress bar fill DOM element
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * Update progress percentage (0 to 100)
   * @param {number} percentage 
   */
  setProgress(percentage) {
    if (!this.element) return;
    const clamped = Math.min(100, Math.max(0, percentage));
    this.element.style.width = `${clamped}%`;
  }

  /**
   * Mark progress bar as completed
   * @param {string} [color="var(--success)"] Optional completion color
   */
  complete(color = "var(--success)") {
    if (!this.element) return;
    this.element.style.width = "100%";
    this.element.style.background = color;
  }
}
