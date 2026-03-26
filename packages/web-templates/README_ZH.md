# Web 模板中文支持指南

## ✅ 已完成的修改

### 1. HTML 语言标签

- 将所有 HTML 的 `lang="en"` 改为 `lang="zh-CN"`
- 文件位置:
  - `packages/cli/src/services/insight/generators/TemplateRenderer.ts`
  - `packages/web-templates/src/export-html/src/index.html`
  - `packages/web-templates/src/insight/index.html`

### 2. 页面标题中文化

- Insight 报告：`OLA 洞察报告`
- Export HTML: `OLA 对话记录`
- 开发模式：`OLA 代码洞察 - 开发模式`

### 3. 字符编码

- 所有模板已使用 `UTF-8` 编码，天然支持中文显示

## 📝 中文翻译文件

创建了翻译映射文件：

```
packages/web-templates/src/insight/src/i18n/zhCN.ts
```

包含所有界面文本的中英文对照。

## 🔧 要完全中文化界面，需要：

### 方案 1：修改 React 组件（推荐）

在 `packages/web-templates/src/insight/src/` 下的组件中使用翻译函数：

```tsx
// 修改前
<div className="glance-title">At a Glance</div>;

// 修改后
import { t } from './i18n/zhCN';

<div className="glance-title">{t('At a Glance')}</div>;
```

### 方案 2：重新构建模板

```bash
cd packages/web-templates
npm run build
```

## 🚀 使用示例

### 在 OLA CLI 中使用

```bash
# 启动 OLA
ola

# 生成中文洞察报告
/insight

# 导出中文会话记录
/export html
```

### 生成的文件

- **洞察报告**: `~/.ola/runtime/projects/<project>/insights/insight-YYYY-MM-DD.html`
- **会话导出**: `<current-dir>/qwen-export-YYYY-MM-DD-HH-MM-SS.html`

## 📊 当前状态

| 项目           | 状态                |
| -------------- | ------------------- |
| UTF-8 编码     | ✅ 支持             |
| HTML lang 标签 | ✅ 已改为 zh-CN     |
| 页面标题       | ✅ 已中文化         |
| 界面组件文本   | ⚠️ 部分需要翻译     |
| 对话内容       | ✅ 自动使用用户语言 |

## 💡 说明

1. **对话内容**：AI 回复的语言由你的系统提示词和对话语言决定，与模板无关
2. **界面文本**：需要修改 React 组件中的硬编码英文
3. **自动打开**：生成的 HTML 会在默认浏览器中打开，UTF-8 编码确保中文正常显示

## 🔍 需要翻译的关键文件

```
packages/web-templates/src/insight/src/
├── Qualitative.tsx    # 定性分析组件（大量文本）
├── Header.tsx         # 头部组件
├── Charts.tsx         # 图表组件
├── ShareCard.tsx      # 分享卡片
└── Components.tsx     # 通用组件
```

## 📝 快速测试

修改后重新构建：

```bash
cd packages/web-templates
npm run build

cd ../cli
npm run build
```

然后运行 `/insight` 命令测试。
