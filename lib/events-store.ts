import prisma from "@/lib/db";

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
  sponsorTitle: string | null;
  sponsorLogoUrl: string | null;
  sponsorLogoLightUrl: string | null;
  sponsorLogoDarkUrl: string | null;
  isPublished: boolean;
  registrationUrl: string | null;
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
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      registration_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add start/end timestamps for older deployments that already have the events table.
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_title TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_light_url TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_dark_url TEXT;`);
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

function rowToEvent(row: EventRow): ClubEvent {
  const legacyDate = row.event_date ? (row.event_date instanceof Date ? row.event_date : new Date(row.event_date)) : null;
  const startDateRaw = row.start_at ?? legacyDate;
  const endDateRaw = row.end_at ?? startDateRaw;
  const startDate = startDateRaw ? (startDateRaw instanceof Date ? startDateRaw : new Date(startDateRaw)) : null;
  const endDate = endDateRaw ? (endDateRaw instanceof Date ? endDateRaw : new Date(endDateRaw)) : null;
  const sponsorLogoLightUrl = row.sponsor_logo_light_url ?? row.sponsor_logo_url;
  const sponsorLogoDarkUrl = row.sponsor_logo_dark_url ?? sponsorLogoLightUrl;

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
    sponsorTitle: row.sponsor_title,
    sponsorLogoUrl: row.sponsor_logo_url,
    sponsorLogoLightUrl,
    sponsorLogoDarkUrl,
    isPublished: row.is_published,
    registrationUrl: row.registration_url,
  };
}

export async function listPublicEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url
     FROM events
     WHERE is_published = TRUE
      ORDER BY COALESCE(start_at, event_date) ASC, id DESC;`
  );

  return rows.map(rowToEvent);
}

export async function getPublicEventById(id: number): Promise<ClubEvent | null> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url
     FROM events
     WHERE id = $1
       AND is_published = TRUE
     LIMIT 1;`,
    id
  );

  if (!rows.length) return null;
  return rowToEvent(rows[0]);
}

export async function listAdminEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url
     FROM events
      ORDER BY COALESCE(start_at, event_date) DESC, id DESC;`
  );

  return rows.map(rowToEvent);
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

export type CreateEventInput = Omit<ClubEvent, "id" | "date" | "time"> & {
  date?: string;
  time?: string;
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
      (title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url;`,
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
    input.isPublished,
    input.registrationUrl
  );

  return rowToEvent(rows[0]);
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateEvent(id: number, input: UpdateEventInput): Promise<ClubEvent | null> {
  await ensureEventsTable();

  const existing = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url
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
         is_published = $15,
         registration_url = $16,
         updated_at = NOW()
       WHERE id = $17
       RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_title, sponsor_logo_url, sponsor_logo_light_url, sponsor_logo_dark_url, is_published, registration_url;`,
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
    input.isPublished ?? current.isPublished,
    input.registrationUrl ?? current.registrationUrl,
    id
  );

  return rowToEvent(rows[0]);
}

export async function deleteEvent(id: number): Promise<boolean> {
  await ensureEventsTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM events WHERE id = $1;`, id);
  return result > 0;
}
