import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import {
  ChevronLeft,
  Cpu,
  Download,
  FolderKanban,
  Hammer,
  LayoutGrid,
  Paintbrush,
  Rocket,
  Search,
  Send,
  Settings,
  Share,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  BIO_APPS,
  BIO_CATEGORIES,
  EDITORIAL_STORIES,
  INITIAL_UPDATES_IDS,
} from './data/bioStoreData';
import { BioApp, BioCategoryId, RouteView, SidebarTabId } from './types/store';
import { BioAppIcon } from './components/BioArtwork';
import { GetActionButton, InstallStateMap } from './components/StorePrimitives';
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
import { BrandDesignTemplateView } from './views/BrandDesignTemplateView';
import { WorkspaceView } from './views/WorkspaceView';
import { AutoResearchView } from './views/AutoResearchView';
import { BioDataType } from './lib/schema/bioAppSchema';
import {
  loadLocalWorkspaceRuns,
  subscribeAuthUser,
} from './lib/workspace/workspaceStore';
import { db } from './lib/firebase';

const SIDEBAR_ITEMS: {
  id: SidebarTabId;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'discover', label: 'Discover', icon: <Star size={16} strokeWidth={1.75} /> },
  { id: 'arcade', label: 'Auto-Research', icon: <Cpu size={16} strokeWidth={1.75} /> },
  { id: 'workspace', label: 'Workspace', icon: <FolderKanban size={16} strokeWidth={1.75} /> },
  { id: 'create', label: 'Create', icon: <Paintbrush size={16} strokeWidth={1.75} /> },
  { id: 'work', label: 'Work', icon: <Send size={16} strokeWidth={1.75} /> },
  { id: 'play', label: 'Play', icon: <Rocket size={16} strokeWidth={1.75} /> },
  { id: 'develop', label: 'Develop', icon: <Hammer size={16} strokeWidth={1.75} /> },
  { id: 'categories', label: 'Categories', icon: <LayoutGrid size={16} strokeWidth={1.75} /> },
  { id: 'updates', label: 'Updates', icon: <Download size={16} strokeWidth={1.75} /> },
];

export const App: React.FC = () => {
  const [history, setHistory] = useState<RouteView[]>([{ kind: 'tab', tab: 'discover' }]);
  const [catalogApps, setCatalogApps] = useState<BioApp[]>(BIO_APPS);
  const [searchInput, setSearchInput] = useState('');
  const [installStates, setInstallStates] = useState<InstallStateMap>({});
  const [pendingUpdateIds, setPendingUpdateIds] = useState<string[]>(INITIAL_UPDATES_IDS);
  const [updatedIds, setUpdatedIds] = useState<string[]>([]);
  const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);
  const [framedMode, setFramedMode] = useState(false);
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
    // Fetch any Nightly Factory dynamically published apps from Firestore ('openbioapp' DB)
    getDocs(query(collection(db, 'apps'), limit(50)))
      .then((snap) => {
        if (snap.empty) return;
        const remoteApps: BioApp[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Partial<BioApp>;
          if (d.id && d.name && !BIO_APPS.some((b) => b.id === d.id)) {
            remoteApps.push({
              ...BIO_APPS[0],
              ...d,
              id: d.id,
              name: d.name,
            });
          }
        });
        if (remoteApps.length > 0) {
          setCatalogApps([...BIO_APPS, ...remoteApps]);
        }
      })
      .catch(() => {});

    return unsub;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowAccountSheet(false);
        setShowSettingsWindow((v) => !v);
      } else if (e.key === 'Escape') {
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
    if (payload) {
      setChainPayload({ targetAppId, ...payload });
    } else {
      setChainPayload(null);
    }
    pushRoute({ kind: 'app-detail', appId: targetAppId });
  };

  const handleInstall = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cur = installStates[appId] || 'idle';
    if (cur === 'installed') {
      openAppDetail(appId);
      return;
    }
    if (cur === 'installing') return;

    setInstallStates((prev) => ({ ...prev, [appId]: 'installing' }));
    window.setTimeout(() => {
      setInstallStates((prev) => ({ ...prev, [appId]: 'installed' }));
      openAppDetail(appId);
    }, 350);
  };

  const handleUpdateOne = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (updatingMap[appId]) return;
    setUpdatingMap((prev) => ({ ...prev, [appId]: true }));
    window.setTimeout(() => {
      setUpdatingMap((prev) => ({ ...prev, [appId]: false }));
      setPendingUpdateIds((prev) => prev.filter((id) => id !== appId));
      setUpdatedIds((prev) => [appId, ...prev.filter((id) => id !== appId)]);
    }, 650);
  };

  const handleUpdateAll = () => {
    const ids = [...pendingUpdateIds];
    const nextUpdating: Record<string, boolean> = {};
    ids.forEach((id) => {
      nextUpdating[id] = true;
    });
    setUpdatingMap(nextUpdating);
    window.setTimeout(() => {
      setUpdatingMap({});
      setPendingUpdateIds([]);
      setUpdatedIds((prev) => [...ids, ...prev]);
      showToast(`Synced all ${ids.length} Nightly Factory OpenBioApp releases.`);
    }, 850);
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

  const pendingUpdateApps = pendingUpdateIds
    .map((id) => catalogApps.find((a) => a.id === id)!)
    .filter(Boolean);
  const recentlyUpdatedApps = updatedIds
    .map((id) => catalogApps.find((a) => a.id === id)!)
    .filter(Boolean);

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
            {scrolled && (
              <GetActionButton
                app={detailApp}
                installState={installStates[detailApp.id]}
                onTrigger={handleInstall}
                inlineNote
              />
            )}
            <button
              type="button"
              className="mas-circle-nav-btn"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast(`Copied OpenBioApp link for ${detailApp.name}`);
              }}
              title="Share"
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
            BYOK Settings (⌘,)
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
        ? currentRoute.tab === 'design-template'
          ? 'Brand Design Template'
          : SIDEBAR_ITEMS.find((s) => s.id === currentRoute.tab)?.label || 'Discover'
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
    <div className={`app-shell-outer ${framedMode ? 'framed-mode' : ''}`}>
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
            onInstall={handleInstall}
            onOpenApp={openAppDetail}
            onBack={goBack}
            onShare={() => showToast(`Shared OpenBioApp story: ${activeStory.title}`)}
          />
        )}

        {/* LEFT 220PX #F5F5F7 MAC APP STORE SIDEBAR */}
        <aside className="mas-sidebar">
          <div className="mas-traffic-lights" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="mas-traffic-dot close" />
              <span className="mas-traffic-dot minimize" />
              <span className="mas-traffic-dot zoom" />
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-secondary)',
              }}
            >
              OpenBioApp
            </span>
          </div>

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
                  {item.id === 'updates' && pendingUpdateIds.length > 0 && (
                    <span className="mas-nav-badge">{pendingUpdateIds.length}</span>
                  )}
                  {item.id === 'workspace' && workspaceCount > 0 && (
                    <span className="mas-nav-badge">{workspaceCount}</span>
                  )}
                </button>
              );
            })}

            <div className="mas-sidebar-divider" />

            <button
              type="button"
              className={`mas-nav-item ${
                currentRoute.kind === 'tab' && currentRoute.tab === 'design-template'
                  ? 'active'
                  : ''
              }`}
              onClick={() => selectTab('design-template')}
            >
              <span className="mas-nav-icon">
                <Sparkles size={16} strokeWidth={1.75} />
              </span>
              <span>Design Template</span>
            </button>

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
              <span>Settings…</span>
              <span className="mas-nav-badge" style={{ fontSize: 11 }}>
                ⌘,
              </span>
            </button>
          </nav>

          {/* Bottom Researcher Account Footer — Opens T13 Account Sheet */}
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
                  onInstall={handleInstall}
                  onOpenApp={openAppDetail}
                  onOpenStory={(storyId) => pushRoute({ kind: 'story', storyId })}
                  onOpenCategory={(catId: BioCategoryId) =>
                    pushRoute({ kind: 'category', categoryId: catId })
                  }
                  onSeeAll={(title, appIds, ranked) =>
                    pushRoute({ kind: 'see-all', title, appIds, ranked })
                  }
                  onOpenDesignTemplate={() => selectTab('design-template')}
                  onToast={showToast}
                />
              )}

            {currentRoute.kind === 'tab' && currentRoute.tab === 'categories' && (
              <CategoriesView
                categories={BIO_CATEGORIES}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleInstall}
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
                pendingApps={pendingUpdateApps}
                updatedApps={recentlyUpdatedApps}
                updatingMap={updatingMap}
                onUpdateOne={handleUpdateOne}
                onUpdateAll={handleUpdateAll}
                onOpenApp={openAppDetail}
              />
            )}

            {currentRoute.kind === 'tab' &&
              currentRoute.tab === 'design-template' && (
                <BrandDesignTemplateView
                  apps={catalogApps}
                  framedMode={framedMode}
                  onToggleFramedMode={() => setFramedMode((f) => !f)}
                  onOpenProfileModal={() => {
                    setShowSettingsWindow(false);
                    setShowAccountSheet(true);
                  }}
                  onOpenSettingsModal={() => {
                    setShowAccountSheet(false);
                    setShowSettingsWindow(true);
                  }}
                  onOpenApp={openAppDetail}
                  onToast={showToast}
                />
              )}

            {currentRoute.kind === 'category' && activeCategory && (
              <CategoryDetailView
                category={activeCategory}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleInstall}
                onOpenApp={openAppDetail}
              />
            )}

            {currentRoute.kind === 'search' && (
              <SearchView
                query={currentRoute.query}
                apps={catalogApps}
                installStates={installStates}
                onInstall={handleInstall}
                onOpenApp={openAppDetail}
                onSelectSuggestion={(q) => {
                  setSearchInput(q);
                  setHistory([{ kind: 'search', query: q }]);
                }}
              />
            )}

            {currentRoute.kind === 'app-detail' && detailApp && (
              <AppDetailView
                key={detailApp.id}
                app={detailApp}
                allApps={catalogApps}
                installStates={installStates}
                onInstall={handleInstall}
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
                onInstall={handleInstall}
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
