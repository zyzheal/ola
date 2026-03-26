/**
 * @license
 * Copyright 2025 OLA
 * SPDX-License-Identifier: Apache-2.0
 */

// 中文翻译映射表
export const zhCNTranslations = {
  // AtAGlance 组件
  'At a Glance': '一览',
  "What's working:": '✅ 进展顺利：',
  "What's hindering you:": '⚠️ 遇到阻碍：',
  'Quick wins to try:': '💡 快速尝试：',
  'Ambitious workflows:': '🚀 高级工作流：',
  'Impressive Things You Did →': '你完成的出色工作 →',
  'Where Things Go Wrong →': '出问题的地方 →',
  'Features to Try →': '要尝试的功能 →',
  'On the Horizon →': '未来展望 →',

  // NavToc 组件
  'What You Work On': '你的工作内容',
  'How You Use OLA': '你如何使用 OLA',
  'Impressive Things': '出色成果',
  'Where Things Go Wrong': '问题所在',
  'Features to Try': '尝试功能',
  'New Usage Patterns': '新使用模式',
  'On the Horizon': '未来展望',

  // ProjectAreas 组件
  '~{count} sessions': '~{count} 次会话',
  'What You Wanted': '你的目标',
  'Top Tools Used': '常用工具',

  // InteractionStyle 组件
  'Key pattern:': '关键模式：',

  // ImpressiveWorkflows 组件
  'Impressive Things You Did': '你完成的出色成果',
  "What Helped Most (Qwen's Capabilities)": '最有帮助的功能',
  Outcomes: '成果',

  // 成果翻译
  fully_achieved: '完全达成',
  mostly_achieved: '大部分达成',
  partially_achieved: '部分达成',
  not_achieved: '未达成',
  unclear_from_transcript: '不明确',

  // FrictionPoints 组件
  'Where Things Go Wrong': '问题出在哪里',
  'Satisfaction Level': '满意度',
  'Common Friction Points': '常见摩擦点',

  // Improvements 组件
  'Features to Try': '值得尝试的功能',
  'Based on your goals': '基于你的目标',

  // FutureOpportunities 组件
  'On the Horizon': '未来展望',
  'Level Up': '更上一层楼',

  // MemorableMoment 组件
  'A Memorable Moment': '难忘时刻',

  // ShareCard 组件
  'OLA Insights': 'OLA 洞察报告',
  messages: '条消息',
  sessions: '次会话',
  'Generated on': '生成于',
  'Scan to explore your insights': '扫描查看你的洞察',

  // Header 组件
  'OLA Insights': 'OLA 洞察报告',
  'Your personalized coding journey and patterns': '你的个性化编码旅程和模式',
  to: '至',
  'Export Card': '导出卡片',
  'Light Theme': '浅色主题',
  'Dark Theme': '深色主题',

  // Charts 组件
  'Active Hours': '活跃时段',
  Morning: '早晨',
  Afternoon: '下午',
  Evening: '傍晚',
  Night: '夜间',
  'Activity Heatmap': '活动热力图',
  'Showing past year of activity': '显示过去一年的活动',
  Less: '少',
  More: '多',

  // 时间段
  '06:00 - 12:00': '06:00 - 12:00',
  '12:00 - 18:00': '12:00 - 18:00',
  '18:00 - 22:00': '18:00 - 22:00',
  '22:00 - 06:00': '22:00 - 06:00',
};

/**
 * 翻译函数
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  let translation =
    zhCNTranslations[key as keyof typeof zhCNTranslations] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, String(value));
    });
  }

  return translation;
}
