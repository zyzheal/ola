#!/bin/bash
#
# 工具执行日志 Hook - 记录所有工具的执行情况
# 适用于 PostToolUse 事件
#

set -e

# 读取 stdin 输入
INPUT=$(cat)

# 解析输入
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')
TOOL_RESPONSE=$(echo "$INPUT" | jq -r '.tool_response // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp // empty')

# 日志文件
LOG_FILE=".ola/hooks/tool-execution.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 写入日志
cat >> "$LOG_FILE" << EOF
================================================================================
[$TIMESTAMP] Tool Execution Log
--------------------------------------------------------------------------------
Session ID  : $SESSION_ID
Tool Name   : $TOOL_NAME
Input       : $TOOL_INPUT
Response    : $TOOL_RESPONSE
Status      : SUCCESS
================================================================================

EOF

exit 0
