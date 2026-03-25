# OLA Git 配置与推送指南

## 当前配置

### 远程仓库

```bash
# 你的 Fork 仓库（origin）
git@github.com:zyzheal/ola.git

# 上游原始仓库（upstream）
https://github.com/QwenLM/ola.git
```

### 分支结构

```
main  - 主分支（与上游同步）
dev   - 开发分支（OLA 自定义功能）✅ 已推送到远程
```

### 当前状态

- ✅ 远程仓库已配置
- ✅ dev 分支已推送到 `origin/dev`
- ✅ 最近提交：
  - `c7ff68e` - Add local update features and documentation
  - `ae1d74a` - OLA customization: de-branding and Chinese default

## 首次推送

由于 SSH 密钥验证问题，请手动执行以下命令：

```bash
cd /Users/heal/devops/ai-platform-design/implementation/tools

# 推送到 dev 分支
git push -u origin dev
```

如果遇到 SSH 密钥警告，先执行：

```bash
# 清除旧的 GitHub 密钥
ssh-keygen -R github.com

# 添加新的 GitHub 密钥
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

# 再次推送
git push -u origin dev
```

## 日常开发流程

### 1. 在 dev 分支开发

```bash
# 切换到 dev 分支
git checkout dev

# 进行修改
# ... 编辑文件 ...

# 提交更改
git add .
git commit -m "描述你的更改"

# 推送到远程
git push origin dev
```

### 2. 同步上游更新

```bash
# 获取上游最新代码
git fetch upstream

# 切换到 main 分支
git checkout main

# 合并上游更新
git merge upstream/main

# 推送到你的 Fork
git push origin main

# 切换回 dev 分支
git checkout dev

# 合并 main 分支的更新
git merge main

# 解决可能的冲突
# ... 编辑冲突文件 ...

# 提交合并
git commit -m "Merge upstream updates"

# 推送到远程
git push origin dev
```

## 合并上游新特性的完整流程

### 方法一：使用自动化脚本

```bash
# 运行合并脚本
./scripts/merge-upstream.sh
```

### 方法二：手动合并

```bash
# 1. 获取上游更新
git fetch upstream

# 2. 创建合并分支
git checkout -b merge-upstream-$(date +%Y%m%d)

# 3. 合并上游 main 分支
git merge upstream/main

# 4. 解决冲突
# 重点关注以下文件：
# - packages/core/src/core/prompts.ts (系统提示词)
# - packages/cli/src/ui/components/Header.tsx (UI 文本)
# - packages/cli/src/utils/languageUtils.ts (语言设置)
# - package.json (依赖版本)
# - packages/*/package.json (包名配置)

# 5. 测试
npm ci
npm run build
npm test

# 6. 提交合并
git commit -m "Merge upstream updates from $(date +%Y-%m-%d)"

# 7. 推送到远程
git push origin merge-upstream-$(date +%Y%m%d)

# 8. 创建 Pull Request 并审查
# 9. 合并到 dev 分支
git checkout dev
git merge merge-upstream-$(date +%Y%m%d)
git push origin dev

# 10. 清理临时分支
git branch -d merge-upstream-$(date +%Y%m%d)
```

## 保留的 OLA 自定义修改

合并时请保留以下修改：

### 1. 品牌名称

- 包名：`ola`, `ola-core`
- 命令：`ola`
- 配置目录：`~/.ola`

### 2. 系统提示词

- 文件：`packages/core/src/core/prompts.ts`
- 身份：`AI Platform Code Assistant`

### 3. UI 文本

- 文件：`packages/cli/src/ui/components/Header.tsx`
- 欢迎界面：`AI Platform Code Assistant`

### 4. 默认语言

- 文件：`packages/cli/src/utils/languageUtils.ts`
- 默认值：`Chinese`

### 5. 环境变量

- 主要：`OLA_*`
- 向后兼容：保留 `QWEN_*` 支持

## 查看提交历史

```bash
# 查看最近的提交
git log --oneline -10

# 查看 dev 分支提交
git log dev --oneline

# 查看与上游的差异
git log upstream/main..dev --oneline
```

## 创建 Pull Request

如果你想将 OLA 的改进贡献给上游：

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 进行修改并提交
# ... 编辑文件 ...
git commit -m "Add your feature"

# 3. 推送到你的 Fork
git push origin feature/your-feature

# 4. 在 GitHub 上创建 Pull Request
# 访问：https://github.com/QwenLM/ola/compare
# 选择你的分支并创建 PR
```

## 常见问题

### Q: 推送时出现 SSH 密钥错误

```bash
# 清除旧密钥
ssh-keygen -R github.com

# 添加新密钥
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

# 测试连接
ssh -T git@github.com
```

### Q: 合并冲突太多，想放弃

```bash
# 中止合并
git merge --abort

# 删除合并分支
git checkout dev
git branch -D merge-upstream-YYYYMMDD
```

### Q: 查看远程仓库状态

```bash
# 查看远程分支
git branch -r

# 查看远程仓库信息
git remote -v

# 获取远程状态（不下载）
git remote show origin
git remote show upstream
```

## 当前提交状态

```bash
# 查看当前分支
git branch

# 查看提交历史
git log --oneline -5

# 查看远程追踪状态
git status
```

## 相关文档

- [OLA_CHANGES.md](../OLA_CHANGES.md) - 自定义修改记录
- [UPSTREAM_MANAGEMENT.md](./UPSTREAM_MANAGEMENT.md) - 上游更新管理
- [USAGE.md](./USAGE.md) - 使用指南
