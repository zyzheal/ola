/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseWebSearchProvider } from '../base-provider.js';
import type {
  WebSearchResult,
  WebSearchResultItem,
  DashScopeProviderConfig,
} from '../types.js';

interface DashScopeSearchItem {
  _id: string;
  snippet: string;
  title: string;
  url: string;
  timestamp: number;
  timestamp_format: string;
  hostname: string;
  hostlogo?: string;
  web_main_body?: string;
  _score?: number;
}

interface DashScopeSearchResponse {
  headers: Record<string, unknown>;
  rid: string;
  status: number;
  message: string | null;
  data: {
    total: number;
    totalDistinct: number;
    docs: DashScopeSearchItem[];
    keywords?: string[];
    qpInfos?: Array<{
      query: string;
      cleanQuery: string;
      sensitive: boolean;
      spellchecked: string;
      spellcheck: boolean;
      tokenized: string[];
      stopWords: string[];
      synonymWords: string[];
      recognitions: unknown[];
      rewrite: string;
      operator: string;
    }>;
    aggs?: unknown;
    extras?: Record<string, unknown>;
  };
  debug?: unknown;
  success: boolean;
}

/**
 * Web search provider using Alibaba Cloud DashScope API.
 */
export class DashScopeProvider extends BaseWebSearchProvider {
  readonly name = 'DashScope';

  constructor(private readonly config: DashScopeProviderConfig) {
    super();
  }

  isAvailable(): boolean {
    // DashScope provider is available when API key is configured
    return !!this.config.apiKey;
  }

  /**
   * Get the access token and API endpoint for authentication and web search.
   */
  private async getAuthConfig(): Promise<{
    accessToken: string | null;
    apiEndpoint: string;
  }> {
    // Get access token from config
    const accessToken = this.config.apiKey || null;

    // Get API endpoint from config or use default
    const apiEndpoint =
      this.config.baseUrl ||
      'https://dashscope.aliyuncs.com/api/v1/indices/plugin/web_search';

    return { accessToken, apiEndpoint };
  }

  protected async performSearch(
    query: string,
    signal: AbortSignal,
  ): Promise<WebSearchResult> {
    // Get access token and API endpoint
    const { accessToken, apiEndpoint } = await this.getAuthConfig();
    if (!accessToken) {
      throw new Error(
        'No API key available. Please configure DASHSCOPE_API_KEY or use apiKey in settings.',
      );
    }

    const requestBody = {
      uq: query,
      page: 1,
      rows: this.config.maxResults || 10,
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `API error: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`,
      );
    }

    const data = (await response.json()) as DashScopeSearchResponse;

    if (data.status !== 0) {
      throw new Error(`API error: ${data.message || 'Unknown error'}`);
    }

    const results: WebSearchResultItem[] = (data.data?.docs || []).map(
      (item) => ({
        title: item.title,
        url: item.url,
        content: item.snippet,
        score: item._score,
        publishedDate: item.timestamp_format,
      }),
    );

    return {
      query,
      results,
    };
  }
}
