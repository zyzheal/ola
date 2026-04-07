/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UpdateInfo } from 'update-notifier';
import updateNotifier from 'update-notifier';
import semver from 'semver';
import * as path from 'node:path';
import { getPackageJson } from '../../utils/package.js';
import { createDebugLogger } from 'ola-core';
import * as childProcess from 'node:child_process';

const debugLogger = createDebugLogger('UPDATE_CHECK');

export const FETCH_TIMEOUT_MS = 2000;

// Type for custom notifier options with registry support
interface CustomNotifierOptions {
  pkg: { name: string; version: string };
  updateCheckInterval: number;
  shouldNotifyInNpmScript: boolean;
  distTag: 'latest' | 'nightly';
  npmRegistry: string;
}

/**
 * Get NPM registry URL (supports custom private registry)
 */
function getNpmRegistry(): string {
  // Priority: Environment variable > npm config > default
  if (process.env['OLA_NPM_REGISTRY']) {
    return process.env['OLA_NPM_REGISTRY'];
  }

  if (process.env['NPM_CONFIG_REGISTRY']) {
    return process.env['NPM_CONFIG_REGISTRY'];
  }

  try {
    // Try to get registry from npm config
    const result = childProcess.execSync('npm config get registry', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const registry = result.trim();
    if (registry && registry !== 'undefined') {
      return registry;
    }
  } catch (_error) {
    // Ignore error and use default
  }

  // Default to public npm registry
  return 'https://registry.npmjs.org';
}

/**
 * Get package name from environment or package.json
 */
function getPackageName(): string {
  if (process.env['OLA_PACKAGE_NAME']) {
    return process.env['OLA_PACKAGE_NAME'];
  }
  return 'ola';
}

export interface UpdateObject {
  message: string;
  update: UpdateInfo;
}

/**
 * From a nightly and stable update, determines which is the "best" one to offer.
 * The rule is to always prefer nightly if the base versions are the same.
 */
function getBestAvailableUpdate(
  nightly?: UpdateInfo,
  stable?: UpdateInfo,
): UpdateInfo | null {
  if (!nightly) return stable || null;
  if (!stable) return nightly || null;

  const nightlyVer = nightly.latest;
  const stableVer = stable.latest;

  if (
    semver.coerce(stableVer)?.version === semver.coerce(nightlyVer)?.version
  ) {
    return nightly;
  }

  return semver.gt(stableVer, nightlyVer) ? stable : nightly;
}

export async function checkForUpdates(): Promise<UpdateObject | null> {
  try {
    // Skip update check when running from source (development mode)
    // Always skip in development/local builds
    if (
      process.env['DEV'] === 'true' ||
      process.env['NODE_ENV'] === 'development'
    ) {
      debugLogger.info('Skipping update check in development mode');
      return null;
    }
    const packageJson = await getPackageJson();
    if (!packageJson || !packageJson.name || !packageJson.version) {
      return null;
    }

    // Skip update check for local development versions
    // Check if this is a locally linked package (npm link)
    const pkgJson = packageJson as Record<string, unknown>;
    const fromField = pkgJson['_from'] as string | undefined;
    const resolvedField = pkgJson['_resolved'] as string | undefined;

    if (fromField?.includes('file:') || resolvedField?.includes('file:')) {
      debugLogger.info('Skipping update check for locally linked package');
      return null;
    }

    // Check if ola itself is running from a local git repository
    // Only check for updates if ola is installed from git, not for user's project
    // Skip git check in test environment
    if (!process.env['VITEST'] && !process.env['TEST']) {
      try {
        const olaPackageDir = path.dirname(path.dirname(__dirname));
        const olaGitDir = childProcess
          .execSync('git rev-parse --git-dir', {
            cwd: olaPackageDir,
            encoding: 'utf8',
            stdio: 'pipe',
            env: {
              GIT_ASKPASS: 'echo',
              GIT_TERMINAL_PROMPT: '0',
              GIT_CONFIG_NOSYSTEM: '1',
            },
          })
          .trim();

        if (olaGitDir) {
          // Verify this is the ola repository by checking the remote URL
          const remoteUrl = childProcess
            .execSync('git remote get-url origin', {
              cwd: olaPackageDir,
              encoding: 'utf8',
              stdio: 'pipe',
              env: {
                GIT_ASKPASS: 'echo',
                GIT_TERMINAL_PROMPT: '0',
                GIT_CONFIG_NOSYSTEM: '1',
              },
            })
            .trim()
            .toLowerCase();

          // Only check for git updates if this is the ola/qwen-code repository
          const isOlaRepo =
            remoteUrl.includes('zyzheal/ola') ||
            remoteUrl.includes('qwen-code');

          if (isOlaRepo) {
            const gitUpdate = checkForLocalRepoUpdate(
              packageJson.version,
              olaPackageDir,
            );
            if (gitUpdate) {
              return gitUpdate;
            }
            // If git check returned null (no update), skip npm check
            // If git check returned undefined (failed), continue to npm check
            if (gitUpdate === null) {
              return null;
            }
            // gitUpdate === undefined, continue to npm check
          }
        }
      } catch (e) {
        // Not a git repository or no origin remote, continue with npm update check
        debugLogger.debug(
          'Not running from ola git repo, continuing with npm update check: ' +
            (e instanceof Error ? e.message : e),
        );
      }
    }

    const { version: currentVersion } = packageJson;
    const isNightly = currentVersion.includes('nightly');

    // Use custom registry and package name for private NPM registry
    const registry = getNpmRegistry();
    const packageName = getPackageName();

    debugLogger.info(`Using registry: ${registry}, package: ${packageName}`);

    const createNotifier = (distTag: 'latest' | 'nightly') =>
      updateNotifier({
        pkg: {
          name: packageName,
          version: currentVersion,
        },
        updateCheckInterval: 0,
        shouldNotifyInNpmScript: true,
        distTag,
        npmRegistry: registry,
      } as CustomNotifierOptions);

    if (isNightly) {
      const [nightlyUpdateInfo, latestUpdateInfo] = await Promise.all([
        createNotifier('nightly').fetchInfo(),
        createNotifier('latest').fetchInfo(),
      ]);

      const bestUpdate = getBestAvailableUpdate(
        nightlyUpdateInfo,
        latestUpdateInfo,
      );

      if (bestUpdate && semver.gt(bestUpdate.latest, currentVersion)) {
        const message = `A new version of OLA is available! ${currentVersion} → ${bestUpdate.latest}`;
        return {
          message,
          update: { ...bestUpdate, current: currentVersion },
        };
      }
    } else {
      const updateInfo = await createNotifier('latest').fetchInfo();

      if (updateInfo && semver.gt(updateInfo.latest, currentVersion)) {
        const message = `OLA update available! ${currentVersion} → ${updateInfo.latest}`;
        return {
          message,
          update: { ...updateInfo, current: currentVersion },
        };
      }
    }

    return null;
  } catch (e) {
    debugLogger.warn('Failed to check for updates: ' + e);
    return null;
  }
}

/**
 * Check for updates in local git repository
 * @param currentVersion - Current version string
 * @param repoDir - Optional directory to check (defaults to current working directory)
 * @returns UpdateObject if update available, null if no update, undefined if check failed
 */
function checkForLocalRepoUpdate(
  currentVersion: string,
  repoDir?: string,
): UpdateObject | null | undefined {
  try {
    const cwd = repoDir || process.cwd();

    // Get current commit hash
    const currentCommit = childProcess
      .execSync('git rev-parse HEAD', {
        cwd,
        encoding: 'utf8',
        env: {
          GIT_ASKPASS: 'echo',
          GIT_TERMINAL_PROMPT: '0',
          GIT_CONFIG_NOSYSTEM: '1',
        },
      })
      .trim();

    // Get current branch
    const branch = childProcess
      .execSync('git rev-parse --abbrev-ref HEAD', {
        cwd,
        encoding: 'utf8',
        env: {
          GIT_ASKPASS: 'echo',
          GIT_TERMINAL_PROMPT: '0',
          GIT_CONFIG_NOSYSTEM: '1',
        },
      })
      .trim();

    // Fetch latest from origin with timeout to avoid hanging on authentication prompts
    try {
      childProcess.execSync('git fetch origin', {
        cwd,
        stdio: 'ignore',
        timeout: 5000, // 5 second timeout
        env: {
          GIT_ASKPASS: 'echo',
          GIT_TERMINAL_PROMPT: '0',
          GIT_CONFIG_NOSYSTEM: '1',
        },
      });
    } catch (fetchError) {
      debugLogger.warn(
        'Git fetch failed or timed out, skipping remote update check: ' +
          fetchError,
      );
      // If fetch fails (e.g., due to auth required or network issue), return undefined to indicate check failed
      return undefined;
    }

    // Get latest remote commit
    const latestCommit = childProcess
      .execSync(`git rev-parse origin/${branch}`, {
        cwd,
        encoding: 'utf8',
        env: {
          GIT_ASKPASS: 'echo',
          GIT_TERMINAL_PROMPT: '0',
          GIT_CONFIG_NOSYSTEM: '1',
        },
      })
      .trim();

    debugLogger.info(
      `Local commit: ${currentCommit}, Remote commit: ${latestCommit}`,
    );

    if (currentCommit !== latestCommit) {
      return {
        message: `Repository update available! (${currentCommit.slice(0, 7)} → ${latestCommit.slice(0, 7)})`,
        update: {
          current: currentVersion,
          latest: `${currentVersion}+${latestCommit.slice(0, 7)}`,
          name: 'ola',
          type: 'latest' as const,
        },
      };
    }

    return null;
  } catch (e) {
    debugLogger.warn('Failed to check local repo update: ' + e);
    return undefined;
  }
}
