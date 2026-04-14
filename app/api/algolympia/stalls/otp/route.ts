import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createHash, randomInt } from "crypto";
import {
  getAlgolympiaStallsOtpSentAt,
  isAlgolympiaStallsOtpVerified,
  upsertAlgolympiaStallsOtp,
  verifyAlgolympiaStallsOtp,
} from "@/lib/algolympia-stalls-otp-store";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const OTP_EXPIRY_MINUTES = 10;
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
      Subject: { Data: "AlgOlympia Stalls – Verify Your Email" },
      Body: {
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  
  <tr>
    <td style="padding:40px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#111111;letter-spacing:-0.5px;">Verify your email address</h1>
      <p style="margin:16px 0 32px;font-size:16px;color:#666666;line-height:1.5;">
        ${greeting}<br><br>
        Use the verification code below to confirm your email address for your AlgOlympia Stalls registration.
      </p>
      
      <div style="background:#f4f4f4;border-radius:8px;padding:24px;margin-bottom:32px;">
        <div style="font-family:monospace;font-size:36px;font-weight:bold;color:#111111;letter-spacing:8px;">
      ${otp}
        </div>
      </div>
      
      <p style="margin:0 0 16px;font-size:14px;color:#888888;line-height:1.5;">
        This code will expire in ${OTP_EXPIRY_MINUTES} minutes.<br>
        If you didn't request this code, you can safely ignore this email.
      </p>
    </td>
  </tr>
  
  <tr>
    <td style="background:#fafafa;padding:24px;text-align:center;border-top:1px solid #eaeaea;">
      <p style="margin:0;font-size:12px;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;">
        AlgOlympia by C Square Club
      </p>
    </td>
  </tr>
  
</table>
</td></tr></table>
</body>
</html>`,
        },
        Text: {
          Data: `${greeting}\n\nYour OTP for AlgOlympia Stalls registration is: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nAlgOlympia – C Square Club`,
        },
      },
    },
  });

  await ses.send(command);
}

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

      // Allow sending multiple OTPs without cooldown

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await upsertAlgolympiaStallsOtp({ email, otpHash: hashOtp(otp), expiresAt });

      try {
        await sendOtpEmail(email, otp, fullName);
      } catch (err) {
        console.error("Failed to send AlgOlympia Stalls OTP email", err);
        return NextResponse.json({ error: "Could not send OTP email right now" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${email}`,
        cooldownSeconds: 0,
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

      const result = await verifyAlgolympiaStallsOtp({ email, otpHash: hashOtp(otp) });

      if (!result.verified) {
        const msgs: Record<string, string> = {
          missing: "No OTP found or it has expired.",
          expired: "OTP has expired. Please request a new one.",
          invalid: "Invalid OTP. Please try again.",
          "max-attempts": "Too many failed attempts. Please request a new OTP.",
        };
        return NextResponse.json(
          { error: msgs[result.reason || ""] || "Invalid OTP" },
          { status: result.reason === "max-attempts" ? 429 : 400 },
        );
      }

      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in stalls OTP API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
