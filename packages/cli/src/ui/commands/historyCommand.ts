/**
 * @license
 * Copyright 2025 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CommandContext,
  SlashCommand,
  SlashCommandActionReturn,
  MessageActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';
import { Storage } from 'ola-core';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Parse command line arguments supporting both formats:
 * - Legacy: /history input 10
 * - New: /history input --limit 10 --since 2026-03-01
 */
interface ParsedArgs {
  subcommand: string;
  limit: number;
  since?: string;
  until?: string;
  keyword?: string;
  format?: string;
  output?: string;
  rawArgs: string[];
}

function parseArgs(args: string): ParsedArgs {
  const rawArgs = args.trim().split(/\s+/).filter(Boolean);
  const result: ParsedArgs = {
    subcommand: '',
    limit: 20,
    rawArgs,
  };

  let i = 0;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      // Parse flags
      switch (arg) {
        case '--limit':
        case '-l':
          result.limit = parseInt(rawArgs[++i], 10) || 20;
          break;
        case '--since':
        case '-s':
          result.since = rawArgs[++i];
          break;
        case '--until':
        case '-u':
          result.until = rawArgs[++i];
          break;
        case '--keyword':
        case '-k':
          result.keyword = rawArgs[++i];
          break;
        case '--format':
        case '-f':
          result.format = rawArgs[++i];
          break;
        case '--output':
        case '-o':
          result.output = rawArgs[++i];
          break;
        default:
          // Unknown flag, skip
          break;
      }
    } else if (!result.subcommand) {
      // First non-flag argument is the subcommand
      result.subcommand = arg.toLowerCase();
    } else if (!isNaN(parseInt(arg, 10))) {
      // Legacy format: bare number for limit
      result.limit = parseInt(arg, 10);
    } else if (!result.keyword && arg.startsWith('"') && arg.endsWith('"')) {
      // Legacy format: quoted keyword for search
      result.keyword = arg.slice(1, -1);
    }
    i++;
  }

  return result;
}

/**
 * Get user input history from the chat
 */
async function getInputHistory(
  context: CommandContext,
  limit: number = 20,
  since?: string,
  until?: string,
): Promise<Array<{ text: string; timestamp?: string }>> {
  const config = context.services.config;
  if (!config) return [];

  const chat = await config.getGeminiClient()?.getChat();
  const fullHistory = chat?.getHistory() || [];

  // Extract user messages with timestamps
  const userMessages: Array<{ text: string; timestamp?: string }> = [];

  for (const msg of fullHistory) {
    if (msg.role === 'user') {
      const text = msg.parts?.map((p) => p.text).join('') || '';
      if (text.trim().length > 0) {
        userMessages.push({
          text,
          // Note: timestamp is not part of standard Content type
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          timestamp: (msg as any).timestamp,
        });
      }
    }
  }

  // Filter by date range
  let filtered = userMessages;
  if (since) {
    const sinceDate = new Date(since);
    filtered = filtered.filter(
      (msg) => msg.timestamp && new Date(msg.timestamp) >= sinceDate,
    );
  }
  if (until) {
    const untilDate = new Date(until);
    filtered = filtered.filter(
      (msg) => msg.timestamp && new Date(msg.timestamp) <= untilDate,
    );
  }

  // Return the most recent messages up to limit
  return filtered.slice(-limit);
}

/**
 * Get tool call history from session records
 */
async function getToolCallHistory(
  context: CommandContext,
  limit: number = 20,
  since?: string,
  until?: string,
): Promise<
  Array<{ name: string; args: unknown; timestamp?: string; status?: string }>
> {
  const config = context.services.config;
  if (!config) return [];

  const chat = await config.getGeminiClient()?.getChat();
  const fullHistory = chat?.getHistory() || [];

  const toolCalls: Array<{
    name: string;
    args: unknown;
    timestamp?: string;
    status?: string;
  }> = [];

  for (const msg of fullHistory) {
    if (msg.role === 'model' && msg.parts) {
      for (const part of msg.parts) {
        if ('functionCall' in part && part.functionCall) {
          toolCalls.push({
            name: part.functionCall.name || 'unknown',
            args: part.functionCall.args || {},
            // Note: timestamp is not part of standard Content type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timestamp: (msg as any).timestamp,
          });
        }
      }
    }
  }

  // Filter by date range
  let filtered = toolCalls;
  if (since) {
    const sinceDate = new Date(since);
    filtered = filtered.filter(
      (call) => call.timestamp && new Date(call.timestamp) >= sinceDate,
    );
  }
  if (until) {
    const untilDate = new Date(until);
    filtered = filtered.filter(
      (call) => call.timestamp && new Date(call.timestamp) <= untilDate,
    );
  }

  return filtered.slice(-limit);
}

/**
 * Search history by keyword
 */
async function searchHistory(
  context: CommandContext,
  keyword: string,
  limit: number = 20,
): Promise<
  Array<{ type: 'user' | 'model'; text: string; timestamp?: string }>
> {
  const config = context.services.config;
  if (!config) return [];

  const chat = await config.getGeminiClient()?.getChat();
  const fullHistory = chat?.getHistory() || [];

  const results: Array<{
    type: 'user' | 'model';
    text: string;
    timestamp?: string;
  }> = [];

  const lowerKeyword = keyword.toLowerCase();

  for (const msg of fullHistory) {
    const text = msg.parts?.map((p) => p.text).join('') || '';
    if (text.toLowerCase().includes(lowerKeyword)) {
      results.push({
        type: msg.role === 'user' ? 'user' : 'model',
        text,
        // Note: timestamp is not part of standard Content type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timestamp: (msg as any).timestamp,
      });
    }
  }

  return results.slice(-limit);
}

/**
 * Get debug log content
 */
async function getDebugLog(
  sessionId: string,
  lines: number = 50,
  keyword?: string,
): Promise<string> {
  try {
    const logPath = Storage.getDebugLogPath(sessionId);
    const content = await fs.readFile(logPath, 'utf-8');
    let allLines = content.split('\n');

    // Filter by keyword if provided
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      allLines = allLines.filter((line) =>
        line.toLowerCase().includes(lowerKeyword),
      );
    }

    return allLines.slice(-lines).join('\n');
  } catch (_error) {
    return t('Debug log not found or unreadable.');
  }
}

/**
 * List available session history files
 */
async function listSessions(
  context: CommandContext,
): Promise<MessageActionReturn> {
  const config = context.services.config;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Config not loaded.'),
    };
  }

  try {
    const projectDir = config.storage.getProjectDir();
    const chatsDir = path.join(projectDir, 'chats');

    try {
      await fs.access(chatsDir);
    } catch {
      return {
        type: 'message',
        messageType: 'info',
        content: t('No session history files found.'),
      };
    }

    const files = await fs.readdir(chatsDir);
    const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

    if (jsonlFiles.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: t('No session history files found.'),
      };
    }

    const fileList = await Promise.all(
      jsonlFiles.map(async (file) => {
        const filePath = path.join(chatsDir, file);
        const stats = await fs.stat(filePath);
        const date = stats.mtime.toISOString().split('T')[0];
        const size = (stats.size / 1024).toFixed(1);
        return `- ${file} (${date}, ${size}KB)`;
      }),
    );

    return {
      type: 'message',
      messageType: 'info',
      content: t('Available session files:\n') + fileList.join('\n'),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Failed to list sessions: {{error}}', {
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}

/**
 * Export history to file
 */
async function exportHistory(
  context: CommandContext,
  format: string = 'json',
  outputPath?: string,
): Promise<MessageActionReturn> {
  const config = context.services.config;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Config not loaded.'),
    };
  }

  try {
    const chat = await config.getGeminiClient()?.getChat();
    const fullHistory = chat?.getHistory() || [];

    let content: string;
    const cwd = config.getWorkingDir() || config.getProjectRoot();

    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      outputPath = `history-${timestamp}.${format}`;
    }

    const filepath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(cwd, outputPath);

    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(fullHistory, null, 2);
        break;
      case 'jsonl':
        content = fullHistory.map((msg) => JSON.stringify(msg)).join('\n');
        break;
      case 'md':
      case 'markdown':
        content = fullHistory
          .map((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const text = msg.parts?.map((p) => p.text).join('') || '';
            return `## ${role}\n\n${text}\n`;
          })
          .join('\n---\n\n');
        break;
      case 'txt':
      case 'text':
        content = fullHistory
          .map((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const text = msg.parts?.map((p) => p.text).join('') || '';
            return `[${role}] ${text}`;
          })
          .join('\n\n');
        break;
      default:
        return {
          type: 'message',
          messageType: 'error',
          content: t(
            `Unsupported format: {{format}}. Supported: json, jsonl, md, txt`,
            { format },
          ),
        };
    }

    await fs.writeFile(filepath, content, 'utf-8');

    return {
      type: 'message',
      messageType: 'info',
      content: t('History exported to: {{path}}', { path: filepath }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('Failed to export history: {{error}}', {
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}

/**
 * Format input history for display
 */
function formatInputHistory(
  inputs: Array<{ text: string; timestamp?: string }>,
): string {
  if (inputs.length === 0) return '';

  return inputs
    .map((input, i) => {
      const num = inputs.length - i;
      const date = input.timestamp
        ? new Date(input.timestamp).toLocaleString()
        : '';
      return `${num}. ${date ? `[${date}] ` : ''}${input.text}`;
    })
    .join('\n');
}

/**
 * Format tool call history for display
 */
function formatToolCallHistory(
  tools: Array<{ name: string; args: unknown; timestamp?: string }>,
): string {
  if (tools.length === 0) return '';

  return tools
    .map((tool, i) => {
      const date = tool.timestamp
        ? new Date(tool.timestamp).toLocaleString()
        : '';
      return `${i + 1}. ${date ? `[${date}] ` : ''}${tool.name}(${JSON.stringify(tool.args)})`;
    })
    .join('\n');
}

/**
 * Format search results for display
 */
function formatSearchResults(
  results: Array<{ type: 'user' | 'model'; text: string; timestamp?: string }>,
  keyword: string,
): string {
  if (results.length === 0) return '';

  const header = t('Search results for "{{keyword}}" ({{count}} matches):\n', {
    keyword,
    count: String(results.length),
  });

  const formatted = results
    .map((result, i) => {
      const role = result.type === 'user' ? 'User' : 'Assistant';
      const date = result.timestamp
        ? new Date(result.timestamp).toLocaleString()
        : '';
      const preview =
        result.text.length > 100
          ? result.text.slice(0, 100) + '...'
          : result.text;
      return `${i + 1}. [${role}] ${date ? `[${date}] ` : ''}${preview}`;
    })
    .join('\n');

  return header + formatted;
}

export const historyCommand: SlashCommand = {
  name: 'history',
  altNames: ['h'],
  get description() {
    return t('View operation history');
  },
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<void | SlashCommandActionReturn> => {
    const parsed = parseArgs(args);
    const { subcommand, limit, since, until, keyword, format, output } = parsed;

    // Search functionality
    if (subcommand === 'search' && keyword) {
      const results = await searchHistory(context, keyword, limit);

      if (results.length === 0) {
        return {
          type: 'message',
          messageType: 'info',
          content: t('No matches found for "{{keyword}}".', { keyword }),
        };
      }

      return {
        type: 'message',
        messageType: 'info',
        content: formatSearchResults(results, keyword),
      };
    }

    // Export functionality
    if (subcommand === 'export') {
      return exportHistory(context, format || 'json', output);
    }

    // Default: show recent user inputs (with date range support)
    if (!subcommand || subcommand === 'input' || subcommand === 'inputs') {
      const inputs = await getInputHistory(context, limit, since, until);

      if (inputs.length === 0) {
        let msg = t('No input history found.');
        if (since || until) {
          msg += t(' Try adjusting the date range.');
        }
        return {
          type: 'message',
          messageType: 'info',
          content: msg,
        };
      }

      return {
        type: 'message',
        messageType: 'info',
        content: t('Recent input history:\n') + formatInputHistory(inputs),
      };
    }

    // Show tool call history (with date range support)
    if (subcommand === 'tool' || subcommand === 'tools') {
      const tools = await getToolCallHistory(context, limit, since, until);

      if (tools.length === 0) {
        let msg = t('No tool call history found.');
        if (since || until) {
          msg += t(' Try adjusting the date range.');
        }
        return {
          type: 'message',
          messageType: 'info',
          content: msg,
        };
      }

      return {
        type: 'message',
        messageType: 'info',
        content: t('Recent tool calls:\n') + formatToolCallHistory(tools),
      };
    }

    // Show debug log (with keyword filter support)
    if (
      subcommand === 'log' ||
      subcommand === 'logs' ||
      subcommand === 'debug'
    ) {
      const config = context.services.config;
      if (!config) {
        return {
          type: 'message',
          messageType: 'error',
          content: t('Config not loaded.'),
        };
      }

      const sessionId = config.getSessionId();
      const logContent = await getDebugLog(sessionId, limit, keyword);

      return {
        type: 'message',
        messageType: 'info',
        content: t('Recent debug log:\n') + '\n```\n' + logContent + '\n```',
      };
    }

    // List sessions
    if (subcommand === 'session' || subcommand === 'sessions') {
      return listSessions(context);
    }

    // Show help
    return {
      type: 'message',
      messageType: 'info',
      content: t(`History command usage:

Basic Commands:
  /history [input|inputs] [N]           - Show last N input messages (default: 20)
  /history tool|tools [N]               - Show last N tool calls (default: 20)
  /history log|logs|debug [N]           - Show last N lines of debug log (default: 50)
  /history session|sessions             - List available session files

Advanced Features:
  /history search <keyword> [-l N]      - Search history by keyword
  /history input --since 2026-01-01     - Filter by start date
  /history input --until 2026-03-25     - Filter by end date
  /history tools --since 2026-03-01     - Tool calls from date
  /history log --keyword "error"        - Filter log by keyword

Export:
  /history export                       - Export to JSON (default)
  /history export -f jsonl              - Export to JSONL
  /history export -f md                 - Export to Markdown
  /history export -f txt                - Export to plain text
  /history export -o myfile.json        - Export to specific file

Options:
  -l, --limit N      Number of items to show (default: 20)
  -s, --since DATE   Filter from date (YYYY-MM-DD)
  -u, --until DATE   Filter until date (YYYY-MM-DD)
  -k, --keyword WORD Search/filter by keyword
  -f, --format FMT   Export format (json, jsonl, md, txt)
  -o, --output FILE  Output file path

Examples:
  /history                        - Show recent 20 inputs
  /history input 10               - Show last 10 inputs
  /history input -l 50            - Show last 50 inputs
  /history input -s 2026-03-01    - Inputs since March 1st
  /history tools -l 30            - Show recent 30 tool calls
  /history search "bug" -l 20     - Search for "bug" in history
  /history log -k "error"         - Filter log for "error"
  /history export -f md           - Export to Markdown
  /history sessions               - List all session files`),
    };
  },
};
