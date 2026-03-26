# OLA - AI Platform Code Assistant

**OLA** 是一个基于终端的 AI 编码助手，基于 [qwen-code](https://github.com/QwenLM/qwen-code) (Apache 2.0) 二次开发。它可以帮助你理解大型代码库、自动化繁琐工作，并更快地完成开发任务。

## ✨ 主要特性

- 🎯 **终端优先**：专为命令行开发者设计，支持交互式和非交互式模式
- 🔧 **丰富工具**：文件操作、代码搜索、Shell 执行、Web 抓取等
- 🤖 **智能代理**：支持子代理任务委派和技能系统
- 🌐 **多模型支持**：兼容 OpenAI API 格式的各大 LLM 提供商
- 🇨🇳 **中文优先**：默认使用中文回复，更懂中国开发者
- 🔒 **隐私保护**：不上传任何遥测数据，完全本地运行

## 🚀 快速开始

### 1. 系统要求

- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS, Linux, Windows (WSL2 推荐)

### 2. 安装

#### 方法一：源码安装（推荐）

```bash
# 克隆仓库
git clone git@github.com:zyzheal/ola.git
cd ola/implementation/tools

# 安装依赖
npm ci

# 构建项目
npm run build && npm run bundle

# 全局安装
npm link

# 验证安装
ola --version
```

#### 方法二：使用安装脚本

```bash
git clone git@github.com:zyzheal/ola.git
cd ola/implementation/tools
./scripts/install-global.sh
```

### 3. 配置 LLM

OLA 支持 OpenAI API 格式的各大 LLM 提供商：

```bash
# 设置环境变量
export OPENAI_API_KEY=your-api-key
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_MODEL=gpt-4o

# 或使用其他兼容 API
export OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
export OPENAI_MODEL=qwen-plus
```

### 4. 开始使用

```bash
# 交互式模式
ola

# 非交互式模式
ola -p "查看当前目录的文件结构"

# 使用沙箱
ola -s -p "运行测试"
```

## 📖 使用指南

### 基本命令

```bash
# 查看版本
ola --version

# 查看帮助
ola --help

# 启动交互式会话
ola

# 非交互式查询
ola -p "解释这段代码" src/main.ts

# 使用特定模型
ola --model qwen-max -p "优化这个函数"

# 启用沙箱模式
ola -s -p "运行这个脚本"
```

### 交互式命令

在 ola 会话中，可以使用以下命令：

```
/help              # 显示帮助信息
/clear             # 清除对话历史
/compress          # 压缩对话历史
/stats             # 显示会话统计
/model             # 查看/切换模型
/bug               # 提交 bug 报告
/exit              # 退出程序
```

### 工具命令

OLA 提供丰富的工具来帮助你的开发工作：

```
read_file          # 读取文件内容
write_file         # 写入文件
edit               # 编辑文件
run_command        # 运行 Shell 命令
grep               # 搜索内容
glob               # 查找文件
todo_write         # 管理任务列表
ask_user           # 向用户提问
```

### 斜杠命令

```
/tools             # 查看可用工具
/skills            # 查看可用技能
/agents            # 管理子代理
/prompts           # 查看可用提示
/extensions        # 管理扩展
/mcp               # 管理 MCP 服务器
```

## ⚙️ 配置说明

### 配置目录

```
~/.ola/                          # 全局配置目录
├── settings.json                # 全局设置
├── installation_id              # 安装 ID
├── output-language.md           # 输出语言配置
├── commands/                    # 用户命令
├── skills/                      # 用户技能
├── extensions/                  # 扩展
├── tmp/                         # 临时文件
├── debug/                       # 调试日志
└── projects/                    # 项目特定数据
```

### 项目配置

```
<project>/.ola/                  # 项目配置目录
├── settings.json                # 项目设置
├── commands/                    # 项目命令
└── skills/                      # 项目技能
```

### 环境变量

```bash
# 运行时目录
export OLA_RUNTIME_DIR=~/.ola/runtime

# 输出语言
export OLA_CODE_LANG=Chinese

# 沙箱配置
export OLA_SANDBOX=docker
export OLA_SANDBOX_IMAGE=ghcr.io/your-org/ola:0.13.0

# 调试日志
export OLA_DEBUG_LOG_FILE=1

# 向后兼容：QWEN_* 环境变量仍然有效
```

## 🔧 开发模式

### 本地开发

```bash
# 克隆仓库后
cd ola/implementation/tools

# 安装依赖
npm ci

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 打包
npm run bundle

# 测试
npm test
```

### 构建命令

```bash
# 构建所有包
npm run build

# 构建沙箱镜像
npm run build:sandbox

# 构建 VSCode 扩展
npm run build:vscode

# 完整构建
npm run build:all
```

## 📦 打包产物

### 生成的文件

构建后会在以下位置生成产物：

```
dist/                              # 根目录构建产物
├── cli.js                         # 打包后的 CLI (单个文件，约 5MB)
├── src/                           # 资源文件
│   ├── i18n/locales/*.js          # 国际化语言包
│   └── commands/extensions/examples/  # 扩展示例
├── bundled/                       # 内置技能
│   └── review/SKILL.md            # /review 等内置技能
└── vendor/                        # 二进制工具
    ├── ripgrep/                   # 代码搜索工具 (rg)
    └── tree-sitter/               # 代码解析器 (WASM)

packages/*/dist/                   # 各子包构建产物
packages/vscode-ide-companion/*.vsix  # VSCode 扩展安装包
```

### 包依赖关系

```
ola (CLI)
├── ola-core                       # 核心库
├── ola-web-templates              # Web 模板
└── @ai-platform/webui (可选)      # Web UI 组件

@ai-platform/webui
└── (独立，无内部依赖)

@ai-platform/sdk                   # TypeScript SDK
└── (独立，无内部依赖)

vscode-ide-companion
└── @ai-platform/webui             # 依赖 Web UI
```

### 打包流程

```bash
# 1. TypeScript 编译
tsc --build

# 2. 复制资源文件 (.md, .json, .sb)
node ../../scripts/copy_files.js

# 3. 复制内置技能和二进制工具
node ../../scripts/copy_bundle_assets.js

# 4. esbuild 打包 (可选，生成单个 cli.js)
node esbuild.config.js
```

详细目录结构和打包说明请参考 [目录结构文档](./docs/developers/DIRECTORY_STRUCTURE.md)。

## 📚 文档

| 文档                                      | 说明               |
| ----------------------------------------- | ------------------ |
| [使用指南](./docs/USAGE.md)               | 基本使用与命令参考 |
| [安装指南](./docs/INSTALLATION.md)        | 完整安装指南       |
| [源码安装](./docs/SOURCE_INSTALL.md)      | 从源码安装详解     |
| [本地安装](./docs/local-install.md)       | 本地安装与配置     |
| [上游管理](./docs/UPSTREAM_MANAGEMENT.md) | 上游更新管理       |
| [Git 配置](./docs/GIT_SETUP.md)           | Git 配置与推送指南 |

## 🔄 更新上游代码

OLA 基于 qwen-code 二次开发，可以合并上游的新特性：

```bash
# 获取上游更新
git fetch upstream

# 合并到 main 分支
git checkout main
git merge upstream/main

# 合并到 dev 分支
git checkout dev
git merge main

# 保留 OLA 自定义修改
# - 包名：ola, ola-core
# - 命令：ola
# - 配置目录：~/.ola
# - 系统提示词：AI Platform Code Assistant
# - 默认语言：Chinese
```

详细指南请参考 [上游更新管理](./docs/UPSTREAM_MANAGEMENT.md)。

## 🤝 贡献

我们欢迎各种贡献！

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发要求

- 遵循项目的代码规范
- 添加必要的测试
- 确保 `npm run preflight` 通过
- 更新相关文档

详细指南请参考 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

OLA 基于 Apache 2.0 许可证发布。

原始项目 qwen-code 基于 gemini-cli (Google LLC, Apache 2.0) 二次开发。
本项目在其基础上进行改造，保留 Apache 2.0 协议，版权归原作者所有。

## 🙏 致谢

- [qwen-code](https://github.com/QwenLM/qwen-code) - 原始项目
- [gemini-cli](https://github.com/google-gemini/gemini-cli) - 基础项目
- 所有贡献者和用户

## 📞 联系方式

- **项目地址**: https://github.com/zyzheal/ola
- **Issue 反馈**: https://github.com/zyzheal/ola/issues
- **讨论区**: https://github.com/zyzheal/ola/discussions

---

**OLA** - 让编码更高效，让开发更简单 🚀
