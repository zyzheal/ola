# OLA 安装指南

AI Platform Code Assistant - 基于 ola 二次开发的 AI 编码助手

## 目录

1. [系统要求](#系统要求)
2. [安装方法](#安装方法)
3. [验证安装](#验证安装)
4. [更新方法](#更新方法)
5. [卸载](#卸载)
6. [常见问题](#常见问题)

---

## 系统要求

- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS, Linux, Windows (WSL2 推荐)

### 检查 Node.js 版本

```bash
node --version  # 应该显示 v20.x.x 或更高
npm --version   # 应该显示 9.x.x 或更高
```

如果版本过低，请升级：

```bash
# 使用 nvm (推荐)
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 全局安装方法

### 方法一：从源码安装（推荐用于开发）

```bash
# 1. 克隆或进入项目目录
cd /path/to/ola

# 2. 安装依赖
npm ci

# 3. 构建项目
npm run build

# 4. 打包（生成 dist/cli.js）
npm run bundle

# 5. 全局链接（开发模式）
npm link

# 或使用全局安装
npm install -g .
```

### 方法二：从 npm 安装（如果已发布）

```bash
# 安装最新版本
npm install -g ola

# 或安装特定版本
npm install -g ola@0.13.0

# 或安装测试版本
npm install -g ola@preview
npm install -g ola@nightly
```

### 方法三：使用 npx（无需安装）

```bash
# 临时使用
npx ola -p "查看当前目录"

# 或指定版本
npx ola@latest -p "查看当前目录"
```

---

## 验证安装

### 检查安装位置

```bash
# 查看 ola 命令位置
which ola

# 查看详细信息
ola --version
ola --help
```

### 测试基本功能

```bash
# 启动交互式会话
ola

# 非交互式模式
ola -p "查看当前目录的文件"

# 查看状态
ola
> /status
```

### 检查配置目录

```bash
# 全局配置目录应该在 ~/.ola
ls -la ~/.ola/

# 应该包含以下文件：
# - settings.json
# - installation_id
# - output-language.md
```

---

## 更新到新版本

### 从源码更新

```bash
# 1. 进入项目目录
cd /path/to/ola

# 2. 拉取最新代码
git pull origin main

# 3. 清理旧的构建
npm run clean

# 4. 重新安装依赖
npm ci

# 5. 重新构建
npm run build
npm run bundle

# 6. 重新全局安装
npm install -g .

# 或如果使用 npm link
npm link
```

### 从 npm 更新

```bash
# 更新到最新版本
npm update -g ola

# 或强制重新安装最新版本
npm install -g ola@latest

# 更新到特定版本
npm install -g ola@0.14.0
```

### 检查更新

```bash
# 查看当前版本
ola --version

# 查看是否有新版本
npm view ola version

# 比较版本
npm outdated -g ola
```

### 自动化更新脚本

创建 `~/.ola/scripts/update.sh`：

```bash
#!/bin/bash

echo "正在更新 OLA..."

# 如果是源码安装
if [ -d "~/ola" ]; then
  cd ~/ola
  git pull
  npm run clean
  npm ci
  npm run build
  npm run bundle
  npm install -g .
  echo "✅ 更新完成！"
else
  # 如果是 npm 安装
  npm update -g ola
  echo "✅ 更新完成！"
fi

echo "当前版本：$(ola --version)"
```

---

## 卸载

### 从 npm 卸载

```bash
# 全局卸载
npm uninstall -g ola

# 清理配置目录（可选）
rm -rf ~/.ola

# 或备份配置后删除
mv ~/.ola ~/.ola.backup
```

### 从源码卸载

```bash
# 如果使用了 npm link
cd /path/to/ola
npm unlink

# 全局卸载
npm uninstall -g ola
```

---

## 常见问题

### Q1: 安装后 `ola` 命令不可用

**解决方案**：

```bash
# 1. 检查 npm 全局 bin 目录是否在 PATH 中
npm config get prefix

# 2. 将全局 bin 目录添加到 PATH
# macOS/Linux
export PATH=$(npm config get prefix)/bin:$PATH

# Windows (PowerShell)
$env:Path += ";$(npm config get prefix)\bin"

# 3. 添加到 ~/.bashrc 或 ~/.zshrc 永久生效
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Q2: 权限错误 (EACCES)

**解决方案**：

```bash
# 方法 1: 使用 sudo（不推荐）
sudo npm install -g ola

# 方法 2: 修复 npm 权限（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 方法 3: 使用 nvm（最佳）
nvm install 20
nvm use 20
npm install -g ola
```

### Q3: 更新后出现奇怪的问题

**解决方案**：

```bash
# 1. 完全清理
npm uninstall -g ola
rm -rf ~/.ola
npm cache clean --force

# 2. 重新安装
npm install -g ola

# 3. 重新配置
ola
# 按照提示完成初始配置
```

### Q4: 如何回退到旧版本

```bash
# 查看可用版本
npm view ola versions

# 安装特定版本
npm install -g ola@0.12.0

# 源码安装则使用 git tag
cd /path/to/ola
git checkout v0.12.0
npm ci
npm run build
npm install -g .
```

### Q5: 如何查看安装详情

```bash
# 查看全局安装的包
npm list -g --depth=0

# 查看 ola 的详细信息
npm view ola

# 查看安装位置
npm root -g
```

---

## 版本管理

### 使用 nvm 管理多个版本

```bash
# 安装不同版本的 Node.js 来管理 ola
nvm install 20
nvm use 20
npm install -g ola@0.13.0

nvm install 22
nvm use 22
npm install -g ola@latest
```

### 使用 npx 测试不同版本

```bash
# 无需安装，直接测试
npx ola@0.13.0 -p "test"
npx ola@latest -p "test"
```

---

## 配置文件位置

| 类型     | 路径                             | 说明       |
| -------- | -------------------------------- | ---------- |
| 全局配置 | `~/.ola/settings.json`           | 用户级配置 |
| 项目配置 | `<project>/.ola/settings.json`   | 项目级配置 |
| 输出语言 | `~/.ola/output-language.md`      | 语言设置   |
| 调试日志 | `~/.ola/debug/<session-id>.txt`  | 调试信息   |
| 会话历史 | `~/.ola/tmp/<project-id>/chats/` | 会话记录   |

---

## 环境变量

| 变量名               | 说明           | 示例                          |
| -------------------- | -------------- | ----------------------------- |
| `OLA_RUNTIME_DIR`    | 运行时输出目录 | `~/.ola/runtime`              |
| `OLA_CODE_LANG`      | 输出语言       | `Chinese`                     |
| `OLA_SANDBOX`        | 沙箱类型       | `docker`                      |
| `OLA_SANDBOX_IMAGE`  | 沙箱镜像       | `ghcr.io/your-org/ola:0.13.0` |
| `OLA_DEBUG_LOG_FILE` | 启用调试日志   | `1`                           |

向后兼容：`QWEN_*` 环境变量仍然有效。

---

## 相关资源

- [OLA_CHANGES.md](./OLA_CHANGES.md) - 自定义修改记录
- [UPSTREAM_MANAGEMENT.md](./docs/UPSTREAM_MANAGEMENT.md) - 上游更新管理
- [README.md](./README.md) - 项目说明

---

## 联系与支持

如有问题，请查看：

- `ola --help` - 命令行帮助
- `ola /help` - 交互式帮助
- 项目文档目录 `docs/`
