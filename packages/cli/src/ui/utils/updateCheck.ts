/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UpdateInfo } from 'update-notifier';
import updateNotifier from 'update-notifier';
import semver from 'semver';
import { getPackageJson } from '../../utils/package.js';
import { createDebugLogger } from 'ola-core';
import * as childProcess from 'node:child_process';

const debugLogger = createDebugLogger('UPDATE_CHECK');

export const FETCH_TIMEOUT_MS = 2000;

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

    // Check if this is a local git repository
    const gitDir = childProcess
      .execSync('git rev-parse --git-dir', {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe',
      })
      .trim();

    if (gitDir) {
      return checkForLocalRepoUpdate(packageJson.version);
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

    const { name, version: currentVersion } = packageJson;
    const isNightly = currentVersion.includes('nightly');
    const createNotifier = (distTag: 'latest' | 'nightly') =>
      updateNotifier({
        pkg: {
          name,
          version: currentVersion,
        },
        updateCheckInterval: 0,
        shouldNotifyInNpmScript: true,
        distTag,
      });

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
        const message = `A new version of Qwen Code is available! ${currentVersion} → ${bestUpdate.latest}`;
        return {
          message,
          update: { ...bestUpdate, current: currentVersion },
        };
      }
    } else {
      const updateInfo = await createNotifier('latest').fetchInfo();

      if (updateInfo && semver.gt(updateInfo.latest, currentVersion)) {
        const message = `Qwen Code update available! ${currentVersion} → ${updateInfo.latest}`;
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
 */
function checkForLocalRepoUpdate(currentVersion: string): UpdateObject | null {
  try {
    const cwd = process.cwd();

    // Get current commit hash
    const currentCommit = childProcess
      .execSync('git rev-parse HEAD', { cwd, encoding: 'utf8' })
      .trim();

    // Get current branch
    const branch = childProcess
      .execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' })
      .trim();

    // Fetch latest from origin
    childProcess.execSync('git fetch origin', { cwd, stdio: 'ignore' });

    // Get latest remote commit
    const latestCommit = childProcess
      .execSync(`git rev-parse origin/${branch}`, { cwd, encoding: 'utf8' })
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
    return null;
  }
}
