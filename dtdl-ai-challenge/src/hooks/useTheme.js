import { useCallback, useState } from "react";

const KEY = "dtdl-theme";

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "dark"
  );

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next); // only saved on an explicit choice
      } catch {}
      return next;
    });
  }, []);

  return { theme, toggle };
}