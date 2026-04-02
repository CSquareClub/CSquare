import prisma from '@/lib/db';

type OtpRow = {
  uid: string;
  college_email: string;
  otp_hash: string;
  expires_at: Date | string;
  sent_at: Date | string;
  attempt_count: number;
  verified: boolean;
  used: boolean;
};

let otpTableReady = false;

function normalizeUid(uid: string): string {
  return uid.trim().toLowerCase();
}

async function ensureCoreTeamOtpTable() {
  if (otpTableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS core_team_email_otps (
      uid TEXT PRIMARY KEY,
      college_email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attempt_count INTEGER NOT NULL DEFAULT 0,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      verified_at TIMESTAMPTZ,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    WITH ranked AS (
      SELECT
        ctid,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(uid)
          ORDER BY updated_at DESC, sent_at DESC
        ) AS rn
      FROM core_team_email_otps
    )
    DELETE FROM core_team_email_otps
    WHERE ctid IN (
      SELECT ctid FROM ranked WHERE rn > 1
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_core_team_email_otps_uid_lower ON core_team_email_otps (LOWER(uid));`
  );

  otpTableReady = true;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export async function getCoreTeamOtpSentAt(uid: string): Promise<Date | null> {
  await ensureCoreTeamOtpTable();

  const normalizedUid = normalizeUid(uid);
  if (!normalizedUid) return null;

  const rows = await prisma.$queryRawUnsafe<Array<{ sent_at: Date | string }>>(
    `SELECT sent_at FROM core_team_email_otps WHERE LOWER(uid) = LOWER($1::text) LIMIT 1;`,
    normalizedUid
  );

  const sentAt = rows[0]?.sent_at;
  return sentAt ? toDate(sentAt) : null;
}

export async function upsertCoreTeamOtp(params: {
  uid: string;
  collegeEmail: string;
  otpHash: string;
  expiresAt: Date;
}): Promise<void> {
  await ensureCoreTeamOtpTable();

  const normalizedUid = normalizeUid(params.uid);

  await prisma.$executeRawUnsafe(
    `INSERT INTO core_team_email_otps (uid, college_email, otp_hash, expires_at, sent_at, attempt_count, verified, verified_at, used, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), 0, FALSE, NULL, FALSE, NOW())
     ON CONFLICT (uid)
     DO UPDATE SET
       college_email = EXCLUDED.college_email,
       otp_hash = EXCLUDED.otp_hash,
       expires_at = EXCLUDED.expires_at,
       sent_at = NOW(),
       attempt_count = 0,
       verified = FALSE,
       verified_at = NULL,
       used = FALSE,
       updated_at = NOW();`,
    normalizedUid,
    params.collegeEmail,
    params.otpHash,
    params.expiresAt.toISOString()
  );
}

export async function verifyCoreTeamOtp(params: {
  uid: string;
  otpHash: string;
  maxAttempts?: number;
}): Promise<{ verified: boolean; reason?: 'missing' | 'expired' | 'max-attempts' | 'invalid' }> {
  await ensureCoreTeamOtpTable();

  const normalizedUid = normalizeUid(params.uid);
  if (!normalizedUid) return { verified: false, reason: 'missing' };

  const rows = await prisma.$queryRawUnsafe<OtpRow[]>(
    `SELECT uid, college_email, otp_hash, expires_at, sent_at, attempt_count, verified, used
     FROM core_team_email_otps
     WHERE LOWER(uid) = LOWER($1::text)
     LIMIT 1;`,
    normalizedUid
  );

  const row = rows[0];
  if (!row) return { verified: false, reason: 'missing' };

  if (toDate(row.expires_at).getTime() < Date.now()) {
    return { verified: false, reason: 'expired' };
  }

  if (row.verified && !row.used) {
    return { verified: true };
  }

  const maxAttempts = params.maxAttempts ?? 5;
  if (row.attempt_count >= maxAttempts) {
    return { verified: false, reason: 'max-attempts' };
  }

  if (row.otp_hash !== params.otpHash) {
    await prisma.$executeRawUnsafe(
      `UPDATE core_team_email_otps
       SET attempt_count = attempt_count + 1,
           updated_at = NOW()
       WHERE LOWER(uid) = LOWER($1::text);`,
      normalizedUid
    );
    return { verified: false, reason: 'invalid' };
  }

  await prisma.$executeRawUnsafe(
    `UPDATE core_team_email_otps
     SET verified = TRUE,
         verified_at = NOW(),
         updated_at = NOW()
     WHERE LOWER(uid) = LOWER($1::text);`,
    normalizedUid
  );

  return { verified: true };
}

export async function isCoreTeamOtpVerified(uid: string): Promise<boolean> {
  await ensureCoreTeamOtpTable();

  const normalizedUid = normalizeUid(uid);
  if (!normalizedUid) return false;

  const rows = await prisma.$queryRawUnsafe<Array<{ verified: boolean }>>(
    `SELECT EXISTS(
      SELECT 1
      FROM core_team_email_otps
      WHERE LOWER(uid) = LOWER($1::text)
        AND verified = TRUE
        AND used = FALSE
        AND expires_at >= NOW()
    ) AS verified;`,
    normalizedUid
  );

  return rows[0]?.verified ?? false;
}

export async function markCoreTeamOtpUsed(uid: string): Promise<void> {
  await ensureCoreTeamOtpTable();

  const normalizedUid = normalizeUid(uid);
  if (!normalizedUid) return;

  await prisma.$executeRawUnsafe(
    `UPDATE core_team_email_otps
     SET used = TRUE,
         updated_at = NOW()
     WHERE LOWER(uid) = LOWER($1::text);`,
    normalizedUid
  );
}
