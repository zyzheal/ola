#!/bin/bash
# scripts/fix-package-names.sh
# 修复包名导入：@qwen-code/qwen-code-core → ola-core

set -e

echo "🔧 修复包名导入..."

FIXED_COUNT=0
find packages/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) | while read file; do
  if grep -q "@qwen-code/qwen-code-core" "$file"; then
    sed -i '' 's/@qwen-code\/qwen-code-core/ola-core/g' "$file"
    echo "  ✓ $file"
    FIXED_COUNT=$((FIXED_COUNT + 1))
  fi
done

echo "✅ 包名修复完成 (修复 $FIXED_COUNT 个文件)"
