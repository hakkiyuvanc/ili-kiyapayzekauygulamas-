/**
 * Theme Configuration - Romantic Dark Mode
 *
 * Deep Rose and Midnight Blue themes for night-time analysis
 */

export const themes = {
  light: {
    name: "Light",
    colors: {
      background: "#FFFFFF",
      foreground: "#1F2937",
      primary: "#EC4899", // Pink-500
      secondary: "#F472B6", // Pink-400
      accent: "#FB7185", // Rose-400
      muted: "#F3F4F6",
      border: "#E5E7EB",
      card: "#FFFFFF",
      cardForeground: "#1F2937",
    },
  },
  "deep-rose": {
    name: "Deep Rose",
    colors: {
      background: "#1A0B13", // Very dark rose
      foreground: "#FDF2F8", // Pink-50
      primary: "#FB7185", // Rose-400
      secondary: "#FDA4AF", // Rose-300
      accent: "#FBBF24", // Amber-400 for highlights
      muted: "#3F1D2B",
      border: "#831843", // Rose-900
      card: "#2D1420",
      cardForeground: "#FCE7F3", // Pink-100
    },
  },
  "midnight-blue": {
    name: "Midnight Blue",
    colors: {
      background: "#0F172A", // Slate-900
      foreground: "#F1F5F9", // Slate-100
      primary: "#818CF8", // Indigo-400
      secondary: "#A78BFA", // Violet-400
      accent: "#F472B6", // Pink-400
      muted: "#1E293B", // Slate-800
      border: "#334155", // Slate-700
      card: "#1E293B",
      cardForeground: "#E2E8F0", // Slate-200
    },
  },
};

export type ThemeName = keyof typeof themes;

/**
 * Apply theme to document
 */
export function applyTheme(themeName: ThemeName) {
  const theme = themes[themeName];
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Save preference
  localStorage.setItem("theme", themeName);

  // Add dark class if needed
  if (themeName !== "light") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Get saved theme or default
 */
export function getSavedTheme(): ThemeName {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme") as ThemeName;
  return saved && saved in themes ? saved : "light";
}

/**
 * Theme Provider Hook
 */
import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");

  useEffect(() => {
    const savedTheme = getSavedTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
