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
            root: "bg-[#0a0a0a] text-white",
            panel: "bg-[#111111]",
            panelSoft: "bg-black",
            border: "border-white",
            textPrimary: "text-white",
            textSecondary: "text-neutral-400",
            accent: "text-[#dc2626]",
            accentMuted: "bg-[#dc2626]/10 text-[#dc2626]",
            buttonPrimary: "bg-white text-[#dc2626] hover:bg-[#dc2626] hover:text-white",
            buttonOutline:
              "border border-white text-white hover:bg-[#dc2626] hover:text-white",
            buttonGhost: "text-white hover:text-[#dc2626] hover:bg-white/10",
          }
        : {
            root: "bg-white text-black",
            panel: "bg-white",
            panelSoft: "bg-neutral-50",
            border: "border-black",
            textPrimary: "text-black",
            textSecondary: "text-neutral-500",
            accent: "text-[#dc2626]",
            accentMuted: "bg-[#dc2626]/10 text-[#dc2626]",
            buttonPrimary: "bg-[#dc2626] text-white hover:bg-black hover:text-white",
            buttonOutline:
              "border border-black text-black hover:bg-[#dc2626] hover:text-white",
            buttonGhost: "text-black hover:text-[#dc2626] hover:bg-black/10",
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
