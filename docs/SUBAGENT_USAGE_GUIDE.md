# OLA 子 agent 调用指南

**版本**: 2.0  
**最后更新**: 2026-03-28  
**用途**: 如何通过命令调用子 agent 处理 upstream 合并

---

## 🚀 快速开始

### 最简单的调用方式

```bash
ola "合并 upstream/main 到 dev 分支"
```

就这么简单！子 agent 会自动处理所有细节。

---

## 📋 三种调用方式

### 方式 1: ola 对话调用（推荐）

```bash
# 标准合并
ola "合并 upstream/main 到 dev 分支"

# 带参数合并
ola "合并 upstream，排除认证系统"
ola "只合并 Hooks 相关修复"
ola "紧急合并安全修复"

# 分步执行
ola "分析 upstream 变更"
ola "执行合并"
ola "验证并推送"
```

**优点**:

- ✅ 自然语言，易于使用
- ✅ 自动处理所有细节
- ✅ 智能冲突解决
- ✅ 完整验证流程

---

### 方式 2: 使用合并脚本

```bash
# 标准合并
./scripts/merge-upstream.sh

# 查看帮助
./scripts/merge-upstream.sh --help

# 预览模式（不实际合并）
./scripts/merge-upstream.sh --dry-run

# 详细输出
./scripts/merge-upstream.sh --verbose
```

**脚本自动执行**:

1. 备份当前分支
2. 获取 upstream 最新代码
3. 创建合并分支
4. 执行合并
5. 运行 4 个自动修复脚本
6. 排除认证系统变更
7. 运行构建验证
8. 运行测试（更新快照）
9. 合并到 dev
10. 推送到远程
11. 清理临时分支

**优点**:

- ✅ 完全自动化
- ✅ 可预览模式
- ✅ 详细日志输出
- ✅ 可集成到 CI/CD

---

### 方式 3: 手动分步调用自动修复脚本

```bash
# 1. 手动合并
git fetch upstream
git merge upstream/main --no-commit

# 2. 运行自动修复脚本
./scripts/fix-package-names.sh    # 修复包名导入
./scripts/fix-config-dirs.sh      # 修复配置目录
./scripts/fix-test-async.sh       # 修复测试异步
./scripts/fix-eslint.sh           # 修复 ESLint 警告

# 3. 排除认证系统
git reset HEAD packages/**/auth*
git checkout -- packages/**/auth*

# 4. 提交并验证
git add -A
git commit -m "chore: merge upstream"
npm run build
npm test
git push
```

**优点**:

- ✅ 完全控制每一步
- ✅ 可以选择性运行修复
- ✅ 适合学习和调试

---

## 🆘 获取帮助

### 查看子 agent 列表

```bash
ola help subagents
```

输出:

```
🤖 OLA 子 agent 列表

   upstream-merger    合并 upstream 代码到 dev 分支
   hook-expert        Hooks 功能配置和使用
   lsp-specialist     LSP 功能配置和使用

使用 "ola help <agent-name>" 查看详细帮助
```

---

### 查看特定子 agent 帮助

```bash
ola help upstream-merger
```

输出:

```
🔧 upstream-merger 子 agent 帮助

用途:
  将 upstream/main 的新代码安全合并到本地 dev 分支

快速使用:
  ola "合并 upstream/main 到 dev"
  ola "合并 upstream，排除认证系统"
  ola "只合并 Hooks 相关修复"
  ./scripts/merge-upstream.sh

自动修复功能:
  ✓ 包名导入 (@qwen-code/qwen-code-core → ola-core)
  ✓ 配置目录 (.qwen → .ola)
  ✓ 测试异步函数 (添加 async/await)
  ✓ ESLint 警告 (删除未使用变量)
  ✓ 排除认证系统变更

工作流程:
  1. 预检查和备份
  2. 分析 upstream 变更
  3. 执行合并
  4. 运行自动修复脚本
  5. 排除认证系统
  6. 验证构建和测试
  7. 推送到远程
  8. 清理临时分支
```

---

### 查看脚本帮助

```bash
./scripts/merge-upstream.sh --help
```

输出:

```
🚀 upstream 合并脚本

用法:
  ./scripts/merge-upstream.sh [选项]

选项:
  -h, --help     显示帮助信息
  -d, --dry-run  预览模式（不实际合并）
  -v, --verbose  详细输出模式

功能:
  自动将 upstream/main 合并到 dev 分支

自动修复:
  ✓ 包名导入 (@qwen-code/qwen-code-core → ola-core)
  ✓ 配置目录 (.qwen → .ola)
  ✓ 测试异步函数 (添加 async/await)
  ✓ ESLint 警告 (删除未使用变量)
  ✓ 排除认证系统变更

示例:
  ./scripts/merge-upstream.sh              # 标准合并
  ./scripts/merge-upstream.sh --dry-run    # 预览模式
  ./scripts/merge-upstream.sh --verbose    # 详细输出
```

---

## 📚 查看完整文档

```bash
# 子 agent 配置文档
cat .ola/subagents/upstream-merger.md

# 迁移总结
cat MIGRATION_SUMMARY.md

# 测试状态
cat TEST_STATUS.md

# 构建状态
cat BUILD_STATUS.md
```

---

## 💡 常用命令短语

### 合并相关

| 你说            | 子 agent 理解        |
| --------------- | -------------------- |
| "合并 upstream" | 执行完整合并流程     |
| "合并到 dev"    | 合并到 dev 分支      |
| "排除认证"      | 跳过 auth 相关文件   |
| "只合并 XX"     | cherry-pick 相关提交 |
| "紧急合并"      | 最小化验证，快速推送 |
| "安全合并"      | 完整验证，保守策略   |
| "分析变更"      | 只分析不执行         |
| "预览合并"      | 模拟合并，不提交     |

---

### 修复相关

| 你说          | 子 agent 理解             |
| ------------- | ------------------------- |
| "修复包名"    | 运行 fix-package-names.sh |
| "修复配置"    | 运行 fix-config-dirs.sh   |
| "修复测试"    | 运行 fix-test-async.sh    |
| "修复 ESLint" | 运行 fix-eslint.sh        |
| "全部修复"    | 运行所有修复脚本          |

---

## 🎯 实际使用示例

### 示例 1: 第一次合并

```bash
# 用户: 查看有什么可以帮忙
ola help subagents

# 用户: 查看 upstream 合并帮助
ola help upstream-merger

# 用户: 执行合并
ola "合并 upstream/main 到 dev 分支"

# 子 agent 自动执行:
# 🔍 分析 upstream 变更...
# 📊 发现 56 个新提交，138 个文件变更
# 🔧 开始合并...
# ✅ 运行自动修复...
# 🧪 验证通过...
# 📤 推送到远程...
# ✅ 合并完成！
```

---

### 示例 2: 选择性合并

```bash
# 用户: 只合并 Hooks 相关
ola "只合并 upstream 的 Hooks 相关修复到 dev"

# 子 agent:
# 🔍 搜索 Hooks 相关提交...
# 📊 找到 12 个 Hooks 相关提交
# 🔧 Cherry-pick 中...
# ✅ 已合并 12 个提交
# 🧪 运行 Hooks 测试...
# 📤 推送...
# ✅ 选择性合并完成！
```

---

### 示例 3: 处理冲突

```bash
# 用户: 合并并自动解决冲突
ola "合并 upstream，遇到冲突自动解决"

# 子 agent:
# 🔍 开始合并...
# ⚠️  发现冲突文件:
#    - packages/core/src/config/constants.ts
#    - packages/cli/src/ui/AppContainer.tsx
# 🔧 应用自动解决策略:
#    ✓ 保持 ola-core 包名
#    ✓ 保持 .ola 配置目录
#    ✓ 排除 QWEN_OAUTH 相关
# ✅ 所有冲突已解决
# 🧪 验证通过...
# ✅ 合并完成！
```

---

### 示例 4: 使用脚本预览

```bash
# 预览合并（不实际执行）
./scripts/merge-upstream.sh --dry-run

# 输出:
# 🚀 开始合并 upstream/main 到 dev 分支
# 📋 步骤 0: 预检查
# ✅ 当前分支：dev
# ✅ upstream 已更新
# 📊 变更统计:
#    新增文件：41 个
#    修改文件：97 个
#    代码变更：+12000 行，-3000 行
# ⚠️  预览模式，不执行实际合并
```

---

## 🔧 自动修复脚本详解

### fix-package-names.sh

**用途**: 修复包名导入  
**修复内容**: `@qwen-code/qwen-code-core` → `ola-core`  
**影响范围**: ~480 个文件

```bash
# 手动运行
./scripts/fix-package-names.sh

# 输出:
# 🔧 修复包名导入...
#   ✓ packages/cli/src/ui/AppContainer.tsx
#   ✓ packages/cli/src/ui/components/DialogManager.tsx
#   ... (480 个文件)
# ✅ 包名修复完成
```

---

### fix-config-dirs.sh

**用途**: 修复配置目录引用  
**修复内容**: `.qwen` → `.ola`  
**影响范围**: ~100 个文件

```bash
# 手动运行
./scripts/fix-config-dirs.sh

# 输出:
# 🔧 修复配置目录引用...
#   ✓ packages/cli/src/config/settingsSchema.ts
#   ✓ packages/core/src/services/fileDiscoveryService.ts
#   ... (100 个文件)
# ✅ 配置目录修复完成
```

---

### fix-test-async.sh

**用途**: 修复测试文件异步函数  
**修复内容**: 添加 `async () => {}`  
**影响范围**: ~425 处

```bash
# 手动运行
./scripts/fix-test-async.sh

# 输出:
# 🔧 修复测试文件异步函数...
#   ✓ packages/core/src/utils/shell-utils.test.ts:59
#   ✓ packages/core/src/tools/shell.test.ts:111
#   ... (425 处)
# ✅ 测试异步修复完成
```

---

### fix-eslint.sh

**用途**: 修复 ESLint 警告  
**修复内容**: 删除/注释未使用的变量和导入  
**影响范围**: ~11 处

```bash
# 手动运行
./scripts/fix-eslint.sh

# 输出:
# 🔧 修复 ESLint 警告...
#   ✓ packages/cli/src/ui/components/DialogManager.tsx
#   ✓ packages/cli/src/acp-integration/acpAgent.ts
#   ✓ packages/core/src/hooks/hookEventHandler.ts
# ✅ ESLint 修复完成
```

---

## 📊 命令速查表

### 帮助命令

```bash
ola help subagents              # 查看所有子 agent
ola help upstream-merger        # 查看 upstream 合并帮助
./scripts/merge-upstream.sh -h  # 查看合并脚本帮助
cat .ola/subagents/upstream-merger.md  # 查看完整文档
```

### 合并命令

```bash
ola "合并 upstream"             # 快速合并
ola "合并 upstream，排除认证"   # 排除认证系统
ola "只合并 Hooks 修复"         # 选择性合并
./scripts/merge-upstream.sh     # 使用脚本
./scripts/merge-upstream.sh -d  # 预览模式
```

### 修复命令

```bash
./scripts/fix-package-names.sh  # 修复包名
./scripts/fix-config-dirs.sh    # 修复配置
./scripts/fix-test-async.sh     # 修复测试
./scripts/fix-eslint.sh         # 修复 ESLint
```

### 验证命令

```bash
npm run build                   # 构建验证
npm test                        # 测试验证
ola --version                   # 功能验证
git status                      # 状态检查
```

---

## 📖 相关文档

| 文档              | 位置                                | 用途               |
| ----------------- | ----------------------------------- | ------------------ |
| **子 agent 配置** | `.ola/subagents/upstream-merger.md` | 完整工作流程和策略 |
| **迁移总结**      | `MIGRATION_SUMMARY.md`              | v0.13.1 迁移详情   |
| **测试状态**      | `TEST_STATUS.md`                    | 测试结果和覆盖率   |
| **构建状态**      | `BUILD_STATUS.md`                   | 构建问题和解决方案 |
| **最终报告**      | `FINAL_REPORT.md`                   | 完整项目总结       |

---

## 🎯 最佳实践

### ✅ 推荐做法

```bash
# 1. 先获取帮助
ola help upstream-merger

# 2. 预览合并
./scripts/merge-upstream.sh --dry-run

# 3. 执行合并
ola "合并 upstream/main 到 dev"

# 4. 验证结果
git log --oneline -5
ola --version

# 5. 通知团队
echo "已合并 upstream，请拉取最新代码"
```

### ❌ 避免做法

```bash
# ❌ 直接 merge 不验证
git merge upstream/main && git push

# ❌ 不备份就合并
# 应该先创建备份分支
git branch backup/dev-$(date +%Y%m%d)

# ❌ 跳过测试
npm run build && git push  # 跳过测试

# ❌ 不查看帮助就执行
# 应该先看帮助
ola help upstream-merger
```

---

## 🔗 快速链接

- [上游仓库](https://github.com/QwenLM/qwen-code)
- [本地仓库](https://github.com/zyzheal/ola)
- [子 agent 配置](./.ola/subagents/upstream-merger.md)
- [合并脚本](./scripts/merge-upstream.sh)

---

**最后更新**: 2026-03-28  
**维护者**: OLA 开发团队  
**反馈**: 使用 `/bug` 命令提交问题
