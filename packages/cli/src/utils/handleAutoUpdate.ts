/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UpdateObject } from '../ui/utils/updateCheck.js';
import type { LoadedSettings } from '../config/settings.js';
import { getInstallationInfo } from './installationInfo.js';
import { updateEventEmitter } from './updateEventEmitter.js';
import type { HistoryItem } from '../ui/types.js';
import { MessageType } from '../ui/types.js';
import { spawnWrapper } from './spawnWrapper.js';
import type { spawn } from 'node:child_process';
import os from 'node:os';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDebugLogger } from 'ola-core';
import * as path from 'node:path';

const debugLogger = createDebugLogger('HANDLE_AUTO_UPDATE');

/**
 * Check if ola itself is running from a local git repository
 * Only check for updates if ola is installed from git, not for user's project
 */
function isOlaGitRepo(): boolean {
  try {
    // In ESM, use import.meta.url instead of __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Walk up to find .git directory
    let currentDir = __dirname;
    for (let i = 0; i < 5; i++) {
      const gitDir = path.join(currentDir, '.git');
      if (fs.existsSync(gitDir)) {
        return true;
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
    return false;
  } catch (_error) {
    return false;
  }
}

export function handleAutoUpdate(
  info: UpdateObject | null,
  settings: LoadedSettings,
  projectRoot: string,
  spawnFn: typeof spawn = spawnWrapper,
) {
  if (!info) {
    return;
  }

  // Skip auto-update in development/local mode
  if (
    process.env['DEV'] === 'true' ||
    process.env['NODE_ENV'] === 'development' ||
    process.env['OLA_LOCAL_DEV'] === 'true'
  ) {
    return;
  }

  // Skip auto-update for git repository installations
  // Git-based installations should be updated manually with "git pull"
  if (isOlaGitRepo()) {
    debugLogger.debug(
      'Git repository installation detected. Skipping auto-update.',
    );
    return;
  }

  // enableAutoUpdate is checked in gemini.tsx before calling this function,
  // so if we get here, auto-update is enabled (or undefined, which defaults to enabled).
  const isAutoUpdateEnabled =
    settings.merged.general?.enableAutoUpdate !== false;

  const installationInfo = getInstallationInfo(
    projectRoot,
    isAutoUpdateEnabled,
  );

  let combinedMessage = info.message;
  if (installationInfo.updateMessage) {
    combinedMessage += `\n${installationInfo.updateMessage}`;
  }

  updateEventEmitter.emit('update-received', {
    message: combinedMessage,
  });

  // Don't automatically run the update if auto-update is disabled or no update command
  if (!installationInfo.updateCommand || !isAutoUpdateEnabled) {
    return;
  }
  const isNightly = info.update.latest.includes('nightly');

  const updateCommand = installationInfo.updateCommand.replace(
    '@latest',
    isNightly ? '@nightly' : `@${info.update.latest}`,
  );
  const isWindows = os.platform() === 'win32';
  const shell = isWindows ? 'cmd.exe' : 'bash';
  const shellArgs = isWindows ? ['/c', updateCommand] : ['-c', updateCommand];
  const updateProcess = spawnFn(shell, shellArgs, { stdio: 'pipe' });
  let errorOutput = '';
  updateProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  updateProcess.on('close', (code) => {
    if (code === 0) {
      updateEventEmitter.emit('update-success', {
        message:
          'Update successful! The new version will be used on your next run.',
      });
    } else {
      updateEventEmitter.emit('update-failed', {
        message: `Automatic update failed. Please try updating manually. (command: ${updateCommand}, stderr: ${errorOutput.trim()})`,
      });
    }
  });

  updateProcess.on('error', (err) => {
    updateEventEmitter.emit('update-failed', {
      message: `Automatic update failed. Please try updating manually. (error: ${err.message})`,
    });
  });
  return updateProcess;
}

export function setUpdateHandler(
  addItem: (item: Omit<HistoryItem, 'id'>, timestamp: number) => void,
  setUpdateInfo: (info: UpdateObject | null) => void,
) {
  let successfullyInstalled = false;
  const handleUpdateRecieved = (info: UpdateObject) => {
    setUpdateInfo(info);
    const savedMessage = info.message;
    setTimeout(() => {
      if (!successfullyInstalled) {
        addItem(
          {
            type: MessageType.INFO,
            text: savedMessage,
          },
          Date.now(),
        );
      }
      setUpdateInfo(null);
    }, 60000);
  };

  const handleUpdateFailed = () => {
    setUpdateInfo(null);
    addItem(
      {
        type: MessageType.ERROR,
        text: `Automatic update failed. Please try updating manually`,
      },
      Date.now(),
    );
  };

  const handleUpdateSuccess = () => {
    successfullyInstalled = true;
    setUpdateInfo(null);
    addItem(
      {
        type: MessageType.INFO,
        text: `Update successful! The new version will be used on your next run.`,
      },
      Date.now(),
    );
  };

  const handleUpdateInfo = (data: { message: string }) => {
    addItem(
      {
        type: MessageType.INFO,
        text: data.message,
      },
      Date.now(),
    );
  };

  updateEventEmitter.on('update-received', handleUpdateRecieved);
  updateEventEmitter.on('update-failed', handleUpdateFailed);
  updateEventEmitter.on('update-success', handleUpdateSuccess);
  updateEventEmitter.on('update-info', handleUpdateInfo);

  return () => {
    updateEventEmitter.off('update-received', handleUpdateRecieved);
    updateEventEmitter.off('update-failed', handleUpdateFailed);
    updateEventEmitter.off('update-success', handleUpdateSuccess);
    updateEventEmitter.off('update-info', handleUpdateInfo);
  };
}
