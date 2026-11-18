import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  GitBranch,
  HelpCircle,
  Play,
  ShieldCheck,
  Sparkles,
  UserX,
  X,
} from 'lucide-react';
import { BioApp } from '../types/store';
import { BioAppIcon } from '../components/BioArtwork';
import {
  GetActionButton,
  InstallStateMap,
} from '../components/StorePrimitives';
import {
  BIO_APP_MANIFESTS,
  BioDataType,
  findCompatibleDownstreamApps,
} from '../lib/schema/bioAppSchema';
import { BioAppExecutionStudio } from '../components/studio/BioAppExecutionStudio';

interface AppDetailViewProps {
  app: BioApp;
  allApps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onOpenCategory: (catId: BioApp['categoryId']) => void;
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

export const AppDetailView: React.FC<AppDetailViewProps> = ({
  app,
  allApps,
  installStates,
  onInstall,
  onOpenApp,
  onOpenCategory,
  incomingChainPayload,
  onChainToApp,
  onRunPersisted,
  onToast,
}) => {
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [sampleTrigger, setSampleTrigger] = useState(0);

  const manifest = BIO_APP_MANIFESTS[app.id];
  const latestRelease = app.releases[0];

  const downstreamCompatible = manifest
    ? findCompatibleDownstreamApps(manifest.outputBioTypes).filter((m) => m.id !== app.id)
    : [];
  const downstreamApps = downstreamCompatible
    .map((m) => allApps.find((a) => a.id === m.id))
    .filter((x): x is BioApp => Boolean(x));

  const relatedApps = allApps
    .filter((a) => a.id !== app.id && !downstreamApps.some((d) => d.id === a.id))
    .slice(0, 6);

  const repoUrl = manifest?.sourceRepo || app.websiteUrl || 'https://github.com/prairie-meow/OpenBioApp';
  const doiStr = manifest?.doi || app.doi;
  const sanitizers = manifest
    ? Array.from(new Set(manifest.fields.flatMap((f) => f.autoSanitizers || [])))
    : [];

  const tierShort =
    manifest?.runtime.tier === 'cloud-run-cpu-worker'
      ? 'Cloud CPU'
      : manifest?.runtime.tier === 'public-bio-api'
      ? 'Live API'
      : 'Browser';

  const handleRunLiveSampleFromHero = () => {
    setSampleTrigger((n) => n + 1);
    document
      .getElementById('openbioapp-live-studio')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* WHITE MAIN PRODUCT BODY */}
      <div className="mas-page-content subpage-offset" style={{ paddingBottom: 32 }}>
        {/* 1. HERO HEADER BLOCK */}
        <div className="detail-hero">
          <BioAppIcon
            glyph={app.iconGlyph}
            gradient={app.iconGradient}
            accent={app.iconAccent}
            size={118}
          />
          <div className="detail-hero-meta">
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.018em',
                  color: 'var(--text-primary)',
                }}
              >
                {app.name}
              </h1>
              <div
                style={{
                  fontSize: 15,
                  color: 'var(--text-tertiary)',
                  marginTop: 3,
                }}
              >
                {app.subtitle}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="mas-get-pill solid-blue"
                style={{
                  height: 32,
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={handleRunLiveSampleFromHero}
              >
                <Play size={13} fill="#ffffff" /> Run Live Sample
              </button>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mas-get-pill"
                style={{
                  height: 32,
                  padding: '0 14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                Upstream Source <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* 2. 6-COLUMN VERIFIED METADATA SPEC RIBBON */}
        <div className="detail-spec-ribbon">
          <div className="detail-spec-cell">
            <span className="detail-spec-label">STATUS</span>
            <span className="detail-spec-val" style={{ color: '#248a3d', fontSize: 16 }}>
              VERIFIED
            </span>
            <span className="detail-spec-sub">Zero-Mock Live</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">SPDX LICENSE</span>
            <span className="detail-spec-val" style={{ fontSize: 16 }}>
              {manifest?.license.spdx || app.ageOrTier}
            </span>
            <span className="detail-spec-sub">{app.ageSubtitle}</span>
          </div>

          <div
            className="detail-spec-cell"
            style={{ cursor: 'pointer' }}
            onClick={() => onOpenCategory(app.categoryId)}
          >
            <span className="detail-spec-label">DOMAIN</span>
            <span className="detail-spec-val" style={{ fontSize: 16 }}>
              {app.languageCode}
            </span>
            <span className="detail-spec-sub">{app.categoryLabel}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">UPSTREAM LAB</span>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                border: '1.6px solid var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              OSS
            </span>
            <span
              className="detail-spec-sub"
              style={{
                maxWidth: 140,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {app.developer}
            </span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">EXECUTION TIER</span>
            <span className="detail-spec-val" style={{ fontSize: 15 }}>
              {tierShort}
            </span>
            <span className="detail-spec-sub">{app.languageLabel}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">BIO-I/O PORTS</span>
            <span className="detail-spec-val" style={{ fontSize: 16 }}>
              {manifest ? `${manifest.inputBioTypes.length}→${manifest.outputBioTypes.length}` : '1→1'}
            </span>
            <span className="detail-spec-sub">Typed Chaining</span>
          </div>
        </div>

        {/* 3. EMBEDDED LIVE EXECUTION STUDIO */}
        <div id="openbioapp-live-studio">
          <BioAppExecutionStudio
            appId={app.id}
            autoRunSampleTrigger={sampleTrigger}
            incomingChainPayload={incomingChainPayload}
            onChainToApp={onChainToApp}
            onRunPersisted={onRunPersisted}
            onToast={onToast}
          />
        </div>

        {/* 4. DESCRIPTION + REAL UPSTREAM LINKS */}
        <div
          style={{
            borderTop: '1px solid var(--divider-hairline)',
            marginTop: 26,
            paddingTop: 18,
            display: 'grid',
            gridTemplateColumns: '1fr 220px',
            gap: 32,
          }}
        >
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-primary)', userSelect: 'text' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {descExpanded || app.description.length <= 320
                ? app.description
                : `${app.description.slice(0, 320)}… `}
              {!descExpanded && app.description.length > 320 && (
                <button
                  type="button"
                  className="mas-link-btn"
                  style={{ fontSize: 13.5 }}
                  onClick={() => setDescExpanded(true)}
                >
                  more
                </button>
              )}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 9,
              fontSize: 13,
            }}
          >
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mas-link-btn"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              Upstream Repository <GitBranch size={14} />
            </a>
            {doiStr && (
              <a
                href={`https://doi.org/${doiStr}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                DOI: {doiStr} <FileText size={14} />
              </a>
            )}
            <a
              href="https://github.com/prairie-meow/OpenBioApp/issues"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              Report Sanitizer / Issue <HelpCircle size={14} />
            </a>
          </div>
        </div>

        {/* 5. VERIFIED BIOAPP.YAML I/O CONTRACT & COMPATIBLE CHAINING GRAPH */}
        {manifest && (
          <section className="mas-section">
            <div className="mas-section-divider" />
            <div className="mas-section-header">
              <h2 className="mas-section-title">Declared Bio-Type I/O Contract (`apps/{app.id}/bioapp.yaml`)</h2>
            </div>

            <div
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Accepted Input Bio-Types
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {manifest.inputBioTypes.map((t) => (
                    <code
                      key={t}
                      style={{
                        fontSize: 12,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid var(--divider-hairline)',
                      }}
                    >
                      {t}
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Emitted Output Bio-Types
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {manifest.outputBioTypes.map((t) => (
                    <code
                      key={t}
                      style={{
                        fontSize: 12,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid var(--divider-hairline)',
                        color: '#007aff',
                      }}
                    >
                      {t}
                    </code>
                  ))}
                </div>
              </div>

              {sanitizers.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Active Front-Door Sanitizers
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sanitizers.map((s) => (
                      <code
                        key={s}
                        style={{
                          fontSize: 12,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: '#ffffff',
                          border: '1px solid var(--divider-hairline)',
                        }}
                      >
                        {s}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. WHAT'S NEW */}
        {latestRelease && (
          <section className="mas-section">
            <div className="mas-section-divider" />
            <div className="mas-section-header">
              <h2 className="mas-section-title">What’s New</h2>
              <button
                type="button"
                className="mas-link-btn"
                onClick={() => setShowVersionModal(true)}
              >
                Version History
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px',
                gap: 24,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  lineHeight: 1.48,
                  whiteSpace: 'pre-line',
                }}
              >
                {notesExpanded ? latestRelease.notes : latestRelease.notes.slice(0, 190)}
                {!notesExpanded && latestRelease.notes.length > 190 && (
                  <>
                    …{' '}
                    <button
                      type="button"
                      className="mas-link-btn"
                      onClick={() => setNotesExpanded(true)}
                    >
                      more
                    </button>
                  </>
                )}
              </p>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                }}
              >
                <div>{latestRelease.date}</div>
                <div>Version {latestRelease.version}</div>
              </div>
            </div>
          </section>
        )}

        {/* 7. APP PRIVACY & DATA GOVERNANCE */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">Data Governance &amp; Provenance</h2>
          </div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            Upstream author: <strong>{app.developer}</strong>. Hosted execution in OpenBioApp follows strict stateless processing and academic license attribution.
          </p>

          <div className="detail-privacy-grid">
            {app.privacyCards.map((card, idx) => (
              <div key={idx} className="detail-privacy-card">
                <div style={{ color: 'var(--accent-blue)', marginBottom: 10 }}>
                  {card.type === 'not-collected' ? (
                    <ShieldCheck size={30} strokeWidth={1.8} />
                  ) : card.type === 'local-compute' ? (
                    <Sparkles size={30} strokeWidth={1.8} />
                  ) : (
                    <UserX size={30} strokeWidth={1.8} />
                  )}
                </div>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {card.title}
                </strong>
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.38,
                    marginBottom: 14,
                  }}
                >
                  {card.subtitle}
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '8px 22px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {card.items.map((it) => (
                    <span key={it}>✓ {it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. TECHNICAL INFORMATION GRID */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
            Manifest &amp; Upstream Information
          </h2>
          <div className="detail-info-grid">
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Upstream Lab / Maintainer</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.developer}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Manifest Path</div>
              <div style={{ fontSize: 13, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                apps/{app.id}/bioapp.yaml
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Domain</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.categoryLabel}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Execution Environment</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.compatibility}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Scientific Engine</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.languageLabel}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>SPDX License</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>
                {manifest?.license.badgeLabel || `${app.ageOrTier} (${app.ageSubtitle})`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Primary Citation</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>
                {manifest?.citation || doiStr || 'OpenBioApp Verified'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Copyright</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.copyright}</div>
            </div>
          </div>
        </section>
      </div>

      {/* 9. #F5F5F7 FULL-BLEED FOOTER ZONE: COMPATIBLE DOWNSTREAM BLOCKS */}
      <div className="detail-footer-bleed">
        <div style={{ maxWidth: 1332, margin: '0 auto' }}>
          {downstreamApps.length > 0 && (
            <>
              <div className="mas-section-header">
                <h2 className="mas-section-title">
                  Compatible Downstream Blocks ({downstreamApps.length})
                </h2>
              </div>
              <div className="t8-grid" style={{ marginBottom: 32 }}>
                {downstreamApps.slice(0, 4).map((other) => (
                  <div
                    key={other.id}
                    className="t8-lockup"
                    onClick={() => onOpenApp(other.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <BioAppIcon
                      glyph={other.iconGlyph}
                      gradient={other.iconGradient}
                      accent={other.iconAccent}
                      size={74}
                    />
                    <div className="t8-meta">
                      <div>
                        <div className="t7-name" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <ArrowRight size={13} color="#007aff" /> {other.name}
                        </div>
                        <div className="t7-sub">{other.subtitle}</div>
                      </div>
                      <GetActionButton
                        app={other}
                        installState={installStates[other.id]}
                        onTrigger={onInstall}
                        inlineNote
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">More Verified Studios in OpenBioApp</h2>
          </div>
          <div className="t7-grid flow-row">
            {relatedApps.map((rel) => (
              <div
                key={rel.id}
                className="t7-lockup"
                onClick={() => onOpenApp(rel.id)}
                role="button"
                tabIndex={0}
              >
                <BioAppIcon
                  glyph={rel.iconGlyph}
                  gradient={rel.iconGradient}
                  accent={rel.iconAccent}
                  size={54}
                />
                <div className="t7-meta">
                  <span className="t7-name">{rel.name}</span>
                  <span className="t7-sub">{rel.subtitle}</span>
                </div>
                <GetActionButton
                  app={rel}
                  installState={installStates[rel.id]}
                  onTrigger={onInstall}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VERSION HISTORY MODAL */}
      {showVersionModal && (
        <div
          onClick={() => setShowVersionModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxWidth: '90vw',
              background: '#ffffff',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 19 }}>Version History</h3>
              <button
                type="button"
                className="mas-circle-nav-btn"
                onClick={() => setShowVersionModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            {app.releases.map((rel) => (
              <div
                key={rel.version}
                style={{
                  borderTop: '1px solid var(--divider-hairline)',
                  padding: '14px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                >
                  <span>Version {rel.version}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
                    {rel.date}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.45,
                  }}
                >
                  {rel.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
