"use client";

import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import {
  Users,
  CalendarDays,
  Store,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const stats = [
  {
    label: "Total Registrations",
    value: "—",
    change: "+12%",
    icon: Users,
    color: "from-red-500 to-rose-600",
    shadowColor: "shadow-red-500/15",
  },
  {
    label: "Active Events",
    value: "—",
    change: "+3",
    icon: CalendarDays,
    color: "from-orange-500 to-amber-600",
    shadowColor: "shadow-orange-500/15",
  },
  {
    label: "Stall Bookings",
    value: "—",
    change: "+5",
    icon: Store,
    color: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/15",
  },
  {
    label: "Revenue",
    value: "—",
    change: "+18%",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
    shadowColor: "shadow-emerald-500/15",
  },
];

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
    label: "Stall Registrations",
    description: "View stall bookings and payments",
    href: "/admin/stalls",
    icon: Store,
  },
  {
    label: "Analytics",
    description: "View detailed reports",
    href: "/admin",
    icon: BarChart3,
  },
];

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

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
                      <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400">
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
              Recent Activity
            </h2>
            <div className="rounded-2xl border border-black/5 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02] p-8">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/[0.04] flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-black/20 dark:text-white/20" />
                </div>
                <p className="text-sm text-black/40 dark:text-white/40 font-medium">
                  Activity feed coming soon
                </p>
                <p className="text-xs text-black/30 dark:text-white/20 mt-1">
                  Recent registrations and events will appear here
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
