import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createStallRegistration } from "@/lib/algolympia-stalls-store";
import { appendStallRegistrationToSheet } from "@/lib/google-sheets";
import { isAlgolympiaStallsOtpVerified, markAlgolympiaStallsOtpUsed } from "@/lib/algolympia-stalls-otp-store";
import {
  getStallBasePrice,
  getStallCategoryLabel,
  getStallTotalPrice,
  STALL_PREMIUM_PRICE_PER_DAY,
  type StallCategory,
} from "@/lib/algolympia-stall-pricing";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function sendStallRegistrationEmail(data: any, totalAmount: number) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  if (!data.email || !data.email.includes("@")) return;
  const basePrice = getStallBasePrice(data.stallCategory as StallCategory, Boolean(data.isCuStudent));
  const categoryLabel = getStallCategoryLabel(data.stallCategory as StallCategory);
  const participantType = data.isCuStudent ? "CU Student" : "Non-CU Participant";
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.csquareclub.co.in").replace(/\/$/, "");
  const idCardUrl = data.idCardUrl?.startsWith("http") ? data.idCardUrl : `${siteUrl}${data.idCardUrl || ""}`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stall Registration Confirmation</title>
</head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">
<table width="600" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);margin:auto;">
  <tr><td style="background:#1a1a1a;padding:40px 30px;text-align:center;border-bottom:3px solid #ffd232;">
    <h1 style="margin:0;color:#ffd232;font-size:28px;letter-spacing:1px;text-transform:uppercase;">AlgOlympia 2026</h1>
    <p style="margin:10px 0 0;color:#ffffff;font-size:16px;opacity:0.9;">Stall Registration Successful</p>
  </td></tr>
  <tr><td style="padding:40px 40px 20px;color:#333;font-size:15px;line-height:1.6;">
    <p style="margin:0 0 20px;font-size:16px;">Dear Participant,</p>
    <p style="margin:0 0 20px;">Thank you for registering your stall for <strong>AlgOlympia 2026</strong>. Your registration has been successfully received.</p>
    
    <h3 style="margin:25px 0 15px;color:#1a1a1a;font-size:18px;border-bottom:1px solid #eee;padding-bottom:10px;">📌 Stall Details:</h3>
    <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background:#f9f9f9;border-radius:8px;font-size:14px;color:#444;">
      <tr>
        <td width="35%"><strong>Stall Name:</strong></td>
        <td>${data.stallName}</td>
      </tr>
      <tr>
        <td><strong>Category:</strong></td>
        <td>${categoryLabel}</td>
      </tr>
      <tr>
        <td><strong>Participant Type:</strong></td>
        <td>${participantType}</td>
      </tr>
      ${data.isCuStudent ? `
      <tr>
        <td><strong>CU UID:</strong></td>
        <td>${data.uid}</td>
      </tr>` : ""}
      ${data.isCuStudent ? `
      <tr>
        <td><strong>ID Card:</strong></td>
        <td><a href="${idCardUrl}">View uploaded ID card</a></td>
      </tr>` : ""}
      <tr>
        <td><strong>Base Fee:</strong></td>
        <td>₹${basePrice}/day</td>
      </tr>
      <tr>
        <td><strong>Duration:</strong></td>
        <td>${data.numberOfDays} Day(s)${data.numberOfDays === 1 ? ` (${data.selectedDate})` : ''}</td>
      </tr>
      <tr>
        <td><strong>Premium Upgrade:</strong></td>
        <td>${data.isPremium ? `Yes (+₹${STALL_PREMIUM_PRICE_PER_DAY}/day)` : 'No'}</td>
      </tr>
    </table>

    <div style="margin:30px 0;padding:20px;background:#fff8dc;border-left:4px solid #ffd232;border-radius:0 8px 8px 0;">
      <h3 style="margin:0 0 10px;color:#1a1a1a;font-size:18px;">💳 Total Amount Payable:</h3>
      <p style="margin:0;font-size:24px;color:#d99b00;font-weight:bold;">₹${totalAmount.toLocaleString('en-IN')}</p>
    </div>

    <p style="margin:0 0 15px;color:#555;">Further details regarding payment instructions, stall setup, and event logistics will be shared with you soon on your registered email.</p>
    <p style="margin:0 0 20px;color:#555;">If you have any questions or special requirements, feel free to reply to this email.</p>
    <p style="margin:0;font-weight:bold;color:#1a1a1a;">We look forward to your participation in AlgOlympia 2026!</p>
  </td></tr>

  <tr><td style="padding:20px 40px 40px;">
    <div style="border-top:1px solid #eee;padding-top:20px;">
      <p style="margin:0 0 5px;font-weight:bold;color:#1a1a1a;">Thanks & Regards,</p>
      <p style="margin:0;color:#666;font-size:14px;"><strong>C Square Club</strong><br>The Coding and Technical Club of Chandigarh University</p>
      <p style="margin:15px 0 0;font-size:13px;color:#888;">
        &#127760; <a href="https://www.csquareclub.co.in" style="color:#0066cc;text-decoration:none;">www.csquareclub.co.in</a><br>
        &#128188; <a href="https://www.linkedin.com/company/csquare-club/" style="color:#0066cc;text-decoration:none;">csquare-club</a><br>
        &#128247; <a href="https://www.instagram.com/csquare_club/" style="color:#0066cc;text-decoration:none;">@csquare_club</a>
      </p>
    </div>
  </td></tr>
  <tr><td style="background:#fafafa;padding:20px;text-align:center;font-size:13px;color:#888;">
    <p style="margin:0;">AlgOlympia 2026</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const textBody = `Dear Participant,

Thank you for registering your stall for AlgOlympia 2026. Your registration has been successfully received.

📌 Stall Details:
* Stall Name: ${data.stallName}
* Category: ${categoryLabel}
* Participant Type: ${participantType}
${data.isCuStudent ? `* CU UID: ${data.uid}
* ID Card: ${idCardUrl}
` : ""}* Duration: ${data.numberOfDays} Day(s)${data.numberOfDays === 1 ? ` (${data.selectedDate})` : ''}
* Base Fee: ₹${basePrice}/day
* Premium Upgrade: ${data.isPremium ? `Yes (+₹${STALL_PREMIUM_PRICE_PER_DAY}/day)` : 'No'}

💳 Total Amount Payable:
*₹${totalAmount.toLocaleString('en-IN')}*

Further details regarding payment instructions, stall setup, and event logistics will be shared with you soon on your registered email.

If you have any questions or special requirements, feel free to reply to this email.

We look forward to your participation in AlgOlympia 2026!

--
Thanks & Regards,
C Square Club
The Coding and Technical Club of Chandigarh University`;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [data.email] },
    Message: {
      Subject: { Data: `Stall Registration Confirmation - AlgOlympia 2026` },
      Body: {
        Html: { Data: htmlBody },
        Text: { Data: textBody },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error("Failed to send stall registration email:", err);
  }
}


/* -- Schema -- */

const memberSchema = z.object({
  name: z.string().min(2, "Member name is required"),
  email: z.string().email("Valid member email required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid member phone required"),
});

const stallRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid phone number required"),
  college: z.string().optional().default(""),
  stallCategory: z.enum(["products_games", "food_beverage"], { required_error: "Stall category is required" }),
  isPremium: z.boolean().default(false),
  isCuStudent: z.boolean().default(false),
  uid: z.string().trim().default(""),
  idCardUrl: z.string().trim().default(""),
  numberOfDays: z.number().min(1).max(2).default(2),
  selectedDate: z.string().optional().default(""),
  stallName: z.string().min(2, "Stall name is required"),
  stallDescription: z.string().min(10, "Stall description is required (min 10 chars)"),
  members: z.array(memberSchema).max(5, "Maximum 5 additional members allowed").optional().default([]),
}).superRefine((data, ctx) => {
  if (data.isCuStudent && !/^[A-Za-z0-9-]{6,20}$/.test(data.uid)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["uid"],
      message: "Valid CU UID is required",
    });
  }

  if (data.isCuStudent && !data.idCardUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["idCardUrl"],
      message: "ID card upload is required for CU students",
    });
  }
});

/* -- POST handler -- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = stallRegistrationSchema.parse(body);

    // Duplicate checks allowed per user request

    // Verify OTP using the separated stalls OTP table
    const otpVerified = await isAlgolympiaStallsOtpVerified(data.email);
    if (!otpVerified) {
      return NextResponse.json(
        { error: "Email verification (OTP) is required before registering a stall." },
        { status: 403 }
      );
    }

    // Create registration
    const registration = await createStallRegistration({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college || "",
      stallCategory: data.stallCategory,
      isPremium: data.isPremium,
      isCuStudent: data.isCuStudent,
      uid: data.uid,
      idCardUrl: data.idCardUrl,
      numberOfDays: data.numberOfDays,
      selectedDate: data.selectedDate,
      stallName: data.stallName,
      stallDescription: data.stallDescription,
      members: data.members || [],
    });

    // Append to Google Sheets async
    appendStallRegistrationToSheet({
      ...registration,
    }).catch(console.error);

    // Mark OTP as used
    await markAlgolympiaStallsOtpUsed(data.email).catch(console.error);

    // Send confirmation email
    const totalAmount = getStallTotalPrice({
      category: data.stallCategory,
      isCuStudent: data.isCuStudent,
      isPremium: data.isPremium,
      numberOfDays: data.numberOfDays,
    });
    sendStallRegistrationEmail(data, totalAmount).catch(console.error);

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 }
      );
    }
    console.error("Stall registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
