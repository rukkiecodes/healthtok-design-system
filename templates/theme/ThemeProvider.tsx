/**
 * Theme provider — 'system' | 'light' | 'dark', persisted.
 *
 * Mount ONCE, high in app/_layout.tsx, above every consumer:
 *
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 * Then in any component:
 *
 *   const { colors, isDark } = useTheme();
 *
 * Never import `lightColors` / `darkColors` directly in a component — go through
 * the hook, or that component won't react to a theme change.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { palettes, type Palette } from '../constants/palette';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'healthtok.theme.mode';

type ThemeContextValue = {
  /** What the user chose. */
  mode: ThemeMode;
  /** What is actually rendering right now. */
  resolved: 'light' | 'dark';
  isDark: boolean;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
  /** False until the persisted preference has loaded. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  // Load the persisted preference once on mount.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {
        // A failed read is not fatal — fall back to 'system'.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const resolved: 'light' | 'dark' =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      isDark: resolved === 'dark',
      colors: palettes[resolved] as Palette,
      setMode,
      ready,
    }),
    [mode, resolved, setMode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>. Mount it in app/_layout.tsx.');
  }
  return ctx;
}

/** Convenience for the common case. */
export function useColors(): Palette {
  return useTheme().colors;
}
