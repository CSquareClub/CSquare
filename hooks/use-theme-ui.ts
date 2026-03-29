"use client";

import { useMemo, useState } from "react";

export type ThemeUIColorClasses = {
  root: string;
  panel: string;
  panelSoft: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentMuted: string;
  buttonPrimary: string;
  buttonOutline: string;
  buttonGhost: string;
};

export function useThemeUI(initialDark = true) {
  const [isDark, setIsDark] = useState(initialDark);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors: ThemeUIColorClasses = useMemo(
    () =>
      isDark
        ? {
            root: "bg-[#0a0a0a] text-neutral-300",
            panel: "bg-[#111111]",
            panelSoft: "bg-neutral-900",
            border: "border-neutral-800",
            textPrimary: "text-white",
            textSecondary: "text-neutral-400",
            accent: "text-blue-400",
            accentMuted: "bg-blue-500/10 text-blue-400",
            buttonPrimary: "bg-white text-black hover:bg-neutral-200",
            buttonOutline:
              "border border-neutral-800 text-neutral-300 hover:bg-neutral-900",
            buttonGhost: "text-neutral-400 hover:text-white hover:bg-neutral-900",
          }
        : {
            root: "bg-white text-neutral-700",
            panel: "bg-white",
            panelSoft: "bg-neutral-50",
            border: "border-neutral-200",
            textPrimary: "text-black",
            textSecondary: "text-neutral-500",
            accent: "text-blue-600",
            accentMuted: "bg-blue-50 text-blue-600",
            buttonPrimary: "bg-black text-white hover:bg-neutral-800",
            buttonOutline:
              "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
            buttonGhost: "text-neutral-600 hover:text-black hover:bg-neutral-100",
          },
    [isDark]
  );

  const rootContainerClass = `min-h-screen font-sans transition-colors duration-300 ${colors.root}`;

  return {
    isDark,
    toggleTheme,
    rootContainerClass,
    colors,
  };
}
