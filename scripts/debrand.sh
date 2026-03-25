#!/bin/bash

# OLA 去品牌化脚本 - 将 qwen 相关引用改为 ola
# 注意：保留模型名称（如 qwen-max, qwen-plus 等）

set -e

echo "=== OLA 去品牌化脚本 ==="
echo ""

# 定义需要保留的模式（模型名称等）
PRESERVE_PATTERNS=(
  "qwen-max"
  "qwen-plus"
  "qwen-turbo"
  "qwen-coder"
  "qwen2"
  "qwen3"
  "dashscope"
  "aliyun"
)

# 函数：检查是否应该保留
should_preserve() {
  local line="$1"
  for pattern in "${PRESERVE_PATTERNS[@]}"; do
    if [[ "$line" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

# 目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "正在处理 packages/ 目录..."

# 1. 修改配置文件中的引用
echo "  - 修改 package.json 文件..."
find packages -name "package.json" -type f | while read -r file; do
  sed -i '' 's/qwen-code/ola/g' "$file"
  sed -i '' 's/qwenlm/your-org/g' "$file"
done

# 2. 修改源码中的引用（排除测试文件）
echo "  - 修改 TypeScript/JavaScript 源文件..."
find packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | \
  grep -v "\.test\." | \
  grep -v "node_modules" | \
  grep -v "dist/" | \
  while read -r file; do
    # 跳过包含模型名称的行
    sed -i '' 's/Qwen Code/OLA/g' "$file"
    sed -i '' 's/qwen-code/ola/g' "$file"
    sed -i '' 's/QWEN_CODE/OLA_CODE/g' "$file"
    sed -i '' 's/qwenlm/your-org/g' "$file"
    sed -i '' 's/Qwen Team/OLA Team/g' "$file"
    sed -i '' 's/Qwen OAuth/OLA OAuth/g' "$file"
  done

# 3. 修改文档中的引用
echo "  - 修改文档文件..."
find docs -type f -name "*.md" | while read -r file; do
  sed -i '' 's/Qwen Code/OLA/g' "$file"
  sed -i '' 's/qwen-code/ola/g' "$file"
  sed -i '' 's/qwenlm/your-org/g' "$file"
done

# 4. 修改配置目录引用
echo "  - 修改配置目录引用..."
find packages -type f \( -name "*.ts" -o -name "*.tsx" \) | \
  grep -v "\.test\." | \
  grep -v "node_modules" | \
  grep -v "dist/" | \
  while read -r file; do
    # 将 .qwen 改为 .ola（但保留 .qwenignore 和 .qwen-code 文件名）
    sed -i '' "s/\\.qwen'/'.ola'/g" "$file"
    sed -i '' 's/\.qwenignore/.ola-ignore/g' "$file"
  done

echo ""
echo "=== 处理完成 ==="
echo ""
echo "请检查以下文件确保修改正确："
echo "  - packages/core/src/config/storage.ts"
echo "  - packages/cli/src/ui/components/Header.tsx"
echo "  - 所有 package.json 文件"
echo ""
echo "然后运行：git status 查看更改"
