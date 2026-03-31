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
    registrationLink: event.registrationLink || event.registrationUrl || "https://csquare.club/events",
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

function shouldUseLegacyRegistrationLink(link: string | null): boolean {
  if (!link) return true;
  const trimmed = link.trim();
  if (!trimmed || trimmed === "#") return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol !== "http:" && parsed.protocol !== "https:";
  } catch {
    return true;
  }
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
      select: {
        id: true,
        slug: true,
        bannerImage: true,
        sponsors: true,
        registrationLink: true,
        status: true,
      },
    });

    const existingBySlug = new Map(existing.map((event) => [event.slug, event]));

    for (const legacyEvent of legacyEvents) {
      const data = toLegacyEventCreateData(legacyEvent);
      if (!data.slug) continue;

      const existingEvent = existingBySlug.get(data.slug);

      if (existingEvent) {
        const patch: {
          bannerImage?: string | null;
          sponsors?: string | null;
          registrationLink?: string;
          status?: string;
        } = {};

        if (!existingEvent.bannerImage && data.bannerImage) {
          patch.bannerImage = data.bannerImage;
        }

        if (!existingEvent.sponsors && data.sponsors) {
          patch.sponsors = data.sponsors;
        }

        if (shouldUseLegacyRegistrationLink(existingEvent.registrationLink) && data.registrationLink) {
          patch.registrationLink = data.registrationLink;
        }

        if (existingEvent.status !== data.status) {
          patch.status = data.status;
        }

        if (Object.keys(patch).length > 0) {
          try {
            await prisma.event.update({
              where: { id: existingEvent.id },
              data: patch,
            });
          } catch {
            // Ignore per-row sync failures.
          }
        }

        continue;
      }

      try {
        await prisma.event.create({ data });
        const created = await prisma.event.findUnique({
          where: { slug: data.slug },
          select: { id: true, slug: true, bannerImage: true, sponsors: true, registrationLink: true, status: true },
        });

        if (created) {
          existingBySlug.set(data.slug, created);
        }
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

    return await prisma.event.findMany({
      orderBy: { startDateTime: "desc" },
    });
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
    const legacyBySlug = new Map(
      legacyEvents.map((legacyEvent) => {
        const normalized = toLegacyEventRecord(legacyEvent);
        return [normalized.slug, normalized] as const;
      })
    );

    return dbEvents.map((event) => {
      const legacy = legacyBySlug.get(event.slug);
      if (!legacy) return event;

      return {
        ...event,
        bannerImage: event.bannerImage || legacy.bannerImage,
        sponsors: event.sponsors || legacy.sponsors,
        registrationLink: shouldUseLegacyRegistrationLink(event.registrationLink)
          ? legacy.registrationLink
          : event.registrationLink,
      };
    });
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
  if (id.startsWith("legacy-")) {
    const legacyId = Number(id.replace("legacy-", ""));
    if (!Number.isNaN(legacyId)) {
      const legacyEvents = await listAdminEvents();
      const legacyMatch = legacyEvents.find((event) => event.id === legacyId);
      return legacyMatch ? toLegacyEventRecord(legacyMatch) : null;
    }
  }

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

    if (!fromDb) return null;

    const legacyEvents = await listPublicEvents();
    const legacyMatch = legacyEvents.find((event) => slugify(event.title || "") === slug);
    if (!legacyMatch) return fromDb;

    const legacy = toLegacyEventRecord(legacyMatch);
    return {
      ...fromDb,
      bannerImage: fromDb.bannerImage || legacy.bannerImage,
      sponsors: fromDb.sponsors || legacy.sponsors,
      registrationLink: shouldUseLegacyRegistrationLink(fromDb.registrationLink)
        ? legacy.registrationLink
        : fromDb.registrationLink,
    };
  } catch (error) {
    if (isMissingEventTableError(error)) {
      const legacyEvents = await listPublicEvents();
      const legacyMatch = legacyEvents.find((event) => slugify(event.title || "") === slug);
      return legacyMatch ? toLegacyEventRecord(legacyMatch) : null;
    }
    throw error;
  }
}
