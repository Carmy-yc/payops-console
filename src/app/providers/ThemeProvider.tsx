import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
};

const THEME_STORAGE_KEY = 'payops-console.theme.preference';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(storedPreference) ? storedPreference : 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() =>
    getStoredThemePreference(),
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
    }),
    [resolvedTheme, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSetting() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeSetting 必须在 ThemeProvider 内部使用');
  }

  return context;
}
