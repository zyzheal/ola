# `ask_user_question` 工具使用指南

## 概述

`ask_user_question` 是一个用于在任务执行过程中向用户提问的工具，适用于：

- 收集用户偏好或需求
- 澄清模糊的指令
- 获取实现选择的决策
- 为用户提供方向选择

## 工具特性

### ✅ 三级缓存机制

| 缓存级别        | 存储位置 | 生命周期     | 文件路径                   |
| --------------- | -------- | ------------ | -------------------------- |
| **L1 - 会话级** | 内存     | 当前会话有效 | `Map` in memory            |
| **L2 - 项目级** | 磁盘     | 项目内持久化 | `.ola/answer-cache.json`   |
| **L3 - 用户级** | 磁盘     | 跨项目持久化 | `~/.ola/answer-cache.json` |

### ✅ 审批模式特殊处理

- **YOLO 模式**：仍需确认（需要用户回答）
- **Plan 模式**：允许执行（用于澄清需求）
- **有缓存答案**：自动批准

## 用法示例

### 示例 1：单选问题

```typescript
{
  "name": "ask_user_question",
  "arguments": {
    "questions": [
      {
        "question": "Which library should we use for date formatting?",
        "header": "Date Library",
        "options": [
          {
            "label": "dayjs",
            "description": "Lightweight and fast, good for simple use cases"
          },
          {
            "label": "date-fns",
            "description": "Modular and tree-shakable, modern API"
          },
          {
            "label": "Luxon",
            "description": "Full-featured with timezone support"
          }
        ],
        "multiSelect": false
      }
    ]
  }
}
```

**用户看到的界面：**

```
╭─ Date Library ─────────────────────────────╮
│ Which library should we use for date       │
│ formatting?                                │
│                                            │
│ › 1. dayjs                                 │
│      Lightweight and fast, good for        │
│      simple use cases                      │
│   2. date-fns                              │
│      Modular and tree-shakable, modern API │
│   3. Luxon                                 │
│      Full-featured with timezone support   │
│   4. Other (specify)                       │
│                                            │
│ Enter to select, ↑↓ to navigate, Esc to    │
│ cancel                                     │
╰────────────────────────────────────────────╯
```

### 示例 2：多选问题

```typescript
{
  "questions": [
    {
      "question": "Which features do you want to enable?",
      "header": "Features",
      "options": [
        {
          "label": "Dark Mode",
          "description": "Enable dark theme support"
        },
        {
          "label": "Notifications",
          "description": "Show push notifications"
        },
        {
          "label": "Analytics",
          "description": "Track usage analytics"
        }
      ],
      "multiSelect": true
    }
  ]
}
```

### 示例 3：多个问题

```typescript
{
  "questions": [
    {
      "question": "Which authentication method should we use?",
      "header": "Auth Method",
      "options": [
        {
          "label": "OAuth 2.0",
          "description": "Third-party authentication (Google, GitHub)"
        },
        {
          "label": "JWT",
          "description": "Token-based authentication"
        },
        {
          "label": "Session",
          "description": "Traditional session-based auth"
        }
      ],
      "multiSelect": false
    },
    {
      "question": "What database should we use?",
      "header": "Database",
      "options": [
        {
          "label": "PostgreSQL",
          "description": "Relational database with advanced features"
        },
        {
          "label": "MongoDB",
          "description": "NoSQL document database"
        },
        {
          "label": "Redis",
          "description": "In-memory key-value store"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

## 参数说明

### `questions` 数组（必填）

包含 1-4 个问题对象。

### 问题对象属性

| 属性          | 类型    | 必填 | 说明                                  |
| ------------- | ------- | ---- | ------------------------------------- |
| `question`    | string  | ✅   | 完整的问题文本，应以问号结尾          |
| `header`      | string  | ✅   | 简短标签（≤12 字符），显示为芯片/标签 |
| `options`     | array   | ✅   | 选项数组，2-4 个选项                  |
| `multiSelect` | boolean | ✅   | 是否允许多选                          |

### 选项对象属性

| 属性          | 类型   | 必填 | 说明                     |
| ------------- | ------ | ---- | ------------------------ |
| `label`       | string | ✅   | 选项显示文本（1-5 词）   |
| `description` | string | ✅   | 选项说明，解释含义或权衡 |

### `metadata`（可选）

用于追踪和分析的元数据。

```typescript
{
  "questions": [...],
  "metadata": {
    "source": "remember"  // 标识问题来源
  }
}
```

## 确认选项

当工具执行时，用户会看到以下确认选项：

```
╭─ Allow execution of: 'ask_user_question'? ─╮
│                                            │
│ › 1. Yes, allow once                       │  ← 会话级缓存
│   2. Always allow in this project [...]    │  ← 项目级缓存
│   3. Always allow for this user [...]      │  ← 用户级缓存
│   4. No, suggest changes (esc)             │
│                                            │
│ Enter to select, ↑↓ to navigate, Esc to    │
│ cancel                                     │
╰────────────────────────────────────────────╯
```

### 缓存级别说明

1. **Yes, allow once**（会话级）
   - 仅缓存当前会话
   - 重启 OLA 后清除
   - 适用于临时性问题的答案

2. **Always allow in this project**（项目级）
   - 缓存在 `.ola/answer-cache.json`
   - 项目内所有会话共享
   - 适用于项目特定的偏好

3. **Always allow for this user**（用户级）
   - 缓存在 `~/.ola/answer-cache.json`
   - 跨项目共享
   - 适用于用户的通用偏好

## 缓存查找优先级

```
内存缓存 (L1) → 项目缓存 (L2) → 用户缓存 (L3)
```

如果找到缓存答案，工具会：

- 自动批准执行
- 跳过确认对话框
- 直接使用缓存的答案

## 实际使用场景

### 场景 1：项目初始化

```
AI: 我需要了解您的项目偏好
   ╭─ Project Type ───────────────────────────╮
   │ What type of project are you creating?   │
   │                                          │
   │ › 1. Web Application                     │
   │   2. CLI Tool                            │
   │   3. Library/Package                     │
   │   4. Mobile App                          │
   ╰──────────────────────────────────────────╯

用户：选择 "Web Application"
AI: 好的，我将为您创建 Web 应用项目结构
```

### 场景 2：技术选型

```
AI: 让我确认一下技术栈
   ╭─ CSS Framework ──────────────────────────╮
   │ Which CSS framework do you prefer?       │
   │                                          │
   │ › 1. Tailwind CSS                        │
   │      Utility-first, highly customizable  │
   │   2. Bootstrap                           │
   │      Component-based, quick prototyping  │
   │   3. Material UI                         │
   │      React components, Material Design   │
   ╰──────────────────────────────────────────╯

用户：选择 "Tailwind CSS"，并选择 "Always allow in this project"
AI: 已记录您的偏好，后续类似问题将自动使用此选择
```

### 场景 3：需求澄清

```
AI: 我需要澄清一些需求
   ╭─ Features ───────────────────────────────╮
   │ Which features should be included in     │
   │ the MVP? (Select all that apply)         │
   │                                          │
   │ ☑ 1. User Authentication                 │
   │ ☐ 2. Payment Integration                 │
   │ ☑ 3. Dashboard                           │
   │ ☐ 4. Admin Panel                         │
   ╰──────────────────────────────────────────╯

用户：勾选 1 和 3
AI: 好的，MVP 将包含用户认证和仪表板功能
```

## 输出格式

工具执行后返回的内容：

```
User has provided the following answers:

**Auth Method**: OAuth 2.0
**Database**: PostgreSQL
```

这些答案会发送给 LLM，用于后续的任务执行。

## 注意事项

### ✅ 最佳实践

1. **问题清晰具体**：确保问题明确，以问号结尾
2. **选项平衡**：提供 2-4 个合理的选项
3. **说明简洁**：header ≤ 12 字符，label 1-5 词
4. **推荐选项置顶**：如果有推荐，放在第一个并标注 "(Recommended)"

### ⚠️ 限制

- 最多 4 个问题
- 每个问题 2-4 个选项
- header 不能超过 12 个字符
- 在非交互模式下无法使用（除非 ACP 模式）

### 🔒 隐私

- 缓存的答案仅包含用户选择的文本
- 项目级缓存在本地 `.ola/` 目录
- 用户级缓存在 `~/.ola/` 目录
- 不会上传到外部服务器

## 查看缓存

```bash
# 查看项目级缓存
cat .ola/answer-cache.json

# 查看用户级缓存
cat ~/.ola/answer-cache.json
```

## 相关文件

- 实现：`packages/core/src/tools/askUserQuestion.ts`
- 测试：`packages/core/src/tools/askUserQuestion.test.ts`
- 类型定义：`packages/cli/src/ui/hooks/useAskUserQuestion.ts`
