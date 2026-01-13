import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUserStore } from '../stores/userStore';
import { getUiPreferences, updateUiPreferences, isDemoMode } from '../services/firebase';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const userId = useUserStore((state) => state.user?.uid);
  const [theme, setThemeState] = useState<Theme>('system');

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    return getSystemTheme();
  });

  useEffect(() => {
    let active = true;

    const loadTheme = async () => {
      if (!userId || isDemoMode) return;
      try {
        const prefs = await getUiPreferences(userId);
        if (active && prefs?.theme) {
          setThemeState(prefs.theme);
        }
      } catch {
        // Ignore theme load failures and fall back to system.
      }
    };

    void loadTheme();
    return () => {
      active = false;
    };
  }, [userId]);

  // Update document class when theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      setResolvedTheme(systemTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      setResolvedTheme(theme);
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (userId && !isDemoMode) {
      void updateUiPreferences(userId, { theme: newTheme });
    }
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
