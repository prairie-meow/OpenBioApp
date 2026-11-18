import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import {
  ChevronLeft,
  Cpu,
  Download,
  FolderKanban,
  LayoutGrid,
  Share,
  Star,
} from 'lucide-react';
import { useLocale } from './lib/i18n/locale';
import {
  BIO_CATEGORIES,
  EDITORIAL_STORIES,
} from './data/bioStoreData';
import { BioApp, BioCategoryId, RouteView, SidebarTabId } from './types/store';
import { BioAppIcon } from './components/BioArtwork';
import {
  DesktopSidebar,
  MobileBottomTabBar,
  MobileTopHeader,
  NavItemDef,
} from './components/AppNavigationChrome';
import { InstallStateMap } from './components/StorePrimitives';
import {
  BioAccountSheetCard,
  BioSettingsWindowCard,
} from './components/ProfileAndSettingsModals';
import { StorefrontTabsView } from './views/StorefrontTabsView';
import {
  EXECUTABLE_BIO_APPS,
  computeDocumentTitle,
  parseLocationToRoute,
  routeToUrl,
} from './lib/routing/appRoutes';
import { BIO_APP_MANIFESTS, BioDataType } from './lib/schema/bioAppSchema';
import {
  loadLocalWorkspaceRuns,
  subscribeAuthUser,
} from './lib/workspace/workspaceStore';
import { db } from './lib/firebase';

const AppDetailView = lazy(() =>
  import('./views/AppDetailView').then((m) => ({ default: m.AppDetailView }))
);
const AutoResearchView = lazy(() =>
  import('./views/AutoResearchView').then((m) => ({ default: m.AutoResearchView }))
);
const WorkspaceView = lazy(() =>
  import('./views/WorkspaceView').then((m) => ({ default: m.WorkspaceView }))
);
const EditorialStoryView = lazy(() =>
  import('./views/EditorialStoryView').then((m) => ({ default: m.EditorialStoryView }))
);
const CategoriesView = lazy(() =>
  import('./views/SecondaryViews').then((m) => ({ default: m.CategoriesView }))
);
const CategoryDetailView = lazy(() =>
  import('./views/SecondaryViews').then((m) => ({ default: m.CategoryDetailView }))
);
const UpdatesView = lazy(() =>
  import('./views/SecondaryViews').then((m) => ({ default: m.UpdatesView }))
);
const SearchView = lazy(() =>
  import('./views/SecondaryViews').then((m) => ({ default: m.SearchView }))
);
const SeeAllGridView = lazy(() =>
  import('./views/SecondaryViews').then((m) => ({ default: m.SeeAllGridView }))
);
const NotFoundView = lazy(() =>
  import('./views/LegalAndNotFoundViews').then((m) => ({ default: m.NotFoundView }))
);
const PrivacyPolicyView = lazy(() => import('./views/privacy'));
const TermsView = lazy(() => import('./views/terms'));

export const App: React.FC = () => {
  const { locale, tr } = useLocale();
  const initialRoute = useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseLocationToRoute(window.location.pathname, window.location.search)
        : ({ kind: 'tab', tab: 'discover' } as RouteView),
    []
  );

  const [history, setHistory] = useState<RouteView[]>([initialRoute]);
  const [catalogApps, setCatalogApps] = useState<BioApp[]>(EXECUTABLE_BIO_APPS);
  const [searchInput, setSearchInput] = useState(
    initialRoute.kind === 'search' ? initialRoute.query : ''
  );
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const scrollMemoryRef = useRef<Map<string, number>>(new Map());
  const currentRoute = history[history.length - 1];

  const sidebarItems: NavItemDef[] = useMemo(
    () => [
      {
        id: 'discover',
        label: tr('Discover', '탐색'),
        shortLabel: tr('Discover', '탐색'),
        icon: <Star size={17} strokeWidth={1.8} />,
      },
      {
        id: 'arcade',
        label: tr('Auto-Research', '자율 연구'),
        shortLabel: tr('Research', '자율연구'),
        icon: <Cpu size={17} strokeWidth={1.8} />,
      },
      {
        id: 'workspace',
        label: tr('Workspace', '워크스페이스'),
        shortLabel: tr('Workspace', '보관함'),
        icon: <FolderKanban size={17} strokeWidth={1.8} />,
      },
      {
        id: 'categories',
        label: tr('Categories', '카테고리'),
        shortLabel: tr('Categories', '분류'),
        icon: <LayoutGrid size={17} strokeWidth={1.8} />,
      },
      {
        id: 'updates',
        label: tr('Releases', '릴리스'),
        shortLabel: tr('Releases', '릴리스'),
        icon: <Download size={17} strokeWidth={1.8} />,
      },
    ],
    [tr]
  );

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

  const saveCurrentScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    scrollMemoryRef.current.set(routeToUrl(currentRoute), el.scrollTop);
  }, [currentRoute]);

  const applyScrollPosition = useCallback((targetY: number) => {
    setScrolled(targetY > 36);
    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({
        top: targetY,
        behavior: 'instant' as ScrollBehavior,
      });
    });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextRoute = parseLocationToRoute(
        window.location.pathname,
        window.location.search
      );
      setSearchInput(nextRoute.kind === 'search' ? nextRoute.query : '');
      setHistory((prev) => {
        if (prev.length >= 2) {
          const prevBack = prev[prev.length - 2];
          if (routeToUrl(prevBack) === routeToUrl(nextRoute)) {
            return prev.slice(0, -1);
          }
        }
        return [...prev, nextRoute];
      });
      const savedY = scrollMemoryRef.current.get(routeToUrl(nextRoute)) ?? 0;
      applyScrollPosition(savedY);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyScrollPosition]);

  useEffect(() => {
    document.title = computeDocumentTitle(
      currentRoute,
      catalogApps,
      (tab) => sidebarItems.find((s) => s.id === tab)?.label,
      locale
    );
  }, [currentRoute, catalogApps, sidebarItems, locale]);

  const navigatePush = useCallback(
    (next: RouteView) => {
      const curUrl = routeToUrl(currentRoute);
      const nextUrl = routeToUrl(next);
      if (curUrl === nextUrl) return;
      saveCurrentScroll();
      window.history.pushState({ url: nextUrl }, '', nextUrl);
      setHistory((prev) => [...prev, next]);
      applyScrollPosition(0);
    },
    [applyScrollPosition, currentRoute, saveCurrentScroll]
  );

  const navigateReplaceSearch = useCallback(
    (queryText: string) => {
      const nextRoute: RouteView = { kind: 'search', query: queryText };
      const nextUrl = routeToUrl(nextRoute);
      if (currentRoute.kind === 'search') {
        window.history.replaceState({ url: nextUrl }, '', nextUrl);
        setHistory((prev) => [...prev.slice(0, -1), nextRoute]);
      } else {
        saveCurrentScroll();
        window.history.pushState({ url: nextUrl }, '', nextUrl);
        setHistory((prev) => [...prev, nextRoute]);
        applyScrollPosition(0);
      }
    },
    [applyScrollPosition, currentRoute.kind, saveCurrentScroll]
  );

  const goBack = useCallback(() => {
    if (history.length > 1) {
      window.history.back();
    } else {
      navigatePush({ kind: 'tab', tab: 'discover' });
    }
  }, [history.length, navigatePush]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAccountSheet(false);
        setShowSettingsWindow(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowAccountSheet(false);
        setShowSettingsWindow(false);
        if (window.innerWidth > 768 && desktopSearchRef.current) {
          desktopSearchRef.current.focus();
          desktopSearchRef.current.select();
        } else {
          navigatePush({ kind: 'search', query: searchInput });
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigatePush, searchInput]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const copyCanonicalUrl = (label: string) => {
    const fullUrl = `${window.location.origin}${routeToUrl(currentRoute)}`;
    navigator.clipboard?.writeText(fullUrl);
    showToast(tr(`Copied link to ${label}`, `${label} 공유 링크를 복사했습니다`));
  };

  const selectTab = (tab: SidebarTabId) => {
    if (tab !== 'discover') setSearchInput('');
    setChainPayload(null);
    navigatePush({ kind: 'tab', tab });
  };

  const openAppDetail = (appId: string) => {
    if (!BIO_APP_MANIFESTS[appId]) return;
    setChainPayload(null);
    navigatePush({ kind: 'app-detail', appId });
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
    setChainPayload(payload ? { targetAppId, ...payload } : null);
    navigatePush({ kind: 'app-detail', appId: targetAppId });
  };

  const handleOpenFromButton = (appId: string, e: React.MouseEvent) => {
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
      ? catalogApps.find((a) => a.id === currentRoute.appId) || null
      : null;

  const activeCategory =
    currentRoute.kind === 'category'
      ? BIO_CATEGORIES.find((c) => c.id === currentRoute.categoryId) || null
      : null;

  const activeStory =
    currentRoute.kind === 'story'
      ? EDITORIAL_STORIES.find((s) => s.id === currentRoute.storyId) || null
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
            aria-label={tr('Back', '뒤로 가기')}
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

          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={() => copyCanonicalUrl(detailApp.name)}
            aria-label={tr(`Copy link for ${detailApp.name}`, `${detailApp.name} 링크 복사`)}
          >
            <Share size={15} />
          </button>
        </header>
      );
    }

    if (
      (currentRoute.kind === 'category' && activeCategory) ||
      currentRoute.kind === 'see-all' ||
      currentRoute.kind === 'privacy' ||
      currentRoute.kind === 'terms' ||
      currentRoute.kind === 'not-found'
    ) {
      const subTitle =
        currentRoute.kind === 'category' && activeCategory
          ? activeCategory.name
          : currentRoute.kind === 'see-all'
          ? currentRoute.title
          : currentRoute.kind === 'privacy'
          ? tr('Privacy Policy', '개인정보 처리방침')
          : currentRoute.kind === 'terms'
          ? tr('Terms & Licensing', '이용약관 및 라이선스')
          : '404';
      return (
        <header className="mas-sticky-toolbar subpage-header">
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={goBack}
            aria-label={tr('Back', '뒤로 가기')}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="mas-sticky-center-title">{subTitle}</div>
          <div className="mas-toolbar-spacer" />
        </header>
      );
    }

    const tabLabel =
      currentRoute.kind === 'search'
        ? currentRoute.query
          ? tr(`Results for “${currentRoute.query}”`, `“${currentRoute.query}” 검색 결과`)
          : tr('Search', '검색')
        : currentRoute.kind === 'tab'
        ? sidebarItems.find((s) => s.id === currentRoute.tab)?.label || ''
        : '';

    return (
      <header className={`mas-sticky-toolbar ${scrolled ? 'visible' : ''}`}>
        <div className="mas-toolbar-spacer" />
        <div className="mas-sticky-center-title">{tabLabel}</div>
        <div className="mas-toolbar-spacer" />
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
          <Suspense
            fallback={
              <div className="route-loading-state" role="status">
                {tr('Loading story…', '스토리 불러오는 중…')}
              </div>
            }
          >
            <EditorialStoryView
              story={activeStory}
              featuredApp={
                catalogApps.find((a) => a.id === activeStory.featuredAppId) ||
                catalogApps[0]
              }
              installStates={installStates}
              onInstall={handleOpenFromButton}
              onOpenApp={openAppDetail}
              onBack={goBack}
              onShare={() => copyCanonicalUrl(activeStory.title)}
            />
          </Suspense>
        )}

        <DesktopSidebar
          sidebarItems={sidebarItems}
          currentRoute={currentRoute}
          activeSidebarTab={activeSidebarTab}
          searchInput={searchInput}
          onSearchChange={(val) => {
            setSearchInput(val);
            navigateReplaceSearch(val);
          }}
          onSearchFocus={() => {
            if (currentRoute.kind !== 'search') {
              navigatePush({ kind: 'search', query: searchInput });
            }
          }}
          onSearchSubmit={() => navigateReplaceSearch(searchInput)}
          onSearchClear={() => {
            setSearchInput('');
            navigateReplaceSearch('');
            desktopSearchRef.current?.focus();
          }}
          searchInputRef={desktopSearchRef}
          onSelectTab={selectTab}
          onOpenSettings={() => {
            setShowAccountSheet(false);
            setShowSettingsWindow(true);
          }}
          onOpenAccount={() => {
            setShowSettingsWindow(false);
            setShowAccountSheet(true);
          }}
          workspaceCount={workspaceCount}
          authUser={authUser}
          profileInitials={profileInitials}
        />

        <div className="mas-stage-column">
          <MobileTopHeader
            currentRoute={currentRoute}
            searchInput={searchInput}
            onSearchChange={(val) => {
              setSearchInput(val);
              navigateReplaceSearch(val);
            }}
            onSearchOpen={() => navigatePush({ kind: 'search', query: searchInput })}
            onSearchSubmit={() => navigateReplaceSearch(searchInput)}
            onSearchClear={() => {
              setSearchInput('');
              navigateReplaceSearch('');
            }}
            onSelectDiscover={() => selectTab('discover')}
            onOpenSettings={() => {
              setShowAccountSheet(false);
              setShowSettingsWindow(true);
            }}
            onOpenAccount={() => {
              setShowSettingsWindow(false);
              setShowAccountSheet(true);
            }}
            profileInitials={profileInitials}
          />

          <main className="mas-main-stage">
            {renderStickyToolbar()}

            <div
              className="mas-scroll-container"
              ref={scrollContainerRef}
              onScroll={(e) => {
                setScrolled(e.currentTarget.scrollTop > 36);
              }}
            >
              <Suspense
                fallback={
                  <div className="route-loading-state" role="status">
                    {tr('Loading studio…', '스튜디오 불러오는 중…')}
                  </div>
                }
              >
                {currentRoute.kind === 'tab' && currentRoute.tab === 'discover' && (
                  <StorefrontTabsView
                    apps={catalogApps}
                    installStates={installStates}
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                    onOpenStory={(storyId) => navigatePush({ kind: 'story', storyId })}
                    onSeeAll={(title, appIds, ranked) =>
                      navigatePush({ kind: 'see-all', title, appIds, ranked })
                    }
                    onNavigateAutoResearch={() => selectTab('arcade')}
                    onNavigateWorkspace={() => selectTab('workspace')}
                    onNavigatePrivacy={() => navigatePush({ kind: 'privacy' })}
                    onNavigateTerms={() => navigatePush({ kind: 'terms' })}
                  />
                )}

                {currentRoute.kind === 'tab' && currentRoute.tab === 'arcade' && (
                  <AutoResearchView
                    apps={catalogApps}
                    onOpenApp={openAppDetail}
                    onOpenSettings={() => setShowSettingsWindow(true)}
                    onRunPersisted={() =>
                      setWorkspaceCount(loadLocalWorkspaceRuns().length)
                    }
                    onToast={showToast}
                  />
                )}

                {currentRoute.kind === 'tab' && currentRoute.tab === 'workspace' && (
                  <WorkspaceView
                    onOpenAppWithChain={openAppWithChain}
                    onRunsChanged={() =>
                      setWorkspaceCount(loadLocalWorkspaceRuns().length)
                    }
                    onToast={showToast}
                  />
                )}

                {currentRoute.kind === 'tab' && currentRoute.tab === 'categories' && (
                  <CategoriesView
                    categories={BIO_CATEGORIES}
                    apps={catalogApps}
                    installStates={installStates}
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                    onSelectCategory={(catId: BioCategoryId) =>
                      navigatePush({ kind: 'category', categoryId: catId })
                    }
                    onSeeAll={(title, appIds) =>
                      navigatePush({ kind: 'see-all', title, appIds })
                    }
                  />
                )}

                {currentRoute.kind === 'tab' && currentRoute.tab === 'updates' && (
                  <UpdatesView apps={catalogApps} onOpenApp={openAppDetail} />
                )}

                {currentRoute.kind === 'category' && activeCategory && (
                  <CategoryDetailView
                    category={activeCategory}
                    apps={catalogApps}
                    installStates={installStates}
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                  />
                )}

                {currentRoute.kind === 'search' && (
                  <SearchView
                    query={currentRoute.query}
                    apps={catalogApps}
                    installStates={installStates}
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                    onSelectSuggestion={(q) => {
                      setSearchInput(q);
                      navigateReplaceSearch(q);
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
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                    onOpenCategory={(catId) =>
                      navigatePush({ kind: 'category', categoryId: catId })
                    }
                    incomingChainPayload={
                      chainPayload && chainPayload.targetAppId === detailApp.id
                        ? chainPayload
                        : null
                    }
                    onChainToApp={(targetId, payload) =>
                      openAppWithChain(targetId, payload)
                    }
                    onRunPersisted={() =>
                      setWorkspaceCount(loadLocalWorkspaceRuns().length)
                    }
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
                    onInstall={handleOpenFromButton}
                    onOpenApp={openAppDetail}
                  />
                )}

                {currentRoute.kind === 'privacy' && (
                  <PrivacyPolicyView
                    onGoDiscover={() => selectTab('discover')}
                  />
                )}

                {currentRoute.kind === 'terms' && (
                  <TermsView onGoDiscover={() => selectTab('discover')} />
                )}

                {currentRoute.kind === 'not-found' && (
                  <NotFoundView
                    requestedPath={currentRoute.path}
                    onGoDiscover={() => selectTab('discover')}
                    onGoSearch={() => navigatePush({ kind: 'search', query: '' })}
                  />
                )}
              </Suspense>
            </div>

            {toastMsg && (
              <div className="mas-toast-pill" role="status" aria-live="polite">
                {toastMsg}
              </div>
            )}
          </main>

          <MobileBottomTabBar
            sidebarItems={sidebarItems}
            currentRoute={currentRoute}
            activeSidebarTab={activeSidebarTab}
            workspaceCount={workspaceCount}
            onSelectTab={selectTab}
          />
        </div>
      </div>
    </div>
  );
};
