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