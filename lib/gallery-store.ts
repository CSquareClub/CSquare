import prisma from "@/lib/db";

export type GalleryItem = {
  id: number;
  title: string;
  eventName: string;
  imageUrl: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
};

type GalleryRow = {
  id: number;
  title: string;
  event_name: string;
  image_url: string;
  description: string;
  is_published: boolean;
  created_at: Date | string;
};

export type CreateGalleryItemInput = {
  title: string;
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
      event_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  tableReady = true;
}

function rowToGalleryItem(row: GalleryRow): GalleryItem {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    title: row.title,
    eventName: row.event_name,
    imageUrl: row.image_url,
    description: row.description,
    isPublished: row.is_published,
    createdAt: createdAt.toISOString(),
  };
}

export async function listPublicGalleryItems(): Promise<GalleryItem[]> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `SELECT id, title, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     WHERE is_published = TRUE
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToGalleryItem);
}

export async function listAdminGalleryItems(): Promise<GalleryItem[]> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `SELECT id, title, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToGalleryItem);
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  await ensureGalleryTable();

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `INSERT INTO event_gallery (title, event_name, image_url, description, is_published)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, event_name, image_url, description, is_published, created_at;`,
    input.title,
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
    `SELECT id, title, event_name, image_url, description, is_published, created_at
     FROM event_gallery
     WHERE id = $1;`,
    id
  );

  if (!existingRows.length) return null;

  const current = rowToGalleryItem(existingRows[0]);

  const rows = await prisma.$queryRawUnsafe<GalleryRow[]>(
    `UPDATE event_gallery
     SET title = $1,
         event_name = $2,
         image_url = $3,
         description = $4,
         is_published = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, title, event_name, image_url, description, is_published, created_at;`,
    input.title ?? current.title,
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
