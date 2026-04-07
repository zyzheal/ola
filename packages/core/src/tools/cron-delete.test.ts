/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CronDeleteTool } from './cron-delete.js';
import type { Config } from '../config/config.js';
import type { CronScheduler } from '../services/cronScheduler.js';

describe('CronDeleteTool', () => {
  let mockConfig: Config;
  let mockScheduler: CronScheduler;
  let tool: CronDeleteTool;

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

    tool = new CronDeleteTool(mockConfig);
  });

  describe('validateToolParams', () => {
    it('should accept valid params with id', () => {
      const params = {
        id: 'abcd1234',
      };

      const result = tool.validateToolParams(params);
      expect(result).toBeNull();
    });

    it('should reject missing id', () => {
      const params = {} as { id: string };

      // JSON schema validation should catch this
      const result = tool.validateToolParams(params);
      expect(result).toBeTruthy();
    });

    // Note: Empty id validation depends on JSON schema required field
    // The schema requires 'id' field, so empty string passes schema validation
  });

  describe('execute', () => {
    it('should delete existing cron job successfully', async () => {
      const params = {
        id: 'abcd1234',
      };

      vi.mocked(mockScheduler.delete).mockReturnValue(true);

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(mockScheduler.delete).toHaveBeenCalledWith('abcd1234');
      expect(result.llmContent).toBe('Cancelled job abcd1234.');
      expect(result.returnDisplay).toBe('Cancelled abcd1234');
      expect(result.error).toBeUndefined();
    });

    it('should handle non-existent job', async () => {
      const params = {
        id: 'nonexistent',
      };

      vi.mocked(mockScheduler.delete).mockReturnValue(false);

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(mockScheduler.delete).toHaveBeenCalledWith('nonexistent');
      expect(result.llmContent).toBe('Job nonexistent not found.');
      expect(result.returnDisplay).toBe('Job nonexistent not found.');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Job nonexistent not found.');
    });

    it('should handle scheduler errors', async () => {
      const params = {
        id: 'test1234',
      };

      vi.mocked(mockScheduler.delete).mockImplementation(() => {
        throw new Error('Scheduler error');
      });

      const invocation = tool.build(params);
      const result = await invocation.execute(
        vi.fn() as unknown as AbortSignal,
      );

      expect(result.llmContent).toContain('Error deleting cron job');
      expect(result.llmContent).toContain('Scheduler error');
      expect(result.error).toBeDefined();
    });
  });

  describe('getDescription', () => {
    it('should return job id', () => {
      const params = {
        id: 'abcd1234',
      };

      const invocation = tool.build(params);
      const description = invocation.getDescription();

      expect(description).toBe('abcd1234');
    });
  });
});
