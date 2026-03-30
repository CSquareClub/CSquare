import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3),
  tagline: z.string().optional(),
  description: z.string().min(10),

  category: z.string(),
  eventType: z.enum(["Online", "Offline", "Hybrid"]),
  tags: z.array(z.string()).optional(),

  startDateTime: z.date(),
  endDateTime: z.date(),

  venueName: z.string().optional(),
  city: z.string().optional(),
  onlineLink: z.string().url().optional(),

  organizerName: z.string(),
  contactEmail: z.string().email(),

  registrationLink: z.string().url(),
  registrationDeadline: z.date().optional(),

  bannerImage: z.string().optional(),

  prizes: z.string().optional(),
  rules: z.string().optional(),
  schedule: z.string().optional(),
  sponsors: z.string().optional(),

  status: z.enum(["draft", "published"]).default("draft"),
  slug: z.string(),
});

export type EventInput = z.infer<typeof eventSchema>;

function optionalString() {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.string().optional());
}

export const eventFormSchema = z
  .object({
    title: z.string().min(3),
    tagline: optionalString(),
    description: z.string().min(10),

    category: z.enum(["Hackathon", "Workshop", "Fest", "Meetup"]),
    eventType: z.enum(["Online", "Offline", "Hybrid"]),
    tagsInput: z.string().default(""),

    startDateTime: z.string().min(1),
    endDateTime: z.string().min(1),

    venueName: optionalString(),
    city: optionalString(),
    onlineLink: z.preprocess((value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    }, z.string().url().optional()),

    organizerName: z.string().min(1),
    contactEmail: z.string().email(),

    registrationLink: z.string().url(),
    registrationDeadline: optionalString(),

    bannerImage: optionalString(),

    prizes: optionalString(),
    rules: optionalString(),
    schedule: optionalString(),
    sponsors: optionalString(),

    status: z.enum(["draft", "published"]).default("draft"),
    slug: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startDateTime).getTime();
    const end = new Date(value.endDateTime).getTime();

    if (!Number.isFinite(start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date and time",
        path: ["startDateTime"],
      });
    }

    if (!Number.isFinite(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid end date and time",
        path: ["endDateTime"],
      });
    }

    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date/time must be after start date/time",
        path: ["endDateTime"],
      });
    }

    if (value.registrationDeadline) {
      const deadline = new Date(value.registrationDeadline).getTime();
      if (!Number.isFinite(deadline)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid registration deadline",
          path: ["registrationDeadline"],
        });
      } else if (Number.isFinite(start) && deadline > start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Registration deadline must be before event start",
          path: ["registrationDeadline"],
        });
      }
    }
  });

export type EventFormInput = z.infer<typeof eventFormSchema>;

export function toEventInput(form: EventFormInput): EventInput {
  const tags = form.tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title: form.title.trim(),
    tagline: form.tagline,
    description: form.description.trim(),
    category: form.category,
    eventType: form.eventType,
    tags,
    startDateTime: new Date(form.startDateTime),
    endDateTime: new Date(form.endDateTime),
    venueName: form.venueName,
    city: form.city,
    onlineLink: form.onlineLink,
    organizerName: form.organizerName.trim(),
    contactEmail: form.contactEmail.trim(),
    registrationLink: form.registrationLink.trim(),
    registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : undefined,
    bannerImage: form.bannerImage,
    prizes: form.prizes,
    rules: form.rules,
    schedule: form.schedule,
    sponsors: form.sponsors,
    status: form.status,
    slug: form.slug.trim(),
  };
}