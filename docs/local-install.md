# OLA 本地安装与使用指南

AI Platform Code Assistant - 基于 ola 二次开发的 AI 编码助手

## 目录

- [环境要求](#环境要求)
- [源码安装](#源码安装)
- [配置大模型](#配置大模型)
- [运行时数据目录](#运行时数据目录结构)
- [启动与使用](#启动与使用)
- [常用 CLI 命令](#常用-cli-命令)
- [进阶配置](#进阶配置)
- [开发模式](#开发模式)
- [故障排查](#故障排查)

---

## 环境要求

| 依赖    | 版本要求  | 说明                                                   |
| ------- | --------- | ------------------------------------------------------ |
| Node.js | >= 20.0.0 | 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理版本 |
| npm     | >= 10.0.0 | 随 Node.js 一起安装                                    |
| Git     | 任意版本  | 用于克隆仓库代码                                       |

```bash
# 检查版本
node --version   # 需要 >= 20
npm --version    # 需要 >= 10
git --version
```

如果 Node.js 版本不足，使用 nvm 安装并切换：

```bash
nvm install 20
nvm use 20
nvm alias default 20   # 设为默认版本
```

> **macOS 用户**：可通过 [Homebrew](https://brew.sh/) 安装 nvm：`brew install nvm`

---

## 源码安装

### 1. 克隆代码

```bash
git clone https://github.com/your-org/ai-platform.git
cd ai-platform/implementation/tools
```

### 2. 安装依赖并构建

```bash
npm install
```

> `npm install` 会自动完成依赖安装和构建（触发 `prepare` 钩子执行 `npm run build`）。
> 若需严格按照 `package-lock.json` 安装（CI 场景），使用 `npm ci`。

构建产物位于 `dist/cli.js`（bundle）和 `packages/cli/dist/`（未打包）。

### 3. 全局安装（推荐）

```bash
# 在项目根目录（ai-platform/implementation/tools）执行
npm install -g ./packages/cli
```

安装完成后，可在任意目录使用 `aiops` 命令：

```bash
aiops --version
```

### 4. 不全局安装，直接运行

```bash
# 方式一：运行打包后的 bundle（推荐，无需额外依赖）
node dist/cli.js

# 方式二：运行未打包版本
node packages/cli/dist/index.js

# 方式三：通过根目录脚本
npm start
```

---

## 配置大模型

工具支持任意 OpenAI 兼容接口。有三种配置方式，**优先级从高到低**：

### 方式一：CLI 内 `/auth` 交互式配置（推荐新手）

启动工具后输入 `/auth`，提供以下三种认证方式：

| 选项                          | 说明                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| **Qwen OAuth**                | 免费，每天 1000 次请求，使用 Qwen 最新模型                    |
| **Alibaba Cloud Coding Plan** | 付费，支持百炼平台多种模型，需要 `sk-sp-` 开头的 API Key      |
| **API Key**                   | 自定义，填写任意 OpenAI 兼容接口的 Base URL、API Key 和模型名 |

选择 **API Key** 后，按提示依次输入：

1. **Base URL**（如 `https://dashscope.aliyuncs.com/compatible-mode/v1`）
2. **API Key**（如 `sk-xxxx`）
3. **Model**（如 `qwen-plus`）

配置完成后自动保存至 `/~.aiops/settings.json`，下次启动无需重新配置。

### 方式二：手动编辑 settings.json

**配置文件路径：**

| 作用范围             | 路径                     | 说明           |
| -------------------- | ------------------------ | -------------- |
| 用户级（全局生效）   | `/~.aiops/settings.json` | 对所有项目生效 |
| 项目级（仅当前项目） | `.aiops/settings.json`   | 放在项目根目录 |

```bash
mkdir -p /~.aiops
```

创建或编辑 `/~.aiops/settings.json`：

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen2.5-72b",
        "name": "Qwen2.5 72B (vLLM)",
        "baseUrl": "http://your-vllm-service:8000/v1",
        "envKey": "VLLM_API_KEY",
        "generationConfig": {
          "contextWindowSize": 32768,
          "timeout": 120000
        }
      },
      {
        "id": "qwen-plus",
        "name": "Qwen Plus (DashScope)",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen2.5-72b"
  }
}
```

### 私有大模型：通过 Authorization Bearer Token 鉴权

Bearer Token 是 OpenAI 兼容接口的**标准鉴权方式**，SDK 会自动将 API Key 以 `Authorization: Bearer <token>` 的形式附加到每个请求。

**方式 A：通过环境变量（推荐，避免密钥写入文件）**

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "my-private-model",
        "name": "私有模型",
        "baseUrl": "https://your-private-llm.example.com/v1",
        "envKey": "MY_PRIVATE_LLM_API_KEY"
      }
    ]
  },
  "security": {
    "auth": { "selectedType": "openai" }
  }
}
```

然后设置环境变量（或写入 `/~.aiops/.env`）：

```bash
export MY_PRIVATE_LLM_API_KEY="Bearer-token-or-api-key"
# 或写入 .env 文件（自动加载）
echo 'MY_PRIVATE_LLM_API_KEY=Bearer-token-or-api-key' >> /~.aiops/.env
```

**方式 B：将 Token 直接写入 settings.json 的 `env` 字段**

```json
{
  "env": {
    "MY_PRIVATE_LLM_API_KEY": "your-bearer-token"
  },
  "modelProviders": {
    "openai": [
      {
        "id": "my-private-model",
        "name": "私有模型",
        "baseUrl": "https://your-private-llm.example.com/v1",
        "envKey": "MY_PRIVATE_LLM_API_KEY"
      }
    ]
  },
  "security": {
    "auth": { "selectedType": "openai" }
  }
}
```

> **说明：** `env` 字段中的键值会在 CLI 启动时自动注入到进程环境变量，效果等同于 `export MY_PRIVATE_LLM_API_KEY=...`。

**方式 C：通过 `customHeaders` 覆盖 Authorization Header（非标准格式时使用）**

仅当服务端要求非标准格式（如 `Authorization: Token xxx` 而非 `Bearer`）时才需要：

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "my-private-model",
        "name": "私有模型（非标准 Token 格式）",
        "baseUrl": "https://your-private-llm.example.com/v1",
        "generationConfig": {
          "customHeaders": {
            "Authorization": "Token your-non-standard-token"
          }
        }
      }
    ]
  },
  "security": {
    "auth": { "selectedType": "openai" }
  }
}
```

| 方式                             | 适用场景                          | 安全性 |
| -------------------------------- | --------------------------------- | ------ |
| A: `envKey` + 环境变量           | 标准 Bearer Token，密钥不写入文件 | ★★★    |
| B: `envKey` + `env` 字段         | 标准 Bearer Token，便于统一管理   | ★★     |
| C: `customHeaders.Authorization` | 非标准 Token 格式                 | ★★     |

### 私有大模型：通过 Header 鉴权

部分私有模型服务使用自定义 HTTP Header 进行鉴权（如 `X-API-Key`、`Authorization: Token xxx` 等非标准格式）。
通过 `generationConfig.customHeaders` 配置自定义请求头：

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "my-private-model",
        "name": "私有模型（Header 鉴权）",
        "baseUrl": "https://your-private-llm.example.com/v1",
        "generationConfig": {
          "customHeaders": {
            "X-API-Key": "your-secret-key",
            "X-Tenant-Id": "your-tenant-id"
          },
          "contextWindowSize": 32768,
          "timeout": 60000
        }
      },
      {
        "id": "internal-model",
        "name": "内网模型（Token 鉴权）",
        "baseUrl": "http://internal-llm-service/api/v1",
        "generationConfig": {
          "customHeaders": {
            "Authorization": "Token your-internal-token",
            "X-Project": "my-project"
          }
        }
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  }
}
```

> **说明：**
>
> - `customHeaders` 中的 Header 会与默认的 `User-Agent` 合并后发送
> - 如果 `customHeaders` 包含 `Authorization`，会覆盖默认的 Bearer Token 鉴权
> - API Key 也可以继续通过 `envKey` 环境变量方式配置，两者可以同时使用

**示例：直接将 Bearer Token 写入 `customHeaders`**

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "my-private-model",
        "name": "私有模型（Bearer Token）",
        "baseUrl": "https://your-private-llm.example.com/v1",
        "generationConfig": {
          "customHeaders": {
            "Authorization": "Bearer your-actual-token-here"
          }
        }
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "my-private-model"
  }
}
```

> **注意：** 此方式 token 明文存储在 `settings.json` 中。若在意安全性，推荐改用上方「Bearer Token 鉴权」章节的方式 A（`envKey` + 环境变量），token 不落盘。

通过环境变量设置对应的 API Key：

```bash
export VLLM_API_KEY="your-vllm-key"
export DASHSCOPE_API_KEY="sk-xxxx"
```

建议将环境变量写入 `/~.aiops/.env`，工具启动时会自动加载：

```bash
cat > /~.aiops/.env << 'EOF'
DASHSCOPE_API_KEY=sk-xxxx
VLLM_API_KEY=your-key
EOF
```

### 方式三：环境变量（适合临时使用/脚本）

```bash
# 标准 OpenAI 格式变量
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="http://your-vllm-service:8000/v1"
export OPENAI_MODEL="Qwen2.5-72B-Instruct"
```

**常见模型服务配置示例：**

```bash
# vLLM 本地部署
export OPENAI_BASE_URL="http://localhost:8000/v1"
export OPENAI_API_KEY="EMPTY"
export OPENAI_MODEL="Qwen2.5-Coder-32B-Instruct"

# Ollama 本地部署
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_API_KEY="ollama"
export OPENAI_MODEL="qwen2.5-coder:32b"

# DeepSeek API
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="sk-xxxx"
export OPENAI_MODEL="deepseek-coder"

# DashScope（阿里云）
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
export OPENAI_API_KEY="sk-xxxx"
export OPENAI_MODEL="qwen-plus"
```

---

## 运行时数据目录结构

工具的所有配置和运行时数据存储在 `/~.aiops/` 目录：

```
/~.aiops/
├── settings.json          # 用户级配置（模型、认证、工具等）
├── settings.json.bak      # 配置备份（修改前自动生成）
├── .env                   # 环境变量（自动加载）
├── output-language.md     # 输出语言偏好设置
├── debug/                 # 调试日志
├── ide/                   # IDE 连接 lock 文件
├── projects/              # 按项目存储的会话数据
├── skills/                # 自定义 Skills
└── tmp/                   # 临时文件
```

项目级配置（放在项目根目录）：

```
.aiops/
├── settings.json          # 项目级配置（优先级高于用户级）
├── AGENTS.md              # 项目上下文说明（自动注入到 AI 上下文）
└── skills/                # 项目级 Skills
```

---

## 启动与使用

### 基本启动

```bash
# 全局安装后
aiops

# 或直接运行 bundle
node dist/cli.js
```

### 在指定目录启动

```bash
aiops --cwd /path/to/your/project
```

### 非交互模式（单次问答）

```bash
aiops -p "解释这个函数的作用" --no-interactive
```

### 指定模型启动

```bash
aiops --model qwen2.5-72b
```

---

## 常用 CLI 命令

启动后在交互界面可使用以下斜杠命令：

| 命令               | 说明                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `/help`            | 显示所有可用命令                                                  |
| `/auth`            | 配置认证方式（交互式：Qwen OAuth / Coding Plan / 自定义 API Key） |
| `/model`           | 切换当前使用的模型                                                |
| `/stats`           | 查看当前会话信息（模型、Token 用量等）                            |
| `/clear`           | 清空对话历史                                                      |
| `/compress`        | 压缩历史以节省 Token                                              |
| `/memory`          | 管理长期记忆文件                                                  |
| `/tools`           | 查看已注册的工具列表                                              |
| `/mcp`             | 管理 MCP 服务器                                                   |
| `/ide`             | 管理 IDE 集成（VS Code / Cursor）                                 |
| `/exit` 或 `/quit` | 退出程序                                                          |

---

## 进阶配置

### 配置输出语言

工具默认使用中文回复。如需修改，编辑 `/~.aiops/output-language.md`：

```bash
# 改为英文
echo '<!-- ola:llm-output-language: English -->' > /~.aiops/output-language.md

# 改回中文
echo '<!-- ola:llm-output-language: Chinese -->' > /~.aiops/output-language.md
```

### 配置代理

```bash
export HTTPS_PROXY="http://proxy.your-org.com:8080"
```

或在 `settings.json` 中：

```json
{
  "advanced": {
    "proxy": "http://proxy.your-org.com:8080"
  }
}
```

### 配置 MCP 服务器

在 `/~.aiops/settings.json` 中添加：

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### IDE 集成（VS Code / Cursor）

在 CLI 中执行 `/ide install` 安装 IDE 伴侣扩展，安装完成后执行 `/ide enable` 启用连接。

连接成功后，CLI 可感知 IDE 中打开的文件、光标位置等上下文信息。

### 运行时目录自定义

默认运行时数据（日志、会话记录等）存储在 `/~.aiops/`，可通过环境变量覆盖：

```bash
export AIOPS_RUNTIME_DIR="/custom/path/aiops-data"
```

---

## 开发模式

```bash
# 热重载开发模式
npm run dev

# Debug 模式（附加调试器）
npm run debug
# 然后在 Chrome 打开 chrome://inspect
```

### 运行测试

```bash
# 单元测试
npm run test

# 集成测试（不使用沙箱）
npm run test:e2e

# 全量检查（格式化 + lint + 构建 + 类型检查 + 测试）
npm run preflight
```

---

## 故障排查

### 问题：`aiops: command not found`

```bash
# 确认全局安装路径在 PATH 中
npm bin -g
export PATH="$(npm bin -g):$PATH"

# 或直接用 node 运行 bundle
node dist/cli.js
```

### 问题：`npm install` / `npm ci` 构建失败

```bash
# 清理后重新构建
npm run clean
npm install
```

### 问题：配置不生效（显示错误的模型名）

确认配置写入了正确的目录（`/~.aiops/`，不是旧版的 `~/.ola/`）：

```bash
cat /~.aiops/settings.json
```

若 `/~.aiops/settings.json` 为空或缺少模型配置，将旧配置迁移过来：

```bash
cp ~/.ola/settings.json /~.aiops/settings.json
```

### 问题：连接模型服务失败

```bash
# 验证 API 是否可访问
curl $OPENAI_BASE_URL/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 检查配置是否生效
aiops --print-config   # 查看当前生效配置
```

### 问题：Node.js 版本不兼容

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

### 查看调试日志

```bash
DEBUG=1 aiops
```

日志文件位于 `/~.aiops/debug/` 目录。

---

## 发布到 Nexus（供团队共享安装）

将工具发布到内部 Nexus npm 仓库后，团队成员无需克隆源码，直接通过 `npm install -g` 安装即可使用。

### 1. 配置 Nexus 地址

编辑项目根目录的 `.npmrc`（已提供模板）：

```ini
# 所有包从 Nexus 安装
registry=https://nexus.your-org.com/repository/npm-public/

# @ai-platform scope 的包发布到 Nexus npm hosted
@ai-platform:registry=https://nexus.your-org.com/repository/npm-hosted/

# 认证（二选一）
# 方式 A：base64(username:password)
//nexus.your-org.com/repository/npm-hosted/:_auth=BASE64_OF_USER_PASS
//nexus.your-org.com/repository/npm-hosted/:always-auth=true

# 方式 B：token（推荐 CI 使用）
# //nexus.your-org.com/repository/npm-hosted/:_authToken=YOUR_TOKEN
```

生成 base64 认证串：

```bash
echo -n 'your-nexus-username:your-nexus-password' | base64
```

### 2. 构建并发布

```bash
# 在项目根目录执行
cd ai-platform/implementation/tools

# 构建所有包
npm run build

# 发布 CLI 包到 Nexus
npm publish --workspace=packages/cli

# 如需同时发布 core 包
npm publish --workspace=packages/core
```

> 首次发布需确认 Nexus 上已创建 `npm-hosted` 类型的仓库，并且账号有 `nx-repository-view-npm-*-*` 和 deploy 权限。

### 3. 修改版本号（可选）

```bash
# 修改所有包版本（同步更新 workspaces）
npm version patch --workspaces --include-workspace-root
# 或手动编辑 packages/cli/package.json 中的 version 字段
```

### 4. 团队成员安装

团队成员在 `~/.npmrc`（用户主目录）或项目 `.npmrc` 中配置 Nexus 地址后，直接全局安装：

```bash
# 配置用户级 .npmrc（一次性操作）
cat >> ~/.npmrc << 'EOF'
@ai-platform:registry=https://nexus.your-org.com/repository/npm-public/
//nexus.your-org.com/repository/npm-public/:_auth=BASE64_OF_USER_PASS
//nexus.your-org.com/repository/npm-public/:always-auth=true
EOF

# 全局安装
npm install -g @ai-platform/code-assistant

# 验证
aiops --version
```

### 5. CI/CD 自动发布（可选）

在 CI 环境中使用环境变量注入认证，避免将密钥写入文件：

```bash
# CI 环境变量
export NPM_TOKEN="your-nexus-token"

# 临时写入 .npmrc
echo "//nexus.your-org.com/repository/npm-hosted/:_authToken=${NPM_TOKEN}" >> .npmrc

# 发布
npm publish --workspace=packages/cli
```

---

## 相关链接

- 项目仓库：https://github.com/your-org/ai-platform
- 问题反馈：https://github.com/your-org/ai-platform/issues
- 原始项目：[ola](https://github.com/QwenLM/ola)（Apache 2.0）
