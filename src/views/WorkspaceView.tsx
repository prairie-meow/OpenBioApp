import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  Download,
  FolderKanban,
  GitPullRequest,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import {
  BIO_APP_MANIFESTS,
  BioDataType,
  findCompatibleDownstreamApps,
} from '../lib/schema/bioAppSchema';
import {
  AppConversionRequestItem,
  LOCAL_RUNS_MAX,
  WorkspaceRunItem,
  deleteWorkspaceRunItem,
  fetchCloudWorkspaceRuns,
  fetchQueuedAppRequests,
  loadLocalWorkspaceRuns,
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
  onRunsChanged?: () => void;
  onToast: (msg: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  onOpenAppWithChain,
  onRunsChanged,
  onToast,
}) => {
  const { tr } = useLocale();
  const formId = useId();
  const [runs, setRuns] = useState<WorkspaceRunItem[]>(() => loadLocalWorkspaceRuns());
  const [requests, setRequests] = useState<AppConversionRequestItem[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    () => loadLocalWorkspaceRuns()[0]?.id ?? null
  );
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [titleHint, setTitleHint] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Soft-delete with 5-second Undo window
  const [pendingDelete, setPendingDelete] = useState<WorkspaceRunItem | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  const refreshRuns = async () => {
    const localImmediate = loadLocalWorkspaceRuns();
    setRuns(localImmediate);
    if (localImmediate.length > 0 && !selectedRunId) {
      setSelectedRunId(localImmediate[0].id);
    }
    const rList = await fetchCloudWorkspaceRuns();
    setRuns(rList);
    if (rList.length > 0 && !selectedRunId) {
      setSelectedRunId(rList[0].id);
    }
    onRunsChanged?.();
  };

  const refreshRequests = async () => {
    const qList = await fetchQueuedAppRequests();
    setRequests(qList);
  };

  useEffect(() => {
    void refreshRuns();
    void refreshRequests();
    return () => {
      if (deleteTimerRef.current !== null) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleRunDelete = (item: WorkspaceRunItem) => {
    if (pendingDelete && deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
      void deleteWorkspaceRunItem(pendingDelete.id);
    }
    setPendingDelete(item);
    deleteTimerRef.current = window.setTimeout(async () => {
      deleteTimerRef.current = null;
      await deleteWorkspaceRunItem(item.id);
      setPendingDelete(null);
      await refreshRuns();
    }, 5000);
  };

  const undoRunDelete = () => {
    if (deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    setPendingDelete(null);
    onToast(tr('Restored analysis run.', '분석 기록이 복구되었습니다.'));
  };

  const exportRunJson = (run: WorkspaceRunItem) => {
    const blob = new Blob([JSON.stringify(run, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run.appId}-${run.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      await refreshRequests();
      onToast(
        res.persistedToCloud
          ? tr(
              'Enqueued in OpenBioApp Firestore app_requests for tonight’s 7-Subagent Factory.',
              '오늘 밤 7-Subagent Factory 실행을 위해 Firestore app_requests 큐에 등록되었습니다.'
            )
          : tr(
              'Saved to local request queue (sign in via Account to sync to cloud factory).',
              '로컬 요청 큐에 저장되었습니다 (클라우드 팩토리 동기화는 계정 로그인 후 가능).'
            )
      );
    } catch (err: unknown) {
      onToast(
        err instanceof Error
          ? err.message
          : tr('Could not enqueue repository.', '저장소 등록에 실패했습니다.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const visibleRuns = runs.filter((r) => r.id !== pendingDelete?.id);
  const activeRun =
    visibleRuns.find((r) => r.id === selectedRunId) || visibleRuns[0] || null;
  const activeOutTypes = Object.keys(activeRun?.result?.chained_outputs || {}) as BioDataType[];
  const nextApps = findCompatibleDownstreamApps(activeOutTypes).filter(
    (m) => m.id !== activeRun?.appId
  );

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <div>
          <h1 className="mas-page-title">{tr('Workspace', '워크스페이스')}</h1>
          <p className="ws-page-sub">
            {tr(
              `Saved reproducible artifacts (up to ${LOCAL_RUNS_MAX} in local browser cache) & open-source Repo-to-App queue.`,
              `재현 가능한 분석 아티팩트 보관함 (브라우저 로컬 최대 ${LOCAL_RUNS_MAX}건) 및 오픈소스 Repo-to-App 변환 큐.`
            )}
          </p>
        </div>

        <button
          type="button"
          className="mas-get-pill solid-blue"
          aria-expanded={showRequestForm}
          onClick={() => setShowRequestForm((v) => !v)}
        >
          <Plus size={15} aria-hidden="true" />
          <span>{tr('Request Repo-to-App', 'Repo-to-App 변환 신청')}</span>
        </button>
      </div>

      {/* 5-Second Undo Toast Banner */}
      {pendingDelete && (
        <div className="ws-undo-banner" role="status" aria-live="polite">
          <span>
            {tr(
              `Removed “${pendingDelete.title}”.`,
              `“${pendingDelete.title}” 기록을 삭제했습니다.`
            )}
          </span>
          <button
            type="button"
            className="mas-get-pill"
            onClick={undoRunDelete}
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>{tr('Undo', '실행 취소')}</span>
          </button>
        </div>
      )}

      {/* Repo-to-App Submission Card */}
      {showRequestForm && (
        <form onSubmit={handleSubmitRepo} className="ws-request-form">
          <h2 className="ws-form-title">
            {tr(
              'Submit Open-Source Bio Paper or GitHub Repo for Nightly Auto-Conversion',
              '오픈소스 바이오 논문 또는 GitHub 저장소 자동 앱 변환 신청'
            )}
          </h2>
          <p className="ws-form-desc">
            {tr(
              'Our 7-Subagent Factory audits open licenses (MIT / Apache-2.0 / BSD / CC-BY), extracts the headless scientific core, validates against golden datasets, and publishes to OpenBioApp.',
              '7-Subagent Factory가 오픈 라이선스(MIT / Apache-2.0 / BSD / CC-BY) 검증, 핵심 연산 추출, 골든 데이터셋 회귀 테스트를 거쳐 OpenBioApp에 자동 배포합니다.'
            )}
          </p>

          <div className="ws-form-grid">
            <div>
              <label htmlFor={`${formId}-repo`} className="studio-label">
                {tr('GitHub / Hugging Face / Bioconda URL *', 'GitHub / Hugging Face / Bioconda 주소 *')}
              </label>
              <input
                id={`${formId}-repo`}
                required
                type="url"
                className="studio-input"
                placeholder="https://github.com/org/bio-tool"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-title`} className="studio-label">
                {tr('Tool Name Hint', '도구 이름 힌트')}
              </label>
              <input
                id={`${formId}-title`}
                type="text"
                className="studio-input"
                placeholder="e.g. Scanpy Trajectory Analyzer"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-doi`} className="studio-label">
                {tr('Paper DOI (Optional)', '논문 DOI (선택)')}
              </label>
              <input
                id={`${formId}-doi`}
                type="text"
                className="studio-input"
                placeholder="10.1038/s41592-..."
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>
            <div className="studio-field full-span">
              <label htmlFor={`${formId}-notes`} className="studio-label">
                {tr('Research Use Case / Input Format Notes', '활용 목적 및 희망 입출력 형식 메모')}
              </label>
              <input
                id={`${formId}-notes`}
                type="text"
                className="studio-input"
                placeholder={tr(
                  'What files do you want to drop in and what plot/table should come out?',
                  '어떤 실험 파일을 넣고 어떤 그래프·테이블 결과를 얻고 싶은지 적어주세요.'
                )}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="ws-form-actions">
            <button
              type="button"
              className="mas-get-pill"
              onClick={() => setShowRequestForm(false)}
            >
              {tr('Cancel', '취소')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="mas-get-pill solid-blue"
            >
              {submitting
                ? tr('Submitting…', '등록 중…')
                : tr('Enqueue for Nightly Factory', '야간 Factory 큐에 등록')}
            </button>
          </div>
        </form>
      )}

      {/* Saved Analysis Runs Split Layout */}
      {visibleRuns.length === 0 ? (
        <div className="ws-empty-card">
          <FolderKanban size={36} className="ws-empty-icon" aria-hidden="true" />
          <h2 className="ws-empty-title">
            {tr('Your Project Workspace Is Ready', '프로젝트 워크스페이스가 준비되었습니다')}
          </h2>
          <p className="ws-empty-desc">
            {tr(
              'Run any studio in Discover or Auto-Research—such as NucleoSpec ESI-MS, PyDESeq2, or OpenTargets—and every table, 3D structure, and plot will save here for one-click chaining.',
              '탐색 탭이나 자율 연구에서 NucleoSpec, PyDESeq2, OpenTargets 등 원하는 도구를 실행하면 모든 결과 표·3D 구조·그래프가 이곳에 자동 보관되어 후속 분석으로 즉시 연결할 수 있습니다.'
            )}
          </p>
          <button
            type="button"
            className="mas-get-pill solid-blue"
            onClick={() => onOpenAppWithChain('nucleospec-dna-agnc')}
          >
            {tr('Try NucleoSpec 3-Second Demo', 'NucleoSpec 3초 데모 실행하기')}
          </button>
        </div>
      ) : (
        <div className="ws-split-layout">
          {/* Left Run History Column (Semantic Sibling Buttons) */}
          <div className="ws-run-list">
            <div className="ws-run-list-header">
              <span>
                {tr(
                  `Saved Run Artifacts (${visibleRuns.length}/${LOCAL_RUNS_MAX})`,
                  `보관된 분석 아티팩트 (${visibleRuns.length}/${LOCAL_RUNS_MAX})`
                )}
              </span>
            </div>
            {visibleRuns.map((item) => {
              const active = activeRun?.id === item.id;
              const shortTitle =
                BIO_APP_MANIFESTS[item.appId]?.title.split(':')[0] || item.title;
              return (
                <div
                  key={item.id}
                  className={`ws-run-row ${active ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="ws-run-select-btn"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setSelectedRunId(item.id)}
                  >
                    <span className="ws-run-title">{shortTitle}</span>
                    <span className="ws-run-summary">{item.summary}</span>
                    <span className="ws-run-meta">
                      {item.bioType} · {(item.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ws-run-delete-btn"
                    aria-label={tr(`Remove ${shortTitle}`, `${shortTitle} 삭제`)}
                    onClick={() => scheduleRunDelete(item)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Selected Artifact Inspector + Chaining */}
          {activeRun && (
            <div className="ws-inspector-stack">
              <div className="ws-inspector-header">
                <div className="ws-inspector-top">
                  <div>
                    <h2 className="ws-inspector-title">{activeRun.title}</h2>
                    <p className="ws-inspector-summary">{activeRun.summary}</p>
                  </div>
                  <button
                    type="button"
                    className="mas-get-pill"
                    onClick={() => exportRunJson(activeRun)}
                  >
                    <Download size={13} aria-hidden="true" />
                    <span>{tr('Export JSON', 'JSON 내보내기')}</span>
                  </button>
                </div>

                {nextApps.length > 0 && (
                  <div className="studio-chain-pills ws-chain-row">
                    {nextApps.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="mas-get-pill"
                        onClick={() =>
                          onOpenAppWithChain(m.id, {
                            fromAppTitle: activeRun.title,
                            fromRunId: activeRun.id,
                            outputs: activeRun.result.chained_outputs || {},
                          })
                        }
                      >
                        <span>
                          {tr(
                            `Chain to ${m.title.split(':')[0]}`,
                            `${m.title.split(':')[0]}(으)로 연결`
                          )}
                        </span>
                        <ArrowRight size={13} aria-hidden="true" />
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
      <section className="mas-section ws-queue-section">
        <div className="mas-section-divider" />
        <div className="mas-section-header">
          <h2 className="mas-section-title ws-queue-heading">
            <GitPullRequest size={18} aria-hidden="true" />
            <span>
              {tr(
                'Community & Auto-Research Repo Conversion Queue',
                '커뮤니티 및 자율 연구 저장소 변환 대기열'
              )}
            </span>
          </h2>
        </div>

        {requests.length === 0 ? (
          <p className="ws-queue-empty">
            {tr(
              'No pending repository requests in queue. Click “Request Repo-to-App” above to enqueue any open-license GitHub paper repository.',
              '현재 대기 중인 저장소 변환 요청이 없습니다. 상단 버튼을 눌러 오픈소스 논문 GitHub 주소를 등록해 보세요.'
            )}
          </p>
        ) : (
          <div className="t10-updates-grid">
            {requests.map((req) => (
              <div key={req.id} className="t10-update-card">
                <div className="ws-req-top">
                  <strong className="ws-req-title">
                    {req.titleHint ||
                      req.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                  </strong>
                  <span
                    className={`bio-status-pill ${
                      req.status === 'published' ? 'ok' : 'info'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="ws-req-url">{req.repoUrl}</div>
                {req.notes && <p className="t10-notes">{req.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
