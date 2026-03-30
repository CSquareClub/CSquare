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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <Input {...register("title")} />
        {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tagline</label>
        <Input {...register("tagline")} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Description</label>
        <Textarea {...register("description")} className="min-h-24" />
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
        <Input {...register("venueName")} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">City</label>
        <Input {...register("city")} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Online Link</label>
        <Input {...register("onlineLink")} />
        {errors.onlineLink ? <p className="mt-1 text-xs text-red-600">{errors.onlineLink.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Organizer Name</label>
        <Input {...register("organizerName")} />
        {errors.organizerName ? <p className="mt-1 text-xs text-red-600">{errors.organizerName.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Contact Email</label>
        <Input {...register("contactEmail")} />
        {errors.contactEmail ? <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Registration Link</label>
        <Input {...register("registrationLink")} />
        {errors.registrationLink ? <p className="mt-1 text-xs text-red-600">{errors.registrationLink.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Registration Deadline</label>
        <Input type="datetime-local" {...register("registrationDeadline")} />
        {errors.registrationDeadline ? <p className="mt-1 text-xs text-red-600">{errors.registrationDeadline.message}</p> : null}
      </div>

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
      </div>

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
        <Input {...register("slug")} onChange={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })} />
        {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p> : null}
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
        {serverMessage ? <p className="text-sm text-green-600">{serverMessage}</p> : null}
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </div>
    </form>
  );
}
