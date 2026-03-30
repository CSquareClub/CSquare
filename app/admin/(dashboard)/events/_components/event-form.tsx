"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  eventFormSchema,
  type EventFormInput,
} from "@/lib/event-schema";
import { parseEventSponsors } from "@/lib/event-sponsors";
import type { EventActionResult } from "@/app/admin/(dashboard)/events/actions";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type EventFormProps = {
  mode: "create" | "edit";
  defaultValues: EventFormInput;
  submitAction: (payload: EventFormInput) => Promise<EventActionResult>;
};

type SponsorFormRow = {
  title: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  devfolioApplyLogoLightUrl: string;
  devfolioApplyLogoDarkUrl: string;
};

function toSponsorRows(rawSponsors: string | undefined): SponsorFormRow[] {
  const parsed = parseEventSponsors(rawSponsors);

  if (!parsed.length) {
    return [
      {
        title: "",
        logoLightUrl: "",
        logoDarkUrl: "",
        devfolioApplyLogoLightUrl: "",
        devfolioApplyLogoDarkUrl: "",
      },
    ];
  }

  return parsed.map((sponsor) => ({
    title: sponsor.title,
    logoLightUrl: sponsor.logoLightUrl || "",
    logoDarkUrl: sponsor.logoDarkUrl || "",
    devfolioApplyLogoLightUrl: sponsor.devfolioApplyLogoLightUrl || "",
    devfolioApplyLogoDarkUrl: sponsor.devfolioApplyLogoDarkUrl || "",
  }));
}

export function EventForm({ mode, defaultValues, submitAction }: EventFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sponsorRows, setSponsorRows] = useState<SponsorFormRow[]>(
    toSponsorRows(defaultValues.sponsors)
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");

  useEffect(() => {
    const normalizedSponsors = sponsorRows
      .map((row) => ({
        title: row.title.trim(),
        logoLightUrl: row.logoLightUrl.trim() || null,
        logoDarkUrl: row.logoDarkUrl.trim() || null,
        devfolioApplyLogoLightUrl: row.devfolioApplyLogoLightUrl.trim() || null,
        devfolioApplyLogoDarkUrl: row.devfolioApplyLogoDarkUrl.trim() || null,
      }))
      .filter((row) => row.title.length > 0);

    setValue(
      "sponsors",
      normalizedSponsors.length ? JSON.stringify(normalizedSponsors) : "",
      { shouldValidate: true }
    );
  }, [sponsorRows, setValue]);

  useEffect(() => {
    if (!watchedSlug) {
      setValue("slug", slugify(watchedTitle || ""), { shouldValidate: true });
    }
  }, [watchedTitle, watchedSlug, setValue]);

  const submitLabel = useMemo(() => (mode === "create" ? "Create Event" : "Save Changes"), [mode]);

  async function onSubmit(values: EventFormInput) {
    setServerMessage(null);
    setServerError(null);

    const result = await submitAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    setServerMessage(result.message);
  }

  async function handleBannerFile(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setValue("bannerImage", result, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  }

  const hasFormErrors = Object.keys(errors).length > 0;

  function updateSponsorRow(index: number, key: keyof SponsorFormRow, value: string) {
    setSponsorRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addSponsorRow() {
    setSponsorRows((prev) => [
      ...prev,
      {
        title: "",
        logoLightUrl: "",
        logoDarkUrl: "",
        devfolioApplyLogoLightUrl: "",
        devfolioApplyLogoDarkUrl: "",
      },
    ]);
  }

  function removeSponsorRow(index: number) {
    setSponsorRows((prev) => {
      if (prev.length === 1) {
        return [
          {
            title: "",
            logoLightUrl: "",
            logoDarkUrl: "",
            devfolioApplyLogoLightUrl: "",
            devfolioApplyLogoDarkUrl: "",
          },
        ];
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold">Core Details</h2>
        <p className="mt-1 text-xs text-muted-foreground">Set the event identity, format, and discovery metadata.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input {...register("title")} placeholder="Open Source Summit 2026" />
            {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tagline</label>
            <Input {...register("tagline")} placeholder="Build, mentor, and ship together" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea {...register("description")} className="min-h-28" placeholder="Write a clear overview of what attendees will learn and do." />
            {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Fest">Fest</SelectItem>
                    <SelectItem value="Meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Event Type</label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
            <Input {...register("tagsInput")} placeholder="nextjs, prisma, hackathon" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold">Timeline & Location</h2>
        <p className="mt-1 text-xs text-muted-foreground">Keep schedules precise so registration and reminders stay accurate.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Start Date & Time</label>
            <Input type="datetime-local" {...register("startDateTime")} />
            {errors.startDateTime ? <p className="mt-1 text-xs text-red-600">{errors.startDateTime.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date & Time</label>
            <Input type="datetime-local" {...register("endDateTime")} />
            {errors.endDateTime ? <p className="mt-1 text-xs text-red-600">{errors.endDateTime.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Venue Name</label>
            <Input {...register("venueName")} placeholder="CU Auditorium" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <Input {...register("city")} placeholder="Chandigarh" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Online Link</label>
            <Input {...register("onlineLink")} placeholder="https://meet.google.com/..." />
            {errors.onlineLink ? <p className="mt-1 text-xs text-red-600">{errors.onlineLink.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold">Organizer & Registration</h2>
        <p className="mt-1 text-xs text-muted-foreground">These fields drive attendee communication and conversion.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Organizer Name</label>
            <Input {...register("organizerName")} placeholder="C Square Core Team" />
            {errors.organizerName ? <p className="mt-1 text-xs text-red-600">{errors.organizerName.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Contact Email</label>
            <Input {...register("contactEmail")} placeholder="events@csquare.club" />
            {errors.contactEmail ? <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Registration Link</label>
            <Input {...register("registrationLink")} placeholder="https://..." />
            {errors.registrationLink ? <p className="mt-1 text-xs text-red-600">{errors.registrationLink.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Registration Deadline</label>
            <Input type="datetime-local" {...register("registrationDeadline")} />
            {errors.registrationDeadline ? <p className="mt-1 text-xs text-red-600">{errors.registrationDeadline.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold">Media & Content</h2>
        <p className="mt-1 text-xs text-muted-foreground">Add rich context for the event detail page and promotions.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Banner Image</label>
            <Input type="file" accept="image/*" onChange={(e) => handleBannerFile(e.target.files?.[0] || null)} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Prizes</label>
            <Textarea {...register("prizes")} className="min-h-16" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Rules</label>
            <Textarea {...register("rules")} className="min-h-16" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Schedule</label>
            <Textarea {...register("schedule")} className="min-h-16" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Sponsors</label>
            <div className="space-y-3 rounded-xl border border-border bg-background/50 p-4">
              {sponsorRows.map((row, index) => (
                <div key={`sponsor-${index}`} className="space-y-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sponsor {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeSponsorRow(index)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="Sponsor title (e.g. Devfolio)"
                      value={row.title}
                      onChange={(e) => updateSponsorRow(index, "title", e.target.value)}
                    />
                    <Input
                      placeholder="Light logo URL"
                      value={row.logoLightUrl}
                      onChange={(e) => updateSponsorRow(index, "logoLightUrl", e.target.value)}
                    />
                    <Input
                      placeholder="Dark logo URL"
                      value={row.logoDarkUrl}
                      onChange={(e) => updateSponsorRow(index, "logoDarkUrl", e.target.value)}
                    />
                    <Input
                      placeholder="Devfolio apply logo (light)"
                      value={row.devfolioApplyLogoLightUrl}
                      onChange={(e) => updateSponsorRow(index, "devfolioApplyLogoLightUrl", e.target.value)}
                    />
                    <Input
                      placeholder="Devfolio apply logo (dark)"
                      value={row.devfolioApplyLogoDarkUrl}
                      onChange={(e) => updateSponsorRow(index, "devfolioApplyLogoDarkUrl", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSponsorRow}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-card"
              >
                Add Sponsor
              </button>
            </div>

            <input type="hidden" {...register("sponsors")} />
            <p className="mt-2 text-xs text-muted-foreground">Multiple sponsors are now saved automatically from these rows.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold">Publishing</h2>
        <p className="mt-1 text-xs text-muted-foreground">Choose visibility and finalize URL slug.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="published">published</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input
              {...register("slug")}
              onChange={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Public URL: /events/{watch("slug") || "your-event-slug"}</p>
            {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p> : null}
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 rounded-2xl border border-border bg-background/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground">
            {hasFormErrors ? "Please fix highlighted fields before submitting." : "All set. Save when ready."}
          </div>

          <div className="flex items-center gap-3">
            {serverMessage ? <p className="text-sm text-green-600">{serverMessage}</p> : null}
            {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
