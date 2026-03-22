"use client";

import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, Moon, Sun } from "lucide-react";

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white/80 dark:border-white/[0.06] dark:bg-[#030303]/80 backdrop-blur-xl px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-black/40 hover:text-black/70 hover:bg-black/5 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/[0.04] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-sm font-semibold text-black/80 dark:text-white/80">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h2>
          <p className="text-[11px] text-black/50 dark:text-white/30">
            Here&apos;s what&apos;s happening today
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 bg-black/[0.02] text-black/50 hover:bg-black/5 hover:text-black/80 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/70 transition-colors"
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 block dark:hidden" />
        </button>

        {session?.user && (
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-red-500/15">
              {session.user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-black/70 dark:text-white/60">
                {session.user.name}
              </p>
              <p className="text-[10px] text-black/40 dark:text-white/25">
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-black/50 border border-black/5 hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:text-white/40 dark:border-white/[0.06] dark:hover:text-red-400 dark:hover:bg-red-500/5 dark:hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
