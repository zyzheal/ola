<div align="center">

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**OLA - AI Platform Code Assistant**

一个开源的 AI 代码助手，运行在你的终端。

[English](#ola---ai-platform-code-assistant) | **中文**

</div>

## 简介

OLA 是一个基于 [qwen-code](https://github.com/QwenLM/qwen-code)（Apache 2.0 许可证）的私有化分支，专为 AI 平台代码助手场景优化。它帮助你理解大型代码库、自动化繁琐工作并更快地交付代码。

## 主要特性

- **多模型支持**：支持 OpenAI / Anthropic / Gemini 兼容 API，以及阿里云百炼、ModelScope 等国内模型服务
- **完全开源**：框架和代码完全开源，可自由定制和扩展
- **Agent 工作流**：丰富的内置工具（Skills、SubAgents、Plan Mode）实现完整的 Agent 工作流
- **终端优先，IDE 友好**：为命令行开发者设计，同时提供 VS Code、Zed 和 JetBrains IDE 集成
- **完整中文支持**：完整的 i18n 支持，中文作为主要输出语言

## 快速开始

### 环境要求

- **Node.js**: 20.0.0 或更高版本

### 安装

```bash
# 克隆仓库
git clone https://github.com/zyzheal/ola.git
cd ola

# 安装依赖
npm install

# 构建项目
npm run build

# 启动 OLA
npm start
```

### 配置

OLA 支持多种配置方式：

#### 1. 通过配置文件

编辑 `~/.ola/settings.json`（用户级别）或 `.ola/settings.json`（项目级别）：

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "通义千问代码模型",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-your-api-key"
  },
  "model": {
    "name": "qwen3-coder-plus"
  }
}
```

#### 2. 通过环境变量

```bash
export DASHSCOPE_API_KEY="sk-your-api-key"
npm start
```

### 使用示例

```bash
# 交互式模式
cd your-project/
npm start

# 或直接运行命令
npx ola -p "解释这个项目的代码结构"
```

常用提示词示例：

```text
这个项目是做什么的？
解释代码库的结构
帮我重构这个函数
为这个模块生成单元测试
```

## 命令和快捷键

### 会话命令

- `/help` - 显示可用命令
- `/clear` - 清除对话历史
- `/compress` - 压缩历史以节省 token
- `/stats` - 显示当前会话信息
- `/auth` - 管理认证
- `/bug` - 提交错误报告
- `/exit` 或 `/quit` - 退出 OLA

### 快捷键

- `Ctrl+C` - 取消当前操作
- `Ctrl+D` - 退出（在空行时）
- `上/下` - 浏览命令历史

## 文档

详细的用户文档请参阅：

- [OLA 用户文档](./docs/)
- [功能特性](./docs/users/features/)
- [集成指南](./docs/users/integration/)
- [配置参考](./docs/users/configuration/)

## 开发

### 构建命令

```bash
# 构建所有包
npm run build

# 开发模式（热重载）
npm run dev

# 运行测试
npm run test

# 运行完整检查（格式化、lint、构建、测试）
npm run preflight
```

### 项目结构

```
ola/
├── packages/
│   ├── cli/              # 命令行界面（主入口）
│   ├── core/             # 核心后端逻辑和工具实现
│   ├── sdk-java/         # Java SDK
│   ├── sdk-typescript/   # TypeScript SDK
│   ├── vscode-ide-companion/  # VS Code 扩展
│   └── ...
├── docs/                 # 文档
├── scripts/              # 构建脚本
└── ...
```

## 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5.3+
- **包管理器**: npm (workspaces)
- **构建工具**: esbuild
- **测试框架**: Vitest
- **UI 框架**: Ink (React for CLI)

## 贡献

我们欢迎各种形式的贡献！请参阅 [贡献指南](./CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目基于 Apache 2.0 许可证开源。原始项目 [qwen-code](https://github.com/QwenLM/qwen-code) 同样采用 Apache 2.0 许可证。

## 致谢

本项目基于以下优秀项目：

- [qwen-code](https://github.com/QwenLM/qwen-code) - Google 开源的终端 AI 助手
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - 原始项目基础

---

## OLA - AI Platform Code Assistant

<div align="center">

An open-source AI code assistant running in your terminal.

</div>

### Introduction

OLA is a private fork based on [qwen-code](https://github.com/QwenLM/qwen-code) (Apache 2.0 License), optimized for AI platform code assistant scenarios. It helps you understand large codebases, automate tedious work, and ship code faster.

### Key Features

- **Multi-model Support**: OpenAI / Anthropic / Gemini compatible APIs, plus Alibaba Cloud Bailian, ModelScope, and other domestic model services
- **Fully Open Source**: Framework and code completely open source, freely customizable and extensible
- **Agent Workflow**: Rich built-in tools (Skills, SubAgents, Plan Mode) for complete Agent workflow
- **Terminal-first, IDE-friendly**: Designed for command-line developers, with VS Code, Zed, and JetBrains IDE integration
- **Full Chinese Support**: Complete i18n support with Chinese as primary output language

### Quick Start

#### Prerequisites

- **Node.js**: 20.0.0 or higher

#### Installation

```bash
# Clone repository
git clone https://github.com/zyzheal/ola.git
cd ola

# Install dependencies
npm install

# Build project
npm run build

# Start OLA
npm start
```

### Configuration

OLA supports multiple configuration methods:

#### 1. Via Configuration File

Edit `~/.ola/settings.json` (user-level) or `.ola/settings.json` (project-level):

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "Qwen Code Model",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-your-api-key"
  },
  "model": {
    "name": "qwen3-coder-plus"
  }
}
```

#### 2. Via Environment Variables

```bash
export DASHSCOPE_API_KEY="sk-your-api-key"
npm start
```

### Usage Examples

```bash
# Interactive mode
cd your-project/
npm start

# Or run command directly
npx ola -p "Explain the codebase structure"
```

### Documentation

For detailed user documentation, please refer to:

- [OLA User Documentation](./docs/)
- [Feature Guides](./docs/users/features/)
- [Integration Guides](./docs/users/integration/)
- [Configuration Reference](./docs/users/configuration/)

### Development

#### Build Commands

```bash
# Build all packages
npm run build

# Development mode (hot reload)
npm run dev

# Run tests
npm run test

# Run full checks (format, lint, build, test)
npm run preflight
```

### License

This project is open source under the Apache 2.0 License. The original project [qwen-code](https://github.com/QwenLM/qwen-code) is also licensed under Apache 2.0.

### Acknowledgments

This project is based on the following excellent projects:

- [qwen-code](https://github.com/QwenLM/qwen-code) - Google's open-source terminal AI assistant
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Original project foundation
