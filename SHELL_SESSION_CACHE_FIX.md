# Shell 工具会话缓存修复总结

## 问题描述

用户发现选择"是，允许一次"（ProceedOnce）后，再次执行相同的 shell 命令时仍然会弹出确认对话框，会话缓存没有生效。

## 根本原因

`ShellToolInvocation.getDefaultPermission()` 方法没有检查会话级缓存，只检查了：

1. 命令替换（安全拒绝）
2. AST 只读检测
3. 默认返回 `'ask'`

**缺少**：会话级允许列表的检查

## 修复方案

### 1. 添加会话缓存

在 `ShellToolInvocation` 类中添加静态缓存：

```typescript
private static sessionShellAllowlist = new Map<string, string[]>();
```

- **Key**: 命令根（如 `curl`, `npm`）
- **Value**: 命令模式数组（如 `['npm run build', 'npm run test']`）

### 2. 修改 `getDefaultPermission()` 方法

在安全检查后、AST 检查前，添加会话缓存检查：

```typescript
// Check session-level allowlist first
const commandRoot = getCommandRoot(command);
if (commandRoot) {
  const allowedPatterns =
    ShellToolInvocation.sessionShellAllowlist.get(commandRoot);
  if (allowedPatterns) {
    for (const pattern of allowedPatterns) {
      if (this.matchesCommandPattern(command, pattern)) {
        return 'allow'; // 会话缓存命中，自动批准
      }
    }
  }
}
```

### 3. 添加模式匹配方法

支持通配符匹配（如 `npm run *` 匹配 `npm run build`）：

```typescript
private matchesCommandPattern(command: string, pattern: string): boolean {
  // Exact match
  if (command === pattern) {
    return true;
  }

  // Pattern with wildcard (e.g., "npm run *" matches "npm run build")
  if (pattern.endsWith(' *')) {
    const prefix = pattern.slice(0, -2);
    return command.startsWith(prefix + ' ');
  }

  return false;
}
```

### 4. 在 `getConfirmationDetails()` 中缓存命令

当用户选择"ProceedOnce"时，将命令添加到会话缓存：

```typescript
onConfirm: async (
  outcome: ToolConfirmationOutcome,
  _payload?: ToolConfirmationPayload,
) => {
  if (outcome === ToolConfirmationOutcome.ProceedOnce) {
    for (const rootCommand of rootCommands) {
      const pattern = this.params.command;
      ShellToolInvocation.addCommandToSessionAllowlist(rootCommand, pattern);
    }
  }
  // Project/User level persistence is handled by coreToolScheduler via PM rules
};
```

## 修复后的行为

### 场景 1：相同的命令

```
用户第一次执行：curl https://example.com
→ 弹出确认对话框
→ 用户选择"是，允许一次"
→ 命令执行成功

用户第二次执行：curl https://example.com
→ ✅ 自动批准（会话缓存命中）
→ 命令执行成功
```

### 场景 2：通配符模式

```
用户第一次执行：npm run build
→ 弹出确认对话框
→ 用户选择"是，允许一次"
→ 命令执行成功

用户第二次执行：npm run test
→ ❌ 仍然需要确认（因为缓存的是精确匹配 "npm run build"）
```

**注意**：当前实现缓存的是精确命令，如果需要通配符缓存，需要在 UI 层面支持用户输入模式（如 `npm run *`）。

## 缓存生命周期

| 缓存级别     | 存储位置               | 生命周期     | 清除时机       |
| ------------ | ---------------------- | ------------ | -------------- |
| **会话缓存** | 内存（Map）            | 当前会话     | OLA 重启后清除 |
| **项目缓存** | `.ola/settings.json`   | 项目内持久化 | 手动删除文件   |
| **用户缓存** | `~/.ola/settings.json` | 跨项目持久化 | 手动删除文件   |

## 测试方法

```bash
# 1. 启动 OLA
npm start

# 2. 执行需要确认的命令
/bye  # 先结束当前对话

# 3. 执行 shell 命令
curl https://example.com

# 4. 选择"是，允许一次"

# 5. 再次执行相同的命令
curl https://example.com

# 6. 验证：应该自动执行，不再弹出确认对话框

# 7. 重启 OLA 后再次执行
# 验证：会话缓存已清除，需要重新确认
```

## 相关文件

- 修改文件：`packages/core/src/tools/shell.ts`
- 测试文件：`packages/core/src/tools/shell.test.ts`（需要添加新测试）

## 后续优化建议

1. **通配符支持**：允许用户选择"允许所有 npm run \* 命令"
2. **域名匹配**：对于 `curl`、`wget` 等命令，支持按域名缓存
3. **路径匹配**：对于文件操作命令，支持按路径模式缓存
4. **缓存过期**：为会话缓存添加过期时间（如 30 分钟）
5. **缓存管理命令**：添加 `/shell-cache` 命令查看和管理会话缓存

## 提交信息

```
feat(shell): add session-level caching for "ProceedOnce" outcome

- Add static sessionShellAllowlist Map to ShellToolInvocation
- Check session cache in getDefaultPermission() before AST analysis
- Add command to session cache when user selects "ProceedOnce"
- Support wildcard pattern matching (e.g., "npm run *")
- Fix issue where "ProceedOnce" was not being respected

Fixes: Shell command session caching not working for "ProceedOnce" outcome
```
