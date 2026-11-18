import React, { useEffect, useId, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  ChevronRight,
  ExternalLink,
  GitPullRequest,
  KeyRound,
  LogIn,
  LogOut,
  Search,
  X,
} from 'lucide-react';
import { useLocale } from '../lib/i18n/locale';
import { BioApp } from '../types/store';
import { BioAppIcon } from './BioArtwork';
import {
  AppConversionRequestItem,
  ByokSettings,
  fetchQueuedAppRequests,
  formatFirebaseAuthError,
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
  | 'privacy-info';

interface BioAccountSheetCardProps {
  apps: BioApp[];
  embedded?: boolean;
  initialSubPage?: AccountSubPage;
  onClose?: () => void;
  onOpenApp?: (appId: string) => void;
  onToast?: (msg: string) => void;
}

/* =========================================================
   OPENBIOAPP ACCOUNT MODAL (LIVE FIREBASE AUTH & WORKSPACE SYNC)
   ========================================================= */
export const BioAccountSheetCard: React.FC<BioAccountSheetCardProps> = ({
  apps,
  embedded = false,
  initialSubPage = 'root',
  onClose,
  onOpenApp,
  onToast,
}) => {
  const { locale, tr } = useLocale();
  const authFormId = useId();
  const [pageStack, setPageStack] = useState<AccountSubPage[]>([initialSubPage]);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    root: tr('OpenBioApp Account', 'OpenBioApp 계정'),
    'account-info': tr('Researcher Sign-In', '연구자 로그인 및 계정'),
    'your-apps': tr('Verified Live Studios', '검증된 실행 스튜디오'),
    'my-requests': tr('Repo-to-App Queue', 'Repo-to-App 변환 대기열'),
    'privacy-info': tr('Zero-Retention Data Privacy', '무보관 데이터 보호 원칙'),
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
      onToast?.(
        tr(
          `Signed in as ${u.displayName || u.email}`,
          `${u.displayName || u.email} 계정으로 로그인되었습니다.`
        )
      );
    } catch (err: unknown) {
      setAuthError(formatFirebaseAuthError(err, locale));
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
      onToast?.(
        tr(
          `Signed in to OpenBioApp as ${u.displayName || u.email}`,
          `${u.displayName || u.email} 계정으로 로그인되었습니다.`
        )
      );
      pop();
    } catch (err: unknown) {
      setAuthError(formatFirebaseAuthError(err, locale));
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
      className={`mas-account-sheet ${embedded ? 'is-embedded' : ''}`}
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-label={titleMap[curPage]}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mas-sheet-header">
        <span>{titleMap[curPage]}</span>
        {onClose && (
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={onClose}
            aria-label={tr('Close account dialog', '계정 창 닫기')}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="mas-sheet-body">
        {curPage === 'root' && (
          <>
            <div className="mas-sheet-group">
              <button
                type="button"
                className="mas-sheet-profile-row"
                onClick={() => push('account-info')}
              >
                <div className="mas-sheet-avatar-lg">{initials}</div>
                <div className="mas-sheet-profile-copy">
                  <div className="mas-sheet-profile-name">
                    {user
                      ? user.displayName || user.email
                      : tr('Sign In to Sync Workspace', '워크스페이스 동기화 로그인')}
                  </div>
                  <div className="mas-sheet-profile-sub">
                    {user
                      ? tr(
                          `Firebase Cloud Sync Active · ${usedKb} KB used`,
                          `Firebase 클라우드 동기화 활성 · ${usedKb} KB 사용 중`
                        )
                      : tr(
                          `Local guest session (${localRuns.length} saved runs) · Click to sign in`,
                          `로컬 게스트 세션 (보관 기록 ${localRuns.length}건) · 클릭해 로그인`
                        )}
                  </div>
                </div>
                <ChevronRight size={16} aria-hidden="true" />
              </button>

              <div className="mas-sheet-inset-div" />

              <a
                href="https://github.com/prairie-meow/OpenBioApp"
                target="_blank"
                rel="noreferrer"
                className="mas-sheet-row"
              >
                <span className="mas-sheet-row-left">
                  <span className="mas-os-badge">OS</span>
                  <span>{tr('OpenBioApp GitHub Repository', 'OpenBioApp GitHub 저장소')}</span>
                </span>
                <span className="mas-sheet-row-meta">
                  <span>prairie-meow</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </span>
              </a>
            </div>

            <div className="mas-sheet-group">
              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('your-apps')}
              >
                <span>
                  {tr(
                    `Verified Live Studios (${apps.length})`,
                    `검증된 실행 스튜디오 (${apps.length})`
                  )}
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('my-requests')}
              >
                <span>
                  {tr(
                    `Repo-to-App Conversion Queue (${requests.length})`,
                    `Repo-to-App 변환 대기열 (${requests.length})`
                  )}
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <div className="mas-sheet-inset-div" />

              <button
                type="button"
                className="mas-sheet-row"
                onClick={() => push('privacy-info')}
              >
                <span>
                  {tr(
                    'Zero-Retention Data Privacy Guarantees',
                    '원본 무보관 데이터 보호 원칙'
                  )}
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="mas-sheet-action-tiles">
              <button
                type="button"
                className="mas-sheet-tile-btn"
                onClick={handleGoogleSignIn}
                disabled={authBusy}
              >
                <LogIn size={17} aria-hidden="true" />
                <span>
                  {user
                    ? tr('Switch Google Account', 'Google 계정 전환')
                    : tr('Sign In with Google', 'Google 계정 로그인')}
                </span>
              </button>

              <button
                type="button"
                className="mas-sheet-tile-btn"
                onClick={() => push('my-requests')}
              >
                <GitPullRequest size={17} aria-hidden="true" />
                <span>{tr('Queue Status', '변환 대기열 현황')}</span>
              </button>
            </div>

            {authError && curPage === 'root' && (
              <div className="mas-auth-error" role="alert">
                {authError}
              </div>
            )}

            {user && (
              <div className="mas-sheet-group mas-sheet-signout-group">
                <button
                  type="button"
                  className="mas-sheet-row is-danger"
                  onClick={async () => {
                    await signOutOpenBioApp();
                    onToast?.(
                      tr('Signed out of OpenBioApp.', '로그아웃되었습니다.')
                    );
                  }}
                >
                  <span className="mas-sheet-row-left">
                    <LogOut size={15} aria-hidden="true" />
                    <span>{tr('Sign Out', '로그아웃')}</span>
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {curPage === 'account-info' && (
          <div className="mas-sheet-group mas-sheet-pad">
            <div className="mas-sheet-section-title">
              {user
                ? tr(
                    `Connected to Firestore ('openbioapp') as ${user.email}`,
                    `Firestore ('openbioapp') 연결됨: ${user.email}`
                  )
                : isRegister
                ? tr('Create Researcher Account', '연구자 계정 등록')
                : tr('Sign In with Researcher Email', '연구자 이메일 로그인')}
            </div>

            {!user && (
              <form onSubmit={handleEmailAuth} className="mas-auth-form">
                {isRegister && (
                  <div>
                    <label htmlFor={`${authFormId}-name`} className="studio-label">
                      {tr('Researcher Name', '연구자 이름')}
                    </label>
                    <input
                      id={`${authFormId}-name`}
                      type="text"
                      className="studio-input"
                      placeholder="Dr. Kim"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor={`${authFormId}-email`} className="studio-label">
                    {tr('Email Address', '이메일 주소')}
                  </label>
                  <input
                    id={`${authFormId}-email`}
                    required
                    type="email"
                    className="studio-input"
                    placeholder="researcher@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`${authFormId}-pass`} className="studio-label">
                    {tr('Password', '비밀번호')}
                  </label>
                  <input
                    id={`${authFormId}-pass`}
                    required
                    type="password"
                    className="studio-input"
                    placeholder={tr('Minimum 6 characters', '최소 6자 이상')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {authError && (
                  <div className="mas-auth-error" role="alert">
                    {authError}
                  </div>
                )}
                <div className="mas-auth-actions">
                  <button
                    type="button"
                    className="mas-link-btn"
                    onClick={() => {
                      setAuthError(null);
                      setIsRegister((v) => !v);
                    }}
                  >
                    {isRegister
                      ? tr('Have an account? Sign In', '이미 계정이 있나요? 로그인')
                      : tr('Need an account? Register', '계정이 없나요? 회원가입')}
                  </button>
                  <button
                    type="submit"
                    disabled={authBusy}
                    className="mas-get-pill solid-blue"
                  >
                    {authBusy
                      ? tr('Please wait…', '처리 중…')
                      : isRegister
                      ? tr('Register', '계정 생성')
                      : tr('Sign In', '로그인')}
                  </button>
                </div>
              </form>
            )}

            {user && (
              <div className="mas-user-summary">
                <div>
                  UID: <code>{user.uid.slice(0, 14)}…</code>
                </div>
                <div>
                  {tr(
                    `Cloud Workspace Usage: ${usedKb} KB synced`,
                    `클라우드 워크스페이스 사용량: ${usedKb} KB 동기화됨`
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {curPage === 'your-apps' && (
          <div>
            <div className="mas-segmented-wrap">
              <div className="mas-segmented" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={appsSeg === 'all'}
                  className={`mas-seg-btn ${appsSeg === 'all' ? 'active' : ''}`}
                  onClick={() => setAppsSeg('all')}
                >
                  {tr(`All Verified (${apps.length})`, `전체 (${apps.length})`)}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={appsSeg === 'wasm'}
                  className={`mas-seg-btn ${appsSeg === 'wasm' ? 'active' : ''}`}
                  onClick={() => setAppsSeg('wasm')}
                >
                  {tr('Browser / Public API', '브라우저 · 공개 API')}
                </button>
              </div>
            </div>

            <div className="mas-search-pill mas-sheet-search">
              <label htmlFor={`${authFormId}-appfilter`} className="sr-only">
                {tr('Filter verified studios', '검증 스튜디오 필터')}
              </label>
              <Search size={14} aria-hidden="true" />
              <input
                id={`${authFormId}-appfilter`}
                className="mas-search-input"
                placeholder={tr('Filter verified studios…', '검증 스튜디오 검색…')}
                value={appsSearch}
                onChange={(e) => setAppsSearch(e.target.value)}
              />
            </div>

            <div className="mas-sheet-group">
              {filteredApps.map((a, idx) => (
                <React.Fragment key={a.id}>
                  {idx > 0 && <div className="mas-sheet-inset-div" />}
                  <button
                    type="button"
                    className="mas-sheet-app-btn"
                    onClick={() => {
                      onOpenApp?.(a.id);
                      onClose?.();
                    }}
                  >
                    <BioAppIcon
                      glyph={a.iconGlyph}
                      gradient={a.iconGradient}
                      accent={a.iconAccent}
                      size={40}
                    />
                    <span className="mas-sheet-app-copy">
                      <span className="mas-sheet-app-name">{a.name}</span>
                      <span className="mas-sheet-app-sub">
                        {a.ageOrTier} · {a.languageLabel}
                      </span>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {curPage === 'my-requests' && (
          <div className="mas-sheet-group mas-sheet-pad">
            {requests.length === 0 ? (
              <div className="mas-sheet-empty">
                {tr(
                  'No repositories queued yet. Submit any open-source GitHub URL from the Workspace tab.',
                  '아직 등록된 저장소가 없습니다. 워크스페이스 탭에서 GitHub 주소를 신청해 보세요.'
                )}
              </div>
            ) : (
              requests.map((r, i) => (
                <div key={r.id} className={`mas-req-item ${i > 0 ? 'has-border' : ''}`}>
                  <div className="mas-req-item-top">
                    <strong>{r.titleHint || 'Open-Source Bio Tool'}</strong>
                    <span className="bio-status-pill info">{r.status}</span>
                  </div>
                  <div className="mas-req-item-url">{r.repoUrl}</div>
                </div>
              ))
            )}
          </div>
        )}

        {curPage === 'privacy-info' && (
          <div className="mas-sheet-group mas-sheet-pad mas-privacy-copy">
            <strong>
              {tr(
                'Scientific & Data Sovereignty Architecture',
                '연구 데이터 주권 및 무보관 아키텍처'
              )}
            </strong>
            <ul>
              <li>
                {tr(
                  'In-browser blocks execute locally inside your tab with zero raw file upload.',
                  '브라우저 로컬 블록은 실험 파일을 외부로 업로드하지 않고 탭 내부에서 즉시 처리합니다.'
                )}
              </li>
              <li>
                {tr(
                  'Cloud Run CPU blocks (such as NucleoSpec & PyDESeq2) run in stateless ephemeral containers with zero raw file retention.',
                  'Cloud Run CPU 블록(NucleoSpec, PyDESeq2 등)은 무상태 컨테이너에서 계산 직후 원본 데이터를 즉시 파기합니다.'
                )}
              </li>
              <li>
                {tr(
                  'BYOK LLM keys stay exclusively in your browser’s localStorage.',
                  'BYOK API 키는 브라우저 localStorage에만 보관되며 OpenBioApp 서버로 전송되지 않습니다.'
                )}
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="mas-sheet-footer">
        {pageStack.length > 1 ? (
          <button type="button" className="mas-sheet-btn" onClick={pop}>
            {tr('Back', '이전')}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="mas-sheet-btn" onClick={onClose}>
          {tr('Done', '완료')}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   OPENBIOAPP SETTINGS MODAL (BROWSER BYOK VAULT & PREFERENCES)
   ========================================================= */
export const BioSettingsWindowCard: React.FC<{
  embedded?: boolean;
  onClose?: () => void;
  onToast?: (msg: string) => void;
}> = ({ embedded = false, onClose, onToast }) => {
  const { tr } = useLocale();
  const settingsId = useId();
  const [settings, setSettings] = useState<ByokSettings>(loadByokSettings);
  const [confirmClear, setConfirmClear] = useState(false);

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

  return (
    <div
      className={`mas-settings-window ${embedded ? 'is-embedded' : ''}`}
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-label={tr('OpenBioApp Settings', 'OpenBioApp 설정')}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mas-sheet-header">
        <span>{tr('Settings', '설정')}</span>
        {onClose && (
          <button
            type="button"
            className="mas-circle-nav-btn"
            onClick={onClose}
            aria-label={tr('Close settings dialog', '설정 창 닫기')}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="mas-settings-body">
        <div className="mas-byok-card">
          <div className="mas-byok-head">
            <span className="mas-byok-title">
              <KeyRound size={15} aria-hidden="true" />
              <span>
                {tr(
                  'Auto-Research BYOK Key Vault',
                  'Auto-Research BYOK API 키 보관함'
                )}
              </span>
            </span>
            <span className="mas-autosave-badge">
              <Check size={12} aria-hidden="true" />
              <span>{tr('Auto-saved locally', '브라우저 자동 저장')}</span>
            </span>
          </div>
          <p className="mas-byok-note">
            {tr(
              'Stored strictly in your browser’s localStorage; never sent to OpenBioApp servers.',
              '브라우저 localStorage에만 저장되며 OpenBioApp 서버로 절대 전송되지 않습니다.'
            )}
          </p>

          <div className="mas-byok-grid">
            <div>
              <label htmlFor={`${settingsId}-provider`} className="studio-label">
                {tr('LLM Provider', 'LLM 제공자')}
              </label>
              <select
                id={`${settingsId}-provider`}
                className="studio-select"
                value={settings.provider}
                onChange={(e) =>
                  updateField('provider', e.target.value as ByokSettings['provider'])
                }
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${settingsId}-model`} className="studio-label">
                {tr('Model ID', '모델 ID')}
              </label>
              <input
                id={`${settingsId}-model`}
                type="text"
                className="studio-input is-mono"
                value={settings.modelName}
                onChange={(e) => updateField('modelName', e.target.value)}
                placeholder="Model ID"
              />
            </div>
          </div>

          <div className="mas-byok-key-field">
            <label htmlFor={`${settingsId}-apikey`} className="studio-label">
              {tr('API Key', 'API 키')}
            </label>
            <input
              id={`${settingsId}-apikey`}
              type="password"
              className="studio-input"
              value={settings.apiKey}
              onChange={(e) => {
                setConfirmClear(false);
                updateField('apiKey', e.target.value);
              }}
              placeholder={tr(
                'Paste API key (AIza... / sk-...)',
                'API 키 붙여넣기 (AIza... / sk-...)'
              )}
            />
          </div>
        </div>

        <label className="mas-check-row" htmlFor={`${settingsId}-autosave`}>
          <input
            id={`${settingsId}-autosave`}
            type="checkbox"
            checked={settings.autoSaveRunsToWorkspace}
            onChange={() =>
              updateField('autoSaveRunsToWorkspace', !settings.autoSaveRunsToWorkspace)
            }
          />
          <span className="mas-check-copy">
            <span className="mas-check-label">
              {tr(
                'Automatically save run outputs to Workspace',
                '분석 결과를 워크스페이스에 자동 저장'
              )}
            </span>
            <span className="mas-check-helper">
              {tr(
                'Every table, 3D structure, and chart saves automatically for downstream chaining.',
                '모든 결과 테이블, 3D 구조, 그래프를 후속 체이닝용으로 자동 보관합니다.'
              )}
            </span>
          </span>
        </label>

        <label className="mas-check-row" htmlFor={`${settingsId}-telemetry`}>
          <input
            id={`${settingsId}-telemetry`}
            type="checkbox"
            checked={settings.shareAnonymousSanitizerTelemetry}
            onChange={() =>
              updateField(
                'shareAnonymousSanitizerTelemetry',
                !settings.shareAnonymousSanitizerTelemetry
              )
            }
          />
          <span className="mas-check-copy">
            <span className="mas-check-label">
              {tr(
                'Enable Feedback Healer Format Diagnostics',
                'Feedback Healer 형식 오류 진단 활성화'
              )}
            </span>
            <span className="mas-check-helper">
              {tr(
                'Allow reporting anonymized header/delimiter errors (never raw experimental values) when you click Report Issue.',
                '오류 제보 버튼 클릭 시 원본 실험값을 제외한 익명 헤더·구분자 정보만 전송합니다.'
              )}
            </span>
          </span>
        </label>

        <div className="mas-section-divider mas-settings-divider" />

        <div className="mas-settings-footer">
          {!confirmClear ? (
            <button
              type="button"
              className="mas-sheet-btn"
              disabled={!settings.apiKey}
              onClick={() => setConfirmClear(true)}
            >
              {tr('Clear Key Vault', 'API 키 삭제')}
            </button>
          ) : (
            <div className="mas-clear-confirm">
              <button
                type="button"
                className="mas-sheet-btn is-danger-btn"
                onClick={() => {
                  updateField('apiKey', '');
                  setConfirmClear(false);
                  onToast?.(
                    tr(
                      'Cleared local BYOK key from browser storage.',
                      '브라우저에 저장된 BYOK API 키를 삭제했습니다.'
                    )
                  );
                }}
              >
                {tr('Confirm Clear Key', '삭제 확인')}
              </button>
              <button
                type="button"
                className="mas-sheet-btn"
                onClick={() => setConfirmClear(false)}
              >
                {tr('Cancel', '취소')}
              </button>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              className="mas-get-pill solid-blue"
              onClick={onClose}
            >
              {tr('Done', '완료')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
