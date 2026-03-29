/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { createHash } from 'node:crypto';
import type { ProviderModelConfig as ModelConfig } from 'ola-core';

/**
 * Coding plan regions
 */
export enum CodingPlanRegion {
  CHINA = 'china',
  GLOBAL = 'global',
  LOCAL = 'local', // Local custom region
}

/**
 * Coding plan template - array of model configurations
 * When user provides an api-key, these configs will be cloned with envKey pointing to the stored api-key
 */
export type CodingPlanTemplate = ModelConfig[];

/**
 * Environment variable key for storing the coding plan API key.
 * Unified key for both regions since they are mutually exclusive.
 */
export const CODING_PLAN_ENV_KEY = 'BAILIAN_CODING_PLAN_API_KEY';

/**
 * Get the base URL from environment variable or use default.
 * Allows users to customize the API endpoint via OLA_CODING_PLAN_BASE_URL.
 * @param region - The region to get base URL for
 * @returns The base URL to use
 */
export function getBaseUrl(region: CodingPlanRegion): string {
  // Check for custom base URL from environment variable
  const customBaseUrl = process.env['OLA_CODING_PLAN_BASE_URL'];
  if (customBaseUrl) {
    return customBaseUrl;
  }

  // Default URLs for each region
  if (region === CodingPlanRegion.LOCAL) {
    return 'http://localhost:8000/v1'; // Default local address
  }
  if (region === CodingPlanRegion.CHINA) {
    return 'https://coding.dashscope.aliyuncs.com/v1';
  }
  if (region === CodingPlanRegion.GLOBAL) {
    return 'https://coding-intl.dashscope.aliyuncs.com/v1';
  }
  return 'http://localhost:8000/v1';
}

/**
 * Computes the version hash for the coding plan template.
 * Uses SHA256 of the JSON-serialized template for deterministic versioning.
 * @param template - The template to compute version for
 * @returns Hexadecimal string representing the template version
 */
export function computeCodingPlanVersion(template: CodingPlanTemplate): string {
  const templateString = JSON.stringify(template);
  return createHash('sha256').update(templateString).digest('hex');
}

/**
 * Generate the complete coding plan template for a specific region.
 * China region uses legacy description to maintain backward compatibility.
 * Global region uses new description with region indicator.
 * Local region uses customizable base URL.
 * @param region - The region to generate template for
 * @returns Complete model configuration array for the region
 */
export function generateCodingPlanTemplate(
  region: CodingPlanRegion,
): CodingPlanTemplate {
  const baseUrl = getBaseUrl(region);

  // Common model IDs that work across all regions
  // Users can customize these models based on their local deployment
  const commonModels = [
    {
      id: 'qwen3.5-plus',
      name: `[Coding Plan] qwen3.5-plus`,
      generationConfig: {
        extra_body: {
          enable_thinking: true,
        },
        contextWindowSize: 1000000,
      },
    },
    {
      id: 'qwen3-coder-plus',
      name: `[Coding Plan] qwen3-coder-plus`,
      generationConfig: {
        contextWindowSize: 1000000,
      },
    },
    {
      id: 'qwen3-coder-next',
      name: `[Coding Plan] qwen3-coder-next`,
      generationConfig: {
        contextWindowSize: 262144,
      },
    },
    {
      id: 'qwen3-max-2026-01-23',
      name: `[Coding Plan] qwen3-max-2026-01-23`,
      generationConfig: {
        extra_body: {
          enable_thinking: true,
        },
        contextWindowSize: 262144,
      },
    },
  ];

  // Add region-specific models
  let models = [...commonModels];

  if (region === CodingPlanRegion.CHINA) {
    // China region specific models
    models = [
      ...models,
      {
        id: 'glm-5',
        name: `[Coding Plan] glm-5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 202752,
        },
      },
      {
        id: 'kimi-k2.5',
        name: `[Coding Plan] kimi-k2.5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 262144,
        },
      },
      {
        id: 'MiniMax-M2.5',
        name: `[Coding Plan] MiniMax-M2.5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 196608,
        },
      },
      {
        id: 'glm-4.7',
        name: `[Coding Plan] glm-4.7`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 202752,
        },
      },
    ];
  } else if (region === CodingPlanRegion.GLOBAL) {
    // Global region specific models
    models = [
      ...models,
      {
        id: 'glm-4.7',
        name: `[Coding Plan] glm-4.7`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 202752,
        },
      },
      {
        id: 'glm-5',
        name: `[Coding Plan] glm-5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 202752,
        },
      },
      {
        id: 'MiniMax-M2.5',
        name: `[Coding Plan] MiniMax-M2.5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 196608,
        },
      },
      {
        id: 'kimi-k2.5',
        name: `[Coding Plan] kimi-k2.5`,
        generationConfig: {
          extra_body: {
            enable_thinking: true,
          },
          contextWindowSize: 262144,
        },
      },
    ];
  }

  // Build the final template with the base URL
  return models.map((model) => ({
    ...model,
    baseUrl,
    envKey: CODING_PLAN_ENV_KEY,
  }));
}

/**
 * Get the complete configuration for a specific region.
 * @param region - The region to use
 * @returns Object containing template, baseUrl, and version
 */
export function getCodingPlanConfig(region: CodingPlanRegion) {
  const template = generateCodingPlanTemplate(region);
  const baseUrl = getBaseUrl(region);
  return {
    template,
    baseUrl,
    version: computeCodingPlanVersion(template),
  };
}

/**
 * Get all unique base URLs for coding plan (used for filtering/config detection).
 * @returns Array of base URLs
 */
export function getCodingPlanBaseUrls(): string[] {
  // Check for custom base URL from environment variable
  const customBaseUrl = process.env['OLA_CODING_PLAN_BASE_URL'];
  const baseUrls = [
    'http://localhost:8000/v1', // Local default
    'https://coding.dashscope.aliyuncs.com/v1', // China
    'https://coding-intl.dashscope.aliyuncs.com/v1', // Global
  ];
  if (customBaseUrl) {
    baseUrls.push(customBaseUrl);
  }
  return baseUrls;
}

/**
 * Check if a config belongs to Coding Plan (any region).
 * Returns the region if matched, or false if not a Coding Plan config.
 * @param baseUrl - The baseUrl to check
 * @param envKey - The envKey to check
 * @returns The region if matched, false otherwise
 */
export function isCodingPlanConfig(
  baseUrl: string | undefined,
  envKey: string | undefined,
): CodingPlanRegion | false {
  if (!baseUrl || !envKey) {
    return false;
  }

  // Must use the unified envKey
  if (envKey !== CODING_PLAN_ENV_KEY) {
    return false;
  }

  // Check for custom base URL from environment variable
  const customBaseUrl = process.env['OLA_CODING_PLAN_BASE_URL'];
  if (customBaseUrl && baseUrl === customBaseUrl) {
    return CodingPlanRegion.LOCAL;
  }

  // Check which region's baseUrl matches
  if (baseUrl === 'http://localhost:8000/v1') {
    return CodingPlanRegion.LOCAL;
  }
  if (baseUrl === 'https://coding.dashscope.aliyuncs.com/v1') {
    return CodingPlanRegion.CHINA;
  }
  if (baseUrl === 'https://coding-intl.dashscope.aliyuncs.com/v1') {
    return CodingPlanRegion.GLOBAL;
  }

  return false;
}

/**
 * Get region from baseUrl.
 * @param baseUrl - The baseUrl to check
 * @returns The region if matched, null otherwise
 */
export function getRegionFromBaseUrl(
  baseUrl: string | undefined,
): CodingPlanRegion | null {
  if (!baseUrl) return null;

  // Check for custom base URL from environment variable
  const customBaseUrl = process.env['OLA_CODING_PLAN_BASE_URL'];
  if (customBaseUrl && baseUrl === customBaseUrl) {
    return CodingPlanRegion.LOCAL;
  }

  if (baseUrl === 'http://localhost:8000/v1') {
    return CodingPlanRegion.LOCAL;
  }
  if (baseUrl === 'https://coding.dashscope.aliyuncs.com/v1') {
    return CodingPlanRegion.CHINA;
  }
  if (baseUrl === 'https://coding-intl.dashscope.aliyuncs.com/v1') {
    return CodingPlanRegion.GLOBAL;
  }

  return null;
}
