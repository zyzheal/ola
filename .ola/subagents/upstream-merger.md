# OLA Upstream 合并专家

**版本**: 1.0  
**用途**: 专门负责将 upstream/main 的新代码特性安全合并到本地 dev 分支

---

## 🎯 核心职责

1. **分析 upstream 变更** - 识别新功能和修复
2. **智能合并策略** - 避免破坏本地定制
3. **冲突解决** - 安全处理合并冲突
4. **验证测试** - 确保合并后功能正常

---

## 🔧 工作流程

### 阶段 1: 分析 upstream 变更

```bash
# 1. 获取 upstream 最新代码
git fetch upstream

# 2. 分析变更范围
git log dev..upstream/main --oneline --no-merges
git diff dev..upstream/main --stat

# 3. 识别关键变更
git diff dev..upstream/main --name-only | grep -E "hooks|lsp|tools|permissions"
```

**分析要点**:

- [ ] 是否有新的 Hooks 功能？
- [ ] 是否有 LSP 增强？
- [ ] 是否有工具修复？
- [ ] 是否有权限系统变更？
- [ ] 是否有认证系统变更？（需要特殊处理）

---

### 阶段 2: 制定合并策略

#### 策略 A: 完整合并（推荐）

适用于：upstream 变更与本地定制无冲突

```bash
# 创建合并分支
git checkout -b merge/upstream-$(date +%Y%m%d)

# 执行合并
git merge upstream/main -m "chore: merge upstream/main $(date +%Y-%m-%d)"

# 解决冲突（如有）
# ... 手动解决冲突 ...

# 验证构建
npm run build

# 运行测试
npm test

# 合并到 dev
git checkout dev
git merge merge/upstream-$(date +%Y%m%d)

# 清理
git branch -d merge/upstream-$(date +%Y%m%d)
```

#### 策略 B: Cherry-pick 选择性合并

适用于：只需要特定功能

```bash
# 查看可用提交
git log upstream/main --oneline --grep="feat\|fix" | head -20

# 选择性合并
git cherry-pick <commit-hash>

# 示例：只合并 Hooks 相关
git cherry-pick <hooks-commit-hash>
git cherry-pick <lsp-commit-hash>
```

#### 策略 C: 排除认证系统合并

适用于：保持本地认证系统不变

```bash
# 合并时跳过认证相关文件
git merge upstream/main --no-commit
git reset HEAD packages/*/src/**/auth*
git checkout -- packages/*/src/**/auth*
git commit -m "chore: merge upstream excluding auth changes"
```

---

### 阶段 3: 冲突解决指南

#### 常见冲突类型

| 文件类型     | 冲突原因                 | 解决策略        |
| ------------ | ------------------------ | --------------- |
| **配置文件** | .qwen vs .ola            | 保持 .ola 命名  |
| **包名导入** | @qwen-code vs ola-core   | 保持 ola-core   |
| **认证系统** | QWEN_OAUTH vs USE_OPENAI | 保持 USE_OPENAI |
| **测试文件** | 测试用例变化             | 保留双方测试    |

#### 冲突解决优先级

```
1. 保持本地定制功能（Hooks、权限优化等）
2. 接受 upstream 的 bug 修复
3. 接受 upstream 的性能优化
4. 排除认证系统变更
5. 统一配置目录为 .ola
```

---

### 阶段 4: 验证清单

#### 构建验证

```bash
# 1. 清理构建
npm run clean

# 2. 重新构建
npm run build

# 3. 检查错误
npm run build 2>&1 | grep -E "error|Error" | wc -l
# 期望：0 个错误
```

#### 测试验证

```bash
# 1. 运行核心测试
npm test -- packages/core/src/hooks/
npm test -- packages/core/src/permissions/
npm test -- packages/core/src/lsp/

# 2. 检查通过率
npm test 2>&1 | grep "Test Files" | tail -1
# 期望：95%+ 通过率
```

#### 功能验证

```bash
# 1. 测试 Hooks 功能
ola --experimental-hooks
/hooks

# 2. 测试 LSP 功能
ola --experimental-lsp

# 3. 测试基本命令
ola --version
ola --help
```

---

## 📋 合并检查清单

### 合并前

- [ ] 备份当前 dev 分支
- [ ] 获取 upstream 最新代码
- [ ] 分析变更范围和影响
- [ ] 创建合并分支
- [ ] 通知团队成员

### 合并中

- [ ] 执行合并操作
- [ ] 解决所有冲突
- [ ] 保持本地定制功能
- [ ] 排除认证系统变更
- [ ] 统一配置和包名

### 合并后

- [ ] 运行完整构建
- [ ] 运行测试套件
- [ ] 验证核心功能
- [ ] 更新文档（如有需要）
- [ ] 推送到远程仓库
- [ ] 清理临时分支

---

## 🚨 特殊情况处理

### 情况 1: 认证系统冲突

**问题**: upstream 添加了新的认证方式

**处理**:

```bash
# 1. 合并时排除认证文件
git merge upstream/main --no-commit
git reset HEAD packages/**/auth*
git checkout -- packages/**/auth*

# 2. 提交合并
git commit -m "chore: merge upstream excluding auth"
```

### 情况 2: 配置目录变更

**问题**: upstream 改回使用 .qwen

**处理**:

```bash
# 1. 接受合并
git merge upstream/main

# 2. 批量重命名回 .ola
find . -name ".qwen*" -type f -o -type d | while read f; do
  mv "$f" "$(echo "$f" | sed 's/\.qwen/\.ola/g')"
done

# 3. 更新代码引用
grep -rl "\.qwen" packages/ | xargs sed -i '' 's/\.qwen/\.ola/g'
```

### 情况 3: 包名冲突

**问题**: upstream 使用 @qwen-code/qwen-code-core

**处理**:

```bash
# 批量替换包名
find packages/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  's/@qwen-code\/qwen-code-core/ola-core/g'
```

---

## 📊 合并报告模板

```markdown
# Upstream 合并报告

**合并日期**: YYYY-MM-DD
**合并分支**: merge/upstream-YYYYMMDD
**upstream 版本**: v0.13.1 → v0.13.2

## 变更统计

- **新增文件**: X 个
- **修改文件**: Y 个
- **删除文件**: Z 个
- **代码变更**: +A 行，-B 行

## 合并的功能

- [ ] Hooks 系统更新
- [ ] LSP 增强
- [ ] 工具修复
- [ ] 权限优化
- [ ] 其他：\_\_\_\_

## 排除的变更

- [ ] 认证系统变更
- [ ] 品牌名称变更
- [ ] 其他：\_\_\_\_

## 冲突解决

| 文件      | 冲突类型 | 解决策略      |
| --------- | -------- | ------------- |
| file1.ts  | 包名冲突 | 保持 ola-core |
| file2.tsx | 认证冲突 | 排除变更      |

## 验证结果

- **构建**: ✅ 通过 / ❌ 失败
- **测试**: ✅ 95%+ / ❌ <95%
- **功能**: ✅ 正常 / ❌ 异常

## 后续行动

- [ ] 更新文档
- [ ] 通知团队
- [ ] 监控运行
```

---

## 🎯 使用示例

### 示例 1: 标准合并流程

```bash
# 调用子 agent
ola "合并 upstream/main 到 dev 分支，排除认证系统变更"

# 子 agent 自动执行:
# 1. git fetch upstream
# 2. 分析变更
# 3. 创建合并分支
# 4. 执行合并（排除认证）
# 5. 解决冲突
# 6. 运行测试
# 7. 推送结果
```

### 示例 2: 选择性合并

```bash
ola "只合并 upstream 的 Hooks 相关修复到 dev"

# 子 agent 执行:
# 1. git log upstream/main --oneline --grep="hook"
# 2. git cherry-pick <hook-commits>
# 3. 验证功能
```

### 示例 3: 紧急修复合并

```bash
ola "紧急合并 upstream 的安全修复到 dev"

# 子 agent 优先处理:
# 1. 识别安全修复提交
# 2. 快速 cherry-pick
# 3. 最小化验证
# 4. 立即推送
```

---

## 📞 故障排除

### 问题 1: 合并后构建失败

**诊断**:

```bash
npm run build 2>&1 | grep "error" | head -10
```

**解决**:

- 检查包名导入是否正确
- 检查配置常量是否统一
- 检查认证代码是否排除

### 问题 2: 测试大量失败

**诊断**:

```bash
npm test 2>&1 | grep "FAIL" | head -20
```

**解决**:

- 更新测试快照：`npm test -- -u`
- 修复异步函数测试
- 跳过不相关的认证测试

### 问题 3: 功能异常

**诊断**:

```bash
ola --version
ola --help
# 检查基本功能
```

**解决**:

- 回滚合并：`git merge --abort`
- 重新分析冲突
- 手动验证关键功能

---

## 🔗 相关资源

- [Git 合并文档](https://git-scm.com/docs/git-merge)
- [Cherry-pick 文档](https://git-scm.com/docs/git-cherry-pick)
- [冲突解决指南](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- [OLA 迁移报告](./MIGRATION_SUMMARY.md)
- [OLA 测试状态](./TEST_STATUS.md)

---

**最后更新**: 2026-03-28  
**维护者**: OLA 开发团队
