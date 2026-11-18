import React from 'react';
import { User } from 'firebase/auth';
import { Search, Settings, X } from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import { RouteView, SidebarTabId } from '../types/store';
import { BioAppIcon } from './BioArtwork';

export interface NavItemDef {
  id: SidebarTabId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export const LocaleSwitchPill: React.FC = () => {
  const { locale, setLocale, tr } = useLocale();
  return (
    <div
      className="locale-switch"
      role="group"
      aria-label={tr('Interface language', '인터페이스 언어 선택')}
    >
      <button
        type="button"
        className={`locale-btn ${locale === 'en' ? 'active' : ''}`}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`locale-btn ${locale === 'ko' ? 'active' : ''}`}
        aria-pressed={locale === 'ko'}
        onClick={() => setLocale('ko')}
      >
        KO
      </button>
    </div>
  );
};

export const DesktopSidebar: React.FC<{
  sidebarItems: NavItemDef[];
  currentRoute: RouteView;
  activeSidebarTab: SidebarTabId | null;
  searchInput: string;
  onSearchChange: (val: string) => void;
  onSearchFocus: () => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onSelectTab: (tab: SidebarTabId) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  workspaceCount: number;
  authUser: User | null;
  profileInitials: string;
}> = ({
  sidebarItems,
  currentRoute,
  activeSidebarTab,
  searchInput,
  onSearchChange,
  onSearchFocus,
  onSearchSubmit,
  onSearchClear,
  searchInputRef,
  onSelectTab,
  onOpenSettings,
  onOpenAccount,
  workspaceCount,
  authUser,
  profileInitials,
}) => {
  const { tr } = useLocale();
  return (
    <aside className="mas-sidebar" aria-label={tr('Sidebar', '사이드바')}>
      <div className="mas-brand-row">
        <button
          type="button"
          className="mas-brand-header"
          onClick={() => onSelectTab('discover')}
        >
          <BioAppIcon
            glyph="helix"
            gradient={['#062c49', '#007aff', '#38bdf8']}
            accent="#5ef2d6"
            size={30}
          />
          <span className="mas-brand-text">
            <span className="mas-brand-title">OpenBioApp</span>
            <span className="mas-brand-sub">
              {tr('Verified Bio Studios', '검증 바이오 스튜디오')}
            </span>
          </span>
        </button>
      </div>

      <div className="mas-search-wrap">
        <form
          className="mas-search-pill"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <label htmlFor="sidebar-global-search" className="sr-only">
            {tr('Search biomedical studios', '바이오 스튜디오 검색')}
          </label>
          <Search size={14} aria-hidden="true" />
          <input
            ref={searchInputRef}
            id="sidebar-global-search"
            className="mas-search-input"
            placeholder={tr('Search 15 bio apps…', '15개 바이오 앱 검색…')}
            value={searchInput}
            onFocus={onSearchFocus}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {!searchInput ? (
            <kbd className="mas-search-kbd" aria-hidden="true">
              ⌘K
            </kbd>
          ) : (
            <button
              type="button"
              className="mas-search-clear"
              onClick={onSearchClear}
              aria-label={tr('Clear search', '검색어 지우기')}
            >
              <X size={12} strokeWidth={2.6} />
            </button>
          )}
        </form>
      </div>

      <nav
        className="mas-nav-list"
        aria-label={tr('Primary navigation', '주요 메뉴')}
      >
        {sidebarItems.map((item) => {
          const isActive =
            currentRoute.kind !== 'search' && activeSidebarTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`mas-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="mas-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
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
          onClick={onOpenSettings}
        >
          <span className="mas-nav-icon" aria-hidden="true">
            <Settings size={17} strokeWidth={1.8} />
          </span>
          <span>{tr('Settings', '설정')}</span>
        </button>
      </nav>

      <div className="mas-profile-footer">
        <div className="mas-sidebar-locale-row">
          <span className="mas-locale-caption">{tr('Language', '표시 언어')}</span>
          <LocaleSwitchPill />
        </div>

        <button
          type="button"
          className="mas-profile-btn"
          onClick={onOpenAccount}
        >
          <span className="mas-profile-avatar">{profileInitials}</span>
          <span className="mas-profile-copy">
            <span className="mas-profile-name">
              {authUser
                ? authUser.displayName || authUser.email
                : tr('Researcher Account', '연구자 계정')}
            </span>
            <span className="mas-profile-sub">
              {authUser
                ? tr('Cloud Sync Active', '클라우드 동기화 중')
                : tr('Sign In / Guest', '로그인 · 게스트')}
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
};

export const MobileTopHeader: React.FC<{
  currentRoute: RouteView;
  searchInput: string;
  onSearchChange: (val: string) => void;
  onSearchOpen: () => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onSelectDiscover: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  profileInitials: string;
}> = ({
  currentRoute,
  searchInput,
  onSearchChange,
  onSearchOpen,
  onSearchSubmit,
  onSearchClear,
  onSelectDiscover,
  onOpenSettings,
  onOpenAccount,
  profileInitials,
}) => {
  const { tr } = useLocale();
  return (
    <>
      <header className="mas-mobile-topbar">
        <button
          type="button"
          className="mas-mobile-brand"
          onClick={onSelectDiscover}
        >
          <BioAppIcon
            glyph="helix"
            gradient={['#062c49', '#007aff', '#38bdf8']}
            accent="#5ef2d6"
            size={28}
          />
          <span>OpenBioApp</span>
        </button>

        <div className="mas-mobile-actions">
          <LocaleSwitchPill />
          <button
            type="button"
            className="mas-circle-nav-btn"
            aria-label={tr('Search studios', '스튜디오 검색')}
            onClick={onSearchOpen}
          >
            <Search size={16} />
          </button>
          <button
            type="button"
            className="mas-circle-nav-btn"
            aria-label={tr('Open settings', '설정 열기')}
            onClick={onOpenSettings}
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            className="mas-mobile-avatar-btn"
            aria-label={tr('Open researcher account', '연구자 계정 열기')}
            onClick={onOpenAccount}
          >
            {profileInitials}
          </button>
        </div>
      </header>

      {currentRoute.kind === 'search' && (
        <div className="mas-mobile-search-row">
          <form
            className="mas-search-pill"
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
          >
            <label htmlFor="mobile-global-search" className="sr-only">
              {tr('Search biomedical studios', '바이오 스튜디오 검색')}
            </label>
            <Search size={15} aria-hidden="true" />
            <input
              id="mobile-global-search"
              className="mas-search-input"
              placeholder={tr(
                'Search tools, genes, formats…',
                '도구, 유전자, 데이터 형식 검색…'
              )}
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="mas-search-clear"
                onClick={onSearchClear}
                aria-label={tr('Clear search', '검색어 지우기')}
              >
                <X size={12} />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export const MobileBottomTabBar: React.FC<{
  sidebarItems: NavItemDef[];
  currentRoute: RouteView;
  activeSidebarTab: SidebarTabId | null;
  workspaceCount: number;
  onSelectTab: (tab: SidebarTabId) => void;
}> = ({
  sidebarItems,
  currentRoute,
  activeSidebarTab,
  workspaceCount,
  onSelectTab,
}) => {
  const { tr } = useLocale();
  return (
    <nav
      className="mas-mobile-tabbar"
      aria-label={tr('Mobile navigation', '모바일 하단 메뉴')}
    >
      {sidebarItems.map((item) => {
        const isActive =
          currentRoute.kind !== 'search' && activeSidebarTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`mas-mobile-tab ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelectTab(item.id)}
          >
            <span className="mas-mobile-tab-icon" aria-hidden="true">
              {item.icon}
              {item.id === 'workspace' && workspaceCount > 0 && (
                <span className="mas-mobile-badge">{workspaceCount}</span>
              )}
            </span>
            <span className="mas-mobile-tab-label">{item.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
};
