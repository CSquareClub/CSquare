import prisma from "@/lib/db";

export type OutsideRegistration = {
  id: number;
  createdAt: string;
  fullName: string;
  instituteName: string;
  rollNumber: string;
  personalEmail: string;
  collegeEmail: string;
  campusAmbassador: boolean;
};

type OutsideRegistrationRow = {
  id: number;
  created_at: Date | string;
  full_name: string;
  institute_name: string;
  roll_number: string;
  personal_email: string;
  college_email: string;
  campus_ambassador: boolean;
};

let tableReady = false;

async function ensureOutsideRegistrationsTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS outside_registrations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT NOT NULL,
      institute_name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      personal_email TEXT NOT NULL,
      college_email TEXT NOT NULL,
      campus_ambassador BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  tableReady = true;
}

function rowToRegistration(row: OutsideRegistrationRow): OutsideRegistration {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    fullName: row.full_name,
    instituteName: row.institute_name,
    rollNumber: row.roll_number,
    personalEmail: row.personal_email,
    collegeEmail: row.college_email,
    campusAmbassador: row.campus_ambassador,
  };
}

export type CreateOutsideRegistrationInput = {
  fullName: string;
  instituteName: string;
  rollNumber: string;
  personalEmail: string;
  collegeEmail: string;
  campusAmbassador: boolean;
};

export async function createOutsideRegistration(
  input: CreateOutsideRegistrationInput
): Promise<OutsideRegistration> {
  await ensureOutsideRegistrationsTable();

  const rows = await prisma.$queryRawUnsafe<OutsideRegistrationRow[]>(
    `INSERT INTO outside_registrations
      (full_name, institute_name, roll_number, personal_email, college_email, campus_ambassador)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at, full_name, institute_name, roll_number, personal_email, college_email, campus_ambassador;`,
    input.fullName,
    input.instituteName,
    input.rollNumber,
    input.personalEmail,
    input.collegeEmail,
    input.campusAmbassador
  );

  return rowToRegistration(rows[0]);
}

export async function listOutsideRegistrations(): Promise<OutsideRegistration[]> {
  await ensureOutsideRegistrationsTable();

  const rows = await prisma.$queryRawUnsafe<OutsideRegistrationRow[]>(
    `SELECT id, created_at, full_name, institute_name, roll_number, personal_email, college_email, campus_ambassador
     FROM outside_registrations
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToRegistration);
}

export async function listCampusAmbassadors(): Promise<OutsideRegistration[]> {
  await ensureOutsideRegistrationsTable();

  const rows = await prisma.$queryRawUnsafe<OutsideRegistrationRow[]>(
    `SELECT id, created_at, full_name, institute_name, roll_number, personal_email, college_email, campus_ambassador
     FROM outside_registrations
     WHERE campus_ambassador = TRUE
     ORDER BY created_at DESC;`
  );

  return rows.map(rowToRegistration);
}

export async function getOutsideRegistrationCounts(): Promise<{ total: number; ambassadors: number }> {
  await ensureOutsideRegistrationsTable();

  const totalRows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM outside_registrations;`
  );
  const ambassadorRows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM outside_registrations WHERE campus_ambassador = TRUE;`
  );

  return {
    total: Number(totalRows[0]?.count ?? 0),
    ambassadors: Number(ambassadorRows[0]?.count ?? 0),
  };
}

export async function checkDuplicateRegistration(
  rollNumber: string,
  personalEmail: string,
  collegeEmail: string
): Promise<boolean> {
  await ensureOutsideRegistrationsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM outside_registrations
      WHERE LOWER(roll_number) = LOWER($1::text)
        OR LOWER(personal_email) = LOWER($2::text)
        OR LOWER(college_email) = LOWER($3::text)
    ) AS exists;`,
    rollNumber,
    personalEmail,
    collegeEmail
  );

  return rows[0]?.exists ?? false;
}

export async function deleteOutsideRegistrations(ids: number[]): Promise<number> {
  await ensureOutsideRegistrationsTable();

  const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (!validIds.length) return 0;

  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM outside_registrations WHERE id = ANY($1::int[]);`,
    validIds
  );

  return Number(result);
}
