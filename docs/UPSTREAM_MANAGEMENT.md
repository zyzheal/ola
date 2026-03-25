# OLA 二次开发管理指南

本文档说明如何管理基于 qwen-code 二次开发的 OLA 项目，包括如何合并上游更新、管理自定义修改等。

## 目录

1. [项目结构](#项目结构)
2. [Git 仓库配置](#git-仓库配置)
3. [合并上游更新](#合并上游更新)
4. [管理自定义修改](#管理自定义修改)
5. [冲突解决策略](#冲突解决策略)
6. [版本管理](#版本管理)

---

## 项目结构

```
ola/
├── .git/
├── packages/
│   ├── cli/              # CLI 主程序 (ola)
│   ├── core/             # 核心库 (ola-core)
│   ├── sdk-typescript/   # TypeScript SDK
│   ├── sdk-java/         # Java SDK
│   ├── webui/            # Web UI 组件
│   └── ...
├── docs/                 # 文档
├── scripts/              # 构建和管理脚本
│   ├── merge-upstream.sh # 上游合并脚本
│   └── ...
├── OLA_CHANGES.md        # 自定义修改记录
├── package.json          # 根配置 (name: ola)
└── README.md
```

---

## Git 仓库配置

### 初始设置

```bash
# 1. Fork qwen-code 到你的 GitHub 账号
# 访问：https://github.com/QwenLM/qwen-code

# 2. 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/qwen-code.git ola
cd ola

# 3. 添加上游仓库
git remote add upstream https://github.com/QwenLM/qwen-code.git

# 4. 验证配置
git remote -v
# 输出应该类似：
# origin    https://github.com/YOUR_USERNAME/qwen-code.git (fetch)
# origin    https://github.com/YOUR_USERNAME/qwen-code.git (push)
# upstream  https://github.com/QwenLM/qwen-code.git (fetch)
# upstream  https://github.com/QwenLM/qwen-code.git (push)
```

### 分支策略

```
main (或 master)
├── 保持与上游 main 分支同步
└── 不直接在此分支上进行自定义修改

ola-customization (你的自定义分支)
├── 包含所有 OLA 特定的修改
├── 定期从 main 合并更新
└── 用于日常开发和发布

feature/* (功能分支)
├── 从 ola-customization 分支创建
├── 开发新功能
└── 完成后合并回 ola-customization
```

---

## 合并上游更新

### 方法一：使用自动化脚本（推荐）

```bash
# 在项目根目录执行
./scripts/merge-upstream.sh
```

脚本会自动：
1. 获取上游最新代码
2. 创建合并分支
3. 执行合并
4. 运行构建测试
5. 提供后续操作指引

### 方法二：手动合并

```bash
# 1. 获取上游更新
git fetch upstream

# 2. 切换到主分支
git checkout main

# 3. 合并上游更改
git merge upstream/main

# 4. 解决冲突（如果有）
git status
# 编辑冲突文件...
git add <resolved-files>
git commit -m "Merge upstream updates"

# 5. 更新自定义分支
git checkout ola-customization
git merge main

# 6. 推送到远程
git push origin ola-customization
```

### 合并频率建议

- **定期合并**: 每 2-4 周合并一次上游更新
- **紧急修复**: 上游发布重要安全修复时立即合并
- **大版本更新**: 先在下游分支测试，确认稳定后再合并

---

## 管理自定义修改

### 核心修改清单

以下文件包含 OLA 的核心自定义修改，合并时需要特别注意：

| 文件 | 修改内容 | 优先级 |
|------|---------|--------|
| `packages/core/src/core/prompts.ts` | 系统提示词、AI 身份 | 🔴 高 |
| `packages/cli/src/ui/components/Header.tsx` | UI 品牌名称 | 🔴 高 |
| `packages/cli/src/utils/languageUtils.ts` | 默认语言设置 | 🔴 高 |
| `packages/core/src/config/storage.ts` | 配置目录名称 | 🟡 中 |
| `package.json` (所有) | 包名、命令 | 🔴 高 |
| `packages/cli/src/utils/systemInfoFields.ts` | 状态显示名称 | 🟡 中 |

### 修改记录

所有自定义修改都应记录在 `OLA_CHANGES.md` 中，包括：
- 修改日期
- 修改文件
- 修改内容
- 修改原因

---

## 冲突解决策略

### 优先级规则

1. **保留 OLA 自定义** 的情况：
   - 品牌名称（ola, AI Platform Code Assistant）
   - 系统提示词内容
   - 默认语言设置
   - 配置目录名称（.ola）

2. **接受上游更新** 的情况：
   - 新功能实现
   - Bug 修复
   - 性能优化
   - 安全补丁

3. **需要手动审查** 的情况：
   - API 接口变更
   - 数据结构变更
   - 工具函数签名变更

### 冲突解决示例

```bash
# 遇到冲突时
git status

# 查看具体冲突
git diff

# 使用工具解决冲突
git mergetool
# 或使用你喜欢的编辑器手动编辑

# 标记为已解决
git add <filename>

# 完成合并
git commit
```

### 关键文件冲突处理

#### 1. prompts.ts (系统提示词)

```diff
<<<<<<< HEAD
- You are AI Platform Code Assistant, an interactive CLI agent...
=======
+ You are Qwen Code, an interactive CLI agent...
+ [上游新增的功能说明]
>>>>>>> upstream/main
```

**解决方案**: 保留 OLA 身份，合并新功能说明

```diff
+ You are AI Platform Code Assistant, an interactive CLI agent...
+ [合并上游新增的功能说明]
```

#### 2. package.json (包名)

```diff
<<<<<<< HEAD
- "name": "ola",
=======
+ "name": "@qwen-code/qwen-code",
>>>>>>> upstream/main
```

**解决方案**: 始终保留 OLA 包名

---

## 版本管理

### 版本号规则

```
OLA 版本 = 上游版本 + OLA 修订号

示例:
上游 v0.13.0 → OLA v0.13.0 (初始版本)
上游 v0.13.0 + OLA 修复 → OLA v0.13.0-ola.1
上游 v0.14.0 → OLA v0.14.0
```

### 发布流程

```bash
# 1. 确保所有自定义修改已提交
git checkout ola-customization

# 2. 更新版本号
npm version patch  # 或 minor/major

# 3. 运行测试
npm run preflight

# 4. 构建
npm run build

# 5. 创建 Git 标签
git tag -a v0.13.0-ola.1 -m "OLA Release v0.13.0-ola.1"

# 6. 推送
git push origin ola-customization
git push origin v0.13.0-ola.1
```

---

## 自动化 CI/CD 建议

### GitHub Actions 工作流

创建 `.github/workflows/merge-upstream.yml`:

```yaml
name: Check for Upstream Updates

on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一检查

jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Fetch upstream
        run: git fetch upstream
      
      - name: Check for new commits
        run: |
          git fetch upstream
          UPSTREAM_LATEST=$(git rev-parse upstream/main)
          LOCAL_LATEST=$(git rev-parse main)
          
          if [ "$UPSTREAM_LATEST" != "$LOCAL_LATEST" ]; then
            echo "Upstream has new commits!"
            # 可以触发通知或自动创建 PR
          fi
```

---

## 故障排除

### 常见问题

**Q: 合并后构建失败**
```bash
# 清理并重新构建
npm run clean
npm ci
npm run build
```

**Q: 冲突太多，想放弃合并**
```bash
# 中止合并
git merge --abort

# 删除合并分支
git checkout main
git branch -D merge-upstream-YYYYMMDD
```

**Q: 不小心覆盖了自定义修改**
```bash
# 从 Git 历史恢复
git log -- packages/core/src/core/prompts.ts
git checkout <commit-hash> -- packages/core/src/core/prompts.ts
```

---

## 相关资源

- [Git 官方文档 - 合并分支](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%90%88%E5%B9%B6%E5%92%8C%E5%86%B2%E7%AA%81)
- [GitHub Docs - 配置远程仓库](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork)
- [OLA_CHANGES.md](./OLA_CHANGES.md) - OLA 自定义修改详细记录

---

## 联系与支持

如有问题，请查看：
- `OLA_CHANGES.md` - 自定义修改记录
- `scripts/merge-upstream.sh` - 自动化合并脚本
