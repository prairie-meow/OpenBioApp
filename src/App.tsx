import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import {
  ChevronLeft,
  Cpu,
  Download,
  FolderKanban,
  LayoutGrid,
  Search,
  Settings,
  Share,
  Star,
  X,
} from 'lucide-react';
import {
  BIO_APPS,
  BIO_CATEGORIES,
  EDITORIAL_STORIES,
} from './data/bioStoreData';
import { BioApp, BioCategoryId, RouteView, SidebarTabId } from './types/store';
import { BioAppIcon } from './components/BioArtwork';
import { InstallStateMap } from './components/StorePrimitives';
import {
  BioAccountSheetCard,
  BioSettingsWindowCard,
} from './components/ProfileAndSettingsModals';
import { StorefrontTabsView } from './views/StorefrontTabsView';
import {
  CategoriesView,
  CategoryDetailView,
  SearchView,
  SeeAllGridView,
  UpdatesView,
} from './views/SecondaryViews';
import { AppDetailView } from './views/AppDetailView';
import { EditorialStoryView } from './views/EditorialStoryView';
import { WorkspaceView } from './views/WorkspaceView';
import { AutoResearchView } from './views/AutoResearchView';
import { BIO_APP_MANIFESTS, BioDataType } from './lib/schema/bioAppSchema';
import {
  loadLocalWorkspaceRuns,
  subscribeAuthUser,
} from './lib/workspace/workspaceStore';
import { db } from './lib/firebase';

const EXECUTABLE_BIO_APPS: BioApp[] = BIO_APPS.filter((a) =>
  Boolean(BIO_APP_MANIFESTS[a.id])
);

const SIDEBAR_ITEMS: {
  id: SidebarTabId;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'discover', label: 'Discover', icon: <Star size={16} strokeWidth={1.75} /> },
  { id: 'arcade', label: 'Auto-Research', icon: <Cpu size={16} strokeWidth={1.75} /> },
  { id: 'workspace', label: 'Workspace', icon: <FolderKanban size={16} strokeWidth={1.75} /> },
  { id: 'categories', label: 'Categories', icon: <LayoutGrid size={16} strokeWidth={1.75} /> },
  { id: 'updates', label: 'Releases', icon: <Download size={16} strokeWidth={1.75} /> },
];

export const App: React.FC = () => {
  const [history, setHistory] = useState<RouteView[]>([{ kind: 'tab', tab: 'discover' }]);
  const [catalogApps, setCatalogApps] = useState<BioApp[]>(EXECUTABLE_BIO_APPS);
  const [searchInput, setSearchInput] = useState('');
  const [installStates] = useState<InstallStateMap>({});
  const [scrolled, setScrolled] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showSettingsWindow, setShowSettingsWindow] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [workspaceCount, setWorkspaceCount] = useState<number>(
    () => loadLocalWorkspaceRuns().length
  );
  const [chainPayload, setChainPayload] = useState<{
    targetAppId: string;
    fromAppTitle: string;
    fromRunId?: string;
    outputs: Partial<Record<BioDataType, unknown>>;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentRoute = history[history.length - 1];

  useEffect(() => {
    const unsub = subscribeAuthUser((u) => setAuthUser(u));
    getDocs(query(collection(db, 'apps'), limit(50)))
      .then((snap) => {
        if (snap.empty) return;
        const remoteApps: BioApp[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Partial<BioApp>;
          if (
            d.id &&
            d.name &&
            Boolean(BIO_APP_MANIFESTS[d.id]) &&
            !EXECUTABLE_BIO_APPS.some((b) => b.id === d.id)
          ) {
            remoteApps.push({
              ...EXECUTABLE_BIO_APPS[0],
              ...d,
              id: d.id,
              name: d.name,
            });
          }
        });
        if (remoteApps.length > 0) {
          setCatalogApps([...EXECUTABLE_BIO_APPS, ...remoteApps]);
        }
      })
      .catch(() => {});

    return unsub;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAccountSheet(false);
        setShowSettingsWindow(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const resetScroll = () => {
    setScrolled(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const pushRoute = (next: RouteView) => {
    setHistory((prev) => [...prev, next]);
    resetScroll();
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
      resetScroll();
    }
  };

  const selectTab = (tab: SidebarTabId) => {
    setSearchInput('');
    setChainPayload(null);
    setHistory([{ kind: 'tab', tab }]);
    resetScroll();
  };

  const openAppDetail = (appId: string) => {
    if (!BIO_APP_MANIFESTS[appId]) return;
    setChainPayload(null);
    pushRoute({ kind: 'app-detail', appId });
  };

  const openAppWithChain = (
    targetAppId: string,
    payload?: {
      fromAppTitle: string;
      fromRunId?: string;
      outputs: Partial<Record<BioDataType, unknown>>;
    }
  ) => {
    if (!BIO_APP_MANIFESTS[targetAppId]) return;
    if (payload) {
      setChainPayload({ targetAppId, ...payload });
    } else {
      setChainPayload(null);
    }
    pushRoute({ kind: 'app-detail', appId: targetAppId });
  };

  const handleLaunchStudio = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openAppDetail(appId);
  };

  const activeSidebarTab: SidebarTabId | null = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const r = history[i];
      if (r.kind === 'tab') return r.tab;
      if (r.kind === 'category') return 'categories';
    }
    return null;
  }, [history]);

  const detailApp =
    currentRoute.kind === 'app-detail'
      ? catalogApps.find((a) => a.id === currentRoute.appId) || catalogApps[0]
      : null;

  const activeCategory =
    currentRoute.kind === 'category'
      ? BIO_CATEGORIES.find((c) => c.id === currentRoute.categoryId) || BIO_CATEGORIES[0]
      : null;

  const activeStory =
    currentRoute.kind === 'story'
      ? EDITORIAL_STORIES.find((s) => s.id === currentRoute.storyId) || EDITORIAL_STORIES[0]
      : null;

  const renderStickyToolbar = () => {
    if (currentRoute.kind === 'app-detail' && detailApp) {
      return (
        <header
          className={`mas-sticky-toolbar always-controls ${scrolled ? 'scrolled' : ''}`}
        >
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={goBack}
            title="Back"
          >
            <ChevronLeft size={18} />
          </button>

          {scrolled && (
            <div className="mas-sticky-center-title">
              <BioAppIcon
                glyph={detailApp.iconGlyph}
                gradient={detailApp.iconGradient}
                accent={detailApp.iconAccent}
                size={20}
              />
              <span>{detailApp.name}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
            <button
              type="button"
              className="mas-circle-nav-btn"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast(`Copied OpenBioApp link for ${detailApp.name}`);
              }}
              title="Copy Link"
            >
              <Share size={15} />
            </button>
          </div>
        </header>
      );
    }

    if (currentRoute.kind === 'category' && activeCategory) {
      return (
        <header className="mas-sticky-toolbar subpage-header">
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={goBack}
            title="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="mas-sticky-center-title">{activeCategory.name}</div>
          <div style={{ width: 32 }} />
        </header>
      );
    }

    if (currentRoute.kind === 'see-all') {
      return (
        <header className="mas-sticky-toolbar subpage-header">
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={goBack}
            title="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="mas-sticky-center-title">{currentRoute.title}</div>
          <div style={{ width: 32 }} />
        </header>
      );
    }

    if (currentRoute.kind === 'tab' && currentRoute.tab === 'arcade') {
      return (
        <header className={`mas-sticky-toolbar ${scrolled ? 'visible' : ''}`}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            <strong>OpenBioApp Auto-Research</strong> &nbsp;|&nbsp; Block-Verified Zero Hallucination
          </div>
          <div className="mas-sticky-center-title">Auto-Research</div>
          <button
            type="button"
            className="mas-get-pill solid-blue"
            style={{ height: 26, fontSize: 12 }}
            onClick={() => setShowSettingsWindow(true)}
          >
            BYOK Settings
          </button>
        </header>
      );
    }

    const tabLabel =
      currentRoute.kind === 'search'
        ? currentRoute.query
          ? `Results for “${currentRoute.query}”`
          : 'Search'
        : currentRoute.kind === 'tab'
        ? SIDEBAR_ITEMS.find((s) => s.id === currentRoute.tab)?.label || 'Discover'
        : '';

    return (
      <header className={`mas-sticky-toolbar ${scrolled ? 'visible' : ''}`}>
        <div style={{ width: 32 }} />
        <div className="mas-sticky-center-title">{tabLabel}</div>
        <div style={{ width: 32 }} />
      </header>
    );
  };

  const profileInitials = (authUser?.displayName || authUser?.email || 'OB')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell-outer">
      <div className="mac-app-store-window">
        {showAccountSheet && (
          <div
            className="mas-modal-backdrop"
            onClick={() => setShowAccountSheet(false)}
          >
            <BioAccountSheetCard
              apps={catalogApps}
              onClose={() => setShowAccountSheet(false)}
              onOpenApp={openAppDetail}
              onToast={showToast}
            />
          </div>
        )}

        {showSettingsWindow && (
          <div
            className="mas-modal-backdrop"
            onClick={() => setShowSettingsWindow(false)}
          >
            <BioSettingsWindowCard
              onClose={() => setShowSettingsWindow(false)}
              onToast={showToast}
            />
          </div>
        )}

        {currentRoute.kind === 'story' && activeStory && (
          <EditorialStoryView
            story={activeStory}
            featuredApp={
              catalogApps.find((a) => a.id === activeStory.featuredAppId) || catalogApps[0]
            }
            installStates={installStates}
            onInstall={handleLaunchStudio}
            onOpenApp={openAppDetail}
            onBack={goBack}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast(`Copied link for ${activeStory.title}`);
            }}
          />
        )}

        {/* LEFT 220PX #F5F5F7 WEB SIDEBAR */}
        <aside className="mas-sidebar">
          <button
            type="button"
            className="mas-brand-header"
            onClick={() => selectTab('discover')}
          >
            <BioAppIcon
              glyph="helix"
              gradient={['#062c49', '#007aff', '#38bdf8']}
              accent="#5ef2d6"
              size={28}
            />
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                }}
              >
                OpenBioApp
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Open-Source Bio Studios
              </div>
            </div>
          </button>

          <div className="mas-search-wrap">
            <form
              className="mas-search-pill"
              onSubmit={(e) => {
                e.preventDefault();
                setHistory([{ kind: 'search', query: searchInput }]);
                resetScroll();
              }}
            >
              <Search size={13.5} color="#86868b" strokeWidth={2.1} />
              <input
                className="mas-search-input"
                placeholder="Search tools, genes, formats…"
                value={searchInput}
                onFocus={() => {
                  if (currentRoute.kind !== 'search') {
                    pushRoute({ kind: 'search', query: searchInput });
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  setHistory([{ kind: 'search', query: val }]);
                  resetScroll();
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  className="mas-search-clear"
                  onClick={() => {
                    setSearchInput('');
                    setHistory([{ kind: 'search', query: '' }]);
                  }}
                  aria-label="Clear search"
                >
                  <X size={10} strokeWidth={2.8} />
                </button>
              )}
            </form>
          </div>

          <nav className="mas-nav-list" aria-label="OpenBioApp Navigation">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive =
                currentRoute.kind !== 'search' && activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mas-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => selectTab(item.id)}
                >
                  <span className="mas-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'workspace' && workspaceCount > 0 && (
                    <span className="mas-nav-badge">{workspaceCount}</span>
                  )}
                </button>
              );
            })}

            <div className="mas-sidebar-divider" />

            <button
              type="button"
              className="mas-nav-item"
              onClick={() => {
                setShowAccountSheet(false);
                setShowSettingsWindow(true);
              }}
            >
              <span className="mas-nav-icon">
                <Settings size={16} strokeWidth={1.75} />
              </span>
              <span>Settings</span>
            </button>
          </nav>

          {/* Bottom Researcher Account Footer */}
          <div className="mas-profile-footer">
            <button
              type="button"
              className="mas-profile-btn"
              onClick={() => {
                setShowSettingsWindow(false);
                setShowAccountSheet(true);
              }}
            >
              <span className="mas-profile-avatar">{profileInitials}</span>
              <div style={{ minWidth: 0 }}>
                <div
                  className="mas-profile-name"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {authUser ? authUser.displayName || authUser.email : 'Researcher Account'}
                </div>
                <div className="mas-profile-sub">
                  {authUser ? 'Cloud Sync Active' : 'Sign In / Guest'}
                </div>
              </div>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT CANVAS */}
        <main className="mas-main-stage">
          {renderStickyToolbar()}

          <div
            className="mas-scroll-container"
            ref={scrollContainerRef}
            onScroll={(e) => {
              setScrolled(e.currentTarget.scrollTop > 38);
            }}
          >
            {currentRoute.kind === 'tab' && currentRoute.tab === 'arcade' && (
              <AutoResearchView
                apps={catalogApps}
                onOpenApp={openAppDetail}
                onOpenSettings={() => setShowSettingsWindow(true)}
                onRunPersisted={() => setWorkspaceCount(loadLocalWorkspaceRuns().length)}
                onToast={showToast}
              />
            )}

            {currentRoute.kind === 'tab' && currentRoute.tab === 'workspace' && (
              <WorkspaceView
                onOpenAppWithChain={openAppWithChain}
                onToast={showToast}
              />
            )}

            {currentRoute.kind === 'tab' &&
              currentRoute.tab !== 'arcade' &&
              currentRoute.tab !== 'workspace' &&
              currentRoute.tab !== 'categories' &&
              currentRoute.tab !== 'updates' &&
              currentRoute.tab !== 'design-template' && (
                <StorefrontTabsView
                  tab={currentRoute.tab}
                  apps={catalogApps}
                  categories={BIO_CATEGORIES}
                  installStates={installStates}
                  onInstall={handleLaunchStudio}
                  onOpenApp={openAppDetail}
                  onOpenStory={(storyId) => pushRoute({ kind: 'story', storyId })}
                  onOpenCategory={(catId: BioCategoryId) =>
                    pushRoute({ kind: 'category', categoryId: catId })
                  }
                  onSeeAll={(title, appIds, ranked) =>
                    pushRoute({ kind: 'see-all', title, appIds, ranked })
                  }
                  onNavigateAutoResearch={() => selectTab('arcade')}
                  onNavigateWorkspace={() => selectTab('workspace')}
                />
              )}

            {currentRoute.kind === 'tab' && currentRoute.tab === 'categories' && (
              <CategoriesView
                categories={BIO_CATEGORIES}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleLaunchStudio}
                onOpenApp={openAppDetail}
                onSelectCategory={(catId) =>
                  pushRoute({ kind: 'category', categoryId: catId })
                }
                onSeeAll={(title, appIds) =>
                  pushRoute({ kind: 'see-all', title, appIds })
                }
              />
            )}

            {currentRoute.kind === 'tab' && currentRoute.tab === 'updates' && (
              <UpdatesView
                apps={catalogApps}
                onOpenApp={openAppDetail}
              />
            )}

            {currentRoute.kind === 'category' && activeCategory && (
              <CategoryDetailView
                category={activeCategory}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleLaunchStudio}
                onOpenApp={openAppDetail}
              />
            )}

            {currentRoute.kind === 'search' && (
              <SearchView
                query={currentRoute.query}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleLaunchStudio}
                onOpenApp={openAppDetail}
                onSelectSuggestion={(q) => {
                  setSearchInput(q);
                  setHistory([{ kind: 'search', query: q }]);
                }}
                onRequestToolInWorkspace={() => selectTab('workspace')}
              />
            )}

            {currentRoute.kind === 'app-detail' && detailApp && (
              <AppDetailView
                key={detailApp.id}
                app={detailApp}
                allApps={catalogApps}
                installStates={installStates}
                onInstall={handleLaunchStudio}
                onOpenApp={openAppDetail}
                onOpenCategory={(catId) =>
                  pushRoute({ kind: 'category', categoryId: catId })
                }
                incomingChainPayload={
                  chainPayload && chainPayload.targetAppId === detailApp.id
                    ? chainPayload
                    : null
                }
                onChainToApp={(targetId, payload) => openAppWithChain(targetId, payload)}
                onRunPersisted={() => setWorkspaceCount(loadLocalWorkspaceRuns().length)}
                onToast={showToast}
              />
            )}

            {currentRoute.kind === 'see-all' && (
              <SeeAllGridView
                title={currentRoute.title}
                apps={currentRoute.appIds
                  .map((id) => catalogApps.find((a) => a.id === id)!)
                  .filter(Boolean)}
                ranked={currentRoute.ranked}
                installStates={installStates}
                onInstall={handleLaunchStudio}
                onOpenApp={openAppDetail}
              />
            )}
          </div>

          {toastMsg && (
            <div
              style={{
                position: 'absolute',
                bottom: 22,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(29, 29, 31, 0.88)',
                backdropFilter: 'blur(20px)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 500,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 80,
                whiteSpace: 'nowrap',
              }}
            >
              {toastMsg}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
