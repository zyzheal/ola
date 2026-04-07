/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { parseCron, matches, nextFireTime } from '../utils/cronParser.js';

describe('cronParser', () => {
  describe('parseCron', () => {
    it('should parse valid 5-field cron expression', () => {
      const fields = parseCron('0 9 * * *');
      expect(fields.minute).toEqual(new Set([0]));
      expect(fields.hour).toEqual(new Set([9]));
      expect(fields.domIsWild).toBe(true);
      expect(fields.dowIsWild).toBe(true);
    });

    it('should parse step expression */5', () => {
      const fields = parseCron('*/5 * * * *');
      expect(fields.minute).toEqual(
        new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]),
      );
    });

    it('should parse range expression', () => {
      const fields = parseCron('0 9 * * 1-5');
      expect(fields.dayOfWeek).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    it('should parse comma-separated list', () => {
      const fields = parseCron('0,15,30,45 * * * *');
      expect(fields.minute).toEqual(new Set([0, 15, 30, 45]));
    });

    it('should normalize 7 to 0 (both mean Sunday)', () => {
      const fields = parseCron('0 9 * * 7');
      expect(fields.dayOfWeek).toEqual(new Set([0]));
    });

    it('should throw on invalid field count', () => {
      expect(() => parseCron('* * *')).toThrow('must have exactly 5 fields');
    });

    it('should throw on out of bounds value', () => {
      expect(() => parseCron('60 * * * *')).toThrow('out of bounds');
    });

    it('should throw on invalid range', () => {
      expect(() => parseCron('5-2 * * * *')).toThrow('Range 5-2 out of bounds');
    });
  });

  describe('matches', () => {
    it('should match exact time', () => {
      // Use local time to avoid timezone issues
      const date = new Date(2025, 0, 15, 9, 0, 0);
      expect(matches('0 9 * * *', date)).toBe(true);
    });

    it('should not match different minute', () => {
      const date = new Date(2025, 0, 15, 9, 1, 0);
      expect(matches('0 9 * * *', date)).toBe(false);
    });

    it('should match step expression', () => {
      const date = new Date(2025, 0, 15, 10, 5, 0);
      expect(matches('*/5 * * * *', date)).toBe(true);
    });

    it('should match weekday expression', () => {
      // 2025-01-15 is Wednesday (day 3)
      const date = new Date(2025, 0, 15, 9, 0, 0);
      expect(matches('0 9 * * 1-5', date)).toBe(true);
    });

    it('should not match weekend with weekday expression', () => {
      // 2025-01-18 is Saturday (day 6)
      const date = new Date(2025, 0, 18, 9, 0, 0);
      expect(matches('0 9 * * 1-5', date)).toBe(false);
    });

    it('should use OR when both day fields are constrained', () => {
      // 2025-01-15 is Wednesday (day 3) AND 15th - should match
      const date = new Date(2025, 0, 15, 0, 0, 0);
      expect(matches('0 0 15 * 3', date)).toBe(true);
    });

    it('should use AND when only one day field is constrained', () => {
      // Only day-of-month constrained - 15th of any month
      const date = new Date(2025, 0, 15, 0, 0, 0);
      expect(matches('0 0 15 * *', date)).toBe(true);
    });
  });

  describe('nextFireTime', () => {
    it('should return next matching time', () => {
      const after = new Date('2025-01-15T08:00:00Z');
      const next = nextFireTime('0 9 * * *', after);
      expect(next.getHours()).toBe(9);
      expect(next.getMinutes()).toBe(0);
    });

    it('should skip to next day if time already passed', () => {
      const after = new Date('2025-01-15T10:00:00Z');
      const next = nextFireTime('0 9 * * *', after);
      expect(next.getDate()).toBe(16);
      expect(next.getHours()).toBe(9);
    });

    it('should handle step expression', () => {
      const after = new Date('2025-01-15T10:00:00Z');
      const next = nextFireTime('*/5 * * * *', after);
      expect(next.getMinutes()).toBe(5);
    });

    it('should throw if no match found within 4 years', () => {
      expect(() =>
        nextFireTime('0 0 30 2 *', new Date('2025-01-01T00:00:00Z')),
      ).toThrow('No matching fire time found');
    });
  });
});
