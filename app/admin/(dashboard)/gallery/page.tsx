"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: number;
  title: string;
  eventName: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
};

type FormState = {
  title: string;
  eventName: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
};

type EventOption = {
  id: number;
  title: string;
};

type GalleryItemWithEventId = GalleryItem & {
  eventId: number | null;
};
const defaultForm: FormState = {
  title: "",
  eventName: "",
  imageUrl: "",
  description: "",
  isPublished: true,
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItemWithEventId[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const publishedCount = useMemo(() => items.filter((item) => item.isPublished).length, [items]);
  const draftCount = items.length - publishedCount;

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to fetch gallery items");
      setItems(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gallery items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const payload = await res.json();
      if (res.ok && Array.isArray(payload)) {
        setEvents(payload.map((e: any) => ({ id: e.id, title: e.title || "Untitled Event" })));
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  }
  function handleImageFileChange(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setEditingId(null);
    setSelectedEventId(null);
    setForm(defaultForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setError(null);

    try {
      const endpoint = isEditing ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId: selectedEventId }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to save gallery item");
      }

      setStatus(isEditing ? "Gallery item updated" : "Gallery item created");
      resetForm();
      setSelectedEventId(null);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save gallery item");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: GalleryItemWithEventId) {
    setEditingId(item.id);
    setSelectedEventId(item.eventId || null);
    setForm({
      title: item.title,
      eventName: item.eventName,
      imageUrl: item.imageUrl,
      description: item.description,
      isPublished: item.isPublished,
    });
    setStatus(null);
    setError(null);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this gallery image?");
    if (!confirmed) return;

    try {
      setError(null);
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to delete gallery item");
      setStatus("Gallery item deleted");
      if (editingId === id) resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete gallery item");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage event pictures shown on the website gallery section.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-semibold">{items.length}</p>
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
          placeholder="Image title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={selectedEventId || ""}
          onChange={(e) => {
            const nextId = e.target.value ? Number(e.target.value) : null;
            setSelectedEventId(nextId);
            const selectedEvent = events.find((event) => event.id === nextId);
            if (selectedEvent) {
              setForm((prev) => ({ ...prev, eventName: selectedEvent.title }));
            }
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
                  <option value="">Select Event (Optional)</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
              </select>
        <input
          required
          placeholder="Event name"
          value={form.eventName}
          onChange={(e) => setForm((prev) => ({ ...prev, eventName: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Image URL (Drive or public URL)"
          value={form.imageUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />

        <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          />
          Publish this image
        </label>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Image" : "Add Image"}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {status ? <p className="text-sm text-green-600">{status}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">Gallery Items</h2>
        </div>

        {loading ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">Loading gallery...</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No gallery images yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.eventName} • {item.isPublished ? "Published" : "Draft"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{item.imageUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
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
