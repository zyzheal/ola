/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { CronScheduler } from '../services/cronScheduler.js';

describe('CronScheduler', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('create', () => {
    it('should create a recurring cron job', () => {
      const scheduler = new CronScheduler();
      const job = scheduler.create('0 9 * * *', 'morning report', true);

      expect(job.id).toMatch(/^[a-z0-9]{8}$/);
      expect(job.cronExpr).toBe('0 9 * * *');
      expect(job.prompt).toBe('morning report');
      expect(job.recurring).toBe(true);
      expect(job.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should create a one-shot cron job', () => {
      const scheduler = new CronScheduler();
      const job = scheduler.create('0 9 * * *', 'one-time reminder', false);

      expect(job.recurring).toBe(false);
      expect(job.expiresAt).toBe(Infinity);
    });

    it('should throw when max jobs limit reached', () => {
      const scheduler = new CronScheduler();

      // Create 50 jobs (max limit)
      for (let i = 0; i < 50; i++) {
        scheduler.create('0 9 * * *', `job ${i}`, true);
      }

      expect(() => scheduler.create('0 9 * * *', 'job 51', true)).toThrow(
        'Maximum number of cron jobs (50) reached',
      );
    });
  });

  describe('delete', () => {
    it('should delete existing job', () => {
      const scheduler = new CronScheduler();
      const job = scheduler.create('0 9 * * *', 'test', true);

      expect(scheduler.delete(job.id)).toBe(true);
      expect(scheduler.list()).toHaveLength(0);
    });

    it('should return false for non-existent job', () => {
      const scheduler = new CronScheduler();
      expect(scheduler.delete('nonexistent')).toBe(false);
    });
  });

  describe('list', () => {
    it('should return all active jobs', () => {
      const scheduler = new CronScheduler();
      scheduler.create('0 9 * * *', 'job1', true);
      scheduler.create('0 10 * * *', 'job2', true);

      const jobs = scheduler.list();
      expect(jobs).toHaveLength(2);
      expect(jobs.map((j) => j.prompt)).toEqual(['job1', 'job2']);
    });

    it('should return empty array when no jobs', () => {
      const scheduler = new CronScheduler();
      expect(scheduler.list()).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('should return number of active jobs', () => {
      const scheduler = new CronScheduler();
      expect(scheduler.size).toBe(0);

      scheduler.create('0 9 * * *', 'job1', true);
      expect(scheduler.size).toBe(1);

      scheduler.create('0 10 * * *', 'job2', true);
      expect(scheduler.size).toBe(2);
    });
  });

  describe('start/stop', () => {
    it('should start scheduler with interval', () => {
      const scheduler = new CronScheduler();
      expect(scheduler.running).toBe(false);

      scheduler.start(() => {});
      expect(scheduler.running).toBe(true);

      scheduler.stop();
      expect(scheduler.running).toBe(false);
    });

    it('should not create multiple intervals', () => {
      const scheduler = new CronScheduler();
      scheduler.start(() => {});
      scheduler.start(() => {}); // Should be ignored

      scheduler.stop();
    });
  });

  describe('tick', () => {
    it('should fire job when time matches', () => {
      const scheduler = new CronScheduler();
      // Use */1 * * * * (every minute) which has minimal jitter (10% of 1 min = 6 seconds)
      const job = scheduler.create('*/1 * * * *', 'every minute', true);
      const onFire = vi.fn();

      scheduler.start(onFire);

      // Any minute should match for */1 * * * *
      const fireTime = new Date('2025-01-15T09:30:00Z');
      scheduler.tick(fireTime);

      expect(onFire).toHaveBeenCalledWith(job);
    });

    it('should not fire job before scheduled time', () => {
      const scheduler = new CronScheduler();
      scheduler.create('0 9 * * *', 'morning', true);
      const onFire = vi.fn();

      scheduler.start(onFire);

      // Simulate 8:59 AM - before scheduled time even with jitter
      const beforeTime = new Date('2025-01-15T08:59:00Z');
      scheduler.tick(beforeTime);

      expect(onFire).not.toHaveBeenCalled();
    });

    it('should delete one-shot job after firing', () => {
      const scheduler = new CronScheduler();
      // Use */1 * * * * for predictable firing
      scheduler.create('*/1 * * * *', 'one-time', false);
      const onFire = vi.fn();

      scheduler.start(onFire);

      const fireTime = new Date('2025-01-15T09:30:00Z');
      scheduler.tick(fireTime);

      expect(onFire).toHaveBeenCalled();
      expect(scheduler.size).toBe(0);
    });

    it('should not fire same job twice for same minute', () => {
      const scheduler = new CronScheduler();
      scheduler.create('*/1 * * * *', 'every minute', true);
      const onFire = vi.fn();

      scheduler.start(onFire);

      const fireTime = new Date('2025-01-15T09:30:00Z');
      scheduler.tick(fireTime);
      scheduler.tick(fireTime); // Same minute

      expect(onFire).toHaveBeenCalledTimes(1);
    });

    it('should delete expired recurring job', () => {
      const scheduler = new CronScheduler();
      scheduler.create('0 9 * * *', 'recurring', true);
      const onFire = vi.fn();

      scheduler.start(onFire);

      // Simulate time 4 days later (past 3-day expiry)
      const expiredTime = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      scheduler.tick(expiredTime);

      expect(onFire).not.toHaveBeenCalled();
      expect(scheduler.size).toBe(0);
    });
  });

  describe('getExitSummary', () => {
    it('should return null when no jobs', () => {
      const scheduler = new CronScheduler();
      expect(scheduler.getExitSummary()).toBe(null);
    });

    it('should return summary for active jobs', () => {
      const scheduler = new CronScheduler();
      scheduler.create('0 9 * * *', 'morning report', true);

      const summary = scheduler.getExitSummary();
      expect(summary).toContain('1 active loop');
      expect(summary).toContain('morning report');
    });

    it('should truncate long prompts', () => {
      const scheduler = new CronScheduler();
      scheduler.create(
        '0 9 * * *',
        'This is a very long prompt that should be truncated because it exceeds 60 characters',
        true,
      );

      const summary = scheduler.getExitSummary();
      expect(summary).toContain('...');
    });
  });

  describe('destroy', () => {
    it('should clear all jobs and stop scheduler', () => {
      const scheduler = new CronScheduler();
      scheduler.create('0 9 * * *', 'job1', true);
      scheduler.create('0 10 * * *', 'job2', true);
      scheduler.start(() => {});

      scheduler.destroy();

      expect(scheduler.size).toBe(0);
      expect(scheduler.running).toBe(false);
    });
  });
});
