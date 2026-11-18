import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
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
import { executeBioApp } from '../../lib/runners/executeBioApp';
import {
  persistRunToWorkspace,
  submitSanitizerFeedbackReport,
} from '../../lib/workspace/workspaceStore';
import {
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
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

    // Auto-inject chained biological data from upstream app if compatible!
    if (incomingChainPayload?.outputs) {
      const outs = incomingChainPayload.outputs;
      manifest.fields.forEach((f) => {
        if (!f.bioType) return;
        const val = outs[f.bioType] ?? (f.bioType === 'AnyDataTable' ? Object.values(outs).find(Array.isArray) : undefined);
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

  const reportErrorToHealer = async () => {
    if (!errorMsg) return;
    await submitSanitizerFeedbackReport({
      appId: manifest.id,
      errorCode: 'EXECUTION_OR_SANITIZER_ERROR',
      errorSummary: errorMsg,
      inputFormatHint: files.map((f) => f.name.split('.').pop()).join(','),
    });
    onToast('Anonymous error trace queued for tonight’s Feedback Healer agent.');
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
          marginBottom: 16,
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
            disabled={running}
            className="mas-get-pill solid-blue"
            style={{
              height: 34,
              padding: '0 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => triggerRun(false)}
          >
            <Play size={13} fill="#ffffff" />
            <span>{running ? 'Analyzing…' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

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
                    ? `${files.length} file(s) selected: ${files.map((f) => f.name).join(', ')}`
                    : `Drop ${field.acceptedFormats?.join(', ') || 'files'} here or click to browse (optional for sample demo)`}
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
                {showAdvanced ? 'Hide Advanced Scientific Parameters' : 'Show Advanced Scientific Parameters'}
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
