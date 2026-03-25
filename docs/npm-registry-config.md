# NPM 私服配置指南

## 功能概述

支持配置私有 NPM 仓库进行版本更新检查，适用于企业内部二开后将包发布到本地私房的场景。

## 配置方式

### 方法一：环境变量（推荐）

#### 1. 配置 NPM 仓库地址

```bash
# 临时设置（当前终端有效）
export OLA_NPM_REGISTRY=https://npm.your-company.com
ola

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export OLA_NPM_REGISTRY=https://npm.your-company.com' >> ~/.bashrc
source ~/.bashrc
ola
```

#### 2. 配置包名称

```bash
# 如果包名称不是默认的 'ola'
export OLA_PACKAGE_NAME=your-custom-ola
ola
```

#### 3. 完整配置示例

```bash
# 配置私服地址和包名
export OLA_NPM_REGISTRY=https://npm.your-company.com
export OLA_PACKAGE_NAME=@your-org/ola

# 启动应用
ola

# 验证配置
ola --version
```

### 方法二：使用 NPM 配置

```bash
# 设置 NPM 仓库（全局）
npm config set registry https://npm.your-company.com

# 验证配置
npm config get registry

# 启动应用（会自动使用配置的 registry）
ola
```

### 方法三：.npmrc 文件

在项目根目录或用户目录创建 `.npmrc` 文件：

```ini
# 项目级 .npmrc
registry=https://npm.your-company.com

# 或用户级 ~/.npmrc
registry=https://npm.your-company.com
@your-org:registry=https://npm.your-company.com
```

## 环境变量说明

| 变量名                | 说明             | 默认值                     | 示例                         |
| --------------------- | ---------------- | -------------------------- | ---------------------------- |
| `OLA_NPM_REGISTRY`    | NPM 仓库地址     | https://registry.npmjs.org | https://npm.your-company.com |
| `OLA_PACKAGE_NAME`    | 包名称           | ola                        | @your-org/ola                |
| `NPM_CONFIG_REGISTRY` | NPM 配置仓库地址 | -                          | https://npm.your-company.com |

## 优先级顺序

```
OLA_NPM_REGISTRY > NPM_CONFIG_REGISTRY > npm config get registry > 默认公网地址
```

## 更新检查流程

```
启动应用
    ↓
读取环境变量
    ↓
OLA_NPM_REGISTRY ?
    ├─ 有值 → 使用配置的私服地址
    ├─ 无值 → NPM_CONFIG_REGISTRY ?
    │          ├─ 有值 → 使用配置
    │          └─ 无值 → npm config get registry
    │                     ├─ 有值 → 使用配置
    │                     └─ 无值 → 默认公网
    ↓
检查更新
    ↓
显示提示：OLA update available! x.x.x → y.y.y
```

## 常见私服配置

### Verdaccio

```bash
# 安装 Verdaccio
npm install -g verdaccio

# 启动
verdaccio

# 配置 OLA
export OLA_NPM_REGISTRY=http://localhost:4873
export OLA_PACKAGE_NAME=ola

# 发布包到 Verdaccio
npm adduser --registry http://localhost:4873
npm publish --registry http://localhost:4873

# 使用
ola
```

### Nexus Repository

```bash
# Nexus NPM 仓库地址
export OLA_NPM_REGISTRY=http://nexus.your-company.com/repository/npm-group/
export OLA_PACKAGE_NAME=ola

# 使用
ola
```

### Artifactory

```bash
# Artifactory NPM 仓库地址
export OLA_NPM_REGISTRY=https://artifactory.your-company.com/artifactory/api/npm/npm-local/
export OLA_PACKAGE_NAME=ola

# 使用
ola
```

### 淘宝镜像

```bash
# 使用淘宝镜像
export OLA_NPM_REGISTRY=https://registry.npmmirror.com
export OLA_PACKAGE_NAME=ola

# 使用
ola
```

## 自动更新配置

### 启用自动更新

```json
// ~/.aip-code/settings.json
{
  "general": {
    "enableAutoUpdate": true
  }
}
```

### 禁用自动更新

```bash
# 方法 1: 环境变量
export OLA_LOCAL_DEV=true

# 方法 2: 配置文件
// ~/.aip-code/settings.json
{
  "general": {
    "enableAutoUpdate": false
  }
}
```

## 更新命令

### NPM 全局安装

```bash
# 自动更新（如果 enableAutoUpdate=true）
ola  # 启动时自动检查

# 手动更新
npm install -g ola@latest --registry https://npm.your-company.com
```

### Yarn 全局安装

```bash
# 手动更新
yarn global add ola@latest --registry https://npm.your-company.com
```

### PNPM 全局安装

```bash
# 手动更新
pnpm add -g ola@latest --registry https://npm.your-company.com
```

## 调试

### 查看更新检查日志

```bash
# 启用调试模式
export DEBUG=UPDATE_CHECK
ola

# 输出示例
# UPDATE_CHECK Using registry: https://npm.your-company.com, package: ola
# UPDATE_CHECK Local commit: abc1234, Remote commit: def5678
```

### 验证配置

```bash
# 1. 检查环境变量
echo $OLA_NPM_REGISTRY
echo $OLA_PACKAGE_NAME

# 2. 检查 NPM 配置
npm config get registry

# 3. 测试包访问
curl -s https://npm.your-company.com/ola | head -20

# 4. 查看最新版本
npm view ola version --registry https://npm.your-company.com
```

### 常见问题排查

**问题 1: 不显示更新提示**

```bash
# 检查是否启用了自动更新
cat ~/.aip-code/settings.json | grep enableAutoUpdate

# 检查环境变量
env | grep OLA

# 检查是否是 Git 仓库（会优先使用 Git 更新）
git rev-parse --git-dir
```

**问题 2: 更新失败**

```bash
# 检查网络连接
curl -I https://npm.your-company.com

# 检查认证
npm whoami --registry https://npm.your-company.com

# 手动测试更新命令
npm install -g ola@latest --registry https://npm.your-company.com --verbose
```

**问题 3: 使用了错误的仓库**

```bash
# 清除所有相关环境变量
unset OLA_NPM_REGISTRY
unset OLA_PACKAGE_NAME
unset NPM_CONFIG_REGISTRY

# 重新设置
export OLA_NPM_REGISTRY=https://npm.your-company.com
export OLA_PACKAGE_NAME=ola

# 验证
npm config get registry
```

## 完整配置示例

### 企业环境配置

```bash
# ~/.bashrc

# NPM 私服配置
export OLA_NPM_REGISTRY=https://npm.internal.company.com
export OLA_PACKAGE_NAME=@company/ola

# 启用自动更新
export OLA_ENABLE_AUTO_UPDATE=true

# 代理配置（如果需要）
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### 开发环境配置

```bash
# ~/.zshrc

# 开发模式（禁用更新）
export NODE_ENV=development
export OLA_LOCAL_DEV=true

# 或使用本地 Git 仓库
# cd /path/to/ai-platform
# ola  # 会自动从 Git 更新
```

### CI/CD 配置

```yaml
# .gitlab-ci.yml

stages:
  - build
  - deploy

variables:
  OLA_NPM_REGISTRY: 'https://npm.internal.company.com'
  OLA_PACKAGE_NAME: '@company/ola'

build:
  stage: build
  script:
    - npm config set registry $OLA_NPM_REGISTRY
    - npm install
    - npm run build

deploy:
  stage: deploy
  script:
    - npm install -g $OLA_PACKAGE_NAME@latest --registry $OLA_NPM_REGISTRY
    - ola --version
```

## 发布流程

### 1. 修改代码

```bash
# 克隆源码
git clone https://github.com/your-org/ai-platform.git
cd ai-platform

# 修改代码
vim packages/cli/src/...

# 构建
npm run build
```

### 2. 修改 package.json

```json
{
  "name": "@your-org/ola",
  "version": "0.14.0",
  "publishConfig": {
    "registry": "https://npm.your-company.com"
  }
}
```

### 3. 发布到私服

```bash
# 登录
npm adduser --registry https://npm.your-company.com

# 发布
npm publish --registry https://npm.your-company.com
```

### 4. 验证发布

```bash
# 查看版本
npm view @your-org/ola versions --registry https://npm.your-company.com

# 安装测试
npm install -g @your-org/ola@latest --registry https://npm.your-company.com

# 运行
ola --version
```

## 相关文件

- `packages/cli/src/ui/utils/updateCheck.ts` - 更新检查逻辑
- `packages/cli/src/utils/installationInfo.ts` - 安装信息检测
- `packages/cli/src/utils/handleAutoUpdate.ts` - 自动更新处理

## 总结

### 快速配置

```bash
# 1. 设置私服地址
export OLA_NPM_REGISTRY=https://npm.your-company.com

# 2. 设置包名（可选）
export OLA_PACKAGE_NAME=@your-org/ola

# 3. 启动
ola
```

### 验证

```bash
# 查看配置
echo $OLA_NPM_REGISTRY
echo $OLA_PACKAGE_NAME

# 启动并查看日志
DEBUG=UPDATE_CHECK ola
```
