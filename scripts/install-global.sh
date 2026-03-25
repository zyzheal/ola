#!/bin/bash

# OLA 全局安装脚本
# 用于从源码全局安装 OLA 到本地系统

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  OLA 全局安装脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误：请在 OLA 项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查 Node.js 版本
echo -e "${YELLOW}步骤 1: 检查 Node.js 版本...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}错误：需要 Node.js >= 20，当前版本：$(node -v)${NC}"
    echo "请使用 nvm 升级：nvm install 20"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 版本：$(node -v)${NC}"
echo ""

# 检查 npm
echo -e "${YELLOW}步骤 2: 检查 npm...${NC}"
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm 版本：$NPM_VERSION${NC}"
echo ""

# 初始化 Git（如果未初始化）
echo -e "${YELLOW}步骤 3: 检查 Git 仓库...${NC}"
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial OLA commit"
    echo -e "${GREEN}✓ Git 仓库已初始化${NC}"
else
    echo -e "${GREEN}✓ Git 仓库已存在${NC}"
fi
echo ""

# 安装依赖
echo -e "${YELLOW}步骤 4: 安装依赖...${NC}"
if [ -f "package-lock.json" ] && [ ! -f "node_modules/.installed" ]; then
    npm ci
else
    npm install
fi
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 构建项目
echo -e "${YELLOW}步骤 5: 构建项目...${NC}"
npm run build
npm run bundle
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 全局安装
echo -e "${YELLOW}步骤 6: 全局安装...${NC}"
echo "使用 npm link 进行全局安装..."
npm link
echo -e "${GREEN}✓ 全局安装完成${NC}"
echo ""

# 验证安装
echo -e "${YELLOW}步骤 7: 验证安装...${NC}"
OLA_PATH=$(which ola)
OLA_VERSION=$(ola --version)
echo -e "${GREEN}✓ ola 命令位置：$OLA_PATH${NC}"
echo -e "${GREEN}✓ ola 版本：$OLA_VERSION${NC}"
echo ""

# 创建配置目录
echo -e "${YELLOW}步骤 8: 检查配置目录...${NC}"
if [ ! -d "$HOME/.ola" ]; then
    mkdir -p "$HOME/.ola"
    echo -e "${GREEN}✓ 已创建配置目录：~/.ola${NC}"
else
    echo -e "${GREEN}✓ 配置目录已存在：~/.ola${NC}"
fi
echo ""

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  OLA 全局安装成功！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "使用方式："
echo "  ola                    # 启动交互式会话"
echo "  ola -p \"你的问题\"       # 非交互式模式"
echo "  ola --help             # 查看帮助"
echo "  ola --version          # 查看版本"
echo ""
echo "配置目录：~/.ola"
echo ""
echo "如需卸载："
echo "  npm unlink -g ola"
echo "  rm -rf ~/.ola  # 可选，删除配置"
echo ""
