import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { BioAppRunResult, BioDataType } from '../schema/bioAppSchema';

export interface WorkspaceRunItem {
  id: string;
  title: string;
  appId: string;
  bioType: string;
  status: 'completed' | 'failed';
  summary: string;
  sizeBytes: number;
  chainedFromId?: string | null;
  createdAtIso: string;
  result: BioAppRunResult;
}

export interface AppConversionRequestItem {
  id: string;
  repoUrl: string;
  doi?: string | null;
  titleHint?: string | null;
  notes?: string | null;
  submittedBy: string;
  status: string;
  createdAtIso: string;
}

export interface ByokSettings {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  modelName: string;
  autoSaveRunsToWorkspace: boolean;
  showExperimentalNightlyApps: boolean;
  shareAnonymousSanitizerTelemetry: boolean;
}

const LOCAL_RUNS_KEY = 'openbioapp_workspace_runs_v1';
const BYOK_KEY = 'openbioapp_byok_settings_v1';

export const DEFAULT_BYOK_SETTINGS: ByokSettings = {
  provider: 'gemini',
  apiKey: '',
  modelName: 'gemini-2.5-flash',
  autoSaveRunsToWorkspace: true,
  showExperimentalNightlyApps: true,
  shareAnonymousSanitizerTelemetry: true,
};

export function loadByokSettings(): ByokSettings {
  try {
    const raw = localStorage.getItem(BYOK_KEY);
    if (!raw) return DEFAULT_BYOK_SETTINGS;
    return { ...DEFAULT_BYOK_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BYOK_SETTINGS;
  }
}

export function saveByokSettings(next: ByokSettings): void {
  localStorage.setItem(BYOK_KEY, JSON.stringify(next));
}

export function loadLocalWorkspaceRuns(): WorkspaceRunItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_RUNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalWorkspaceRuns(items: WorkspaceRunItem[]): void {
  try {
    localStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify(items.slice(0, 35)));
  } catch {
    // Ignore quota errors on large 3D PDB strings; trim PDB text if needed
  }
}

export function subscribeAuthUser(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGooglePopup(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfileDoc(cred.user);
  return cred.user;
}

export async function signInOrRegisterWithEmail(
  email: string,
  password: string,
  displayName?: string,
  isRegister = false
): Promise<User> {
  const cred = isRegister
    ? await createUserWithEmailAndPassword(auth, email.trim(), password)
    : await signInWithEmailAndPassword(auth, email.trim(), password);

  if (isRegister && displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  await ensureUserProfileDoc(cred.user, displayName);
  return cred.user;
}

export async function signOutOpenBioApp(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserProfileDoc(
  user: User,
  overrideName?: string
): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  const safeName = (overrideName || user.displayName || user.email?.split('@')[0] || 'Researcher').slice(0, 110);
  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: safeName,
      email: user.email || null,
      photoURL: user.photoURL && /^https?:\/\//.test(user.photoURL) ? user.photoURL : null,
      orcid: null,
      savedAppIds: ['nucleospec-dna-agnc', 'pydeseq2-deg', 'opentargets-explorer'],
      usedStorageBytes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      updatedAt: serverTimestamp(),
    });
  }
}

export async function persistRunToWorkspace(
  run: BioAppRunResult,
  chainedFromId?: string | null
): Promise<WorkspaceRunItem> {
  const outTypes = Object.keys(run.chained_outputs || {}) as BioDataType[];
  const primaryType = outTypes[0] || 'AnyDataTable';

  // Keep preview compact (< 45 KB) for fast Firestore sync & security rule bounds
  const compactResult: BioAppRunResult = {
    ...run,
    structure3d: run.structure3d
      ? {
          ...run.structure3d,
          pdbText: run.structure3d.pdbText.slice(0, 32000),
        }
      : undefined,
    table: run.table ? run.table.slice(0, 80) : undefined,
  };
  const serialized = JSON.stringify(compactResult);
  const sizeBytes = new Blob([serialized]).size;

  const localItem: WorkspaceRunItem = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `${run.appTitle}`,
    appId: run.appId,
    bioType: primaryType,
    status: 'completed',
    summary: String(run.summary?.headline || 'Completed analysis').slice(0, 900),
    sizeBytes,
    chainedFromId: chainedFromId || null,
    createdAtIso: run.executedAt,
    result: run,
  };

  if (!loadByokSettings().autoSaveRunsToWorkspace) {
    return localItem;
  }

  const existing = loadLocalWorkspaceRuns();
  saveLocalWorkspaceRuns([localItem, ...existing]);

  const user = auth.currentUser;
  if (user) {
    try {
      const colRef = collection(db, 'users', user.uid, 'workspaceItems');
      const docRef = await addDoc(colRef, {
        title: localItem.title.slice(0, 280),
        appId: localItem.appId.slice(0, 110),
        bioType: localItem.bioType.slice(0, 75),
        status: 'completed',
        summary: localItem.summary.slice(0, 4000),
        storagePath: null,
        sizeBytes: Math.max(0, Math.round(sizeBytes)),
        previewData: serialized.length <= 60000 ? serialized : localItem.summary,
        chainedFromId: chainedFromId ? String(chainedFromId).slice(0, 120) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      localItem.id = docRef.id;
    } catch (err) {
      console.warn('Cloud workspace sync skipped:', err);
    }
  }

  return localItem;
}

export async function fetchCloudWorkspaceRuns(): Promise<WorkspaceRunItem[]> {
  const user = auth.currentUser;
  if (!user) return loadLocalWorkspaceRuns();
  try {
    const q = query(
      collection(db, 'users', user.uid, 'workspaceItems'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    const cloudItems: WorkspaceRunItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      let parsedResult: BioAppRunResult | null = null;
      if (typeof data.previewData === 'string' && data.previewData.startsWith('{')) {
        try {
          parsedResult = JSON.parse(data.previewData);
        } catch {
          parsedResult = null;
        }
      }
      if (parsedResult) {
        cloudItems.push({
          id: d.id,
          title: data.title || parsedResult.appTitle,
          appId: data.appId || parsedResult.appId,
          bioType: data.bioType || 'AnyDataTable',
          status: 'completed',
          summary: data.summary || parsedResult.summary?.headline || '',
          sizeBytes: data.sizeBytes || 0,
          chainedFromId: data.chainedFromId || null,
          createdAtIso: parsedResult.executedAt || new Date().toISOString(),
          result: parsedResult,
        });
      }
    });
    return cloudItems.length ? cloudItems : loadLocalWorkspaceRuns();
  } catch {
    return loadLocalWorkspaceRuns();
  }
}

export async function deleteWorkspaceRunItem(itemId: string): Promise<void> {
  const next = loadLocalWorkspaceRuns().filter((x) => x.id !== itemId);
  saveLocalWorkspaceRuns(next);
  const user = auth.currentUser;
  if (user && !itemId.startsWith('run-')) {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'workspaceItems', itemId));
    } catch {
      // ignore
    }
  }
}

export async function submitRepoConversionRequest(params: {
  repoUrl: string;
  doi?: string;
  titleHint?: string;
  notes?: string;
}): Promise<{ id: string; persistedToCloud: boolean }> {
  const user = auth.currentUser;
  const cleanUrl = params.repoUrl.trim().slice(0, 480);
  if (!cleanUrl || /^(javascript|data|vbscript):/i.test(cleanUrl)) {
    throw new Error('Please enter a valid GitHub, GitLab, Hugging Face, or DOI URL.');
  }

  if (user) {
    const docRef = await addDoc(collection(db, 'app_requests'), {
      repoUrl: cleanUrl,
      doi: params.doi?.trim().slice(0, 180) || null,
      titleHint: params.titleHint?.trim().slice(0, 180) || null,
      notes: params.notes?.trim().slice(0, 1800) || null,
      submittedBy: user.uid,
      status: 'queued',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, persistedToCloud: true };
  }

  // Fallback local queue when signed out
  const localQueueKey = 'openbioapp_local_requests_v1';
  const prev = JSON.parse(localStorage.getItem(localQueueKey) || '[]');
  const id = `local-req-${Date.now()}`;
  prev.unshift({
    id,
    repoUrl: cleanUrl,
    doi: params.doi || null,
    titleHint: params.titleHint || null,
    notes: params.notes || null,
    submittedBy: 'guest-local',
    status: 'queued',
    createdAtIso: new Date().toISOString(),
  });
  localStorage.setItem(localQueueKey, JSON.stringify(prev.slice(0, 20)));
  return { id, persistedToCloud: false };
}

export async function fetchQueuedAppRequests(): Promise<AppConversionRequestItem[]> {
  const localQueue: AppConversionRequestItem[] = JSON.parse(
    localStorage.getItem('openbioapp_local_requests_v1') || '[]'
  );
  try {
    const q = query(collection(db, 'app_requests'), orderBy('createdAt', 'desc'), limit(20));
    const snap = await getDocs(q);
    const cloud: AppConversionRequestItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      cloud.push({
        id: d.id,
        repoUrl: data.repoUrl,
        doi: data.doi || null,
        titleHint: data.titleHint || null,
        notes: data.notes || null,
        submittedBy: data.submittedBy || 'researcher',
        status: data.status || 'queued',
        createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      });
    });
    return [...cloud, ...localQueue];
  } catch {
    return localQueue;
  }
}

export async function submitSanitizerFeedbackReport(params: {
  appId: string;
  errorCode: string;
  errorSummary: string;
  inputFormatHint?: string;
}): Promise<void> {
  if (!loadByokSettings().shareAnonymousSanitizerTelemetry) return;
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db, 'feedback_reports'), {
    appId: params.appId.slice(0, 110),
    errorCode: params.errorCode.slice(0, 110),
    errorSummary: params.errorSummary.slice(0, 3500),
    inputFormatHint: params.inputFormatHint?.slice(0, 180) || null,
    submittedBy: user.uid,
    createdAt: serverTimestamp(),
  });
}
