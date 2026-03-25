# OLA 使用指南

AI Platform Code Assistant - 基于 ola 二次开发的 AI 编码助手

## 目录

1. [快速开始](#快速开始)
2. [安装方法](#安装方法)
3. [基本使用](#基本使用)
4. [常用命令](#常用命令)
5. [配置说明](#配置说明)
6. [环境变量](#环境变量)
7. [常见问题](#常见问题)

---

## 快速开始

```bash
# 1. 进入项目目录
cd /path/to/ola

# 2. 安装依赖
npm ci

# 3. 构建项目
npm run build && npm run bundle

# 4. 全局安装
npm link

# 5. 使用
ola -p "你好"
```

---

## 安装方法

### 方法一：源码安装（推荐）

```bash
# 进入项目目录
cd /path/to/ola

# 安装依赖
npm ci

# 构建
npm run build
npm run bundle

# 全局安装
npm link

# 验证
ola --version
```

### 方法二：使用安装脚本

```bash
cd /path/to/ola
./scripts/install-global.sh
```

### 方法三：npm 安装（如果已发布）

```bash
npm install -g ola
```

### 系统要求

- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS, Linux, Windows (WSL2 推荐)

---

## 基本使用

### 启动方式

```bash
# 交互式模式
ola

# 非交互式模式（一次性提示）
ola -p "查看当前目录的文件结构"

# 使用管道
echo "解释这段代码" | ola

# 指定模型
ola --model qwen-max -p "优化这段代码"
```

### 基本命令

```bash
# 查看版本
ola --version

# 查看帮助
ola --help

# 查看可用模型
ola --list-models

# 使用沙箱
ola -s -p "运行测试"
```

---

## 常用命令

### 交互式命令（在 ola 会话中使用）

```
/help              # 显示帮助信息
/clear             # 清除对话历史
/compress          # 压缩对话历史
/stats             # 显示会话统计
/usage             # 显示 token 使用情况
/model             # 查看/切换模型
/bug               # 提交 bug 报告
/exit              # 退出程序
```

### 工具命令

```
/read_file         # 读取文件
/write_file        # 写入文件
/edit              # 编辑文件
/run_command       # 运行命令
/grep              # 搜索内容
/glob              # 查找文件
/todo_write        # 管理任务列表
/ask_user          # 向用户提问
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

---

## 配置说明

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

### 配置文件示例

**~/.ola/settings.json**

```json
{
  "general": {
    "outputLanguage": "Chinese"
  },
  "tools": {
    "sandbox": false
  },
  "ui": {
    "hideTips": false
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  }
}
```

### 配置命令

```bash
# 查看当前配置
ola
> /settings

# 编辑配置
ola
> /settings edit

# 重置配置
rm ~/.ola/settings.json
```

---

## 环境变量

### 基本环境变量

```bash
# 设置运行时目录
export OLA_RUNTIME_DIR=~/.ola/runtime

# 设置输出语言
export OLA_CODE_LANG=Chinese

# 启用沙箱
export OLA_SANDBOX=docker

# 设置沙箱镜像
export OLA_SANDBOX_IMAGE=ghcr.io/your-org/ola:0.13.0

# 启用调试日志
export OLA_DEBUG_LOG_FILE=1
```

### IDE 集成环境变量

```bash
# IDE 工作区路径
export OLA_CODE_IDE_WORKSPACE_PATH=/path/to/workspace

# IDE 服务器端口
export OLA_CODE_IDE_SERVER_PORT=8080

# IDE 服务器命令
export OLA_CODE_IDE_SERVER_STDIO_COMMAND=env-cmd

# IDE 服务器参数
export OLA_CODE_IDE_SERVER_STDIO_ARGS='["--env-file=.env"]'
```

### 认证环境变量

```bash
# 默认认证类型
export OLA_DEFAULT_AUTH_TYPE=openai

# OAuth 启用
export OLA_OAUTH=true

# API Key（如果使用 OpenAI 兼容 API）
export OPENAI_API_KEY=your-api-key
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_MODEL=gpt-4o
```

### 向后兼容

以下旧环境变量仍然有效：

```bash
export QWEN_RUNTIME_DIR=~/.ola/runtime
export QWEN_CODE_LANG=Chinese
export QWEN_SANDBOX=docker
```

---

## 使用示例

### 代码分析

```bash
# 分析项目结构
ola -p "分析当前项目的目录结构"

# 查找特定功能
ola -p "查找所有与认证相关的代码"

# 解释代码
ola -p "解释这个函数的作用" src/auth.ts
```

### 代码修改

```bash
# 修复 bug
ola -p "修复这个 bug" src/buggy.ts

# 添加功能
ola -p "添加用户登录功能"

# 重构代码
ola -p "重构这个模块，使其更易读" src/legacy.ts
```

### 运行命令

```bash
# 运行测试
ola -p "运行单元测试"

# 构建项目
ola -p "构建项目"

# 安装依赖
ola -p "安装新的依赖包 lodash"
```

### 使用沙箱

```bash
# 启用沙箱运行
ola -s -p "运行这个脚本" script.sh

# 使用 Docker 沙箱
export OLA_SANDBOX=docker
ola -p "运行这个命令"
```

---

## 常见问题

### Q1: ola 命令找不到

**解决方案**：

```bash
# 检查 npm 全局 bin 目录
npm config get prefix

# 添加到 PATH
export PATH=$(npm config get prefix)/bin:$PATH

# 添加到 ~/.bashrc 或 ~/.zshrc 永久生效
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Q2: 权限错误

**解决方案**：

```bash
# 配置 npm 使用用户目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 重新安装
npm link
```

### Q3: 构建失败

**解决方案**：

```bash
# 清理
npm run clean
rm -rf node_modules

# 重新安装
npm ci

# 重新构建
npm run build
```

### Q4: 如何更新

**解决方案**：

```bash
# 源码安装
cd /path/to/ola
git pull
npm run build
npm link

# npm 安装
npm update -g ola
```

### Q5: 如何卸载

**解决方案**：

```bash
# 全局卸载
npm unlink -g ola

# 清理配置（可选）
rm -rf ~/.ola
```

---

## 更新日志

### v0.13.0

- 品牌名称从 aiops 改为 ola
- 配置目录从 .ola 改为 .ola
- 环境变量从 QWEN* 改为 OLA*（保留向后兼容）
- 默认输出语言设置为 Chinese

---

## 相关资源

- [OLA_CHANGES.md](../OLA_CHANGES.md) - 自定义修改记录
- [UPSTREAM_MANAGEMENT.md](./UPSTREAM_MANAGEMENT.md) - 上游更新管理
- [INSTALLATION.md](./INSTALLATION.md) - 完整安装指南

---

## 技术支持

如有问题：

1. 查看 `ola --help`
2. 查看交互式帮助 `ola /help`
3. 查看调试日志 `~/.ola/debug/`
4. 提交 Issue：https://github.com/your-org/ai-platform/issues
