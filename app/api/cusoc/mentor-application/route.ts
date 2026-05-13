import { NextRequest, NextResponse } from 'next/server';
import { createMentorApplication } from '@/lib/cusoc-mentor-application-store';
import { appendCusocDataToSheet } from '@/lib/google-sheets';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createHash, randomInt } from "crypto";
import {
  upsertCusocOtp,
  verifyCusocOtp,
} from "@/lib/cusoc-otp-store";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;

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
      Subject: { Data: "CUSoC Faculty Mentor - Email Verification" },
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
    <p>Your OTP for CUSoC Faculty Mentor registration is:</p>
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
          Data: `${greeting}\n\nYour OTP for CUSoC Faculty Mentor registration is: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nCUSoC Team`,
        },
      },
    },
  });

  await ses.send(command);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body?.action || "").trim().toLowerCase();

    /* ── OTP: send ──────────────────────────────────────── */
    if (action === "send-otp") {
      const email = String(body.email || "").trim().toLowerCase();
      const fullName = String(body.fullName || "").trim();

      if (!email || !email.includes("@cumail.in")) {
        return NextResponse.json({ error: "Official email must be a @cumail.in address" }, { status: 400 });
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await upsertCusocOtp({ uid: email, collegeEmail: email, otpHash: hashOtp(otp), expiresAt });

      try {
        await sendOtpEmail(email, otp, fullName);
      } catch (err) {
        console.error("Failed to send Faculty Mentor OTP email", err);
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

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
      }

      const result = await verifyCusocOtp({
        uid: email,
        otpHash: hashOtp(otp),
        maxAttempts: 5,
      });

      if (!result.verified) {
        return NextResponse.json({ error: result.reason || "Invalid OTP" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "OTP verified successfully" });
    }

    /* ── Application submission ─────────────────────────── */
    const data = body;

    // Validation
    if (!data.mentorType || !['industry', 'faculty', 'student'].includes(data.mentorType)) {
      return NextResponse.json({ error: 'Invalid mentor type' }, { status: 400 });
    }

    if (!data.fullName || !data.email || !data.contactNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For faculty mentors, verify OTP
    if (data.mentorType === 'faculty') {
      const officialEmail = String(data.officialEmail || "").trim().toLowerCase();
      if (!officialEmail || !officialEmail.includes("@cumail.in")) {
        return NextResponse.json({ error: 'Official email is required and must be @cumail.in' }, { status: 400 });
      }

      // Check if OTP is verified
      const isVerified = await import('@/lib/cusoc-otp-store').then(m => m.isCusocOtpVerified(officialEmail));
      if (!isVerified) {
        return NextResponse.json({ error: 'Email verification required. Please verify your official email with OTP.' }, { status: 400 });
      }

      // Mark OTP as used
      await import('@/lib/cusoc-otp-store').then(m => m.markCusocOtpUsed(officialEmail));
    }

    const application = await createMentorApplication(data);

    // Append to Google Sheets
    const sheetHeaders = [
      "Date", "Mentor Type", "Full Name", "Email", "Contact Number", 
      "LinkedIn Profile", "Company Name", "Designation", "Years of Experience", 
      "Industries Focus", "Department Name", "Employee ID", "Official Email", 
      "Research Areas", "Roll Number", "CU Email", "Year", "Skill Areas", 
      "Areas of Expertise", "Mentorship Goals", "Available Hours", 
      "Preferred Mode", "Mentorship Style", "Previous Experience", 
      "Max Mentees", "Can Provide Feedback", "Can Guide Projects", 
      "Can Review Code"
    ];

    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.mentorType,
      data.fullName,
      data.email,
      data.contactNumber,
      data.linkedinProfile,
      data.companyName,
      data.designation,
      data.yearsOfExperience,
      data.industriesFocus,
      data.departmentName,
      data.employeeId,
      data.officialEmail,
      data.researchAreas,
      data.rollNumber,
      data.cuEmail,
      data.year,
      data.skillAreas,
      data.areasOfExpertise,
      data.mentorshipGoals,
      data.availableHours,
      data.preferredMode,
      data.mentorshipStyle,
      data.previousExperience,
      data.maxMentees,
      data.canProvideFeedback ? "Yes" : "No",
      data.canGuideProjects ? "Yes" : "No",
      data.canReviewCode ? "Yes" : "No"
    ];

    appendCusocDataToSheet("Mentor Applications", sheetHeaders, sheetRow).catch(e => console.error("Failed to append to Google Sheets:", e));

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error processing mentor application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
