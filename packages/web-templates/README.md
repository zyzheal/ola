# OLA Web 模板

Web 模板包，包含用于生成洞察报告和导出 HTML 的 React 组件和模板。

## 📦 功能

### 1. Insight 洞察报告模板

生成用户编码活动的可视化报告，包含：

- 📊 活动热力图（GitHub 风格）
- 🕐 活跃时段分析（早晨/下午/傍晚/夜间）
- 📈 数据统计（总会话数、消息数、代码行变更）
- 🎯 项目领域、工具使用情况
- 💡 工作流分析、改进建议
- 🖼️ 可导出为图片的分享卡片（支持明/暗主题）

**技术栈：**

- React 18 + TypeScript
- Vite 构建
- Tailwind CSS 样式
- html2canvas（导出图片）
- **完整中文支持** ✅

### 2. Export HTML 导出模板

用于将 AI 对话记录导出为独立的 HTML 文件：

- 💬 对话查看器（使用 @ai-platform/webui）
- 📊 元数据侧边栏
- 🎨 暗色主题
- 📦 完全内联的单文件（CSS/JS 内联）
- **完整中文支持** ✅

## 📁 目录结构

```
packages/web-templates/
├── src/
│   ├── insight/                    # 洞察报告模板
│   │   ├── src/                    # React 组件
│   │   │   ├── App.tsx             # 主应用
│   │   │   ├── Charts.tsx          # 图表组件
│   │   │   │   ├── DashboardCards
│   │   │   │   ├── ActiveHoursChart
│   │   │   │   ├── HeatmapSection
│   │   │   │   └── ActivityHeatmap
│   │   │   ├── Header.tsx          # 头部组件
│   │   │   ├── Qualitative.tsx     # 定性分析组件
│   │   │   │   ├── AtAGlance
│   │   │   │   ├── NavToc
│   │   │   │   ├── ProjectAreas
│   │   │   │   ├── InteractionStyle
│   │   │   │   ├── ImpressiveWorkflows
│   │   │   │   ├── FrictionPoints
│   │   │   │   ├── Improvements
│   │   │   │   ├── FutureOpportunities
│   │   │   │   └── MemorableMoment
│   │   │   ├── ShareCard.tsx       # 分享卡片
│   │   │   ├── Components.tsx      # 通用组件
│   │   │   │   ├── MarkdownText
│   │   │   │   └── CopyButton
│   │   │   └── i18n/zhCN.ts        # 中文翻译映射
│   │   ├── index.html              # HTML 模板
│   │   └── build.mjs               # 构建脚本
│   │
│   ├── export-html/                # 导出 HTML 模板
│   │   ├── src/
│   │   │   ├── main.tsx            # 入口组件
│   │   │   ├── components/         # React 组件
│   │   │   │   ├── TempFileModal
│   │   │   │   ├── MetadataSidebar
│   │   │   │   └── hooks
│   │   │   ├── index.html          # HTML 模板
│   │   │   ├── styles.css          # 样式
│   │   │   └── favicon.svg         # 图标
│   │   └── build.mjs               # 构建脚本
│   │
│   ├── generated/                  # 生成的模板 ⭐
│   │   ├── insightTemplate.ts      # INSIGHT_JS, INSIGHT_CSS
│   │   └── exportHtmlTemplate.ts   # HTML_TEMPLATE
│   │
│   └── index.ts                    # 包入口
│
├── dist/                           # Vite 构建产物
│   ├── main.js                     # 打包后的 JS (30 KB)
│   └── main.css                    # 打包后的 CSS (18 KB)
│
├── build.mjs                       # 主构建脚本
├── package.json
└── README.md
```

## 🔨 构建

### 开发模式

```bash
cd packages/web-templates

# 构建所有模板
npm run build

# 或只构建模板资源
npm run build:templates
```

### 构建流程

1. **Vite 构建 (insight)**

   ```bash
   vite build
   # 生成：dist/main.js, dist/main.css
   ```

2. **esbuild 构建 (export-html)**

   ```bash
   esbuild
   # 生成：内联的 HTML 模板
   ```

3. **生成模板字符串**
   - 读取构建产物
   - 转换为 JavaScript 字符串常量
   - 输出到 `src/generated/`

### 构建产物

```
src/generated/
├── insightTemplate.ts
│   ├── INSIGHT_JS    # 压缩后的 JS 字符串 (30 KB)
│   └── INSIGHT_CSS   # 压缩后的 CSS 字符串 (18 KB)
│
└── exportHtmlTemplate.ts
    └── HTML_TEMPLATE # 完整的 HTML 模板字符串 (30 KB)
```

## 💻 使用方式

### 在 CLI 中使用

Web 模板已集成到 OLA CLI 中：

```bash
# 生成洞察报告
ola
/insight

# 导出会话记录
ola
/export html
```

### 在代码中使用

```typescript
// 导入模板
import {
  INSIGHT_JS,
  INSIGHT_CSS,
  EXPORT_HTML_TEMPLATE,
} from 'ola-web-templates';

// 生成洞察报告 HTML
const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>OLA 洞察报告</title>
    <style>${INSIGHT_CSS}</style>
  </head>
  <body>
    <div id="react-root"></div>
    <script>
      window.INSIGHT_DATA = ${JSON.stringify(insights)};
      ${INSIGHT_JS}
    </script>
  </body>
</html>`;

// 导出对话 HTML
const exportHtml = EXPORT_HTML_TEMPLATE.replace('__INLINE_CSS__', css).replace(
  '__INLINE_SCRIPT__',
  js,
);
```

## 🌐 中文支持

### 已翻译的组件

✅ **所有组件已完全中文化**

| 组件            | 翻译内容                                    |
| --------------- | ------------------------------------------- |
| Qualitative.tsx | 一览、你的工作内容、出色成果、问题所在等    |
| Header.tsx      | OLA 洞察报告、消息数、会话数等              |
| Charts.tsx      | 活跃时段、活动热力图、早晨/下午/傍晚/夜间等 |
| ShareCard.tsx   | 分享卡片的所有统计标签                      |
| Components.tsx  | 复制按钮等通用组件                          |

### 翻译覆盖

- **150+ 条** UI 文本
- **所有** 统计标签
- **所有** 图表标签
- **所有** 按钮和操作提示
- **所有** 时间段和月份

### 中文支持详情

参考 [TRANSLATION_COMPLETE.md](./TRANSLATION_COMPLETE.md)

## 📊 依赖关系

### 运行时依赖

```json
{
  "dependencies": {},
  "devDependencies": {
    "vite": "^5.0.0",
    "esbuild": "^0.25.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
```

### 依赖包

- **insight 模板** 依赖:
  - React 18 (CDN)
  - Chart.js (CDN)
  - html2canvas (CDN)

- **export-html 模板** 依赖:
  - React 18 UMD (CDN)
  - ReactDOM 18 UMD (CDN)
  - @ai-platform/webui (CDN)

## 🧪 开发

### 本地预览 insight

```bash
cd packages/web-templates/src/insight

# 启动 Vite 开发服务器
npx vite

# 访问 http://localhost:5173
```

### 修改模板

1. 编辑 `src/insight/src/*.tsx` 组件
2. 运行 `npm run build` 重新构建
3. 测试生成的 HTML

### 添加新的翻译

编辑 `src/insight/src/i18n/zhCN.ts`：

```typescript
export const zhCNTranslations = {
  'New UI Text': '新的 UI 文本',
  // ...
};
```

## 📦 发布

```bash
# 构建
npm run build

# 发布到 NPM
npm publish --workspace=packages/web-templates
```

发布内容：

- `dist/` - 构建产物
- `src/generated/` - 生成的模板

## 📝 相关文档

- [TRANSLATION_COMPLETE.md](./TRANSLATION_COMPLETE.md) - 中文翻译详情
- [DIRECTORY_STRUCTURE.md](../../docs/developers/DIRECTORY_STRUCTURE.md) - 完整目录结构
- [README.md](../../README.md) - 项目主文档

## 📄 许可证

Apache 2.0

---

**最后更新**: 2026 年 3 月 26 日  
**版本**: v0.13.0
