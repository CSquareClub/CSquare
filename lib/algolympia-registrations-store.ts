import prisma from "@/lib/db";

/* ─── Types ──────────────────────────────────────────────── */

export type AlgolympiaRegistration = {
  id: number;
  createdAt: string;
  isCU: boolean;
  isProfessional: boolean;

  /* Team leader */
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderUID: string;        // CU only
  leaderPhone: string;
  leaderCollege: string;    // non-CU only
  leaderLeetcode: string;
  leaderCodeforces: string;
  leaderCodechef: string;
  leaderGithub: string;
  leaderSemester?: string;

  /* Member 2 */
  member2Name: string;
  member2Email: string;
  member2UID: string;
  member2Phone: string;
  member2Leetcode: string;
  member2Codeforces: string;
  member2Codechef: string;
  member2Github: string;

  /* Member 3 */
  member3Name: string;
  member3Email: string;
  member3UID: string;
  member3Phone: string;
  member3Leetcode: string;
  member3Codeforces: string;
  member3Codechef: string;
  member3Github: string;

  /* Faculty Mentor (CU only) */
  facultyMentorName?: string;
  facultyMentorEid?: string;

  /* Referral */
  referralCode?: string;

  paymentStatus: string; // pending | paid | submitted
  transactionId?: string;
  paymentScreenshotUrl?: string;
};

type RegistrationRow = {
  id: number;
  created_at: Date | string;
  is_cu: boolean;
  is_professional: boolean;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_uid: string;
  leader_phone: string;
  leader_college: string;
  leader_leetcode: string;
  leader_codeforces: string;
  leader_codechef: string;
  leader_github: string;
  leader_semester?: string;
  member2_name: string;
  member2_email: string;
  member2_uid: string;
  member2_phone: string;
  member2_leetcode: string;
  member2_codeforces: string;
  member2_codechef: string;
  member2_github: string;
  member3_name: string;
  member3_email: string;
  member3_uid: string;
  member3_phone: string;
  member3_leetcode: string;
  member3_codeforces: string;
  member3_codechef: string;
  member3_github: string;
  faculty_mentor_name?: string;
  faculty_mentor_eid?: string;
  referral_code?: string;
  payment_status: string;
  transaction_id?: string;
  payment_screenshot_url?: string;
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS algolympia_registrations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_cu BOOLEAN NOT NULL DEFAULT TRUE,

      team_name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      leader_email TEXT NOT NULL,
      leader_uid TEXT NOT NULL DEFAULT '',
      leader_phone TEXT NOT NULL DEFAULT '',
      leader_college TEXT NOT NULL DEFAULT '',
      leader_leetcode TEXT NOT NULL DEFAULT '',
      leader_codeforces TEXT NOT NULL DEFAULT '',
      leader_codechef TEXT NOT NULL DEFAULT '',
      leader_github TEXT NOT NULL DEFAULT '',

      member2_name TEXT NOT NULL DEFAULT '',
      member2_email TEXT NOT NULL DEFAULT '',
      member2_uid TEXT NOT NULL DEFAULT '',
      member2_phone TEXT NOT NULL DEFAULT '',
      member2_leetcode TEXT NOT NULL DEFAULT '',
      member2_codeforces TEXT NOT NULL DEFAULT '',
      member2_codechef TEXT NOT NULL DEFAULT '',
      member2_github TEXT NOT NULL DEFAULT '',

      member3_name TEXT NOT NULL DEFAULT '',
      member3_email TEXT NOT NULL DEFAULT '',
      member3_uid TEXT NOT NULL DEFAULT '',
      member3_phone TEXT NOT NULL DEFAULT '',
      member3_leetcode TEXT NOT NULL DEFAULT '',
      member3_codeforces TEXT NOT NULL DEFAULT '',
      member3_codechef TEXT NOT NULL DEFAULT '',
      member3_github TEXT NOT NULL DEFAULT '',

      faculty_mentor_name TEXT DEFAULT '',
      faculty_mentor_eid TEXT DEFAULT '',

      payment_status TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // Add payment confirmation columns for outside participants
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS transaction_id TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;`);
  
  // New columns requested
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS member2_phone TEXT NOT NULL DEFAULT '';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS member3_phone TEXT NOT NULL DEFAULT '';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS faculty_mentor_name TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS faculty_mentor_eid TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT '';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS leader_semester TEXT DEFAULT '';`);

  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations DROP COLUMN IF EXISTS member2_college;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations DROP COLUMN IF EXISTS member3_college;`);
  } catch (e) {
    // Ignore drop column errors on free tier databases or when it's already dropped
  }

  // Add is_professional column
  await prisma.$executeRawUnsafe(`ALTER TABLE algolympia_registrations ADD COLUMN IF NOT EXISTS is_professional BOOLEAN NOT NULL DEFAULT FALSE;`);

  tableReady = true;
}

function rowToRegistration(row: RegistrationRow): AlgolympiaRegistration {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);
  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    isCU: row.is_cu,
    isProfessional: row.is_professional ?? false,
    teamName: row.team_name,
    leaderName: row.leader_name,
    leaderEmail: row.leader_email,
    leaderUID: row.leader_uid,
    leaderPhone: row.leader_phone,
    leaderCollege: row.leader_college,
    leaderLeetcode: row.leader_leetcode,
    leaderCodeforces: row.leader_codeforces,
    leaderCodechef: row.leader_codechef,
    leaderGithub: row.leader_github,
    leaderSemester: row.leader_semester || '',
    member2Name: row.member2_name,
    member2Email: row.member2_email,
    member2UID: row.member2_uid,
    member2Phone: row.member2_phone,
    member2Leetcode: row.member2_leetcode,
    member2Codeforces: row.member2_codeforces,
    member2Codechef: row.member2_codechef,
    member2Github: row.member2_github,
    member3Name: row.member3_name,
    member3Email: row.member3_email,
    member3UID: row.member3_uid,
    member3Phone: row.member3_phone,
    member3Leetcode: row.member3_leetcode,
    member3Codeforces: row.member3_codeforces,
    member3Codechef: row.member3_codechef,
    member3Github: row.member3_github,
    facultyMentorName: row.faculty_mentor_name || '',
    facultyMentorEid: row.faculty_mentor_eid || '',
    referralCode: row.referral_code || '',
    paymentStatus: row.payment_status,
    transactionId: row.transaction_id,
    paymentScreenshotUrl: row.payment_screenshot_url,
  };
}

export type CreateAlgolympiaRegistrationInput = {
  isCU: boolean;
  isProfessional?: boolean;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderUID: string;
  leaderPhone: string;
  leaderCollege: string;
  leaderLeetcode: string;
  leaderCodeforces: string;
  leaderCodechef: string;
  leaderGithub: string;
  leaderSemester?: string;
  member2Name: string;
  member2Email: string;
  member2UID: string;
  member2Phone: string;
  member2Leetcode: string;
  member2Codeforces: string;
  member2Codechef: string;
  member2Github: string;
  member3Name: string;
  member3Email: string;
  member3UID: string;
  member3Phone: string;
  member3Leetcode: string;
  member3Codeforces: string;
  member3Codechef: string;
  member3Github: string;
  facultyMentorName?: string;
  facultyMentorEid?: string;
  referralCode?: string;
};

export async function createAlgolympiaRegistration(
  input: CreateAlgolympiaRegistrationInput
): Promise<AlgolympiaRegistration> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<RegistrationRow[]>(
    `INSERT INTO algolympia_registrations
      (is_cu, is_professional, team_name,
       leader_name, leader_email, leader_uid, leader_phone, leader_college,
       leader_leetcode, leader_codeforces, leader_codechef, leader_github, leader_semester,
       member2_name, member2_email, member2_uid, member2_phone,
       member2_leetcode, member2_codeforces, member2_codechef, member2_github,
       member3_name, member3_email, member3_uid, member3_phone,
       member3_leetcode, member3_codeforces, member3_codechef, member3_github,
       faculty_mentor_name, faculty_mentor_eid, referral_code,
       payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
     RETURNING *;`,
    input.isCU,
    input.isProfessional ?? false,
    input.teamName,
    input.leaderName,
    input.leaderEmail,
    input.leaderUID,
    input.leaderPhone,
    input.leaderCollege,
    input.leaderLeetcode,
    input.leaderCodeforces,
    input.leaderCodechef,
    input.leaderGithub,
    input.leaderSemester || "",
    input.member2Name,
    input.member2Email,
    input.member2UID,
    input.member2Phone,
    input.member2Leetcode,
    input.member2Codeforces,
    input.member2Codechef,
    input.member2Github,
    input.member3Name,
    input.member3Email,
    input.member3UID,
    input.member3Phone,
    input.member3Leetcode,
    input.member3Codeforces,
    input.member3Codechef,
    input.member3Github,
    input.facultyMentorName || '',
    input.facultyMentorEid || '',
    input.referralCode || '',
    input.isCU ? "cuims_pending" : "pending",
  );

  return rowToRegistration(rows[0]);
}

export async function checkDuplicateAlgolympiaRegistration(
  emails: string[]
): Promise<boolean> {
  await ensureTable();

  const valid = emails.filter(Boolean).map((e) => e.toLowerCase());
  if (!valid.length) return false;

  const n = valid.length;

  const leaderPlaceholders = valid.map((_, i) => `$${i + 1}`).join(", ");
  const member2Placeholders = valid.map((_, i) => `$${i + 1 + n}`).join(", ");
  const member3Placeholders = valid.map((_, i) => `$${i + 1 + 2 * n}`).join(", ");

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM algolympia_registrations
      WHERE LOWER(leader_email) IN (${leaderPlaceholders})
        OR LOWER(member2_email) IN (${member2Placeholders})
        OR LOWER(member3_email) IN (${member3Placeholders})
    ) AS exists;`,
    ...valid,
    ...valid,
    ...valid,
  );

  return rows[0]?.exists ?? false;
}

export async function checkDuplicateAlgolympiaUid(
  uids: string[]
): Promise<boolean> {
  await ensureTable();

  const valid = uids.filter(Boolean).map((u) => u.toUpperCase());
  if (!valid.length) return false;

  const n = valid.length;

  const leaderPlaceholders = valid.map((_, i) => `$${i + 1}`).join(", ");
  const member2Placeholders = valid.map((_, i) => `$${i + 1 + n}`).join(", ");
  const member3Placeholders = valid.map((_, i) => `$${i + 1 + 2 * n}`).join(", ");

  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS(
      SELECT 1 FROM algolympia_registrations
      WHERE UPPER(leader_uid) IN (${leaderPlaceholders})
         OR UPPER(member2_uid) IN (${member2Placeholders})
         OR UPPER(member3_uid) IN (${member3Placeholders})
    ) AS exists;`,
    ...valid,
    ...valid,
    ...valid,
  );

  return rows[0]?.exists ?? false;
}

export async function listAlgolympiaRegistrations(): Promise<AlgolympiaRegistration[]> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<RegistrationRow[]>(
    `SELECT * FROM algolympia_registrations ORDER BY created_at ASC;`
  );

  return rows.map(rowToRegistration);
}

export async function getAlgolympiaRegistrationById(id: number): Promise<AlgolympiaRegistration | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<RegistrationRow[]>(
    `SELECT * FROM algolympia_registrations WHERE id = $1 LIMIT 1;`,
    id
  );

  if (!rows.length) return null;
  return rowToRegistration(rows[0]);
}

export async function getRegistrationByPaymentEmail(email: string): Promise<AlgolympiaRegistration | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<RegistrationRow[]>(
    `SELECT * FROM algolympia_registrations
     WHERE LOWER(leader_email) = LOWER($1)
        OR LOWER(member2_email) = LOWER($1)
        OR LOWER(member3_email) = LOWER($1)
     LIMIT 1;`,
    email.trim()
  );

  if (!rows.length) return null;
  return rowToRegistration(rows[0]);
}

export async function updatePaymentDetails(
  id: number,
  transactionId: string,
  screenshotUrl: string
): Promise<AlgolympiaRegistration> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<RegistrationRow[]>(
    `UPDATE algolympia_registrations
     SET transaction_id = $1, payment_screenshot_url = $2, payment_status = 'submitted'
     WHERE id = $3
     RETURNING *;`,
    transactionId,
    screenshotUrl,
    id
  );

  if (!rows.length) {
    throw new Error("Registration not found");
  }

  return rowToRegistration(rows[0]);
}
