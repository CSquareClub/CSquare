"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";

type Sponsor = {
  id?: number;
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
};

type EventItem = {
  id: number;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  attendees: number | null;
  category: string | null;
  image: string | null;
  sponsors?: Sponsor[];
  sponsorTitle: string | null;
  sponsorLogoUrl: string | null;
  sponsorLogoLightUrl: string | null;
  sponsorLogoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
  isPublished: boolean;
  registrationUrl: string | null;
  isRegistrationOpen?: boolean;
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
  sponsors: Sponsor[];
  sponsorTitle: string;
  sponsorLogoLightUrl: string;
  sponsorLogoDarkUrl: string;
  devfolioApplyLogoLightUrl: string;
  devfolioApplyLogoDarkUrl: string;
  isPublished: boolean;
  registrationUrl: string;
};

const defaultForm: EventFormState = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  attendees: "",
  category: "",
  image: "",
  sponsors: [],
  sponsorTitle: "",
  sponsorLogoLightUrl: "",
  sponsorLogoDarkUrl: "",
  devfolioApplyLogoLightUrl: "",
  devfolioApplyLogoDarkUrl: "",
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

  function handleLogoFileChange(file: File | null, mode: "light" | "dark", variant: "sponsor" | "apply") {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (typeof result === "string") {
        if (variant === "sponsor") {
          if (mode === "light") {
            setForm((prev) => ({ ...prev, sponsorLogoLightUrl: result }));
          } else {
            setForm((prev) => ({ ...prev, sponsorLogoDarkUrl: result }));
          }
        } else {
          if (mode === "light") {
            setForm((prev) => ({ ...prev, devfolioApplyLogoLightUrl: result }));
          } else {
            setForm((prev) => ({ ...prev, devfolioApplyLogoDarkUrl: result }));
          }
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

    const isDevfolioSponsor = form.sponsorTitle.trim().toLowerCase() === "devfolio";
    if (isDevfolioSponsor) {
      if (!form.sponsorLogoLightUrl.trim() || !form.sponsorLogoDarkUrl.trim()) {
        setError("For Devfolio sponsor, both light and dark Devfolio logos are required.");
        setSubmitting(false);
        return;
      }

      if (!form.devfolioApplyLogoLightUrl.trim() || !form.devfolioApplyLogoDarkUrl.trim()) {
        setError("For Devfolio sponsor, both light and dark Apply with Devfolio logos are required.");
        setSubmitting(false);
        return;
      }

      if (!form.registrationUrl.trim()) {
        setError("For Devfolio sponsor, registration URL is required.");
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      location: form.location.trim() || null,
      attendees: form.attendees ? Number(form.attendees) : null,
      category: form.category.trim() || null,
      image: form.image.trim() || null,
      sponsors: form.sponsors.filter(s => s.title.trim()).map(s => ({
        title: s.title.trim(),
        logoUrl: s.logoUrl?.trim() || null,
        logoLightUrl: s.logoLightUrl?.trim() || null,
        logoDarkUrl: s.logoDarkUrl?.trim() || null,
        devfolioApplyLogoLightUrl: s.devfolioApplyLogoLightUrl?.trim() || null,
        devfolioApplyLogoDarkUrl: s.devfolioApplyLogoDarkUrl?.trim() || null,
      })),
      sponsorTitle: form.sponsorTitle || null,
      sponsorLogoLightUrl: form.sponsorLogoLightUrl || null,
      sponsorLogoDarkUrl: form.sponsorLogoDarkUrl || null,
      devfolioApplyLogoLightUrl: form.devfolioApplyLogoLightUrl || null,
      devfolioApplyLogoDarkUrl: form.devfolioApplyLogoDarkUrl || null,
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
      title: event.title || "",
      description: event.description || "",
      startDate: event.startDate || event.date ? toInputDateValue(event.startDate || event.date || "") : "",
      endDate: event.endDate || event.date ? toInputDateValue(event.endDate || event.date || "") : "",
      location: event.location || "",
      attendees: typeof event.attendees === "number" ? String(event.attendees) : "",
      category: event.category || "",
      image: event.image || "",
      sponsors: event.sponsors || [],
      sponsorTitle: event.sponsorTitle || "",
      sponsorLogoLightUrl: event.sponsorLogoLightUrl || event.sponsorLogoUrl || "",
      sponsorLogoDarkUrl: event.sponsorLogoDarkUrl || event.sponsorLogoUrl || "",
      devfolioApplyLogoLightUrl: event.devfolioApplyLogoLightUrl || "",
      devfolioApplyLogoDarkUrl: event.devfolioApplyLogoDarkUrl || "",
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
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Capacity"
          value={form.attendees}
          onChange={(e) => setForm((prev) => ({ ...prev, attendees: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          placeholder="Sponsor title (optional)"
          value={form.sponsorTitle}
          onChange={(e) => setForm((prev) => ({ ...prev, sponsorTitle: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        {form.sponsorTitle.trim().toLowerCase() === "devfolio" ? (
          <p className="text-xs text-foreground/70 md:col-span-2">
            Devfolio sponsor requires: Devfolio logo (light and dark), Apply with Devfolio logo (light and dark), and a registration URL.
          </p>
        ) : null}
        <input
          placeholder={form.sponsorTitle.trim().toLowerCase() === "devfolio" ? "Devfolio logo URL (light theme)" : "Sponsor logo URL (light theme)"}
          value={form.sponsorLogoLightUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, sponsorLogoLightUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "light", "sponsor")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          placeholder={form.sponsorTitle.trim().toLowerCase() === "devfolio" ? "Devfolio logo URL (dark theme)" : "Sponsor logo URL (dark theme)"}
          value={form.sponsorLogoDarkUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, sponsorLogoDarkUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "dark", "sponsor")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />
        {form.sponsorTitle.trim().toLowerCase() === "devfolio" ? (
          <>
            <input
              placeholder="Apply with Devfolio logo URL (light theme)"
              value={form.devfolioApplyLogoLightUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, devfolioApplyLogoLightUrl: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "light", "apply")}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <input
              placeholder="Apply with Devfolio logo URL (dark theme)"
              value={form.devfolioApplyLogoDarkUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, devfolioApplyLogoDarkUrl: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "dark", "apply")}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
          </>
        ) : null}
        <input
          placeholder="Registration URL (optional)"
          value={form.registrationUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, registrationUrl: e.target.value }))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
        />

        {/* Multiple Sponsors Management */}
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold">Additional Sponsors</label>
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  sponsors: [
                    ...prev.sponsors,
                    {
                      title: "",
                      logoUrl: null,
                      logoLightUrl: null,
                      logoDarkUrl: null,
                      devfolioApplyLogoLightUrl: null,
                      devfolioApplyLogoDarkUrl: null,
                    },
                  ],
                }));
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-background/80"
            >
              <Plus size={14} />
              Add Sponsor
            </button>
          </div>
          
          {form.sponsors.length > 0 ? (
            <div className="space-y-3 rounded-md border border-border bg-background/30 p-3">
              {form.sponsors.map((sponsor, idx) => (
                <div key={idx} className="space-y-2 rounded border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      placeholder="Sponsor name"
                      value={sponsor.title}
                      onChange={(e) => {
                        const updated = [...form.sponsors];
                        updated[idx].title = e.target.value;
                        setForm((prev) => ({ ...prev, sponsors: updated }));
                      }}
                      className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          sponsors: prev.sponsors.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="rounded border border-red-200 bg-red-50 p-1 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <input
                    placeholder="Logo Light URL"
                    value={sponsor.logoLightUrl || ""}
                    onChange={(e) => {
                      const updated = [...form.sponsors];
                      updated[idx].logoLightUrl = e.target.value || null;
                      setForm((prev) => ({ ...prev, sponsors: updated }));
                    }}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs"
                  />
                  
                  <input
                    placeholder="Logo Dark URL"
                    value={sponsor.logoDarkUrl || ""}
                    onChange={(e) => {
                      const updated = [...form.sponsors];
                      updated[idx].logoDarkUrl = e.target.value || null;
                      setForm((prev) => ({ ...prev, sponsors: updated }));
                    }}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground/50">No sponsors added yet</p>
          )}
        </div>

        <textarea
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
                  <p className="font-semibold">{event.title || "Untitled Event"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.startDate || event.date ? new Date(event.startDate || event.date || "").toLocaleString() : "No start date"}
                    {event.endDate ? ` - ${new Date(event.endDate).toLocaleString()}` : ""}
                    {event.location ? ` • ${event.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.category || "Uncategorized"}
                    {typeof event.attendees === "number" ? ` • Capacity: ${event.attendees}` : ""}
                    {` • ${event.isPublished ? "Published" : "Draft"}`}
                  </p>
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
