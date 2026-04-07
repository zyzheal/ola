/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { humanReadableCron } from '../utils/cronDisplay.js';

describe('cronDisplay', () => {
  describe('humanReadableCron', () => {
    it('should return "Every minute" for */1 * * * *', () => {
      expect(humanReadableCron('*/1 * * * *')).toBe('Every minute');
    });

    it('should return "Every N minutes" for */N * * * *', () => {
      expect(humanReadableCron('*/5 * * * *')).toBe('Every 5 minutes');
      expect(humanReadableCron('*/15 * * * *')).toBe('Every 15 minutes');
      expect(humanReadableCron('*/30 * * * *')).toBe('Every 30 minutes');
    });

    it('should return "Every hour" for 0 */1 * * *', () => {
      expect(humanReadableCron('0 */1 * * *')).toBe('Every hour');
    });

    it('should return "Every N hours" for 0 */N * * *', () => {
      expect(humanReadableCron('0 */2 * * *')).toBe('Every 2 hours');
      expect(humanReadableCron('0 */4 * * *')).toBe('Every 4 hours');
    });

    it('should return "Every day" for M H */1 * *', () => {
      expect(humanReadableCron('0 9 */1 * *')).toBe('Every day');
    });

    it('should return "Every N days" for M H */N * *', () => {
      expect(humanReadableCron('0 0 */2 * *')).toBe('Every 2 days');
      expect(humanReadableCron('0 0 */7 * *')).toBe('Every 7 days');
    });

    it('should return raw expression for non-trivial patterns', () => {
      expect(humanReadableCron('0 9 * * 1-5')).toBe('0 9 * * 1-5');
      expect(humanReadableCron('30 14 15 3 *')).toBe('30 14 15 3 *');
      expect(humanReadableCron('0,15,30,45 * * * *')).toBe(
        '0,15,30,45 * * * *',
      );
    });

    it('should return raw expression for invalid format', () => {
      expect(humanReadableCron('* * *')).toBe('* * *');
      expect(humanReadableCron('')).toBe('');
    });
  });
});
