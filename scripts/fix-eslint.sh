#!/bin/bash
# scripts/fix-eslint.sh
# 修复 ESLint 警告（未使用的变量和导入）

set -e

echo "🔧 修复 ESLint 警告..."

# 修复 DialogManager.tsx 中的未使用导入
FILE="packages/cli/src/ui/components/DialogManager.tsx"
if [ -f "$FILE" ]; then
  sed -i '' "/import.*QwenOAuthProgress/s/^/\/\/ /" "$FILE"
  sed -i '' "/import.*AuthState/s/^/\/\/ /" "$FILE"
  sed -i '' "/import.*AuthType/s/^/\/\/ /" "$FILE"
  echo "  ✓ $FILE"
fi

# 修复未使用的参数
find packages/core/src -name "*.ts" | while read file; do
  if grep -q "signal?: AbortSignal" "$file"; then
    sed -i '' "s/\(signal?: AbortSignal,\)/\/\/ \1  \/\/ not used/" "$file"
    echo "  ✓ $file"
  fi
done

# 修复 acpAgent.ts 中的未使用参数
FILE="packages/cli/src/acp-integration/acpAgent.ts"
if [ -f "$FILE" ]; then
  sed -i '' "s/\(selectedType?: AuthType | string,\)/\/\/ \1  \/\/ not used in this build/" "$FILE"
  sed -i '' "s/\(error?: unknown,\)/\/\/ \1  \/\/ not used in this build/" "$FILE"
  echo "  ✓ $FILE"
fi

echo "✅ ESLint 修复完成"
