import prisma from "@/lib/db";

export type Sponsor = {
  id: number;
  eventId: number;
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
};

export type ClubEvent = {
  id: number;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  attendees: number | null;
  category: string | null;
  image: string | null;
  sponsors: Sponsor[];
  sponsorTitle: string | null; // Legacy single sponsor
  sponsorLogoUrl: string | null; // Legacy single sponsor
  sponsorLogoLightUrl: string | null; // Legacy single sponsor
  sponsorLogoDarkUrl: string | null; // Legacy single sponsor
  devfolioApplyLogoLightUrl: string | null; // Legacy single sponsor
  devfolioApplyLogoDarkUrl: string | null; // Legacy single sponsor
  isPublished: boolean;
  registrationUrl: string | null;
  isRegistrationOpen: boolean; // True if event hasn't ended
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

let tableReady = false;

async function ensureEventsTable() {
  if (tableReady) return;

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

  // Create sponsors table for multiple sponsors per event
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add index for faster queries
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_event_sponsors_event_id ON event_sponsors(event_id);
  `);

  // Add start/end timestamps for older deployments that already have the events table.
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_title TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_light_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_dark_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS devfolio_apply_logo_light_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS devfolio_apply_logo_dark_url TEXT;`);
  await prisma.$executeRawUnsafe(`UPDATE events SET start_at = event_date WHERE start_at IS NULL;`);
  await prisma.$executeRawUnsafe(`UPDATE events SET end_at = event_date WHERE end_at IS NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN title DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN description DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN start_at DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN end_at DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN time_text DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN location DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN category DROP NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN image_url DROP NOT NULL;`);

  tableReady = true;
}

function formatTimeRange(startDate: Date, endDate: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function rowToEvent(row: EventRow, sponsors: Sponsor[] = []): ClubEvent {
  const legacyDate = row.event_date ? (row.event_date instanceof Date ? row.event_date : new Date(row.event_date)) : null;
  const startDateRaw = row.start_at ?? legacyDate;
  const endDateRaw = row.end_at ?? startDateRaw;
  const startDate = startDateRaw ? (startDateRaw instanceof Date ? startDateRaw : new Date(startDateRaw)) : null;
  const endDate = endDateRaw ? (endDateRaw instanceof Date ? endDateRaw : new Date(endDateRaw)) : null;
  const sponsorLogoLightUrl = row.sponsor_logo_light_url ?? row.sponsor_logo_url;
  const sponsorLogoDarkUrl = row.sponsor_logo_dark_url ?? sponsorLogoLightUrl;
  
  // Check if registration should be open (event hasn't ended yet)
  const isRegistrationOpen = !endDate || endDate > new Date();

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
    date: startDate ? startDate.toISOString() : null,
    time: row.time_text || (startDate && endDate ? formatTimeRange(startDate, endDate) : null),
    location: row.location,
    attendees: row.attendees,
    category: row.category,
    image: row.image_url,
    sponsors,
    sponsorTitle: row.sponsor_title,
    sponsorLogoUrl: row.sponsor_logo_url,
    sponsorLogoLightUrl,
    sponsorLogoDarkUrl,
    devfolioApplyLogoLightUrl: row.devfolio_apply_logo_light_url,
    devfolioApplyLogoDarkUrl: row.devfolio_apply_logo_dark_url,
    isPublished: row.is_published,
    registrationUrl: isRegistrationOpen ? row.registration_url : null,
    isRegistrationOpen,
  };
}

async function getEventSponsors(eventId: number): Promise<Sponsor[]> {
  try {
    const sponsors = await prisma.$queryRawUnsafe<Sponsor[]>(
      `SELECT id, event_id as "eventId", title, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", devfolio_apply_logo_light_url as "devfolioApplyLogoLightUrl", devfolio_apply_logo_dark_url as "devfolioApplyLogoDarkUrl"
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

export async function listPublicEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
     WHERE is_published = TRUE
      ORDER BY COALESCE(start_at, event_date) ASC, id DESC;`
  );

  return Promise.all(rows.map(async (row) => {
    const sponsors = await getEventSponsors(row.id);
    return rowToEvent(row, sponsors);
  }));
}

export async function getPublicEventById(id: number): Promise<ClubEvent | null> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
     WHERE id = $1
       AND is_published = TRUE
     LIMIT 1;`,
    id
  );

  if (!rows.length) return null;
  const sponsors = await getEventSponsors(rows[0].id);
  return rowToEvent(rows[0], sponsors);
}

export async function listAdminEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
     FROM events
      ORDER BY COALESCE(start_at, event_date) DESC, id DESC;`
  );

  return Promise.all(rows.map(async (row) => {
    const sponsors = await getEventSponsors(row.id);
    return rowToEvent(row, sponsors);
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

export type CreateEventInput = Omit<ClubEvent, "id" | "date" | "time" | "sponsors" | "isRegistrationOpen"> & {
  date?: string;
  time?: string;
  sponsors?: CreateSponsorInput[];
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

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `INSERT INTO events
      (title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url;`,
    input.title,
    input.description,
    safeStartDate,
    safeEndDate,
    eventDate,
    timeText,
    input.location,
    typeof input.attendees === "number" && Number.isFinite(input.attendees) ? input.attendees : null,
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

  // Add multiple sponsors if provided
  if (input.sponsors && input.sponsors.length > 0) {
    const sponsors = await Promise.all(
      input.sponsors.map((sponsor) => addSponsor(event.id, sponsor))
    );
    event.sponsors = sponsors.filter((s) => s !== null) as Sponsor[];
  }

  return event;
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateEvent(id: number, input: UpdateEventInput): Promise<ClubEvent | null> {
  await ensureEventsTable();

  const existing = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url
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
         updated_at = NOW()
       WHERE id = $19
       RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url, is_published, registration_url;`,
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
    id
  );

  const event = rowToEvent(rows[0]);

  // Handle sponsors if provided
  if (input.sponsors !== undefined) {
    await deleteEventSponsors(id);
    if (input.sponsors.length > 0) {
      const sponsors = await Promise.all(
        input.sponsors.map((sponsor) => addSponsor(id, sponsor))
      );
      event.sponsors = sponsors.filter((s) => s !== null) as Sponsor[];
    }
  } else {
    // Fetch existing sponsors if not updating them
    event.sponsors = await getEventSponsors(id);
  }

  return event;
}

export async function deleteEvent(id: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM events WHERE id = $1;`, id);
  return result > 0;
}

export type CreateSponsorInput = Omit<Sponsor, "id">;

export async function addSponsor(eventId: number, sponsor: CreateSponsorInput): Promise<Sponsor | null> {
  await ensureEventsTable();
  
  const rows = await prisma.$queryRawUnsafe<Sponsor[]>(
    `INSERT INTO event_sponsors (event_id, title, logo_url, logo_light_url, logo_dark_url, devfolio_apply_logo_light_url, devfolio_apply_logo_dark_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, event_id as "eventId", title, logo_url as "logoUrl", logo_light_url as "logoLightUrl", logo_dark_url as "logoDarkUrl", devfolio_apply_logo_light_url as "devfolioApplyLogoLightUrl", devfolio_apply_logo_dark_url as "devfolioApplyLogoDarkUrl";`,
    eventId,
    sponsor.title,
    sponsor.logoUrl,
    sponsor.logoLightUrl,
    sponsor.logoDarkUrl,
    sponsor.devfolioApplyLogoLightUrl,
    sponsor.devfolioApplyLogoDarkUrl
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
