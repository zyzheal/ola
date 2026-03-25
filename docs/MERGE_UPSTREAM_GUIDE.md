# OLA 二开代码合并上游新特性指南

**文档版本**: 1.0  
**创建日期**: 2026-03-25  
**适用场景**: 基于 qwen-code 二次开发的 OLA 项目

---

## 一、当前状态分析

### Git 仓库配置

```bash
# 当前远程仓库
origin   git@github.com:zyzheal/ola.git           # 你的 Fork 仓库
upstream https://github.com/QwenLM/qwen-code.git  # 上游原始仓库

# 当前分支
main   # 主分支（与上游同步）
dev    # 开发分支（OLA 自定义功能）
```

### 当前提交历史

```
ba644bfd9 (HEAD -> dev, origin/dev) docs: 添加服务器端与 K8s Pod 部署方案分析
c12958015 docs: 添加跨平台架构分析与优化方案
877316d78 docs: 添加危险命令警告功能测试报告
e10757e26 test: 添加危险命令检测功能测试
e5c66ceeb feat: 添加危险命令额外确认提示
...
7e603f7 (main) Initial OLA commit
```

### 二开内容分类

| 类别         | 文件/目录                       | 合并策略      |
| ------------ | ------------------------------- | ------------- |
| **核心功能** | `packages/cli/src/ui/`          | 保留 + 合并   |
| **配置文件** | `package.json`, `settings.json` | 保留 OLA 配置 |
| **文档**     | `docs/`                         | 保留 + 更新   |
| **品牌相关** | 所有 qwen → ola                 | 强制保留      |
| **新增功能** | 危险命令警告、权限系统等        | 保留          |

---

## 二、合并策略

### 策略 A：定期合并上游 main 分支（推荐）

```
┌─────────────────────────────────────────────────────────────────┐
│                    定期合并流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Upstream (qwen-code)          OLA (zyzheal/ola)               │
│       │                              │                          │
│       │  main branch                 │  main branch             │
│       │  ┌──────┐                    │  ┌──────┐               │
│       │  │ M1   │                    │  │ M1   │               │
│       │  └──────┘                    │  └──────┘               │
│       │  ┌──────┐                    │  ┌──────┐               │
│       │  │ M2   │───────────────────▶│  │ M2   │               │
│       │  └──────┘    定期合并         │  └──────┘               │
│       │  ┌──────┐                    │  ┌──────┐               │
│       │  │ M3   │                    │  │ M3   │               │
│       │  └──────┘                    │  └──────┘               │
│       │                              │  ┌──────┐               │
│       │                              │  │ C1   │ OLA 自定义     │
│       │                              │  └──────┘               │
│       │                              │  ┌──────┐               │
│       │                              │  │ C2   │ OLA 自定义     │
│       │                              │  └──────┘               │
│                                                                 │
│  M = Upstream commits                                          │
│  C = OLA custom commits                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**优点**：

- ✅ 保持与上游同步
- ✅ 及时获取新功能和修复
- ✅ 合并冲突较小（频繁合并）

**缺点**：

- ⚠️ 需要定期维护
- ⚠️ 需要解决合并冲突

### 策略 B：选择性合并特定功能

```
┌─────────────────────────────────────────────────────────────────┐
│                  选择性合并流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  评估上游新功能                                                  │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────┐                                           │
│  │ 是否与 OLA 冲突？  │                                           │
│  └─────────────────┘                                           │
│       │                                                         │
│       ├── 是 ──▶ 评估合并成本                                   │
│       │       │                                                 │
│       │       ├── 高 ──▶ 暂不合并，等待上游稳定                 │
│       │       │                                                 │
│       │       └── 低 ──▶ 手动合并，保留 OLA 自定义               │
│       │                                                         │
│       └── 否 ──▶ 直接合并                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**适用场景**：

- 上游重大版本更新
- 与 OLA 核心功能冲突的更新
- 需要评估稳定性的新功能

### 策略 C：长期分支隔离

```
┌─────────────────────────────────────────────────────────────────┐
│                    分支隔离策略                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  main (与上游同步)                                               │
│   │                                                             │
│   ├── ola-custom (OLA 自定义功能)                               │
│   │    │                                                        │
│   │    ├── ola-core (核心修改)                                  │
│   │    ├── ola-ui (UI 修改)                                     │
│   │    └── ola-plugins (插件系统)                               │
│   │                                                             │
│   └── ola-features (OLA 特性功能)                               │
│        │                                                        │
│        ├── dangerous-cmd-warning (危险命令警告)                 │
│        ├── permission-system (权限系统)                         │
│        └── audit-log (审计日志)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**优点**：

- ✅ 清晰的代码组织
- ✅ 易于维护
- ✅ 可以选择性合并

**缺点**：

- ⚠️ 分支管理复杂
- ⚠️ 需要良好的文档

---

## 三、合并操作流程

### 标准合并流程

```bash
#!/bin/bash
# scripts/merge-upstream.sh

set -e

echo "=== OLA 上游合并脚本 ==="
echo ""

# 1. 备份当前状态
echo "步骤 1: 备份当前分支..."
git branch backup-$(date +%Y%m%d)

# 2. 获取上游最新代码
echo "步骤 2: 获取上游最新代码..."
git fetch upstream

# 3. 切换到 main 分支
echo "步骤 3: 切换到 main 分支..."
git checkout main

# 4. 合并上游 main 分支
echo "步骤 4: 合并上游 main 分支..."
git merge upstream/main

# 5. 解决冲突（如果有）
if [ $? -ne 0 ]; then
    echo "⚠️  检测到合并冲突，请手动解决..."
    echo "冲突文件："
    git status --short
    echo ""
    echo "解决冲突后执行："
    echo "  git add <resolved-files>"
    echo "  git commit -m 'Resolve merge conflicts'"
    exit 1
fi

# 6. 合并到 dev 分支
echo "步骤 5: 合并到 dev 分支..."
git checkout dev
git merge main

# 7. 运行测试
echo "步骤 6: 运行测试..."
npm run test

# 8. 构建验证
echo "步骤 7: 构建验证..."
npm run build

# 9. 推送到远程
echo "步骤 8: 推送到远程..."
git push origin main
git push origin dev

echo ""
echo "✅ 合并完成！"
```

### 详细操作步骤

#### 步骤 1：准备工作

```bash
# 1. 确保工作区干净
git status
git stash  # 如果有未提交更改

# 2. 更新上游仓库
git fetch upstream

# 3. 查看上游更新
git log upstream/main --oneline -20

# 4. 创建备份分支
git branch backup-before-merge-$(date +%Y%m%d)
```

#### 步骤 2：合并上游到 main

```bash
# 切换到 main 分支
git checkout main

# 合并上游 main 分支
git merge upstream/main

# 如果有冲突，解决后提交
# git add <resolved-files>
# git commit -m "Merge upstream changes"
```

#### 步骤 3：保留 OLA 自定义

```bash
# 方法 A: Cherry-pick OLA 提交
git checkout dev
git cherry-pick <ola-commit-1>
git cherry-pick <ola-commit-2>

# 方法 B: 合并 dev 分支
git checkout main
git merge dev --no-ff
```

#### 步骤 4：解决合并冲突

**常见冲突文件及处理**：

| 文件                                        | 冲突类型 | 处理策略               |
| ------------------------------------------- | -------- | ---------------------- |
| `package.json`                              | 依赖版本 | 保留上游版本，OLA 配置 |
| `packages/cli/src/ui/components/Header.tsx` | UI 文本  | 保留 OLA 品牌文本      |
| `packages/core/src/config/storage.ts`       | 配置路径 | 保留 `.ola` 路径       |
| `packages/cli/src/i18n/locales/*.js`        | 翻译文本 | 合并 + 保留 OLA 翻译   |

**解决冲突示例**：

```bash
# 1. 查看冲突文件
git status

# 2. 编辑冲突文件
# 查找冲突标记：
# <<<<<<< HEAD
# OLA 版本
# =======
# 上游版本
# >>>>>>> upstream/main

# 3. 保留需要的内容
# 通常保留：
# - OLA 品牌相关修改
# - OLA 新增功能
# - 上游的 Bug 修复和新功能

# 4. 标记为解决
git add <resolved-file>

# 5. 完成合并
git commit -m "Merge upstream with OLA customizations"
```

#### 步骤 5：测试验证

```bash
# 1. 安装依赖
npm ci

# 2. 运行测试
npm test

# 3. 构建验证
npm run build

# 4. 功能测试
ola --version
ola -p "测试命令"

# 5. 检查自定义功能
ola debug detect-user  # 用户检测
ola audit log          # 审计日志
```

#### 步骤 6：推送更新

```bash
# 推送到远程仓库
git push origin main
git push origin dev

# 创建 Release Tag（可选）
git tag -a v0.14.0 -m "OLA Release v0.14.0 - Merged upstream changes"
git push origin v0.14.0
```

---

## 四、自动化合并方案

### GitHub Actions 自动合并

```yaml
# .github/workflows/merge-upstream.yml

name: Merge Upstream Changes

on:
  schedule:
    # 每周一执行
    - cron: '0 0 * * 1'
  workflow_dispatch:

jobs:
  merge-upstream:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Configure Git
        run: |
          git config user.name "OLA Bot"
          git config user.email "ola-bot@ola.sh"

      - name: Add Upstream Remote
        run: |
          git remote add upstream https://github.com/QwenLM/qwen-code.git
          git fetch upstream

      - name: Create Merge Branch
        run: |
          git checkout -b auto-merge-upstream-$(date +%Y%m%d)

      - name: Merge Upstream
        run: |
          git checkout main
          git merge upstream/main || echo "Has conflicts"

      - name: Merge OLA Customizations
        run: |
          git checkout dev
          git merge main || echo "Has conflicts"

      - name: Run Tests
        run: |
          npm ci
          npm test

      - name: Build
        run: |
          npm run build

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          branch: auto-merge-upstream-${{ github.run_id }}
          title: 'Auto-merge upstream changes'
          body: |
            This PR automatically merges changes from upstream qwen-code repository.

            Please review and test before merging.
          labels: |
            automated pr
            upstream merge
```

### 合并检查脚本

```bash
#!/bin/bash
# scripts/check-merge-compatibility.sh

set -e

echo "=== OLA 合并兼容性检查 ==="
echo ""

# 1. 检查关键文件是否被修改
echo "检查关键文件..."

FILES_TO_CHECK=(
  "packages/cli/src/ui/components/Header.tsx"
  "packages/core/src/config/storage.ts"
  "packages/cli/src/i18n/locales/zh.js"
  "package.json"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if git diff upstream/main -- "$file" | grep -q "^-.*ola"; then
    echo "⚠️  警告：$file 中 OLA 相关修改可能被覆盖"
    git diff upstream/main -- "$file" | grep "^-.*ola"
  fi
done

# 2. 检查品牌相关修改
echo ""
echo "检查品牌相关修改..."

BRAND_PATTERNS=(
  "ola"
  "OLA"
  "\.ola"
  "AI Platform Code Assistant"
)

for pattern in "${BRAND_PATTERNS[@]}"; do
  if git diff upstream/main --quiet -G "$pattern"; then
    echo "✅ $pattern 相关修改已保留"
  else
    echo "⚠️  警告：$pattern 相关修改可能丢失"
  fi
done

# 3. 检查新增功能
echo ""
echo "检查新增功能..."

NEW_FEATURES=(
  "DangerousCommandDetection"
  "AuditLogger"
  "FortressUserDetector"
)

for feature in "${NEW_FEATURES[@]}"; do
  if git diff upstream/main --quiet -- "*${feature}*"; then
    echo "✅ $feature 功能已保留"
  else
    echo "⚠️  $feature 功能需要重新添加"
  fi
done

echo ""
echo "检查完成！"
```

---

## 五、合并决策矩阵

### 上游更新类型及处理策略

| 更新类型       | 示例                 | 合并优先级 | 处理策略             |
| -------------- | -------------------- | ---------- | -------------------- |
| **安全修复**   | CVE 修复、权限漏洞   | 🔴 紧急    | 立即合并，优先测试   |
| **Bug 修复**   | 功能缺陷、性能问题   | 🟠 高      | 尽快合并，回归测试   |
| **性能优化**   | 启动速度、内存优化   | 🟡 中      | 评估后合并           |
| **新功能**     | 新工具、新命令       | 🟡 中      | 选择性合并           |
| **UI 变更**    | 界面调整、主题更新   | 🟢 低      | 保留 OLA UI          |
| **文档更新**   | README、API 文档     | 🟢 低      | 合并 + 更新 OLA 文档 |
| **破坏性变更** | API 不兼容、配置变更 | ⚠️ 谨慎    | 评估影响，手动合并   |

### 合并风险评估

```
┌─────────────────────────────────────────────────────────────────┐
│                    合并风险评估                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  风险等级 = 变更范围 × 冲突概率 × 测试覆盖率                    │
│                                                                 │
│  低风险 (1-3 分):                                               │
│  ├── 文档更新                                                   │
│  ├── 测试用例                                                   │
│  └── 处理：直接合并                                             │
│                                                                 │
│  中风险 (4-6 分):                                               │
│  ├── 新功能添加                                                 │
│  ├── 性能优化                                                   │
│  └── 处理：测试后合并                                           │
│                                                                 │
│  高风险 (7-9 分):                                               │
│  ├── 核心逻辑修改                                               │
│  ├── API 变更                                                   │
│  └── 处理：手动合并，全面测试                                   │
│                                                                 │
│  极高风险 (10 分):                                              │
│  ├── 架构重构                                                   │
│  ├── 破坏性变更                                                 │
│  └── 处理：评估是否跟随，可能 fork 维护                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、OLA 自定义功能保护清单

### 必须保留的核心修改

#### 1. 品牌相关

- [ ] `package.json` - 包名 `ola`
- [ ] `packages/cli/src/ui/components/Header.tsx` - UI 品牌文本
- [ ] `packages/core/src/config/storage.ts` - 配置目录 `.ola`
- [ ] `packages/cli/src/i18n/locales/*.js` - 中文翻译
- [ ] 所有 `qwen` → `ola` 的替换

#### 2. 新增功能

- [ ] 危险命令警告功能
  - `packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx`
  - `packages/cli/src/ui/components/messages/DangerousCommandDetection.test.ts`

- [ ] 权限确认系统
  - `packages/core/src/permissions/`
  - `packages/cli/src/config/settingsSchema.ts` (trustedCommands)

- [ ] 用户身份检测
  - `packages/core/src/auth/fortress-user-detector.ts`
  - `packages/core/src/utils/ssh-user-detector.ts`

- [ ] 审计日志系统
  - `packages/core/src/audit/`

#### 3. 配置文件

- [ ] `~/.ola/settings.json` - 默认配置
- [ ] `docs/` - OLA 文档
- [ ] `scripts/` - OLA 自定义脚本

### 合并后检查清单

```bash
#!/bin/bash
# scripts/post-merge-check.sh

echo "=== 合并后检查清单 ==="
echo ""

# 1. 检查品牌文本
echo "1. 检查品牌文本..."
if grep -r "OLA\|ola" packages/cli/src/ui/components/Header.tsx | grep -q "AI Platform"; then
    echo "✅ 品牌文本正确"
else
    echo "❌ 品牌文本可能丢失"
fi

# 2. 检查配置目录
echo "2. 检查配置目录..."
if grep -r "\.ola" packages/core/src/config/storage.ts | grep -q "OLA_DIR"; then
    echo "✅ 配置目录正确"
else
    echo "❌ 配置目录可能丢失"
fi

# 3. 检查新增功能
echo "3. 检查新增功能..."
for feature in "DangerousCommandDetection" "AuditLogger" "FortressUserDetector"; do
    if find packages -name "*${feature}*" | grep -q .; then
        echo "✅ $feature 存在"
    else
        echo "❌ $feature 可能丢失"
    fi
done

# 4. 运行测试
echo "4. 运行测试..."
npm test 2>&1 | tail -5

# 5. 构建验证
echo "5. 构建验证..."
npm run build 2>&1 | tail -3

echo ""
echo "检查完成！"
```

---

## 七、常见问题解答

### Q1: 如何处理频繁的合并冲突？

**A**:

1. **增加合并频率**：每周合并一次，减少冲突积累
2. **分支管理**：保持 main 与上游同步，dev 分支做自定义
3. **模块化**：将 OLA 自定义功能模块化，减少冲突面

### Q2: 上游进行了破坏性变更怎么办？

**A**:

1. **评估影响**：分析变更对 OLA 的影响范围
2. **创建适配层**：为 OLA 自定义功能创建适配层
3. **选择性跟随**：评估是否跟随变更，或维护 fork 版本

### Q3: 如何保持 OLA 特色功能？

**A**:

1. **功能隔离**：将 OLA 特色功能放在独立模块
2. **插件化**：通过插件系统实现特色功能
3. **配置化**：通过配置文件控制功能开关

### Q4: 合并后测试失败怎么办？

**A**:

1. **回滚**：`git merge --abort` 或回退到备份分支
2. **定位问题**：使用 `git diff` 定位问题代码
3. **逐步合并**：分多次合并，每次合并后测试

### Q5: 如何通知用户上游更新？

**A**:

1. **Release Notes**：每次合并后发布更新说明
2. **变更日志**：维护 CHANGELOG.md
3. **博客文章**：重大更新发布博客文章

---

## 八、最佳实践

### 1. 分支管理

```bash
# 推荐分支结构
main              # 与上游保持同步
├── dev           # OLA 开发分支
│   ├── feature/* # 功能分支
│   └── bugfix/*  # 修复分支
└── release/*     # 发布分支
```

### 2. 提交规范

```bash
# 使用 Conventional Commits
feat: 添加危险命令警告功能
fix: 修复权限检查逻辑
docs: 更新合并指南文档
chore: 更新依赖版本

# 合并提交
merge: upstream qwen-code@v0.14.0
```

### 3. 文档维护

- 每次合并后更新 `OLA_CHANGES.md`
- 记录与上游的差异
- 维护合并历史记录

### 4. 自动化测试

```yaml
# 每次合并后自动运行
- npm test # 单元测试
- npm run build # 构建验证
- ola --version # 功能测试
```

---

## 九、总结

### 合并策略选择

| 场景     | 推荐策略           | 频率 |
| -------- | ------------------ | ---- |
| 日常维护 | 策略 A：定期合并   | 每周 |
| 重大更新 | 策略 B：选择性合并 | 按需 |
| 长期维护 | 策略 C：分支隔离   | 持续 |

### 关键要点

1. **定期合并**：避免冲突积累
2. **测试验证**：每次合并后全面测试
3. **文档记录**：记录所有自定义修改
4. **备份分支**：合并前创建备份
5. **自动化**：使用脚本和 CI/CD 自动化流程

### 推荐工具

- **合并脚本**: `scripts/merge-upstream.sh`
- **检查脚本**: `scripts/check-merge-compatibility.sh`
- **CI/CD**: GitHub Actions 自动合并
- **备份**: 定期创建备份分支

---

**文档维护**: OLA 开发团队  
**审核状态**: 待评审  
**下次更新**: 2026-04-25 或根据合并实践更新
