# Shell 工具会话缓存自动测试报告

## 测试结果

✅ **所有 6 个会话缓存测试全部通过！**

```
✓ ShellTool > Session-level command caching > should cache command after ProceedOnce selection
✓ ShellTool > Session-level command caching > should not cache different commands
✓ ShellTool > Session-level command caching > should clear session cache
✓ ShellTool > Session-level command caching > should handle compound commands
✓ ShellTool > Session-level command caching > should not affect read-only commands
✓ ShellTool > Session-level command caching > should still deny command substitution even if cached
```

## 测试用例说明

### 1. ✅ should cache command after ProceedOnce selection

**测试内容**：

- 第一次执行 `curl https://example.com` → 返回 'ask'
- 模拟用户选择 "ProceedOnce"
- 第二次执行相同命令 → 返回 'allow'（缓存命中）

**验证**：会话缓存正确工作

### 2. ✅ should not cache different commands

**测试内容**：

- 缓存 `curl https://example.com`
- 执行不同的命令 `curl https://different.com` → 仍然返回 'ask'

**验证**：缓存不会错误地应用到不同命令

### 3. ✅ should clear session cache

**测试内容**：

- 缓存 `npm run build`
- 验证缓存命中 → 'allow'
- 调用 `clearSessionAllowlist()`
- 再次执行 → 返回 'ask'（缓存已清除）

**验证**：缓存清除功能正常工作

### 4. ✅ should handle compound commands

**测试内容**：

- 缓存复合命令 `npm install && npm run build`
- 再次执行相同复合命令 → 返回 'allow'

**验证**：复合命令的缓存正确工作

### 5. ✅ should not affect read-only commands

**测试内容**：

- 执行只读命令 `ls -la` → 直接返回 'allow'

**验证**：只读命令不受缓存机制影响（AST 检测优先）

### 6. ✅ should still deny command substitution even if cached

**测试内容**：

- 缓存正常命令 `echo hello`
- 执行命令替换 `echo $(cat /etc/passwd)` → 返回 'deny'

**验证**：安全检查优先于缓存，防止安全绕过

## 测试覆盖率

| 功能点       | 测试覆盖 | 状态 |
| ------------ | -------- | ---- |
| 基本缓存功能 | ✅       | 通过 |
| 命令隔离     | ✅       | 通过 |
| 缓存清除     | ✅       | 通过 |
| 复合命令     | ✅       | 通过 |
| 只读命令优先 | ✅       | 通过 |
| 安全检查优先 | ✅       | 通过 |

## 测试代码位置

- 测试文件：`packages/core/src/tools/shell.test.ts`
- 测试套件：`describe('Session-level command caching')`
- 测试用例数：6

## 运行测试

```bash
cd packages/core
npm test -- --run src/tools/shell.test.ts
```

## 关键测试代码示例

```typescript
it('should cache command after ProceedOnce selection', async () => {
  const invocation = shellTool.build({
    command: 'curl https://example.com',
    is_background: false,
  });

  // First call - should return 'ask'
  const firstPermission = await invocation.getDefaultPermission();
  expect(firstPermission).toBe('ask');

  // Get confirmation details and simulate ProceedOnce
  const confirmationDetails = await invocation.getConfirmationDetails(
    new AbortController().signal,
  );
  await (confirmationDetails as any).onConfirm('proceed_once');

  // Second call with same command - should return 'allow' from cache
  const invocation2 = shellTool.build({
    command: 'curl https://example.com',
    is_background: false,
  });
  const secondPermission = await invocation2.getDefaultPermission();
  expect(secondPermission).toBe('allow');
});
```

## 结论

✅ **所有会话缓存功能测试通过，修复验证成功！**

修复后的 Shell 工具现在正确实现了"是，允许一次"（ProceedOnce）的会话级缓存功能：

- 用户选择 ProceedOnce 后，相同命令会自动批准
- 缓存仅在内存中，OLA 重启后清除
- 不影响项目级和用户级的持久化缓存
- 安全检查（命令替换检测）优先于缓存
- 只读命令的 AST 检测优先于缓存
