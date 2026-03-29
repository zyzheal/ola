#!/bin/bash
#
# 用户提示验证 Hook - 验证用户输入的提示
# 适用于 UserPromptSubmit 事件
#

set -e

# 读取 stdin 输入
INPUT=$(cat)

# 解析用户提示
USER_PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# 敏感词列表（可以根据需要扩展）
SENSITIVE_WORDS=(
    "password"
    "secret"
    "token"
    "api_key"
    "apikey"
    "private_key"
    "credentials"
    "密钥"
    "密码"
    "令牌"
)

# 检查敏感词
for word in "${SENSITIVE_WORDS[@]}"; do
    if echo "$USER_PROMPT" | grep -qiE "\\b$word\\b"; then
        echo '{
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": "⚠️ 注意：您的输入包含敏感信息（'"$word"'）。请勿在提示中包含密码、API 密钥等敏感内容。"
            }
        }'
        exit 0
    fi
done

# 检查提示长度
PROMPT_LENGTH=${#USER_PROMPT}
if [ "$PROMPT_LENGTH" -gt 2000 ]; then
    echo '{
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": "注意：您提交了一个较长的提示（'"$PROMPT_LENGTH"' 字符）。请确保需求描述清晰完整。"
        }
    }'
    exit 0
fi

# 正常情况，无需额外处理
exit 0
