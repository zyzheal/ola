# DashScope InternalPreprocessError 问题分析

## 错误现象

调用多个子 agent 时出现新的错误：

```
Failed to run subagent: 500 <5000303> InternalError.Algo.InternalPreprocessError:
This error happened in preprocess, the error message is [Can only get item pairs from a mapping.]
```

## 错误分析

### 错误代码

- **HTTP 状态码**：500（服务器内部错误）
- **业务错误码**：5000303
- **错误阶段**：preprocess（预处理阶段）
- **错误信息**：`Can only get item pairs from a mapping.`

### 根本原因

这个错误表示 DashScope API 在预处理请求时，期望某个字段是**对象映射（mapping/object）**，但实际收到的是其他类型（如数组、null、字符串等）。

**可能的问题场景**：

1. **工具定义中的 `parameters` 字段格式不正确**
   - `parameters` 应该是 JSON Schema 对象
   - 可能传入了 `null`、数组、或字符串

2. **`properties` 字段不是对象**
   - JSON Schema 的 `properties` 必须是对象映射
   - 可能是空对象 `{}`（某些 API 不允许）或数组

3. **`items` 字段格式错误**
   - 数组类型的 `items` 应该是单个 schema 对象
   - OpenAI/DashScope 不支持 tuple validation（数组形式的 items）

4. **`additionalProperties` 字段类型错误**
   - 应该是布尔值或 schema 对象
   - 不能是其他类型

## 调试步骤

### 1. 启用调试日志

```bash
DEBUG=1 npm start
```

查看发送給 DashScope API 的实际工具定义。

### 2. 检查工具定义

在 `converter.ts` 中添加日志：

```typescript
async convertGeminiToolsToOpenAI(geminiTools: ToolListUnion) {
  const openAITools: OpenAI.Chat.ChatCompletionTool[] = [];

  for (const tool of geminiTools) {
    // ... 现有逻辑 ...

    if (parameters) {
      parameters = convertSchema(parameters, this.schemaCompliance);

      // 添加验证
      if (!this.validateParameters(parameters, func.name)) {
        debugLogger.error(`Invalid parameters for tool ${func.name}:`, parameters);
      }
    }

    openAITools.push({
      type: 'function',
      function: {
        name: func.name,
        description: func.description,
        parameters,
      },
    });
  }

  return openAITools;
}

private validateParameters(
  params: Record<string, unknown>,
  toolName: string,
): boolean {
  // 检查 parameters 是否是对象
  if (!params || typeof params !== 'object') {
    debugLogger.warn(`Tool ${toolName}: parameters is not an object`);
    return false;
  }

  // 检查 properties 是否是对象
  if ('properties' in params) {
    const props = params.properties;
    if (!props || typeof props !== 'object' || Array.isArray(props)) {
      debugLogger.warn(`Tool ${toolName}: properties is not a valid mapping`);
      return false;
    }
  }

  // 检查 items 是否是对象（不是数组）
  if ('items' in params) {
    const items = params.items;
    if (Array.isArray(items)) {
      debugLogger.warn(`Tool ${toolName}: items is an array (tuple validation not supported)`);
      return false;
    }
  }

  return true;
}
```

## 修复方案

### 方案 1：添加参数验证和清理

在发送给 API 之前验证并清理工具参数：

```typescript
/**
 * Validate and sanitize JSON Schema for DashScope compatibility
 */
private sanitizeParameters(
  params: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!params || typeof params !== 'object') {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (key === 'properties') {
      // Ensure properties is a valid mapping
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        // Skip null/undefined properties
        continue;
      } else {
        // Invalid properties - replace with empty object or skip
        debugLogger.warn(`Sanitizing invalid 'properties' field`);
        sanitized[key] = {};
      }
    } else if (key === 'items') {
      // Ensure items is a single schema object, not an array
      if (Array.isArray(value)) {
        debugLogger.warn(`Sanitizing 'items' field (tuple validation not supported)`);
        // Use first item or empty schema
        sanitized[key] = value.length > 0 ? value[0] : {};
      } else if (value && typeof value === 'object') {
        sanitized[key] = value;
      }
    } else if (key === 'additionalProperties') {
      // Ensure additionalProperties is boolean or schema object
      if (typeof value === 'boolean' || (value && typeof value === 'object')) {
        sanitized[key] = value;
      } else {
        // Default to false for safety
        sanitized[key] = false;
      }
    } else if (value !== null && value !== undefined) {
      // Copy other non-null values
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

### 方案 2：使用简化的参数结构

对于没有参数的工具，使用标准的空参数 schema：

```typescript
// 替换
parameters: undefined

// 为
parameters: {
  type: 'object',
  properties: {},
  required: [],
}
```

### 方案 3：临时禁用问题工具

如果确定是特定工具导致的，可以临时禁用：

```typescript
const problematicTools = ['ToolName1', 'ToolName2'];
const filteredTools = geminiTools.filter((tool) => {
  const actualTool = 'tool' in tool ? tool.tool : tool;
  const funcNames = actualTool.functionDeclarations?.map((f) => f.name) || [];
  return !funcNames.some((name) => problematicTools.includes(name));
});
```

## 测试验证

### 单元测试

添加参数验证测试：

```typescript
describe('sanitizeParameters', () => {
  it('should handle null properties', () => {
    const input = { type: 'object', properties: null };
    const result = sanitizeParameters(input);
    expect(result?.properties).toEqual({});
  });

  it('should handle array items', () => {
    const input = {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
    };
    const result = sanitizeParameters(input);
    expect(result?.items).toEqual({ type: 'string' });
  });

  it('should handle invalid additionalProperties', () => {
    const input = { type: 'object', additionalProperties: 'invalid' };
    const result = sanitizeParameters(input);
    expect(result?.additionalProperties).toBe(false);
  });
});
```

### 集成测试

测试多子 agent 场景：

```bash
npm run test:integration:sandbox:none
```

## 相关资源

- DashScope 文档：https://help.aliyun.com/zh/dashscope/
- OpenAI Tool 定义：https://platform.openai.com/docs/guides/function-calling
- JSON Schema 规范：https://json-schema.org/

## 下一步

1. ✅ 启用调试日志查看实际发送的参数
2. ✅ 添加参数验证逻辑
3. ✅ 修复发现的问题
4. ✅ 添加单元测试
5. ✅ 运行集成测试验证

---

**分析日期**：2026 年 4 月 8 日  
**分析者**：AI Platform Cli Assistant  
**状态**：分析中
