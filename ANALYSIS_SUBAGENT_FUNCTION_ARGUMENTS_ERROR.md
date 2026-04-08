# 子 Agent 调用错误分析报告

## 问题现象

调用多个子 agent 时出现错误：

```
Failed to run subagent: 400 <400> InternalError.Algo.InvalidParameter:
The "function.arguments" parameter of the code model must be in JSON format.
```

## 根本原因

### 错误位置

文件：`packages/core/src/core/openaiContentGenerator/converter.ts`

**问题代码**（第 320 行和 472 行）：

```typescript
arguments: JSON.stringify(part.functionCall.args || {});
```

### 问题原因

1. **循环引用问题**
   - 当 `part.functionCall.args` 包含循环引用的对象时（如 `HttpsProxyAgent`、网络 socket 对象等）
   - `JSON.stringify` 会抛出错误：`"Converting circular structure to JSON"`
   - 导致生成的 `function.arguments` 字段不是有效的 JSON 字符串

2. **DashScope API 的严格验证**
   - DashScope（通义千问）API 对 `function.arguments` 字段的 JSON 格式验证非常严格
   - 如果 `JSON.stringify` 失败或产生无效 JSON，会返回 400 错误
   - 错误信息：`InternalError.Algo.InvalidParameter`

3. **已有的解决方案未应用**
   - 项目中已经有 `safeJsonParse` 来处理 JSON 解析问题
   - 在 `telemetry/loggers.ts` 中已经有循环引用处理逻辑
   - 但在 `converter.ts` 中构建工具调用参数时没有使用类似的保护机制

### 代码路径

```
用户请求
  ↓
AgentTool.execute()
  ↓
SubagentManager.createAgentHeadless()
  ↓
AgentHeadless.create()
  ↓
AgentCore.runReasoningLoop()
  ↓
GeminiChat.sendMessageStream()
  ↓
OpenAIContentGenerator.generateContentStream()
  ↓
ContentGenerationPipeline.executeStream()
  ↓
OpenAIContentConverter.convertGeminiRequestToOpenAI()
  ↓
processContent() → 构建 tool_calls
  ↓
JSON.stringify(part.functionCall.args) ❌ 这里可能失败
  ↓
OpenAI API / DashScope API
  ↓
错误返回：function.arguments 必须是有效的 JSON 格式
```

## 修复方案

### 方案 1：使用循环引用安全的 JSON.stringify（推荐）

创建一个新的工具函数 `safeStringify`，在 `converter.ts` 中使用：

```typescript
// packages/core/src/utils/safeStringify.ts
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely stringify objects with circular references.
 * Uses a WeakSet to track seen objects and skip circular references.
 *
 * @param value - The value to stringify
 * @param fallbackValue - Fallback value if stringification fails
 * @returns JSON string or fallback value stringified
 */
export function safeStringify<T = unknown>(
  value: T,
  fallbackValue: string = '{}',
): string {
  if (value === null || value === undefined) {
    return fallbackValue;
  }

  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (_key, val) => {
      if (typeof val !== 'object' || val === null) {
        return val;
      }

      // Circular reference detected
      if (seen.has(val)) {
        return '[Circular]';
      }

      seen.add(val);
      return val;
    });
  } catch (error) {
    // If all else fails, return the fallback value
    return fallbackValue;
  }
}
```

然后在 `converter.ts` 中替换：

```typescript
// 第 320 行和 472 行
import { safeStringify } from '../../utils/safeStringify.js';

// 替换前：
arguments: JSON.stringify(part.functionCall.args || {});

// 替换后：
arguments: safeStringify(part.functionCall.args || {});
```

### 方案 2：使用 jsonrepair 的 stringify 功能

如果 `jsonrepair` 库提供了 stringify 功能，可以直接使用。

### 方案 3：在工具调用执行前清理参数

在 `CoreToolScheduler` 中执行工具调用前，清理参数中的循环引用。

## 影响范围

### 受影响的场景

1. ✅ **调用多个子 agent** - 主要问题场景
2. ✅ **使用包含循环引用的工具** - 如网络相关的工具
3. ✅ **DashScope 提供商** - 对 JSON 格式验证最严格
4. ⚠️ **其他 OpenAI 兼容提供商** - 可能也有类似问题但错误处理更宽松

### 不受影响的场景

1. ✅ 简单的工具调用（无循环引用）
2. ✅ 纯文本参数
3. ✅ 简单的对象参数（无嵌套引用）

## 测试建议

### 单元测试

1. 测试 `safeStringify` 函数：
   - 正常对象
   - 循环引用对象
   - null/undefined
   - 嵌套对象

2. 测试 `converter.ts`：
   - 包含循环引用的 functionCall
   - 正常的 functionCall
   - 空的 functionCall

### 集成测试

1. 测试子 agent 调用：
   - 单个子 agent
   - 多个子 agent 连续调用
   - 嵌套子 agent 调用

2. 测试 DashScope 提供商：
   - 使用 DashScope API 调用子 agent
   - 验证工具调用参数格式

## 相关文件

- `packages/core/src/core/openaiContentGenerator/converter.ts` - 需要修复的文件
- `packages/core/src/utils/safeJsonParse.ts` - 参考实现
- `packages/core/src/telemetry/loggers.test.circular.ts` - 循环引用测试示例
- `packages/core/src/utils/schemaConverter.ts` - 相关工具函数

## 下一步行动

1. ✅ 创建 `safeStringify` 工具函数
2. ✅ 在 `converter.ts` 中使用 `safeStringify`
3. ✅ 添加单元测试
4. ✅ 运行集成测试验证修复
5. ✅ 更新 CHANGELOG

## 参考

- 错误日志：`InternalError.Algo.InvalidParameter: The "function.arguments" parameter of the code model must be in JSON format`
- 相关测试：`packages/core/src/telemetry/loggers.test.circular.ts`
- DashScope 文档：https://help.aliyun.com/zh/dashscope/
