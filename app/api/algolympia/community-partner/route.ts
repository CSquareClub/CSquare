import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createCommunityPartner, getPartnerByEmail, listCommunityPartners } from "@/lib/algolympia-community-partner-store";
import { appendCommunityPartnerToSheet } from "@/lib/google-sheets";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function sendCommunityPartnerWelcomeEmail(spocName: string, email: string) {
  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";
  if (!email || !email.includes("@")) return;

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: {
        Data: "Welcome to AlgOlympia 2026 – Community Partner Confirmation 🚀",
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
    <p style="font-size:18px;margin-top:0;">Hi <b>${spocName}</b>,</p>
    <p>Thank you for registering as a Community Partner for <strong>AlgOlympia 2026</strong>, organized by C Square Club, Chandigarh University.</p>
    <p>We're excited to have your community onboard 🤝 Your support will play a key role in making this event a huge success.</p>

    <h3 style="color:#0ea5e9;margin-top:25px;">📅 Event Details</h3>
    <ul>
      <li><strong>Event:</strong> AlgOlympia 2026 – Collegiate Programming Contest</li>
      <li><strong>Date:</strong> 20–21 April, 2026</li>
      <li><strong>Venue:</strong> Chandigarh University, Mohali</li>
      <li><strong>Registration Link:</strong> <a href="https://www.csquareclub.co.in/events/algolympia">https://www.csquareclub.co.in/events/algolympia</a></li>
    </ul>

    <h3 style="color:#d97706;margin-top:25px;">📌 Onboarding & Next Steps</h3>
    <ul>
      <li>We'll review your submission and onboard your community as an official partner</li>
      <li>You'll receive a unique referral code to track registrations from your community</li>
      <li>Share this code with your members — registrations through it will be counted towards your community</li>
      <li>If someone registers without using the code, you can share their details with us and we'll include them manually</li>
    </ul>

    <h3 style="color:#16a34a;margin-top:25px;">🎯 Your Role as a Community Partner</h3>
    <ul>
      <li>Promote AlgOlympia 2026 within your community</li>
      <li>Share event updates via social media, WhatsApp, or other platforms</li>
      <li>Support outreach and engagement efforts</li>
    </ul>

    <h3 style="color:#9333ea;margin-top:25px;">🏆 Recognition & Benefits</h3>
    <ul>
      <li>Felicitation during the Valedictory Session (for active partners bringing teams)</li>
      <li>Feature on our LinkedIn & Instagram (before and after the event)</li>
      <li>Logo visibility across event platforms</li>
      <li>E-certificate of partnership</li>
    </ul>

    <p style="margin-top:30px;">If you have any queries or suggestions, feel free to reply to this email or connect with us directly.</p>
    <p>Let's make AlgOlympia 2026 massive together 🚀</p>

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
    <p style="margin:0;">AlgOlympia 2026 – Community Partner Program</p>
    <p style="margin:5px 0;"><a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
        },
        Text: {
          Data: `Hi ${spocName},\n\nThank you for registering as a Community Partner for AlgOlympia 2026, organized by C Square Club, Chandigarh University.\n\nWe’re excited to have your community onboard 🤝 Your support will play a key role in making this event a huge success.\n\n📅 Event Details:\n• Event: AlgOlympia 2026 – Collegiate Programming Contest\n• Date: 20–21 April, 2026\n• Venue: Chandigarh University, Mohali\n• Registration Link: https://www.csquareclub.co.in/events/algolympia\n\n📌 Onboarding & Next Steps:\n• We’ll review your submission and onboard your community as an official partner\n• You’ll receive a unique referral code to track registrations from your community\n• Share this code with your members — registrations through it will be counted towards your community\n• If someone registers without using the code, you can share their details with us and we’ll include them manually\n\n🎯 Your Role as a Community Partner:\n• Promote AlgOlympia 2026 within your community\n• Share event updates via social media, WhatsApp, or other platforms\n• Support outreach and engagement efforts\n\n🏆 Recognition & Benefits:\n• Felicitation during theValedictory Session (for active partners bringing teams)\n• Feature on our LinkedIn & Instagram (before and after the event)\n• Logo visibility across event platforms\n• E-certificate of partnership\n\nIf you have any queries or suggestions, feel free to reply to this email or connect with us directly.\n\nLet’s make AlgOlympia 2026 massive together 🚀\n\n--\nThanks & Regards,\nC Square Club\nThe Coding and Technical Club of Chandigarh University`,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (err) {
    console.error("Failed to send community partner welcome email:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Text fields
    const spocName = formData.get("spocName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const communityName = formData.get("communityName") as string;
    const description = formData.get("description") as string;
    const instagramUrl = formData.get("instagramUrl") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const expectationsStr = formData.get("expectations") as string;
    const deliverablesStr = formData.get("deliverables") as string;
    
    // Files
    const logoLight = formData.get("logoLight") as File | null;
    const logoDark = formData.get("logoDark") as File | null;

    if (!spocName || !email || !phone || !communityName || !description || !logoLight || !logoDark) {
      return NextResponse.json({ error: "Missing required fields or logos" }, { status: 400 });
    }

    // Check duplicate
    const existing = await getPartnerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "A community partner with this email is already registered." },
        { status: 409 }
      );
    }

    let expectations: string[] = [];
    let deliverables: string[] = [];
    try {
      if (expectationsStr) expectations = JSON.parse(expectationsStr);
      if (deliverablesStr) deliverables = JSON.parse(deliverablesStr);
    } catch(e) {
      console.error("Failed to parse expectations/deliverables array", e);
    }

    // Prepare S3 Upload
    const region = process.env.AWS_REGION || "us-east-1";
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "fellowship-vlsid-bucket";

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Missing AWS credentials");
      return NextResponse.json({ error: "Server misconfiguration regarding AWS" }, { status: 500 });
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Helper to upload a single file
    const uploadFile = async (file: File, theme: string) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const extension = file.name.split(".").pop() || "png";
      const sanitzedName = communityName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const objectKey = `algolympia/community-partners/${sanitzedName}-${Date.now()}-${theme}.${extension}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const baseUrl = process.env.NEXT_PUBLIC_CLOUD_FRONT_URL?.replace(/\/$/, "") || `https://${bucketName}.s3.${region}.amazonaws.com`;
      return `${baseUrl}/${objectKey}`;
    };

    // Parallel upload of both logos
    const [logoLightUrl, logoDarkUrl] = await Promise.all([
      uploadFile(logoLight, "light"),
      uploadFile(logoDark, "dark")
    ]);

    // Save mapping securely in database
    const partner = await createCommunityPartner({
      spocName,
      email,
      phone,
      communityName,
      description,
      logoLightUrl,
      logoDarkUrl,
      instagramUrl,
      linkedinUrl,
      expectations,
      deliverables
    });

    // Append to Google Sheets
    appendCommunityPartnerToSheet({
      ...partner,
      expectations,
      deliverables,
    }).catch(console.error);

    // Send Welcome Email
    sendCommunityPartnerWelcomeEmail(spocName, email).catch(console.error);

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        communityName: partner.communityName,
      },
    });
  } catch (error: any) {
    console.error("Community partner registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const partners = await listCommunityPartners();
    return NextResponse.json({ success: true, partners });
  } catch (err) {
    console.error("Failed to list community partners:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
