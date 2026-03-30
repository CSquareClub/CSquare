"use client";

import { useEffect, useState } from "react";

type EventType = "Online" | "Offline" | "Hybrid";
type EventCategory = "Hackathon" | "Workshop" | "Fest" | "Meetup";
type EventStatus = "draft" | "published";

type FormState = {
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  eventType: EventType;
  tagsInput: string;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  city: string;
  onlineLink: string;
  organizerName: string;
  contactEmail: string;
  registrationLink: string;
  registrationDeadline: string;
  bannerImage: string;
  prizes: string;
  rules: string;
  schedule: string;
  sponsors: string;
  status: EventStatus;
  slug: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  title: "",
  tagline: "",
  description: "",
  category: "Workshop",
  eventType: "Offline",
  tagsInput: "",
  startDateTime: "",
  endDateTime: "",
  venueName: "",
  city: "",
  onlineLink: "",
  organizerName: "",
  contactEmail: "",
  registrationLink: "",
  registrationDeadline: "",
  bannerImage: "",
  prizes: "",
  rules: "",
  schedule: "",
  sponsors: "",
  status: "draft",
  slug: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CreateEventPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!form.slug.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.startDateTime) nextErrors.startDateTime = "Start date and time is required.";
    if (!form.endDateTime) nextErrors.endDateTime = "End date and time is required.";
    if (!form.organizerName.trim()) nextErrors.organizerName = "Organizer name is required.";

    if (!form.contactEmail.trim()) {
      nextErrors.contactEmail = "Contact email is required.";
    } else if (!isValidEmail(form.contactEmail.trim())) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }

    if (!form.registrationLink.trim()) {
      nextErrors.registrationLink = "Registration link is required.";
    } else if (!isValidUrl(form.registrationLink.trim())) {
      nextErrors.registrationLink = "Registration link must be a valid URL.";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Slug can contain lowercase letters, numbers, and hyphens only.";
    }

    if (form.startDateTime && form.endDateTime) {
      const start = new Date(form.startDateTime).getTime();
      const end = new Date(form.endDateTime).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
        nextErrors.endDateTime = "End date and time must be after start date and time.";
      }
    }

    if (form.registrationDeadline) {
      const registrationDeadline = new Date(form.registrationDeadline).getTime();
      const start = form.startDateTime ? new Date(form.startDateTime).getTime() : null;
      if (!Number.isFinite(registrationDeadline)) {
        nextErrors.registrationDeadline = "Enter a valid registration deadline.";
      } else if (start && Number.isFinite(start) && registrationDeadline > start) {
        nextErrors.registrationDeadline = "Registration deadline must be before event start.";
      }
    }

    if (form.onlineLink.trim() && !isValidUrl(form.onlineLink.trim())) {
      nextErrors.onlineLink = "Online link must be a valid URL.";
    }

    return nextErrors;
  }

  async function handleBannerFile(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        update("bannerImage", result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim(),
        category: form.category,
        eventType: form.eventType,
        tags: form.tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: new Date(form.endDateTime).toISOString(),
        venueName: form.venueName.trim() || null,
        city: form.city.trim() || null,
        onlineLink: form.onlineLink.trim() || null,
        organizerName: form.organizerName.trim(),
        contactEmail: form.contactEmail.trim(),
        registrationLink: form.registrationLink.trim(),
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
        bannerImage: form.bannerImage || null,
        prizes: form.prizes.trim() || null,
        rules: form.rules.trim() || null,
        schedule: form.schedule.trim() || null,
        sponsors: form.sponsors.trim() || null,
        status: form.status,
        slug: form.slug.trim(),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create event.");
      }

      setSuccessMessage("Event created successfully.");
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Creation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new club event with complete details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tagline</label>
          <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description *</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value as EventCategory)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option>Hackathon</option>
            <option>Workshop</option>
            <option>Fest</option>
            <option>Meetup</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Event Type</label>
          <select value={form.eventType} onChange={(e) => update("eventType", e.target.value as EventType)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option>Online</option>
            <option>Offline</option>
            <option>Hybrid</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
          <input value={form.tagsInput} onChange={(e) => update("tagsInput", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Start Date & Time *</label>
          <input type="datetime-local" value={form.startDateTime} onChange={(e) => update("startDateTime", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.startDateTime ? <p className="mt-1 text-xs text-red-600">{errors.startDateTime}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">End Date & Time *</label>
          <input type="datetime-local" value={form.endDateTime} onChange={(e) => update("endDateTime", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.endDateTime ? <p className="mt-1 text-xs text-red-600">{errors.endDateTime}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Venue Name</label>
          <input value={form.venueName} onChange={(e) => update("venueName", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Online Link</label>
          <input value={form.onlineLink} onChange={(e) => update("onlineLink", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.onlineLink ? <p className="mt-1 text-xs text-red-600">{errors.onlineLink}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Organizer Name *</label>
          <input value={form.organizerName} onChange={(e) => update("organizerName", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.organizerName ? <p className="mt-1 text-xs text-red-600">{errors.organizerName}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Contact Email *</label>
          <input value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.contactEmail ? <p className="mt-1 text-xs text-red-600">{errors.contactEmail}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Registration Link *</label>
          <input value={form.registrationLink} onChange={(e) => update("registrationLink", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.registrationLink ? <p className="mt-1 text-xs text-red-600">{errors.registrationLink}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Registration Deadline (optional)</label>
          <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.registrationDeadline ? <p className="mt-1 text-xs text-red-600">{errors.registrationDeadline}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Banner Image</label>
          <input type="file" accept="image/*" onChange={(e) => handleBannerFile(e.target.files?.[0] || null)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Prizes</label>
          <textarea value={form.prizes} onChange={(e) => update("prizes", e.target.value)} className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Rules</label>
          <textarea value={form.rules} onChange={(e) => update("rules", e.target.value)} className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Schedule</label>
          <textarea value={form.schedule} onChange={(e) => update("schedule", e.target.value)} className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Sponsors</label>
          <textarea value={form.sponsors} onChange={(e) => update("sponsors", e.target.value)} className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value as EventStatus)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug *</label>
          <input value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug}</p> : null}
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
            {submitting ? "Submitting..." : "Create Event"}
          </button>
        </div>
      </form>

      {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
