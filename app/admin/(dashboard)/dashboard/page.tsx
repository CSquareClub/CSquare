"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Download,
  Eye,
  Handshake,
  Megaphone,
  Pause,
  Play,
  RefreshCw,
  Store,
  Trash2,
  Users,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

type AlgolympiaRegistration = {
  id: number;
  createdAt: string;
  isCU: boolean;
  isProfessional: boolean;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderUID: string;
  leaderPhone: string;
  leaderCollege: string;
  leaderLeetcode: string;
  leaderCodeforces: string;
  leaderCodechef: string;
  leaderGithub: string;
  leaderSemester?: string;
  member2Name: string;
  member2Email: string;
  member2UID: string;
  member2Phone: string;
  member2Leetcode: string;
  member2Codeforces: string;
  member2Codechef: string;
  member2Github: string;
  member3Name: string;
  member3Email: string;
  member3UID: string;
  member3Phone: string;
  member3Leetcode: string;
  member3Codeforces: string;
  member3Codechef: string;
  member3Github: string;
  facultyMentorName?: string;
  facultyMentorEid?: string;
  referralCode?: string;
  paymentStatus: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
};

type StallRegistration = {
  id: number;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  stallCategory: string;
  isPremium: boolean;
  isCuStudent: boolean;
  uid: string;
  idCardUrl: string;
  numberOfDays: number;
  selectedDate: string;
  stallName: string;
  stallDescription: string;
  members: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
};

type Ambassador = {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  referralCode: string;
  source: "direct" | "team_leader";
  registrationId: number | null;
  referralCount: number;
};

type CommunityPartner = {
  id: number;
  createdAt: string;
  spocName: string;
  email: string;
  phone: string;
  communityName: string;
  description: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  expectations: string[];
  deliverables: string[];
};

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
  algolympia: {
    registrations: AlgolympiaRegistration[];
    stalls: StallRegistration[];
    ambassadors: Ambassador[];
    communityPartners: CommunityPartner[];
  };
};

type DashboardEntity = "registration" | "stall" | "ambassador" | "community";

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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function downloadExcel(sheetName: string, fileName: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

function getRegistrationTypeLabel(row: AlgolympiaRegistration) {
  if (row.isCU) return "CU";
  if (row.isProfessional) return "Professional";
  return "Outside";
}

function mapRegistrationsForExport(rows: AlgolympiaRegistration[]) {
  return rows.map((row) => ({
    "Submitted At": formatDateTime(row.createdAt),
    "Registration Type": getRegistrationTypeLabel(row),
    "Team Name": row.teamName,
    "Leader Name": row.leaderName,
    "Leader Email": row.leaderEmail,
    "Leader UID": row.leaderUID,
    "Leader Phone": row.leaderPhone,
    "Leader College": row.leaderCollege,
    "Leader Semester": row.leaderSemester || "",
    "Leader LeetCode": row.leaderLeetcode,
    "Leader Codeforces": row.leaderCodeforces,
    "Leader CodeChef": row.leaderCodechef,
    "Leader GitHub": row.leaderGithub,
    "Member 2 Name": row.member2Name,
    "Member 2 Email": row.member2Email,
    "Member 2 UID": row.member2UID,
    "Member 2 Phone": row.member2Phone,
    "Member 2 LeetCode": row.member2Leetcode,
    "Member 2 Codeforces": row.member2Codeforces,
    "Member 2 CodeChef": row.member2Codechef,
    "Member 2 GitHub": row.member2Github,
    "Member 3 Name": row.member3Name,
    "Member 3 Email": row.member3Email,
    "Member 3 UID": row.member3UID,
    "Member 3 Phone": row.member3Phone,
    "Member 3 LeetCode": row.member3Leetcode,
    "Member 3 Codeforces": row.member3Codeforces,
    "Member 3 CodeChef": row.member3Codechef,
    "Member 3 GitHub": row.member3Github,
    "Faculty Mentor Name": row.facultyMentorName || "",
    "Faculty Mentor EID": row.facultyMentorEid || "",
    "Referral Code": row.referralCode || "",
    "Payment Status": row.paymentStatus,
    "Transaction ID": row.transactionId || "",
    "Payment Screenshot URL": row.paymentScreenshotUrl || "",
  }));
}

function mapStallsForExport(rows: StallRegistration[]) {
  return rows.map((row) => ({
    "Submitted At": formatDateTime(row.createdAt),
    "Organizer Name": row.fullName,
    Email: row.email,
    Phone: row.phone,
    College: row.college,
    "Stall Name": row.stallName,
    Category: row.stallCategory,
    "CU Student": row.isCuStudent ? "Yes" : "No",
    UID: row.uid || "",
    "ID Card URL": row.idCardUrl || "",
    Premium: row.isPremium ? "Yes" : "No",
    "Number of Days": row.numberOfDays,
    "Selected Date": row.selectedDate || "",
    Description: row.stallDescription,
    "Additional Members": row.members
      .map((member) => `${member.name} | ${member.email} | ${member.phone}`)
      .join(" || "),
  }));
}

function mapAmbassadorsForExport(rows: Ambassador[]) {
  return rows.map((row) => ({
    "Submitted At": formatDateTime(row.createdAt),
    Name: row.name,
    Email: row.email,
    Phone: row.phone,
    College: row.college,
    Department: row.department,
    Year: row.year,
    "Referral Code": row.referralCode,
    Source: row.source,
    "Registration ID": row.registrationId ?? "",
    "Referral Count": row.referralCount,
  }));
}

function mapCommunityForExport(rows: CommunityPartner[]) {
  return rows.map((row) => ({
    "Submitted At": formatDateTime(row.createdAt),
    "Community Name": row.communityName,
    "SPOC Name": row.spocName,
    Email: row.email,
    Phone: row.phone,
    Description: row.description,
    "Instagram URL": row.instagramUrl || "",
    "LinkedIn URL": row.linkedinUrl || "",
    Expectations: row.expectations.join(", "),
    Deliverables: row.deliverables.join(", "),
    "Light Logo URL": row.logoLightUrl,
    "Dark Logo URL": row.logoDarkUrl,
  }));
}

type SectionCardProps = {
  title: string;
  description: string;
  count: number;
  badgeLabel: string;
  icon: typeof Users;
  loading: boolean;
  previewHeaders: string[];
  previewRows: Array<{ id: number; cells: string[] }>;
  onExport: () => void;
  exportDisabled: boolean;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
};

function SectionCard({
  title,
  description,
  count,
  badgeLabel,
  icon: Icon,
  loading,
  previewHeaders,
  previewRows,
  onExport,
  exportDisabled,
  onDelete,
  deletingId,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/28 p-5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 dark:bg-white/[0.04]">
            <Icon className="h-5 w-5 text-black/55 dark:text-white/60" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-black/85 dark:text-white/85">{title}</h2>
              <span className="rounded-full border border-white/10 bg-white/35 px-2.5 py-1 text-xs font-medium text-black/55 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white/45">
                {count} {badgeLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-black/50 dark:text-white/35">{description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/15 text-sm text-black/40 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/35">
          Loading section...
        </div>
      ) : previewRows.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/15 text-sm text-black/40 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/35">
          No records available yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 dark:border-white/[0.06]">
          <div className="max-h-[320px] overflow-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm dark:divide-white/[0.06]">
              <thead className="sticky top-0 z-10 bg-black/[0.08] backdrop-blur-md dark:bg-[#0b0b0b]/95">
                <tr>
                  {previewHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/45"
                    >
                      {header}
                    </th>
                  ))}
                  {onDelete ? (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/45">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/[0.06]">
                {previewRows.map((row, rowIndex) => (
                  <tr key={`${title}-${row.id}-${rowIndex}`} className="bg-white/10 dark:bg-white/[0.01]">
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`${title}-${rowIndex}-${cellIndex}`}
                        className="max-w-[220px] truncate px-4 py-3 text-black/70 dark:text-white/70"
                        title={cell}
                      >
                        {cell}
                      </td>
                    ))}
                    {onDelete ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === row.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const { status } = useSession();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      setRefreshing(true);
      setStatsError(null);
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to load dashboard stats");
      }
      setData(payload);
      setLastUpdated(new Date());
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : "Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }

  async function handleDelete(entity: DashboardEntity, id: number, label: string) {
    const confirmed = window.confirm(`Delete this ${label} entry permanently?`);
    if (!confirmed) return;

    const key = `${entity}:${id}`;
    setDeletingKey(key);
    setActionStatus(null);
    setActionError(false);
    setStatsError(null);

    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || `Failed to delete ${label} entry`);
      }

      setActionStatus(`${label} entry deleted successfully.`);
      await loadDashboardData();
    } catch (error) {
      setActionError(true);
      setActionStatus(error instanceof Error ? error.message : `Failed to delete ${label} entry`);
    } finally {
      setDeletingKey(null);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") return;

    loadDashboardData();
    if (!autoRefresh) return;

    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, [status, autoRefresh]);

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

  const algolympia = useMemo(() => {
    return {
      registrations: sortByCreatedAtDesc(data?.algolympia.registrations ?? []),
      stalls: sortByCreatedAtDesc(data?.algolympia.stalls ?? []),
      ambassadors: sortByCreatedAtDesc(data?.algolympia.ambassadors ?? []),
      communityPartners: sortByCreatedAtDesc(data?.algolympia.communityPartners ?? []),
    };
  }, [data]);

  const maxViews = Math.max(...(data?.analytics.impressionsLast7Days.map((item) => item.views) ?? [1]));
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "Not updated yet";

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
          <p className="text-sm text-black/40 dark:text-white/30">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-black/50 dark:text-white/30">
                  Overview of your admin panel
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/28 px-3 py-1.5 text-xs font-medium text-black/55 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/40">
                  Last updated: {loadingStats ? "…" : lastUpdatedLabel}
                </div>
                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/30 px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:border-red-200 hover:bg-red-50/70 hover:text-red-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/60 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh now
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRefresh((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/30 px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:border-red-200 hover:bg-red-50/70 hover:text-red-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/60 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  {autoRefresh ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {autoRefresh ? "Pause auto-refresh" : "Resume auto-refresh"}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative rounded-2xl border border-white/10 bg-white/28 p-5 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-black/10 hover:bg-white/40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.05]"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5 dark:group-hover:opacity-[0.03]`}
                />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/40">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-black dark:text-white">{stat.value}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="max-w-[180px] truncate text-xs font-medium text-emerald-500 dark:text-emerald-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadowColor}`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
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

          {actionStatus && (
            <div
              className={`mb-8 rounded-xl border p-3 text-sm ${
                actionError
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {actionStatus}
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-black/80 dark:text-white/80">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/28 p-5 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-red-200 hover:bg-red-50/40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-red-500/20 dark:hover:bg-white/[0.05]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 transition-colors duration-200 group-hover:bg-red-100 dark:bg-white/[0.04] dark:group-hover:bg-red-500/10">
                      <action.icon className="h-4 w-4 text-black/40 transition-colors duration-200 group-hover:text-red-600 dark:text-white/40 dark:group-hover:text-red-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-black/70 transition-colors group-hover:text-black dark:text-white/70 dark:group-hover:text-white">
                      {action.label}
                    </h3>
                  </div>
                  <p className="text-xs text-black/40 transition-colors group-hover:text-black/60 dark:text-white/30 dark:group-hover:text-white/40">
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-black/80 dark:text-white/80">
                  AlgOlympia Sections
                </h2>
                <p className="mt-1 text-sm text-black/45 dark:text-white/30">
                  Recent entries with individual Excel export for registrations, stalls, ambassadors, and community partners.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <SectionCard
                title="Registrations"
                description="Team registrations with leader, payment, and referral details."
                count={algolympia.registrations.length}
                badgeLabel="entries"
                icon={Users}
                loading={loadingStats}
                previewHeaders={["Team", "Leader", "Type", "Payment", "Submitted"]}
                previewRows={algolympia.registrations.map((row) => ({
                  id: row.id,
                  cells: [
                    row.teamName,
                    row.leaderName,
                    getRegistrationTypeLabel(row),
                    row.paymentStatus,
                    formatDateTime(row.createdAt),
                  ],
                }))}
                onExport={() =>
                  downloadExcel(
                    "Registrations",
                    "Algolympia_Registrations.xlsx",
                    mapRegistrationsForExport(algolympia.registrations)
                  )
                }
                exportDisabled={algolympia.registrations.length === 0}
                onDelete={(id) => handleDelete("registration", id, "registration")}
                deletingId={
                  deletingKey?.startsWith("registration:")
                    ? Number(deletingKey.split(":")[1])
                    : null
                }
              />

              <SectionCard
                title="Stalls"
                description="Stall applications with category, CU verification, and organizer details."
                count={algolympia.stalls.length}
                badgeLabel="entries"
                icon={Store}
                loading={loadingStats}
                previewHeaders={["Stall", "Organizer", "Category", "Pricing Type", "Submitted"]}
                previewRows={algolympia.stalls.map((row) => ({
                  id: row.id,
                  cells: [
                    row.stallName,
                    row.fullName,
                    row.stallCategory,
                    row.isCuStudent ? "CU Student" : "Outside",
                    formatDateTime(row.createdAt),
                  ],
                }))}
                onExport={() =>
                  downloadExcel("Stalls", "Algolympia_Stalls.xlsx", mapStallsForExport(algolympia.stalls))
                }
                exportDisabled={algolympia.stalls.length === 0}
                onDelete={(id) => handleDelete("stall", id, "stall")}
                deletingId={
                  deletingKey?.startsWith("stall:")
                    ? Number(deletingKey.split(":")[1])
                    : null
                }
              />

              <SectionCard
                title="Ambassadors"
                description="Campus ambassador applications and their referral performance."
                count={algolympia.ambassadors.length}
                badgeLabel="entries"
                icon={Megaphone}
                loading={loadingStats}
                previewHeaders={["Name", "College", "Referral Code", "Referrals", "Submitted"]}
                previewRows={algolympia.ambassadors.map((row) => ({
                  id: row.id,
                  cells: [
                    row.name,
                    row.college,
                    row.referralCode,
                    String(row.referralCount),
                    formatDateTime(row.createdAt),
                  ],
                }))}
                onExport={() =>
                  downloadExcel(
                    "Ambassadors",
                    "Algolympia_Ambassadors.xlsx",
                    mapAmbassadorsForExport(algolympia.ambassadors)
                  )
                }
                exportDisabled={algolympia.ambassadors.length === 0}
                onDelete={(id) => handleDelete("ambassador", id, "ambassador")}
                deletingId={
                  deletingKey?.startsWith("ambassador:")
                    ? Number(deletingKey.split(":")[1])
                    : null
                }
              />

              <SectionCard
                title="Community Partners"
                description="Community partner submissions with SPOC, deliverables, and branding assets."
                count={algolympia.communityPartners.length}
                badgeLabel="entries"
                icon={Handshake}
                loading={loadingStats}
                previewHeaders={["Community", "SPOC", "Expectations", "Deliverables", "Submitted"]}
                previewRows={algolympia.communityPartners.map((row) => ({
                  id: row.id,
                  cells: [
                    row.communityName,
                    row.spocName,
                    `${row.expectations.length} item(s)`,
                    `${row.deliverables.length} item(s)`,
                    formatDateTime(row.createdAt),
                  ],
                }))}
                onExport={() =>
                  downloadExcel(
                    "Community Partners",
                    "Algolympia_Community_Partners.xlsx",
                    mapCommunityForExport(algolympia.communityPartners)
                  )
                }
                exportDisabled={algolympia.communityPartners.length === 0}
                onDelete={(id) => handleDelete("community", id, "community partner")}
                deletingId={
                  deletingKey?.startsWith("community:")
                    ? Number(deletingKey.split(":")[1])
                    : null
                }
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-black/80 dark:text-white/80">
              Live Analytics Snapshot
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/28 p-8 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-white/[0.03]">
              {!data ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/[0.04]">
                    <BarChart3 className="h-5 w-5 text-black/20 dark:text-white/20" />
                  </div>
                  <p className="text-sm font-medium text-black/40 dark:text-white/40">
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
                        <p className="text-sm text-black/40 dark:text-white/40">
                          No impressions recorded yet.
                        </p>
                      ) : (
                        data.analytics.topPages.map((page) => (
                          <a
                            key={page.path}
                            href={page.path}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/35 px-3 py-2 text-sm backdrop-blur-md transition hover:border-red-200 hover:bg-red-50/60 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-red-500/20 dark:hover:bg-red-500/10"
                          >
                            <span className="truncate text-black/70 transition group-hover:text-red-700 dark:text-white/70 dark:group-hover:text-red-300">
                              {page.path}
                            </span>
                            <span className="ml-3 font-semibold text-black/80 transition group-hover:text-red-700 dark:text-white/80 dark:group-hover:text-red-300">
                              {page.views}
                            </span>
                          </a>
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
                        const widthPercent =
                          maxViews > 0 ? Math.max(6, Math.round((item.views / maxViews) * 100)) : 6;
                        const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <button
                            key={item.date}
                            type="button"
                            onClick={loadDashboardData}
                            className="w-full text-left"
                          >
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
                          </button>
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
