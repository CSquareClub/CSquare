"use client";

import { useEffect, useMemo, useState } from "react";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  about: string;
  linkedin: string | null;
  image: string | null;
  isPublished: boolean;
  sortOrder: number;
};

type TeamFormState = {
  name: string;
  role: string;
  about: string;
  linkedin: string;
  image: string;
  isPublished: boolean;
  sortOrder: string;
};

const defaultForm: TeamFormState = {
  name: "",
  role: "",
  about: "",
  linkedin: "",
  image: "",
  isPublished: true,
  sortOrder: "0",
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TeamFormState>(defaultForm);

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const publishedCount = useMemo(() => members.filter((member) => member.isPublished).length, [members]);
  const draftCount = members.length - publishedCount;

  async function loadMembers() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/team", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load team members");
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      about: member.about,
      linkedin: member.linkedin || "",
      image: member.image || "",
      isPublished: member.isPublished,
      sortOrder: String(member.sortOrder),
    });
    setStatus(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setStatus(null);
      setError(null);

      const payload = {
        name: form.name,
        role: form.role,
        about: form.about,
        linkedin: form.linkedin || null,
        image: form.image || null,
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder || 0),
      };

      const endpoint = isEditing ? `/api/admin/team/${editingId}` : "/api/admin/team";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save member");

      setStatus(isEditing ? "Team member updated" : "Team member added");
      resetForm();
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save member");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this team member?");
    if (!confirmed) return;

    try {
      setStatus(null);
      setError(null);
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete member");

      setStatus("Team member deleted");
      if (editingId === id) resetForm();
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage team members shown on the public Team page.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-semibold">{members.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Published</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Drafts</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">{draftCount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2 md:p-6">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="LinkedIn URL"
          value={form.linkedin}
          onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <textarea
          required
          placeholder="About"
          value={form.about}
          onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
          className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />

        <input
          placeholder="Image URL (optional)"
          value={form.image}
          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <p className="text-xs text-muted-foreground md:col-span-2">
          Leave image empty to auto-try profile photo from LinkedIn URL.
        </p>

        <input
          type="number"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          />
          Publish this member
        </label>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Member" : "Add Member"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {status && <p className="text-sm text-green-600">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">Team Members</h2>
        </div>

        {loading ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">Loading team members...</p>
        ) : members.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No team members added yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className={member.isPublished ? "text-green-600" : "text-amber-600"}>
                      {member.isPublished ? "Published" : "Draft"}
                    </span>
                    {" • "}
                    Order {member.sortOrder}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(member)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
