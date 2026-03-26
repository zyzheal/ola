/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn, execSync as cpExecSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createDebugLogger } from 'ola-core';

const debugLogger = createDebugLogger('LOCAL_REPO_UPDATE');

export interface LocalRepoUpdateOptions {
  projectRoot: string;
  branch?: string;
  remote?: string;
}

export interface LocalRepoUpdateResult {
  success: boolean;
  message: string;
  updatedFrom?: string;
  updatedTo?: string;
}

/**
 * Check if the project is a local git repository
 */
export function isLocalGitRepo(projectRoot: string): boolean {
  try {
    const gitDir = path.join(projectRoot, '.git');
    return fs.existsSync(gitDir);
  } catch (_error) {
    return false;
  }
}

/**
 * Get current git branch
 */
function getCurrentBranch(projectRoot: string): string {
  try {
    const result = cpExecSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return result.trim();
  } catch (error) {
    debugLogger.error('Failed to get current branch:', error);
    return 'main';
  }
}

/**
 * Get current git commit hash
 */
function getCurrentCommit(projectRoot: string): string {
  try {
    const result = cpExecSync('git rev-parse HEAD', {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return result.trim();
  } catch (error) {
    debugLogger.error('Failed to get current commit:', error);
    return 'unknown';
  }
}

/**
 * Get latest commit hash from remote
 */
function getLatestRemoteCommit(
  remote: string,
  branch: string,
  projectRoot: string,
): string {
  try {
    const result = cpExecSync(`git ls-remote ${remote} ${branch}`, {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return result.split('\t')[0] || 'unknown';
  } catch (error) {
    debugLogger.error('Failed to get remote commit:', error);
    return 'unknown';
  }
}

/**
 * Execute git command asynchronously with event emission
 */
export function updateFromLocalRepo(
  options: LocalRepoUpdateOptions,
  onProgress?: (message: string) => void,
  onComplete?: (result: LocalRepoUpdateResult) => void,
): void {
  const { projectRoot, branch = 'main', remote = 'origin' } = options;

  if (!isLocalGitRepo(projectRoot)) {
    onComplete?.({
      success: false,
      message: 'Not a git repository. Cannot update from local repo.',
    });
    return;
  }

  const currentBranch = getCurrentBranch(projectRoot);
  const currentCommit = getCurrentCommit(projectRoot);

  debugLogger.info(
    `Current branch: ${currentBranch}, commit: ${currentCommit}`,
  );

  // Report current status
  onProgress?.(
    `Current version: ${currentCommit.slice(0, 7)} (${currentBranch})`,
  );

  // Step 1: Fetch latest from remote
  onProgress?.('Fetching latest changes from remote...');

  const fetchProcess = spawn('git', ['fetch', remote, branch], {
    cwd: projectRoot,
    stdio: 'pipe',
  });

  let fetchError = '';
  fetchProcess.stderr.on('data', (data) => {
    fetchError += data.toString();
    debugLogger.debug('Fetch stderr:', data.toString());
  });

  fetchProcess.on('close', (fetchCode) => {
    if (fetchCode !== 0) {
      onComplete?.({
        success: false,
        message: `Failed to fetch from remote: ${fetchError}`,
      });
      return;
    }

    // Step 2: Check if update is needed
    const latestCommit = getLatestRemoteCommit(remote, branch, projectRoot);

    if (currentCommit === latestCommit) {
      onComplete?.({
        success: true,
        message: 'Already up to date!',
        updatedFrom: currentCommit.slice(0, 7),
        updatedTo: latestCommit.slice(0, 7),
      });
      return;
    }

    onProgress?.(
      `Update available: ${currentCommit.slice(0, 7)} → ${latestCommit.slice(0, 7)}`,
    );

    // Step 3: Reset local changes
    onProgress?.('Resetting local changes...');

    const resetProcess = spawn(
      'git',
      ['reset', '--hard', `${remote}/${branch}`],
      {
        cwd: projectRoot,
        stdio: 'pipe',
      },
    );

    let resetError = '';
    resetProcess.stderr.on('data', (data) => {
      resetError += data.toString();
      debugLogger.debug('Reset stderr:', data.toString());
    });

    resetProcess.on('close', (resetCode) => {
      if (resetCode !== 0) {
        onComplete?.({
          success: false,
          message: `Failed to reset local changes: ${resetError}`,
        });
        return;
      }

      // Step 4: Clean untracked files
      onProgress?.('Cleaning untracked files...');

      const cleanProcess = spawn('git', ['clean', '-fd'], {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      let cleanError = '';
      cleanProcess.stderr.on('data', (data) => {
        cleanError += data.toString();
        debugLogger.debug('Clean stderr:', data.toString());
      });

      cleanProcess.on('close', (cleanCode) => {
        if (cleanCode !== 0) {
          onComplete?.({
            success: false,
            message: `Failed to clean untracked files: ${cleanError}`,
          });
          return;
        }

        // Step 5: Rebuild
        onProgress?.('Building project...');

        const buildProcess = spawn('npm', ['run', 'build'], {
          cwd: projectRoot,
          stdio: 'pipe',
          shell: process.platform === 'win32',
        });

        let buildError = '';
        buildProcess.stderr.on('data', (data) => {
          buildError += data.toString();
          debugLogger.debug('Build stderr:', data.toString());
        });

        buildProcess.on('close', (buildCode) => {
          if (buildCode !== 0) {
            onComplete?.({
              success: false,
              message: `Failed to build project: ${buildError}`,
            });
            return;
          }

          // Success!
          onProgress?.('Update complete!');

          onComplete?.({
            success: true,
            message: `Successfully updated from ${currentCommit.slice(0, 7)} to ${latestCommit.slice(0, 7)}`,
            updatedFrom: currentCommit.slice(0, 7),
            updatedTo: latestCommit.slice(0, 7),
          });
        });

        buildProcess.on('error', (err) => {
          onComplete?.({
            success: false,
            message: `Build process error: ${err.message}`,
          });
        });
      });

      cleanProcess.on('error', (err) => {
        onComplete?.({
          success: false,
          message: `Clean process error: ${err.message}`,
        });
      });
    });

    resetProcess.on('error', (err) => {
      onComplete?.({
        success: false,
        message: `Reset process error: ${err.message}`,
      });
    });
  });

  fetchProcess.on('error', (err) => {
    onComplete?.({
      success: false,
      message: `Fetch process error: ${err.message}`,
    });
  });
}

/**
 * Synchronous version for simple update check
 */
export function checkForLocalRepoUpdate(
  projectRoot: string,
  branch: string = 'main',
  remote: string = 'origin',
): { hasUpdate: boolean; currentCommit: string; latestCommit: string } {
  if (!isLocalGitRepo(projectRoot)) {
    return {
      hasUpdate: false,
      currentCommit: 'unknown',
      latestCommit: 'unknown',
    };
  }

  const currentCommit = getCurrentCommit(projectRoot);
  const latestCommit = getLatestRemoteCommit(remote, branch, projectRoot);

  return {
    hasUpdate: currentCommit !== latestCommit,
    currentCommit: currentCommit.slice(0, 7),
    latestCommit: latestCommit.slice(0, 7),
  };
}
