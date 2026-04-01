import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  getCusocOtpSentAt,
  isCusocOtpVerified,
  markCusocOtpUsed,
  upsertCusocOtp,
  verifyCusocOtp,
} from "@/lib/cusoc-otp-store";
import { createHash, randomInt } from "crypto";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const preferenceLabelMap: Record<string, string> = {
  web: "Web Development",
  app: "App Development",
  backend: "Backend",
  opensource: "Open Source",
  dsa_cp: "DSA / CP",
  dsa: "DSA",
};

const CUSOC_2026_CLOSED_MESSAGE =
  "CUSoC 2026 (GSoC) registrations are now closed. Please register for the CUSoC 2027-28 cohort program.";
const OTP_REGEX = /^\d{6}$/;
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;

function deriveCollegeEmail(uid: string): string {
  const trimmed = uid.trim().toLowerCase();
  if (!trimmed) return "";
  if (/@cuchd\.in$/i.test(trimmed)) return trimmed;
  return `${trimmed}@cuchd.in`;
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

function normalizePreferenceString(value: string): string {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((token) => preferenceLabelMap[token] ?? token)
    .join(", ");
}

async function sendOtpEmail(collegeEmail: string, otp: string, fullName?: string) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  if (!collegeEmail || !collegeEmail.includes("@")) return;

  const greeting = fullName?.trim() ? `Hi ${fullName.trim()},` : "Hi,";
  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [collegeEmail] },
    Message: {
      Subject: { Data: "CUSoC OTP Verification" },
      Body: {
        Text: {
          Data: `${greeting}\n\nYour OTP for CUSoC registration is: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nCUSoC Team`,
        },
      },
    },
  });

  await ses.send(command);
}

async function sendWelcomeEmail(emails: string[], fullName: string, track: string, uid:string) {
  const whatsappLink = "https://chat.whatsapp.com/KVcAI2nE6ZR0AyXurBor6O";
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";

  // Filter out empty emails
  const validEmails = emails.filter(e => e && e.includes('@'));
  if (validEmails.length === 0) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: validEmails },
    Message: {
      Subject: { Data: `Welcome to CUSoC ${track} - Registration Successful!` },
      Body: {
        Text: {
          Data: `Hi ${fullName} ,\n\nYour registration for CUSoC ${track} is successfully received!\n\nPlease join our WhatsApp group for further updates:\n${whatsappLink}\n\nBest,\nCUSoC Team`,
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

  /* Keep logos left-right but smaller */
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

<!-- Main Container -->
<table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #eaeaea;">

  <!-- Header -->
  <tr>
    <td class="padding" style="padding:25px 20px; border-bottom:1px solid #f0f0f0;">
      <table width="100%">
        <tr>
          
          <!-- CUSoC -->
          <td align="left">
            <img src="https://www.csquareclub.co.in/cusoc.png"
                 class="logo-left"
                 style="height:60px; display:block;" />
          </td>

          <!-- C-Square -->
          <td align="right">
            <a href="https://www.csquareclub.co.in">
              <img src="https://www.csquareclub.co.in/c-square-text.png"
                   class="logo-right"
                   style="width:80%; height:90px; display:block;" />
            </a>
          </td>

        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td class="padding text" style="padding:40px 30px; color:#333; line-height:1.6; font-size:16px;">

      <p style="font-size:18px; margin-top:0;">Hi <b>${fullName} (${uid})</b>,</p>

      <p>Your registration for <strong>CUSoC ${track}</strong> is successfully received!</p>

      <!-- Highlight Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; margin:25px 0;">
        <tr>
          <td style="padding:20px; text-align:center;">

            <p style="font-size:15px; color:#7f1d1d;">
              Please join our official WhatsApp group for updates:
            </p>

            <!-- Button (bulletproof) -->
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
      <p style="margin:0;">Chandigarh University Summer of Code</p>
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
    console.error("Failed to send welcome email via SES", err);
  }
}

// ── 2026 schema ─────────────────────────────────────────────
const schema2026 = z.object({
  track: z.literal("2026"),
  fullName: z.string().min(2),
  rollNumber: z.string().trim().regex(/^[A-Za-z0-9-]{6,20}$/),
  cuEmail: z.string().email().regex(/@cuchd\.in$/i, "Must be a @cuchd.in email"),
  personalEmail: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,15}$/),
  department: z.string().min(2),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),

  languages: z.string().min(1),
  dsaLevel: z.enum(["beginner", "intermediate", "advanced"]),
  devExperience: z.enum(["none", "basic", "intermediate", "advanced", "Other"]).or(z.string()),

  domainOrder: z.string().min(1),

  githubProfile: z.string().url(),
  projectCount: z.enum(["0", "1-2", "3+"]),
  bestProjectLink: z.string().url(),
  openSourceContrib: z.enum(["yes", "no"]),
  openSourceLink: z.string().url().optional().or(z.literal("")),

  targetOrgs: z.string().min(2),
  exploredRepo: z.enum(["yes", "no"]),
  orgRepoLink: z.string().url().optional().or(z.literal("")),

  goals: z.string().min(1),
  whyCusoc: z.string().min(10),

  hoursPerWeek: z.enum(["<5", "5-10", "10+"]),
  readyWeeklyTasks: z.enum(["yes", "no"]),
  readyDeadlines: z.enum(["yes", "no"]),

  proposalFileUrl: z.string().url("Valid URL required for proposal file"),

  screeningAnswer: z.string().min(10),
});

// ── 2027 schema ─────────────────────────────────────────────
const schema2027 = z.object({
  track: z.literal("2027"),
  fullName: z.string().min(2),
  rollNumber: z.string().trim().regex(/^[A-Za-z0-9-]{6,20}$/),
  cuEmail: z.string().email().regex(/@cuchd\.in$/i, "Must be a @cuchd.in email"),
  personalEmail: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,15}$/),
  department: z.string().min(2),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),

  skillLevel: z.enum(["beginner", "basic", "intermediate"]),
  languages: z.string().min(1),

  interestArea: z.string().min(1),

  goalLearnCoding: z.boolean(),
  goalBuildProjects: z.boolean(),
  goalTargetGsoc: z.boolean(),
  whyJoin: z.string().min(10),

  knowsOpenSource: z.boolean(),
  knowsGsoc: z.boolean(),

  hoursPerWeek: z.string().min(1),

  motivation: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action || "").trim().toLowerCase();

    if (action === "send-otp") {
      const uid = String(body.uid || body.rollNumber || "").trim().toUpperCase();
      const fullName = String(body.fullName || "").trim();
      const collegeEmail = deriveCollegeEmail(uid);

      if (!uid) {
        return NextResponse.json({ error: "UID is required to send OTP" }, { status: 400 });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collegeEmail) || !/@cuchd\.in$/i.test(collegeEmail)) {
        return NextResponse.json({ error: "Valid CUCHD email could not be derived from UID" }, { status: 400 });
      }

      const sentAt = await getCusocOtpSentAt(uid);
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
      await upsertCusocOtp({
        uid,
        collegeEmail,
        otpHash: hashOtp(otp),
        expiresAt,
      });

      try {
        await sendOtpEmail(collegeEmail, otp, fullName);
      } catch (err) {
        console.error("Failed to send CUSoC OTP email", err);
        return NextResponse.json({ error: "Could not send OTP email right now" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${collegeEmail}`,
        cooldownSeconds: OTP_COOLDOWN_SECONDS,
      });
    }

    if (action === "verify-otp") {
      const uid = String(body.uid || body.rollNumber || "").trim().toUpperCase();
      const otp = String(body.otp || "").trim();

      if (!uid || !otp) {
        return NextResponse.json({ error: "UID and OTP are required" }, { status: 400 });
      }

      if (!OTP_REGEX.test(otp)) {
        return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
      }

      const result = await verifyCusocOtp({ uid, otpHash: hashOtp(otp) });
      if (!result.verified) {
        if (result.reason === "missing") {
          return NextResponse.json({ error: "Request OTP first" }, { status: 400 });
        }
        if (result.reason === "expired") {
          return NextResponse.json({ error: "OTP expired. Request a new OTP" }, { status: 400 });
        }
        if (result.reason === "max-attempts") {
          return NextResponse.json({ error: "Too many invalid attempts. Request a new OTP" }, { status: 429 });
        }
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      return NextResponse.json({ success: true, verified: true });
    }

    const track = body?.track;

    if (track === "2026") {
      return NextResponse.json({ error: CUSOC_2026_CLOSED_MESSAGE }, { status: 410 });
    }

    if (track === "2027") {
      const normalizedBody = {
        ...body,
        rollNumber: String(body.rollNumber || "").trim().toUpperCase(),
      };
      normalizedBody.cuEmail = deriveCollegeEmail(normalizedBody.rollNumber);

      const data = schema2027.parse(normalizedBody);
      const { track: _, ...fields } = data;
      const normalizedFields = {
        ...fields,
        interestArea: normalizePreferenceString(fields.interestArea),
      };

      const otpVerified = await isCusocOtpVerified(normalizedFields.rollNumber);
      if (!otpVerified) {
        return NextResponse.json({ error: "Please verify OTP sent to your CUCHD email before submitting" }, { status: 400 });
      }

      const existing = await prisma.cusocRegistration2027.findFirst({
        where: {
          OR: [
            { cuEmail: normalizedFields.cuEmail },
            { personalEmail: normalizedFields.personalEmail },
            { phone: normalizedFields.phone },
            { rollNumber: normalizedFields.rollNumber },
          ],
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This student is already registered for CUSoC 2027-28." },
          { status: 409 }
        );
      }

      await prisma.cusocRegistration2027.create({ data: normalizedFields });
      // Send Welcome Email
      await sendWelcomeEmail(
        [normalizedFields.cuEmail, normalizedFields.personalEmail],
        normalizedFields.fullName,
        "2027-28",
        normalizedFields.rollNumber
      );
      await markCusocOtpUsed(normalizedFields.rollNumber);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  } catch (err) {
    console.log(err);
    
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 }
      );
    }
    console.error("CUSoC registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const track = String(searchParams.get("track") || "").trim();
    const cuEmail = String(searchParams.get("cuEmail") || "").trim().toLowerCase();

    if (!track || !cuEmail) {
      return NextResponse.json({ duplicate: false });
    }

    if (!/@cuchd\.in$/i.test(cuEmail)) {
      return NextResponse.json({ duplicate: false });
    }

    if (track === "2026") {
      return NextResponse.json({
        duplicate: true,
        error: CUSOC_2026_CLOSED_MESSAGE,
      });
    }

    if (track === "2027") {
      const existing = await prisma.cusocRegistration2027.findUnique({
        where: { cuEmail },
      });

      return NextResponse.json({
        duplicate: Boolean(existing),
        error: existing ? "This CU email is already registered for CUSoC 2027-28." : undefined,
      });
    }

    return NextResponse.json({ duplicate: false });
  } catch (err) {
    console.error("CUSoC duplicate check error:", err);
    return NextResponse.json({ error: "Could not validate registration" }, { status: 500 });
  }
}
