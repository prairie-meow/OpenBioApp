import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  FileText,
  GitBranch,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  UserX,
  X,
} from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import { BioApp } from '../types/store';
import { BioAppIcon } from '../components/BioArtwork';
import {
  AppLockupRow,
  InstallStateMap,
  TwoColLockupCard,
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
  const { tr } = useLocale();
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const closeModalBtnRef = useRef<HTMLButtonElement | null>(null);

  const manifest = BIO_APP_MANIFESTS[app.id];
  const latestRelease = app.releases[0];

  useEffect(() => {
    if (!showVersionModal) return;
    closeModalBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowVersionModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showVersionModal]);

  const downstreamCompatible = manifest
    ? findCompatibleDownstreamApps(manifest.outputBioTypes).filter((m) => m.id !== app.id)
    : [];
  const downstreamApps = downstreamCompatible
    .map((m) => allApps.find((a) => a.id === m.id))
    .filter((x): x is BioApp => Boolean(x));

  const relatedApps = allApps
    .filter((a) => a.id !== app.id && !downstreamApps.some((d) => d.id === a.id))
    .slice(0, 6);

  const repoUrl =
    manifest?.sourceRepo || app.websiteUrl || 'https://github.com/prairie-meow/OpenBioApp';
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

  return (
    <div>
      <div className="mas-page-content subpage-offset detail-page-body">
        {/* 1. APP IDENTITY HEADER */}
        <div className="detail-hero">
          <BioAppIcon
            glyph={app.iconGlyph}
            gradient={app.iconGradient}
            accent={app.iconAccent}
            size={108}
          />
          <div className="detail-hero-meta">
            <div>
              <h1 className="detail-app-title">{app.name}</h1>
              <p className="detail-app-subtitle">{app.subtitle}</p>
            </div>

            <div className="detail-hero-links">
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mas-get-pill"
              >
                <span>{tr('Upstream Source', '원본 오픈소스 저장소')}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              {doiStr && (
                <a
                  href={`https://doi.org/${doiStr}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mas-get-pill"
                >
                  <span>DOI: {doiStr}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2. VERIFIED METADATA SPEC RIBBON */}
        <div className="detail-spec-ribbon">
          <div className="detail-spec-cell">
            <span className="detail-spec-label">{tr('Status', '검증 상태')}</span>
            <span className="detail-spec-val is-verified">VERIFIED</span>
            <span className="detail-spec-sub">{tr('Zero-Mock Live', '실데이터 검증')}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">{tr('SPDX License', '라이선스')}</span>
            <span className="detail-spec-val">
              {manifest?.license.spdx || app.ageOrTier}
            </span>
            <span className="detail-spec-sub">{app.ageSubtitle}</span>
          </div>

          <button
            type="button"
            className="detail-spec-cell is-interactive"
            onClick={() => onOpenCategory(app.categoryId)}
          >
            <span className="detail-spec-label">{tr('Domain', '연구 분야')}</span>
            <span className="detail-spec-val">{app.languageCode}</span>
            <span className="detail-spec-sub">{app.categoryLabel}</span>
          </button>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">{tr('Upstream Lab', '원작 연구실')}</span>
            <span className="detail-oss-badge">OSS</span>
            <span className="detail-spec-sub is-truncated" title={app.developer}>
              {app.developer}
            </span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">{tr('Runtime Tier', '실행 환경')}</span>
            <span className="detail-spec-val">{tierShort}</span>
            <span className="detail-spec-sub">{app.languageLabel}</span>
          </div>

          <div className="detail-spec-cell">
            <span className="detail-spec-label">{tr('Bio-I/O Ports', '입출력 포트')}</span>
            <span className="detail-spec-val">
              {manifest ? `${manifest.inputBioTypes.length}→${manifest.outputBioTypes.length}` : '1→1'}
            </span>
            <span className="detail-spec-sub">{tr('Typed Chaining', '타입 체이닝')}</span>
          </div>
        </div>

        {/* 3. EMBEDDED LIVE EXECUTION STUDIO (Single Canonical Execution & Guide Surface) */}
        <div id="openbioapp-live-studio">
          <BioAppExecutionStudio
            appId={app.id}
            incomingChainPayload={incomingChainPayload}
            onChainToApp={onChainToApp}
            onRunPersisted={onRunPersisted}
            onToast={onToast}
          />
        </div>

        {/* 4. SCIENTIFIC DESCRIPTION + UPSTREAM LINKS */}
        <div className="detail-desc-layout">
          <div className="detail-desc-body">
            <p className="detail-desc-text">
              {descExpanded || app.description.length <= 320
                ? app.description
                : `${app.description.slice(0, 320)}… `}
              {!descExpanded && app.description.length > 320 && (
                <button
                  type="button"
                  className="mas-link-btn"
                  onClick={() => setDescExpanded(true)}
                >
                  {tr('more', '더 보기')}
                </button>
              )}
            </p>
          </div>

          <div className="detail-side-links">
            <a href={repoUrl} target="_blank" rel="noreferrer" className="mas-link-btn">
              <span>{tr('Upstream Repository', '원본 GitHub 저장소')}</span>
              <GitBranch size={14} aria-hidden="true" />
            </a>
            {doiStr && (
              <a
                href={`https://doi.org/${doiStr}`}
                target="_blank"
                rel="noreferrer"
                className="detail-secondary-link"
              >
                <span>DOI: {doiStr}</span>
                <FileText size={14} aria-hidden="true" />
              </a>
            )}
            <a
              href="https://github.com/prairie-meow/OpenBioApp/issues"
              target="_blank"
              rel="noreferrer"
              className="detail-secondary-link"
            >
              <span>{tr('Report Sanitizer / Issue', '전처리·이슈 제보')}</span>
              <HelpCircle size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 5. DECLARED BIO-TYPE I/O CONTRACT */}
        {manifest && (
          <section className="mas-section">
            <div className="mas-section-divider" />
            <div className="mas-section-header">
              <h2 className="mas-section-title">
                {tr('Declared Bio-Type I/O Contract', '선언된 Bio-Type 입출력 규격')} (
                <code>apps/{app.id}/bioapp.yaml</code>)
              </h2>
            </div>

            <div className="detail-contract-grid">
              <div>
                <div className="detail-contract-heading">
                  {tr('Accepted Input Bio-Types', '수용 입력 Bio-Type')}
                </div>
                <div className="detail-chip-wrap">
                  {manifest.inputBioTypes.map((t) => (
                    <code key={t} className="detail-bio-chip">
                      {t}
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <div className="detail-contract-heading">
                  {tr('Emitted Output Bio-Types', '출력 Bio-Type')}
                </div>
                <div className="detail-chip-wrap">
                  {manifest.outputBioTypes.map((t) => (
                    <code key={t} className="detail-bio-chip is-output">
                      {t}
                    </code>
                  ))}
                </div>
              </div>

              {sanitizers.length > 0 && (
                <div>
                  <div className="detail-contract-heading">
                    {tr('Active Front-Door Sanitizers', '활성 자동 전처리기')}
                  </div>
                  <div className="detail-chip-wrap">
                    {sanitizers.map((s) => (
                      <code key={s} className="detail-bio-chip">
                        {s}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. RELEASE NOTES */}
        {latestRelease && (
          <section className="mas-section">
            <div className="mas-section-divider" />
            <div className="mas-section-header">
              <h2 className="mas-section-title">{tr('Release Notes', '릴리스 노트')}</h2>
              <button
                type="button"
                className="mas-link-btn"
                onClick={() => setShowVersionModal(true)}
              >
                {tr('Version History', '버전 기록')}
              </button>
            </div>

            <div className="detail-release-layout">
              <p className="detail-desc-text">
                {notesExpanded ? latestRelease.notes : latestRelease.notes.slice(0, 210)}
                {!notesExpanded && latestRelease.notes.length > 210 && (
                  <>
                    …{' '}
                    <button
                      type="button"
                      className="mas-link-btn"
                      onClick={() => setNotesExpanded(true)}
                    >
                      {tr('more', '더 보기')}
                    </button>
                  </>
                )}
              </p>
              <div className="detail-release-meta">
                <div>{latestRelease.date}</div>
                <div>Version {latestRelease.version}</div>
              </div>
            </div>
          </section>
        )}

        {/* 7. DATA GOVERNANCE & PROVENANCE */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">
              {tr('Data Governance & Provenance', '데이터 거버넌스 및 출처')}
            </h2>
          </div>
          <p className="detail-governance-lead">
            {tr('Upstream author:', '원작 개발팀:')} <strong>{app.developer}</strong>.{' '}
            {tr(
              'Hosted execution follows stateless processing and strict academic license attribution.',
              '모든 분석은 원본 파일 무보관(Stateless) 원칙과 오픈소스 학술 라이선스 표기를 준수합니다.'
            )}
          </p>

          <div className="detail-privacy-grid">
            {app.privacyCards.map((card, idx) => (
              <div key={idx} className="detail-privacy-card">
                <div className="detail-privacy-icon" aria-hidden="true">
                  {card.type === 'not-collected' ? (
                    <ShieldCheck size={28} strokeWidth={1.8} />
                  ) : card.type === 'local-compute' ? (
                    <Sparkles size={28} strokeWidth={1.8} />
                  ) : (
                    <UserX size={28} strokeWidth={1.8} />
                  )}
                </div>
                <strong className="detail-privacy-title">{card.title}</strong>
                <span className="detail-privacy-sub">{card.subtitle}</span>
                <div className="detail-privacy-items">
                  {card.items.map((it) => (
                    <span key={it}>✓ {it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. MANIFEST & UPSTREAM METADATA */}
        <section className="mas-section">
          <div className="mas-section-divider" />
          <h2 className="mas-section-title detail-info-heading">
            {tr('Manifest & Upstream Information', '매니페스트 및 원작 정보')}
          </h2>
          <div className="detail-info-grid">
            <div>
              <div className="detail-info-label">{tr('Upstream Lab / Maintainer', '원작 연구실 / 관리팀')}</div>
              <div className="detail-info-val">{app.developer}</div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Manifest Path', '매니페스트 경로')}</div>
              <div className="detail-info-val is-mono">apps/{app.id}/bioapp.yaml</div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Domain', '분야')}</div>
              <div className="detail-info-val">{app.categoryLabel}</div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Execution Environment', '실행 환경')}</div>
              <div className="detail-info-val">{app.compatibility}</div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Scientific Engine', '핵심 엔진')}</div>
              <div className="detail-info-val">{app.languageLabel}</div>
            </div>
            <div>
              <div className="detail-info-label">{tr('SPDX License', '라이선스')}</div>
              <div className="detail-info-val">
                {manifest?.license.badgeLabel || `${app.ageOrTier} (${app.ageSubtitle})`}
              </div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Primary Citation', '대표 인용')}</div>
              <div className="detail-info-val">
                {manifest?.citation || doiStr || 'OpenBioApp Verified'}
              </div>
            </div>
            <div>
              <div className="detail-info-label">{tr('Copyright', '저작권')}</div>
              <div className="detail-info-val">{app.copyright}</div>
            </div>
          </div>
        </section>
      </div>

      {/* 9. FOOTER BLEED: COMPATIBLE DOWNSTREAM BLOCKS & RELATED STUDIOS */}
      <div className="detail-footer-bleed">
        <div className="detail-footer-inner">
          {downstreamApps.length > 0 && (
            <>
              <div className="mas-section-header">
                <h2 className="mas-section-title">
                  {tr('Compatible Downstream Blocks', '연결 가능한 후속 분석 블록')} (
                  {downstreamApps.length})
                </h2>
              </div>
              <div className="t8-grid detail-downstream-grid">
                {downstreamApps.slice(0, 4).map((other) => (
                  <TwoColLockupCard
                    key={other.id}
                    app={other}
                    installState={installStates[other.id]}
                    onTriggerInstall={onInstall}
                    onOpenApp={onOpenApp}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mas-section-divider" />
          <div className="mas-section-header">
            <h2 className="mas-section-title">
              {tr('More Verified Studios in OpenBioApp', 'OpenBioApp의 다른 검증된 바이오 앱')}
            </h2>
          </div>
          <div className="t7-grid flow-row">
            {relatedApps.map((rel) => (
              <AppLockupRow
                key={rel.id}
                app={rel}
                installState={installStates[rel.id]}
                onTriggerInstall={onInstall}
                onOpenApp={onOpenApp}
              />
            ))}
          </div>
        </div>
      </div>

      {/* VERSION HISTORY MODAL */}
      {showVersionModal && (
        <div
          className="mas-modal-backdrop"
          onClick={() => setShowVersionModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-history-title"
            className="mas-modal-sheet version-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mas-modal-head">
              <h3 id="version-history-title" className="mas-modal-title">
                {tr('Version History', '버전 기록')}
              </h3>
              <button
                ref={closeModalBtnRef}
                type="button"
                className="mas-circle-nav-btn"
                aria-label={tr('Close version history', '버전 기록 닫기')}
                onClick={() => setShowVersionModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            {app.releases.map((rel) => (
              <div key={rel.version} className="version-history-item">
                <div className="version-history-meta">
                  <span>Version {rel.version}</span>
                  <span className="version-history-date">{rel.date}</span>
                </div>
                <p className="version-history-notes">{rel.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
