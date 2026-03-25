#!/bin/bash

# Ola - Merge Upstream Updates Script
# 用于合并 qwen-code 上游仓库的更新

set -e

# 配置
UPSTREAM_URL="https://github.com/QwenLM/qwen-code.git"
UPSTREAM_BRANCH="main"
LOCAL_BRANCH="main"
MERGE_BRANCH="merge-upstream-$(date +%Y%m%d)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Ola - 合并上游更新脚本${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}错误：当前目录不是 Git 仓库${NC}"
    exit 1
fi

# 检查是否已配置 upstream
if ! git remote | grep -q "upstream"; then
    echo -e "${YELLOW}未找到 upstream 远程仓库，正在添加...${NC}"
    git remote add upstream "$UPSTREAM_URL"
    echo -e "${GREEN}✓ 已添加 upstream: $UPSTREAM_URL${NC}"
else
    echo -e "${GREEN}✓ Upstream 远程仓库已配置${NC}"
fi

echo ""
echo -e "${YELLOW}步骤 1: 获取上游仓库最新更改...${NC}"
git fetch upstream
echo -e "${GREEN}✓ 获取完成${NC}"

echo ""
echo -e "${YELLOW}步骤 2: 检查当前分支状态...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支：$CURRENT_BRANCH"

# 切换到主分支
if ! git checkout "$LOCAL_BRANCH"; then
    echo -e "${RED}错误：无法切换到 $LOCAL_BRANCH 分支${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 已切换到 $LOCAL_BRANCH 分支${NC}"

echo ""
echo -e "${YELLOW}步骤 3: 检查是否有未提交的更改...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}警告：存在未提交的更改${NC}"
    echo "请先提交或暂存更改，然后重新运行此脚本"
    git status
    exit 1
fi
echo -e "${GREEN}✓ 工作区干净${NC}"

echo ""
echo -e "${YELLOW}步骤 4: 创建合并分支...${NC}"
git checkout -b "$MERGE_BRANCH"
echo -e "${GREEN}✓ 已创建分支：$MERGE_BRANCH${NC}"

echo ""
echo -e "${YELLOW}步骤 5: 合并上游更改...${NC}"
if git merge upstream/"$UPSTREAM_BRANCH"; then
    echo -e "${GREEN}✓ 合并成功${NC}"
else
    echo -e "${RED}⚠️  合并过程中出现冲突${NC}"
    echo ""
    echo "请按以下步骤解决冲突："
    echo "1. 查看冲突文件：git status"
    echo "2. 编辑冲突文件（搜索 <<<<<<<, =======, >>>>>>> 标记）"
    echo "3. 解决冲突后标记为已解决：git add <文件名>"
    echo "4. 完成合并：git commit"
    echo ""
    echo -e "${YELLOW}提示：重点关注以下文件的冲突${NC}"
    echo "  - packages/core/src/core/prompts.ts (系统提示词)"
    echo "  - packages/cli/src/ui/components/Header.tsx (UI 文本)"
    echo "  - packages/cli/src/utils/languageUtils.ts (语言设置)"
    echo "  - package.json (依赖版本)"
    echo "  - packages/*/package.json (包名配置)"
    exit 0
fi

echo ""
echo -e "${YELLOW}步骤 6: 运行构建测试...${NC}"
if command -v npm &> /dev/null; then
    echo "正在安装依赖..."
    npm ci
    
    echo "正在构建..."
    if npm run build; then
        echo -e "${GREEN}✓ 构建成功${NC}"
    else
        echo -e "${RED}⚠️  构建失败，请检查错误信息${NC}"
    fi
else
    echo -e "${YELLOW}跳过构建测试（未找到 npm）${NC}"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  合并完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "下一步操作："
echo "1. 审查更改：git diff upstream/$UPSTREAM_BRANCH"
echo "2. 提交合并：git commit -m 'Merge upstream updates from $(date +%Y-%m-%d)'"
echo "3. 推送到远程：git push origin $MERGE_BRANCH"
echo "4. 创建 Pull Request 进行代码审查"
echo "5. 合并到主分支后删除临时分支"
echo ""
