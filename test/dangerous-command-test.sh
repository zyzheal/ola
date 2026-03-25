#!/bin/bash

# 危险命令警告功能测试脚本

echo "======================================"
echo "OLA 危险命令警告功能测试"
echo "======================================"
echo ""

# 测试命令列表
declare -a dangerous_commands=(
  "rm /tmp/test.txt"
  "rm -rf /tmp/test"
  "mv /tmp/test /tmp/test2"
  "delete C:\\temp\\test.txt"
  "del C:\\temp\\test.txt"
  "rmdir /tmp/test"
)

# 安全命令列表
declare -a safe_commands=(
  "ls -la"
  "cat /tmp/test.txt"
  "grep 'pattern' file.txt"
  "find . -name '*.ts'"
)

echo "✅ 危险命令列表（应显示警告）:"
for cmd in "${dangerous_commands[@]}"; do
  echo "  - $cmd"
done

echo ""
echo "✅ 安全命令列表（不应显示警告）:"
for cmd in "${safe_commands[@]}"; do
  echo "  - $cmd"
done

echo ""
echo "======================================"
echo "测试说明"
echo "======================================"
echo ""
echo "1. 启动 OLA:"
echo "   cd /Users/heal/devops/ai-platform-design/implementation/tools"
echo "   npm start"
echo ""
echo "2. 在 OLA 中执行以下命令测试:"
echo ""
echo "   危险命令测试:"
echo "   > 请帮我删除 /tmp/test.txt 文件"
echo "   > 请帮我移动这个文件到另一个目录"
echo ""
echo "   安全命令测试:"
echo "   > 请帮我查看当前目录的文件"
echo "   > 请帮我搜索包含 'test' 的文件"
echo ""
echo "3. 观察确认对话框:"
echo "   - 危险命令应显示红色警告信息"
echo "   - 安全命令只显示标准确认"
echo ""
echo "======================================"
echo "预期效果"
echo "======================================"
echo ""
echo "危险命令确认框:"
echo "╭────────────────────────────────────────────────╮"
echo "│ Allow execution of: 'rm /tmp/test.txt'?        │"
echo "│                                                │"
echo "│ ⚠️  危险操作警告！                              │"
echo "│ 请再想一下是否真的要执行此操作？                 │"
echo "│ 我可记录着你的操作日志，休想让我背锅！           │"
echo "│                                                │"
echo "│   1. Yes, allow once                           │"
echo "│   2. No, suggest changes (esc)                 │"
echo "╰────────────────────────────────────────────────╯"
echo ""
echo "======================================"
