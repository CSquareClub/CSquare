import prisma from "@/lib/db";
import { listAdminEvents, listPublicEvents, type ClubEvent } from "@/lib/events-store";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  category: string;
  eventType: string;
  tags: string[];
  startDateTime: Date;
  endDateTime: Date;
  venueName: string | null;
  city: string | null;
  onlineLink: string | null;
  organizerName: string;
  contactEmail: string;
  registrationLink: string;
  registrationDeadline: Date | null;
  bannerImage: string | null;
  prizes: string | null;
  rules: string | null;
  schedule: string | null;
  sponsors: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function isMissingEventTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; meta?: { modelName?: string } };
  return maybeError.code === "P2021" && maybeError.meta?.modelName === "Event";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLegacyEventRecord(event: ClubEvent): EventRecord {
  const title = (event.title || "Untitled Event").trim() || "Untitled Event";
  const fallbackDate = new Date();
  const startDateTime = event.startDate ? new Date(event.startDate) : event.date ? new Date(event.date) : fallbackDate;
  const endDateTime = event.endDate ? new Date(event.endDate) : startDateTime;

  return {
    id: `legacy-${event.id}`,
    title,
    slug: slugify(title),
    tagline: null,
    description: event.description || "",
    category: event.category || "Workshop",
    eventType: "Offline",
    tags: [],
    startDateTime,
    endDateTime,
    venueName: event.location || null,
    city: null,
    onlineLink: null,
    organizerName: "C Square",
    contactEmail: "events@csquare.club",
    registrationLink: event.registrationLink || event.registrationUrl || "#",
    registrationDeadline: null,
    bannerImage: event.image || null,
    prizes: null,
    rules: null,
    schedule: null,
    sponsors: event.sponsors?.length ? JSON.stringify(event.sponsors) : event.sponsorTitle || null,
    status: event.isPublished ? "published" : "draft",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  };
}

function toLegacyEventCreateData(event: ClubEvent) {
  const normalized = toLegacyEventRecord(event);

  return {
    title: normalized.title,
    slug: normalized.slug,
    tagline: normalized.tagline,
    description: normalized.description,
    category: normalized.category,
    eventType: normalized.eventType,
    tags: normalized.tags,
    startDateTime: normalized.startDateTime,
    endDateTime: normalized.endDateTime,
    venueName: normalized.venueName,
    city: normalized.city,
    onlineLink: normalized.onlineLink,
    organizerName: normalized.organizerName,
    contactEmail: normalized.contactEmail,
    registrationLink: normalized.registrationLink,
    registrationDeadline: normalized.registrationDeadline,
    bannerImage: normalized.bannerImage,
    prizes: normalized.prizes,
    rules: normalized.rules,
    schedule: normalized.schedule,
    sponsors: normalized.sponsors,
    status: normalized.status,
  };
}

let legacySyncPromise: Promise<void> | null = null;

async function syncLegacyEventsToPrisma(): Promise<void> {
  if (legacySyncPromise) {
    return legacySyncPromise;
  }

  legacySyncPromise = (async () => {
    let legacyEvents: ClubEvent[];
    try {
      legacyEvents = await listAdminEvents();
    } catch {
      return;
    }

    if (!legacyEvents.length) return;

    const existing = await prisma.event.findMany({
      select: { slug: true },
    });

    const existingSlugs = new Set(existing.map((event) => event.slug));

    for (const legacyEvent of legacyEvents) {
      const data = toLegacyEventCreateData(legacyEvent);
      if (!data.slug || existingSlugs.has(data.slug)) continue;

      try {
        await prisma.event.create({ data });
        existingSlugs.add(data.slug);
      } catch {
        // Skip rows that fail unique constraints or partial legacy data.
      }
    }
  })().finally(() => {
    legacySyncPromise = null;
  });

  return legacySyncPromise;
}

function mergeEventRecords(primary: EventRecord[], fallback: EventRecord[]): EventRecord[] {
  const seen = new Set(primary.map((event) => event.slug));
  const merged = [...primary];

  for (const event of fallback) {
    if (seen.has(event.slug)) continue;
    seen.add(event.slug);
    merged.push(event);
  }

  return merged;
}

export async function listAdminEventsFromDb(): Promise<EventRecord[]> {
  try {
    await syncLegacyEventsToPrisma();

    const dbEvents = await prisma.event.findMany({
      orderBy: { startDateTime: "desc" },
    });

    const legacyEvents = await listAdminEvents();
    return mergeEventRecords(dbEvents, legacyEvents.map(toLegacyEventRecord)).sort(
      (a, b) => b.startDateTime.getTime() - a.startDateTime.getTime()
    );
  } catch (error) {
    if (isMissingEventTableError(error)) {
      const legacyEvents = await listAdminEvents();
      return legacyEvents.map(toLegacyEventRecord).sort(
        (a, b) => b.startDateTime.getTime() - a.startDateTime.getTime()
      );
    }
    throw error;
  }
}

export async function listPublishedEventsFromDb(): Promise<EventRecord[]> {
  try {
    await syncLegacyEventsToPrisma();

    const dbEvents = await prisma.event.findMany({
      where: { status: { equals: "published", mode: "insensitive" } },
      orderBy: { startDateTime: "asc" },
    });

    const legacyEvents = await listPublicEvents();
    return mergeEventRecords(dbEvents, legacyEvents.map(toLegacyEventRecord)).sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
    );
  } catch (error) {
    if (isMissingEventTableError(error)) {
      const legacyEvents = await listPublicEvents();
      return legacyEvents.map(toLegacyEventRecord).sort(
        (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
      );
    }
    throw error;
  }
}

export async function getAdminEventById(id: string): Promise<EventRecord | null> {
  try {
    await syncLegacyEventsToPrisma();
    return await prisma.event.findUnique({ where: { id } });
  } catch (error) {
    if (isMissingEventTableError(error)) return null;
    throw error;
  }
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  try {
    await syncLegacyEventsToPrisma();

    const fromDb = await prisma.event.findFirst({
      where: {
        slug,
        status: { equals: "published", mode: "insensitive" },
      },
    });

    if (fromDb) return fromDb;

    const legacyEvents = await listPublicEvents();
    const legacyMatch = legacyEvents.find((event) => slugify(event.title || "") === slug);
    return legacyMatch ? toLegacyEventRecord(legacyMatch) : null;
  } catch (error) {
    if (isMissingEventTableError(error)) {
      const legacyEvents = await listPublicEvents();
      const legacyMatch = legacyEvents.find((event) => slugify(event.title || "") === slug);
      return legacyMatch ? toLegacyEventRecord(legacyMatch) : null;
    }
    throw error;
  }
}
