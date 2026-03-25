# OLA 自定义修改记录

本文档记录了对原始 qwen-code 项目的所有自定义修改，便于在合并上游更新时快速识别和解决冲突。

## 修改日期：2026-03-24

### 1. 品牌名称修改 (De-branding)
- **文件**: `package.json`, `packages/*/package.json`
- **修改内容**: 
  - `@ai-platform/code-assistant` → `ola`
  - `aiops` → `ola`
  - `aiops-core` → `ola-core`
- **原因**: 项目重命名

### 2. 系统提示词修改
- **文件**: `packages/core/src/core/prompts.ts`
- **修改内容**: 
  - 系统身份从 "Qwen Code" 改为 "AI Platform Code Assistant"
  - 添加身份说明章节
- **原因**: 自定义 AI 身份

### 3. UI 组件文本修改
- **文件**: `packages/cli/src/ui/components/Header.tsx`
- **修改内容**: 
  - 欢迎界面从 "Qwen Code" 改为 "AI Platform Code Assistant"
- **原因**: 品牌一致性

### 4. 默认语言设置
- **文件**: `packages/cli/src/utils/languageUtils.ts`
- **修改内容**: 
  - 默认输出语言从检测系统语言改为 Chinese
- **原因**: 本地化需求

### 5. 配置文件目录
- **文件**: `packages/core/src/config/storage.ts`
- **修改内容**:
  - `QWEN_DIR` → `OLA_DIR`（变量名）
  - `getGlobalQwenDir()` → `getGlobalOlaDir()`（方法名）
  - 目录值从 `.qwen` 改为 `.ola`
- **原因**: 完全去品牌化

### 6. 全局命令修改
- **文件**: `package.json`, `packages/cli/package.json`
- **修改内容**:
  - 全局命令从 `aiops` 改为 `ola`
- **原因**: 品牌一致性

### 7. 环境变量重命名
- **文件**: 所有源码文件
- **修改内容**:
  - `QWEN_RUNTIME_DIR` → `OLA_RUNTIME_DIR`（主要）
  - `QWEN_CODE_LANG` → `OLA_CODE_LANG`
  - `QWEN_SANDBOX` → `OLA_SANDBOX`
  - `QWEN_SANDBOX_IMAGE` → `OLA_SANDBOX_IMAGE`
  - `QWEN_CODE_IDE_*` → `OLA_CODE_IDE_*`
  - `QWEN_DEFAULT_AUTH_TYPE` → `OLA_DEFAULT_AUTH_TYPE`
  - `QWEN_CODE_TRUSTED_FOLDERS_PATH` → `OLA_CODE_TRUSTED_FOLDERS_PATH`
  - `QWEN_DEBUG_LOG_FILE` → `OLA_DEBUG_LOG_FILE`
  - `QWEN_SYSTEM_MD` → `OLA_SYSTEM_MD`
  - `QWEN_WRITE_SYSTEM_MD` → `OLA_WRITE_SYSTEM_MD`
  - `QWEN_CODE_TOOL_CALL_STYLE` → `OLA_CODE_TOOL_CALL_STYLE`
  - `QWEN_CODE_NO_RELAUNCH` → `OLA_CODE_NO_RELAUNCH`
  - `QWEN_CODE_INTEGRATION_TEST` → `OLA_CODE_INTEGRATION_TEST`
  - `QWEN_OAUTH` → `OLA_OAUTH`
  - 保留 `QWEN_*` 作为向后兼容
- **原因**: 统一品牌标识

## 合并上游更新时的注意事项

1. **优先保留的修改**:
   - 品牌名称相关修改（ola 相关）
   - 系统提示词修改
   - 默认语言设置
   - 配置目录名称

2. **可以接受上游更新的**:
   - 新功能实现
   - Bug 修复
   - 性能优化
   - 工具函数更新

3. **需要仔细审查的**:
   - `prompts.ts` - 可能影响 AI 行为
   - `package.json` - 依赖版本变化
   - `config/` - 配置相关修改
   - `ui/` - 界面相关修改

## 合并流程

```bash
# 1. 获取上游更新
git fetch upstream

# 2. 创建合并分支
git checkout -b merge-upstream-$(date +%Y%m%d)

# 3. 合并上游 main 分支
git merge upstream/main

# 4. 解决冲突（重点关注 OLA_CHANGES.md 中列出的文件）
git status
# 手动编辑冲突文件

# 5. 测试
npm ci
npm run build
npm test

# 6. 提交合并
git commit -m "Merge upstream updates from $(date)"

# 7. 推送到远程
git push origin merge-upstream-$(date +%Y%m%d)

# 8. 创建 Pull Request 并审查
# 9. 合并到主分支
```

## 版本追踪

| 日期 | 上游版本 | 合并内容 | 状态 |
|------|---------|---------|------|
| 2026-03-24 | v0.13.0 | 初始 Fork | ✅ 完成 |
