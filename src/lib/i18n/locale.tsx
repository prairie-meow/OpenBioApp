import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLocale = 'en' | 'ko';

const LOCALE_STORAGE_KEY = 'openbioapp_locale_v1';

function detectInitialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'ko') return saved;
  } catch {
    // ignore storage errors
  }
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('ko') ? 'ko' : 'en';
}

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  toggleLocale: () => void;
  tr: (en: string, ko: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  tr: (en) => en,
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<AppLocale>(detectInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore storage errors
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (next) => setLocaleState(next),
      toggleLocale: () => setLocaleState((prev) => (prev === 'en' ? 'ko' : 'en')),
      tr: (en, ko) => (locale === 'ko' ? ko : en),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
