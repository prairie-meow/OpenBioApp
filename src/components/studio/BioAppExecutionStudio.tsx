import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  Play,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  BIO_APP_MANIFESTS,
  BioAppRunResult,
  BioDataType,
  findCompatibleDownstreamApps,
} from '../../lib/schema/bioAppSchema';
import {
  BIO_APP_GUIDES,
  InputFormatValidationReport,
  validateBioAppInput,
} from '../../lib/schema/bioAppGuides';
import { executeBioApp } from '../../lib/runners/executeBioApp';
import {
  persistRunToWorkspace,
  submitSanitizerFeedbackReport,
} from '../../lib/workspace/workspaceStore';
import {
  InlineRichText,
  InteractiveDataTableViewer,
  Molecule3DViewer,
  ScientificPlotViewer,
  SequenceAndTrackViewer,
} from '../viewers/BioStandardViewers';

interface BioAppExecutionStudioProps {
  appId: string;
  autoRunSampleTrigger?: number;
  incomingChainPayload?: {
    fromAppTitle: string;
    fromRunId?: string;
    outputs: Partial<Record<BioDataType, unknown>>;
  } | null;
  onChainToApp: (
    targetAppId: string,
    payload: {
      fromAppTitle: string;
      fromRunId?: string;
      outputs: Partial<Record<BioDataType, unknown>>;
    }
  ) => void;
  onRunPersisted?: () => void;
  onToast: (msg: string) => void;
}

export const BioAppExecutionStudio: React.FC<BioAppExecutionStudioProps> = ({
  appId,
  autoRunSampleTrigger,
  incomingChainPayload,
  onChainToApp,
  onRunPersisted,
  onToast,
}) => {
  const manifest = BIO_APP_MANIFESTS[appId];
  const guide = BIO_APP_GUIDES[appId];

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'sample' | 'format' | 'result' | null>('sample');
  const [validationReport, setValidationReport] = useState<InputFormatValidationReport | null>(null);
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<BioAppRunResult | null>(null);
  const [savedRunId, setSavedRunId] = useState<string | undefined>(undefined);
  const [focusPeakMz, setFocusPeakMz] = useState<number | null>(null);

  useEffect(() => {
    if (!manifest) return;
    const defaults: Record<string, unknown> = {};
    manifest.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        defaults[f.name] = f.defaultValue;
      }
    });

    if (incomingChainPayload?.outputs) {
      const outs = incomingChainPayload.outputs;
      manifest.fields.forEach((f) => {
        if (!f.bioType) return;
        const val =
          outs[f.bioType] ??
          (f.bioType === 'AnyDataTable' ? Object.values(outs).find(Array.isArray) : undefined);
        if (val !== undefined) {
          if (Array.isArray(val)) {
            if (typeof val[0] === 'string') {
              defaults[f.name] = f.widget === 'text' ? val[0] : val.join('\n');
            } else {
              defaults[f.name] = JSON.stringify(val, null, 2);
            }
          } else if (typeof val === 'string') {
            defaults[f.name] = val;
          }
        }
      });
    }

    setFormValues(defaults);
    setFiles([]);
    setResult(null);
    setErrorMsg(null);
    setFocusPeakMz(null);
  }, [appId, manifest, incomingChainPayload]);

  // Real-time pre-flight format check whenever inputs or uploaded files change
  useEffect(() => {
    if (!manifest) return;
    let cancelled = false;
    validateBioAppInput(manifest.id, formValues, files)
      .then((rep) => {
        if (!cancelled) setValidationReport(rep);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [manifest, formValues, files]);

  if (!manifest) return null;

  const triggerRun = async (useSamplePreset = false) => {
    setRunning(true);
    setErrorMsg(null);
    setFocusPeakMz(null);
    try {
      const effectiveValues = { ...formValues };
      if (useSamplePreset) {
        manifest.fields.forEach((f) => {
          if (f.defaultValue !== undefined) {
            effectiveValues[f.name] = f.defaultValue;
          }
        });
      }
      const res = await executeBioApp(
        manifest.id,
        effectiveValues,
        useSamplePreset ? [] : files
      );
      setResult(res);
      const saved = await persistRunToWorkspace(res, incomingChainPayload?.fromRunId);
      setSavedRunId(saved.id);
      onRunPersisted?.();
      onToast(`Completed ${manifest.title}`);
    } catch (err: any) {
      const msg = err?.message || 'Execution failed.';
      setErrorMsg(msg);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (autoRunSampleTrigger && autoRunSampleTrigger > 0 && !running) {
      void triggerRun(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunSampleTrigger]);

  const downloadSampleTemplate = () => {
    if (!guide) return;
    const fname = guide.sampleData.filename || `${manifest.id}_sample.txt`;
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
    onToast(`Downloaded sample template: ${fname}`);
  };

  const reportErrorToHealer = async () => {
    if (!errorMsg) return;
    await submitSanitizerFeedbackReport({
      appId: manifest.id,
      errorCode: 'EXECUTION_OR_SANITIZER_ERROR',
      errorSummary: errorMsg,
      inputFormatHint: files.map((f) => f.name.split('.').pop()).join(','),
    });
    onToast('Anonymous error trace queued for Feedback Healer.');
  };

  const basicFields = manifest.fields.filter((f) => !f.advanced);
  const advancedFields = manifest.fields.filter((f) => f.advanced);

  const outTypes = Object.keys(result?.chained_outputs || {}) as BioDataType[];
  const compatibleNextApps = findCompatibleDownstreamApps(outTypes).filter(
    (m) => m.id !== manifest.id
  );

  return (
    <section
      style={{
        background: '#f5f5f7',
        borderRadius: 14,
        padding: '22px 24px',
        marginTop: 22,
        marginBottom: 26,
      }}
    >
      {/* Top Studio Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#007aff',
              }}
            >
              LIVE EXECUTION STUDIO · {manifest.runtime.tier.toUpperCase()}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 10.5,
                fontWeight: 600,
                background: manifest.license.commercialSafe
                  ? 'rgba(52, 199, 89, 0.15)'
                  : 'rgba(255, 149, 0, 0.16)',
                color: manifest.license.commercialSafe ? '#1b7f37' : '#b25000',
              }}
            >
              {manifest.license.badgeLabel}
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            Run {manifest.title}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            {manifest.sampleDescription}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={running}
            className="mas-get-pill"
            style={{
              height: 34,
              padding: '0 16px',
              background: '#ffffff',
              border: '1px solid #d4d4d8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => triggerRun(true)}
          >
            <Sparkles size={13.5} />
            <span>{running ? 'Running…' : manifest.sampleLabel}</span>
          </button>

          <button
            type="button"
            disabled={running || validationReport?.status === 'invalid'}
            className="mas-get-pill solid-blue"
            style={{
              height: 34,
              padding: '0 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: validationReport?.status === 'invalid' ? 0.55 : 1,
            }}
            onClick={() => triggerRun(false)}
          >
            <Play size={13} fill="#ffffff" />
            <span>{running ? 'Analyzing…' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* 3-TAB QUICK GUIDE BAR INSIDE STUDIO (예시 데이터 / 형식 규격 / 결과 해석법) */}
      {guide && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid var(--divider-hairline)',
            marginBottom: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              padding: '8px 14px',
              background: '#fbfbfd',
              borderBottom: activeGuideTab ? '1px solid var(--divider-hairline)' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(
                [
                  { id: 'sample', label: '① 예시 데이터 생김새' },
                  { id: 'format', label: '② 데이터 형식 체크 기준' },
                  { id: 'result', label: '③ 결과 수치·그래프 해석법' },
                ] as const
              ).map((tab) => {
                const isOn = activeGuideTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveGuideTab(isOn ? null : tab.id)}
                    style={{
                      height: 28,
                      padding: '0 12px',
                      borderRadius: 999,
                      border: isOn ? '1px solid #007aff' : '1px solid #e5e5ea',
                      background: isOn ? 'rgba(0, 122, 255, 0.1)' : '#ffffff',
                      color: isOn ? '#0066d6' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {guide.sampleData.filename && (
              <button
                type="button"
                className="mas-link-btn"
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                onClick={downloadSampleTemplate}
              >
                <Download size={13} />
                <span>샘플 템플릿 다운로드 ({guide.sampleData.filename})</span>
              </button>
            )}
          </div>

          {activeGuideTab === 'sample' && (
            <div style={{ padding: '14px 16px', fontSize: 12.5, lineHeight: 1.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>
                  <InlineRichText text={guide.sampleData.title} />
                </strong>
                <button
                  type="button"
                  className="mas-link-btn"
                  style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => {
                    navigator.clipboard?.writeText(guide.sampleData.rawPreview);
                    onToast('예시 데이터를 클립보드에 복사했습니다.');
                  }}
                >
                  <Copy size={12} /> 예시 복사
                </button>
              </div>
              <pre
                style={{
                  margin: '0 0 10px',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  overflowX: 'auto',
                }}
              >
                {guide.sampleData.rawPreview}
              </pre>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-secondary)' }}>
                {guide.sampleData.structureExplanation.map((item, i) => (
                  <div key={i}>• <InlineRichText text={item} /></div>
                ))}
              </div>
            </div>
          )}

          {activeGuideTab === 'format' && (
            <div style={{ padding: '14px 16px', fontSize: 12.5, lineHeight: 1.55 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                <InlineRichText text={guide.formatSpec.summary} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {guide.formatSpec.checklist.map((item, i) => (
                  <div key={i}>✓ <InlineRichText text={item} /></div>
                ))}
              </div>
              <div
                style={{
                  background: 'rgba(0, 122, 255, 0.06)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#005bb5',
                  fontSize: 12,
                }}
              >
                <strong>자동 형식 보정(Auto-Sanitizer):</strong>{' '}
                <InlineRichText text={guide.formatSpec.autoSanitizerNote} />
              </div>
            </div>
          )}

          {activeGuideTab === 'result' && (
            <div style={{ padding: '14px 16px', fontSize: 12.5, lineHeight: 1.55 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                <InlineRichText text={guide.resultGuide.overview} />
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
                <strong>시각화 해석:</strong> <InlineRichText text={guide.resultGuide.visualGuide} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {guide.resultGuide.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f5f5f7',
                      borderRadius: 8,
                      padding: '8px 11px',
                    }}
                  >
                    <code style={{ fontWeight: 700, color: '#007aff', fontSize: 12 }}>
                      {m.columnOrMetric}
                    </code>
                    <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>
                      <InlineRichText text={m.meaning} />
                    </span>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                      → <strong>판정 기준:</strong> <InlineRichText text={m.cutoffOrRule} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {incomingChainPayload && (
        <div
          style={{
            background: 'rgba(0, 122, 255, 0.08)',
            border: '1px solid rgba(0, 122, 255, 0.22)',
            borderRadius: 10,
            padding: '9px 14px',
            fontSize: 12.5,
            color: '#005bb5',
            marginBottom: 14,
          }}
        >
          Chained input automatically loaded from <strong>{incomingChainPayload.fromAppTitle}</strong>.
        </div>
      )}

      {/* Declarative Input Form rendered from bioapp.yaml schema */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '16px 18px',
          border: '1px solid var(--divider-hairline)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {basicFields.map((field) => (
          <div
            key={field.name}
            style={{
              gridColumn:
                field.widget === 'textarea' || field.widget === 'file' ? '1 / -1' : undefined,
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 5,
              }}
            >
              {field.label}
            </label>

            {field.widget === 'file' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px dashed #c7c7cc',
                    background: '#fbfbfd',
                    cursor: 'pointer',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Upload size={15} color="#007aff" />
                    {files.length > 0
                      ? `${files.length}개 파일 선택됨: ${files.map((f) => f.name).join(', ')}`
                      : `여기에 ${field.acceptedFormats?.join(', ') || '파일'}을 드롭하거나 클릭해 선택하세요 (비워두면 기본 예시 데이터로 실행)`}
                  </span>
                  <input
                    type="file"
                    accept={field.acceptedFormats?.join(',')}
                    multiple={field.multiple}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const list = e.target.files ? Array.from(e.target.files) : [];
                      setFiles(list);
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <div>
                    <button
                      type="button"
                      className="mas-link-btn"
                      style={{ fontSize: 11.5 }}
                      onClick={() => setFiles([])}
                    >
                      선택한 파일 지우고 기본 예시 데이터로 되돌리기
                    </button>
                  </div>
                )}
              </div>
            )}

            {field.widget === 'textarea' && (
              <textarea
                rows={3}
                value={String(formValues[field.name] ?? '')}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: '1px solid #d4d4d8',
                  padding: '8px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
            )}

            {field.widget === 'text' && (
              <input
                type="text"
                value={String(formValues[field.name] ?? '')}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                style={{
                  width: '100%',
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #d4d4d8',
                  padding: '0 10px',
                  fontSize: 13,
                }}
              />
            )}

            {field.widget === 'number' && (
              <input
                type="number"
                value={Number(formValues[field.name] ?? field.defaultValue ?? 0)}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: parseFloat(e.target.value),
                  }))
                }
                style={{
                  width: '100%',
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #d4d4d8',
                  padding: '0 10px',
                  fontSize: 13,
                }}
              />
            )}

            {field.widget === 'select' && (
              <select
                value={String(formValues[field.name] ?? field.defaultValue ?? '')}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                style={{
                  width: '100%',
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #d4d4d8',
                  padding: '0 10px',
                  fontSize: 13,
                  background: '#ffffff',
                }}
              >
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.helperText && (
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {field.helperText}
              </div>
            )}
          </div>
        ))}

        {advancedFields.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="button"
              className="mas-link-btn"
              style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal size={13} />
              <span>
                {showAdvanced ? '고급 분석 파라미터 접기' : '고급 분석 파라미터 펼치기'}
              </span>
            </button>

            {showAdvanced && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  marginTop: 10,
                }}
              >
                {advancedFields.map((field) => (
                  <div key={field.name}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={Number(formValues[field.name] ?? field.defaultValue ?? 0)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.name]: parseFloat(e.target.value),
                        }))
                      }
                      style={{
                        width: '100%',
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid #d4d4d8',
                        padding: '0 10px',
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIVE INPUT DATA FORMAT VALIDATION STATUS BAR */}
      {validationReport && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            borderRadius: 10,
            background:
              validationReport.status === 'invalid'
                ? 'rgba(255, 59, 48, 0.08)'
                : validationReport.status === 'warning'
                ? 'rgba(255, 149, 0, 0.10)'
                : 'rgba(52, 199, 89, 0.09)',
            border:
              validationReport.status === 'invalid'
                ? '1px solid rgba(255, 59, 48, 0.28)'
                : validationReport.status === 'warning'
                ? '1px solid rgba(255, 149, 0, 0.30)'
                : '1px solid rgba(52, 199, 89, 0.26)',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, marginBottom: 4 }}>
            {validationReport.status === 'invalid' ? (
              <AlertCircle size={15} color="#c91b1b" />
            ) : validationReport.status === 'warning' ? (
              <AlertTriangle size={15} color="#b25000" />
            ) : (
              <FileCheck2 size={15} color="#1b7f37" />
            )}
            <span
              style={{
                color:
                  validationReport.status === 'invalid'
                    ? '#c91b1b'
                    : validationReport.status === 'warning'
                    ? '#b25000'
                    : '#1b7f37',
              }}
            >
              실시간 입력 형식 검사: {validationReport.headline}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 22, color: 'var(--text-secondary)' }}>
            {validationReport.checks.map((c, idx) => (
              <div key={idx}>
                {c.level === 'error' ? '✕ ' : c.level === 'warn' ? '⚠ ' : '✓ '}
                <InlineRichText text={c.message} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation & Attribution Ribbon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 10,
          fontSize: 11.5,
          color: 'var(--text-tertiary)',
          flexWrap: 'wrap',
        }}
      >
        <span>
          Primary Citation: <em>{manifest.citation}</em>{' '}
          {manifest.doi ? `(DOI: ${manifest.doi})` : ''}
        </span>
        <button
          type="button"
          className="mas-link-btn"
          style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          onClick={() => {
            navigator.clipboard?.writeText(
              `${manifest.citation}${manifest.doi ? ` https://doi.org/${manifest.doi}` : ''}`
            );
            onToast('Copied academic citation to clipboard.');
          }}
        >
          <Copy size={11.5} />
          <span>Copy Citation</span>
        </button>
      </div>

      {/* Error State + One-Click Feedback Healer Trigger */}
      {errorMsg && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(255, 59, 48, 0.09)',
            border: '1px solid rgba(255, 59, 48, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c91b1b', fontSize: 13 }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            className="mas-get-pill"
            style={{ height: 28, padding: '0 12px', fontSize: 12, background: '#ffffff' }}
            onClick={reportErrorToHealer}
          >
            Report Format Issue to Nightly Healer
          </button>
        </div>
      )}

      {/* Results Output Stage */}
      {result && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Result Summary Banner */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '14px 18px',
              border: '1px solid var(--divider-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={20} color="#34c759" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {result.summary.headline}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Executed in {result.execution_meta?.elapsed_ms ?? 0} ms · Saved to Workspace · Zero raw file retention
                </div>
              </div>
            </div>
          </div>

          {/* 3D Protein Viewer */}
          {result.structure3d && <Molecule3DViewer structure={result.structure3d} />}

          {/* Sequence & Feature Track Viewer */}
          {result.sequenceTrack && <SequenceAndTrackViewer track={result.sequenceTrack} />}

          {/* Scientific Plot Viewer */}
          {result.plot && (
            <ScientificPlotViewer plot={result.plot} focusMzCenter={focusPeakMz} />
          )}

          {/* Interactive Data Table Viewer */}
          {result.table && (
            <InteractiveDataTableViewer
              rows={result.table}
              onSelectRow={
                manifest.id === 'nucleospec-dna-agnc'
                  ? (row) => {
                      if (row.peak_mz) {
                        setFocusPeakMz(Number(row.peak_mz));
                      }
                    }
                  : undefined
              }
            />
          )}

          {/* Contextual Result Interpretation Card right alongside live outputs */}
          {guide && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: '16px 18px',
                border: '1px solid rgba(0, 122, 255, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#007aff',
                  marginBottom: 8,
                }}
              >
                <BookOpen size={14} />
                <span>결과 분석 및 핵심 수치 판독 가이드 ({manifest.title.split(':')[0]})</span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <InlineRichText text={guide.resultGuide.overview} />
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {guide.resultGuide.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f5f5f7',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0066d6' }}>
                      {m.columnOrMetric}
                    </div>
                    <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>
                      <InlineRichText text={m.meaning} />
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                      <strong>기준:</strong> <InlineRichText text={m.cutoffOrRule} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#005bb5' }}>
                <strong>추천 후속 단계:</strong> <InlineRichText text={guide.resultGuide.nextSteps} />
              </div>
            </div>
          )}

          {/* One-Click Downstream Bio-Type Chaining Bar */}
          {compatibleNextApps.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: '14px 18px',
                border: '1px solid var(--divider-hairline)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 10,
                }}
              >
                ONE-CLICK CHAIN OUTPUT TO COMPATIBLE OPENBIOAPP BLOCKS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {compatibleNextApps.slice(0, 6).map((nextApp) => (
                  <button
                    key={nextApp.id}
                    type="button"
                    className="mas-get-pill"
                    style={{
                      height: 30,
                      padding: '0 13px',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onClick={() =>
                      onChainToApp(nextApp.id, {
                        fromAppTitle: manifest.title,
                        fromRunId: savedRunId,
                        outputs: result.chained_outputs || {},
                      })
                    }
                  >
                    <span>{nextApp.title.split(':')[0]}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
