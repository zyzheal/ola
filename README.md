# AI Platform Code Assistant

Based on [qwen-code](https://github.com/QwenLM/qwen-code) (Apache 2.0).

## De-branding changes

| 变更项             | 原值                       | 新值                                    |
| ------------------ | -------------------------- | --------------------------------------- |
| package name       | `@qwen-code/qwen-code`     | `aiops`                                 |
| CLI bin command    | `qwen`                     | `aiops`                                 |
| Config directory   | `~/.qwen/`                 | `~/.aiops/`                             |
| Sandbox image      | `ghcr.io/qwenlm/qwen-code` | `ghcr.io/your-org/aiops:0.13.0`         |
| Telemetry endpoint | `*.rum.aliyuncs.com`       | **disabled** — 不上报任何遥测数据       |
| Qwen OAuth         | `QWEN_OAUTH` auth type     | **removed** — 统一使用平台 LLM 配置中心 |
| User-Agent         | `QwenCode/x.x.x`           | `AIPlatformCodeAssistant/x.x.x`         |

## LLM 配置

通过平台 LLM 配置中心统一管理，环境变量格式与 `ai-service` 保持一致：

```bash
LLM_PROVIDERS=primary,fallback

LLM_PRIMARY_BASE_URL=http://vllm-service:8000/v1   # 自研大模型
LLM_PRIMARY_API_KEY=
LLM_PRIMARY_MODEL=Qwen2.5-72B-Instruct

LLM_FALLBACK_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_FALLBACK_API_KEY=sk-xxx
LLM_FALLBACK_MODEL=qwen-plus
```

也可通过 `/~.aiops/settings.json` 配置（格式与原 `~/.qwen/settings.json` 完全兼容）。

## 构建

```bash
npm ci
npm run build
npm run bundle
```

## 原始版权声明

原始项目 qwen-code 基于 gemini-cli (Google LLC, Apache 2.0) 二次开发。
本项目在其基础上进行去私有化改造，保留 Apache 2.0 协议，版权归原作者所有。
