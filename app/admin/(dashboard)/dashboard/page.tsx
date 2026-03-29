"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  CalendarDays,
  Activity,
  BarChart3,
  Eye,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type DashboardPayload = {
  totalRegistrations: number;
  activeEvents: number;
  analytics: {
    totalImpressions: number;
    impressionsToday: number;
    uniqueVisitors: number;
    uniqueVisitorsToday: number;
    topPages: Array<{ path: string; views: number }>;
    impressionsLast7Days: Array<{ date: string; views: number }>;
  };
};

const quickActions = [
  {
    label: "View Registrations",
    description: "See all participant registrations",
    href: "/admin/registrations",
    icon: Users,
  },
  {
    label: "Manage Events",
    description: "Edit event details and settings",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    label: "Analytics",
    description: "View detailed reports",
    href: "/admin",
    icon: BarChart3,
  },
];

export default function AdminDashboardPage() {
  const { status } = useSession();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      setStatsError(null);
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to load dashboard stats");
      }
      setData(payload);
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : "Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") return;

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, [status]);

  const stats = useMemo(
    () => [
      {
        label: "Total Registrations",
        value: loadingStats ? "—" : String(data?.totalRegistrations ?? 0),
        change: loadingStats ? "..." : `${data?.analytics.impressionsToday ?? 0} impressions today`,
        icon: Users,
        color: "from-red-500 to-rose-600",
        shadowColor: "shadow-red-500/15",
      },
      {
        label: "Active Events",
        value: loadingStats ? "—" : String(data?.activeEvents ?? 0),
        change: "Live from events database",
        icon: CalendarDays,
        color: "from-orange-500 to-amber-600",
        shadowColor: "shadow-orange-500/15",
      },
      {
        label: "Website Impressions",
        value: loadingStats ? "—" : String(data?.analytics.totalImpressions ?? 0),
        change: loadingStats ? "..." : `${data?.analytics.impressionsToday ?? 0} today`,
        icon: Eye,
        color: "from-sky-500 to-cyan-600",
        shadowColor: "shadow-sky-500/15",
      },
      {
        label: "Unique Visitors",
        value: loadingStats ? "—" : String(data?.analytics.uniqueVisitors ?? 0),
        change: loadingStats ? "..." : `${data?.analytics.uniqueVisitorsToday ?? 0} today`,
        icon: Users2,
        color: "from-emerald-500 to-teal-600",
        shadowColor: "shadow-emerald-500/15",
      },
    ],
    [data, loadingStats]
  );

  const maxViews = Math.max(...(data?.analytics.impressionsLast7Days.map((item) => item.views) ?? [1]));

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <p className="text-sm text-black/40 dark:text-white/30">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-black/50 dark:text-white/30 mt-1">
              Overview of your admin panel
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative rounded-2xl border border-black/5 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02] p-5 transition-all duration-300 hover:border-black/10 hover:bg-white dark:hover:border-white/[0.1] dark:hover:bg-white/[0.03]"
              >
                {/* Glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-[0.03] transition-opacity duration-300`} />
                
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-black/50 dark:text-white/40 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-black dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Activity className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 truncate max-w-[180px]">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadowColor}`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {statsError && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {statsError}
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="group relative rounded-2xl border border-black/5 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02] p-5 transition-all duration-300 hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-500/20 dark:hover:bg-white/[0.03] cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black/5 dark:bg-white/[0.04] group-hover:bg-red-100 dark:group-hover:bg-red-500/10 transition-colors duration-200">
                      <action.icon className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                    </div>
                    <h3 className="text-sm font-semibold text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {action.label}
                    </h3>
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/30 group-hover:text-black/60 dark:group-hover:text-white/40 transition-colors">
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Recent activity placeholder */}
          <div>
            <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">
              Analytics Snapshot
            </h2>
            <div className="rounded-2xl border border-black/5 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02] p-8">
              {!data ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/[0.04] flex items-center justify-center mb-4">
                    <BarChart3 className="w-5 h-5 text-black/20 dark:text-white/20" />
                  </div>
                  <p className="text-sm text-black/40 dark:text-white/40 font-medium">
                    Loading analytics...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/50">
                      Top Pages by Impressions
                    </h3>
                    <div className="space-y-2">
                      {data.analytics.topPages.length === 0 ? (
                        <p className="text-sm text-black/40 dark:text-white/40">No impressions recorded yet.</p>
                      ) : (
                        data.analytics.topPages.map((page) => (
                          <div
                            key={page.path}
                            className="flex items-center justify-between rounded-lg border border-black/5 bg-white/70 px-3 py-2 text-sm dark:border-white/[0.06] dark:bg-white/[0.02]"
                          >
                            <span className="truncate text-black/70 dark:text-white/70">{page.path}</span>
                            <span className="ml-3 font-semibold text-black/80 dark:text-white/80">{page.views}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/50">
                      Last 7 Days Impressions
                    </h3>
                    <div className="space-y-2">
                      {data.analytics.impressionsLast7Days.map((item) => {
                        const widthPercent = maxViews > 0 ? Math.max(6, Math.round((item.views / maxViews) * 100)) : 6;
                        const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <div key={item.date}>
                            <div className="mb-1 flex items-center justify-between text-xs text-black/60 dark:text-white/50">
                              <span>{dateLabel}</span>
                              <span>{item.views}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
