import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeKey } from '@/constants/colors';

interface ThemeContextValue {
  theme: ThemeKey;
  colors: typeof ThemeColors.default;
  setTheme: (theme: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = '@matrix_solver_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('default');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val && val in ThemeColors) {
        setThemeState(val as ThemeKey);
      }
    });
  }, []);

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    AsyncStorage.setItem(THEME_KEY, t);
  };

  const colors = ThemeColors[theme];

  const value = useMemo(() => ({ theme, colors, setTheme }), [theme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
