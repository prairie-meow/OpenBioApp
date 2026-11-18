import React, { useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  BioApp,
  CircularPromoItem,
  EditorialMediaItem,
  EditorialStory,
  ShowcaseBannerItem,
} from '../types/store';
import { BIO_APP_MANIFESTS } from '../lib/schema/bioAppSchema';
import {
  BioAppIcon,
  CircularMedallionArt,
  EditorialHeroArt,
  LiveMolecularCanvas,
} from './BioArtwork';

export interface InstallStateMap {
  [appId: string]: 'idle' | 'installing' | 'installed';
}

/* =========================================================
   VERIFIED MANIFEST I/O & RUNTIME PREVIEW CARD (ZERO MOCKS)
   ========================================================= */
export const VerifiedManifestPreviewCard: React.FC<{
  appId: string;
  accent?: string;
}> = ({ appId }) => {
  const manifest = BIO_APP_MANIFESTS[appId];
  if (!manifest) return null;

  const tierLabel =
    manifest.runtime.tier === 'cloud-run-cpu-worker'
      ? 'Cloud Run Python 3.12 CPU'
      : manifest.runtime.tier === 'public-bio-api'
      ? 'Live Public Bio-API'
      : '100% In-Browser Engine';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#5ef2d6',
            background: 'rgba(94, 242, 214, 0.12)',
            padding: '3px 8px',
            borderRadius: 6,
          }}
        >
          {tierLabel}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)' }}>
          v{manifest.version} · {manifest.license.spdx}
        </span>
      </div>

      <div style={{ margin: '10px 0' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>
          Typed Bio-I/O Contract
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
          {manifest.inputBioTypes.map((t) => (
            <span
              key={`in-${t}`}
              style={{
                background: 'rgba(56, 189, 248, 0.18)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#bae6fd',
                padding: '2px 7px',
                borderRadius: 5,
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
              }}
            >
              in:{t}
            </span>
          ))}
          <span style={{ color: '#94a3b8' }}>→</span>
          {manifest.outputBioTypes.map((t) => (
            <span
              key={`out-${t}`}
              style={{
                background: 'rgba(52, 211, 153, 0.18)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#a7f3d0',
                padding: '2px 7px',
                borderRadius: 5,
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
              }}
            >
              out:{t}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 8,
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ▶ {manifest.sampleLabel}
        </span>
        <span style={{ color: '#60a5fa', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
          Live Studio →
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   APPLE APP STORE PILL LAUNCH ACTION BUTTON (DIRECT STUDIO LAUNCH)
   ========================================================= */
export const GetActionButton: React.FC<{
  app: BioApp;
  installState?: 'idle' | 'installing' | 'installed';
  onTrigger: (appId: string, e: React.MouseEvent) => void;
  variant?: 'neutral' | 'solid-blue' | 'white-on-dark' | 'update';
  inlineNote?: boolean;
  hideNote?: boolean;
  labelOverride?: string;
}> = ({
  app,
  onTrigger,
  variant = 'neutral',
  inlineNote = false,
  hideNote = false,
  labelOverride,
}) => {
  const label = labelOverride || 'Launch';
  const cls =
    variant === 'solid-blue'
      ? 'mas-get-pill solid-blue'
      : variant === 'white-on-dark'
      ? 'mas-get-pill white-on-dark'
      : 'mas-get-pill';

  return (
    <div className={`mas-action-wrap ${inlineNote ? 'inline-note' : ''}`}>
      <button type="button" className={cls} onClick={(e) => onTrigger(app.id, e)}>
        {label}
      </button>
      {!hideNote && app.inAppNote && variant !== 'update' && (
        <span className="mas-micro-note">
          {inlineNote ? app.inAppNote : app.inAppNote.replace('\n', ' ')}
        </span>
      )}
    </div>
  );
};

/* =========================================================
   VERIFIED RUNTIME & LICENSE BADGE (REPLACES FAKE STAR COUNTS)
   ========================================================= */
export const VerifiedRuntimeBadge: React.FC<{ appId: string }> = ({ appId }) => {
  const manifest = BIO_APP_MANIFESTS[appId];
  if (!manifest) return null;
  const tierShort =
    manifest.runtime.tier === 'cloud-run-cpu-worker'
      ? 'Cloud Run CPU'
      : manifest.runtime.tier === 'public-bio-api'
      ? 'Live Bio-API'
      : 'Browser Local';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
      <span style={{ color: '#34c759', fontWeight: 700 }}>● Verified</span>
      <span>· {tierShort}</span>
      <span>· {manifest.license.spdx}</span>
    </span>
  );
};

/* =========================================================
   HORIZONTAL CAROUSEL WRAPPER
   ========================================================= */
export const CarouselSection: React.FC<{ children: React.ReactNode; stepPx?: number }> = ({
  children,
  stepPx = 680,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByDir = (dir: -1 | 1) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * stepPx, behavior: 'smooth' });
  };

  return (
    <div className="mas-carousel-outer">
      <button
        type="button"
        className="mas-carousel-paddle left"
        onClick={() => scrollByDir(-1)}
        aria-label="Backward"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="mas-carousel-track" ref={trackRef}>
        {children}
      </div>
      <button
        type="button"
        className="mas-carousel-paddle right"
        onClick={() => scrollByDir(1)}
        aria-label="Forward"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

/* =========================================================
   T1: WIDE HERO BANNER CAROUSEL
   ========================================================= */
export const WideHeroCarousel: React.FC<{
  stories: EditorialStory[];
  onOpenStory: (storyId: string) => void;
}> = ({ stories, onOpenStory }) => {
  return (
    <CarouselSection stepPx={960}>
      {stories.map((story) => (
        <div
          key={story.id}
          className="t1-hero-card"
          onClick={() => onOpenStory(story.id)}
          role="button"
          tabIndex={0}
        >
          <div className="t1-art-stage">
            <EditorialHeroArt styleType={story.illustrationStyle} bg={story.heroBg} />
          </div>
          <div className="t1-hero-copy">
            <span className="t1-eyebrow">{story.eyebrow}</span>
            <h2 className="t1-headline">{story.title}</h2>
            <p className="t1-subtitle">{story.subtitle}</p>
          </div>
        </div>
      ))}
    </CarouselSection>
  );
};

/* =========================================================
   T2: 2-UP CIRCULAR-BADGE PROMO ROW
   ========================================================= */
export const CircularPromoRow: React.FC<{
  items: CircularPromoItem[];
  onOpenStory: (storyId: string) => void;
}> = ({ items, onOpenStory }) => {
  return (
    <div className="mas-section" style={{ marginTop: 22 }}>
      <CarouselSection stepPx={640}>
        {items.map((item) => (
          <div
            key={item.id}
            className="t2-promo-card"
            onClick={() => onOpenStory(item.storyId)}
            role="button"
            tabIndex={0}
          >
            <div className="t2-promo-copy">
              <span className="t2-eyebrow">{item.eyebrow}</span>
              <h3 className="t2-title">{item.title}</h3>
              <p className="t2-subtitle">{item.subtitle}</p>
            </div>
            <CircularMedallionArt gradient={item.badgeGradient} glyph={item.badgeGlyph} />
          </div>
        ))}
      </CarouselSection>
    </div>
  );
};

/* =========================================================
   T3: 2-UP TOP SHOWCASE (WITH REAL MANIFEST CONTRACT PREVIEW)
   ========================================================= */
export const TopShowcaseRow: React.FC<{
  items: ShowcaseBannerItem[];
  onOpenApp: (appId: string) => void;
}> = ({ items, onOpenApp }) => {
  return (
    <CarouselSection stepPx={640}>
      {items.map((item) => (
        <div
          key={item.id}
          className="t3-showcase-card"
          onClick={() => item.targetAppId && onOpenApp(item.targetAppId)}
          role="button"
          tabIndex={0}
        >
          <span className="t3-eyebrow">{item.eyebrow}</span>
          <h2 className="t3-title">{item.title}</h2>
          <p className="t3-subtitle">{item.subtitle}</p>
          <div className="t3-banner">
            {item.targetAppId && <VerifiedManifestPreviewCard appId={item.targetAppId} />}
          </div>
        </div>
      ))}
    </CarouselSection>
  );
};

/* =========================================================
   T4: INTERACTIVE 3D STRUCTURE STUDIO HERO (REAL ALPHAFOLD DB)
   ========================================================= */
export const SplitSimulationHero: React.FC<{
  onOpenApp: (appId: string) => void;
}> = ({ onOpenApp }) => {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="t4-split-hero">
      <div
        className="t4-left-panel"
        onClick={() => onOpenApp('alphafold-pdb-studio')}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <div className="t1-eyebrow">LIVE 3D STRUCTURE STUDIO</div>
          <h2 className="t1-headline" style={{ fontSize: 24 }}>
            AlphaFold DB v6 3D Inspector
          </h2>
        </div>
        <p className="t1-subtitle" style={{ fontSize: 13 }}>
          Fetch live EMBL-EBI AlphaFold v6 coordinates for any human gene (EGFR, TP53, KRAS) and inspect per-residue pLDDT in 3D.
        </p>
      </div>
      <div className="t4-right-stage" onClick={() => onOpenApp('alphafold-pdb-studio')} style={{ cursor: 'pointer' }}>
        <LiveMolecularCanvas playing={playing} />
        <button
          type="button"
          className="t4-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
          title={playing ? 'Pause 3D Preview' : 'Play 3D Preview'}
        >
          {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   T6: 3-UP EDITORIAL MEDIA ROW
   ========================================================= */
export const EditorialMediaRow: React.FC<{
  title?: string;
  items: EditorialMediaItem[];
  onOpenApp: (appId: string) => void;
}> = ({ title, items, onOpenApp }) => {
  return (
    <section className="mas-section">
      <div className="mas-section-divider" />
      {title && (
        <div className="mas-section-header">
          <h2 className="mas-section-title">{title}</h2>
        </div>
      )}
      <CarouselSection stepPx={520}>
        {items.map((item) => (
          <div
            key={item.id}
            className="t6-media-card"
            onClick={() => onOpenApp(item.targetAppId)}
            role="button"
            tabIndex={0}
          >
            <div
              className="t6-art"
              style={{
                background: `linear-gradient(135deg, ${item.bgGradient[0]} 0%, ${item.bgGradient[1]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BioAppIcon
                glyph={item.glyph}
                gradient={[item.bgGradient[0], item.bgGradient[1], '#38bdf8']}
                accent="#fde047"
                size={76}
              />
            </div>
            <span className="t6-eyebrow">{item.eyebrow}</span>
            <h3 className="t6-title">{item.title}</h3>
            <p className="t6-subtitle">{item.subtitle}</p>
          </div>
        ))}
      </CarouselSection>
    </section>
  );
};

/* =========================================================
   T7: SMALL APP LOCKUP SECTION
   ========================================================= */
export const SmallLockupSection: React.FC<{
  title: string;
  apps: BioApp[];
  ranked?: boolean;
  showEyebrow?: boolean;
  showPlatform?: boolean;
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSeeAll?: () => void;
}> = ({
  title,
  apps,
  ranked = false,
  showEyebrow = false,
  showPlatform = false,
  installStates,
  onInstall,
  onOpenApp,
  onSeeAll,
}) => {
  const visibleApps = apps.slice(0, 9);
  return (
    <section className="mas-section">
      <div className="mas-section-divider" />
      <div className="mas-section-header">
        <h2 className="mas-section-title">{title}</h2>
        {onSeeAll && (
          <button type="button" className="mas-link-btn" onClick={onSeeAll}>
            See All ({apps.length})
          </button>
        )}
      </div>
      <div className="t7-grid">
        {visibleApps.map((app, idx) => (
          <div
            key={app.id}
            className="t7-lockup"
            onClick={() => onOpenApp(app.id)}
            role="button"
            tabIndex={0}
          >
            <BioAppIcon
              glyph={app.iconGlyph}
              gradient={app.iconGradient}
              accent={app.iconAccent}
              size={54}
            />
            {ranked && <span className="t7-rank">{idx + 1}</span>}
            <div className="t7-meta">
              {showEyebrow && app.eyebrow && (
                <span className="t7-eyebrow">{app.eyebrow}</span>
              )}
              <span className="t7-name">{app.name}</span>
              <span className="t7-sub">{app.subtitle}</span>
              {showPlatform && app.platformNote && (
                <span className="t7-platform">{app.platformNote}</span>
              )}
            </div>
            <GetActionButton
              app={app}
              installState={installStates[app.id]}
              onTrigger={onInstall}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

/* =========================================================
   T8: MEDIUM APP LOCKUP SECTION
   ========================================================= */
export const MediumLockupSection: React.FC<{
  title: string;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSeeAll?: () => void;
}> = ({ title, apps, installStates, onInstall, onOpenApp, onSeeAll }) => {
  const visibleApps = apps.slice(0, 6);
  return (
    <section className="mas-section">
      <div className="mas-section-divider" />
      <div className="mas-section-header">
        <h2 className="mas-section-title">{title}</h2>
        {onSeeAll && (
          <button type="button" className="mas-link-btn" onClick={onSeeAll}>
            See All ({apps.length})
          </button>
        )}
      </div>
      <div className="t8-grid">
        {visibleApps.map((app) => (
          <div
            key={app.id}
            className="t8-lockup"
            onClick={() => onOpenApp(app.id)}
            role="button"
            tabIndex={0}
          >
            <BioAppIcon
              glyph={app.iconGlyph}
              gradient={app.iconGradient}
              accent={app.iconAccent}
              size={86}
            />
            <div className="t8-meta">
              <div>
                <div className="t7-name" style={{ fontSize: 15 }}>
                  {app.name}
                </div>
                <div className="t7-sub" style={{ marginTop: 2 }}>
                  {app.subtitle}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <GetActionButton
                  app={app}
                  installState={installStates[app.id]}
                  onTrigger={onInstall}
                  inlineNote
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* =========================================================
   DISCOVER QUICK LINKS FOOTER (100% REAL WORKING DESTINATIONS)
   ========================================================= */
export const StoreQuickLinksFooter: React.FC<{
  onNavigateAutoResearch: () => void;
  onNavigateWorkspace: () => void;
}> = ({ onNavigateAutoResearch, onNavigateWorkspace }) => {
  return (
    <footer className="mas-section" style={{ marginTop: 38 }}>
      <div className="mas-section-divider" />
      <h2 className="mas-section-title" style={{ marginBottom: 12 }}>
        OpenBioApp Platform Links
      </h2>
      <div className="quick-links-grid">
        <button
          type="button"
          className="quick-link-row"
          onClick={onNavigateAutoResearch}
        >
          Launch Block-Verified Auto-Research Suite (Zero Arbitrary Code)
        </button>
        <button
          type="button"
          className="quick-link-row"
          onClick={onNavigateWorkspace}
        >
          Request a GitHub Repo or Paper DOI Conversion (Repo-to-App Queue)
        </button>
        <a
          href="https://github.com/prairie-meow/OpenBioApp"
          target="_blank"
          rel="noreferrer"
          className="quick-link-row"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          OpenBioApp Source Code, Factory &amp; bioapp.yaml Manifests <ArrowUpRight size={14} />
        </a>
        <a
          href="/api/health"
          target="_blank"
          rel="noreferrer"
          className="quick-link-row"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          Inspect Live Cloud Run Scientific Worker Status (/api/health) <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="footer-pill-actions">
        <button
          type="button"
          className="footer-wide-btn"
          onClick={onNavigateWorkspace}
        >
          + Submit Repo-to-App Request
        </button>
        <a
          href="https://github.com/prairie-meow/OpenBioApp"
          target="_blank"
          rel="noreferrer"
          className="footer-wide-btn"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          Star or Fork on GitHub <ArrowUpRight size={15} />
        </a>
      </div>

      <div className="mas-section-divider" style={{ marginBottom: 12 }} />
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
        OpenBioApp · Apache-2.0 Open Source · Every listed studio executes live scientific computation or public biomedical APIs with zero mock outputs.
      </div>
    </footer>
  );
};
