import { NextResponse } from 'next/server';
import {
  createCoreTeamApplication,
  hasCoreTeamDuplicate,
  hasCoreTeamMembershipDuplicate,
} from '@/lib/core-team-applications-store';
import {
  getCoreTeamOtpSentAt,
  isCoreTeamOtpVerified,
  markCoreTeamOtpUsed,
  upsertCoreTeamOtp,
  verifyCoreTeamOtp,
} from '@/lib/core-team-otp-store';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { createHash, randomInt } from 'crypto';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const MEMBERSHIP_ID_REGEX = /^[A-Za-z0-9-]{5,24}$/;
const OTP_REGEX = /^\d{6}$/;
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const DEPARTMENTS = new Set([
  'CSE',
  'AIML',
  'ECE',
  'ME',
  'CE',
  'Biotechnology',
  'Management',
  'Commerce',
  'Law',
  'Pharmacy',
  'Other',
]);

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function deriveCollegeEmail(uid: string): string {
  const trimmed = uid.trim().toLowerCase();
  if (!trimmed) return '';
  if (/@cuchd\.in$/i.test(trimmed)) return trimmed;
  return `${trimmed}@cuchd.in`;
}

function isValidMembershipId(value: string): boolean {
  return MEMBERSHIP_ID_REGEX.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(value: string): boolean {
  if (!isValidUrl(value)) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return hostname === 'linkedin.com' || hostname === 'www.linkedin.com';
  } catch {
    return false;
  }
}

function isValidGoogleDriveUrl(value: string): boolean {
  if (!isValidUrl(value)) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'drive.google.com' ||
      hostname === 'docs.google.com'
    );
  } catch {
    return false;
  }
}

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

async function sendOtpEmail(collegeEmail: string, otp: string, fullName?: string) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || 'csquareclub@cumail.in';
  if (!collegeEmail || !collegeEmail.includes('@')) return;

  const greeting = fullName?.trim() ? `Hi ${fullName.trim()},` : 'Hi,';
  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [collegeEmail] },
    Message: {
      Subject: { Data: 'C Square Core Team OTP Verification' },
      Body: {
        Text: {
          Data: `${greeting}\n\nYour OTP for Core Team application is: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nC Square Club`,
        },
      },
    },
  });

  await ses.send(command);
}

async function sendWelcomeEmail(collegeEmail: string, fullName: string) {
  const whatsappLink = 'https://chat.whatsapp.com/EnANNl7izAm0hcr7Pn6yu5?mode=gi_t';
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || 'csquareclub@cumail.in';

  if (!collegeEmail || !collegeEmail.includes('@')) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [collegeEmail] },
    Message: {
      Subject: { Data: 'Thanks for your interest in C Square Core Team' },
      Body: {
        Text: {
          Data: `Hi ${fullName},\n\nThanks for your interest in joining the C Square Core Team.\nPlease join this group while we go through your profile:\n${whatsappLink}\n\nBest regards,\nC Square Club`,
        },
        Html: {
          Data: `
            <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@media only screen and (max-width: 480px) {
  .container {
    width: 100% !important;
  }
  .padding {
    padding: 20px !important;
  }
  .logo-left {
    height: 40px !important;
  }
  .logo-right {
    width: 110px !important;
    height: auto !important;
  }
  .text {
    font-size: 15px !important;
  }
}
</style>
</head>
<body style="margin:0; padding:0; background-color:#f9f9f9; font-family: Helvetica, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9; padding:20px;">
<tr>
<td align="center">
<table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #eaeaea;">
  <!-- Header -->
  <tr>
    <td class="padding" style="padding:25px 20px; border-bottom:1px solid #f0f0f0;">
      <table width="100%">
        <tr>
          <td align="left">
            <img src="https://www.csquareclub.co.in/c-square-text.png"
                 class="logo-left"
                 style="height:60px; display:block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td class="padding text" style="padding:40px 30px; color:#333; line-height:1.6; font-size:16px;">
      <p style="font-size:18px; margin-top:0;">Hi <b>${fullName}</b>,</p>
      <p>Thanks for your interest in joining the C Square Core Team.</p>
      <!-- Highlight Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; margin:25px 0;">
        <tr>
          <td style="padding:20px; text-align:center;">
            <p style="font-size:15px; color:#7f1d1d;">
              Please join this group while we go through your profile:
            </p>
            <!-- Button -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:10px;">
              <tr>
                <td align="center" bgcolor="#ef4444" style="border-radius:6px;">
                  <a href="${whatsappLink}"
                     style="
                       display:block;
                       padding:12px 20px;
                       color:#ffffff;
                       text-decoration:none;
                       font-weight:bold;
                       font-size:16px;
                     ">
                    Join WhatsApp Group
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px; margin-top:15px; color:#991b1b; word-break:break-all;">
              Or copy: <a href="${whatsappLink}" style="color:#ef4444;">${whatsappLink}</a>
            </p>
          </td>
        </tr>
      </table>
      <p>Best regards,<br><strong style="color:#ef4444;">C Square Club</strong></p>
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="background:#fafafa; padding:20px; text-align:center; font-size:13px; color:#888;">
      <p style="margin:0;">C Square Club - Chandigarh University</p>
      <p style="margin:5px 0;">
        <a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a>
      </p>
    </td>
  </tr>
</table>
</td>
</tr>
</table>
</body>
</html>
          `,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error('Failed to send welcome email to Core Team applicant', err);
  }
}



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const membershipId = String(searchParams.get('membershipId') || '').trim();

    if (!membershipId) {
      return NextResponse.json({ valid: false, available: false, error: 'Membership ID is required' }, { status: 400 });
    }

    if (!isValidMembershipId(membershipId)) {
      return NextResponse.json({
        valid: false,
        available: false,
        error: 'Membership ID must be 5-24 characters and contain only letters, numbers, or hyphen',
      });
    }

    const duplicate = await hasCoreTeamMembershipDuplicate(membershipId);
    return NextResponse.json({ valid: true, available: !duplicate, error: duplicate ? 'This Membership ID has already applied' : null });
  } catch (error) {
    console.error('Failed to verify membership ID', error);
    return NextResponse.json({ valid: false, available: false, error: 'Verification failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || '').trim().toLowerCase();

    if (action === 'send-otp') {
      const uid = String(body.uid || '').trim();
      const fullName = String(body.fullName || '').trim();
      const collegeEmail = deriveCollegeEmail(uid);

      if (!uid) {
        return NextResponse.json({ error: 'UID is required to send OTP' }, { status: 400 });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collegeEmail) || !/@cuchd\.in$/i.test(collegeEmail)) {
        return NextResponse.json({ error: 'Valid CUCHD email could not be derived from UID' }, { status: 400 });
      }

      const sentAt = await getCoreTeamOtpSentAt(uid);
      if (sentAt) {
        const elapsed = Math.floor((Date.now() - sentAt.getTime()) / 1000);
        if (elapsed < OTP_COOLDOWN_SECONDS) {
          return NextResponse.json(
            { error: `Please wait ${OTP_COOLDOWN_SECONDS - elapsed}s before requesting another OTP` },
            { status: 429 }
          );
        }
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await upsertCoreTeamOtp({
        uid,
        collegeEmail,
        otpHash: hashOtp(otp),
        expiresAt,
      });

      try {
        await sendOtpEmail(collegeEmail, otp, fullName);
      } catch (err) {
        console.error('Failed to send core team OTP email', err);
        return NextResponse.json({ error: 'Could not send OTP email right now' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${collegeEmail}`,
        cooldownSeconds: OTP_COOLDOWN_SECONDS,
      });
    }

    if (action === 'verify-otp') {
      const uid = String(body.uid || '').trim();
      const otp = String(body.otp || '').trim();

      if (!uid || !otp) {
        return NextResponse.json({ error: 'UID and OTP are required' }, { status: 400 });
      }

      if (!OTP_REGEX.test(otp)) {
        return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 });
      }

      const result = await verifyCoreTeamOtp({ uid, otpHash: hashOtp(otp) });
      if (!result.verified) {
        if (result.reason === 'missing') {
          return NextResponse.json({ error: 'Request OTP first' }, { status: 400 });
        }
        if (result.reason === 'expired') {
          return NextResponse.json({ error: 'OTP expired. Request a new OTP' }, { status: 400 });
        }
        if (result.reason === 'max-attempts') {
          return NextResponse.json({ error: 'Too many invalid attempts. Request a new OTP' }, { status: 429 });
        }
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      return NextResponse.json({ success: true, verified: true });
    }

    const membershipId = String(body.membershipId || '').trim();
    const fullName = String(body.fullName || '').trim();
    const uid = String(body.uid || '').trim();
    const personalEmail = normalizeEmail(String(body.personalEmail || ''));
    const collegeEmail = deriveCollegeEmail(uid);
    const department = String(body.department || '').trim();
    const course = String(body.course || '').trim();
    const year = String(body.year || '').trim();
    const semester = String(body.semester || '').trim();
    const rolesInterested = String(body.rolesInterested || '').trim();
    const resumeLink = String(body.resumeLink || '').trim();
    const linkedinUrl = normalizeUrl(String(body.linkedinUrl || ''));
    const portfolioUrl = normalizeUrl(String(body.portfolioUrl || ''));
    const whyJoin = String(body.whyJoin || '').trim();

    if (
      !membershipId ||
      !fullName ||
      !uid ||
      !personalEmail ||
      !collegeEmail ||
      !department ||
      !course ||
      !year ||
      !semester ||
      !rolesInterested ||
      !resumeLink ||
      !linkedinUrl ||
      !portfolioUrl ||
      !whyJoin
    ) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 });
    }

    if (!isValidMembershipId(membershipId)) {
      return NextResponse.json(
        { error: 'Membership ID must be 5-24 characters and contain only letters, numbers, or hyphen' },
        { status: 400 }
      );
    }

    if (!DEPARTMENTS.has(department)) {
      return NextResponse.json({ error: 'Please select a valid department' }, { status: 400 });
    }

    if (!isValidGoogleDriveUrl(resumeLink)) {
      return NextResponse.json({ error: 'Resume link must be a valid Google Drive URL with viewer access' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      return NextResponse.json({ error: 'Personal email must be valid' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collegeEmail) || !/@cuchd\.in$/i.test(collegeEmail)) {
      return NextResponse.json({ error: 'CU college email must be derived from UID and end with @cuchd.in' }, { status: 400 });
    }

    if (!isValidLinkedInUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL must be a valid linkedin.com link' }, { status: 400 });
    }

    if (!isValidUrl(portfolioUrl)) {
      return NextResponse.json({ error: 'Portfolio URL must be valid' }, { status: 400 });
    }

    const otpVerified = await isCoreTeamOtpVerified(uid);
    if (!otpVerified) {
      return NextResponse.json({ error: 'Please verify OTP sent to your CUCHD email before submitting' }, { status: 400 });
    }

    const isDuplicate = await hasCoreTeamDuplicate(membershipId, uid);
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Application already exists with this Membership ID or UID' },
        { status: 409 }
      );
    }

    const record = await createCoreTeamApplication({
      membershipId,
      fullName,
      uid,
      personalEmail,
      collegeEmail,
      department,
      course,
      year,
      semester,
      rolesInterested,
      resumeLink,
      linkedinUrl,
      portfolioUrl,
      whyJoin,
    });

    // Send acknowledgement email with WhatsApp group link to CUCHD email
    await sendWelcomeEmail(collegeEmail, fullName);
    await markCoreTeamOtpUsed(uid);

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit core team application', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
