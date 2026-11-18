import {
  BIO_APPS,
  BIO_CATEGORIES,
  EDITORIAL_STORIES,
} from '../../data/bioStoreData';
import { BioApp, BioCategoryId, RouteView } from '../../types/store';
import { BIO_APP_MANIFESTS } from '../schema/bioAppSchema';

export const EXECUTABLE_BIO_APPS: BioApp[] = BIO_APPS.filter((a) =>
  Boolean(BIO_APP_MANIFESTS[a.id])
);

export function parseLocationToRoute(pathname: string, search: string): RouteView {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/discover') {
    return { kind: 'tab', tab: 'discover' };
  }
  if (clean === '/auto-research') {
    return { kind: 'tab', tab: 'arcade' };
  }
  if (clean === '/workspace') {
    return { kind: 'tab', tab: 'workspace' };
  }
  if (clean === '/categories') {
    return { kind: 'tab', tab: 'categories' };
  }
  if (clean.startsWith('/categories/')) {
    const catId = decodeURIComponent(clean.slice('/categories/'.length)) as BioCategoryId;
    if (BIO_CATEGORIES.some((c) => c.id === catId)) {
      return { kind: 'category', categoryId: catId };
    }
    return { kind: 'not-found', path: pathname };
  }
  if (clean === '/releases' || clean === '/updates') {
    return { kind: 'tab', tab: 'updates' };
  }
  if (clean === '/directory') {
    return {
      kind: 'see-all',
      title: `All Verified Biomedical Studios (${EXECUTABLE_BIO_APPS.length})`,
      appIds: EXECUTABLE_BIO_APPS.map((a) => a.id),
    };
  }
  if (clean === '/search') {
    const params = new URLSearchParams(search);
    return { kind: 'search', query: params.get('q') || '' };
  }
  if (clean.startsWith('/app/')) {
    const appId = decodeURIComponent(clean.slice('/app/'.length));
    if (BIO_APP_MANIFESTS[appId]) {
      return { kind: 'app-detail', appId };
    }
    return { kind: 'not-found', path: pathname };
  }
  if (clean.startsWith('/story/')) {
    const storyId = decodeURIComponent(clean.slice('/story/'.length));
    if (EDITORIAL_STORIES.some((s) => s.id === storyId)) {
      return { kind: 'story', storyId };
    }
    return { kind: 'not-found', path: pathname };
  }
  if (clean === '/privacy') {
    return { kind: 'privacy' };
  }
  if (clean === '/terms') {
    return { kind: 'terms' };
  }
  return { kind: 'not-found', path: pathname };
}

export function routeToUrl(route: RouteView): string {
  switch (route.kind) {
    case 'tab':
      if (route.tab === 'discover') return '/';
      if (route.tab === 'arcade') return '/auto-research';
      if (route.tab === 'workspace') return '/workspace';
      if (route.tab === 'categories') return '/categories';
      if (route.tab === 'updates') return '/releases';
      return '/';
    case 'category':
      return `/categories/${encodeURIComponent(route.categoryId)}`;
    case 'app-detail':
      return `/app/${encodeURIComponent(route.appId)}`;
    case 'story':
      return `/story/${encodeURIComponent(route.storyId)}`;
    case 'search':
      return route.query.trim()
        ? `/search?q=${encodeURIComponent(route.query.trim())}`
        : '/search';
    case 'see-all':
      return '/directory';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'not-found':
      return route.path || '/404';
  }
}

export function computeDocumentTitle(
  route: RouteView,
  catalogApps: BioApp[],
  tabLabelLookup: (tab: string) => string | undefined,
  locale: 'en' | 'ko' = 'en'
): string {
  const ko = locale === 'ko';
  if (route.kind === 'app-detail') {
    const a = catalogApps.find((x) => x.id === route.appId);
    if (a) return `${a.name} — OpenBioApp`;
  } else if (route.kind === 'story') {
    const s = EDITORIAL_STORIES.find((x) => x.id === route.storyId);
    if (s) return `${s.title} — OpenBioApp`;
  } else if (route.kind === 'category') {
    const c = BIO_CATEGORIES.find((x) => x.id === route.categoryId);
    if (c) return `${c.name} — OpenBioApp`;
  } else if (route.kind === 'search') {
    return route.query
      ? `${route.query} — ${ko ? '검색' : 'Search'} — OpenBioApp`
      : `${ko ? '검색' : 'Search'} — OpenBioApp`;
  } else if (route.kind === 'privacy') {
    return ko ? '개인정보 처리방침 — OpenBioApp' : 'Privacy Policy — OpenBioApp';
  } else if (route.kind === 'terms') {
    return ko ? '이용약관 및 학술 라이선스 — OpenBioApp' : 'Terms & Academic Licensing — OpenBioApp';
  } else if (route.kind === 'not-found') {
    return '404 Not Found — OpenBioApp';
  } else if (route.kind === 'tab' && route.tab !== 'discover') {
    const label = tabLabelLookup(route.tab);
    if (label) return `${label} — OpenBioApp`;
  }
  return ko
    ? 'OpenBioApp — 검증된 오픈소스 바이오 스튜디오'
    : 'OpenBioApp — Verified Open-Source Biomedical Studios';
}
