import React, { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useLocale } from '../lib/i18n/locale';
import { BioApp, BioCategory, BioCategoryId } from '../types/store';
import {
  BioAppIcon,
  CategoryDuotoneIcon,
} from '../components/BioArtwork';
import {
  AppLockupRow,
  GetActionButton,
  InstallStateMap,
  SmallLockupSection,
  TopShowcaseRow,
  VerifiedManifestPreviewCard,
  VerifiedRuntimeBadge,
} from '../components/StorePrimitives';
import { db } from '../lib/firebase';

/* =========================================================
   CATEGORIES DIRECTORY PAGE (ONLY CATEGORIES WITH REAL APPS)
   ========================================================= */
export const CategoriesView: React.FC<{
  categories: BioCategory[];
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSelectCategory: (catId: BioCategoryId) => void;
  onSeeAll: (title: string, appIds: string[]) => void;
}> = ({
  categories,
  apps,
  installStates,
  onInstall,
  onOpenApp,
  onSelectCategory,
  onSeeAll,
}) => {
  const { tr } = useLocale();
  const activeCategories = categories.filter((cat) =>
    apps.some((a) => a.categoryId === cat.id)
  );
  const domainApps = apps.slice(0, 9);
  const bridgeAndUtilityApps = apps.slice(9);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">{tr('Categories', '카테고리')}</h1>
      </div>

      <div className="t9-category-grid">
        {activeCategories.map((cat) => {
          const count = apps.filter((a) => a.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              className="t9-category-row"
              onClick={() => onSelectCategory(cat.id)}
            >
              <CategoryDuotoneIcon
                glyph={cat.glyph}
                primary={cat.colorPrimary}
                secondary={cat.colorSecondary}
              />
              <span className="t9-category-name">{cat.name}</span>
              <span className="t9-category-count">{count}</span>
            </button>
          );
        })}
      </div>

      <SmallLockupSection
        title={tr('Core Biomedical Analysis Studios', '핵심 생명의학 분석 스튜디오')}
        apps={domainApps}
        showPlatform
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            tr(
              `All Verified Studios (${apps.length})`,
              `전체 검증 스튜디오 (${apps.length})`
            ),
            apps.map((a) => a.id)
          )
        }
      />

      {bridgeAndUtilityApps.length > 0 && (
        <SmallLockupSection
          title={tr(
            'Clinical Survival, Single-Cell & Bridge Utilities',
            '임상 생존분석 · 단일세포 · 데이터 브리지'
          )}
          apps={bridgeAndUtilityApps}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      )}
    </div>
  );
};

/* =========================================================
   CATEGORY SUBPAGE
   ========================================================= */
export const CategoryDetailView: React.FC<{
  category: BioCategory;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ category, apps, installStates, onInstall, onOpenApp }) => {
  const { tr } = useLocale();
  const matching = apps.filter((a) => a.categoryId === category.id);

  return (
    <div className="mas-page-content subpage-offset">
      {matching.length > 0 && (
        <TopShowcaseRow
          items={matching.slice(0, 2).map((app, idx) => ({
            id: `cat-s${idx}-${category.id}`,
            eyebrow: idx === 0 ? 'VERIFIED STUDIO' : 'LIVE ENGINE',
            title: app.name,
            subtitle: app.subtitle,
            bgGradient: [category.colorPrimary, '#0f172a', category.colorSecondary],
            glyph: app.iconGlyph,
            screenshotTheme: app.screenshotThemes[0],
            targetAppId: app.id,
          }))}
          onOpenApp={onOpenApp}
        />
      )}

      <SmallLockupSection
        title={tr(
          `${category.name} (${matching.length} Verified ${matching.length === 1 ? 'Studio' : 'Studios'})`,
          `${category.name} (검증 스튜디오 ${matching.length}종)`
        )}
        apps={matching}
        showPlatform
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
      />
    </div>
  );
};

/* =========================================================
   RELEASES & CHANGELOG PAGE
   ========================================================= */
interface FirestoreReleaseDoc {
  releaseId: string;
  title: string;
  appsPublished: number;
  publishedAtIso: string;
  notes: string;
}

export const UpdatesView: React.FC<{
  apps: BioApp[];
  onOpenApp: (appId: string) => void;
}> = ({ apps, onOpenApp }) => {
  const { tr } = useLocale();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [liveReleases, setLiveReleases] = useState<FirestoreReleaseDoc[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'releases'), limit(10)))
      .then((snap) => {
        const docs: FirestoreReleaseDoc[] = [];
        snap.forEach((d) => {
          const data = d.data() as Partial<FirestoreReleaseDoc>;
          if (data.title) {
            docs.push({
              releaseId: data.releaseId || d.id,
              title: data.title,
              appsPublished: Number(data.appsPublished || apps.length),
              publishedAtIso: data.publishedAtIso || '',
              notes: data.notes || '',
            });
          }
        });
        setLiveReleases(docs);
      })
      .catch(() => {});
  }, [apps.length]);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">
          {tr('Releases & Changelog', '릴리스 및 변경 기록')}
        </h1>
        <span className="updates-count-meta">
          {tr(
            `${apps.length} Live Verified Studios Deployed`,
            `실행 검증된 바이오 스튜디오 ${apps.length}종 배포됨`
          )}
        </span>
      </div>

      {liveReleases.map((rel) => (
        <div key={rel.releaseId} className="release-feed-banner">
          <div className="release-feed-title-row">
            <strong className="release-feed-title">{rel.title}</strong>
            <code className="release-feed-id">{rel.releaseId}</code>
          </div>
          <p className="release-feed-notes">{rel.notes}</p>
        </div>
      ))}

      <h2 className="mas-section-title updates-grid-heading">
        {tr(
          `Deployed Studio Versions (${apps.length})`,
          `배포된 스튜디오 버전 목록 (${apps.length})`
        )}
      </h2>
      <div className="t10-updates-grid">
        {apps.map((app) => {
          const rel = app.releases[0];
          const isExpanded = !!expandedIds[app.id];
          const rawNotes =
            rel?.notes || 'Verified live runtime and bioapp.yaml I/O contract.';
          const needsMore = rawNotes.length > 130 && !isExpanded;

          return (
            <div key={app.id} className="t10-update-card">
              <div className="t10-update-top">
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
                  <span className="t7-meta">
                    <span className="t7-name">{app.name}</span>
                    <span className="t7-sub">
                      v{rel?.version || '1.0.0'} · {app.platformNote || app.languageLabel}
                    </span>
                  </span>
                </button>
                <GetActionButton
                  app={app}
                  onTrigger={(id, e) => {
                    e.stopPropagation();
                    onOpenApp(id);
                  }}
                />
              </div>

              <p className="t10-notes">
                {needsMore ? `${rawNotes.slice(0, 126)}… ` : rawNotes}
                {needsMore && (
                  <button
                    type="button"
                    className="mas-link-btn"
                    onClick={() =>
                      setExpandedIds((prev) => ({ ...prev, [app.id]: true }))
                    }
                  >
                    {tr('more', '더 보기')}
                  </button>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   SEARCH RESULTS PAGE
   ========================================================= */
export const SearchView: React.FC<{
  query: string;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSelectSuggestion: (q: string) => void;
  onRequestToolInWorkspace?: () => void;
}> = ({
  query: searchQuery,
  apps,
  installStates,
  onInstall,
  onOpenApp,
  onSelectSuggestion,
  onRequestToolInWorkspace,
}) => {
  const { tr } = useLocale();
  const [tierSeg, setTierSeg] = useState<'all' | 'browser' | 'worker'>('all');

  const trimmed = searchQuery.trim();
  const suggestions = [
    'NucleoSpec',
    'AlphaFold',
    'OpenTargets',
    'RDKit',
    'ChEMBL',
    'PyDESeq2',
    'Enrichr',
    'CRISPR',
    'Primer3',
    'ClinVar',
    'Survival',
    'CellTypist',
  ];

  if (!trimmed) {
    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">{tr('Search', '검색')}</h1>
        </div>
        <h2 className="mas-section-title search-suggestions-heading">
          {tr('Verified Studios & Assays', '주요 검증 스튜디오 및 분석 키워드')}
        </h2>
        <div className="search-suggestions-row">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="t5-filter-chip"
              onClick={() => onSelectSuggestion(tag)}
            >
              <SearchIcon size={13} aria-hidden="true" />
              <span>{tag}</span>
            </button>
          ))}
        </div>

        <SmallLockupSection
          title={tr(
            `All Verified Live Studios (${apps.length})`,
            `전체 검증 스튜디오 (${apps.length})`
          )}
          apps={apps}
          limitCount={apps.length}
          showPlatform
          installStates={installStates}
          onInstall={onInstall}
          onOpenApp={onOpenApp}
        />
      </div>
    );
  }

  const qLower = trimmed.toLowerCase();
  let matched = apps.filter(
    (a) =>
      a.id.toLowerCase().includes(qLower) ||
      a.name.toLowerCase().includes(qLower) ||
      a.subtitle.toLowerCase().includes(qLower) ||
      a.categoryLabel.toLowerCase().includes(qLower) ||
      a.description.toLowerCase().includes(qLower) ||
      (a.platformNote || '').toLowerCase().includes(qLower)
  );

  if (tierSeg === 'browser') {
    matched = matched.filter((a) => !a.isCloudContainer);
  } else if (tierSeg === 'worker') {
    matched = matched.filter((a) => a.isCloudContainer);
  }

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row search-results-title-row">
        <h1 className="mas-page-title">
          {tr(`Results for “${trimmed}”`, `“${trimmed}” 검색 결과`)}
        </h1>
      </div>

      <div className="t11-filter-bar">
        <div
          className="t11-segmented"
          role="tablist"
          aria-label={tr('Filter search results by runtime', '실행 환경별 필터')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tierSeg === 'all'}
            className={`t11-seg-btn ${tierSeg === 'all' ? 'active' : ''}`}
            onClick={() => setTierSeg('all')}
          >
            {tr(`All Verified (${matched.length})`, `전체 (${matched.length})`)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tierSeg === 'browser'}
            className={`t11-seg-btn ${tierSeg === 'browser' ? 'active' : ''}`}
            onClick={() => setTierSeg('browser')}
          >
            {tr('Browser & Public API', '브라우저 · 공개 API')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tierSeg === 'worker'}
            className={`t11-seg-btn ${tierSeg === 'worker' ? 'active' : ''}`}
            onClick={() => setTierSeg('worker')}
          >
            {tr('Cloud Run Python CPU', 'Cloud Run Python CPU')}
          </button>
        </div>
      </div>

      {matched.length === 0 ? (
        <div className="search-empty-card">
          <h2 className="search-empty-title">
            {tr(
              `No verified live studio matches “${trimmed}” yet`,
              `“${trimmed}”에 해당하는 검증 스튜디오가 아직 없습니다`
            )}
          </h2>
          <p className="search-empty-desc">
            {tr(
              `OpenBioApp lists only real, regression-tested executable studios. Submit a GitHub URL or paper DOI to enqueue “${trimmed}” for the Nightly Repo-to-App Factory.`,
              `OpenBioApp은 회귀 테스트를 통과한 실제 실행 가능 도구만 등재합니다. GitHub 주소나 논문 DOI를 등록하면 “${trimmed}” 도구를 야간 자동 변환 큐에 추가할 수 있습니다.`
            )}
          </p>
          {onRequestToolInWorkspace && (
            <button
              type="button"
              className="mas-get-pill solid-blue"
              onClick={onRequestToolInWorkspace}
            >
              {tr(
                `+ Request “${trimmed}” in Repo-to-App Queue`,
                `+ “${trimmed}” 도구 변환 신청하기`
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="t11-results-grid">
          {matched.map((app) => (
            <div key={app.id} className="t11-result-card">
              <div className="t11-result-head">
                <button
                  type="button"
                  className="lockup-main-btn"
                  onClick={() => onOpenApp(app.id)}
                >
                  <BioAppIcon
                    glyph={app.iconGlyph}
                    gradient={app.iconGradient}
                    accent={app.iconAccent}
                    size={52}
                  />
                  <span className="t7-meta">
                    <span className="t7-name">{app.name}</span>
                    <span className="t7-sub">{app.subtitle}</span>
                    <VerifiedRuntimeBadge appId={app.id} />
                  </span>
                </button>
                <GetActionButton
                  app={app}
                  installState={installStates[app.id]}
                  onTrigger={onInstall}
                />
              </div>

              <button
                type="button"
                className="t11-screenshot-wrap"
                onClick={() => onOpenApp(app.id)}
                aria-label={tr(`Open ${app.name} studio`, `${app.name} 스튜디오 열기`)}
              >
                <VerifiedManifestPreviewCard appId={app.id} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SEE ALL SUBPAGE GRID
   ========================================================= */
export const SeeAllGridView: React.FC<{
  title: string;
  apps: BioApp[];
  ranked?: boolean;
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ title, apps, ranked, installStates, onInstall, onOpenApp }) => {
  return (
    <div className="mas-page-content subpage-offset">
      <h1 className="mas-page-title see-all-heading">{title}</h1>
      <div className="t7-grid flow-row">
        {apps.map((app, idx) => (
          <AppLockupRow
            key={app.id}
            app={app}
            rank={ranked ? idx + 1 : undefined}
            showPlatform
            installState={installStates[app.id]}
            onTriggerInstall={onInstall}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </div>
  );
};
