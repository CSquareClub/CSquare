"use client";

import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, LogOut, Menu, Moon, RefreshCw, Sun, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? "dark") === "dark";

  const activeSection = pathname.startsWith("/admin/events")
    ? "Events"
    : pathname.startsWith("/admin/gallery")
      ? "Gallery"
      : pathname.startsWith("/admin/team")
        ? "Team"
        : pathname.startsWith("/admin/registrations")
          ? "Registrations"
          : pathname.startsWith("/admin/dashboard") || pathname === "/admin"
            ? "Dashboard"
            : "Admin";

  const quickAction = pathname.startsWith("/admin/events")
    ? { label: "Open Events", href: "/admin/events" }
    : pathname.startsWith("/admin/gallery")
      ? { label: "Add Image", href: "/admin/gallery" }
      : pathname.startsWith("/admin/registrations")
        ? { label: "Open Dashboard", href: "/admin/dashboard" }
        : { label: "Open Events", href: "/admin/events" };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-white/35 dark:border-white/[0.06] dark:bg-black/28 backdrop-blur-2xl backdrop-saturate-150 px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-black/40 hover:text-black/70 hover:bg-white/30 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/[0.04] transition-colors"
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
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/28 px-3 py-1.5 text-xs font-medium text-black/55 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/45">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.45)]" />
          {activeSection}
        </div>

        <Link
          href={quickAction.href}
          className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100/80 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/15"
        >
          {quickAction.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={() => router.refresh()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/35 text-black/50 backdrop-blur-md hover:bg-white/50 hover:text-black/80 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/70 transition-colors"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            if (!mounted) return;
            setTheme(isDark ? "light" : "dark");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/35 text-black/50 backdrop-blur-md hover:bg-white/50 hover:text-black/80 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/70 transition-colors disabled:cursor-not-allowed disabled:opacity-55"
          aria-label="Toggle theme"
          title="Toggle theme"
          disabled={!mounted}
        >
          {mounted ? (
            isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" aria-hidden="true" />
          )}
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
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-black/50 border border-white/10 bg-white/25 backdrop-blur-md hover:border-red-200 hover:text-red-600 hover:bg-red-50/60 dark:text-white/40 dark:border-white/[0.06] dark:hover:text-red-400 dark:hover:bg-red-500/8 dark:hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
