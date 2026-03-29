#!/bin/bash
#
# 会话初始化 Hook - 在会话开始时加载项目上下文
# 适用于 SessionStart 事件
#

set -e

# 读取 stdin 输入
INPUT=$(cat)

# 解析输入
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
SOURCE=$(echo "$INPUT" | jq -r '.source // empty')
MODEL=$(echo "$INPUT" | jq -r '.model // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# 日志文件
LOG_FILE=".ola/hooks/session-log.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 检测项目类型
PROJECT_TYPE="unknown"
if [ -f "package.json" ]; then
    PROJECT_TYPE="nodejs"
elif [ -f "pom.xml" ]; then
    PROJECT_TYPE="java-maven"
elif [ -f "build.gradle" ]; then
    PROJECT_TYPE="java-gradle"
elif [ -f "Cargo.toml" ]; then
    PROJECT_TYPE="rust"
elif [ -f "go.mod" ]; then
    PROJECT_TYPE="go"
elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    PROJECT_TYPE="python"
elif [ -f "Makefile" ]; then
    PROJECT_TYPE="make"
fi

# 获取 Git 分支
GIT_BRANCH=""
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
fi

# 写入日志
cat >> "$LOG_FILE" << EOF
================================================================================
[$(date '+%Y-%m-%d %H:%M:%S')] Session Started
--------------------------------------------------------------------------------
Session ID  : $SESSION_ID
Source      : $SOURCE
Model       : $MODEL
Working Dir : $CWD
Project Type: $PROJECT_TYPE
Git Branch  : $GIT_BRANCH
================================================================================

EOF

# 输出上下文信息
echo '{
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "项目类型：'"$PROJECT_TYPE"'，Git 分支：'"$GIT_BRANCH"'。会话已初始化。"
    }
}'

exit 0
