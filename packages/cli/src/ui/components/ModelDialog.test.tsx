/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelDialog } from './ModelDialog.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { SettingsContext } from '../contexts/SettingsContext.js';
import type { Config } from 'ola-core';
import { AuthType, DEFAULT_OLA_MODEL } from 'ola-core';
import type { LoadedSettings } from '../../config/settings.js';
import { SettingScope } from '../../config/settings.js';

// Mock model data for testing - includes DEFAULT_OLA_MODEL as the first model
const MOCK_OPENAI_MODELS = [
  {
    id: DEFAULT_OLA_MODEL,
    label: 'Coder Model',
    authType: AuthType.USE_OPENAI,
  },
  { id: 'gpt-4', label: 'GPT-4', authType: AuthType.USE_OPENAI },
  {
    id: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    authType: AuthType.USE_OPENAI,
  },
];

vi.mock('../hooks/useKeypress.js', () => ({
  useKeypress: vi.fn(),
}));
const mockedUseKeypress = vi.mocked(useKeypress);

vi.mock('./shared/DescriptiveRadioButtonSelect.js', () => ({
  DescriptiveRadioButtonSelect: vi.fn(() => null),
}));

// Helper to create getAvailableModelsForAuthType mock
const createMockGetAvailableModelsForAuthType = () =>
  vi.fn((t: AuthType) => {
    if (t === AuthType.USE_OPENAI) {
      return MOCK_OPENAI_MODELS.map((m) => ({
        id: m.id,
        label: m.label,
        authType: AuthType.USE_OPENAI,
      }));
    }
    return [];
  });
const mockedSelect = vi.mocked(DescriptiveRadioButtonSelect);

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ModelDialog>> = {},
  contextValue: Partial<Config> | undefined = undefined,
) => {
  const defaultProps = {
    onClose: vi.fn(),
  };
  const combinedProps = { ...defaultProps, ...props };

  const mockSettings = {
    isTrusted: true,
    user: { settings: {} },
    workspace: { settings: {} },
    setValue: vi.fn(),
  } as unknown as LoadedSettings;

  const mockConfig = {
    // --- Functions used by ModelDialog ---
    getModel: vi.fn(() => DEFAULT_OLA_MODEL),
    setModel: vi.fn().mockResolvedValue(undefined),
    switchModel: vi.fn().mockResolvedValue(undefined),
    getAuthType: vi.fn(() => 'use-openai'),
    getAllConfiguredModels: vi.fn(() =>
      MOCK_OPENAI_MODELS.map((m) => ({
        id: m.id,
        label: m.label,
        authType: AuthType.USE_OPENAI,
      })),
    ),

    // --- Functions used by ClearcutLogger ---
    getUsageStatisticsEnabled: vi.fn(() => true),
    getSessionId: vi.fn(() => 'mock-session-id'),
    getDebugMode: vi.fn(() => false),
    getContentGeneratorConfig: vi.fn(() => ({
      authType: AuthType.USE_OPENAI,
      model: DEFAULT_OLA_MODEL,
    })),
    getUseModelRouter: vi.fn(() => false),
    getProxy: vi.fn(() => undefined),

    // --- Spread test-specific overrides ---
    ...(contextValue ?? {}),
  } as unknown as Config;

  const renderResult = render(
    <SettingsContext.Provider value={mockSettings}>
      <ConfigContext.Provider value={mockConfig}>
        <ModelDialog {...combinedProps} />
      </ConfigContext.Provider>
    </SettingsContext.Provider>,
  );

  return {
    ...renderResult,
    props: combinedProps,
    mockConfig,
    mockSettings,
  };
};

describe('<ModelDialog />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure env-based fallback models don't leak into this suite from the developer environment.
    delete process.env['OPENAI_MODEL'];
    delete process.env['ANTHROPIC_MODEL'];
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the title', () => {
    const { getByText } = renderComponent();
    expect(getByText('Select Model')).toBeDefined();
  });

  it('passes all model options to DescriptiveRadioButtonSelect', () => {
    renderComponent();
    expect(mockedSelect).toHaveBeenCalledTimes(1);

    const props = mockedSelect.mock.calls[0][0];
    expect(props.items).toHaveLength(MOCK_OPENAI_MODELS.length);
    // coder-model is the only model and it has vision capability
    expect(props.items[0].value).toBe(
      `${AuthType.USE_OPENAI}::${DEFAULT_OLA_MODEL}`,
    );
    expect(props.showNumbers).toBe(true);
  });

  it('initializes with the model from ConfigContext', () => {
    const mockGetModel = vi.fn(() => DEFAULT_OLA_MODEL);
    renderComponent(
      {},
      {
        getModel: mockGetModel,
        getAvailableModelsForAuthType:
          createMockGetAvailableModelsForAuthType(),
      },
    );

    expect(mockGetModel).toHaveBeenCalled();
    // Calculate expected index dynamically based on model list
    const expectedIndex = MOCK_OPENAI_MODELS.findIndex(
      (m) => m.id === DEFAULT_OLA_MODEL,
    );
    expect(mockedSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        initialIndex: expectedIndex,
      }),
      undefined,
    );
  });

  it('initializes with default coder model if context is not provided', () => {
    renderComponent({}, undefined);

    expect(mockedSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        initialIndex: 0,
      }),
      undefined,
    );
  });

  it('initializes with default coder model if getModel returns undefined', () => {
    const mockGetModel = vi.fn(() => undefined as unknown as string);
    renderComponent(
      {},
      {
        getModel: mockGetModel,
        getAvailableModelsForAuthType:
          createMockGetAvailableModelsForAuthType(),
      },
    );

    expect(mockGetModel).toHaveBeenCalled();

    // When getModel returns undefined, preferredModel falls back to DEFAULT_OLA_MODEL
    // which has index 0, so initialIndex should be 0
    expect(mockedSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        initialIndex: 0,
      }),
      undefined,
    );
    expect(mockedSelect).toHaveBeenCalledTimes(1);
  });

  it('calls config.switchModel and onClose when DescriptiveRadioButtonSelect.onSelect is triggered', async () => {
    const { props, mockConfig, mockSettings } = renderComponent(
      {},
      {
        getAvailableModelsForAuthType: vi.fn((t: AuthType) => {
          if (t === AuthType.USE_OPENAI) {
            return MOCK_OPENAI_MODELS.map((m) => ({
              id: m.id,
              label: m.label,
              authType: AuthType.USE_OPENAI,
            }));
          }
          return [];
        }),
      },
    );

    const childOnSelect = mockedSelect.mock.calls[0][0].onSelect;
    expect(childOnSelect).toBeDefined();

    await childOnSelect(`${AuthType.USE_OPENAI}::${DEFAULT_OLA_MODEL}`);

    expect(mockConfig?.switchModel).toHaveBeenCalledWith(
      AuthType.USE_OPENAI,
      DEFAULT_OLA_MODEL,
      undefined,
    );
    expect(mockSettings.setValue).toHaveBeenCalledWith(
      SettingScope.User,
      'model.name',
      DEFAULT_OLA_MODEL,
    );
    expect(mockSettings.setValue).toHaveBeenCalledWith(
      SettingScope.User,
      'security.auth.selectedType',
      AuthType.USE_OPENAI,
    );
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls config.switchModel and persists authType+model when selecting a different authType', async () => {
    const switchModel = vi.fn().mockResolvedValue(undefined);
    const getAuthType = vi.fn(() => AuthType.USE_ANTHROPIC);
    const getAvailableModelsForAuthType = vi.fn((t: AuthType) => {
      if (t === AuthType.USE_OPENAI) {
        return MOCK_OPENAI_MODELS.map((m) => ({
          id: m.id,
          label: m.label,
          authType: AuthType.USE_OPENAI,
        }));
      }
      if (t === AuthType.USE_ANTHROPIC) {
        return [{ id: 'claude-3', label: 'Claude 3', authType: t }];
      }
      return [];
    });

    // getContentGeneratorConfig should return the new config after switchModel is called
    const getContentGeneratorConfig = vi.fn(() => ({
      authType: AuthType.USE_OPENAI,
      model: DEFAULT_OLA_MODEL,
    }));

    const mockConfigWithSwitchAuthType = {
      getAuthType,
      getModel: vi.fn(() => 'claude-3'),
      getContentGeneratorConfig,
      // Add switchModel to the mock object (not the type)
      switchModel,
      getAvailableModelsForAuthType,
    };

    const { props, mockSettings } = renderComponent(
      {},
      // Cast to Config to bypass type checking, matching the runtime behavior
      mockConfigWithSwitchAuthType as unknown as Partial<Config>,
    );

    const childOnSelect = mockedSelect.mock.calls[0][0].onSelect;
    await childOnSelect(`${AuthType.USE_OPENAI}::${DEFAULT_OLA_MODEL}`);

    expect(switchModel).toHaveBeenCalledWith(
      AuthType.USE_OPENAI,
      DEFAULT_OLA_MODEL,
      undefined,
    );
    // Settings are persisted with the selected model (DEFAULT_OLA_MODEL)
    expect(mockSettings.setValue).toHaveBeenCalledWith(
      SettingScope.User,
      'model.name',
      DEFAULT_OLA_MODEL,
    );
    expect(mockSettings.setValue).toHaveBeenCalledWith(
      SettingScope.User,
      'security.auth.selectedType',
      AuthType.USE_OPENAI,
    );
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('passes onHighlight to DescriptiveRadioButtonSelect', () => {
    renderComponent();

    const childOnHighlight = mockedSelect.mock.calls[0][0].onHighlight;
    expect(childOnHighlight).toBeDefined();
    expect(typeof childOnHighlight).toBe('function');
  });

  it('calls onClose prop when "escape" key is pressed', () => {
    const { props } = renderComponent();

    expect(mockedUseKeypress).toHaveBeenCalled();

    const keyPressHandler = mockedUseKeypress.mock.calls[0][0];
    const options = mockedUseKeypress.mock.calls[0][1];

    expect(options).toEqual({ isActive: true });

    keyPressHandler({
      name: 'escape',
      ctrl: false,
      meta: false,
      shift: false,
      paste: false,
      sequence: '',
    });
    expect(props.onClose).toHaveBeenCalledTimes(1);

    keyPressHandler({
      name: 'a',
      ctrl: false,
      meta: false,
      shift: false,
      paste: false,
      sequence: '',
    });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('updates initialIndex when config context changes', () => {
    const mockGetModel = vi.fn(() => DEFAULT_OLA_MODEL);
    const mockGetAuthType = vi.fn(() => 'use-openai');
    const mockSettings = {
      isTrusted: true,
      user: { settings: {} },
      workspace: { settings: {} },
      setValue: vi.fn(),
    } as unknown as LoadedSettings;
    const { rerender } = render(
      <SettingsContext.Provider value={mockSettings}>
        <ConfigContext.Provider
          value={
            {
              getModel: mockGetModel,
              getAuthType: mockGetAuthType,
              getAvailableModelsForAuthType:
                createMockGetAvailableModelsForAuthType(),
              getAllConfiguredModels: vi.fn(() =>
                MOCK_OPENAI_MODELS.map((m) => ({
                  id: m.id,
                  label: m.label,
                  authType: AuthType.USE_OPENAI,
                })),
              ),
            } as unknown as Config
          }
        >
          <ModelDialog onClose={vi.fn()} />
        </ConfigContext.Provider>
      </SettingsContext.Provider>,
    );

    // DEFAULT_OLA_MODEL (coder-model) is at index 0
    expect(mockedSelect.mock.calls[0][0].initialIndex).toBe(0);

    mockGetModel.mockReturnValue(DEFAULT_OLA_MODEL);
    const newMockConfig = {
      getModel: mockGetModel,
      getAuthType: mockGetAuthType,
      getAvailableModelsForAuthType: createMockGetAvailableModelsForAuthType(),
      getAllConfiguredModels: vi.fn(() =>
        MOCK_OPENAI_MODELS.map((m) => ({
          id: m.id,
          label: m.label,
          authType: AuthType.USE_OPENAI,
        })),
      ),
    } as unknown as Config;

    rerender(
      <SettingsContext.Provider value={mockSettings}>
        <ConfigContext.Provider value={newMockConfig}>
          <ModelDialog onClose={vi.fn()} />
        </ConfigContext.Provider>
      </SettingsContext.Provider>,
    );

    // Should be called at least twice: initial render + re-render after context change
    expect(mockedSelect).toHaveBeenCalledTimes(2);
    // Calculate expected index for DEFAULT_OLA_MODEL dynamically
    const expectedCoderIndex = MOCK_OPENAI_MODELS.findIndex(
      (m) => m.id === DEFAULT_OLA_MODEL,
    );
    expect(mockedSelect.mock.calls[1][0].initialIndex).toBe(expectedCoderIndex);
  });
});
