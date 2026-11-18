import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CloudDownload, Pause, Play } from 'lucide-react';
import {
  BioApp,
  CircularPromoItem,
  EditorialMediaItem,
  EditorialStory,
  ShowcaseBannerItem,
} from '../types/store';
import {
  AppScreenshotArt,
  BioAppIcon,
  CircularMedallionArt,
  EditorialHeroArt,
  LiveMolecularCanvas,
} from './BioArtwork';

export interface InstallStateMap {
  [appId: string]: 'idle' | 'installing' | 'installed';
}

/* =========================================================
   APPLE APP STORE PILL / CLOUD / PROGRESS ACTION BUTTON
   ========================================================= */
export const GetActionButton: React.FC<{
  app: BioApp;
  installState?: 'idle' | 'installing' | 'installed';
  onTrigger: (appId: string, e: React.MouseEvent) => void;
  variant?: 'neutral' | 'solid-blue' | 'white-on-dark' | 'update';
  inlineNote?: boolean;
  hideNote?: boolean;
}> = ({
  app,
  installState = 'idle',
  onTrigger,
  variant = 'neutral',
  inlineNote = false,
  hideNote = false,
}) => {
  if (installState === 'installing') {
    return (
      <div className={`mas-action-wrap ${inlineNote ? 'inline-note' : ''}`}>
        <button
          type="button"
          className="mas-cloud-btn"
          onClick={(e) => onTrigger(app.id, e)}
          title="Installing..."
        >
          <svg width="26" height="26" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e5ea" strokeWidth="2.5" />
            <circle
              cx="14"
              cy="14"
              r="11"
              fill="none"
              stroke="#007aff"
              strokeWidth="2.5"
              strokeDasharray="46 28"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 14 14"
                to="360 14 14"
                dur="0.85s"
                repeatCount="indefinite"
              />
            </circle>
            <rect x="10.5" y="10.5" width="7" height="7" rx="1.5" fill="#007aff" />
          </svg>
        </button>
      </div>
    );
  }

  if (installState === 'installed') {
    return (
      <div className={`mas-action-wrap ${inlineNote ? 'inline-note' : ''}`}>
        <button
          type="button"
          className={`mas-get-pill ${variant === 'solid-blue' ? 'solid-blue' : variant === 'white-on-dark' ? 'white-on-dark' : ''}`}
          onClick={(e) => onTrigger(app.id, e)}
        >
          Open
        </button>
      </div>
    );
  }

  if (app.price === 'Redownload' && variant === 'neutral') {
    return (
      <button
        type="button"
        className="mas-cloud-btn"
        onClick={(e) => onTrigger(app.id, e)}
        title="Redownload from Bio Cloud"
      >
        <CloudDownload size={21} strokeWidth={1.9} />
      </button>
    );
  }

  const label = variant === 'update' ? 'Update' : app.price === 'Redownload' ? 'Get' : app.price;
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
   MONOCHROME DARK GRAY RATING STARS (18-search-results.png)
   ========================================================= */
export const MonochromeStars: React.FC<{ rating: number; count?: string; size?: number }> = ({
  rating,
  count,
  size = 11,
}) => {
  const rounded = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} width={size} height={size} viewBox="0 0 16 16">
            <path
              d="M8 1.3l2.02 4.1 4.52.66-3.27 3.19.77 4.5L8 11.62l-4.04 2.13.77-4.5L1.46 6.06l4.52-.66L8 1.3z"
              fill={n <= rounded ? '#6e6e73' : 'none'}
              stroke={n <= rounded ? '#6e6e73' : '#b8b8bf'}
              strokeWidth="1.3"
            />
          </svg>
        ))}
      </span>
      {count && (
        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 400 }}>
          {count}
        </span>
      )}
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
   T1: WIDE HERO BANNER CAROUSEL (01-discover-top.png)
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
   T2: 2-UP CIRCULAR-BADGE PROMO ROW (01-discover-top.png)
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
   T3: 2-UP TOP SHOWCASE (06-create / 08-work / 12-develop)
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
            <AppScreenshotArt
              theme={item.screenshotTheme}
              appName={item.title}
              accent={item.bgGradient[2]}
            />
          </div>
        </div>
      ))}
    </CarouselSection>
  );
};

/* =========================================================
   T4: SPLIT SIMULATION / TRAILER HERO (10-play-top.png)
   ========================================================= */
export const SplitSimulationHero: React.FC<{
  onOpenApp: (appId: string) => void;
}> = ({ onOpenApp }) => {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="t4-split-hero">
      <div
        className="t4-left-panel"
        onClick={() => onOpenApp('openmm-md')}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <div className="t1-eyebrow">LIVE SIMULATION</div>
          <h2 className="t1-headline" style={{ fontSize: 25 }}>
            Fold &amp; Equilibrate in Real Time!
          </h2>
        </div>
        <p className="t1-subtitle" style={{ fontSize: 13 }}>
          Interactive Metal GPU molecular dynamics with OpenMM &amp; AlphaFold 3.
        </p>
      </div>
      <div className="t4-right-stage">
        <LiveMolecularCanvas playing={playing} />
        <button
          type="button"
          className="t4-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
          title={playing ? 'Pause MD Trajectory' : 'Play MD Trajectory'}
        >
          {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   T6: 3-UP EDITORIAL MEDIA ROW (02-discover-mid.png)
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
   T7: SMALL APP LOCKUP SECTION (3x3 & Column-Major Charts)
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
            See All
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
   T8: MEDIUM APP LOCKUP SECTION (86px Icon, 2x3 Grid)
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
            See All
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
   DISCOVER QUICK LINKS FOOTER (03-discover-footer.png)
   ========================================================= */
export const StoreQuickLinksFooter: React.FC<{
  onOpenDesignTemplate: () => void;
  onQuickAction: (msg: string) => void;
}> = ({ onOpenDesignTemplate, onQuickAction }) => {
  return (
    <footer className="mas-section" style={{ marginTop: 38 }}>
      <div className="mas-section-divider" />
      <h2 className="mas-section-title" style={{ marginBottom: 12 }}>
        Quick Links
      </h2>
      <div className="quick-links-grid">
        <button
          type="button"
          className="quick-link-row"
          onClick={onOpenDesignTemplate}
        >
          Inspect Brand Design Template (CUA Ground Truth)
        </button>
        <button
          type="button"
          className="quick-link-row"
          onClick={() =>
            onQuickAction('IRB & HIPAA Local-First Execution Guide: All local MLX/ARM64 Bio Apps run with zero sequence egress.')
          }
        >
          Researcher’s Guide to HIPAA &amp; IRB Data Governance
        </button>
        <button
          type="button"
          className="quick-link-row"
          onClick={() =>
            onQuickAction('Academic & Open-Source Licensing: Free institutional tiers verified via .edu / ORCID.')
          }
        >
          About Open-Weights &amp; Academic Licenses
        </button>
        <button
          type="button"
          className="quick-link-row"
          onClick={() =>
            onQuickAction('Benchmark Reproducibility: Report container SHA256 or DOI citation issues.')
          }
        >
          Submit a Bio Tool or Report Reproducibility Issue
        </button>
      </div>

      <div className="footer-pill-actions">
        <button
          type="button"
          className="footer-wide-btn"
          onClick={() =>
            onQuickAction('Academic Compute Grant Redeemed: 500 H100 Bio-Hours credited to your lab workspace.')
          }
        >
          Redeem Compute Grant
        </button>
        <button
          type="button"
          className="footer-wide-btn"
          onClick={() =>
            onQuickAction('SLURM / Kubernetes Cluster Bridge Ready: Connected to local Apple M4 Max + Lab GPU Node.')
          }
        >
          Connect Lab GPU Cluster
        </button>
      </div>

      <div className="mas-section-divider" style={{ marginBottom: 12 }} />
      <button
        type="button"
        onClick={onOpenDesignTemplate}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          fontSize: 13,
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Terms, Open Science Charter &amp; Design System Specs <ChevronRight size={14} />
      </button>
    </footer>
  );
};
