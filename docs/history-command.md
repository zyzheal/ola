# `/history` 命令使用指南

## 概述

`/history` 命令提供了一个统一的入口来查看和管理操作历史记录，包括用户输入历史、工具调用历史、调试日志和会话文件。支持搜索、日期范围过滤和多种格式导出。

## 命令别名

- `/h` - 快捷方式

## 基本命令

### 1. 查看输入历史

**查看最近的用户输入**

```bash
/history                    # 显示最近 20 条输入
/history input              # 同上
/history input 10           # 显示最近 10 条输入（传统格式）
/history input --limit 50   # 显示最近 50 条输入
/history input -l 50        # -l 是 --limit 的简写
```

**带日期范围过滤**

```bash
/history input --since 2026-03-01     # 从 3 月 1 日开始的输入
/history input --until 2026-03-25     # 到 3 月 25 日为止的输入
/history input -s 2026-03-01 -u 2026-03-25  # 指定日期范围
```

**输出示例：**

```
Recent input history:
5. [2026/3/25 07:20:00] 帮我修复这个 bug
4. [2026/3/25 07:18:00] 查看当前的日志文件
3. [2026/3/25 07:15:00] 创建一个新组件
2. [2026/3/25 07:12:00] 如何优化性能
1. [2026/3/25 07:10:00] 初始化项目
```

### 2. 查看工具调用历史

```bash
/history tool               # 显示最近 20 个工具调用
/history tools              # 同上
/history tools 10           # 显示最近 10 个工具调用
/history tools --limit 30   # 显示最近 30 个工具调用
/history tools -s 2026-03-01  # 从指定日期开始的工具调用
```

**输出示例：**

```
Recent tool calls:
1. [2026/3/25 07:20:01] read_file({"path": "src/index.ts"})
2. [2026/3/25 07:20:02] write_file({"path": "src/utils.ts", "content": "..."})
3. [2026/3/25 07:20:03] run_shell_command({"command": "npm test"})
```

### 3. 查看调试日志

```bash
/history log                # 显示最近 50 行调试日志
/history logs               # 同上
/history debug              # 同上
/history log 100            # 显示最近 100 行日志
/history debug --keyword "error"   # 过滤包含 "error" 的日志
/history log -k "warning"   # -k 是 --keyword 的简写
```

**输出示例：**

```
Recent debug log:
```

2026-03-25T07:20:00.000Z [DEBUG] [CHAT_RECORDING] User message received
2026-03-25T07:20:01.000Z [INFO] [TOOL] Executing read_file
2026-03-25T07:20:02.000Z [ERROR] [TOOL] File read failed: permission denied

```

```

### 4. 查看会话列表

```bash
/history session            # 列出所有会话文件
/history sessions           # 同上
```

**输出示例：**

```
Available session files:
- session-2026-03-25.jsonl (2026-03-25, 128.5KB)
- session-2026-03-24.jsonl (2026-03-24, 256.3KB)
- session-2026-03-23.jsonl (2026-03-23, 64.2KB)
```

## 高级功能

### 5. 搜索历史

**按关键词搜索**

```bash
/history search "bug"               # 搜索包含 "bug" 的历史记录
/history search "error" -l 50       # 搜索 "error"，最多 50 条结果
/history search --keyword "fix"     # 使用完整参数名
```

**输出示例：**

```
Search results for "bug" (5 matches):
1. [User] [2026/3/25 07:20:00] 帮我修复这个 bug
2. [Assistant] [2026/3/25 07:20:05] 我已经修复了 bug，主要问题是...
3. [User] [2026/3/24 15:30:00] 还有一个 edge case 的 bug
4. [Assistant] [2026/3/24 15:30:10] 让我检查一下这个 bug...
5. [User] [2026/3/23 10:00:00] 之前提到的 bug 怎么样了？
```

### 6. 导出历史

**导出为不同格式**

```bash
/history export                       # 导出为 JSON（默认格式）
/history export --format jsonl        # 导出为 JSONL
/history export -f md                 # 导出为 Markdown
/history export -f txt                # 导出为纯文本
/history export -f json -o my-history.json  # 导出到指定文件
/history export --format md --output session.md
```

**支持的文件格式：**

- `json` - JSON 格式，适合程序处理
- `jsonl` - JSON Lines 格式，每行一个 JSON 对象
- `md` / `markdown` - Markdown 格式，适合阅读
- `txt` / `text` - 纯文本格式

**导出文件位置：**

- 默认导出到当前工作目录
- 文件名格式：`history-YYYY-MM-DDTHH-MM-SS.format`
- 使用 `-o` 参数可指定自定义文件名

## 命令选项

| 选项             | 简写      | 说明                         | 默认值   |
| ---------------- | --------- | ---------------------------- | -------- |
| `--limit N`      | `-l N`    | 显示项目数量                 | 20       |
| `--since DATE`   | `-s DATE` | 从指定日期开始 (YYYY-MM-DD)  | -        |
| `--until DATE`   | `-u DATE` | 到指定日期为止 (YYYY-MM-DD)  | -        |
| `--keyword WORD` | `-k WORD` | 按关键词搜索/过滤            | -        |
| `--format FMT`   | `-f FMT`  | 导出格式 (json/jsonl/md/txt) | json     |
| `--output FILE`  | `-o FILE` | 输出文件路径                 | 自动生成 |

## 使用场景

### 场景 1：回顾之前的操作

```bash
# 查看之前输入过什么
/history input 30

# 查看执行过哪些工具调用
/history tools

# 查看特定日期范围的操作
/history input -s 2026-03-01 -u 2026-03-15
```

### 场景 2：调试问题

```bash
# 查看最近的调试日志
/history debug 100

# 搜索特定错误
/history search "error" -l 30

# 过滤日志中的错误信息
/history log -k "ERROR"
```

### 场景 3：查找历史会话

```bash
# 列出所有会话文件
/history sessions

# 然后可以使用 /restore 命令恢复特定会话
```

### 场景 4：导出会话记录

```bash
# 导出为 Markdown 用于分享
/history export -f md

# 导出为 JSON 用于备份
/history export -f json -o backup.json

# 导出特定格式用于分析
/history export -f jsonl
```

### 场景 5：审计和合规

```bash
# 导出指定日期范围的所有操作
/history export -s 2026-03-01 -u 2026-03-31 -f json

# 搜索特定命令的使用记录
/history search "rm " -l 100
```

## 与其他命令的关系

- `/export` - 导出当前会话为 Markdown/HTML/JSON 格式
- `/restore` - 恢复之前的工具调用状态
- `/resume` - 继续之前的会话
- `/compress` - 压缩当前会话历史
- `/clear` - 清除当前会话历史
- `/copy` - 复制最后的结果到剪贴板

## 技术细节

### 存储位置

- **输入历史**: 从当前会话的聊天历史中提取
- **工具调用历史**: 从当前会话的聊天历史中提取
- **调试日志**: `~/.ola/debug/<session-id>.txt`
- **会话文件**: `<project-dir>/.ola/chats/*.jsonl`

### 环境变量

可以通过以下环境变量控制日志行为：

- `QWEN_DEBUG_LOG_FILE` - 设置为 `0` 或 `false` 禁用调试日志

## 最佳实践

1. **定期查看工具调用** - 了解 AI 执行了哪些操作
2. **保存重要会话** - 使用 `/export` 导出重要会话
3. **调试时查看详细日志** - 使用 `/history debug 200` 获取更多信息
4. **搜索特定问题** - 使用 `/history search "keyword"` 快速定位
5. **日期范围过滤** - 使用 `--since` 和 `--until` 精确筛选
6. **定期备份历史** - 使用 `/history export` 定期导出历史记录

## 命令速查表

```bash
# 基本查看
/history              # 最近 20 条输入
/history input 50     # 最近 50 条输入
/history tools        # 最近工具调用
/history debug        # 最近调试日志

# 日期过滤
/history input -s 2026-03-01          # 从 3 月 1 日开始
/history tools -u 2026-03-25          # 到 3 月 25 日
/history input -s 2026-03-01 -u 2026-03-25

# 搜索
/history search "bug"                 # 搜索关键词
/history log -k "error"               # 过滤日志

# 导出
/history export                       # 导出为 JSON
/history export -f md                 # 导出为 Markdown
/history export -f jsonl -o data.jsonl

# 会话管理
/history sessions                     # 列出会话
```

## 未来计划

- [ ] 支持按用户/助手角色过滤
- [ ] 支持正则表达式搜索
- [ ] 支持导出到外部存储（S3、GCS 等）
- [ ] 支持历史统计分析报告
- [ ] 支持批量删除历史会话
