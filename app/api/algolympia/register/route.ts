import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createHash, randomInt } from "crypto";
import {
  createAlgolympiaRegistration,
  checkDuplicateAlgolympiaRegistration,
  checkDuplicateAlgolympiaUid,
} from "@/lib/algolympia-registrations-store";
import { appendRegistrationToSheet } from "@/lib/google-sheets";
import {
  getAlgolympiaOtpSentAt,
  isAlgolympiaOtpVerified,
  markAlgolympiaOtpUsed,
  upsertAlgolympiaOtp,
  verifyAlgolympiaOtp,
} from "@/lib/algolympia-otp-store";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/* ── Schemas ─────────────────────────────────────────────── */

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_REGEX = /^\d{6}$/;



function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

async function sendOtpEmail(email: string, otp: string, fullName?: string) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  if (!email || !email.includes("@")) return;

  const greeting = fullName?.trim() ? `Hi ${fullName.trim()},` : "Hi,";
  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "AlgOlympia – Verify Your Email" },
      Body: {
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  <tr><td style="padding:40px 30px;color:#333;line-height:1.6;font-size:16px;">
    <p style="font-size:18px;margin-top:0;">${greeting}</p>
    <p>Your OTP for AlgOlympia registration is:</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:15px;margin:20px 0;display:inline-block;font-size:24px;font-weight:bold;letter-spacing:4px;color:#92400e;">
      ${otp}
    </div>
    <p>This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
    <p>If you did not request this, you can ignore this email.</p>

    <div style="font-family:Arial, sans-serif;color:#222;margin-top:30px;">
      <p style="margin:0"><strong>Thanks & Regards,</strong></p>
      <p style="margin:0"><strong>C Square Club</strong><br><span style="font-size:13px;color:#555">The Coding and Technical Club of Chandigarh University</span></p>
      <div style="margin-top:6px">
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4zcvdT1Wlvks3L3JLyXCW_h14u_h4tipSq1VCkipfAkoTdWo0BV4idRf6Q4SDIoTCfhjxUB1plV7Gg8" width="80">
        &nbsp;
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4xv3qRGQ6IGUj4tyzrjBsCy1AR47puIdw1UO4l_z3ew0xmt_S_F9nme4ESuDBYx619S0kvOhCk" width="180">
      </div>
      <hr style="border:none;border-top:1px solid #ccc;margin:10px 0">
      <p style="margin:0;font-size:14px"><strong>Learn • Compete • Build</strong></p>
      <p style="margin:6px 0;font-size:14px">
        &#128222; <a href="https://wa.me/919084542911">+91 9084542911</a>&nbsp;&nbsp;
        &#9993; <a href="mailto:csquareclub@cumail.in">csquareclub@cumail.in</a><br>
        &#128188; <a href="https://www.linkedin.com/company/csquare-club/">csquare-club</a><br>
        &#128247; <a href="https://www.instagram.com/csquare_club/">@csquare_club</a>
      </p>
    </div>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`
        },
        Text: {
          Data: `${greeting}\n\nYour OTP for AlgOlympia registration is: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nAlgOlympia – C Square Club`,
        },
      },
    },
  });

  await ses.send(command);
}

const profileUrl = z.string().url("Must be a valid link (e.g. https://...)").optional().or(z.literal(""));

const profileSchema = z.object({
  leetcode: profileUrl,
  codeforces: profileUrl,
  codechef: profileUrl,
  github: profileUrl,
});

const baseMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid phone number required"),
}).merge(profileSchema);

const cuMemberSchema = baseMemberSchema.extend({
  uid: z.string().trim().regex(/^[A-Za-z0-9-]{6,20}$/, "Valid CU UID required"),
});

const nonCuMemberSchema = baseMemberSchema;

const cuRegistrationSchema = z.object({
  isCU: z.literal(true),
  isProfessional: z.literal(false).optional(),
  teamName: z.string().min(2, "Team name is required"),
  facultyMentorName: z.string().optional(),
  facultyMentorEid: z.string().optional(),
  referralCode: z.string().optional(),
  leader: cuMemberSchema.merge(z.object({
    college: z.string().min(2, "Department name is required"),
  })),
  member2: cuMemberSchema,
  member3: cuMemberSchema,
});

const nonCuRegistrationSchema = z.object({
  isCU: z.literal(false),
  isProfessional: z.boolean().optional().default(false),
  teamName: z.string().min(2, "Team name is required"),
  referralCode: z.string().optional(),
  leader: nonCuMemberSchema.merge(z.object({
    college: z.string().min(2, "College/Organization name is required"),
  })),
  member2: nonCuMemberSchema,
  member3: nonCuMemberSchema,
});

/* ── Email helpers ───────────────────────────────────────── */

async function sendCuConfirmationEmail(
  emails: string[],
  teamName: string,
  leaderName: string,
) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  const validEmails = emails.filter((e) => e && e.includes("@"));
  if (validEmails.length === 0) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: validEmails },
    Message: {
      Subject: { Data: `AlgOlympia 2026 – Registration Confirmation & CUIMS Payment Instructions` },
      Body: {
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media only screen and (max-width: 600px) {
    .main-wrap { padding: 0 !important; }
    .container { width: 100% !important; border-radius: 0 !important; border: none !important; }
    .logo-text { font-size: 15px !important; }
    .c-square-text { font-size: 14px !important; }
    .content-pad { padding: 30px 15px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" class="main-wrap" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" class="container" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  <tr><td style="padding:25px 20px;border-bottom:1px solid #f0f0f0;">
    <table width="100%"><tr>
      <td align="left"><strong class="logo-text" style="font-size:20px;color:#ffd232;">⚡ ALGOLYMPIA 2026</strong></td>
      <td align="right"><a href="https://www.csquareclub.co.in" style="text-decoration:none;"><strong class="c-square-text" style="font-size:16px;color:#333;">C Square</strong></a></td>
    </tr></table>
  </td></tr>
  <tr><td class="content-pad" style="padding:40px 30px;color:#333;line-height:1.6;font-size:16px;">
    <p style="font-size:18px;margin-top:0;">Dear <b>Participant</b>,</p>
    <p>Greetings from C Square Club, Chandigarh University, Punjab!</p>
    <p>We are pleased to inform you that your registration for <strong>AlgOlympia 2026</strong> has been successfully received. We are excited to have you join us for this global-level programming competition.</p>
    <p>All participants are requested to complete their registration by submitting the participation fee through CUIMS.</p>

    <h3 style="color:#92400e;margin-top:25px;">💳 Payment Details</h3>
    <ul>
      <li><strong>Amount:</strong> ₹100 per team member</li>
      <li><strong>Mode:</strong> Payment will be reflected on CUIMS</li>
      <li><strong>Note:</strong> Each team member must complete the payment individually through their CUIMS portal</li>
    </ul>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:15px;margin:20px 0;">
      <h4 style="color:#92400e;margin:0 0 10px 0;">⚠️ Important Note</h4>
      <ul style="color:#92400e;margin:0;font-size:14px;padding-left:20px;">
        <li>Once you have registered for AlgOlympia, participation is mandatory as the fee will be reflected on CUIMS soon and will not be removed.</li>
        <li>If you have exhausted your duty leaves, Special Duty Leave (IDL) will be provided.</li>
      </ul>
    </div>

    <h3 style="color:#166534;margin-top:25px;">✅ Next Steps</h3>
    <ol>
      <li>Complete the payment via CUIMS.</li>
      <li>Each team member must fill the confirmation form individually after payment.</li>
      <li>Upload the payment proof in the form for verification.</li>
      <li>Join the official WhatsApp group for updates and announcements:<br><a href="https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx">https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx</a></li>
    </ol>

    <p style="margin-top:20px;font-style:italic;">Please ensure that the payment and form submission are completed at the earliest to secure your participation.</p>
    <p style="margin-top:30px;">Looking forward to hosting you at AlgOlympia 2026!</p>

    <div style="font-family:Arial, sans-serif;color:#222;margin-top:30px;">
      <p style="margin:0"><strong>Thanks & Regards,</strong></p>
      <p style="margin:0"><strong>C Square Club</strong><br><span style="font-size:13px;color:#555">The Coding and Technical Club of Chandigarh University</span></p>
      <div style="margin-top:6px">
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4zcvdT1Wlvks3L3JLyXCW_h14u_h4tipSq1VCkipfAkoTdWo0BV4idRf6Q4SDIoTCfhjxUB1plV7Gg8" width="80">
        &nbsp;
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4xv3qRGQ6IGUj4tyzrjBsCy1AR47puIdw1UO4l_z3ew0xmt_S_F9nme4ESuDBYx619S0kvOhCk" width="180">
      </div>
      <hr style="border:none;border-top:1px solid #ccc;margin:10px 0">
      <p style="margin:0;font-size:14px"><strong>Learn • Compete • Build</strong></p>
      <p style="margin:6px 0;font-size:14px">
        &#128222; <a href="https://wa.me/919084542911">+91 9084542911</a>&nbsp;&nbsp;
        &#9993; <a href="mailto:csquareclub@cumail.in">csquareclub@cumail.in</a><br>
        &#128188; <a href="https://www.linkedin.com/company/csquare-club/">csquare-club</a><br>
        &#128247; <a href="https://www.instagram.com/csquare_club/">@csquare_club</a>
      </p>
    </div>
  </td></tr>
  <tr><td style="background:#fafafa;padding:20px;text-align:center;font-size:13px;color:#888;">
    <p style="margin:0;">AlgOlympia 2026 – C Square Club</p>
    <p style="margin:5px 0;"><a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
        },
        Text: {
          Data: `Dear Participant,\n\nGreetings from C Square Club, Chandigarh University, Punjab!\nWe are pleased to inform you that your registration for AlgOlympia 2026 has been successfully received. We are excited to have you join us for this global-level programming competition.\n\nAll participants are requested to complete their registration by submitting the participation fee through CUIMS.\n\nPayment Details:\n- Amount: ₹100 per team member\n- Mode: Payment will be reflected on CUIMS\n- Note: Each team member must complete the payment individually through their CUIMS portal\n\nImportant Note:\n- Once you have registered for AlgOlympia, participation is mandatory as the fee will be reflected on CUIMS soon and will not be removed.\n- If you have exhausted your duty leaves, Special Duty Leave (IDL) will be provided.\n\nNext Steps:\n1. Complete the payment via CUIMS.\n2. Each team member must fill the confirmation form individually after payment.\n3. Upload the payment proof in the form for verification.\n4. Join the official WhatsApp group for updates and announcements: https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx\n\nPlease ensure that the payment and form submission are completed at the earliest to secure your participation.\n\nLooking forward to hosting you at AlgOlympia 2026!\n\n--\nThanks & Regards,\nC Square Club\nThe Coding and Technical Club of Chandigarh University\n\nLearn • Compete • Build\nPhone: +91 9084542911\nEmail: csquareclub@cumail.in\nLinkedIn: https://www.linkedin.com/company/csquare-club/\nInstagram: @csquare_club`,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error("Failed to send CU AlgOlympia confirmation email:", err);
  }
}

async function sendNonCuConfirmationEmail(
  emails: string[],
  teamName: string,
  leaderName: string,
) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  const validEmails = emails.filter((e) => e && e.includes("@"));
  if (validEmails.length === 0) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: validEmails },
    Message: {
      Subject: { Data: `AlgOlympia 2026 – Registration Confirmation & Payment Instructions` },
      Body: {
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media only screen and (max-width: 600px) {
    .main-wrap { padding: 0 !important; }
    .container { width: 100% !important; border-radius: 0 !important; border: none !important; }
    .logo-text { font-size: 15px !important; }
    .c-square-text { font-size: 14px !important; }
    .content-pad { padding: 30px 15px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" class="main-wrap" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" class="container" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  <tr><td style="padding:25px 20px;border-bottom:1px solid #f0f0f0;">
    <table width="100%"><tr>
      <td align="left"><strong class="logo-text" style="font-size:20px;color:#ffd232;">⚡ ALGOLYMPIA 2026</strong></td>
      <td align="right"><a href="https://www.csquareclub.co.in" style="text-decoration:none;"><strong class="c-square-text" style="font-size:16px;color:#333;">C Square</strong></a></td>
    </tr></table>
  </td></tr>
  <tr><td class="content-pad" style="padding:40px 30px;color:#333;line-height:1.6;font-size:16px;">
    <p style="font-size:18px;margin-top:0;">Dear <b>${leaderName}</b>,</p>
    <p>Greetings from C Square Club, Chandigarh University, Punjab!</p>
    <p>We are pleased to inform you that your registration for <strong>AlgOlympia 2026</strong> has been successfully received. We are excited to have your team <strong>${teamName}</strong> join us for this global-level programming competition.</p>
    <p>All participants are requested to complete their registration by submitting the participation fee.</p>

    <h3 style="color:#92400e;margin-top:25px;">💳 Payment Details</h3>
    <ul>
      <li><strong>Amount:</strong> ₹300 (for the entire team)</li>
      <li><strong>Note:</strong> Only the team leader is required to make the payment on behalf of the team.</li>
    </ul>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin:15px 0;">
      <tr><td style="padding:20px;">
        <p style="font-size:14px;color:#92400e;margin:0 0 5px 0;"><strong>Bank Details:</strong></p>
        <p style="font-size:13px;color:#92400e;margin:0;">
          <strong>Bank Name:</strong> HDFC Bank Ltd.<br>
          <strong>Branch:</strong> Morinda - Punjab<br>
          <strong>Address:</strong> Rattan Towers, Ward No. 5, Sugar Mill Road, Distt - Rupnagar, Morinda - 140101, Punjab<br>
          <strong>Beneficiary Name:</strong> CU AC University Insti of Engineering<br>
          <strong>Beneficiary Address:</strong> #2368 PH-10, S.A.S. Nagar, Distt S.A.S. Nagar, Punjab - 160061, India<br>
          <strong>Account Number:</strong> 50100078635437<br>
          <strong>IFSC Code:</strong> HDFC0000798<br>
          <strong>MICR:</strong> 160240049
        </p>
      </td></tr>
    </table>

    <h3 style="color:#166534;margin-top:25px;">✅ Next Steps</h3>
    <ol>
      <li>Complete the payment using the details above.</li>
      <li>The team leader must fill the confirmation form after payment submission at: <br><strong><a href="https://www.csquareclub.co.in/algolympia/payment" style="word-break: break-all;">https://www.csquareclub.co.in/algolympia/payment</a></strong></li>
      <li>Upload the payment proof in the form for verification.</li>
      <li>Join the official WhatsApp group for updates and announcements:<br><a href="https://chat.whatsapp.com/Czg1x1RmJuu1zRsJNtcOD6" style="word-break: break-all;">https://chat.whatsapp.com/Czg1x1RmJuu1zRsJNtcOD6</a></li>
    </ol>

    <p style="margin-top:20px;font-style:italic;">Please ensure that the payment and form submission are completed at the earliest to secure your participation.</p>
    <p style="margin-top:30px;">Looking forward to hosting you at AlgOlympia 2026!</p>

    <div style="font-family:Arial, sans-serif;color:#222;margin-top:30px;">
      <p style="margin:0"><strong>Thanks & Regards,</strong></p>
      <p style="margin:0"><strong>C Square Club</strong><br><span style="font-size:13px;color:#555">The Coding and Technical Club of Chandigarh University</span></p>
      <div style="margin-top:6px">
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4zcvdT1Wlvks3L3JLyXCW_h14u_h4tipSq1VCkipfAkoTdWo0BV4idRf6Q4SDIoTCfhjxUB1plV7Gg8" width="80">
        &nbsp;
        <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4xv3qRGQ6IGUj4tyzrjBsCy1AR47puIdw1UO4l_z3ew0xmt_S_F9nme4ESuDBYx619S0kvOhCk" width="180">
      </div>
      <hr style="border:none;border-top:1px solid #ccc;margin:10px 0">
      <p style="margin:0;font-size:14px"><strong>Learn • Compete • Build</strong></p>
      <p style="margin:6px 0;font-size:14px">
        &#128222; <a href="https://wa.me/919084542911">+91 9084542911</a>&nbsp;&nbsp;
        &#9993; <a href="mailto:csquareclub@cumail.in">csquareclub@cumail.in</a><br>
        &#128188; <a href="https://www.linkedin.com/company/csquare-club/">csquare-club</a><br>
        &#128247; <a href="https://www.instagram.com/csquare_club/">@csquare_club</a>
      </p>
    </div>
  </td></tr>
  <tr><td style="background:#fafafa;padding:20px;text-align:center;font-size:13px;color:#888;">
    <p style="margin:0;">AlgOlympia 2026 – C Square Club</p>
    <p style="margin:5px 0;"><a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
        },
        Text: {
          Data: `Dear ${leaderName},\n\nGreetings from C Square Club, Chandigarh University, Punjab!\nWe are pleased to inform you that your registration for AlgOlympia 2026 has been successfully received. We are excited to have your team ${teamName} join us for this global-level programming competition.\n\nAll participants are requested to complete their registration by submitting the participation fee.\n\nPayment Details:\n- Amount: ₹300 (for the entire team)\n- Note: Only the team leader is required to make the payment on behalf of the team.\n\nBank Details:\nBank Name: HDFC Bank Ltd.\nBranch: Morinda - Punjab\nAddress: Rattan Towers, Ward No. 5, Sugar Mill Road, Distt - Rupnagar, Morinda - 140101, Punjab\nBeneficiary Name: CU AC University Insti of Engineering\nBeneficiary Address: #2368 PH-10, S.A.S. Nagar, Distt S.A.S. Nagar, Punjab - 160061, India\nAccount Number: 50100078635437\nIFSC Code: HDFC0000798\nMICR: 160240049\n\nNext Steps:\n1. Complete the payment using the details above.\n2. The team leader must fill the confirmation form after payment submission at: https://www.csquareclub.co.in/algolympia/payment\n3. Upload the payment proof in the form for verification.\n4. Join the official WhatsApp group for updates and announcements: https://chat.whatsapp.com/Czg1x1RmJuu1zRsJNtcOD6\n\nPlease ensure that the payment and form submission are completed at the earliest to secure your participation.\n\nLooking forward to hosting you at AlgOlympia 2026!\n\n--\nThanks & Regards,\nC Square Club\nThe Coding and Technical Club of Chandigarh University\n\nLearn • Compete • Build\nPhone: +91 9084542911\nEmail: csquareclub@cumail.in\nLinkedIn: https://www.linkedin.com/company/csquare-club/\nInstagram: @csquare_club`,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error("Failed to send non-CU AlgOlympia confirmation email:", err);
  }
}

/* ── POST handler ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action || "").trim().toLowerCase();

    /* ── OTP: send ──────────────────────────────────────── */
    if (action === "send-otp") {
      const email = String(body.email || "").trim().toLowerCase();
      const fullName = String(body.fullName || "").trim();

      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Valid email is required to send OTP" }, { status: 400 });
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await upsertAlgolympiaOtp({ email, otpHash: hashOtp(otp), expiresAt });

      try {
        await sendOtpEmail(email, otp, fullName);
      } catch (err) {
        console.error("Failed to send AlgOlympia OTP email", err);
        return NextResponse.json({ error: "Could not send OTP email right now" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${email}`,
        cooldownSeconds: OTP_COOLDOWN_SECONDS,
      });
    }

    /* ── OTP: verify ────────────────────────────────────── */
    if (action === "verify-otp") {
      const email = String(body.email || "").trim().toLowerCase();
      const otp = String(body.otp || "").trim();

      if (!email || !otp) {
        return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
      }
      if (!OTP_REGEX.test(otp)) {
        return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
      }

      const result = await verifyAlgolympiaOtp({ email, otpHash: hashOtp(otp) });
      if (!result.verified) {
        const msgs: Record<string, string> = {
          missing: "Request OTP first",
          expired: "OTP expired. Request a new OTP",
          "max-attempts": "Too many invalid attempts. Request a new OTP",
        };
        return NextResponse.json(
          { error: msgs[result.reason || ""] || "Invalid OTP" },
          { status: result.reason === "max-attempts" ? 429 : 400 },
        );
      }

      return NextResponse.json({ success: true, verified: true });
    }

    /* ── Registration ───────────────────────────────────── */
    const isCU = body?.isCU === true;

    const data = isCU
      ? cuRegistrationSchema.parse(body)
      : nonCuRegistrationSchema.parse(body);

    // Verify OTP was completed for the leader's email
    const leaderEmail = data.leader.email.toLowerCase();
    const otpVerified = await isAlgolympiaOtpVerified(leaderEmail);
    if (!otpVerified) {
      return NextResponse.json(
        { error: "Please verify OTP sent to team leader's email before submitting" },
        { status: 400 },
      );
    }

    // Duplicate checks allowed per user request (emails can be reused)

    if (isCU) {
      const allUids = [
        (data.leader as any).uid,
        (data.member2 as any).uid,
        (data.member3 as any).uid,
      ];
      if (new Set(allUids.map(u => u.toUpperCase())).size !== 3) {
        return NextResponse.json(
          { error: "All team members must have unique CU UIDs." },
          { status: 400 }
        );
      }
      
      const duplicateUid = await checkDuplicateAlgolympiaUid(allUids);
      if (duplicateUid) {
        return NextResponse.json(
          { error: "One or more team members' UID is already registered for AlgOlympia." },
          { status: 409 },
        );
      }
    }

    // Duplicate registrations check removed


    // Create registration
    const isProfessional = !isCU && (data as any).isProfessional === true;
    const registrationInput = {
      isCU,
      isProfessional,
      teamName: data.teamName,
      leaderName: data.leader.name,
      leaderEmail: data.leader.email,
      leaderUID: isCU ? (data.leader as any).uid : "",
      leaderPhone: data.leader.phone,
      leaderCollege: (data.leader as any).college,
      leaderLeetcode: data.leader.leetcode || "",
      leaderCodeforces: data.leader.codeforces || "",
      leaderCodechef: data.leader.codechef || "",
      leaderGithub: data.leader.github || "",
      member2Name: data.member2.name,
      member2Email: data.member2.email,
      member2UID: isCU ? (data.member2 as any).uid : "",
      member2Phone: data.member2.phone,
      member2Leetcode: data.member2.leetcode || "",
      member2Codeforces: data.member2.codeforces || "",
      member2Codechef: data.member2.codechef || "",
      member2Github: data.member2.github || "",
      member3Name: data.member3.name,
      member3Email: data.member3.email,
      member3UID: isCU ? (data.member3 as any).uid : "",
      member3Phone: data.member3.phone,
      member3Leetcode: data.member3.leetcode || "",
      member3Codeforces: data.member3.codeforces || "",
      member3Codechef: data.member3.codechef || "",
      member3Github: data.member3.github || "",
      facultyMentorName: isCU ? (data as any).facultyMentorName : undefined,
      facultyMentorEid: isCU ? (data as any).facultyMentorEid : undefined,
      referralCode: (data as any).referralCode || "",
    };
    
    const registration = await createAlgolympiaRegistration(registrationInput);

    // Append to Google Sheet async
    appendRegistrationToSheet(registrationInput).catch(console.error);

    // Send confirmation to all team members
    const allEmails = [
      data.leader.email,
      data.member2.email,
      data.member3.email,
    ];

    if (isCU) {
      await sendCuConfirmationEmail(allEmails, data.teamName, data.leader.name);
    } else {
      await sendNonCuConfirmationEmail(allEmails, data.teamName, data.leader.name);
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      isCU,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 },
      );
    }
    console.error("AlgOlympia registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
