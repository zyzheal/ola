/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import type { Config } from 'ola-core';
import type { LoadedSettings } from '../../config/settings.js';

export interface CodingPlanUpdateRequest {
  prompt: string;
  onConfirm: (confirmed: boolean) => void;
}

/**
 * Hook for detecting and handling Coding Plan template updates.
 * Compares the persisted version with the current template version
 * and prompts the user to update if they differ.
 */
export function useCodingPlanUpdates(
  settings: LoadedSettings,
  config: Config,
  addItem: (
    item: { type: 'info' | 'error' | 'warning'; text: string },
    timestamp: number,
  ) => void,
) {
  const [updateRequest, setUpdateRequest] = useState<
    CodingPlanUpdateRequest | undefined
  >();

  /**
   * Check for version mismatch and prompt user for update if needed.
   * Uses the region from settings.codingPlan.region (defaults to CHINA if not set).
   *
   * Note: Update check is disabled for local deployment.
   */
  const checkForUpdates = useCallback(() => {
    // Disabled for local deployment - no remote update checks
  }, []);

  // Check for updates on mount
  useEffect(() => {
    // Disabled in development to avoid blocking the UI
    if (process.env['NODE_ENV'] === 'development') {
      return;
    }
    checkForUpdates();
  }, [checkForUpdates]);

  const dismissCodingPlanUpdate = useCallback(() => {
    setUpdateRequest(undefined);
  }, []);

  return {
    codingPlanUpdateRequest: updateRequest,
    dismissCodingPlanUpdate,
  };
}
