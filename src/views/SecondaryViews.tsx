import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BioApp, BioCategory, BioCategoryId } from '../types/store';
import {
  AppScreenshotArt,
  BioAppIcon,
  CategoryDuotoneIcon,
} from '../components/BioArtwork';
import {
  GetActionButton,
  InstallStateMap,
  MonochromeStars,
  SmallLockupSection,
  TopShowcaseRow,
} from '../components/StorePrimitives';

/* =========================================================
   CATEGORIES DIRECTORY PAGE (14-categories.png)
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
  const editorsChoice = apps.slice(0, 9);
  const essentials = apps.slice(4, 13);

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">Categories</h1>
      </div>

      {/* 4-Column Duotone-Icon Directory Grid */}
      <div className="t9-category-grid">
        {categories.map((cat) => (
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
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <SmallLockupSection
        title="Editors’ Choice: Top Bio Tools for Every Lab"
        apps={editorsChoice}
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            'Editors’ Choice: Top Bio Tools for Every Lab',
            editorsChoice.map((a) => a.id)
          )
        }
      />

      <SmallLockupSection
        title="New to Computational Biology? Try These Mac Essentials"
        apps={essentials}
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
        onSeeAll={() =>
          onSeeAll(
            'Mac Computational Biology Essentials',
            essentials.map((a) => a.id)
          )
        }
      />
    </div>
  );
};

/* =========================================================
   CATEGORY SUBPAGE (15-category-medical.png)
   ========================================================= */
export const CategoryDetailView: React.FC<{
  category: BioCategory;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
}> = ({ category, apps, installStates, onInstall, onOpenApp }) => {
  const matching = apps.filter((a) => a.categoryId === category.id);
  const filled =
    matching.length >= 6
      ? matching
      : [...matching, ...apps.filter((a) => a.categoryId !== category.id)].slice(0, 9);

  return (
    <div className="mas-page-content subpage-offset">
      <TopShowcaseRow
        items={[
          {
            id: `cat-s1-${category.id}`,
            eyebrow: 'ESSENTIALS',
            title: filled[0].name,
            subtitle: filled[0].subtitle,
            bgGradient: [category.colorPrimary, '#0f172a', category.colorSecondary],
            glyph: category.glyph,
            screenshotTheme: filled[0].screenshotThemes[0],
            targetAppId: filled[0].id,
          },
          {
            id: `cat-s2-${category.id}`,
            eyebrow: 'LAB STANDARD',
            title: filled[1].name,
            subtitle: filled[1].subtitle,
            bgGradient: ['#1e1b4b', category.colorPrimary, category.colorSecondary],
            glyph: filled[1].iconGlyph,
            screenshotTheme: filled[1].screenshotThemes[0],
            targetAppId: filled[1].id,
          },
        ]}
        onOpenApp={onOpenApp}
      />

      <SmallLockupSection
        title={`Top Open-Source & Free in ${category.name}`}
        apps={filled}
        ranked
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
      />

      <SmallLockupSection
        title="Academic & Enterprise Suites"
        apps={[...filled].reverse()}
        ranked
        installStates={installStates}
        onInstall={onInstall}
        onOpenApp={onOpenApp}
      />
    </div>
  );
};

/* =========================================================
   UPDATES PAGE (16-updates.png — 2-Column Update Grid!)
   ========================================================= */
export const UpdatesView: React.FC<{
  pendingApps: BioApp[];
  updatedApps: BioApp[];
  updatingMap: { [id: string]: boolean };
  onUpdateOne: (appId: string, e: React.MouseEvent) => void;
  onUpdateAll: () => void;
  onOpenApp: (appId: string) => void;
}> = ({
  pendingApps,
  updatedApps,
  updatingMap,
  onUpdateOne,
  onUpdateAll,
  onOpenApp,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row">
        <h1 className="mas-page-title">Updates</h1>
        {pendingApps.length > 0 && (
          <button
            type="button"
            className="mas-link-btn"
            style={{ fontSize: 15 }}
            onClick={onUpdateAll}
          >
            Update All
          </button>
        )}
      </div>

      {pendingApps.length > 0 ? (
        <>
          <h2 className="mas-section-title" style={{ marginBottom: 8 }}>
            Available
          </h2>
          <div className="t10-updates-grid">
            {pendingApps.map((app) => {
              const rel = app.releases[0];
              const isExpanded = !!expandedIds[app.id];
              const rawNotes = rel?.notes || 'Bug fixes, Apple Silicon MLX speedups, and benchmark updates.';
              const needsMore = rawNotes.length > 125 && !isExpanded;

              return (
                <div key={app.id} className="t10-update-card">
                  <div className="t10-update-top">
                    <div
                      onClick={() => onOpenApp(app.id)}
                      style={{ cursor: 'pointer' }}
                    >
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
                      <div className="t7-sub">{rel?.relativeDate || 'Yesterday'}</div>
                    </div>
                    <GetActionButton
                      app={app}
                      installState={updatingMap[app.id] ? 'installing' : 'idle'}
                      onTrigger={onUpdateOne}
                      variant="update"
                      hideNote
                    />
                  </div>

                  <p className="t10-notes">
                    {needsMore ? `${rawNotes.slice(0, 122)}… ` : rawNotes}
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
        </>
      ) : (
        <div
          style={{
            padding: '36px 24px',
            borderRadius: 14,
            background: 'var(--bg-card-subtle)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: 28,
          }}
        >
          All Bio tools, container digests, and foundation model weights are up to date.
        </div>
      )}

      {updatedApps.length > 0 && (
        <div style={{ marginTop: 34 }}>
          <h2 className="mas-section-title" style={{ marginBottom: 8 }}>
            Updated Recently
          </h2>
          <div className="t10-updates-grid">
            {updatedApps.map((app) => (
              <div key={app.id} className="t10-update-card">
                <div className="t10-update-top">
                  <BioAppIcon
                    glyph={app.iconGlyph}
                    gradient={app.iconGradient}
                    accent={app.iconAccent}
                    size={56}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t7-name">{app.name}</div>
                    <div className="t7-sub">Just now · Version {app.releases[0]?.version}</div>
                  </div>
                  <GetActionButton
                    app={app}
                    installState="installed"
                    onTrigger={(_, e) => {
                      e.stopPropagation();
                      onOpenApp(app.id);
                    }}
                    hideNote
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SEARCH RESULTS & DISCOVER TAGS PAGE (18-search-results.png)
   ========================================================= */
export const SearchView: React.FC<{
  query: string;
  apps: BioApp[];
  installStates: InstallStateMap;
  onInstall: (appId: string, e: React.MouseEvent) => void;
  onOpenApp: (appId: string) => void;
  onSelectSuggestion: (q: string) => void;
}> = ({
  query,
  apps,
  installStates,
  onInstall,
  onOpenApp,
  onSelectSuggestion,
}) => {
  const [platformSeg, setPlatformSeg] = useState<'mac' | 'cloud'>('mac');
  const [sortByRating, setSortByRating] = useState(false);

  const trimmed = query.trim();
  const suggestions = [
    'DNA',
    'AlphaFold',
    'CRISPR',
    'Single-Cell',
    'Plasmid',
    'Cryo-EM',
    'Nextflow',
    'Docking',
  ];

  if (!trimmed) {
    return (
      <div className="mas-page-content">
        <div className="mas-page-title-row">
          <h1 className="mas-page-title">Search</h1>
        </div>
        <h2 className="mas-section-title" style={{ marginBottom: 14 }}>
          Trending Bio Queries
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
          title="Suggested Bio Tools"
          apps={apps.slice(0, 9)}
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
      a.name.toLowerCase().includes(qLower) ||
      a.subtitle.toLowerCase().includes(qLower) ||
      a.categoryLabel.toLowerCase().includes(qLower) ||
      a.description.toLowerCase().includes(qLower)
  );
  if (matched.length === 0) {
    matched = apps.slice(0, 6);
  }
  if (platformSeg === 'cloud') {
    matched = matched.filter((a) => a.isCloudContainer || a.isArcade);
  }
  if (sortByRating) {
    matched = [...matched].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="mas-page-content">
      <div className="mas-page-title-row" style={{ marginBottom: 14 }}>
        <h1 className="mas-page-title">Results for “{trimmed}”</h1>
      </div>

      {/* Segmented Control + Filters Dropdown (18-search-results.png) */}
      <div className="t11-filter-bar">
        <div className="t11-segmented" role="tablist">
          <button
            type="button"
            className={`t11-seg-btn ${platformSeg === 'mac' ? 'active' : ''}`}
            onClick={() => setPlatformSeg('mac')}
          >
            Mac Apps
          </button>
          <button
            type="button"
            className={`t11-seg-btn ${platformSeg === 'cloud' ? 'active' : ''}`}
            onClick={() => setPlatformSeg('cloud')}
          >
            Cloud &amp; CLI Containers
          </button>
        </div>

        <button
          type="button"
          className="mas-link-btn"
          onClick={() => setSortByRating((v) => !v)}
        >
          {sortByRating ? 'Sorted: Highest Rated' : 'Filters'}{' '}
          <ChevronDown size={15} />
        </button>
      </div>

      {/* 2-Column Search Result Cards with 16:10 Screenshot Preview */}
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
                <div style={{ marginTop: 2 }}>
                  <MonochromeStars rating={app.rating} count={app.ratingCount} />
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
              <AppScreenshotArt
                theme={app.screenshotThemes[0]}
                appName={app.name}
                accent={app.iconAccent}
              />
            </div>
          </div>
        ))}
      </div>
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
              <MonochromeStars rating={app.rating} count={app.ratingCount} size={10} />
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
