# OLA 权限系统使用手册

**版本**: v0.13.1  
**最后更新**: 2026 年 3 月 28 日

---

## 📖 目录

1. [权限系统概述](#权限系统概述)
2. [权限模式](#权限模式)
3. [ACP 权限流](#acp-权限流)
4. [配置权限](#配置权限)
5. [权限规则语法](#权限规则语法)
6. [使用示例](#使用示例)
7. [故障排查](#故障排查)

---

## 权限系统概述

OLA v0.13.1 引入了统一的权限管理系统，支持：

- 🔒 **跨客户端统一** - VSCode、CLI、Web 端权限流一致
- 📝 **人类可读标签** - 权限描述更清晰
- 🔄 **拒绝规则反馈** - 明确告知拒绝原因
- 📁 **文件路径优化** - 更准确的文件权限控制
- 🔐 **MCP 信任文件夹** - 支持受信任文件夹配置

---

## 权限模式

### 四种权限模式

| 模式        | 说明               | 适用场景     |
| ----------- | ------------------ | ------------ |
| `default`   | 默认模式，需要确认 | 日常开发     |
| `plan`      | 计划模式，批量确认 | 大型重构     |
| `auto_edit` | 自动编辑模式       | 可信项目     |
| `yolo`      | 完全自动模式       | 高度信任环境 |

### 切换权限模式

```bash
# 在 OLA 中
/approval_mode

# 或命令行启动时
ola --approval-mode=yolo
```

---

## ACP 权限流

### ACP (Agent Control Protocol)

ACP 是 OLA 的代理控制协议，负责：

1. **权限请求生成** - 根据工具操作生成权限请求
2. **权限决策路由** - 将请求发送到正确的处理者
3. **结果反馈** - 将决策结果返回给工具

### 权限请求流程

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Tool Call  │───>│ ACP Handler  │───>│ Permission  │
└─────────────┘    └──────────────┘    │   Manager   │
                                       └─────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ User Dialog  │
                                       │  or Hook     │
                                       └──────────────┘
```

---

## 配置权限

### 配置文件位置

- **项目级**: `.ola/settings.json`
- **用户级**: `~/.ola/settings.json`

### 基本配置

```json
{
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "permissions": {
    "defaultMode": "default",
    "trustedFolders": ["/path/to/trusted/project"],
    "rules": [
      {
        "pattern": "**/*.md",
        "tools": ["write_file", "edit"],
        "action": "allow"
      }
    ]
  }
}
```

### 配置字段说明

| 字段             | 类型   | 说明             |
| ---------------- | ------ | ---------------- |
| `defaultMode`    | string | 默认权限模式     |
| `trustedFolders` | array  | 受信任文件夹列表 |
| `rules`          | array  | 权限规则列表     |

---

## 权限规则语法

### 规则结构

```json
{
  "pattern": "文件匹配模式",
  "tools": ["工具名称列表"],
  "action": "allow | deny | ask",
  "reason": "规则说明"
}
```

### 文件匹配模式

支持 glob 模式：

| 模式    | 说明                     | 示例        |
| ------- | ------------------------ | ----------- | ---- |
| `*`     | 匹配任意字符（不含 `/`） | `*.txt`     |
| `**`    | 匹配任意字符（含 `/`）   | `**/*.md`   |
| `?`     | 匹配单个字符             | `file?.txt` |
| `[abc]` | 匹配字符集               | `file.[txt  | md]` |

### 工具名称

| 工具         | 说明            |
| ------------ | --------------- |
| `read_file`  | 读取文件        |
| `write_file` | 写入文件        |
| `edit`       | 编辑文件        |
| `bash`       | 执行 shell 命令 |
| `glob`       | 文件搜索        |
| `grep`       | 内容搜索        |

---

## 使用示例

### 示例 1：允许 Markdown 文件自动编辑

```json
{
  "permissions": {
    "rules": [
      {
        "pattern": "**/*.md",
        "tools": ["write_file", "edit"],
        "action": "allow",
        "reason": "Markdown 文件可自动编辑"
      }
    ]
  }
}
```

### 示例 2：禁止修改配置文件

```json
{
  "permissions": {
    "rules": [
      {
        "pattern": "**/{package.json,tsconfig.json,.eslintrc*}",
        "tools": ["write_file", "edit"],
        "action": "deny",
        "reason": "配置文件禁止自动修改"
      }
    ]
  }
}
```

### 示例 3：受信任文件夹

```json
{
  "permissions": {
    "trustedFolders": [
      "/Users/username/projects/trusted-project",
      "/Volumes/shared/dev"
    ],
    "rules": [
      {
        "pattern": "**/*",
        "tools": ["*"],
        "action": "allow",
        "reason": "受信任文件夹内完全信任"
      }
    ]
  }
}
```

### 示例 4：仅允许读取操作

```json
{
  "permissions": {
    "rules": [
      {
        "pattern": "**/*",
        "tools": ["read_file", "glob", "grep"],
        "action": "allow",
        "reason": "允许读取操作"
      },
      {
        "pattern": "**/*",
        "tools": ["write_file", "edit", "bash"],
        "action": "ask",
        "reason": "修改操作需要确认"
      }
    ]
  }
}
```

---

## MCP 信任文件夹

### 什么是 MCP

MCP (Model Context Protocol) 是 OLA 的上下文协议，支持：

- 文件夹信任状态管理
- 上下文文件自动加载
- 权限规则继承

### 配置 MCP 信任

```json
{
  "mcp": {
    "trustEnabled": true,
    "trustedFolders": [
      {
        "path": "/path/to/project",
        "isTrusted": true,
        "addedAt": "2026-03-28T10:00:00Z"
      }
    ]
  }
}
```

### 添加信任文件夹

在 OLA 中：

```
/mcp trust /path/to/project
```

---

## 故障排查

### 权限对话框不显示

**检查项**:

1. 确认权限模式不是 `yolo`
2. 检查是否有允许规则匹配
3. 查看调试日志：`DEBUG=ACP ola`

### 规则不生效

**调试方法**:

```bash
# 启用详细日志
export DEBUG=PERMISSION_*
ola

# 查看规则匹配
tail -f ~/.ola/debug/latest.log | grep PERMISSION
```

### 受信任文件夹不工作

**解决方案**:

1. 确认路径绝对正确
2. 检查文件夹是否存在
3. 重启 OLA 使配置生效

---

## 最佳实践

### ✅ 推荐

1. **最小权限原则** - 只授予必要的权限
2. **规则排序** - 具体规则在前，通用规则在后
3. **明确说明** - 为每条规则添加 `reason`
4. **定期审计** - 检查权限规则使用情况

### ❌ 避免

1. 在生产环境使用 `yolo` 模式
2. 对整个项目使用 `**/*` 允许规则
3. 添加不存在的受信任文件夹
4. 忽略权限规则的维护

---

## API 参考

### 权限决策类型

```typescript
type PermissionDecision = 'allow' | 'deny' | 'ask';

interface PermissionRequest {
  tool_name: string;
  file_path?: string;
  command?: string;
  reason: string;
}

interface PermissionResponse {
  decision: PermissionDecision;
  reason?: string;
}
```

---

## 相关文档

- [Hooks 系统文档](./hooks-user-guide.md)
- [LSP 功能文档](./lsp.md)
- [工具使用文档](../tools/index.md)

---

**支持邮箱**: dev-support@ola.ai  
**问题反馈**: 使用 `/bug` 命令提交
