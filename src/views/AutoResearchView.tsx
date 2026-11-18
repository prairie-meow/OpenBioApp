import React, { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  KeyRound,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
  const [goalText, setGoalText] = useState(
    'Find the top genetically validated target in ulcerative colitis using OpenTargets, fetch its approved small-molecule drugs from ChEMBL, and audit their QED druglikeness & PAINS alerts with RDKit.'
  );
  const [running, setRunning] = useState(false);
  const [liveSteps, setLiveSteps] = useState<AutoResearchStepLog[]>([]);
  const [sessionResult, setSessionResult] = useState<AutoResearchSessionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(null);

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
      onToast('Completed live multi-agent block discovery run!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Benchmark mission failed.');
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
        'To run custom open-ended goals, enter your own Gemini, OpenAI, or Anthropic API key in Settings (⌘,), OR click one of the 3 Live Zero-Key Benchmark Missions below!'
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
      onToast('Completed BYOK Auto-Research session!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Auto-Research failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mas-page-content no-top-pad">
      {/* T5 Full-Bleed Dark Neon Suite Hero (04-arcade-top.png fidelity) */}
      <div className="t5-arcade-hero">
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          {apps.slice(0, 5).map((a, i) => (
            <div
              key={a.id}
              onClick={() => onOpenApp(a.id)}
              style={{
                transform: `translateY(${i % 2 === 0 ? 0 : -10}px)`,
                cursor: 'pointer',
              }}
            >
              <BioAppIcon
                glyph={a.iconGlyph}
                gradient={a.iconGradient}
                accent={a.iconAccent}
                size={i === 2 ? 76 : 60}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            textShadow:
              '0 0 24px rgba(94, 242, 214, 0.75), 0 0 54px rgba(56, 189, 248, 0.55)',
            marginBottom: 10,
          }}
        >
          OpenBioApp Auto-Research
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            opacity: 0.9,
            marginBottom: 6,
          }}
        >
          ZERO ARBITRARY CODE · 100% VERIFIED BLOCK COMPOSITION · INDEPENDENT AUDITOR
        </div>
        <h1
          style={{
            margin: '0 0 18px',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.018em',
            maxWidth: 740,
            lineHeight: 1.28,
          }}
        >
          Set a biological objective. Multi-agents compose verified open-source blocks until your goal is proven—and auto-queue missing tools for tonight’s Factory.
        </h1>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={running}
            className="mas-get-pill solid-blue"
            style={{ height: 38, padding: '0 22px', fontSize: 13.5 }}
            onClick={() => startPreset('nsclc-drug-repurposing')}
          >
            Run Live NSCLC Target→Drug Mission (Zero Key)
          </button>
          <button
            type="button"
            className="mas-get-pill white-on-dark"
            style={{ height: 38, padding: '0 18px', fontSize: 13 }}
            onClick={onOpenSettings}
          >
            Configure BYOK API Key (⌘,)
          </button>
        </div>
      </div>

      {/* 3 Live Zero-Key Benchmark Cards (T6 / #F5F5F7 Inset Cards) */}
      <section className="mas-section" style={{ marginTop: 26 }}>
        <div className="mas-section-header">
          <h2 className="mas-section-title">
            Instant Live Multi-Agent Benchmark Missions (No API Key Required)
          </h2>
          <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            Executes real OpenTargets, ChEMBL, RDKit, NucleoSpec &amp; AlphaFold blocks live
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              background: '#f5f5f7',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div className="t3-eyebrow">4-BLOCK TRANSLATIONAL CHAIN</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                NSCLC Target → ChEMBL → RDKit ADMET → AlphaFold 3D
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.45 }}>
                Discovers top NSCLC causal gene, retrieves clinical inhibitors, filters PAINS toxicophores via RDKit C++, and verifies 3D pocket pLDDT.
              </div>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              style={{ alignSelf: 'flex-start', height: 30, padding: '0 14px', background: '#ffffff' }}
              onClick={() => startPreset('nsclc-drug-repurposing')}
            >
              Run Live Mission
            </button>
          </div>

          <div
            style={{
              background: '#f5f5f7',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div className="t3-eyebrow">COPP LAB BIOPHYSICS CHAIN</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                NucleoSpec DNA–AgNC ESI-MS Magic-Number Audit
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.45 }}>
                Runs headless DNASilverAnalyzer on GG208 ESI-MS data, assigns (DNA)₂Ag₁₇ (N₀=6e⁻), and filters ≥80% isotope envelope matches.
              </div>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              style={{ alignSelf: 'flex-start', height: 30, padding: '0 14px', background: '#ffffff' }}
              onClick={() => startPreset('dna-agnc-biophysics')}
            >
              Run Live Mission
            </button>
          </div>

          <div
            style={{
              background: '#f5f5f7',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div className="t3-eyebrow">TRANSCRIPTOMICS TO PATHWAYS</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                Airway RNA-seq PyDESeq2 → Enrichr KEGG Cascades
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.45 }}>
                Normalizes glucocorticoid RNA-seq counts, verifies BH-FDR DEGs, and pipes top induced genes into live Enrichr KEGG analysis.
              </div>
            </div>
            <button
              type="button"
              disabled={running}
              className="mas-get-pill"
              style={{ alignSelf: 'flex-start', height: 30, padding: '0 14px', background: '#ffffff' }}
              onClick={() => startPreset('glucocorticoid-transcriptome')}
            >
              Run Live Mission
            </button>
          </div>
        </div>
      </section>

      {/* Custom BYOK Goal Prompt Box */}
      <section className="mas-section" style={{ marginTop: 28 }}>
        <div className="mas-section-divider" />
        <form
          onSubmit={startCustomGoal}
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: '20px 22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="#007aff" />
              <span>Custom Research Objective (BYOK Multi-Agent Orchestrator)</span>
            </div>
            <button
              type="button"
              className="mas-link-btn"
              style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={onOpenSettings}
            >
              <KeyRound size={13} />
              <span>Set Gemini / OpenAI / Anthropic Key</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Describe your biological hypothesis, disease target, sequence, or screening objective…"
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid #d4d4d8',
              padding: '10px 12px',
              fontSize: 13.5,
              lineHeight: 1.45,
              background: '#ffffff',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Guardrail: Agents invoke ONLY verified OpenBioApp manifests. Missing capabilities auto-submit to the Nightly Repo-to-App Factory.
            </span>
            <button
              type="submit"
              disabled={running}
              className="mas-get-pill solid-blue"
              style={{ height: 34, padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Play size={13} fill="#ffffff" />
              <span>{running ? 'Executing Multi-Agent Loop…' : 'Launch Autonomous Research'}</span>
            </button>
          </div>
        </form>
      </section>

      {errorMsg && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(255,149,0,0.12)',
            border: '1px solid rgba(255,149,0,0.3)',
            color: '#9a4400',
            fontSize: 13,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Live Multi-Agent Execution Board */}
      {liveSteps.length > 0 && (
        <section className="mas-section" style={{ marginTop: 26 }}>
          <h2 className="mas-section-title" style={{ marginBottom: 12 }}>
            Multi-Agent Execution &amp; Independent Audit Trail ({liveSteps.length} Steps)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {liveSteps.map((step, idx) => {
              const isExpanded = expandedStepIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#f5f5f7',
                    borderRadius: 12,
                    padding: '14px 18px',
                    border: '1px solid var(--divider-hairline)',
                  }}
                >
                  <div
                    onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: step.runResult ? 'pointer' : 'default',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {step.agentRole === 'Independent Auditor' ? (
                        <ShieldCheck size={18} color="#34c759" />
                      ) : step.agentRole === 'Block Executor' ? (
                        <Cpu size={18} color="#007aff" />
                      ) : (
                        <CheckCircle2 size={18} color="#5856d6" />
                      )}
                      <div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: '#007aff',
                            marginRight: 8,
                          }}
                        >
                          {step.agentRole}
                        </span>
                        <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                          {step.title}
                        </strong>
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>

                    {step.runResult && (
                      <span className="mas-link-btn" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {isExpanded ? 'Hide Artifact' : 'Inspect Artifact'}
                      </span>
                    )}
                  </div>

                  {isExpanded && step.runResult && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
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

      {/* Final Synthesized Auditable Report */}
      {sessionResult && (
        <section
          style={{
            marginTop: 22,
            background: '#ffffff',
            borderRadius: 14,
            border: '1.5px solid #007aff',
            padding: '20px 24px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#007aff', textTransform: 'uppercase', marginBottom: 8 }}>
            AUDITED REPRODUCIBLE DISCOVERY REPORT
          </div>
          <MarkdownReportViewer markdown={sessionResult.finalReportMarkdown} />
        </section>
      )}
    </div>
  );
};
