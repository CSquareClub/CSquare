"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Image,
  User,
  UserRoundCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Team", href: "/admin/team", icon: User },
  // { label: "Stalls", href: "/admin/stalls", icon: Store },
  // { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const source = searchParams.get("source") || "";
  const registrationsRootActive = pathname.startsWith("/admin/registrations");
  const cusocActive = registrationsRootActive && (source === "" || source.startsWith("cusoc"));
  const ambassadorActive = registrationsRootActive && source.includes("outside-ambassadors");

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-black/5 bg-gray-50/50 dark:border-white/[0.06] dark:bg-[#060606] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-black/40 hover:text-black/70 hover:border-black/20 dark:border-white/[0.08] dark:bg-[#0a0a0a] dark:text-white/40 dark:hover:text-white/70 dark:hover:border-white/[0.15] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-black/5 dark:border-white/[0.04]">
        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-500/15">
          <Shield className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-black dark:text-white truncate">
              C Square
            </p>
            <p className="text-[11px] text-black/50 dark:text-white/30 truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <Link
            href="/admin/registrations?source=cusoc-2026"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              registrationsRootActive
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm shadow-red-500/5"
                : "text-black/50 hover:text-black/80 hover:bg-black/5 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/[0.03]"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Registrations" : undefined}
          >
            <Users
              className={`flex-shrink-0 w-[18px] h-[18px] transition-colors ${
                registrationsRootActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-black/40 group-hover:text-black/70 dark:text-white/30 dark:group-hover:text-white/60"
              }`}
            />
            {!collapsed && <span>Registrations</span>}
          </Link>

          {!collapsed && (
            <div className="mt-1 ml-6 space-y-1">
              <Link
                href="/admin/registrations?source=cusoc-2026"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  cusocActive
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "text-black/50 hover:bg-black/5 hover:text-black/80 dark:text-white/35 dark:hover:bg-white/[0.03] dark:hover:text-white/70"
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                CUSoC Registrations
              </Link>
              <Link
                href="/admin/registrations?source=outside-ambassadors"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  ambassadorActive
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "text-black/50 hover:bg-black/5 hover:text-black/80 dark:text-white/35 dark:hover:bg-white/[0.03] dark:hover:text-white/70"
                }`}
              >
                <UserRoundCheck className="h-3.5 w-3.5" />
                Campus Ambassadors
              </Link>
            </div>
          )}
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm shadow-red-500/5"
                  : "text-black/50 hover:text-black/80 hover:bg-black/5 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/[0.03]"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`flex-shrink-0 w-[18px] h-[18px] transition-colors ${
                  isActive
                    ? "text-red-600 dark:text-red-400"
                    : "text-black/40 group-hover:text-black/70 dark:text-white/30 dark:group-hover:text-white/60"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Sign Out */}
      <div className="border-t border-black/5 dark:border-white/[0.04] px-3 py-4">
        {!collapsed && session?.user && (
          <div className="px-3 mb-3">
            <p className="text-xs font-medium text-black/70 dark:text-white/50 truncate">
              {session.user.name}
            </p>
            <p className="text-[11px] text-black/40 dark:text-white/25 truncate">
              {session.user.email}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black/50 hover:text-red-600 hover:bg-red-50 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/5 transition-all duration-200 w-full ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="flex-shrink-0 w-[18px] h-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
