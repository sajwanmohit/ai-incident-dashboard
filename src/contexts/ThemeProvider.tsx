import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeContext";

const themeStorageKey = "incident-analyser:theme";

function loadTheme(): Theme {
  return window.localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "dark" ? "#0c111d" : "#f3f6fa",
    );
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
