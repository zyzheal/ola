# OLA Hooks 配置说明

## 概述

Hooks 允许在特定事件发生时自动执行自定义脚本，用于扩展和定制 OLA 的行为。

> **⚠️ 实验性功能**
>
> Hooks 目前处于实验阶段，需要启用才能使用。

## 已配置的 Hooks

当前项目已配置以下 Hooks：

### 1. 安全检测 Hook (`security-check.sh`)

- **事件**: `PreToolUse`
- **用途**: 在工具执行前检测危险命令
- **阻止的操作**:
  - `rm -rf /` 等危险删除命令
  - `dd if=/dev/zero` 等磁盘操作
  - `chmod 777 /` 等权限设置
  - `curl | bash` 等远程执行

### 2. 工具日志 Hook (`tool-logger.sh`)

- **事件**: `PostToolUse`
- **用途**: 记录所有工具的执行情况
- **日志文件**: `.ola/hooks/tool-execution.log`

### 3. 会话初始化 Hook (`session-init.sh`)

- **事件**: `SessionStart`
- **用途**: 会话开始时加载项目上下文
- **功能**:
  - 检测项目类型（Node.js、Python、Rust 等）
  - 获取 Git 分支信息
  - 记录会话日志

### 4. 提示验证 Hook (`prompt-validator.sh`)

- **事件**: `UserPromptSubmit`
- **用途**: 验证用户输入的提示
- **功能**:
  - 检测敏感信息（密码、密钥等）
  - 检查提示长度
  - 提供警告信息

## 使用方法

### 启用 Hooks

启动 OLA 时添加 `--experimental-hooks` 标志：

```bash
ola --experimental-hooks
```

### 查看日志

```bash
# 查看安全检测日志
cat .ola/hooks/security-check.log

# 查看工具执行日志
cat .ola/hooks/tool-execution.log

# 查看会话日志
cat .ola/hooks/session-log.log
```

## 自定义 Hooks

### 创建新的 Hook 脚本

1. 在 `.ola/hooks/` 目录下创建脚本文件

2. 脚本必须从 stdin 读取 JSON 输入

3. 根据需要输出 JSON 响应

4. 设置执行权限：`chmod +x .ola/hooks/your-script.sh`

### 示例：添加一个代码审查 Hook

**`.ola/hooks/code-review.sh`**

```bash
#!/bin/bash

INPUT=$(cat)
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# 检查是否包含 TODO 注释
if echo "$TOOL_INPUT" | grep -q "TODO"; then
    echo '{
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "additionalContext": "注意：代码中包含 TODO 注释，建议后续处理。"
        }
    }'
fi

exit 0
```

**在 settings.json 中添加配置**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^write_file$",
        "hooks": [
          {
            "type": "command",
            "command": ".ola/hooks/code-review.sh",
            "name": "code-review",
            "description": "代码审查",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

## Hook 事件类型

| 事件                 | 触发时机     | 支持 Matcher |
| -------------------- | ------------ | ------------ |
| `PreToolUse`         | 工具执行前   | ✅ 工具名    |
| `PostToolUse`        | 工具执行后   | ✅ 工具名    |
| `PostToolUseFailure` | 工具执行失败 | ✅ 工具名    |
| `UserPromptSubmit`   | 用户提交提示 | ❌           |
| `SessionStart`       | 会话开始     | ✅ 来源      |
| `SessionEnd`         | 会话结束     | ✅ 原因      |
| `Notification`       | 发送通知     | ✅ 类型      |

## 配置说明

### Matcher 模式

- **空字符串 `""`**: 匹配所有
- **工具名**: 如 `^bash$` 只匹配 bash
- **正则表达式**: 如 `^(read_file|write_file)$`

### 执行顺序

- **`sequential: false`** (默认): 并行执行，性能更好
- **`sequential: true`**: 顺序执行，可用于依赖链

### 超时设置

- 默认超时：60 秒
- 建议设置：5-10 秒
- 防止 hook 挂起影响使用

## 故障排除

### Hook 不执行

1. 检查是否使用 `--experimental-hooks` 启动
2. 检查 settings.json 配置是否正确
3. 检查脚本是否有执行权限

### Hook 执行失败

1. 查看 `.ola/hooks/` 目录下的日志文件
2. 确保脚本能正确处理 JSON 输入
3. 检查 jq 等依赖是否安装

### 禁用特定 Hook

在 settings.json 中注释或删除对应配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": ".ola/hooks/security-check.sh",
            "name": "security-check"
            // 暂时禁用
          }
        ]
      }
    ]
  }
}
```

## 最佳实践

1. **保持脚本简洁**: Hook 脚本应该快速执行，避免影响用户体验
2. **错误处理**: 确保脚本能处理各种边界情况
3. **日志记录**: 记录关键操作便于排查问题
4. **测试验证**: 在正式使用前充分测试
5. **版本控制**: 将 hook 脚本纳入版本管理

## 安全注意事项

1. Hook 脚本以用户权限运行
2. 谨慎配置项目级 hooks（需要信任文件夹）
3. 定期审查 hook 脚本内容
4. 避免在 hook 中执行危险操作
