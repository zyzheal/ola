# OLA Hooks 功能使用手册

**版本**: v0.13.1  
**最后更新**: 2026 年 3 月 28 日

---

## 📖 目录

1. [概述](#概述)
2. [启用 Hooks](#启用-hooks)
3. [Hook 事件类型](#hook-事件类型)
4. [配置格式](#配置格式)
5. [Matcher 匹配规则](#matcher-匹配规则)
6. [输入/输出规范](#输入输出规范)
7. [退出码说明](#退出码说明)
8. [使用示例](#使用示例)
9. [UI 管理界面](#ui-管理界面)
10. [故障排查](#故障排查)

---

## 概述

**Hooks（钩子）** 允许用户在 OLA 应用生命周期的特定事件点执行自定义脚本或程序，从而：

- 🔍 **监控审计** - 记录工具使用情况
- 🔒 **安全策略** - 执行安全检查
- 📝 **上下文注入** - 动态添加额外信息
- ⚙️ **行为定制** - 自定义应用行为
- 🔗 **外部集成** - 与外部系统交互

---

## 启用 Hooks

Hooks 目前为**实验性功能**，需要启动标志：

```bash
# 启动时启用
ola --experimental-hooks

# 或设置环境变量
export OLA_EXPERIMENTAL_HOOKS=1
ola
```

---

## Hook 事件类型

### 工具相关事件（4 种）

| 事件                 | 触发时机       | 典型用途           |
| -------------------- | -------------- | ------------------ |
| `PreToolUse`         | 工具执行前     | 权限检查、输入验证 |
| `PostToolUse`        | 工具成功后     | 日志记录、结果处理 |
| `PostToolUseFailure` | 工具失败后     | 错误处理、告警     |
| `PermissionRequest`  | 权限对话框显示 | 权限自动化         |

### 会话相关事件（3 种）

| 事件           | 触发时机   | 典型用途           |
| -------------- | ---------- | ------------------ |
| `SessionStart` | 会话开始   | 初始化、上下文设置 |
| `SessionEnd`   | 会话结束   | 清理、报告生成     |
| `Stop`         | 响应结束前 | 最终处理           |

### 其他事件（4 种）

| 事件               | 触发时机     | 典型用途       |
| ------------------ | ------------ | -------------- |
| `UserPromptSubmit` | 用户提交提示 | 输入处理、验证 |
| `Notification`     | 发送通知     | 通知定制       |
| `SubagentStart`    | 子代理启动   | 子代理初始化   |
| `SubagentStop`     | 子代理停止   | 子代理最终处理 |

---

## 配置格式

配置文件位置：`.ola/settings.json`

### 基本结构

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^bash$",
        "sequential": false,
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/script.sh",
            "name": "security-check",
            "description": "安全检查脚本",
            "timeout": 30000,
            "env": {
              "CUSTOM_VAR": "value"
            }
          }
        ]
      }
    ]
  }
}
```

### 配置字段说明

| 字段          | 类型    | 必填 | 说明                              |
| ------------- | ------- | ---- | --------------------------------- |
| `type`        | string  | ✅   | Hook 类型（目前仅支持 `command`） |
| `command`     | string  | ✅   | 要执行的命令或脚本路径            |
| `name`        | string  | ❌   | Hook 名称（用于日志和调试）       |
| `description` | string  | ❌   | Hook 描述                         |
| `timeout`     | number  | ❌   | 超时时间（毫秒），默认 30000      |
| `env`         | object  | ❌   | 环境变量                          |
| `matcher`     | string  | ❌   | 正则表达式匹配器                  |
| `sequential`  | boolean | ❌   | 是否顺序执行多个 hooks            |

---

## Matcher 匹配规则

### 支持 Match 的事件

| 事件类型       | 匹配目标         | 示例值                                |
| -------------- | ---------------- | ------------------------------------- |
| **工具事件**   | 工具名称（正则） | `^bash$`, `^(read_file\|write_file)$` |
| **子代理事件** | 代理类型（正则） | `^Bash$`, `^Explorer$`                |
| **会话开始**   | 来源（正则）     | `^startup$`, `^resume$`               |
| **会话结束**   | 原因（正则）     | `^clear$`, `^logout$`                 |
| **通知事件**   | 类型（精确）     | `permission_prompt`                   |
| **压缩事件**   | 触发器（精确）   | `manual`, `auto`                      |

### 不支持 Match 的事件

- `UserPromptSubmit`
- `Stop`

### 示例

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^bash$",
        "hooks": [{ "command": "check-bash.sh" }]
      },
      {
        "matcher": "^(read_file|write_file|edit)$",
        "hooks": [{ "command": "audit-file-ops.sh" }]
      }
    ]
  }
}
```

---

## 输入/输出规范

### 通用输入字段（所有事件）

```json
{
  "session_id": "abc-123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/dir",
  "hook_event_name": "PreToolUse",
  "timestamp": "2026-03-28T10:00:00Z"
}
```

### 事件特定输入

#### PreToolUse

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "tool_name": "bash",
  "tool_input": { "command": "ls -la" },
  "tool_use_id": "unique-id-123"
}
```

#### PostToolUse

```json
{
  "permission_mode": "yolo",
  "tool_name": "write_file",
  "tool_input": { "path": "/tmp/test.txt" },
  "tool_response": { "success": true },
  "tool_use_id": "unique-id-456"
}
```

#### UserPromptSubmit

```json
{
  "prompt": "用户的提示文本"
}
```

### 输出格式

#### 通用输出

```json
{
  "continue": true,
  "stopReason": "停止原因",
  "suppressOutput": false,
  "systemMessage": "系统消息",
  "decision": "allow | deny | block | ask",
  "reason": "决策原因",
  "hookSpecificOutput": {}
}
```

#### PreToolUse 特定输出

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow | deny | ask",
    "permissionDecisionReason": "决策原因",
    "updatedInput": { "修改后的输入" },
    "additionalContext": "额外上下文"
  }
}
```

---

## 退出码说明

| 退出码   | PreToolUse             | PostToolUse                   | UserPromptSubmit     |
| -------- | ---------------------- | ----------------------------- | -------------------- |
| **0**    | stdout/stderr 不显示   | stdout 显示 (transcript 模式) | stdout 显示给 Qwen   |
| **2**    | 显示 stderr 并阻止工具 | 立即显示 stderr 给模型        | 阻止处理，清空原提示 |
| **其他** | 仅显示 stderr 给用户   | 仅显示 stderr 给用户          | 仅显示 stderr 给用户 |

---

## 使用示例

### 示例 1：Bash 安全检查

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^bash$",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/bash-security.sh",
            "name": "bash-security",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# bash-security.sh

# 读取 JSON 输入
input=$(cat)
tool_input=$(echo "$input" | jq -r '.tool_input.command')

# 检查危险命令
if echo "$tool_input" | grep -qE "rm -rf /|sudo|chmod 777"; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "检测到危险命令，已阻止执行"
  }
}
EOF
  exit 2
fi

# 允许执行
cat <<EOF
{
  "hookSpecificOutput": {
    "permissionDecision": "allow",
    "permissionDecisionReason": "安全检查通过"
  }
}
EOF
exit 0
```

### 示例 2：会话日志记录

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "logger.sh",
            "name": "session-logger"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "logger.sh",
            "name": "session-logger"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# logger.sh

input=$(cat)
event_name=$(echo "$input" | jq -r '.hook_event_name')
session_id=$(echo "$input" | jq -r '.session_id')

echo "[$(date)] $event_name - Session: $session_id" >> /tmp/ola-hooks.log

exit 0
```

### 示例 3：提示词增强

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "prompt-enhancer.sh",
            "name": "prompt-enhancer"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# prompt-enhancer.sh

input=$(cat)
prompt=$(echo "$input" | jq -r '.prompt')

# 添加项目上下文
project_info="当前项目：$(basename $(pwd))"

cat <<EOF
{
  "hookSpecificOutput": {
    "additionalContext": "$project_info"
  }
}
EOF
exit 0
```

### 示例 4：文件操作审计

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "^(write_file|edit)$",
        "hooks": [
          {
            "type": "command",
            "command": "audit-file-changes.sh",
            "name": "file-audit",
            "timeout": 15000
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# audit-file-changes.sh

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
tool_input=$(echo "$input" | jq -r '.tool_input')
file_path=$(echo "$tool_input" | jq -r '.path // .file_path')

# 记录到审计日志
echo "[$(date)] $tool_name: $file_path" >> /tmp/ola-file-audit.log

# 可选：发送到外部系统
# curl -X POST https://audit-server.com/log -d "{\"file\": \"$file_path\"}"

exit 0
```

---

## UI 管理界面

### 打开 Hooks 管理对话框

在 OLA 中执行：

```
/hooks
```

或点击菜单中的 **Hooks** 选项。

### 界面功能

1. **HooksListStep** - 查看所有已配置的 Hooks
   - 按事件类型筛选
   - 显示 Hook 来源（项目/用户/系统）

2. **HookDetailStep** - 查看 Hook 详情
   - 命令内容
   - 超时设置
   - 环境变量

3. **HookConfigDetailStep** - 配置详情
   - 匹配器设置
   - 执行顺序

### 快捷键

| 按键     | 功能       |
| -------- | ---------- |
| `↑/↓`    | 导航选项   |
| `Enter`  | 确认选择   |
| `Esc`    | 返回上级   |
| `Ctrl+C` | 关闭对话框 |

---

## 故障排查

### Hook 未执行

**检查项**:

1. 确认已启用 `--experimental-hooks`
2. 检查 matcher 正则表达式是否正确
3. 查看调试日志：`DEBUG=TRUSTED_HOOKS ola`

### Hook 执行超时

**解决方案**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "command": "slow-script.sh",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

### Hook 输出解析错误

**调试方法**:

```bash
# 测试脚本输出格式
echo '{"test": "data"}' | ./your-hook.sh | jq .
```

**正确格式要求**:

- 必须是有效的 JSON
- 最后一行输出必须是 JSON（stdout）
- stderr 不影响解析

### 查看 Hook 执行日志

```bash
# 启用调试日志
export DEBUG=TRUSTED_HOOKS
ola

# 查看日志
tail -f ~/.ola/debug/latest.log | grep HOOK
```

---

## 最佳实践

### ✅ 推荐

1. **快速返回** - Hook 应在 100ms 内完成
2. **错误处理** - 捕获所有异常，避免中断主流程
3. **超时设置** - 为外部调用设置合理超时
4. **日志记录** - 记录关键执行信息
5. **最小权限** - Hook 脚本使用最小必要权限

### ❌ 避免

1. 长时间运行的操作（>30 秒）
2. 修改全局状态
3. 依赖可能不可用的外部服务
4. 忽略超时和错误处理

---

## API 参考

### Hook 输入类型定义

```typescript
interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  timestamp: string;
}

interface PreToolUseInput extends HookInput {
  permission_mode: 'default' | 'plan' | 'auto_edit' | 'yolo';
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_use_id: string;
}
```

### Hook 输出类型定义

```typescript
interface HookOutput {
  continue?: boolean;
  stopReason?: string;
  suppressOutput?: boolean;
  systemMessage?: string;
  decision?: 'ask' | 'block' | 'deny' | 'approve' | 'allow';
  reason?: string;
  hookSpecificOutput?: Record<string, unknown>;
}
```

---

## 相关文档

- [Hooks 系统设计文档](./docs/hook_design/hooks_ui/hooks_ui_implement.md)
- [权限系统文档](./docs/users/features/permissions.md)
- [工具使用文档](./docs/users/tools/index.md)

---

**支持邮箱**: dev-support@ola.ai  
**问题反馈**: 使用 `/bug` 命令提交
