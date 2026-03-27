/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { type AuthType } from 'ola-core';

export interface OlaAuthState {
  deviceAuth: null;
  authStatus: 'idle' | 'success' | 'error';
  authMessage: string | null;
}

export const useOlaAuth = (
  _pendingAuthType: AuthType | undefined,
  _isAuthenticating: boolean,
) => {
  const [olaAuthState, setOlaAuthState] = useState<OlaAuthState>({
    deviceAuth: null,
    authStatus: 'idle',
    authMessage: null,
  });

  const cancelOlaAuth = useCallback(() => {
    setOlaAuthState({
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
    });
  }, []);

  return {
    olaAuthState,
    cancelOlaAuth,
  };
};
