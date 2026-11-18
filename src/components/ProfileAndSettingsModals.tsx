import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ChevronRight,
  CloudDownload,
  ExternalLink,
  GitPullRequest,
  KeyRound,
  LogIn,
  LogOut,
  Search,
  Sparkles,
} from 'lucide-react';
import { BioApp } from '../types/store';
import { BioAppIcon } from './BioArtwork';
import {
  AppConversionRequestItem,
  ByokSettings,
  fetchQueuedAppRequests,
  loadByokSettings,
  loadLocalWorkspaceRuns,
  saveByokSettings,
  signInOrRegisterWithEmail,
  signInWithGooglePopup,
  signOutOpenBioApp,
  subscribeAuthUser,
} from '../lib/workspace/workspaceStore';

export type AccountSubPage =
  | 'root'
  | 'account-info'
  | 'your-apps'
  | 'my-requests'
  | 'notifications'
  | 'recommendations';

interface BioAccountSheetCardProps {
  apps: BioApp[];
  embedded?: boolean;
  initialSubPage?: AccountSubPage;
  onClose?: () => void;
  onOpenApp?: (appId: string) => void;
  onToast?: (msg: string) => void;
}

/* =========================================================
   T13: OPENBIOAPP ACCOUNT SHEET (CUA 23..27 Fidelity + Live Firebase Auth)
   ========================================================= */
export const BioAccountSheetCard: React.FC<BioAccountSheetCardProps> = ({
  apps,
  embedded = false,
  initialSubPage = 'root',
  onClose,
  onOpenApp,
  onToast,
}) => {
  const [pageStack, setPageStack] = useState<AccountSubPage[]>([initialSubPage]);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [notifNightly, setNotifNightly] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);
  const [appsSeg, setAppsSeg] = useState<'all' | 'wasm'>('all');
  const [appsSearch, setAppsSearch] = useState('');
  const [requests, setRequests] = useState<AppConversionRequestItem[]>([]);

  useEffect(() => {
    const unsub = subscribeAuthUser((u) => setUser(u));
    fetchQueuedAppRequests().then(setRequests).catch(() => {});
    return unsub;
  }, []);

  const curPage = pageStack[pageStack.length - 1];
  const push = (p: AccountSubPage) => setPageStack((prev) => [...prev, p]);
  const pop = () =>
    setPageStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const titleMap: Record<AccountSubPage, string> = {
    root: 'OpenBioApp Account',
    'account-info': 'Researcher Account & Sign-In',
    'your-apps': 'Verified Bio Apps',
    'my-requests': 'Repo-to-App Queue',
    notifications: 'Notifications',
    recommendations: 'Scientific Recommendations',
  };

  const localRuns = loadLocalWorkspaceRuns();
  const usedKb = Math.round(
    localRuns.reduce((acc, r) => acc + (r.sizeBytes || 0), 0) / 1024
  );

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const u = await signInWithGooglePopup();
      onToast?.(`Signed in as ${u.displayName || u.email}`);
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in could not complete.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      const u = await signInOrRegisterWithEmail(
        email,
        password,
        displayName,
        isRegister
      );
      setPassword('');
      onToast?.(`Signed in to OpenBioApp as ${u.displayName || u.email}`);
      pop();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const filteredApps = apps.filter((a) => {
    if (appsSeg === 'wasm' && a.isCloudContainer) return false;
    if (
      appsSearch.trim() &&
      !a.name.toLowerCase().includes(appsSearch.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const initials = (user?.displayName || user?.email || 'OB')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="mas-account-sheet"
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-label="OpenBioApp Account"
      style={{
        width: embedded ? '100%' : 468,
        maxWidth: 468,
        minHeight: embedded ? 500 : 536,
        maxHeight: embedded ? 'none' : '86vh',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mas-sheet-header">{titleMap[curPage]}</div>

      <div className="mas-sheet-body">
        {curPage === 'root' && (
          <>
            {/* Group #1: Researcher Identity + Cloud Sync Status */}
            <div className="mas-sheet-group">
              <button
                type="button"
                className="mas-sheet-profile-row"
                onClick={() => push('account-info')}
              >
                <div className="mas-sheet-avatar-lg">{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {user
                      ? user.displayName || user.email
                      : 'Sign In to Sync Workspace'}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                    }}
                  >
                    {user
                      ? `Firebase Cloud Sync Active · ${usedKb} KB used`
                      : `Local guest session (${localRuns.length} runs) · Click to sign in`}
                  </div>
                </div>
                <ChevronRight size={15} color="#c7c7cc" />
              </button>

              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() =>
                  window.open('https://github.com/prairie-meow/OpenBioApp', '_blank')
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#1d1d1f',
                      color: '#ffffff',
                      fontSize: 10.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    OS
                  </span>
                  <span>OpenBioApp GitHub Repository</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  prairie-meow <ExternalLink size={12} />
                </span>
              </button>
            </div>

            {/* Group #2: Drill-Down Rows */}
            <div className="mas-sheet-group">
              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('your-apps')}
              >
                <span>Verified Bio Apps ({apps.length})</span>
                <ChevronRight size={15} color="#c7c7cc" />
              </button>
              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('my-requests')}
              >
                <span>Nightly Repo-to-App Queue ({requests.length})</span>
                <ChevronRight size={15} color="#c7c7cc" />
              </button>
              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('notifications')}
              >
                <span>Factory &amp; Pipeline Notifications</span>
                <ChevronRight size={15} color="#c7c7cc" />
              </button>
              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('recommendations')}
              >
                <span>Zero-Retention Data Privacy Guarantees</span>
                <ChevronRight size={15} color="#c7c7cc" />
              </button>
            </div>

            {/* Group #3: 2-Column Action Tiles matching 23-profile-account-sheet.png */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authBusy}
                style={{
                  height: 58,
                  borderRadius: 12,
                  border: 'none',
                  background: '#f5f5f7',
                  color: '#007aff',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <LogIn size={16} />
                <span>{user ? 'Switch Google Account' : 'Sign In with Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => push('my-requests')}
                style={{
                  height: 58,
                  borderRadius: 12,
                  border: 'none',
                  background: '#f5f5f7',
                  color: '#007aff',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <GitPullRequest size={16} />
                <span>Queue Status</span>
              </button>
            </div>

            {user && (
              <div className="mas-sheet-group" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="mas-sheet-row"
                  style={{ color: '#ff3b30', fontWeight: 600 }}
                  onClick={async () => {
                    await signOutOpenBioApp();
                    onToast?.('Signed out of OpenBioApp.');
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <LogOut size={14} /> Sign Out
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {curPage === 'account-info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="mas-sheet-group" style={{ padding: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
                {user
                  ? `Connected to Firestore ('openbioapp') as ${user.email}`
                  : isRegister
                  ? 'Create OpenBioApp Researcher Account'
                  : 'Sign In with Researcher Email'}
              </div>

              {!user && (
                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {isRegister && (
                    <input
                      type="text"
                      placeholder="Researcher Name (e.g. Dr. Kim)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{ height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
                    />
                  )}
                  <input
                    required
                    type="email"
                    placeholder="researcher@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
                  />
                  <input
                    required
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ height: 34, borderRadius: 8, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 13 }}
                  />
                  {authError && (
                    <div style={{ fontSize: 12, color: '#d70015' }}>{authError}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <button
                      type="button"
                      className="mas-link-btn"
                      style={{ fontSize: 12 }}
                      onClick={() => setIsRegister((v) => !v)}
                    >
                      {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                    <button
                      type="submit"
                      disabled={authBusy}
                      className="mas-get-pill solid-blue"
                      style={{ height: 30, padding: '0 16px' }}
                    >
                      {authBusy ? 'Please wait…' : isRegister ? 'Register' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}

              {user && (
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <div>UID: <code>{user.uid.slice(0, 14)}…</code></div>
                  <div>Cloud Workspace Quota: {usedKb} KB / 250,000 KB Free Academic Tier</div>
                </div>
              )}
            </div>
          </div>
        )}

        {curPage === 'your-apps' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div className="mas-segmented">
                <button
                  type="button"
                  className={`mas-seg-btn ${appsSeg === 'all' ? 'active' : ''}`}
                  onClick={() => setAppsSeg('all')}
                >
                  All Verified Blocks
                </button>
                <button
                  type="button"
                  className={`mas-seg-btn ${appsSeg === 'wasm' ? 'active' : ''}`}
                  onClick={() => setAppsSeg('wasm')}
                >
                  Zero-Cost Browser/API
                </button>
              </div>
            </div>

            <div className="mas-search-pill" style={{ marginBottom: 12, background: '#f2f2f7' }}>
              <Search size={13} color="#86868b" />
              <input
                className="mas-search-input"
                placeholder="Filter catalog…"
                value={appsSearch}
                onChange={(e) => setAppsSearch(e.target.value)}
              />
            </div>

            <div className="mas-sheet-group">
              {filteredApps.map((a, idx) => (
                <React.Fragment key={a.id}>
                  {idx > 0 && <div className="mas-sheet-inset-div" />}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 14px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onOpenApp?.(a.id);
                      onClose?.();
                    }}
                  >
                    <BioAppIcon
                      glyph={a.iconGlyph}
                      gradient={a.iconGradient}
                      accent={a.iconAccent}
                      size={38}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                        {a.ageOrTier} · {a.languageLabel}
                      </div>
                    </div>
                    <CloudDownload size={17} color="#007aff" />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {curPage === 'my-requests' && (
          <div className="mas-sheet-group" style={{ padding: 14 }}>
            {requests.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 16 }}>
                No repositories queued yet. Submit any open-source GitHub URL from the Workspace tab.
              </div>
            ) : (
              requests.map((r, i) => (
                <div key={r.id} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid #e5e5ea' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <span>{r.titleHint || 'Open-Source Bio Tool'}</span>
                    <span style={{ color: '#007aff', textTransform: 'uppercase', fontSize: 11 }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{r.repoUrl}</div>
                </div>
              ))
            )}
          </div>
        )}

        {curPage === 'notifications' && (
          <div className="mas-sheet-group" style={{ padding: '6px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Nightly Repo-to-App Releases</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Notify when newly converted open-source tools pass QA</div>
              </div>
              <input type="checkbox" checked={notifNightly} onChange={() => setNotifNightly((v) => !v)} />
            </div>
            <div className="mas-sheet-inset-div" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Feedback Healer Sanitizer Patches</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Notify when reported instrument file issues are fixed</div>
              </div>
              <input type="checkbox" checked={notifRequests} onChange={() => setNotifRequests((v) => !v)} />
            </div>
          </div>
        )}

        {curPage === 'recommendations' && (
          <div className="mas-sheet-group" style={{ padding: 16, fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Scientific &amp; Data Sovereignty Architecture</strong>
            <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
              <li>In-browser blocks execute locally inside your tab with zero raw file upload.</li>
              <li>Cloud Run CPU blocks (such as NucleoSpec &amp; PyDESeq2) run in stateless ephemeral containers with zero raw file retention.</li>
              <li>BYOK LLM keys in Settings (⌘,) stay exclusively in your browser’s local storage.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Sticky Sheet Footer matching 23-profile-account-sheet.png */}
      <div className="mas-sheet-footer">
        {pageStack.length > 1 ? (
          <button type="button" className="mas-sheet-btn" onClick={pop}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="mas-sheet-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   T14: OPENBIOAPP SETTINGS WINDOW (⌘, CUA 28 Fidelity + BYOK Key Vault)
   ========================================================= */
export const BioSettingsWindowCard: React.FC<{
  embedded?: boolean;
  onClose?: () => void;
  onToast?: (msg: string) => void;
}> = ({ embedded = false, onClose, onToast }) => {
  const [settings, setSettings] = useState<ByokSettings>(loadByokSettings);
  const [savedFlag, setSavedFlag] = useState(false);

  const updateField = <K extends keyof ByokSettings>(key: K, val: ByokSettings[K]) => {
    const next = { ...settings, [key]: val };
    if (key === 'provider') {
      if (val === 'gemini') next.modelName = 'gemini-2.5-flash';
      if (val === 'openai') next.modelName = 'gpt-4o-mini';
      if (val === 'anthropic') next.modelName = 'claude-3-5-sonnet-latest';
    }
    setSettings(next);
    saveByokSettings(next);
  };

  const CheckRow: React.FC<{
    checked: boolean;
    onChange: () => void;
    label: string;
    helper: string;
  }> = ({ checked, onChange, label, helper }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: '#007aff' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.38, marginTop: 2 }}>
            {helper}
          </div>
        </div>
      </label>
    </div>
  );

  return (
    <div
      className="mas-settings-window"
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-label="OpenBioApp Settings"
      style={{
        width: embedded ? '100%' : 454,
        maxWidth: 454,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mas-settings-titlebar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            className="mas-traffic-dot close"
            style={{
              background: embedded ? '#d4d4d8' : '#ff5f57',
              cursor: onClose ? 'pointer' : 'default',
              padding: 0,
            }}
            title="Close Settings"
          />
          <span className="mas-traffic-dot" />
          <span className="mas-traffic-dot" />
        </div>
        <span className="mas-settings-window-title">OpenBioApp Settings</span>
      </div>

      <div style={{ padding: '20px 24px 22px' }}>
        {/* BYOK Local Vault Section */}
        <div
          style={{
            background: '#f5f5f7',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <KeyRound size={13.5} color="#007aff" />
            <span>Auto-Research BYOK Key Vault (Browser-Only)</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 10 }}>
            Stored strictly in your browser’s localStorage; never transmitted to OpenBioApp servers.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: 8, marginBottom: 8 }}>
            <select
              value={settings.provider}
              onChange={(e) => updateField('provider', e.target.value as ByokSettings['provider'])}
              style={{ height: 30, borderRadius: 7, border: '1px solid #d4d4d8', padding: '0 8px', fontSize: 12.5, background: '#ffffff' }}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <input
              type="text"
              value={settings.modelName}
              onChange={(e) => updateField('modelName', e.target.value)}
              placeholder="Model ID"
              style={{ height: 30, borderRadius: 7, border: '1px solid #d4d4d8', padding: '0 8px', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder="Paste API key (AIza... / sk-...)"
              style={{ flex: 1, height: 30, borderRadius: 7, border: '1px solid #d4d4d8', padding: '0 10px', fontSize: 12.5 }}
            />
            <button
              type="button"
              className="mas-get-pill solid-blue"
              style={{ height: 30, padding: '0 14px', fontSize: 12 }}
              onClick={() => {
                saveByokSettings(settings);
                setSavedFlag(true);
                onToast?.('Saved BYOK configuration in local browser vault.');
                setTimeout(() => setSavedFlag(false), 1800);
              }}
            >
              {savedFlag ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <CheckRow
          checked={settings.autoSaveRunsToWorkspace}
          onChange={() =>
            updateField('autoSaveRunsToWorkspace', !settings.autoSaveRunsToWorkspace)
          }
          label="Automatically save run outputs to Project Workspace"
          helper="Every table, 3D structure, and chart will be ready for one-click downstream chaining."
        />

        <CheckRow
          checked={settings.showExperimentalNightlyApps}
          onChange={() =>
            updateField('showExperimentalNightlyApps', !settings.showExperimentalNightlyApps)
          }
          label="Show Experimental Nightly Factory Releases"
          helper="Include newly converted open-source tools from the 7-Subagent Nightly Factory before Verified promotion."
        />

        <CheckRow
          checked={settings.shareAnonymousSanitizerTelemetry}
          onChange={() =>
            updateField(
              'shareAnonymousSanitizerTelemetry',
              !settings.shareAnonymousSanitizerTelemetry
            )
          }
          label="Enable Feedback Healer Format Diagnostics"
          helper="Allow reporting anonymized header/delimiter errors (never raw experimental values) to improve file sanitizers."
        />

        <div className="mas-section-divider" style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Clear Local BYOK Key &amp; Reset Telemetry ID
          </span>
          <button
            type="button"
            className="mas-sheet-btn"
            onClick={() => {
              updateField('apiKey', '');
              onToast?.('Cleared local BYOK key and reset anonymous identifier.');
            }}
          >
            Reset Vault
          </button>
        </div>
      </div>
    </div>
  );
};
