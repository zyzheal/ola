/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { AuthType } from 'ola-core';
import { Box, Text } from 'ink';
import Link from 'ink-link';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { DescriptiveRadioButtonSelect } from '../components/shared/DescriptiveRadioButtonSelect.js';
import { CustomApiKeyInput } from '../components/CustomApiKeyInput.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useUIActions } from '../contexts/UIActionsContext.js';
import { t } from '../../i18n/index.js';

// Main menu option type - only API_KEY is used now
type MainOption = 'API_KEY';

// View level for navigation
type ViewLevel = 'main' | 'custom-api-key-input';

export function AuthDialog(): React.JSX.Element {
  const { authError } = useUIState();
  const { handleAuthSelect, onAuthError } = useUIActions();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('main');

  // Main authentication entries (only API Key option)
  const mainItems = [
    {
      key: 'API_KEY',
      title: t('API Key'),
      label: t('API Key'),
      description: t('Enter your API key to authenticate'),
      value: 'API_KEY' as MainOption,
    },
  ];

  const initialAuthIndex = 0;

  const handleMainSelect = async (value: MainOption) => {
    setErrorMessage(null);
    onAuthError(null);

    // Only API_KEY option - navigate to custom API key input
    if (value === 'API_KEY') {
      setViewLevel('custom-api-key-input');
      return;
    }
  };

  const handleGoBack = () => {
    setErrorMessage(null);
    onAuthError(null);

    if (viewLevel === 'custom-api-key-input') {
      // Exit the dialog when pressing Esc from API key input
      handleAuthSelect(undefined);
    }
  };

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        // Handle Escape based on current view level
        if (viewLevel === 'custom-api-key-input') {
          handleGoBack();
          return;
        }

        // For main view, exit the dialog
        if (errorMessage) {
          return;
        }
        handleAuthSelect(undefined);
      }
    },
    { isActive: true },
  );

  // Render main auth selection
  const renderMainView = () => (
    <>
      <Box marginTop={1}>
        <DescriptiveRadioButtonSelect
          items={mainItems}
          initialIndex={initialAuthIndex}
          onSelect={handleMainSelect}
          itemGap={1}
        />
      </Box>
    </>
  );

  // Render custom API key input
  const renderCustomApiKeyInputView = () => (
    <Box marginTop={1}>
      <CustomApiKeyInput
        onSubmit={async (credentials) => {
          await handleAuthSelect(AuthType.USE_OPENAI, credentials);
        }}
        onCancel={handleGoBack}
      />
    </Box>
  );

  const getViewTitle = () => {
    switch (viewLevel) {
      case 'main':
      case 'custom-api-key-input':
        return t('Configure API Key');
      default:
        return t('Configure API Key');
    }
  };

  return (
    <Box
      borderStyle="single"
      borderColor={theme?.border?.default}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>{getViewTitle()}</Text>

      {viewLevel === 'main' && renderMainView()}
      {viewLevel === 'custom-api-key-input' && renderCustomApiKeyInputView()}

      {(authError || errorMessage) && (
        <Box marginTop={1}>
          <Text color={theme.status.error}>{authError || errorMessage}</Text>
        </Box>
      )}

      <Box marginY={1}>
        <Text color={theme.border.default}>{'\u2500'.repeat(80)}</Text>
      </Box>
      <Box>
        <Text color={theme.text.primary}>
          {t('Terms of Services and Privacy Notice')}:
        </Text>
      </Box>
      <Box>
        <Link
          url="https://your-org.github.io/ai-platform-docs/en/users/support/tos-privacy/"
          fallback={false}
        >
          <Text color={theme.text.secondary} underline>
            https://your-org.github.io/ai-platform-docs/en/users/support/tos-privacy/
          </Text>
        </Link>
      </Box>
    </Box>
  );
}
