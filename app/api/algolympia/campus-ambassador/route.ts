import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  createAmbassador,
  getAmbassadorByEmail,
  listAmbassadors,
} from "@/lib/algolympia-ambassador-store";
import { appendAmbassadorToSheet } from "@/lib/google-sheets";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/* ── Validation ─────────────────────────────────────────── */

const ambassadorSchema = z.object({
  name: z.string().min(2, "Name is required (min 2 chars)"),
  email: z.string().email("Valid email is required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid phone number required"),
  college: z.string().min(2, "College/Institute name is required"),
  department: z.string().optional().default(""),
  year: z.string().optional().default(""),
});

/* ── Email ──────────────────────────────────────────────── */

async function sendAmbassadorWelcomeEmail(
  name: string,
  email: string,
  referralCode: string
) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  if (!email || !email.includes("@")) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: {
        Data: "Welcome to AlgOlympia Campus Ambassador Program! 🎖️",
      },
      Body: {
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media only screen and (max-width: 600px) {
    .main-wrap { padding: 0 !important; }
    .container { width: 100% !important; border-radius: 0 !important; border: none !important; }
    .content-pad { padding: 30px 15px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" class="main-wrap" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" class="container" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  <tr><td style="padding:25px 20px;border-bottom:1px solid #f0f0f0;">
    <table width="100%"><tr>
      <td align="left"><strong style="font-size:20px;color:#ffd232;">⚡ ALGOLYMPIA 2026</strong></td>
      <td align="right"><a href="https://www.csquareclub.co.in" style="text-decoration:none;"><strong style="font-size:16px;color:#333;">C Square</strong></a></td>
    </tr></table>
  </td></tr>
  <tr><td class="content-pad" style="padding:40px 30px;color:#333;line-height:1.6;font-size:16px;">
    <p style="font-size:18px;margin-top:0;">Hi <b>${name}</b>,</p>
    <p>🎉 Welcome to the <strong>AlgOlympia Campus Ambassador Program!</strong></p>
    <p>You are now an official Campus Ambassador for AlgOlympia 2026 — the ultimate hybrid ICPC × Hackathon competition by C Square Club, Chandigarh University.</p>

    <h3 style="color:#92400e;margin-top:25px;">🎖️ Your Referral Code</h3>
    <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:20px;margin:15px 0;text-align:center;">
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#92400e;margin:0;">${referralCode}</p>
    </div>

    <h3 style="color:#166534;margin-top:25px;">📢 How It Works</h3>
    <ol>
      <li>Share your referral code with friends and peers at your college.</li>
      <li>When a team registers for AlgOlympia and enters your referral code, it gets tracked to you.</li>
      <li>The more teams you refer, the higher your impact!</li>
    </ol>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:15px;margin:20px 0;">
      <p style="color:#166534;margin:0;font-size:14px;"><strong>🔗 Registration Link to Share:</strong><br>
      <a href="https://www.csquareclub.co.in/algolympia/register" style="color:#166534;">https://www.csquareclub.co.in/algolympia/register</a></p>
    </div>

    <p style="margin-top:30px;">Thank you for being a part of AlgOlympia 2026. Let's make this event massive together!</p>

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
    <p style="margin:0;">AlgOlympia 2026 – Campus Ambassador Program</p>
    <p style="margin:5px 0;"><a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
        },
        Text: {
          Data: `Hi ${name},\n\nWelcome to the AlgOlympia Campus Ambassador Program!\n\nYour Referral Code: ${referralCode}\n\nShare this code with friends. When teams register with your code, it gets tracked to you.\n\nRegistration link to share: https://www.csquareclub.co.in/algolympia/register\n\nThank you for being part of AlgOlympia 2026!\n\n--\nThanks & Regards,\nC Square Club\nThe Coding and Technical Club of Chandigarh University`,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error("Failed to send ambassador welcome email:", err);
  }
}

/* ── POST handler ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ambassadorSchema.parse(body);

    // Check for duplicate
    const existing = await getAmbassadorByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        {
          error: "You are already registered as a Campus Ambassador!",
          referralCode: existing.referralCode,
        },
        { status: 409 }
      );
    }

    // Create ambassador
    const ambassador = await createAmbassador({
      name: data.name,
      email: data.email,
      phone: data.phone,
      college: data.college,
      department: data.department,
      year: data.year,
      source: "direct",
    });

    // Send to Google Sheets
    appendAmbassadorToSheet({
      ...data,
      referralCode: ambassador.referralCode,
      source: "direct",
    }).catch(console.error);

    // Send welcome email (async, don't block response)
    sendAmbassadorWelcomeEmail(
      ambassador.name,
      ambassador.email,
      ambassador.referralCode
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      referralCode: ambassador.referralCode,
      ambassador: {
        id: ambassador.id,
        name: ambassador.name,
        email: ambassador.email,
        referralCode: ambassador.referralCode,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 }
      );
    }
    console.error("Campus ambassador registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ── GET handler (list all) ─────────────────────────────── */

export async function GET() {
  try {
    const ambassadors = await listAmbassadors();
    return NextResponse.json({ success: true, ambassadors });
  } catch (err) {
    console.error("Failed to list ambassadors:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
