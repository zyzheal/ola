/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CronCreateTool } from './cron-create.js';
import type { Config } from '../config/config.js';
import type { CronScheduler } from '../services/cronScheduler.js';

describe('CronCreateTool', () => {
  let mockConfig: Config;
  let mockScheduler: CronScheduler;
  let tool: CronCreateTool;

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

    tool = new CronCreateTool(mockConfig);
  });

  describe('validateToolParams', () => {
    it('should accept valid params with cron and prompt', () => {
      const params = {
        cron: '0 9 * * *',
        prompt: 'morning report',
      };

      const result = tool.validateToolParams(params);
      expect(result).toBeNull();
    });

    it('should accept params with recurring flag', () => {
      const params = {
        cron: '*/5 * * * *',
        prompt: 'check status',
        recurring: false,
      };

      const result = tool.validateToolParams(params);
      expect(result).toBeNull();
    });

    it('should reject missing cron expression', () => {
      const params = {
        prompt: 'test prompt',
      } as unknown as { cron: string; prompt: string };

      // JSON schema validation should catch this
      const result = tool.validateToolParams(params);
      expect(result).toBeTruthy();
    });

    it('should reject missing prompt', () => {
      const params = {
        cron: '0 9 * * *',
      } as unknown as { cron: string; prompt: string };

      // JSON schema validation should catch this
      const result = tool.validateToolParams(params);
      expect(result).toBeTruthy();
    });

    // Note: Invalid cron expressions are caught during execute(), not validateToolParams()
    // The JSON schema only checks for required fields, not semantic validity
  });

  describe('execute', () => {
    it('should create a recurring cron job successfully', async () => {
      const params = {
        cron: '0 9 * * *',
        prompt: 'morning report',
      };

      const mockJob = {
        id: 'abcd1234',
        cronExpr: '0 9 * * *',
        prompt: 'morning report',
        recurring: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
        jitterMs: 0,
      };

      vi.mocked(mockScheduler.create).mockReturnValue(mockJob);

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(mockScheduler.create).toHaveBeenCalledWith(
        '0 9 * * *',
        'morning report',
        true,
      );
      expect(result.llmContent).toContain('Scheduled recurring job abcd1234');
      expect(result.returnDisplay).toBe('Scheduled abcd1234 (0 9 * * *)');
    });

    it('should create a one-shot cron job successfully', async () => {
      const params = {
        cron: '30 14 * * *',
        prompt: 'afternoon reminder',
        recurring: false,
      };

      const mockJob = {
        id: 'xyz789ab',
        cronExpr: '30 14 * * *',
        prompt: 'afternoon reminder',
        recurring: false,
        createdAt: Date.now(),
        expiresAt: Infinity,
        jitterMs: 0,
      };

      vi.mocked(mockScheduler.create).mockReturnValue(mockJob);

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(mockScheduler.create).toHaveBeenCalledWith(
        '30 14 * * *',
        'afternoon reminder',
        false,
      );
      expect(result.llmContent).toContain('Scheduled one-shot task xyz789ab');
      expect(result.returnDisplay).toBe('Scheduled xyz789ab (30 14 * * *)');
    });

    it('should handle invalid cron expression', async () => {
      const params = {
        cron: 'invalid cron',
        prompt: 'test',
      };

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('Error creating cron job');
      expect(result.error).toBeDefined();
    });

    it('should handle scheduler errors', async () => {
      const params = {
        cron: '0 9 * * *',
        prompt: 'test',
      };

      vi.mocked(mockScheduler.create).mockImplementation(() => {
        throw new Error('Scheduler error');
      });

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('Error creating cron job');
      expect(result.error).toBeDefined();
    });
  });

  describe('getDescription', () => {
    it('should return cron expression and prompt', () => {
      const params = {
        cron: '0 9 * * *',
        prompt: 'morning report',
      };

      const invocation = tool.build(params);
      const description = invocation.getDescription();

      expect(description).toBe('0 9 * * *: morning report');
    });
  });
});
