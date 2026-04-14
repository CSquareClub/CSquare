import prisma from "@/lib/db";
import { randomBytes } from "crypto";

/* ─── Types ──────────────────────────────────────────────── */

export type AlgolympiaAmbassador = {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  referralCode: string;
  source: "direct" | "team_leader";
  registrationId: number | null;
  referralCount: number;
};

type AmbassadorRow = {
  id: number;
  created_at: Date | string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  referral_code: string;
  source: string;
  registration_id: number | null;
  referral_count: number;
};

/* ─── Table bootstrap ────────────────────────────────────── */

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS algolympia_ambassadors (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      college TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL DEFAULT '',
      year TEXT NOT NULL DEFAULT '',
      referral_code TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'direct',
      registration_id INTEGER,
      referral_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  tableReady = true;
}

/* ─── Helpers ────────────────────────────────────────────── */

function rowToAmbassador(row: AmbassadorRow): AlgolympiaAmbassador {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : new Date(row.created_at);
  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    name: row.name,
    email: row.email,
    phone: row.phone,
    college: row.college,
    department: row.department || "",
    year: row.year || "",
    referralCode: row.referral_code,
    source: row.source as "direct" | "team_leader",
    registrationId: row.registration_id,
    referralCount: row.referral_count,
  };
}

/**
 * Generate a referral code like ALGO-K7M2P
 * If collision happens, retry up to 5 times.
 */
export function generateReferralCode(): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return `ALGO-${suffix}`;
}

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    const existing = await prisma.$queryRawUnsafe<AmbassadorRow[]>(
      `SELECT id FROM algolympia_ambassadors WHERE referral_code = $1 LIMIT 1;`,
      code
    );
    if (existing.length === 0) return code;
  }
  // Fallback: use timestamp-based suffix
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  return `ALGO-${ts}`;
}

/* ─── CRUD ───────────────────────────────────────────────── */

export type CreateAmbassadorInput = {
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  year?: string;
  source: "direct" | "team_leader";
  registrationId?: number | null;
};

export async function createAmbassador(
  input: CreateAmbassadorInput
): Promise<AlgolympiaAmbassador> {
  await ensureTable();

  const referralCode = await generateUniqueReferralCode();

  const rows = await prisma.$queryRawUnsafe<AmbassadorRow[]>(
    `INSERT INTO algolympia_ambassadors
       (name, email, phone, college, department, year, referral_code, source, registration_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *;`,
    input.name.trim(),
    input.email.trim().toLowerCase(),
    input.phone.trim(),
    input.college.trim(),
    input.department?.trim() || "",
    input.year?.trim() || "",
    referralCode,
    input.source,
    input.registrationId ?? null
  );

  return rowToAmbassador(rows[0]);
}

export async function getAmbassadorByEmail(
  email: string
): Promise<AlgolympiaAmbassador | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<AmbassadorRow[]>(
    `SELECT * FROM algolympia_ambassadors WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    email.trim()
  );

  if (!rows.length) return null;
  return rowToAmbassador(rows[0]);
}

export async function getAmbassadorByReferralCode(
  code: string
): Promise<AlgolympiaAmbassador | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<AmbassadorRow[]>(
    `SELECT * FROM algolympia_ambassadors WHERE UPPER(referral_code) = UPPER($1) LIMIT 1;`,
    code.trim()
  );

  if (!rows.length) return null;
  return rowToAmbassador(rows[0]);
}

export async function incrementReferralCount(
  referralCode: string
): Promise<void> {
  await ensureTable();

  await prisma.$executeRawUnsafe(
    `UPDATE algolympia_ambassadors SET referral_count = referral_count + 1 WHERE UPPER(referral_code) = UPPER($1);`,
    referralCode.trim()
  );
}

export async function listAmbassadors(): Promise<AlgolympiaAmbassador[]> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<AmbassadorRow[]>(
    `SELECT * FROM algolympia_ambassadors ORDER BY created_at DESC;`
  );

  return rows.map(rowToAmbassador);
}
