import prisma, { isDatabaseConfigured } from "@/lib/db";

export type GalleryItem = {
  id: number;
  title: string;
  eventId: number | null;
  eventName: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
};

type GalleryRow = {
  id: number;
  title: string;
  event_id: number | null;
  event_name: string;
  image_url: string;
  description: string;
  is_published: boolean;
  created_at: Date | string;
};

export type CreateGalleryItemInput = {
  title: string;
  eventId?: number | null;
  eventName: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
};

export type UpdateGalleryItemInput = Partial<CreateGalleryItemInput>;

let tableReady = false;

async function ensureGalleryTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS event_gallery (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
      event_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add event_id column if missing
  await prisma.$executeRawUnsafe(`
    ALTER TABLE event_gallery ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id) ON DELETE SET NULL;
  `);

  // Create index on event_id for faster queries
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_event_gallery_event_id ON event_gallery(event_id);
  `);

  tableReady = true;
}

function rowToGalleryItem(row: GalleryRow): GalleryItem {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    title: row.title,
    eventId: row.event_id,
    eventName: row.event_name,
    imageUrl: row.image_url,
    description: row.description,
    isPublished: row.is_published,
    createdAt: createdAt.toISOString(),
  };
}

export async function listPublicGalleryItems(): Promise<GalleryItem[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    await ensureGalleryTable();

    const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
      `SELECT id, title, event_id, event_name, image_url, description, is_published, created_at
       FROM event_gallery
       WHERE is_published = TRUE
       ORDER BY created_at DESC;`
    );

    return rows.map(rowToGalleryItem);
  } catch (error) {
    console.error("Failed to fetch public gallery items", error);
    return [];
  }
}

export async function listAdminGalleryItems(): Promise<GalleryItem[]> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `SELECT id, title, event_id, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToGalleryItem);
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `INSERT INTO event_gallery (title, event_id, event_name, image_url, description, is_published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, event_id, event_name, image_url, description, is_published, created_at;`,
    input.title,
    input.eventId || null,
    input.eventName,
    input.imageUrl,
    input.description,
    input.isPublished
  );

  return rowToGalleryItem(rows[0]);
}

export async function updateGalleryItem(id: number, input: UpdateGalleryItemInput): Promise<GalleryItem | null> {
  await ensureGalleryTable();

  const existingRows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `SELECT id, title, event_id, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     WHERE id = $1;`,
    id
  );

  if (!existingRows.length) return null;

  const current = rowToGalleryItem(existingRows[0]);

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `UPDATE event_gallery
     SET title = $1,
         event_id = $2,
         event_name = $3,
         image_url = $4,
         description = $5,
         is_published = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, title, event_id, event_name, image_url, description, is_published, created_at;`,
    input.title ?? current.title,
    input.eventId !== undefined ? (input.eventId || null) : current.eventId,
    input.eventName ?? current.eventName,
    input.imageUrl ?? current.imageUrl,
    input.description ?? current.description,
    input.isPublished ?? current.isPublished,
    id
  );

  return rowToGalleryItem(rows[0]);
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  await ensureGalleryTable();

  const result = await prisma.$executeRawUnsafe(`DELETE FROM event_gallery WHERE id = $1;`, id);
  return result > 0;
}

export async function listGalleryItemsByEventId(eventId: number): Promise<GalleryItem[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    await ensureGalleryTable();

    const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
      `SELECT id, title, event_id, event_name, image_url, description, is_published, created_at
       FROM event_gallery
       WHERE event_id = $1 AND is_published = TRUE
       ORDER BY created_at DESC;`,
      eventId
    );

    return rows.map(rowToGalleryItem);
  } catch (error) {
    console.error("Failed to fetch gallery items for event", eventId, error);
    return [];
  }
}

export async function listAdminGalleryItemsByEventId(eventId: number): Promise<GalleryItem[]> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `SELECT id, title, event_id, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     WHERE event_id = $1
     ORDER BY created_at DESC;`,
    eventId
  );

  return rows.map(rowToGalleryItem);
}
