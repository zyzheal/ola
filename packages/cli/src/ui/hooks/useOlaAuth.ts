/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  AuthType,
  qwenOAuth2Events,
  OlaOAuth2Event,
  type DeviceAuthorizationData,
} from 'ola-core';

export interface OlaAuthState {
  deviceAuth: DeviceAuthorizationData | null;
  authStatus:
    | 'idle'
    | 'polling'
    | 'success'
    | 'error'
    | 'timeout'
    | 'rate_limit';
  authMessage: string | null;
}

export const useOlaAuth = (
  pendingAuthType: AuthType | undefined,
  isAuthenticating: boolean,
) => {
  const [olaAuthState, setOlaAuthState] = useState<OlaAuthState>({
    deviceAuth: null,
    authStatus: 'idle',
    authMessage: null,
  });

  const isOlaAuth = pendingAuthType === AuthType.OLA_OAUTH;

  // Set up event listeners when authentication starts
  useEffect(() => {
    if (!isOlaAuth || !isAuthenticating) {
      // Reset state when not authenticating or not Qwen auth
      setOlaAuthState({
        deviceAuth: null,
        authStatus: 'idle',
        authMessage: null,
      });
      return;
    }

    setOlaAuthState((prev) => ({
      ...prev,
      authStatus: 'idle',
    }));

    // Set up event listeners
    const handleDeviceAuth = (deviceAuth: DeviceAuthorizationData) => {
      setOlaAuthState((prev) => ({
        ...prev,
        deviceAuth: {
          verification_uri: deviceAuth.verification_uri,
          verification_uri_complete: deviceAuth.verification_uri_complete,
          user_code: deviceAuth.user_code,
          expires_in: deviceAuth.expires_in,
          device_code: deviceAuth.device_code,
        },
        authStatus: 'polling',
      }));
    };

    const handleAuthProgress = (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => {
      setOlaAuthState((prev) => ({
        ...prev,
        authStatus: status,
        authMessage: message || null,
      }));
    };

    // Add event listeners
    qwenOAuth2Events.on(OlaOAuth2Event.AuthUri, handleDeviceAuth);
    qwenOAuth2Events.on(OlaOAuth2Event.AuthProgress, handleAuthProgress);

    // Cleanup event listeners when component unmounts or auth finishes
    return () => {
      qwenOAuth2Events.off(OlaOAuth2Event.AuthUri, handleDeviceAuth);
      qwenOAuth2Events.off(OlaOAuth2Event.AuthProgress, handleAuthProgress);
    };
  }, [isOlaAuth, isAuthenticating]);

  const cancelOlaAuth = useCallback(() => {
    // Emit cancel event to stop polling
    qwenOAuth2Events.emit(OlaOAuth2Event.AuthCancel);

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
