import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { Storage } from 'ola-core';
import type { LoadedSettings } from '../config/settings.js';
import { runWithAcpRuntimeOutputDir } from './runtimeOutputDirContext.js';

describe('runWithAcpRuntimeOutputDir', () => {
  beforeEach(() => {
    Storage.setRuntimeBaseDir(null);
    delete process.env['OLA_RUNTIME_DIR'];
  });

  afterEach(() => {
    Storage.setRuntimeBaseDir(null);
    delete process.env['OLA_RUNTIME_DIR'];
  });

  it('uses the merged runtimeOutputDir relative to cwd within the async context', async () => {
    const cwd = path.resolve('workspace', 'project-a');
    const settings = {
      merged: {
        advanced: {
          runtimeOutputDir: '.ola-runtime',
        },
      },
    } as LoadedSettings;

    await runWithAcpRuntimeOutputDir(settings, cwd, async () => {
      expect(Storage.getRuntimeBaseDir()).toBe(path.join(cwd, '.ola-runtime'));
    });

    expect(Storage.getRuntimeBaseDir()).toBe(Storage.getGlobalOlaDir());
  });
});
