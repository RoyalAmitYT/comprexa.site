/**
 * Verify Flow - Countdown Timer Utility
 */

export class CountdownTimer {
  /**
   * @param {Object} options
   * @param {number} options.durationSeconds Total countdown time in seconds
   * @param {number} [options.updateIntervalMs=100] Interval between updates in ms
   * @param {function(number, number): void} [options.onTick] Callback on tick (remainingSec, progressRatio 0-1)
   * @param {function(): void} [options.onComplete] Callback on timer completion
   */
  constructor(options) {
    this.durationSeconds = options.durationSeconds || 10;
    this.updateIntervalMs = options.updateIntervalMs || 100;
    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.totalMs = this.durationSeconds * 1000;
    this.elapsedMs = 0;
    this.timerId = null;
  }

  start() {
    this.stop();
    this.elapsedMs = 0;

    this.timerId = setInterval(() => {
      this.elapsedMs += this.updateIntervalMs;

      if (this.elapsedMs >= this.totalMs) {
        this.elapsedMs = this.totalMs;
        this.stop();
        this.onTick(0, 1);
        this.onComplete();
        return;
      }

      const remainingSec = Math.max(0, Math.ceil((this.totalMs - this.elapsedMs) / 1000));
      const progressRatio = Math.min(1, this.elapsedMs / this.totalMs);
      this.onTick(remainingSec, progressRatio);
    }, this.updateIntervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
