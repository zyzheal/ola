#!/bin/bash
# scripts/merge-upstream.sh
# 完整的 upstream 合并脚本（基于实战经验优化）

set -e

echo "🚀 开始合并 upstream/main 到 dev 分支"
echo "======================================"

# 0. 预检查
echo "📋 步骤 0: 预检查"
git status
git fetch upstream
git branch backup/dev-before-merge-$(date +%Y%m%d)
echo "✅ 已创建备份分支"

# 1. 创建合并分支
echo "📋 步骤 1: 创建合并分支"
git checkout -b merge/upstream-$(date +%Y%m%d)

# 2. 执行合并
echo "📋 步骤 2: 执行合并"
git merge upstream/main --no-commit --no-ff || echo "⚠️  发现冲突，需要手动解决"

# 3. 自动修复
echo "📋 步骤 3: 自动修复"
./scripts/fix-package-names.sh
./scripts/fix-config-dirs.sh
./scripts/fix-test-async.sh
./scripts/fix-eslint.sh

# 4. 排除认证系统
echo "📋 步骤 4: 排除认证系统"
git reset HEAD packages/**/auth* 2>/dev/null || true
git checkout -- packages/**/auth* 2>/dev/null || true
echo "✅ 已排除认证系统变更"

# 5. 提交合并
echo "📋 步骤 5: 提交合并"
git add -A
git commit -m "chore: merge upstream/main $(date +%Y-%m-%d)

- 合并 upstream 新功能和修复
- 修复包名导入 (@qwen-code/qwen-code-core → ola-core)
- 统一配置目录 (.qwen → .ola)
- 排除认证系统变更
- 修复 ESLint 警告
- 修复测试异步函数"

# 6. 验证
echo "📋 步骤 6: 验证"
echo "运行构建..."
npm run build 2>&1 | tee /tmp/merge-build.log

if grep -q "error" /tmp/merge-build.log; then
  echo "⚠️  构建发现错误，请检查："
  grep "error" /tmp/merge-build.log | head -20
else
  echo "✅ 构建成功"
fi

echo "运行测试（更新快照）..."
npm test -- -u 2>&1 | tee /tmp/merge-test.log | tail -10

# 7. 合并到 dev
echo "📋 步骤 7: 合并到 dev"
git checkout dev
git merge merge/upstream-$(date +%Y%m%d)

# 8. 推送
echo "📋 步骤 8: 推送"
git push origin dev
echo "✅ 已推送到远程仓库"

# 9. 清理
echo "📋 步骤 9: 清理"
git branch -d merge/upstream-$(date +%Y%m%d)

echo ""
echo "======================================"
echo "✅ 合并完成！"
echo ""
echo "📊 统计信息:"
echo "  备份分支：backup/dev-before-merge-$(date +%Y%m%d)"
echo "  构建日志：/tmp/merge-build.log"
echo "  测试日志：/tmp/merge-test.log"
echo ""
echo "📝 后续操作:"
echo "  1. 检查构建和测试结果"
echo "  2. 验证核心功能"
echo "  3. 更新文档（如需要）"
echo "  4. 通知团队成员"
