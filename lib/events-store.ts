import prisma from "@/lib/db";

export type ClubEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  image: string;
  isPublished: boolean;
  registrationUrl: string | null;
};

type EventRow = {
  id: number;
  title: string;
  description: string;
  event_date: Date | string;
  time_text: string;
  location: string;
  attendees: number;
  category: string;
  image_url: string;
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
      event_date TIMESTAMPTZ NOT NULL,
      time_text TEXT NOT NULL,
      location TEXT NOT NULL,
      attendees INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      registration_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  tableReady = true;
}

function rowToEvent(row: EventRow): ClubEvent {
  const eventDate = row.event_date instanceof Date ? row.event_date : new Date(row.event_date);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: eventDate.toISOString(),
    time: row.time_text,
    location: row.location,
    attendees: row.attendees,
    category: row.category,
    image: row.image_url,
    isPublished: row.is_published,
    registrationUrl: row.registration_url,
  };
}

export async function listPublicEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url
     FROM events
     WHERE is_published = TRUE
     ORDER BY event_date ASC;`
  );

  return rows.map(rowToEvent);
}

export async function listAdminEvents(): Promise<ClubEvent[]> {
  await ensureEventsTable();
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url
     FROM events
     ORDER BY event_date DESC;`
  );

  return rows.map(rowToEvent);
}

export type CreateEventInput = Omit<ClubEvent, "id" | "date"> & { date: string };

export async function createEvent(input: CreateEventInput): Promise<ClubEvent> {
  await ensureEventsTable();

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `INSERT INTO events
      (title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url;`,
    input.title,
    input.description,
    new Date(input.date),
    input.time,
    input.location,
    input.attendees,
    input.category,
    input.image,
    input.isPublished,
    input.registrationUrl
  );

  return rowToEvent(rows[0]);
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateEvent(id: number, input: UpdateEventInput): Promise<ClubEvent | null> {
  await ensureEventsTable();

  const existing = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT id, title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url
     FROM events
     WHERE id = $1;`,
    id
  );

  if (!existing.length) return null;

  const current = rowToEvent(existing[0]);

  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `UPDATE events
     SET title = $1,
         description = $2,
         event_date = $3,
         time_text = $4,
         location = $5,
         attendees = $6,
         category = $7,
         image_url = $8,
         is_published = $9,
         registration_url = $10,
         updated_at = NOW()
     WHERE id = $11
     RETURNING id, title, description, event_date, time_text, location, attendees, category, image_url, is_published, registration_url;`,
    input.title ?? current.title,
    input.description ?? current.description,
    new Date(input.date ?? current.date),
    input.time ?? current.time,
    input.location ?? current.location,
    input.attendees ?? current.attendees,
    input.category ?? current.category,
    input.image ?? current.image,
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
