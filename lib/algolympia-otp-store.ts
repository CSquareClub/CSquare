import prisma from '@/lib/db';

/**
 * Email-based OTP store for AlgOlympia registration.
 * Uses the leader's personal email as the key (not UID).
 */

type OtpRow = {
  email: string;
  otp_hash: string;
  expires_at: Date | string;
  sent_at: Date | string;
  attempt_count: number;
  verified: boolean;
  used: boolean;
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS algolympia_email_otps (
      email TEXT PRIMARY KEY,
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

  tableReady = true;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export async function getAlgolympiaOtpSentAt(email: string): Promise<Date | null> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ sent_at: Date | string }>>(
    `SELECT sent_at FROM algolympia_email_otps WHERE LOWER(email) = LOWER($1::text) LIMIT 1;`,
    email,
  );

  const sentAt = rows[0]?.sent_at;
  return sentAt ? toDate(sentAt) : null;
}

export async function upsertAlgolympiaOtp(params: {
  email: string;
  otpHash: string;
  expiresAt: Date;
}): Promise<void> {
  await ensureTable();

  await prisma.$executeRawUnsafe(
    `INSERT INTO algolympia_email_otps (email, otp_hash, expires_at, sent_at, attempt_count, verified, verified_at, used, updated_at)
     VALUES ($1, $2, $3, NOW(), 0, FALSE, NULL, FALSE, NOW())
     ON CONFLICT (email)
     DO UPDATE SET
       otp_hash = EXCLUDED.otp_hash,
       expires_at = EXCLUDED.expires_at,
       sent_at = NOW(),
       attempt_count = 0,
       verified = FALSE,
       verified_at = NULL,
       used = FALSE,
       updated_at = NOW();`,
    params.email.toLowerCase(),
    params.otpHash,
    params.expiresAt.toISOString(),
  );
}

export async function verifyAlgolympiaOtp(params: {
  email: string;
  otpHash: string;
  maxAttempts?: number;
}): Promise<{ verified: boolean; reason?: 'missing' | 'expired' | 'max-attempts' | 'invalid' }> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<OtpRow[]>(
    `SELECT email, otp_hash, expires_at, sent_at, attempt_count, verified, used
     FROM algolympia_email_otps
     WHERE LOWER(email) = LOWER($1::text)
     LIMIT 1;`,
    params.email,
  );

  const row = rows[0];
  if (!row) return { verified: false, reason: 'missing' };

  if (row.verified && !row.used) {
    return { verified: true };
  }

  const maxAttempts = params.maxAttempts ?? 5;
  if (row.attempt_count >= maxAttempts) {
    return { verified: false, reason: 'max-attempts' };
  }

  if (toDate(row.expires_at).getTime() < Date.now()) {
    return { verified: false, reason: 'expired' };
  }

  if (row.otp_hash !== params.otpHash) {
    await prisma.$executeRawUnsafe(
      `UPDATE algolympia_email_otps
       SET attempt_count = attempt_count + 1,
           updated_at = NOW()
       WHERE LOWER(email) = LOWER($1::text);`,
      params.email,
    );
    return { verified: false, reason: 'invalid' };
  }

  await prisma.$executeRawUnsafe(
    `UPDATE algolympia_email_otps
     SET verified = TRUE,
         verified_at = NOW(),
         updated_at = NOW()
     WHERE LOWER(email) = LOWER($1::text);`,
    params.email,
  );

  return { verified: true };
}

export async function isAlgolympiaOtpVerified(email: string): Promise<boolean> {
  await ensureTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ verified: boolean }>>(
    `SELECT EXISTS(
      SELECT 1
      FROM algolympia_email_otps
      WHERE LOWER(email) = LOWER($1::text)
        AND verified = TRUE
        AND used = FALSE
        AND expires_at >= NOW()
    ) AS verified;`,
    email,
  );

  return rows[0]?.verified ?? false;
}

export async function markAlgolympiaOtpUsed(email: string): Promise<void> {
  await ensureTable();

  await prisma.$executeRawUnsafe(
    `UPDATE algolympia_email_otps
     SET used = TRUE,
         updated_at = NOW()
     WHERE LOWER(email) = LOWER($1::text);`,
    email,
  );
}
