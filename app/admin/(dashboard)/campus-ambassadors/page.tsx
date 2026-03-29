"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search, Users } from "lucide-react";
import * as XLSX from "xlsx";

type ViewMode = "all" | "ambassadors";

type OutsideRegistration = {
  id: number;
  createdAt: string;
  fullName: string;
  instituteName: string;
  rollNumber: string;
  personalEmail: string;
  collegeEmail: string;
  campusAmbassador: boolean;
};

type Counts = {
  total: number;
  ambassadors: number;
};

export default function CampusAmbassadorsPage() {
  const [view, setView] = useState<ViewMode>("all");
  const [rows, setRows] = useState<OutsideRegistration[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, ambassadors: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  async function loadData(mode: ViewMode) {
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`/api/admin/campus-ambassadors?view=${mode}`, { cache: "no-store" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to fetch records");
      }

      setRows(Array.isArray(payload.data) ? payload.data : []);
      setCounts(payload.counts || { total: 0, ambassadors: 0 });
      setSelectedIds([]);
    } catch (err) {
      setRows([]);
      setStatus(err instanceof Error ? err.message : "Failed to fetch records");
      setError(true);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(view);
  }, [view]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      return (
        row.fullName.toLowerCase().includes(query) ||
        row.instituteName.toLowerCase().includes(query) ||
        row.rollNumber.toLowerCase().includes(query) ||
        row.personalEmail.toLowerCase().includes(query) ||
        row.collegeEmail.toLowerCase().includes(query)
      );
    });
  }, [rows, search]);

  function exportExcel() {
    if (!filteredRows.length) return;

    const sheetRows = filteredRows.map((item) => ({
      "Full Name": item.fullName,
      "Institute Name": item.instituteName,
      "Roll Number": item.rollNumber,
      "Personal Email": item.personalEmail,
      "College Email": item.collegeEmail,
      "Campus Ambassador": item.campusAmbassador ? "Yes" : "No",
      "Submitted At": new Date(item.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, view === "all" ? "Outside Registrations" : "Campus Ambassadors");
    XLSX.writeFile(wb, view === "all" ? "Outside_Registrations.xlsx" : "Campus_Ambassadors.xlsx");
  }

  async function syncGoogleSheet() {
    setSyncing(true);
    setStatus("");
    setError(false);

    try {
      const res = await fetch("/api/admin/campus-ambassadors", { method: "POST" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to sync with Google Sheets");
      }

      setStatus(
        `Synced ${payload.allRows ?? 0} outside registrations and ${payload.ambassadorRows ?? 0} campus ambassadors.`
      );
    } catch (err) {
      setError(true);
      setStatus(err instanceof Error ? err.message : "Failed to sync with Google Sheets");
    } finally {
      setSyncing(false);
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(filteredRows.map((row) => row.id));
      return;
    }
    setSelectedIds([]);
  }

  function toggleSelectOne(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected entries from database?`);
    if (!confirmed) return;

    setDeleting(true);
    setStatus("");
    setError(false);

    try {
      const res = await fetch("/api/admin/campus-ambassadors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to delete selected entries");
      }

      setStatus(`Deleted ${payload.deletedCount ?? selectedIds.length} entries successfully.`);
      setSelectedIds([]);
      await loadData(view);
    } catch (err) {
      setError(true);
      setStatus(err instanceof Error ? err.message : "Failed to delete selected entries");
    } finally {
      setDeleting(false);
    }
  }

  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Campus Ambassador Tracking</h1>
          <p className="mt-1 text-sm text-black/50 dark:text-white/30">
            Track outside registrations and campus ambassador interest.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={syncGoogleSheet}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Google Sheet"}
          </button>

          <button
            type="button"
            onClick={exportExcel}
            disabled={!filteredRows.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>

          <button
            type="button"
            onClick={deleteSelected}
            disabled={!selectedIds.length || deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          >
            {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {status && (
        <p className={`text-sm ${error ? "text-red-500" : "text-emerald-500"}`}>{status}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            view === "all"
              ? "bg-primary/15 text-primary"
              : "bg-card text-foreground/65 hover:text-foreground"
          }`}
        >
          All Outside ({counts.total})
        </button>
        <button
          type="button"
          onClick={() => setView("ambassadors")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            view === "ambassadors"
              ? "bg-primary/15 text-primary"
              : "bg-card text-foreground/65 hover:text-foreground"
          }`}
        >
          Campus Ambassadors ({counts.ambassadors})
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, institute, roll number or email..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <RefreshCw className="h-5 w-5 animate-spin text-foreground/40" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Users className="mb-3 h-7 w-7 text-foreground/30" />
            <p className="text-sm text-foreground/55">No records found for this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/80">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Institute</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Roll No.</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Personal Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">College Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Ambassador</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => toggleSelectOne(item.id, e.target.checked)}
                        aria-label={`Select ${item.fullName}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-foreground/90">{item.fullName}</td>
                    <td className="px-4 py-3 text-foreground/80">{item.instituteName}</td>
                    <td className="px-4 py-3 text-foreground/80">{item.rollNumber}</td>
                    <td className="px-4 py-3 text-foreground/80">{item.personalEmail}</td>
                    <td className="px-4 py-3 text-foreground/80">{item.collegeEmail}</td>
                    <td className="px-4 py-3 text-foreground/80">{item.campusAmbassador ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-foreground/65">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
