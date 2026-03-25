/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from './shared/TextInput.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { t } from '../../i18n/index.js';
import type { OpenAICredentials } from '../contexts/UIActionsContext.js';

type InputStep = 'baseUrl' | 'apiKey' | 'model';

interface CustomApiKeyInputProps {
  onSubmit: (credentials: OpenAICredentials) => void;
  onCancel: () => void;
}

const STEPS: InputStep[] = ['baseUrl', 'apiKey', 'model'];

const STEP_LABELS: Record<InputStep, string> = {
  baseUrl: 'Base URL',
  apiKey: 'API Key',
  model: 'Model',
};

const STEP_PLACEHOLDERS: Record<InputStep, string> = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  model: 'gpt-4o',
};

export function CustomApiKeyInput({
  onSubmit,
  onCancel,
}: CustomApiKeyInputProps): React.JSX.Element {
  const [step, setStep] = useState<InputStep>('baseUrl');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = STEPS.indexOf(step);

  const currentValue =
    step === 'baseUrl' ? baseUrl : step === 'apiKey' ? apiKey : model;

  const setCurrentValue = (val: string) => {
    setError(null);
    if (step === 'baseUrl') setBaseUrl(val);
    else if (step === 'apiKey') setApiKey(val);
    else setModel(val);
  };

  const handleSubmitStep = () => {
    const trimmed = currentValue.trim();

    if (step === 'baseUrl') {
      if (!trimmed) {
        setError(t('Base URL cannot be empty.'));
        return;
      }
      if (!trimmed.startsWith('http')) {
        setError(t('Base URL must start with http:// or https://'));
        return;
      }
      setBaseUrl(trimmed);
      setStep('apiKey');
      return;
    }

    if (step === 'apiKey') {
      if (!trimmed) {
        setError(t('API key cannot be empty.'));
        return;
      }
      setApiKey(trimmed);
      setStep('model');
      return;
    }

    if (step === 'model') {
      if (!trimmed) {
        setError(t('Model name cannot be empty.'));
        return;
      }
      setModel(trimmed);
      onSubmit({
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: trimmed,
      });
    }
  };

  const handleGoBack = () => {
    setError(null);
    if (step === 'apiKey') {
      setStep('baseUrl');
    } else if (step === 'model') {
      setStep('apiKey');
    } else {
      onCancel();
    }
  };

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        handleGoBack();
      } else if (key.name === 'return') {
        handleSubmitStep();
      }
    },
    { isActive: true },
  );

  return (
    <Box flexDirection="column">
      {/* Progress indicator */}
      <Box marginBottom={1}>
        {STEPS.map((s, i) => (
          <Box key={s} marginRight={2}>
            <Text
              color={
                s === step
                  ? theme.text.accent
                  : i < currentStepIndex
                    ? theme.status.success
                    : theme.text.secondary
              }
              bold={s === step}
            >
              {i < currentStepIndex ? '✓ ' : s === step ? '▶ ' : '  '}
              {STEP_LABELS[s]}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Current field label */}
      <Box marginBottom={1}>
        <Text color={theme.text.primary} bold>
          {t('Enter {{field}}:', { field: STEP_LABELS[step] })}
        </Text>
      </Box>

      {/* Input */}
      <TextInput
        key={step}
        value={currentValue}
        onChange={setCurrentValue}
        placeholder={STEP_PLACEHOLDERS[step]}
      />

      {/* Filled values summary */}
      {currentStepIndex > 0 && (
        <Box marginTop={1} flexDirection="column">
          {baseUrl && (
            <Text color={theme.text.secondary}>
              Base URL: <Text color={theme.text.primary}>{baseUrl}</Text>
            </Text>
          )}
          {apiKey && currentStepIndex > 1 && (
            <Text color={theme.text.secondary}>
              API Key:{' '}
              <Text color={theme.text.primary}>
                {'*'.repeat(Math.min(apiKey.length, 8)) +
                  (apiKey.length > 8 ? '...' : '')}
              </Text>
            </Text>
          )}
        </Box>
      )}

      {/* Error */}
      {error && (
        <Box marginTop={1}>
          <Text color={theme.status.error}>{error}</Text>
        </Box>
      )}

      {/* Hint */}
      <Box marginTop={1}>
        <Text color={theme.text.secondary}>
          {t('Enter to next, Esc to go back')}
        </Text>
      </Box>
    </Box>
  );
}
