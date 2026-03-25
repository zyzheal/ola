export const DEFAULT_TIMEOUT = 120000;
export const DEFAULT_MAX_RETRIES = 3;

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
// DEFAULT_DASHSCOPE_BASE_URL kept as a convenience default for OpenAI-compatible DashScope.
// Override via LLM_PRIMARY_BASE_URL or platform LLM config center.
export const DEFAULT_DASHSCOPE_BASE_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1';
export const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
export const DEFAULT_OPEN_ROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
