# OLA 源码安装指南

AI Platform Code Assistant - 基于 ola 二次开发的 AI 编码助手

## 快速安装

```bash
# 进入项目目录
cd /path/to/ola

# 运行安装脚本
./scripts/install-global.sh
```

安装脚本会自动：

1. 检查 Node.js 版本（需要 >= 20）
2. 初始化 Git 仓库（如果需要）
3. 安装依赖
4. 构建项目
5. 全局安装
6. 验证安装
7. 创建配置目录

## 手动安装步骤

### 1. 检查系统要求

```bash
# 检查 Node.js 版本（需要 >= 20）
node --version

# 检查 npm 版本
npm --version
```

如果 Node.js 版本过低：

```bash
# 使用 nvm 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

### 2. 初始化 Git 仓库

```bash
cd /Users/heal/devops/ai-platform-design/implementation/tools

# 初始化 Git（如果未初始化）
git init
git add .
git commit -m "Initial OLA commit"
```

### 3. 安装依赖

```bash
# 如果有 package-lock.json
npm ci

# 或
npm install
```

### 4. 构建项目

```bash
# 构建所有包
npm run build

# 打包 CLI
npm run bundle
```

### 5. 全局安装

**方法 A：使用 npm link（推荐，开发模式）**

```bash
npm link
```

优点：

- 修改源码后立即生效
- 无需重新安装
- 适合开发调试

缺点：

- 依赖于源码目录存在

**方法 B：使用 npm install -g（生产模式）**

```bash
# 需要先临时禁用 prepare 脚本
npm install -g . --ignore-scripts

# 然后手动构建
cd /Users/heal/devops/ai-platform-design/implementation/tools
npm run build
npm run bundle
```

### 6. 验证安装

```bash
# 检查 ola 命令位置
which ola

# 查看版本
ola --version

# 查看帮助
ola --help

# 测试运行
ola -p "你好"
```

### 7. 配置目录

全局安装后，配置会保存在：

```
~/.ola/                          # 全局配置目录
├── settings.json                # 全局设置
├── installation_id              # 安装 ID
├── output-language.md           # 输出语言配置（已设置为 Chinese）
├── commands/                    # 用户命令
├── skills/                      # 用户技能
├── extensions/                  # 扩展
├── tmp/                         # 临时文件
├── debug/                       # 调试日志
└── projects/                    # 项目特定数据
```

项目级配置：

```
<project>/.ola/                  # 项目配置目录
├── settings.json                # 项目设置
├── commands/                    # 项目命令
└── skills/                      # 项目技能
```

## 更新方法

### 从源码更新

```bash
cd /Users/heal/devops/ai-platform-design/implementation/tools

# 1. 拉取最新代码
git pull origin main

# 2. 清理并重新构建
npm run clean
npm ci
npm run build
npm run bundle

# 3. 重新链接（npm link 会自动更新）
npm link
```

### 验证更新

```bash
ola --version
ola /status
```

## 卸载方法

```bash
# 全局卸载
npm unlink -g ola

# 清理配置目录（可选）
rm -rf ~/.ola

# 或备份配置
mv ~/.ola ~/.ola.backup
```

## 常见问题

### Q1: 安装后 `ola` 命令找不到

**解决方案**：

```bash
# 检查 npm 全局 bin 目录
npm config get prefix

# 添加到 PATH（~/.bashrc 或 ~/.zshrc）
export PATH=$(npm config get prefix)/bin:$PATH

# 重新加载
source ~/.bashrc  # 或 source ~/.zshrc
```

### Q2: 权限错误 (EACCES)

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
rm -rf packages/*/node_modules

# 重新安装
npm ci

# 重新构建
npm run build
```

### Q4: Git 仓库问题

如果提示 "fatal: not a git repository"：

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit"
```

## 环境变量

安装后可以设置以下环境变量：

```bash
# 设置运行时目录
export OLA_RUNTIME_DIR=~/.ola/runtime

# 设置语言
export OLA_CODE_LANG=Chinese

# 启用沙箱
export OLA_SANDBOX=docker

# 设置沙箱镜像
export OLA_SANDBOX_IMAGE=ghcr.io/your-org/ola:0.13.0
```

添加到 `~/.bashrc` 或 `~/.zshrc` 永久生效。

## 使用示例

```bash
# 启动交互式会话
ola

# 非交互式模式
ola -p "查看当前目录的文件结构"

# 指定模型
ola --model qwen-max -p "解释这段代码"

# 使用沙箱
ola -s -p "运行测试"

# 查看状态
ola
> /status

# 查看帮助
ola
> /help
```

## 相关文档

- [INSTALLATION.md](./docs/INSTALLATION.md) - 完整安装指南
- [OLA_CHANGES.md](./OLA_CHANGES.md) - 自定义修改记录
- [UPSTREAM_MANAGEMENT.md](./docs/UPSTREAM_MANAGEMENT.md) - 上游更新管理

## 技术支持

如有问题：

1. 查看 `ola --help`
2. 查看交互式帮助 `ola /help`
3. 查看文档目录 `docs/`
4. 查看调试日志 `~/.ola/debug/`
