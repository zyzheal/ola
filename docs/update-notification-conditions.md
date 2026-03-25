# 更新通知触发条件详解

## 简短回答

**不是只有源码启动才会收到更新通知！**

更新通知的触发取决于**安装方式**和**Git 仓库状态**，而不是启动方式。

## 更新检查逻辑流程

```
启动应用
    ↓
检查 enableAutoUpdate 设置
    ├─ false → 跳过更新检查
    └─ !== false → 继续检查
        ↓
检查是否为 Git 仓库？
    ├─ 是 → Git 仓库更新检查
    │        ↓
    │     有远程更新？
    │        ├─ 是 → 显示"Repository update available!"
    │        └─ 否 → 无提示
    │
    └─ 否 → NPM 包更新检查
             ↓
          有新版？
             ├─ 是 → 显示"OLA update available!"
             └─ 否 → 无提示
```

## 不同场景的更新通知

### 场景 1: 源码启动（Git 仓库）✅

```bash
# 克隆源码
git clone https://github.com/your-org/ai-platform.git
cd ai-platform
npm install
npm run build
npm link
ola
```

**更新检查**:

- ✅ 检测 Git 仓库
- ✅ 检查远程 commit
- ✅ 显示：`Repository update available! (abc1234 → def5678)`
- ✅ 自动执行：git pull + npm run build

### 场景 2: NPM 全局安装

```bash
npm install -g ola
ola
```

**更新检查**:

- ✅ 检测 NPM 包
- ✅ 检查 npm registry
- ✅ 显示：`OLA update available! 0.13.0 → 1.2.1`
- ✅ 自动执行：npm install -g @latest

### 场景 3: 本地链接开发

```bash
cd /path/to/ai-platform
npm link
ola
```

**更新检查**:

- ✅ 检测 Git 仓库（如果有 .git）
- ✅ 检查远程 commit
- ✅ 显示：`Repository update available!`
- ⚠️ 但当前代码会跳过（`_from` 包含 `file:`）

### 场景 4: 开发模式

```bash
NODE_ENV=development ola
# 或
npm start  # package.json 设置了 NODE_ENV=development
```

**更新检查**:

- ❌ 直接跳过（`process.env['DEV'] === 'true'`）
- ❌ 无提示

## 代码逻辑详解

### 1. 更新检查入口

**文件**: `packages/cli/src/gemini.tsx`

```typescript
// 只有 enableAutoUpdate !== false 时才检查
if (settings.merged.general?.enableAutoUpdate !== false) {
  checkForUpdates()
    .then((info) => {
      handleAutoUpdate(info, settings, config.getProjectRoot());
    })
    .catch((err) => {
      debugLogger.warn(`Update check failed: ${err}`);
    });
}
```

### 2. Git 仓库检测

**文件**: `packages/cli/src/ui/utils/updateCheck.ts`

```typescript
// 检查是否为 Git 仓库
const gitDir = childProcess
  .execSync('git rev-parse --git-dir', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
  .trim();

if (gitDir) {
  // 是 Git 仓库 → 检查远程 commit
  return checkForLocalRepoUpdate(packageJson.version);
}
```

### 3. 本地链接包检测

```typescript
// 跳过本地链接的包（npm link）
const pkgJson = packageJson as Record<string, unknown>;
const fromField = pkgJson['_from'] as string | undefined;
const resolvedField = pkgJson['_resolved'] as string | undefined;

if (fromField?.includes('file:') || resolvedField?.includes('file:')) {
  debugLogger.info('Skipping update check for locally linked package');
  return null; // ⚠️ 这里会跳过更新检查
}
```

### 4. 开发模式检测

```typescript
// 开发模式下跳过
if (
  process.env['DEV'] === 'true' ||
  process.env['NODE_ENV'] === 'development'
) {
  debugLogger.info('Skipping update check in development mode');
  return null; // ⚠️ 直接跳过
}
```

## 更新通知对比表

| 安装方式       | Git 检测 | NPM 检测 | 自动构建 | 通知消息                     |
| -------------- | -------- | -------- | -------- | ---------------------------- |
| **源码 + Git** | ✅       | ❌       | ✅       | Repository update available! |
| **NPM 全局**   | ❌       | ✅       | ✅       | OLA update available!        |
| **NPM 本地**   | ✅       | ❌       | ❌       | (跳过)                       |
| **开发模式**   | ❌       | ❌       | ❌       | (跳过)                       |
| **npx**        | ❌       | ❌       | ❌       | (跳过)                       |

## 配置选项

### 禁用自动更新

**方法 1**: 环境变量

```bash
export OLA_LOCAL_DEV=true
ola
```

**方法 2**: 配置文件

```json
// ~/.ola/settings.json
{
  "general": {
    "enableAutoUpdate": false
  }
}
```

**方法 3**: 启动脚本

```json
// package.json
{
  "scripts": {
    "start": "NODE_ENV=development node dist/index.js"
  }
}
```

### 启用自动更新

```json
// ~/.ola/settings.json
{
  "general": {
    "enableAutoUpdate": true
  }
}
```

## 常见问题

### Q1: 为什么我源码启动但没有更新提示？

**可能原因**:

1. 设置了 `NODE_ENV=development`
2. 设置了 `enableAutoUpdate: false`
3. 本地链接包检测跳过了（`_from` 包含 `file:`）

**解决方案**:

```bash
# 检查环境变量
echo $NODE_ENV  # 应该是 undefined 或 production

# 检查设置
cat ~/.ola/settings.json

# 确保是 Git 仓库
git rev-parse --git-dir  # 应该输出 .git
```

### Q2: 如何强制检查更新？

```bash
# 手动检查 Git 更新
git fetch origin
git diff origin/main

# 手动检查 NPM 更新
npm view ola version

# 手动更新
git pull origin main && npm run build
# 或
npm install -g ola@latest
```

### Q3: 更新通知多久检查一次？

**当前实现**: 每次启动都检查

- `updateCheckInterval: 0` 表示每次都检查

**修改频率**:

```typescript
// packages/cli/src/ui/utils/updateCheck.ts
const createNotifier = (distTag: 'latest' | 'nightly') =>
  updateNotifier({
    pkg: { name, version },
    updateCheckInterval: 1000 * 60 * 60 * 24, // 每天检查一次
    shouldNotifyInNpmScript: true,
    distTag,
  });
```

### Q4: 如何测试更新通知？

**测试 Git 更新**:

```bash
# 1. 确保是 Git 仓库
git rev-parse --git-dir

# 2. 模拟远程有更新
git fetch origin
git log HEAD..origin/main --oneline

# 3. 启动应用
ola

# 应看到：Repository update available!
```

**测试 NPM 更新**:

```bash
# 1. 查看当前版本
ola --version

# 2. 查看最新版
npm view ola version

# 3. 如果版本不同，启动时应看到提示
ola
```

## 总结

| 问题                     | 答案                                                         |
| ------------------------ | ------------------------------------------------------------ |
| 只有源码启动才有更新吗？ | **不是**，任何方式启动都会检查                               |
| 什么情况下有更新提示？   | Git 仓库有远程更新 或 NPM 有新版                             |
| 什么情况下无更新提示？   | 开发模式、本地链接包、禁用自动更新                           |
| 如何确保收到更新提示？   | 不要设置 `NODE_ENV=development` 和 `enableAutoUpdate: false` |

## 相关文件

- `packages/cli/src/gemini.tsx` - 更新检查入口
- `packages/cli/src/ui/utils/updateCheck.ts` - 更新检测逻辑
- `packages/cli/src/utils/handleAutoUpdate.ts` - 自动更新处理
- `packages/cli/src/utils/localRepoUpdate.ts` - Git 仓库更新
