#!/bin/bash
# scripts/fix-config-dirs.sh
# 修复配置目录引用：.qwen → .ola

set -e

echo "🔧 修复配置目录引用..."

FIXED_COUNT=0
find packages/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) | while read file; do
  if grep -q "\.qwen" "$file"; then
    sed -i '' 's/\.qwen/\.ola/g' "$file"
    echo "  ✓ $file"
    FIXED_COUNT=$((FIXED_COUNT + 1))
  fi
done

echo "✅ 配置目录修复完成 (修复 $FIXED_COUNT 个文件)"
