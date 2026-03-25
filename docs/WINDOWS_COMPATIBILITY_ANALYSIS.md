# Shell Utils Windows 兼容性分析报告

**分析日期**: 2026-03-25  
**文件**: `packages/core/src/utils/shell-utils.ts`  
**状态**: 部分兼容 Windows

---

## 一、当前 Windows 兼容性状态

### ✅ 已实现的功能

| 功能            | 状态    | 说明                                           |
| --------------- | ------- | ---------------------------------------------- |
| **平台检测**    | ✅ 完整 | `isWindows()` 使用 `os.platform() === 'win32'` |
| **Shell 配置**  | ✅ 完整 | 支持 cmd.exe 和 PowerShell                     |
| **命令转义**    | ✅ 完整 | `escapeShellArg()` 支持 cmd 和 PowerShell      |
| **命令解析**    | ✅ 完整 | `resolveCommandPath()` 使用 `where.exe`        |
| **ConPTY 支持** | ✅ 完整 | `shouldDefaultToNodePty()` 检测 Windows 版本   |

### ⚠️ 需要改进的功能

| 功能           | 当前状态  | 问题                     | 建议               |
| -------------- | --------- | ------------------------ | ------------------ |
| **路径分隔符** | ⚠️ 部分   | 使用 `/` 而非 `\`        | 使用 `path.join()` |
| **环境变量**   | ⚠️ 部分   | 使用 `$VAR` 而非 `%VAR%` | 平台适配           |
| **换行符**     | ⚠️ 部分   | 使用 `\n` 而非 `\r\n`    | 平台适配           |
| **文件权限**   | ⚠️ 部分   | 使用 `accessSync(X_OK)`  | Windows 不支持     |
| **Shebang**    | ❌ 不支持 | Unix 特有                | 跳过或适配         |

---

## 二、具体问题分析

### 问题 1：文件权限检查（第 950 行）

```typescript
// 当前代码
accessSync(result, fsConstants.X_OK);
```

**问题**：Windows 不支持 `X_OK` 权限检查

**解决方案**：

```typescript
// Windows 兼容版本
if (!isWindows()) {
  accessSync(result, fsConstants.X_OK);
} else {
  // Windows 只需检查文件是否存在
  accessSync(result, fsConstants.F_OK);
}
```

### 问题 2：路径分隔符

**当前代码**（多处）：

```typescript
const path = '/usr/local/bin/' + command;
```

**解决方案**：

```typescript
import * as path from 'node:path';
const path = path.join('/usr/local/bin', command); // Unix
// 或
const path = path.win32.join('C:\\Program Files', command); // Windows
```

### 问题 3：环境变量语法

**当前代码**：

```typescript
const command = 'echo $HOME';
```

**解决方案**：

```typescript
function formatEnvVar(name: string): string {
  if (isWindows()) {
    return `%${name}%`;
  }
  return `$${name}`;
}
```

### 问题 4：换行符处理

**当前代码**：

```typescript
const lines = command.split('\n');
```

**解决方案**：

```typescript
// 同时支持 Unix 和 Windows 换行符
const lines = command.split(/\r?\n/);
```

---

## 三、改进建议

### 优先级 1：关键功能（必须修复）

#### 1. 修复文件权限检查

```typescript
// packages/core/src/utils/shell-utils.ts:950
export function resolveCommandPath(command: string): {
  path: string | null;
  error?: Error;
} {
  try {
    const isWin = process.platform === 'win32';

    if (isWin) {
      // ... existing where.exe code ...
      return result ? { path: result } : { path: null };
    } else {
      // ... existing Unix code ...
      if (!result) return { path: null, error: undefined };

      // ✅ 修改：Windows 不检查执行权限
      if (!isWin) {
        accessSync(result, fsConstants.X_OK);
      } else {
        accessSync(result, fsConstants.F_OK);
      }

      return { path: result, error: undefined };
    }
  } catch (error) {
    return {
      path: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
```

#### 2. 增强 PowerShell 支持

```typescript
// 添加 PowerShell 特定的命令执行函数
export function executePowerShellCommand(
  command: string,
  args: string[] = [],
): Promise<{ stdout: string; stderr: string; code: number }> {
  const powershellPath = process.env['SystemRoot']
    ? path.join(
        process.env['SystemRoot'],
        'System32',
        'WindowsPowerShell',
        'v1.0',
        'powershell.exe',
      )
    : 'powershell.exe';

  return execCommand(powershellPath, [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    command,
    ...args,
  ]);
}
```

### 优先级 2：重要功能（推荐修复）

#### 3. 路径处理工具函数

```typescript
/**
 * 跨平台路径 Join
 */
export function joinPath(...paths: string[]): string {
  if (isWindows()) {
    return path.win32.join(...paths);
  }
  return path.posix.join(...paths);
}

/**
 * 跨平台路径分隔符
 */
export const PATH_SEPARATOR = isWindows() ? ';' : ':';

/**
 * 跨平台获取 PATH 环境变量
 */
export function getPathVariableName(): string {
  return isWindows() ? 'Path' : 'PATH';
}
```

#### 4. 环境变量格式化

```typescript
/**
 * 格式化环境变量引用（跨平台）
 * @param name 环境变量名
 * @param shell Shell 类型
 */
export function formatEnvVar(name: string, shell: ShellType = 'bash'): string {
  if (shell === 'cmd' || shell === 'powershell') {
    return `%${name}%`;
  }
  return `$${name}`;
}

/**
 * 设置环境变量的命令（跨平台）
 */
export function createSetEnvCommand(
  name: string,
  value: string,
  shell: ShellType = 'bash',
): string {
  if (shell === 'cmd') {
    return `set ${name}=${value}`;
  }
  if (shell === 'powershell') {
    return `$env:${name}="${value}"`;
  }
  return `export ${name}="${value}"`;
}
```

### 优先级 3：增强功能（可选）

#### 5. Windows 特定工具支持

```typescript
/**
 * Windows 系统工具映射
 */
const WINDOWS_TOOL_ALIASES: Record<string, string[]> = {
  grep: ['findstr'],
  sed: ['powershell', '-Command'],
  awk: ['powershell', '-Command'],
  cat: ['type'],
  rm: ['del', '/Q'],
  cp: ['copy'],
  mv: ['move'],
  mkdir: ['mkdir'],
  pwd: ['cd'],
  ps: ['tasklist'],
  kill: ['taskkill', '/F', '/IM'],
};

/**
 * 获取 Windows 等价命令
 */
export function getWindowsEquivalent(command: string): string[] {
  return WINDOWS_TOOL_ALIASES[command] || [command];
}
```

#### 6. 换行符标准化

```typescript
/**
 * 标准化换行符（跨平台）
 */
export function normalizeLineEndings(text: string): string {
  // 统一转换为 Unix 换行符
  return text.replace(/\r\n/g, '\n');
}

/**
 * 平台特定换行符
 */
export const LINE_ENDING = isWindows() ? '\r\n' : '\n';
```

---

## 四、测试用例

### Windows 特定测试

```typescript
// packages/core/src/utils/shell-utils.windows.test.ts
import { describe, it, expect } from 'vitest';
import {
  isWindows,
  getShellConfiguration,
  escapeShellArg,
  resolveCommandPath,
} from './shell-utils.js';

describe('Windows Compatibility', () => {
  it('should detect Windows platform', () => {
    // 实际测试在 Windows 环境运行
    const expected = process.platform === 'win32';
    expect(isWindows()).toBe(expected);
  });

  it('should return cmd configuration on Windows', () => {
    if (!isWindows()) return; // 跳过非 Windows

    const config = getShellConfiguration();
    expect(config.shell).toBe('cmd');
    expect(config.executable).toContain('cmd.exe');
    expect(config.argsPrefix).toEqual(['/d', '/s', '/c']);
  });

  it('should escape arguments for cmd', () => {
    const escaped = escapeShellArg('hello "world"', 'cmd');
    expect(escaped).toBe('"hello ""world"""');
  });

  it('should escape arguments for PowerShell', () => {
    const escaped = escapeShellArg("hello 'world'", 'powershell');
    expect(escaped).toBe("'hello ''world'''");
  });

  it('should resolve command path using where.exe', () => {
    if (!isWindows()) return;

    const { path } = resolveCommandPath('node');
    expect(path).toBeTruthy();
    expect(path!.toLowerCase()).toContain('node.exe');
  });
});
```

---

## 五、实施计划

### 阶段 1：关键修复（1-2 天）

- [ ] 修复文件权限检查（第 950 行）
- [ ] 添加 Windows 测试用例
- [ ] 更新文档

### 阶段 2：重要功能（2-3 天）

- [ ] 添加路径处理工具函数
- [ ] 添加环境变量格式化
- [ ] 增强 PowerShell 支持

### 阶段 3：增强功能（3-5 天）

- [ ] Windows 工具映射
- [ ] 换行符标准化
- [ ] 完整测试覆盖

---

## 六、验证清单

### 功能验证

- [ ] 在 Windows 10/11 上测试命令执行
- [ ] 在 Windows 上测试 PowerShell 集成
- [ ] 在 Windows 上测试路径解析
- [ ] 在 Windows 上测试环境变量

### 兼容性验证

- [ ] Windows 10 (Build 19042+)
- [ ] Windows 11
- [ ] Windows Server 2019/2022
- [ ] WSL2 (Windows Subsystem for Linux)

### 回归测试

- [ ] Unix/Linux 功能不受影响
- [ ] macOS 功能不受影响
- [ ] 现有测试全部通过

---

**负责人**: 待定  
**优先级**: 高  
**预计完成时间**: 1-2 周
