# 权限确认系统实现方案

## 问题分析

当前系统在执行命令（如 `find`, `grep`, `git` 等）时会反复出现确认提示：

```
允许执行：'find'？

  1. 是，允许一次
  2. 在本项目中总是允许 [Bash(find *)]
  3. 对该用户总是允许 [Bash(find *)]
  4. 否，建议更改 (esc)
```

## 根本原因

权限确认逻辑位于以下文件中：

### 核心文件

1. **`packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx`**
   - 显示确认对话框
   - 处理用户选择（允许一次、总是允许等）

2. **`packages/core/src/permissions/permission-manager.ts`**
   - `PermissionManager` 类管理权限规则
   - 评估命令是否允许、询问或拒绝

3. **`packages/cli/src/config/settings.ts`**
   - 存储用户配置（包括 `trustedCommands`）

## 实现方案

### 方案一：在现有框架中集成 trustedCommands（推荐）

#### 1. 修改 PermissionManager

在 `packages/core/src/permissions/permission-manager.ts` 中添加 `trustedCommands` 检查：

```typescript
// packages/core/src/permissions/permission-manager.ts

export interface PermissionManagerConfig {
  // ... 现有接口 ...

  /** 获取信任的命令模式列表 */
  getTrustedCommands?(): {
    patterns: string[];
    enabled: boolean;
  };
}

// 在 checkPermission 方法中添加检查
private checkTrustedCommand(command: string): boolean {
  const trustedCommands = this.config.getTrustedCommands?.();

  if (!trustedCommands?.enabled) {
    return false;
  }

  return trustedCommands.patterns.some(pattern => {
    // 将通配符模式转换为正则表达式
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*') + '$'
    );
    return regex.test(command);
  });
}
```

#### 2. 修改 ToolConfirmationMessage

在 `packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx` 中添加自动跳过逻辑：

```typescript
// packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx

// 在组件开始时检查是否是信任的命令
useEffect(() => {
  if (confirmationDetails.type === 'exec') {
    const command = confirmationDetails.command;
    const trustedCommands = settings.merged.trustedCommands;

    if (trustedCommands?.enabled && trustedCommands.patterns) {
      const isTrusted = trustedCommands.patterns.some((pattern: string) => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(command);
      });

      if (isTrusted) {
        // 自动确认
        onConfirm(ToolConfirmationOutcome.ProceedOnce);
      }
    }
  }
}, [confirmationDetails, settings, onConfirm]);
```

#### 3. 更新 Settings Schema

在 `packages/cli/src/config/settingsSchema.ts` 中添加 `trustedCommands` 配置：

```typescript
export const settingsSchema = z.object({
  // ... 现有配置 ...

  trustedCommands: z
    .object({
      patterns: z.array(z.string()).optional(),
      enabled: z.boolean().default(false),
    })
    .optional(),
});
```

### 方案二：添加权限管理 UI

创建一个新的权限管理对话框组件：

#### 1. 创建 PermissionsManagerDialog 组件

```typescript
// packages/cli/src/ui/components/PermissionsManagerDialog.tsx

import React from 'react';
import { Box, Text } from 'ink';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';

interface PermissionsManagerDialogProps {
  onExit: () => void;
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export const PermissionsManagerDialog: React.FC<PermissionsManagerDialogProps> = ({
  onExit,
  settings,
  updateSetting,
}) => {
  const trustedCommands = settings.merged.trustedCommands || {
    patterns: [],
    enabled: false,
  };

  const handleToggle = () => {
    updateSetting('trustedCommands.enabled', !trustedCommands.enabled);
  };

  const handleAddPattern = () => {
    // 添加新模式的逻辑
  };

  const handleRemovePattern = (index: number) => {
    const newPatterns = trustedCommands.patterns.filter((_, i) => i !== index);
    updateSetting('trustedCommands.patterns', newPatterns);
  };

  return (
    <Box flexDirection="column">
      <Text bold>权限管理器</Text>

      <Box flexDirection="column" marginTop={1}>
        <Text>信任的命令模式</Text>
        <Text>状态：{trustedCommands.enabled ? '已启用' : '已禁用'}</Text>

        <RadioButtonSelect
          items={[
            { label: trustedCommands.enabled ? '禁用' : '启用', value: 'toggle' },
            { label: '添加模式', value: 'add' },
            { label: '返回', value: 'exit' },
          ]}
          onSelect={(value) => {
            if (value === 'toggle') handleToggle();
            else if (value === 'exit') onExit();
          }}
        />
      </Box>

      {trustedCommands.patterns.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text>当前模式：</Text>
          {trustedCommands.patterns.map((pattern, index) => (
            <Text key={index}>
              {index + 1}. {pattern}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
```

#### 2. 添加斜杠命令

在 `packages/cli/src/ui/commands/permissionsCommand.ts` 中创建命令：

```typescript
export const permissionsCommand: SlashCommand = {
  name: 'permissions',
  description: '管理权限设置',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext) => {
    const uiState = context.services.uiState;
    uiState.setDialogState({
      type: 'permissions-manager',
      visible: true,
    });
  },
};
```

### 方案三：添加取消确认功能

修改 `ToolConfirmationMessage.tsx` 中的 Esc 键处理：

```typescript
// packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx

useKeypress(
  (key) => {
    if (!isFocused) return;

    if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      // 显示取消确认对话框
      setShowCancelConfirm(true);
    }
  },
  { isActive: isFocused },
);

// 在组件中添加取消确认对话框
{showCancelConfirm && (
  <Box flexDirection="column" marginTop={1}>
    <Text color={theme.status.error}>确认取消？</Text>
    <RadioButtonSelect
      items={[
        { label: '是，取消', value: 'yes' },
        { label: '否，继续', value: 'no' },
      ]}
      onSelect={(value) => {
        if (value === 'yes') {
          handleConfirm(ToolConfirmationOutcome.Cancel);
        } else {
          setShowCancelConfirm(false);
        }
      }}
    />
  </Box>
)}
```

## 实施步骤

### 阶段一：集成 trustedCommands（1-2 天）

1. ✅ 修改 `PermissionManager` 添加信任命令检查
2. ✅ 修改 `ToolConfirmationMessage` 自动跳过信任命令
3. ✅ 更新 Settings Schema
4. ✅ 创建配置文件模板

### 阶段二：添加权限管理 UI（2-3 天）

1. 创建 `PermissionsManagerDialog` 组件
2. 添加 `/permissions` 斜杠命令
3. 实现模式添加/删除功能
4. 添加帮助文档

### 阶段三：优化用户体验（1-2 天）

1. 添加取消确认功能
2. 优化提示信息
3. 添加快捷键说明
4. 编写测试用例

## 配置文件示例

### 全局配置 `~/.ola/settings.json`

```json
{
  "trustedCommands": {
    "patterns": [
      "find *",
      "grep *",
      "sed *",
      "git *",
      "npm run *",
      "node scripts/*.js"
    ],
    "enabled": true
  }
}
```

### 项目配置 `.ola/settings.json`

```json
{
  "trustedCommands": {
    "patterns": ["npm test", "npm run build", "git status", "git diff"],
    "enabled": true
  }
}
```

## 测试用例

```typescript
// packages/core/src/permissions/permission-manager.test.ts

describe('checkTrustedCommand', () => {
  it('should allow trusted commands', () => {
    const config = {
      getTrustedCommands: () => ({
        patterns: ['find *', 'git *'],
        enabled: true,
      }),
    };

    const pm = new PermissionManager(config as any);
    expect(pm.checkTrustedCommand('find . -name "*.ts"')).toBe(true);
    expect(pm.checkTrustedCommand('git status')).toBe(true);
  });

  it('should not allow non-trusted commands', () => {
    const config = {
      getTrustedCommands: () => ({
        patterns: ['find *'],
        enabled: true,
      }),
    };

    const pm = new PermissionManager(config as any);
    expect(pm.checkTrustedCommand('rm -rf /')).toBe(false);
  });
});
```

## 相关文档

- [TRUSTED_COMMANDS.md](./TRUSTED_COMMANDS.md) - 信任命令配置指南
- [PERMISSION_MANAGER.md](./PERMISSION_MANAGER.md) - 权限管理器使用说明

## 总结

推荐实施方案一（集成 trustedCommands），原因：

1. ✅ 利用现有权限框架
2. ✅ 改动最小
3. ✅ 快速上线
4. ✅ 易于测试和维护

后续可根据用户需求添加方案二（权限管理 UI）和方案三（取消确认功能）。
