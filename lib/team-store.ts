import prisma from "@/lib/db";

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  about: string;
  linkedin: string | null;
  image: string | null;
  isPublished: boolean;
  sortOrder: number;
};

type TeamRow = {
  id: number;
  name: string;
  role: string;
  about: string;
  linkedin_url: string | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
};

let tableReady = false;

async function ensureTeamTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      about TEXT NOT NULL,
      linkedin_url TEXT,
      image_url TEXT,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  tableReady = true;
}

function rowToMember(row: TeamRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    about: row.about,
    linkedin: row.linkedin_url,
    image: row.image_url,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export async function listPublicTeam(): Promise<TeamMember[]> {
  await ensureTeamTable();

  const rows = await prisma.$queryRawUnsafe<TeamRow[]>(
    `SELECT id, name, role, about, linkedin_url, image_url, is_published, sort_order
     FROM team_members
     WHERE is_published = TRUE
     ORDER BY sort_order ASC, id ASC;`
  );

  return rows.map(rowToMember);
}

export async function listAdminTeam(): Promise<TeamMember[]> {
  await ensureTeamTable();

  const rows = await prisma.$queryRawUnsafe<TeamRow[]>(
    `SELECT id, name, role, about, linkedin_url, image_url, is_published, sort_order
     FROM team_members
     ORDER BY sort_order ASC, id ASC;`
  );

  return rows.map(rowToMember);
}

export type CreateTeamMemberInput = Omit<TeamMember, "id">;

export async function createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
  await ensureTeamTable();

  const rows = await prisma.$queryRawUnsafe<TeamRow[]>(
    `INSERT INTO team_members
      (name, role, about, linkedin_url, image_url, is_published, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, role, about, linkedin_url, image_url, is_published, sort_order;`,
    input.name,
    input.role,
    input.about,
    input.linkedin,
    input.image,
    input.isPublished,
    input.sortOrder
  );

  return rowToMember(rows[0]);
}

export type UpdateTeamMemberInput = Partial<CreateTeamMemberInput>;

export async function updateTeamMember(id: number, input: UpdateTeamMemberInput): Promise<TeamMember | null> {
  await ensureTeamTable();

  const existingRows = await prisma.$queryRawUnsafe<TeamRow[]>(
    `SELECT id, name, role, about, linkedin_url, image_url, is_published, sort_order
     FROM team_members
     WHERE id = $1;`,
    id
  );

  if (!existingRows.length) return null;

  const current = rowToMember(existingRows[0]);

  const rows = await prisma.$queryRawUnsafe<TeamRow[]>(
    `UPDATE team_members
     SET name = $1,
         role = $2,
         about = $3,
         linkedin_url = $4,
         image_url = $5,
         is_published = $6,
         sort_order = $7,
         updated_at = NOW()
     WHERE id = $8
     RETURNING id, name, role, about, linkedin_url, image_url, is_published, sort_order;`,
    input.name ?? current.name,
    input.role ?? current.role,
    input.about ?? current.about,
    typeof input.linkedin !== "undefined" ? input.linkedin : current.linkedin,
    typeof input.image !== "undefined" ? input.image : current.image,
    input.isPublished ?? current.isPublished,
    input.sortOrder ?? current.sortOrder,
    id
  );

  return rowToMember(rows[0]);
}

export async function deleteTeamMember(id: number): Promise<boolean> {
  await ensureTeamTable();
  const result = await prisma.$executeRawUnsafe(`DELETE FROM team_members WHERE id = $1;`, id);
  return result > 0;
}
