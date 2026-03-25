/**
 * @license
 * Copyright 2025 OLA Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

describe('Dangerous Command Detection', () => {
  // Simulate the detection logic from ToolConfirmationMessage.tsx
  const isDangerousCommand = (
    command: string,
    rootCommand: string,
  ): boolean => {
    const dangerousCommands = [
      'rm',
      'mv',
      'delete',
      'del',
      'rmdir',
      'rm -rf',
      'rm -r',
      'rm -f',
    ];
    return dangerousCommands.some(
      (cmd) =>
        rootCommand.startsWith(cmd) ||
        command.includes(` ${cmd} `) ||
        command.includes(` ${cmd} -`) ||
        command.startsWith(`${cmd} `),
    );
  };

  describe('Dangerous commands', () => {
    const dangerousCases = [
      { command: 'rm /tmp/test.txt', rootCommand: 'rm' },
      { command: 'rm -rf /tmp/test', rootCommand: 'rm' },
      { command: 'rm -r /tmp/test', rootCommand: 'rm' },
      { command: 'rm -f /tmp/test', rootCommand: 'rm' },
      { command: 'mv /tmp/a /tmp/b', rootCommand: 'mv' },
      { command: 'delete C:\\temp\\test.txt', rootCommand: 'delete' },
      { command: 'del C:\\temp\\test.txt', rootCommand: 'del' },
      { command: 'rmdir /tmp/test', rootCommand: 'rmdir' },
    ];

    it.each(dangerousCases)(
      'should detect "$command" as dangerous',
      ({ command, rootCommand }) => {
        expect(isDangerousCommand(command, rootCommand)).toBe(true);
      },
    );
  });

  describe('Safe commands', () => {
    const safeCases = [
      { command: 'ls -la', rootCommand: 'ls' },
      { command: 'cat /tmp/test.txt', rootCommand: 'cat' },
      { command: 'grep "pattern" file.txt', rootCommand: 'grep' },
      { command: 'find . -name "*.ts"', rootCommand: 'find' },
      { command: 'pwd', rootCommand: 'pwd' },
      { command: 'echo "hello"', rootCommand: 'echo' },
      { command: 'cd /tmp', rootCommand: 'cd' },
    ];

    it.each(safeCases)(
      'should not detect "$command" as dangerous',
      ({ command, rootCommand }) => {
        expect(isDangerousCommand(command, rootCommand)).toBe(false);
      },
    );
  });
});
