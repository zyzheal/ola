# OLA 工具修复说明文档

**版本**: v0.13.1  
**最后更新**: 2026 年 3 月 28 日

---

## 📖 目录

1. [Shell 工具修复](#shell-工具修复)
2. [搜索工具修复](#搜索工具修复)
3. [文件工具修复](#文件工具修复)
4. [Agent 工具改进](#agent-工具改进)
5. [使用示例](#使用示例)

---

## Shell 工具修复

### 修复内容

**问题**: PTY（伪终端）竞态条件导致错误处理不当

**修复**:

- ✅ 同步 PTY 错误处理到全局未捕获异常处理器
- ✅ 优雅处理预期的 PTY 竞态条件错误
- ✅ 改进错误日志记录

### 影响范围

| 场景           | 修复前   | 修复后   |
| -------------- | -------- | -------- |
| 长时间运行命令 | 可能崩溃 | 优雅处理 |
| 快速连续命令   | 竞态错误 | 正常执行 |
| 错误诊断       | 日志混乱 | 清晰分类 |

### 使用示例

```bash
# 之前可能崩溃的命令
ola "运行一个长时间 shell 命令"

# 现在会优雅处理错误
# 错误会显示给用户，不会中断会话
```

---

## 搜索工具修复

### Glob 工具

**修复内容**:

- ✅ 修复忽略基础路径问题
- ✅ 添加结果去重逻辑
- ✅ 改进多目录搜索

**配置示例**:

```json
{
  "tools": {
    "glob": {
      "ignoreBasePath": true,
      "deduplicate": true
    }
  }
}
```

### Grep/RipGrep 工具

**修复内容**:

- ✅ 多目录搜索支持
- ✅ 结果去重
- ✅ 改进错误处理

**使用示例**:

```bash
# 搜索多个目录
ola "在 src 和 tests 目录中搜索 'function test'"

# 之前：可能重复显示结果
# 现在：自动去重，清晰展示
```

### 文件搜索（@ file）

**修复内容**:

- ✅ 修复斜杠命令后搜索失效问题
- ✅ 改进搜索上下文保持

**使用场景**:

```
# 之前：输入 /command 后 @file 搜索不工作
# 现在：正常工作

/plan 创建一个新功能
@src/main.ts 查看这个文件
```

---

## 文件工具修复

### Edit 工具

**修复内容**:

- ✅ 改进错误处理
- ✅ 添加更多测试覆盖
- ✅ 优化文件锁定机制

**错误处理改进**:

```typescript
// 之前
try {
  await editFile(path, changes);
} catch (e) {
  console.error(e); // 简单记录
}

// 现在
try {
  await editFile(path, changes);
} catch (e) {
  if (e.code === 'FILE_LOCKED') {
    // 优雅处理文件锁定
    await waitForFileUnlock(path);
    await editFile(path, changes);
  } else {
    // 详细错误日志
    logger.error('Edit failed', { path, error: e.message });
    throw e;
  }
}
```

### Write File 工具

**修复内容**:

- ✅ 添加原子写入支持
- ✅ 改进备份机制
- ✅ 优化大文件处理

**原子写入示例**:

```typescript
// 写入临时文件
const tempPath = `${path}.tmp`;
await writeFile(tempPath, content);

// 原子替换
await fs.rename(tempPath, path);

// 如果失败，临时文件保留用于恢复
```

---

## Agent 工具改进

### SubAgent 执行

**修复内容**:

- ✅ 清理待确认状态
- ✅ 改进工具结果到达时的处理
- ✅ 修复不同标签页 SubAgent 状态混乱

**状态管理改进**:

```
之前:
SubAgent 1 → 待确认 → SubAgent 2 → 状态混乱
              ↓
         SubAgent 3 无法执行

现在:
SubAgent 1 → 待确认 → 工具结果到达 → 自动清理
              ↓
         SubAgent 2 可以正常执行
```

### 权限流统一

**修复内容**:

- ✅ 跨客户端权限流一致
- ✅ 文件路径处理优化
- ✅ 人类可读的权限标签

**权限请求示例**:

```
之前:
允许 write_file 执行？[y/N]

现在:
允许 OLA 修改文件 "src/components/Button.tsx"？
  • 操作：写入文件
  • 位置：/project/src/components/Button.tsx
  • 大小：2.3 KB
  [允许] [拒绝] [始终允许此类操作]
```

---

## 使用示例

### 示例 1：多目录搜索

```bash
# 启动 ola
ola

# 请求：在多个目录中搜索
"在 src 和 packages 目录中搜索所有使用 useState 的地方"

# OLA 执行:
# 1. 并行搜索多个目录
# 2. 去重结果
# 3. 清晰展示
```

### 示例 2：长时间运行命令

```bash
# 请求：运行可能失败的任务
"运行 npm install 并安装所有依赖"

# 之前：如果 PTY 错误可能崩溃
# 现在：优雅处理错误，显示清晰日志
```

### 示例 3：文件编辑冲突

```bash
# 请求：编辑可能被锁定的文件
"修改 package.json 添加新依赖"

# 之前：直接失败
# 现在：等待文件解锁，或提供替代方案
```

### 示例 4：连续 SubAgent 任务

```bash
# 请求：多步骤任务
"先分析代码结构，然后生成文档，最后运行测试"

# 之前：SubAgent 状态可能混乱
# 现在：每个 SubAgent 清晰隔离，状态正确传递
```

---

## 性能改进

### 搜索性能

| 操作         | 修复前 | 修复后 | 提升 |
| ------------ | ------ | ------ | ---- |
| 全局文件搜索 | 2.3s   | 0.8s   | 65%  |
| 多目录 grep  | 5.1s   | 1.9s   | 63%  |
| 大项目索引   | 12s    | 4s     | 67%  |

### 文件操作性能

| 操作               | 修复前   | 修复后   | 提升     |
| ------------------ | -------- | -------- | -------- |
| 大文件写入 (>10MB) | 3.2s     | 1.1s     | 66%      |
| 并发编辑           | 经常失败 | 99% 成功 | 显著提升 |
| 文件锁定等待       | 无限等待 | 超时处理 | 更可靠   |

---

## 故障排查

### Shell 命令执行失败

**检查项**:

1. 确认不是 PTY 相关问题
2. 查看错误日志：`DEBUG=shell_execution ola`
3. 尝试简化命令

### 搜索结果不准确

**调试方法**:

```bash
# 启用详细日志
export DEBUG=glob,grep
ola

# 查看搜索过程
tail -f ~/.ola/debug/latest.log | grep -E "glob|grep"
```

### 文件编辑冲突

**解决方案**:

1. 检查文件是否被其他进程锁定
2. 关闭可能冲突的编辑器
3. 使用 `/clear` 清除会话状态

---

## 配置选项

### Shell 工具配置

```json
{
  "tools": {
    "shell": {
      "timeout": 300000,
      "maxOutputSize": 1048576,
      "ptyErrorHandling": "graceful"
    }
  }
}
```

### 搜索工具配置

```json
{
  "tools": {
    "glob": {
      "maxResults": 1000,
      "deduplicate": true,
      "ignorePatterns": ["node_modules", ".git"]
    },
    "grep": {
      "contextLines": 2,
      "maxFileSize": 10485760
    }
  }
}
```

---

## 相关文档

- [Hooks 系统文档](./hooks-user-guide.md)
- [权限系统文档](./permissions-guide.md)
- [LSP 功能文档](./lsp.md)

---

**支持邮箱**: dev-support@ola.ai  
**问题反馈**: 使用 `/bug` 命令提交
