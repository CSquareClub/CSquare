import prisma from "@/lib/db";

/* --- Types --- */

export type StallRegistration = {
  id: number;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  stallCategory: string;
  isPremium: boolean;
  stallName: string;
  stallDescription: string;
  members: StallMember[];
};

export type StallMember = {
  name: string;
  email: string;
  phone: string;
};

type StallRow = {
  id: number;
  created_at: Date | string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  stall_category: string;
  is_premium: boolean;
  stall_name: string;
  stall_description: string;
  members_json: string;
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS algolympia_stall_registrations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      college TEXT NOT NULL DEFAULT '',
      stall_category TEXT NOT NULL DEFAULT 'unknown',
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      stall_name TEXT NOT NULL,
      stall_description TEXT NOT NULL DEFAULT '',
      members_json TEXT NOT NULL DEFAULT '[]'
    );
  `);

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_stall_registrations ADD COLUMN IF NOT EXISTS stall_category TEXT NOT NULL DEFAULT 'unknown';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_stall_registrations ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;`);
  } catch (e) {
    console.error("Failed to alter algolympia_stall_registrations table:", e);
  }

  tableReady = true;
}

function rowToRegistration(row: StallRow): StallRegistration {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);
  let members: StallMember[] = [];
  try {
    members = JSON.parse(row.members_json || "[]");
  } catch {
    members = [];
  }

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    college: row.college,
    stallCategory: row.stall_category,
    isPremium: row.is_premium,
    stallName: row.stall_name,
    stallDescription: row.stall_description,
    members,
  };
}

export type CreateStallRegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  stallCategory: string;
  isPremium: boolean;
  stallName: string;
  stallDescription: string;
  members: StallMember[];
};

export async function createStallRegistration(
  input: CreateStallRegistrationInput
): Promise<StallRegistration> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<StallRow[]>(
    `INSERT INTO algolympia_stall_registrations
      (full_name, email, phone, college, stall_category, is_premium, stall_name, stall_description, members_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *;`,
    input.fullName,
    input.email,
    input.phone,
    input.college,
    input.stallCategory,
    input.isPremium,
    input.stallName,
    input.stallDescription,
    JSON.stringify(input.members),
  );

  return rowToRegistration(rows[0]);
}

export async function checkDuplicateStallEmail(email: string): Promise<boolean> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM algolympia_stall_registrations
      WHERE LOWER(email) = LOWER($1)
    ) AS exists;`,
    email.trim()
  );

  return rows[0]?.exists ?? false;
}

export async function listStallRegistrations(): Promise<StallRegistration[]> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<StallRow[]>(
    `SELECT * FROM algolympia_stall_registrations ORDER BY created_at ASC;`
  );

  return rows.map(rowToRegistration);
}
