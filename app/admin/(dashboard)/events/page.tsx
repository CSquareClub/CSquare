"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  image: string;
  sponsorLogoUrl: string | null;
  sponsorLogoLightUrl: string | null;
  sponsorLogoDarkUrl: string | null;
  isPublished: boolean;
  registrationUrl: string | null;
};

type EventFormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  attendees: string;
  category: string;
  image: string;
  sponsorLogoLightUrl: string;
  sponsorLogoDarkUrl: string;
  isPublished: boolean;
  registrationUrl: string;
};

const defaultForm: EventFormState = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  attendees: "0",
  category: "Workshop",
  image: "",
  sponsorLogoLightUrl: "",
  sponsorLogoDarkUrl: "",
  isPublished: true,
  registrationUrl: "",
};

function toInputDateValue(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(defaultForm);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleSponsorLogoFileChange(file: File | null, mode: "light" | "dark") {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (mode === "light") {
          setForm((prev) => ({ ...prev, sponsorLogoLightUrl: reader.result }));
        } else {
          setForm((prev) => ({ ...prev, sponsorLogoDarkUrl: reader.result }));
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    const payload = {
      title: form.title,
      description: form.description,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      location: form.location,
      attendees: Number(form.attendees || 0),
      category: form.category,
      image: form.image,
      sponsorLogoLightUrl: form.sponsorLogoLightUrl || null,
      sponsorLogoDarkUrl: form.sponsorLogoDarkUrl || null,
      isPublished: form.isPublished,
      registrationUrl: form.registrationUrl || null,
    };

    try {
      const endpoint = isEditing ? `/api/admin/events/${editingId}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      setStatus(isEditing ? "Event updated" : "Event created");
      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(event: EventItem) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      startDate: toInputDateValue(event.startDate || event.date),
      endDate: toInputDateValue(event.endDate || event.date),
      location: event.location,
      attendees: String(event.attendees),
      category: event.category,
      image: event.image,
      sponsorLogoLightUrl: event.sponsorLogoLightUrl || event.sponsorLogoUrl || "",
      sponsorLogoDarkUrl: event.sponsorLogoDarkUrl || event.sponsorLogoUrl || "",
      isPublished: event.isPublished,
      registrationUrl: event.registrationUrl || "",
    });
    setStatus(null);
    setError(null);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    try {
      setError(null);
      setStatus(null);
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      setStatus("Event deleted");
      if (editingId === id) resetForm();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create and manage events shown on the public Events page.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <input
          required
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Attendees"
          value={form.attendees}
          onChange={(e) => setForm((prev) => ({ ...prev, attendees: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          placeholder="Sponsor logo URL (light theme)"
          value={form.sponsorLogoLightUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, sponsorLogoLightUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSponsorLogoFileChange(e.target.files?.[0] || null, "light")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          placeholder="Sponsor logo URL (dark theme)"
          value={form.sponsorLogoDarkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, sponsorLogoDarkUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSponsorLogoFileChange(e.target.files?.[0] || null, "dark")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          placeholder="Registration URL (optional)"
          value={form.registrationUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, registrationUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <textarea
          required
          placeholder="Description"
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
          Publish this event
        </label>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
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
          <h2 className="text-lg font-semibold">All Events</h2>
        </div>
        {loading ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No events created yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(event.startDate || event.date).toLocaleString()} - {new Date(event.endDate || event.date).toLocaleString()} • {event.location}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.category} • {event.attendees} attending • {event.isPublished ? "Published" : "Draft"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(event)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
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
