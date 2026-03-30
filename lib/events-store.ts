import prisma from "@/lib/db";

export type ClubEvent = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  image: string;
  sponsorLogoUrl: string | null;
  isPublished: boolean;
  registrationUrl: string | null;
};

type EventRow = {
  id: number;
  title: string;
  description: string;
  start_at: Date | string | null;
  end_at: Date | string | null;
  event_date: Date | string;
  time_text: string;
  location: string;
  attendees: number;
  category: string;
  image_url: string;
  sponsor_logo_url: string | null;
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
      sponsor_logo_url TEXT,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      registration_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add start/end timestamps for older deployments that already have the events table.
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;`);
  await prisma.$executeRawUnsafe(`UPDATE events SET start_at = event_date WHERE start_at IS NULL;`);
  await prisma.$executeRawUnsafe(`UPDATE events SET end_at = event_date WHERE end_at IS NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN start_at SET NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE events ALTER COLUMN end_at SET NOT NULL;`);

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
  const legacyDate = row.event_date instanceof Date ? row.event_date : new Date(row.event_date);
  const startDateRaw = row.start_at ?? legacyDate;
  const endDateRaw = row.end_at ?? startDateRaw;
  const startDate = startDateRaw instanceof Date ? startDateRaw : new Date(startDateRaw);
  const endDate = endDateRaw instanceof Date ? endDateRaw : new Date(endDateRaw);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    date: startDate.toISOString(),
    time: row.time_text || formatTimeRange(startDate, endDate),
    location: row.location,
    attendees: row.attendees,
    category: row.category,
    image: row.image_url,
    sponsorLogoUrl: row.sponsor_logo_url,
    isPublished: row.is_published,
    registrationUrl: row.registration_url,
  };
}

export async function listPublicEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url
     FROM events
     WHERE is_published = TRUE
     ORDER BY start_at ASC;`
  );

  return rows.map(rowToEvent);
}

export async function getPublicEventById(id: number): Promise<ClubEvent | null> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url
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
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url
     FROM events
     ORDER BY start_at DESC;`
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

  const startDate = new Date(input.startDate || input.date);
  const endDate = new Date(input.endDate || input.date);
  const timeText = input.time || formatTimeRange(startDate, endDate);

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `INSERT INTO events
      (title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url;`,
    input.title,
    input.description,
    startDate,
    endDate,
    startDate,
    timeText,
    input.location,
    input.attendees,
    input.category,
    input.image,
    input.sponsorLogoUrl,
    input.isPublished,
    input.registrationUrl
  );

  return rowToEvent(rows[0]);
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateEvent(id: number, input: UpdateEventInput): Promise<ClubEvent | null> {
  await ensureEventsTable();

  const existing = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url
     FROM events
     WHERE id = $1;`,
    id
  );

  if (!existing.length) return null;

  const current = rowToEvent(existing[0]);
  const startDate = new Date(input.startDate ?? input.date ?? current.startDate);
  const endDate = new Date(input.endDate ?? current.endDate);
  const timeText = input.time ?? current.time || formatTimeRange(startDate, endDate);

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
         sponsor_logo_url = $11,
         is_published = $12,
         registration_url = $13,
         updated_at = NOW()
       WHERE id = $14
       RETURNING id, title, description, start_at, end_at, event_date, time_text, location, attendees, category, image_url, sponsor_logo_url, is_published, registration_url;`,
    input.title ?? current.title,
    input.description ?? current.description,
    startDate,
    endDate,
    startDate,
    timeText,
    input.location ?? current.location,
    input.attendees ?? current.attendees,
    input.category ?? current.category,
    input.image ?? current.image,
    input.sponsorLogoUrl ?? current.sponsorLogoUrl,
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
