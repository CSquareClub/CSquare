import prisma from '@/lib/db';

export type CoreTeamApplication = {
  id: number;
  createdAt: string;
  membershipId: string;
  fullName: string;
  uid: string;
  personalEmail: string;
  collegeEmail: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  rolesInterested: string;
  resumeLink: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  whyJoin: string;
};

type CoreTeamApplicationRow = {
  id: number;
  created_at: Date | string;
  membership_id: string;
  full_name: string;
  uid: string;
  personal_email: string;
  college_email: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  roles_interested: string;
  resume_link: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  why_join: string;
};

type CreateCoreTeamApplicationInput = {
  membershipId: string;
  fullName: string;
  uid: string;
  personalEmail: string;
  collegeEmail: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  rolesInterested: string;
  resumeLink: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  whyJoin: string;
};

let tableReady = false;

async function ensureCoreTeamApplicationsTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS core_team_applications (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      membership_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      uid TEXT NOT NULL,
      personal_email TEXT NOT NULL DEFAULT '',
      college_email TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL,
      course TEXT NOT NULL,
      year TEXT NOT NULL,
      semester TEXT NOT NULL,
      roles_interested TEXT NOT NULL,
      resume_link TEXT NOT NULL,
      linkedin_url TEXT,
      portfolio_url TEXT,
      why_join TEXT NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE core_team_applications
      ADD COLUMN IF NOT EXISTS personal_email TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS college_email TEXT NOT NULL DEFAULT '';
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_core_team_membership_id ON core_team_applications (LOWER(membership_id));`
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_core_team_uid ON core_team_applications (LOWER(uid));`
  );

  tableReady = true;
}

function rowToCoreTeamApplication(row: CoreTeamApplicationRow): CoreTeamApplication {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    membershipId: row.membership_id,
    fullName: row.full_name,
    uid: row.uid,
    personalEmail: row.personal_email,
    collegeEmail: row.college_email,
    department: row.department,
    course: row.course,
    year: row.year,
    semester: row.semester,
    rolesInterested: row.roles_interested,
    resumeLink: row.resume_link,
    linkedinUrl: row.linkedin_url,
    portfolioUrl: row.portfolio_url,
    whyJoin: row.why_join,
  };
}

export async function hasCoreTeamDuplicate(membershipId: string, uid: string): Promise<boolean> {
  await ensureCoreTeamApplicationsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM core_team_applications
      WHERE LOWER(membership_id) = LOWER($1::text)
         OR LOWER(uid) = LOWER($2::text)
    ) AS exists;`,
    membershipId,
    uid
  );

  return rows[0]?.exists ?? false;
}

export async function hasCoreTeamMembershipDuplicate(membershipId: string): Promise<boolean> {
  await ensureCoreTeamApplicationsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM core_team_applications
      WHERE LOWER(membership_id) = LOWER($1::text)
    ) AS exists;`,
    membershipId
  );

  return rows[0]?.exists ?? false;
}

export async function createCoreTeamApplication(
  input: CreateCoreTeamApplicationInput
): Promise<CoreTeamApplication> {
  await ensureCoreTeamApplicationsTable();

  const rows = await prisma.$queryRawUnsafe<CoreTeamApplicationRow[]>(
    `INSERT INTO core_team_applications
      (membership_id, full_name, uid, personal_email, college_email, department, course, year, semester, roles_interested, resume_link, linkedin_url, portfolio_url, why_join)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id, created_at, membership_id, full_name, uid, personal_email, college_email, department, course, year, semester, roles_interested, resume_link, linkedin_url, portfolio_url, why_join;`,
    input.membershipId,
    input.fullName,
    input.uid,
    input.personalEmail,
    input.collegeEmail,
    input.department,
    input.course,
    input.year,
    input.semester,
    input.rolesInterested,
    input.resumeLink,
    input.linkedinUrl,
    input.portfolioUrl,
    input.whyJoin
  );

  return rowToCoreTeamApplication(rows[0]);
}

export async function listCoreTeamApplications(): Promise<CoreTeamApplication[]> {
  await ensureCoreTeamApplicationsTable();

  const rows = await prisma.$queryRawUnsafe<CoreTeamApplicationRow[]>(
    `SELECT id, created_at, membership_id, full_name, uid, personal_email, college_email, department, course, year, semester, roles_interested, resume_link, linkedin_url, portfolio_url, why_join
     FROM core_team_applications
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToCoreTeamApplication);
}

export async function getCoreTeamApplicationCount(): Promise<number> {
  await ensureCoreTeamApplicationsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM core_team_applications;`
  );

  return Number(rows[0]?.count ?? 0);
}

export async function deleteCoreTeamApplications(ids: number[]): Promise<number> {
  await ensureCoreTeamApplicationsTable();

  const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (!validIds.length) return 0;

  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM core_team_applications WHERE id = ANY($1::int[]);`,
    validIds
  );

  return Number(result);
}
