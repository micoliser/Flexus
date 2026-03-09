import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "flexus-theme-preference";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const THEME_SYSTEM = "system";

const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return THEME_LIGHT;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME_DARK
    : THEME_LIGHT;
};

const getStoredPreference = () => {
  if (typeof window === "undefined") {
    return THEME_SYSTEM;
  }

  const storedValue = localStorage.getItem(THEME_STORAGE_KEY);

  if ([THEME_LIGHT, THEME_DARK, THEME_SYSTEM].includes(storedValue)) {
    return storedValue;
  }

  return THEME_SYSTEM;
};

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] =
    useState(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme =
    themePreference === THEME_SYSTEM ? systemTheme : themePreference;
  const isDarkMode = resolvedTheme === THEME_DARK;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = (event) => {
      setSystemTheme(event.matches ? THEME_DARK : THEME_LIGHT);
    };

    setSystemTheme(mediaQuery.matches ? THEME_DARK : THEME_LIGHT);
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    document.documentElement.classList.toggle("light-mode", !isDarkMode);
  }, [resolvedTheme, isDarkMode]);

  const setThemePreference = (nextPreference) => {
    if (![THEME_LIGHT, THEME_DARK, THEME_SYSTEM].includes(nextPreference)) {
      return;
    }

    setThemePreferenceState(nextPreference);

    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    }
  };

  const toggleTheme = () => {
    setThemePreference(isDarkMode ? THEME_LIGHT : THEME_DARK);
  };

  const resetThemePreference = () => {
    setThemePreferenceState(THEME_SYSTEM);

    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      isDarkMode,
      setThemePreference,
      toggleTheme,
      resetThemePreference,
      THEME_LIGHT,
      THEME_DARK,
      THEME_SYSTEM,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themePreference, resolvedTheme, isDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
