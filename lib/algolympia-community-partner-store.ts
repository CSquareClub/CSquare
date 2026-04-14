import prisma from "@/lib/db";

/* ─── Types ──────────────────────────────────────────────── */

export type AlgolympiaCommunityPartner = {
  id: number;
  createdAt: string;
  spocName: string;
  email: string;
  phone: string;
  communityName: string;
  description: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  expectations: string[];
  deliverables: string[];
};

type CommunityPartnerRow = {
  id: number;
  created_at: Date | string;
  spoc_name: string;
  email: string;
  phone: string;
  community_name: string;
  description: string;
  logo_light_url: string;
  logo_dark_url: string;
  expectations: string; // Stored as JSON string directly, or JSON/JSONB
  deliverables: string;
};

/* ─── Table bootstrap ────────────────────────────────────── */

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS algolympia_community_partners (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      spoc_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      community_name TEXT NOT NULL,
      description TEXT NOT NULL,
      logo_light_url TEXT NOT NULL,
      logo_dark_url TEXT NOT NULL,
      expectations TEXT NOT NULL,
      deliverables TEXT NOT NULL
    );
  `);

  tableReady = true;
}

/* ─── Helpers ────────────────────────────────────────────── */

function rowToPartner(row: CommunityPartnerRow): AlgolympiaCommunityPartner {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    spocName: row.spoc_name,
    email: row.email,
    phone: row.phone,
    communityName: row.community_name,
    description: row.description,
    logoLightUrl: row.logo_light_url,
    logoDarkUrl: row.logo_dark_url,
    expectations: JSON.parse(row.expectations || "[]"),
    deliverables: JSON.parse(row.deliverables || "[]"),
  };
}

/* ─── CRUD ───────────────────────────────────────────────── */

export type CreatePartnerInput = {
  spocName: string;
  email: string;
  phone: string;
  communityName: string;
  description: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  expectations: string[];
  deliverables: string[];
};

export async function createCommunityPartner(
  input: CreatePartnerInput
): Promise<AlgolympiaCommunityPartner> {
  await ensureTable();

  const expJson = JSON.stringify(input.expectations || []);
  const delJson = JSON.stringify(input.deliverables || []);

  const rows = await prisma.$queryRawUnsafe<CommunityPartnerRow[]>(
    `INSERT INTO algolympia_community_partners
       (spoc_name, email, phone, community_name, description, logo_light_url, logo_dark_url, expectations, deliverables)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *;`,
    input.spocName.trim(),
    input.email.trim().toLowerCase(),
    input.phone.trim(),
    input.communityName.trim(),
    input.description.trim(),
    input.logoLightUrl.trim(),
    input.logoDarkUrl.trim(),
    expJson,
    delJson
  );

  return rowToPartner(rows[0]);
}

export async function getPartnerByEmail(
  email: string
): Promise<AlgolympiaCommunityPartner | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<CommunityPartnerRow[]>(
    `SELECT * FROM algolympia_community_partners WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    email.trim()
  );

  if (!rows.length) return null;
  return rowToPartner(rows[0]);
}

export async function listCommunityPartners(): Promise<AlgolympiaCommunityPartner[]> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<CommunityPartnerRow[]>(
    `SELECT * FROM algolympia_community_partners ORDER BY created_at DESC;`
  );

  return rows.map(rowToPartner);
}
