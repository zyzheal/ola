/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely stringify objects with circular references.
 * Uses a WeakSet to track seen objects and skip circular references.
 *
 * This function is designed to handle complex objects that may contain:
 * - Circular references (e.g., HttpsProxyAgent, network sockets)
 * - Non-serializable values (functions, symbols, undefined)
 * - Mixed object types
 *
 * @param value - The value to stringify
 * @param fallbackValue - Fallback value if stringification fails (default: '{}')
 * @returns JSON string or fallback value stringified
 *
 * @example
 * ```typescript
 * // Normal object
 * safeStringify({ foo: 'bar' }); // '{"foo":"bar"}'
 *
 * // Circular reference
 * const obj: any = { name: 'test' };
 * obj.self = obj;
 * safeStringify(obj); // '{"name":"test","self":"[Circular]"}'
 *
 * // With custom fallback
 * safeStringify(null, 'null'); // 'null'
 * ```
 */
export function safeStringify<T = unknown>(
  value: T,
  fallbackValue: string = '{}',
): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return fallbackValue;
  }

  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (_key, val) => {
      // Handle non-object values
      if (typeof val !== 'object' || val === null) {
        // Filter out non-serializable values
        if (typeof val === 'function' || typeof val === 'symbol') {
          return undefined; // Will be omitted from JSON
        }
        return val;
      }

      // Circular reference detected
      if (seen.has(val)) {
        return '[Circular]';
      }

      seen.add(val);
      return val;
    });
  } catch {
    // If all else fails, return the fallback value
    return fallbackValue;
  }
}

/**
 * Parse a safely stringified object back, handling [Circular] markers.
 * This is useful for debugging but should not be used for actual data
 * reconstruction since circular references cannot be restored.
 *
 * @param jsonString - The JSON string to parse
 * @returns Parsed object with [Circular] markers preserved as strings
 */
export function parseWithCircularMarkers(jsonString: string): unknown {
  return JSON.parse(jsonString);
}
