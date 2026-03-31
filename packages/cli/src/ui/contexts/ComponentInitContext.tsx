/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview ComponentInitContext — tracks UI component initialization status.
 *
 * Provides visibility into which components have initialized during startup,
 * helping users diagnose rendering issues and understand the UI state.
 */

import React from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';

// ─── Types ──────────────────────────────────────────────────

export type InitStatus = 'pending' | 'initializing' | 'success' | 'error';

export interface ComponentInitState {
  name: string;
  status: InitStatus;
  error?: string;
  timestamp: number;
}

export interface ComponentInitContextValue {
  components: Map<string, ComponentInitState>;
  registerComponent: (name: string) => void;
  markInitializing: (name: string) => void;
  markSuccess: (name: string) => void;
  markError: (name: string, error: string) => void;
  unregisterComponent: (name: string) => void;
  allInitialized: boolean;
  hasErrors: boolean;
}

// ─── Context ────────────────────────────────────────────────

const ComponentInitContext = createContext<ComponentInitContextValue | null>(
  null,
);

// ─── Provider ───────────────────────────────────────────────

interface ComponentInitProviderProps {
  children: React.ReactNode;
  _autoHideDelay?: number;
}

export const ComponentInitProvider: React.FC<ComponentInitProviderProps> = ({
  children,
  _autoHideDelay,
}) => {
  const [components, setComponents] = useState<Map<string, ComponentInitState>>(
    () => new Map(),
  );
  const [allInitialized, setAllInitialized] = useState(false);

  const registerComponent = useCallback((name: string) => {
    setComponents((prev) => {
      if (prev.has(name)) return prev;
      const next = new Map(prev);
      next.set(name, {
        name,
        status: 'pending',
        timestamp: Date.now(),
      });
      return next;
    });
  }, []);

  const markInitializing = useCallback((name: string) => {
    setComponents((prev) => {
      const next = new Map(prev);
      const existing = next.get(name);
      if (existing) {
        next.set(name, {
          ...existing,
          status: 'initializing',
          timestamp: Date.now(),
        });
      }
      return next;
    });
  }, []);

  const markSuccess = useCallback((name: string) => {
    setComponents((prev) => {
      const next = new Map(prev);
      const existing = next.get(name);
      if (existing) {
        next.set(name, {
          ...existing,
          status: 'success',
          timestamp: Date.now(),
        });
      }
      return next;
    });
  }, []);

  const markError = useCallback((name: string, error: string) => {
    setComponents((prev) => {
      const next = new Map(prev);
      const existing = next.get(name);
      if (existing) {
        next.set(name, {
          ...existing,
          status: 'error',
          error,
          timestamp: Date.now(),
        });
      }
      return next;
    });
  }, []);

  const unregisterComponent = useCallback((name: string) => {
    setComponents((prev) => {
      const next = new Map(prev);
      next.delete(name);
      return next;
    });
  }, []);

  // Check if all components are initialized
  useEffect(() => {
    const allSuccess = [...components.values()].every(
      (c) => c.status === 'success' || c.status === 'error',
    );
    setAllInitialized(allSuccess);
  }, [components]);

  const value: ComponentInitContextValue = {
    components,
    registerComponent,
    markInitializing,
    markSuccess,
    markError,
    unregisterComponent,
    allInitialized,
    hasErrors: [...components.values()].some((c) => c.status === 'error'),
  };

  return (
    <ComponentInitContext.Provider value={value}>
      {children}
    </ComponentInitContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────

export const useComponentInit = (componentName: string) => {
  const context = useContext(ComponentInitContext);

  if (!context) {
    throw new Error(
      'useComponentInit must be used within a ComponentInitProvider',
    );
  }

  const {
    registerComponent,
    markInitializing,
    markSuccess,
    markError,
    unregisterComponent,
  } = context;

  // Register on mount
  useEffect(() => {
    registerComponent(componentName);
    markInitializing(componentName);

    return () => {
      unregisterComponent(componentName);
    };
  }, [componentName, registerComponent, markInitializing, unregisterComponent]);

  return {
    markSuccess: useCallback(
      () => markSuccess(componentName),
      [markSuccess, componentName],
    ),
    markError: useCallback(
      (error: string) => markError(componentName, error),
      [markError, componentName],
    ),
  };
};

// ─── Status Display Component ───────────────────────────────

const ComponentInitStatusDisplayComponent: React.FC = () => {
  const context = useContext(ComponentInitContext);

  if (!context) return null;

  const { components, allInitialized, hasErrors } = context;

  // Always show initialization status - no auto-hide

  // Don't render if no components registered yet or all initialized with no errors
  if (components.size === 0 || (allInitialized && !hasErrors)) {
    return null;
  }

  const getStatusIcon = (status: InitStatus): string => {
    switch (status) {
      case 'pending':
        return '○';
      case 'initializing':
        return '◐';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: InitStatus): string => {
    switch (status) {
      case 'pending':
        return theme.text.secondary;
      case 'initializing':
        return theme.status.warning;
      case 'success':
        return theme.status.success;
      case 'error':
        return theme.status.error;
      default:
        return theme.text.secondary;
    }
  };

  const sortedComponents = [...components.values()].sort((a, b) => {
    // Sort by status priority: error > initializing > pending > success
    const statusPriority: Record<InitStatus, number> = {
      error: 0,
      initializing: 1,
      pending: 2,
      success: 3,
    };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={hasErrors ? theme.status.error : theme.status.success}
      paddingX={1}
      marginX={2}
      marginBottom={1}
      width="100%"
    >
      {/* Only show title when all components are initialized */}
      {allInitialized && (
        <Text
          bold
          color={hasErrors ? theme.status.error : theme.status.success}
          wrap="wrap"
        >
          {hasErrors
            ? '⚠ Initialization completed with errors'
            : '✓ All components initialized'}
        </Text>
      )}
      {sortedComponents.map((component) => (
        <Box key={component.name} flexDirection="row">
          <Text> </Text>
          <Text color={getStatusColor(component.status)}>
            {getStatusIcon(component.status)}
          </Text>
          <Text> </Text>
          <Text
            color={
              component.status === 'success'
                ? theme.text.secondary
                : theme.text.primary
            }
            wrap="wrap"
          >
            {component.name}
          </Text>
          {component.status === 'initializing' && (
            <Text color={theme.status.warning} wrap="wrap">
              {' '}
              loading...
            </Text>
          )}
          {component.status === 'error' && (
            <Text color={theme.status.error} wrap="wrap">
              {' '}
              - {component.error}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

export const ComponentInitStatusDisplay = React.memo(
  ComponentInitStatusDisplayComponent,
);

export { ComponentInitContext };
