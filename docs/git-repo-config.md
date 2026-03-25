# Git 仓库配置指南

## 1. 自动编译说明

**是的，从 Git 仓库更新后会自动编译！**

更新流程包含 5 个步骤：

```bash
# 1. 获取远程最新代码
git fetch origin

# 2. 重置本地分支到远程状态
git reset --hard origin/main

# 3. 清理未跟踪的文件
git clean -fd

# 4. 自动编译构建 ⭐
npm run build

# 5. 完成
Update complete!
```

## 2. Git 仓库地址配置

### 方法一：克隆时配置

```bash
# 从 GitHub 克隆
git clone https://github.com/your-org/ai-platform.git
cd ai-platform

# 从 GitLab 克隆
git clone https://gitlab.com/your-org/ai-platform.git
cd ai-platform

# 从私有仓库克隆
git clone git@github.com:your-org/ai-platform.git
cd ai-platform
```

### 方法二：手动添加远程仓库

```bash
# 初始化本地仓库
git init

# 添加远程仓库（origin）
git remote add origin https://github.com/your-org/ai-platform.git

# 验证配置
git remote -v
# 输出:
# origin  https://github.com/your-org/ai-platform.git (fetch)
# origin  https://github.com/your-org/ai-platform.git (push)
```

### 方法三：修改现有远程仓库

```bash
# 查看当前远程仓库
git remote -v

# 修改 origin 地址
git remote set-url origin https://github.com/new-org/ai-platform.git

# 或者添加新的 remote
git remote add upstream https://github.com/original-org/ai-platform.git
```

## 3. 配置文件位置

Git 远程仓库信息存储在：

```
<project-root>/.git/config
```

查看内容：

```bash
cat .git/config
```

示例输出：

```ini
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
[remote "origin"]
    url = https://github.com/your-org/ai-platform.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main
```

## 4. 常用远程仓库配置

### 添加多个远程仓库

```bash
# 添加主仓库
git remote add origin https://github.com/your-org/ai-platform.git

# 添加镜像仓库
git remote add mirror https://gitlab.com/your-org/ai-platform.git

# 查看所有 remote
git remote -v

# 从特定 remote 拉取
git pull origin main
git pull mirror main
```

### 配置 SSH 密钥访问

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your@email.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 将公钥添加到 GitHub/GitLab

# 测试连接
ssh -T git@github.com
```

### 配置代理（国内访问 GitHub）

```bash
# 配置 HTTP 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 5. OLA 自动更新配置

### 默认配置

OLA 默认使用以下配置进行自动更新：

```typescript
{
  projectRoot: process.cwd(),  // 当前工作目录
  branch: 'main',               // 主分支
  remote: 'origin'              // 远程仓库名
}
```

### 自定义配置（代码中）

修改 `packages/cli/src/utils/handleAutoUpdate.ts`：

```typescript
updateFromLocalRepo(
  {
    projectRoot,
    branch: 'develop', // 自定义分支
    remote: 'upstream', // 自定义 remote
  },
  onProgress,
  onComplete,
);
```

### 通过环境变量配置

创建 `.env` 文件或设置环境变量：

```bash
# 指定分支
export OLA_UPDATE_BRANCH=develop

# 指定 remote
export OLA_UPDATE_REMOTE=upstream

# 禁用自动构建（如果已有构建产物）
export OLA_SKIP_BUILD=false
```

## 6. 验证配置

### 检查 Git 仓库

```bash
# 确认是 Git 仓库
git rev-parse --git-dir
# 输出：.git

# 查看当前分支
git branch
# 输出：* main

# 查看远程仓库
git remote -v
# 输出：origin  https://...
```

### 测试更新

```bash
# 手动测试 fetch
git fetch origin

# 查看远程状态
git status

# 查看与远程的差异
git diff origin/main

# 测试构建
npm run build
```

### 测试 OLA 自动更新

```bash
# 1. 确保远程有更新
git pull origin main

# 2. 启动 OLA
ola

# 3. 应看到更新提示
Repository update available! (abc1234 → def5678)
Fetching latest changes from remote...
Building project...
Update complete!
```

## 7. 常见问题

### Q1: 如何切换分支？

```bash
# 查看可用分支
git branch -a

# 切换到现有分支
git checkout develop

# 创建并切换新分支
git checkout -b feature/new-feature
```

### Q2: 如何更新特定分支？

```bash
# 拉取特定分支
git pull origin develop

# 设置上游分支
git branch --set-upstream-to=origin/develop develop
```

### Q3: 自动更新失败怎么办？

```bash
# 1. 手动更新
git fetch origin
git reset --hard origin/main
git clean -fd
npm install  # 如果需要
npm run build

# 2. 检查权限
ls -la .git
chmod -R 755 .git

# 3. 检查磁盘空间
df -h
```

### Q4: 如何禁用自动构建？

修改 `packages/cli/src/utils/localRepoUpdate.ts`：

```typescript
// 注释掉构建步骤
// const buildProcess = spawn('npm', ['run', 'build'], {
//   cwd: projectRoot,
//   stdio: 'pipe',
//   shell: process.platform === 'win32',
// });
```

### Q5: 如何使用不同的构建命令？

修改构建命令：

```typescript
// 使用 yarn
const buildProcess = spawn('yarn', ['build'], { ... });

// 使用 pnpm
const buildProcess = spawn('pnpm', ['build'], { ... });

// 使用自定义命令
const buildProcess = spawn('make', ['build'], { ... });
```

## 8. 完整配置示例

### 开发环境配置

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/ai-platform.git
cd ai-platform

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 全局链接
npm link

# 5. 测试
ola --version
```

### 生产环境配置

```bash
# 1. 克隆指定版本
git clone --branch v1.0.0 https://github.com/your-org/ai-platform.git
cd ai-platform

# 2. 安装生产依赖
npm install --production

# 3. 构建
npm run build

# 4. 全局安装
npm install -g .
```

### 多环境配置

```bash
# 开发环境
git checkout develop
npm install
npm run dev

# 测试环境
git checkout test
npm install
npm run build

# 生产环境
git checkout main
npm install --production
npm run build
```

## 9. 自动化脚本

### 更新脚本

创建 `scripts/update.sh`：

```bash
#!/bin/bash

echo "🔄 Starting update..."

# Fetch latest
git fetch origin

# Reset to remote
git reset --hard origin/main

# Clean untracked files
git clean -fd

# Install dependencies
npm install

# Build
npm run build

echo "✅ Update complete!"
```

使用：

```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

### 定时更新（Cron）

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点更新
0 2 * * * cd /path/to/ai-platform && ./scripts/update.sh
```

## 10. 相关文件

- `packages/cli/src/utils/localRepoUpdate.ts` - 更新逻辑
- `packages/cli/src/utils/handleAutoUpdate.ts` - 自动更新处理
- `packages/cli/src/ui/utils/updateCheck.ts` - 更新检测
