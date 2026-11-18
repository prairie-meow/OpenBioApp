import React, { useState } from 'react';
import {
  ChevronDown,
  Compass,
  FileText,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  UserX,
  X,
} from 'lucide-react';
import { AppReview, BioApp } from '../types/store';
import { AppScreenshotArt, BioAppIcon } from '../components/BioArtwork';
import {
  CarouselSection,
  GetActionButton,
  InstallStateMap,
  MonochromeStars,
} from '../components/StorePrimitives';
import { BioDataType } from '../lib/schema/bioAppSchema';
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
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [localReviews, setLocalReviews] = useState<AppReview[]>(app.reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  const latestRelease = app.releases[0];
  const moreByDev = allApps.filter((a) => a.id !== app.id).slice(0, 2);
  const relatedApps = allApps
    .filter((a) => a.id !== app.id && (a.categoryId === app.categoryId || a.isArcade))
    .slice(0, 6);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewBody.trim()) return;
    const next: AppReview = {
      id: `rev-${Date.now()}`,
      title: reviewTitle.trim(),
      rating: 5,
      author: 'OpenBioApp Researcher',
      affiliation: 'Principal Investigator',
      date: 'Just now',
      body: reviewBody.trim(),
    };
    setLocalReviews([next, ...localReviews]);
    setReviewTitle('');
    setReviewBody('');
    setShowReviewForm(false);
    onToast('Peer review published to OpenBioApp.');
  };

  return (
    <div>
      {/* WHITE MAIN PRODUCT BODY */}
      <div className="mas-page-content subpage-offset" style={{ paddingBottom: 32 }}>
        {/* 1. HERO HEADER BLOCK (19-app-detail-top.png) */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <GetActionButton
                app={app}
                installState={installStates[app.id]}
                onTrigger={onInstall}
                variant="solid-blue"
                inlineNote
              />
            </div>
          </div>
        </div>

        {/* 2. 6-COLUMN METADATA SPEC RIBBON (19-app-detail-top.png) */}
        <div className="detail-spec-ribbon">
          <div className="detail-spec-cell">
            <span className="detail-spec-label">{app.ratingCount} RATINGS</span>
            <span className="detail-spec-val">{app.rating.toFixed(1)}</span>
            <MonochromeStars rating={app.rating} size={11} />
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">LICENSE / TIER</span>
            <span className="detail-spec-val">{app.ageOrTier}</span>
            <span className="detail-spec-sub">{app.ageSubtitle}</span>
          </div>

          <div
            className="detail-spec-cell"
            style={{ cursor: 'pointer' }}
            onClick={() => onOpenCategory(app.categoryId)}
          >
            <span className="detail-spec-label">CATEGORY</span>
            <span className="detail-spec-val">{app.chartRank || '#3'}</span>
            <span className="detail-spec-sub">{app.categoryLabel}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">DEVELOPER / LAB</span>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                border: '1.6px solid var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              LAB
            </span>
            <span
              className="detail-spec-sub"
              style={{
                maxWidth: 130,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {app.developer}
            </span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">RUNTIME</span>
            <span className="detail-spec-val">{app.languageCode}</span>
            <span className="detail-spec-sub">{app.languageLabel}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">SIZE</span>
            <span className="detail-spec-val">{app.sizeNumber}</span>
            <span className="detail-spec-sub">{app.sizeUnit}</span>
          </div>
        </div>

        {/* 2.5 EMBEDDED LIVE EXECUTION STUDIO (bioapp.yaml Dynamic Renderer + 5 Core Viewers) */}
        <div id="openbioapp-live-studio">
          <BioAppExecutionStudio
            appId={app.id}
            incomingChainPayload={incomingChainPayload}
            onChainToApp={onChainToApp}
            onRunPersisted={onRunPersisted}
            onToast={onToast}
          />
        </div>

        {/* 3. SCREENSHOTS CAROUSEL + COMPATIBILITY BAR */}
        <div style={{ marginTop: 6 }}>
          <CarouselSection stepPx={560}>
            {app.screenshotThemes.map((theme, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIdx(idx)}
                style={{
                  flex: '0 0 calc(48.5% - 10px)',
                  scrollSnapAlign: 'start',
                  aspectRatio: '16 / 10',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
                }}
              >
                <AppScreenshotArt
                  theme={theme}
                  appName={app.name}
                  accent={app.iconAccent}
                />
              </div>
            ))}
          </CarouselSection>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0 18px',
              color: 'var(--text-secondary)',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span>
              💻 &nbsp;Mac (Apple Silicon Metal/MLX)
              {app.isCloudContainer ? ', Linux Docker & SLURM GPU Cluster' : ''}
            </span>
            <ChevronDown size={15} />
          </div>
        </div>

        {/* 4. DESCRIPTION + RIGHT DEVELOPER LINKS (19-app-detail-top.png) */}
        <div
          style={{
            borderTop: '1px solid var(--divider-hairline)',
            paddingTop: 18,
            display: 'grid',
            gridTemplateColumns: '1fr 200px',
            gap: 32,
          }}
        >
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-primary)', userSelect: 'text' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {descExpanded ? app.description : `${app.description.slice(0, 275)}… `}
              {!descExpanded && (
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
              gap: 8,
              fontSize: 13.5,
            }}
          >
            <button
              type="button"
              className="mas-link-btn"
              onClick={() => onToast(`Developer Lab: ${app.developer}`)}
            >
              {app.developer}
            </button>
            <button
              type="button"
              onClick={() =>
                onToast(
                  `Opened documentation: ${app.websiteUrl || `https://openbio.org/${app.id}`}`
                )
              }
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
              }}
            >
              Website <Compass size={14} />
            </button>
            {app.doi && (
              <button
                type="button"
                onClick={() => onToast(`DOI Copied: https://doi.org/${app.doi}`)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                }}
              >
                Citation DOI <FileText size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onToast(`Opened GitHub Issues & Lab Support for ${app.name}`)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
              }}
            >
              Support <HelpCircle size={14} />
            </button>
          </div>
        </div>

        {/* 5. RATINGS & REVIEWS (20-app-detail-mid.png) */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">Ratings &amp; Reviews</h2>
            <button
              type="button"
              className="mas-link-btn"
              onClick={() => setShowReviewForm((v) => !v)}
            >
              Write a Review
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 36,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#48484a',
                  lineHeight: 1,
                }}
              >
                {app.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>
                out of 5
              </span>
            </div>

            <div style={{ flex: 1, maxWidth: 520 }}>
              {[5, 4, 3, 2, 1].map((stars, i) => (
                <div
                  key={stars}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 12,
                  }}
                >
                  <div
                    style={{
                      width: 65,
                      textAlign: 'right',
                      fontSize: 8.5,
                      letterSpacing: 1,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {'★'.repeat(stars)}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background: '#e5e5ea',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${app.ratingHistogram[i]}%`,
                        height: '100%',
                        background: '#515154',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                }}
              >
                {app.ratingCount} Ratings
              </div>
            </div>
          </div>

          {showReviewForm && (
            <form
              onSubmit={submitReview}
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review headline (e.g., Validated on 10x Visium HD cohort)"
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid var(--divider-hairline)',
                  padding: '0 12px',
                  fontSize: 13,
                }}
              />
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="Share benchmark observations, memory footprint, or wet-lab reproducibility..."
                rows={3}
                style={{
                  borderRadius: 8,
                  border: '1px solid var(--divider-hairline)',
                  padding: 10,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="mas-get-pill"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="mas-get-pill solid-blue">
                  Submit
                </button>
              </div>
            </form>
          )}

          {localReviews.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              {localReviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 12,
                    padding: '16px 18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>
                      {rev.title}
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {rev.date}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <MonochromeStars rating={rev.rating} size={11} />
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {rev.author} · {rev.affiliation}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.44,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {rev.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. WHAT'S NEW (20-app-detail-mid.png) */}
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
                {notesExpanded ? latestRelease.notes : latestRelease.notes.slice(0, 170)}
                {!notesExpanded && latestRelease.notes.length > 170 && (
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
                <div>{latestRelease.relativeDate}</div>
                <div>Version {latestRelease.version}</div>
              </div>
            </div>
          </section>
        )}

        {/* 7. APP PRIVACY NUTRITION LABELS (20-app-detail-mid.png) */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">App Privacy &amp; Data Governance</h2>
            <button
              type="button"
              className="mas-link-btn"
              onClick={() =>
                onToast(
                  `${app.name} Data Governance: Verified zero genomic sequence telemetry.`
                )
              }
            >
              See Details
            </button>
          </div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            The developer, <strong>{app.developer}</strong>, indicated that the app’s bio-data and
            sequence privacy practices follow the reproducibility standards below.
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

        {/* 8. ACCESSIBILITY & 3-COLUMN INFORMATION GRID (21-app-detail-bottom.png) */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <h2 className="mas-section-title" style={{ marginBottom: 8 }}>
            Reproducibility &amp; Benchmarks
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Signed ARM64 Mach-O &amp; OCI container digests verified against CASP15 / CAMEO / scIB
            open benchmarks.
          </p>
        </section>

        <section className="mas-section">
          <div className="mas-section-divider" />
          <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
            Information
          </h2>
          <div className="detail-info-grid">
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Developer / Lab</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.developer}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Size</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>
                {app.sizeNumber} {app.sizeUnit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Category</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.categoryLabel}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Compatibility</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.compatibility}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Runtime &amp; SDK</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.languageLabel}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>License Tier</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>
                {app.ageOrTier} ({app.ageSubtitle})
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Citation / DOI</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>
                {app.doi || 'Open Bio Registry Verified'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Copyright</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{app.copyright}</div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--divider-hairline)',
              width: '32%',
              paddingTop: 12,
            }}
          >
            <button
              type="button"
              className="mas-link-btn"
              onClick={() => onToast('Data Governance Charter: Zero sequence retention.')}
            >
              ✋ &nbsp;Data Governance &amp; Privacy Policy
            </button>
          </div>
        </section>
      </div>

      {/* 9. #F5F5F7 FULL-BLEED FOOTER ZONE (21-app-detail-bottom.png) */}
      <div className="detail-footer-bleed">
        <div style={{ maxWidth: 1332, margin: '0 auto' }}>
          <div className="mas-section-header">
            <h2 className="mas-section-title">Featured From Open Bio Ecosystem</h2>
          </div>
          <div className="t8-grid" style={{ marginBottom: 32 }}>
            {moreByDev.map((other) => (
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
                    <div className="t7-name">{other.name}</div>
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

          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">You Might Also Like</h2>
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

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(16px)',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 36,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(960px, 92vw)',
              borderRadius: 14,
              overflow: 'hidden',
              background: '#0f172a',
              boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ aspectRatio: '16 / 10' }}>
              <AppScreenshotArt
                theme={app.screenshotThemes[lightboxIdx]}
                appName={app.name}
                accent={app.iconAccent}
              />
            </div>
            <div
              style={{
                padding: '14px 20px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13.5,
                color: 'var(--text-primary)',
              }}
            >
              <span>{app.screenshotCaptions[lightboxIdx]}</span>
              <button
                type="button"
                className="mas-circle-nav-btn"
                onClick={() => setLightboxIdx(null)}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

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
