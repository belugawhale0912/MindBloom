"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const useDark = storedTheme === "dark";

      document.documentElement.classList.toggle("dark", useDark);
    } catch (_) {
      // Ignore storage/media query errors in restricted environments.
    }
  }, []);

  return null;
}
