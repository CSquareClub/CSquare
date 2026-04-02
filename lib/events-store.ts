import prisma from "@/lib/db";
import { formatTimeRangeFromDates } from "@/lib/event-time-utils";

export type Sponsor = {
  id: number;
  eventId: number;
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

export type CommunityPartner = {
  id: number;
  eventId: number;
  name: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

export type ClubEvent = {
  id: number;
  slug: string | null;
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
  accommodationAccess: "open-to-all" | "chandigarh-university-only" | null;
  category: string | null;
  image: string | null;
  sponsors: Sponsor[];
  communityPartners: CommunityPartner[];
  sponsorTitle: string | null;
  sponsorLogoUrl: string | null;
  sponsorLogoLightUrl: string | null;
  sponsorLogoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
  isPublished: boolean;
  registrationUrl: string | null;
  registrationLink: string | null;
  isRegistrationOpen: boolean;
};

type EventRow = {
  id: number;
  title: string | null;
  description: string | null;
  start_at: Date | string | null;
  end_at: Date | string | null;
  event_date: Date | string | null;
  time_text: string | null;
  location: string | null;
  attendees: number | null;
  event_fee: number | null;
  accommodation_fee: number | null;
  accommodation_access: string | null;
  category: string | null;
  image_url: string | null;
  sponsor_title: string | null;
  sponsor_logo_url: string | null;
  sponsor_logo_light_url: string | null;
  sponsor_logo_dark_url: string | null;
  devfolio_apply_logo_light_url: string | null;
  devfolio_apply_logo_dark_url: string | null;
  is_published: boolean;
  registration_url: string | null;
};

type CommunityPartnerRow = {
  id: number;
  eventId: number;
  name: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

let tableReady = false;
let tableReadyPromise: Promise<void> | null = null;

async function ensureEventsTable() {
  if (tableReady) return;
  if (tableReadyPromise) return tableReadyPromise;

  tableReadyPromise = (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,
        event_date TIMESTAMPTZ NOT NULL,
        time_text TEXT NOT NULL,
        location TEXT NOT NULL,
        attendees INTEGER NOT NULL DEFAULT 0,
        event_fee INTEGER,
        accommodation_fee INTEGER,
        accommodation_access TEXT,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        sponsor_title TEXT,
        sponsor_logo_url TEXT,
        sponsor_logo_light_url TEXT,
        sponsor_logo_dark_url TEXT,
        devfolio_apply_logo_light_url TEXT,
        devfolio_apply_logo_dark_url TEXT,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        registration_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS event_sponsors (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        logo_url TEXT,
        logo_light_url TEXT,
        logo_dark_url TEXT,
        devfolio_apply_logo_light_url TEXT,
        devfolio_apply_logo_dark_url TEXT,
        instagram_url TEXT,
        linkedin_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS event_community_partners (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        logo_url TEXT,
        logo_light_url TEXT,
        logo_dark_url TEXT,
        instagram_url TEXT,
        linkedin_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_event_sponsors_event_id ON event_sponsors(event_id);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_event_community_partners_event_id ON event_community_partners(event_id);
    `);

    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_title TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_light_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_dark_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS devfolio_apply_logo_light_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS devfolio_apply_logo_dark_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_fee INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS accommodation_fee INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS accommodation_access TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS instagram_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS linkedin_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE event_community_partners ADD COLUMN IF NOT EXISTS instagram_url TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE event_community_partners ADD COLUMN IF NOT EXISTS linkedin_url TEXT;`);
    await prisma.$executeRawUnsafe(`UPDATE events SET start_at = event_date WHERE start_at IS NULL;`);
    await prisma.$executeRawUnsafe(`UPDATE events SET end_at = event_date WHERE end_at IS NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN title DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN description DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN start_at DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN end_at DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN time_text DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN location DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN attendees DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN category DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN image_url DROP NOT NULL;`);

    tableReady = true;
  })();

  try {
    await tableReadyPromise;
  } finally {
    tableReadyPromise = null;
  }
}

function formatTimeRange(startDate: Date, endDate: Date): string {
  return formatTimeRangeFromDates(startDate, endDate);
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractSlugFromDescription(description: string | null): string | null {
  if (!description) return null;

  const slugMatch = description.match(/\*\*Slug\*\*\s*\n\s*([a-z0-9]+(?:-[a-z0-9]+)*)/i);
  return slugMatch?.[1]?.toLowerCase() ?? null;
}

function rowToEvent(
  row: EventRow,
  sponsors: Sponsor[] = [],
  communityPartners: CommunityPartner[] = []
): ClubEvent {
  const legacyDate = row.event_date ? (row.event_date instanceof Date ? row.event_date : new Date(row.event_date)) : null;
  const startDateRaw = row.start_at ?? legacyDate;
  const endDateRaw = row.end_at ?? startDateRaw;
  const startDate = startDateRaw ? (startDateRaw instanceof Date ? startDateRaw : new Date(startDateRaw)) : null;
  const endDate = endDateRaw ? (endDateRaw instanceof Date ? endDateRaw : new Date(endDateRaw)) : null;
  const sponsorLogoLightUrl = row.sponsor_logo_light_url ?? row.sponsor_logo_url;
  const sponsorLogoDarkUrl = row.sponsor_logo_dark_url ?? sponsorLogoLightUrl;

  const registrationCutoff = endDate ?? startDate;
  const isRegistrationOpen = !registrationCutoff || registrationCutoff > new Date();

  return {
    id: row.id,
    slug: extractSlugFromDescription(row.description) ?? slugifyTitle(row.title || `event-${row.id}`),
    title: row.title,
    description: row.description,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
    date: startDate ? startDate.toISOString() : null,
    time: row.time_text || (startDate && endDate ? formatTimeRange(startDate, endDate) : null),
    location: row.location,
    attendees: row.attendees,
    eventFee: row.event_fee,
    accommodationFee: row.accommodation_fee,
    accommodationAccess:
      row.accommodation_access === "chandigarh-university-only" || row.accommodation_access === "open-to-all"
        ? row.accommodation_access
        : "open-to-all",
    category: row.category,
    image: row.image_url,
    sponsors,
    communityPartners,
    sponsorTitle: row.sponsor_title,
    sponsorLogoUrl: row.sponsor_logo_url,
    sponsorLogoLightUrl,
    sponsorLogoDarkUrl,
    devfolioApplyLogoLightUrl: row.devfolio_apply_logo_light_url,
    devfolioApplyLogoDarkUrl: row.devfolio_apply_logo_dark_url,
    isPublished: row.is_published,
    registrationUrl: isRegistrationOpen ? row.registration_url : null,
    registrationLink: isRegistrationOpen ? row.registration_url : null,
    isRegistrationOpen,
  };
}

async function getEventSponsors(eventId: number): Promise<Sponsor[]> {
  try {
    const sponsors = await prisma.$queryRawUnsafe<Sponsor[]>(
      `SELECT id, event_id as "eventId", title, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", devfolio_apply_logo_light_url as "devfolioApplyLogoLightUrl", devfolio_apply_logo_dark_url as "devfolioApplyLogoDarkUrl", instagram_url as "instagramUrl", linkedin_url as "linkedinUrl"
       FROM event_sponsors
       WHERE event_id = $1
       ORDER BY created_at ASC;`,
      eventId
    );
    return sponsors;
  } catch (error) {
    console.error("Failed to fetch sponsors for event", eventId, error);
    return [];
  }
}

async function getEventCommunityPartners(eventId: number): Promise<CommunityPartner[]> {
  try {
    const partners = await prisma.$queryRawUnsafe<CommunityPartnerRow[]>(
      `SELECT id, event_id as "eventId", name, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", instagram_url as "instagramUrl", linkedin_url as "linkedinUrl"
       FROM event_community_partners
       WHERE event_id = $1
       ORDER BY created_at ASC;`,
      eventId
    );
    return partners;
  } catch (error) {
    console.error("Failed to fetch community partners for event", eventId, error);
    return [];
  }
}

export async function listPublicEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
     WHERE is_published = TRUE
      ORDER BY COALESCE(start_at, event_date) ASC, id DESC;`
  );

  return Promise.all(rows.map(async (row) => {
    const sponsors = await getEventSponsors(row.id);
    const communityPartners = await getEventCommunityPartners(row.id);
    return rowToEvent(row, sponsors, communityPartners);
  }));
}

export async function getPublicEventById(id: number): Promise<ClubEvent | null> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
     WHERE id = $1
       AND is_published = TRUE
     LIMIT 1;`,
    id
  );

  if (!rows.length) return null;
  const sponsors = await getEventSponsors(rows[0].id);
  const communityPartners = await getEventCommunityPartners(rows[0].id);
  return rowToEvent(rows[0], sponsors, communityPartners);
}

export async function listAdminEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
      ORDER BY COALESCE(start_at, event_date) DESC, id DESC;`
  );

  return Promise.all(rows.map(async (row) => {
    const sponsors = await getEventSponsors(row.id);
    const communityPartners = await getEventCommunityPartners(row.id);
    return rowToEvent(row, sponsors, communityPartners);
  }));
}

export async function countActiveEvents(): Promise<number> {
  await ensureEventsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count
     FROM events
     WHERE is_published = TRUE
       AND end_at >= NOW();`
  );

  return Number(rows[0]?.count ?? 0);
}

export type CreateSponsorInput = Omit<Sponsor, "id" | "eventId">;
export type CreateCommunityPartnerInput = Omit<CommunityPartner, "id" | "eventId">;

export type CreateEventInput = Omit<ClubEvent, "id" | "slug" | "date" | "time" | "sponsors" | "communityPartners" | "isRegistrationOpen" | "registrationLink"> & {
  slug?: string | null;
  date?: string;
  time?: string;
  sponsors?: CreateSponsorInput[];
  communityPartners?: CreateCommunityPartnerInput[];
};

export async function createEvent(input: CreateEventInput): Promise<ClubEvent> {
  await ensureEventsTable();

  const startDate = input.startDate || input.date ? new Date(input.startDate || input.date || "") : null;
  const endDate = input.endDate || input.date ? new Date(input.endDate || input.date || "") : null;
  const fallbackDate = new Date();
  const safeStartDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const safeEndDate = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;
  const eventDate = safeStartDate ?? safeEndDate ?? fallbackDate;
  const timeText =
    input.time ||
    (safeStartDate && safeEndDate ? formatTimeRange(safeStartDate, safeEndDate) : null);
  const normalizedEventFee =
    typeof input.eventFee === "number" && Number.isFinite(input.eventFee)
      ? input.eventFee
      : null;
  const normalizedAccommodationFee =
    typeof input.accommodationFee === "number" && Number.isFinite(input.accommodationFee)
      ? input.accommodationFee
      : null;
  const normalizedAccommodationAccess =
    input.accommodationAccess === "chandigarh-university-only"
      ? "chandigarh-university-only"
      : "open-to-all";

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `INSERT INTO events
      (title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url;`,
    input.title,
    input.description,
    safeStartDate,
    safeEndDate,
    eventDate,
    timeText,
    input.location,
    typeof input.attendees === "number" && Number.isFinite(input.attendees) ? input.attendees : null,
    normalizedEventFee,
    normalizedAccommodationFee,
    normalizedAccommodationAccess,
    input.category,
    input.image,
    input.sponsorTitle,
    input.sponsorLogoUrl ?? input.sponsorLogoLightUrl ?? input.sponsorLogoDarkUrl,
    input.sponsorLogoLightUrl ?? input.sponsorLogoUrl,
    input.sponsorLogoDarkUrl ?? input.sponsorLogoLightUrl ?? input.sponsorLogoUrl,
    input.devfolioApplyLogoLightUrl,
    input.devfolioApplyLogoDarkUrl,
    input.isPublished,
    input.registrationUrl
  );

  const event = rowToEvent(rows[0]);

  if (input.sponsors && input.sponsors.length > 0) {
    const sponsors = await Promise.all(
      input.sponsors.map((sponsor) => addSponsor(event.id, sponsor))
    );
    event.sponsors = sponsors.filter((s) => s !== null) as Sponsor[];
  }

  if (input.communityPartners && input.communityPartners.length > 0) {
    const partners = await Promise.all(
      input.communityPartners.map((partner) => addCommunityPartner(event.id, partner))
    );
    event.communityPartners = partners.filter((p) => p !== null) as CommunityPartner[];
  }

  return event;
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateEvent(id: number, input: UpdateEventInput): Promise<ClubEvent | null> {
  await ensureEventsTable();

  const existing = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
     WHERE id = $1;`,
    id
  );

  if (!existing.length) return null;

  const current = rowToEvent(existing[0]);
  const resolvedStartDateValue = input.startDate ?? input.date ?? current.startDate;
  const resolvedEndDateValue = input.endDate ?? current.endDate;
  const startDate = resolvedStartDateValue ? new Date(resolvedStartDateValue) : null;
  const endDate = resolvedEndDateValue ? new Date(resolvedEndDateValue) : null;
  const safeStartDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const safeEndDate = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;
  const currentEventDate = current.date ? new Date(current.date) : null;
  const eventDate = safeStartDate ?? safeEndDate ?? currentEventDate ?? new Date();
  const timeText =
    input.time ?? current.time ?? (safeStartDate && safeEndDate ? formatTimeRange(safeStartDate, safeEndDate) : null);

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `UPDATE events
     SET title = $1,
         description = $2,
         start_at = $3,
         end_at = $4,
         event_date = $5,
         time_text = $6,
         location = $7,
         attendees = $8,
         category = $9,
         image_url = $10,
         sponsor_title = $11,
         sponsor_logo_url = $12,
         sponsor_logo_light_url = $13,
         sponsor_logo_dark_url = $14,
         devfolio_apply_logo_light_url = $15,
         devfolio_apply_logo_dark_url = $16,
         is_published = $17,
         registration_url = $18,
         event_fee = $19,
         accommodation_fee = $20,
         accommodation_access = $21,
         updated_at = NOW()
       WHERE id = $22
       RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, event_fee, accommodation_fee, accommodation_access, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url;`,
    input.title ?? current.title,
    input.description ?? current.description,
    safeStartDate,
    safeEndDate,
    eventDate,
    timeText,
    input.location ?? current.location,
    typeof input.attendees === "number" && Number.isFinite(input.attendees)
      ? input.attendees
      : input.attendees === null
        ? null
        : current.attendees,
    input.category ?? current.category,
    input.image ?? current.image,
    input.sponsorTitle ?? current.sponsorTitle,
    input.sponsorLogoUrl ?? current.sponsorLogoUrl,
    input.sponsorLogoLightUrl ?? current.sponsorLogoLightUrl,
    input.sponsorLogoDarkUrl ?? current.sponsorLogoDarkUrl,
    input.devfolioApplyLogoLightUrl ?? current.devfolioApplyLogoLightUrl,
    input.devfolioApplyLogoDarkUrl ?? current.devfolioApplyLogoDarkUrl,
    input.isPublished ?? current.isPublished,
    input.registrationUrl ?? current.registrationUrl,
    typeof input.eventFee === "number" && Number.isFinite(input.eventFee)
      ? input.eventFee
      : input.eventFee === null
        ? null
        : current.eventFee,
    typeof input.accommodationFee === "number" && Number.isFinite(input.accommodationFee)
      ? input.accommodationFee
      : input.accommodationFee === null
        ? null
        : current.accommodationFee,
    input.accommodationAccess === "chandigarh-university-only" || input.accommodationAccess === "open-to-all"
      ? input.accommodationAccess
      : current.accommodationAccess,
    id
  );

  const event = rowToEvent(rows[0]);

  if (input.sponsors !== undefined) {
    await deleteEventSponsors(id);
    if (input.sponsors.length > 0) {
      const sponsors = await Promise.all(
        input.sponsors.map((sponsor) => addSponsor(id, sponsor))
      );
      event.sponsors = sponsors.filter((s) => s !== null) as Sponsor[];
    }
  } else {
    event.sponsors = await getEventSponsors(id);
  }

  if (input.communityPartners !== undefined) {
    await deleteEventCommunityPartners(id);
    if (input.communityPartners.length > 0) {
      const partners = await Promise.all(
        input.communityPartners.map((partner) => addCommunityPartner(id, partner))
      );
      event.communityPartners = partners.filter((p) => p !== null) as CommunityPartner[];
    }
  } else {
    event.communityPartners = await getEventCommunityPartners(id);
  }

  return event;
}

export async function deleteEvent(id: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM events WHERE id = $1;`, id);
  return result > 0;
}

export async function addSponsor(eventId: number, sponsor: CreateSponsorInput): Promise<Sponsor | null> {
  await ensureEventsTable();

  const rows = await prisma.$queryRawUnsafe<Sponsor[]>(
    `INSERT INTO event_sponsors (event_id, title, logo_url, logo_light_url, logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, instagram_url, linkedin_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, event_id as "eventId", title, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", devfolio_apply_logo_light_url as "devfolioApplyLogoLightUrl", devfolio_apply_logo_dark_url as "devfolioApplyLogoDarkUrl", instagram_url as "instagramUrl", linkedin_url as "linkedinUrl";`,
    eventId,
    sponsor.title,
    sponsor.logoUrl,
    sponsor.logoLightUrl,
    sponsor.logoDarkUrl,
    sponsor.devfolioApplyLogoLightUrl,
    sponsor.devfolioApplyLogoDarkUrl,
    sponsor.instagramUrl,
    sponsor.linkedinUrl
  );

  return rows.length ? rows[0] : null;
}

export async function deleteSponsor(sponsorId: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM event_sponsors WHERE id = $1;`, sponsorId);
  return result > 0;
}

export async function deleteEventSponsors(eventId: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM event_sponsors WHERE event_id = $1;`, eventId);
  return result > 0;
}

export async function addCommunityPartner(
  eventId: number,
  partner: CreateCommunityPartnerInput
): Promise<CommunityPartner | null> {
  await ensureEventsTable();

  const rows = await prisma.$queryRawUnsafe<CommunityPartnerRow[]>(
    `INSERT INTO event_community_partners (event_id, name, logo_url, logo_light_url, logo_dark_url, instagram_url, linkedin_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, event_id as "eventId", name, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", instagram_url as "instagramUrl", linkedin_url as "linkedinUrl";`,
    eventId,
    partner.name,
    partner.logoUrl,
    partner.logoLightUrl,
    partner.logoDarkUrl,
    partner.instagramUrl,
    partner.linkedinUrl
  );

  return rows.length ? rows[0] : null;
}

export async function deleteCommunityPartner(partnerId: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM event_community_partners WHERE id = $1;`, partnerId);
  return result > 0;
}

export async function deleteEventCommunityPartners(eventId: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM event_community_partners WHERE event_id = $1;`, eventId);
  return result > 0;
}
