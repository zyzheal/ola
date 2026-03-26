/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { DashboardCards, HeatmapSection } from './Charts';
import type { InsightData, QualitativeData } from './types';
import { CopyButton, MarkdownText } from './Components';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

// -----------------------------------------------------------------------------
// Qualitative Insight Components
// -----------------------------------------------------------------------------

export function AtAGlance({ qualitative }: { qualitative: QualitativeData }) {
  const { atAGlance } = qualitative;
  if (!atAGlance) return null;

  return (
    <div className="at-a-glance">
      <div className="glance-title">一览</div>
      <div className="glance-sections">
        <div className="glance-section">
          <strong>✅ 进展顺利：</strong>{' '}
          <MarkdownText>{atAGlance.whats_working}</MarkdownText>
          <a href="#section-wins" className="see-more">
            你完成的出色工作 →
          </a>
        </div>
        <div className="glance-section">
          <strong>⚠️ 遇到阻碍：</strong>{' '}
          <MarkdownText>{atAGlance.whats_hindering}</MarkdownText>
          <a href="#section-friction" className="see-more">
            问题出在哪里 →
          </a>
        </div>
        <div className="glance-section">
          <strong>💡 快速尝试：</strong>{' '}
          <MarkdownText>{atAGlance.quick_wins}</MarkdownText>
          <a href="#section-features" className="see-more">
            值得尝试的功能 →
          </a>
        </div>
        <div className="glance-section">
          <strong>🚀 高级工作流：</strong>{' '}
          <MarkdownText>{atAGlance.ambitious_workflows}</MarkdownText>
          <a href="#section-horizon" className="see-more">
            未来展望 →
          </a>
        </div>
      </div>
    </div>
  );
}

export function NavToc() {
  return (
    <nav className="nav-toc">
      <a href="#section-work">你的工作内容</a>
      <a href="#section-usage">你如何使用 OLA</a>
      <a href="#section-wins">出色成果</a>
      <a href="#section-friction">问题所在</a>
      <a href="#section-features">尝试功能</a>
      <a href="#section-patterns">新使用模式</a>
      <a href="#section-horizon">未来展望</a>
    </nav>
  );
}

export function ProjectAreas({
  qualitative,
  topGoals,
  topTools,
}: {
  qualitative: QualitativeData;
  topGoals?: Record<string, number>;
  topTools?: Record<string, number> | Array<[string, number]>;
}) {
  const { projectAreas } = qualitative;

  // Convert topTools (array of tuples) to object for chart if needed
  const topToolsObj = Array.isArray(topTools)
    ? Object.fromEntries(topTools)
    : topTools;

  return (
    <>
      <h2
        id="section-work"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        你的工作内容
      </h2>

      {Array.isArray(projectAreas?.areas) && projectAreas.areas.length > 0 && (
        <div className="project-areas mb-6">
          {projectAreas.areas.map((area, idx) => (
            <div key={idx} className="project-area">
              <div className="area-header">
                <span className="area-name">{area.name}</span>
                <span className="area-count">
                  约 {area.session_count} 次会话
                </span>
              </div>
              <div className="area-desc">
                <MarkdownText>{area.description}</MarkdownText>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {topGoals && Object.keys(topGoals).length > 0 && (
          <HorizontalBarChart
            data={topGoals}
            title="你的目标"
            color="#0ea5e9"
          />
        )}
        {topToolsObj && Object.keys(topToolsObj).length > 0 && (
          <HorizontalBarChart
            data={topToolsObj}
            title="常用工具"
            color="#6366f1"
          />
        )}
      </div>
    </>
  );
}

export function InteractionStyle({
  qualitative,
  insights,
}: {
  qualitative: QualitativeData;
  insights: InsightData;
}) {
  const { interactionStyle } = qualitative;
  if (!interactionStyle) return null;

  return (
    <>
      <h2
        id="section-usage"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        你如何使用 OLA
      </h2>
      <div className="narrative">
        <p>
          <MarkdownText>{interactionStyle.narrative}</MarkdownText>
        </p>
        {interactionStyle.key_pattern && (
          <div className="key-insight">
            <strong>关键模式：</strong>{' '}
            <MarkdownText>{interactionStyle.key_pattern}</MarkdownText>
          </div>
        )}
      </div>

      <DashboardCards insights={insights} />
      <HeatmapSection heatmap={insights.heatmap} />
    </>
  );
}

export function ImpressiveWorkflows({
  qualitative,
  primarySuccess,
  outcomes,
}: {
  qualitative: QualitativeData;
  primarySuccess: Record<string, number>;
  outcomes: Record<string, number>;
}) {
  const { impressiveWorkflows } = qualitative;
  if (!impressiveWorkflows) return null;

  return (
    <>
      <h2
        id="section-wins"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        你完成的出色成果
      </h2>
      {impressiveWorkflows.intro && (
        <p className="section-intro">
          <MarkdownText>{impressiveWorkflows.intro}</MarkdownText>
        </p>
      )}
      <div className="big-wins">
        {Array.isArray(impressiveWorkflows.impressive_workflows) &&
          impressiveWorkflows.impressive_workflows.map((win, idx) => (
            <div key={idx} className="big-win">
              <div className="big-win-title">{win.title}</div>
              <div className="big-win-desc">
                <MarkdownText>{win.description}</MarkdownText>
              </div>
            </div>
          ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        {primarySuccess && Object.keys(primarySuccess).length > 0 && (
          <HorizontalBarChart
            data={primarySuccess}
            title="最有帮助的功能"
            color="#3b82f6"
            allowedKeys={[
              'fast_accurate_search',
              'correct_code_edits',
              'good_explanations',
              'proactive_help',
              'multi_file_changes',
              'good_debugging',
            ]}
          />
        )}
        {outcomes && Object.keys(outcomes).length > 0 && (
          <HorizontalBarChart
            data={outcomes}
            title="成果"
            color="#8b5cf6"
            allowedKeys={[
              'fully_achieved',
              'mostly_achieved',
              'partially_achieved',
              'not_achieved',
              'unclear_from_transcript',
            ]}
          />
        )}
      </div>
    </>
  );
}

// Format label for display (capitalize and replace underscores with spaces)
function formatLabel(label: string) {
  // 成果翻译
  const translations: Record<string, string> = {
    unclear_from_transcript: '不明确',
    fully_achieved: '完全达成',
    mostly_achieved: '大部分达成',
    partially_achieved: '部分达成',
    not_achieved: '未达成',
  };

  if (translations[label]) {
    return translations[label];
  }

  return label
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Horizontal Bar Chart Component
function HorizontalBarChart({
  data,
  title,
  color = '#3b82f6',
  allowedKeys = null,
}: {
  data: Record<string, number>;
  title: string;
  color?: string;
  allowedKeys?: string[] | null;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  // Filter and sort entries
  let entries = Object.entries(data);
  if (allowedKeys) {
    entries = entries.filter(([key]) => allowedKeys.includes(key));
  }
  entries.sort((a, b) => b[1] - a[1]);

  // Limit to at most 10 items
  entries = entries.slice(0, 10);

  if (entries.length === 0) return null;

  const maxValue = Math.max(...entries.map(([, count]) => count));

  return (
    <div
      className="bar-chart-card"
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
      }}
    >
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#64748b',
          marginTop: 0,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </h3>
      <div
        className="bar-chart"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {entries.map(([label, count]) => {
          const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
          return (
            <div
              key={label}
              className="bar-row"
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div
                className="bar-label"
                style={{
                  width: '130px',
                  fontSize: '13px',
                  color: '#475569',
                  textAlign: 'left',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formatLabel(label)}
              </div>
              <div
                className="bar-wrapper"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 0,
                }}
              >
                <div
                  className="bar-bg"
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span
                  className="bar-value"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    minWidth: '24px',
                    textAlign: 'right',
                  }}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FrictionPoints({
  qualitative,
  satisfaction,
  friction,
}: {
  qualitative: QualitativeData;
  satisfaction?: Record<string, number>;
  friction?: Record<string, number>;
}) {
  const { frictionPoints } = qualitative;
  if (!frictionPoints) return null;

  return (
    <>
      <h2
        id="section-friction"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        问题出在哪里
      </h2>
      {frictionPoints.intro && (
        <p className="section-intro">
          <MarkdownText>{frictionPoints.intro}</MarkdownText>
        </p>
      )}
      <div className="friction-categories">
        {Array.isArray(frictionPoints.categories) &&
          frictionPoints.categories.map((cat, idx) => (
            <div key={idx} className="friction-category">
              <div className="friction-title">{cat.category}</div>
              <div className="friction-desc">
                <MarkdownText>{cat.description}</MarkdownText>
              </div>
              {Array.isArray(cat.examples) && cat.examples.length > 0 && (
                <ul className="friction-examples">
                  {cat.examples.map((ex, i) => (
                    <li key={i}>
                      <MarkdownText>{ex}</MarkdownText>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>

      {/* Facets Data Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        {friction && Object.keys(friction).length > 0 && (
          <HorizontalBarChart
            data={friction}
            title="主要摩擦类型"
            color="#ef4444"
            allowedKeys={[
              'misunderstood_request',
              'wrong_approach',
              'buggy_code',
              'user_rejected_action',
              'excessive_changes',
            ]}
          />
        )}
        {satisfaction && Object.keys(satisfaction).length > 0 && (
          <HorizontalBarChart
            data={satisfaction}
            title="推断满意度（模型估算）"
            color="#10b981"
            allowedKeys={[
              'happy',
              'satisfied',
              'likely_satisfied',
              'dissatisfied',
              'frustrated',
            ]}
          />
        )}
      </div>
    </>
  );
}

// Qwen.md Additions Section Component
function QwenMdAdditionsSection({
  additions,
}: {
  additions: NonNullable<
    NonNullable<QualitativeData['improvements']>['Qwen_md_additions']
  >;
}) {
  const [checkedState, setCheckedState] = useState(
    new Array(additions.length).fill(true),
  );
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCheckboxChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item,
    );
    setCheckedState(updatedCheckedState);
  };

  const handleCopyAll = () => {
    const textToCopy = additions
      .filter((_, index) => checkedState[index])
      .map((item: { addition: any }) => item.addition)
      .join('\n\n');

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const checkedCount = checkedState.filter(Boolean).length;

  return (
    <div className="qwen-md-section">
      <h3>建议的 QWEN.md 补充</h3>
      <p className="text-xs text-slate-500 mb-3">
        选中后复制到 OLA，即可添加到你的 QWEN.md。
      </p>

      <div className="qwen-md-actions" style={{ marginBottom: '12px' }}>
        <button
          className={`copy-all-btn ${copiedAll ? 'copied' : ''}`}
          onClick={handleCopyAll}
          disabled={checkedCount === 0}
        >
          {copiedAll ? '已全部复制！' : `复制所有选中项 (${checkedCount})`}
        </button>
      </div>

      {additions.map((item, idx) => (
        <div key={idx} className="qwen-md-item">
          <input
            type="checkbox"
            checked={checkedState[idx]}
            onChange={() => handleCheckboxChange(idx)}
            className="cmd-checkbox"
          />
          <div style={{ flex: 1 }}>
            <code className="cmd-code">{item.addition}</code>
            <div className="cmd-why">
              <MarkdownText>{item.why}</MarkdownText>
            </div>
          </div>
          <CopyButton text={item.addition} label="复制" />
        </div>
      ))}
    </div>
  );
}

export function Improvements({
  qualitative,
}: {
  qualitative: QualitativeData;
}) {
  const { improvements } = qualitative;
  if (!improvements) return null;

  return (
    <>
      <h2
        id="section-features"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        值得尝试的 OLA 功能
      </h2>

      {/* QWEN.md Additions */}
      {Array.isArray(improvements.Qwen_md_additions) &&
        improvements.Qwen_md_additions.length > 0 && (
          <QwenMdAdditionsSection additions={improvements.Qwen_md_additions} />
        )}

      <p className="text-xs text-slate-500 mb-3">复制到 OLA 即可自动配置。</p>

      {/* Features to Try */}
      <div className="features-section">
        {Array.isArray(improvements.features_to_try) &&
          improvements.features_to_try.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-title">{feat.feature}</div>
              <div className="feature-oneliner">
                <MarkdownText>{feat.one_liner}</MarkdownText>
              </div>
              <div className="feature-why">
                <strong>为什么适合你：</strong>{' '}
                <MarkdownText>{feat.why_for_you}</MarkdownText>
              </div>
              <div className="feature-examples">
                <div className="feature-example">
                  <div className="example-code-row">
                    <code className="example-code">{feat.example_code}</code>
                    <CopyButton text={feat.example_code} label="复制" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <h2
        id="section-patterns"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        使用 OLA 的新方式
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        复制到 OLA，它会引导你完成。
      </p>

      <div className="patterns-section">
        {Array.isArray(improvements.usage_patterns) &&
          improvements.usage_patterns.map((pat, idx) => (
            <div key={idx} className="pattern-card">
              <div className="pattern-title">{pat.title}</div>
              <div className="pattern-summary">
                <MarkdownText>{pat.suggestion}</MarkdownText>
              </div>
              <div className="pattern-detail">
                <MarkdownText>{pat.detail}</MarkdownText>
              </div>
              <div className="copyable-prompt-section">
                <div className="prompt-label">粘贴到 OLA：</div>
                <div className="copyable-prompt-row">
                  <code className="copyable-prompt">{pat.copyable_prompt}</code>
                  <CopyButton text={pat.copyable_prompt} label="复制" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export function FutureOpportunities({
  qualitative,
}: {
  qualitative: QualitativeData;
}) {
  const { futureOpportunities } = qualitative;
  if (!futureOpportunities) return null;

  return (
    <>
      <h2
        id="section-horizon"
        className="text-xl font-semibold text-slate-900 mt-8 mb-4"
      >
        未来展望
      </h2>
      {futureOpportunities.intro && (
        <p className="section-intro">
          <MarkdownText>{futureOpportunities.intro}</MarkdownText>
        </p>
      )}

      <div className="horizon-section">
        {Array.isArray(futureOpportunities.opportunities) &&
          futureOpportunities.opportunities.map((opp, idx) => (
            <div key={idx} className="horizon-card">
              <div className="horizon-title">{opp.title}</div>
              <div className="horizon-possible">
                <MarkdownText>{opp.whats_possible}</MarkdownText>
              </div>
              <div className="horizon-tip">
                <strong>如何开始：</strong>{' '}
                <MarkdownText>{opp.how_to_try}</MarkdownText>
              </div>
              <div className="pattern-prompt">
                <div className="prompt-label">粘贴到 OLA：</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <code style={{ flex: 1 }}>{opp.copyable_prompt}</code>
                  <CopyButton text={opp.copyable_prompt} label="复制" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export function MemorableMoment({
  qualitative,
}: {
  qualitative: QualitativeData;
}) {
  const { memorableMoment } = qualitative;
  if (!memorableMoment) return null;

  return (
    <div className="fun-ending">
      <div className="fun-headline">&quot;{memorableMoment.headline}&quot;</div>
      <div className="fun-detail">
        <MarkdownText>{memorableMoment.detail}</MarkdownText>
      </div>
    </div>
  );
}
