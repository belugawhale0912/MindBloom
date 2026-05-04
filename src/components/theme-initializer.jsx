"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const useDark = storedTheme === "dark" || (!storedTheme && prefersDark);

      document.documentElement.classList.toggle("dark", useDark);
    } catch (_) {
      // Ignore storage/media query errors in restricted environments.
    }
  }, []);

  return null;
}
