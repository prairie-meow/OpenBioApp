import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { BioApp, BioCategory, BioCategoryId } from '../types/store';
import {
  BioAppIcon,
  CategoryDuotoneIcon,
} from '../components/BioArtwork';
import {
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
  const activeCategories = categories.filter((cat) =>
    apps.some((a) => a.categoryId === cat.id)
  );
  const domainApps = apps.slice(0, 9);
  const bridgeAndUtilityApps = apps.slice(9);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">Categories</h1>
      </div>

      {/* 4-Column Duotone-Icon Directory Grid */}
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
              <span style={{ flex: 1, textAlign: 'left' }}>{cat.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <SmallLockupSection
        title="Core Biomedical Analysis Studios"
        apps={domainApps}
        showPlatform
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            `All Verified Studios (${apps.length})`,
            apps.map((a) => a.id)
          )
        }
      />

      {bridgeAndUtilityApps.length > 0 && (
        <SmallLockupSection
          title="Clinical Survival, Single-Cell & Bridge Utilities"
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
   CATEGORY SUBPAGE (STRICTLY MATCHING REAL APPS — NO PADDING)
   ========================================================= */
export const CategoryDetailView: React.FC<{
  category: BioCategory;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ category, apps, installStates, onInstall, onOpenApp }) => {
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
        title={`${category.name} (${matching.length} Verified ${matching.length === 1 ? 'App' : 'Apps'})`}
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
   UPDATES PAGE (LIVE FIRESTORE RELEASES & DEPLOYED CHANGELOG)
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
        <h1 className="mas-page-title">Releases &amp; Changelog</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {apps.length} Live Verified Studios Deployed
        </span>
      </div>

      {liveReleases.map((rel) => (
        <div
          key={rel.releaseId}
          style={{
            padding: '18px 22px',
            borderRadius: 14,
            background: '#f5f5f7',
            border: '1px solid var(--divider-hairline)',
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#007aff', textTransform: 'uppercase' }}>
            FIRESTORE LIVE RELEASE FEED · {rel.releaseId}
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 700, marginTop: 4 }}>
            {rel.title}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {rel.notes}
          </p>
        </div>
      ))}

      <h2 className="mas-section-title" style={{ marginBottom: 10 }}>
        Deployed Studio Versions ({apps.length})
      </h2>
      <div className="t10-updates-grid">
        {apps.map((app) => {
          const rel = app.releases[0];
          const isExpanded = !!expandedIds[app.id];
          const rawNotes = rel?.notes || 'Verified live runtime and bioapp.yaml I/O contract.';
          const needsMore = rawNotes.length > 130 && !isExpanded;

          return (
            <div key={app.id} className="t10-update-card">
              <div className="t10-update-top">
                <div onClick={() => onOpenApp(app.id)} style={{ cursor: 'pointer' }}>
                  <BioAppIcon
                    glyph={app.iconGlyph}
                    gradient={app.iconGradient}
                    accent={app.iconAccent}
                    size={56}
                  />
                </div>
                <div
                  onClick={() => onOpenApp(app.id)}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                >
                  <div className="t7-name" style={{ fontSize: 15 }}>
                    {app.name}
                  </div>
                  <div className="t7-sub">
                    v{rel?.version || '1.0.0'} · {app.platformNote || app.languageLabel}
                  </div>
                </div>
                <GetActionButton
                  app={app}
                  onTrigger={(id, e) => {
                    e.stopPropagation();
                    onOpenApp(id);
                  }}
                  hideNote
                  labelOverride="Launch"
                />
              </div>

              <p className="t10-notes">
                {needsMore ? `${rawNotes.slice(0, 126)}… ` : rawNotes}
                {needsMore && (
                  <button
                    type="button"
                    className="mas-link-btn"
                    style={{ fontSize: 13, float: 'right' }}
                    onClick={() =>
                      setExpandedIds((prev) => ({ ...prev, [app.id]: true }))
                    }
                  >
                    more
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
   SEARCH RESULTS PAGE (ZERO FAKE FALLBACKS + REAL TIER FILTER)
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
          <h1 className="mas-page-title">Search</h1>
        </div>
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          Verified Studios &amp; Assays
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="t5-filter-chip"
              onClick={() => onSelectSuggestion(tag)}
            >
              🔍 &nbsp;{tag}
            </button>
          ))}
        </div>

        <SmallLockupSection
          title={`All Verified Live Studios (${apps.length})`}
          apps={apps}
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
      <div className="mas-page-title-row" style={{ marginBottom: 14 }}>
        <h1 className="mas-page-title">Results for “{trimmed}”</h1>
      </div>

      {/* Real Execution Tier Segmented Filter */}
      <div className="t11-filter-bar">
        <div className="t11-segmented" role="tablist">
          <button
            type="button"
            className={`t11-seg-btn ${tierSeg === 'all' ? 'active' : ''}`}
            onClick={() => setTierSeg('all')}
          >
            All Verified ({matched.length})
          </button>
          <button
            type="button"
            className={`t11-seg-btn ${tierSeg === 'browser' ? 'active' : ''}`}
            onClick={() => setTierSeg('browser')}
          >
            Browser &amp; Public API
          </button>
          <button
            type="button"
            className={`t11-seg-btn ${tierSeg === 'worker' ? 'active' : ''}`}
            onClick={() => setTierSeg('worker')}
          >
            Cloud Run Python CPU
          </button>
        </div>
      </div>

      {matched.length === 0 ? (
        <div
          style={{
            background: '#f5f5f7',
            borderRadius: 14,
            padding: '32px 24px',
            textAlign: 'center',
            border: '1px solid var(--divider-hairline)',
          }}
        >
          <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 6 }}>
            No verified live app matches “{trimmed}” yet
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 auto 16px', maxWidth: 520 }}>
            OpenBioApp lists only real, regression-tested executable studios. Submit a GitHub URL or paper DOI to enqueue “{trimmed}” for the Nightly Repo-to-App Factory.
          </p>
          {onRequestToolInWorkspace && (
            <button
              type="button"
              className="mas-get-pill solid-blue"
              style={{ height: 34, padding: '0 18px', fontSize: 13 }}
              onClick={onRequestToolInWorkspace}
            >
              + Request “{trimmed}” in Repo-to-App Queue
            </button>
          )}
        </div>
      ) : (
        <div className="t11-results-grid">
          {matched.map((app) => (
            <div key={app.id} className="t11-result-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
                onClick={() => onOpenApp(app.id)}
              >
                <BioAppIcon
                  glyph={app.iconGlyph}
                  gradient={app.iconGradient}
                  accent={app.iconAccent}
                  size={52}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t7-name" style={{ fontSize: 15.5 }}>
                    {app.name}
                  </div>
                  <div className="t7-sub">{app.subtitle}</div>
                  <div style={{ marginTop: 3 }}>
                    <VerifiedRuntimeBadge appId={app.id} />
                  </div>
                </div>
                <GetActionButton
                  app={app}
                  installState={installStates[app.id]}
                  onTrigger={onInstall}
                />
              </div>

              <div
                className="t11-screenshot-wrap"
                onClick={() => onOpenApp(app.id)}
              >
                <VerifiedManifestPreviewCard appId={app.id} />
              </div>
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
      <h1 className="mas-page-title" style={{ fontSize: 28, marginBottom: 20 }}>
        {title}
      </h1>
      <div className="t7-grid flow-row">
        {apps.map((app, idx) => (
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
              size={62}
            />
            {ranked && <span className="t7-rank">{idx + 1}</span>}
            <div className="t7-meta">
              <span className="t7-name">{app.name}</span>
              <span className="t7-sub">{app.subtitle}</span>
              <VerifiedRuntimeBadge appId={app.id} />
            </div>
            <GetActionButton
              app={app}
              installState={installStates[app.id]}
              onTrigger={onInstall}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
