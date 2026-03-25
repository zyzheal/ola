# 本地开发环境禁用自动更新指南

## 问题描述

在本地开发环境中，系统会检测到 npm 上的新版本并尝试自动更新，导致以下错误提示：

```
✕ Automatic update failed. Please try updating manually

● OLA update available! 0.13.0 → 1.2.1
  Installed with npm. Attempting to automatically update now...
```

## 解决方案

### 1. 修改更新检查逻辑

**文件**: `packages/cli/src/ui/utils/updateCheck.ts`

**修改内容**:

```typescript
export async function checkForUpdates(): Promise<UpdateObject | null> {
  try {
    // 跳过开发模式下的更新检查
    if (process.env['DEV'] === 'true' || process.env['NODE_ENV'] === 'development') {
      debugLogger.info('Skipping update check in development mode');
      return null;
    }

    // 跳过本地链接包的更新检查
    const pkgJson = packageJson as Record<string, unknown>;
    const fromField = pkgJson['_from'] as string | undefined;
    const resolvedField = pkgJson['_resolved'] as string | undefined;

    if (fromField?.includes('file:') || resolvedField?.includes('file:')) {
      debugLogger.info('Skipping update check for locally linked package');
      return null;
    }

    // ... 其余代码
  }
}
```

### 2. 修改自动更新处理逻辑

**文件**: `packages/cli/src/utils/handleAutoUpdate.ts`

**修改内容**:

```typescript
export function handleAutoUpdate(
  info: UpdateObject | null,
  settings: LoadedSettings,
  projectRoot: string,
  spawnFn: typeof spawn = spawnWrapper,
) {
  if (!info) {
    return;
  }

  // 在开发/本地模式下跳过自动更新
  if (
    process.env['DEV'] === 'true' ||
    process.env['NODE_ENV'] === 'development' ||
    process.env['OLA_LOCAL_DEV'] === 'true'
  ) {
    return;
  }

  // ... 其余代码
}
```

### 3. 修改 package.json 启动脚本

**文件**: `packages/cli/package.json`

**修改内容**:

```json
{
  "scripts": {
    "build": "node ../../scripts/build_package.js",
    "start": "NODE_ENV=development node dist/index.js",
    "start:prod": "node dist/index.js",
    "debug": "NODE_ENV=development node --inspect-brk dist/index.js"
  }
}
```

## 使用方法

### 正常启动（开发模式，无更新检查）

```bash
ola
# 或
npm start
```

### 生产模式启动（会检查更新）

```bash
npm run start:prod
```

### 手动设置环境变量

```bash
# 禁用更新检查
export OLA_LOCAL_DEV=true
ola

# 或
NODE_ENV=development ola
```

## 验证

启动后应该不再显示更新提示：

**修改前**:

```
✕ Automatic update failed. Please try updating manually
● OLA update available! 0.13.0 → 1.2.1
```

**修改后**:

```
┌──────────────────────────────────────────────────────────┐
│ >_ AI Platform Code Assistant (v0.13.0)                  │
│                                                          │
│ API Key | qwen3.5-plus (/model to change)                │
└──────────────────────────────────────────────────────────┘
```

## 环境变量说明

| 环境变量        | 值            | 说明                   |
| --------------- | ------------- | ---------------------- |
| `DEV`           | `true`        | 开发模式，跳过更新检查 |
| `NODE_ENV`      | `development` | Node.js 开发环境       |
| `OLA_LOCAL_DEV` | `true`        | OLA 本地开发模式       |

满足以上任一条件即可禁用自动更新。

## 文件清单

已修改的文件：

1. `packages/cli/src/ui/utils/updateCheck.ts` - 更新检查逻辑
2. `packages/cli/src/utils/handleAutoUpdate.ts` - 自动更新处理
3. `packages/cli/package.json` - 启动脚本

## 注意事项

1. **生产环境**: 在生产环境或用户安装版本中，应保持更新检查功能
2. **本地开发**: 使用 `npm link` 安装的本地版本应始终跳过更新检查
3. **CI/CD**: 在 CI/CD 环境中应设置 `NODE_ENV=production` 以进行测试

## 恢复更新检查

如果需要恢复更新检查功能（例如测试）：

```bash
# 使用生产模式启动
npm run start:prod

# 或清除环境变量
unset NODE_ENV
unset OLA_LOCAL_DEV
unset DEV
```
