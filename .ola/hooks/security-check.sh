#!/bin/bash
#
# 安全检测 Hook - 在工具执行前进行安全检查
# 适用于 PreToolUse 事件
#

set -e

# 读取 stdin 输入
INPUT=$(cat)

# 解析工具名称和输入
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [security-check] $*" >> ".ola/hooks/security-check.log"
}

log "Checking tool: $TOOL_NAME"

# 检测危险命令模式
DANGEROUS_PATTERNS=(
    "rm.*-rf\s*/"
    "rm.*--no-preserve-root"
    "dd\s+if=/dev/zero"
    "mkfs"
    "chmod.*777\s+/"
    "chown.*root:root\s+/"
    ":\\(\\)\\s*\\{\\s*:\\|:&\\s*\\}\\s*;"
    "curl.*\\|.*bash"
    "wget.*\\|.*bash"
)

# 检查是否包含危险模式
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$TOOL_INPUT" | grep -qiE "$pattern"; then
        log "BLOCKED: Dangerous pattern detected: $pattern"
        echo '{
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "检测到危险操作：'"$pattern"'。该操作可能对系统造成严重损害，已被安全策略阻止。"
            }
        }'
        exit 2
    fi
done

# 记录允许的操作
log "ALLOWED: Tool $TOOL_NAME passed security check"

# 输出允许结果
echo '{
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "allow",
        "permissionDecisionReason": "安全检测通过"
    }
}'

exit 0
