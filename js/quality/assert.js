/**
 * Comprexa Quality Framework - Assertions Helper
 * Light-weight runtime assertion utilities for parameters, types, and invariant validation.
 */

export class ComprexaAssertionError extends Error {
  constructor(message) {
    super(`[ComprexaAssertionError] ${message}`);
    this.name = "ComprexaAssertionError";
  }
}

export const Assert = {
  /**
   * Assert boolean expression is true
   */
  isTrue(condition, message = "Assertion failed: condition is false") {
    if (!condition) {
      throw new ComprexaAssertionError(message);
    }
  },

  /**
   * Assert value is defined and non-null
   */
  exists(value, paramName = "Value") {
    if (value === undefined || value === null) {
      throw new ComprexaAssertionError(
        `${paramName} must be defined and non-null.`,
      );
    }
  },

  /**
   * Assert variable type
   */
  isType(value, expectedType, paramName = "Value") {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new ComprexaAssertionError(
        `${paramName} expected type '${expectedType}', received '${actualType}'.`,
      );
    }
  },

  /**
   * Assert array or string is not empty
   */
  nonEmpty(value, paramName = "Value") {
    this.exists(value, paramName);
    if (typeof value.length !== "number" || value.length === 0) {
      throw new ComprexaAssertionError(`${paramName} must not be empty.`);
    }
  },

  /**
   * Assert function parameter is a function
   */
  isFunction(fn, paramName = "Callback") {
    this.isType(fn, "function", paramName);
  },

  /**
   * Assert DOM Element exists
   */
  isElement(el, paramName = "Element") {
    if (!(el instanceof Element || el instanceof HTMLElement)) {
      throw new ComprexaAssertionError(
        `${paramName} must be a valid DOM Element.`,
      );
    }
  },
};

if (typeof window !== "undefined") {
  window.ComprexaAssert = Assert;
}
