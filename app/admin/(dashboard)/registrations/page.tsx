"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Download,
  Eye,
  X,
  Loader2,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type Track = "2026" | "2027";

const CHIP_FIELDS = new Set([
  "languages",
  "domainOrder",
  "goals",
  "targetOrgs",
  "interestArea",
]);

export default function CusocRegistrationsPage() {
  const [track, setTrack] = useState<Track>("2026");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [exportError, setExportError] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [counts, setCounts] = useState({ count2026: 0, count2027: 0 });

  async function loadCounts() {
    try {
      const response = await fetch("/api/cusoc/registrations", { cache: "no-store" });
      const payload = await response.json();
      setCounts(payload);
    } catch {
      // Ignore transient count fetch errors.
    }
  }

  async function loadTrackData(nextTrack: Track) {
    setLoading(true);
    try {
      const response = await fetch(`/api/cusoc/registrations?track=${nextTrack}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      setData(Array.isArray(payload) ? payload : []);
    } finally {
      setLoading(false);
    }
  }

  // Fetch counts on mount
  useEffect(() => {
    loadCounts();
  }, []);

  // Fetch data on track change
  useEffect(() => {
    loadTrackData(track);
  }, [track]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      `Warning: This will permanently delete this CUSoC ${track} registration from the database.\n\nDo you want to continue?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/cusoc/registrations?track=${track}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete registration");
      }

      if (selected?.id === id) {
        setSelected(null);
      }

      await Promise.all([loadTrackData(track), loadCounts()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete registration");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = data.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(q) ||
      r.cuEmail?.toLowerCase().includes(q) ||
      r.rollNumber?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q)
    );
  });

  const downloadExcel = () => {
    if (!data.length) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `CUSoC_${track}`);
    XLSX.writeFile(wb, `CUSoC_${track}_Registrations.xlsx`);
  };

  const syncToGoogleSheet = async () => {
    if (!data.length) return;

    setExporting(true);
    setExportStatus("");
    setExportError(false);

    try {
      const res = await fetch(`/api/cusoc/registrations?track=${track}`, {
        method: "POST",
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.error || "Google Sheet sync failed";
        throw new Error(msg);
      }

      setExportStatus(`Synced ${payload?.rowCount ?? data.length} rows to Google Sheet.`);
    } catch (err) {
      setExportError(true);
      setExportStatus(
        err instanceof Error
          ? err.message
          : "Could not sync to Google Sheet."
      );
    }

    setExporting(false);
  };

  // Column configs per track
  const cols2026 = [
    { key: "fullName", label: "Name" },
    { key: "rollNumber", label: "Roll No" },
    { key: "cuEmail", label: "Email" },
    { key: "department", label: "Dept" },
    { key: "year", label: "Year" },
    { key: "domainOrder", label: "Domain" },
    { key: "dsaLevel", label: "DSA" },
  ];
  const cols2027 = [
    { key: "fullName", label: "Name" },
    { key: "rollNumber", label: "Roll No" },
    { key: "cuEmail", label: "Email" },
    { key: "department", label: "Dept" },
    { key: "year", label: "Year" },
    { key: "skillLevel", label: "Skill" },
    { key: "interestArea", label: "Interest" },
  ];
  const cols = track === "2026" ? cols2026 : cols2027;

  // Detail view field grouping
  const detailSections2026 = [
    {
      title: "Basic Details",
      fields: [
        ["Full Name", "fullName"],
        ["Roll Number", "rollNumber"],
        ["CU Email", "cuEmail"],
        ["Personal Email", "personalEmail"],
        ["Phone", "phone"],
        ["Department", "department"],
        ["Year", "year"],
        ["Registered At", "createdAt"],
      ],
    },
    {
      title: "Technical Background",
      fields: [
        ["Languages", "languages"],
        ["DSA Level", "dsaLevel"],
        ["Dev Experience", "devExperience"],
      ],
    },
    {
      title: "Domain & Experience",
      fields: [
        ["Domain Order", "domainOrder"],
        ["GitHub", "githubProfile"],
        ["Projects", "projectCount"],
        ["Best Project", "bestProjectLink"],
        ["Open Source", "openSourceContrib"],
        ["OS Link", "openSourceLink"],
      ],
    },
    {
      title: "Target Organization",
      fields: [
        ["Target Orgs", "targetOrgs"],
        ["Explored Repo", "exploredRepo"],
        ["Repo Link", "orgRepoLink"],
      ],
    },
    {
      title: "Goals & Commitment",
      fields: [
        ["Goals", "goals"],
        ["Why CUSoC", "whyCusoc"],
        ["Hours/Week", "hoursPerWeek"],
        ["Weekly Tasks", "readyWeeklyTasks"],
        ["Deadlines", "readyDeadlines"],
      ],
    },
    {
      title: "Mini Proposal",
      fields: [
        ["Proposal File URL", "proposalFileUrl"],
      ],
    },
    {
      title: "Screening",
      fields: [["Why Select You", "screeningAnswer"]],
    },
  ];

  const detailSections2027 = [
    {
      title: "Basic Details",
      fields: [
        ["Full Name", "fullName"],
        ["Roll Number", "rollNumber"],
        ["Email", "cuEmail"],
        ["Phone", "phone"],
        ["Department", "department"],
        ["Year", "year"],
      ],
    },
    {
      title: "Skills & Interest",
      fields: [
        ["Skill Level", "skillLevel"],
        ["Languages", "languages"],
        ["Interest Area", "interestArea"],
      ],
    },
    {
      title: "Goals & Awareness",
      fields: [
        ["Learn Coding", "goalLearnCoding"],
        ["Build Projects", "goalBuildProjects"],
        ["Target GSoC", "goalTargetGsoc"],
        ["Why Join", "whyJoin"],
        ["Knows Open Source", "knowsOpenSource"],
        ["Knows GSoC", "knowsGsoc"],
      ],
    },
    {
      title: "Availability & Motivation",
      fields: [
        ["Hours/Week", "hoursPerWeek"],
        ["Motivation", "motivation"],
      ],
    },
  ];

  const detailSections =
    track === "2026" ? detailSections2026 : detailSections2027;

  const formatVal = (v: any) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  };

  const splitToChips = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">
            CUSoC Registrations
          </h1>
          <p className="text-sm text-black/50 dark:text-white/30 mt-1">
            View and export all CUSoC registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncToGoogleSheet}
            disabled={!data.length || exporting}
            className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
          >
            <RefreshCw className={`w-4 h-4 ${exporting ? "animate-spin" : ""}`} />
            {exporting ? "Syncing..." : "Sync Google Sheet"}
          </button>

          <button
            onClick={downloadExcel}
            disabled={!data.length}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {exportStatus && (
        <p
          className={`mb-4 text-sm ${
            exportError
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {exportStatus}
        </p>
      )}

      {/* Track Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTrack("2026")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            track === "2026"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 border dark:border-emerald-400/30"
              : "bg-black/5 text-black/50 border border-black/5 hover:text-black/80 hover:bg-black/10 dark:bg-white/[0.03] dark:text-white/40 dark:border-white/[0.06] dark:hover:text-white/60 dark:hover:bg-white/[0.05]"
          }`}
        >
          <span className="text-base">🟢</span>
          CUSoC 2026
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              track === "2026"
                ? "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-black/10 text-black/50 dark:bg-white/[0.06] dark:text-white/30"
            }`}
          >
            {counts.count2026}
          </span>
        </button>
        <button
          onClick={() => setTrack("2027")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            track === "2027"
              ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 border dark:border-amber-400/30"
              : "bg-black/5 text-black/50 border border-black/5 hover:text-black/80 hover:bg-black/10 dark:bg-white/[0.03] dark:text-white/40 dark:border-white/[0.06] dark:hover:text-white/60 dark:hover:bg-white/[0.05]"
          }`}
        >
          <span className="text-base">🟡</span>
          CUSoC 2027-28
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              track === "2027"
                ? "bg-amber-100/50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                : "bg-black/10 text-black/50 dark:bg-white/[0.06] dark:text-white/30"
            }`}
          >
            {counts.count2027}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/20" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, roll number, or department..."
          className="w-full rounded-xl border border-black/10 bg-white/60 pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-black/40 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/20 dark:focus:border-red-500/40 dark:focus:ring-red-500/10"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-black/30 dark:text-white/30 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-8 h-8 text-black/20 dark:text-white/15 mb-3" />
            <p className="text-sm text-black/50 dark:text-white/30">
              {data.length === 0
                ? "No registrations yet"
                : "No results match your search"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-black/5 dark:bg-transparent dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/30">
                    #
                  </th>
                  {cols.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/30"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/30">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-black/5 hover:bg-black/5 dark:border-white/[0.04] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-black/40 dark:text-white/30">{i + 1}</td>
                    {cols.map((c) => (
                      <td
                        key={c.key}
                        className="px-4 py-3 text-black/70 dark:text-white/70 max-w-[200px] truncate"
                      >
                        {formatVal(row[c.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-black/50 border border-black/10 hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/5 dark:border-white/[0.06] dark:hover:border-red-500/20 transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10 transition-all"
                        >
                          {deletingId === row.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-black/40 dark:text-white/20">
        Showing {filtered.length} of {data.length} registrations
      </p>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-black/10 bg-white dark:border-white/[0.08] dark:bg-[#0a0a0a] shadow-2xl p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-black/40 hover:text-black/70 hover:bg-black/5 dark:text-white/30 dark:hover:text-white/70 dark:hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-black dark:text-white mb-1">
              {selected.fullName}
            </h2>
            <p className="text-xs text-black/50 dark:text-white/30 mb-6">
              {selected.cuEmail} · Registered{" "}
              {new Date(selected.createdAt).toLocaleDateString()}
            </p>

            <div className="space-y-5">
              {detailSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-black/50 border-black/10 dark:text-white/40 mb-3 border-b dark:border-white/[0.06] pb-2">
                    {section.title}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.fields.map(([label, key]) => {
                      const val = selected[key as string];
                      if (val === null || val === undefined || val === "")
                        return null;

                      const isChipField = CHIP_FIELDS.has(key as string) && typeof val === "string";
                      const chips = isChipField ? splitToChips(val) : [];

                      return (
                        <div key={key as string}>
                          <p className="text-[10px] uppercase tracking-wider text-black/40 dark:text-white/25 mb-0.5">
                            {label}
                          </p>
                          {chips.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {chips.map((chip) => (
                                <span
                                  key={chip}
                                  className="rounded-md border border-black/10 bg-black/[0.04] px-2 py-0.5 text-xs text-black/80 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/80"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-black/80 dark:text-white/80 break-words">
                              {typeof val === "boolean"
                                ? val
                                  ? "Yes"
                                  : "No"
                                : String(val)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
