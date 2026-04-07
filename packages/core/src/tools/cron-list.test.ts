/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CronListTool } from './cron-list.js';
import type { Config } from '../config/config.js';
import type { CronScheduler, CronJob } from '../services/cronScheduler.js';

describe('CronListTool', () => {
  let mockConfig: Config;
  let mockScheduler: CronScheduler;
  let tool: CronListTool;

  beforeEach(() => {
    mockScheduler = {
      create: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      size: 0,
      start: vi.fn(),
      stop: vi.fn(),
      tick: vi.fn(),
      running: false,
      getExitSummary: vi.fn(),
      destroy: vi.fn(),
    } as unknown as CronScheduler;

    mockConfig = {
      getCronScheduler: vi.fn().mockReturnValue(mockScheduler),
    } as unknown as Config;

    tool = new CronListTool(mockConfig);
  });

  describe('validateToolParams', () => {
    it('should accept empty params', () => {
      const params = {};

      const result = tool.validateToolParams(params);
      expect(result).toBeNull();
    });

    it('should reject params with extra fields', () => {
      const params = {
        extra: 'field',
      } as unknown as Record<string, never>;

      const result = tool.validateToolParams(params);
      expect(result).toBeTruthy();
    });
  });

  describe('execute', () => {
    it('should return message when no cron jobs exist', async () => {
      vi.mocked(mockScheduler.list).mockReturnValue([]);

      const invocation = tool.build({});
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toBe('No active cron jobs.');
      expect(result.returnDisplay).toBe('No active cron jobs.');
    });

    it('should list recurring cron jobs', async () => {
      const jobs: CronJob[] = [
        {
          id: 'abcd1234',
          cronExpr: '0 9 * * *',
          prompt: 'morning report',
          recurring: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
          jitterMs: 0,
        },
        {
          id: 'xyz789ab',
          cronExpr: '*/5 * * * *',
          prompt: 'check status',
          recurring: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
          jitterMs: 0,
        },
      ];

      vi.mocked(mockScheduler.list).mockReturnValue(jobs);

      const invocation = tool.build({});
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('abcd1234 — 0 9 * * * (recurring)');
      expect(result.llmContent).toContain('morning report');
      expect(result.llmContent).toContain('xyz789ab — */5 * * * * (recurring)');
      expect(result.llmContent).toContain('check status');
      expect(result.returnDisplay).toContain('abcd1234');
      expect(result.returnDisplay).toContain('xyz789ab');
    });

    it('should list one-shot cron jobs', async () => {
      const jobs: CronJob[] = [
        {
          id: 'oneshot1',
          cronExpr: '30 14 * * *',
          prompt: 'afternoon reminder',
          recurring: false,
          createdAt: Date.now(),
          expiresAt: Infinity,
          jitterMs: 0,
        },
      ];

      vi.mocked(mockScheduler.list).mockReturnValue(jobs);

      const invocation = tool.build({});
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('oneshot1 — 30 14 * * * (one-shot)');
      expect(result.llmContent).toContain('afternoon reminder');
    });

    it('should handle mixed recurring and one-shot jobs', async () => {
      const jobs: CronJob[] = [
        {
          id: 'recurring1',
          cronExpr: '0 * * * *',
          prompt: 'hourly task',
          recurring: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
          jitterMs: 0,
        },
        {
          id: 'oneshot1',
          cronExpr: '0 18 * * *',
          prompt: 'evening reminder',
          recurring: false,
          createdAt: Date.now(),
          expiresAt: Infinity,
          jitterMs: 0,
        },
      ];

      vi.mocked(mockScheduler.list).mockReturnValue(jobs);

      const invocation = tool.build({});
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('recurring1 — 0 * * * * (recurring)');
      expect(result.llmContent).toContain('oneshot1 — 0 18 * * * (one-shot)');
    });
  });

  describe('getDescription', () => {
    it('should return empty string', () => {
      const invocation = tool.build({});
      const description = invocation.getDescription();

      expect(description).toBe('');
    });
  });
});
