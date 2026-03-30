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

export function EventForm({ mode, defaultValues, submitAction }: EventFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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
            <Textarea {...register("sponsors")} className="min-h-16" />
            <p className="mt-1 text-xs text-muted-foreground">
              Use plain text for one sponsor, or JSON array for multiple sponsors and logos.
            </p>
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
