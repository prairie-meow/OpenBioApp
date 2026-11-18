import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  FolderKanban,
  GitPullRequest,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  BIO_APP_MANIFESTS,
  BioDataType,
  findCompatibleDownstreamApps,
} from '../lib/schema/bioAppSchema';
import {
  AppConversionRequestItem,
  WorkspaceRunItem,
  deleteWorkspaceRunItem,
  fetchCloudWorkspaceRuns,
  fetchQueuedAppRequests,
  submitRepoConversionRequest,
} from '../lib/workspace/workspaceStore';
import {
  InteractiveDataTableViewer,
  Molecule3DViewer,
  ScientificPlotViewer,
  SequenceAndTrackViewer,
} from '../components/viewers/BioStandardViewers';

interface WorkspaceViewProps {
  onOpenAppWithChain: (
    appId: string,
    payload?: {
      fromAppTitle: string;
      fromRunId?: string;
      outputs: Partial<Record<BioDataType, unknown>>;
    }
  ) => void;
  onToast: (msg: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  onOpenAppWithChain,
  onToast,
}) => {
  const [runs, setRuns] = useState<WorkspaceRunItem[]>([]);
  const [requests, setRequests] = useState<AppConversionRequestItem[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [titleHint, setTitleHint] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refreshAll = async () => {
    const [rList, qList] = await Promise.all([
      fetchCloudWorkspaceRuns(),
      fetchQueuedAppRequests(),
    ]);
    setRuns(rList);
    setRequests(qList);
    if (rList.length > 0 && !selectedRunId) {
      setSelectedRunId(rList[0].id);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSubmitRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitRepoConversionRequest({
        repoUrl,
        doi,
        titleHint,
        notes,
      });
      setRepoUrl('');
      setDoi('');
      setTitleHint('');
      setNotes('');
      setShowRequestForm(false);
      await refreshAll();
      onToast(
        res.persistedToCloud
          ? 'Enqueued in OpenBioApp Firestore app_requests for tonight’s 7-Subagent Factory.'
          : 'Saved to local request queue (sign in via Bio Account to sync to cloud factory).'
      );
    } catch (err: any) {
      onToast(err?.message || 'Could not enqueue repository.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRun = runs.find((r) => r.id === selectedRunId) || runs[0] || null;
  const activeOutTypes = Object.keys(activeRun?.result?.chained_outputs || {}) as BioDataType[];
  const nextApps = findCompatibleDownstreamApps(activeOutTypes).filter(
    (m) => m.id !== activeRun?.appId
  );

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <div>
          <div className="t3-eyebrow" style={{ marginBottom: 4 }}>
            PROJECT DATA DRIVE &amp; REPO-TO-APP QUEUE
          </div>
          <h1 className="mas-page-title">Workspace</h1>
        </div>

        <button
          type="button"
          className="mas-get-pill solid-blue"
          style={{ height: 34, padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowRequestForm((v) => !v)}
        >
          <Plus size={14} />
          <span>Request Repo-to-App</span>
        </button>
      </div>

      {/* Repo-to-App Submission Card */}
      {showRequestForm && (
        <form
          onSubmit={handleSubmitRepo}
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: '20px 22px',
            marginBottom: 26,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            Submit Open-Source Bio Paper or GitHub Repo for Nightly Auto-Conversion
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Our 7-Subagent Factory audits open licenses (MIT / Apache-2.0 / BSD / CC-BY), extracts the headless scientific core, validates against golden datasets, and publishes to OpenBioApp automatically.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                GitHub / Hugging Face / Bioconda URL *
              </label>
              <input
                required
                type="url"
                placeholder="https://github.com/org/bio-tool"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Tool Name Hint
              </label>
              <input
                type="text"
                placeholder="e.g. Scanpy Trajectory Analyzer"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Paper DOI (Optional)
              </label>
              <input
                type="text"
                placeholder="10.1038/s41592-..."
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Research Use Case / Input Format Notes
              </label>
              <input
                type="text"
                placeholder="What files do you want to drop in and what plot/table should come out?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              className="mas-get-pill"
              style={{ height: 30, padding: '0 14px', background: '#e5e5ea', color: '#1d1d1f' }}
              onClick={() => setShowRequestForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="mas-get-pill solid-blue"
              style={{ height: 30, padding: '0 18px' }}
            >
              {submitting ? 'Submitting…' : 'Enqueue for Nightly Factory'}
            </button>
          </div>
        </form>
      )}

      {/* Saved Analysis Runs Split Layout */}
      {runs.length === 0 ? (
        <div
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: '44px 28px',
            textAlign: 'center',
          }}
        >
          <FolderKanban size={36} color="#86868b" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 17, fontWeight: 600 }}>Your Project Workspace Is Ready</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 500, margin: '6px auto 18px' }}>
            Run any tool in Discover or Auto-Research—such as NucleoSpec ESI-MS, PyDESeq2, or OpenTargets—and every table, 3D structure, and plot will automatically save here for one-click chaining.
          </div>
          <button
            type="button"
            className="mas-get-pill solid-blue"
            style={{ height: 34, padding: '0 18px' }}
            onClick={() => onOpenAppWithChain('nucleospec-dna-agnc')}
          >
            Try NucleoSpec 3-Second Demo
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(270px, 320px) 1fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* Left Run History Column */}
          <div
            style={{
              background: '#f5f5f7',
              borderRadius: 14,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-tertiary)', padding: '4px 8px' }}>
              SAVED RUN ARTIFACTS ({runs.length})
            </div>
            {runs.map((item) => {
              const active = activeRun?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRunId(item.id)}
                  style={{
                    background: active ? '#ffffff' : 'transparent',
                    borderRadius: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {BIO_APP_MANIFESTS[item.appId]?.title.split(':')[0] || item.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {item.bioType} · {(item.sizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteWorkspaceRunItem(item.id);
                      await refreshAll();
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#aeaeb2', cursor: 'pointer', alignSelf: 'flex-start', padding: 2 }}
                    title="Remove run"
                  >
                    <Trash2 size={13.5} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Selected Artifact Inspector + Chaining */}
          {activeRun && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#007aff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  REPRODUCIBLE ARTIFACT · {activeRun.bioType}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>
                  {activeRun.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {activeRun.summary}
                </div>

                {nextApps.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {nextApps.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="mas-get-pill"
                        style={{ height: 28, padding: '0 12px', background: '#ffffff', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        onClick={() =>
                          onOpenAppWithChain(m.id, {
                            fromAppTitle: activeRun.title,
                            fromRunId: activeRun.id,
                            outputs: activeRun.result.chained_outputs || {},
                          })
                        }
                      >
                        <span>Chain to {m.title.split(':')[0]}</span>
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeRun.result.structure3d && (
                <Molecule3DViewer structure={activeRun.result.structure3d} />
              )}
              {activeRun.result.sequenceTrack && (
                <SequenceAndTrackViewer track={activeRun.result.sequenceTrack} />
              )}
              {activeRun.result.plot && (
                <ScientificPlotViewer plot={activeRun.result.plot} />
              )}
              {activeRun.result.table && (
                <InteractiveDataTableViewer rows={activeRun.result.table} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Nightly Conversion Request Queue Section */}
      <section className="mas-section" style={{ marginTop: 36 }}>
        <div className="mas-section-divider" />
        <div className="mas-section-header">
          <h2 className="mas-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <GitPullRequest size={18} color="#007aff" />
            <span>Community &amp; Auto-Research Repo Conversion Queue</span>
          </h2>
          <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Polled nightly by the 7-Subagent Repo-to-App Factory
          </span>
        </div>

        {requests.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>
            No pending repository requests in queue. Click “Request Repo-to-App” above to enqueue any open-license GitHub paper repository.
          </div>
        ) : (
          <div className="t10-updates-grid">
            {requests.map((req) => (
              <div key={req.id} className="t10-update-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {req.titleHint || req.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                  </div>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: req.status === 'published' ? 'rgba(52,199,89,0.14)' : 'rgba(0,122,255,0.12)',
                      color: req.status === 'published' ? '#1b7f37' : '#0066d6',
                      textTransform: 'uppercase',
                    }}
                  >
                    {req.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#007aff', marginTop: 4, wordBreak: 'break-all' }}>
                  {req.repoUrl}
                </div>
                {req.notes && (
                  <p className="t10-notes" style={{ marginTop: 6 }}>
                    {req.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
