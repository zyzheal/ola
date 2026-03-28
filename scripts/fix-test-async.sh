#!/bin/bash
# scripts/fix-test-async.sh
# 修复测试文件中的异步函数问题

set -e

echo "🔧 修复测试文件异步函数..."

FIXED_COUNT=0
find packages/ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # 找到包含 await 的 it 函数并添加 async
  while IFS=: read -r line_num _; do
    # 检查是否已有 async
    if ! sed -n "${line_num}p" "$file" | grep -q "async"; then
      sed -i "" "${line_num}s/() => {/async () => {/" "$file"
      echo "  ✓ $file:$line_num"
      FIXED_COUNT=$((FIXED_COUNT + 1))
    fi
  done < <(grep -n "it('.*await" "$file" 2>/dev/null || true)
done

echo "✅ 测试异步修复完成 (修复 $FIXED_COUNT 处)"
