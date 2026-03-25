# 本地仓库自动更新功能实现指南

## 功能概述

实现了基于本地 Git 仓库的自动更新功能，当检测到项目是 Git 仓库时，会自动从远程仓库拉取最新代码并构建。

## 实现逻辑

### 1. 更新检测流程

```
启动应用
    ↓
检查是否为 Git 仓库？
    ├─ 是 → 检查远程 commit  hash
    │        ↓
    │     与本地不同？
    │        ├─ 是 → 显示更新提示
    │        └─ 否 → 已是最新
    │
    └─ 否 → 检查 npm 包更新
```

### 2. 自动更新流程

```
检测到更新
    ↓
显示更新提示
    ↓
用户确认（或自动）
    ↓
1. git fetch origin
2. git reset --hard origin/main
3. git clean -fd
4. npm run build
    ↓
更新完成
```

## 修改的文件

### 1. `packages/cli/src/utils/localRepoUpdate.ts` (新建)

**功能**: 本地仓库更新核心逻辑

**主要函数**:

```typescript
// 检查是否为 Git 仓库
export function isLocalGitRepo(projectRoot: string): boolean;

// 异步执行更新
export function updateFromLocalRepo(
  options: LocalRepoUpdateOptions,
  onProgress?: (message: string) => void,
  onComplete?: (result: LocalRepoUpdateResult) => void,
): void;

// 同步检查更新
export function checkForLocalRepoUpdate(
  projectRoot: string,
  branch: string = 'main',
  remote: string = 'origin',
): { hasUpdate: boolean; currentCommit: string; latestCommit: string };
```

**更新步骤**:

1. Fetch 远程仓库
2. 比较 commit hash
3. Reset 本地更改
4. Clean 未跟踪文件
5. 重新构建项目

### 2. `packages/cli/src/utils/handleAutoUpdate.ts` (修改)

**新增功能**:

- 导入 `localRepoUpdate` 模块
- 添加 `handleLocalRepoUpdate` 函数
- 在 `handleAutoUpdate` 中优先检查 Git 仓库

**代码示例**:

```typescript
// Check if this is a local git repository - use local repo update
if (isLocalGitRepo(projectRoot)) {
  handleLocalRepoUpdate(projectRoot, info);
  return;
}
```

### 3. `packages/cli/src/ui/utils/updateCheck.ts` (修改)

**新增功能**:

- 添加 `checkForLocalRepoUpdate` 函数
- 在主检查流程中优先检测 Git 仓库

**代码示例**:

```typescript
// Check if this is a local git repository
const gitDir = childProcess
  .execSync('git rev-parse --git-dir', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
  .trim();

if (gitDir) {
  return checkForLocalRepoUpdate(packageJson.version);
}
```

## 使用方法

### 自动更新（默认）

当检测到 Git 仓库且有更新时，会自动提示并尝试更新：

```
┌────────────────────────────────────────────────────────┐
│ Repository update available! (abc1234 → def5678)       │
│ Local git repository detected. Updating from remote... │
│                                                        │
│ Fetching latest changes from remote...                 │
│ Resetting local changes...                             │
│ Cleaning untracked files...                            │
│ Building project...                                    │
│ Update complete!                                       │
└────────────────────────────────────────────────────────┘
```

### 手动触发更新

```bash
# 通过命令（如果实现）
/updates
```

## 配置选项

### 环境变量

| 变量            | 值            | 说明               |
| --------------- | ------------- | ------------------ |
| `OLA_LOCAL_DEV` | `true`        | 禁用自动更新       |
| `NODE_ENV`      | `development` | 开发模式，禁用更新 |
| `DEV`           | `true`        | 开发模式，禁用更新 |

### 更新参数

在 `handleLocalRepoUpdate` 函数中可以配置：

```typescript
updateFromLocalRepo(
  {
    projectRoot: '/path/to/project',
    branch: 'main', // 分支名
    remote: 'origin', // 远程仓库名
  },
  onProgress,
  onComplete,
);
```

## 更新状态

### 成功响应

```typescript
{
  success: true,
  message: 'Successfully updated from abc1234 to def5678',
  updatedFrom: 'abc1234',
  updatedTo: 'def5678'
}
```

### 失败响应

```typescript
{
  success: false,
  message: 'Failed to fetch from remote: ...'
}
```

## 错误处理

### 常见错误及解决方案

| 错误                            | 原因                     | 解决方案           |
| ------------------------------- | ------------------------ | ------------------ |
| `Failed to fetch from remote`   | 网络问题或远程仓库不可达 | 检查网络连接       |
| `Failed to reset local changes` | 有未提交的更改           | 手动提交或暂存更改 |
| `Failed to build project`       | 构建失败                 | 检查依赖和代码错误 |
| `Not a git repository`          | 不是 Git 仓库            | 使用 npm 更新方式  |

## 测试验证

### 1. 检查 Git 仓库检测

```bash
cd /path/to/project
ola
# 应显示 Repository update available（如果有更新）
```

### 2. 检查更新流程

```bash
# 1. 修改本地文件
echo "test" >> test.txt

# 2. 启动应用
ola

# 3. 应看到重置本地更改的提示
```

### 3. 检查构建流程

```bash
# 1. 确保远程有更新
git pull origin main

# 2. 启动应用
ola

# 3. 应看到重新构建的提示
```

## 与原有更新逻辑的对比

| 特性     | NPM 包更新     | 本地仓库更新      |
| -------- | -------------- | ----------------- |
| 检测方式 | npm registry   | Git remote        |
| 更新命令 | npm install -g | git pull + build  |
| 适用场景 | 全局安装       | 本地开发/源码运行 |
| 更新速度 | 较慢           | 较快              |
| 可定制性 | 低             | 高（可指定分支）  |

## 注意事项

### 1. 本地更改

更新会**重置所有本地更改**，包括：

- 未提交的修改
- 暂存的文件
- 本地分支

**解决方案**: 更新前手动提交或暂存重要更改。

### 2. 构建依赖

更新后会自动执行 `npm run build`，需要确保：

- 依赖已安装 (`node_modules` 存在)
- 构建脚本正确配置

### 3. 权限问题

确保对以下目录有写权限：

- 项目根目录
- `dist/` 目录
- `node_modules/` 目录

## 未来改进

- [ ] 支持交互式确认（更新前询问用户）
- [ ] 支持备份本地更改
- [ ] 支持指定分支更新
- [ ] 支持更新回滚
- [ ] 添加更新日志显示

## 相关文件

- `packages/cli/src/utils/localRepoUpdate.ts` - 核心更新逻辑
- `packages/cli/src/utils/handleAutoUpdate.ts` - 自动更新处理
- `packages/cli/src/ui/utils/updateCheck.ts` - 更新检测
- `docs/local-dev-disable-auto-update.md` - 禁用更新指南
