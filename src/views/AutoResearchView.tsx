import React, { useId, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Cpu,
  KeyRound,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import { BioApp } from '../types/store';
import { BioAppIcon } from '../components/BioArtwork';
import {
  AutoResearchSessionResult,
  AutoResearchStepLog,
  runByokAutoResearchLoop,
  runPresetLiveBenchmarkMission,
} from '../lib/auto-research/autoResearchEngine';
import { loadByokSettings } from '../lib/workspace/workspaceStore';
import {
  InteractiveDataTableViewer,
  MarkdownReportViewer,
  Molecule3DViewer,
  ScientificPlotViewer,
} from '../components/viewers/BioStandardViewers';

interface AutoResearchViewProps {
  apps: BioApp[];
  onOpenApp: (appId: string) => void;
  onOpenSettings: () => void;
  onRunPersisted?: () => void;
  onToast: (msg: string) => void;
}

export const AutoResearchView: React.FC<AutoResearchViewProps> = ({
  apps,
  onOpenApp,
  onOpenSettings,
  onRunPersisted,
  onToast,
}) => {
  const { tr } = useLocale();
  const goalInputId = useId();
  const [goalText, setGoalText] = useState(
    'Find the top genetically validated target in ulcerative colitis using OpenTargets, fetch its approved small-molecule drugs from ChEMBL, and audit their QED druglikeness & PAINS alerts with RDKit.'
  );
  const [running, setRunning] = useState(false);
  const [liveSteps, setLiveSteps] = useState<AutoResearchStepLog[]>([]);
  const [sessionResult, setSessionResult] = useState<AutoResearchSessionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(null);

  const byokSettings = loadByokSettings();
  const hasByokKey = Boolean(byokSettings.apiKey.trim());

  const startPreset = async (
    presetId: 'nsclc-drug-repurposing' | 'glucocorticoid-transcriptome' | 'dna-agnc-biophysics'
  ) => {
    setRunning(true);
    setErrorMsg(null);
    setLiveSteps([]);
    setSessionResult(null);
    try {
      const res = await runPresetLiveBenchmarkMission(presetId, (steps) => {
        setLiveSteps(steps);
        onRunPersisted?.();
      });
      setSessionResult(res);
      setExpandedStepIdx(res.steps.length - 1);
      onRunPersisted?.();
      onToast(
        tr(
          'Completed live multi-agent block discovery run!',
          '실시간 멀티 에이전트 블록 연구 실행이 완료되었습니다!'
        )
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : tr('Benchmark mission failed.', '벤치마크 미션 실행에 실패했습니다.')
      );
    } finally {
      setRunning(false);
    }
  };

  const startCustomGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    const settings = loadByokSettings();
    if (!settings.apiKey.trim()) {
      setErrorMsg(
        tr(
          'To run custom open-ended objectives, add your Gemini, OpenAI, or Anthropic API key in Settings—or launch one of the 3 Live Zero-Key Benchmark Missions above.',
          '자유 주제 자율 연구를 실행하려면 설정에서 Gemini·OpenAI·Anthropic API 키를 입력하거나, 위의 API 키 불필요 실시간 벤치마크 미션 3종 중 하나를 실행하세요.'
        )
      );
      return;
    }
    setRunning(true);
    setErrorMsg(null);
    setLiveSteps([]);
    setSessionResult(null);
    try {
      const res = await runByokAutoResearchLoop(goalText, settings, (steps) => {
        setLiveSteps(steps);
        onRunPersisted?.();
      });
      setSessionResult(res);
      setExpandedStepIdx(res.steps.length - 1);
      onRunPersisted?.();
      onToast(
        tr(
          'Completed BYOK Auto-Research session!',
          'BYOK 자율 연구 세션이 완료되었습니다!'
        )
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : tr('Auto-Research failed.', '자율 연구 실행에 실패했습니다.')
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mas-page-content">
      {/* Authentic Scientific Block-DAG Workbench Header */}
      <section className="ar-workbench-hero">
        <div className="ar-hero-top">
          <div className="ar-hero-copy">
            <div className="ar-title-row">
              <h1 className="ar-title">
                {tr('Block-Verified Auto-Research', '검증 블록 기반 자율 연구 (Auto-Research)')}
              </h1>
              <span className={`ar-status-pill ${hasByokKey ? 'is-ready' : 'is-guest'}`}>
                {hasByokKey
                  ? tr(
                      `BYOK Active · ${byokSettings.provider.toUpperCase()}`,
                      `BYOK 연결됨 · ${byokSettings.provider.toUpperCase()}`
                    )
                  : tr('Zero-Key Benchmark Mode', '무설치 벤치마크 모드')}
              </span>
            </div>
            <p className="ar-lead">
              {tr(
                'Set a biological objective. Multi-agents chain strictly typed, regression-tested open-source blocks with zero arbitrary code execution—and an Independent Auditor verifies statistical cutoffs at every step.',
                '생물학적 연구 목표를 입력하면 멀티 에이전트가 임의 코드 작성 없이 입출력이 검증된 오픈소스 바이오 블록만 안전하게 체이닝하며, 독립 감사 에이전트(Independent Auditor)가 매 단계의 통계 임계치를 검증합니다.'
              )}
            </p>
          </div>

          <div className="ar-hero-actions">
            <button
              type="button"
              disabled={running}
              className="mas-get-pill solid-blue"
              onClick={() => void startPreset('nsclc-drug-repurposing')}
            >
              <Play size={13} fill="#ffffff" aria-hidden="true" />
              <span>
                {tr(
                  'Run NSCLC 4-Block Demo (No Key)',
                  '폐암(NSCLC) 4-블록 데모 실행 (키 불필요)'
                )}
              </span>
            </button>
            <button
              type="button"
              className="mas-get-pill"
              onClick={onOpenSettings}
            >
              <KeyRound size={14} aria-hidden="true" />
              <span>{tr('Configure BYOK Key', 'BYOK API 키 설정')}</span>
            </button>
          </div>
        </div>

        {/* Visible Registry of Composable Verified Blocks */}
        <div className="ar-blocks-strip">
          <span className="ar-blocks-label">
            {tr(
              `${apps.length} Composable Verified Blocks:`,
              `조합 가능한 검증 블록 (${apps.length}종):`
            )}
          </span>
          <div className="ar-blocks-list">
            {apps.map((a) => (
              <button
                key={a.id}
                type="button"
                className="ar-block-chip"
                onClick={() => onOpenApp(a.id)}
              >
                <BioAppIcon
                  glyph={a.iconGlyph}
                  gradient={a.iconGradient}
                  accent={a.iconAccent}
                  size={22}
                />
                <span>{a.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Live Zero-Key Benchmark Missions */}
      <section className="mas-section">
        <div className="mas-section-header">
          <h2 className="mas-section-title">
            {tr(
              'Live Multi-Agent Benchmark Missions (No API Key Required)',
              '즉시 실행 가능한 멀티 에이전트 벤치마크 미션 (API 키 불필요)'
            )}
          </h2>
        </div>

        <div className="ar-missions-grid">
          <div className="ar-mission-card">
            <div>
              <h3 className="ar-mission-title">
                NSCLC Target → ChEMBL → RDKit ADMET → AlphaFold 3D
              </h3>
              <p className="ar-mission-desc">
                {tr(
                  'Discovers top NSCLC causal gene in OpenTargets, retrieves clinical inhibitors from ChEMBL, filters PAINS alerts in RDKit C++, and inspects 3D pocket pLDDT.',
                  'OpenTargets에서 비소세포폐암 핵심 타겟을 발굴하고 ChEMBL 임상 약물 조회 → RDKit C++ 독성(PAINS) 스크리닝 → AlphaFold 3D 구조 검증까지 4단계를 연속 실행합니다.'
                )}
              </p>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              onClick={() => void startPreset('nsclc-drug-repurposing')}
            >
              {tr('Run 4-Block Mission', '4-블록 미션 실행')}
            </button>
          </div>

          <div className="ar-mission-card">
            <div>
              <h3 className="ar-mission-title">
                NucleoSpec DNA–AgNC ESI-MS Magic-Number Audit
              </h3>
              <p className="ar-mission-desc">
                {tr(
                  'Runs Copp Lab DNASilverAnalyzer on GG208 ESI-MS data, resolves (DNA)₂Ag₁₇ (N₀=6e⁻), and filters ≥80% isotope envelope matches.',
                  'Copp Lab DNASilverAnalyzer 엔진으로 GG208 질량스펙트럼을 정밀 배정하고 (DNA)₂Ag₁₇ (N₀=6e⁻) 등 동위원소 일치율 80% 이상 후보만 선별합니다.'
                )}
              </p>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              onClick={() => void startPreset('dna-agnc-biophysics')}
            >
              {tr('Run Biophysics Mission', '생물물리 미션 실행')}
            </button>
          </div>

          <div className="ar-mission-card">
            <div>
              <h3 className="ar-mission-title">
                Airway RNA-seq PyDESeq2 → Enrichr KEGG Cascades
              </h3>
              <p className="ar-mission-desc">
                {tr(
                  'Normalizes glucocorticoid RNA-seq counts, verifies BH-FDR DEGs, and pipes up-regulated genes directly into live Enrichr KEGG pathway enrichment.',
                  '덱사메타손 기도 세포 RNA-seq 카운트를 정규화해 유의 유전자(DEG)를 검증하고, 발현 증가 유전자군을 실시간 Enrichr KEGG 경로 분석으로 연결합니다.'
                )}
              </p>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              onClick={() => void startPreset('glucocorticoid-transcriptome')}
            >
              {tr('Run RNA-seq Mission', '전사체 미션 실행')}
            </button>
          </div>
        </div>
      </section>

      {/* Custom BYOK Goal Prompt Box */}
      <section className="mas-section">
        <div className="mas-section-divider" />
        <form onSubmit={startCustomGoal} className="ar-custom-form">
          <div className="ar-custom-head">
            <label htmlFor={goalInputId} className="ar-custom-label">
              <Sparkles size={17} aria-hidden="true" />
              <span>
                {tr(
                  'Custom Research Objective (BYOK Multi-Agent Orchestrator)',
                  '자유 연구 목표 입력 (BYOK 멀티 에이전트 오케스트레이터)'
                )}
              </span>
            </label>
            <button
              type="button"
              className="mas-link-btn"
              onClick={onOpenSettings}
            >
              <KeyRound size={14} aria-hidden="true" />
              <span>
                {tr(
                  'Set Gemini / OpenAI / Anthropic Key',
                  'Gemini / OpenAI / Anthropic 키 설정'
                )}
              </span>
            </button>
          </div>

          <textarea
            id={goalInputId}
            rows={3}
            className="studio-textarea ar-goal-textarea"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !running) {
                void startCustomGoal(e);
              }
            }}
            placeholder={tr(
              'Describe your biological hypothesis, disease target, sequence, or screening objective…',
              '검증하고 싶은 생물학적 가설, 질병 타겟, 유전자 서열 또는 약물 스크리닝 목표를 입력하세요…'
            )}
          />

          <div className="ar-custom-foot">
            <span className="ar-guardrail-note">
              {tr(
                'Guardrail: Agents invoke ONLY verified OpenBioApp manifests. Missing tools auto-queue for the Nightly Factory.',
                '안전장치: 에이전트는 검증된 OpenBioApp 블록만 호출하며, 부족한 도구는 야간 자동 변환 큐에 등록합니다.'
              )}
            </span>
            <button
              type="submit"
              disabled={running}
              className="mas-get-pill solid-blue"
            >
              <Play size={13} fill="#ffffff" aria-hidden="true" />
              <span>
                {running
                  ? tr('Executing Multi-Agent Loop…', '멀티 에이전트 실행 중…')
                  : tr('Launch Autonomous Research', '자율 연구 시작')}
              </span>
            </button>
          </div>
        </form>
      </section>

      {errorMsg && (
        <div className="ar-warning-banner" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Live Multi-Agent Execution Board */}
      {liveSteps.length > 0 && (
        <section className="mas-section">
          <h2 className="mas-section-title ar-steps-heading">
            {tr(
              `Multi-Agent Execution & Audit Trail (${liveSteps.length} Steps)`,
              `멀티 에이전트 실행 및 독립 감사 기록 (${liveSteps.length}단계)`
            )}
          </h2>

          <div className="ar-steps-list">
            {liveSteps.map((step, idx) => {
              const isExpanded = expandedStepIdx === idx;
              const roleIcon =
                step.agentRole === 'Independent Auditor' ? (
                  <ShieldCheck size={18} className="ar-role-icon auditor" aria-hidden="true" />
                ) : step.agentRole === 'Block Executor' ? (
                  <Cpu size={18} className="ar-role-icon executor" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={18} className="ar-role-icon planner" aria-hidden="true" />
                );

              return (
                <div key={idx} className="ar-step-card">
                  {step.runResult ? (
                    <button
                      type="button"
                      className="ar-step-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                    >
                      <span className="ar-step-main">
                        {roleIcon}
                        <span className="ar-step-text">
                          <span className="ar-step-title-line">
                            <span className="ar-role-badge">{step.agentRole}</span>
                            <strong>{step.title}</strong>
                          </span>
                          <span className="ar-step-detail">{step.detail}</span>
                        </span>
                      </span>
                      <span className="ar-step-cta">
                        <span>
                          {isExpanded
                            ? tr('Hide Artifact', '결과 접기')
                            : tr('Inspect Artifact', '결과 확인')}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`studio-guide-chevron ${isExpanded ? 'open' : ''}`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  ) : (
                    <div className="ar-step-static">
                      {roleIcon}
                      <div className="ar-step-text">
                        <div className="ar-step-title-line">
                          <span className="ar-role-badge">{step.agentRole}</span>
                          <strong>{step.title}</strong>
                        </div>
                        <div className="ar-step-detail">{step.detail}</div>
                      </div>
                    </div>
                  )}

                  {isExpanded && step.runResult && (
                    <div className="ar-step-artifacts">
                      {step.runResult.structure3d && (
                        <Molecule3DViewer structure={step.runResult.structure3d} />
                      )}
                      {step.runResult.plot && (
                        <ScientificPlotViewer plot={step.runResult.plot} />
                      )}
                      {step.runResult.table && (
                        <InteractiveDataTableViewer rows={step.runResult.table} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {sessionResult && (
        <section className="ar-report-card">
          <MarkdownReportViewer markdown={sessionResult.finalReportMarkdown} />
        </section>
      )}
    </div>
  );
};
