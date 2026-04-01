"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CommunityPartnersEditor, { type CommunityPartnerDraft } from "@/components/admin/community-partners-editor";

type EventType = "Online" | "Offline" | "Hybrid";
type EventCategory = "Hackathon" | "Workshop" | "Fest" | "Meetup";
type EventStatus = "draft" | "published";

type Sponsor = {
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

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
  sponsors: Sponsor[];
  communityPartners: CommunityPartnerDraft[];
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
  sponsors: [],
  communityPartners: [],
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

function isDevfolioSponsor(title: string | null | undefined): boolean {
  return title?.trim().toLowerCase() === "devfolio";
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

  function handleSponsorLogoFile(
    file: File | null,
    sponsorIdx: number,
    mode: "light" | "dark" | "applyLight" | "applyDark"
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
      setErrorMessage("For Devfolio sponsor, upload light/dark logos and light/dark Apply with Devfolio button logos.");
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
        sponsors: form.sponsors.filter(s => s.title.trim()).map((s) => ({
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
          logoUrl: partner.logoUrl?.trim() || null,
          logoLightUrl: partner.logoLightUrl?.trim() || null,
          logoDarkUrl: partner.logoDarkUrl?.trim() || null,
          instagramUrl: partner.instagramUrl?.trim() || null,
          linkedinUrl: partner.linkedinUrl?.trim() || null,
        })),
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
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="min-h-56 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Supports multi-line text and bold using **double asterisks**.
          </p>
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
          <textarea
            value={form.prizes}
            onChange={(e) => update("prizes", e.target.value)}
            className="min-h-36 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
            placeholder="Example:\nTotal Prize Pool: ₹50,000\n1st Prize: ₹7,000\n2nd Prize: ₹5,000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Rules</label>
          <textarea
            value={form.rules}
            onChange={(e) => update("rules", e.target.value)}
            className="min-h-32 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Schedule</label>
          <textarea
            value={form.schedule}
            onChange={(e) => update("schedule", e.target.value)}
            className="min-h-32 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Sponsors</label>
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
            className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary font-medium hover:bg-primary/20 transition mb-3"
          >
            <Plus size={16} />
            Add Sponsor
          </button>

          {form.sponsors.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-border bg-background/50 p-4">
              {form.sponsors.map((sponsor, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      placeholder="Sponsor name"
                      value={sponsor.title}
                      onChange={(e) => {
                        const updated = [...form.sponsors];
                        updated[idx].title = e.target.value;
                        setForm((prev) => ({ ...prev, sponsors: updated }));
                      }}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
                        onChange={(e) => handleSponsorLogoFile(e.target.files?.[0] || null, idx, "light")}
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
                        onChange={(e) => handleSponsorLogoFile(e.target.files?.[0] || null, idx, "dark")}
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
                          onChange={(e) => handleSponsorLogoFile(e.target.files?.[0] || null, idx, "applyLight")}
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
                          onChange={(e) => handleSponsorLogoFile(e.target.files?.[0] || null, idx, "applyDark")}
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
                          update("sponsors", updated);
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
                          update("sponsors", updated);
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
