import React, { useState } from 'react';
import { BookOpen, ChevronDown, Copy, Download } from 'lucide-react';
import { useLocale } from '../../lib/i18n/locale';
import { BioAppScientificGuide } from '../../lib/schema/bioAppGuides';
import { InlineRichText } from '../viewers/BioStandardViewers';

export const StudioGuideDrawer: React.FC<{
  appId: string;
  guide: BioAppScientificGuide;
  onToast: (msg: string) => void;
}> = ({ appId, guide, onToast }) => {
  const { tr } = useLocale();
  // Default collapsed so the execution form leads above the fold; opens instantly on demand.
  const [activeTab, setActiveTab] = useState<'sample' | 'format' | 'result' | null>(null);

  const downloadSampleTemplate = () => {
    const fname = guide.sampleData.filename || `${appId}_sample.txt`;
    const cleanLines = guide.sampleData.rawPreview
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n');
    const content = cleanLines.trim() ? cleanLines : guide.sampleData.rawPreview;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
    onToast(
      tr(
        `Downloaded sample template: ${fname}`,
        `샘플 템플릿 다운로드 완료: ${fname}`
      )
    );
  };

  const tabs = [
    {
      id: 'sample' as const,
      label: tr('Sample Data Preview', '예시 데이터 구조'),
    },
    {
      id: 'format' as const,
      label: tr('Input Format Checklist', '데이터 형식 체크 기준'),
    },
    {
      id: 'result' as const,
      label: tr('How to Read Results', '결과 수치·그래프 해석법'),
    },
  ];

  return (
    <div className="studio-guide-drawer">
      <div className="studio-guide-bar">
        <div className="studio-guide-tabs" role="tablist" aria-label={tr('Data format and interpretation guide', '데이터 형식 및 결과 해석 가이드')}>
          {tabs.map((tab) => {
            const isOpen = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isOpen}
                className={`studio-guide-tab ${isOpen ? 'active' : ''}`}
                onClick={() => setActiveTab(isOpen ? null : tab.id)}
              >
                <span>{tab.label}</span>
                <ChevronDown
                  size={13}
                  className={`studio-guide-chevron ${isOpen ? 'open' : ''}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {guide.sampleData.filename && (
          <button
            type="button"
            className="mas-link-btn studio-template-btn"
            onClick={downloadSampleTemplate}
          >
            <Download size={14} aria-hidden="true" />
            <span>
              {tr(
                `Sample Template (${guide.sampleData.filename})`,
                `샘플 템플릿 (${guide.sampleData.filename})`
              )}
            </span>
          </button>
        )}
      </div>

      {activeTab === 'sample' && (
        <div className="studio-guide-panel" role="tabpanel">
          <div className="studio-guide-panel-head">
            <strong className="studio-guide-panel-title">
              <InlineRichText text={guide.sampleData.title} />
            </strong>
            <button
              type="button"
              className="mas-link-btn"
              onClick={() => {
                navigator.clipboard?.writeText(guide.sampleData.rawPreview);
                onToast(
                  tr(
                    'Copied sample data to clipboard.',
                    '예시 데이터를 클립보드에 복사했습니다.'
                  )
                );
              }}
            >
              <Copy size={13} aria-hidden="true" />
              <span>{tr('Copy Sample', '예시 복사')}</span>
            </button>
          </div>
          <pre className="studio-code-preview">{guide.sampleData.rawPreview}</pre>
          <ul className="studio-guide-list">
            {guide.sampleData.structureExplanation.map((item, i) => (
              <li key={i}>
                <InlineRichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'format' && (
        <div className="studio-guide-panel" role="tabpanel">
          <div className="studio-guide-panel-title">
            <InlineRichText text={guide.formatSpec.summary} />
          </div>
          <ul className="studio-guide-list checklist">
            {guide.formatSpec.checklist.map((item, i) => (
              <li key={i}>
                <InlineRichText text={item} />
              </li>
            ))}
          </ul>
          <div className="studio-sanitizer-callout">
            <strong>{tr('Auto-Sanitizer:', '자동 형식 보정(Auto-Sanitizer):')}</strong>{' '}
            <InlineRichText text={guide.formatSpec.autoSanitizerNote} />
          </div>
        </div>
      )}

      {activeTab === 'result' && (
        <div className="studio-guide-panel" role="tabpanel">
          <div className="studio-guide-panel-title">
            <InlineRichText text={guide.resultGuide.overview} />
          </div>
          <p className="studio-guide-visual-note">
            <strong>{tr('Visual Guide:', '시각화 읽는 법:')}</strong>{' '}
            <InlineRichText text={guide.resultGuide.visualGuide} />
          </p>
          <div className="studio-metric-grid">
            {guide.resultGuide.metrics.map((m, idx) => (
              <div key={idx} className="studio-metric-item">
                <code className="studio-metric-code">{m.columnOrMetric}</code>
                <div className="studio-metric-meaning">
                  <InlineRichText text={m.meaning} />
                </div>
                <div className="studio-metric-rule">
                  <strong>{tr('Rule:', '판정 기준:')}</strong>{' '}
                  <InlineRichText text={m.cutoffOrRule} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PostRunInterpretationCard: React.FC<{
  appTitle: string;
  guide: BioAppScientificGuide;
}> = ({ appTitle, guide }) => {
  const { tr } = useLocale();
  return (
    <div className="studio-postrun-guide">
      <div className="studio-postrun-head">
        <BookOpen size={15} aria-hidden="true" />
        <strong>
          {tr(
            `How to Interpret ${appTitle.split(':')[0]} Outputs`,
            `${appTitle.split(':')[0]} 결과 수치 및 판독 가이드`
          )}
        </strong>
      </div>
      <p className="studio-postrun-overview">
        <InlineRichText text={guide.resultGuide.overview} />
      </p>
      <div className="studio-metric-grid">
        {guide.resultGuide.metrics.map((m, idx) => (
          <div key={idx} className="studio-metric-item">
            <code className="studio-metric-code">{m.columnOrMetric}</code>
            <div className="studio-metric-meaning">
              <InlineRichText text={m.meaning} />
            </div>
            <div className="studio-metric-rule">
              <strong>{tr('Cutoff:', '기준:')}</strong>{' '}
              <InlineRichText text={m.cutoffOrRule} />
            </div>
          </div>
        ))}
      </div>
      <div className="studio-postrun-next">
        <strong>{tr('Next Step:', '추천 후속 단계:')}</strong>{' '}
        <InlineRichText text={guide.resultGuide.nextSteps} />
      </div>
    </div>
  );
};
