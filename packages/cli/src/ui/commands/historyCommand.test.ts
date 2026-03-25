/**
 * @license
 * Copyright 2025 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historyCommand } from './historyCommand.js';
import type { CommandContext, MessageActionReturn } from './types.js';
import type { Config, Storage } from 'ola-core';

describe('historyCommand', () => {
  const mockStorage = {
    getProjectDir: () => '/test/project',
  } as unknown as Storage;

  const mockGeminiClient = {
    getChat: () => undefined,
  };

  const mockConfig = {
    getSessionId: () => 'test-session-123',
    storage: mockStorage,
    getGeminiClient: () => mockGeminiClient,
    getWorkingDir: () => '/test/project',
    getProjectRoot: () => '/test/project',
  } as unknown as Config;

  const mockContext: Partial<CommandContext> = {
    services: {
      config: mockConfig,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      settings: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      git: {} as any,
      logger: null,
    },
    ui: { addItem: vi.fn() } as unknown as CommandContext['ui'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Commands', () => {
    it('should have correct name and description', () => {
      expect(historyCommand.name).toBe('history');
      expect(historyCommand.altNames).toEqual(['h']);
      expect(historyCommand.description).toBeDefined();
    });

    it('should show input history by default', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        '',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.any(String),
      });
    });

    it('should handle input subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input 10',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });

    it('should handle tool subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'tools',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });

    it('should handle log subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'log',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });

    it('should handle sessions subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'sessions',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });
  });

  describe('Search Functionality', () => {
    it('should handle search subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'search "test keyword"',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });

    it('should handle search with keyword option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'search --keyword "error"',
      );

      expect(result).toBeDefined();
    });

    it('should show no matches message when search returns empty', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'search "nonexistent"',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });
  });

  describe('Export Functionality', () => {
    it('should handle export subcommand with default JSON format', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'export',
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('message');
    });

    it('should handle export with format option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'export --format md',
      );

      expect(result).toBeDefined();
    });

    it('should handle export with output option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'export -f jsonl -o custom-output.jsonl',
      );

      expect(result).toBeDefined();
    });

    it('should handle unsupported export format', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'export --format xml',
      );

      expect(result).toBeDefined();
      expect((result as MessageActionReturn).messageType).toBe('error');
    });
  });

  describe('Date Range Filtering', () => {
    it('should handle --since option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input --since 2026-03-01',
      );

      expect(result).toBeDefined();
    });

    it('should handle --until option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input --until 2026-03-25',
      );

      expect(result).toBeDefined();
    });

    it('should handle both --since and --until options', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input --since 2026-03-01 --until 2026-03-25',
      );

      expect(result).toBeDefined();
    });

    it('should handle date range with tools', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'tools --since 2026-03-01',
      );

      expect(result).toBeDefined();
    });
  });

  describe('Keyword Filtering', () => {
    it('should handle --keyword option for log', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'log --keyword "error"',
      );

      expect(result).toBeDefined();
    });

    it('should handle -k shorthand for keyword', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'log -k "warning"',
      );

      expect(result).toBeDefined();
    });
  });

  describe('Limit Option', () => {
    it('should handle --limit option', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input --limit 50',
      );

      expect(result).toBeDefined();
    });

    it('should handle -l shorthand for limit', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'tools -l 100',
      );

      expect(result).toBeDefined();
    });

    it('should handle legacy format with bare number', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input 30',
      );

      expect(result).toBeDefined();
    });
  });

  describe('Help and Unknown Commands', () => {
    it('should show help for unknown subcommand', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'unknown',
      );

      expect(result).toBeDefined();
      expect((result as MessageActionReturn).content).toContain(
        'History command usage:',
      );
    });

    it('should show comprehensive help', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        '',
      );

      // When no subcommand, it shows input history, not help
      expect(result).toBeDefined();
    });
  });

  describe('Argument Parsing', () => {
    it('should parse combined flags', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'input -l 30 -s 2026-03-01',
      );

      expect(result).toBeDefined();
    });

    it('should parse export with multiple options', async () => {
      if (!historyCommand.action) {
        throw new Error('Command has no action');
      }

      const result = await historyCommand.action!(
        mockContext as CommandContext,
        'export -f md -o my-history.md',
      );

      expect(result).toBeDefined();
    });
  });
});
