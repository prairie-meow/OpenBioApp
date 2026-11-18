import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
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
} from './BioArtwork';

export interface InstallStateMap {
  [appId: string]: 'idle' | 'installing' | 'installed';
}

/* =========================================================
   VERIFIED MANIFEST I/O & RUNTIME PREVIEW CARD
   ========================================================= */
export const VerifiedManifestPreviewCard: React.FC<{
  appId: string;
}> = ({ appId }) => {
  const { tr } = useLocale();
  const manifest = BIO_APP_MANIFESTS[appId];
  if (!manifest) return null;

  const tierLabel =
    manifest.runtime.tier === 'cloud-run-cpu-worker'
      ? tr('Cloud Run Python 3.12 CPU', 'Cloud Run Python 3.12 CPU')
      : manifest.runtime.tier === 'public-bio-api'
      ? tr('Live Public Bio-API', '실시간 공개 Bio-API')
      : tr('100% In-Browser Engine', '100% 브라우저 로컬 엔진');

  return (
    <div className="manifest-preview-card">
      <div className="manifest-preview-top">
        <span className="manifest-preview-tier">{tierLabel}</span>
        <span className="manifest-preview-ver">
          v{manifest.version} · {manifest.license.spdx}
        </span>
      </div>

      <div className="manifest-preview-ports">
        <div className="manifest-preview-caption">
          {tr('Typed Bio-I/O Contract', '선언된 Bio-I/O 입출력 포트')}
        </div>
        <div className="manifest-preview-chips">
          {manifest.inputBioTypes.map((t) => (
            <span key={`in-${t}`} className="manifest-port-chip in">
              in:{t}
            </span>
          ))}
          <span className="manifest-port-arrow" aria-hidden="true">
            →
          </span>
          {manifest.outputBioTypes.map((t) => (
            <span key={`out-${t}`} className="manifest-port-chip out">
              out:{t}
            </span>
          ))}
        </div>
      </div>

      <div className="manifest-preview-foot">
        <span className="manifest-preview-sample">▶ {manifest.sampleLabel}</span>
        <span className="manifest-preview-cta">
          {tr('Open Studio →', '스튜디오 열기 →')}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   PILL OPEN ACTION BUTTON
   ========================================================= */
export const GetActionButton: React.FC<{
  app: BioApp;
  installState?: 'idle' | 'installing' | 'installed';
  onTrigger: (appId: string, e: React.MouseEvent) => void;
  variant?: 'neutral' | 'solid-blue' | 'white-on-dark' | 'update';
  labelOverride?: string;
}> = ({
  app,
  onTrigger,
  variant = 'neutral',
  labelOverride,
}) => {
  const { tr } = useLocale();
  const label = labelOverride || tr('Open', '열기');
  const cls =
    variant === 'solid-blue'
      ? 'mas-get-pill solid-blue'
      : variant === 'white-on-dark'
      ? 'mas-get-pill white-on-dark'
      : 'mas-get-pill';

  return (
    <div className="mas-action-wrap">
      <button
        type="button"
        className={cls}
        aria-label={`${label} ${app.name}`}
        onClick={(e) => onTrigger(app.id, e)}
      >
        {label}
      </button>
    </div>
  );
};

/* =========================================================
   VERIFIED RUNTIME & LICENSE BADGE
   ========================================================= */
export const VerifiedRuntimeBadge: React.FC<{ appId: string }> = ({ appId }) => {
  const { tr } = useLocale();
  const manifest = BIO_APP_MANIFESTS[appId];
  if (!manifest) return null;
  const tierShort =
    manifest.runtime.tier === 'cloud-run-cpu-worker'
      ? tr('Cloud CPU', 'Cloud CPU')
      : manifest.runtime.tier === 'public-bio-api'
      ? tr('Live API', '실시간 API')
      : tr('Browser', '브라우저');
  return (
    <span className="verified-runtime-badge">
      <span className="verified-runtime-dot">● {tr('Verified', '검증됨')}</span>
      <span>· {tierShort}</span>
      <span>· {manifest.license.spdx}</span>
    </span>
  );
};

/* =========================================================
   SEMANTIC APP LOCKUP ROW & 2-COL CARD (ZERO NESTED BUTTONS)
   ========================================================= */
export const AppLockupRow: React.FC<{
  app: BioApp;
  rank?: number;
  showPlatform?: boolean;
  installState?: 'idle' | 'installing' | 'installed';
  onTriggerInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ app, rank, showPlatform, installState, onTriggerInstall, onOpenApp }) => {
  return (
    <div className="t7-lockup">
      <button
        type="button"
        className="lockup-main-btn"
        onClick={() => onOpenApp(app.id)}
      >
        <BioAppIcon
          glyph={app.iconGlyph}
          gradient={app.iconGradient}
          accent={app.iconAccent}
          size={54}
        />
        {rank !== undefined && <span className="t7-rank">{rank}</span>}
        <span className="t7-meta">
          <span className="t7-name">{app.name}</span>
          <span className="t7-sub">{app.subtitle}</span>
          {showPlatform && <VerifiedRuntimeBadge appId={app.id} />}
        </span>
      </button>
      <GetActionButton
        app={app}
        installState={installState}
        onTrigger={onTriggerInstall}
      />
    </div>
  );
};

export const TwoColLockupCard: React.FC<{
  app: BioApp;
  installState?: 'idle' | 'installing' | 'installed';
  onTriggerInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ app, installState, onTriggerInstall, onOpenApp }) => {
  return (
    <div className="t8-lockup">
      <button
        type="button"
        className="lockup-main-btn is-large"
        onClick={() => onOpenApp(app.id)}
      >
        <BioAppIcon
          glyph={app.iconGlyph}
          gradient={app.iconGradient}
          accent={app.iconAccent}
          size={72}
        />
        <span className="t8-meta">
          <span className="t7-name">{app.name}</span>
          <span className="t7-sub">{app.subtitle}</span>
          <VerifiedRuntimeBadge appId={app.id} />
        </span>
      </button>
      <GetActionButton
        app={app}
        installState={installState}
        onTrigger={onTriggerInstall}
      />
    </div>
  );
};

/* =========================================================
   OVERFLOW-AWARE HORIZONTAL CAROUSEL WRAPPER
   ========================================================= */
export const CarouselSection: React.FC<{ children: React.ReactNode; stepPx?: number }> = ({
  children,
  stepPx = 680,
}) => {
  const { tr } = useLocale();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const measureOverflow = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(maxScroll - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measureOverflow();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => measureOverflow());
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [children, measureOverflow]);

  const scrollByDir = (dir: -1 | 1) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * stepPx, behavior: 'smooth' });
  };

  return (
    <div className="mas-carousel-outer">
      {canLeft && (
        <button
          type="button"
          className="mas-carousel-paddle left"
          onClick={() => scrollByDir(-1)}
          aria-label={tr('Scroll previous items', '이전 항목으로 스크롤')}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <div
        className="mas-carousel-track"
        ref={trackRef}
        onScroll={measureOverflow}
      >
        {children}
      </div>
      {canRight && (
        <button
          type="button"
          className="mas-carousel-paddle right"
          onClick={() => scrollByDir(1)}
          aria-label={tr('Scroll next items', '다음 항목으로 스크롤')}
        >
          <ChevronRight size={18} />
        </button>
      )}
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
    <CarouselSection stepPx={920}>
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          className="t1-hero-card"
          onClick={() => onOpenStory(story.id)}
        >
          <div className="t1-art-stage">
            <EditorialHeroArt styleType={story.illustrationStyle} bg={story.heroBg} />
          </div>
          <div className="t1-hero-copy">
            <h2 className="t1-headline">{story.title}</h2>
            <p className="t1-subtitle">{story.subtitle}</p>
          </div>
        </button>
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
    <div className="mas-section promo-section">
      <CarouselSection stepPx={640}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="t2-promo-card"
            onClick={() => onOpenStory(item.storyId)}
          >
            <div className="t2-promo-copy">
              <h3 className="t2-title">{item.title}</h3>
              <p className="t2-subtitle">{item.subtitle}</p>
            </div>
            <CircularMedallionArt gradient={item.badgeGradient} glyph={item.badgeGlyph} />
          </button>
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
        <button
          key={item.id}
          type="button"
          className="t3-showcase-card"
          onClick={() => item.targetAppId && onOpenApp(item.targetAppId)}
        >
          <h2 className="t3-title">{item.title}</h2>
          <p className="t3-subtitle">{item.subtitle}</p>
          <div className="t3-banner">
            {item.targetAppId && <VerifiedManifestPreviewCard appId={item.targetAppId} />}
          </div>
        </button>
      ))}
    </CarouselSection>
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
          <button
            key={item.id}
            type="button"
            className="t6-media-card"
            onClick={() => onOpenApp(item.targetAppId)}
          >
            <div
              className="t6-art"
              style={{
                background: `linear-gradient(135deg, ${item.bgGradient[0]} 0%, ${item.bgGradient[1]} 100%)`,
              }}
            >
              <BioAppIcon
                glyph={item.glyph}
                gradient={[item.bgGradient[0], item.bgGradient[1], '#38bdf8']}
                accent="#fde047"
                size={74}
              />
            </div>
            <h3 className="t6-title">{item.title}</h3>
            <p className="t6-subtitle">{item.subtitle}</p>
          </button>
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
  showPlatform?: boolean;
  limitCount?: number;
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSeeAll?: () => void;
}> = ({
  title,
  apps,
  ranked = false,
  showPlatform = false,
  limitCount = 9,
  installStates,
  onInstall,
  onOpenApp,
  onSeeAll,
}) => {
  const { tr } = useLocale();
  const visibleApps = apps.slice(0, limitCount);
  return (
    <section className="mas-section">
      <div className="mas-section-divider" />
      <div className="mas-section-header">
        <h2 className="mas-section-title">{title}</h2>
        {onSeeAll && (
          <button type="button" className="mas-link-btn" onClick={onSeeAll}>
            {tr(`See All (${apps.length})`, `전체 보기 (${apps.length})`)}
          </button>
        )}
      </div>
      <div className="t7-grid">
        {visibleApps.map((app, idx) => (
          <AppLockupRow
            key={app.id}
            app={app}
            rank={ranked ? idx + 1 : undefined}
            showPlatform={showPlatform}
            installState={installStates[app.id]}
            onTriggerInstall={onInstall}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </section>
  );
};

/* =========================================================
   DISCOVER QUICK LINKS & LEGAL FOOTER
   ========================================================= */
export const StoreQuickLinksFooter: React.FC<{
  onNavigateAutoResearch: () => void;
  onNavigateWorkspace: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}> = ({
  onNavigateAutoResearch,
  onNavigateWorkspace,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const { tr } = useLocale();
  return (
    <footer className="mas-section store-footer">
      <div className="mas-section-divider" />
      <h2 className="mas-section-title store-footer-heading">
        {tr('OpenBioApp Platform & Governance', 'OpenBioApp 플랫폼 및 거버넌스')}
      </h2>
      <div className="quick-links-grid">
        <button
          type="button"
          className="quick-link-row"
          onClick={onNavigateAutoResearch}
        >
          {tr(
            'Block-Verified Auto-Research Suite (Zero Arbitrary Code)',
            '검증 블록 기반 자율 연구 스위트 (임의 코드 실행 제로)'
          )}
        </button>
        <button
          type="button"
          className="quick-link-row"
          onClick={onNavigateWorkspace}
        >
          {tr(
            'Submit GitHub Repo or Paper DOI (Nightly Repo-to-App Queue)',
            '오픈소스 GitHub 논문 저장소 변환 신청 (야간 자동 빌드 큐)'
          )}
        </button>
        <a
          href="https://github.com/prairie-meow/OpenBioApp"
          target="_blank"
          rel="noreferrer"
          className="quick-link-row"
        >
          <span>
            {tr(
              'OpenBioApp Source Code, Factory & bioapp.yaml Manifests',
              'OpenBioApp 소스 코드, Factory 및 bioapp.yaml 매니페스트'
            )}
          </span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <a
          href="/api/health"
          target="_blank"
          rel="noreferrer"
          className="quick-link-row"
        >
          <span>
            {tr(
              'Live Cloud Run Scientific Worker Status (/api/health)',
              '실시간 Cloud Run 과학 연산 워커 상태 확인 (/api/health)'
            )}
          </span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      <div className="footer-pill-actions">
        <button
          type="button"
          className="footer-wide-btn"
          onClick={onNavigateWorkspace}
        >
          {tr('+ Submit Repo-to-App Request', '+ Repo-to-App 변환 신청')}
        </button>
        <a
          href="https://github.com/prairie-meow/OpenBioApp"
          target="_blank"
          rel="noreferrer"
          className="footer-wide-btn"
        >
          <span>{tr('View on GitHub', 'GitHub 저장소 열기')}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="mas-section-divider store-footer-divider" />
      <div className="store-footer-legal">
        <span>
          {tr(
            'OpenBioApp · Apache-2.0 Open Source · Every studio executes live scientific computation or public biomedical APIs with zero mock outputs.',
            'OpenBioApp · Apache-2.0 오픈소스 · 모든 스튜디오는 모의 데이터 없이 실제 과학 연산과 공개 바이오 API만 실행합니다.'
          )}
        </span>
        <nav className="store-footer-legal-links" aria-label={tr('Legal and policies', '약관 및 개인정보 처리방침')}>
          <a
            href="/privacy"
            className="mas-link-btn"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePrivacy();
            }}
          >
            {tr('Privacy Policy', '개인정보 및 데이터 보호방침')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/terms"
            className="mas-link-btn"
            onClick={(e) => {
              e.preventDefault();
              onNavigateTerms();
            }}
          >
            {tr('Terms & Academic Licensing', '이용약관 및 학술 라이선스')}
          </a>
        </nav>
      </div>
    </footer>
  );
};
