# OLA 项目目录结构与打包指南

本文档详细介绍 OLA 项目的目录结构、打包依赖关系以及生成的产物。

## 📁 完整目录结构

```
ola/implementation/tools/
├── packages/                          # 核心包目录
│   ├── cli/                          # CLI 主程序
│   │   ├── src/                      # 源代码
│   │   │   ├── acp-integration/      # ACP 集成
│   │   │   ├── commands/             # 命令实现
│   │   │   ├── config/               # 配置管理
│   │   │   ├── i18n/                 # 国际化
│   │   │   │   ├── locales/          # 语言包 (en, zh, ja, 等)
│   │   │   │   └── index.ts          # i18n 入口
│   │   │   ├── services/             # 服务层
│   │   │   │   ├── insight/          # 洞察报告生成
│   │   │   │   │   ├── generators/   # 生成器
│   │   │   │   │   └── types/        # 类型定义
│   │   │   │   └── FileCommandLoader.ts
│   │   │   ├── ui/                   # UI 组件
│   │   │   │   ├── commands/         # UI 命令
│   │   │   │   ├── components/       # React 组件
│   │   │   │   └── utils/export/     # 导出工具
│   │   │   ├── utils/                # 工具函数
│   │   │   ├── gemini.tsx            # 主入口组件
│   │   │   └── index.ts              # 包入口
│   │   ├── dist/                     # 构建产物 ⭐
│   │   │   ├── cli.js                # 打包后的 CLI (esbuild)
│   │   │   ├── src/                  # 复制的资源文件
│   │   │   │   ├── commands/extensions/examples/
│   │   │   │   ├── i18n/locales/*.js # 语言包
│   │   │   │   └── **/*.md           # 文档文件
│   │   │   ├── bundled/              # 内置技能
│   │   │   │   └── review/SKILL.md
│   │   │   └── vendor/               # 二进制工具
│   │   │       ├── ripgrep/          # 代码搜索
│   │   │       └── tree-sitter/      # 代码解析
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                         # 核心库 (ola-core)
│   │   ├── src/                      # 源代码
│   │   │   ├── tools/                # 工具实现
│   │   │   ├── services/             # 服务
│   │   │   ├── skills/               # 技能系统
│   │   │   │   └── bundled/          # 内置技能
│   │   │   └── index.ts
│   │   ├── dist/                     # 构建产物 ⭐
│   │   │   ├── **/*.js               # 编译后的 JS
│   │   │   └── **/*.d.ts             # TypeScript 声明
│   │   ├── vendor/                   # 二进制依赖 ⭐
│   │   │   ├── ripgrep/              # rg 工具
│   │   │   └── tree-sitter/          # WASM 解析器
│   │   ├── package.json
│   │   └── scripts/postinstall.js    # 安装后脚本
│   │
│   ├── web-templates/                # Web 模板包
│   │   ├── src/                      # 源代码
│   │   │   ├── insight/              # 洞察报告模板
│   │   │   │   ├── src/              # React 组件
│   │   │   │   │   ├── App.tsx
│   │   │   │   │   ├── Charts.tsx    # 图表组件
│   │   │   │   │   ├── Header.tsx    # 头部
│   │   │   │   │   ├── Qualitative.tsx # 定性分析
│   │   │   │   │   ├── ShareCard.tsx # 分享卡片
│   │   │   │   │   ├── Components.tsx # 通用组件
│   │   │   │   │   └── i18n/zhCN.ts  # 中文翻译
│   │   │   │   ├── index.html        # HTML 模板
│   │   │   │   └── build.mjs         # 构建脚本
│   │   │   ├── export-html/          # 导出 HTML 模板
│   │   │   │   ├── src/
│   │   │   │   │   ├── main.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   └── index.html
│   │   │   │   └── build.mjs
│   │   │   ├── generated/            # 生成的模板 ⭐
│   │   │   │   ├── insightTemplate.ts    # INSIGHT_JS/CSS
│   │   │   │   └── exportHtmlTemplate.ts # HTML_TEMPLATE
│   │   │   └── index.ts              # 包入口
│   │   ├── dist/                     # Vite 构建产物 ⭐
│   │   │   ├── main.js               # 打包后的 JS
│   │   │   └── main.css              # 打包后的 CSS
│   │   ├── build.mjs                 # 主构建脚本
│   │   └── package.json
│   │
│   ├── webui/                        # Web UI 组件库
│   │   ├── src/                      # React 组件
│   │   ├── dist/                     # 构建产物 ⭐
│   │   │   ├── index.js, index.cjs   # ESM/CJS 版本
│   │   │   ├── index.d.ts            # TypeScript 声明
│   │   │   └── styles.css            # 样式文件
│   │   └── package.json
│   │
│   ├── sdk-typescript/               # TypeScript SDK
│   │   ├── src/                      # SDK 源代码
│   │   ├── dist/                     # 构建产物 ⭐
│   │   │   ├── index.mjs             # ESM 版本
│   │   │   ├── index.cjs             # CommonJS 版本
│   │   │   └── index.d.ts            # TypeScript 声明
│   │   └── package.json
│   │
│   ├── vscode-ide-companion/         # VSCode 扩展
│   │   ├── src/                      # 扩展源代码
│   │   ├── dist/                     # 构建产物 ⭐
│   │   │   └── extension.cjs         # 打包后的扩展
│   │   ├── *.vsix                    # VSIX 安装包 ⭐
│   │   └── package.json
│   │
│   ├── test-utils/                   # 测试工具 (私有)
│   │   └── src/                      # 测试工具代码
│   │
│   ├── sdk-java/                     # Java SDK
│   └── zed-extension/                # Zed 编辑器扩展
│
├── scripts/                          # 构建和工具脚本
│   ├── build.js                      # 主构建脚本
│   ├── build_package.js              # 包构建脚本
│   ├── build_sandbox.js              # 沙箱镜像构建
│   ├── build_vscode_companion.js     # VSCode 扩展构建
│   ├── copy_bundle_assets.js         # 复制打包资源
│   ├── copy_files.js                 # 复制资源文件
│   ├── esbuild.config.js             # esbuild 配置
│   └── ...
│
├── integration-tests/                # 集成测试
├── docs/                             # 文档源码
├── docs-site/                        # 文档网站 (Next.js)
├── eslint-rules/                     # 自定义 ESLint 规则
│
├── dist/                             # 根目录构建产物 ⭐
│   ├── cli.js                        # 打包后的 CLI (单个文件)
│   ├── src/                          # 复制的资源
│   ├── bundled/                      # 内置技能
│   └── vendor/                       # 二进制工具
│
├── package.json                      # 根包配置 (workspaces)
├── tsconfig.json                     # TypeScript 配置
├── esbuild.config.js                 # esbuild 配置
├── Dockerfile                        # Docker 镜像
└── README.md                         # 项目说明
```

## 📦 包依赖关系

### Workspace 依赖

```json
{
  "ola (cli)": {
    "depends_on": ["ola-core", "ola-web-templates"],
    "devDepends_on": ["ola-test-utils"]
  },
  "ola-core": {
    "depends_on": [],
    "devDepends_on": ["ola-test-utils"]
  },
  "ola-web-templates": {
    "depends_on": [],
    "devDepends_on": []
  },
  "@ai-platform/webui": {
    "depends_on": [],
    "used_by": ["vscode-ide-companion", "cli (optional)"]
  },
  "@ai-platform/sdk": {
    "depends_on": [],
    "standalone": true
  },
  "vscode-ide-companion": {
    "depends_on": ["@ai-platform/webui"]
  }
}
```

### 构建顺序

```
1. test-utils      (无内部依赖)
2. core            (依赖 test-utils)
3. web-templates   (无内部依赖)
4. webui           (无内部依赖)
5. cli             (依赖 core, web-templates)
6. sdk-typescript  (无内部依赖)
7. vscode-ide-companion (依赖 webui)
```

## 🔨 打包流程详解

### 1. TypeScript 编译

```bash
# 每个包执行 tsc --build
tsc --build
```

**生成产物：**

- `dist/**/*.js` - 编译后的 JavaScript
- `dist/**/*.d.ts` - TypeScript 声明文件

### 2. 资源文件复制

```bash
# 复制 .md, .json, .sb 文件
node ../../scripts/copy_files.js
```

**复制的文件类型：**

- `.md` - 文档文件 (SKILL.md, README.md 等)
- `.json` - 配置文件 (schema, 配置示例)
- `.sb` - 沙箱配置文件
- `i18n/locales/*.js` - 国际化语言包

### 3. 打包资源复制

```bash
# 复制内置技能和二进制工具
node ../../scripts/copy_bundle_assets.js
```

**复制的内容：**

- `bundled/` - 内置技能 (如 /review)
- `vendor/` - 二进制工具
  - `ripgrep/` - 代码搜索工具
  - `tree-sitter/` - 代码解析 WASM

### 4. esbuild 打包 (可选)

```bash
# 打包成单个 CLI 文件
node esbuild.config.js
```

**配置特点：**

- 入口：`packages/cli/index.ts`
- 输出：`dist/cli.js`
- 平台：Node.js
- 格式：ESM
- 目标：Node 20
- 优化：minify, tree-shaking

**外部依赖 (不打包)：**

```javascript
const external = [
  '@lydell/node-pty',
  'node-pty',
  '@lydell/node-pty-darwin-arm64',
  // ... 其他平台特定模块
  '@teddyzhu/clipboard',
  // ... 剪贴板模块
];
```

### 5. Web 模板构建

```bash
# Vite 构建 (insight)
vite build

# esbuild 构建 (export-html)
esbuild
```

**生成产物：**

- `src/generated/insightTemplate.ts`
  - `INSIGHT_JS` - 压缩后的 JS 字符串
  - `INSIGHT_CSS` - 压缩后的 CSS 字符串
- `src/generated/exportHtmlTemplate.ts`
  - `HTML_TEMPLATE` - 完整的 HTML 模板字符串

## 📊 生成的产物清单

### 根目录产物

| 文件/目录       | 说明                    | 生成命令                  |
| --------------- | ----------------------- | ------------------------- |
| `dist/cli.js`   | 打包后的 CLI (单个文件) | `npm run bundle`          |
| `dist/src/`     | 复制的资源文件          | `npm run bundle`          |
| `dist/bundled/` | 内置技能                | `npm run bundle`          |
| `dist/vendor/`  | 二进制工具              | `npm run bundle`          |
| `dist/*.tgz`    | NPM 包 (发布用)         | `npm run prepare:package` |

### packages/cli

| 文件/目录                                | 说明     | 大小 (约) |
| ---------------------------------------- | -------- | --------- |
| `dist/index.js`                          | CLI 入口 | 50 KB     |
| `dist/src/`                              | 资源文件 | 500 KB    |
| `dist/src/i18n/locales/`                 | 语言包   | 100 KB    |
| `dist/src/commands/extensions/examples/` | 扩展示例 | 50 KB     |

### packages/core

| 文件/目录             | 说明            | 大小 (约) |
| --------------------- | --------------- | --------- |
| `dist/**/*.js`        | 核心库代码      | 2 MB      |
| `dist/**/*.d.ts`      | TypeScript 声明 | 500 KB    |
| `vendor/ripgrep/`     | rg 工具         | 5 MB      |
| `vendor/tree-sitter/` | WASM 解析器     | 3 MB      |

### packages/web-templates

| 文件/目录                             | 说明          | 大小  |
| ------------------------------------- | ------------- | ----- |
| `src/generated/insightTemplate.ts`    | 洞察模板      | 50 KB |
| `src/generated/exportHtmlTemplate.ts` | 导出模板      | 30 KB |
| `dist/main.js`                        | Vite 打包产物 | 30 KB |
| `dist/main.css`                       | Vite 打包产物 | 18 KB |

### packages/webui

| 文件/目录          | 说明            |
| ------------------ | --------------- |
| `dist/index.js`    | ESM 版本        |
| `dist/index.cjs`   | CommonJS 版本   |
| `dist/index.d.ts`  | TypeScript 声明 |
| `dist/styles.css`  | 样式文件        |
| `dist/components/` | 组件目录        |

### packages/sdk-typescript

| 文件/目录         | 说明            |
| ----------------- | --------------- |
| `dist/index.mjs`  | ESM 版本        |
| `dist/index.cjs`  | CommonJS 版本   |
| `dist/index.d.ts` | TypeScript 声明 |

### packages/vscode-ide-companion

| 文件/目录            | 说明         |
| -------------------- | ------------ |
| `dist/extension.cjs` | 打包后的扩展 |
| `*.vsix`             | VSIX 安装包  |

## 🚀 打包命令汇总

### 开发构建

```bash
# 构建所有包 (开发模式)
npm run build

# 构建单个包
npm run build --workspace=packages/cli
```

### 生产打包

```bash
# 打包 CLI (生成单个 cli.js)
npm run bundle

# 准备发布包 (生成 .tgz)
npm run prepare:package

# 完整构建 + 打包
npm run build && npm run bundle
```

### 特殊构建

```bash
# 构建沙箱镜像
npm run build:sandbox

# 构建 VSCode 扩展
npm run build:vscode

# 完整构建 (所有组件)
npm run build:all
```

### VSCode 扩展打包

```bash
cd packages/vscode-ide-companion
npm run build
npm run package
# 生成：ai-platform-code-assistant-vscode-companion-0.13.0.vsix
```

## 📦 发布产物

### NPM 包发布

```bash
# CLI 包
npm publish --workspace=packages/cli

# Core 包
npm publish --workspace=packages/core

# SDK 包
npm publish --workspace=packages/sdk-typescript

# WebUI 包
npm publish --workspace=packages/webui

# Web Templates 包
npm publish --workspace=packages/web-templates
```

### Docker 镜像发布

```bash
# 构建镜像
docker build -t ghcr.io/your-org/ola:0.13.0 .

# 推送镜像
docker push ghcr.io/your-org/ola:0.13.0
```

### VSCode 扩展发布

```bash
# 本地打包
cd packages/vscode-ide-companion
npm run package

# 发布到 Marketplace
vsce publish
```

## 📋 文件清单总结

### 运行时必需文件

```
dist/
├── cli.js                    # ⭐ 主程序
├── src/
│   ├── i18n/locales/*.js     # ⭐ 语言包
│   ├── commands/extensions/examples/  # 扩展示例
│   └── **/*.md               # ⭐ 技能文档
├── bundled/
│   └── review/SKILL.md       # ⭐ 内置技能
└── vendor/
    ├── ripgrep/              # ⭐ 代码搜索
    └── tree-sitter/          # ⭐ 代码解析
```

### 开发时文件

```
packages/*/src/               # 源代码
packages/*/tsconfig.json      # TypeScript 配置
scripts/*.js                  # 构建脚本
```

### 发布时文件 (package.json files 字段)

```json
{
  "files": ["dist/", "README.md", "LICENSE"]
}
```

## 🔍 依赖分析工具

### 查看依赖树

```bash
# 查看 workspace 依赖
npm ls

# 查看特定包的依赖
npm ls --workspace=packages/cli
```

### 构建产物分析

```bash
# 查看 dist 目录大小
du -sh dist/*

# 分析打包产物 (开发模式)
DEV=true npm run bundle
cat dist/esbuild.json | json_pp
```

## 📝 相关文档

- [安装指南](./INSTALLATION.md) - 安装说明
- [开发指南](./developers/contributing.md) - 开发流程
- [架构文档](./developers/architecture.md) - 架构设计
- [SDK 文档](./developers/sdk-typescript.md) - SDK 使用

---

**最后更新**: 2026 年 3 月 26 日  
**版本**: v0.13.0
