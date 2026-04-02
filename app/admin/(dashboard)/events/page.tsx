"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, Filter, Plus, GripVertical, Search, Trash2, X } from "lucide-react";
import { formatEventDateTime } from "@/lib/event-time-utils";
import CommunityPartnersEditor, { type CommunityPartnerDraft } from "@/components/admin/community-partners-editor";

type Sponsor = {
  id?: number;
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

type AccommodationAccess = "open-to-all" | "chandigarh-university-only";

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
  eventFee: number | null;
  accommodationFee: number | null;
  accommodationAccess: AccommodationAccess | null;
  category: string | null;
  image: string | null;
  sponsors?: Sponsor[];
  communityPartners?: CommunityPartnerDraft[];
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
  eventFee: string;
  accommodationFee: string;
  accommodationAccess: AccommodationAccess;
  category: string;
  image: string;
  sponsors: Sponsor[];
  communityPartners: CommunityPartnerDraft[];
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
  eventFee: "",
  accommodationFee: "",
  accommodationAccess: "open-to-all",
  category: "",
  image: "",
  sponsors: [],
  communityPartners: [],
  isPublished: true,
  registrationUrl: "",
};

function isDevfolioSponsor(title: string | null | undefined): boolean {
  return title?.trim().toLowerCase() === "devfolio";
}

function normalizeSponsorsForEdit(event: EventItem): Sponsor[] {
  if (event.sponsors && event.sponsors.length > 0) {
    return event.sponsors;
  }

  const hasLegacySponsor = Boolean(event.sponsorTitle || event.sponsorLogoLightUrl || event.sponsorLogoDarkUrl || event.sponsorLogoUrl);
  if (!hasLegacySponsor) {
    return [];
  }

  return [
    {
      title: event.sponsorTitle || "Sponsor",
      logoUrl: null,
      logoLightUrl: event.sponsorLogoLightUrl || event.sponsorLogoUrl || null,
      logoDarkUrl: event.sponsorLogoDarkUrl || event.sponsorLogoLightUrl || event.sponsorLogoUrl || null,
      devfolioApplyLogoLightUrl: event.devfolioApplyLogoLightUrl || null,
      devfolioApplyLogoDarkUrl: event.devfolioApplyLogoDarkUrl || null,
      instagramUrl: null,
      linkedinUrl: null,
    },
  ];
}

function toInputDateValue(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function reorderSponsors(list: Sponsor[], fromIndex: number, toIndex: number): Sponsor[] {
  if (fromIndex === toIndex) return list;
  const updated = [...list];
  const [moved] = updated.splice(fromIndex, 1);
  if (!moved) return list;
  updated.splice(toIndex, 0, moved);
  return updated;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatMoney(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return value === 0 ? "Nada" : `Rs ${value.toLocaleString("en-IN")}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(defaultForm);
  const [draggedSponsorIndex, setDraggedSponsorIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [feeFilter, setFeeFilter] = useState<"all" | "paid" | "free">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title" | "fee">("recent");
  const isChandigarhUniversityMohaliVenue = /chandigarh university/i.test(form.location) && /mohali/i.test(form.location);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const eventStats = useMemo(() => {
    const total = events.length;
    const published = events.filter((event) => event.isPublished).length;
    const drafts = total - published;
    const paid = events.filter((event) => typeof event.eventFee === "number" && event.eventFee > 0).length;
    const free = events.filter((event) => event.eventFee === 0).length;

    return { total, published, drafts, paid, free };
  }, [events]);

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

  useEffect(() => {
    if (!isChandigarhUniversityMohaliVenue) {
      return;
    }

    setForm((prev) => {
      if (prev.accommodationFee === "500") {
        return prev;
      }
      return { ...prev, accommodationFee: "500" };
    });
  }, [isChandigarhUniversityMohaliVenue]);

  const visibleEvents = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

    let nextEvents = events.filter((event) => {
      const matchesSearch = !normalizedSearch || [
        event.title,
        event.description,
        event.location,
        event.category,
        event.sponsorTitle,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesStatus =
        statusFilter === "all" || (statusFilter === "published" ? event.isPublished : !event.isPublished);

      const matchesFee =
        feeFilter === "all" ||
        (feeFilter === "paid"
          ? typeof event.eventFee === "number" && event.eventFee > 0
          : event.eventFee === 0);

      return matchesSearch && matchesStatus && matchesFee;
    });

    nextEvents = [...nextEvents].sort((a, b) => {
      const aDate = new Date(a.startDate || a.date || 0).getTime();
      const bDate = new Date(b.startDate || b.date || 0).getTime();

      if (sortBy === "oldest") return aDate - bDate;
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "fee") return (a.eventFee ?? Number.POSITIVE_INFINITY) - (b.eventFee ?? Number.POSITIVE_INFINITY);
      return bDate - aDate;
    });

    return nextEvents;
  }, [deferredSearchTerm, events, feeFilter, sortBy, statusFilter]);

  function handleLogoFileChange(
    file: File | null,
    mode: "light" | "dark" | "applyLight" | "applyDark",
    sponsorIdx: number
  ) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (typeof result === "string") {
        setForm((prev) => {
          const updated = [...prev.sponsors];
          if (mode === "light") {
            updated[sponsorIdx].logoLightUrl = result;
          } else if (mode === "dark") {
            updated[sponsorIdx].logoDarkUrl = result;
          } else if (mode === "applyLight") {
            updated[sponsorIdx].devfolioApplyLogoLightUrl = result;
          } else {
            updated[sponsorIdx].devfolioApplyLogoDarkUrl = result;
          }
          return { ...prev, sponsors: updated };
        });
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

    const invalidDevfolioSponsor = form.sponsors.find((sponsor) => {
      if (!isDevfolioSponsor(sponsor.title)) return false;
      return (
        !sponsor.logoLightUrl?.trim() ||
        !sponsor.logoDarkUrl?.trim() ||
        !sponsor.devfolioApplyLogoLightUrl?.trim() ||
        !sponsor.devfolioApplyLogoDarkUrl?.trim()
      );
    });

    if (invalidDevfolioSponsor) {
      setError("For Devfolio sponsor, upload light/dark logos and light/dark Apply with Devfolio button logos.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      location: form.location.trim() || null,
      attendees: form.attendees ? Number(form.attendees) : null,
      eventFee: form.eventFee ? Number(form.eventFee) : null,
      accommodationFee: isChandigarhUniversityMohaliVenue
        ? 500
        : form.accommodationFee
          ? Number(form.accommodationFee)
          : null,
      accommodationAccess: form.accommodationAccess,
      category: form.category.trim() || null,
      image: form.image.trim() || null,
      sponsors: form.sponsors.filter(s => s.title.trim()).map(s => ({
        title: s.title.trim(),
        logoUrl: null,
        logoLightUrl: s.logoLightUrl?.trim() || null,
        logoDarkUrl: s.logoDarkUrl?.trim() || null,
        devfolioApplyLogoLightUrl: s.devfolioApplyLogoLightUrl?.trim() || null,
        devfolioApplyLogoDarkUrl: s.devfolioApplyLogoDarkUrl?.trim() || null,
        instagramUrl: s.instagramUrl?.trim() || null,
        linkedinUrl: s.linkedinUrl?.trim() || null,
      })),
      communityPartners: form.communityPartners.filter((partner) => partner.name.trim()).map((partner) => ({
        name: partner.name.trim(),
        logoLightUrl: partner.logoLightUrl?.trim() || null,
        logoDarkUrl: partner.logoDarkUrl?.trim() || null,
        instagramUrl: partner.instagramUrl?.trim() || null,
        linkedinUrl: partner.linkedinUrl?.trim() || null,
      })),
      sponsorTitle: null,
      sponsorLogoLightUrl: null,
      sponsorLogoDarkUrl: null,
      devfolioApplyLogoLightUrl: null,
      devfolioApplyLogoDarkUrl: null,
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
      eventFee: typeof event.eventFee === "number" ? String(event.eventFee) : "",
      accommodationFee: typeof event.accommodationFee === "number" ? String(event.accommodationFee) : "",
      accommodationAccess: event.accommodationAccess === "chandigarh-university-only" ? "chandigarh-university-only" : "open-to-all",
      category: event.category || "",
      image: event.image || "",
      sponsors: normalizeSponsorsForEdit(event),
      communityPartners: event.communityPartners || [],
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
    <div className="space-y-10">
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm">Events Dashboard</h1>
        <p className="text-base text-muted-foreground">Create and manage events shown on the public Events page.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Events", value: eventStats.total },
          { label: "Published", value: eventStats.published },
          { label: "Drafts", value: eventStats.drafts },
          { label: "Paid", value: eventStats.paid },
          { label: "Free", value: eventStats.free },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-card/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/55 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events, venues, sponsors..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchTerm ? (
              <button type="button" onClick={() => setSearchTerm("")} className="text-muted-foreground transition hover:text-foreground" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="w-full bg-transparent outline-none">
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value as typeof feeFilter)} className="w-full bg-transparent outline-none">
              <option value="all">All fees</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm lg:col-span-1">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="w-full bg-transparent outline-none">
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
              <option value="fee">Fee low to high</option>
            </select>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-white/10 bg-card/45 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150 md:grid-cols-2">
        <input
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          type="number"
          min={0}
          placeholder="Capacity"
          value={form.attendees}
          onChange={(e) => setForm((prev) => ({ ...prev, attendees: e.target.value }))}
          className="rounded-lg border border-border bg-background px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition"
        />
        <input
          type="number"
          min={0}
          placeholder="Event Fee (INR)"
          value={form.eventFee}
          onChange={(e) => setForm((prev) => ({ ...prev, eventFee: e.target.value }))}
          className="rounded-lg border border-border bg-background px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition"
        />
        <div>
          <input
            type="number"
            min={0}
            placeholder="Accommodation Fee (INR)"
            value={form.accommodationFee}
            disabled={isChandigarhUniversityMohaliVenue}
            onChange={(e) => setForm((prev) => ({ ...prev, accommodationFee: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition disabled:cursor-not-allowed disabled:opacity-70"
          />
          {isChandigarhUniversityMohaliVenue ? (
            <p className="mt-1 text-xs text-muted-foreground">For Chandigarh University Mohali venue, accommodation is fixed at Rs 500 per person.</p>
          ) : null}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Accommodation Eligibility</span>
          <select
            value={form.accommodationAccess}
            onChange={(e) => setForm((prev) => ({ ...prev, accommodationAccess: e.target.value as AccommodationAccess }))}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition"
          >
            <option value="open-to-all">Open to all</option>
            <option value="chandigarh-university-only">Chandigarh University only</option>
          </select>
        </label>
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition md:col-span-2"
        />
        <input
          placeholder="Registration URL (optional)"
          value={form.registrationUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, registrationUrl: e.target.value }))}
          className="rounded-lg border border-white/10 bg-white/25 px-4 py-3 text-base backdrop-blur-md focus:ring-2 focus:ring-primary/30 transition md:col-span-2"
        />

        {/* Multiple Sponsors Management */}
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-base font-semibold text-primary">Sponsors</label>
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
                      instagramUrl: null,
                      linkedinUrl: null,
                    },
                  ],
                }));
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary font-medium hover:bg-primary/20 transition"
            >
              <Plus size={16} />
              Add Sponsor
            </button>
          </div>
          {form.sponsors.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-border bg-background/50 p-4">
              {form.sponsors.map((sponsor, idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedSponsorIndex === null) return;
                    setForm((prev) => ({
                      ...prev,
                      sponsors: reorderSponsors(prev.sponsors, draggedSponsorIndex, idx),
                    }));
                    setDraggedSponsorIndex(null);
                  }}
                  className={`space-y-2 rounded-lg border bg-card p-4 shadow-sm ${draggedSponsorIndex === idx ? "border-primary/60" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      draggable
                      onDragStart={() => setDraggedSponsorIndex(idx)}
                      onDragEnd={() => setDraggedSponsorIndex(null)}
                      className="rounded-md border border-border bg-background p-2 text-foreground/70 hover:text-foreground"
                      aria-label="Drag to reorder sponsor"
                      title="Drag to reorder sponsor"
                    >
                      <GripVertical size={14} />
                    </button>
                    <input
                      placeholder="Sponsor name"
                      value={sponsor.title}
                      onChange={(e) => {
                        const updated = [...form.sponsors];
                        updated[idx].title = e.target.value;
                        setForm((prev) => ({ ...prev, sponsors: updated }));
                      }}
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          sponsors: prev.sponsors.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Light Logo */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/80">Logo Light (Light mode)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "light", idx)}
                        className="block w-full text-xs text-foreground/60
                          file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0
                          file:text-xs file:font-medium file:bg-primary/20 file:text-primary
                          hover:file:bg-primary/30 cursor-pointer"
                      />
                      {sponsor.logoLightUrl && (
                        <div className="mt-2 p-2 bg-white rounded border border-border">
                          <img
                            src={sponsor.logoLightUrl}
                            alt="Light logo preview"
                            className="max-h-12 max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dark Logo */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/80">Logo Dark (Dark mode)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "dark", idx)}
                        className="block w-full text-xs text-foreground/60
                          file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0
                          file:text-xs file:font-medium file:bg-primary/20 file:text-primary
                          hover:file:bg-primary/30 cursor-pointer"
                      />
                      {sponsor.logoDarkUrl && (
                        <div className="mt-2 p-2 bg-gray-900 rounded border border-border">
                          <img
                            src={sponsor.logoDarkUrl}
                            alt="Dark logo preview"
                            className="max-h-12 max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {isDevfolioSponsor(sponsor.title) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground/80">Apply Button Light (Devfolio)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "applyLight", idx)}
                          className="block w-full text-xs text-foreground/60
                            file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0
                            file:text-xs file:font-medium file:bg-primary/20 file:text-primary
                            hover:file:bg-primary/30 cursor-pointer"
                        />
                        {sponsor.devfolioApplyLogoLightUrl ? (
                          <div className="mt-2 p-2 bg-white rounded border border-border">
                            <img
                              src={sponsor.devfolioApplyLogoLightUrl}
                              alt="Devfolio apply light preview"
                              className="max-h-12 max-w-full object-contain"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground/80">Apply Button Dark (Devfolio)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null, "applyDark", idx)}
                          className="block w-full text-xs text-foreground/60
                            file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0
                            file:text-xs file:font-medium file:bg-primary/20 file:text-primary
                            hover:file:bg-primary/30 cursor-pointer"
                        />
                        {sponsor.devfolioApplyLogoDarkUrl ? (
                          <div className="mt-2 p-2 bg-gray-900 rounded border border-border">
                            <img
                              src={sponsor.devfolioApplyLogoDarkUrl}
                              alt="Devfolio apply dark preview"
                              className="max-h-12 max-w-full object-contain"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/80">Instagram URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={sponsor.instagramUrl ?? ""}
                        onChange={(e) => {
                          const updated = [...form.sponsors];
                          updated[idx].instagramUrl = e.target.value;
                          setForm((prev) => ({ ...prev, sponsors: updated }));
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/80">LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/..."
                        value={sponsor.linkedinUrl ?? ""}
                        onChange={(e) => {
                          const updated = [...form.sponsors];
                          updated[idx].linkedinUrl = e.target.value;
                          setForm((prev) => ({ ...prev, sponsors: updated }));
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground/50">No sponsors added yet</p>
          )}
        </div>

        <CommunityPartnersEditor
          items={form.communityPartners}
          onChange={(items) => setForm((prev) => ({ ...prev, communityPartners: items }))}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="min-h-24 rounded-lg border border-border bg-background px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition md:col-span-2"
        />

        <label className="inline-flex items-center gap-2 text-base font-medium md:col-span-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          />
          Publish this event
        </label>

        <div className="flex items-center gap-4 md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-base font-semibold text-white shadow-md hover:bg-primary/90 transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-border px-6 py-2.5 text-base font-semibold text-foreground bg-background hover:bg-muted/40 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {status && <p className="text-sm text-green-600">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-border bg-card/90 shadow-lg mt-8">
        <div className="border-b border-border px-8 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">All Events</h2>
          <p className="text-sm text-muted-foreground">Showing {visibleEvents.length} of {events.length}</p>
        </div>
        {loading ? (
          <p className="px-8 py-6 text-base text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="px-8 py-6 text-base text-muted-foreground">No events created yet.</p>
        ) : visibleEvents.length === 0 ? (
          <div className="px-8 py-10 text-center text-muted-foreground">
            <p className="text-base font-medium text-foreground">No events match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setFeeFilter("all");
                setSortBy("recent");
              }}
              className="mt-3 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleEvents.map((event) => {
              const publicHref = `/events/${encodeURIComponent(slugifyTitle(event.title || `event-${event.id}`))}`;
              return (
              <div key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-8 py-6 bg-card hover:bg-muted/30 transition rounded-xl my-2 shadow-sm group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-foreground truncate">{event.title || "Untitled Event"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.startDate || event.date ? formatEventDateTime(event.startDate || event.date || "") : "No start date"}
                    {event.endDate ? ` - ${formatEventDateTime(event.endDate)}` : ""}
                    {event.location ? ` • ${event.location}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.category || "Uncategorized"}
                    {typeof event.attendees === "number" ? ` • Capacity: ${event.attendees}` : ""}
                    {typeof event.eventFee === "number" ? ` • Event Fee: ${formatMoney(event.eventFee)}` : ""}
                    {typeof event.accommodationFee === "number" ? ` • Accommodation Fee: ${formatMoney(event.accommodationFee)}` : ""}
                    {typeof event.accommodationFee === "number" ? ` • ${event.accommodationAccess === "chandigarh-university-only" ? "CU only" : "Open to all"}` : ""}
                    {` • ${event.isPublished ? "Published" : "Draft"}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  <a
                    href={publicHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                    aria-label={`Open public page for ${event.title || 'event'}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => startEdit(event)}
                    className="rounded-lg border border-primary text-primary px-5 py-2 text-base font-semibold bg-primary/10 hover:bg-primary/20 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-5 py-2 text-base font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
