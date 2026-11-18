import React, { useEffect, useId, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck2,
  Play,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useLocale } from '../../lib/i18n/locale';
import {
  BIO_APP_MANIFESTS,
  BioAppRunResult,
  BioDataType,
  findCompatibleDownstreamApps,
} from '../../lib/schema/bioAppSchema';
import {
  getBioAppGuide,
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
import { PostRunInterpretationCard, StudioGuideDrawer } from './StudioGuideDrawer';

interface BioAppExecutionStudioProps {
  appId: string;
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
  incomingChainPayload,
  onChainToApp,
  onRunPersisted,
  onToast,
}) => {
  const { locale, tr } = useLocale();
  const baseId = useId();
  const manifest = BIO_APP_MANIFESTS[appId];
  const guide = getBioAppGuide(appId, locale);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Debounced (150ms) live input validation synchronized with active locale
  useEffect(() => {
    if (!manifest) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const sanitizedValues: Record<string, unknown> = { ...formValues };
      manifest.fields.forEach((f) => {
        if (f.widget === 'number') {
          const raw = sanitizedValues[f.name];
          if (raw === '' || raw === undefined || Number.isNaN(Number(raw))) {
            sanitizedValues[f.name] = f.defaultValue ?? 0;
          } else {
            sanitizedValues[f.name] = Number(raw);
          }
        }
      });
      validateBioAppInput(manifest.id, sanitizedValues, files, locale)
        .then((rep) => {
          if (!cancelled) setValidationReport(rep);
        })
        .catch(() => {});
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [manifest, formValues, files, locale]);

  if (!manifest) return null;

  const coerceFormValues = (useSamplePreset: boolean): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...formValues };
    manifest.fields.forEach((f) => {
      if (useSamplePreset && f.defaultValue !== undefined) {
        out[f.name] = f.defaultValue;
        return;
      }
      if (f.widget === 'number') {
        const raw = out[f.name];
        const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
        out[f.name] = Number.isFinite(parsed) ? parsed : Number(f.defaultValue ?? 0);
      }
    });
    return out;
  };

  const triggerRun = async (useSamplePreset = false) => {
    setRunning(true);
    setErrorMsg(null);
    setFocusPeakMz(null);
    try {
      const effectiveValues = coerceFormValues(useSamplePreset);
      const res = await executeBioApp(
        manifest.id,
        effectiveValues,
        useSamplePreset ? [] : files
      );
      setResult(res);
      const saved = await persistRunToWorkspace(res, incomingChainPayload?.fromRunId);
      setSavedRunId(saved.id);
      onRunPersisted?.();
      onToast(tr(`Completed ${manifest.title}`, `${manifest.title} 실행 완료`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tr('Execution failed.', '실행에 실패했습니다.');
      setErrorMsg(msg);
    } finally {
      setRunning(false);
    }
  };

  const reportErrorToHealer = async () => {
    if (!errorMsg) return;
    await submitSanitizerFeedbackReport({
      appId: manifest.id,
      errorCode: 'EXECUTION_OR_SANITIZER_ERROR',
      errorSummary: errorMsg,
      inputFormatHint: files.map((f) => f.name.split('.').pop()).join(','),
    });
    onToast(
      tr(
        'Anonymous error trace queued for Feedback Healer.',
        '익명 오류 리포트가 Feedback Healer 큐에 등록되었습니다.'
      )
    );
  };

  const basicFields = manifest.fields.filter((f) => !f.advanced);
  const advancedFields = manifest.fields.filter((f) => f.advanced);

  const outTypes = Object.keys(result?.chained_outputs || {}) as BioDataType[];
  const compatibleNextApps = findCompatibleDownstreamApps(outTypes).filter(
    (m) => m.id !== manifest.id
  );

  const renderNumberInput = (field: (typeof manifest.fields)[number], inputId: string) => {
    const rawVal = formValues[field.name];
    const displayValue =
      rawVal === ''
        ? ''
        : rawVal !== undefined && !Number.isNaN(Number(rawVal))
        ? String(rawVal)
        : String(field.defaultValue ?? 0);

    return (
      <input
        id={inputId}
        type="number"
        className="studio-input"
        value={displayValue}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => {
          const v = e.target.value;
          setFormValues((prev) => ({
            ...prev,
            [field.name]: v === '' ? '' : Number(v),
          }));
        }}
        onBlur={() => {
          setFormValues((prev) => {
            const cur = prev[field.name];
            if (cur === '' || cur === undefined || Number.isNaN(Number(cur))) {
              return { ...prev, [field.name]: field.defaultValue ?? 0 };
            }
            return prev;
          });
        }}
      />
    );
  };

  return (
    <section
      className="studio-shell"
      aria-label={tr(`Execution studio for ${manifest.title}`, `${manifest.title} 실행 스튜디오`)}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !running && validationReport?.status !== 'invalid') {
          e.preventDefault();
          void triggerRun(false);
        }
      }}
    >
      {/* Header Row: Title + Runtime/License Badges + Primary Actions */}
      <div className="studio-header">
        <div className="studio-header-copy">
          <div className="studio-title-row">
            <h2 className="studio-title">
              {tr(`Run ${manifest.title}`, `${manifest.title} 실행`)}
            </h2>
            <span className="studio-tier-pill">{manifest.runtime.tier}</span>
            <span
              className={`studio-license-pill ${
                manifest.license.commercialSafe ? 'commercial' : 'academic'
              }`}
            >
              {manifest.license.badgeLabel}
            </span>
          </div>
          <p className="studio-subtitle">{manifest.sampleDescription}</p>
        </div>

        <div className="studio-actions">
          <button
            type="button"
            disabled={running}
            className="mas-get-pill studio-sample-btn"
            onClick={() => void triggerRun(true)}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>{running ? tr('Running…', '실행 중…') : manifest.sampleLabel}</span>
          </button>

          <button
            type="button"
            disabled={running || validationReport?.status === 'invalid'}
            className="mas-get-pill solid-blue studio-run-btn"
            onClick={() => void triggerRun(false)}
          >
            <Play size={13} fill="#ffffff" aria-hidden="true" />
            <span>{running ? tr('Analyzing…', '분석 중…') : tr('Run Analysis', '분석 실행')}</span>
          </button>
        </div>
      </div>

      {/* On-Demand Collapsible Reference Drawer (Sample / Format / Result Guide) */}
      {guide && <StudioGuideDrawer appId={manifest.id} guide={guide} onToast={onToast} />}

      {incomingChainPayload && (
        <div className="studio-chain-incoming" role="status">
          {tr('Chained input loaded from ', '이전 단계 결과 자동 연결됨: ')}
          <strong>{incomingChainPayload.fromAppTitle}</strong>
        </div>
      )}

      {/* Declarative Input Form (Leads directly above the fold) */}
      <div className="studio-form-card">
        {basicFields.map((field) => {
          const inputId = `${baseId}-${field.name}`;
          const isWide = field.widget === 'textarea' || field.widget === 'file';
          return (
            <div
              key={field.name}
              className={`studio-field ${isWide ? 'full-span' : ''}`}
            >
              <label htmlFor={inputId} className="studio-label">
                {field.label}
              </label>

              {field.widget === 'file' && (
                <div className="studio-file-group">
                  <label
                    htmlFor={inputId}
                    className={`studio-dropzone ${dragActive ? 'drag-over' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const dropped = e.dataTransfer?.files
                        ? Array.from(e.dataTransfer.files)
                        : [];
                      if (dropped.length) setFiles(dropped);
                    }}
                  >
                    <span className="studio-dropzone-text">
                      <Upload size={16} aria-hidden="true" />
                      <span>
                        {files.length > 0
                          ? tr(
                              `${files.length} file(s) selected: ${files.map((f) => f.name).join(', ')}`,
                              `${files.length}개 파일 선택됨: ${files.map((f) => f.name).join(', ')}`
                            )
                          : tr(
                              `Drop ${field.acceptedFormats?.join(', ') || 'data file'} here or click to browse (leave empty to run built-in benchmark)`,
                              `여기에 ${field.acceptedFormats?.join(', ') || '데이터 파일'}을 드롭하거나 클릭해 선택하세요 (비워두면 내장 벤치마크 데이터로 실행)`
                            )}
                      </span>
                    </span>
                    <input
                      id={inputId}
                      type="file"
                      accept={field.acceptedFormats?.join(',')}
                      multiple={field.multiple}
                      className="sr-only"
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
                        onClick={() => setFiles([])}
                      >
                        {tr(
                          'Clear selected file and revert to built-in benchmark',
                          '선택한 파일 지우고 내장 벤치마크 데이터로 되돌리기'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {field.widget === 'textarea' && (
                <textarea
                  id={inputId}
                  rows={3}
                  className="studio-textarea"
                  value={String(formValues[field.name] ?? '')}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
              )}

              {field.widget === 'text' && (
                <input
                  id={inputId}
                  type="text"
                  className="studio-input"
                  value={String(formValues[field.name] ?? '')}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
              )}

              {field.widget === 'number' && renderNumberInput(field, inputId)}

              {field.widget === 'select' && (
                <select
                  id={inputId}
                  className="studio-select"
                  value={String(formValues[field.name] ?? field.defaultValue ?? '')}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.helperText && (
                <div className="studio-helper">{field.helperText}</div>
              )}
            </div>
          );
        })}

        {advancedFields.length > 0 && (
          <div className="studio-field full-span">
            <button
              type="button"
              className="mas-link-btn"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              <span>
                {showAdvanced
                  ? tr('Hide Advanced Parameters', '고급 분석 파라미터 접기')
                  : tr('Show Advanced Parameters', '고급 분석 파라미터 펼치기')}
              </span>
            </button>

            {showAdvanced && (
              <div className="studio-advanced-grid">
                {advancedFields.map((field) => {
                  const advId = `${baseId}-adv-${field.name}`;
                  return (
                    <div key={field.name} className="studio-field">
                      <label htmlFor={advId} className="studio-label">
                        {field.label}
                      </label>
                      {renderNumberInput(field, advId)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Pre-Flight Input Format Validation Status Bar */}
      {validationReport && (
        <div
          className={`studio-validation-bar status-${validationReport.status}`}
          role="status"
          aria-live="polite"
        >
          <div className="studio-validation-head">
            {validationReport.status === 'invalid' ? (
              <AlertCircle size={16} aria-hidden="true" />
            ) : validationReport.status === 'warning' ? (
              <AlertTriangle size={16} aria-hidden="true" />
            ) : (
              <FileCheck2 size={16} aria-hidden="true" />
            )}
            <span>
              {tr('Input Format Check:', '실시간 입력 형식 검사:')} {validationReport.headline}
            </span>
          </div>
          <div className="studio-validation-checks">
            {validationReport.checks.map((c, idx) => (
              <div key={idx}>
                {c.level === 'error' ? '✕ ' : c.level === 'warn' ? '⚠ ' : '✓ '}
                <InlineRichText text={c.message} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation & Keyboard Hint Ribbon */}
      <div className="studio-citation-row">
        <span>
          {tr('Citation:', '인용 문헌:')} <em>{manifest.citation}</em>{' '}
          {manifest.doi ? `(DOI: ${manifest.doi})` : ''}
        </span>
        <div className="studio-citation-actions">
          <span className="studio-kbd-hint" aria-hidden="true">
            ⌘↵ {tr('to run', '실행')}
          </span>
          <button
            type="button"
            className="mas-link-btn"
            onClick={() => {
              navigator.clipboard?.writeText(
                `${manifest.citation}${manifest.doi ? ` https://doi.org/${manifest.doi}` : ''}`
              );
              onToast(
                tr(
                  'Copied academic citation to clipboard.',
                  '논문 인용 정보를 클립보드에 복사했습니다.'
                )
              );
            }}
          >
            <Copy size={13} aria-hidden="true" />
            <span>{tr('Copy Citation', '인용 복사')}</span>
          </button>
        </div>
      </div>

      {/* Error State + Feedback Healer */}
      {errorMsg && (
        <div className="studio-error-banner" role="alert">
          <div className="studio-error-text">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            className="mas-get-pill"
            onClick={reportErrorToHealer}
          >
            {tr('Report Issue to Nightly Healer', '형식 오류를 Healer에 제보')}
          </button>
        </div>
      )}

      {/* Results Output Stage */}
      {result && (
        <div className="studio-results-stack">
          <div className="studio-result-summary" role="status">
            <CheckCircle2 size={20} className="studio-result-icon" aria-hidden="true" />
            <div>
              <div className="studio-result-headline">{result.summary.headline}</div>
              <div className="studio-result-meta">
                {tr(
                  `Executed in ${result.execution_meta?.elapsed_ms ?? 0} ms · Saved to Workspace · Zero raw file retention`,
                  `${result.execution_meta?.elapsed_ms ?? 0} ms 만에 분석 완료 · 워크스페이스 저장됨 · 원본 파일 무보관`
                )}
              </div>
            </div>
          </div>

          {result.structure3d && <Molecule3DViewer structure={result.structure3d} />}
          {result.sequenceTrack && <SequenceAndTrackViewer track={result.sequenceTrack} />}
          {result.plot && (
            <ScientificPlotViewer plot={result.plot} focusMzCenter={focusPeakMz} />
          )}
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

          {guide && (
            <PostRunInterpretationCard appTitle={manifest.title} guide={guide} />
          )}

          {compatibleNextApps.length > 0 && (
            <div className="studio-chain-bar">
              <div className="studio-chain-title">
                {tr(
                  'Chain Output to Compatible Blocks',
                  '분석 결과를 호환 바이오 블록으로 원클릭 연결'
                )}
              </div>
              <div className="studio-chain-pills">
                {compatibleNextApps.slice(0, 6).map((nextApp) => (
                  <button
                    key={nextApp.id}
                    type="button"
                    className="mas-get-pill"
                    onClick={() =>
                      onChainToApp(nextApp.id, {
                        fromAppTitle: manifest.title,
                        fromRunId: savedRunId,
                        outputs: result.chained_outputs || {},
                      })
                    }
                  >
                    <span>{nextApp.title.split(':')[0]}</span>
                    <ArrowRight size={13} aria-hidden="true" />
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
